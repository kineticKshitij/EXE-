import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

interface Answer {
    id: number;
    question: {
        id: number;
        question_text: string;
        question_type: string;
        options: Array<{ id: string; text: string }>;
        explanation: string;
    };
    user_answer: string[];
    is_correct: boolean;
    marks_awarded: number;
}

interface Results {
    id: number;
    exam: {
        id: number;
        title: string;
        difficulty: string;
        category: string;
    };
    status: string;
    marks_obtained: number;
    total_marks: number;
    percentage: number;
    is_passed: boolean;
    time_taken_minutes: number;
    answers: Answer[];
}

export default function ExamResultsScreen() {
    const { attemptId } = useLocalSearchParams();
    const [results, setResults] = useState<Results | null>(null);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        fetchResults();
    }, [attemptId]);

    const fetchResults = async () => {
        try {
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/attempts/${attemptId}/results/`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error('Failed to fetch results:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!results) {
        return (
            <View className="flex-1 bg-black items-center justify-center px-6">
                <Text className="text-white text-xl mb-4">Results not found</Text>
                <TouchableOpacity
                    onPress={() => router.push('/exams')}
                    className="bg-blue-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-semibold">Go to Exams</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const correctAnswers = results.answers.filter(a => a.is_correct).length;
    const totalQuestions = results.answers.length;

    return (
        <View className="flex-1 bg-black">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View className="px-6 pt-16 pb-6">
                    <Text className="text-white text-3xl font-bold mb-2">Exam Results</Text>
                    <Text className="text-zinc-400 text-base">{results.exam.title}</Text>
                </View>

                {/* Score Card */}
                <View className="px-6 mb-6">
                    <View className={`${results.is_passed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                        } rounded-2xl p-6 border-2`}>
                        <View className="items-center mb-4">
                            <Text className={`${results.is_passed ? 'text-green-500' : 'text-red-500'
                                } text-6xl font-bold mb-2`}>
                                {Math.round(results.percentage)}%
                            </Text>
                            <Text className={`${results.is_passed ? 'text-green-500' : 'text-red-500'
                                } text-2xl font-bold mb-1`}>
                                {results.is_passed ? '✓ PASSED' : '✗ FAILED'}
                            </Text>
                            <Text className="text-zinc-400 text-base">
                                {results.marks_obtained} / {results.total_marks} marks
                            </Text>
                        </View>

                        <View className="border-t border-zinc-700 pt-4 flex-row justify-around">
                            <View className="items-center">
                                <Text className="text-zinc-500 text-xs mb-1">Correct</Text>
                                <Text className="text-white text-xl font-bold">{correctAnswers}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-zinc-500 text-xs mb-1">Wrong</Text>
                                <Text className="text-white text-xl font-bold">{totalQuestions - correctAnswers}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-zinc-500 text-xs mb-1">Time</Text>
                                <Text className="text-white text-xl font-bold">{results.time_taken_minutes}m</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Performance Stats */}
                <View className="px-6 mb-6">
                    <Text className="text-white text-xl font-bold mb-3">Performance</Text>
                    <View className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-zinc-400 text-sm">Accuracy</Text>
                            <Text className="text-white font-semibold">
                                {Math.round((correctAnswers / totalQuestions) * 100)}%
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-zinc-400 text-sm">Average Time per Question</Text>
                            <Text className="text-white font-semibold">
                                {Math.round((results.time_taken_minutes * 60) / totalQuestions)}s
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                            <Text className="text-zinc-400 text-sm">Difficulty</Text>
                            <Text className="text-white font-semibold capitalize">
                                {results.exam.difficulty}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Detailed Answers */}
                <View className="px-6 mb-6">
                    <Text className="text-white text-xl font-bold mb-3">Review Answers</Text>
                    {results.answers.map((answer, index) => (
                        <View
                            key={answer.id}
                            className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 mb-4"
                        >
                            <View className="flex-row items-start justify-between mb-3">
                                <Text className="text-zinc-500 text-sm">Question {index + 1}</Text>
                                <View
                                    className={`${answer.is_correct ? 'bg-green-500/20' : 'bg-red-500/20'
                                        } px-3 py-1 rounded-full`}
                                >
                                    <Text
                                        className={`${answer.is_correct ? 'text-green-500' : 'text-red-500'
                                            } text-xs font-medium`}
                                    >
                                        {answer.is_correct ? '✓ Correct' : '✗ Wrong'} ({answer.marks_awarded} marks)
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-white text-base mb-3 leading-6">
                                {answer.question.question_text}
                            </Text>

                            <View className="gap-2">
                                {answer.question.options.map((option) => {
                                    const isUserAnswer = answer.user_answer.includes(option.id);
                                    const isCorrect = answer.is_correct && isUserAnswer;
                                    const isWrong = !answer.is_correct && isUserAnswer;

                                    return (
                                        <View
                                            key={option.id}
                                            className={`${isCorrect ? 'bg-green-500/20 border-green-500/50'
                                                : isWrong ? 'bg-red-500/20 border-red-500/50'
                                                    : 'bg-zinc-800 border-zinc-700'
                                                } rounded-xl p-3 border`}
                                        >
                                            <View className="flex-row items-center">
                                                {isUserAnswer && (
                                                    <Text className="mr-2">
                                                        {isCorrect ? '✓' : '✗'}
                                                    </Text>
                                                )}
                                                <Text
                                                    className={`${isCorrect ? 'text-green-400'
                                                        : isWrong ? 'text-red-400'
                                                            : 'text-zinc-400'
                                                        } flex-1`}
                                                >
                                                    {option.text}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>

                            {answer.question.explanation && (
                                <View className="mt-3 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                                    <Text className="text-blue-400 text-xs font-medium mb-1">
                                        💡 Explanation
                                    </Text>
                                    <Text className="text-zinc-300 text-sm leading-5">
                                        {answer.question.explanation}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View className="absolute bottom-0 left-0 right-0 bg-black border-t border-zinc-800 px-6 py-6">
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={() => router.push('/exams')}
                        className="bg-zinc-800 flex-1 rounded-xl py-4 items-center"
                    >
                        <Text className="text-white font-semibold">Browse Exams</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push(`/exams/${results.exam.id}`)}
                        className="bg-blue-600 flex-1 rounded-xl py-4 items-center"
                    >
                        <Text className="text-white font-semibold">Try Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
