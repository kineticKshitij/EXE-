import { Stack } from 'expo-router';

export default function AnalyticsLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#000',
                },
                headerTintColor: '#fff',
                headerShown: false,
            }}
        />
    );
}
