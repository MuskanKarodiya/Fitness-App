import DashboardWidget from '@/components/DashboardWidget';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { EXERCISE_LIBRARY } from '@/constants/ExerciseLibrary';
import { useWorkout } from '@/context/WorkoutContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const { workouts } = useWorkout();

  const lastWorkout = workouts.length > 0 ? workouts[0] : null;
  const daysAgo = lastWorkout ? Math.floor((new Date().getTime() - new Date(lastWorkout.date).getTime()) / (1000 * 3600 * 24)) : null;
  let lastWorkoutShort = 'New';
  if (lastWorkout) {
    lastWorkoutShort = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const workoutsThisMonth = workouts.filter(w => {
    const d = new Date(w.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Your plan is</Text>
          <Text style={styles.subtitle}>almost done</Text>
        </View>
        <FontAwesome name="bell" size={20} color={theme.text} />
      </View>

      <View style={styles.gridContainer}>
        <DashboardWidget
          title="Workout Status"
          value={lastWorkoutShort}
          subtitle={lastWorkout ? "Last completed" : "Tap to start track"}
          icon="trophy"
          size="full"
          variant="dark"
          visual="progress"
          onPress={() => router.push('/(tabs)/track')}
        />

        <View style={styles.row}>
          <DashboardWidget
            title="Workouts"
            value={`${workoutsThisMonth}`}
            subtitle="Completed this month"
            icon="bar-chart"
            size="half"
            variant="highlight"
            visual="bars"
            onPress={() => router.push('/(tabs)/history')}
          />

          <DashboardWidget
            title="Timer"
            value="Ready"
            subtitle="Next session"
            icon="clock-o"
            size="half"
            variant="dark"
            visual="line"
            onPress={() => router.push('/(tabs)/timer')}
          />
        </View>

        <DashboardWidget
          title="Personal Progress"
          value="Track"
          subtitle="Weight, 1RM & Photos"
          icon="line-chart"
          size="full"
          variant="dark"
          visual="line"
          onPress={() => router.push('/progress')}
        />

        <DashboardWidget
          title="Exercise Library"
          value={`${EXERCISE_LIBRARY.length} items`}
          subtitle="Movements to explore"
          icon="book"
          size="full"
          variant="dark"
          visual="bars"
          onPress={() => router.push('/(tabs)/exercises')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  header: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerTextContainer: {
    backgroundColor: 'transparent',
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'normal',
    color: '#888',
  },
  gridContainer: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  row: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  }
});
