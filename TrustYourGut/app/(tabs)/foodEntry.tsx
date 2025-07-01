import { Text, View, StyleSheet } from 'react-native';
import { Link } from 'expo-router'; 
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';

export default function FoodEntryScreen() {

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
        .insert({user_id: userId,food_name: 'Test Food', score: "1", tag: ["Full","Good"], description: "Test"})
        .select();
      if (error) {
        console.error('Error inserting test row:', error);
      } else {
        console.log('Test row inserted:', data);
      }
    };
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Food Entry Screen</Text>
            <Button theme="" label = "Enter test row" onPress={enterTestRow}/>
      
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
