import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.191:8000/api/v1';

export default function SubscriptionScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            const [subRes, paymentsRes, invoicesRes] = await Promise.all([
                fetch(`${API_URL}/subscriptions/active/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(`${API_URL}/payments/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(`${API_URL}/invoices/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }),
            ]);

            if (subRes.ok) {
                const subData = await subRes.json();
                setSubscription(subData);
            }

            if (paymentsRes.ok) {
                const paymentsData = await paymentsRes.json();
                setPayments(paymentsData);
            }

            if (invoicesRes.ok) {
                const invoicesData = await invoicesRes.json();
                setInvoices(invoicesData);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = () => {
        Alert.alert(
            'Cancel Subscription',
            'Are you sure you want to cancel your subscription? You will lose access to premium features.',
            [
                { text: 'Keep Subscription', style: 'cancel' },
                {
                    text: 'Cancel Subscription',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URL}/subscriptions/${subscription.id}/cancel/`, {
                                method: 'POST',
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                },
                            });

                            if (response.ok) {
                                Alert.alert('Success', 'Your subscription has been cancelled.');
                                fetchData();
                            } else {
                                throw new Error('Failed to cancel subscription');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const handleRenewSubscription = async () => {
        try {
            const response = await fetch(`${API_URL}/subscriptions/${subscription.id}/renew/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                Alert.alert(
                    'Renewal Initiated',
                    'Please complete the payment to renew your subscription.',
                    [
                        {
                            text: 'Pay Now',
                            onPress: () => {
                                router.push({
                                    pathname: '/payments/checkout',
                                    params: { planId: subscription.plan },
                                });
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to initiate renewal. Please try again.');
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!subscription) {
        return (
            <View className="flex-1 bg-black">
                <View className="px-6 pt-12 pb-4 border-b border-zinc-800">
                    <TouchableOpacity onPress={() => router.back()} className="mb-4">
                        <Text className="text-blue-500 text-base">← Back</Text>
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold text-white">My Subscription</Text>
                </View>

                <View className="flex-1 justify-center items-center px-6">
                    <Text className="text-6xl mb-4">📦</Text>
                    <Text className="text-white text-xl font-bold mb-2">No Active Subscription</Text>
                    <Text className="text-gray-400 text-center mb-6">
                        You don't have an active subscription. Browse our plans to get started.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/payments')}
                        className="bg-blue-600 px-6 py-3 rounded-lg"
                    >
                        <Text className="text-white font-semibold">View Plans</Text>
                    </TouchableOpacity>
                </View>
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
                <Text className="text-3xl font-bold text-white">My Subscription</Text>
                <Text className="text-gray-400 mt-1">Manage your subscription and billing</Text>
            </View>

            <ScrollView className="flex-1 px-6 py-6">
                {/* Current Plan */}
                <View className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 mb-6">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                            <Text className="text-white text-2xl font-bold">
                                {subscription.plan_details?.name}
                            </Text>
                            <Text className="text-blue-100 mt-1">{subscription.plan_details?.description}</Text>
                        </View>
                        <View
                            className={`px-3 py-1 rounded-full ${subscription.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                                }`}
                        >
                            <Text className="text-white font-bold text-xs uppercase">
                                {subscription.status}
                            </Text>
                        </View>
                    </View>

                    <View className="border-t border-white/20 pt-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-blue-100">Started</Text>
                            <Text className="text-white font-semibold">
                                {new Date(subscription.start_date).toLocaleDateString()}
                            </Text>
                        </View>
                        {subscription.end_date && (
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-blue-100">Expires</Text>
                                <Text className="text-white font-semibold">
                                    {new Date(subscription.end_date).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                        {subscription.days_remaining !== null && (
                            <View className="flex-row justify-between">
                                <Text className="text-blue-100">Days Remaining</Text>
                                <Text className="text-white font-semibold">{subscription.days_remaining} days</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Usage Stats */}
                <View className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 mb-6">
                    <Text className="text-white text-lg font-bold mb-4">Usage This Period</Text>

                    <View className="mb-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-400">Exams</Text>
                            <Text className="text-white">
                                {subscription.exams_used}
                                {subscription.plan_details?.max_exams
                                    ? ` / ${subscription.plan_details.max_exams}`
                                    : ' / Unlimited'}
                            </Text>
                        </View>
                        {subscription.plan_details?.max_exams && (
                            <View className="bg-zinc-800 h-2 rounded-full overflow-hidden">
                                <View
                                    className="bg-blue-500 h-full"
                                    style={{ width: `${subscription.usage_percentage?.exams || 0}%` }}
                                />
                            </View>
                        )}
                    </View>

                    <View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-400">Interviews</Text>
                            <Text className="text-white">
                                {subscription.interviews_used}
                                {subscription.plan_details?.max_interviews
                                    ? ` / ${subscription.plan_details.max_interviews}`
                                    : ' / Unlimited'}
                            </Text>
                        </View>
                        {subscription.plan_details?.max_interviews && (
                            <View className="bg-zinc-800 h-2 rounded-full overflow-hidden">
                                <View
                                    className="bg-purple-500 h-full"
                                    style={{ width: `${subscription.usage_percentage?.interviews || 0}%` }}
                                />
                            </View>
                        )}
                    </View>
                </View>

                {/* Actions */}
                <View className="mb-6">
                    {subscription.status === 'active' && (
                        <>
                            <TouchableOpacity
                                onPress={() => router.push('/payments')}
                                className="bg-blue-600 py-4 rounded-xl mb-3"
                            >
                                <Text className="text-white font-bold text-center">Upgrade Plan</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleCancelSubscription}
                                className="bg-zinc-900 border border-red-500 py-4 rounded-xl"
                            >
                                <Text className="text-red-500 font-bold text-center">Cancel Subscription</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {subscription.status === 'cancelled' && (
                        <TouchableOpacity
                            onPress={handleRenewSubscription}
                            className="bg-green-600 py-4 rounded-xl"
                        >
                            <Text className="text-white font-bold text-center">Renew Subscription</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Payment History */}
                {payments.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-white text-lg font-bold mb-4">Payment History</Text>
                        <View className="bg-zinc-900 rounded-xl border border-zinc-800">
                            {payments.slice(0, 5).map((payment, index) => (
                                <View
                                    key={payment.id}
                                    className={`p-4 ${index !== Math.min(4, payments.length - 1) ? 'border-b border-zinc-800' : ''}`}
                                >
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1">
                                            <Text className="text-white font-semibold mb-1">
                                                {payment.plan_name}
                                            </Text>
                                            <Text className="text-gray-400 text-sm">
                                                {new Date(payment.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-white font-bold">
                                                ${parseFloat(payment.amount).toFixed(2)}
                                            </Text>
                                            <View
                                                className={`px-2 py-1 rounded mt-1 ${payment.status === 'completed'
                                                        ? 'bg-green-500/20'
                                                        : payment.status === 'failed'
                                                            ? 'bg-red-500/20'
                                                            : 'bg-yellow-500/20'
                                                    }`}
                                            >
                                                <Text
                                                    className={`text-xs font-semibold ${payment.status === 'completed'
                                                            ? 'text-green-500'
                                                            : payment.status === 'failed'
                                                                ? 'text-red-500'
                                                                : 'text-yellow-500'
                                                        }`}
                                                >
                                                    {payment.status}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Invoices */}
                {invoices.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-white text-lg font-bold mb-4">Invoices</Text>
                        <View className="bg-zinc-900 rounded-xl border border-zinc-800">
                            {invoices.slice(0, 5).map((invoice, index) => (
                                <View
                                    key={invoice.id}
                                    className={`p-4 ${index !== Math.min(4, invoices.length - 1) ? 'border-b border-zinc-800' : ''}`}
                                >
                                    <View className="flex-row justify-between items-center">
                                        <View className="flex-1">
                                            <Text className="text-white font-semibold mb-1">
                                                {invoice.invoice_number}
                                            </Text>
                                            <Text className="text-gray-400 text-sm">
                                                {new Date(invoice.issue_date).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-white font-bold mb-1">
                                                ${parseFloat(invoice.total).toFixed(2)}
                                            </Text>
                                            <TouchableOpacity className="bg-blue-600 px-3 py-1 rounded">
                                                <Text className="text-white text-xs font-semibold">Download</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
