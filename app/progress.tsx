import Colors from '@/constants/Colors';
import { ProgressLog } from '@/constants/types';
import { useProgress } from '@/context/ProgressContext';
import { useWorkout } from '@/context/WorkoutContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');
const tint = Colors.dark.tint;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getWorkoutStreak(workouts: any[]): number {
    if (workouts.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let current = today.getTime();
    const dayMs = 86400000;

    // Sorted newest first (already the case from context)
    const uniqueDays = [...new Set(workouts.map(w => {
        const d = new Date(w.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }))].sort((a, b) => b - a);

    for (const day of uniqueDays) {
        if (day >= current - dayMs && day <= current) {
            streak++;
            current = day - dayMs;
        } else {
            break;
        }
    }
    return streak;
}

function getTopExercises(workouts: any[]) {
    // Count frequency of exercises across all workouts
    const freq: Record<string, { count: number; bestSet: { weight: string; reps: string } }> = {};
    workouts.forEach(w => {
        w.exercises?.forEach((ex: any) => {
            if (!freq[ex.name]) freq[ex.name] = { count: 0, bestSet: { weight: '0', reps: '0' } };
            freq[ex.name].count++;
            ex.sets?.forEach((set: any) => {
                if (set.completed) {
                    const w = parseFloat(set.weight) || 0;
                    const r = parseInt(set.reps, 10) || 0;
                    const bw = parseFloat(freq[ex.name].bestSet.weight) || 0;
                    const br = parseInt(freq[ex.name].bestSet.reps, 10) || 0;
                    if (w > bw || (w === bw && r > br)) {
                        freq[ex.name].bestSet = { weight: set.weight, reps: set.reps };
                    }
                }
            });
        });
    });
    return Object.entries(freq)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 4)
        .map(([name, data]) => ({ name, ...data }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProgressScreen() {
    const { progressLogs, saveProgressLog } = useProgress();
    const { workouts } = useWorkout();

    const [isLogging, setIsLogging] = useState(false);
    const [weight, setWeight] = useState('');
    const [photoUri, setPhotoUri] = useState<string | undefined>();

    // ── Computed stats from workout history (no manual input needed) ──────────
    const totalWorkouts = workouts.length;
    const streak = useMemo(() => getWorkoutStreak(workouts), [workouts]);
    const topExercises = useMemo(() => getTopExercises(workouts), [workouts]);

    const daysActive = useMemo(() => {
        if (workouts.length === 0) return 0;
        const oldest = new Date(workouts[workouts.length - 1].date);
        return Math.max(1, Math.ceil((Date.now() - oldest.getTime()) / 86400000));
    }, [workouts]);

    // Weight chart
    const chartData = useMemo(() => {
        const logs = progressLogs.filter(l => l.weight).slice(0, 7).reverse();
        if (logs.length < 2) return null;
        return {
            labels: logs.map(l => `${l.date.getMonth() + 1}/${l.date.getDate()}`),
            datasets: [{ data: logs.map(l => parseFloat(l.weight)) }],
        };
    }, [progressLogs]);

    const weightDelta = useMemo(() => {
        const logs = progressLogs.filter(l => l.weight);
        if (logs.length < 2) return null;
        const first = parseFloat(logs[logs.length - 1].weight);
        const last = parseFloat(logs[0].weight);
        return +(last - first).toFixed(1);
    }, [progressLogs]);

    const photos = progressLogs.filter(l => l.photoUri);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [3, 4], quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]) setPhotoUri(result.assets[0].uri);
    };

    const handleSaveLog = async () => {
        if (!weight && !photoUri) {
            Alert.alert('Nothing to save', 'Enter your weight or add a photo to log your progress.');
            return;
        }
        const log: ProgressLog = {
            id: Date.now().toString(), date: new Date(),
            weight, measurements: {}, photoUri,
        };
        await saveProgressLog(log);
        setIsLogging(false);
        setWeight('');
        setPhotoUri(undefined);
        Alert.alert('Logged! 🎉', 'Your check-in has been saved.');
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={s.container}>
            <Stack.Screen options={{
                title: 'My Progress',
                headerStyle: { backgroundColor: Colors.dark.background },
                headerTintColor: Colors.dark.text,
            }} />

            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

                {/* ── Fitness Overview Hero Card ── */}
                <LinearGradient
                    colors={['rgba(127,87,242,0.35)', 'rgba(127,87,242,0.07)']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={s.heroCard}
                >
                    <Text style={s.heroTitle}>🔥 Your Fitness Journey</Text>
                    {totalWorkouts === 0 ? (
                        <Text style={s.heroEmpty}>Log your first workout in the Track tab to see your stats here!</Text>
                    ) : (
                        <View style={s.heroStats}>
                            <View style={s.heroStat}>
                                <Text style={s.heroStatValue}>{totalWorkouts}</Text>
                                <Text style={s.heroStatLabel}>Workouts</Text>
                            </View>
                            <View style={s.heroDivider} />
                            <View style={s.heroStat}>
                                <Text style={s.heroStatValue}>{streak} 🔥</Text>
                                <Text style={s.heroStatLabel}>Day Streak</Text>
                            </View>
                            <View style={s.heroDivider} />
                            <View style={s.heroStat}>
                                <Text style={s.heroStatValue}>{daysActive}</Text>
                                <Text style={s.heroStatLabel}>Days Active</Text>
                            </View>
                        </View>
                    )}
                </LinearGradient>

                {/* ── Strength at a Glance ── */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>💪 Strength at a Glance</Text>
                    <Text style={s.sectionSubtitle}>Automatically tracked from your workouts — no entry needed!</Text>
                    {topExercises.length === 0 ? (
                        <View style={s.emptyCard}>
                            <Text style={s.emptyIcon}>🏋️</Text>
                            <Text style={s.emptyTitle}>No workouts yet</Text>
                            <Text style={s.emptyBody}>Log a workout and your strength data will appear here automatically.</Text>
                        </View>
                    ) : (
                        topExercises.map((ex) => {
                            const w = parseFloat(ex.bestSet.weight) || 0;
                            const r = parseInt(ex.bestSet.reps, 10) || 0;
                            const hasData = w > 0 || r > 0;
                            return (
                                <View key={ex.name} style={s.strengthRow}>
                                    <View style={s.strengthInfo}>
                                        <Text style={s.strengthName}>{ex.name}</Text>
                                        <Text style={s.strengthMeta}>
                                            {hasData
                                                ? `Best set: ${w > 0 ? `${w} kg × ` : ''}${r} reps`
                                                : 'Log a set to track progress'}
                                        </Text>
                                    </View>
                                    <View style={[s.strengthBadge, { backgroundColor: tint + '22' }]}>
                                        <Text style={[s.strengthBadgeText, { color: tint }]}>×{ex.count}</Text>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                {/* ── Today's Check-In ── */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>⚖️ Body Weight Check-In</Text>
                    <Text style={s.sectionSubtitle}>Takes 10 seconds — just your weight and an optional photo.</Text>

                    {!isLogging ? (
                        <TouchableOpacity style={s.logBtn} onPress={() => setIsLogging(true)}>
                            <FontAwesome name="plus" size={16} color="#fff" />
                            <Text style={s.logBtnText}>Log Today's Weight</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={s.formCard}>
                            <Text style={s.formLabel}>Your weight (kg or lbs)</Text>
                            <TextInput
                                style={s.formInput}
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="decimal-pad"
                                placeholder="e.g. 75"
                                placeholderTextColor="#555"
                                returnKeyType="done"
                            />

                            <Text style={[s.formLabel, { marginTop: 16 }]}>Progress photo (optional)</Text>
                            <TouchableOpacity style={s.photoBtn} onPress={handlePickImage}>
                                {photoUri ? (
                                    <Image source={{ uri: photoUri }} style={s.photoPreview} />
                                ) : (
                                    <View style={s.photoPlaceholder}>
                                        <FontAwesome name="camera" size={28} color={tint} />
                                        <Text style={s.photoPlaceholderText}>Tap to add photo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <View style={s.formActions}>
                                <TouchableOpacity style={s.cancelBtn} onPress={() => { setIsLogging(false); setWeight(''); setPhotoUri(undefined); }}>
                                    <Text style={s.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.saveBtn} onPress={handleSaveLog}>
                                    <Text style={s.saveBtnText}>Save Check-In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* ── Weight Trend Chart ── */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>📈 Weight Over Time</Text>
                    {chartData ? (
                        <>
                            {weightDelta !== null && (
                                <View style={[s.deltaChip, { backgroundColor: weightDelta <= 0 ? '#27AE6022' : '#E5393522' }]}>
                                    <Text style={[s.deltaText, { color: weightDelta <= 0 ? '#4CAF50' : '#E53935' }]}>
                                        {weightDelta <= 0 ? '▼' : '▲'} {Math.abs(weightDelta)} kg since you started
                                        {weightDelta <= 0 ? ' — great progress! 🎉' : ' — keep tracking!'}
                                    </Text>
                                </View>
                            )}
                            <LinearGradient
                                colors={['rgba(127,87,242,0.12)', 'rgba(0,0,0,0)']}
                                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                                style={s.chartWrapper}
                            >
                                <LineChart
                                    data={chartData}
                                    width={width - 40}
                                    height={200}
                                    yAxisSuffix=""
                                    yAxisLabel=""
                                    chartConfig={{
                                        backgroundColor: 'transparent',
                                        backgroundGradientFrom: 'transparent',
                                        backgroundGradientFromOpacity: 0,
                                        backgroundGradientTo: 'transparent',
                                        backgroundGradientToOpacity: 0,
                                        decimalPlaces: 1,
                                        color: (o = 1) => `rgba(127,87,242,${o})`,
                                        labelColor: (o = 1) => `rgba(200,200,200,${o})`,
                                        propsForDots: { r: '5', strokeWidth: '2', stroke: tint },
                                    }}
                                    bezier
                                    style={{ borderRadius: 12 }}
                                    transparent
                                />
                            </LinearGradient>
                        </>
                    ) : (
                        <View style={s.emptyCard}>
                            <Text style={s.emptyIcon}>📊</Text>
                            <Text style={s.emptyTitle}>Log 2+ check-ins to see your trend</Text>
                            <Text style={s.emptyBody}>Consistency is key! Check in once a week to see your progress chart.</Text>
                        </View>
                    )}
                </View>

                {/* ── Progress Photos ── */}
                {photos.length > 0 && (
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>📸 Progress Photos</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                            {photos.map(log => (
                                <View key={log.id} style={s.galleryItem}>
                                    <Image source={{ uri: log.photoUri }} style={s.galleryImg} />
                                    <Text style={s.galleryDate}>{log.date.toLocaleDateString()}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.dark.background },
    scroll: { paddingVertical: 20, paddingHorizontal: 20 },

    // Hero
    heroCard: { borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(127,87,242,0.25)' },
    heroTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    heroEmpty: { color: '#888', fontSize: 14, lineHeight: 20 },
    heroStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
    heroStat: { alignItems: 'center' },
    heroStatValue: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
    heroStatLabel: { color: '#aaa', fontSize: 12, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    heroDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)' },

    // Section
    section: { marginBottom: 28 },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    sectionSubtitle: { color: '#666', fontSize: 13, marginBottom: 14 },

    // Empty state
    emptyCard: { backgroundColor: Colors.dark.cardBackground, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.borderColor },
    emptyIcon: { fontSize: 36, marginBottom: 10 },
    emptyTitle: { color: '#ccc', fontSize: 15, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
    emptyBody: { color: '#666', fontSize: 13, textAlign: 'center', lineHeight: 18 },

    // Strength rows
    strengthRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.cardBackground, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.dark.borderColor },
    strengthInfo: { flex: 1 },
    strengthName: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 3 },
    strengthMeta: { color: '#888', fontSize: 13 },
    strengthBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    strengthBadgeText: { fontWeight: 'bold', fontSize: 13 },

    // Log button
    logBtn: { backgroundColor: tint, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    logBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // Form
    formCard: { backgroundColor: Colors.dark.cardBackground, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.dark.borderColor },
    formLabel: { color: tint, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    formInput: { backgroundColor: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 22, fontWeight: 'bold', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', textAlign: 'center' },
    photoBtn: { height: 140, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.dark.borderColor, borderStyle: 'dashed' },
    photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
    photoPlaceholderText: { color: '#555', fontSize: 14 },
    formActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)' },
    cancelBtnText: { color: '#888', fontWeight: 'bold', fontSize: 15 },
    saveBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: tint },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

    // Delta chip
    deltaChip: { borderRadius: 10, padding: 10, marginBottom: 12 },
    deltaText: { fontSize: 14, fontWeight: '600' },

    // Chart
    chartWrapper: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(127,87,242,0.2)', overflow: 'hidden', alignItems: 'center' },

    // Gallery
    galleryItem: { width: 130 },
    galleryImg: { width: 130, height: 170, borderRadius: 12, resizeMode: 'cover' },
    galleryDate: { color: '#666', fontSize: 11, marginTop: 6, textAlign: 'center' },
});
