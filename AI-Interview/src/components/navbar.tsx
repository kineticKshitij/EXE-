import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const router = useRouter();

    return (
        <View className="bg-gray-900 border-b border-gray-800">
            <View className="px-6 py-4">
                <View className="flex-row justify-between items-center">
                    {/* Logo/Brand */}
                    <View className="flex-row items-center">
                        <View className="bg-blue-500 w-10 h-10 rounded-lg items-center justify-center mr-3">
                            <Text className="text-white font-bold text-xl">E+</Text>
                        </View>
                        <View>
                            <Text className="text-white font-bold text-xl">EXE+</Text>
                            <Text className="text-gray-400 text-xs">AI Interview Platform</Text>
                        </View>
                    </View>

                    {/* Navigation Links */}
                    {Platform.OS === 'web' && (
                        <View className="flex-row space-x-6">
                            <TouchableOpacity className="px-4 py-2">
                                <Text className="text-gray-300 hover:text-white font-medium">Dashboard</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="px-4 py-2">
                                <Text className="text-gray-300 hover:text-white font-medium">Exams</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="px-4 py-2">
                                <Text className="text-gray-300 hover:text-white font-medium">Interviews</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="px-4 py-2">
                                <Text className="text-gray-300 hover:text-white font-medium">Analytics</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* User Info & Actions */}
                    <View className="flex-row items-center space-x-4">
                        {user && (
                            <View className="mr-4">
                                <Text className="text-white font-semibold">
                                    {user.first_name} {user.last_name}
                                </Text>
                                <Text className="text-gray-400 text-xs text-right">
                                    {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
                                </Text>
                            </View>
                        )}

                        {/* Profile Avatar */}
                        <View className="bg-blue-500 w-10 h-10 rounded-full items-center justify-center">
                            <Text className="text-white font-bold">
                                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                            </Text>
                        </View>

                        {/* Logout Button */}
                        <TouchableOpacity
                            onPress={logout}
                            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg ml-2"
                        >
                            <Text className="text-white font-semibold">Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};
