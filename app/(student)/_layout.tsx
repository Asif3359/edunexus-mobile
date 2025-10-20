import { Stack } from 'expo-router';
import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function StudentLayout() {
  return (
    <ProtectedRoute requiredRole="student">
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="course"
          options={{ headerShown: false }}
        />
      </Stack>
    </ProtectedRoute>
  );
}
