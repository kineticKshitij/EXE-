import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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
    job_description: string;
    required_skills: string[];
    duration_minutes: number;
    total_questions: number;
    status: string;
    questions: any[];
}

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
        case 'easy':
            return 'text-green-400';
        case 'medium':
            return 'text-yellow-400';
        case 'hard':
            return 'text-red-400';
        default:
            return 'text-gray-400';
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

export default function InterviewDetailScreen() {
    const { id } = useLocalSearchParams();
    const { token } = useAuth();
    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        fetchInterview();
    }, []);

    const fetchInterview = async () => {
        try {
            const response = await fetch(`${API_URL}/interviews/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setInterview(data);
            } else {
                Alert.alert('Error', 'Failed to fetch interview details');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const startInterview = async () => {
        if (!interview) return;

        // Check if already in progress
        if (interview.status === 'in_progress') {
            router.push(`/interviews/take/${id}`);
            return;
        }

        // Check if completed
        if (interview.status === 'completed') {
            router.push(`/interviews/results/${id}`);
            return;
        }

        setStarting(true);

        try {
            const response = await fetch(`${API_URL}/interviews/${id}/start/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                router.push(`/interviews/take/${id}`);
            } else {
                const error = await response.json();
                Alert.alert('Error', error.error || 'Failed to start interview');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setStarting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text className="text-zinc-400 mt-4">Loading interview...</Text>
            </View>
        );
    }

    if (!interview) {
        return (
            <View className="flex-1 bg-black justify-center items-center px-6">
                <Text className="text-6xl mb-4">❌</Text>
                <Text className="text-white text-xl mb-2">Interview Not Found</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-4 bg-violet-600 px-6 py-3 rounded-lg"
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="px-6 pt-16 pb-4 border-b border-zinc-800">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mb-4"
                >
                    <Text className="text-violet-500 text-lg">← Back</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6">
                <View className="py-6">
                    {/* Icon & Title */}
                    <View className="flex-row items-center mb-4">
                        <Text className="text-5xl mr-3">{getTypeIcon(interview.interview_type)}</Text>
                        <View className="flex-1">
                            <Text className="text-3xl font-bold text-white mb-1">{interview.title}</Text>
                            {interview.company_name && (
                                <Text className="text-zinc-400 text-lg">at {interview.company_name}</Text>
                            )}
                        </View>
                    </View>

                    {/* Job Role */}
                    <View className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 mb-4">
                        <Text className="text-violet-400 font-semibold mb-1">Job Role</Text>
                        <Text className="text-white text-lg">{interview.job_role}</Text>
                    </View>

                    {/* Description */}
                    <View className="bg-zinc-900 rounded-xl p-4 mb-4 border border-zinc-800">
                        <Text className="text-zinc-400 leading-6">{interview.description}</Text>
                    </View>

                    {/* Stats Grid */}
                    <View className="flex-row flex-wrap gap-3 mb-4">
                        <View className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex-1 min-w-[45%]">
                            <Text className="text-zinc-500 text-sm mb-1">Difficulty</Text>
                            <Text className={`font-bold text-lg capitalize ${getDifficultyColor(interview.difficulty)}`}>
                                {interview.difficulty}
                            </Text>
                        </View>

                        <View className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex-1 min-w-[45%]">
                            <Text className="text-zinc-500 text-sm mb-1">Duration</Text>
                            <Text className="text-white font-bold text-lg">
                                {interview.duration_minutes} min
                            </Text>
                        </View>

                        <View className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex-1 min-w-[45%]">
                            <Text className="text-zinc-500 text-sm mb-1">Questions</Text>
                            <Text className="text-white font-bold text-lg">
                                {interview.total_questions}
                            </Text>
                        </View>

                        <View className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex-1 min-w-[45%]">
                            <Text className="text-zinc-500 text-sm mb-1">Type</Text>
                            <Text className="text-white font-bold text-lg capitalize">
                                {interview.interview_type.replace('_', ' ')}
                            </Text>
                        </View>
                    </View>

                    {/* Required Skills */}
                    {interview.required_skills && interview.required_skills.length > 0 && (
                        <View className="bg-zinc-900 rounded-xl p-4 mb-4 border border-zinc-800">
                            <Text className="text-white font-semibold mb-3">Required Skills</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {interview.required_skills.map((skill, index) => (
                                    <View
                                        key={index}
                                        className="bg-violet-500/20 border border-violet-500/30 px-3 py-1 rounded-full"
                                    >
                                        <Text className="text-violet-400 text-sm font-medium">{skill}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Instructions */}
                    <View className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
                        <Text className="text-amber-400 font-semibold mb-2">📌 Instructions</Text>
                        <Text className="text-amber-200/80 leading-5 mb-2">
                            • Answer all questions to the best of your ability
                        </Text>
                        <Text className="text-amber-200/80 leading-5 mb-2">
                            • Your responses will be evaluated by AI
                        </Text>
                        <Text className="text-amber-200/80 leading-5 mb-2">
                            • Take your time and provide detailed answers
                        </Text>
                        <Text className="text-amber-200/80 leading-5">
                            • You can submit the interview when ready
                        </Text>
                    </View>

                    {/* Question Types Breakdown */}
                    {interview.questions && interview.questions.length > 0 && (
                        <View className="bg-zinc-900 rounded-xl p-4 mb-6 border border-zinc-800">
                            <Text className="text-white font-semibold mb-3">Question Types</Text>
                            {Object.entries(
                                interview.questions.reduce((acc: any, q: any) => {
                                    acc[q.question_type] = (acc[q.question_type] || 0) + 1;
                                    return acc;
                                }, {})
                            ).map(([type, count]) => (
                                <View key={type} className="flex-row justify-between items-center mb-2">
                                    <Text className="text-zinc-400 capitalize">{type.replace('_', ' ')}</Text>
                                    <Text className="text-white font-semibold">{count as number}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Start Button */}
            <View className="px-6 py-4 border-t border-zinc-800 bg-black">
                <TouchableOpacity
                    onPress={startInterview}
                    disabled={starting}
                    className={`py-4 rounded-xl ${starting ? 'bg-zinc-800' : 'bg-violet-600'
                        }`}
                >
                    {starting ? (
                        <View className="flex-row items-center justify-center">
                            <ActivityIndicator size="small" color="#ffffff" />
                            <Text className="text-white font-bold text-lg ml-2">Starting...</Text>
                        </View>
                    ) : (
                        <Text className="text-white font-bold text-lg text-center">
                            {interview.status === 'in_progress' ? 'Continue Interview' :
                                interview.status === 'completed' ? 'View Results' :
                                    'Start Interview'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
