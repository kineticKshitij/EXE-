import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const API_URL = 'http://192.168.1.191:8000/api/v1';

interface Interview {
    id: number;
    title: string;
    description: string;
    interview_type: string;
    difficulty: string;
    job_role: string;
    company_name: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    duration_minutes: number;
    total_questions: number;
    total_score: number;
    percentage: number;
    created_at: string;
}

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
        case 'easy':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'medium':
            return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'hard':
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        default:
            return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'scheduled':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'in_progress':
            return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        case 'completed':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'cancelled':
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        default:
            return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'technical':
            return '💻';
        case 'behavioral':
            return '👥';
        case 'system_design':
            return '🏗️';
        case 'coding':
            return '⌨️';
        case 'hr':
            return '🤝';
        default:
            return '📋';
    }
};

export default function InterviewsScreen() {
    const { token } = useAuth();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'scheduled' | 'in_progress' | 'completed'>('all');

    const fetchInterviews = async () => {
        try {
            const url = filter === 'all'
                ? `${API_URL}/interviews/`
                : `${API_URL}/interviews/?status=${filter}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setInterviews(data.results || data);
            } else {
                Alert.alert('Error', 'Failed to fetch interviews');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchInterviews();
        }
    }, [token, filter]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchInterviews();
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text className="text-zinc-400 mt-4">Loading interviews...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="px-6 pt-16 pb-4 border-b border-zinc-800">
                <Text className="text-3xl font-bold text-white mb-2">🎤 Interviews</Text>
                <Text className="text-zinc-400">Practice mock interviews with AI</Text>
            </View>

            {/* Filter Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-6 py-4 border-b border-zinc-800"
            >
                {(['all', 'scheduled', 'in_progress', 'completed'] as const).map((status) => (
                    <TouchableOpacity
                        key={status}
                        onPress={() => setFilter(status)}
                        className={`px-4 py-2 rounded-full mr-2 ${filter === status
                                ? 'bg-violet-600'
                                : 'bg-zinc-800'
                            }`}
                    >
                        <Text className={`font-medium capitalize ${filter === status ? 'text-white' : 'text-zinc-400'
                            }`}>
                            {status.replace('_', ' ')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Interviews List */}
            <ScrollView
                className="flex-1 px-6"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
                }
            >
                <View className="py-4">
                    {interviews.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <Text className="text-6xl mb-4">📋</Text>
                            <Text className="text-zinc-400 text-lg">No interviews found</Text>
                            <Text className="text-zinc-500 mt-2">Browse templates to get started</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/interviews/templates')}
                                className="mt-6 bg-violet-600 px-6 py-3 rounded-lg"
                            >
                                <Text className="text-white font-semibold">Browse Templates</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        interviews.map((interview) => (
                            <TouchableOpacity
                                key={interview.id}
                                onPress={() => router.push(`/interviews/${interview.id}`)}
                                className="bg-zinc-900 rounded-xl p-4 mb-4 border border-zinc-800"
                            >
                                {/* Header */}
                                <View className="flex-row items-start justify-between mb-3">
                                    <View className="flex-1">
                                        <View className="flex-row items-center mb-1">
                                            <Text className="text-2xl mr-2">{getTypeIcon(interview.interview_type)}</Text>
                                            <Text className="text-white font-bold text-lg flex-1" numberOfLines={1}>
                                                {interview.title}
                                            </Text>
                                        </View>
                                        {interview.company_name && (
                                            <Text className="text-zinc-400 text-sm">at {interview.company_name}</Text>
                                        )}
                                    </View>

                                    {/* Status Badge */}
                                    <View className={`px-3 py-1 rounded-full border ${getStatusColor(interview.status)}`}>
                                        <Text className={`text-xs font-semibold capitalize ${getStatusColor(interview.status).split(' ')[1]}`}>
                                            {interview.status.replace('_', ' ')}
                                        </Text>
                                    </View>
                                </View>

                                {/* Job Role */}
                                <Text className="text-zinc-300 mb-3">{interview.job_role}</Text>

                                {/* Info Row */}
                                <View className="flex-row items-center flex-wrap gap-3">
                                    {/* Difficulty */}
                                    <View className={`px-2 py-1 rounded border ${getDifficultyColor(interview.difficulty)}`}>
                                        <Text className={`text-xs font-semibold capitalize ${getDifficultyColor(interview.difficulty).split(' ')[1]}`}>
                                            {interview.difficulty}
                                        </Text>
                                    </View>

                                    {/* Type */}
                                    <Text className="text-zinc-500 text-sm capitalize">
                                        {interview.interview_type.replace('_', ' ')}
                                    </Text>

                                    {/* Duration */}
                                    <Text className="text-zinc-500 text-sm">
                                        ⏱️ {interview.duration_minutes} min
                                    </Text>

                                    {/* Questions */}
                                    <Text className="text-zinc-500 text-sm">
                                        ❓ {interview.total_questions} questions
                                    </Text>
                                </View>

                                {/* Score (for completed) */}
                                {interview.status === 'completed' && (
                                    <View className="mt-3 pt-3 border-t border-zinc-800">
                                        <View className="flex-row items-center justify-between">
                                            <Text className="text-zinc-400">Score:</Text>
                                            <View className="flex-row items-center">
                                                <View className="w-32 h-2 bg-zinc-800 rounded-full mr-3 overflow-hidden">
                                                    <View
                                                        className={`h-full rounded-full ${interview.percentage >= 80 ? 'bg-green-500' :
                                                                interview.percentage >= 60 ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                            }`}
                                                        style={{ width: `${interview.percentage}%` }}
                                                    />
                                                </View>
                                                <Text className={`font-bold ${interview.percentage >= 80 ? 'text-green-400' :
                                                        interview.percentage >= 60 ? 'text-yellow-400' :
                                                            'text-red-400'
                                                    }`}>
                                                    {interview.percentage.toFixed(0)}%
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View className="h-8" />
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                onPress={() => router.push('/interviews/templates')}
                className="absolute bottom-8 right-6 bg-violet-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
                style={{
                    shadowColor: '#8b5cf6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                }}
            >
                <Text className="text-white text-2xl">+</Text>
            </TouchableOpacity>
        </View>
    );
}
