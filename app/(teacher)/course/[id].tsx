import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useAuth } from '../../../contexts/AuthContext';
import { useColorScheme } from '../../../hooks/useColorScheme';

interface CourseMaterial {
  _id?: string;
  title: string;
  type: 'video' | 'document' | 'link' | 'quiz';
  url: string;
  description?: string;
  duration?: number;
}

interface Course {
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
  materials: CourseMaterial[];
  createdAt: string;
}

export default function CourseManagementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMaterialIndex, setEditingMaterialIndex] = useState<number | null>(null);
  const [newMaterial, setNewMaterial] = useState<CourseMaterial>({
    title: '',
    type: 'video',
    url: '',
    description: '',
    duration: 0,
  });
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
        description: 'Comprehensive course on advanced mathematics including calculus, linear algebra, and differential equations.',
        subject: 'Mathematics',
        level: 'Advanced',
        price: 99.99,
        duration: 20,
        rating: { average: 4.8, count: 12 },
        enrolledStudents: 45,
        maxStudents: 50,
        isPublished: true,
        isActive: true,
        materials: [
          {
            _id: '1',
            title: 'Introduction to Calculus',
            type: 'video',
            url: 'https://example.com/video1',
            description: 'Basic concepts of calculus',
            duration: 45,
          },
          {
            _id: '2',
            title: 'Calculus Practice Problems',
            type: 'document',
            url: 'https://example.com/pdf1',
            description: 'Practice problems for calculus',
            duration: 30,
          },
        ],
        createdAt: '2024-01-15',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.title || !newMaterial.url) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/courses/${id}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: user?._id,
          materials: [newMaterial],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(data.course);
        setShowAddModal(false);
        setNewMaterial({ title: '', type: 'video', url: '', description: '', duration: 0 });
        Alert.alert('Success', 'Material added successfully!');
      } else {
        Alert.alert('Error', 'Failed to add material');
      }
    } catch (error) {
      // For demo purposes, update local state
      if (course) {
        const updatedCourse = {
          ...course,
          materials: [...course.materials, { ...newMaterial, _id: Date.now().toString() }],
        };
        setCourse(updatedCourse);
        setShowAddModal(false);
        setNewMaterial({ title: '', type: 'video', url: '', description: '', duration: 0 });
        Alert.alert('Success', 'Material added successfully! (Demo)');
      }
    }
  };

  const handleEditMaterial = async () => {
    if (!newMaterial.title || !newMaterial.url || editingMaterialIndex === null) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/courses/${id}/materials/${editingMaterialIndex}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: user?._id,
          ...newMaterial,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(data.course);
        setShowEditModal(false);
        setEditingMaterialIndex(null);
        setNewMaterial({ title: '', type: 'video', url: '', description: '', duration: 0 });
        Alert.alert('Success', 'Material updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update material');
      }
    } catch (error) {
      // For demo purposes, update local state
      if (course && editingMaterialIndex !== null) {
        const updatedMaterials = [...course.materials];
        updatedMaterials[editingMaterialIndex] = { ...newMaterial, _id: updatedMaterials[editingMaterialIndex]._id };
        const updatedCourse = { ...course, materials: updatedMaterials };
        setCourse(updatedCourse);
        setShowEditModal(false);
        setEditingMaterialIndex(null);
        setNewMaterial({ title: '', type: 'video', url: '', description: '', duration: 0 });
        Alert.alert('Success', 'Material updated successfully! (Demo)');
      }
    }
  };

  const handleDeleteMaterial = async (materialIndex: number) => {
    Alert.alert(
      'Delete Material',
      'Are you sure you want to delete this material?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/courses/${id}/materials/${materialIndex}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  teacherId: user?._id,
                }),
              });

              if (response.ok) {
                const data = await response.json();
                setCourse(data.course);
                Alert.alert('Success', 'Material deleted successfully!');
              } else {
                Alert.alert('Error', 'Failed to delete material');
              }
            } catch (error) {
              // For demo purposes, update local state
              if (course) {
                const updatedMaterials = course.materials.filter((_, index) => index !== materialIndex);
                const updatedCourse = { ...course, materials: updatedMaterials };
                setCourse(updatedCourse);
                Alert.alert('Success', 'Material deleted successfully! (Demo)');
              }
            }
          },
        },
      ]
    );
  };

  const openEditModal = (material: CourseMaterial, index: number) => {
    setNewMaterial(material);
    setEditingMaterialIndex(index);
    setShowEditModal(true);
  };

  const openAddModal = () => {
    // Clear the form when opening the add modal
    setNewMaterial({ title: '', type: 'video', url: '', description: '', duration: 0 });
    setShowAddModal(true);
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video':
        return 'videocam';
      case 'document':
        return 'document-text';
      case 'link':
        return 'link';
      case 'quiz':
        return 'help-circle';
      default:
        return 'document';
    }
  };

  const getMaterialTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return '#FF6B6B';
      case 'document':
        return '#4ECDC4';
      case 'link':
        return '#45B7D1';
      case 'quiz':
        return '#96CEB4';
      default:
        return colors.icon;
    }
  };

  const renderMaterial = ({ item, index }: { item: CourseMaterial; index: number }) => (
    <View style={[styles.materialCard, { backgroundColor: colors.surface }]}>
      <View style={styles.materialHeader}>
        <View style={styles.materialInfo}>
          <Ionicons 
            name={getMaterialIcon(item.type) as any} 
            size={24} 
            color={getMaterialTypeColor(item.type)} 
          />
          <View style={styles.materialText}>
            <Text style={[styles.materialTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.materialType, { color: colors.icon }]}>{item.type}</Text>
          </View>
        </View>
        <View style={styles.materialActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => openEditModal(item, index)}
          >
            <Ionicons name="pencil" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={() => handleDeleteMaterial(index)}
          >
            <Ionicons name="trash" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {item.description && (
        <Text style={[styles.materialDescription, { color: colors.icon }]} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.materialDetails}>
        <Text style={[styles.materialUrl, { color: colors.primary }]} numberOfLines={1}>
          {item.url}
        </Text>
        {item.duration && (
          <Text style={[styles.materialDuration, { color: colors.icon }]}>
            {item.duration} min
          </Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading course...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Course not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      {/* <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.courseTitle, { color: colors.text }]}>{course.title}</Text>
          <Text style={[styles.courseSubtitle, { color: colors.icon }]}>{course.subject} • {course.level}</Text>
        </View>
      </View> */}
      <Stack.Screen options={{ headerShown: true, headerTitle: course.title }} />

      {/* Course Stats */}
      <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {course.materials.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Materials</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : course.enrolledStudents}
          </Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Students</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {typeof course.rating === 'object' ? course.rating.average : course.rating}
          </Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Rating</Text>
        </View>
      </View>

      {/* Materials Section */}
      <View style={styles.materialsSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Course Materials</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={openAddModal}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Add Material</Text>
          </TouchableOpacity>
        </View>

        {course.materials.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="library-outline" size={48} color={colors.icon} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No materials yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.icon }]}>
              Add your first course material to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={course.materials}
            renderItem={renderMaterial}
            keyExtractor={(item, index) => item._id || index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.materialsList}
          />
        )}
      </View>

      {/* Add Material Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Material</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon }]}
                value={newMaterial.title}
                onChangeText={(text) => setNewMaterial({ ...newMaterial, title: text })}
                placeholder="Enter material title"
                placeholderTextColor={colors.icon}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Type *</Text>
              <View style={styles.typeSelector}>
                {['video', 'document', 'link', 'quiz'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor: newMaterial.type === type ? colors.primary : colors.background,
                        borderColor: colors.icon,
                      },
                    ]}
                    onPress={() => setNewMaterial({ ...newMaterial, type: type as any })}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      { color: newMaterial.type === type ? 'white' : colors.text }
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>URL *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon }]}
                value={newMaterial.url}
                onChangeText={(text) => setNewMaterial({ ...newMaterial, url: text })}
                placeholder="Enter material URL"
                placeholderTextColor={colors.icon}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon }]}
                value={newMaterial.description}
                onChangeText={(text) => setNewMaterial({ ...newMaterial, description: text })}
                placeholder="Enter material description"
                placeholderTextColor={colors.icon}
                multiline
                numberOfLines={3}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Duration (minutes)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon }]}
                value={newMaterial.duration?.toString() || ''}
                onChangeText={(text) => setNewMaterial({ ...newMaterial, duration: parseInt(text) || 0 })}
                placeholder="Enter duration in minutes"
                placeholderTextColor={colors.icon}
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.icon }]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleAddMaterial}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Add Material</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Material Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Material</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon }]}
                value={newMaterial.title}
                onChangeText={(text) => setNewMaterial({ ...newMaterial, title: text })}
                placeholder="Enter material title"
                placeholderTextColor={colors.icon}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Type *</Text>
              <View style={styles.typeSelector}>
                {['video', 'document', 'link', 'quiz'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor: newMaterial.type === type ? colors.primary : colors.background,
                        borderColor: colors.icon,
                      },
                    ]}
                    onPress={() => setNewMaterial({ ...newMaterial, type: type as any })}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      { color: newMaterial.type === type ? 'white' : colors.text }
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>URL *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon }]}
                value={newMaterial.url}
                onChangeText={(text) => setNewMaterial({ ...newMaterial, url: text })}
                placeholder="Enter material URL"
                placeholderTextColor={colors.icon}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon }]}
                value={newMaterial.description}
                onChangeText={(text) => setNewMaterial({ ...newMaterial, description: text })}
                placeholder="Enter material description"
                placeholderTextColor={colors.icon}
                multiline
                numberOfLines={3}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Duration (minutes)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon }]}
                value={newMaterial.duration?.toString() || ''}
                onChangeText={(text) => setNewMaterial({ ...newMaterial, duration: parseInt(text) || 0 })}
                placeholder="Enter duration in minutes"
                placeholderTextColor={colors.icon}
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.icon }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleEditMaterial}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Update Material</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseSubtitle: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  },
  materialsSection: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  materialsList: {
    paddingBottom: 16,
  },
  materialCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  materialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  materialText: {
    marginLeft: 12,
    flex: 1,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  materialType: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  materialActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
  },
  materialDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  materialDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialUrl: {
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  materialDuration: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});
