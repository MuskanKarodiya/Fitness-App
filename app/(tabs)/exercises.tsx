import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { EXERCISE_LIBRARY } from '@/constants/ExerciseLibrary';

export default function ExercisesScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [search, setSearch] = useState('');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Exercises</Text>
                <TouchableOpacity>
                    <FontAwesome name="filter" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <View style={[styles.searchBar, { backgroundColor: theme.cardBackground }]}>
                <FontAwesome name="search" size={16} color="#888" style={{ marginRight: 10 }} />
                <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Search exercises..."
                    placeholderTextColor="#888"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>All Exercises</Text>
                {EXERCISE_LIBRARY.filter(ex => ex.name.toLowerCase().includes(search.toLowerCase())).map((ex) => (
                    <View key={ex.id} style={[styles.exerciseItem, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.exerciseHeader}>
                            <Text style={[styles.exerciseName, { color: theme.text }]}>{ex.name}</Text>
                        </View>
                        <View style={styles.badgesContainer}>
                            <View style={[styles.badge, { backgroundColor: theme.tint + '20' }]}>
                                <Text style={[styles.badgeText, { color: theme.tint }]}>{ex.muscleGroup}</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: '#555555' }]}>
                                <Text style={[styles.badgeText, { color: '#EEEEEE' }]}>{ex.equipment}</Text>
                            </View>
                        </View>
                        <View style={styles.detailsContainer}>
                            <Text style={[styles.detailTitle, { color: theme.text }]}>Benefits:</Text>
                            <Text style={[styles.detailText, { color: '#AAAAAA' }]}>{ex.benefits}</Text>
                            <Text style={[styles.detailTitle, { color: theme.text, marginTop: 10 }]}>How-to:</Text>
                            <Text style={[styles.detailText, { color: '#AAAAAA' }]}>{ex.description}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 5,
    },
    exerciseItem: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    exerciseName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    badgesContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 8,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    detailsContainer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#333',
        paddingTop: 12,
    },
    detailTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    detailText: {
        fontSize: 14,
        lineHeight: 20,
    },
});
