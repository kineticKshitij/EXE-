import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.191:8000/api/v1';

export default function InterviewAnalyticsScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [interviewStats, setInterviewStats] = useState<any>(null);

    useEffect(() => {
        const fetchInterviewStats = async () => {
            try {
                const response = await fetch(`${API_URL}/analytics/interview_stats/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setInterviewStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch interview stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchInterviewStats();
        }
    }, [token]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    const totalInterviews = interviewStats?.total_interviews || 0;
    const byType = interviewStats?.by_type || [];

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="px-6 pt-12 pb-4 border-b border-zinc-800">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Text className="text-blue-500 text-base">← Back</Text>
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-white">Interview Analytics</Text>
                <Text className="text-gray-400 mt-1">Detailed interview performance insights</Text>
            </View>

            <ScrollView className="flex-1">
                {/* Summary Cards */}
                <View className="px-6 py-6">
                    <View className="flex-row flex-wrap gap-3">
                        <View className="bg-zinc-900 rounded-xl p-4 flex-1 min-w-[45%] border border-zinc-800">
                            <Text className="text-gray-400 text-sm mb-1">Total Interviews</Text>
                            <Text className="text-white text-3xl font-bold">{totalInterviews}</Text>
                        </View>

                        <View className="bg-zinc-900 rounded-xl p-4 flex-1 min-w-[45%] border border-zinc-800">
                            <Text className="text-gray-400 text-sm mb-1">Completion Rate</Text>
                            <Text className="text-green-500 text-3xl font-bold">
                                {interviewStats?.completion_rate?.toFixed(1) || 0}%
                            </Text>
                        </View>

                        <View className="bg-zinc-900 rounded-xl p-4 flex-1 min-w-[45%] border border-zinc-800">
                            <Text className="text-gray-400 text-sm mb-1">Average Score</Text>
                            <Text className="text-blue-500 text-3xl font-bold">
                                {interviewStats?.average_score?.toFixed(1) || 0}%
                            </Text>
                        </View>

                        <View className="bg-zinc-900 rounded-xl p-4 flex-1 min-w-[45%] border border-zinc-800">
                            <Text className="text-gray-400 text-sm mb-1">Best Score</Text>
                            <Text className="text-yellow-500 text-3xl font-bold">
                                {interviewStats?.highest_score?.toFixed(1) || 0}%
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Status Breakdown */}
                <View className="px-6 py-4">
                    <Text className="text-xl font-bold text-white mb-4">Status Breakdown</Text>
                    <View className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                        <View className="flex-row mb-4">
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm mb-2">Completed</Text>
                                <Text className="text-green-500 text-2xl font-bold">
                                    {interviewStats?.completed || 0}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm mb-2">In Progress</Text>
                                <Text className="text-yellow-500 text-2xl font-bold">
                                    {interviewStats?.in_progress || 0}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm mb-2">Cancelled</Text>
                                <Text className="text-red-500 text-2xl font-bold">
                                    {interviewStats?.cancelled || 0}
                                </Text>
                            </View>
                        </View>

                        {totalInterviews > 0 && (
                            <View className="mt-4">
                                <View className="flex-row h-3 rounded-full overflow-hidden">
                                    <View
                                        className="bg-green-500"
                                        style={{
                                            width: `${((interviewStats?.completed || 0) / totalInterviews) * 100}%`,
                                        }}
                                    />
                                    <View
                                        className="bg-yellow-500"
                                        style={{
                                            width: `${((interviewStats?.in_progress || 0) / totalInterviews) * 100}%`,
                                        }}
                                    />
                                    <View
                                        className="bg-red-500"
                                        style={{
                                            width: `${((interviewStats?.cancelled || 0) / totalInterviews) * 100}%`,
                                        }}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Performance by Interview Type */}
                {byType.length > 0 && (
                    <View className="px-6 py-4">
                        <Text className="text-xl font-bold text-white mb-4">Performance by Type</Text>
                        <View className="bg-zinc-900 rounded-xl border border-zinc-800">
                            {byType.map((type: any, index: number) => (
                                <View
                                    key={type.interview_type || index}
                                    className={`p-5 ${index !== byType.length - 1 ? 'border-b border-zinc-800' : ''}`}
                                >
                                    <View className="flex-row justify-between items-center mb-3">
                                        <Text className="text-white text-lg font-bold">
                                            {type.interview_type || 'Unknown'}
                                        </Text>
                                        <Text className="text-gray-400 text-sm">
                                            {type.count} interview{type.count !== 1 ? 's' : ''}
                                        </Text>
                                    </View>

                                    <View className="flex-row gap-4">
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs mb-1">Avg Score</Text>
                                            <Text className="text-blue-500 font-semibold">
                                                {type.average_score?.toFixed(1) || 0}%
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs mb-1">Best Score</Text>
                                            <Text className="text-yellow-500 font-semibold">
                                                {type.highest_score?.toFixed(1) || 0}%
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs mb-1">Completed</Text>
                                            <Text className="text-green-500 font-semibold">
                                                {type.completed || 0}
                                            </Text>
                                        </View>
                                    </View>

                                    {type.average_time_minutes > 0 && (
                                        <View className="mt-3 pt-3 border-t border-zinc-800">
                                            <Text className="text-gray-400 text-xs">Average Duration</Text>
                                            <Text className="text-white font-semibold">
                                                {type.average_time_minutes.toFixed(1)} minutes
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Time Statistics */}
                {interviewStats?.total_time_spent_minutes > 0 && (
                    <View className="px-6 py-4">
                        <Text className="text-xl font-bold text-white mb-4">Time Statistics</Text>
                        <View className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                            <View className="flex-row justify-between items-center mb-4">
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-sm mb-1">Total Time</Text>
                                    <Text className="text-white text-xl font-bold">
                                        {interviewStats.total_time_spent_minutes} min
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-sm mb-1">Avg per Interview</Text>
                                    <Text className="text-white text-xl font-bold">
                                        {(interviewStats.total_time_spent_minutes / totalInterviews).toFixed(1)} min
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Performance Tips */}
                <View className="px-6 py-4 pb-8">
                    <Text className="text-xl font-bold text-white mb-4">Performance Tips</Text>
                    <View className="bg-zinc-900 rounded-xl border border-zinc-800">
                        {interviewStats?.completion_rate < 50 && (
                            <View className="p-4 border-b border-zinc-800">
                                <Text className="text-yellow-500 font-semibold mb-2">⚠️ Low Completion Rate</Text>
                                <Text className="text-gray-400 text-sm">
                                    Many of your interviews are incomplete. Try to finish interviews once you start
                                    them for better practice.
                                </Text>
                            </View>
                        )}

                        {interviewStats?.average_score < 60 && interviewStats?.completed > 0 && (
                            <View className="p-4 border-b border-zinc-800">
                                <Text className="text-yellow-500 font-semibold mb-2">📚 Practice More</Text>
                                <Text className="text-gray-400 text-sm">
                                    Your average score suggests room for improvement. Consider practicing more
                                    interview questions and reviewing feedback.
                                </Text>
                            </View>
                        )}

                        {interviewStats?.completion_rate >= 80 && interviewStats?.average_score >= 85 && (
                            <View className="p-4">
                                <Text className="text-green-500 font-semibold mb-2">
                                    🌟 Outstanding Performance!
                                </Text>
                                <Text className="text-gray-400 text-sm">
                                    Excellent completion rate and scores! You're well-prepared for real interviews.
                                </Text>
                            </View>
                        )}

                        {interviewStats?.in_progress > 3 && (
                            <View className="p-4 border-b border-zinc-800">
                                <Text className="text-blue-500 font-semibold mb-2">🎯 Complete Pending</Text>
                                <Text className="text-gray-400 text-sm">
                                    You have {interviewStats.in_progress} interviews in progress. Consider completing
                                    them to track your full performance.
                                </Text>
                            </View>
                        )}

                        {totalInterviews < 3 && (
                            <View className="p-4">
                                <Text className="text-blue-500 font-semibold mb-2">💪 Keep Going</Text>
                                <Text className="text-gray-400 text-sm">
                                    Take more interviews to build confidence and improve your performance trends.
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Empty State */}
                {totalInterviews === 0 && (
                    <View className="px-6 py-12">
                        <View className="bg-zinc-900 rounded-xl p-8 items-center border border-zinc-800">
                            <Text className="text-6xl mb-4">🎤</Text>
                            <Text className="text-white text-xl font-bold mb-2">No Interview Data</Text>
                            <Text className="text-gray-400 text-center mb-6">
                                You haven't taken any interviews yet. Start practicing interviews to see your
                                analytics here.
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/interviews')}
                                className="bg-blue-600 px-6 py-3 rounded-lg"
                            >
                                <Text className="text-white font-semibold">Browse Interviews</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
