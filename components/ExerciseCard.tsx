import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Exercise, Set } from '@/constants/types';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SetRow from './SetRow';

interface ExerciseCardProps {
    exercise: Exercise;
    onUpdateSet: (exerciseId: string, setId: string, field: keyof Set, value: string | boolean) => void;
    onAddSet: (exerciseId: string) => void;
    onRemoveSet: (exerciseId: string, setId: string) => void;
    onRemoveExercise: (exerciseId: string) => void;
}

export default function ExerciseCard({ exercise, onUpdateSet, onAddSet, onRemoveSet, onRemoveExercise }: ExerciseCardProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.exerciseHeader}>
                <Text style={[styles.exerciseName, { color: theme.text }]}>{exercise.name}</Text>
                <TouchableOpacity onPress={() => onRemoveExercise(exercise.id)}>
                    <FontAwesome name="trash" size={20} color={theme.text} style={{ opacity: 0.5 }} />
                </TouchableOpacity>
            </View>

            <View style={styles.rowHeader}>
                <Text style={styles.colHeader}>Set</Text>
                <Text style={styles.colHeader}>kg</Text>
                <Text style={styles.colHeader}>Reps</Text>
                <Text style={styles.colHeader}>Done</Text>
            </View>

            {exercise.sets.map((set, index) => (
                <SetRow
                    key={set.id}
                    index={index}
                    set={set}
                    onUpdate={(field, value) => onUpdateSet(exercise.id, set.id, field, value)}
                    onRemove={() => onRemoveSet(exercise.id, set.id)}
                />
            ))}

            <TouchableOpacity style={styles.addSetButton} onPress={() => onAddSet(exercise.id)}>
                <Text style={[styles.addSetText, { color: theme.tint }]}>+ Add Set</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: '600',
    },
    rowHeader: {
        flexDirection: 'row',
        marginBottom: 10,
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingRight: 40, // align with inputs roughly
    },
    colHeader: {
        fontSize: 12,
        color: '#888',
        textTransform: 'uppercase',
        width: 60,
        textAlign: 'center',
    },
    addSetButton: {
        alignItems: 'center',
        paddingVertical: 10,
        marginTop: 5,
    },
    addSetText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
