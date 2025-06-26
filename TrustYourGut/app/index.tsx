import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/auth/Register');
      }
    });
  }, []);
  // Show a loading indicator while checking the session
  return <ActivityIndicator size="large" />;
}
