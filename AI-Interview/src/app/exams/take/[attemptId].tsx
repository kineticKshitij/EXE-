import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

interface Question {
    id: number;
    question_text: string;
    question_type: 'mcq' | 'multiple' | 'true_false' | 'short_answer';
    options: Array<{ id: string; text: string }>;
    marks: number;
    order: number;
}

interface UserAnswers {
    [questionId: number]: string[];
}

export default function TakeExamScreen() {
    const { attemptId } = useLocalSearchParams();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<UserAnswers>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [examId, setExamId] = useState<number | null>(null);
    const { token } = useAuth();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchQuestions();
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [attemptId]);

    useEffect(() => {
        if (timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleSubmitExam();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [timeLeft]);

    const fetchQuestions = async () => {
        try {
            // First get attempt details to get exam ID
            const attemptResponse = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/attempts/${attemptId}/`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );
            const attemptData = await attemptResponse.json();
            const examIdFromAttempt = attemptData.exam?.id || attemptData.exam;
            setExamId(examIdFromAttempt);

            // Calculate time left
            if (attemptData.end_time) {
                const endTime = new Date(attemptData.end_time).getTime();
                const now = new Date().getTime();
                const secondsLeft = Math.max(0, Math.floor((endTime - now) / 1000));
                setTimeLeft(secondsLeft);
            }

            // Fetch questions
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/exams/${examIdFromAttempt}/questions/`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );
            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            Alert.alert('Error', 'Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (questionId: number, optionId: string) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        let newAnswer: string[];

        if (question.question_type === 'multiple') {
            // Multiple choice - toggle selection
            const currentAnswers = answers[questionId] || [];
            if (currentAnswers.includes(optionId)) {
                newAnswer = currentAnswers.filter(id => id !== optionId);
            } else {
                newAnswer = [...currentAnswers, optionId];
            }
        } else {
            // Single choice
            newAnswer = [optionId];
        }

        setAnswers(prev => ({ ...prev, [questionId]: newAnswer }));

        // Submit answer to backend
        try {
            await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/attempts/${attemptId}/submit_answer/`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        question_id: questionId,
                        user_answer: newAnswer,
                    }),
                }
            );
        } catch (error) {
            console.error('Failed to submit answer:', error);
        }
    };

    const handleSubmitExam = async () => {
        const answeredCount = Object.keys(answers).length;
        const totalQuestions = questions.length;

        if (answeredCount < totalQuestions) {
            Alert.alert(
                'Incomplete Exam',
                `You have answered ${answeredCount} out of ${totalQuestions} questions. Are you sure you want to submit?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Submit', onPress: () => submitExam(), style: 'destructive' },
                ]
            );
        } else {
            submitExam();
        }
    };

    const submitExam = async () => {
        setSubmitting(true);
        try {
            // Prepare answers array
            const answersArray = questions.map(q => ({
                question_id: q.id,
                user_answer: answers[q.id] || [],
                time_spent_seconds: 10,
            }));

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/attempts/${attemptId}/submit/`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ answers: answersArray }),
                }
            );

            if (response.ok) {
                router.replace(`/exams/results/${attemptId}`);
            } else {
                const error = await response.json();
                Alert.alert('Error', error.error || 'Failed to submit exam');
            }
        } catch (error) {
            console.error('Failed to submit exam:', error);
            Alert.alert('Error', 'Failed to submit exam');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimeColor = () => {
        if (timeLeft < 60) return 'text-red-500';
        if (timeLeft < 300) return 'text-yellow-500';
        return 'text-green-500';
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (questions.length === 0) {
        return (
            <View className="flex-1 bg-black items-center justify-center px-6">
                <Text className="text-white text-xl mb-4">No questions found</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-blue-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="px-6 pt-16 pb-4 border-b border-zinc-800">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-zinc-400 text-sm">
                        Question {currentIndex + 1} of {questions.length}
                    </Text>
                    <View className={`${timeLeft < 300 ? 'bg-red-500/20' : 'bg-zinc-800'} px-3 py-1 rounded-full`}>
                        <Text className={`${getTimeColor()} text-sm font-mono font-bold`}>
                            ⏱️ {formatTime(timeLeft)}
                        </Text>
                    </View>
                </View>
                <View className="bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <View
                        style={{ width: `${progress}%` }}
                        className="bg-blue-500 h-full"
                    />
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Question */}
                <View className="px-6 py-6">
                    <View className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 mb-4">
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="bg-blue-500/20 px-3 py-1 rounded-full">
                                <Text className="text-blue-400 text-xs font-medium uppercase">
                                    {currentQuestion.question_type === 'mcq' ? 'Single Choice'
                                        : currentQuestion.question_type === 'multiple' ? 'Multiple Choice'
                                            : currentQuestion.question_type === 'true_false' ? 'True/False'
                                                : 'Short Answer'}
                                </Text>
                            </View>
                            <View className="bg-amber-500/20 px-3 py-1 rounded-full">
                                <Text className="text-amber-400 text-xs font-medium">
                                    {currentQuestion.marks} marks
                                </Text>
                            </View>
                        </View>
                        <Text className="text-white text-lg leading-7">
                            {currentQuestion.question_text}
                        </Text>
                    </View>

                    {/* Options */}
                    <View className="gap-3">
                        {currentQuestion.options.map((option) => {
                            const isSelected = answers[currentQuestion.id]?.includes(option.id);
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    onPress={() => handleAnswer(currentQuestion.id, option.id)}
                                    className={`${isSelected ? 'bg-blue-600 border-blue-500' : 'bg-zinc-900 border-zinc-800'
                                        } rounded-xl p-4 border-2`}
                                >
                                    <View className="flex-row items-center">
                                        <View
                                            className={`${isSelected ? 'bg-white' : 'bg-zinc-800 border-2 border-zinc-700'
                                                } w-6 h-6 rounded-full items-center justify-center mr-3`}
                                        >
                                            {isSelected && (
                                                <Text className="text-blue-600 text-xs font-bold">✓</Text>
                                            )}
                                        </View>
                                        <Text className={`${isSelected ? 'text-white' : 'text-zinc-300'} text-base flex-1`}>
                                            {option.text}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {currentQuestion.question_type === 'multiple' && (
                        <View className="mt-4 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                            <Text className="text-blue-400 text-xs">
                                ℹ️ You can select multiple answers for this question
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Navigation */}
            <View className="absolute bottom-0 left-0 right-0 bg-black border-t border-zinc-800 px-6 py-4">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-zinc-400 text-sm">
                        Answered: {answeredCount}/{questions.length}
                    </Text>
                    {answers[currentQuestion.id] && (
                        <Text className="text-green-500 text-sm font-medium">✓ Answered</Text>
                    )}
                </View>
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                        className={`${currentIndex === 0 ? 'bg-zinc-800 opacity-50' : 'bg-zinc-800'
                            } flex-1 rounded-xl py-4 items-center`}
                    >
                        <Text className="text-white font-semibold">← Previous</Text>
                    </TouchableOpacity>

                    {currentIndex === questions.length - 1 ? (
                        <TouchableOpacity
                            onPress={handleSubmitExam}
                            disabled={submitting}
                            className={`${submitting ? 'bg-green-600/50' : 'bg-green-600'
                                } flex-1 rounded-xl py-4 items-center`}
                        >
                            {submitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold">Submit Exam</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                            className="bg-blue-600 flex-1 rounded-xl py-4 items-center"
                        >
                            <Text className="text-white font-semibold">Next →</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}
