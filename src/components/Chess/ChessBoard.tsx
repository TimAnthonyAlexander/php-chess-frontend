import { useState, useEffect, useCallback, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, type Square, type Move } from 'chess.js';
import type { Game, GameMove } from '../../types';
import { useChessSounds } from '../../hooks/useChessSounds';

type PieceMap = Record<string, string>;

function fenToMap(fen: string): PieceMap {
    const normalized = fen === 'startpos' ? new Chess().fen() : fen;
    const board = normalized.split(' ')[0];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const out: PieceMap = {};
    const rows = board.split('/');
    for (let r = 0; r < 8; r++) {
        let fileIdx = 0;
        for (const ch of rows[r]) {
            if (/\d/.test(ch)) fileIdx += parseInt(ch, 10);
            else {
                const sq = files[fileIdx] + (8 - r);
                out[sq] = ch;
                fileIdx++;
            }
        }
    }
    return out;
}

function classify(prevFen: string, nextFen: string): 'none' | 'move' | 'capture' | 'castle' {
    if (prevFen === nextFen) return 'none';
    const p = fenToMap(prevFen);
    const n = fenToMap(nextFen);
    const pKeys = Object.keys(p);
    const nKeys = Object.keys(n);
    const pCount = pKeys.length, nCount = nKeys.length;
    const pWhiteKing = pKeys.find(k => p[k] === 'K');
    const nWhiteKing = nKeys.find(k => n[k] === 'K');
    const pBlackKing = pKeys.find(k => p[k] === 'k');
    const nBlackKing = nKeys.find(k => n[k] === 'k');
    const fileDist = (a?: string, b?: string) => (a && b ? Math.abs(a.charCodeAt(0) - b.charCodeAt(0)) : 0);
    if (fileDist(pWhiteKing, nWhiteKing) === 2 || fileDist(pBlackKing, nBlackKing) === 2) return 'castle';
    if (nCount < pCount) return 'capture';
    return 'move';
}

interface ChessBoardProps {
    game: Game;
    moves: GameMove[];
    playerId: number;
    onMove: (uci: string, lockVersion: number) => Promise<void>;
    isViewOnly?: boolean;
}

