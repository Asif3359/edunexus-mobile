import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_ENDPOINTS, getApiUrl } from '../../config/api';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

const { width: screenWidth } = Dimensions.get('window');

interface PlatformStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  activeCourses: number;
  completedCourses: number;
}

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    activeCourses: 0,
    completedCourses: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const getMockStats = (): PlatformStats => ({
    totalUsers: 1250,
    totalTeachers: 45,
    totalStudents: 1205,
    totalCourses: 89,
    totalEnrollments: 2347,
    totalRevenue: 156789.50,
    activeCourses: 67,
    completedCourses: 22,
  });

  const formatRevenue = useCallback((value: number) => {
    if (!Number.isFinite(value) || value <= 0) {
      return '$0';
    }

    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }

    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }

    return `$${value.toLocaleString()}`;
  }, []);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(getApiUrl(API_ENDPOINTS.ADMIN_STATS), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch admin stats: ${response.status}`);
      }

      const data = await response.json();
      const statsPayload = data.stats ?? data;

      setStats({
        totalUsers: statsPayload.totalUsers ?? statsPayload.userCount ?? 0,
        totalTeachers: statsPayload.totalTeachers ?? statsPayload.teacherCount ?? 0,
        totalStudents: statsPayload.totalStudents ?? statsPayload.studentCount ?? 0,
        totalCourses: statsPayload.totalCourses ?? statsPayload.courseCount ?? 0,
        totalEnrollments:
          statsPayload.totalEnrollments ?? statsPayload.enrollmentCount ?? 0,
        totalRevenue: statsPayload.totalRevenue ?? statsPayload.revenue ?? 0,
        activeCourses: statsPayload.activeCourses ?? statsPayload.activeCount ?? 0,
        completedCourses:
          statsPayload.completedCourses ?? statsPayload.completedCount ?? 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(getMockStats());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    // Animate dashboard entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, loadStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const formattedRevenue = useMemo(
    () => (loading ? '—' : formatRevenue(stats.totalRevenue)),
    [formatRevenue, loading, stats.totalRevenue]
  );

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    subtitle
  }: { 
    title: string; 
    value: string | number; 
    icon: string; 
    color: string; 
    subtitle?: string;
  }) => (
    <Animated.View 
      style={[
        styles.statCard, 
        { 
          backgroundColor: colors.surface,
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <View style={styles.statHeader}>
        <View style={[
          styles.statIcon, 
          { backgroundColor: color }
        ]}>
          <Ionicons name={icon as any} size={24} color="white" />
        </View>
        <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: colors.icon }]}>{subtitle}</Text>
      )}
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header with gradient background */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={[styles.headerGradient, { backgroundColor: colors.primary }]}>
          <Text style={[styles.headerTitle, { color: 'white' }]}>Admin Dashboard</Text>
          <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
            Platform Overview
          </Text>
        </View>
      </Animated.View>

      {/* Main Stats */}
      <Animated.View 
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={loading ? '—' : stats.totalUsers.toLocaleString()}
            icon="people"
            color="#6366F1"
          />
          <StatCard
            title="Total Teachers"
            value={loading ? '—' : stats.totalTeachers.toLocaleString()}
            icon="school"
            color="#10B981"
          />
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Students"
            value={loading ? '—' : stats.totalStudents.toLocaleString()}
            icon="person"
            color="#F59E0B"
          />
          <StatCard
            title="Total Courses"
            value={loading ? '—' : stats.totalCourses.toLocaleString()}
            icon="library"
            color="#EF4444"
          />
        </View>
      </Animated.View>

      {/* Secondary Stats */}
      <Animated.View 
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Enrollments"
            value={loading ? '—' : stats.totalEnrollments.toLocaleString()}
            icon="book"
            color="#8B5CF6"
          />
          <StatCard
            title="Active Courses"
            value={loading ? '—' : stats.activeCourses.toLocaleString()}
            icon="play-circle"
            color="#06B6D4"
          />
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            title="Completed Courses"
            value={loading ? '—' : stats.completedCourses.toLocaleString()}
            icon="checkmark-circle"
            color="#84CC16"
          />
          <StatCard
            title="Total Revenue"
            value={formattedRevenue}
            icon="cash"
            color="#F97316"
          />
        </View>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View 
        style={[
          styles.quickActions,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.surface }]}
            onPress={() => {router.push('/(admin)/users')}}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#6366F1' }]}>
              <Ionicons name="people-outline" size={24} color="white" />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Manage Users</Text>
            <Text style={[styles.actionSubtitle, { color: colors.icon }]}>
              View and manage all users
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.surface }]}
            onPress={() => { Alert.alert('Info', 'Course management coming soon!')}}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#10B981' }]}>
              <Ionicons name="library-outline" size={24} color="white" />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Manage Courses</Text>
            <Text style={[styles.actionSubtitle, { color: colors.icon }]}>
              Review and approve courses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.surface }]}
            onPress={() => { Alert.alert('Info', 'Analytics coming soon!')}}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#F59E0B' }]}>
              <Ionicons name="analytics-outline" size={24} color="white" />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Analytics</Text>
            <Text style={[styles.actionSubtitle, { color: colors.icon }]}>
              View detailed analytics
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.surface }]}
            onPress={() => { Alert.alert('Info', 'System settings coming soon!')}}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#EF4444' }]}>
              <Ionicons name="settings-outline" size={24} color="white" />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Settings</Text>
            <Text style={[styles.actionSubtitle, { color: colors.icon }]}>
              Platform settings
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Recent Activity */}
      <Animated.View 
        style={[
          styles.recentActivity,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
        <View style={[styles.activityCard, { backgroundColor: colors.surface }]}>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#10B981' }]}>
              <Ionicons name="person-add" size={16} color="white" />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityText, { color: colors.text }]}>
                New teacher registered: Dr. Sarah Johnson
              </Text>
              <Text style={[styles.activityTime, { color: colors.icon }]}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#6366F1' }]}>
              <Ionicons name="library" size={16} color="white" />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityText, { color: colors.text }]}>
                New course published: Advanced Mathematics
              </Text>
              <Text style={[styles.activityTime, { color: colors.icon }]}>4 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: '#F59E0B' }]}>
              <Ionicons name="book" size={16} color="white" />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityText, { color: colors.text }]}>
                15 new enrollments in Physics Fundamentals
              </Text>
              <Text style={[styles.activityTime, { color: colors.icon }]}>6 hours ago</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    opacity: 0.9,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    opacity: 0.8,
    letterSpacing: 0.2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statSubtitle: {
    fontSize: 11,
    opacity: 0.6,
  },
  quickActions: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    width: (screenWidth - 48) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  actionSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
  },
  recentActivity: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  activityCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '500',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.7,
  },
});
