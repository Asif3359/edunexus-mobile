import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import { useColorScheme } from '../../../hooks/useColorScheme';

interface Material {
  _id: string;
  title: string;
  type: 'video' | 'document' | 'link' | 'quiz';
  url: string;
  description: string;
  duration: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  price: number;
  duration: number;
  thumbnail: string;
  materials: Material[];
  requirements: string[];
  learningOutcomes: string[];
  rating: {
    average: number;
    count: number;
  };
  teacher: {
    _id: string;
    name: string;
  };
  enrolledStudents: {
    student: string;
    progress: number;
    completed: boolean;
  }[];
  maxStudents: number;
  isPublished: boolean;
  createdAt: string;
}

const { width } = Dimensions.get('window');

export default function CourseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/courses/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      } else {
        Alert.alert('Error', 'Failed to load course details');
        router.back();
      }
    } catch (error) {
      console.error('Error loading course:', error);
      // For demo purposes, create a mock course
      setCourse({
        _id: id,
        title: 'Advanced Mathematics',
        description: 'Comprehensive course on advanced mathematics including calculus, linear algebra, and differential equations. This course is designed for students who want to master complex mathematical concepts and apply them to real-world problems.',
        subject: 'Mathematics',
        level: 'advanced',
        price: 99.99,
        duration: 20,
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
        materials: [
          {
            _id: '1',
            title: 'Introduction to Calculus',
            type: 'video',
            url: 'https://example.com/video1',
            description: 'Basic concepts of calculus including limits, derivatives, and integrals',
            duration: 45,
          },
          {
            _id: '2',
            title: 'Calculus Practice Problems',
            type: 'document',
            url: 'https://example.com/pdf1',
            description: 'Practice problems for calculus with detailed solutions',
            duration: 30,
          },
          {
            _id: '3',
            title: 'Linear Algebra Fundamentals',
            type: 'video',
            url: 'https://example.com/video2',
            description: 'Introduction to matrices, vectors, and linear transformations',
            duration: 60,
          },
          {
            _id: '4',
            title: 'Algebra Quiz',
            type: 'quiz',
            url: 'https://example.com/quiz1',
            description: 'Test your knowledge of linear algebra concepts',
            duration: 20,
          },
        ],
        requirements: [
          'Basic algebra knowledge',
          'Understanding of functions',
          'Familiarity with trigonometry'
        ],
        learningOutcomes: [
          'Master calculus concepts',
          'Apply mathematical principles',
          'Solve complex problems',
          'Develop analytical thinking'
        ],
        rating: { average: 4.8, count: 12 },
        teacher: {
          _id: 'teacher1',
          name: 'Dr. Sarah Johnson'
        },
        enrolledStudents: [
          { student: user?._id || '', progress: 25, completed: false }
        ],
        maxStudents: 50,
        isPublished: true,
        createdAt: '2024-01-15',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourse();
    setRefreshing(false);
  };

  const handleMaterialPress = (material: Material) => {
    try {
      router.push({
        pathname: '/course/material/[materialId]',
        params: { id, materialId: material._id }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to navigate to material');
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'document':
        return '📄';
      case 'link':
        return '🔗';
      case 'quiz':
        return '📝';
      default:
        return '📚';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getStudentProgress = () => {
    if (!user?._id || !course) return 0;
    const enrollment = course.enrolledStudents.find(
      e => e.student === user._id
    );
    return enrollment?.progress || 0;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading course details...
        </Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Course not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen options={{ headerShown: true, title: course?.title }} />     
      {/* Course Header */}
      <View style={styles.header}>
        {course.thumbnail && (
          <Image 
            source={{ uri: course.thumbnail }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            {course.title}
          </Text>
          <Text style={[styles.subject, { color: colors.secondary }]}>
            {course.subject} • {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={[styles.rating, { color: colors.primary }]}>
              ⭐ {course.rating.average.toFixed(1)}
            </Text>
            <Text style={[styles.ratingCount, { color: colors.secondary }]}>
              ({course.rating.count} reviews)
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Progress
        </Text>
        <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.primary,
                width: `${getStudentProgress()}%`
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: colors.secondary }]}>
          {getStudentProgress()}% Complete
        </Text>
      </View>

      {/* Course Description */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          About This Course
        </Text>
        <Text style={[styles.description, { color: colors.text }]}>
          {course.description}
        </Text>
      </View>

      {/* Course Details */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Course Details
        </Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.secondary }]}>
              Duration
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDuration(course.duration * 60)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.secondary }]}>
              Students
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {course.enrolledStudents.length}/{course.maxStudents}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.secondary }]}>
              Materials
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {course.materials.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Requirements */}
      {course.requirements.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Requirements
          </Text>
          {course.requirements.map((req, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
              <Text style={[styles.listText, { color: colors.text }]}>
                {req}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Learning Outcomes */}
      {course.learningOutcomes.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            What You&apos;ll Learn
          </Text>
          {course.learningOutcomes.map((outcome, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={[styles.bullet, { color: colors.primary }]}>✓</Text>
              <Text style={[styles.listText, { color: colors.text }]}>
                {outcome}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Course Materials */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Course Materials ({course.materials.length})
        </Text>
        {course.materials.map((material) => (
          <TouchableOpacity
            key={material._id}
            style={[styles.materialCard, { backgroundColor: colors.surface }]}
            onPress={() => handleMaterialPress(material)}
            activeOpacity={0.7}
          >
            <View style={styles.materialHeader}>
              <Text style={styles.materialIcon}>
                {getMaterialIcon(material.type)}
              </Text>
              <View style={styles.materialInfo}>
                <Text style={[styles.materialTitle, { color: colors.text }]}>
                  {material.title}
                </Text>
                <Text style={[styles.materialDescription, { color: colors.secondary }]}>
                  {material.description}
                </Text>
              </View>
            </View>
            <View style={styles.materialFooter}>
              <Text style={[styles.materialDuration, { color: colors.secondary }]}>
                {formatDuration(material.duration)}
              </Text>
              <Text style={[styles.materialType, { color: colors.primary }]}>
                {material.type.toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Instructor */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Instructor
        </Text>
        <View style={[styles.instructorCard, { backgroundColor: colors.surface }]}>
          <View style={styles.instructorInfo}>
            <Text style={[styles.instructorName, { color: colors.text }]}>
              {course.teacher.name}
            </Text>
            <Text style={[styles.instructorRole, { color: colors.secondary }]}>
              Course Instructor
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  thumbnail: {
    width: width - 40,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerContent: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subject: {
    fontSize: 16,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: 14,
  },
  progressSection: {
    padding: 20,
    paddingTop: 0,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  listText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  materialCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  materialIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  materialDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  materialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialDuration: {
    fontSize: 12,
    fontWeight: '500',
  },
  materialType: {
    fontSize: 12,
    fontWeight: '600',
  },
  instructorCard: {
    padding: 16,
    borderRadius: 12,
  },
  instructorInfo: {
    gap: 4,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: '600',
  },
  instructorRole: {
    fontSize: 14,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});