import { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, type Square, type Move } from 'chess.js';
import type { Game, GameMove } from '../../types';

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
    const [chess, setChess] = useState(() => new Chess());
    const [orientation, setOrientation] = useState<'white' | 'black'>('white');
    const [, setMoveFrom] = useState<Square | null>(null);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [moveSquares, setMoveSquares] = useState<Record<string, React.CSSProperties>>({});
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
    const [pendingMove, setPendingMove] = useState<{ from: Square; to: Square } | null>(null);

    const isPlayerTurn =
        !isViewOnly && game.to_move_user_id === playerId;

    useEffect(() => {
        if (game.white_id === playerId) setOrientation('white');
        else if (game.black_id === playerId) setOrientation('black');
    }, [game.white_id, game.black_id, playerId]);

    useEffect(() => {
        // If you ever support non-standard starts, put that FEN here instead of undefined
        const next = new Chess(undefined);

        for (const m of moves) {
            const ok = next.move({
                from: m.from_sq as Square,
                to: m.to_sq as Square,
                promotion: m.promotion ?? undefined,
            });
            if (!ok) {
                console.warn('Bad move in history at ply', m.ply, m.uci);
                break;
            }
        }
        setChess(next);
    }, [moves]);

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

    const highlightLegalMoves = useCallback(
        (square: Square) => {
            const legal = chess.moves({ square, verbose: true as const }) as Move[];
            if (!legal.length) return;
            const next: Record<string, React.CSSProperties> = {};
            for (const mv of legal) next[mv.to] = { backgroundColor: 'rgba(0, 255, 0, 0.4)' };
            setOptionSquares(next);
        },
        [chess],
    );

    const trySubmitMove = useCallback(
        async (from: Square, to: Square) => {
            const piece = chess.get(from);
            if (piece?.type === 'p') {
                const targetRank = to.charAt(1);
                if ((piece.color === 'w' && targetRank === '8') || (piece.color === 'b' && targetRank === '1')) {
                    setPendingMove({ from, to });
                    setShowPromotionDialog(true);
                    return;
                }
            }
            await onMove(`${from}${to}`, game.lock_version);
            setOptionSquares({});
            setMoveFrom(null);
        },
        [chess, game.lock_version, onMove],
    );

    const handleSquareClick = useCallback(
        (squareStr: string) => {
            if (isViewOnly || !isPlayerTurn || game.status !== 'active') return;
            const sq = squareStr as Square;

            setMoveFrom(prevFrom => {
                if (prevFrom === null) {
                    const hasMoves = (chess.moves({ square: sq, verbose: true as const }) as Move[]).length > 0;
                    if (hasMoves) {
                        highlightLegalMoves(sq);
                        return sq;
                    }
                    return null;
                }

                const from = prevFrom;
                const to = sq;
                const legalFrom = chess.moves({ square: from, verbose: true as const }) as Move[];
                const found = legalFrom.find(m => m.to === to);

                if (!found) {
                    const hasNew = (chess.moves({ square: sq, verbose: true as const }) as Move[]).length > 0;
                    if (hasNew) {
                        highlightLegalMoves(sq);
                        return sq;
                    }
                    setOptionSquares({});
                    return null;
                }

                trySubmitMove(from, to);
                return null;
            });
        },
        [chess, game.status, highlightLegalMoves, isPlayerTurn, isViewOnly, trySubmitMove],
    );

    const handlePieceDrop = useCallback(
        async (sourceSquareStr: string, targetSquareStr: string) => {
            if (isViewOnly || !isPlayerTurn || game.status !== 'active') return false;

            const source = sourceSquareStr as Square;
            const target = targetSquareStr as Square;

            const test = new Chess(chess.fen());
            if (!test.move({ from: source, to: target, promotion: 'q' })) {
                setOptionSquares({});
                return false;
            }

            const piece = chess.get(source);
            const needsPromotion =
                piece?.type === 'p' &&
                ((piece.color === 'w' && target.charAt(1) === '8') || (piece.color === 'b' && target.charAt(1) === '1'));

            if (needsPromotion) {
                setPendingMove({ from: source, to: target });
                setShowPromotionDialog(true);
                return true;
            }

            await onMove(`${source}${target}`, game.lock_version);
            setOptionSquares({});
            setMoveFrom(null);
            return true;
        },
        [chess, game.lock_version, game.status, isPlayerTurn, isViewOnly, onMove],
    );

    const handlePromotion = async (piece: string) => {
        if (!pendingMove) return;
        const { from, to } = pendingMove;
        await onMove(`${from}${to}${piece.toLowerCase()}`, game.lock_version);
        setShowPromotionDialog(false);
        setOptionSquares({});
        setPendingMove(null);
        setMoveFrom(null);
    };

    const size = Math.min(600, typeof window !== 'undefined' ? window.innerWidth - 40 : 600);

    return (
        <div className="relative">
            <Chessboard
                options={{
                    id: `board-${game.id}`,
                    position: chess.fen(),
                    boardOrientation: orientation,
                    onSquareClick: ({ square }) => handleSquareClick(square),
                    onPieceDrop: ({ sourceSquare, targetSquare }) => handlePieceDrop(sourceSquare, targetSquare!),
                    squareStyles: { ...moveSquares, ...optionSquares },
                    allowDrawingArrows: true,
                    clearArrowsOnClick: true,
                    boardStyle: { width: size, height: size },
                }}
            />

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
