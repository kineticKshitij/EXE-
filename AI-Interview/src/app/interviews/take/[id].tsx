import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const API_URL = 'http://192.168.1.191:8000/api/v1';

interface Question {
    id: number;
    question_text: string;
    question_type: string;
    difficulty: string;
    expected_duration_minutes: number;
    order: number;
}

interface Interview {
    id: number;
    title: string;
    duration_minutes: number;
    questions: Question[];
    status: string;
}

export default function TakeInterviewScreen() {
    const { id } = useLocalSearchParams();
    const { token } = useAuth();
    const [interview, setInterview] = useState<Interview | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [startTime, setStartTime] = useState<{ [key: number]: number }>({});
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchInterview();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (interview && timeLeft > 0) {
            // Start timer
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Time's up - auto submit
                        handleComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [interview, timeLeft]);

    const fetchInterview = async () => {
        try {
            const [interviewRes, questionsRes] = await Promise.all([
                fetch(`${API_URL}/interviews/${id}/`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_URL}/interviews/${id}/questions/`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
            ]);

            if (interviewRes.ok && questionsRes.ok) {
                const interviewData = await interviewRes.json();
                const questionsData = await questionsRes.json();

                setInterview(interviewData);
                setQuestions(questionsData);
                setTimeLeft(interviewData.duration_minutes * 60);

                // Mark start time for first question
                setStartTime({ [questionsData[0].id]: Date.now() });
            } else {
                Alert.alert('Error', 'Failed to load interview');
                router.back();
            }
        } catch (error) {
            Alert.alert('Error', 'Network error');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleResponseChange = (text: string) => {
        const currentQuestion = questions[currentIndex];
        setResponses({ ...responses, [currentQuestion.id]: text });
    };

    const submitResponse = async (questionId: number, response: string) => {
        const timeTaken = Math.floor((Date.now() - (startTime[questionId] || Date.now())) / 1000);

        try {
            await fetch(`${API_URL}/interviews/${id}/submit_response/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question_id: questionId,
                    text_response: response,
                    time_taken_seconds: timeTaken,
                }),
            });
        } catch (error) {
            // Silent fail - will retry on complete
        }
    };

    const handleNext = async () => {
        const currentQuestion = questions[currentIndex];
        const response = responses[currentQuestion.id] || '';

        // Submit current response
        if (response.trim()) {
            await submitResponse(currentQuestion.id, response);
        }

        // Move to next question
        if (currentIndex < questions.length - 1) {
            const nextQuestion = questions[currentIndex + 1];
            setCurrentIndex(currentIndex + 1);

            // Mark start time for next question
            if (!startTime[nextQuestion.id]) {
                setStartTime({ ...startTime, [nextQuestion.id]: Date.now() });
            }
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleComplete = async () => {
        // Submit all responses
        setSubmitting(true);

        try {
            // Submit any unsaved responses
            for (const question of questions) {
                const response = responses[question.id];
                if (response && response.trim()) {
                    await submitResponse(question.id, response);
                }
            }

            // Complete the interview
            const completeRes = await fetch(`${API_URL}/interviews/${id}/complete/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (completeRes.ok) {
                router.replace(`/interviews/results/${id}`);
            } else {
                Alert.alert('Error', 'Failed to complete interview');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error');
        } finally {
            setSubmitting(false);
        }
    };

    const confirmComplete = () => {
        const answered = Object.keys(responses).filter(k => responses[parseInt(k)].trim()).length;
        const total = questions.length;

        Alert.alert(
            'Submit Interview?',
            `You have answered ${answered} out of ${total} questions.\n\nAre you sure you want to submit?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Submit', onPress: handleComplete, style: 'destructive' },
            ]
        );
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text className="text-zinc-400 mt-4">Loading interview...</Text>
            </View>
        );
    }

    if (!interview || questions.length === 0) {
        return (
            <View className="flex-1 bg-black justify-center items-center px-6">
                <Text className="text-6xl mb-4">❌</Text>
                <Text className="text-white text-xl">Interview Not Available</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-4 bg-violet-600 px-6 py-3 rounded-lg"
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const currentQuestion = questions[currentIndex];
    const answered = Object.keys(responses).filter(k => responses[parseInt(k)].trim()).length;
    const progress = ((currentIndex + 1) / questions.length) * 100;

    // Format time
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeColor = timeLeft < 60 ? 'text-red-400' : timeLeft < 300 ? 'text-yellow-400' : 'text-green-400';

    return (
        <View className="flex-1 bg-black">
            {/* Header with Timer */}
            <View className="px-6 pt-16 pb-4 border-b border-zinc-800">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-white font-bold text-xl flex-1" numberOfLines={1}>
                        {interview.title}
                    </Text>
                    <View className="bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-800">
                        <Text className={`font-bold ${timeColor}`}>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View className="bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <View
                        className="bg-violet-600 h-full"
                        style={{ width: `${progress}%` }}
                    />
                </View>
                <Text className="text-zinc-400 text-sm mt-2">
                    Question {currentIndex + 1} of {questions.length} • {answered} answered
                </Text>
            </View>

            <ScrollView className="flex-1 px-6 py-6">
                {/* Question Card */}
                <View className="bg-zinc-900 rounded-xl p-5 mb-4 border border-zinc-800">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="bg-violet-500/20 border border-violet-500/30 px-3 py-1 rounded-full">
                            <Text className="text-violet-400 text-xs font-semibold uppercase">
                                {currentQuestion.question_type}
                            </Text>
                        </View>
                        <Text className="text-zinc-500 text-sm">
                            ~{currentQuestion.expected_duration_minutes} min
                        </Text>
                    </View>

                    <Text className="text-white text-lg leading-7 mb-4">
                        {currentQuestion.question_text}
                    </Text>
                </View>

                {/* Response Input */}
                <View className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden mb-6">
                    <View className="px-4 py-3 border-b border-zinc-800">
                        <Text className="text-white font-semibold">Your Answer</Text>
                    </View>
                    <TextInput
                        className="text-white px-4 py-3 min-h-[200px]"
                        style={{ textAlignVertical: 'top' }}
                        multiline
                        placeholder="Type your answer here..."
                        placeholderTextColor="#71717a"
                        value={responses[currentQuestion.id] || ''}
                        onChangeText={handleResponseChange}
                    />
                    <View className="px-4 py-2 bg-zinc-800/50">
                        <Text className="text-zinc-500 text-xs">
                            {(responses[currentQuestion.id] || '').length} characters
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Navigation Buttons */}
            <View className="px-6 py-4 border-t border-zinc-800 bg-black">
                <View className="flex-row gap-3 mb-3">
                    <TouchableOpacity
                        onPress={handlePrevious}
                        disabled={currentIndex === 0}
                        className={`flex-1 py-3 rounded-lg border ${currentIndex === 0
                                ? 'bg-zinc-900 border-zinc-800'
                                : 'bg-zinc-900 border-zinc-700'
                            }`}
                    >
                        <Text className={`text-center font-semibold ${currentIndex === 0 ? 'text-zinc-600' : 'text-white'
                            }`}>
                            ← Previous
                        </Text>
                    </TouchableOpacity>

                    {currentIndex < questions.length - 1 ? (
                        <TouchableOpacity
                            onPress={handleNext}
                            className="flex-1 bg-violet-600 py-3 rounded-lg"
                        >
                            <Text className="text-white text-center font-semibold">Next →</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={confirmComplete}
                            disabled={submitting}
                            className="flex-1 bg-green-600 py-3 rounded-lg"
                        >
                            {submitting ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text className="text-white text-center font-semibold">Submit ✓</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    onPress={confirmComplete}
                    disabled={submitting}
                    className="py-2"
                >
                    <Text className="text-zinc-500 text-center text-sm">
                        Submit Interview Now
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
