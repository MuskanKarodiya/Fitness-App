import { Workout } from '@/constants/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface WorkoutContextType {
    workouts: Workout[];
    saveWorkout: (workout: Workout) => Promise<void>;
    deleteWorkout: (id: string) => Promise<void>;
    isLoading: boolean;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const WORKOUTS_STORAGE_KEY = '@workouts_history';

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadWorkouts();
    }, []);

    const loadWorkouts = async () => {
        try {
            const storedWorkouts = await AsyncStorage.getItem(WORKOUTS_STORAGE_KEY);
            if (storedWorkouts) {
                // Parse the dates back to Date objects
                const parsed: Workout[] = JSON.parse(storedWorkouts).map((w: any) => ({
                    ...w,
                    date: new Date(w.date)
                }));
                // Sort by date descending (newest first)
                parsed.sort((a, b) => b.date.getTime() - a.date.getTime());
                setWorkouts(parsed);
            }
        } catch (e) {
            console.error('Failed to load workouts from storage', e);
        } finally {
            setIsLoading(false);
        }
    };

    const saveWorkout = async (workout: Workout) => {
        try {
            const updatedWorkouts = [workout, ...workouts];
            setWorkouts(updatedWorkouts);
            await AsyncStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(updatedWorkouts));
        } catch (e) {
            console.error('Failed to save workout', e);
        }
    };

    const deleteWorkout = async (id: string) => {
        try {
            const updatedWorkouts = workouts.filter(w => w.id !== id);
            setWorkouts(updatedWorkouts);
            await AsyncStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(updatedWorkouts));
        } catch (e) {
            console.error('Failed to delete workout', e);
        }
    };

    return (
        <WorkoutContext.Provider value={{ workouts, saveWorkout, deleteWorkout, isLoading }}>
            {children}
        </WorkoutContext.Provider>
    );
};

export const useWorkout = () => {
    const context = useContext(WorkoutContext);
    if (context === undefined) {
        throw new Error('useWorkout must be used within a WorkoutProvider');
    }
    return context;
};
