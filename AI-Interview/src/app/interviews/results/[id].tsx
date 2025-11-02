import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const API_URL = 'http://192.168.1.191:8000/api/v1';

interface Response {
    id: number;
    question: {
        id: number;
        question_text: string;
        question_type: string;
        difficulty: string;
    };
    text_response: string;
    score: number;
    ai_feedback: string;
    evaluation_metrics: {
        clarity?: number;
        relevance?: number;
        depth?: number;
        technical_accuracy?: number;
    };
    time_taken_seconds: number;
}

interface Results {
    id: number;
    title: string;
    interview_type: string;
    difficulty: string;
    job_role: string;
    total_score: number;
    max_score: number;
    percentage: number;
    overall_feedback: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    responses: Response[];
}

export default function InterviewResultsScreen() {
    const { id } = useLocalSearchParams();
    const { token } = useAuth();
    const [results, setResults] = useState<Results | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const response = await fetch(`${API_URL}/interviews/${id}/results/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setResults(data);
            } else {
                Alert.alert('Error', 'Failed to fetch results');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text className="text-zinc-400 mt-4">Loading results...</Text>
            </View>
        );
    }

    if (!results) {
        return (
            <View className="flex-1 bg-black justify-center items-center px-6">
                <Text className="text-6xl mb-4">❌</Text>
                <Text className="text-white text-xl">Results Not Available</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-4 bg-violet-600 px-6 py-3 rounded-lg"
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const scoreColor = results.percentage >= 80 ? 'text-green-400' :
        results.percentage >= 60 ? 'text-yellow-400' : 'text-red-400';

    const scoreLabel = results.percentage >= 80 ? '🎉 Excellent!' :
        results.percentage >= 60 ? '👍 Good!' : '💪 Keep Practicing';

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="px-6 pt-16 pb-4 border-b border-zinc-800">
                <TouchableOpacity
                    onPress={() => router.push('/interviews')}
                    className="mb-4"
                >
                    <Text className="text-violet-500 text-lg">← Back to Interviews</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-white">Interview Results</Text>
            </View>

            <ScrollView className="flex-1 px-6">
                <View className="py-6">
                    {/* Score Card */}
                    <View className="bg-gradient-to-br from-violet-900/30 to-violet-700/30 rounded-2xl p-6 mb-6 border border-violet-500/30">
                        <Text className="text-center text-violet-300 text-lg mb-2">{scoreLabel}</Text>
                        <Text className={`text-center text-7xl font-bold mb-2 ${scoreColor}`}>
                            {results.percentage.toFixed(0)}%
                        </Text>
                        <View className="flex-row justify-center items-center">
                            <Text className="text-zinc-400 text-center">
                                {results.total_score.toFixed(1)} / {results.max_score.toFixed(1)} points
                            </Text>
                        </View>
                        <View className="bg-zinc-800 h-3 rounded-full mt-4 overflow-hidden">
                            <View
                                className={`h-full rounded-full ${results.percentage >= 80 ? 'bg-green-500' :
                                        results.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${results.percentage}%` }}
                            />
                        </View>
                    </View>

                    {/* Interview Info */}
                    <View className="bg-zinc-900 rounded-xl p-4 mb-4 border border-zinc-800">
                        <Text className="text-white font-bold text-lg mb-3">{results.title}</Text>
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-zinc-400">Job Role:</Text>
                            <Text className="text-white font-medium">{results.job_role}</Text>
                        </View>
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-zinc-400">Difficulty:</Text>
                            <Text className={`font-medium capitalize ${results.difficulty === 'easy' ? 'text-green-400' :
                                    results.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                {results.difficulty}
                            </Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                            <Text className="text-zinc-400">Questions Answered:</Text>
                            <Text className="text-white font-medium">{results.responses.length}</Text>
                        </View>
                    </View>

                    {/* Overall Feedback */}
                    {results.overall_feedback && (
                        <View className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                            <Text className="text-blue-400 font-semibold mb-2">💬 Overall Feedback</Text>
                            <Text className="text-blue-200/90 leading-6">{results.overall_feedback}</Text>
                        </View>
                    )}

                    {/* Strengths */}
                    {results.strengths && results.strengths.length > 0 && (
                        <View className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                            <Text className="text-green-400 font-semibold mb-3">✅ Strengths</Text>
                            {results.strengths.map((strength, index) => (
                                <View key={index} className="flex-row items-start mb-2">
                                    <Text className="text-green-400 mr-2">•</Text>
                                    <Text className="text-green-200/90 flex-1">{strength}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Weaknesses */}
                    {results.weaknesses && results.weaknesses.length > 0 && (
                        <View className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
                            <Text className="text-amber-400 font-semibold mb-3">⚠️ Areas to Improve</Text>
                            {results.weaknesses.map((weakness, index) => (
                                <View key={index} className="flex-row items-start mb-2">
                                    <Text className="text-amber-400 mr-2">•</Text>
                                    <Text className="text-amber-200/90 flex-1">{weakness}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Recommendations */}
                    {results.recommendations && results.recommendations.length > 0 && (
                        <View className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 mb-6">
                            <Text className="text-violet-400 font-semibold mb-3">💡 Recommendations</Text>
                            {results.recommendations.map((recommendation, index) => (
                                <View key={index} className="flex-row items-start mb-2">
                                    <Text className="text-violet-400 mr-2">•</Text>
                                    <Text className="text-violet-200/90 flex-1">{recommendation}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Detailed Responses */}
                    <Text className="text-white font-bold text-xl mb-4">📝 Question Review</Text>

                    {results.responses.map((response, index) => (
                        <View
                            key={response.id}
                            className="bg-zinc-900 rounded-xl p-4 mb-4 border border-zinc-800"
                        >
                            {/* Question Header */}
                            <View className="flex-row items-start justify-between mb-3">
                                <View className="flex-1">
                                    <Text className="text-zinc-500 text-sm mb-1">Question {index + 1}</Text>
                                    <Text className="text-white leading-6 mb-2">
                                        {response.question.question_text}
                                    </Text>
                                    <View className="flex-row gap-2">
                                        <View className="bg-zinc-800 px-2 py-1 rounded">
                                            <Text className="text-zinc-400 text-xs capitalize">
                                                {response.question.question_type}
                                            </Text>
                                        </View>
                                        <View className="bg-zinc-800 px-2 py-1 rounded">
                                            <Text className="text-zinc-400 text-xs">
                                                {Math.floor(response.time_taken_seconds / 60)}:{String(response.time_taken_seconds % 60).padStart(2, '0')}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Score */}
                                <View className="ml-3 items-center">
                                    <Text className={`text-2xl font-bold ${response.score >= 8 ? 'text-green-400' :
                                            response.score >= 6 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {response.score.toFixed(1)}
                                    </Text>
                                    <Text className="text-zinc-500 text-xs">/ 10</Text>
                                </View>
                            </View>

                            {/* Your Answer */}
                            <View className="bg-zinc-800 rounded-lg p-3 mb-3">
                                <Text className="text-zinc-400 text-sm mb-2">Your Answer:</Text>
                                <Text className="text-white leading-5">
                                    {response.text_response || 'No answer provided'}
                                </Text>
                            </View>

                            {/* AI Feedback */}
                            {response.ai_feedback && (
                                <View className="bg-blue-500/10 rounded-lg p-3 mb-3">
                                    <Text className="text-blue-400 text-sm font-semibold mb-1">AI Feedback:</Text>
                                    <Text className="text-blue-200/90 leading-5">{response.ai_feedback}</Text>
                                </View>
                            )}

                            {/* Evaluation Metrics */}
                            {response.evaluation_metrics && Object.keys(response.evaluation_metrics).length > 0 && (
                                <View>
                                    <Text className="text-zinc-400 text-sm mb-2">Evaluation Breakdown:</Text>
                                    {Object.entries(response.evaluation_metrics).map(([metric, score]) => (
                                        <View key={metric} className="flex-row items-center justify-between mb-2">
                                            <Text className="text-zinc-400 text-sm capitalize">
                                                {metric.replace('_', ' ')}:
                                            </Text>
                                            <View className="flex-row items-center">
                                                <View className="w-24 h-2 bg-zinc-800 rounded-full mr-2 overflow-hidden">
                                                    <View
                                                        className={`h-full rounded-full ${score >= 8 ? 'bg-green-500' :
                                                                score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${(score / 10) * 100}%` }}
                                                    />
                                                </View>
                                                <Text className="text-white text-sm font-medium w-8">
                                                    {score}/10
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}

                    {/* Action Buttons */}
                    <View className="gap-3 mb-8">
                        <TouchableOpacity
                            onPress={() => router.push(`/interviews/${id}`)}
                            className="bg-violet-600 py-4 rounded-xl"
                        >
                            <Text className="text-white font-bold text-center text-lg">Try Again</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/interviews')}
                            className="bg-zinc-800 py-4 rounded-xl border border-zinc-700"
                        >
                            <Text className="text-white font-semibold text-center">Browse More Interviews</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
