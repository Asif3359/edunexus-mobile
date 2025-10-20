import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../constants/Colors";
import { useAuth } from "../../../contexts/AuthContext";
import { useColorScheme } from "../../../hooks/useColorScheme";

interface Course {
  _id: string;
  title: string;
  description: string;
  subject: string;
  level: string;
  price: number;
  duration: number;
  teacher: {
    name: string;
  };
  rating: { average: number; count: number } | number;
  enrolledStudents: any[] | number;
  maxStudents: number;
  isPublished: boolean;
}

export default function StudentCoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual API endpoint
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/courses?isPublished=true`
      );

      if (response.ok) {
        const data = await response.json();
        // Handle both array format and object with courses property
        setCourses(
          Array.isArray(data) ? data : data.courses || getMockCourses()
        );
      } else {
        setCourses(getMockCourses());
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      setCourses(getMockCourses());
    } finally {
      setLoading(false);
    }
  };

  const getMockCourses = (): Course[] => [
    {
      _id: "1",
      title: "Advanced Mathematics",
      description:
        "Comprehensive course on advanced mathematics including calculus, linear algebra, and differential equations.",
      subject: "Mathematics",
      level: "Advanced",
      price: 99.99,
      duration: 20,
      teacher: { name: "Dr. Sarah Johnson" },
      rating: { average: 4.8, count: 12 },
      enrolledStudents: 45,
      maxStudents: 50,
      isPublished: true,
    },
    {
      _id: "2",
      title: "Physics Fundamentals",
      description:
        "Learn the fundamental principles of physics including mechanics, thermodynamics, and electromagnetism.",
      subject: "Physics",
      level: "Intermediate",
      price: 79.99,
      duration: 16,
      teacher: { name: "Prof. Michael Chen" },
      rating: { average: 4.6, count: 8 },
      enrolledStudents: 32,
      maxStudents: 40,
      isPublished: true,
    },
    {
      _id: "3",
      title: "Web Development Bootcamp",
      description:
        "Complete web development course covering HTML, CSS, JavaScript, React, and Node.js.",
      subject: "Computer Science",
      level: "Beginner",
      price: 149.99,
      duration: 30,
      teacher: { name: "Alex Rodriguez" },
      rating: { average: 4.9, count: 15 },
      enrolledStudents: 78,
      maxStudents: 100,
      isPublished: true,
    },
    {
      _id: "4",
      title: "Creative Writing Workshop",
      description:
        "Develop your creative writing skills through interactive workshops and personalized feedback.",
      subject: "English",
      level: "All Levels",
      price: 59.99,
      duration: 12,
      teacher: { name: "Emma Wilson" },
      rating: { average: 4.7, count: 6 },
      enrolledStudents: 25,
      maxStudents: 30,
      isPublished: true,
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const handleEnroll = async (courseId: string) => {
    try {
      // Check if user exists
      if (!user?._id) {
        Alert.alert("Error", "User not found. Please login again.");
        return;
      }

      // Note: We'll let the API handle the enrollment check since the client-side data
      // might not have the complete enrollment structure

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Mock API call - replace with actual API endpoint
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/courses/${courseId}/enroll`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            studentId: user._id,
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Successfully enrolled in the course!");
        loadCourses(); // Refresh the list
      } else {
        const errorData = await response.json().catch(() => ({}));

        if (errorData.message === "Already enrolled in this course") {
          Alert.alert(
            "Already Enrolled",
            "You are already enrolled in this course!"
          );
          loadCourses(); // Refresh to update UI
        } else {
          Alert.alert(
            "Error",
            errorData.message ||
              "Failed to enroll in the course. Please try again."
          );
        }
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Network error. Please check your connection and try again."
      );
    }
  };

  const renderCourse = ({ item }: { item: Course }) => {
    // Check if user is already enrolled
    const enrolledStudents = Array.isArray(item.enrolledStudents)
      ? item.enrolledStudents
      : [];

    const isAlreadyEnrolled = enrolledStudents.some((enrollment: any) => {
      const studentId =
        enrollment.student?._id || enrollment.student || enrollment._id;
      return studentId === user?._id;
    });

    return (
      <TouchableOpacity
        style={[styles.courseCard, { backgroundColor: colors.surface }]}
        onPress={() => router.push(`/course/${item._id}`)}
      >
        <View style={styles.courseHeader}>
          <Text style={[styles.courseTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text style={[styles.rating, { color: colors.text }]}>
              {typeof item.rating === "object"
                ? item.rating.average
                : item.rating}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.courseDescription, { color: colors.icon }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        <View style={styles.courseDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="school-outline" size={16} color={colors.icon} />
            <Text style={[styles.detailText, { color: colors.icon }]}>
              {item.subject}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={colors.icon} />
            <Text style={[styles.detailText, { color: colors.icon }]}>
              {item.duration} hours
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={16} color={colors.icon} />
            <Text style={[styles.detailText, { color: colors.icon }]}>
              {Array.isArray(item.enrolledStudents)
                ? item.enrolledStudents.length
                : item.enrolledStudents}
              /{item.maxStudents}
            </Text>
          </View>
        </View>

        <View style={styles.courseFooter}>
          <View>
            <Text style={[styles.teacherName, { color: colors.text }]}>
              {item.teacher.name}
            </Text>
            <Text style={[styles.price, { color: colors.primary }]}>
              ${item.price}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.enrollButton,
              {
                backgroundColor: isAlreadyEnrolled
                  ? colors.success
                  : colors.primary,
                opacity: isAlreadyEnrolled ? 0.9 : 1,
              },
            ]}
            onPress={() => handleEnroll(item._id)}
            disabled={isAlreadyEnrolled}
          >
            <Text style={styles.enrollButtonText}>
              {isAlreadyEnrolled ? "Enrolled" : "Enroll"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading courses...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
  },
  courseCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  courseDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
  },
  courseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teacherName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
  },
  enrollButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  enrollButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
});
