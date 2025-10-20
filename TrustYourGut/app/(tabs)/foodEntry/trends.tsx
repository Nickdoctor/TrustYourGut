import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableWithoutFeedback,
    Keyboard,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import { Stack } from "expo-router";
import { supabase } from "@/lib/supabase";
import { BarChart } from "react-native-chart-kit";

type FoodEntry = {
    id: string;
    created_at: string;
    food_name: string;
    score: string;
    tag: string[];
    description: string;
};

export default function TrendsScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
    const [topPairs, setTopPairs] = useState<{ pair: string; count: number }[]>([]);
    const [topTagPairs, setTopTagPairs] = useState<{ pair: string; count: number }[]>([]);
    const [showFoodPairsInfo, setShowFoodPairsInfo] = useState(false);
    const [showTagPairsInfo, setShowTagPairsInfo] = useState(false);

    const fetchEntries = async () => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) return;

        const userId = session.user.id;
        const { data, error } = await supabase
            .from("food_entries")
            .select("*")
            .eq("user_id", userId);

        if (error) console.log("Error fetching entries:", error);
        if (data) setFoodEntries(data);
    };

    const groupEntriesByDate = (entries: FoodEntry[]) => {
        const groups: Record<string, FoodEntry[]> = {};
        entries.forEach((entry) => {
            const date = entry.created_at.split("T")[0];
            if (!groups[date]) groups[date] = [];
            groups[date].push(entry);
        });
        return groups;
    };

    const calculateNamePairs = () => {
        const groups = groupEntriesByDate(foodEntries);
        const pairCount: Record<string, number> = {};

        Object.values(groups).forEach((entries) => {
            const seenPairs = new Set<string>();
            for (let i = 0; i < entries.length; i++) {
                for (let j = i + 1; j < entries.length; j++) {
                    const foodA = entries[i].food_name.trim();
                    const foodB = entries[j].food_name.trim();
                    if (foodA.toLowerCase() === foodB.toLowerCase()) continue;
                    const pair = [foodA, foodB].sort().join(" & ");
                    if (!seenPairs.has(pair)) {
                        seenPairs.add(pair);
                        pairCount[pair] = (pairCount[pair] || 0) + 1;
                    }
                }
            }
        });

        const sortedPairs = Object.entries(pairCount)
            .map(([pair, count]) => ({ pair, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        setTopPairs(sortedPairs);
    };

    const calculateTagPairs = () => {
        const tagPairCount: Record<string, number> = {};

        foodEntries.forEach((entry) => {
            if (!entry.tag || entry.tag.length < 2) return;
            const normalizedTags = entry.tag.map((t) => t.trim().toLowerCase()).filter((t) => t !== "");
            for (let i = 0; i < normalizedTags.length; i++) {
                for (let j = i + 1; j < normalizedTags.length; j++) {
                    const pair = [normalizedTags[i], normalizedTags[j]].sort().join(" & ");
                    tagPairCount[pair] = (tagPairCount[pair] || 0) + 1;
                }
            }
        });

        const sortedTagPairs = Object.entries(tagPairCount)
            .map(([pair, count]) => ({ pair, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        setTopTagPairs(sortedTagPairs);
    };

    useEffect(() => {
        if (foodEntries.length > 0) {
            calculateNamePairs();
            calculateTagPairs();
        }
    }, [foodEntries]);

    useEffect(() => {
        fetchEntries();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchEntries();
        calculateNamePairs();
        calculateTagPairs();
        setRefreshing(false);
    };

    const chartConfig = {
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        barPercentage: 0.5,
    };

    const screenWidth = Dimensions.get("window").width - 32;

    const getColorForCount = (count: number, maxCount: number) => {
        const intensity = count / maxCount;
        const minColor = [173, 216, 230];
        const maxColor = [0, 122, 255];
        const r = Math.round(minColor[0] + (maxColor[0] - minColor[0]) * intensity);
        const g = Math.round(minColor[1] + (maxColor[1] - minColor[1]) * intensity);
        const b = Math.round(minColor[2] + (maxColor[2] - minColor[2]) * intensity);
        return `rgb(${r},${g},${b})`;
    };

    const maxPairCount = Math.max(...topPairs.map(p => p.count), 1);
    const maxTagPairCount = Math.max(...topTagPairs.map(p => p.count), 1);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    <Stack.Screen options={{ title: "Trends" }} />
                    <Text style={styles.title}>Trend Dashboard</Text>

                    {/* ===== Food Pairs Card ===== */}
                    <View style={styles.card}>
                        <View style={styles.subtitleRow}>
                            <Text style={styles.subtitle}>Top Food Pairs Logged Together</Text>
                            <TouchableOpacity onPress={() => setShowFoodPairsInfo(!showFoodPairsInfo)}>
                                <Text style={styles.infoIcon}>?</Text>
                            </TouchableOpacity>
                        </View>

                        {showFoodPairsInfo && (
                            <View style={styles.infoContainer}>
                                <Text style={styles.infoText}>
                                    This chart shows the most common foods logged together. The count represents
                                    how many days they appeared on the same day.
                                </Text>
                            </View>
                        )}

                        {topPairs.length === 0 ? (
                            <Text style={styles.noDataText}>No trends available yet.</Text>
                        ) : (
                            <>
                                {topPairs.map((item, index) => (
                                    <View key={index} style={styles.pairRow}>
                                        <View style={[styles.circle, { backgroundColor: getColorForCount(item.count, maxPairCount) }]} />
                                        <Text style={styles.pairText}>
                                            {index + 1}. {item.pair} ({item.count})
                                        </Text>
                                    </View>
                                ))}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <BarChart
                                        data={{
                                            labels: topPairs.map(p => p.pair),
                                            datasets: [{ data: topPairs.map(p => p.count) }],
                                        }}
                                        width={Math.max(screenWidth, topPairs.length * 120)}
                                        height={180}
                                        chartConfig={{
                                            ...chartConfig,
                                            color: (opacity = 1, index?: number) => {
                                                if (index === undefined) return `rgba(0,122,255,${opacity})`;
                                                const count = topPairs[index].count;
                                                return getColorForCount(count, maxPairCount);
                                            },
                                        }}
                                        fromZero
                                        showValuesOnTopOfBars
                                        yAxisLabel=""
                                        yAxisSuffix=""
                                    />
                                </ScrollView>
                            </>
                        )}
                    </View>

                    {/* ===== Tag Pairs Card ===== */}
                    <View style={styles.card}>
                        <View style={styles.subtitleRow}>
                            <Text style={styles.subtitle}>Top Tags Used Together</Text>
                            <TouchableOpacity onPress={() => setShowTagPairsInfo(!showTagPairsInfo)}>
                                <Text style={styles.infoIcon}>?</Text>
                            </TouchableOpacity>
                        </View>

                        {showTagPairsInfo && (
                            <View style={styles.infoContainer}>
                                <Text style={styles.infoText}>
                                    This chart shows the most frequent tags used together in the same food entry.
                                </Text>
                            </View>
                        )}

                        {topTagPairs.length === 0 ? (
                            <Text style={styles.noDataText}>No tag trends available yet.</Text>
                        ) : (
                            <>
                                {topTagPairs.map((item, index) => (
                                    <View key={index} style={styles.pairRow}>
                                        <View style={[styles.circle, { backgroundColor: getColorForCount(item.count, maxTagPairCount) }]} />
                                        <Text style={styles.pairText}>
                                            {index + 1}. {item.pair} ({item.count})
                                        </Text>
                                    </View>
                                ))}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <BarChart
                                        data={{
                                            labels: topTagPairs.map(p => p.pair),
                                            datasets: [{ data: topTagPairs.map(p => p.count) }],
                                        }}
                                        width={Math.max(screenWidth, topTagPairs.length * 120)}
                                        height={180}
                                        chartConfig={{
                                            ...chartConfig,
                                            color: (opacity = 1, index?: number) => {
                                                if (index === undefined) return `rgba(0,122,255,${opacity})`;
                                                const count = topTagPairs[index].count;
                                                return getColorForCount(count, maxTagPairCount);
                                            },
                                        }}
                                        fromZero
                                        showValuesOnTopOfBars
                                        yAxisLabel=""
                                        yAxisSuffix=""
                                    />
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f6f7fb",
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#0b3d91",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    subtitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1c1c1c",
    },
    infoIcon: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#007AFF",
        borderWidth: 1,
        borderColor: "#007AFF",
        borderRadius: 50,
        paddingHorizontal: 8,
        paddingVertical: 2,
        textAlign: "center",
    },
    infoContainer: {
        backgroundColor: "#F0F8FF",
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#D0E6FF",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    infoText: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
    },
    pairRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    circle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    pairText: {
        fontSize: 16,
        color: "#333",
    },
    noDataText: {
        fontStyle: "italic",
        color: "#777",
    },
});
