import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Backend API URL - Update this based on your environment
export const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl ||
    process.env.EXPO_PUBLIC_API_URL ||
    (__DEV__ ? 'http://127.0.0.1:8000/api/v1' : 'https://your-production-url.com/api/v1');

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await axios.post(
                        `${API_BASE_URL}/auth/token/refresh/`,
                        { refresh: refreshToken }
                    );

                    const { access } = response.data;
                    await AsyncStorage.setItem('access_token', access);

                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
                // Navigate to login screen (you'll need to implement this)
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
