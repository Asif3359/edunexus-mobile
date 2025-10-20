# EduNexus - Peer-to-Peer Tutoring Platform

A comprehensive React Native mobile application for a peer-to-peer tutoring platform where teachers can upload courses and students can purchase and enroll in them.

## Features

### 🔐 Authentication System
- **Login/Signup**: Secure authentication with role-based access
- **Role Management**: Three user roles (Admin, Teacher, Student)
- **Session Management**: Persistent login state with AsyncStorage

### 👨‍🎓 Student Features
- **Browse Courses**: View all available published courses
- **Course Details**: See course information, teacher details, and ratings
- **Enrollment**: Enroll in courses with one-click
- **Progress Tracking**: Track and update learning progress
- **Enrolled Courses**: View all enrolled courses with progress indicators

### 👨‍🏫 Teacher Features
- **Course Management**: Create, edit, and manage courses
- **Course Publishing**: Publish/unpublish courses
- **Course Analytics**: View enrollment numbers and ratings
- **Teaching Profile**: Manage teaching credentials and subjects

### 👨‍💼 Admin Features
- **User Management**: View, activate/deactivate, and delete users
- **Platform Analytics**: Comprehensive dashboard with platform statistics
- **Course Oversight**: Monitor all courses and enrollments
- **System Administration**: Full platform control and settings

### 🎨 Design & UX
- **Purple Theme**: Consistent purple, black, and white color scheme
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Responsive Design**: Optimized for various screen sizes

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Router** for navigation
- **AsyncStorage** for local data persistence
- **React Navigation** for tab navigation
- **Expo Vector Icons** for icons

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd edunexusapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   ```

## Demo Credentials

For testing purposes, you can use these demo credentials:

### Admin Access
- **Email**: admin@demo.com
- **Password**: any password
- **Features**: Full platform administration

### Teacher Access
- **Email**: teacher@demo.com
- **Password**: any password
- **Features**: Course creation and management

### Student Access
- **Email**: student@demo.com
- **Password**: any password
- **Features**: Course browsing and enrollment

## Project Structure

```
app/
├── (admin)/           # Admin role screens
│   ├── _layout.tsx    # Admin tab navigation
│   ├── index.tsx      # Admin dashboard
│   ├── users.tsx      # User management
│   └── profile.tsx    # Admin profile
├── (student)/         # Student role screens
│   ├── _layout.tsx    # Student tab navigation
│   ├── index.tsx      # Course browsing
│   ├── enrolled.tsx   # Enrolled courses
│   └── profile.tsx    # Student profile
├── (teacher)/         # Teacher role screens
│   ├── _layout.tsx    # Teacher tab navigation
│   ├── index.tsx      # Teacher's courses
│   ├── create.tsx     # Create course
│   └── profile.tsx    # Teacher profile
├── _layout.tsx        # Root layout with auth
├── index.tsx          # Authentication routing
├── login.tsx          # Login screen
└── signup.tsx         # Signup screen

contexts/
└── AuthContext.tsx    # Authentication context

constants/
└── Colors.ts          # Theme colors
```

## API Integration

The app is designed to work with the EduNexus backend API. Currently, it uses mock data for demonstration purposes. To connect to the real API:

1. Update the API endpoints in the authentication context
2. Replace mock data with actual API calls
3. Implement proper error handling and loading states

## Key Features Implementation

### Authentication Flow
- Role-based routing after login
- Persistent session management
- Secure logout functionality

### Course Management
- Comprehensive course creation form
- Course publishing/unpublishing
- Enrollment system with progress tracking

### User Management
- Search and filter users by role
- Activate/deactivate user accounts
- Delete user functionality (admin only)

### Responsive Design
- Adaptive layouts for different screen sizes
- Consistent purple theme throughout
- Smooth navigation transitions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
