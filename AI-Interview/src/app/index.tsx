import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'expo-router';
import { Chat } from "@/components/chat";
import { Navbar } from "@/components/navbar";
import { CustomCursor } from "@/components/custom-cursor";

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-950">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <View className="flex-1 bg-gray-950">
      {/* Custom Cursor (web only) */}
      {Platform.OS === 'web' && <CustomCursor />}

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <ScrollView
        className="flex-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        } as any}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="px-6 py-12 bg-gradient-to-br from-gray-900 to-gray-950">
          <View className="max-w-4xl mx-auto">
            <Text className="text-4xl font-bold text-white mb-4">
              Welcome back, {user.first_name || user.username}! 👋
            </Text>
            <Text className="text-xl text-gray-400 mb-8">
              Ready to ace your next interview? Let's get started.
            </Text>

            {/* Stats Cards */}
            <View className="flex-row flex-wrap gap-4 mb-8">
              <View className="bg-gray-800 rounded-xl p-6 flex-1 min-w-[200px] border border-gray-700">
                <Text className="text-gray-400 text-sm mb-2">Total Exams</Text>
                <Text className="text-white text-3xl font-bold">12</Text>
                <Text className="text-green-500 text-sm mt-2">+3 this week</Text>
              </View>

              <View className="bg-gray-800 rounded-xl p-6 flex-1 min-w-[200px] border border-gray-700">
                <Text className="text-gray-400 text-sm mb-2">Interviews</Text>
                <Text className="text-white text-3xl font-bold">8</Text>
                <Text className="text-blue-500 text-sm mt-2">+2 this week</Text>
              </View>

              <View className="bg-gray-800 rounded-xl p-6 flex-1 min-w-[200px] border border-gray-700">
                <Text className="text-gray-400 text-sm mb-2">Avg Score</Text>
                <Text className="text-white text-3xl font-bold">87%</Text>
                <Text className="text-yellow-500 text-sm mt-2">+5% improvement</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View className="flex-row flex-wrap gap-4">
              <TouchableOpacity className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 py-4 flex-row items-center">
                <Text className="text-white font-semibold text-lg">Start New Interview</Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-gray-800 hover:bg-gray-700 rounded-xl px-8 py-4 flex-row items-center border border-gray-700">
                <Text className="text-white font-semibold text-lg">Practice Exam</Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-gray-800 hover:bg-gray-700 rounded-xl px-8 py-4 flex-row items-center border border-gray-700">
                <Text className="text-white font-semibold text-lg">View Analytics</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* AI Chat Section - Hidden for now */}
        {/* <View className="px-6 py-8 bg-gray-950">
          <View className="max-w-4xl mx-auto">
            <Text className="text-2xl font-bold text-white mb-4">AI Assistant</Text>
            <Text className="text-gray-400 mb-6">
              Chat with our AI to get personalized interview tips and practice questions.
            </Text>
            <View className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <Chat />
            </View>
          </View>
        </View> */}

        {/* Recent Activity */}
        <View className="px-6 py-8 bg-gray-950">
          <View className="max-w-4xl mx-auto">
            <Text className="text-2xl font-bold text-white mb-6">Recent Activity</Text>

            <View className="space-y-4">
              {/* Activity Item */}
              <View className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-lg mb-2">
                      Technical Interview - Software Engineer
                    </Text>
                    <Text className="text-gray-400 mb-3">
                      Completed 2 hours ago • Duration: 45 minutes
                    </Text>
                    <View className="flex-row gap-2">
                      <View className="bg-green-500/20 px-3 py-1 rounded-full">
                        <Text className="text-green-400 text-sm">Score: 92%</Text>
                      </View>
                      <View className="bg-blue-500/20 px-3 py-1 rounded-full">
                        <Text className="text-blue-400 text-sm">Excellent Performance</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity className="bg-gray-700 px-4 py-2 rounded-lg">
                    <Text className="text-white">View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-lg mb-2">
                      Data Structures Exam
                    </Text>
                    <Text className="text-gray-400 mb-3">
                      Completed yesterday • Duration: 60 minutes
                    </Text>
                    <View className="flex-row gap-2">
                      <View className="bg-yellow-500/20 px-3 py-1 rounded-full">
                        <Text className="text-yellow-400 text-sm">Score: 85%</Text>
                      </View>
                      <View className="bg-blue-500/20 px-3 py-1 rounded-full">
                        <Text className="text-blue-400 text-sm">Good Performance</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity className="bg-gray-700 px-4 py-2 rounded-lg">
                    <Text className="text-white">View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
