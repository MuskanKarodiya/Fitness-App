import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, Dimensions, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');
const TIMER_SIZE = width * 0.7;

type TimerMode = 'Stopwatch' | 'Countdown' | 'Tabata' | 'EMOM';

interface TimerSettings {
    countdownStart: number;
    tabataWork: number;
    tabataRest: number;
    tabataRounds: number;
    emomTime: number;
    emomRounds: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
    countdownStart: 60,
    tabataWork: 20,
    tabataRest: 10,
    tabataRounds: 8,
    emomTime: 60,
    emomRounds: 10,
};

// Configure notification handler — show alerts, sounds, and badges when app is foregrounded too
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export default function TimerScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [mode, setMode] = useState<TimerMode>('Stopwatch');
    const [isRunning, setIsRunning] = useState(false);
    const [currentTime, setCurrentTime] = useState(0); // in seconds
    const [currentRound, setCurrentRound] = useState(1);
    const [intervalType, setIntervalType] = useState<'Work' | 'Rest' | 'Idle'>('Idle');

    const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
    const [configModalVisible, setConfigModalVisible] = useState(false);

    // Temp settings for modal (stored as strings to allow empty input during typing)
    const [tempSettings, setTempSettings] = useState<Record<keyof TimerSettings, string>>({
        countdownStart: DEFAULT_SETTINGS.countdownStart.toString(),
        tabataWork: DEFAULT_SETTINGS.tabataWork.toString(),
        tabataRest: DEFAULT_SETTINGS.tabataRest.toString(),
        tabataRounds: DEFAULT_SETTINGS.tabataRounds.toString(),
        emomTime: DEFAULT_SETTINGS.emomTime.toString(),
        emomRounds: DEFAULT_SETTINGS.emomRounds.toString(),
    });

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // Store the absolute end time so we can resync after screen lock/unlock
    const endTimeRef = useRef<number | null>(null);
    // Store pending notification ID so we can cancel it
    const notificationIdRef = useRef<string | null>(null);

    // ──────────────────────────────────────────
    // Permissions on mount
    // ──────────────────────────────────────────
    useEffect(() => {
        (async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Notification Permission',
                    'Enable notifications so you get alerted when your timer finishes — even when the screen is locked.',
                );
            }
        })();
    }, []);

    // ──────────────────────────────────────────
    // AppState listener — resync after screen lock/unlock
    // ──────────────────────────────────────────
    useEffect(() => {
        const sub = AppState.addEventListener('change', handleAppStateChange);
        return () => sub.remove();
    }, [isRunning]);

    const handleAppStateChange = (nextState: AppStateStatus) => {
        if (nextState === 'active' && isRunning && endTimeRef.current) {
            // Recalculate remaining time from the absolute end timestamp
            const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
            setCurrentTime(remaining);
            if (remaining === 0) {
                handlePhaseTransitionRef.current();
            }
        }
    };

    // ──────────────────────────────────────────
    // Notification helpers
    // ──────────────────────────────────────────
    const scheduleEndNotification = async (seconds: number, title: string, body: string) => {
        await cancelEndNotification();
        if (seconds <= 0) return;
        const id = await Notifications.scheduleNotificationAsync({
            content: { title, body, sound: true },
            trigger: { seconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
        });
        notificationIdRef.current = id;
    };

    const cancelEndNotification = async () => {
        if (notificationIdRef.current) {
            await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
            notificationIdRef.current = null;
        }
    };

    // ──────────────────────────────────────────
    // Initialize Timer based on mode
    // ──────────────────────────────────────────
    useEffect(() => {
        resetTimer(mode);
    }, [mode, settings]);

    const resetTimer = (newMode = mode) => {
        setIsRunning(false);
        endTimeRef.current = null;
        cancelEndNotification();
        if (timerRef.current) clearInterval(timerRef.current);

        if (newMode === 'Stopwatch') {
            setCurrentTime(0);
            setIntervalType('Idle');
            setCurrentRound(1);
        } else if (newMode === 'Countdown') {
            setCurrentTime(settings.countdownStart);
            setIntervalType('Idle');
            setCurrentRound(1);
        } else if (newMode === 'Tabata') {
            setCurrentTime(settings.tabataWork);
            setIntervalType('Work');
            setCurrentRound(1);
        } else if (newMode === 'EMOM') {
            setCurrentTime(settings.emomTime);
            setIntervalType('Work');
            setCurrentRound(1);
        }
    };

    // ──────────────────────────────────────────
    // Main Timer Tick Logic
    // ──────────────────────────────────────────
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setCurrentTime((prevTime) => {
                    if (mode === 'Stopwatch') return prevTime + 1;

                    const nextTime = prevTime - 1;
                    if (nextTime <= 0) {
                        handlePhaseTransitionRef.current();
                        return 0;
                    }
                    return nextTime;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, mode, currentRound, intervalType, settings]);

    // Use a ref to avoid stale closure inside setInterval callback
    const handlePhaseTransitionRef = useRef(() => { });

    const handlePhaseTransition = () => {
        cancelEndNotification();
        if (mode === 'Countdown') {
            setIsRunning(false);
            endTimeRef.current = null;
            Alert.alert("⏱ Time's Up!", "Your countdown is done. Great work!");
            resetTimer();
        } else if (mode === 'Tabata') {
            if (intervalType === 'Work') {
                setCurrentTime(settings.tabataRest);
                setIntervalType('Rest');
                endTimeRef.current = Date.now() + settings.tabataRest * 1000;
                scheduleEndNotification(settings.tabataRest, '🔥 Rest Over!', 'Get ready to work!');
            } else {
                if (currentRound >= settings.tabataRounds) {
                    setIsRunning(false);
                    endTimeRef.current = null;
                    Alert.alert('🎉 Tabata Complete!', `You finished all ${settings.tabataRounds} rounds. Awesome!`);
                    resetTimer();
                } else {
                    setCurrentRound(prev => prev + 1);
                    setCurrentTime(settings.tabataWork);
                    setIntervalType('Work');
                    endTimeRef.current = Date.now() + settings.tabataWork * 1000;
                    scheduleEndNotification(settings.tabataWork, '🔥 Work Time!', 'Round complete — push through rest!');
                }
            }
        } else if (mode === 'EMOM') {
            if (currentRound >= settings.emomRounds) {
                setIsRunning(false);
                endTimeRef.current = null;
                Alert.alert('🎉 EMOM Complete!', `You finished ${settings.emomRounds} rounds. Nice work!`);
                resetTimer();
            } else {
                setCurrentRound(prev => prev + 1);
                setCurrentTime(settings.emomTime);
                endTimeRef.current = Date.now() + settings.emomTime * 1000;
                scheduleEndNotification(settings.emomTime, '⏱ EMOM Minute Done!', 'Start your next exercise!');
            }
        }
    };

    // Keep ref updated on every render
    handlePhaseTransitionRef.current = handlePhaseTransition;

    // ──────────────────────────────────────────
    // Toggle play/pause
    // ──────────────────────────────────────────
    const toggleTimer = async () => {
        if (!isRunning) {
            // Starting
            if (mode !== 'Stopwatch') {
                endTimeRef.current = Date.now() + currentTime * 1000;
                // Schedule notification for this phase end
                let title = '⏱ Timer Done!';
                let body = 'Your timer has finished.';
                if (mode === 'Countdown') { title = "⏱ Time's Up!"; body = 'Countdown finished. Great work!'; }
                else if (mode === 'Tabata') { title = intervalType === 'Work' ? '🔥 Rest Time!' : '💪 Work Time!'; body = 'Phase complete!'; }
                else if (mode === 'EMOM') { title = '⏱ Minute Done!'; body = 'Start your next exercise!'; }
                await scheduleEndNotification(currentTime, title, body);
            }
            setIsRunning(true);
        } else {
            // Pausing
            await cancelEndNotification();
            endTimeRef.current = null;
            setIsRunning(false);
        }
    };

    // Formatting Time
    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const openConfigModal = () => {
        setTempSettings({
            countdownStart: settings.countdownStart.toString(),
            tabataWork: settings.tabataWork.toString(),
            tabataRest: settings.tabataRest.toString(),
            tabataRounds: settings.tabataRounds.toString(),
            emomTime: settings.emomTime.toString(),
            emomRounds: settings.emomRounds.toString(),
        });
        setConfigModalVisible(true);
    };

    const saveConfig = () => {
        setSettings({
            countdownStart: parseInt(tempSettings.countdownStart, 10) || 60,
            tabataWork: parseInt(tempSettings.tabataWork, 10) || 20,
            tabataRest: parseInt(tempSettings.tabataRest, 10) || 10,
            tabataRounds: parseInt(tempSettings.tabataRounds, 10) || 8,
            emomTime: parseInt(tempSettings.emomTime, 10) || 60,
            emomRounds: parseInt(tempSettings.emomRounds, 10) || 10,
        });
        setConfigModalVisible(false);
    };

    const handleTempSettingChange = (key: keyof TimerSettings, val: string) => {
        const cleaned = val.replace(/[^0-9]/g, '');
        setTempSettings(prev => ({ ...prev, [key]: cleaned }));
    };

    // Subtext for timer
    let subText = '';
    if (mode === 'Tabata' || mode === 'EMOM') {
        subText = `Round ${currentRound}/${mode === 'Tabata' ? settings.tabataRounds : settings.emomRounds} — ${intervalType === 'Rest' ? 'REST' : 'WORK'}`;
    } else {
        subText = mode.toUpperCase();
    }

    const timerColor = intervalType === 'Rest' ? '#4CAF50' : theme.text;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Timer</Text>

                {/* Mode Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeSelector}>
                    {(['Stopwatch', 'Countdown', 'Tabata', 'EMOM'] as TimerMode[]).map((m) => (
                        <TouchableOpacity
                            key={m}
                            style={[
                                styles.modeTab,
                                mode === m && { backgroundColor: theme.tint, borderColor: theme.tint }
                            ]}
                            onPress={() => {
                                setMode(m);
                                resetTimer(m);
                            }}
                        >
                            <Text style={[styles.modeTabText, mode === m && { color: '#fff' }]}>{m}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Timer Display */}
            <View style={[styles.timerWrapper, { borderColor: isRunning ? theme.tint : theme.borderColor }]}>
                <Text style={[styles.timerText, { color: timerColor }]}>{formatTime(currentTime)}</Text>
                <Text style={styles.subTimerText}>{subText}</Text>
                {isRunning && (
                    <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                )}
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity style={[styles.controlButton, { backgroundColor: theme.cardBackground }]} onPress={() => resetTimer()}>
                    <FontAwesome name="refresh" size={24} color={theme.text} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.playButton, { backgroundColor: isRunning ? '#E53935' : theme.tint }]} onPress={toggleTimer}>
                    <FontAwesome name={isRunning ? "pause" : "play"} size={32} color="#fff" style={{ marginLeft: isRunning ? 0 : 5 }} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: theme.cardBackground, opacity: mode === 'Stopwatch' ? 0.3 : 1 }]}
                    onPress={mode === 'Stopwatch' ? undefined : openConfigModal}
                    disabled={mode === 'Stopwatch'}
                >
                    <FontAwesome name="cog" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            {/* Templates Section */}
            <View style={styles.recentSection}>
                <Text style={[styles.recentTitle, { color: theme.text }]}>Quick Templates</Text>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    {[
                        { label: '5 Min Countdown', icon: 'clock-o', onPress: () => { setMode('Countdown'); setSettings({ ...settings, countdownStart: 300 }); } },
                        { label: '3 Min Rest Timer', icon: 'clock-o', onPress: () => { setMode('Countdown'); setSettings({ ...settings, countdownStart: 180 }); } },
                        { label: 'Classic Tabata (20s / 10s × 8)', icon: 'bolt', onPress: () => { setMode('Tabata'); setSettings({ ...settings, tabataWork: 20, tabataRest: 10, tabataRounds: 8 }); } },
                        { label: '10 Min EMOM', icon: 'repeat', onPress: () => { setMode('EMOM'); setSettings({ ...settings, emomTime: 60, emomRounds: 10 }); } },
                    ].map(({ label, icon, onPress }) => (
                        <TouchableOpacity
                            key={label}
                            style={[styles.recentItem, { backgroundColor: theme.cardBackground }]}
                            onPress={onPress}
                        >
                            <View style={[styles.templateIconBox, { backgroundColor: theme.tint + '22' }]}>
                                <FontAwesome name={icon as any} size={18} color={theme.tint} />
                            </View>
                            <Text style={[styles.recentItemText, { color: theme.text }]}>{label}</Text>
                            <FontAwesome name="chevron-right" size={14} color="#555" />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Configuration Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={configModalVisible}
                onRequestClose={() => setConfigModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Configure {mode}</Text>

                        {mode === 'Countdown' && (
                            <View style={styles.inputRow}>
                                <Text style={[styles.inputLabel, { color: theme.text }]}>Start Time (sec):</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, borderColor: theme.borderColor }]}
                                    keyboardType="numeric"
                                    value={tempSettings.countdownStart}
                                    onChangeText={(val) => handleTempSettingChange('countdownStart', val)}
                                />
                            </View>
                        )}

                        {mode === 'Tabata' && (
                            <>
                                <View style={styles.inputRow}>
                                    <Text style={[styles.inputLabel, { color: theme.text }]}>Work Time (sec):</Text>
                                    <TextInput
                                        style={[styles.input, { color: theme.text, borderColor: theme.borderColor }]}
                                        keyboardType="numeric"
                                        value={tempSettings.tabataWork}
                                        onChangeText={(val) => handleTempSettingChange('tabataWork', val)}
                                    />
                                </View>
                                <View style={styles.inputRow}>
                                    <Text style={[styles.inputLabel, { color: theme.text }]}>Rest Time (sec):</Text>
                                    <TextInput
                                        style={[styles.input, { color: theme.text, borderColor: theme.borderColor }]}
                                        keyboardType="numeric"
                                        value={tempSettings.tabataRest}
                                        onChangeText={(val) => handleTempSettingChange('tabataRest', val)}
                                    />
                                </View>
                                <View style={styles.inputRow}>
                                    <Text style={[styles.inputLabel, { color: theme.text }]}>Rounds:</Text>
                                    <TextInput
                                        style={[styles.input, { color: theme.text, borderColor: theme.borderColor }]}
                                        keyboardType="numeric"
                                        value={tempSettings.tabataRounds}
                                        onChangeText={(val) => handleTempSettingChange('tabataRounds', val)}
                                    />
                                </View>
                            </>
                        )}

                        {mode === 'EMOM' && (
                            <>
                                <View style={styles.inputRow}>
                                    <Text style={[styles.inputLabel, { color: theme.text }]}>Minute Length (sec):</Text>
                                    <TextInput
                                        style={[styles.input, { color: theme.text, borderColor: theme.borderColor }]}
                                        keyboardType="numeric"
                                        value={tempSettings.emomTime}
                                        onChangeText={(val) => handleTempSettingChange('emomTime', val)}
                                    />
                                </View>
                                <View style={styles.inputRow}>
                                    <Text style={[styles.inputLabel, { color: theme.text }]}>Total Rounds:</Text>
                                    <TextInput
                                        style={[styles.input, { color: theme.text, borderColor: theme.borderColor }]}
                                        keyboardType="numeric"
                                        value={tempSettings.emomRounds}
                                        onChangeText={(val) => handleTempSettingChange('emomRounds', val)}
                                    />
                                </View>
                            </>
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setConfigModalVisible(false)}>
                                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.tint }]} onPress={saveConfig}>
                                <Text style={styles.modalButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 30,
        height: 100,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modeSelector: {
        flexDirection: 'row',
    },
    modeTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#555',
        marginRight: 10,
        height: 40,
        justifyContent: 'center',
    },
    modeTabText: {
        color: '#888',
        fontWeight: 'bold',
    },
    timerWrapper: {
        width: TIMER_SIZE,
        height: TIMER_SIZE,
        borderRadius: TIMER_SIZE / 2,
        borderWidth: 8,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    timerText: {
        fontSize: 65,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
    },
    subTimerText: {
        fontSize: 16,
        color: '#888',
        textTransform: 'uppercase',
        marginTop: 5,
        fontWeight: 'bold',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E53935',
    },
    liveText: {
        color: '#E53935',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginBottom: 40,
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    controlButton: {
        width: 55,
        height: 55,
        borderRadius: 27.5,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    recentSection: {
        flex: 1,
        marginTop: 10,
    },
    recentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
        gap: 12,
    },
    templateIconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recentItemText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        padding: 24,
        borderRadius: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        flex: 1,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        width: 80,
        textAlign: 'center',
        fontSize: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    modalButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginLeft: 10,
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalButtonTextCancel: {
        color: '#888',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
