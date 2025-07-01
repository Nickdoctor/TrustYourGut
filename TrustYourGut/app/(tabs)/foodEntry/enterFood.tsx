import { Text, View, StyleSheet, TouchableWithoutFeedback, Keyboard, ScrollView, RefreshControl, TextInput } from 'react-native';
import { Link, router } from 'expo-router';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { Stack } from 'expo-router';


export default function enterFoodScreen() {


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
                    <Text style={styles.text}>Previous Food list here... last listing will be for a new item</Text>
                    <Text style={styles.text}>Food:</Text>
                    <TextInput placeholder="Ex: Banana, Yogurt, Steak, etc." />
                    
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
