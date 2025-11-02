import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const API_URL = 'http://192.168.1.191:8000/api/v1';

interface Template {
    id: number;
    title: string;
    description: string;
    interview_type: string;
    difficulty: string;
    duration_minutes: number;
    questions: any[];
    times_used: number;
    is_premium: boolean;
}

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
        case 'easy':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'medium':
            return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'hard':
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        default:
            return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'technical':
            return '💻';
        case 'behavioral':
            return '👥';
        case 'system_design':
            return '🏗️';
        case 'coding':
            return '⌨️';
        case 'hr':
            return '🤝';
        default:
            return '📋';
    }
};

export default function TemplatesScreen() {
    const { token } = useAuth();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [creatingFrom, setCreatingFrom] = useState<number | null>(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch(`${API_URL}/templates/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            } else {
                Alert.alert('Error', 'Failed to fetch templates');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const useTemplate = async (templateId: number) => {
        setCreatingFrom(templateId);

        try {
            const response = await fetch(`${API_URL}/templates/${templateId}/use_template/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    job_role: 'Software Engineer',
                    company_name: '',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                Alert.alert(
                    'Success',
                    'Interview created successfully!',
                    [
                        {
                            text: 'View Interview',
                            onPress: () => router.push(`/interviews/${data.interview.id}`),
                        },
                    ]
                );
            } else {
                Alert.alert('Error', 'Failed to create interview from template');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setCreatingFrom(null);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <ActivityIndicator size="large" color="#8b5cf6" />
                <Text className="text-zinc-400 mt-4">Loading templates...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="px-6 pt-16 pb-4 border-b border-zinc-800">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mb-4"
                >
                    <Text className="text-violet-500 text-lg">← Back</Text>
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-white mb-2">📚 Templates</Text>
                <Text className="text-zinc-400">Choose a template to start your interview</Text>
            </View>

            {/* Templates List */}
            <ScrollView className="flex-1 px-6">
                <View className="py-4">
                    {templates.map((template) => (
                        <View
                            key={template.id}
                            className="bg-zinc-900 rounded-xl p-5 mb-4 border border-zinc-800"
                        >
                            {/* Header */}
                            <View className="flex-row items-start justify-between mb-3">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-2">
                                        <Text className="text-2xl mr-2">{getTypeIcon(template.interview_type)}</Text>
                                        <Text className="text-white font-bold text-xl flex-1" numberOfLines={2}>
                                            {template.title}
                                        </Text>
                                    </View>
                                    {template.is_premium && (
                                        <View className="bg-amber-500/20 border border-amber-500/30 px-2 py-1 rounded-full self-start">
                                            <Text className="text-amber-400 text-xs font-semibold">⭐ PREMIUM</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Description */}
                            <Text className="text-zinc-400 mb-4 leading-5">
                                {template.description}
                            </Text>

                            {/* Info Row */}
                            <View className="flex-row items-center flex-wrap gap-3 mb-4">
                                {/* Difficulty */}
                                <View className={`px-2 py-1 rounded border ${getDifficultyColor(template.difficulty)}`}>
                                    <Text className={`text-xs font-semibold capitalize ${getDifficultyColor(template.difficulty).split(' ')[1]}`}>
                                        {template.difficulty}
                                    </Text>
                                </View>

                                {/* Type */}
                                <Text className="text-zinc-500 text-sm capitalize">
                                    {template.interview_type.replace('_', ' ')}
                                </Text>

                                {/* Duration */}
                                <Text className="text-zinc-500 text-sm">
                                    ⏱️ {template.duration_minutes} min
                                </Text>

                                {/* Questions */}
                                <Text className="text-zinc-500 text-sm">
                                    ❓ {template.questions.length} questions
                                </Text>
                            </View>

                            {/* Stats */}
                            <View className="flex-row items-center justify-between pt-3 border-t border-zinc-800 mb-4">
                                <Text className="text-zinc-500 text-sm">
                                    Used {template.times_used} times
                                </Text>
                            </View>

                            {/* Action Button */}
                            <TouchableOpacity
                                onPress={() => useTemplate(template.id)}
                                disabled={creatingFrom === template.id}
                                className={`py-3 rounded-lg ${creatingFrom === template.id
                                        ? 'bg-zinc-800'
                                        : 'bg-violet-600'
                                    }`}
                            >
                                {creatingFrom === template.id ? (
                                    <View className="flex-row items-center justify-center">
                                        <ActivityIndicator size="small" color="#ffffff" />
                                        <Text className="text-white font-semibold ml-2">Creating...</Text>
                                    </View>
                                ) : (
                                    <Text className="text-white font-semibold text-center">Use This Template</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                <View className="h-8" />
            </ScrollView>
        </View>
    );
}
