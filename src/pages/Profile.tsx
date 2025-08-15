import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import type { PlayerRating } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
    const [ratings, setRatings] = useState<PlayerRating[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const response = await userService.getRatings();
                setRatings(response);
            } catch (err) {
                setError('Failed to load ratings');
                console.error('Error loading ratings:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRatings();
    }, []);

    // Helper to get rating for specific time class
    const getRating = (timeClass: string): number => {
        const rating = ratings.find(r => r.time_class === timeClass);
        return rating?.rating || 1500;
    };

    // Helper to get games played for specific time class
    const getGamesPlayed = (timeClass: string): number => {
        const rating = ratings.find(r => r.time_class === timeClass);
        return rating?.games || 0;
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

            {/* Profile info */}
            <div className="card mb-8">
                <div className="flex items-center">
                    <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="ml-6">
                        <h2 className="text-2xl font-bold">{user?.name || 'User'}</h2>
                        <p className="text-gray-600">{user?.email || ''}</p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {/* Rating overview */}
                    <h2 className="text-xl font-semibold mb-4">Ratings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Bullet */}
                        <div className="card">
                            <div className="text-sm text-gray-600 mb-1">Bullet</div>
                            <div className="text-3xl font-bold">{getRating('bullet')}</div>
                            <div className="text-sm text-gray-600 mt-2">
                                {getGamesPlayed('bullet')} games played
                            </div>
                        </div>

                        {/* Blitz */}
                        <div className="card">
                            <div className="text-sm text-gray-600 mb-1">Blitz</div>
                            <div className="text-3xl font-bold">{getRating('blitz')}</div>
                            <div className="text-sm text-gray-600 mt-2">
                                {getGamesPlayed('blitz')} games played
                            </div>
                        </div>

                        {/* Rapid */}
                        <div className="card">
                            <div className="text-sm text-gray-600 mb-1">Rapid</div>
                            <div className="text-3xl font-bold">{getRating('rapid')}</div>
                            <div className="text-sm text-gray-600 mt-2">
                                {getGamesPlayed('rapid')} games played
                            </div>
                        </div>
                    </div>

                    {/* Detailed ratings */}
                    <h2 className="text-xl font-semibold mb-4">Rating Details</h2>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Time Class
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rating
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Games Played
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {ratings.length > 0 ? (
                                    ratings.map((rating) => (
                                        <tr key={rating.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                                {rating.time_class}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                                {rating.rating}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rating.games}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            No ratings data available. Play some games to get started!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
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

export default Profile;
