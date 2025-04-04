"use client"

import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  Dimensions,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import "react-native-get-random-values" // Required for UUID to work in React Native
import { FontAwesome } from "@expo/vector-icons"
import { v4 as uuidv4 } from "uuid" // Importing UUID

// Add responsive sizing utilities
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const isSmallDevice = SCREEN_WIDTH < 375
const isIOS = Platform.OS === "ios"
const scale = SCREEN_WIDTH / 375
const verticalScale = SCREEN_HEIGHT / 812

// Responsive sizing functions
const rs = (size: number) => Math.round(size * (isIOS ? Math.min(scale, 1.2) : scale))
const vs = (size: number) => Math.round(size * (isIOS ? Math.min(verticalScale, 1.2) : verticalScale))

const RecipeScreen = ({ route }) => {
  const navigation = useNavigation()
  const defaultRecipes = [
    {
      "id": "recipe1_80_10_10_450g",
      "name": "Balanced Beef & Chicken",
      "ingredients": [
        {
          "id": "6",
          "name": "Beef Heart",
          "totalWeight": 345, // Rescaled from 767g
          "meatWeight": 345,
          "boneWeight": 0,
          "organWeight": 0,
          "plantMatterWeight": 0,
          "meat": 100, "bone": 0, "organ": 0, "type": "Meat", "unit": "g"
        },
        {
          "id": "43",
          "name": "Chicken Neck skinless",
          "totalWeight": 60, // Rescaled from 134g
          "meatWeight": 15,
          "boneWeight": 45,
          "organWeight": 0,
          "plantMatterWeight": 0,
          "meat": 25, "bone": 75, "organ": 0, "type": "Meat", "unit": "g"
        },
        {
          "id": "8",
          "name": "Beef Liver",
          "totalWeight": 22, // Rescaled from 50g
          "meatWeight": 0,
          "boneWeight": 0,
          "organWeight": 22,
          "plantMatterWeight": 0,
          "meat": 0, "bone": 0, "organ": 100, "type": "Meat", "unit": "g"
        },
        {
          "id": "7",
          "name": "Beef Kidney",
          "totalWeight": 22,
          "meatWeight": 0,
          "boneWeight": 0,
          "organWeight": 22,
          "plantMatterWeight": 0,
          "meat": 0, "bone": 0, "organ": 100, "type": "Meat", "unit": "g"
        }
      ],
      "ratio": "80:10:10",
      "savedRatio": { "meat": 80, "bone": 10, "organ": 10, "plantMatter": 0, "selectedRatio": "80:10:10", "includePlantMatter": false, "isUserDefined": false }
    },
    {
      "id": "recipe2_75_15_10_500g",
      "name": "Chicken & Duck Bone Boost",
      "ingredients": [
        {
          "id": "32",
          "name": "Chicken Breast boneless",
          "totalWeight": 325, // Rescaled from 650g
          "meatWeight": 325,
          "boneWeight": 0,
          "organWeight": 0,
          "plantMatterWeight": 0,
          "meat": 100, "bone": 0, "organ": 0, "type": "Meat", "unit": "g"
        },
        {
          "id": "62",
          "name": "Duck Feet",
          "totalWeight": 125, // Rescaled from 250g
          "meatWeight": 50,
          "boneWeight": 75,
          "organWeight": 0,
          "plantMatterWeight": 0,
          "meat": 40, "bone": 60, "organ": 0, "type": "Meat", "unit": "g"
        },
        {
          "id": "109",
          "name": "Lamb Liver",
          "totalWeight": 25, // Rescaled from 50g
          "meatWeight": 0,
          "boneWeight": 0,
          "organWeight": 25,
          "plantMatterWeight": 0,
          "meat": 0, "bone": 0, "organ": 100, "type": "Meat", "unit": "g"
        },
        {
          "id": "107",
          "name": "Lamb Kidney",
          "totalWeight": 25, // Rescaled from 50g
          "meatWeight": 0,
          "boneWeight": 0,
          "organWeight": 25,
          "plantMatterWeight": 0,
          "meat": 0, "bone": 0, "organ": 100, "type": "Meat", "unit": "g"
        }
      ],
      "ratio": "75:15:10",
      "savedRatio": { "meat": 75, "bone": 15, "organ": 10, "plantMatter": 0, "selectedRatio": "75:15:10", "includePlantMatter": false, "isUserDefined": false }
    },
    {
      "id": "recipe3_70_10_10_10_550g",
      "name": "Pork & Veggie Blend",
      "ingredients": [
        {
          "id": "139",
          "name": "Pork Heart",
          "totalWeight": 334, // Rescaled from 607g
          "meatWeight": 334,
          "boneWeight": 0,
          "organWeight": 0,
          "plantMatterWeight": 0,
          "meat": 100, "bone": 0, "organ": 0, "type": "Meat", "unit": "g"
        },
        {
          "id": "147",
          "name": "Pork Ribs",
          "totalWeight": 106, // Rescaled from 193g
          "meatWeight": 51,
          "boneWeight": 55,
          "organWeight": 0,
          "plantMatterWeight": 0,
          "meat": 48, "bone": 52, "organ": 0, "type": "Meat", "unit": "g"
        },
        {
          "id": "142",
          "name": "Pork Liver",
          "totalWeight": 28, // Rescaled from 50g
          "meatWeight": 0,
          "boneWeight": 0,
          "organWeight": 28,
          "plantMatterWeight": 0,
          "meat": 0, "bone": 0, "organ": 100, "type": "Meat", "unit": "g"
        },
        {
          "id": "140",
          "name": "Pork Kidney",
          "totalWeight": 27, // Rescaled from 50g (adjusted rounding)
          "meatWeight": 0,
          "boneWeight": 0,
          "organWeight": 27,
          "plantMatterWeight": 0,
          "meat": 0, "bone": 0, "organ": 100, "type": "Meat", "unit": "g"
        },
        {
          "id": "24",
          "name": "Carrots",
          "totalWeight": 28, // Rescaled from 50g
          "meatWeight": 0,
          "boneWeight": 0,
          "organWeight": 0,
          "plantMatterWeight": 28,
          "meat": 0, "bone": 0, "organ": 0, "vegetable": 100, "fruit": 0, "nuts": 0, "type": "Vegetable", "unit": "g"
        },
        {
          "id": "16",
          "name": "Blueberries",
          "totalWeight": 27, // Rescaled from 50g (adjusted rounding)
          "meatWeight": 0,
          "boneWeight": 0,
          "organWeight": 0,
          "plantMatterWeight": 27,
          "meat": 0, "bone": 0, "organ": 0, "vegetable": 0, "fruit": 100, "nuts": 0, "type": "Fruit", "unit": "g"
        }
      ],
      "ratio": "70:10:10:10",
      "savedRatio": { "meat": 70, "bone": 10, "organ": 10, "plantMatter": 10, "selectedRatio": "70:10:10:10", "includePlantMatter": true, "isUserDefined": false }
    },
    {
      "id": "recipe4_65_15_10_10_400g",
      "name": "Rabbit, Turkey & Plant Mix",
      "ingredients": [
        {
          "id": "169",
          "name": "Rabbit Mince, boneless",
          "totalWeight": 170, // Rescaled from 425g
          "meatWeight": 170,
          "boneWeight": 0,
          "organWeight": 0,
          "plantMatterWeight": 0,
          "meat": 100, "bone": 0, "organ": 0, "type": "Meat", "unit": "g"
        },
        {
          "id": "186",
          "name": "Turkey Neck",
          "totalWeight": 150, // Rescaled from 375g
          "meatWeight": 90,
          "boneWeight": 60,
          "organWeight": 0,
          "plantMatterWeight": 0,
          "meat": 60, "bone": 40, "organ": 0, "type": "Meat", "unit": "g"
        },
        {
          "id": "185",
          "name": "Turkey Liver",
          "totalWeight": 20, // Rescaled from 50g
          "meatWeight": 0,
          "boneWeight": 0,
          "organWeight": 20,
          "plantMatterWeight": 0,
          "meat": 0, "bone": 0, "organ": 100, "type": "Meat", "unit": "g"
        },
        {
          "id": "183",
          "name": "Turkey Kidney",
          "totalWeight": 20, // Rescaled from 50g
          "meatWeight": 0,
          "boneWeight": 0,
          "organWeight": 20,
          "plantMatterWeight": 0,
          "meat": 0, "bone": 0, "organ": 100, "type": "Meat", "unit": "g"
        },
        {
          "id": "19",
          "name": "Broccoli",
          "totalWeight": 20, // Rescaled from 50g
          "meatWeight": 0,
          "boneWeight": 0,
          "organWeight": 0,
          "plantMatterWeight": 20,
          "meat": 0, "bone": 0, "organ": 0, "vegetable": 100, "fruit": 0, "nuts": 0, "type": "Vegetable", "unit": "g"
        },
        {
          "id": "155",
          "name": "Pumpkin Seeds, unsalted",
          "totalWeight": 12, // Rescaled from 30g
          "meatWeight": 0,
          "boneWeight": 0,
          "organWeight": 0,
          "plantMatterWeight": 12,
          "meat": 0, "bone": 0, "organ": 0, "vegetable": 0, "fruit": 0, "nuts": 100, "type": "Nut & Seed", "unit": "g"
        },
        {
          "id": "2",
          "name": "Apples",
          "totalWeight": 8, // Rescaled from 20g
          "meatWeight": 0,
          "boneWeight": 0,
          "organWeight": 0,
          "plantMatterWeight": 8,
          "meat": 0, "bone": 0, "organ": 0, "vegetable": 0, "fruit": 100, "nuts": 0, "type": "Fruit", "unit": "g"
        }
      ],
      "ratio": "65:15:10:10",
      "savedRatio": { "meat": 65, "bone": 15, "organ": 10, "plantMatter": 10, "selectedRatio": "65:15:10:10", "includePlantMatter": true, "isUserDefined": false }
    },
  ]

  const [recipes, setRecipes] = useState([])
  const [newRecipeName, setNewRecipeName] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [recipeToEdit, setRecipeToEdit] = useState(null)
  const [ingredients, setIngredients] = useState([]) // Declare ingredients

  // Destructure `recipeName` and `recipeId` from route params if provided
  const { recipeName, recipeId } = route?.params || {}

  useEffect(() => {
    if (route?.params?.newRecipeName && route?.params?.ingredients) {
      const { newRecipeName, ingredients } = route.params

      // Check if newRecipeName is a valid string
      if (typeof newRecipeName === "string") {
        let uniqueRecipeName = newRecipeName.trim()
        let counter = 1

        // Ensure the recipe name is unique
        while (recipes.some((recipe) => recipe.name === uniqueRecipeName)) {
          uniqueRecipeName = `${newRecipeName.trim()}(${counter})`
          counter++
        }

        const newRecipe = {
          id: uuidv4(), // Use UUID for unique ID
          name: uniqueRecipeName,
          ingredients: ingredients, // Assign the passed ingredients here
        }

        // Add the new recipe to the list
        setRecipes((prevRecipes) => [...prevRecipes, newRecipe])

        // Save the updated recipes list to AsyncStorage
        AsyncStorage.setItem("recipes", JSON.stringify([...recipes, newRecipe]))

        // Clear the params after adding the recipe
        navigation.setParams({ newRecipeName: null, ingredients: null })
      }
    }
  }, [route.params, recipes, navigation])

  useFocusEffect(
    React.useCallback(() => {
      const loadRecipes = async () => {
        try {
          const storedRecipes = await AsyncStorage.getItem("recipes")
          let recipesToSet = []

          if (storedRecipes) {
            const parsedStoredRecipes = JSON.parse(storedRecipes)

            // Ensure we don't add default recipes again if they already exist
            if (parsedStoredRecipes.length > 0) {
              recipesToSet = parsedStoredRecipes
            } else {
              console.log("No recipes found, adding defaults.")
              recipesToSet = defaultRecipes
              await AsyncStorage.setItem("recipes", JSON.stringify(defaultRecipes))
            }
          } else {
            console.log("No saved recipes found, initializing with defaults.")
            recipesToSet = defaultRecipes
            await AsyncStorage.setItem("recipes", JSON.stringify(defaultRecipes))
          }

          console.log("📥 Loaded recipes in RecipeScreen:", recipesToSet)
          setRecipes(recipesToSet)
        } catch (error) {
          console.log("❌ Error loading recipes:", error)
        }
      }
      loadRecipes()
    }, []),
  )

  const calculateRecipeRatio = (recipe) => {
    // If the recipe has a saved ratio, use that for display
    if (recipe.savedRatio) {
      if (recipe.savedRatio.includePlantMatter) {
        return `${recipe.savedRatio.meat} M : ${recipe.savedRatio.bone} B : ${recipe.savedRatio.organ} O : ${recipe.savedRatio.plantMatter} P`
      } else {
        return `${recipe.savedRatio.meat} M : ${recipe.savedRatio.bone} B : ${recipe.savedRatio.organ} O`
      }
    }

    const ratioStr = String(recipe.ratio)
    const parts = ratioStr.split(":")

    if (parts.length === 3) {
      return `${parts[0]}M:${parts[1]}B:${parts[2]}O`
    }

    if (parts.length === 4) {
      return `${parts[0]}M:${parts[1]}B:${parts[2]}O:${parts[3]}P`
    }

    let totalMeat = 0
    let totalBone = 0
    let totalOrgan = 0
    let totalPlant = 0
    let totalWeight = 0

    recipe.ingredients.forEach((ingredient) => {
      totalMeat += ingredient.meatWeight || 0
      totalBone += ingredient.boneWeight || 0
      totalOrgan += ingredient.organWeight || 0

      // Sum plant matter from both dedicated plant matter ingredients and plantMatterWeight property
      if (ingredient.type === "Fruit" || ingredient.type === "Vegetable" || ingredient.type === "Nut & Seed") {
        totalPlant += ingredient.totalWeight || 0
      } else if (ingredient.plantMatterWeight) {
        totalPlant += ingredient.plantMatterWeight
      }

      totalWeight += ingredient.totalWeight || 0
    })

    const meatRatio = totalWeight ? Math.round((totalMeat / totalWeight) * 100) : 0
    const boneRatio = totalWeight ? Math.round((totalBone / totalWeight) * 100) : 0
    const organRatio = totalWeight ? Math.round((totalOrgan / totalWeight) * 100) : 0
    const plantRatio = totalWeight ? Math.round((totalPlant / totalWeight) * 100) : 0

    // Return formatted ratio string
    return totalPlant > 0
      ? `${meatRatio}M:${boneRatio}B:${organRatio}O:${plantRatio}P`
      : `${meatRatio}M:${boneRatio}B:${organRatio}O`
  }

  useEffect(() => {
    const saveRecipes = async () => {
      try {
        console.log("Saving Recipes:", recipes)
        await AsyncStorage.setItem("recipes", JSON.stringify(recipes))
      } catch (error) {
        console.log("Error saving recipes: ", error)
      }
    }
    saveRecipes()
  }, [recipes])

    const navigateToRecipeContent = (recipe) => {
      // First check if there are unsaved changes in the current recipe
      const checkUnsavedChanges = async () => {
        try {
          const selectedRecipeStr = await AsyncStorage.getItem("selectedRecipe")
          if (selectedRecipeStr) {
            const hasUnsavedChangesStr = await AsyncStorage.getItem("hasUnsavedChanges")
            const hasUnsavedChanges = hasUnsavedChangesStr === "true"
  
            if (hasUnsavedChanges) {
              // If there are unsaved changes, show a simplified confirmation dialog
              Alert.alert("Unsaved Changes", "Are you sure you want to load? You have unsaved changes.", [
                {
                  text: "Load",
                  onPress: () => loadRecipe(recipe),
                },
                {
                  text: "Cancel",
                  style: "cancel",
                },
              ])
              return
            }
          }
  
          // If no unsaved changes, proceed with loading the recipe
          loadRecipe(recipe)
        } catch (error) {
          console.error("Error checking for unsaved changes:", error)
          // If there's an error, proceed with loading the recipe
          loadRecipe(recipe)
        }
      }

    // Function to load the recipe
    const loadRecipe = (recipe) => {
      Alert.alert(
        "Load Recipe",
        `Do you want to load the recipe "${recipe.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes",
            onPress: async () => {
              try {
                // First save the current recipe ID for reference
                await AsyncStorage.setItem("currentRecipeId", recipe.id)
                console.log(`✅ Set current recipe ID to ${recipe.id}`)

                // Check if there's a saved ratio for this recipe
                const savedRecipeRatio = await AsyncStorage.getItem(`recipe_ratio_${recipe.id}`)
                let ratioObject = {}

                if (savedRecipeRatio) {
                  // If we have a saved ratio for this recipe, use it
                  console.log("📥 Found saved ratio for recipe:", savedRecipeRatio)
                  ratioObject = JSON.parse(savedRecipeRatio)

                  // IMPORTANT: Ensure the selectedRatio is preserved exactly as saved
                  // This is crucial for custom ratios to be recognized
                  console.log(`📥 Using saved ratio with selectedRatio: ${ratioObject.selectedRatio}`)

                  // Make sure includePlantMatter is properly set
                  if (ratioObject.plantMatter > 0 && ratioObject.includePlantMatter === undefined) {
                    ratioObject.includePlantMatter = true
                  }
                } else if (recipe.savedRatio) {
                  // Use the recipe's saved ratio object if available
                  ratioObject = recipe.savedRatio
                  console.log(`📥 Using recipe's saved ratio object:`, ratioObject)

                  // For any non-standard ratio, treat it as custom
                  if (
                    ratioObject.selectedRatio !== "80:10:10" &&
                    ratioObject.selectedRatio !== "75:15:10" &&
                    ratioObject.selectedRatio !== "70:10:10:10" &&
                    ratioObject.selectedRatio !== "65:15:10:10"
                  ) {
                    console.log("📝 Converting non-standard ratio to custom format")
                    ratioObject = {
                      meat: ratioObject.meat,
                      bone: ratioObject.bone,
                      organ: ratioObject.organ,
                      plantMatter: ratioObject.plantMatter || 0,
                      includePlantMatter: ratioObject.includePlantMatter || ratioObject.plantMatter > 0,
                      selectedRatio: "custom",
                      isUserDefined: true,
                    }
                  }
                } else if (recipe.ratio && recipe.ratio.includes(":")) {
                  // Otherwise use the recipe's default ratio
                  const ratioParts = recipe.ratio.split(":").map(Number)

                  // Create ratio object with actual values
                  ratioObject = {
                    meat: ratioParts[0] || 0,
                    bone: ratioParts[1] || 0,
                    organ: ratioParts[2] || 0,
                    plantMatter: ratioParts[3] || 0,
                    includePlantMatter: ratioParts.length > 3 && ratioParts[3] > 0,
                    selectedRatio: recipe.ratio,
                  }
                } else {
                  // Default ratio if none exists
                  ratioObject = {
                    meat: 80,
                    bone: 10,
                    organ: 10,
                    plantMatter: 0,
                    includePlantMatter: false,
                    selectedRatio: "80:10:10",
                  }
                }

                // Clear any temporary ratio modification flag
                await AsyncStorage.removeItem("tempRatioModified")
                await AsyncStorage.removeItem("hasUnsavedChanges")
                await AsyncStorage.removeItem("userSelectedRatio") // Reset user selection flag

                // Save ratio to AsyncStorage for persistence
                const batch = [
                  ["meatRatio", ratioObject.meat.toString()],
                  ["boneRatio", ratioObject.bone.toString()],
                  ["organRatio", ratioObject.organ.toString()],
                  ["plantMatterRatio", (ratioObject.plantMatter || 0).toString()],
                  ["selectedRatio", ratioObject.selectedRatio],
                  ["includePlantMatter", (ratioObject.plantMatter > 0 || ratioObject.includePlantMatter).toString()],
                ]

                // If it's a custom ratio, save to custom keys as well
                if (ratioObject.selectedRatio === "custom") {
                  batch.push(
                    ["customMeatRatio", ratioObject.meat.toString()],
                    ["customBoneRatio", ratioObject.bone.toString()],
                    ["customOrganRatio", ratioObject.organ.toString()],
                    ["customPlantMatterRatio", (ratioObject.plantMatter || 0).toString()],
                    [
                      "customIncludePlantMatter",
                      (ratioObject.plantMatter > 0 || ratioObject.includePlantMatter).toString(),
                    ],
                  )
                }

                // Save all ratio data
                await Promise.all(batch.map(([key, value]) => AsyncStorage.setItem(key, value)))

                console.log("📤 Passing ratio from RecipeScreen:", ratioObject)

                // Store in AsyncStorage for persistence
                await AsyncStorage.setItem(
                  "selectedRecipe",
                  JSON.stringify({
                    ingredients: recipe.ingredients,
                    recipeName: recipe.name,
                    recipeId: recipe.id,
                    ratio: ratioObject,
                  }),
                )

                // Navigate with all necessary parameters
                navigation.navigate("HomeTabs", {
                  screen: "HomeTabsHome",
                  params: {
                    recipeName: recipe.name,
                    recipeId: recipe.id,
                    ingredients: recipe.ingredients,
                    ratio: ratioObject,
                  },
                })
              } catch (error) {
                console.error("❌ Error loading recipe into FoodInputScreen", error)
                Alert.alert("Error", "Failed to load the recipe. Please try again.")
              }
            },
          },
        ],
        { cancelable: true },
      )
    }

    // Start the process by checking for unsaved changes
    checkUnsavedChanges()
  }

  const handleOpenEditModal = (recipe) => {
    setRecipeToEdit(recipe)
    setNewRecipeName(recipe.name)
    setIsModalVisible(true)
  }

  const handleSaveEditedRecipe = () => {
    if (newRecipeName.trim()) {
      let uniqueRecipeName = newRecipeName.trim()
      let counter = 1

      // Ensure unique recipe name when editing
      while (recipes.some((recipe) => recipe.name === uniqueRecipeName && recipe.id !== recipeToEdit.id)) {
        uniqueRecipeName = `${newRecipeName.trim()}(${counter})`
        counter++
      }

      // Update the recipe name
      const updatedRecipes = recipes.map((recipe) =>
        recipe.id === recipeToEdit.id ? { ...recipe, name: uniqueRecipeName } : recipe,
      )

      setRecipes(updatedRecipes)
      setIsModalVisible(false)
      setRecipeToEdit(null)
      setNewRecipeName("")
    } else {
      Alert.alert("Error", "Recipe name can't be empty.")
    }
  }

  const handleDeleteRecipe = (recipeId) => {
    const recipeName = recipes.find((recipe) => recipe.id === recipeId)?.name
    Alert.alert("Delete Recipe", `Are you sure you want to delete ${recipeName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => {
          setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== recipeId))
        },
      },
    ])
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "white" }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {recipes.length === 0 ? (
          <Text style={styles.noRecipesText}>No recipes added yet</Text>
        ) : (
          recipes.map((recipe, index) => (
            <TouchableOpacity
              key={`${recipe.id}_${index}`}
              style={styles.recipeItem}
              onPress={() => navigateToRecipeContent(recipe)}
            >
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeText}>{recipe.name}</Text>
                <Text style={styles.ingredientCount}>{calculateRecipeRatio(recipe)}</Text>
              </View>
              <View style={styles.iconsContainer}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleOpenEditModal(recipe)}>
                  <FontAwesome name="edit" size={rs(24)} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteRecipe(recipe.id)}>
                  <FontAwesome name="trash" size={rs(24)} color="black" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <Modal transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{recipeToEdit ? "Edit Recipe" : "Add Recipe"}</Text>
            <TextInput
              style={styles.input}
              placeholder="Recipe Name"
              value={newRecipeName}
              onChangeText={setNewRecipeName}
            />
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={recipeToEdit ? handleSaveEditedRecipe : null}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsModalVisible(false)
                  setNewRecipeName("")
                  setRecipeToEdit(null)
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  noRecipesText: {
    fontSize: rs(isSmallDevice ? 14 : 16),
    textAlign: "center",
    marginTop: 20,
  },
  recipeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "black",
  },
  recipeInfo: {
    flex: 1,
  },
  recipeText: {
    fontSize: rs(isSmallDevice ? 16 : 18),
    fontWeight: "500",
  },
  ingredientCount: {
    fontSize: rs(isSmallDevice ? 12 : 14),
    color: "gray",
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    marginRight: 15,
  },
  deleteButton: {},
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark background
  },
  modalBox: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: rs(isSmallDevice ? 16 : 18),
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: rs(isSmallDevice ? 14 : 16),
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    height: vs(isSmallDevice ? 35 : 40),
    borderColor: "gray",
    borderWidth: 1,
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#000080",
    paddingVertical: vs(isSmallDevice ? 8 : 10),
    paddingHorizontal: rs(20),
    borderRadius: 5,
    marginRight: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: rs(isSmallDevice ? 14 : 16),
  },
  cancelButton: {
    backgroundColor: "grey",
    paddingVertical: vs(isSmallDevice ? 8 : 10),
    paddingHorizontal: rs(20),
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "white",
    fontSize: rs(isSmallDevice ? 14 : 16),
  },
})

export default RecipeScreen