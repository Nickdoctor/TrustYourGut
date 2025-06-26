import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '@/lib/supabase'; // Adjust to your Supabase client path
import { useRouter } from 'expo-router';
export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        setLoading(true);
        setErrorMsg('');

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        } else {
            Alert.alert('Welcome back!');
            router.replace('/(tabs)/home');
            setLoading(false);

        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Log In</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                onChangeText={setEmail}
                value={email}
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                onChangeText={setPassword}
                value={password}
            />

            {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

            {loading ? (
                <ActivityIndicator size="small" />
            ) : (
                <Button title="Log In" onPress={handleLogin} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        marginBottom: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 12,
        padding: 10,
        borderRadius: 6,
    },
    error: {
        color: 'red',
        marginBottom: 12,
        textAlign: 'center',
    },
});
