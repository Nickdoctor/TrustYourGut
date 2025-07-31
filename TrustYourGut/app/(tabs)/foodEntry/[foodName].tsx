import { useLocalSearchParams } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function FoodHistoryScreen() {
  const { foodName } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>History for: {foodName}</Text>
      {/* TODO: Query and show historical data */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#25292e',
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
