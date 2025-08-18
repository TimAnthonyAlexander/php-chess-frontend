import { useState, useEffect, useCallback, useRef } from 'react';
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
        await trySubmitMove(from, to, piece.toLowerCase());
        setShowPromotionDialog(false);
        setOptionSquares({});
        setPendingMove(null);
        setMoveFrom(null);
    };

    return (
        <div className="relative" style={{ width: '100%', maxWidth: 420, aspectRatio: '1 / 1' }}>
            <Chessboard
                options={{
                    id: `board-${game.id}`,
                    position: positionFen,
                    boardOrientation: orientation,
                    onSquareClick: ({ square }) => handleSquareClick(square),
                    onPieceDrop: ({ sourceSquare, targetSquare }) => handlePieceDrop(sourceSquare, targetSquare!),
                    boardStyle: { width: '100%', height: '100%' },
                    squareStyles: { ...moveSquares, ...optionSquares },
                    allowDrawingArrows: true,
                    clearArrowsOnClick: true,
                    animationDurationInMs: 300,
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
