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

  const recommend = avgScore !== null ? (avgScore >= 3.5 ? "✅ Recommended" : avgScore >= 2.5 ? "❌ Not Recommended" : "👎🏻 Definitely Not Recommended!") : "NULL";
  const recentEntries = foodEntries.slice(-10); // last 10 items
  console.log(recentEntries);
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
            data={{ //Show last ten entries in the chart where the first and last data points are always labeled, and every second point in between is labeled to avoid clutter
              labels: recentEntries.map((e, i) =>
                i === 0 || i === recentEntries.length-1 || i % 2 === 0  ?   new Date(e.created_at).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }) : ""
              ),
              datasets: [
                {
                  data: recentEntries.map((e) => parseInt(e.score, 10) || 0),
                },
                {
                  data: [1],
                  withDots: false,
                },
                {
                  data: [5],
                  withDots: false,
                },
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
              propsForLabels: {
                rotation: 45, // tilt labels 45 degrees
                fontSize: 10, // make labels smaller
              },
            }}
            style={{ marginVertical: 16, borderRadius: 16 }}
          />

          {/* Average Score & Recommendation */}
          <View style={styles.centerSection}>
            <View style={styles.scoreContainer}>
              <Text style={styles.label}>Average Score:</Text>
              <Text
                style={[
                  styles.score,
                  avgScore ? (avgScore >= 3.5 ? styles.good : avgScore >= 2.5 ? styles.ok : styles.bad) : styles.bad,
                ]}
              >
                {avgScore?.toFixed(1)}
              </Text>
            </View>
            <Text style={styles.recommend}>{recommend}</Text>
          </View>
          {/* Most Common Tags */}
          <View style={[styles.card, styles.cardTag]}>
            <Text style={styles.cardTitle}>Most Common Tags</Text>
            {tagCounts.slice(0, 3).map((tag, i) => (
              <Text key={i} style={styles.cardItem}>
                {tag.name}: {tag.count}
              </Text>
            ))}
          </View>
        </>
      )
      }
    </View >
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
    textAlign: "center",
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
  card: {
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTag: {
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderLeftColor: '#1E90FF', // blue
    borderRightColor: '#1E90FF', // blue
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardItem: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    marginRight: 6,
  },
  score: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 6,
  },
  good: {
    backgroundColor: "#4CAF50", // green
    color: "#fff",
  },
  ok: {
    backgroundColor: "#FFC107", // yellow
    color: "#000",
  },
  bad: {
    backgroundColor: "#F44336", // red
    color: "#fff",
  },
  recommend: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
  },
  centerSection: {
    alignItems: "center",  // centers children horizontally
    marginVertical: 12,
  },
});