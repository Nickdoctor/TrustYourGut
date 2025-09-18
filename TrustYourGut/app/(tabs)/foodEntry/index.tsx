import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { router, Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { supabase } from "@/lib/supabase";

export default function FoodEntryScreen() {
  const enterTestRow = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) return;

    const userId = session.user.id;
    const { error } = await supabase
      .from("food_entries")
      .insert({
        user_id: userId,
        food_name: "Test Food",
        score: "1",
        tag: ["Full", "Good"],
        description: "Test",
      });

    if (!error) {
      Toast.show({
        type: "success",
        text1: "Entry saved!",
        text2: "You just logged a new food entry 🎉",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Food Entry" }} />

      <Text style={styles.title}>Food Entry</Text>
      <Text style={styles.subtitle}>
        Track your meals, log details, and view your history.
      </Text>

      {/* Main Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.bigButton, styles.primary]}
          onPress={() => router.navigate("/foodEntry/individualFoodEntry")}
        >
          <Text style={styles.bigButtonText}>🍽️ Enter Individual Food Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bigButton, styles.secondary]}
          onPress={() => router.navigate("/foodEntry/history")}
        >
          <Text style={styles.bigButtonText}>📜 View History</Text>
        </TouchableOpacity>
         <TouchableOpacity
          style={[styles.bigButton, styles.tertiary]}
          onPress={() => router.navigate("/foodEntry/trends")}
        >
          <Text style={styles.bigButtonText}>📊 View Groups/Trends</Text>
        </TouchableOpacity>
      </View>

      {/* Dev Tools */}
      <View style={styles.devSection}>
        <Text style={styles.devTitle}>Dev Tools</Text>
        <TouchableOpacity style={[styles.smallButton]} onPress={enterTestRow}>
          <Text style={styles.smallButtonText}>+ Enter test row</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.smallButton} onPress={deleteTestRow}>
          <Text style={styles.smallButtonText}>Delete all test rows</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    padding: 20,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#bbb",
    textAlign: "center",
    marginTop: 8,
  },
  actions: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  bigButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  primary: {
    backgroundColor: "#4CAF50", // green
  },
  secondary: {
    backgroundColor: "#2196F3", // blue
  },
  tertiary: {
    backgroundColor: "#FF9800", // orange
  },
  bigButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  devSection: {
    borderTopWidth: 1,
    borderTopColor: "#444",
    paddingTop: 12,
  },
  devTitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  smallButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#444",
    marginBottom: 8,
  },
  smallButtonText: {
    fontSize: 14,
    color: "#fff",
  },
});
