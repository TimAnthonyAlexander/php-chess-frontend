import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/api';
import type { Game } from '../types';
import { useAuth } from '../contexts/AuthContext';

const GameHistory = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeClass, setSelectedTimeClass] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchGames = async () => {
            setIsLoading(true);
            try {
                const response = await userService.getRecentGames(selectedTimeClass || undefined);
                setGames(response);
            } catch (err) {
                setError('Failed to load game history');
                console.error('Error loading games:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGames();
    }, [selectedTimeClass]);

    const formatResult = (game: Game): string => {
        if (!game.result) return 'In Progress';

        const isWhite = user?.id === game.white_id;

        if (game.result === '1-0') {
            return isWhite ? 'Win' : 'Loss';
        } else if (game.result === '0-1') {
            return isWhite ? 'Loss' : 'Win';
        } else {
            return 'Draw';
        }
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatTime = (dateString: string): string => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getResultClass = (result: string): string => {
        if (result === 'Win') return 'bg-green-100 text-green-800';
        if (result === 'Loss') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Game History</h1>

            {/* Time class filter */}
            <div className="flex space-x-2 mb-8">
                <button
                    onClick={() => setSelectedTimeClass(null)}
                    className={`px-4 py-2 rounded-md text-sm ${selectedTimeClass === null
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setSelectedTimeClass('bullet')}
                    className={`px-4 py-2 rounded-md text-sm ${selectedTimeClass === 'bullet'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Bullet
                </button>
                <button
                    onClick={() => setSelectedTimeClass('blitz')}
                    className={`px-4 py-2 rounded-md text-sm ${selectedTimeClass === 'blitz'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Blitz
                </button>
                <button
                    onClick={() => setSelectedTimeClass('rapid')}
                    className={`px-4 py-2 rounded-md text-sm ${selectedTimeClass === 'rapid'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Rapid
                </button>
            </div>

            {/* Games table */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : games.length > 0 ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Opponent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Color
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Time Control
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Result
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Termination
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {games.map((game) => {
                                    const isWhite = user?.id === game.white_id;
                                    const opponent = isWhite ? game.black : game.white;
                                    const result = formatResult(game);

                                    return (
                                        <tr key={game.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(game.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatTime(game.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {opponent?.name || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="flex items-center">
                                                    <span
                                                        className={`h-3 w-3 rounded-full mr-2 ${isWhite ? 'bg-gray-100 border border-gray-300' : 'bg-gray-800'}`}
                                                    ></span>
                                                    <span className="text-sm">{isWhite ? 'White' : 'Black'}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {game.timeControl?.name || 'Standard'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getResultClass(result)}`}>
                                                    {result}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                {game.reason || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                                                <Link to={`/game/${game.id}`} className="hover:underline">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">No games found.</p>
                    <Link to="/play" className="btn btn-primary inline-block mt-4">
                        Play a Game
                    </Link>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
                    {error}
                </div>
            )}
        </div>
    );
};

export default GameHistory;
