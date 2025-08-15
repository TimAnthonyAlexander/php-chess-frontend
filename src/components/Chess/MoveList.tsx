import type { GameMove } from '../../types';

interface MoveListProps {
    moves: GameMove[];
    currentMoveIndex?: number;
    onSelectMove?: (index: number) => void;
}

const MoveList: React.FC<MoveListProps> = ({
    moves,
    currentMoveIndex,
    onSelectMove
}) => {
    const isInteractive = !!onSelectMove;

    // Group moves into pairs for display
    const movePairs: Array<{ index: number; white?: GameMove; black?: GameMove }> = [];
    for (let i = 0; i < moves.length; i += 2) {
        const whiteMove = moves[i];
        const blackMove = i + 1 < moves.length ? moves[i + 1] : undefined;

        const moveNumber = Math.floor(i / 2) + 1;
        movePairs.push({
            index: moveNumber,
            white: whiteMove,
            black: blackMove
        });
    }

    return (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h3 className="font-medium">Moves</h3>
            </div>

            <div className="p-2 max-h-[400px] overflow-y-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="px-2 py-1 text-xs font-medium text-gray-500 text-left">#</th>
                            <th className="px-2 py-1 text-xs font-medium text-gray-500 text-left">White</th>
                            <th className="px-2 py-1 text-xs font-medium text-gray-500 text-left">Black</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movePairs.map((pair) => (
                            <tr key={pair.index} className="hover:bg-gray-50">
                                <td className="px-2 py-1 text-sm text-gray-500">{pair.index}.</td>
                                <td
                                    className={`px-2 py-1 text-sm ${isInteractive ? 'cursor-pointer hover:text-primary' : ''
                                        } ${pair.white && currentMoveIndex === pair.white.ply ? 'font-bold text-primary' : ''}`}
                                    onClick={() => pair.white && onSelectMove && onSelectMove(pair.white.ply)}
                                >
                                    {pair.white?.san || ''}
                                </td>
                                <td
                                    className={`px-2 py-1 text-sm ${isInteractive ? 'cursor-pointer hover:text-primary' : ''
                                        } ${pair.black && currentMoveIndex === pair.black.ply ? 'font-bold text-primary' : ''}`}
                                    onClick={() => pair.black && onSelectMove && onSelectMove(pair.black.ply)}
                                >
                                    {pair.black?.san || ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {moves.length === 0 && (
                    <div className="text-center py-4 text-gray-500">No moves yet</div>
                )}
            </div>
        </div>
    );
};

export default MoveList;
