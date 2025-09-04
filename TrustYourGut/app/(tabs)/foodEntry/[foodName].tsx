import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { supabase } from "@/lib/supabase";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

type FoodEntry = { // Define the structure of a food entry object from database
  id: string;
  created_at: string;
  food_name: string;
  score: string; // stored as text
  tag: string[]; // array of tags 
};

export default function FoodHistoryScreen() {
  const { foodName } = useLocalSearchParams<{ foodName: string }>(); //Force the type of foodName to be a string, used to get the foodName from the URL parameters to dynamically use the food name.
  const [tagCounts, setTagCounts] = useState<{ name: string; count: number }[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgScore, setAvgScore] = useState<number | null>(null);

   useEffect(() => {
    const fetchData = async () => {

      setLoading(true);

      const { data, error } = await supabase //Select food entries from the database that equal the foodName from the URL parameters
        .from("food_entries")
        .select("id, created_at, food_name, score, tag")
        .eq("food_name", foodName)
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (data) {
        setFoodEntries(data); //Set local state with the fetched food entries

        // calculate average score
        const scores = data.map((d) => Number(d.score)); // Map food entries scores to an array of numbers
        if (scores.length === 1) {
          setAvgScore(scores[0]); // If only one score, set it directly
        } else {
        const avg = scores.reduce((a, b) => a + b, 0) / (scores.length);
        setAvgScore(avg);
        }

        // count tags
        const counts: Record<string, number> = {};
        data.forEach((d) => {
          d.tag?.forEach((t: string) => {
            counts[t] = (counts[t] || 0) + 1;
          });
        });

        setTagCounts(
          Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
        );
      }

      setLoading(false);
    };

    fetchData();
  }, [foodName]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  const recommend =
    avgScore !== null ? (avgScore <= 2 ? "❌ Not Recommended" : "✅ Recommended") : "";

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: foodName }} />
      <Text style={styles.heading}>History for: {foodName}</Text>

      {foodEntries.length === 0 ? (
        <Text style={styles.text}>No history found.</Text>
      ) : (
        <>
          {/* Line Chart of Scores Over Time */}
          <LineChart
            data={{
              labels: foodEntries.map((e) =>
                new Date(e.created_at).toLocaleDateString()
              ),
              datasets: [
                {
                  data: foodEntries.map((e) => parseInt(e.score, 10) || 0),
                },
                { data: [5],
                  withDots: false,
                }
              ],
            }}
            width={Dimensions.get("window").width - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#1E2923",
              backgroundGradientFrom: "#25292e",
              backgroundGradientTo: "#3c3f45",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            style={{ marginVertical: 16, borderRadius: 16 }}
          />

          {/* Average Score & Recommendation */}
          <Text style={styles.text}>
            Average Score: {avgScore?.toFixed(1)} {recommend}
          </Text>

          {/* Most Common Tags */}
          <Text style={styles.subheading}>Most Common Tags:</Text>
          {tagCounts.length === 0 ? (
            <Text style={styles.text}>No tags found.</Text>
          ) : (
            tagCounts.slice(0, 3).map((tag, i) => (
              <Text key={i} style={styles.text}>
                {tag.name}: {tag.count}
              </Text>
            ))
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "#25292e",
  },
  heading: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  subheading: {
    color: "#fff",
    fontSize: 16,
    marginTop: 12,
    fontWeight: "600",
  },
  text: {
    color: "#fff",
    marginTop: 6,
  },
});