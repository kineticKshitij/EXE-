import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.191:8000/api/v1';

export default function ExamAnalyticsScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [examStats, setExamStats] = useState<any>(null);

    useEffect(() => {
        const fetchExamStats = async () => {
            try {
                const response = await fetch(`${API_URL}/analytics/exam_stats/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setExamStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch exam stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchExamStats();
        }
    }, [token]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    const scoreDistribution = examStats?.score_distribution || {};
    const totalAttempts = examStats?.total_attempts || 0;

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="px-6 pt-12 pb-4 border-b border-zinc-800">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Text className="text-blue-500 text-base">← Back</Text>
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-white">Exam Analytics</Text>
                <Text className="text-gray-400 mt-1">Detailed exam performance insights</Text>
            </View>

            <ScrollView className="flex-1">
                {/* Summary Cards */}
                <View className="px-6 py-6">
                    <View className="flex-row flex-wrap gap-3">
                        <View className="bg-zinc-900 rounded-xl p-4 flex-1 min-w-[45%] border border-zinc-800">
                            <Text className="text-gray-400 text-sm mb-1">Total Attempts</Text>
                            <Text className="text-white text-3xl font-bold">{totalAttempts}</Text>
                        </View>

                        <View className="bg-zinc-900 rounded-xl p-4 flex-1 min-w-[45%] border border-zinc-800">
                            <Text className="text-gray-400 text-sm mb-1">Pass Rate</Text>
                            <Text className="text-green-500 text-3xl font-bold">
                                {examStats?.pass_rate?.toFixed(1) || 0}%
                            </Text>
                        </View>

                        <View className="bg-zinc-900 rounded-xl p-4 flex-1 min-w-[45%] border border-zinc-800">
                            <Text className="text-gray-400 text-sm mb-1">Average Score</Text>
                            <Text className="text-blue-500 text-3xl font-bold">
                                {examStats?.average_score?.toFixed(1) || 0}%
                            </Text>
                        </View>

                        <View className="bg-zinc-900 rounded-xl p-4 flex-1 min-w-[45%] border border-zinc-800">
                            <Text className="text-gray-400 text-sm mb-1">Highest Score</Text>
                            <Text className="text-yellow-500 text-3xl font-bold">
                                {examStats?.highest_score?.toFixed(1) || 0}%
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Pass/Fail Breakdown */}
                <View className="px-6 py-4">
                    <Text className="text-xl font-bold text-white mb-4">Pass/Fail Breakdown</Text>
                    <View className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                        <View className="flex-row mb-4">
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm mb-2">Passed</Text>
                                <Text className="text-green-500 text-2xl font-bold">
                                    {examStats?.passed || 0}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm mb-2">Failed</Text>
                                <Text className="text-red-500 text-2xl font-bold">
                                    {examStats?.failed || 0}
                                </Text>
                            </View>
                        </View>

                        {totalAttempts > 0 && (
                            <View className="mt-4">
                                <View className="flex-row h-3 rounded-full overflow-hidden">
                                    <View
                                        className="bg-green-500"
                                        style={{ width: `${(examStats?.passed / totalAttempts) * 100}%` }}
                                    />
                                    <View
                                        className="bg-red-500"
                                        style={{ width: `${(examStats?.failed / totalAttempts) * 100}%` }}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Score Distribution */}
                <View className="px-6 py-4">
                    <Text className="text-xl font-bold text-white mb-4">Score Distribution</Text>
                    <View className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                        {Object.keys(scoreDistribution).length > 0 ? (
                            <>
                                {Object.entries(scoreDistribution).map(([range, count]: [string, any]) => {
                                    const percentage = totalAttempts > 0 ? (count / totalAttempts) * 100 : 0;
                                    return (
                                        <View key={range} className="mb-4">
                                            <View className="flex-row justify-between items-center mb-2">
                                                <Text className="text-white font-medium">{range}%</Text>
                                                <Text className="text-gray-400 text-sm">
                                                    {count} exam{count !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                                                </Text>
                                            </View>
                                            <View className="bg-zinc-800 h-2 rounded-full overflow-hidden">
                                                <View
                                                    className="bg-blue-500 h-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </View>
                                        </View>
                                    );
                                })}
                            </>
                        ) : (
                            <Text className="text-gray-400 text-center py-4">No score data available</Text>
                        )}
                    </View>
                </View>

                {/* Time Statistics */}
                {examStats?.total_time_spent_minutes > 0 && (
                    <View className="px-6 py-4">
                        <Text className="text-xl font-bold text-white mb-4">Time Statistics</Text>
                        <View className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                            <View className="flex-row justify-between items-center mb-4">
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-sm mb-1">Total Time</Text>
                                    <Text className="text-white text-xl font-bold">
                                        {examStats.total_time_spent_minutes} min
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-sm mb-1">Avg per Exam</Text>
                                    <Text className="text-white text-xl font-bold">
                                        {(examStats.total_time_spent_minutes / totalAttempts).toFixed(1)} min
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
                        {examStats?.pass_rate < 50 && (
                            <View className="p-4 border-b border-zinc-800">
                                <Text className="text-yellow-500 font-semibold mb-2">💡 Low Pass Rate</Text>
                                <Text className="text-gray-400 text-sm">
                                    Your pass rate is below 50%. Consider reviewing the material more thoroughly
                                    before attempting exams.
                                </Text>
                            </View>
                        )}

                        {examStats?.average_score < 60 && (
                            <View className="p-4 border-b border-zinc-800">
                                <Text className="text-yellow-500 font-semibold mb-2">📚 Study More</Text>
                                <Text className="text-gray-400 text-sm">
                                    Your average score suggests you need more preparation. Try reviewing incorrect
                                    answers and practicing more.
                                </Text>
                            </View>
                        )}

                        {examStats?.pass_rate >= 80 && examStats?.average_score >= 85 && (
                            <View className="p-4">
                                <Text className="text-green-500 font-semibold mb-2">🌟 Excellent Performance!</Text>
                                <Text className="text-gray-400 text-sm">
                                    You're doing great! Keep up the excellent work and maintain your study routine.
                                </Text>
                            </View>
                        )}

                        {totalAttempts < 3 && (
                            <View className="p-4">
                                <Text className="text-blue-500 font-semibold mb-2">🎯 Keep Practicing</Text>
                                <Text className="text-gray-400 text-sm">
                                    Take more exams to build a better understanding of your performance trends.
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Empty State */}
                {totalAttempts === 0 && (
                    <View className="px-6 py-12">
                        <View className="bg-zinc-900 rounded-xl p-8 items-center border border-zinc-800">
                            <Text className="text-6xl mb-4">📝</Text>
                            <Text className="text-white text-xl font-bold mb-2">No Exam Data</Text>
                            <Text className="text-gray-400 text-center mb-6">
                                You haven't taken any exams yet. Start taking exams to see your analytics here.
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/exams')}
                                className="bg-blue-600 px-6 py-3 rounded-lg"
                            >
                                <Text className="text-white font-semibold">Browse Exams</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
