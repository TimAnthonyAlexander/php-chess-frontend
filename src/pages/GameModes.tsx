import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { modeService, queueService } from '../services/api';
import type { TimeControl, QueueStatus } from '../types';

const GameModes = () => {
    const [timeControls, setTimeControls] = useState<TimeControl[]>([]);
    const [selectedMode, setSelectedMode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isJoiningQueue, setIsJoiningQueue] = useState(false);
    const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
    const [queueTime, setQueueTime] = useState(0);
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

    const navigate = useNavigate();

    // Load time controls
    useEffect(() => {
        const fetchTimeControls = async () => {
            try {
                const response = await modeService.getTimeControls();
                setTimeControls(response);
            } catch (err) {
                setError('Failed to load game modes');
                console.error('Error loading time controls:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTimeControls();
    }, []);

    // Handle queue updates
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [pollingInterval]);

    // Handle queue timer
    useEffect(() => {
        if (!isJoiningQueue) {
            setQueueTime(0);
            return;
        }

        const timer = setInterval(() => {
            setQueueTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isJoiningQueue]);

    // Join queue for selected time control
    const handleJoinQueue = async () => {
        if (!selectedMode) return;

        setIsJoiningQueue(true);

        try {
            const status = await queueService.joinQueue(selectedMode);
            setQueueStatus(status);

            if (status.status === 'matched') {
                // Game found, navigate to game page
                navigate(`/game/${status.game_id}`);
                return;
            }

            // If not immediately matched, start polling for status
            const interval = setInterval(async () => {
                try {
                    const updatedStatus = await queueService.joinQueue(selectedMode);
                    setQueueStatus(updatedStatus);

                    if (updatedStatus.status === 'matched') {
                        clearInterval(interval);
                        navigate(`/game/${updatedStatus.game_id}`);
                    }
                } catch (err) {
                    console.error('Error polling queue status:', err);
                }
            }, 2000);

            setPollingInterval(interval);

        } catch (err) {
            setError('Failed to join queue');
            setIsJoiningQueue(false);
            console.error('Error joining queue:', err);
        }
    };

    // Leave queue
    const handleLeaveQueue = async () => {
        if (!selectedMode) return;

        try {
            await queueService.leaveQueue(selectedMode);

            if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
            }

        } catch (err) {
            console.error('Error leaving queue:', err);
        } finally {
            setIsJoiningQueue(false);
            setQueueStatus(null);
            setQueueTime(0);
        }
    };

    // Format queue time display
    const formatQueueTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // Group time controls by category for better display
    const groupedTimeControls = timeControls.reduce<Record<string, TimeControl[]>>((acc, tc) => {
        if (!acc[tc.time_class]) {
            acc[tc.time_class] = [];
        }
        acc[tc.time_class].push(tc);
        return acc;
    }, {});

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Play Chess</h1>

            {isJoiningQueue ? (
                <div className="card text-center py-8">
                    <div className="flex flex-col items-center">
                        <div className="text-2xl font-semibold mb-4">Finding opponent...</div>
                        <div className="text-4xl font-bold mb-6">{formatQueueTime(queueTime)}</div>

                        {queueStatus?.widening && (
                            <div className="text-sm text-gray-600 mb-4">
                                Search range: ±{queueStatus.widening.delta} Elo
                            </div>
                        )}

                        <div className="animate-pulse mb-8">
                            <div className="flex space-x-2">
                                <div className="h-3 w-3 bg-primary rounded-full"></div>
                                <div className="h-3 w-3 bg-primary rounded-full"></div>
                                <div className="h-3 w-3 bg-primary rounded-full"></div>
                            </div>
                        </div>

                        <button onClick={handleLeaveQueue} className="btn bg-red-100 text-red-700 hover:bg-red-200">
                            Cancel Search
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {Object.entries(groupedTimeControls).map(([timeClass, controls]) => (
                        <div key={timeClass} className="card">
                            <h2 className="text-xl font-semibold mb-4 capitalize">{timeClass}</h2>

                            <div className="space-y-4">
                                {controls.map((tc) => (
                                    <div
                                        key={tc.id}
                                        onClick={() => setSelectedMode(tc.slug)}
                                        className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${selectedMode === tc.slug
                                            ? 'border-primary bg-primary bg-opacity-5'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-medium text-lg">{tc.name}</div>
                                                <div className="text-sm text-gray-600">
                                                    {Math.floor(tc.initial_sec / 60)}min {tc.initial_sec % 60}s + {tc.increment_ms / 1000}s
                                                </div>
                                            </div>

                                            {selectedMode === tc.slug && (
                                                <div className="h-4 w-4 rounded-full bg-primary"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Placeholder if no time controls are loaded or available */}
                    {Object.keys(groupedTimeControls).length === 0 && !isLoading && (
                        <div className="col-span-2 text-center py-8 text-gray-500">
                            No game modes available
                        </div>
                    )}

                    {/* Loading state */}
                    {isLoading && (
                        <div className="col-span-2 flex justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    )}
                </div>
            )}

            {/* Play button */}
            {!isJoiningQueue && !isLoading && selectedMode && (
                <div className="mt-8 text-center">
                    <button
                        onClick={handleJoinQueue}
                        className="btn btn-primary text-lg py-3 px-12"
                    >
                        Find Game
                    </button>
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

export default GameModes;
