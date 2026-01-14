import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { BaseColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    // Redirect based on auth status
    if (currentUser) {
      router.replace('/(tabs)/my-plan');
    } else {
      router.replace('/welcome');
    }
  }, [currentUser, isLoading]);

  // Show minimal loading while redirecting
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" color={BaseColors.main} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
