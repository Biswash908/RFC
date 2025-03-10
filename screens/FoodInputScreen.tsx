import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, TextInput, SafeAreaView, Modal, StatusBar } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useUnit } from '../UnitContext';
import { v4 as uuidv4 } from 'uuid';

export type Ingredient = {
  name: string;
  meatWeight: number;
  boneWeight: number;
  organWeight: number;
  plantMatterWeight?: number;
  totalWeight: number;
  unit: 'g' | 'kg' | 'lbs';
  type?: 'Fruit' | 'Vegetable' | 'Nut & Seed';
};

export type RootStackParamList = {
  FoodInputScreen: { 
    recipeId: string; 
    recipeName: string; 
    ingredients: Ingredient[]; 
  };
  FoodInfoScreen: { ingredient: Ingredient; editMode: boolean };
  SearchScreen: undefined;
  CalculatorScreen: { meat: number; bone: number; organ: number };
};

type FoodInputScreenRouteProp = RouteProp<RootStackParamList, 'FoodInputScreen'>;

const FoodInputScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<FoodInputScreenRouteProp>();
  const { unit: globalUnit } = useUnit();

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [totalMeat, setTotalMeat] = useState(0);
  const [totalBone, setTotalBone] = useState(0);
  const [totalOrgan, setTotalOrgan] = useState(0);
  const [totalPlantMatter, setTotalPlantMatter] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [recipeName, setRecipeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [newMeat, setNewMeat] = useState<number>(0);
  const [newBone, setNewBone] = useState<number>(0);
  const [newOrgan, setNewOrgan] = useState<number>(0);
  const [newPlantMatter, setNewPlantMatter] = useState<number>(0); // For plant matter

  const [meatRatio, setMeatRatio] = useState(0);
  const [boneRatio, setBoneRatio] = useState(0);
  const [organRatio, setOrganRatio] = useState(0);
  const [plantMatterRatio, setPlantMatterRatio] = useState(0); // For plant matter
  const [selectedRatio, setSelectedRatio] = useState<string>('80:10:10'); 

  useEffect(() => {
    const newIngredient = route.params?.updatedIngredient;
    if (newIngredient) {
      newIngredient.unit = newIngredient.unit || globalUnit;
  
      // Default undefined weights to 0
      newIngredient.meatWeight = newIngredient.meatWeight ?? 0;
      newIngredient.boneWeight = newIngredient.boneWeight ?? 0;
      newIngredient.organWeight = newIngredient.organWeight ?? 0;
      newIngredient.plantMatterWeight = newIngredient.plantMatterWeight ?? 0;
  
      const existingIngredientIndex = ingredients.findIndex(ing => ing.name === newIngredient.name);
      let updatedIngredients;
      if (existingIngredientIndex !== -1) {
        updatedIngredients = ingredients.map((ing, index) =>
          index === existingIngredientIndex ? newIngredient : ing
        );
      } else {
        updatedIngredients = [...ingredients, newIngredient];
      }
  
      setIngredients(updatedIngredients);
      calculateTotals(updatedIngredients);
    }
  }, [route.params?.updatedIngredient]);

  useEffect(() => {
    if (route.params?.ratio) {
      const { meat, bone, organ, plantMatter, selectedRatio } = route.params.ratio;
  
      console.log("📥 Received ratio in FoodInputScreen from CS:", { meat, bone, organ, plantMatter, selectedRatio });
  
      setMeatRatio(meat);
      setBoneRatio(bone);
      setOrganRatio(organ);
      
      // ✅ Only set plant matter if it exists (avoids potential errors)
      if (plantMatter !== undefined) {
        setPlantMatterRatio(plantMatter);
      }
  
      setSelectedRatio(selectedRatio);
    }
  }, [route.params?.ratio]);  
  
  useEffect(() => {
    const newIngredient = route.params?.updatedIngredient;
    if (newIngredient && newIngredient.name) {
      newIngredient.unit = newIngredient.unit || globalUnit;
      newIngredient.meatWeight = newIngredient.meatWeight ?? 0;
      newIngredient.boneWeight = newIngredient.boneWeight ?? 0;
      newIngredient.organWeight = newIngredient.organWeight ?? 0;
      newIngredient.plantMatterWeight = newIngredient.plantMatterWeight ?? 0;
  
      const existingIngredientIndex = ingredients.findIndex(ing => ing.name === newIngredient.name);
      const updatedIngredients = existingIngredientIndex !== -1
        ? ingredients.map((ing, index) => (index === existingIngredientIndex ? newIngredient : ing))
        : [...ingredients, newIngredient];
  
      setIngredients(updatedIngredients);
      calculateTotals(updatedIngredients);
    }
  }, [route.params?.updatedIngredient]);
  

  const convertToUnit = (weight: number, fromUnit: 'g' | 'kg' | 'lbs', toUnit: 'g' | 'kg' | 'lbs') => {
    if (fromUnit === toUnit) return weight;
    switch (fromUnit) {
      case 'g':
        return toUnit === 'kg' ? weight / 1000 : weight / 453.592;
      case 'kg':
        return toUnit === 'g' ? weight * 1000 : weight * 2.20462;
      case 'lbs':
        return toUnit === 'g' ? weight * 453.592 : weight / 2.20462;
    }
  };

  const calculateTotals = (updatedIngredients: Ingredient[]) => {
    const totalWt = updatedIngredients.reduce(
      (sum, ing) => sum + convertToUnit(ing.totalWeight, ing.unit, globalUnit),
      0
    );
  
    const meatWeight = updatedIngredients.reduce(
      (sum, ing) => sum + convertToUnit(ing.meatWeight, ing.unit, globalUnit),
      0
    );
  
    const boneWeight = updatedIngredients.reduce(
      (sum, ing) => sum + convertToUnit(ing.boneWeight, ing.unit, globalUnit),
      0
    );
  
    const organWeight = updatedIngredients.reduce(
      (sum, ing) => sum + convertToUnit(ing.organWeight, ing.unit, globalUnit),
      0
    );
  
    // Correctly sum all plant matter (fruits, vegetables, nuts)
    const plantMatterWeight = updatedIngredients.reduce(
      (sum, ing) =>
        ing.type === 'Fruit' ||
        ing.type === 'Vegetable' ||
        ing.type === 'Nut & Seed'
          ? sum + convertToUnit(ing.totalWeight, ing.unit, globalUnit)
          : sum,
      0
    );
  
    setTotalWeight(totalWt);
    setTotalMeat(meatWeight);
    setTotalBone(boneWeight);
    setTotalOrgan(organWeight);
    setTotalPlantMatter(plantMatterWeight);
  };
  
  const handleSaveRecipe = async () => {
    if (!recipeName.trim()) {
      setIsModalVisible(true);
      return;
    }
  
    if (ingredients.length === 0) {
      Alert.alert('Error', "Ingredients can't be empty.");
      return;
    }
  
    setIsSaving(true);
    try {
      const storedRecipes = await AsyncStorage.getItem('recipes');
console.log("🔍 Stored Recipes:", JSON.parse(storedRecipes));
      const parsedRecipes = storedRecipes ? JSON.parse(storedRecipes) : [];
  
      const generateUniqueRecipeName = (name: string, existingRecipes: any[]) => {
        let newName = name;
        let counter = 1;
        while (existingRecipes.some((r: any) => r.name.toLowerCase() === newName.toLowerCase())) {
          newName = `${name} (${counter})`;
          counter++;
        }
        return newName;
      };
  
      const uniqueRecipeName = generateUniqueRecipeName(recipeName.trim(), parsedRecipes);
  
      // Include the ratio when saving the recipe
      const newRecipe = {
        id: uuidv4(),
        name: uniqueRecipeName,
        totalMeat,
        totalBone,
        totalOrgan,
        totalPlantMatter,
        totalWeight,
        ratio: selectedRatio === 'custom'
          ? `${newMeat}:${newBone}:${newOrgan}${newPlantMatter > 0 ? `:${newPlantMatter}` : ''}`
          : selectedRatio, // ✅ Save custom ratio as numbers, not "custom"
        ingredients: ingredients.map(ing => ({
          name: ing.name,
          meatWeight: ing.meatWeight,
          boneWeight: ing.boneWeight,
          organWeight: ing.organWeight,
          plantMatterWeight: ing.plantMatterWeight || 0,
          totalWeight: ing.totalWeight,
          unit: ing.unit,
          type: ing.type || null,
        })),
      };
      
      console.log("✅ Saving Recipe:", newRecipe); // Add this log          
  
      const updatedRecipes = [...parsedRecipes, newRecipe];
      await AsyncStorage.setItem('recipes', JSON.stringify(updatedRecipes));
  
      Alert.alert('Success', `Recipe saved successfully as "${uniqueRecipeName}"!`);
      setIsModalVisible(false);
      setRecipeName('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save the recipe.');
      console.error('Failed to save recipe', error);
    } finally {
      setIsSaving(false);
    }
  };  

  useEffect(() => {
    if (route.params) {
      const { recipeId, recipeName, ingredients } = route.params;
      console.log('Received recipeId:', recipeId);
      console.log('Received recipeName:', recipeName);
      console.log('Received ingredients:', ingredients);
  
      if (ingredients) {
        const updatedIngredients = ingredients.map((ing) => ({
          ...ing,
          unit: ing.unit || globalUnit,
          meatWeight: ing.meatWeight ?? 0,
          boneWeight: ing.boneWeight ?? 0,
          organWeight: ing.organWeight ?? 0,
          plantMatterWeight: ing.plantMatterWeight ?? 0,
          totalWeight: ing.totalWeight ?? 0,
        }));
        setIngredients(updatedIngredients);
        calculateTotals(updatedIngredients);
      }
  
      if (recipeName) {
        setRecipeName(recipeName);
      }
    }
  }, [route.params]);  

  const handleDeleteIngredient = (name: string) => {
    Alert.alert(
      'Delete Ingredient',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => {
          const updatedIngredients = ingredients.filter(ing => ing.name !== name);
          setIngredients(updatedIngredients);
          calculateTotals(updatedIngredients);
        }}
      ]
    );
  };

  const handleClearScreen = () => {
    Alert.alert(
      'Clear Ingredients',
      'Are you sure you want to clear all ingredients and the recipe name?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => {
            setIngredients([]);
            setRecipeName('');
            setTotalMeat(0);
            setTotalBone(0);
            setTotalOrgan(0);
            setTotalWeight(0);
          }},
      ]
    );
  };

  const formatWeight = (weight: number | undefined, weightUnit: 'g' | 'kg' | 'lbs') => {
    return (weight !== undefined && !isNaN(weight) ? weight.toFixed(2) : '0.00') + ' ' + weightUnit;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>

      <View style={styles.topBar}>
        <Text style={styles.topBarText}>{recipeName ? recipeName : 'Raw Feeding Calc'}</Text>
      </View>

        <View style={styles.totalBar}>
          <Text style={styles.totalText}>
            Total: {formatWeight(isNaN(totalWeight) ? 0 : totalWeight, globalUnit)}
          </Text>
          <Text style={styles.subTotalText}>
            Meat: {formatWeight(totalMeat, globalUnit)} ({totalWeight > 0 ? (totalMeat / totalWeight * 100).toFixed(2) : 0}%) | 
            Bone: {formatWeight(totalBone, globalUnit)} ({totalWeight > 0 ? (totalBone / totalWeight * 100).toFixed(2) : 0}%) | 
            Organ: {formatWeight(totalOrgan, globalUnit)} ({totalWeight > 0 ? (totalOrgan / totalWeight * 100).toFixed(2) : 0}%) | 
            Plant Matter: {formatWeight(totalPlantMatter, globalUnit)} ({totalWeight > 0 ? (totalPlantMatter / totalWeight * 100).toFixed(2) : 0}%)
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
    {ingredients.length === 0 ? (
      <Text style={styles.noIngredientsText}>No ingredients added yet</Text>
    ) : (
      ingredients.map((ingredient, index) => {
        const isPlantMatter = ingredient.meatWeight === 0 && ingredient.boneWeight === 0 && ingredient.organWeight === 0;

        return (
          <View
            key={index}
            style={isPlantMatter ? styles.plantMatterItem : styles.meatItem}
          >
            <View style={styles.ingredientInfo}>
              <Text style={styles.ingredientText}>{ingredient.name}</Text>
              {isPlantMatter ? (
                <>
                  <Text style={styles.ingredientDetails}>
                    Type: {ingredient.type || 'N/A'} 
                  </Text>
                  <Text style={styles.totalWeightText}>
                    Total: {formatWeight(ingredient.totalWeight, ingredient.unit)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.ingredientDetails}>
                    M: {formatWeight(ingredient.meatWeight, ingredient.unit)}  B: {formatWeight(ingredient.boneWeight, ingredient.unit)}  O: {formatWeight(ingredient.organWeight, ingredient.unit)}
                  </Text>
                  <Text style={styles.totalWeightText}>
                    Total: {formatWeight(ingredient.totalWeight, ingredient.unit)}
                  </Text>
                </>
              )}
            </View>
            <View style={styles.iconsContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  navigation.navigate('FoodInfoScreen', {
                    ingredient: { ...ingredient, unit: ingredient.unit },
                    editMode: true,
                  })
                }
              >
                <FontAwesome name="edit" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteIngredient(ingredient.name)}
              >
                <FontAwesome name="trash" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        );
      })
    )}
  </ScrollView>

  <Modal
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Add Recipe</Text>
              <TextInput
                style={styles.input}
                placeholder="Recipe Name"
                value={recipeName}
                onChangeText={setRecipeName}
              />
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveRecipe}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearScreen}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>

        <View style={styles.calculateButtonContainer}>
        <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.ingredientButton}
          onPress={() => navigation.navigate('SearchScreen')}>
          <Text style={styles.ingredientButtonText}>Add Ingredients</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveRecipeButton, isSaving && { backgroundColor: 'grey' }]}
          onPress={handleSaveRecipe}
          disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Recipe</Text>
          )}
        </TouchableOpacity>
        </View>
          
        <TouchableOpacity
          style={styles.calculateButton}
          onPress={() =>
            navigation.navigate('CalculatorScreen', {
              meat: totalMeat,
              bone: totalBone,
              organ: totalOrgan,
              plantmatter: totalPlantMatter,
            })
          }>
          <Text style={styles.calculateButtonText}>Select Ratio & Calculate</Text>
        </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Ensure the parent container has a transparent background
  },
  topBar: {
    backgroundColor: '#000080',
    paddingVertical: 25,
    alignItems: 'center',
  },
  topBarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  totalBar: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ded8d7',
    backgroundColor: 'white',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  subTotalText: {
    fontSize: 16,
    color: 'black',
  },
  scrollContainer: {
    padding: 10,
    paddingBottom: 5, // Extra space for bottom navigation bar
  },
  noIngredientsText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginTop: 50,
  },
  meatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    borderColor: '#cfcfcf',
    borderWidth: 1,
  },
  plantMatterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#e0ffe0', // Light green background for Plant Matter
    borderRadius: 5,
    borderColor: '#8fbc8f', // Darker green border
    borderWidth: 1,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  ingredientDetails: {
    fontSize: 16,
    color: '#404040',
    marginVertical: 5,
  },
  totalWeightText: {
    fontSize: 16,
    color: '#404040',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  editButton: {
    marginRight: 20,
  },
  deleteButton: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background to focus on the modal
  },
  modalBox: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Shadow for Android
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#000080',
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: 'grey',
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addNewRecipeButton: {
    backgroundColor: '#000080',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  addNewRecipeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  noIngredientsText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginTop: 50,
  },
  clearButton: {
    position: 'absolute',
    bottom: 150,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: '#FF3D00', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calculateButtonContainer: {
    padding: 15,
    borderTopWidth: 0.7,
    borderTopColor: '#ded8d7',
    backgroundColor: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  ingredientButton: {
    flex: 1,
    backgroundColor: '#000080',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveRecipeButton: {
    flex: 1,
    backgroundColor: '#000080',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  calculateButton: {
    backgroundColor: '#000080',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000080',
    paddingVertical: 5,
  },
  bottomBarItem: {
    alignItems: 'center',

  },
  bottomBarText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 1,
  },
});

export default FoodInputScreen;