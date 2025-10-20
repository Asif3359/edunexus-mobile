import { Stack } from 'expo-router';
import React from 'react';

export default function MaterialLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[materialId]"
        options={{
          headerShown: true,
          title: 'Material',
        }}
      />
    </Stack>
  );
}
