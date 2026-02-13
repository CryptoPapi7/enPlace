import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function PhotoRecipeScreen({ route, navigation }: any) {
  const { imageUri } = route.params;
  const [loading, setLoading] = useState(true);
  const [extractedText, setExtractedText] = useState('');
  const [parsedRecipe, setParsedRecipe] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);

  // Simulate OCR processing (in real app, use ML Kit or cloud OCR)
  useState(() => {
    const processImage = async () => {
      // In production, this would call an OCR service like:
      // - Google ML Kit Vision
      // - Azure Computer Vision
      // - AWS Textract
      // - Tesseract.js
      
      setTimeout(() => {
        // Simulated OCR result
        setExtractedText(
          "Chocolate Chip Cookies\n\n" +
          "Ingredients:\n" +
          "2 1/4 cups all-purpose flour\n" +
          "1 cup butter, softened\n" +
          "3/4 cup sugar\n" +
          "3/4 cup brown sugar\n" +
          "2 eggs\n" +
          "1 tsp vanilla\n" +
          "1 tsp baking soda\n" +
          "2 cups chocolate chips\n\n" +
          "Instructions:\n" +
          "1. Preheat oven to 375°F\n" +
          "2. Mix butter and sugars\n" +
          "3. Add eggs and vanilla\n" +
          "4. Combine dry ingredients\n" +
          "5. Stir in chocolate chips\n" +
          "6. Bake 9-11 minutes"
        );
        
        // Parse into structured recipe
        setParsedRecipe({
          title: 'Chocolate Chip Cookies',
          description: 'Classic homemade chocolate chip cookies',
          ingredients: [
            '2 1/4 cups all-purpose flour',
            '1 cup butter, softened',
            '3/4 cup sugar',
            '3/4 cup brown sugar',
            '2 eggs',
            '1 tsp vanilla',
            '1 tsp baking soda',
            '2 cups chocolate chips',
          ],
          instructions: [
            'Preheat oven to 375°F',
            'Mix butter and sugars until creamy',
            'Add eggs and vanilla, beat well',
            'Combine flour and baking soda, gradually add to mixture',
            'Stir in chocolate chips',
            'Drop by rounded tablespoons onto ungreased baking sheet',
            'Bake 9-11 minutes or until golden brown',
          ],
          totalTime: '30 minutes',
          servings: '48 cookies',
          difficulty: 'Easy',
        });
        
        setLoading(false);
      }, 2000);
    };
    
    processImage();
  });

  const handleSave = () => {
    navigation.navigate('RecipePreview', {
      recipe: parsedRecipe,
      source: 'photo',
      isNew: true,
    });
  };

  const handleManualEdit = () => {
    setEditMode(true);
  };

  const handleRetry = () => {
    setLoading(true);
    // Retry OCR
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8C42" />
          <Text style={styles.loadingText}>Reading your recipe...</Text>
          <Text style={styles.loadingSub}>This may take a few seconds</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Photo Recipe</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetry}
          >
            <Text style={styles.retryText}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />

        {editMode ? (
          // Manual Edit Mode
          <View style={styles.editSection}>
            <Text style={styles.sectionLabel}>Title</Text>
            <TextInput
              style={styles.editInput}
              value={parsedRecipe?.title}
              onChangeText={(text) => setParsedRecipe({...parsedRecipe, title: text})}
            />
            
            <Text style={styles.sectionLabel}>Ingredients (one per line)</Text>
            <TextInput
              style={[styles.editInput, styles.editTextArea]}
              multiline
              value={parsedRecipe?.ingredients.join('\n')}
              onChangeText={(text) => setParsedRecipe({...parsedRecipe, ingredients: text.split('\n')})}
            />
            
            <Text style={styles.sectionLabel}>Instructions (one per line)</Text>
            <TextInput
              style={[styles.editInput, styles.editTextArea]}
              multiline
              value={parsedRecipe?.instructions.join('\n')}
              onChangeText={(text) => setParsedRecipe({...parsedRecipe, instructions: text.split('\n')})}
            />

            <TouchableOpacity 
              style={styles.saveBtn}
              onPress={() => setEditMode(false)}
            >
              <Text style={styles.saveBtnText}>Done Editing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Preview Mode
          <>
            {/* Extracted Recipe Preview */}
            <View style={styles.previewSection}>
              <Text style={styles.recipeTitle}>{parsedRecipe?.title}</Text>
              
              <View style={styles.metaRow}>
                <Text style={styles.meta}>⏱️ {parsedRecipe?.totalTime}</Text>
                <Text style={styles.meta}>👥 {parsedRecipe?.servings}</Text>
                <Text style={styles.meta}>📊 {parsedRecipe?.difficulty}</Text>
              </View>

              <Text style={styles.sectionTitle}>Ingredients</Text>
              {parsedRecipe?.ingredients.map((ing: string, i: number) => (
                <Text key={i} style={styles.listItem}>• {ing}</Text>
              ))}

              <Text style={styles.sectionTitle}>Instructions</Text>
              {parsedRecipe?.instructions.map((step: string, i: number) => (
                <Text key={i} style={styles.step}>{i + 1}. {step}</Text>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.editBtn}
                onPress={handleManualEdit}
              >
                <Text style={styles.editBtnText}>✏️ Edit Manually</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.saveBtn}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>✓ Save Recipe</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5D4E37',
    marginTop: 20,
  },
  loadingSub: {
    fontSize: 14,
    color: '#8B7355',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 20,
    color: '#5D4E37',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5D4E37',
  },
  retryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  retryText: {
    fontSize: 20,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  previewSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5D4E37',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  meta: {
    fontSize: 14,
    color: '#8B7355',
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5D4E37',
    marginTop: 16,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 15,
    color: '#5D4E37',
    marginBottom: 6,
    lineHeight: 22,
  },
  step: {
    fontSize: 15,
    color: '#5D4E37',
    marginBottom: 10,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    padding: 16,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E37',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#FF8C42',
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  editSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4E37',
    marginBottom: 8,
    marginTop: 16,
  },
  editInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#5D4E37',
  },
  editTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
