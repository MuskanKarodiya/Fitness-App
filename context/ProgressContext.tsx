import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ProgressLog } from '../constants/types';

interface ProgressContextType {
    progressLogs: ProgressLog[];
    saveProgressLog: (log: ProgressLog) => Promise<void>;
    deleteProgressLog: (id: string) => Promise<void>;
    isLoading: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const PROGRESS_STORAGE_KEY = '@fitness_app_progress';

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
    const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProgressLogs();
    }, []);

    const loadProgressLogs = async () => {
        try {
            const storedLogs = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
            if (storedLogs) {
                const parsedLogs = JSON.parse(storedLogs);
                const hydratedLogs = parsedLogs.map((log: any) => ({
                    ...log,
                    date: new Date(log.date),
                }));
                setProgressLogs(hydratedLogs);
            }
        } catch (error) {
            console.error('Failed to load progress logs', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveProgressLog = async (log: ProgressLog) => {
        try {
            const updatedLogs = [log, ...progressLogs].sort((a, b) => b.date.getTime() - a.date.getTime());
            await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updatedLogs));
            setProgressLogs(updatedLogs);
        } catch (error) {
            console.error('Failed to save progress log', error);
            throw error; // Re-throw to handle in UI
        }
    };

    const deleteProgressLog = async (id: string) => {
        try {
            const updatedLogs = progressLogs.filter((log) => log.id !== id);
            await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updatedLogs));
            setProgressLogs(updatedLogs);
        } catch (error) {
            console.error('Failed to delete progress log', error);
        }
    };

    return (
        <ProgressContext.Provider value={{ progressLogs, saveProgressLog, deleteProgressLog, isLoading }}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => {
    const context = useContext(ProgressContext);
    if (!context) {
        throw new Error('useProgress must be used within a ProgressProvider');
    }
    return context;
};
