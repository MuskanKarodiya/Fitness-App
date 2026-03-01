export interface PresetExercise {
    name: string;
    sets: number;
    reps: string;
}

export interface PresetTemplate {
    id: string;
    name: string;
    description: string;
    exercises: PresetExercise[];
}

export const WORKOUT_PRESETS: PresetTemplate[] = [
    {
        id: 'full-body-beginner',
        name: 'Full Body Beginner',
        description: 'A great starting point hitting all major muscle groups.',
        exercises: [
            { name: 'Squat', sets: 3, reps: '10' },
            { name: 'Bench Press', sets: 3, reps: '10' },
            { name: 'Pull Up', sets: 3, reps: '8' },
            { name: 'Overhead Press', sets: 3, reps: '10' },
        ]
    },
    {
        id: 'upper-body-power',
        name: 'Upper Body Power',
        description: 'Focus on upper body strength and hypertrophy.',
        exercises: [
            { name: 'Bench Press', sets: 4, reps: '5' },
            { name: 'Overhead Press', sets: 4, reps: '6' },
            { name: 'Pull Up', sets: 4, reps: '6' },
            { name: 'Bicep Curl', sets: 3, reps: '12' },
            { name: 'Tricep Extension', sets: 3, reps: '12' },
        ]
    },
    {
        id: 'leg-day',
        name: 'Leg Day',
        description: 'Intense lower body workout for building strong legs.',
        exercises: [
            { name: 'Squat', sets: 4, reps: '8' },
            { name: 'Leg Press', sets: 3, reps: '12' },
            { name: 'Deadlift', sets: 3, reps: '8' },
            { name: 'Calf Raise', sets: 4, reps: '15' },
        ]
    },
    {
        id: 'core-and-cardio',
        name: 'Core & Cardio',
        description: 'High intensity core stability and conditioning.',
        exercises: [
            { name: 'Plank', sets: 3, reps: '60' }, // 60s
            { name: 'Crunch', sets: 3, reps: '20' },
            { name: 'Leg Raise', sets: 3, reps: '15' },
            { name: 'Russian Twist', sets: 3, reps: '20' },
        ]
    }
];
