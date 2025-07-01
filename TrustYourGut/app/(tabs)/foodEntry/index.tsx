import { Text, View, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { Stack } from 'expo-router';


export default function foodEntryScreen() {

  const enterTestRow = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
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
      .from('food_entries')
      .insert({ user_id: userId, food_name: 'Test Food', score: "1", tag: ["Full", "Good"], description: "Test" })
      .select();
    if (error) {
      console.error('Error inserting test row:', error);
    } else {
      console.log('Test row inserted:', data);
      Toast.show({
        type: 'success',
        text1: 'Entry saved!',
        text2: 'You just logged a new food entry 🎉'
      });
    }
  };
  const deleteTestRow = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
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
      .from('food_entries')
      .delete()
      .eq('user_id', userId)
      .select();
    if (error) {
      console.error('Error deleting test rows:', error);
    } else {
      console.log('Test rows deleted:', data);
      Toast.show({
        type: 'error',
        text1: 'All Rows deleted',
        text2: 'You just deleted all your food entries! 😢'
      });
    }
  };
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Food Entry' }} />
      <Text style={styles.text}>Food Entry Screen</Text>
      <Button theme="" label="Enter test row" onPress={enterTestRow} />
      <Button theme="" label="Delete all test rows" onPress={deleteTestRow} />
      <Button theme="" label="Enter Individual Food Item" onPress={() => router.navigate('/foodEntry/individualFoodEntry')} />


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
