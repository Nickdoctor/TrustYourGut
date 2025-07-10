import { Link, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';
import {
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function HomeScreen() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const listOfWelcomeMessages = [
    'Welcome to Trust Your Gut',
    'Hello, Food Explorer!',
    'Greetings, Health Enthusiast!',
    'Hi there, Wellness Seeker!',
    'Welcome, Nutrition Navigator!',
    'Hello, Food Detective!',
    'Greetings, Gut Guardian!',
    'Hi, Foodie Friend!',
    'Welcome, Health Hero!',
    'Hello, Wellness Warrior!',
  ];
  const [welcomeIndex, setWelcomeIndex] = useState<number>(0);
  const [numOfLogEntries, setNumOfLogEntries] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const [scores, setScores] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'1w' | '1m' | '3m'>('1w');


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchChartData();
    setRefreshing(false);
  };

  const fetchUserData = async () => {
    setLoading(true);
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError?.message || 'No session');
      return;
    }

    const userId = session.user.id;

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', userId)
      .single();

    const { count, error: countError } = await supabase
      .from('food_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) console.error('Name fetch error:', error.message);
    else setFirstName(data.first_name);

    if (countError) console.error('Log count error:', countError.message);
    else setNumOfLogEntries(count || 0);

    setLoading(false);
  };

  const fetchChartData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;
    const userId = session.user.id;

    const { data: scoreData, error } = await supabase
      .from('food_entries')
      .select('created_at, score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Chart data error:', error.message);
      return;
    }

    const groups: Record<string, number[]> = {};
    scoreData?.forEach(entry => {
      const date = new Date(entry.created_at);
      const key = `${date.getMonth() + 1}/${date.getDate()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(Number(entry.score));
    });

    const today = new Date();
    const daysBack = timeRange === '1w' ? 7 : timeRange === '1m' ? 30 : 90;
    const selectedDays: string[] = [];

    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      selectedDays.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }

    const averagedScores = selectedDays.map(day => {
      const scoresForDay = groups[day] || [];
      if (scoresForDay.length === 0) return 0;
      const sum = scoresForDay.reduce((a, b) => a + b, 0);
      return sum / scoresForDay.length;
    });
    
    const reducedLabels = selectedDays.map((label, index) => {
      if (timeRange === '1w') return label;
      if (timeRange === '1m') return index % 5 === 0 ? label : ''; // Show every 5th day
      if (timeRange === '3m') return index % 15 === 0 ? label : ''; // Show every 15th day
      return label;
    });

    //setLabels(selectedDays);
    setLabels(reducedLabels);
    setScores(averagedScores);
  };

  useEffect(() => {
    fetchUserData(); // Runs only once on mount
    setWelcomeIndex(Math.floor(Math.random() * listOfWelcomeMessages.length)); // Randomly select a welcome message, if same message appears, add this line to refresh section. 
  }, []);

  useEffect(() => {
    fetchChartData(); // Runs every time timeRange changes
  }, [timeRange]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Stack.Screen />
          <Text style={styles.welcomeText}>
            Welcome{firstName ? `, ${firstName}` : ''}!
          </Text>
          <Text style={styles.text}>{listOfWelcomeMessages[welcomeIndex]}</Text>
          <Text style={styles.text}>
            {numOfLogEntries === 0
              ? 'You have no entries! To get started, head over to the food entry tab to log your first meal.'
              : `You have logged ${numOfLogEntries} ${numOfLogEntries === 1 ? 'time' : 'times'
              }! Keep it going!`}
          </Text>
          <Text style={styles.text}>Average Gut Feeling:</Text>

          {scores.length === 0 ? (
            <Text style={styles.text}>No gut scores to show yet.</Text>
          ) : (
            <LineChart
              data={{
                labels,
                datasets: [{ data: scores }],
              }}
              width={screenWidth - 32}
              height={220}
              yAxisSuffix="/5"
              fromZero
              chartConfig={{
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: () => '#333',
                propsForDots: {
                  r: '2',
                  strokeWidth: '2',
                  stroke: '#1E90FF',
                },
              }}
              style={styles.chart}
            />
          )}
          <View style={styles.timeRangeButtons}>
            {['1w', '1m', '3m'].map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => setTimeRange(range as '1w' | '1m' | '3m')}
                style={[
                  styles.timeButton,
                  timeRange === range && styles.timeButtonActive,
                ]}
              >
                <Text style={styles.timeButtonText}>
                  {range.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>


        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },

  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#444',
  },

  timeButtonActive: {
    backgroundColor: '#1E90FF',
  },

  timeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

});
