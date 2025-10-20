import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../../../../constants/Colors';
import { useAuth } from '../../../../contexts/AuthContext';
import { useColorScheme } from '../../../../hooks/useColorScheme';

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
  materials: Material[];
}

const { width } = Dimensions.get('window');

export default function MaterialScreen() {
  const params = useLocalSearchParams<{ id: string; materialId: string }>();
  const courseId = params.id;
  const materialId = params.materialId;
  const [material, setMaterial] = useState<Material | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVideoPlayer, setShowVideoPlayer] = useState(true);

  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (courseId && materialId) {
      loadMaterial();
    } else {
    }
  }, []);

  const loadMaterial = async () => {
    try {
      setLoading(true);
      
      // First, get the course details
      const courseResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/courses/${courseId}`);
      
      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        setCourse(courseData);
        
        // Find the specific material
        const foundMaterial = courseData.materials?.find((m: Material) => m._id === materialId);
        if (foundMaterial) {
          setMaterial(foundMaterial);
        } else {
          Alert.alert('Error', 'Material not found');
          router.back();
        }
      } else {
        // For demo purposes, create mock data
        const mockCourse: Course = {
          _id: courseId,
          title: 'Advanced Mathematics',
          materials: [
            {
              _id: '1',
              title: 'Introduction to Calculus',
              type: 'video',
              url: 'https://www.youtube.com/embed/SqcY0GlETPk',
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
        };
        
        setCourse(mockCourse);
        const foundMaterial = mockCourse.materials.find(m => m._id === materialId);
        if (foundMaterial) {
          setMaterial(foundMaterial);
        } else {
          Alert.alert('Error', 'Material not found');
          router.back();
        }
      }
    } catch (error) {
      console.error('Error loading material:', error);
      Alert.alert('Error', 'Failed to load material');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMaterial = async () => {
    if (!material) return;

    try {
      let urlToOpen = material.url;
      
      // Handle YouTube embed URLs
      if (material.type === 'video' && material.url.includes('youtube.com/embed/')) {
        const videoId = material.url.split('/embed/')[1];
        urlToOpen = `https://www.youtube.com/watch?v=${videoId}`;
      }
      
      console.log('Original URL:', material.url);
      console.log('URL to open:', urlToOpen);
      
      // Try to open the URL
      const supported = await Linking.canOpenURL(urlToOpen);
      console.log('Supported:', supported);
      
      if (supported) {
        console.log('Opening URL:', urlToOpen);
        await Linking.openURL(urlToOpen);
      } else {
        // For YouTube videos, try different URL formats
        if (material.type === 'video' && (urlToOpen.includes('youtube') || material.url.includes('youtube'))) {
          let videoId = '';
          
          if (material.url.includes('youtube.com/embed/')) {
            videoId = material.url.split('/embed/')[1];
          } else if (material.url.includes('youtu.be/')) {
            videoId = material.url.split('youtu.be/')[1];
          } else if (material.url.includes('youtube.com/watch?v=')) {
            videoId = material.url.split('watch?v=')[1];
          }
          
          if (videoId) {
            // Try opening with YouTube app scheme
            const youtubeAppUrl = `youtube://www.youtube.com/watch?v=${videoId}`;
            const youtubeSupported = await Linking.canOpenURL(youtubeAppUrl);
            
            if (youtubeSupported) {
              console.log('Opening with YouTube app:', youtubeAppUrl);
              await Linking.openURL(youtubeAppUrl);
              return;
            }
            
            // Try opening in browser as fallback
            const browserUrl = `https://www.youtube.com/watch?v=${videoId}`;
            console.log('Trying to open in browser:', browserUrl);
            
            try {
              await Linking.openURL(browserUrl);
              return;
            } catch (browserError) {
              console.log('Browser fallback failed:', browserError);
            }
          }
        }
        
        // For other content types, try opening in browser
        try {
          console.log('Trying to open in browser:', urlToOpen);
          await Linking.openURL(urlToOpen);
        } catch (browserError) {
          console.log('Browser fallback failed:', browserError);
          Alert.alert(
            'Cannot Open',
            `Cannot open ${material.type} content. Please check the URL or contact your instructor.`
          );
        }
      }
    } catch (error) {
      console.error('Error opening material:', error);
      Alert.alert('Error', 'Failed to open material');
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

  const getMaterialTypeDescription = (type: string) => {
    switch (type) {
      case 'video':
        return 'Video Lecture';
      case 'document':
        return 'Document/PDF';
      case 'link':
        return 'External Link';
      case 'quiz':
        return 'Quiz/Assessment';
      default:
        return 'Learning Material';
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    
    if (url.includes('youtube.com/embed/')) {
      videoId = url.split('/embed/')[1];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('watch?v=')[1];
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
    }
    
    return url;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading material...
        </Text>
      </View>
    );
  }

  if (!material || !course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Material not found
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: true, title: material?.title }} />     
        {/* Material Content */}
        <View style={[styles.content]}>
        {/* Video Player */}
        {material.type === 'video' && showVideoPlayer && (
          <View>
            <View style={[styles.videoContainer, { backgroundColor: colors.surface }]}>
              <WebView
                source={{ uri: getYouTubeEmbedUrl(material.url) }}
                style={styles.videoPlayer}
                allowsFullscreenVideo={true}
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            </View>
          </View>
        )}
        {/* Material Header */}
        <View style={[styles.materialHeader, { backgroundColor: colors.surface }]}>
          <View style={styles.materialIconContainer}>
            <Text style={styles.materialIcon}>
              {getMaterialIcon(material.type)}
            </Text>
          </View>
          
          <View style={styles.materialInfo}>
            <Text style={[styles.materialTitle, { color: colors.text }]}>
              {material.title}
            </Text>
            <Text style={[styles.materialType, { color: colors.primary }]}>
              {getMaterialTypeDescription(material.type)}
            </Text>
            <Text style={[styles.materialDuration, { color: colors.secondary }]}>
              {formatDuration(material.duration)}
            </Text>
          </View>
        </View>

        {/* Material Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Description
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {material.description}
          </Text>
        </View>

        {/* Material Actions */}
        <View style={styles.section}>
          {material.type === 'video' ? (
            <>
              <TouchableOpacity
                style={[styles.openButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowVideoPlayer(!showVideoPlayer)}
                activeOpacity={0.8}
              >
                <Text style={[styles.openButtonText, { color: colors.background }]}>
                  {showVideoPlayer ? 'Hide Video Player' : 'Play Video'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                onPress={handleOpenMaterial}
                activeOpacity={0.8}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                  Open in YouTube App
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.openButton, { backgroundColor: colors.primary }]}
              onPress={handleOpenMaterial}
              activeOpacity={0.8}
            >
              <Text style={[styles.openButtonText, { color: colors.background }]}>
                Open {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
              </Text>
            </TouchableOpacity>
          )}

          {material.type === 'quiz' && (
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}
              onPress={() => Alert.alert('Info', 'Quiz functionality will be implemented soon!')}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                View Instructions
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Additional Information
          </Text>
          
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.secondary }]}>
                Material Type:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {getMaterialTypeDescription(material.type)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.secondary }]}>
                Duration:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatDuration(material.duration)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.secondary }]}>
                Course:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {course.title}
              </Text>
            </View>
          </View>
        </View>

        {/* Navigation to other materials */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Other Materials in This Course
          </Text>
          
          {course.materials
            .filter(m => m._id !== material._id)
            .slice(0, 3)
            .map((otherMaterial) => (
              <TouchableOpacity
                key={otherMaterial._id}
                style={[styles.otherMaterialCard, { backgroundColor: colors.surface }]}
                onPress={() => router.push({
                  pathname: '/course/material/[materialId]',
                  params: { id: courseId, materialId: otherMaterial._id }
                })}
                activeOpacity={0.7}
              >
                <Text style={styles.otherMaterialIcon}>
                  {getMaterialIcon(otherMaterial.type)}
                </Text>
                <View style={styles.otherMaterialInfo}>
                  <Text style={[styles.otherMaterialTitle, { color: colors.text }]}>
                    {otherMaterial.title}
                  </Text>
                  <Text style={[styles.otherMaterialType, { color: colors.secondary }]}>
                    {getMaterialTypeDescription(otherMaterial.type)} • {formatDuration(otherMaterial.duration)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
        </View>
      </View>
    </ScrollView>


  </>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  materialHeader: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 5,
  },
  materialIconContainer: {
    marginRight: 16,
  },
  materialIcon: {
    fontSize: 32,
  },
  materialInfo: {
    flex: 1,
    gap: 4,
  },
  materialTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  materialType: {
    fontSize: 14,
    fontWeight: '600',
  },
  materialDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  openButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  openButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  otherMaterialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  otherMaterialIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  otherMaterialInfo: {
    flex: 1,
  },
  otherMaterialTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  otherMaterialType: {
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
  videoContainer: {
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
  },
  videoPlayer: {
    height: 200,
    width: '100%',
  },
  videoLoading: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLoadingText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
});
