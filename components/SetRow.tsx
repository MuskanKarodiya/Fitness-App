import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Set } from '@/constants/types';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface SetRowProps {
    index: number;
    set: Set;
    onUpdate: (field: keyof Set, value: string | boolean) => void;
    onRemove: () => void; // Optional: swipe or long press could call this
}

export default function SetRow({ index, set, onUpdate }: SetRowProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={styles.setRow}>
            <View style={styles.setNumberContainer}>
                <Text style={styles.setNumber}>{index + 1}</Text>
            </View>
            <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.borderColor }]}
                placeholder="kg"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={set.weight}
                onChangeText={(text) => onUpdate('weight', text)}
            />
            <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.borderColor }]}
                placeholder="Reps"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={set.reps}
                onChangeText={(text) => onUpdate('reps', text)}
            />
            <TouchableOpacity
                style={[
                    styles.checkButton,
                    { backgroundColor: set.completed ? theme.tint : theme.borderColor },
                ]}
                onPress={() => onUpdate('completed', !set.completed)}
            >
                <FontAwesome name="check" size={16} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    setNumberContainer: {
        width: 30,
        alignItems: 'center',
    },
    setNumber: {
        fontSize: 14,
        color: '#888',
    },
    input: {
        width: 70,
        height: 36,
        borderRadius: 8,
        borderWidth: 1,
        textAlign: 'center',
        fontSize: 16,
    },
    checkButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
