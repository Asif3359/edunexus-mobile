import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { API_ENDPOINTS, getApiUrl } from '../../../config/api';

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

interface TeacherReview {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  student?: {
    _id: string;
    name: string;
  };
  course?: {
    _id: string;
    title: string;
  };
}

const { width } = Dimensions.get('window');

export default function CourseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState<TeacherReview[]>([]);
  const [ratingSummary, setRatingSummary] = useState<{ average: number; count: number }>({
    average: 0,
    count: 0,
  });
  const [studentRating, setStudentRating] = useState(0);
  const [studentComment, setStudentComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (courseId) {
      loadCourse(courseId);
    }
  }, [courseId]);

  const loadTeacherReviews = useCallback(
    async (teacherId: string, courseIdentifier?: string) => {
      try {
        setLoadingReviews(true);
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(
          getApiUrl(API_ENDPOINTS.TEACHER_REVIEWS(teacherId)),
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to load reviews: ${response.status}`);
        }

        const data = await response.json();
        const fetchedReviews: TeacherReview[] = Array.isArray(data.reviews)
          ? data.reviews
          : Array.isArray(data)
            ? data
            : [];
        setReviews(fetchedReviews);
        const summary = data.rating ?? {};
        const nextSummary = {
          average: summary.average ?? 0,
          count: summary.count ?? fetchedReviews.length ?? 0,
        };
        setRatingSummary(nextSummary);
        setCourse((prev) =>
          prev
            ? {
                ...prev,
                rating: {
                  average:
                    summary.average ??
                    prev.rating?.average ??
                    nextSummary.average,
                  count:
                    summary.count ??
                    fetchedReviews.length ??
                    prev.rating?.count ??
                    nextSummary.count,
                },
              }
            : prev
        );

        if (user?._id) {
          const existingReview =
            fetchedReviews.find((review) => {
              const studentId =
                review.student?._id ??
                (typeof review.student === 'string' ? review.student : undefined);
              return studentId === user._id;
            }) ?? null;

          if (existingReview) {
            setStudentRating(existingReview.rating);
            setStudentComment(existingReview.comment ?? '');
          } else {
            setStudentRating(0);
            setStudentComment('');
          }
        }
      } catch (error) {
        console.error('Error loading teacher reviews:', error);
        setReviews([]);
        setRatingSummary((prev) => ({ ...prev, count: 0, average: 0 }));
      } finally {
        setLoadingReviews(false);
      }
    },
    [user?._id]
  );

  const loadCourse = useCallback(async (courseIdentifier: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        getApiUrl(API_ENDPOINTS.COURSE(courseIdentifier))
      );
      
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
        if (data?.teacher?._id) {
          await loadTeacherReviews(data.teacher._id, data._id);
        } else {
          setReviews([]);
          setRatingSummary({ average: 0, count: 0 });
        }
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
      setReviews([]);
      setRatingSummary({ average: 4.8, count: 12 });
    } finally {
      setLoading(false);
      setLoadingReviews(false);
    }
  }, [loadTeacherReviews, user?._id]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (courseId) {
      await loadCourse(courseId);
    }
    setRefreshing(false);
  };

  const handleMaterialPress = (material: Material) => {
    try {
      router.push({
        pathname: '/(student)/course/material/[materialId]',
        params: { id: courseId, materialId: material._id }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to navigate to material');
    }
  };

  const isStudentEnrolled = useMemo(() => {
    if (!course || !user?._id) {
      return false;
    }

    return course.enrolledStudents.some((enrollment) => {
      const studentValue = (enrollment as any).student;
      const studentId =
        typeof studentValue === 'string'
          ? studentValue
          : studentValue?._id ?? studentValue?.id;
      return studentId === user._id;
    });
  }, [course, user?._id]);

  const handleRatingSelect = (value: number) => {
    setStudentRating(value);
  };

  const handleSubmitReview = async () => {
    if (!user?._id || !course || !course.teacher?._id) {
      Alert.alert('Error', 'Missing user or course information.');
      return;
    }

    if (!isStudentEnrolled) {
      Alert.alert('Info', 'You need to be enrolled in this course to leave a review.');
      return;
    }

    if (studentRating < 1 || studentRating > 5) {
      Alert.alert('Error', 'Please select a rating between 1 and 5 stars.');
      return;
    }

    try {
      setSubmittingReview(true);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(
        getApiUrl(API_ENDPOINTS.TEACHER_REVIEWS(course.teacher._id)),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            studentId: user._id,
            courseId: course._id,
            rating: studentRating,
            comment: studentComment.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit review.');
      }

      const data = await response.json();
      const updatedReviews: TeacherReview[] = Array.isArray(data.reviews)
        ? data.reviews
        : Array.isArray(data)
          ? data
          : [];
      setReviews(updatedReviews);
      const summary = data.rating ?? {};
      const nextSummary = {
        average: summary.average ?? studentRating,
        count: summary.count ?? updatedReviews.length ?? 0,
      };
      setRatingSummary(nextSummary);
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              rating: {
                average:
                  summary.average ??
                  prev.rating?.average ??
                  nextSummary.average,
                count:
                  summary.count ??
                  updatedReviews.length ??
                  prev.rating?.count ??
                  nextSummary.count,
              },
            }
          : prev
      );
      setStudentComment((prev) => prev.trim());
      Alert.alert('Success', 'Your review has been submitted successfully.');
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', (error as Error).message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
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

  const renderRatingStars = (value: number, size = 18) => (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const iconName =
          value >= starValue
            ? 'star'
            : value >= starValue - 0.5
              ? 'star-half'
              : 'star-outline';
        return (
          <Ionicons
            key={starValue}
            name={iconName as any}
            size={size}
            color={colors.warning}
          />
        );
      })}
    </View>
  );

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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
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

      {/* Reviews Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Student Reviews
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.secondary }]}>
            {ratingSummary.count} total
          </Text>
        </View>

        <View style={[styles.reviewSummaryCard, { backgroundColor: colors.surface }]}>
          <View style={styles.reviewSummaryInfo}>
            <Text style={[styles.reviewAverage, { color: colors.primary }]}>
              {ratingSummary.average.toFixed(1)}
            </Text>
            {renderRatingStars(ratingSummary.average, 20)}
            <Text style={[styles.reviewCountText, { color: colors.secondary }]}>
              {ratingSummary.count} review{ratingSummary.count === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        {loadingReviews ? (
          <View style={styles.loadingReviews}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingReviewsText, { color: colors.secondary }]}>
              Loading reviews...
            </Text>
          </View>
        ) : reviews.length === 0 ? (
          <View style={[styles.noReviewsCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color={colors.icon} />
            <Text style={[styles.noReviewsText, { color: colors.secondary }]}>
              No reviews yet. Be the first to share your experience with this teacher.
            </Text>
          </View>
        ) : (
          reviews.slice(0, 5).map((review) => (
            <View key={review._id} style={[styles.reviewCard, { backgroundColor: colors.surface }]}>
              <View style={styles.reviewHeaderRow}>
                <View style={styles.reviewHeaderText}>
                  <Text style={[styles.reviewerName, { color: colors.text }]}>
                    {review.student?.name ?? 'Student'}
                  </Text>
                  <Text style={[styles.reviewDate, { color: colors.secondary }]}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                {renderRatingStars(review.rating, 16)}
              </View>
              {review.comment ? (
                <Text style={[styles.reviewComment, { color: colors.text }]}>
                  {review.comment}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </View>

      {/* Leave Review */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Leave a Review
        </Text>
        {isStudentEnrolled ? (
          <View style={[styles.leaveReviewCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.leaveReviewLabel, { color: colors.text }]}>
              Rate your experience with {course.teacher.name}
            </Text>
            <View style={styles.ratingSelectRow}>
              {Array.from({ length: 5 }).map((_, index) => {
                const starValue = index + 1;
                const iconName = starValue <= studentRating ? 'star' : 'star-outline';
                return (
                  <TouchableOpacity
                    key={starValue}
                    activeOpacity={0.8}
                    onPress={() => handleRatingSelect(starValue)}
                  >
                    <Ionicons
                      name={iconName as any}
                      size={28}
                      color={colors.warning}
                      style={styles.ratingSelectStar}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              style={[
                styles.commentInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.icon,
                },
              ]}
              placeholder="Share details about the teaching quality, communication, and course experience..."
              placeholderTextColor={colors.icon}
              multiline
              numberOfLines={4}
              value={studentComment}
              onChangeText={setStudentComment}
              maxLength={600}
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: submittingReview ? colors.secondary : colors.primary },
                submittingReview ? styles.submitButtonDisabled : null,
              ]}
              onPress={handleSubmitReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Review</Text>
              )}
            </TouchableOpacity>
            <Text style={[styles.updateHint, { color: colors.secondary }]}>
              You can update your review at any time. Submitting again will replace your previous review.
            </Text>
          </View>
        ) : (
          <View style={[styles.notEnrolledNotice, { backgroundColor: colors.surface }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.icon} />
            <Text style={[styles.notEnrolledText, { color: colors.secondary }]}>
              Enroll in this course to leave a review for the teacher.
            </Text>
          </View>
        )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
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
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewSummaryCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  reviewSummaryInfo: {
    alignItems: 'center',
    gap: 8,
  },
  reviewAverage: {
    fontSize: 36,
    fontWeight: '700',
  },
  reviewCountText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingReviews: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingReviewsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noReviewsCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  noReviewsText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  reviewHeaderText: {
    flex: 1,
    gap: 4,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  leaveReviewCard: {
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  leaveReviewLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingSelectStar: {
    marginHorizontal: 2,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  updateHint: {
    fontSize: 12,
    lineHeight: 18,
  },
  notEnrolledNotice: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notEnrolledText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
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