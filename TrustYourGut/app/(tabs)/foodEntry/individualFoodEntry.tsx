import { Text, View, StyleSheet, TouchableWithoutFeedback, Keyboard, ScrollView, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';



export default function individualFoodEntryScreen() {

    const handleFoodEntry = async () => {
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
        if (!foodName) {
            Alert.alert('Error', 'Please enter a food name.');
            return;
        }
        if (selectedScale === null) {
            Alert.alert('Error', 'Please select a food score.');
            return;
        }
        
        const { data, error } = await supabase
            .from('food_entries')
            .insert({
                user_id: userId,
                food_name: foodName,
                score: selectedScale?.toString(),
                tag: selectedTags,
                description: description
            })
            .select();
        if (error) {
            console.error('Error inserting food entry:', error);
        } else {
            console.log('Food entry inserted:', data);
            Toast.show({
                type: 'success',
                text1: 'Entry saved!',
                text2: 'You just logged a new food entry 🎉'
            });
            router.push('/(tabs)/foodEntry');
        }
    }
    const [selectedScale, setSelectedScale] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [description, setDescription] = useState<string>('');
    const tags = ['Bloated', 'Full', 'Hungry', 'Discomfort', 'Comfort', 'Gassy', 'Nausea'];
    const [foodName, setFoodName] = useState('');
    const { foodNameParm } = useLocalSearchParams<{ foodNameParm?: string }>();

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };
    useEffect(() => {
        if (typeof foodNameParm === 'string') {
            setFoodName(foodNameParm);
        }
    }, [foodNameParm]);
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
                contentContainerStyle={styles.container}
                //refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.cardContainer}>
                    <Stack.Screen options={{ title: ' Individual Food Entry' }} />
                    <View style={styles.row}>
                        <Text style={styles.text}>Name of Food Item:</Text>
                        <Text style={styles.text}>{foodName ? foodName : 'None'}</Text>
                    </View>
                    <Button theme="food" label="+ Add Food Button" onPress={() => router.navigate('/foodEntry/enterFood')} />
                    <Text style={styles.text}>Food Score:</Text>
                    <View style={styles.scaleContainer}>
                        {[1, 2, 3, 4, 5].map((num) => {
                            const isSelected = selectedScale === num;
                            return (
                                <TouchableOpacity
                                    key={num}
                                    style={[
                                        styles.scaleButton,
                                        isSelected && styles.scaleButtonSelected
                                    ]}
                                    onPress={() => setSelectedScale(num)}
                                >
                                    <Text
                                        style={[
                                            styles.scaleButtonText,
                                            isSelected && styles.scaleButtonTextSelected
                                        ]}
                                    >
                                        {num}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <Text style={styles.text}>Labels:</Text>
                    <View style={styles.tagContainer}>
                        {tags.map((tag) => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                                <TouchableOpacity
                                    key={tag}
                                    onPress={() => toggleTag(tag)}
                                    style={[
                                        styles.tag,
                                        isSelected && styles.tagSelected
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.tagText,
                                            isSelected && styles.tagTextSelected
                                        ]}
                                    >
                                        {tag}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <Text style={styles.text}>Tags Selected: {selectedTags.length === 0 && 'None'} </Text>
                    <Text style={styles.selectedTagText}>{selectedTags.join(', ')} </Text>

                    <Text style={styles.text}>Description:</Text>
                    <TextInput style={styles.description}placeholder="Ex: I felt bloated after eating this!" onChangeText={setDescription} value={description} />
                    <Button theme="save" label="Save Entry" onPress={handleFoodEntry} />
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
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        gap: 10,
    },
    text: {
        color: 'black',
    },
    cardContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ffd33d',
    },
    scaleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginVertical: 10,
    },

    scaleButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },

    scaleButtonSelected: {
        backgroundColor: '#ffd33d',
        borderColor: '#ffaa00',
    },

    scaleButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },

    scaleButtonTextSelected: {
        color: '#000',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        marginVertical: 10,
    },

    tag: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20, // makes it pill-shaped
        backgroundColor: '#e0e0e0',
        margin: 4,
        borderWidth: 1,
        borderColor: '#ccc',
    },

    tagSelected: {
        backgroundColor: '#ffd33d',
        borderColor: '#ffaa00',
    },

    tagText: {
        color: '#333',
        fontWeight: '500',
    },

    tagTextSelected: {
        color: '#000',
        fontWeight: '700',
    },
    selectedTagText: {
        color: '#333',
        fontSize: 16,
        marginVertical: 10,
        textAlign: 'center',
    },
    description: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        width: '100%',
        marginVertical: 10,
        backgroundColor: '#f9f9f9',
    }
});
