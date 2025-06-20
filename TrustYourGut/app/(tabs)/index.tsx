import { Text, View, StyleSheet } from 'react-native';
 import { Link } from 'expo-router'; 
 import { Stack } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
    <Stack.Screen options={{ title: 'Profile' }} />

      <Text style={styles.text}>Home screen</Text>
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
