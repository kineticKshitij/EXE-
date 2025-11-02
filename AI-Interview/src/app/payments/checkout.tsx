import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.191:8000/api/v1';

export default function CheckoutScreen() {
    const router = useRouter();
    const { planId } = useLocalSearchParams();
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [plan, setPlan] = useState<any>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');

    const paymentMethods = [
        { id: 'credit_card', name: 'Credit Card', icon: '💳' },
        { id: 'debit_card', name: 'Debit Card', icon: '💳' },
        { id: 'upi', name: 'UPI', icon: '📱' },
        { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
        { id: 'wallet', name: 'Wallet', icon: '👛' },
    ];

    useEffect(() => {
        fetchPlan();
    }, [planId]);

    const fetchPlan = async () => {
        try {
            const response = await fetch(`${API_URL}/plans/${planId}/`, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                setPlan(data);
            }
        } catch (error) {
            console.error('Failed to fetch plan:', error);
            Alert.alert('Error', 'Failed to load plan details');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!plan) return;

        setProcessing(true);

        try {
            // Step 1: Create subscription with payment
            const createResponse = await fetch(`${API_URL}/subscriptions/create_subscription/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan_id: plan.id,
                    payment_method: selectedPaymentMethod,
                }),
            });

            if (!createResponse.ok) {
                throw new Error('Failed to create subscription');
            }

            const { subscription, payment } = await createResponse.json();

            // Step 2: Simulate payment processing
            // In production, integrate with Stripe/Razorpay here
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Step 3: Confirm payment
            const confirmResponse = await fetch(`${API_URL}/payments/confirm_payment/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payment_id: payment.id,
                    // In production, add gateway payment IDs here
                }),
            });

            if (confirmResponse.ok) {
                Alert.alert(
                    'Success!',
                    'Your subscription has been activated successfully.',
                    [
                        {
                            text: 'View Subscription',
                            onPress: () => router.replace('/payments/subscription'),
                        },
                    ]
                );
            } else {
                throw new Error('Failed to confirm payment');
            }
        } catch (error) {
            console.error('Payment error:', error);
            Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!plan) {
        return (
            <View className="flex-1 justify-center items-center bg-black px-6">
                <Text className="text-white text-xl font-bold mb-2">Plan Not Found</Text>
                <Text className="text-gray-400 text-center mb-6">
                    The selected plan could not be loaded.
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-blue-600 px-6 py-3 rounded-lg"
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
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
                <Text className="text-3xl font-bold text-white">Checkout</Text>
                <Text className="text-gray-400 mt-1">Complete your subscription</Text>
            </View>

            <ScrollView className="flex-1 px-6 py-6">
                {/* Plan Summary */}
                <View className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 mb-6">
                    <Text className="text-white text-lg font-bold mb-3">Order Summary</Text>

                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                            <Text className="text-white font-semibold text-base">{plan.name}</Text>
                            <Text className="text-gray-400 text-sm mt-1">{plan.description}</Text>
                        </View>
                    </View>

                    <View className="border-t border-zinc-800 pt-4 mt-2">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-400">Subtotal</Text>
                            <Text className="text-white">
                                {plan.currency} {parseFloat(plan.price).toFixed(2)}
                            </Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-400">Tax</Text>
                            <Text className="text-white">$0.00</Text>
                        </View>
                        <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-zinc-800">
                            <Text className="text-white font-bold text-lg">Total</Text>
                            <Text className="text-white font-bold text-2xl">
                                {plan.currency} {parseFloat(plan.price).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Payment Method Selection */}
                <View className="mb-6">
                    <Text className="text-white text-lg font-bold mb-4">Payment Method</Text>
                    {paymentMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            onPress={() => setSelectedPaymentMethod(method.id)}
                            className={`flex-row items-center p-4 rounded-xl mb-3 border ${selectedPaymentMethod === method.id
                                    ? 'bg-blue-600/20 border-blue-600'
                                    : 'bg-zinc-900 border-zinc-800'
                                }`}
                        >
                            <Text className="text-3xl mr-3">{method.icon}</Text>
                            <Text
                                className={`flex-1 font-semibold ${selectedPaymentMethod === method.id ? 'text-blue-400' : 'text-white'
                                    }`}
                            >
                                {method.name}
                            </Text>
                            {selectedPaymentMethod === method.id && (
                                <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center">
                                    <Text className="text-white text-xs">✓</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Features Reminder */}
                <View className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 mb-6">
                    <Text className="text-white text-lg font-bold mb-3">What You'll Get</Text>
                    {plan.features.map((feature: string, index: number) => (
                        <View key={index} className="flex-row items-start mb-2">
                            <Text className="text-green-500 mr-2">✓</Text>
                            <Text className="flex-1 text-gray-300">{feature}</Text>
                        </View>
                    ))}
                </View>

                {/* Terms */}
                <View className="mb-6">
                    <Text className="text-gray-400 text-sm text-center">
                        By completing this purchase, you agree to our{' '}
                        <Text className="text-blue-500">Terms of Service</Text> and{' '}
                        <Text className="text-blue-500">Privacy Policy</Text>
                    </Text>
                </View>

                {/* Pay Button */}
                <TouchableOpacity
                    onPress={handlePayment}
                    disabled={processing}
                    className={`py-4 rounded-xl mb-8 ${processing ? 'bg-blue-600/50' : 'bg-blue-600'
                        }`}
                >
                    {processing ? (
                        <View className="flex-row justify-center items-center">
                            <ActivityIndicator size="small" color="#fff" className="mr-2" />
                            <Text className="text-white font-bold text-base">Processing...</Text>
                        </View>
                    ) : (
                        <Text className="text-white font-bold text-base text-center">
                            Pay {plan.currency} {parseFloat(plan.price).toFixed(2)}
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
