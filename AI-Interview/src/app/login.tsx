import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login({ username, password });
            router.replace('/');
        } catch (error: any) {
            console.error('Login error:', error);
            console.error('Response data:', error.response?.data);

            // Extract error messages from backend
            const errorData = error.response?.data || {};
            const errorMessages: string[] = [];

            if (typeof errorData === 'string') {
                errorMessages.push(errorData);
            } else {
                Object.keys(errorData).forEach(key => {
                    const value = errorData[key];
                    if (Array.isArray(value)) {
                        value.forEach(err => errorMessages.push(`• ${err}`));
                    } else if (typeof value === 'string') {
                        errorMessages.push(`• ${value}`);
                    }
                });
            }

            const title = 'Login Failed';
            const message = errorMessages.length > 0
                ? errorMessages.join('\n')
                : error.message || 'Please check your credentials and try again.';

            Alert.alert(title, message, [
                { text: 'OK', style: 'default' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 justify-center px-6 bg-white">
            <Text className="text-3xl font-bold mb-8 text-center">Login</Text>

            <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />

            <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
            />

            <TouchableOpacity
                className="bg-blue-500 rounded-lg py-3 mb-4"
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
