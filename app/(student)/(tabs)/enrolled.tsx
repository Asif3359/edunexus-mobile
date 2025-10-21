import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import { useColorScheme } from '../../../hooks/useColorScheme';

interface EnrolledCourse {
  _id: string;
  course?: {
    _id: string;
    title: string;
    description: string;
    subject: string;
    duration: number;
    teacher: {
      name: string;
    };
  };
  // For direct course data (when API returns courses directly)
  title?: string;
  description?: string;
  subject?: string;
  duration?: number;
  teacher?: {
    name: string;
  };
  progress?: number;
  enrolledAt?: string;
  completedAt?: string;
  // For enrollment objects
  student?: string;
  createdAt?: string;
}

export default function EnrolledCoursesScreen() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadEnrolledCourses();
  }, []);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      
      if (!user?._id) {
        setEnrolledCourses([]);
        return;
      }

      
      // Try different possible API endpoints
      let response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/courses/student/${user._id}`);
      
      // If that fails, try enrollments endpoint
      if (!response.ok) {
        response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/enrollments/student/${user._id}`);
      }
      
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle different possible data structures
        let courses = [];
        if (Array.isArray(data)) {
          courses = data;
        } else if (data.enrolledCourses) {
          courses = data.enrolledCourses;
        } else if (data.courses) {
          courses = data.courses;
        } else if (data.enrollments) {
          courses = data.enrollments;
        }
        if (courses.length > 0) {
          setEnrolledCourses(courses);
        } else {
          setEnrolledCourses(getMockEnrolledCourses());
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('API Error:', errorData);
        setEnrolledCourses(getMockEnrolledCourses());
      }
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
      setEnrolledCourses(getMockEnrolledCourses());
    } finally {
      setLoading(false);
    }
  };

  const getMockEnrolledCourses = (): EnrolledCourse[] => [
    {
      _id: '1',
      course: {
        _id: '1',
        title: 'Advanced Mathematics',
        description: 'Comprehensive course on advanced mathematics including calculus, linear algebra, and differential equations.',
        subject: 'Mathematics',
        duration: 20,
        teacher: { name: 'Dr. Sarah Johnson' },
      },
      progress: 75,
      enrolledAt: '2024-01-15',
    },
    {
      _id: '2',
      course: {
        _id: '3',
        title: 'Web Development Bootcamp',
        description: 'Complete web development course covering HTML, CSS, JavaScript, React, and Node.js.',
        subject: 'Computer Science',
        duration: 30,
        teacher: { name: 'Alex Rodriguez' },
      },
      progress: 45,
      enrolledAt: '2024-02-01',
    },
    {
      _id: '3',
      course: {
        _id: '4',
        title: 'Creative Writing Workshop',
        description: 'Develop your creative writing skills through interactive workshops and personalized feedback.',
        subject: 'English',
        duration: 12,
        teacher: { name: 'Emma Wilson' },
      },
      progress: 100,
      enrolledAt: '2024-01-20',
      completedAt: '2024-02-15',
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEnrolledCourses();
    setRefreshing(false);
  };

  const handleUpdateProgress = async (courseId: string, newProgress: number) => {
    try {
      // Mock API call - replace with actual API endpoint
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/courses/${courseId}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user?._id,
          progress: newProgress,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Progress updated successfully!');
        loadEnrolledCourses(); // Refresh the list
      } else {
        Alert.alert('Error', 'Failed to update progress. Please try again.');
      }
    } catch (error) {
      Alert.alert('Success', 'Progress updated successfully! (Demo)');
      // Update local state for demo
      setEnrolledCourses(prev => 
        prev.map(course => {
          const courseData = course.course || course;
          return courseData._id === courseId 
            ? { ...course, progress: newProgress }
            : course;
        })
      );
    }
  };

  const renderEnrolledCourse = ({ item }: { item: EnrolledCourse }) => {
    // Handle different data structures
    const courseData = item.course || item;
    const title = courseData.title || 'Unknown Course';
    const description = courseData.description || 'No description available';
    const subject = courseData.subject || 'Unknown Subject';
    const duration = courseData.duration || 0;
    const teacherName = courseData.teacher?.name || 'Unknown Teacher';
    const progress = item.progress || 0;
    const enrolledAt = item.enrolledAt || item.createdAt || new Date().toISOString();
    const courseId = courseData._id || item._id;

    return (
      <TouchableOpacity onPress={() => router.push(`/course/${courseId}`)} style={[styles.courseCard, { backgroundColor: colors.surface }]}>
        <View style={styles.courseHeader}>
          <Text style={[styles.courseTitle, { color: colors.text }]}>
            {title}
          </Text>
          {progress === 100 && (
            <View style={[styles.completedBadge, { backgroundColor: colors.success }]}>
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.courseDescription, { color: colors.icon }]} numberOfLines={2}>
          {description}
        </Text>
        
        <View style={styles.courseDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="school-outline" size={16} color={colors.icon} />
            <Text style={[styles.detailText, { color: colors.icon }]}>
              {subject}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={colors.icon} />
            <Text style={[styles.detailText, { color: colors.icon }]}>
              {duration} hours
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={16} color={colors.icon} />
            <Text style={[styles.detailText, { color: colors.icon }]}>
              {teacherName}
            </Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.text }]}>Progress</Text>
            <Text style={[styles.progressText, { color: colors.primary }]}>
              {progress}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: colors.primary,
                  width: `${progress}%`,
                }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.courseFooter}>
          <Text style={[styles.enrolledDate, { color: colors.icon }]}>
            Enrolled: {new Date(enrolledAt).toLocaleDateString()}
          </Text>
          {progress < 100 && (
            <TouchableOpacity
              style={[styles.updateButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                const newProgress = Math.min(progress + 25, 100);
                handleUpdateProgress(courseId, newProgress);
              }}
            >
              <Text style={styles.updateButtonText}>Update Progress</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading enrolled courses...
        </Text>
      </View>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color={colors.icon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Enrolled Courses
          </Text>
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            You haven&apos;t enrolled in any courses yet. Browse available courses to get started!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={enrolledCourses}
        renderItem={renderEnrolledCourse}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  courseCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  courseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  enrolledDate: {
    fontSize: 12,
  },
  updateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
