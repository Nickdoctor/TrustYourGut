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
  const [topFoods, setTopFoods] = useState<{ name: string; score: number }[]>([]);
  const [bottomFoods, setBottomFoods] = useState<{ name: string; score: number }[]>([]);
  const [seeMoreGood, setSeeMoreGood] = useState<boolean>(false);
  const [seeMoreBad, setSeeMoreBad] = useState<boolean>(false);
  const tagCounts: Record<string, number> = {};
  const [sortedTags, setSortedTags] = useState<{ name: string; count: number }[]>([]);
  const [seeMoreTags, setSeeMoreTags] = useState<boolean>(false);
  const [currentStreak, setCurrentStreak] = useState<number>(0);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchChartData();
    await fetchTopAndBottomFoods();
    await fetchTopTags();
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
  const fetchTopAndBottomFoods = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;
    const userId = session.user.id;

    const { data, error } = await supabase
      .from('food_entries')
      .select('food_name, score')
      .eq('user_id', userId);

    if (error) {
      console.error('Food fetch error:', error.message);
      return;
    }

    if (!data) return;

    // Group by food_name
    const foodMap: Record<string, number[]> = {};

    data.forEach(entry => {
      if (!entry.food_name || entry.score === null) return;
      if (!foodMap[entry.food_name]) {
        foodMap[entry.food_name] = [];
      }
      foodMap[entry.food_name].push(Number(entry.score));
    });

    // Calculate average scores
    const averagedFoods = Object.entries(foodMap).map(([name, scores]) => {
      const sum = scores.reduce((a, b) => a + b, 0);
      const avg = sum / scores.length;
      return { name, score: avg };
    });

    // Sort by score descending
    const sorted = averagedFoods.sort((a, b) => b.score - a.score);

    setTopFoods(sorted.slice(0, 10));
    console.log('Top Foods:', topFoods);
    setBottomFoods(sorted.slice(-10).reverse());
    console.log('Bottom Foods:', bottomFoods);

  };

  const fetchTopTags = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;
    const userId = session.user.id;

    const { data: tagData, error } = await supabase
      .from('food_entries')
      .select('tag')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Chart data error:', error.message);
      return;
    }

    if (!tagData) return;

    for (const row of tagData) { //For each row in tag data, and each tag in the row, increment the count of that tag in tagCounts.
      const tags: string[] = row.tag;

      if (Array.isArray(tags)) {
        for (const tag of tags) {
          if (tag in tagCounts) {
            tagCounts[tag]++;
          } else {
            tagCounts[tag] = 1;
          }
        }
      }
    }

    console.log('Tag counts:', tagCounts);
    setSortedTags(
      Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    );

  }

  const calculateCurrentStreak = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;
    const { data: entries, error } = await supabase
      .from('food_entries')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching entries for streak:', error.message);
      return;
    }

    if (!entries || entries.length === 0) {
      setCurrentStreak(0);
      return;
    }

    let streak = 0;
    let prevDate = new Date(); // start from today

    for (const entry of entries) {
      const entryDate = new Date(entry.created_at);

      // Strip times (normalize to midnight)
      const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
      const prevDay = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());

      const diffDays = Math.floor((prevDay.getTime() - entryDay.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day as previous (multiple entries today) — ignore but count once
        if (streak === 0) streak++;
        continue;
      } else if (diffDays === 1) {
        // Consecutive day
        streak++;
        prevDate = entryDay;
      } else {
        // Gap > 1 day → streak breaks
        break;
      }
    }

    // If no entry today but the last one was yesterday → streak should be 1
    const lastEntryDate = new Date(entries[0].created_at);
    const lastEntryDay = new Date(lastEntryDate.getFullYear(), lastEntryDate.getMonth(), lastEntryDate.getDate());
    const today = new Date();
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffFromToday = Math.floor((todayDay.getTime() - lastEntryDay.getTime()) / (1000 * 60 * 60 * 24));

    if (diffFromToday === 1 && streak === 0) streak = 1;

    setCurrentStreak(streak);
  };

  useEffect(() => {
    fetchUserData(); // Runs only once on mount
    fetchTopAndBottomFoods();
    //fetchChartData();
    fetchTopTags();
    calculateCurrentStreak();
    setWelcomeIndex(Math.floor(Math.random() * listOfWelcomeMessages.length)); // Randomly select a welcome message, if same message appears, add this line to refresh section. 
  }, []);

  useEffect(() => {
    fetchChartData(); // Runs every time timeRange changes
  }, [timeRange]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { }} />}
      >
        <Stack.Screen />

        {/* Header Section */}
        <View style={styles.card}>
          <Text style={styles.welcomeText}>
            👋Hello{firstName ? `, ${firstName}` : ''}!
          </Text>
          <Text style={styles.subText}>{listOfWelcomeMessages[welcomeIndex]}</Text>
          <Text style={styles.entryText}>
            {numOfLogEntries === 0
              ? 'You have no entries yet. Head to the Food Entry tab to get started!'
              : `You’ve logged ${numOfLogEntries} ${numOfLogEntries === 1 ? 'time' : 'times'}! Keep it going!`}
          </Text>
        </View>
        {/* Chart Section */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Average Gut Feeling 🍽️</Text>
          {scores.length === 0 ? (
            <Text style={styles.text}>No gut scores yet.</Text>
          ) : (
            <LineChart
              data={{
                labels,
                datasets: [
                  { data: scores },
                  { data: [1], withDots: false },
                  { data: [5], withDots: false },
                ],
              }}
              width={screenWidth - 40}
              height={220}
              yAxisSuffix="/5"
              fromZero
              chartConfig={{
                backgroundGradientFrom: '#2a2b32',
                backgroundGradientTo: '#2a2b32',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
                labelColor: () => '#aaa',
                propsForDots: { r: '3', strokeWidth: '2', stroke: '#1E90FF' },
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
                <Text
                  style={[
                    styles.timeButtonText,
                    timeRange === range && styles.timeButtonTextActive,
                  ]}
                >
                  {range.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Streak Section */}
        <View style={styles.statsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current Streak 🔥</Text>
            <Text style={styles.cardItem}>{currentStreak} days</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={[styles.card, styles.cardGood]}>
            <Text style={styles.cardTitle}>Top Foods ✅</Text>
            {(seeMoreGood ? topFoods : topFoods.slice(0, 3)).map((food, i) => (
              <Text key={i} style={styles.cardItem}>
                {food.name}: {food.score.toFixed(1)}/5
              </Text>
            ))}
            {topFoods.length > 3 && (
              <TouchableOpacity onPress={() => setSeeMoreGood(!seeMoreGood)}>
                <Text style={styles.toggleText}>
                  {seeMoreGood ? 'See Less' : 'See More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.card, styles.cardBad]}>
            <Text style={styles.cardTitle}>Lowest Foods ❌</Text>
            {(seeMoreBad ? bottomFoods : bottomFoods.slice(0, 3)).map((food, i) => (
              <Text key={i} style={styles.cardItem}>
                {food.name}: {food.score.toFixed(1)}/5
              </Text>
            ))}
            {bottomFoods.length > 3 && (
              <TouchableOpacity onPress={() => setSeeMoreBad(!seeMoreBad)}>
                <Text style={styles.toggleText}>
                  {seeMoreBad ? 'See Less' : 'See More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.card, styles.cardTag]}>
            <Text style={styles.cardTitle}>Top Food Tags 💠</Text>
            {(seeMoreTags ? sortedTags : sortedTags.slice(0, 3)).map((tag, i) => (
              <Text key={i} style={styles.cardItem}>
                {tag.name}: {tag.count}
              </Text>
            ))}
            {sortedTags.length > 3 && (
              <TouchableOpacity onPress={() => setSeeMoreTags(!seeMoreTags)}>
                <Text style={styles.toggleText}>
                  {seeMoreTags ? 'See Less' : 'See More'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    backgroundColor: '#25292e',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  subText: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  entryText: {
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#2a2b32',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    maxWidth: 650,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 10,
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#3a3b40',
  },
  timeButtonActive: {
    backgroundColor: '#1E90FF',
  },
  timeButtonText: {
    color: '#ccc',
    fontWeight: '600',
  },
  timeButtonTextActive: {
    color: '#fff',
  },
  statsContainer: {
    width: '100%',
    maxWidth: 650,
    gap: 20,
  },
  cardGood: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  cardBad: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  cardTag: {
    borderLeftWidth: 4,
    borderLeftColor: '#1E90FF',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardItem: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  toggleText: {
    color: '#1E90FF',
    fontWeight: 'bold',
    marginTop: 8,
  },
  text: {
    color: '#ccc',
    fontSize: 16,
  },
});