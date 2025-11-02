import { Stack } from 'expo-router';

export default function ExamsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#000' },
            }}
        />
    );
}
