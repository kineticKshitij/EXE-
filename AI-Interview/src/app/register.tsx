import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

export default function RegisterScreen() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        user_type: 'student' as 'student' | 'teacher' | 'recruiter' | 'admin',
    });
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    const handleRegister = async () => {
        // Validation
        if (!formData.username || !formData.email || !formData.password ||
            !formData.first_name || !formData.last_name) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (formData.password !== formData.password_confirm) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await register(formData);
            router.replace('/');
        } catch (error: any) {
            console.error('Registration error:', error);
            console.error('Response data:', error.response?.data);

            // Extract error messages from backend validation
            const errorData = error.response?.data || {};
            const errorMessages: string[] = [];

            // Format field-specific errors with better labels
            const fieldLabels: { [key: string]: string } = {
                username: 'Username',
                email: 'Email',
                password: 'Password',
                password_confirm: 'Password Confirmation',
                first_name: 'First Name',
                last_name: 'Last Name',
                user_type: 'User Type',
            };

            Object.keys(errorData).forEach(key => {
                const value = errorData[key];
                const label = fieldLabels[key] || key.replace('_', ' ').toUpperCase();

                if (Array.isArray(value)) {
                    // Multiple errors for this field
                    value.forEach(err => {
                        errorMessages.push(`• ${label}: ${err}`);
                    });
                } else if (typeof value === 'string') {
                    errorMessages.push(`• ${label}: ${value}`);
                } else if (typeof value === 'object' && value !== null) {
                    // Nested errors
                    errorMessages.push(`• ${label}: ${JSON.stringify(value)}`);
                }
            });

            const title = 'Registration Failed';
            const message = errorMessages.length > 0
                ? 'Please fix the following issues:\n\n' + errorMessages.join('\n')
                : error.message || 'An unexpected error occurred. Please try again.';

            Alert.alert(title, message, [
                { text: 'OK', style: 'default' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="px-6 py-8">
                <Text className="text-3xl font-bold mb-6 text-center">Register</Text>

                <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-3"
                    placeholder="Username"
                    value={formData.username}
                    onChangeText={(text) => setFormData({ ...formData, username: text })}
                    autoCapitalize="none"
                />

                <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-3"
                    placeholder="Email"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-3"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                />

                <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-3"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                />

                <View className="border border-gray-300 rounded-lg mb-3">
                    <Picker
                        selectedValue={formData.user_type}
                        onValueChange={(value) => setFormData({ ...formData, user_type: value })}
                    >
                        <Picker.Item label="Student" value="student" />
                        <Picker.Item label="Teacher" value="teacher" />
                        <Picker.Item label="Recruiter" value="recruiter" />
                    </Picker>
                </View>

                <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-3"
                    placeholder="Password"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry
                    autoCapitalize="none"
                />

                <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
                    placeholder="Confirm Password"
                    value={formData.password_confirm}
                    onChangeText={(text) => setFormData({ ...formData, password_confirm: text })}
                    secureTextEntry
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    className="bg-blue-500 rounded-lg py-3 mb-4"
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-semibold">Register</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-blue-500 text-center">Already have an account? Login</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
