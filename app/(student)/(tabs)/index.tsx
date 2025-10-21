import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../constants/Colors";
import { useAuth } from "../../../contexts/AuthContext";
import { useColorScheme } from "../../../hooks/useColorScheme";

// const { width: screenWidth } = Dimensions.get('window');

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
  tags?: string[];
}

interface SearchFilters {
  query: string;
  subject: string;
  level: string;
  minPrice: string;
  maxPrice: string;
  tags: string[];
  minRating: string;
  sortBy: string;
  sortOrder: string;
}

interface SearchSuggestions {
  type: 'title' | 'subject' | 'tag';
  text: string;
}

export default function StudentCoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestions[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    subject: "",
    level: "",
    minPrice: "",
    maxPrice: "",
    tags: [],
    minRating: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  const [tempFilters, setTempFilters] = useState<SearchFilters>({
    query: "",
    subject: "",
    level: "",
    minPrice: "",
    maxPrice: "",
    tags: [],
    minRating: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  // const [pagination, setPagination] = useState({
  //   current: 1,
  //   total: 1,
  //   hasNext: false,
  //   hasPrev: false
  // });
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const loadCourses = useCallback(async (page = 1, searchFilters?: Partial<SearchFilters>) => {
    try {
      setLoading(true);
      const currentFilters = searchFilters || {
        query: "",
        subject: "",
        level: "",
        minPrice: "",
        maxPrice: "",
        tags: [],
        minRating: "",
        sortBy: "createdAt",
        sortOrder: "desc"
      };
      
      // Build query parameters
      const params = new URLSearchParams();
      if (currentFilters.query) params.append('q', currentFilters.query);
      if (currentFilters.subject) params.append('subject', currentFilters.subject);
      if (currentFilters.level) params.append('level', currentFilters.level);
      if (currentFilters.minPrice) params.append('minPrice', currentFilters.minPrice);
      if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice);
      if (currentFilters.tags && currentFilters.tags.length > 0) params.append('tags', currentFilters.tags.join(','));
      if (currentFilters.minRating) params.append('minRating', currentFilters.minRating);
      if (currentFilters.sortBy) params.append('sortBy', currentFilters.sortBy);
      if (currentFilters.sortOrder) params.append('sortOrder', currentFilters.sortOrder);
      params.append('page', page.toString());
      params.append('limit', '10');

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/courses/search/advanced?${params.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || getMockCourses());
        // setPagination(data.pagination || { current: 1, total: 1, hasNext: false, hasPrev: false });
      } else {
        setCourses(getMockCourses());
      }
    } catch (err) {
      console.error("Error loading courses:", err);
      setCourses(getMockCourses());
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSuggestions = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/courses/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error("Error loading suggestions:", err);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadCourses();
    loadPopularTags();
    loadAllTags();
  }, [loadCourses]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 2) {
        loadSuggestions();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadSuggestions]);

  const loadPopularTags = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/courses/tags/popular?limit=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        setPopularTags(data.popularTags?.map((item: any) => item.tag) || []);
      }
    } catch (error) {
      console.error("Error loading popular tags:", error);
    }
  };

  const loadAllTags = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/courses/tags/all`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAllTags(data.tags || []);
      }
    } catch (error) {
      console.error("Error loading all tags:", error);
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
    await loadCourses(1, filters);
    setRefreshing(false);
  };

  const handleSearch = async () => {
    const newFilters = { ...filters, query: searchQuery };
    setFilters(newFilters);
    setShowSuggestions(false);
    await loadCourses(1, newFilters);
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestions) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    const newFilters = { ...filters, query: suggestion.text };
    setFilters(newFilters);
    loadCourses(1, newFilters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...tempFilters, [key]: value };
    setTempFilters(newFilters);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = tempFilters.tags.includes(tag)
      ? tempFilters.tags.filter(t => t !== tag)
      : [...tempFilters.tags, tag];
    handleFilterChange('tags', newTags);
  };

  const applyFilters = async () => {
    setFilters(tempFilters);
    setShowFilters(false);
    await loadCourses(1, tempFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      query: searchQuery,
      subject: "",
      level: "",
      minPrice: "",
      maxPrice: "",
      tags: [],
      minRating: "",
      sortBy: "createdAt",
      sortOrder: "desc"
    };
    setTempFilters(clearedFilters);
    setFilters(clearedFilters);
    setSearchQuery("");
  };

  const openFilters = () => {
    setTempFilters(filters);
    setShowFilters(true);
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
            paymentMethod: "cash", // Add this line - you can use any valid value
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
    } catch (err) {
      console.error("Enrollment error:", err);
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
      {/* Search Header */}
      <View style={[styles.searchHeader, { backgroundColor: colors.surface }]}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.background }]}>
            <Ionicons name="search" size={20} color={colors.icon} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search courses..."
              placeholderTextColor={colors.icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              onFocus={() => setShowSuggestions(true)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color={colors.icon} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.primary }]}
            onPress={openFilters}
          >
            <Ionicons name="filter" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={[styles.suggestionsContainer, { backgroundColor: colors.surface }]}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(suggestion)}
              >
                <Ionicons 
                  name={suggestion.type === 'title' ? 'book' : suggestion.type === 'subject' ? 'school' : 'pricetag'} 
                  size={16} 
                  color={colors.icon} 
                />
                <Text style={[styles.suggestionText, { color: colors.text }]}>
                  {suggestion.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
          >
            {popularTags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: filters.tags.includes(tag) ? colors.primary : colors.background,
                    borderColor: colors.primary,
                  }
                ]}
                onPress={() => handleTagToggle(tag)}
              >
                <Text style={[
                  styles.tagText,
                  { color: filters.tags.includes(tag) ? 'white' : colors.primary }
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Courses List */}
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

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Courses</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Subject Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Subject</Text>
              <TextInput
                style={[styles.filterInput, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Enter subject"
                placeholderTextColor={colors.icon}
                value={tempFilters.subject}
                onChangeText={(text) => handleFilterChange('subject', text)}
              />
            </View>

            {/* Level Filter */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Level</Text>
              <View style={styles.levelButtons}>
                {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelButton,
                      {
                        backgroundColor: tempFilters.level === level ? colors.primary : colors.surface,
                        borderColor: colors.primary,
                      }
                    ]}
                    onPress={() => handleFilterChange('level', level === 'All Levels' ? '' : level)}
                  >
                    <Text style={[
                      styles.levelButtonText,
                      { color: tempFilters.level === level ? 'white' : colors.primary }
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Price Range</Text>
              <View style={styles.priceInputs}>
                <TextInput
                  style={[styles.priceInput, { backgroundColor: colors.surface, color: colors.text }]}
                  placeholder="Min Price"
                  placeholderTextColor={colors.icon}
                  value={tempFilters.minPrice}
                  onChangeText={(text) => handleFilterChange('minPrice', text)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.priceInput, { backgroundColor: colors.surface, color: colors.text }]}
                  placeholder="Max Price"
                  placeholderTextColor={colors.icon}
                  value={tempFilters.maxPrice}
                  onChangeText={(text) => handleFilterChange('maxPrice', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Sort By</Text>
              <View style={styles.sortButtons}>
                {[
                  { key: 'createdAt', label: 'Newest' },
                  { key: 'price', label: 'Price' },
                  { key: 'rating', label: 'Rating' },
                  { key: 'title', label: 'Title' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.sortButton,
                      {
                        backgroundColor: tempFilters.sortBy === option.key ? colors.primary : colors.surface,
                        borderColor: colors.primary,
                      }
                    ]}
                    onPress={() => handleFilterChange('sortBy', option.key)}
                  >
                    <Text style={[
                      styles.sortButtonText,
                      { color: tempFilters.sortBy === option.key ? 'white' : colors.primary }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* All Tags */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>Tags</Text>
              <View style={styles.tagsGrid}>
                {allTags.slice(0, 20).map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.filterTag,
                      {
                        backgroundColor: tempFilters.tags.includes(tag) ? colors.primary : colors.surface,
                        borderColor: colors.primary,
                      }
                    ]}
                    onPress={() => handleTagToggle(tag)}
                  >
                    <Text style={[
                      styles.filterTagText,
                      { color: tempFilters.tags.includes(tag) ? 'white' : colors.primary }
                    ]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: colors.primary }]}
              onPress={clearFilters}
            >
              <Text style={[styles.clearButtonText, { color: colors.primary }]}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
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
  searchHeader: {
    padding: 16,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  suggestionText: {
    marginLeft: 8,
    fontSize: 14,
  },
  tagsContainer: {
    marginTop: 12,
    paddingVertical: 4,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
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
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    fontSize: 16,
  },
  levelButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    fontSize: 16,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
