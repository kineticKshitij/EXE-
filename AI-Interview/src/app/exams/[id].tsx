import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

interface Question {
    id: number;
    question_text: string;
    question_type: string;
    options: Array<{ id: string; text: string }>;
    marks: number;
    order: number;
}

interface Exam {
    id: number;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    duration_minutes: number;
    total_marks: number;
    passing_marks: number;
    questions: Question[];
    question_count: number;
}

export default function ExamDetailScreen() {
    const { id } = useLocalSearchParams();
    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        fetchExamDetails();
    }, [id]);

    const fetchExamDetails = async () => {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/exams/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setExam(data);
        } catch (error) {
            console.error('Failed to fetch exam details:', error);
            Alert.alert('Error', 'Failed to load exam details');
        } finally {
            setLoading(false);
        }
    };

    const startExam = async () => {
        setStarting(true);
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/exams/${id}/start/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error?.includes('already have an in-progress attempt')) {
                    Alert.alert(
                        'Exam In Progress',
                        'You have an unfinished attempt for this exam. Do you want to continue?',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Continue',
                                onPress: () => router.push(`/exams/take/${data.attempt_id}`),
                            },
                        ]
                    );
                } else {
                    Alert.alert('Error', data.error || 'Failed to start exam');
                }
                return;
            }

            // Navigate to exam taking screen
            router.push(`/exams/take/${data.attempt.id}`);
        } catch (error) {
            console.error('Failed to start exam:', error);
            Alert.alert('Error', 'Failed to start exam. Please try again.');
        } finally {
            setStarting(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-green-500';
            case 'medium': return 'text-yellow-500';
            case 'hard': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!exam) {
        return (
            <View className="flex-1 bg-black items-center justify-center px-6">
                <Text className="text-white text-xl mb-4">Exam not found</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-blue-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View className="px-6 pt-16 pb-6">
                    <TouchableOpacity onPress={() => router.back()} className="mb-6">
                        <Text className="text-blue-500 text-base">← Back</Text>
                    </TouchableOpacity>

                    <Text className="text-white text-3xl font-bold mb-3">{exam.title}</Text>
                    <Text className="text-zinc-400 text-base leading-6">{exam.description}</Text>
                </View>

                {/* Stats */}
                <View className="px-6 mb-6">
                    <View className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
                        <View className="flex-row flex-wrap gap-3 mb-4">
                            <View className="bg-zinc-800 px-4 py-2 rounded-xl">
                                <Text className="text-zinc-500 text-xs mb-1">Difficulty</Text>
                                <Text className={`${getDifficultyColor(exam.difficulty)} text-sm font-semibold uppercase`}>
                                    {exam.difficulty}
                                </Text>
                            </View>
                            <View className="bg-zinc-800 px-4 py-2 rounded-xl">
                                <Text className="text-zinc-500 text-xs mb-1">Category</Text>
                                <Text className="text-blue-400 text-sm font-semibold">
                                    {exam.category.replace('_', ' ').toUpperCase()}
                                </Text>
                            </View>
                        </View>

                        <View className="border-t border-zinc-800 pt-4 flex-row justify-between">
                            <View>
                                <Text className="text-zinc-500 text-xs mb-1">Questions</Text>
                                <Text className="text-white text-lg font-bold">{exam.question_count}</Text>
                            </View>
                            <View>
                                <Text className="text-zinc-500 text-xs mb-1">Duration</Text>
                                <Text className="text-white text-lg font-bold">{exam.duration_minutes} min</Text>
                            </View>
                            <View>
                                <Text className="text-zinc-500 text-xs mb-1">Total Marks</Text>
                                <Text className="text-white text-lg font-bold">{exam.total_marks}</Text>
                            </View>
                            <View>
                                <Text className="text-zinc-500 text-xs mb-1">Passing</Text>
                                <Text className="text-white text-lg font-bold">{exam.passing_marks}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Instructions */}
                <View className="px-6 mb-6">
                    <Text className="text-white text-xl font-bold mb-3">Instructions</Text>
                    <View className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
                        <View className="mb-3">
                            <Text className="text-zinc-300 text-sm leading-6">
                                • You have {exam.duration_minutes} minutes to complete this exam
                            </Text>
                        </View>
                        <View className="mb-3">
                            <Text className="text-zinc-300 text-sm leading-6">
                                • The exam contains {exam.question_count} questions worth {exam.total_marks} marks
                            </Text>
                        </View>
                        <View className="mb-3">
                            <Text className="text-zinc-300 text-sm leading-6">
                                • You need at least {exam.passing_marks} marks to pass
                            </Text>
                        </View>
                        <View className="mb-3">
                            <Text className="text-zinc-300 text-sm leading-6">
                                • Each question can be answered only once
                            </Text>
                        </View>
                        <View>
                            <Text className="text-zinc-300 text-sm leading-6">
                                • Your progress is saved automatically
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Question Types Preview */}
                {exam.questions && exam.questions.length > 0 && (
                    <View className="px-6">
                        <Text className="text-white text-xl font-bold mb-3">Question Types</Text>
                        <View className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
                            {Array.from(new Set(exam.questions.map(q => q.question_type))).map((type) => {
                                const count = exam.questions.filter(q => q.question_type === type).length;
                                const typeLabel = type === 'mcq' ? 'Multiple Choice (Single)'
                                    : type === 'multiple' ? 'Multiple Choice (Multi)'
                                        : type === 'true_false' ? 'True/False'
                                            : type === 'short_answer' ? 'Short Answer'
                                                : type;

                                return (
                                    <View key={type} className="flex-row justify-between items-center mb-2">
                                        <Text className="text-zinc-300 text-sm">{typeLabel}</Text>
                                        <Text className="text-blue-400 text-sm font-semibold">{count} questions</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Action Button */}
            <View className="absolute bottom-0 left-0 right-0 bg-black border-t border-zinc-800 px-6 py-6">
                <TouchableOpacity
                    onPress={startExam}
                    disabled={starting}
                    className={`${starting ? 'bg-blue-600/50' : 'bg-blue-600'} rounded-xl py-4 items-center`}
                >
                    {starting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-lg font-bold">Start Exam</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
