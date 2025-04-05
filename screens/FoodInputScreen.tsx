"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  SafeAreaView,
  Modal,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { FontAwesome } from "@expo/vector-icons"
import { useUnit } from "../UnitContext"
import { v4 as uuidv4 } from "uuid"

// Added for responsive styling
const isIOS = Platform.OS === "ios"
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const isSmallDevice = SCREEN_WIDTH < 375 // iPhone SE and similar sized devices

// Create a responsive sizing utility
const scale = SCREEN_WIDTH / 375 // Base scale on iPhone 8 width
const verticalScale = SCREEN_HEIGHT / 812 // Base scale on iPhone X height

// Responsive sizing functions
const rs = (size: number) => Math.round(size * (isIOS ? Math.min(scale, 1.2) : scale))
const vs = (size: number) => Math.round(size * (isIOS ? Math.min(verticalScale, 1.2) : verticalScale))
const ms = (size: number, factor = 0.5) => {
  return Math.round(size + (rs(size) - size) * factor)
}

export type Ingredient = {
  name: string
  meatWeight: number
  boneWeight: number
  organWeight: number
  plantMatterWeight?: number
  totalWeight: number
  unit: "g" | "kg" | "lbs"
  type?: "Fruit" | "Vegetable" | "Nut & Seed"
}

export type RootStackParamList = {
  FoodInputScreen: {
    recipeId: string
    recipeName: string
    ingredients: Ingredient[]
    ratio?: any
    isRecipeLoad?: boolean
  }
  FoodInfoScreen: { ingredient: Ingredient; editMode: boolean }
  SearchScreen: undefined
  CalculatorScreen: {
    meat: number
    bone: number
    organ: number
    plantmatter: number
    ratio?: any
  }
}

type FoodInputScreenRouteProp = RouteProp<RootStackParamList, "FoodInputScreen">

