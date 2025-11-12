import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { API_ENDPOINTS, getApiUrl } from '../../../config/api';

interface TeacherStats {
  totalStudents: number;
  activeCourses: number;
  averageRating: number;
  reviewCount: number;
}

interface TeacherReview {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  student?: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  course?: {
    _id: string;
    title: string;
  };
}

export default function TeacherProfileScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [ratingSummary, setRatingSummary] = useState<{ average: number; count: number }>({
    average: 0,
    count: 0,
  });
  const [reviews, setReviews] = useState<TeacherReview[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTeacherStats = useCallback(async () => {
    if (!user?._id) {
      return;
    }

    try {
      setLoadingStats(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        getApiUrl(API_ENDPOINTS.TEACHER_STATS(user._id)),
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch teacher stats: ${response.status}`);
      }

      const data = await response.json();
      const statsPayload = data.stats ?? data;
      setStats({
        totalStudents: statsPayload.totalStudents ?? 0,
        activeCourses: statsPayload.activeCourses ?? 0,
        averageRating: statsPayload.averageRating ?? statsPayload.rating?.average ?? 0,
        reviewCount: statsPayload.reviewCount ?? statsPayload.rating?.count ?? 0,
      });
      setRatingSummary({
        average: statsPayload.averageRating ?? statsPayload.rating?.average ?? 0,
        count: statsPayload.reviewCount ?? statsPayload.rating?.count ?? 0,
      });
    } catch (error) {
      console.error('Error fetching teacher stats:', error);
      Alert.alert('Error', 'Unable to load your statistics at the moment.');
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }, [user?._id]);

  const fetchTeacherReviews = useCallback(async () => {
    if (!user?._id) {
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        getApiUrl(API_ENDPOINTS.TEACHER_REVIEWS(user._id)),
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch teacher reviews: ${response.status}`);
      }

      const data = await response.json();
      const reviewList = Array.isArray(data.reviews) ? data.reviews : data;
      setReviews(reviewList);

      if (data.rating) {
        setRatingSummary((prev) => ({
          average: data.rating.average ?? prev.average,
          count: data.rating.count ?? prev.count,
        }));
      }
    } catch (error) {
      console.error('Error fetching teacher reviews:', error);
      setReviews([]);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchTeacherStats();
    fetchTeacherReviews();
  }, [fetchTeacherStats, fetchTeacherReviews]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchTeacherStats(), fetchTeacherReviews()]);
    setRefreshing(false);
  }, [fetchTeacherStats, fetchTeacherReviews]);

  const formattedRating = useMemo(() => {
    const value = Number(ratingSummary.average);
    if (!Number.isFinite(value) || value <= 0) {
      return '0.0';
    }
    return value.toFixed(1);
  }, [ratingSummary.average]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () => Alert.alert('Info', 'Edit profile functionality coming soon!'),
    },
    {
      icon: 'school-outline',
      title: 'Teaching Profile',
      subtitle: 'Update your teaching credentials',
      onPress: () => Alert.alert('Info', 'Teaching profile settings coming soon!'),
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      onPress: () => Alert.alert('Info', 'Notifications settings coming soon!'),
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'App settings and preferences',
      onPress: () => Alert.alert('Info', 'Settings coming soon!'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => Alert.alert('Info', 'Help & Support coming soon!'),
    },
    {
      icon: 'document-text-outline',
      title: 'Terms & Privacy',
      subtitle: 'Read our terms and privacy policy',
      onPress: () => Alert.alert('Info', 'Terms & Privacy coming soon!'),
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'T'}
          </Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.userEmail, { color: colors.icon }]}>{user?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.roleText}>Teacher</Text>
        </View>
      </View>

      {/* Teaching Stats */}
      <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {loadingStats ? '—' : stats?.activeCourses ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Active Courses</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {loadingStats ? '—' : stats?.totalStudents ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Total Students</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {loadingStats ? '—' : formattedRating}
          </Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>
            Avg Rating ({ratingSummary.count})
          </Text>
        </View>
      </View>

      {/* Teaching Info */}
      <View style={[styles.teachingInfo, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Teaching Information</Text>
        <View style={styles.infoRow}>
          <Ionicons name="school-outline" size={20} color={colors.icon} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Subjects: {user?.subjects?.length ? user.subjects.join(', ') : 'Not specified'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color={colors.icon} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Experience: {user?.experience ? `${user.experience} year${user.experience > 1 ? 's' : ''}` : 'Not specified'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={20} color={colors.icon} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Hourly Rate: {user?.hourlyRate ? `$${user.hourlyRate}` : 'Not specified'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="library-outline" size={20} color={colors.icon} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Education: {user?.education ?? 'Not specified'}
          </Text>
        </View>
      </View>

      {/* Teacher Reviews */}
      <View style={[styles.reviewsContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.reviewsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Reviews</Text>
          <View style={styles.ratingSummaryContainer}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text style={[styles.ratingValue, { color: colors.text }]}>{formattedRating}</Text>
            <Text style={[styles.ratingCount, { color: colors.icon }]}>
              ({ratingSummary.count})
            </Text>
          </View>
        </View>

        {reviews.length === 0 ? (
          <View style={styles.emptyReviewState}>
            <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.icon} />
            <Text style={[styles.emptyReviewText, { color: colors.icon }]}>
              No reviews yet. Your feedback will appear here once students start leaving reviews.
            </Text>
          </View>
        ) : (
          reviews.slice(0, 3).map((review) => (
            <View key={review._id} style={[styles.reviewCard, { borderColor: colors.icon }]}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewTitle}>
                  <Text style={[styles.reviewerName, { color: colors.text }]}>
                    {review.student?.name ?? 'Student'}
                  </Text>
                  {review.course?.title && (
                    <Text style={[styles.reviewCourse, { color: colors.icon }]}>
                      {review.course.title}
                    </Text>
                  )}
                </View>
                <View style={styles.reviewMeta}>
                  <View style={styles.reviewRating}>
                    <Ionicons name="star" size={14} color={colors.warning} />
                    <Text style={[styles.reviewRatingValue, { color: colors.text }]}>
                      {review.rating.toFixed(1)}
                    </Text>
                  </View>
                  <Text style={[styles.reviewDate, { color: colors.icon }]}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
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

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { backgroundColor: colors.surface }]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name={item.icon as any} size={20} color="white" />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.menuSubtitle, { color: colors.icon }]}>
                  {item.subtitle}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.error }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: colors.icon }]}>
          EduNexus v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  teachingInfo: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
  },
  menuContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  reviewsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingSummaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  ratingCount: {
    marginLeft: 4,
    fontSize: 14,
  },
  emptyReviewState: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyReviewText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewTitle: {
    flex: 1,
    marginRight: 12,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewCourse: {
    fontSize: 13,
    marginTop: 4,
  },
  reviewMeta: {
    alignItems: 'flex-end',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewRatingValue: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  versionText: {
    fontSize: 14,
  },
});
