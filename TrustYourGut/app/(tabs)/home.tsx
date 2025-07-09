import { Link, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
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
  const randomIndex = Math.floor(Math.random() * listOfWelcomeMessages.length);
  const [numOfLogEntries, setNumOfLogEntries] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const [scores, setScores] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const fetchUserData = async () => {
    setLoading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError);
      return;
    }
    if (!session) {
      console.warn('No active session found');
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

    const { data: scoreData, error: scoreDataError } = await supabase
      .from('food_entries')
      .select('created_at, score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching first name:', error.message);
    } else {
      setFirstName(data.first_name);
    }

    if (countError) {
      console.error('Error fetching count:', countError.message);
    } else if (count === null || count === undefined) {
      setNumOfLogEntries(0);
    } else {
      setNumOfLogEntries(count);
      console.log(scoreData);
    }

    if (scoreData && scoreData.length > 0) {
      // Group entries by date string: "MM/DD"
      const groups: Record<string, number[]> = {}; //String keys (Date) to Score value Array(Array of scores for that day.) Ex: 7/10: [1,3,5]

      scoreData.forEach(entry => {
        const date = new Date(entry.created_at);
        const key = `${date.getMonth() + 1}/${date.getDate()}`;

        if (!groups[key]) { //Create arrays if no array for this date
          groups[key] = [];
        }
        groups[key].push(Number(entry.score)); //Put score from that day into array matching the date(key)
      });

      // For the last 7 days, get all dates from today backward
      const today = new Date();
      const last7Days: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        last7Days.push(`${d.getMonth() + 1}/${d.getDate()}`);
      }

      // Calculate average scores for each of these last 7 days (or 0 if no data)
      const averagedScores = last7Days.map(day => {
        const scoresForDay = groups[day] || [];
        if (scoresForDay.length === 0) return 0;
        const sum = scoresForDay.reduce((a, b) => a + b, 0);
        return sum / scoresForDay.length;
      });

      setLabels(last7Days); //Set the arrays with the calculated data
      setScores(averagedScores);
    } else {
      setScores([]); //No data found, set the arrays to 0
      setLabels([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

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
          <Text style={styles.text}>{listOfWelcomeMessages[randomIndex]}</Text>
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
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: () => '#333',
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#1E90FF',
                },
              }}
              style={styles.chart}
            />
          )}
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
});
