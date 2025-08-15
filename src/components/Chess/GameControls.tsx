import { useState } from 'react';
import type { Game } from '../../types';

interface GameControlsProps {
    game: Game;
    playerId: number;
    onResign: () => Promise<void>;
    onOfferDraw: () => Promise<void>;
    onAcceptDraw: () => Promise<void>;
}

const GameControls: React.FC<GameControlsProps> = ({
    game,
    playerId,
    onResign,
    onOfferDraw,
    onAcceptDraw,
}) => {
    const [isResignConfirm, setIsResignConfirm] = useState(false);
    const [isDrawOfferPending, setIsDrawOfferPending] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const isPlayerInGame = playerId === game.white_id || playerId === game.black_id;
    const isGameActive = game.status === 'active';

    const handleResign = async () => {
        if (!isResignConfirm) {
            setIsResignConfirm(true);
            return;
        }

        setIsProcessing(true);
        try {
            await onResign();
        } finally {
            setIsProcessing(false);
            setIsResignConfirm(false);
        }
    };

    const handleDrawOffer = async () => {
        setIsProcessing(true);
        try {
            await onOfferDraw();
            setIsDrawOfferPending(true);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAcceptDraw = async () => {
        setIsProcessing(true);
        try {
            await onAcceptDraw();
        } finally {
            setIsProcessing(false);
            setIsDrawOfferPending(false);
        }
    };

    if (!isPlayerInGame || !isGameActive) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-3 mt-4">
            {isResignConfirm ? (
                <>
                    <button
                        onClick={handleResign}
                        disabled={isProcessing}
                        className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
                    >
                        {isProcessing ? 'Resigning...' : 'Confirm Resignation'}
                    </button>
                    <button
                        onClick={() => setIsResignConfirm(false)}
                        disabled={isProcessing}
                        className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1"
                    >
                        Cancel
                    </button>
                </>
            ) : (
                <>
                    <button
                        onClick={handleResign}
                        disabled={isProcessing}
                        className="btn bg-red-100 text-red-700 hover:bg-red-200 flex-1"
                    >
                        Resign
                    </button>

                    {isDrawOfferPending ? (
                        <button
                            onClick={handleAcceptDraw}
                            disabled={isProcessing}
                            className="btn bg-green-600 text-white hover:bg-green-700 flex-1"
                        >
                            {isProcessing ? 'Accepting...' : 'Accept Draw'}
                        </button>
                    ) : (
                        <button
                            onClick={handleDrawOffer}
                            disabled={isProcessing}
                            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1"
                        >
                            {isProcessing ? 'Offering...' : 'Offer Draw'}
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default GameControls;
