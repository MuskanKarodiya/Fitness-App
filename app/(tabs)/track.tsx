import ExerciseCard from '@/components/ExerciseCard';
import ExerciseSelectionModal from '@/components/ExerciseSelectionModal';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Exercise, Set, Workout } from '@/constants/types';
import { PresetTemplate, WORKOUT_PRESETS } from '@/constants/WorkoutPresets';
import { useWorkout } from '@/context/WorkoutContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Crypto from 'expo-crypto';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TrackScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { saveWorkout } = useWorkout();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activePreset, setActivePreset] = useState<string | undefined>();

  // --- Actions ---

  const handleAddExercise = (exerciseName: string) => {
    const newExercise: Exercise = {
      id: Crypto.randomUUID(),
      name: exerciseName,
      sets: [
        { id: Crypto.randomUUID(), reps: '', weight: '', completed: false }
      ]
    };
    setExercises([...exercises, newExercise]);
    setModalVisible(false);
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises(currentExercises =>
      currentExercises.map(ex => {
        if (ex.id === exerciseId) {
          // Copy previous set values if available, else empty
          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet: Set = {
            id: Crypto.randomUUID(),
            reps: lastSet ? lastSet.reps : '',
            weight: lastSet ? lastSet.weight : '',
            completed: false
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        }
        return ex;
      })
    );
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: keyof Set, value: string | boolean) => {
    setExercises(currentExercises =>
      currentExercises.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
          };
        }
        return ex;
      })
    );
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setExercises(currentExercises =>
      currentExercises.map(ex => {
        if (ex.id === exerciseId) {
          return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
        }
        return ex;
      })
    );
  }

  const handleRemoveExercise = (exerciseId: string) => {
    Alert.alert(
      "Remove Exercise",
      "Are you sure you want to remove this exercise?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => setExercises(prev => prev.filter(ex => ex.id !== exerciseId))
        }
      ]
    );
  };

  const handleLoadPreset = (preset: PresetTemplate) => {
    const newExercises: Exercise[] = preset.exercises.map(ex => ({
      id: Crypto.randomUUID(),
      name: ex.name,
      sets: Array.from({ length: ex.sets }).map(() => ({
        id: Crypto.randomUUID(),
        reps: ex.reps,
        weight: '',
        completed: false
      }))
    }));

    setExercises(newExercises);
    setActivePreset(preset.name);
  };

  const handleFinishWorkout = async () => {
    if (exercises.length === 0) {
      Alert.alert("Empty Workout", "Add some exercises before finishing!");
      return;
    }

    const workout: Workout = {
      id: Crypto.randomUUID(),
      date: new Date(),
      presetName: activePreset,
      exercises: exercises,
    };

    await saveWorkout(workout);

    Alert.alert("Workout Finished!", "Your workout has been saved to history.");
    setExercises([]);
    setActivePreset(undefined);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Track Workout</Text>
          <TouchableOpacity onPress={() => console.log('Calendar pressed')}>
            <FontAwesome name="calendar" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.emptyStateText, { color: theme.text }]}>
                Start your workout by adding an exercise
              </Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.tint }]}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.addButtonText}>+ Add Exercise</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.presetsTitle, { color: theme.text }]}>Or Pick a Preset Template</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsList}>
              {WORKOUT_PRESETS.map(preset => (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.presetCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}
                  onPress={() => handleLoadPreset(preset)}
                >
                  <Text style={[styles.presetName, { color: theme.text }]}>{preset.name}</Text>
                  <Text style={styles.presetDesc}>{preset.description}</Text>
                  <Text style={[styles.presetCount, { color: theme.tint }]}>
                    {preset.exercises.length} Exercises
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <>
            {exercises.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onUpdateSet={handleUpdateSet}
                onAddSet={handleAddSet}
                onRemoveSet={handleRemoveSet}
                onRemoveExercise={handleRemoveExercise}
              />
            ))}

            <TouchableOpacity
              style={[styles.addExerciseButton, { borderColor: theme.tint }]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={[styles.addExerciseText, { color: theme.tint }]}>+ Add Exercise</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.finishButton, { backgroundColor: theme.tint }]}
              onPress={handleFinishWorkout}
            >
              <Text style={styles.finishButtonText}>Finish Workout</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <ExerciseSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleAddExercise}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Extra padding for scrolling
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  emptyState: {
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addExerciseButton: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  addExerciseText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  finishButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    marginTop: 20,
  },
  presetsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
  },
  presetsList: {
    paddingRight: 20,
    gap: 15,
  },
  presetCard: {
    width: 200,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },
  presetName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  presetDesc: {
    fontSize: 12,
    color: '#888',
    marginBottom: 15,
  },
  presetCount: {
    fontSize: 12,
    fontWeight: 'bold',
  }
});
