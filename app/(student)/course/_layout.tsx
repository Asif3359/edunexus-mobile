import { Stack } from 'expo-router';
import React from 'react';

export default function CourseLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: 'Course',
        }}
      />
      <Stack.Screen
        name="material"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}