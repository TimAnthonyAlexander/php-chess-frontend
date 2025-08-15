import { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import type { Game, GameMove } from '../../types';

interface ChessBoardProps {
    game: Game;
    moves: GameMove[];
    playerId: number;
    onMove: (uci: string, lockVersion: number) => Promise<void>;
    isViewOnly?: boolean;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
    game,
    moves,
    playerId,
    onMove,
    isViewOnly = false
}) => {
    const [chess, setChess] = useState(new Chess());
    const [orientation, setOrientation] = useState<'white' | 'black'>('white');
    const [moveFrom, setMoveFrom] = useState<string | null>(null);
    const [moveTo, setMoveTo] = useState<string | null>(null);
    const [showPromotionDialog, setShowPromotionDialog] = useState(false);
    const [moveSquares, setMoveSquares] = useState<Record<string, { backgroundColor: string }>>({});
    const [optionSquares, setOptionSquares] = useState<Record<string, { backgroundColor: string }>>({});
    const [pendingMove, setPendingMove] = useState<{ from: string, to: string } | null>(null);

    // Determine if it's the player's turn
    const isPlayerTurn = !isViewOnly && (
        (game.move_index % 2 === 0 && game.white_id === playerId) ||
        (game.move_index % 2 === 1 && game.black_id === playerId)
    );

    // Set board orientation based on player's color
    useEffect(() => {
        if (game.white_id === playerId) {
            setOrientation('white');
        } else if (game.black_id === playerId) {
            setOrientation('black');
        }
    }, [game, playerId]);

    // Apply moves to the chess instance
    useEffect(() => {
        const newChess = new Chess();

        if (game.fen !== 'startpos') {
            newChess.load(game.fen);
        }

        // Apply moves
        for (const move of moves) {
            try {
                // Convert UCI format to chess.js move format
                const from = move.from_sq;
                const to = move.to_sq;
                const promotion = move.promotion || undefined;

                newChess.move({ from, to, promotion });
            } catch (e) {
                console.error('Invalid move:', move.uci, e);
            }
        }

        setChess(newChess);
    }, [game, moves]);

    // Highlight last move
    useEffect(() => {
        if (moves.length > 0) {
            const lastMove = moves[moves.length - 1];
            const newMoveSquares: Record<string, { backgroundColor: string }> = {
                [lastMove.from_sq]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
                [lastMove.to_sq]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
            };
            setMoveSquares(newMoveSquares);
        } else {
            setMoveSquares({});
        }
    }, [moves]);

    // Show legal moves
    const highlightLegalMoves = useCallback((square: string) => {
        const moves = chess.moves({ square, verbose: true });
        if (moves.length === 0) {
            return;
        }

        const newSquares: Record<string, { backgroundColor: string }> = {};
        moves.forEach((move) => {
            newSquares[move.to] = {
                backgroundColor: 'rgba(0, 255, 0, 0.4)',
            };
        });
        setOptionSquares(newSquares);
    }, [chess]);

    // Handle click on a square
    const onSquareClick = useCallback((square: string) => {
        if (isViewOnly || !isPlayerTurn || game.status !== 'active') {
            return;
        }

        setMoveFrom((prevMoveFrom) => {
            if (prevMoveFrom === null) {
                const hasMoveOptions = chess.moves({ square, verbose: true }).length > 0;
                if (hasMoveOptions) {
                    highlightLegalMoves(square);
                    return square;
                }
                return null;
            }

            // Attempt to make a move
            const from = prevMoveFrom;
            const to = square;

            // Check if the move is valid
            const moves = chess.moves({ square: from, verbose: true });
            const foundMove = moves.find(m => m.to === to);

            if (!foundMove) {
                // Invalid move, but the clicked square might be a new valid starting square
                const hasMoveOptions = chess.moves({ square, verbose: true }).length > 0;
                if (hasMoveOptions) {
                    highlightLegalMoves(square);
                    return square;
                }
                return null;
            }

            // Handle promotion
            if (
                foundMove.piece === 'p' &&
                ((foundMove.color === 'w' && to[1] === '8') ||
                    (foundMove.color === 'b' && to[1] === '1'))
            ) {
                setPendingMove({ from, to });
                setShowPromotionDialog(true);
                return from;
            }

            // Regular move
            const uci = from + to;
            onMove(uci, game.lock_version);

            setOptionSquares({});
            return null;
        });
    }, [chess, game, highlightLegalMoves, isPlayerTurn, isViewOnly, onMove]);

    // Handle promotion choice
    const handlePromotion = (piece: string) => {
        if (!pendingMove) return;

        const { from, to } = pendingMove;
        const uci = from + to + piece.toLowerCase();

        onMove(uci, game.lock_version);

        setShowPromotionDialog(false);
        setOptionSquares({});
        setPendingMove(null);
        setMoveFrom(null);
    };

    return (
        <div className="relative">
            <Chessboard
                id={`board-${game.id}`}
                position={chess.fen()}
                boardOrientation={orientation}
                onSquareClick={onSquareClick}
                customSquareStyles={{
                    ...moveSquares,
                    ...optionSquares
                }}
                areArrowsAllowed={true}
                boardWidth={Math.min(600, window.innerWidth - 40)}
            />

            {showPromotionDialog && pendingMove && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-md p-4 z-10">
                    <p className="text-center font-medium mb-3">Choose promotion piece:</p>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => handlePromotion('q')}
                            className="w-12 h-12 flex items-center justify-center text-3xl hover:bg-gray-100 rounded-md"
                        >
                            {orientation === 'white' ? '♕' : '♛'}
                        </button>
                        <button
                            onClick={() => handlePromotion('r')}
                            className="w-12 h-12 flex items-center justify-center text-3xl hover:bg-gray-100 rounded-md"
                        >
                            {orientation === 'white' ? '♖' : '♜'}
                        </button>
                        <button
                            onClick={() => handlePromotion('b')}
                            className="w-12 h-12 flex items-center justify-center text-3xl hover:bg-gray-100 rounded-md"
                        >
                            {orientation === 'white' ? '♗' : '♝'}
                        </button>
                        <button
                            onClick={() => handlePromotion('n')}
                            className="w-12 h-12 flex items-center justify-center text-3xl hover:bg-gray-100 rounded-md"
                        >
                            {orientation === 'white' ? '♘' : '♞'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChessBoard;
