import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.191:8000/api/v1';

interface PaymentPlan {
    id: number;
    name: string;
    description: string;
    plan_type: string;
    billing_period: string;
    price: string;
    currency: string;
    max_exams: number | null;
    max_interviews: number | null;
    ai_feedback_enabled: boolean;
    advanced_analytics: boolean;
    priority_support: boolean;
    is_featured: boolean;
    features: string[];
}

export default function PlansScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<PaymentPlan[]>([]);
    const [activeSubscription, setActiveSubscription] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            const [plansRes, subRes] = await Promise.all([
                fetch(`${API_URL}/plans/`, {
                    headers: { 'Content-Type': 'application/json' },
                }),
                fetch(`${API_URL}/subscriptions/active/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }),
            ]);

            if (plansRes.ok) {
                const plansData = await plansRes.json();
                setPlans(plansData);
            }

            if (subRes.ok) {
                const subData = await subRes.json();
                setActiveSubscription(subData);
            }
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (plan: PaymentPlan) => {
        router.push({
            pathname: '/payments/checkout',
            params: { planId: plan.id },
        });
    };

    const getBillingLabel = (period: string) => {
        const labels: Record<string, string> = {
            monthly: '/month',
            quarterly: '/quarter',
            yearly: '/year',
            lifetime: 'one-time',
        };
        return labels[period] || '';
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
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Text className="text-blue-500 text-base">← Back</Text>
                </TouchableOpacity>
                <Text className="text-3xl font-bold text-white">Choose Your Plan</Text>
                <Text className="text-gray-400 mt-1">Unlock premium features and unlimited access</Text>
            </View>

            {/* Current Subscription Banner */}
            {activeSubscription && (
                <View className="mx-6 mt-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-5">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                            <Text className="text-white font-bold text-lg mb-1">
                                {activeSubscription.plan_details?.name}
                            </Text>
                            <Text className="text-blue-100 text-sm">
                                {activeSubscription.status === 'active' ? 'Active' : activeSubscription.status}
                                {activeSubscription.days_remaining !== null &&
                                    ` • ${activeSubscription.days_remaining} days left`}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/payments/subscription')}
                            className="bg-white/20 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white font-semibold">Manage</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <ScrollView className="flex-1 px-6 py-6">
                {/* Featured Plans Section */}
                {plans.some((p) => p.is_featured) && (
                    <View className="mb-6">
                        <Text className="text-xl font-bold text-white mb-4">⭐ Featured Plans</Text>
                        {plans
                            .filter((p) => p.is_featured)
                            .map((plan) => (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    onSelect={handleSelectPlan}
                                    getBillingLabel={getBillingLabel}
                                    isFeatured
                                />
                            ))}
                    </View>
                )}

                {/* All Plans Section */}
                <Text className="text-xl font-bold text-white mb-4">All Plans</Text>
                {plans
                    .filter((p) => !p.is_featured)
                    .map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            onSelect={handleSelectPlan}
                            getBillingLabel={getBillingLabel}
                        />
                    ))}
            </ScrollView>
        </View>
    );
}

interface PlanCardProps {
    plan: PaymentPlan;
    onSelect: (plan: PaymentPlan) => void;
    getBillingLabel: (period: string) => string;
    isFeatured?: boolean;
}

function PlanCard({ plan, onSelect, getBillingLabel, isFeatured }: PlanCardProps) {
    return (
        <View
            className={`rounded-xl p-6 mb-4 ${isFeatured
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-2 border-purple-400'
                    : 'bg-zinc-900 border border-zinc-800'
                }`}
        >
            {/* Plan Header */}
            <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                    <Text className={`text-2xl font-bold ${isFeatured ? 'text-white' : 'text-white'}`}>
                        {plan.name}
                    </Text>
                    <Text className={`text-sm mt-1 ${isFeatured ? 'text-blue-100' : 'text-gray-400'}`}>
                        {plan.description}
                    </Text>
                </View>
                {isFeatured && (
                    <View className="bg-yellow-400 px-3 py-1 rounded-full">
                        <Text className="text-black font-bold text-xs">POPULAR</Text>
                    </View>
                )}
            </View>

            {/* Price */}
            <View className="mb-4">
                <View className="flex-row items-baseline">
                    <Text className={`text-sm ${isFeatured ? 'text-blue-100' : 'text-gray-400'}`}>
                        {plan.currency}
                    </Text>
                    <Text className={`text-4xl font-bold ml-1 ${isFeatured ? 'text-white' : 'text-white'}`}>
                        {parseFloat(plan.price).toFixed(2)}
                    </Text>
                    <Text className={`text-sm ml-2 ${isFeatured ? 'text-blue-100' : 'text-gray-400'}`}>
                        {getBillingLabel(plan.billing_period)}
                    </Text>
                </View>
            </View>

            {/* Features */}
            <View className="mb-6">
                {plan.features.map((feature, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                        <Text className={`mr-2 ${isFeatured ? 'text-blue-100' : 'text-green-500'}`}>✓</Text>
                        <Text className={`flex-1 ${isFeatured ? 'text-blue-50' : 'text-gray-300'}`}>
                            {feature}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Select Button */}
            <TouchableOpacity
                onPress={() => onSelect(plan)}
                className={`py-4 rounded-lg ${isFeatured ? 'bg-white' : 'bg-blue-600'
                    }`}
            >
                <Text
                    className={`text-center font-bold text-base ${isFeatured ? 'text-blue-600' : 'text-white'
                        }`}
                >
                    {parseFloat(plan.price) === 0 ? 'Get Started Free' : 'Subscribe Now'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
