import { Text, View, StyleSheet, TouchableWithoutFeedback, Keyboard, ScrollView, RefreshControl, TextInput } from 'react-native';
import { Link, router } from 'expo-router';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { Stack } from 'expo-router';
import React from 'react';


export default function individualFoodEntryScreen() {

    const handleFoodEntry = async () => { }
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
                contentContainerStyle={styles.container}
                //refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.cardContainer}>
                    <Stack.Screen options={{ title: ' Individual Food Entry' }} />
                    <Text style={styles.text}>Individual Food Entry Screen</Text>
                    <Text style={styles.text}>Food:</Text>
                    <Button theme="" label="+ Add Food Button" onPress={() => router.navigate('/foodEntry/enterFood')} />
                    <Text style={styles.text}>Scale:</Text>
                    <TextInput placeholder="Scale Here"/>
                    <Text style={styles.text}>Labels:</Text>
                    <TextInput placeholder="Labels Here"/>
                    <Text style={styles.text}>Description:</Text>
                    <TextInput placeholder="Ex: I felt bloated after eating this!"/>
                    <Button theme="" label="Save Entry" onPress={handleFoodEntry} />
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
});
