import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    user_type: string;
}

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: User | null;
    loading: boolean;
    setAuth: (token: string, refreshToken: string, user: User) => Promise<void>;
    clearAuth: () => Promise<void>;
    loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    refreshToken: null,
    user: null,
    loading: true,

    setAuth: async (token, refreshToken, user) => {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        set({ token, refreshToken, user });
    },

    clearAuth: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
        set({ token: null, refreshToken: null, user: null });
    },

    loadAuth: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            set({ token, refreshToken, user, loading: false });
        } catch (error) {
            console.error('Failed to load auth:', error);
            set({ loading: false });
        }
    },
}));

export const useAuth = () => {
    const { token, refreshToken, user, loading, setAuth, clearAuth, loadAuth } = useAuthStore();

    return {
        token,
        refreshToken,
        user,
        loading,
        isAuthenticated: !!token,
        setAuth,
        clearAuth,
        loadAuth,
    };
};
