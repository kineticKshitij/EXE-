import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { setAuth } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Extract error messages from backend
                const errorMessages: string[] = [];

                if (typeof data === 'string') {
                    errorMessages.push(data);
                } else if (data.error) {
                    errorMessages.push(data.error);
                } else {
                    Object.keys(data).forEach(key => {
                        const value = data[key];
                        if (Array.isArray(value)) {
                            value.forEach(err => errorMessages.push(`${err}`));
                        } else if (typeof value === 'string') {
                            errorMessages.push(value);
                        }
                    });
                }

                Alert.alert(
                    'Login Failed',
                    errorMessages.length > 0 ? errorMessages.join('\n') : 'Please check your credentials and try again.'
                );
                return;
            }

            // Store auth data
            await setAuth(data.tokens.access, data.tokens.refresh, data.user);

            // Navigate to home
            router.replace('/');
        } catch (error: any) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 justify-center px-6 bg-black">
            <Text className="text-3xl font-bold mb-8 text-center text-white">Login to EXE+</Text>

            <TextInput
                className="border border-zinc-700 bg-zinc-900 text-white rounded-lg px-4 py-3 mb-4"
                placeholder="Username"
                placeholderTextColor="#71717a"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />

            <TextInput
                className="border border-zinc-700 bg-zinc-900 text-white rounded-lg px-4 py-3 mb-6"
                placeholder="Password"
                placeholderTextColor="#71717a"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
            />

            <TouchableOpacity
                className="bg-blue-600 rounded-lg py-3 mb-4"
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-center font-semibold">Login</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/register')}>
                <Text className="text-blue-500 text-center">Don't have an account? Register</Text>
            </TouchableOpacity>
        </View>
    );
}
