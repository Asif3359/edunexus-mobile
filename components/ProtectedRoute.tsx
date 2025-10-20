import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { useColorScheme } from '../hooks/useColorScheme';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'student';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (!isLoading) {
      // If no user exists, redirect to login
      if (!user) {
        router.replace('/login');
        return;
      }

      // If a specific role is required and user doesn't have it, redirect to appropriate route
      if (requiredRole && user.role !== requiredRole) {
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
      }
    }
  }, [user, isLoading, requiredRole]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If no user, don't render children (will redirect)
  if (!user) {
    return null;
  }

  // If role doesn't match, don't render children (will redirect)
  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  // User is authenticated and has correct role, render children
  return <>{children}</>;
}
