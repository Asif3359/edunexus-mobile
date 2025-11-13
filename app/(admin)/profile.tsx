import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
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
import { API_ENDPOINTS, getApiUrl } from '../../config/api';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { useColorScheme } from '../../hooks/useColorScheme';

interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
}

export default function AdminProfileScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchAdminStats = useCallback(async () => {
    try {
      setLoadingStats(true);
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
        totalRevenue: statsPayload.totalRevenue ?? statsPayload.revenue ?? 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      Alert.alert('Error', 'Unable to load admin statistics at the moment.');
      setStats({
        totalUsers: 0,
        totalTeachers: 0,
        totalStudents: 0,
        totalCourses: 0,
        totalRevenue: 0,
      });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAdminStats();
    setRefreshing(false);
  }, [fetchAdminStats]);

  const formattedRevenue = useMemo(
    () => (loadingStats ? '—' : formatRevenue(stats.totalRevenue)),
    [formatRevenue, loadingStats, stats.totalRevenue]
  );

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
      icon: 'shield-checkmark-outline',
      title: 'Admin Settings',
      subtitle: 'Platform administration settings',
      onPress: () => Alert.alert('Info', 'Admin settings coming soon!'),
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      onPress: () => Alert.alert('Info', 'Notifications settings coming soon!'),
    },
    {
      icon: 'settings-outline',
      title: 'System Settings',
      subtitle: 'Platform system settings',
      onPress: () => Alert.alert('Info', 'System settings coming soon!'),
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
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.userEmail, { color: colors.icon }]}>{user?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.error }]}>
          <Text style={styles.roleText}>Administrator</Text>
        </View>
      </View>

      {/* Admin Stats */}
      <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {loadingStats ? '—' : stats.totalUsers.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Total Users</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {loadingStats ? '—' : stats.totalCourses.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Total Courses</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {formattedRevenue}
          </Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Total Revenue</Text>
        </View>
      </View>

      {/* Admin Info */}
      <View style={[styles.adminInfo, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Administrator Information</Text>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.icon} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Role: Platform Administrator
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.icon} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Admin since:{' '}
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : 'Not available'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="settings-outline" size={20} color={colors.icon} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Permissions: Full Access
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color={colors.icon} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Last login:{' '}
            {user?.lastLogin
              ? new Date(user.lastLogin).toLocaleString()
              : 'Not available'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={20} color={colors.icon} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Teachers: {loadingStats ? '—' : stats.totalTeachers.toLocaleString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="school-outline" size={20} color={colors.icon} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Students: {loadingStats ? '—' : stats.totalStudents.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Quick Admin Actions */}
      <View style={[styles.quickActions, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.primary }]}
            onPress={() =>{router.push('/(admin)/users')}}
          >
            <Ionicons name="people-outline" size={24} color="white" />
            <Text style={styles.actionTitle}>Manage Users</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.success }]}
            onPress={() => Alert.alert('Info', 'Course management coming soon!')}
          >
            <Ionicons name="library-outline" size={24} color="white" />
            <Text style={styles.actionTitle}>Manage Courses</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.warning }]}
            onPress={() => Alert.alert('Info', 'Analytics coming soon!')}
          >
            <Ionicons name="analytics-outline" size={24} color="white" />
            <Text style={styles.actionTitle}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.error }]}
            onPress={() => Alert.alert('Info', 'System settings coming soon!')}
          >
            <Ionicons name="settings-outline" size={24} color="white" />
            <Text style={styles.actionTitle}>Settings</Text>
          </TouchableOpacity>
        </View>
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
          EduNexus v1.0.0 - Admin Panel
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
  adminInfo: {
    marginHorizontal: 16,
    marginBottom: 16,
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
  quickActions: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  menuContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
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
