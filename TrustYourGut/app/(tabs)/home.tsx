import { Link, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import Button from '@/components/Button';
import { TouchableWithoutFeedback, Keyboard, ScrollView, RefreshControl } from 'react-native';

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
    'Hello, Wellness Warrior!'
  ];
  const randomIndex = Math.floor(Math.random() * listOfWelcomeMessages.length);
  const [numOfLogEntries, setNumOfLogEntries] = useState(0);
  const [refreshing, setRefreshing] = useState(false);



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

    if (error) {
      console.error('Error fetching first name:', error.message);
    } else {
      setFirstName(data.first_name);
    }
    if (countError) {
      console.error('Error fetching first name:', countError.message);
    } else if (count === null || count === undefined) {
      setNumOfLogEntries(0);
    } else {
      setNumOfLogEntries(count);
    }

    setLoading(false)
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
              : `You have logged ${numOfLogEntries} ${numOfLogEntries === 1 ? 'time' : 'times'}! Keep it going!`}
          </Text>

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
});