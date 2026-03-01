import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Workout } from '@/constants/types';
import { useWorkout } from '@/context/WorkoutContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

export default function HistoryScreen() {
    const { workouts, deleteWorkout } = useWorkout();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const confirmDelete = (id: string) => {
        Alert.alert(
            "Delete Workout",
            "Are you sure you want to delete this workout from your history?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteWorkout(id) }
            ]
        );
    };

    const renderWorkout = ({ item }: { item: Workout }) => {
        const totalVolume = item.exercises.reduce((total, ex) => {
            return total + ex.sets.reduce((sum, set) => {
                if (set.completed && set.weight && set.reps) {
                    return sum + (parseFloat(set.weight) * parseInt(set.reps, 10));
                }
                return sum;
            }, 0);
        }, 0);

        const totalSets = item.exercises.reduce((count, ex) => {
            return count + ex.sets.filter(s => s.completed).length;
        }, 0);

        return (
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.cardHeader}>
                    <View>
                        {item.presetName && (
                            <Text style={[styles.presetBadge, { color: theme.tint, borderColor: theme.tint }]}>
                                {item.presetName}
                            </Text>
                        )}
                        <Text style={[styles.dateText, { color: theme.text }]}>
                            {item.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </Text>
                        <Text style={styles.timeText}>
                            {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                        <FontAwesome name="trash" size={20} color={theme.text} style={{ opacity: 0.5 }} />
                    </TouchableOpacity>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Volume</Text>
                        <Text style={[styles.statValue, { color: theme.tint }]}>{totalVolume} kg</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Sets</Text>
                        <Text style={[styles.statValue, { color: theme.tint }]}>{totalSets}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Exercises</Text>
                        <Text style={[styles.statValue, { color: theme.tint }]}>{item.exercises.length}</Text>
                    </View>
                </View>

                <View style={styles.exercisesList}>
                    {item.exercises.slice(0, 3).map((ex, index) => (
                        <Text key={ex.id} style={[styles.exerciseBullet, { color: theme.text }]} numberOfLines={1}>
                            • {ex.sets.filter(s => s.completed).length}x {ex.name}
                        </Text>
                    ))}
                    {item.exercises.length > 3 && (
                        <Text style={styles.moreText}>+ {item.exercises.length - 3} more exercises</Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Workout History</Text>
            </View>

            {workouts.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <FontAwesome name="history" size={60} color={theme.borderColor} style={{ marginBottom: 20 }} />
                    <Text style={styles.emptyText}>No tracking history yet.</Text>
                    <Text style={styles.emptySubText}>Complete a workout in the Track tab to see it here.</Text>
                </View>
            ) : (
                <FlatList
                    contentContainerStyle={styles.listContainer}
                    data={workouts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderWorkout}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    presetBadge: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        borderWidth: 1,
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 8,
    },
    dateText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    timeText: {
        fontSize: 14,
        color: '#888',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(150, 150, 150, 0.3)',
    },
    statBox: {
        alignItems: 'flex-start',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    exercisesList: {
        paddingLeft: 4,
    },
    exerciseBullet: {
        fontSize: 14,
        marginBottom: 8,
        opacity: 0.9,
    },
    moreText: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptySubText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
    },
});
