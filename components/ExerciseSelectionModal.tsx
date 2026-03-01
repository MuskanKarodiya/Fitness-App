import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { EXERCISE_LIBRARY } from '@/constants/ExerciseLibrary';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ExerciseSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (exerciseName: string) => void;
}

export default function ExerciseSelectionModal({ visible, onClose, onSelect }: ExerciseSelectionModalProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [searchQuery, setSearchQuery] = useState('');

    const filteredExercises = EXERCISE_LIBRARY.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.header}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Select Exercise</Text>
                        <Pressable onPress={onClose}>
                            <FontAwesome name="close" size={24} color={theme.text} />
                        </Pressable>
                    </View>

                    <View style={[styles.searchContainer, { backgroundColor: theme.background }]}>
                        <FontAwesome name="search" size={16} color="#888" style={styles.searchIcon} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.text }]}
                            placeholder="Search exercises..."
                            placeholderTextColor="#888"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <FlatList
                        data={filteredExercises}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.item, { borderBottomColor: theme.borderColor }]}
                                onPress={() => {
                                    onSelect(item.name);
                                    setSearchQuery('');
                                }}
                            >
                                <View>
                                    <Text style={[styles.itemText, { color: theme.text }]}>{item.name}</Text>
                                    <Text style={styles.itemSubtext}>{item.muscleGroup} • {item.equipment}</Text>
                                </View>
                                <FontAwesome name="plus" size={16} color={theme.tint} />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '70%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    item: {
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemSubtext: {
        fontSize: 12,
        color: '#888',
    },
});
