import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

export default function Index() {
  const { user, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Route to appropriate role-based layout
        switch (user.role) {
          case 'admin':
            router.replace('/(admin)');
            break;
          case 'teacher':
            router.replace('/(teacher)');
            break;
          case 'student':
            router.replace('/(student)');
            break;
          default:
            router.replace('/login');
        }
      } else {
        // No user logged in, go to login
        router.replace('/login');
      }
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.appTitle, { color: colors.text }]}>EduNexus</Text>
          <Text style={[styles.appSubtitle, { color: colors.icon }]}>
            Peer-to-Peer Tutoring Platform
          </Text>
          <ActivityIndicator 
            size="large" 
            color={colors.primary} 
            style={styles.loader}
          />
          <Text style={[styles.loadingText, { color: colors.icon }]}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
  },
});
