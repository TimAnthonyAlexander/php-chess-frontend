import { useState } from 'react';
import type { Game } from '../../types';
import { Box, Paper, Stack, Button, Tooltip, useTheme } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FlagRounded from '@mui/icons-material/FlagRounded';
import HandshakeRounded from '@mui/icons-material/HandshakeRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';

interface GameControlsProps {
    game: Game;
    playerId: number;
    onResign: () => Promise<void>;
    onOfferDraw: () => Promise<void>;
    onAcceptDraw: () => Promise<void>;
}

function GameControls({
    game,
    playerId,
    onResign,
    onOfferDraw,
    onAcceptDraw,
}: GameControlsProps) {
    const [isResignConfirm, setIsResignConfirm] = useState(false);
    const [isDrawOfferPending, setIsDrawOfferPending] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const isPlayerInGame = playerId === game.white_id || playerId === game.black_id;
    const isGameActive = game.status === 'active';

    const theme = useTheme();

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

    if (!isPlayerInGame || !isGameActive) return null;

    return (
        <Box sx={{ mt: 2 }}>
            <Paper
                elevation={0}
                sx={{
                    p: 1.5,
                    borderRadius: 3,
                    backdropFilter: 'saturate(180%) blur(16px)',
                    backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(255,255,255,0.7)',
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                {isResignConfirm ? (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <LoadingButton
                            onClick={handleResign}
                            loading={isProcessing}
                            variant="contained"
                            color="error"
                            fullWidth
                            startIcon={<FlagRounded />}
                            sx={{ borderRadius: 2, textTransform: 'none', py: 1.25 }}
                        >
                            Confirm Resign
                        </LoadingButton>
                        <Button
                            onClick={() => setIsResignConfirm(false)}
                            disabled={isProcessing}
                            variant="outlined"
                            fullWidth
                            startIcon={<CloseRounded />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                py: 1.25,
                                borderColor: theme.palette.divider,
                            }}
                        >
                            Cancel
                        </Button>
                    </Stack>
                ) : (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Tooltip title="Concede the game">
                            <Button
                                onClick={handleResign}
                                disabled={isProcessing}
                                variant="outlined"
                                color="error"
                                fullWidth
                                startIcon={<FlagRounded />}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    py: 1.25,
                                    borderColor:
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 99, 132, 0.4)'
                                            : 'rgba(255, 99, 132, 0.5)',
                                }}
                            >
                                Resign
                            </Button>
                        </Tooltip>

                        {isDrawOfferPending ? (
                            <LoadingButton
                                onClick={handleAcceptDraw}
                                loading={isProcessing}
                                variant="contained"
                                color="success"
                                fullWidth
                                startIcon={<CheckRounded />}
                                sx={{ borderRadius: 2, textTransform: 'none', py: 1.25 }}
                            >
                                Accept Draw
                            </LoadingButton>
                        ) : (
                            <LoadingButton
                                onClick={handleDrawOffer}
                                loading={isProcessing}
                                variant="contained"
                                fullWidth
                                startIcon={<HandshakeRounded />}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    py: 1.25,
                                    boxShadow: 'none',
                                }}
                            >
                                Offer Draw
                            </LoadingButton>
                        )}
                    </Stack>
                )}
            </Paper>
        </Box>
    );
}

export default GameControls;
