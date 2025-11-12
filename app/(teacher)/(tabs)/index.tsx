import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_ENDPOINTS, getApiUrl } from '../../../config/api';
import { Colors } from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import { useColorScheme } from '../../../hooks/useColorScheme';

interface TeacherCourse {
  _id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  price: number;
  duration: number;
  rating: { average: number; count: number } | number;
  enrolledStudents: any[] | number;
  maxStudents: number;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function TeacherCoursesScreen() {
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const loadCourses = useCallback(async () => {
    if (!user?._id) {
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        getApiUrl(API_ENDPOINTS.TEACHER_COURSES(user._id)),
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }

      const data = await response.json();
      const normalizedCourses = Array.isArray(data) ? data : data.courses || [];
      setCourses(normalizedCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
      Alert.alert(
        'Error',
        'Unable to load your courses right now. Please pull to refresh or try again later.'
      );
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const handleTogglePublish = async (courseId: string, isPublished: boolean) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        getApiUrl(API_ENDPOINTS.COURSE_PUBLISH(courseId)),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            teacherId: user?._id,
            isPublished: !isPublished,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update course status: ${response.status}`);
      }

      Alert.alert(
        'Success',
        `Course ${!isPublished ? 'published' : 'unpublished'} successfully!`
      );
      loadCourses();
    } catch (error) {
      console.error('Error updating course status:', error);
      Alert.alert(
        'Error',
        'Failed to update course status. Please try again in a moment.'
      );
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    Alert.alert(
      'Delete Course',
      'Are you sure you want to delete this course? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(
                getApiUrl(API_ENDPOINTS.COURSE(courseId)),
                {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                }
              );
  
              const responseData = await response.json();
  
              // Check for both HTTP error status and backend error message
              if (!response.ok || responseData.error) {
                const errorMessage = responseData.message || responseData.error || `Failed to delete course: ${response.status}`;
                throw new Error(errorMessage);
              }
  
              Alert.alert('Success', 'Course deleted successfully!');
              loadCourses();
            } catch (error) {
              console.error('Error deleting course:', error);
              Alert.alert(
                'Error',
                (error as Error).message || 'Failed to delete course. Please try again in a moment.'
              );
            }
          },
        },
      ]
    );
  };

  const renderCourse = ({ item }: { item: TeacherCourse }) => {
    const ratingValue =
      typeof item.rating === 'object' ? item.rating.average : item.rating;
    const formattedRating =
      typeof ratingValue === 'number' ? ratingValue.toFixed(1) : ratingValue;
    const ratingCount =
      typeof item.rating === 'object' ? item.rating.count : null;

    return (
    <TouchableOpacity 
      style={[styles.courseCard, { backgroundColor: colors.surface }]}
      onPress={() =>
        router.push({
          pathname: '/(teacher)/course/[id]',
          params: { id: item._id },
        })
      }
    >
      <View style={styles.courseHeader}>
        <View style={styles.courseTitleContainer}>
          <Text style={[styles.courseTitle, { color: colors.text }]}>{item.title}</Text>
          {!item.isPublished && (
            <View style={[styles.draftBadge, { backgroundColor: colors.warning }]}>
              <Text style={styles.draftText}>Draft</Text>
            </View>
          )}
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={colors.warning} />
          <Text style={[styles.rating, { color: colors.text }]}>
            {formattedRating}
          </Text>
          {typeof ratingCount === 'number' && (
            <Text style={[styles.ratingCount, { color: colors.icon }]}>
              ({ratingCount})
            </Text>
          )}
          <Ionicons name="chevron-forward" size={16} color={colors.icon} style={{ marginLeft: 8 }} />
        </View>
      </View>
      
      <Text style={[styles.courseDescription, { color: colors.icon }]} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.courseDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="school-outline" size={16} color={colors.icon} />
          <Text style={[styles.detailText, { color: colors.icon }]}>{item.subject}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={colors.icon} />
          <Text style={[styles.detailText, { color: colors.icon }]}>{item.duration} hours</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={16} color={colors.icon} />
          <Text style={[styles.detailText, { color: colors.icon }]}>
            {Array.isArray(item.enrolledStudents) ? item.enrolledStudents.length : item.enrolledStudents}/{item.maxStudents}
          </Text>
        </View>
      </View>
      
      <View style={styles.courseFooter}>
        <View>
          <Text style={[styles.price, { color: colors.primary }]}>
            ${item.price}
          </Text>
          <Text style={[styles.createdDate, { color: colors.icon }]}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: item.isPublished ? colors.error : colors.success,
              },
            ]}
            onPress={() => handleTogglePublish(item._id, item.isPublished)}
          >
            <Text style={styles.actionButtonText}>
              {item.isPublished ? 'Unpublish' : 'Publish'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={() => handleDeleteCourse(item._id)}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading courses...</Text>
      </View>
    );
  }


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {courses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={64} color={colors.icon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Courses Yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
            Create your first course to get started
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(teacher)/(tabs)/create')}
          >
            <Text style={styles.createButtonText}>Create Course</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourse}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
  courseTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  draftBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  draftText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  ratingCount: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
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
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  createdDate: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
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
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
