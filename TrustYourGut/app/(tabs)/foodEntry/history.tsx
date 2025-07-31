import { Text, View, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';

export default function HistoryScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    // Get current user ID when screen loads
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id ?? null);
        };
        fetchUser();
    }, []);

    // Trigger search whenever the user types
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.trim() && userId) {
                searchFoods(searchQuery);
            } else {
                setSearchResults([]); // clear when empty
            }
        }, 300); // debounce for smoother typing experience

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const searchFoods = async (query: string) => {
        const { data, error } = await supabase
            .from('food_entries')
            .select('id, food_name, score, created_at')
            .eq('user_id', userId)
            .ilike('food_name', `%${query}%`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Search error:', error.message);
        } else {
            const uniqueResults = [];
            const seen = new Set();
            for (const item of data || []) {
                if (!seen.has(item.food_name)) {
                    seen.add(item.food_name);
                    uniqueResults.push(item);
                }
            }
            setSearchResults(uniqueResults || []);
        }
    };
    function formatTimestamp(isoDateString: string): string {
        const parsedDate = parseISO(isoDateString);
        return format(parsedDate, 'MMMM do yyyy'); // → "July 1st 2025"
    }
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'History' }} />
            <View style={styles.cardContainer}>
                <View style={styles.searchContainer}>
                    <FontAwesome name="search" size={18} color="#888" style={styles.icon} />
                    <TextInput
                        placeholder="Search previous foods..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.input}
                    />
                </View>

                <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id.toString()} //Each item should have a unique ID
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.item} onPress={() => router.push(`./${encodeURIComponent(item.food_name)}`)}>
                            <Text style={styles.foodName}>{item.food_name}</Text>
                            <Text style={styles.score}>Last entered: {formatTimestamp(item.created_at)}</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        searchQuery ? (
                            <Text style={{ color: '#777', marginTop: 10 }}>No results found</Text>
                        ) : null
                    }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: '#25292e',
    },
    cardContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        //alignItems: 'center',
        //justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ffd33d',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        paddingVertical: 10,
    },
    icon: {
        marginRight: 8,
    },
    item: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    foodName: {
        fontSize: 16,
        fontWeight: '500',
    },
    score: {
        color: '#555',
    },
});
