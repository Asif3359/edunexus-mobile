import { Platform } from 'react-native';

// API Configuration for different environments
const API_CONFIG = {
  // For Android Emulator
  ANDROID_EMULATOR: 'http://10.0.2.2:3000',
  // For iOS Simulator
  IOS_SIMULATOR: 'http://localhost:3000',
  // For physical device (replace with your computer's IP address)
  PHYSICAL_DEVICE: 'http://192.168.0.115:3000', // Your computer's IP address
  // For production - use environment variable or fallback
  PRODUCTION: 'https://edunexusbackend-mntx.onrender.com',
} as const;

// Detect the platform and return appropriate base URL
export const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.length > 0) {
    return envUrl;
  }

  if (__DEV__) {
    if (Platform.OS === 'android') {
      return API_CONFIG.ANDROID_EMULATOR;
    }
    if (Platform.OS === 'ios') {
      return API_CONFIG.IOS_SIMULATOR;
    }
    return API_CONFIG.PHYSICAL_DEVICE;
  }

  return API_CONFIG.PRODUCTION;
};

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  PROFILE: '/api/auth/profile',
  USERS: '/api/users',
  COURSES: '/api/courses',
  COURSE: (courseId: string) => `/api/courses/${courseId}`,
  COURSE_PUBLISH: (courseId: string) => `/api/courses/${courseId}/publish`,
  COURSE_MATERIALS: (courseId: string) => `/api/courses/${courseId}/materials`,
  COURSE_MATERIAL: (courseId: string, materialId: string) =>
    `/api/courses/${courseId}/materials/${materialId}`,
  TEACHER_COURSES: (teacherId: string) => `/api/courses/teacher/${teacherId}`,
  TEACHER_STATS: (teacherId: string) => `/api/teachers/${teacherId}/stats`,
  TEACHER_REVIEWS: (teacherId: string) => `/api/teachers/${teacherId}/reviews`,
  TEACHER_REVIEW: (teacherId: string, reviewId?: string) =>
    `/api/teachers/${teacherId}/reviews${reviewId ? `/${reviewId}` : ''}`,
  ADMIN_STATS: '/api/admin/stats',
} as const;

export const getApiUrl = (endpoint: string) => {
  return `${getApiBaseUrl()}${endpoint}`;
};
