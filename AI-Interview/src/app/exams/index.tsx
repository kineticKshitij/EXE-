import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

interface Exam {
    id: number;
    title: string;
    description: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    duration_minutes: number;
    total_marks: number;
    passing_marks: number;
    question_count: number;
    is_premium: boolean;
}

interface ExamResponse {
    count: number;
    results: Exam[];
}

export default function ExamsScreen() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { token, user } = useAuth();

    const fetchExams = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/exams/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data: ExamResponse = await response.json();
            setExams(data.results);
        } catch (error) {
            console.error('Failed to fetch exams:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchExams();
        }
    }, [token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchExams();
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-green-500';
            case 'medium': return 'text-yellow-500';
            case 'hard': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getDifficultyBg = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-500/20';
            case 'medium': return 'bg-yellow-500/20';
            case 'hard': return 'bg-red-500/20';
            default: return 'bg-gray-500/20';
        }
    };

    const renderExam = ({ item }: { item: Exam }) => (
        <TouchableOpacity
            onPress={() => router.push(`/exams/${item.id}`)}
            className="bg-zinc-900 rounded-2xl p-5 mb-4 border border-zinc-800"
        >
            <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1 mr-3">
                    <Text className="text-white text-xl font-semibold mb-1">
                        {item.title}
                    </Text>
                    <Text className="text-zinc-400 text-sm" numberOfLines={2}>
                        {item.description}
                    </Text>
                </View>
                {item.is_premium && (
                    <View className="bg-amber-500/20 px-3 py-1 rounded-full">
                        <Text className="text-amber-500 text-xs font-medium">PREMIUM</Text>
                    </View>
                )}
            </View>

            <View className="flex-row flex-wrap gap-2 mb-3">
                <View className={`${getDifficultyBg(item.difficulty)} px-3 py-1 rounded-full`}>
                    <Text className={`${getDifficultyColor(item.difficulty)} text-xs font-medium uppercase`}>
                        {item.difficulty}
                    </Text>
                </View>
                <View className="bg-blue-500/20 px-3 py-1 rounded-full">
                    <Text className="text-blue-400 text-xs font-medium">
                        {item.category.replace('_', ' ').toUpperCase()}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center justify-between pt-3 border-t border-zinc-800">
                <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center">
                        <Text className="text-zinc-500 text-xs mr-1">📝</Text>
                        <Text className="text-zinc-400 text-sm">{item.question_count} Q's</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Text className="text-zinc-500 text-xs mr-1">⏱️</Text>
                        <Text className="text-zinc-400 text-sm">{item.duration_minutes} min</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Text className="text-zinc-500 text-xs mr-1">🎯</Text>
                        <Text className="text-zinc-400 text-sm">{item.total_marks} marks</Text>
                    </View>
                </View>
                <Text className="text-blue-500 text-sm font-medium">Start →</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-zinc-400 mt-4">Loading exams...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <View className="px-6 pt-16 pb-6">
                <Text className="text-white text-3xl font-bold mb-2">Exams</Text>
                <Text className="text-zinc-400 text-base">
                    Test your knowledge and improve your skills
                </Text>
            </View>

            <FlatList
                data={exams}
                renderItem={renderExam}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 24, paddingTop: 0 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#3b82f6"
                    />
                }
                ListEmptyComponent={
                    <View className="items-center justify-center py-20">
                        <Text className="text-zinc-500 text-lg mb-2">No exams available</Text>
                        <Text className="text-zinc-600 text-sm">Check back later for new exams</Text>
                    </View>
                }
            />
        </View>
    );
}
