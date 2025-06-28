import { Link, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export default function HomeScreen() {

  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getFirstName = async () => {
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
        .select('first_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching first name:', error.message);
      } else {
        setFirstName(data.first_name);
      }

      setLoading(false);
    };

    getFirstName();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Stack.Screen />
      <Text style={styles.text}>Welcome: {firstName ? ` ${firstName}` : ''}!</Text>
    </View>
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
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});