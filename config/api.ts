// API Configuration for different environments
const API_CONFIG = {
  // For Android Emulator
  ANDROID_EMULATOR: 'http://10.0.2.2:3000',
  // For iOS Simulator
  IOS_SIMULATOR: 'http://localhost:3000',
  // For physical device (replace with your computer's IP address)
  PHYSICAL_DEVICE: 'http://192.168.0.115:3000', // Your computer's IP address
  // For production - use environment variable or fallback
  PRODUCTION: 'https://edunexusbackend.onrender.com',
};

// Detect the platform and return appropriate base URL
export const getApiBaseUrl = () => {
  // Check if we're in production mode
  if (__DEV__ === false) {
    return API_CONFIG.PRODUCTION;
  }
  
  // For development, you can add platform detection logic here
  // For now, we'll use Android emulator as default
  return API_CONFIG.PRODUCTION;
};

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  PROFILE: '/api/auth/profile',
  USERS: '/api/users',
  COURSES: '/api/courses',
  COURSE_MATERIALS: '/api/courses/:id/materials',
};

export const getApiUrl = (endpoint: string) => {
  return `${getApiBaseUrl()}${endpoint}`;
};
