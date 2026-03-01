export interface Set {
    id: string;
    reps: string;
    weight: string;
    completed: boolean;
}

export interface Exercise {
    id: string;
    name: string;
    sets: Set[];
}

export interface Workout {
    id: string;
    date: Date;
    presetName?: string;
    exercises: Exercise[];
}

export interface ExerciseDefinition {
    id: string;
    name: string;
    muscleGroup: string;
    equipment: 'Barbell' | 'Dumbbell' | 'Machine' | 'Bodyweight' | 'Cable' | 'Other';
    benefits: string;
    description: string;
}

export interface Measurements {
    chest?: string;
    waist?: string;
    arms?: string;
    thighs?: string;
}

export interface ProgressLog {
    id: string;
    date: Date;
    weight: string;
    measurements: Measurements;
    photoUri?: string;
}