function ChessBoard({
    game,
    moves,
    playerId,
    onMove,
    isViewOnly = false,
}: ChessBoardProps) {
    const chessRef = useRef(new Chess());
    const [orientation, setOrientation] = useState<'white' | 'black'>('white');
    const [moveFrom, setMoveFrom] = useState<Square | null>(null);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [moveSquares, setMoveSquares] = useState<Record<string, React.CSSProperties>>({});
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
    const [pendingMove, setPendingMove] = useState<{ from: Square; to: Square } | null>(null);
    const [positionFen, setPositionFen] = useState<string>(() =>
        game.fen && game.fen !== 'startpos' ? game.fen : new Chess().fen()
    );
    const containerRef = useRef<HTMLDivElement | null>(null);
    const prevFenRef = useRef<string | null>(null);
    const { playMove, playCapture, playCheck, playIllegal, playPromote, playCastle } = useChessSounds();

    const isPlayerTurn =
        !isViewOnly && game.to_move_user_id === playerId;

    useEffect(() => {
        if (game.white_id === playerId) setOrientation('white');
        else if (game.black_id === playerId) setOrientation('black');
    }, [game.white_id, game.black_id, playerId]);

    useEffect(() => {
        if (moves.length) {
            const last = moves[moves.length - 1];
            setPositionFen(last.fen_after);
        } else {
            setPositionFen(game.fen && game.fen !== 'startpos' ? game.fen : new Chess().fen());
        }
    }, [moves, game.fen]);

    useEffect(() => {
        try {
            chessRef.current.load(positionFen);
        } catch {
            chessRef.current.reset();
        }
    }, [positionFen]);

    useEffect(() => {
        if (moves.length) {
            const last = moves[moves.length - 1];
            setMoveSquares({
                [last.from_sq]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
                [last.to_sq]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
            });
        } else {
            setMoveSquares({});
        }
    }, [moves]);

    // Play sounds on FEN transitions and check state
    useEffect(() => {
        if (prevFenRef.current == null) {
            prevFenRef.current = positionFen;
            return;
        }
        const kind = classify(prevFenRef.current, positionFen);
        if (kind === 'castle') playCastle();
        else if (kind === 'capture') playCapture();
        else if (kind !== 'none') playMove();

        let inCheck = false;
        try {
            const c = new Chess();
            if (positionFen !== 'startpos') c.load(positionFen);
            inCheck = (c as any).isCheck ? c.isCheck() : (c as any).in_check?.();
        } catch {}
        if (inCheck) playCheck();
        prevFenRef.current = positionFen;
    }, [positionFen, playMove, playCapture, playCheck, playCastle]);

    const highlightLegalMoves = useCallback(
        (square: Square) => {
            const legal = chessRef.current.moves({ square, verbose: true as const }) as Move[];
            if (!legal.length) return;
            const next: Record<string, React.CSSProperties> = {};
            for (const mv of legal) next[mv.to] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' };
            setOptionSquares(next);
        },
        [],
    );

    const trySubmitMove = useCallback(
        async (from: Square, to: Square, promo?: string) => {
            const test = new Chess(chessRef.current.fen());
            const ok = test.move({ from, to, promotion: (promo ?? 'q') as any });
            if (!ok) return false;
            setPositionFen(test.fen());
            await onMove(`${from}${to}${promo ? promo.toLowerCase() : ''}`, game.lock_version);
            setOptionSquares({});
            setMoveFrom(null);
            return true;
        },
        [game.lock_version, onMove],
    );

    const handleSquareClick = useCallback(
        (squareStr: string) => {
            if (isViewOnly || !isPlayerTurn || game.status !== 'active') return;
            const sq = squareStr as Square;
            if (moveFrom === null) {
                const hasMoves = (chessRef.current.moves({ square: sq, verbose: true as const }) as Move[]).length > 0;
                if (hasMoves) {
                    setMoveFrom(sq);
                    highlightLegalMoves(sq);
                }
                return;
            }

            const from = moveFrom;
            const to = sq;
            const legalFrom = chessRef.current.moves({ square: from, verbose: true as const }) as Move[];
            const found = legalFrom.find(m => m.to === to);

            if (!found) {
                const hasNew = (chessRef.current.moves({ square: sq, verbose: true as const }) as Move[]).length > 0;
                if (hasNew) {
                    setMoveFrom(sq);
                    highlightLegalMoves(sq);
                } else {
                    setMoveFrom(null);
                    setOptionSquares({});
                }
                return;
            }

            const piece = chessRef.current.get(from);
            const needsPromotion =
                piece?.type === 'p' && ((piece.color === 'w' && to.charAt(1) === '8') || (piece.color === 'b' && to.charAt(1) === '1'));
            if (needsPromotion) {
                setPendingMove({ from, to });
                return;
            }
            void trySubmitMove(from, to);
        },
        [game.status, highlightLegalMoves, isPlayerTurn, isViewOnly, moveFrom, trySubmitMove],
    );

    const handlePieceDrop = useCallback(
        (sourceSquareStr: string, targetSquareStr: string) => {
            if (isViewOnly || !isPlayerTurn || game.status !== 'active') return false;

            const source = sourceSquareStr as Square;
            const target = targetSquareStr as Square;

            const test = new Chess(chessRef.current.fen());
            if (!test.move({ from: source, to: target, promotion: 'q' })) {
                setOptionSquares({});
                return false;
            }

            const piece = chessRef.current.get(source);
            const needsPromotion =
                piece?.type === 'p' &&
                ((piece.color === 'w' && target.charAt(1) === '8') || (piece.color === 'b' && target.charAt(1) === '1'));

            if (needsPromotion) {
                setPendingMove({ from: source, to: target });
                setShowPromotionDialog(true);
                return true;
            }

            void trySubmitMove(source, target);
            setOptionSquares({});
            setMoveFrom(null);
            return true;
        },
        [game.status, isPlayerTurn, isViewOnly, trySubmitMove],
    );

    const handlePromotion = async (piece: string) => {
        if (!pendingMove) return;
        const { from, to } = pendingMove;
        playPromote();
        await trySubmitMove(from, to, piece.toLowerCase());
        setShowPromotionDialog(false);
        setOptionSquares({});
        setPendingMove(null);
        setMoveFrom(null);
    };

    const onDrop = useCallback(({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string; }) => {
        const ok = handlePieceDrop(sourceSquare, targetSquare);
        if (!ok) playIllegal();
        return ok;
    }, [handlePieceDrop, playIllegal]);

    useEffect(() => {
        const measure = () => {
            const el = containerRef.current;
            if (!el) return;
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    return (
        <div className="relative" ref={containerRef} style={{ width: '40vw' }}>
            <div style={{ width: '100%', aspectRatio: '1 / 1' }}>
                <Chessboard
                    options={{
                        id: `board-${game.id}`,
                        position: positionFen,
                        boardOrientation: orientation,
                        onSquareClick: ({ square }) => handleSquareClick(square),
                        onPieceDrop: ({ sourceSquare, targetSquare }) => onDrop({ sourceSquare, targetSquare: targetSquare! }),
                        boardStyle: { width: '100%', height: '100%', },
                        squareStyles: { ...moveSquares, ...optionSquares },
                        allowDrawingArrows: true,
                        clearArrowsOnClick: true,
                        animationDurationInMs: 300,
                    }}
                />
            </div>

            {showPromotionDialog && pendingMove && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-md p-4 z-10">
                    <p className="text-center font-medium mb-3">Choose promotion piece:</p>
                    <div className="flex space-x-4">
                        <button onClick={() => handlePromotion('q')} className="w-12 h-12 flex items-center justify-center text-3xl hover:bg-gray-100 rounded-md">
                            {orientation === 'white' ? '♕' : '♛'}
                        </button>
                        <button onClick={() => handlePromotion('r')} className="w-12 h-12 flex items-center justify-center text-3xl hover:bg-gray-100 rounded-md">
                            {orientation === 'white' ? '♖' : '♜'}
                        </button>
                        <button onClick={() => handlePromotion('b')} className="w-12 h-12 flex items-center justify-center text-3xl hover:bg-gray-100 rounded-md">
                            {orientation === 'white' ? '♗' : '♝'}
                        </button>
                        <button onClick={() => handlePromotion('n')} className="w-12 h-12 flex items-center justify-center text-3xl hover:bg-gray-100 rounded-md">
                            {orientation === 'white' ? '♘' : '♞'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChessBoard;
