import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  // Teacher specific
  subjects?: string[];
  experience?: number;
  // Student specific
  grade?: string;
  enrolledCourses?: number;
}

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'teacher' | 'student'>('all');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual API endpoint
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/admin/users`);
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || getMockUsers());
      } else {
        setUsers(getMockUsers());
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers(getMockUsers());
    } finally {
      setLoading(false);
    }
  };

  const getMockUsers = (): AdminUser[] => [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      isActive: true,
      isVerified: true,
      createdAt: '2024-01-15',
      lastLogin: '2024-02-20',
      grade: '12th Grade',
      enrolledCourses: 3,
    },
    {
      _id: '2',
      name: 'Dr. Sarah Johnson',
      email: 'sarah@example.com',
      role: 'teacher',
      isActive: true,
      isVerified: true,
      createdAt: '2024-01-10',
      lastLogin: '2024-02-19',
      subjects: ['Mathematics', 'Physics'],
      experience: 5,
    },
    {
      _id: '3',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
      isVerified: true,
      createdAt: '2024-01-01',
      lastLogin: '2024-02-20',
    },
    {
      _id: '4',
      name: 'Emma Wilson',
      email: 'emma@example.com',
      role: 'teacher',
      isActive: true,
      isVerified: false,
      createdAt: '2024-02-01',
      subjects: ['English', 'Literature'],
      experience: 3,
    },
    {
      _id: '5',
      name: 'Mike Chen',
      email: 'mike@example.com',
      role: 'student',
      isActive: false,
      isVerified: true,
      createdAt: '2024-01-20',
      grade: '11th Grade',
      enrolledCourses: 1,
    },
  ];

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // Mock API call - replace with actual API endpoint
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !isActive,
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Success', 
          `User ${!isActive ? 'activated' : 'deactivated'} successfully!`
        );
        loadUsers(); // Refresh the list
      } else {
        Alert.alert('Error', 'Failed to update user status. Please try again.');
      }
    } catch (error) {
      Alert.alert(
        'Success', 
        `User ${!isActive ? 'activated' : 'deactivated'} successfully! (Demo)`
      );
      // Update local state for demo
      setUsers(prev => 
        prev.map(user => 
          user._id === userId 
            ? { ...user, isActive: !isActive }
            : user
        )
      );
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
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
              // Mock API call - replace with actual API endpoint
                const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                Alert.alert('Success', 'User deleted successfully!');
                loadUsers(); // Refresh the list
              } else {
                Alert.alert('Error', 'Failed to delete user. Please try again.');
              }
            } catch (error) {
              Alert.alert('Success', 'User deleted successfully! (Demo)');
              // Update local state for demo
              setUsers(prev => prev.filter(user => user._id !== userId));
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return colors.error;
      case 'teacher':
        return colors.success;
      case 'student':
        return colors.warning;
      default:
        return colors.icon;
    }
  };

  const renderUser = ({ item }: { item: AdminUser }) => (
    <View style={[styles.userCard, { backgroundColor: colors.surface }]}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.userEmail, { color: colors.icon }]}>{item.email}</Text>
            <View style={styles.userMeta}>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
                <Text style={styles.roleText}>{item.role}</Text>
              </View>
              {item.isVerified && (
                <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
                  <Ionicons name="checkmark-circle" size={12} color="white" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.userStatus}>
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: item.isActive ? colors.success : colors.error }
          ]} />
          <Text style={[styles.statusText, { color: colors.icon }]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.userStats}>
        <Text style={[styles.statText, { color: colors.icon }]}>
          Joined: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {item.lastLogin && (
          <Text style={[styles.statText, { color: colors.icon }]}>
            Last login: {new Date(item.lastLogin).toLocaleDateString()}
          </Text>
        )}
        {item.role === 'teacher' && item.subjects && (
          <Text style={[styles.statText, { color: colors.icon }]}>
            Subjects: {item.subjects.join(', ')}
          </Text>
        )}
        {item.role === 'student' && item.enrolledCourses !== undefined && (
          <Text style={[styles.statText, { color: colors.icon }]}>
            Enrolled courses: {item.enrolledCourses}
          </Text>
        )}
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: item.isActive ? colors.error : colors.success,
            },
          ]}
          onPress={() => handleToggleUserStatus(item._id, item.isActive)}
        >
          <Text style={styles.actionButtonText}>
            {item.isActive ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => handleDeleteUser(item._id, item.name)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInput, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchTextInput, { color: colors.text }]}
            placeholder="Search users..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterContainer}>
          {(['all', 'admin', 'teacher', 'student'] as const).map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.filterButton,
                {
                  backgroundColor: selectedRole === role ? colors.primary : colors.surface,
                },
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  {
                    color: selectedRole === role ? 'white' : colors.primary,
                  },
                ]}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  searchTextInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  userStatus: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
  },
  userStats: {
    marginBottom: 12,
  },
  statText: {
    fontSize: 12,
    marginBottom: 2,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
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
});
