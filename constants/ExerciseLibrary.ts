import { ExerciseDefinition } from './types';

export const EXERCISE_LIBRARY: ExerciseDefinition[] = [
    // Chest
    {
        id: 'chest_1',
        name: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        equipment: 'Barbell',
        benefits: 'Builds overall upper body pushing strength and mass in the pectorals, deltoids, and triceps.',
        description: 'Lie on a flat bench, grip the barbell slightly wider than shoulder-width, lower it to your mid-chest, and press it back up.'
    },
    {
        id: 'chest_2',
        name: 'Incline Dumbbell Press',
        muscleGroup: 'Chest',
        equipment: 'Dumbbell',
        benefits: 'Targets the upper pectorals and front deltoids. Dumbbells allow for a full range of motion.',
        description: 'Set a bench to a 30-45 degree incline. Press dumbbells upwards over your chest, squeezing at the top.'
    },
    {
        id: 'chest_3',
        name: 'Cable Flyes',
        muscleGroup: 'Chest',
        equipment: 'Cable',
        benefits: 'Provides constant tension throughout the movement, excellent for isolating the chest muscles.',
        description: 'Stand between two cable pulleys set below shoulder height. Bring the handles together in a hugging motion.'
    },
    {
        id: 'chest_4',
        name: 'Push Up',
        muscleGroup: 'Chest',
        equipment: 'Bodyweight',
        benefits: 'A fundamental bodyweight exercise that builds chest, shoulder, and tricep endurance and strength.',
        description: 'Start in a high plank position. Lower your body until your chest nearly touches the floor, then push back up.'
    },

    // Back
    {
        id: 'back_1',
        name: 'Deadlift',
        muscleGroup: 'Back',
        equipment: 'Barbell',
        benefits: 'The ultimate full-body mass builder, heavily targeting the posterior chain including the erector spinae, glutes, and hamstrings.',
        description: 'Stand with mid-foot under the bar. Hinge at the hips, grip the bar, keep your back straight, and stand up by driving through the floor.'
    },
    {
        id: 'back_2',
        name: 'Pull Up',
        muscleGroup: 'Back',
        equipment: 'Bodyweight',
        benefits: 'Builds functional vertical pulling strength and widens the lats for a V-taper physique.',
        description: 'Hang from a bar with an overhand grip. Pull your body up until your chin clears the bar, then lower with control.'
    },
    {
        id: 'back_3',
        name: 'Bent Over Barbell Row',
        muscleGroup: 'Back',
        equipment: 'Barbell',
        benefits: 'Develops back thickness and strength, engaging the lats, rhomboids, and lower back.',
        description: 'Hinge at the hips keeping a straight back. Pull the barbell towards your lower sternum/belly button.'
    },
    {
        id: 'back_4',
        name: 'Lat Pulldown',
        muscleGroup: 'Back',
        equipment: 'Cable',
        benefits: 'A great alternative to pull-ups to isolate the latissimus dorsi with adjustable weight.',
        description: 'Sit at a pulldown machine. Grip the bar wide and pull it down to your upper chest, squeezing your shoulder blades together.'
    },

    // Legs
    {
        id: 'legs_1',
        name: 'Barbell Squat',
        muscleGroup: 'Legs',
        equipment: 'Barbell',
        benefits: 'The king of leg exercises. Builds massive lower body strength, targeting quads, glutes, and core.',
        description: 'Rest the barbell on your upper back. Squat down until your hips are below your knees, keeping your chest up, then drive back up.'
    },
    {
        id: 'legs_2',
        name: 'Romanian Deadlift (RDL)',
        muscleGroup: 'Legs',
        equipment: 'Barbell',
        benefits: 'Excellent for hamstring hypertrophy and glute strength. Improves hip hinge mobility.',
        description: 'Hold a barbell at hip level. Push your hips back while keeping legs mostly straight, lower the bar to mid-shin, and squeeze glutes to stand.'
    },
    {
        id: 'legs_3',
        name: 'Bulgarian Split Squat',
        muscleGroup: 'Legs',
        equipment: 'Dumbbell',
        benefits: 'Fixes muscular imbalances between legs and heavily targets the glutes and quads unilaterally.',
        description: 'Stand with one foot elevated on a bench behind you. Lower your back knee towards the ground, then drive through the front foot to stand.'
    },
    {
        id: 'legs_4',
        name: 'Leg Press',
        muscleGroup: 'Legs',
        equipment: 'Machine',
        benefits: 'Allows for heavy load on the quads and glutes without stressing the lower back.',
        description: 'Sit in a leg press machine. Press the weight up by extending your knees and hips, then lower it with control.'
    },
    {
        id: 'legs_5',
        name: 'Calf Raises',
        muscleGroup: 'Legs',
        equipment: 'Machine',
        benefits: 'Isolates the gastrocnemius or soleus muscles for lower leg development.',
        description: 'Stand on a raised edge with the balls of your feet. Let your heels drop, then press up as high as possible.'
    },

    // Shoulders
    {
        id: 'shoulders_1',
        name: 'Overhead Barbell Press',
        muscleGroup: 'Shoulders',
        equipment: 'Barbell',
        benefits: 'Builds core stability and massive anterior/medial deltoid strength.',
        description: 'Stand holding the bar at upper chest level. Press it directly overhead until your arms are locked out.'
    },
    {
        id: 'shoulders_2',
        name: 'Lateral Raises',
        muscleGroup: 'Shoulders',
        equipment: 'Dumbbell',
        benefits: 'Isolates the lateral head of the deltoid to create broader-looking shoulders.',
        description: 'Stand holding dumbbells at your sides. Raise them outward to the side until arms are horizontal.'
    },
    {
        id: 'shoulders_3',
        name: 'Face Pulls',
        muscleGroup: 'Shoulders',
        equipment: 'Cable',
        benefits: 'Crucial for shoulder health and posture. Targets the rear delts and rotator cuff.',
        description: 'Set a cable pulley chest high with a rope attachment. Pull it towards your face, pulling the handles apart at the end.'
    },

    // Arms
    {
        id: 'arms_1',
        name: 'Barbell Bicep Curl',
        muscleGroup: 'Arms',
        equipment: 'Barbell',
        benefits: 'The most effective mass builder for the biceps. Allows for heavy loading.',
        description: 'Stand holding a barbell with an underhand grip. Curl the weight up towards your chest, keeping elbows pinned to your sides.'
    },
    {
        id: 'arms_2',
        name: 'Tricep Rope Pushdown',
        muscleGroup: 'Arms',
        equipment: 'Cable',
        benefits: 'Isolates the triceps for a better contraction, improving the lockout strength of pressing movements.',
        description: 'Use a high cable pulley with a rope. Keep elbows tucked in and push the rope down, spreading the handles at the bottom.'
    },
    {
        id: 'arms_3',
        name: 'Skullcrushers',
        muscleGroup: 'Arms',
        equipment: 'Barbell',
        benefits: 'Hits all three heads of the triceps heavily for mass and strength.',
        description: 'Lie on a bench. Hold an EZ-bar over your chest. Lower the bar towards your forehead by bending the elbows, then extend back up.'
    },
    {
        id: 'arms_4',
        name: 'Hammer Curls',
        muscleGroup: 'Arms',
        equipment: 'Dumbbell',
        benefits: 'Develops the brachialis and brachioradialis, adding thickness to the arm and improving grip strength.',
        description: 'Hold dumbbells with a neutral grip (palms facing in). Curl the weights up while keeping the neutral grip.'
    }
];
