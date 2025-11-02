import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.191:8000/api/v1';

export default function TrendsScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [trends, setTrends] = useState<any[]>([]);
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

    useEffect(() => {
        const fetchTrends = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/analytics/performance_trends/?period=${period}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setTrends(data);
                }
            } catch (error) {
                console.error('Failed to fetch trends:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchTrends();
        }
    }, [token, period]);

    const getMaxValue = () => {
        if (trends.length === 0) return 100;
        const maxExamScore = Math.max(...trends.map((t) => t.average_exam_score || 0));
        const maxInterviewScore = Math.max(...trends.map((t) => t.average_interview_score || 0));
        return Math.ceil(Math.max(maxExamScore, maxInterviewScore, 10) / 10) * 10;
    };

    const renderChart = () => {
        if (trends.length === 0) {
            return (
                <View className="bg-zinc-900 rounded-xl p-8 items-center border border-zinc-800">
                    <Text className="text-6xl mb-4">📈</Text>
                    <Text className="text-white text-xl font-bold mb-2">No Trend Data</Text>
                    <Text className="text-gray-400 text-center">
                        Take more exams and interviews to see your performance trends over time.
                    </Text>
                </View>
            );
        }

        const maxValue = getMaxValue();
        const chartHeight = 200;

        return (
            <View className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                {/* Chart Legend */}
                <View className="flex-row justify-center gap-6 mb-4">
                    <View className="flex-row items-center">
                        <View className="w-4 h-4 bg-blue-500 rounded mr-2" />
                        <Text className="text-gray-400 text-sm">Exams</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-4 h-4 bg-purple-500 rounded mr-2" />
                        <Text className="text-gray-400 text-sm">Interviews</Text>
                    </View>
                </View>

                {/* Chart */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row items-end" style={{ height: chartHeight, paddingBottom: 30 }}>
                        {trends.map((trend, index) => {
                            const examHeight = ((trend.average_exam_score || 0) / maxValue) * (chartHeight - 30);
                            const interviewHeight =
                                ((trend.average_interview_score || 0) / maxValue) * (chartHeight - 30);

                            return (
                                <View key={trend.id || index} className="items-center mx-2">
                                    {/* Bars */}
                                    <View className="flex-row items-end" style={{ height: chartHeight - 30 }}>
                                        <View className="mx-1">
                                            <View
                                                className="bg-blue-500 rounded-t w-8"
                                                style={{ height: Math.max(examHeight, 2) }}
                                            />
                                        </View>
                                        <View className="mx-1">
                                            <View
                                                className="bg-purple-500 rounded-t w-8"
                                                style={{ height: Math.max(interviewHeight, 2) }}
                                            />
                                        </View>
                                    </View>

                                    {/* Label */}
                                    <Text className="text-gray-400 text-xs mt-2 w-20 text-center">
                                        {new Date(trend.period_start).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Y-axis labels */}
                <View className="flex-row justify-between mt-4 px-2">
                    <Text className="text-gray-500 text-xs">0%</Text>
                    <Text className="text-gray-500 text-xs">{maxValue / 2}%</Text>
                    <Text className="text-gray-500 text-xs">{maxValue}%</Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="px-6 pt-12 pb-4 border-b border-zinc-800">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Text className="text-blue-500 text-base">← Back</Text>
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-white">Performance Trends</Text>
                <Text className="text-gray-400 mt-1">Track your progress over time</Text>
            </View>

            <ScrollView className="flex-1">
                {/* Period Selector */}
                <View className="px-6 py-6">
                    <Text className="text-white font-semibold mb-3">Time Period</Text>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => setPeriod('daily')}
                            className={`flex-1 py-3 rounded-lg border ${period === 'daily'
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-zinc-900 border-zinc-800'
                                }`}
                        >
                            <Text
                                className={`text-center font-semibold ${period === 'daily' ? 'text-white' : 'text-gray-400'
                                    }`}
                            >
                                Daily
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setPeriod('weekly')}
                            className={`flex-1 py-3 rounded-lg border ${period === 'weekly'
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-zinc-900 border-zinc-800'
                                }`}
                        >
                            <Text
                                className={`text-center font-semibold ${period === 'weekly' ? 'text-white' : 'text-gray-400'
                                    }`}
                            >
                                Weekly
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setPeriod('monthly')}
                            className={`flex-1 py-3 rounded-lg border ${period === 'monthly'
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-zinc-900 border-zinc-800'
                                }`}
                        >
                            <Text
                                className={`text-center font-semibold ${period === 'monthly' ? 'text-white' : 'text-gray-400'
                                    }`}
                            >
                                Monthly
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Chart */}
                <View className="px-6 py-4">
                    <Text className="text-xl font-bold text-white mb-4">Score Trends</Text>
                    {loading ? (
                        <View className="bg-zinc-900 rounded-xl p-12 items-center border border-zinc-800">
                            <ActivityIndicator size="large" color="#3b82f6" />
                        </View>
                    ) : (
                        renderChart()
                    )}
                </View>

                {/* Detailed Stats */}
                {!loading && trends.length > 0 && (
                    <View className="px-6 py-4 pb-8">
                        <Text className="text-xl font-bold text-white mb-4">Detailed Statistics</Text>
                        <View className="bg-zinc-900 rounded-xl border border-zinc-800">
                            {trends.map((trend, index) => (
                                <View
                                    key={trend.id || index}
                                    className={`p-5 ${index !== trends.length - 1 ? 'border-b border-zinc-800' : ''}`}
                                >
                                    <View className="flex-row justify-between items-center mb-3">
                                        <Text className="text-white font-bold">
                                            {new Date(trend.period_start).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                            {' - '}
                                            {new Date(trend.period_end).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </Text>
                                        <Text className="text-gray-400 text-sm">
                                            {trend.exams_taken + trend.interviews_taken} activities
                                        </Text>
                                    </View>

                                    <View className="flex-row gap-4 mb-3">
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs mb-1">Exams</Text>
                                            <Text className="text-white font-semibold">{trend.exams_taken}</Text>
                                            <Text className="text-blue-500 text-xs">
                                                Avg: {trend.average_exam_score?.toFixed(1) || 0}%
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs mb-1">Interviews</Text>
                                            <Text className="text-white font-semibold">{trend.interviews_taken}</Text>
                                            <Text className="text-purple-500 text-xs">
                                                Avg: {trend.average_interview_score?.toFixed(1) || 0}%
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs mb-1">Time Spent</Text>
                                            <Text className="text-white font-semibold">
                                                {trend.total_time_spent_minutes} min
                                            </Text>
                                        </View>
                                    </View>

                                    {trend.questions_answered > 0 && (
                                        <View className="flex-row justify-between pt-3 border-t border-zinc-800">
                                            <Text className="text-gray-400 text-sm">
                                                Questions: {trend.questions_answered}
                                            </Text>
                                            <Text className="text-gray-400 text-sm">
                                                Accuracy: {trend.correct_answers_percentage?.toFixed(1) || 0}%
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Insights */}
                {!loading && trends.length >= 2 && (
                    <View className="px-6 py-4 pb-8">
                        <Text className="text-xl font-bold text-white mb-4">Insights</Text>
                        <View className="bg-zinc-900 rounded-xl border border-zinc-800">
                            {(() => {
                                const latestTrend = trends[trends.length - 1];
                                const previousTrend = trends[trends.length - 2];

                                const examScoreChange =
                                    (latestTrend.average_exam_score || 0) - (previousTrend.average_exam_score || 0);
                                const interviewScoreChange =
                                    (latestTrend.average_interview_score || 0) -
                                    (previousTrend.average_interview_score || 0);

                                return (
                                    <>
                                        {examScoreChange !== 0 && (
                                            <View className="p-4 border-b border-zinc-800">
                                                <Text
                                                    className={`font-semibold mb-2 ${examScoreChange > 0 ? 'text-green-500' : 'text-red-500'
                                                        }`}
                                                >
                                                    {examScoreChange > 0 ? '📈 Exam Improvement' : '📉 Exam Decline'}
                                                </Text>
                                                <Text className="text-gray-400 text-sm">
                                                    Your exam scores {examScoreChange > 0 ? 'increased' : 'decreased'} by{' '}
                                                    {Math.abs(examScoreChange).toFixed(1)}% compared to the previous period.
                                                </Text>
                                            </View>
                                        )}

                                        {interviewScoreChange !== 0 && (
                                            <View className="p-4">
                                                <Text
                                                    className={`font-semibold mb-2 ${interviewScoreChange > 0 ? 'text-green-500' : 'text-red-500'
                                                        }`}
                                                >
                                                    {interviewScoreChange > 0
                                                        ? '🚀 Interview Progress'
                                                        : '⚠️ Interview Decline'}
                                                </Text>
                                                <Text className="text-gray-400 text-sm">
                                                    Your interview scores {interviewScoreChange > 0 ? 'improved' : 'dropped'}{' '}
                                                    by {Math.abs(interviewScoreChange).toFixed(1)}% compared to the previous
                                                    period.
                                                </Text>
                                            </View>
                                        )}
                                    </>
                                );
                            })()}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
