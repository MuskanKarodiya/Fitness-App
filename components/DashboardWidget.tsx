import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Text, View } from './Themed';
import { useColorScheme } from './useColorScheme';

interface DashboardWidgetProps {
    title: string;
    value: string;
    subtitle: string;
    icon?: React.ComponentProps<typeof FontAwesome>['name'];
    onPress: () => void;
    size?: 'full' | 'half';
    variant?: 'dark' | 'highlight';
    visual?: 'progress' | 'bars' | 'line' | 'none';
}

export default function DashboardWidget({
    title,
    value,
    subtitle,
    icon,
    onPress,
    size = 'full',
    variant = 'dark',
    visual = 'none'
}: DashboardWidgetProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Explicit highlight color matching image style
    const highlightBg = '#54C5A0';

    const isHighlight = variant === 'highlight';

    const containerStyle: ViewStyle = {
        backgroundColor: isHighlight ? highlightBg : theme.cardBackground,
        width: size === 'half' ? '48%' : '100%',
        padding: 18,
        borderRadius: 20,
        marginBottom: 16,
    };

    const textColor = isHighlight ? '#000000' : theme.text;
    const subtitleColor = isHighlight ? 'rgba(0,0,0,0.6)' : '#888888';

    // Default to a bright accent color if we are in dark variant, 
    // or black if we are on the light green variant
    const accentColor = isHighlight ? 'rgba(0,0,0,0.7)' : theme.tint;
    const visualAccentColor = isHighlight ? 'rgba(0,0,0,0.5)' : theme.tint;

    const renderVisual = () => {
        if (visual === 'progress') {
            return (
                <View style={[visualStyles.visualContainer, visualStyles.progressContainer]}>
                    {Array.from({ length: 30 }).map((_, i) => (
                        <View key={i} style={[
                            visualStyles.progressLine,
                            { backgroundColor: i < 22 ? visualAccentColor : (isHighlight ? 'rgba(0,0,0,0.2)' : '#333') }
                        ]} />
                    ))}
                </View>
            );
        }
        if (visual === 'bars') {
            const heights = [40, 60, 30, 80, 50, 90, 40, 70, 55, 85, 45, 65];
            // Limit bars for half-size widgets
            const displayHeights = size === 'half' ? heights.slice(0, 8) : heights;
            return (
                <View style={[visualStyles.visualContainer, visualStyles.barsContainer]}>
                    {displayHeights.map((h, i) => (
                        <View key={i} style={[
                            visualStyles.bar,
                            { height: `${h}%`, backgroundColor: visualAccentColor, opacity: isHighlight ? 0.8 : 0.6 + (i % 3) * 0.2 }
                        ]} />
                    ))}
                </View>
            );
        }
        if (visual === 'line') {
            return (
                <View style={[visualStyles.visualContainer, visualStyles.lineContainer]}>
                    {/* Simplified line chart representation using CSS borders/positioning */}
                    <View style={visualStyles.lineSegmentWrapper}>
                        {/* Dot points */}
                        <View style={[visualStyles.lineDot, { bottom: '20%', left: '10%', backgroundColor: visualAccentColor }]} />
                        <View style={[visualStyles.lineDot, { bottom: '50%', left: '30%', backgroundColor: visualAccentColor }]} />
                        <View style={[visualStyles.lineDot, { bottom: '30%', left: '50%', backgroundColor: visualAccentColor }]} />
                        <View style={[visualStyles.lineDot, { bottom: '80%', left: '70%', backgroundColor: visualAccentColor }]} />
                        <View style={[visualStyles.lineDot, { bottom: '60%', left: '90%', backgroundColor: visualAccentColor }]} />

                        {/* Connecting lines representation */}
                        <View style={[visualStyles.svgLine, { bottom: '35%', left: '20%', transform: [{ rotate: '-45deg' }], backgroundColor: visualAccentColor }]} />
                        <View style={[visualStyles.svgLine, { bottom: '40%', left: '40%', transform: [{ rotate: '45deg' }], backgroundColor: visualAccentColor }]} />
                        <View style={[visualStyles.svgLine, { bottom: '55%', left: '60%', transform: [{ rotate: '-60deg' }], backgroundColor: visualAccentColor }]} />
                        <View style={[visualStyles.svgLine, { bottom: '70%', left: '80%', transform: [{ rotate: '30deg' }], backgroundColor: visualAccentColor }]} />
                    </View>
                </View>
            );
        }
        return null;
    }

    return (
        <TouchableOpacity onPress={onPress} style={containerStyle} activeOpacity={0.8}>
            <View style={[styles.header, { backgroundColor: 'transparent' }]}>
                <View style={{ backgroundColor: 'transparent' }}>
                    <Text style={[styles.value, { color: textColor }]}>{value}</Text>
                    <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                </View>
                {icon && <FontAwesome name={icon} size={24} color={accentColor} />}
            </View>

            <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>

            {visual !== 'none' && renderVisual()}

        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    value: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
        marginBottom: 10,
    },
});

const visualStyles = StyleSheet.create({
    visualContainer: {
        height: 50,
        backgroundColor: 'transparent',
        marginTop: 10,
        width: '100%',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    progressLine: {
        flex: 1,
        height: '100%',
        marginHorizontal: 1,
        borderRadius: 2,
    },
    barsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    bar: {
        flex: 1,
        marginHorizontal: 2,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    lineContainer: {
        position: 'relative',
        justifyContent: 'flex-end',
    },
    lineSegmentWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: 'transparent',
    },
    lineDot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        zIndex: 2,
    },
    svgLine: {
        position: 'absolute',
        width: '24%',
        height: 2,
        zIndex: 1,
    }
});
