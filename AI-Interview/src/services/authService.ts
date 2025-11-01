import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    user_type: 'student' | 'teacher' | 'recruiter' | 'admin';
}

export interface LoginData {
    username: string;
    password: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    user_type: string;
    profile_picture: string | null;
    bio: string;
    is_premium: boolean;
    created_at: string;
}

export interface AuthResponse {
    user: User;
    tokens: {
        access: string;
        refresh: string;
    };
    message: string;
}

class AuthService {
    /**
     * Register a new user
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post('/auth/register/', data);

        // Store tokens
        await this.storeTokens(response.data.tokens);

        // Store user data
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

        return response.data;
    }

    /**
     * Login user
     */
    async login(data: LoginData): Promise<AuthResponse> {
        const response = await api.post('/auth/login/', data);

        // Store tokens
        await this.storeTokens(response.data.tokens);

        // Store user data
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

        return response.data;
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (refreshToken) {
                await api.post('/auth/logout/', { refresh: refreshToken });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage
            await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
        }
    }

    /**
     * Get current user profile
     */
    async getCurrentUser(): Promise<User> {
        const response = await api.get('/users/me/');
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    }

    /**
     * Update user profile
     */
    async updateProfile(data: Partial<User>): Promise<User> {
        const response = await api.patch('/users/update_profile/', data);
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
    }

    /**
     * Change password
     */
    async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        await api.post('/users/change_password/', {
            old_password: oldPassword,
            new_password: newPassword,
            new_password_confirm: newPassword,
        });
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const token = await AsyncStorage.getItem('access_token');
        return !!token;
    }

    /**
     * Get stored user data
     */
    async getStoredUser(): Promise<User | null> {
        const userStr = await AsyncStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Store authentication tokens
     */
    private async storeTokens(tokens: { access: string; refresh: string }): Promise<void> {
        await AsyncStorage.setItem('access_token', tokens.access);
        await AsyncStorage.setItem('refresh_token', tokens.refresh);
    }
}

export default new AuthService();
