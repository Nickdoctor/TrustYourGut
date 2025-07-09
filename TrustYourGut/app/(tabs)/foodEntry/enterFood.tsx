import { Text, View, StyleSheet, TouchableWithoutFeedback, Keyboard, ScrollView, RefreshControl, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { Link, router, useRouter } from 'expo-router';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { Stack } from 'expo-router';
import { useEffect, useReducer, useState,} from 'react';
import { format, parseISO } from 'date-fns';
import { Pressable } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

export default function enterFoodScreen() {
    const isFocused = useIsFocused();
    const [foodName, setFoodName] = useState<string>('');
    const [foodList, setFoodList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    //const handleFoodEntry = async () => { }

    const fetchFoodList = async () => {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.error('Session error:', sessionError);
        }
        if (!session) {
            console.warn('No active session found');
            return;
        }
        const userId = session.user.id;
        const { data, error } = await supabase
            .from('food_entries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(15);

        if (error) {
            console.error('Error fetching food list:', error);
            Toast.show({ type: 'error', text1: 'Failed to load food list' });
        } else {
            setFoodList(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        if(isFocused){
        fetchFoodList();
        }
    }, [isFocused]);

    function formatTimestamp(isoDateString: string): string {
        const parsedDate = parseISO(isoDateString);
        return format(parsedDate, 'MMMM do yyyy'); // → "July 1st 2025"
    }
    const handlePreviousFoodPress = (foodName: string) => {
        setFoodName(foodName)
        router.setParams({foodName:foodName})
    };


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
                contentContainerStyle={styles.container}
                //refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.cardContainer}>
                    <Stack.Screen options={{ title: 'Select Food' }} />
                    <Text style={styles.text}>Enter Food</Text>
                    <Text style={styles.text}>Latest Food Entered:</Text>
                    {loading ? (
                        <ActivityIndicator size="small" color="#000" />
                    ) : (
                        <FlatList
                            data={foodList}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item, index }) => (
                                <Pressable
                                    onPress={() => { handlePreviousFoodPress(item.food_name) }}
                                    style={({ pressed }) => [
                                        styles.foodItem,
                                        pressed && { opacity: 0.7 }, // Optional visual feedback
                                    ]}
                                >
                                    <Text style={styles.foodText}>{index + 1} : {item.food_name}</Text>
                                    <Text style={[styles.timestampText, { fontSize: 12, color: '#888' }]}>
                                        {formatTimestamp(item.created_at)} Last Score: {item.score}
                                    </Text>
                                </Pressable>
                            )}
                        />
                    )}
                    <Text style={styles.text}>Food:</Text>
                    <TextInput
                        value={foodName}
                        onChangeText={handlePreviousFoodPress}
                        placeholder="Ex: Banana, Yogurt, Steak, etc."
                        style={{ backgroundColor: '#f1f1f1', padding: 10, width: '100%', marginBottom: 20 }}
                    />
                    <Button
                        theme="food"
                        label="Confirm Food Name"
                        onPress={() => {
                            if (foodName.trim()) {
                                
                                router.back()
                            } else {
                                Alert.alert('Please enter a food name.');
                            }
                        }}
                    />
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
}
const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#25292e',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        paddingTop: 20,
    },
    text: {
        color: 'black',
    },
    button: {
        fontSize: 20,
        textDecorationLine: 'underline',
        color: '#fff',
    },
    cardContainer: {
        //flex: 1,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ffd33d',
    },
    foodItem: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    foodText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    timestampText: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
});