const FoodInputScreen: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute<FoodInputScreenRouteProp>()
  const { unit: globalUnit } = useUnit()

  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [totalMeat, setTotalMeat] = useState(0)
  const [totalBone, setTotalBone] = useState(0)
  const [totalOrgan, setTotalOrgan] = useState(0)
  const [totalPlantMatter, setTotalPlantMatter] = useState(0)
  const [totalWeight, setTotalWeight] = useState(0)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isSaveOptionsModalVisible, setIsSaveOptionsModalVisible] = useState(false)
  const [isNewRecipeModalVisible, setIsNewRecipeModalVisible] = useState(false)
  const [recipeName, setRecipeName] = useState("")
  const [newRecipeName, setNewRecipeName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const [newMeat, setNewMeat] = useState<number>(80)
  const [newBone, setNewBone] = useState<number>(10)
  const [newOrgan, setNewOrgan] = useState<number>(10)
  const [newPlantMatter, setNewPlantMatter] = useState<number>(0)

  const [meatRatio, setMeatRatio] = useState(80)
  const [boneRatio, setBoneRatio] = useState(10)
  const [organRatio, setOrganRatio] = useState(10)
  const [plantMatterRatio, setPlantMatterRatio] = useState(0)
  const [selectedRatio, setSelectedRatio] = useState<string>("80:10:10")
  const [includePlantMatter, setIncludePlantMatter] = useState(false)

  // Add refs to track loaded recipe and original state for change detection
  const loadedRecipeIdRef = useRef<string | null>(null)
  const originalIngredientsRef = useRef<Ingredient[]>([])
  const originalRatioRef = useRef<any>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const selectedRatioRef = useRef<string | null>(null)

  // Add this useEffect at the top of the component, right after the state declarations
  useEffect(() => {
    // Reset all change tracking flags on component mount
    const resetAllFlags = async () => {
      try {
        console.log("🔄 Initializing app - resetting all change tracking flags")
        await AsyncStorage.multiSet([
          ["hasUnsavedChanges", "false"],
          ["tempRatioModified", "false"],
          ["userSelectedRatio", "false"],
        ])
        setHasUnsavedChanges(false)
      } catch (error) {
        console.error("Failed to reset flags on startup:", error)
      }
    }

    resetAllFlags()
  }, []) // Empty dependency array means this runs once on mount

  // Add this function to reset change tracking flags when the screen loads
  // Add this near the top of the component, after the state declarations
  useEffect(() => {
    // Reset change tracking flags when the screen first loads
    const resetChangeFlags = async () => {
      try {
        // Only reset if we don't have any ingredients yet
        const currentIngredientsStr = await AsyncStorage.getItem("currentIngredients")
        if (!currentIngredientsStr || JSON.parse(currentIngredientsStr).length === 0) {
          console.log("🔄 Resetting change tracking flags on FoodInputScreen load")
          await AsyncStorage.multiSet([
            ["hasUnsavedChanges", "false"],
            ["tempRatioModified", "false"],
          ])
          setHasUnsavedChanges(false)
        }
      } catch (error) {
        console.error("Failed to reset change flags:", error)
      }
    }

    resetChangeFlags()
  }, [])

  // Modify the useEffect that handles updatedIngredient to properly mark changes
  useEffect(() => {
    const newIngredient = route.params?.updatedIngredient
    if (newIngredient) {
      newIngredient.unit = newIngredient.unit || globalUnit

      // Default undefined weights to 0
      newIngredient.meatWeight = newIngredient.meatWeight ?? 0
      newIngredient.boneWeight = newIngredient.boneWeight ?? 0
      newIngredient.organWeight = newIngredient.organWeight ?? 0
      newIngredient.plantMatterWeight = newIngredient.plantMatterWeight ?? 0

      const existingIngredientIndex = ingredients.findIndex((ing) => ing.name === newIngredient.name)
      let updatedIngredients
      if (existingIngredientIndex !== -1) {
        updatedIngredients = ingredients.map((ing, index) => (index === existingIngredientIndex ? newIngredient : ing))
      } else {
        updatedIngredients = [...ingredients, newIngredient]
      }

      setIngredients(updatedIngredients)
      calculateTotals(updatedIngredients)

      // Save the updated ingredients to AsyncStorage for change detection
      saveCurrentIngredientsToStorage(updatedIngredients)

      // Mark as having unsaved changes - ALWAYS mark as changed when an ingredient is updated
      console.log("📝 Ingredient updated - marking as unsaved")
      setHasUnsavedChanges(true)
      AsyncStorage.setItem("hasUnsavedChanges", "true")
    }
  }, [route.params?.updatedIngredient, globalUnit])

  // Handle ratio updates from CalculatorScreen
  useEffect(() => {
    if (route.params?.ratio) {
      const {
        meat,
        bone,
        organ,
        plantMatter,
        selectedRatio,
        includePlantMatter: includeP,
        isRecipeLoad,
      } = route.params.ratio

      console.log("📥 Received ratio in FoodInputScreen:", {
        meat,
        bone,
        organ,
        plantMatter,
        selectedRatio,
        includeP,
        isRecipeLoad,
      })

      // Update ratio state
      setMeatRatio(meat)
      setBoneRatio(bone)
      setOrganRatio(organ)
      setPlantMatterRatio(plantMatter || 0)
      setSelectedRatio(selectedRatio)
      setIncludePlantMatter(includeP || plantMatter > 0)

      // Update the newRatio values for calculations
      setNewMeat(meat)
      setNewBone(bone)
      setNewOrgan(organ)
      setNewPlantMatter(plantMatter || 0)

      // Store the latest selected ratio for reference
      selectedRatioRef.current = selectedRatio

      // Save temporary ratio values to AsyncStorage
      const saveTemporaryRatio = async () => {
        try {
          // Check if this is a recipe load from the route params
          const isRecipeLoad = route.params?.isRecipeLoad || route.params?.ratio?.isRecipeLoad
          console.log(`📥 Handling ratio update (isRecipeLoad=${isRecipeLoad})`)

          const batch = [
            ["tempMeatRatio", meat.toString()],
            ["tempBoneRatio", bone.toString()],
            ["tempOrganRatio", organ.toString()],
            ["tempPlantMatterRatio", (plantMatter || "0").toString()],
            ["tempSelectedRatio", selectedRatio],
            ["tempIncludePlantMatter", (includeP || plantMatter > 0).toString()],
          ]

          // Only mark as modified if this is NOT a recipe load
          if (!isRecipeLoad) {
            batch.push(["tempRatioModified", "true"])
            batch.push(["userSelectedRatio", "true"])
          } else {
            // If it's a recipe load, explicitly set these to false
            batch.push(["tempRatioModified", "false"])
            batch.push(["userSelectedRatio", "false"])
          }

          await AsyncStorage.multiSet(batch)
          console.log(`✅ Saved temporary ratio values to AsyncStorage (modified=${!isRecipeLoad})`)
        } catch (error) {
          console.error("❌ Failed to save temporary ratio values:", error)
        }
      }
      saveTemporaryRatio()

      // Mark as having unsaved changes if this is a temporary ratio and NOT a recipe load
      if (route.params.ratio.isTemporary && !route.params?.isRecipeLoad && !route.params?.ratio?.isRecipeLoad) {
        setHasUnsavedChanges(true)
        AsyncStorage.setItem("hasUnsavedChanges", "true")
      }
    }
  }, [route.params?.ratio])

  const convertToUnit = (weight: number, fromUnit: "g" | "kg" | "lbs", toUnit: "g" | "kg" | "lbs") => {
    if (fromUnit === toUnit) return weight
    switch (fromUnit) {
      case "g":
        return toUnit === "kg" ? weight / 1000 : weight / 453.592
      case "kg":
        return toUnit === "g" ? weight * 1000 : weight * 2.20462
      case "lbs":
        return toUnit === "g" ? weight * 453.592 : weight / 2.20462
    }
  }

  // Add this function after the calculateTotals function to save current ingredients to AsyncStorage
  const saveCurrentIngredientsToStorage = (updatedIngredients) => {
    try {
      AsyncStorage.setItem("currentIngredients", JSON.stringify(updatedIngredients))
      console.log("✅ Saved current ingredients to AsyncStorage for change detection")
    } catch (error) {
      console.error("❌ Failed to save current ingredients to AsyncStorage:", error)
    }
  }

  // Modify the calculateTotals function to save ingredients after calculation
  const calculateTotals = (updatedIngredients: Ingredient[]) => {
    // Calculate total meat weight
    const meatWeight = updatedIngredients.reduce(
      (sum, ing) => sum + convertToUnit(ing.meatWeight, ing.unit, globalUnit),
      0,
    )

    // Calculate total bone weight
    const boneWeight = updatedIngredients.reduce(
      (sum, ing) => sum + convertToUnit(ing.boneWeight, ing.unit, globalUnit),
      0,
    )

    // Calculate total organ weight
    const organWeight = updatedIngredients.reduce(
      (sum, ing) => sum + convertToUnit(ing.organWeight, ing.unit, globalUnit),
      0,
    )

    // Calculate total plant matter weight
    const plantMatterWeight = updatedIngredients.reduce((sum, ing) => {
      // Check if ingredient type is Fruit, Vegetable, or Nut & Seed
      if (ing.type === "Fruit" || ing.type === "Vegetable" || ing.type === "Nut & Seed") {
        // If yes, add its total weight converted to the global unit
        return sum + convertToUnit(ing.totalWeight, ing.unit, globalUnit)
      } else if (ing.plantMatterWeight) {
        // Otherwise, if it has a specific plantMatterWeight field, add that converted weight
        return sum + convertToUnit(ing.plantMatterWeight, ing.unit, globalUnit)
      }
      // If neither condition is met, return the current sum
      return sum
    }, 0)

    // Calculate the grand total weight by summing the component totals
    const grandTotalWeight = meatWeight + boneWeight + organWeight + plantMatterWeight

    // Update the state variables
    setTotalWeight(grandTotalWeight) // Use the sum of components for the grand total [MODIFIED]
    setTotalMeat(meatWeight)
    setTotalBone(boneWeight)
    setTotalOrgan(organWeight)
    setTotalPlantMatter(plantMatterWeight)

    // After setting all the state variables, save the ingredients to AsyncStorage
    saveCurrentIngredientsToStorage(updatedIngredients)
  }

  // Add this function to handle custom ratio persistence
  const loadCustomRatio = async () => {
    try {
      const customMeatRatio = await AsyncStorage.getItem("customMeatRatio")
      const customBoneRatio = await AsyncStorage.getItem("customBoneRatio")
      const customOrganRatio = await AsyncStorage.getItem("customOrganRatio")
      const customPlantMatterRatio = await AsyncStorage.getItem("customPlantMatterRatio")
      const customIncludePlantMatter = await AsyncStorage.getItem("customIncludePlantMatter")

      return {
        meat: Number(customMeatRatio || "0"),
        bone: Number(customBoneRatio || "0"),
        organ: Number(customOrganRatio || "0"),
        plantMatter: Number(customPlantMatterRatio || "0"),
        includePlantMatter: customIncludePlantMatter === "true",
      }
    } catch (error) {
      console.error("Failed to load custom ratio:", error)
      return null
    }
  }

  // Get the current ratio values from AsyncStorage
  const getCurrentRatioValues = async () => {
    try {
      const meatRatio = await AsyncStorage.getItem("meatRatio")
      const boneRatio = await AsyncStorage.getItem("boneRatio")
      const organRatio = await AsyncStorage.getItem("organRatio")
      const plantMatterRatio = await AsyncStorage.getItem("plantMatterRatio")
      const selectedRatio = await AsyncStorage.getItem("selectedRatio")
      const includePlantMatter = await AsyncStorage.getItem("includePlantMatter")

      // If it's a custom ratio, load the custom values
      if (selectedRatio === "custom") {
        const customRatio = await loadCustomRatio()
        if (customRatio) {
          return {
            meat: customRatio.meat,
            bone: customRatio.bone,
            organ: customRatio.organ,
            plantMatter: customRatio.plantMatter,
            selectedRatio: "custom",
            includePlantMatter: customRatio.includePlantMatter,
          }
        }
      }

      return {
        meat: Number(meatRatio || "80"),
        bone: Number(boneRatio || "10"),
        organ: Number(organRatio || "10"),
        plantMatter: Number(plantMatterRatio || "0"),
        selectedRatio: selectedRatio || "80:10:10",
        includePlantMatter: includePlantMatter === "true",
      }
    } catch (error) {
      console.error("Failed to get current ratio values:", error)
      return null
    }
  }

  // Add a function to handle saving the current ratio to the recipe
  const saveCurrentRatioToRecipe = async (recipeId: string) => {
    try {
      // Get the current ratio values
      const ratioData = await getCurrentRatioValues()

      if (recipeId && ratioData) {
        // If it's a custom ratio, make sure to save the custom values
        if (ratioData.selectedRatio === "custom") {
          const customRatio = await loadCustomRatio()
          if (customRatio) {
            ratioData.meat = customRatio.meat
            ratioData.bone = customRatio.bone
            ratioData.organ = customRatio.organ
            ratioData.plantMatter = customRatio.plantMatter
            ratioData.includePlantMatter = customRatio.includePlantMatter
          }
        }

        await AsyncStorage.setItem(`recipe_ratio_${recipeId}`, JSON.stringify(ratioData))

        // Clear the temporary modification flag
        await AsyncStorage.removeItem("tempRatioModified")
        await AsyncStorage.removeItem("userSelectedRatio")

        console.log(`✅ Permanently saved ratio for recipe ${recipeId}:`, ratioData)
      }
    } catch (error) {
      console.error("Failed to save ratio to recipe:", error)
    }
  }

  // Function to update an existing recipe
  const updateExistingRecipe = async () => {
    if (ingredients.length === 0) {
      Alert.alert("Error", "Ingredients can't be empty.")
      return
    }

    setIsSaving(true)
    try {
      const storedRecipes = await AsyncStorage.getItem("recipes")
      const parsedRecipes = storedRecipes ? JSON.parse(storedRecipes) : []
      const currentRecipeId = loadedRecipeIdRef.current

      if (!currentRecipeId) {
        Alert.alert("Error", "No recipe selected to update.")
        return
      }

      // Get the current temporary ratio values
      const tempMeatRatio = (await AsyncStorage.getItem("tempMeatRatio")) || newMeat.toString()
      const tempBoneRatio = (await AsyncStorage.getItem("tempBoneRatio")) || newBone.toString()
      const tempOrganRatio = (await AsyncStorage.getItem("tempOrganRatio")) || newOrgan.toString()
      const tempPlantMatterRatio = (await AsyncStorage.getItem("tempPlantMatterRatio")) || newPlantMatter.toString()
      const tempSelectedRatio = (await AsyncStorage.getItem("tempSelectedRatio")) || selectedRatio
      const tempIncludePlantMatter =
        (await AsyncStorage.getItem("tempIncludePlantMatter")) || includePlantMatter.toString()

      // Create the updated ratio object using the temporary values
      const ratioObject = {
        meat: Number(tempMeatRatio),
        bone: Number(tempBoneRatio),
        organ: Number(tempOrganRatio),
        plantMatter: Number(tempPlantMatterRatio),
        selectedRatio: tempSelectedRatio,
        includePlantMatter: tempIncludePlantMatter === "true",
        isUserDefined: true,
      }

      console.log("✅ Saving recipe with ratio:", ratioObject)

      // Update the existing recipe
      const updatedRecipes = parsedRecipes.map((recipe) => {
        if (recipe.id === currentRecipeId) {
          return {
            ...recipe,
            name: recipeName,
            totalMeat,
            totalBone,
            totalOrgan,
            totalPlantMatter,
            totalWeight,
            ratio:
              ratioObject.selectedRatio === "custom"
                ? `${ratioObject.meat}:${ratioObject.bone}:${ratioObject.organ}${
                    ratioObject.plantMatter > 0 ? `:${ratioObject.plantMatter}` : ""
                  }`
                : ratioObject.selectedRatio || "80:10:10",
            ingredients: ingredients.map((ing) => ({
              name: ing.name,
              meatWeight: ing.meatWeight,
              boneWeight: ing.boneWeight,
              organWeight: ing.organWeight,
              plantMatterWeight: ing.plantMatterWeight || 0,
              totalWeight: ing.totalWeight,
              unit: ing.unit,
              type: ing.type || null,
            })),
            // Save the ratio object for future reference
            savedRatio: ratioObject,
            // If this is a custom ratio, also save it separately
            savedCustomRatio:
              ratioObject.selectedRatio === "custom"
                ? {
                    meat: ratioObject.meat,
                    bone: ratioObject.bone,
                    organ: ratioObject.organ,
                    plantMatter: ratioObject.plantMatter,
                    includePlantMatter: ratioObject.includePlantMatter,
                  }
                : undefined,
          }
        }
        return recipe
      })

      await AsyncStorage.setItem("recipes", JSON.stringify(updatedRecipes))

      // Save the current ratio to the recipe
      await saveCurrentRatioToRecipe(currentRecipeId)

      // Show success alert
      Alert.alert("Success", `Recipe "${recipeName}" updated successfully!`, [{ text: "OK" }])

      // Reset unsaved changes flag
      setHasUnsavedChanges(false)
      await AsyncStorage.setItem("hasUnsavedChanges", "false")

      // Store the updated state as the new original state
      originalIngredientsRef.current = JSON.parse(JSON.stringify(ingredients))
      originalRatioRef.current = ratioObject
    } catch (error) {
      Alert.alert("Error", "Failed to update the recipe.")
      console.error("Failed to update recipe", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Function to create a new recipe
  const createNewRecipe = async () => {
    if (!newRecipeName.trim()) {
      Alert.alert("Error", "Recipe name can't be empty.")
      return
    }

    if (ingredients.length === 0) {
      Alert.alert("Error", "Ingredients can't be empty.")
      return
    }

    setIsSaving(true)
    try {
      const storedRecipes = await AsyncStorage.getItem("recipes")
      const parsedRecipes = storedRecipes ? JSON.parse(storedRecipes) : []

      const generateUniqueRecipeName = (name: string, existingRecipes: any[]) => {
        let newName = name
        let counter = 1
        while (existingRecipes.some((r: any) => r.name.toLowerCase() === newName.toLowerCase())) {
          newName = `${name} (${counter})`
          counter++
        }
        return newName
      }

      const uniqueRecipeName = generateUniqueRecipeName(newRecipeName.trim(), parsedRecipes)

      // Get the current ratio values
      const ratioData = await getCurrentRatioValues()

      // Get temporary ratio values if they exist
      const tempMeatRatio = await AsyncStorage.getItem("tempMeatRatio")
      const tempBoneRatio = await AsyncStorage.getItem("tempBoneRatio")
      const tempOrganRatio = await AsyncStorage.getItem("tempOrganRatio")
      const tempPlantMatterRatio = await AsyncStorage.getItem("tempPlantMatterRatio")
      const tempSelectedRatio = await AsyncStorage.getItem("tempSelectedRatio")
      const tempIncludePlantMatter = await AsyncStorage.getItem("tempIncludePlantMatter")

      // Use temporary values if they exist, otherwise use the current values
      const ratioObject = {
        meat: Number(tempMeatRatio || ratioData.meat),
        bone: Number(tempBoneRatio || ratioData.bone),
        organ: Number(tempOrganRatio || ratioData.organ),
        plantMatter: Number(tempPlantMatterRatio || ratioData.plantMatter),
        selectedRatio: tempSelectedRatio || ratioData.selectedRatio,
        includePlantMatter: tempIncludePlantMatter === "true" || ratioData.includePlantMatter,
        isUserDefined: true,
      }

      // Create a new recipe
      const newRecipe = {
        id: uuidv4(),
        name: uniqueRecipeName,
        totalMeat,
        totalBone,
        totalOrgan,
        totalPlantMatter,
        totalWeight,
        ratio:
          ratioObject.selectedRatio === "custom"
            ? `${ratioObject.meat}:${ratioObject.bone}:${ratioObject.organ}${
                ratioObject.plantMatter > 0 ? `:${ratioObject.plantMatter}` : ""
              }`
            : ratioObject.selectedRatio || "80:10:10",
        ingredients: ingredients.map((ing) => ({
          name: ing.name,
          meatWeight: ing.meatWeight,
          boneWeight: ing.boneWeight,
          organWeight: ing.organWeight,
          plantMatterWeight: ing.plantMatterWeight || 0,
          totalWeight: ing.totalWeight,
          unit: ing.unit,
          type: ing.type || null,
        })),
        // Save the ratio object for future reference
        savedRatio: ratioObject,
        // If this is a custom ratio, also save it separately
        savedCustomRatio:
          ratioObject.selectedRatio === "custom"
            ? {
                meat: ratioObject.meat,
                bone: ratioObject.bone,
                organ: ratioObject.organ,
                plantMatter: ratioObject.plantMatter,
                includePlantMatter: ratioObject.includePlantMatter,
              }
            : undefined,
      }

      const updatedRecipes = [...parsedRecipes, newRecipe]
      await AsyncStorage.setItem("recipes", JSON.stringify(updatedRecipes))

      // Save the current ratio to the new recipe
      await saveCurrentRatioToRecipe(newRecipe.id)

      // Update the current recipe ID to the new recipe
      loadedRecipeIdRef.current = newRecipe.id
      await AsyncStorage.setItem("currentRecipeId", newRecipe.id)

      // Update the recipe name in the UI
      setRecipeName(uniqueRecipeName)

      // Show success alert
      Alert.alert("Success", `New recipe "${uniqueRecipeName}" created successfully!`, [{ text: "OK" }])

      // Close modals
      setIsNewRecipeModalVisible(false)
      setIsSaveOptionsModalVisible(false)
      setNewRecipeName("")

      // Reset unsaved changes flag
      setHasUnsavedChanges(false)
      await AsyncStorage.setItem("hasUnsavedChanges", "false")

      // Store the updated state as the new original state
      originalIngredientsRef.current = JSON.parse(JSON.stringify(ingredients))
      originalRatioRef.current = ratioObject
    } catch (error) {
      Alert.alert("Error", "Failed to create the new recipe.")
      console.error("Failed to create new recipe", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Modify the handleSaveRecipe function to show the save options modal
  const handleSaveRecipe = async () => {
    if (!recipeName.trim()) {
      setIsModalVisible(true) // Show modal to add recipe name
      return
    }

    if (ingredients.length === 0) {
      Alert.alert("Error", "Ingredients can't be empty.")
      return
    }

    // Check if we're editing a loaded recipe
    if (loadedRecipeIdRef.current) {
      // Ask user if they want to update the existing recipe or create a new one
      Alert.alert("Save Recipe", `Do you want to save changes to "${recipeName}"?`, [
        {
          text: "New Recipe",
          onPress: () => {
            // Show the modal to enter a new name
            setIsNewRecipeModalVisible(true)
          },
        },
        {
          text: "Update",
          onPress: () => {
            // Include tempRatio when updating the recipe
            updateExistingRecipe()
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ])
    } else {
      // No loaded recipe, create a new one with the current ratio
      setIsModalVisible(true) // Show modal to add recipe name
    }
  }

  // Replace multiple useEffects with a single, comprehensive one
  // Modify the effect that handles recipe loading to properly store original ingredients
  useEffect(() => {
    if (route.params) {
      console.log("📥 Received in FoodInputScreen:", route.params)

      // Handle ingredients
      if (route.params.ingredients) {
        const updatedIngredients = route.params.ingredients.map((ing) => ({
          ...ing,
          unit: ing.unit || globalUnit,
          meatWeight: ing.meatWeight ?? 0,
          boneWeight: ing.boneWeight ?? 0,
          organWeight: ing.organWeight ?? 0,
          plantMatterWeight: ing.plantMatterWeight ?? 0,
          totalWeight: ing.totalWeight ?? 0,
        }))
        setIngredients(updatedIngredients)
        calculateTotals(updatedIngredients)

        // Save the ingredients to AsyncStorage for change detection
        saveCurrentIngredientsToStorage(updatedIngredients)

        // Create a deep copy of the ingredients for original reference
        // This is critical for proper change detection
        console.log("📥 Storing original ingredients for change detection")
        originalIngredientsRef.current = JSON.parse(JSON.stringify(updatedIngredients))
      }

      // Handle recipe name
      if (route.params.recipeName) {
        setRecipeName(route.params.recipeName)
      }

      // Handle recipe ID
      if (route.params.recipeId) {
        loadedRecipeIdRef.current = route.params.recipeId
        AsyncStorage.setItem("currentRecipeId", route.params.recipeId)
      }

      // Handle ratio
      if (route.params.ratio) {
        const { meat, bone, organ, plantMatter, selectedRatio, includePlantMatter: includeP } = route.params.ratio
        console.log("📥 Loaded ratio in FoodInputScreen:", {
          meat,
          bone,
          organ,
          plantMatter,
          selectedRatio,
          includeP,
        })

        setMeatRatio(meat || 80)
        setBoneRatio(bone || 10)
        setOrganRatio(organ || 10)
        setPlantMatterRatio(plantMatter || 0)
        setSelectedRatio(selectedRatio || "80:10:10")
        setIncludePlantMatter(includeP || plantMatter > 0)

        // Update the newRatio values for calculations
        setNewMeat(meat || 80)
        setNewBone(bone || 10)
        setNewOrgan(organ || 10)
        setNewPlantMatter(plantMatter || 0)

        // Store original ratio for change detection
        originalRatioRef.current = {
          meat: meat || 80,
          bone: bone || 10,
          organ: organ || 10,
          plantMatter: plantMatter || 0,
          selectedRatio: selectedRatio || "80:10:10",
          includePlantMatter: includeP || plantMatter > 0,
        }
      }

      // Handle saveChangesFirst flag
      if (route.params.saveChangesFirst && hasUnsavedChanges) {
        handleSaveRecipe()
      }
    }
  }, [route.params, globalUnit])

  // Also modify the checkForChanges function to be more robust
  // Around line 400, update the checkForChanges function:

  // Add a function to check for unsaved changes
  // Improve the checkForChanges function to better detect weight changes
  const checkForChanges = async () => {
    try {
      // First check if we're in a recipe loading state
      const isRecipeLoad = route.params?.isRecipeLoad || route.params?.ratio?.isRecipeLoad
      if (isRecipeLoad) {
        console.log("🔄 Recipe is being loaded - ignoring change detection")
        setHasUnsavedChanges(false)
        await AsyncStorage.setItem("hasUnsavedChanges", "false")
        return
      }

      // Get the actual flags from AsyncStorage for accurate checking
      const tempRatioModifiedStr = await AsyncStorage.getItem("tempRatioModified")
      const userSelectedRatioStr = await AsyncStorage.getItem("userSelectedRatio")
      const ratioModified = tempRatioModifiedStr === "true" && userSelectedRatioStr === "true"

      // If we have no original ingredients to compare against, there can't be changes
      if (originalIngredientsRef.current.length === 0 && ingredients.length === 0) {
        console.log("🔄 No ingredients to compare - no changes detected")
        setHasUnsavedChanges(false)
        await AsyncStorage.setItem("hasUnsavedChanges", "false")
        return
      }

      // Check if ingredients have changed
      if (originalIngredientsRef.current.length !== ingredients.length) {
        console.log("📝 Ingredient count changed - marking as unsaved")
        setHasUnsavedChanges(true)
        await AsyncStorage.setItem("hasUnsavedChanges", "true")
        return
      }

      // Check if any ingredient details have changed
      let ingredientsChanged = false

      // Only check ingredient details if we have a valid reference to compare against
      if (originalIngredientsRef.current.length > 0) {
        // Create a map of original ingredients by name for easier lookup
        const originalIngredientsMap = {}
        originalIngredientsRef.current.forEach((ing) => {
          originalIngredientsMap[ing.name] = ing
        })

        // Check each current ingredient against its original version
        ingredientsChanged = ingredients.some((ingredient) => {
          const original = originalIngredientsMap[ingredient.name]
          if (!original) return true // If no original found, it's a change

          // Convert all values to numbers and round to 2 decimal places for consistent comparison
          const currentMeat = Math.round(Number(ingredient.meatWeight || 0) * 100) / 100
          const originalMeat = Math.round(Number(original.meatWeight || 0) * 100) / 100
          const currentBone = Math.round(Number(ingredient.boneWeight || 0) * 100) / 100
          const originalBone = Math.round(Number(original.boneWeight || 0) * 100) / 100
          const currentOrgan = Math.round(Number(ingredient.organWeight || 0) * 100) / 100
          const originalOrgan = Math.round(Number(original.organWeight || 0) * 100) / 100
          const currentPlant = Math.round(Number(ingredient.plantMatterWeight || 0) * 100) / 100
          const originalPlant = Math.round(Number(original.plantMatterWeight || 0) * 100) / 100
          const currentTotal = Math.round(Number(ingredient.totalWeight || 0) * 100) / 100
          const originalTotal = Math.round(Number(original.totalWeight || 0) * 100) / 100

          // IMPORTANT: Also check for unit changes
          const unitChanged = ingredient.unit !== original.unit

          // Check if any values are different
          const isDifferent =
            ingredient.name !== original.name ||
            currentMeat !== originalMeat ||
            currentBone !== originalBone ||
            currentOrgan !== originalOrgan ||
            currentPlant !== originalPlant ||
            currentTotal !== originalTotal ||
            unitChanged

          if (isDifferent) {
            console.log(`📝 Ingredient ${ingredient.name} has changed:`, {
              meatWeight: `${originalMeat} -> ${currentMeat}`,
              boneWeight: `${originalBone} -> ${currentBone}`,
              organWeight: `${originalOrgan} -> ${currentOrgan}`,
              plantMatterWeight: `${originalPlant} -> ${currentPlant}`,
              totalWeight: `${originalTotal} -> ${currentTotal}`,
              unit: `${original.unit} -> ${ingredient.unit}`,
            })
          }

          return isDifferent
        })
      }

      // Check if ratio has changed - use the flags from AsyncStorage
      console.log(
        `📝 Checking ratio changes: tempRatioModified=${tempRatioModifiedStr}, userSelectedRatio=${userSelectedRatioStr}`,
      )

      const hasChanges = ingredientsChanged || ratioModified
      console.log(`📝 Change detection result: ingredients=${ingredientsChanged}, ratio=${ratioModified}`)

      setHasUnsavedChanges(hasChanges)
      await AsyncStorage.setItem("hasUnsavedChanges", hasChanges ? "true" : "false")
    } catch (error) {
      console.error("❌ Error in checkForChanges:", error)
      // On error, default to no changes
      setHasUnsavedChanges(false)
      await AsyncStorage.setItem("hasUnsavedChanges", "false")
    }
  }

  // Update the useEffect to use the async version of checkForChanges
  useEffect(() => {
    checkForChanges()
  }, [ingredients, meatRatio, boneRatio, organRatio, plantMatterRatio, selectedRatio, includePlantMatter, route.params])

  // Also update the handleDeleteIngredient function to save the updated ingredients
  const handleDeleteIngredient = (name: string) => {
    Alert.alert("Delete Ingredient", `Are you sure you want to delete ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => {
          const updatedIngredients = ingredients.filter((ing) => ing.name !== name)
          setIngredients(updatedIngredients)
          calculateTotals(updatedIngredients)

          // Save the updated ingredients to AsyncStorage
          saveCurrentIngredientsToStorage(updatedIngredients)

          // Mark as having unsaved changes
          setHasUnsavedChanges(true)
          AsyncStorage.setItem("hasUnsavedChanges", "true")
        },
      },
    ])
  }

  // Update the handleClearScreen function to clear the stored ingredients
  const handleClearScreen = () => {
    Alert.alert("Clear Ingredients", "Are you sure you want to clear all ingredients and the recipe name?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        onPress: () => {
          setIngredients([])
          setRecipeName("")
          setTotalMeat(0)
          setTotalBone(0)
          setTotalOrgan(0)
          setTotalPlantMatter(0)
          setTotalWeight(0)

          // Clear the stored ingredients
          AsyncStorage.removeItem("currentIngredients")

          // Reset the loaded recipe ID
          loadedRecipeIdRef.current = null
          AsyncStorage.removeItem("currentRecipeId")

          // Reset change tracking
          setHasUnsavedChanges(false)
          AsyncStorage.setItem("hasUnsavedChanges", "false")
          originalIngredientsRef.current = []
          originalRatioRef.current = null
        },
      },
    ])
  }

  // Updated formatWeight function to remove .00 for grams and make unit stick to number
  const formatWeight = (weight: number | undefined, weightUnit: "g" | "kg" | "lbs") => {
    if (weight === undefined) weight = 0

    // Format the number based on unit
    let formattedNumber
    if (weightUnit === "g") {
      // For grams, show whole numbers if possible
      formattedNumber = weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(2)
    } else {
      // For kg and lbs, always show 2 decimal places
      formattedNumber = weight.toFixed(2)
    }

    // Return with no space between number and unit
    return formattedNumber + weightUnit
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Update the topBar style to white with black text */}
        <View style={styles.topBar}>
          <Text style={styles.topBarText}>{recipeName ? recipeName : "Raw Feeding Calc"}</Text>
        </View>

        <View style={styles.totalBar}>
          <Text style={styles.totalText}>Total: {formatWeight(isNaN(totalWeight) ? 0 : totalWeight, globalUnit)}</Text>
          <Text style={styles.subTotalText}>
            Meat: {formatWeight(totalMeat, globalUnit)} (
            {totalWeight > 0 ? ((totalMeat / totalWeight) * 100).toFixed(2) : "0.00"}
            %) | Bone: {formatWeight(totalBone, globalUnit)} (
            {totalWeight > 0 ? ((totalBone / totalWeight) * 100).toFixed(2) : "0.00"}
            %) | Organ: {formatWeight(totalOrgan, globalUnit)} (
            {totalWeight > 0 ? ((totalOrgan / totalWeight) * 100).toFixed(2) : "0.00"}
            %) | Plant Matter: {formatWeight(totalPlantMatter, globalUnit)} (
            {totalWeight > 0 ? ((totalPlantMatter / totalWeight) * 100).toFixed(2) : "0.00"}
            %)
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {ingredients.length === 0 ? (
            <Text style={styles.noIngredientsText}>No ingredients added yet</Text>
          ) : (
            ingredients.map((ingredient, index) => {
              const isPlantMatter =
                ingredient.meatWeight === 0 && ingredient.boneWeight === 0 && ingredient.organWeight === 0

              return (
                <View key={index} style={isPlantMatter ? styles.plantMatterItem : styles.ingredientItem}>
                  <View style={styles.ingredientHeader}>
                    <Text style={styles.ingredientText}>{ingredient.name}</Text>
                    <Text style={styles.totalWeightText}>
                      Total: {formatWeight(ingredient.totalWeight, ingredient.unit)}
                    </Text>
                  </View>
                  <View style={styles.detailsContainer}>
                    {isPlantMatter ? (
                      <Text style={styles.detailsText}>Type: {ingredient.type || "N/A"}</Text>
                    ) : (
                      <Text style={styles.detailsText}>
                        M: {formatWeight(ingredient.meatWeight, ingredient.unit)} | B:{" "}
                        {formatWeight(ingredient.boneWeight, ingredient.unit)} | O:{" "}
                        {formatWeight(ingredient.organWeight, ingredient.unit)}
                      </Text>
                    )}
                    <View style={styles.iconsContainer}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() =>
                          navigation.navigate("FoodInfoScreen", {
                            ingredient: { ...ingredient, unit: ingredient.unit },
                            editMode: true,
                          })
                        }
                      >
                        <FontAwesome name="edit" size={rs(24)} color="black" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteIngredient(ingredient.name)}
                      >
                        <FontAwesome name="trash" size={rs(24)} color="black" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
            })
          )}
        </ScrollView>

        {/* Original Recipe Name Modal */}
        <Modal transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
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
                <TouchableOpacity style={styles.saveButton} onPress={createNewRecipe}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* New Recipe Modal */}
        <Modal
          transparent={true}
          visible={isNewRecipeModalVisible}
          onRequestClose={() => setIsNewRecipeModalVisible(false)}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Create New Recipe</Text>
              <TextInput
                style={styles.input}
                placeholder="Recipe Name"
                value={newRecipeName}
                onChangeText={setNewRecipeName}
              />
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={createNewRecipe} disabled={isSaving}>
                  {isSaving ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Create</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsNewRecipeModalVisible(false)
                    if (route.params?.recipeId) {
                      setIsSaveOptionsModalVisible(true)
                    }
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.calculateButtonContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.ingredientButton} onPress={() => navigation.navigate("SearchScreen")}>
              <Text style={styles.ingredientButtonText}>Add Ingredients</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveRecipeButton, isSaving && { backgroundColor: "grey" }]}
              onPress={handleSaveRecipe}
              disabled={isSaving}
            >
              {isSaving ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Save Recipe</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.calculateButton}
              onPress={() =>
                navigation.navigate("CalculatorScreen", {
                  meat: totalMeat,
                  bone: totalBone,
                  organ: totalOrgan,
                  plantmatter: totalPlantMatter,
                  selectedRatio: selectedRatio,
                })
              }
            >
              <Text style={styles.calculateButtonText}>Ratio / Calculate</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={handleClearScreen}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  topBar: {
    backgroundColor: "white",
    paddingVertical: vs(isSmallDevice ? 7 : 15),
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? (isSmallDevice ? 5 : -10) : isSmallDevice ? 10 : 12, // Different values for small/big Android
    marginBottom: Platform.OS === "ios" ? (isSmallDevice ? 5 : -5) : isSmallDevice ? 2 : -6, // Different values for small/big Android
  },
  topBarText: {
    fontSize: rs(isSmallDevice ? 20 : 22),
    fontWeight: "600",
    color: "black",
  },
  totalBar: {
    padding: rs(isSmallDevice ? 5 : 8),
    borderBottomWidth: 1,
    borderBottomColor: "#ded8d7",
    backgroundColor: "white",
    marginTop: vs(isSmallDevice ? -12 : -10),
  },
  totalText: {
    fontSize: rs(isSmallDevice ? 16 : 18),
    fontWeight: "bold",
    color: "black",
  },
  subTotalText: {
    fontSize: rs(isSmallDevice ? 12 : 14),
    color: "black",
  },
  scrollContainer: {
    padding: rs(8),
    paddingBottom: vs(5),
  },
  noIngredientsText: {
    fontSize: rs(isSmallDevice ? 14 : 16),
    color: "gray",
    textAlign: "center",
    marginTop: vs(40),
  },
  ingredientItem: {
    padding: rs(6),
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    marginBottom: vs(10),
  },
  plantMatterItem: {
    padding: rs(6),
    backgroundColor: "#e0ffe0", // Light green background for Plant Matter
    borderRadius: 5,
    marginBottom: vs(10),
    borderColor: "#8fbc8f", // Darker green border
    borderWidth: 1,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientText: {
    fontSize: rs(isSmallDevice ? 16 : 18),
    fontWeight: "bold",
    color: "black",
    marginRight: rs(10),
  },
  detailsText: {
    fontSize: rs(isSmallDevice ? 14 : 16),
    color: "#404040",
    flex: 1,
  },
  totalWeightText: {
    fontSize: rs(isSmallDevice ? 14 : 16),
    color: "#404040",
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    marginRight: rs(8),
  },
  deleteButton: {
    marginLeft: rs(4),
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "white",
    padding: rs(16),
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: rs(isSmallDevice ? 16 : 18),
    fontWeight: "bold",
    marginBottom: vs(12),
    textAlign: "center",
  },
  modalText: {
    fontSize: rs(isSmallDevice ? 14 : 16),
    marginBottom: vs(20),
    textAlign: "center",
  },
  input: {
    height: Platform.OS === "ios" ? vs(40) : vs(isSmallDevice ? 50 : 40),
    borderColor: "gray",
    borderWidth: 1,
    width: "100%",
    paddingHorizontal: rs(10),
    marginBottom: vs(16),
    borderRadius: 5,
    fontSize: Platform.OS === "ios" ? rs(isSmallDevice ? 14 : 16) : rs(isSmallDevice ? 12 : 14),
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#000080",
    flex: 1,
    paddingVertical: vs(8),
    borderRadius: 5,
    alignItems: "center",
    marginRight: rs(5),
  },
  cancelButton: {
    backgroundColor: "grey",
    flex: 1,
    paddingVertical: vs(8),
    borderRadius: 5,
    alignItems: "center",
    marginLeft: rs(5),
  },
  saveButtonText: {
    color: "white",
    fontSize: rs(isSmallDevice ? 14 : 16),
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: rs(isSmallDevice ? 12 : 14),
  },
  saveOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: vs(10),
  },
  calculateButtonContainer: {
    padding: Platform.OS === "ios" ? 10 : rs(isSmallDevice ? 6 : 10),
    paddingTop: Platform.OS === "ios" ? 8 : rs(isSmallDevice ? 7 : 8),
    paddingBottom: Platform.OS === "ios" ? 3 : rs(isSmallDevice ? 4 : 4),
    borderTopWidth: 0.7,
    borderTopColor: "#ded8d7",
    backgroundColor: "white",
  },
  buttonRow: {
    flexDirection: "row",
    marginBottom: Platform.OS === "ios" ? 4 : vs(isSmallDevice ? 2 : 4),
  },
  ingredientButton: {
    flex: 1,
    backgroundColor: "#000080",
    paddingVertical: vs(isSmallDevice ? 8 : 10),
    paddingHorizontal: rs(10),
    borderRadius: 10,
    marginRight: rs(5),
    alignItems: "center",
    justifyContent: "center",
  },
  saveRecipeButton: {
    flex: 1,
    backgroundColor: "#000080",
    paddingVertical: vs(isSmallDevice ? 8 : 10),
    paddingHorizontal: rs(10),
    borderRadius: 10,
    marginLeft: rs(5),
    alignItems: "center",
    justifyContent: "center",
  },
  ingredientButtonText: {
    color: "white",
    fontSize: rs(isSmallDevice ? 14 : 16),
    fontWeight: "bold",
  },
  calculateButton: {
    flex: 1,
    backgroundColor: "#000080",
    paddingVertical: vs(isSmallDevice ? 8 : 10),
    paddingHorizontal: rs(10),
    borderRadius: 10,
    marginRight: rs(5),
    alignItems: "center",
    justifyContent: "center",
  },
  calculateButtonText: {
    color: "white",
    fontSize: rs(isSmallDevice ? 14 : 16),
    fontWeight: "bold",
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#000080",
    paddingVertical: vs(isSmallDevice ? 8 : 10),
    paddingHorizontal: rs(10),
    borderRadius: 10,
    marginLeft: rs(5),
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: "white",
    fontSize: rs(isSmallDevice ? 14 : 16),
    fontWeight: "bold",
  },
  textButtonBlue: {
    color: "#000080",
    fontSize: rs(isSmallDevice ? 16 : 18),
    fontWeight: "bold",
    paddingHorizontal: rs(15),
    paddingVertical: vs(10),
  },
  ingredientHeader: {
    flexDirection: "row",
    justifyContent: "flex-start", // Keep this to have total closer to name
    alignItems: "center",
    marginBottom: vs(2),
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
})

export default FoodInputScreen

