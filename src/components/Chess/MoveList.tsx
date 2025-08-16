import { useMemo } from 'react';
import type { GameMove } from '../../types';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

interface MoveListProps {
    moves: GameMove[];
    currentMoveIndex?: number;
    onSelectMove?: (index: number) => void;
}

function MoveList({ moves, currentMoveIndex, onSelectMove }: MoveListProps) {
    const theme = useTheme();
    const isInteractive = !!onSelectMove;

    const movePairs = useMemo(
        () =>
            Array.from({ length: Math.ceil(moves.length / 2) }, (_, i) => ({
                index: i + 1,
                white: moves[i * 2],
                black: moves[i * 2 + 1],
            })),
        [moves]
    );

    return (
        <Box
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.mode === 'dark'
                    ? alpha('#121212', 0.6)
                    : alpha('#ffffff', 0.7),
                backdropFilter: 'saturate(180%) blur(16px)',
            }}
        >

            <TableContainer
                sx={{
                    maxHeight: 400,
                    '&::-webkit-scrollbar': { height: 8, width: 8 },
                    '&::-webkit-scrollbar-thumb': {
                        borderRadius: 8,
                        backgroundColor: alpha(theme.palette.text.primary, 0.2),
                    },
                }}
            >
                <Table stickyHeader size="small" aria-label="move list">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>#</TableCell>
                            <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>White</TableCell>
                            <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>Black</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {movePairs.map((pair, rowIdx) => {
                            const rowBg =
                                rowIdx % 2 === 0
                                    ? 'transparent'
                                    : theme.palette.mode === 'dark'
                                        ? alpha('#ffffff', 0.03)
                                        : alpha('#000000', 0.02);

                            const cellBase = {
                                fontSize: 14,
                                py: 1,
                            } as const;

                            const whiteActive = pair.white && currentMoveIndex === pair.white.ply;
                            const blackActive = pair.black && currentMoveIndex === pair.black.ply;

                            return (
                                <TableRow
                                    key={pair.index}
                                    hover
                                    sx={{
                                        backgroundColor: rowBg,
                                        '&:hover': {
                                            backgroundColor:
                                                theme.palette.mode === 'dark'
                                                    ? alpha(theme.palette.primary.main, 0.07)
                                                    : alpha(theme.palette.primary.main, 0.05),
                                        },
                                        transition: 'background-color 120ms ease',
                                    }}
                                >
                                    <TableCell sx={{ ...cellBase, color: 'text.secondary', width: 48 }}>
                                        {pair.index}.
                                    </TableCell>

                                    <TableCell
                                        onClick={() => pair.white && onSelectMove?.(pair.white.ply)}
                                        sx={{
                                            ...cellBase,
                                            fontWeight: whiteActive ? 700 : 500,
                                            color: whiteActive ? 'primary.main' : 'text.primary',
                                            cursor: pair.white && isInteractive ? 'pointer' : 'default',
                                            userSelect: 'none',
                                        }}
                                    >
                                        {pair.white?.san || ''}
                                    </TableCell>

                                    <TableCell
                                        onClick={() => pair.black && onSelectMove?.(pair.black.ply)}
                                        sx={{
                                            ...cellBase,
                                            fontWeight: blackActive ? 700 : 500,
                                            color: blackActive ? 'primary.main' : 'text.primary',
                                            cursor: pair.black && isInteractive ? 'pointer' : 'default',
                                            userSelect: 'none',
                                        }}
                                    >
                                        {pair.black?.san || ''}
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {moves.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No moves yet
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default MoveList;
