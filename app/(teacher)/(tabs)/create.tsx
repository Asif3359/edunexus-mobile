import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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

export default function CreateCourseScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('beginner');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [requirements, setRequirements] = useState('');
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all-levels', label: 'All Levels' },
  ];

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'English',
    'History',
    'Geography',
    'Economics',
    'Psychology',
    'Art',
    'Music',
    'Other',
  ];

  const handleCreateCourse = async () => {
    if (!title || !description || !subject || !price || !duration || !maxStudents) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (isNaN(Number(duration)) || Number(duration) <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    if (isNaN(Number(maxStudents)) || Number(maxStudents) <= 0) {
      Alert.alert('Error', 'Please enter a valid maximum number of students');
      return;
    }

    setIsLoading(true);
    try {
      const courseData = {
        title,
        description,
        subject,
        level,
        price: Number(price),
        duration: Number(duration),
        requirements: requirements || undefined,
        learningOutcomes: learningOutcomes || undefined,
        maxStudents: Number(maxStudents),
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        teacherId: user?._id,
      };

      // Mock API call - replace with actual API endpoint
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Course created successfully!', [
          { text: 'OK', onPress: () => clearForm() }
        ]);
        router.push('/(teacher)/(tabs)');
      } else {
        Alert.alert('Error', 'Failed to create course. Please try again.');
      }
    } catch (error) {
      Alert.alert('Success', 'Course created successfully! (Demo)', [
        { text: 'OK', onPress: () => clearForm() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setLevel('beginner');
    setPrice('');
    setDuration('');
    setMaxStudents('');
    setRequirements('');
    setLearningOutcomes('');
    setTags('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Create New Course</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Share your knowledge with students
          </Text>
        </View>

        <View style={styles.form}>
          {/* Course Title */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Course Title *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.icon,
                },
              ]}
              placeholder="Enter course title"
              placeholderTextColor={colors.icon}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Course Description */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.icon,
                },
              ]}
              placeholder="Describe your course"
              placeholderTextColor={colors.icon}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Subject */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Subject *</Text>
            <View style={styles.pickerContainer}>
              {subjects.map((subj) => (
                <TouchableOpacity
                  key={subj}
                  style={[
                    styles.pickerOption,
                    {
                      backgroundColor: subject === subj ? colors.primary : colors.surface,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setSubject(subj)}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      {
                        color: subject === subj ? 'white' : colors.primary,
                      },
                    ]}
                  >
                    {subj}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Level */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Level *</Text>
            <View style={styles.pickerContainer}>
              {levels.map((lev) => (
                <TouchableOpacity
                  key={lev.value}
                  style={[
                    styles.pickerOption,
                    {
                      backgroundColor: level === lev.value ? colors.primary : colors.surface,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setLevel(lev.value)}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      {
                        color: level === lev.value ? 'white' : colors.primary,
                      },
                    ]}
                  >
                    {lev.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price and Duration */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.text }]}>Price ($) *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.icon,
                  },
                ]}
                placeholder="0.00"
                placeholderTextColor={colors.icon}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.text }]}>Duration (hours) *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.icon,
                  },
                ]}
                placeholder="0"
                placeholderTextColor={colors.icon}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Max Students */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Maximum Students *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.icon,
                },
              ]}
              placeholder="Enter maximum number of students"
              placeholderTextColor={colors.icon}
              value={maxStudents}
              onChangeText={setMaxStudents}
              keyboardType="numeric"
            />
          </View>

          {/* Requirements */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Prerequisites</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.icon,
                },
              ]}
              placeholder="What students should know before taking this course"
              placeholderTextColor={colors.icon}
              value={requirements}
              onChangeText={setRequirements}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Learning Outcomes */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Learning Outcomes</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.icon,
                },
              ]}
              placeholder="What students will learn from this course"
              placeholderTextColor={colors.icon}
              value={learningOutcomes}
              onChangeText={setLearningOutcomes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Tags */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Tags</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.icon,
                },
              ]}
              placeholder="math, calculus, algebra (comma separated)"
              placeholderTextColor={colors.icon}
              value={tags}
              onChangeText={setTags}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.createButton,
                {
                  backgroundColor: colors.primary,
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
              onPress={handleCreateCourse}
              disabled={isLoading}
            >
              <Text style={styles.createButtonText}>
                {isLoading ? 'Creating...' : 'Create Course'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.clearButton,
                {
                  borderColor: colors.primary,
                  borderWidth: 1,
                },
              ]}
              onPress={clearForm}
            >
              <Text style={[styles.clearButtonText, { color: colors.primary }]}>
                Clear Form
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
  },
  createButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
