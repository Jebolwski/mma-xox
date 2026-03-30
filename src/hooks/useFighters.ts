import { useState, useEffect } from 'react';
import { Fighter } from '../interfaces/Fighter';

interface UseFightersReturn {
    fighters: Fighter[];
    loading: boolean;
    error: string | null;
}

export const useFighters = (): UseFightersReturn => {
    const [fighters, setFighters] = useState<Fighter[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFighters = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/fighters.json');

                if (!response.ok) {
                    throw new Error(`Failed to fetch fighters: ${response.statusText}`);
                }

                const data: Fighter[] = await response.json();

                if (!Array.isArray(data)) {
                    throw new Error('Fighters data is not an array');
                }

                setFighters(data);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
                setError(errorMessage);
                console.error('Error fetching fighters:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFighters();
    }, []);

    return { fighters, loading, error };
};
