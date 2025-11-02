import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.191:8000/api/v1';

export default function AnalyticsScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [examStats, setExamStats] = useState<any>(null);
    const [interviewStats, setInterviewStats] = useState<any>(null);

    const fetchAnalyticsData = async () => {
        try {
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            // Fetch all analytics data in parallel
            const [dashboardRes, examRes, interviewRes] = await Promise.all([
                fetch(`${API_URL}/analytics/dashboard/`, { headers }),
                fetch(`${API_URL}/analytics/exam_stats/`, { headers }),
                fetch(`${API_URL}/analytics/interview_stats/`, { headers }),
            ]);

            if (dashboardRes.ok && examRes.ok && interviewRes.ok) {
                const [dashboard, exam, interview] = await Promise.all([
                    dashboardRes.json(),
                    examRes.json(),
                    interviewRes.json(),
                ]);

                setDashboardData(dashboard);
                setExamStats(exam);
                setInterviewStats(interview);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchAnalyticsData();
        }
    }, [token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalyticsData();
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="px-6 pt-12 pb-4 border-b border-zinc-800">
                <Text className="text-3xl font-bold text-white">Analytics Dashboard</Text>
                <Text className="text-gray-400 mt-1">Track your progress and performance</Text>
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
                }
            >
                {/* Overall Stats Cards */}
                <View className="px-6 py-6">
                    <Text className="text-xl font-bold text-white mb-4">Overview</Text>

                    <View className="flex-row flex-wrap gap-3">
                        {/* Total Activities */}
                        <View className="bg-zinc-900 rounded-xl p-4 flex-1 min-w-[45%] border border-zinc-800">
                            <Text className="text-gray-400 text-sm mb-1">Total Activities</Text>
                            <Text className="text-white text-3xl font-bold">
                                {dashboardData?.total_activities || 0}
                            </Text>
                            <Text className="text-blue-500 text-xs mt-2">
                                Exams + Interviews
                            </Text>
                        </View>

                        {/* Current Streak */}
                        <View className="bg-zinc-900 rounded-xl p-4 flex-1 min-w-[45%] border border-zinc-800">
                            <Text className="text-gray-400 text-sm mb-1">Current Streak</Text>
                            <Text className="text-white text-3xl font-bold">
                                {dashboardData?.current_streak || 0}
                                <Text className="text-lg text-gray-500"> days</Text>
                            </Text>
                            <Text className="text-orange-500 text-xs mt-2">
                                🔥 Keep it up!
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Exam Statistics */}
                <View className="px-6 py-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-white">Exam Performance</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/analytics/exams')}
                            className="bg-zinc-800 px-3 py-1 rounded-lg"
                        >
                            <Text className="text-blue-400 text-sm">View Details</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm">Total Exams</Text>
                                <Text className="text-white text-2xl font-bold">
                                    {examStats?.total_attempts || 0}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm">Pass Rate</Text>
                                <Text className="text-green-500 text-2xl font-bold">
                                    {examStats?.pass_rate?.toFixed(1) || 0}%
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between items-center border-t border-zinc-800 pt-4">
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm">Average Score</Text>
                                <Text className="text-white text-xl font-semibold">
                                    {examStats?.average_score?.toFixed(1) || 0}%
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm">Highest Score</Text>
                                <Text className="text-yellow-500 text-xl font-semibold">
                                    {examStats?.highest_score?.toFixed(1) || 0}%
                                </Text>
                            </View>
                        </View>

                        {examStats?.total_attempts > 0 && (
                            <View className="mt-4 pt-4 border-t border-zinc-800">
                                <View className="flex-row justify-between">
                                    <View className="flex-row items-center">
                                        <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                                        <Text className="text-gray-400 text-sm">
                                            Passed: {examStats?.passed || 0}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                                        <Text className="text-gray-400 text-sm">
                                            Failed: {examStats?.failed || 0}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Interview Statistics */}
                <View className="px-6 py-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-white">Interview Performance</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/analytics/interviews')}
                            className="bg-zinc-800 px-3 py-1 rounded-lg"
                        >
                            <Text className="text-blue-400 text-sm">View Details</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm">Total Interviews</Text>
                                <Text className="text-white text-2xl font-bold">
                                    {interviewStats?.total_interviews || 0}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm">Completion Rate</Text>
                                <Text className="text-green-500 text-2xl font-bold">
                                    {interviewStats?.completion_rate?.toFixed(1) || 0}%
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between items-center border-t border-zinc-800 pt-4">
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm">Average Score</Text>
                                <Text className="text-white text-xl font-semibold">
                                    {interviewStats?.average_score?.toFixed(1) || 0}%
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm">Best Score</Text>
                                <Text className="text-yellow-500 text-xl font-semibold">
                                    {interviewStats?.highest_score?.toFixed(1) || 0}%
                                </Text>
                            </View>
                        </View>

                        {interviewStats?.total_interviews > 0 && (
                            <View className="mt-4 pt-4 border-t border-zinc-800">
                                <View className="flex-row justify-between">
                                    <View className="flex-row items-center">
                                        <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                                        <Text className="text-gray-400 text-sm">
                                            Completed: {interviewStats?.completed || 0}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <View className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                                        <Text className="text-gray-400 text-sm">
                                            In Progress: {interviewStats?.in_progress || 0}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* Performance Trends */}
                {dashboardData?.weekly_trends && dashboardData.weekly_trends.length > 0 && (
                    <View className="px-6 py-4">
                        <Text className="text-xl font-bold text-white mb-4">Weekly Trends</Text>
                        <View className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                            {dashboardData.weekly_trends.map((trend: any, index: number) => (
                                <View
                                    key={trend.id || index}
                                    className={`py-3 ${index !== dashboardData.weekly_trends.length - 1 ? 'border-b border-zinc-800' : ''}`}
                                >
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-white font-semibold">
                                            Week of {new Date(trend.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </Text>
                                        <Text className="text-gray-400 text-sm">
                                            {trend.exams_taken + trend.interviews_taken} activities
                                        </Text>
                                    </View>
                                    <View className="flex-row gap-4">
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs">Exam Score</Text>
                                            <Text className="text-blue-500 font-semibold">
                                                {trend.average_exam_score?.toFixed(1) || 0}%
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs">Interview Score</Text>
                                            <Text className="text-purple-500 font-semibold">
                                                {trend.average_interview_score?.toFixed(1) || 0}%
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-400 text-xs">Time Spent</Text>
                                            <Text className="text-green-500 font-semibold">
                                                {trend.total_time_spent_minutes} min
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Recent Activities */}
                {dashboardData?.recent_activities && dashboardData.recent_activities.length > 0 && (
                    <View className="px-6 py-4 pb-8">
                        <Text className="text-xl font-bold text-white mb-4">Recent Activity</Text>
                        <View className="bg-zinc-900 rounded-xl border border-zinc-800">
                            {dashboardData.recent_activities.slice(0, 5).map((activity: any, index: number) => (
                                <View
                                    key={activity.id || index}
                                    className={`p-4 ${index !== Math.min(4, dashboardData.recent_activities.length - 1) ? 'border-b border-zinc-800' : ''}`}
                                >
                                    <View className="flex-row items-start">
                                        <View className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
                                        <View className="flex-1">
                                            <Text className="text-white font-medium mb-1">
                                                {activity.activity_type_display || activity.activity_type}
                                            </Text>
                                            {activity.description && (
                                                <Text className="text-gray-400 text-sm mb-1">
                                                    {activity.description}
                                                </Text>
                                            )}
                                            <Text className="text-gray-500 text-xs">
                                                {new Date(activity.created_at).toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Empty State */}
                {(!dashboardData?.total_activities || dashboardData.total_activities === 0) && (
                    <View className="px-6 py-12">
                        <View className="bg-zinc-900 rounded-xl p-8 items-center border border-zinc-800">
                            <Text className="text-6xl mb-4">📊</Text>
                            <Text className="text-white text-xl font-bold mb-2">No Data Yet</Text>
                            <Text className="text-gray-400 text-center mb-6">
                                Start taking exams or interviews to see your analytics
                            </Text>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => router.push('/exams')}
                                    className="bg-blue-600 px-6 py-3 rounded-lg"
                                >
                                    <Text className="text-white font-semibold">Browse Exams</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => router.push('/interviews')}
                                    className="bg-zinc-800 px-6 py-3 rounded-lg border border-zinc-700"
                                >
                                    <Text className="text-white font-semibold">Browse Interviews</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
