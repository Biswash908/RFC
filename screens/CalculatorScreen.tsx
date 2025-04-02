"use client"

import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
} from "react-native"
import { useNavigation, useRoute, type RouteProp, useFocusEffect } from "@react-navigation/native"
import { FontAwesome } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useUnit } from "../UnitContext"

// Add responsive sizing utilities
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const isSmallDevice = SCREEN_WIDTH < 375
const isIOS = Platform.OS === "ios"
const scale = SCREEN_WIDTH / 375
const verticalScale = SCREEN_HEIGHT / 812

// Responsive sizing functions
const rs = (size: number) => Math.round(size * (isIOS ? Math.min(scale, 1.2) : scale))
const vs = (size: number) => Math.round(size * (isIOS ? Math.min(verticalScale, 1.2) : verticalScale))

// Define the Ingredient type
interface Ingredient {
  name: string
  amount: number
  unit: string
  type: string
}

type RootStackParamList = {
  FoodInputScreen: undefined
  FoodInfoScreen: { ingredient: Ingredient; editMode: boolean }
  SearchScreen: undefined
  CalculatorScreen: {
    meat: number
    bone: number
    organ: number
    plantmatter: number
    ratio?: any
  }
  CustomRatioScreen: {
    onSave?: (meat: number, bone: number, organ: number, plantMatter: number, includePlantMatter: boolean) => void
    currentValues?: {
      meat: number
      bone: number
      organ: number
      plantMatter: number
      includePlantMatter: boolean
    }
  }
}

type CalculatorScreenRouteProp = RouteProp<RootStackParamList, "CalculatorScreen">

const CalculatorScreen: React.FC = () => {
  const route = useRoute<CalculatorScreenRouteProp>()
  const navigation = useNavigation()

  const [newPlantMatter, setNewPlantMatter] = useState<number>(10) // Default to 10, similar to others
  const [plantMatterCorrect, setPlantMatterCorrect] = useState<{
    meat: number
    bone: number
    organ: number
  }>({
    meat: 0,
    bone: 0,
    organ: 0,
  })
  const [includePlantMatter, setIncludePlantMatter] = useState<boolean>(false)

  const initialMeatWeight = route.params?.meat ?? 0
  const initialBoneWeight = route.params?.bone ?? 0
  const initialOrganWeight = route.params?.organ ?? 0
  const initialPlantMatterWeight = route.params?.plantmatter ?? 0 // Initialize with route param
  const [userSelectedRatio, setUserSelectedRatio] = useState<boolean>(false)

  const { unit } = useUnit()

  const [newMeat, setNewMeat] = useState<number>(80) // Default to 80 instead of 0
  const [newBone, setNewBone] = useState<number>(10) // Default to 10 instead of 0
  const [newOrgan, setNewOrgan] = useState<number>(10) // Default to 10 instead of 0
  const [selectedRatio, setSelectedRatio] = useState<string>("80:10:10") // Default is '80:10:10'
  const [customRatio, setCustomRatio] = useState<{
    meat: number
    bone: number
    organ: number
    plantMatter: number
    includePlantMatter: boolean
  }>({
    meat: 0,
    bone: 0,
    organ: 0,
    plantMatter: 0,
    includePlantMatter: false,
  })

  // Add state to track current weights for calculations
  const [currentMeatWeight, setCurrentMeatWeight] = useState<number>(initialMeatWeight)
  const [currentBoneWeight, setCurrentBoneWeight] = useState<number>(initialBoneWeight)
  const [currentOrganWeight, setCurrentOrganWeight] = useState<number>(initialOrganWeight)
  const [currentPlantMatterWeight, setCurrentPlantMatterWeight] = useState<number>(initialPlantMatterWeight)

  // Update current weights when route params change
  useEffect(() => {
    if (route.params?.meat !== undefined) setCurrentMeatWeight(route.params.meat)
    if (route.params?.bone !== undefined) setCurrentBoneWeight(route.params.bone)
    if (route.params?.organ !== undefined) setCurrentOrganWeight(route.params.organ)
    if (route.params?.plantmatter !== undefined) setCurrentPlantMatterWeight(route.params.plantmatter)
  }, [route.params?.meat, route.params?.bone, route.params?.organ, route.params?.plantmatter])

  const [meatCorrect, setMeatCorrect] = useState<{
    bone: number
    organ: number
    plantMatter: number
  }>({
    bone: 0,
    organ: 0,
    plantMatter: 0,
  })
  const [boneCorrect, setBoneCorrect] = useState<{
    meat: number
    organ: number
    plantMatter: number
  }>({
    meat: 0,
    organ: 0,
    plantMatter: 0,
  })
  const [organCorrect, setOrganCorrect] = useState<{
    meat: number
    bone: number
    plantMatter: number
  }>({
    meat: 0,
    bone: 0,
    plantMatter: 0,
  })

  const initializeCorrectorsWithDefaultValues = () => {
    console.log("🚀 Initializing correctors with zero values")

    // Set all corrector values to zero on initial load
    setMeatCorrect({ bone: 0, organ: 0, plantMatter: 0 })
    setBoneCorrect({ meat: 0, organ: 0, plantMatter: 0 })
    setOrganCorrect({ meat: 0, bone: 0, plantMatter: 0 })
    setPlantMatterCorrect({ meat: 0, bone: 0, organ: 0 })
  }

  useEffect(() => {
    navigation.setOptions({ title: "Calculator" })

    // Initialize correctors with default values on mount
    initializeCorrectorsWithDefaultValues()
  }, [navigation])

  // Update the navigateToCustomRatio function to always remember the last custom ratio values
  const navigateToCustomRatio = () => {
    // Mark as user-selected when navigating to custom ratio screen
    AsyncStorage.setItem("userSelectedRatio", "true")

    // Get the current recipe's custom ratio if it exists
    const getCurrentRecipeRatio = async () => {
      try {
        const selectedRecipeStr = await AsyncStorage.getItem("selectedRecipe")
        if (selectedRecipeStr) {
          const selectedRecipe = JSON.parse(selectedRecipeStr)

          // First check if this recipe has a saved custom ratio
          if (selectedRecipe.savedCustomRatio) {
            // Use the recipe's saved custom ratio (even if not currently selected)
            console.log("✅ Loading recipe's saved custom ratio for editing:", selectedRecipe.savedCustomRatio)

            navigation.navigate("CustomRatioScreen", {
              currentValues: {
                meat: selectedRecipe.savedCustomRatio.meat,
                bone: selectedRecipe.savedCustomRatio.bone,
                organ: selectedRecipe.savedCustomRatio.organ,
                plantMatter: selectedRecipe.savedCustomRatio.plantMatter || 0,
                includePlantMatter:
                  selectedRecipe.savedCustomRatio.plantMatter > 0 ||
                  selectedRecipe.savedCustomRatio.includePlantMatter ||
                  false,
              },
            })
            return
          }

          // If no saved custom ratio but current ratio is custom, use that
          if (selectedRecipe.ratio && selectedRecipe.ratio.selectedRatio === "custom") {
            console.log("✅ Loading recipe's current custom ratio for editing:", selectedRecipe.ratio)

            navigation.navigate("CustomRatioScreen", {
              currentValues: {
                meat: selectedRecipe.ratio.meat,
                bone: selectedRecipe.ratio.bone,
                organ: selectedRecipe.ratio.organ,
                plantMatter: selectedRecipe.ratio.plantMatter || 0,
                includePlantMatter:
                  selectedRecipe.ratio.plantMatter > 0 || selectedRecipe.ratio.includePlantMatter || false,
              },
            })
            return
          }
        }

        // If no recipe-specific ratio, use the current custom ratio if selected
        if (selectedRatio === "custom") {
          console.log("✅ Loading current custom ratio for editing:", customRatio)
          navigation.navigate("CustomRatioScreen", {
            currentValues: customRatio,
          })
        } else {
          // Otherwise, check if we have saved custom values in AsyncStorage
          const customMeatRatio = await AsyncStorage.getItem("customMeatRatio")
          const customBoneRatio = await AsyncStorage.getItem("customBoneRatio")
          const customOrganRatio = await AsyncStorage.getItem("customOrganRatio")
          const customPlantMatterRatio = await AsyncStorage.getItem("customPlantMatterRatio")
          const customIncludePlantMatter = await AsyncStorage.getItem("customIncludePlantMatter")

          if (customMeatRatio && customBoneRatio && customOrganRatio) {
            console.log("✅ Loading saved custom ratio values:", {
              meat: customMeatRatio,
              bone: customBoneRatio,
              organ: customOrganRatio,
              plantMatter: customPlantMatterRatio || "0",
              includePlantMatter: customIncludePlantMatter === "true",
            })

            navigation.navigate("CustomRatioScreen", {
              currentValues: {
                meat: Number(customMeatRatio),
                bone: Number(customBoneRatio),
                organ: Number(customOrganRatio),
                plantMatter: Number(customPlantMatterRatio || "0"),
                includePlantMatter: customIncludePlantMatter === "true",
              },
            })
          } else {
            // If nothing else is available, start with default values
            console.log("✅ Starting new custom ratio with default values")
            navigation.navigate("CustomRatioScreen", {
              currentValues: {
                meat: 60,
                bone: 20,
                organ: 15,
                plantMatter: 5,
                includePlantMatter: true,
              },
            })
          }
        }
      } catch (error) {
        console.error("Error getting current recipe ratio:", error)
        // Fallback to default behavior
        navigation.navigate("CustomRatioScreen", {
          currentValues:
            selectedRatio === "custom"
              ? customRatio
              : {
                  meat: 60,
                  bone: 20,
                  organ: 15,
                  plantMatter: 5,
                  includePlantMatter: true,
                },
        })
      }
    }

    getCurrentRecipeRatio()
  }

  useEffect(() => {
    const loadSavedRatio = async () => {
      try {
        const savedMeat = await AsyncStorage.getItem("meatRatio")
        const savedBone = await AsyncStorage.getItem("boneRatio")
        const savedOrgan = await AsyncStorage.getItem("organRatio")
        const savedPlantMatter = await AsyncStorage.getItem("plantMatterRatio")
        const savedRatio = await AsyncStorage.getItem("selectedRatio")
        const savedIncludePlantMatter = await AsyncStorage.getItem("includePlantMatter")

        console.log("🔄 Loading saved ratios:", {
          savedMeat,
          savedBone,
          savedOrgan,
          savedPlantMatter,
          savedRatio,
          savedIncludePlantMatter,
        })

        if (!userSelectedRatio && !route.params?.ratio) {
          setSelectedRatio(savedRatio || "80:10:10")
          setNewMeat(Number(savedMeat) || 80)
          setNewBone(Number(savedBone) || 10)
          setNewOrgan(Number(savedOrgan) || 10)
          setNewPlantMatter(Number(savedPlantMatter) || 0)
          setIncludePlantMatter(savedIncludePlantMatter === "true")

          if (savedRatio === "custom") {
            const customMeat = Number(savedMeat) || 0
            const customBone = Number(savedBone) || 0
            const customOrgan = Number(savedOrgan) || 0
            const customPlantMatter = Number(savedPlantMatter) || 0
            const includeP = savedIncludePlantMatter === "true"

            console.log("✅ Auto-loading custom ratio:", {
              customMeat,
              customBone,
              customOrgan,
              customPlantMatter,
              includeP,
            })

            setCustomRatio({
              meat: customMeat,
              bone: customBone,
              organ: customOrgan,
              plantMatter: customPlantMatter,
              includePlantMatter: includeP,
            })
            setSelectedRatio("custom")
          }
        }
      } catch (error) {
        console.log("❌ Failed to load ratios:", error)
      }
    }

    loadSavedRatio()
  }, [userSelectedRatio, route.params?.ratio])

  useEffect(() => {
    // Fix the condition to properly detect custom ratios
    if (route.params?.ratio && route.params.ratio.selectedRatio === "custom") {
      console.log("✅ Applying custom ratio from params:", route.params.ratio)

      // Apply the ratio directly
      setNewMeat(route.params.ratio.meat)
      setNewBone(route.params.ratio.bone)
      setNewOrgan(route.params.ratio.organ)
      setNewPlantMatter(route.params.ratio.plantMatter || 0)
      setIncludePlantMatter(route.params.ratio.plantMatter > 0 || route.params.ratio.includePlantMatter)

      // Update the customRatio state object
      setCustomRatio({
        meat: route.params.ratio.meat,
        bone: route.params.ratio.bone,
        organ: route.params.ratio.organ,
        plantMatter: route.params.ratio.plantMatter || 0,
        includePlantMatter: route.params.ratio.plantMatter > 0 || route.params.ratio.includePlantMatter,
      })

      setSelectedRatio("custom")
      setUserSelectedRatio(true)

      // Save the custom ratio persistently
      AsyncStorage.multiSet([
        ["meatRatio", route.params.ratio.meat.toString()],
        ["boneRatio", route.params.ratio.bone.toString()],
        ["organRatio", route.params.ratio.organ.toString()],
        ["plantMatterRatio", (route.params.ratio.plantMatter || "0").toString()],
        ["selectedRatio", "custom"],
        [
          "includePlantMatter",
          (route.params.ratio.plantMatter > 0 || route.params.ratio.includePlantMatter).toString(),
        ],
        ["customMeatRatio", route.params.ratio.meat.toString()],
        ["customBoneRatio", route.params.ratio.bone.toString()],
        ["customOrganRatio", route.params.ratio.organ.toString()],
        ["customPlantMatterRatio", (route.params.ratio.plantMatter || "0").toString()],
        [
          "customIncludePlantMatter",
          (route.params.ratio.plantMatter > 0 || route.params.ratio.includePlantMatter).toString(),
        ],
      ])
    }
  }, [route.params?.ratio])

  useEffect(() => {
    // ✅ NEW: Special handling for recipe ratios
    const loadRecipeRatio = async () => {
      try {
        const selectedRecipe = await AsyncStorage.getItem("selectedRecipe")
        if (selectedRecipe) {
          const parsedRecipe = JSON.parse(selectedRecipe)
          if (parsedRecipe.ratio) {
            console.log("✅ Loading ratio from selected recipe:", parsedRecipe.ratio)

            // ✅ FIXED: Only use custom ratio for user-defined recipes
            if (parsedRecipe.ratio.isUserDefined && parsedRecipe.ratio.selectedRatio === "custom") {
              // Set the custom ratio values for user-defined recipes
              setNewMeat(parsedRecipe.ratio.meat)
              setNewBone(parsedRecipe.ratio.bone)
              setNewOrgan(parsedRecipe.ratio.organ)
              setNewPlantMatter(parsedRecipe.ratio.plantMatter || 0)
              setIncludePlantMatter(parsedRecipe.ratio.plantMatter > 0 || parsedRecipe.ratio.includePlantMatter)
              setCustomRatio({
                meat: parsedRecipe.ratio.meat,
                bone: parsedRecipe.ratio.bone,
                organ: parsedRecipe.ratio.organ,
                plantMatter: parsedRecipe.ratio.plantMatter || 0,
                includePlantMatter: parsedRecipe.ratio.plantMatter > 0 || parsedRecipe.ratio.includePlantMatter,
              })
              setSelectedRatio("custom")

              // Save the values to AsyncStorage
              await AsyncStorage.setItem("meatRatio", parsedRecipe.ratio.meat.toString())
              await AsyncStorage.setItem("boneRatio", parsedRecipe.ratio.bone.toString())
              await AsyncStorage.setItem("organRatio", parsedRecipe.ratio.organ.toString())
              await AsyncStorage.setItem("plantMatterRatio", (parsedRecipe.ratio.plantMatter || "0").toString())
              await AsyncStorage.setItem("selectedRatio", "custom")
              await AsyncStorage.setItem(
                "includePlantMatter",
                (parsedRecipe.ratio.plantMatter > 0 || parsedRecipe.ratio.includePlantMatter).toString(),
              )
            } else {
              // For standard ratios or default recipes, use the appropriate standard ratio
              const ratioString = parsedRecipe.ratio.selectedRatio

              if (ratioString === "80:10:10") {
                setSelectedRatio("80:10:10")
                setNewMeat(80)
                setNewBone(10)
                setNewOrgan(10)
                setNewPlantMatter(0)
                setIncludePlantMatter(false)
              } else if (ratioString === "75:15:10") {
                setSelectedRatio("75:15:10")
                setNewMeat(75)
                setNewBone(15)
                setNewOrgan(10)
                setNewPlantMatter(0)
                setIncludePlantMatter(false)
              } else if (ratioString === "70:10:10:10") {
                setSelectedRatio("70:10:10:10")
                setNewMeat(70)
                setNewBone(10)
                setNewOrgan(10)
                setNewPlantMatter(10)
                setIncludePlantMatter(true)
              } else if (ratioString === "65:15:10:10") {
                setSelectedRatio("65:15:10:10")
                setNewMeat(65)
                setNewBone(15)
                setNewOrgan(10)
                setNewPlantMatter(10)
                setIncludePlantMatter(true)
              } else {
                // For other standard ratios, use the values but not as custom
                setNewMeat(parsedRecipe.ratio.meat)
                setNewBone(parsedRecipe.ratio.bone)
                setNewOrgan(parsedRecipe.ratio.organ)
                setNewPlantMatter(parsedRecipe.ratio.plantMatter || 0)
                setIncludePlantMatter(parsedRecipe.ratio.plantMatter > 0 || parsedRecipe.ratio.includePlantMatter)
                setSelectedRatio(parsedRecipe.ratio.selectedRatio)
              }

              // Save the values to AsyncStorage
              await AsyncStorage.setItem("meatRatio", parsedRecipe.ratio.meat.toString())
              await AsyncStorage.setItem("boneRatio", parsedRecipe.ratio.bone.toString())
              await AsyncStorage.setItem("organRatio", parsedRecipe.ratio.organ.toString())
              await AsyncStorage.setItem("plantMatterRatio", (parsedRecipe.ratio.plantMatter || "0").toString())
              await AsyncStorage.setItem("selectedRatio", parsedRecipe.ratio.selectedRatio)
              await AsyncStorage.setItem(
                "includePlantMatter",
                (parsedRecipe.ratio.plantMatter > 0 || parsedRecipe.ratio.includePlantMatter).toString(),
              )
            }
          }
        }
      } catch (error) {
        console.error("❌ Error loading recipe ratio:", error)
      }
    }

    loadRecipeRatio()
  }, [])

  useEffect(() => {
    if (selectedRatio === "custom") {
      console.log("✅ Updating Custom Ratio Button Display:", customRatio)

      // ✅ Ensure the button text updates immediately
      setCustomRatio((prev) => ({
        meat: prev.meat || newMeat,
        bone: prev.bone || newBone,
        organ: prev.organ || newOrgan,
        plantMatter: prev.plantMatter || newPlantMatter,
        includePlantMatter: prev.includePlantMatter || includePlantMatter,
      }))
    }
  }, [selectedRatio, newMeat, newBone, newOrgan, newPlantMatter, includePlantMatter])

  useEffect(() => {
    if (route.params?.ratio) {
      // Check if there's a user-selected ratio that should take precedence
      const checkUserSelection = async () => {
        const wasUserSelected = await AsyncStorage.getItem("userSelectedRatio")

        if (wasUserSelected === "true") {
          console.log("🔒 User has manually selected a ratio, not applying recipe ratio")
          return // Don't apply recipe ratio if user has selected one
        }

        console.log("✅ Applying loaded recipe ratio:", route.params.ratio)

        // Apply the recipe ratio
        setNewMeat(route.params.ratio.meat)
        setNewBone(route.params.ratio.bone)
        setNewOrgan(route.params.ratio.organ)
        setNewPlantMatter(route.params.ratio.plantMatter || 0)
        setIncludePlantMatter(route.params.ratio.plantMatter > 0 || route.params.ratio.includePlantMatter)
        setSelectedRatio(route.params.ratio.selectedRatio)

        if (route.params.ratio.selectedRatio === "custom") {
          setCustomRatio({
            meat: route.params.ratio.meat,
            bone: route.params.ratio.bone,
            organ: route.params.ratio.organ,
            plantMatter: route.params.ratio.plantMatter || 0,
            includePlantMatter: route.params.ratio.plantMatter > 0 || route.params.ratio.includePlantMatter,
          })
        }

        // Save the loaded ratio
        await AsyncStorage.multiSet([
          ["meatRatio", route.params.ratio.meat.toString()],
          ["boneRatio", route.params.ratio.bone.toString()],
          ["organRatio", route.params.ratio.organ.toString()],
          ["plantMatterRatio", (route.params.ratio.plantMatter || "0").toString()],
          ["selectedRatio", route.params.ratio.selectedRatio],
          [
            "includePlantMatter",
            (route.params.ratio.plantMatter > 0 || route.params.ratio.includePlantMatter).toString(),
          ],
          ["userSelectedRatio", "false"], // Mark as not user-selected
        ])

        // For custom ratios, also save to custom ratio keys
        if (route.params.ratio.selectedRatio === "custom") {
          await AsyncStorage.multiSet([
            ["customMeatRatio", route.params.ratio.meat.toString()],
            ["customBoneRatio", route.params.ratio.bone.toString()],
            ["customOrganRatio", route.params.ratio.organ.toString()],
            ["customPlantMatterRatio", (route.params.ratio.plantMatter || "0").toString()],
            [
              "customIncludePlantMatter",
              (route.params.ratio.plantMatter > 0 || route.params.ratio.includePlantMatter).toString(),
            ],
          ])
        }
      }

      checkUserSelection()
    }
  }, [route.params?.ratio])

  // Modify the setRatio function to ensure temporary values are properly saved and loaded
  const setRatio = (meat: number, bone: number, organ: number, plantMatter: number, ratio: string) => {
    console.log(`✅ Setting ratio: ${ratio} (${meat}:${bone}:${organ}:${plantMatter})`)

    // Update state
    setNewMeat(meat)
    setNewBone(bone)
    setNewOrgan(organ)
    setNewPlantMatter(plantMatter)
    setIncludePlantMatter(plantMatter > 0)
    setSelectedRatio(ratio)
    setUserSelectedRatio(true) // Mark as manually selected

    if (ratio === "custom") {
      setCustomRatio({
        meat,
        bone,
        organ,
        plantMatter,
        includePlantMatter: plantMatter > 0,
      })
    }

    // Save to AsyncStorage immediately - this is critical for UI persistence
    const saveItems = [
      // Regular ratio values (used for UI display)
      ["meatRatio", meat.toString()],
      ["boneRatio", bone.toString()],
      ["organRatio", organ.toString()],
      ["plantMatterRatio", plantMatter.toString()],
      ["selectedRatio", ratio],
      ["includePlantMatter", (plantMatter > 0).toString()],
      ["userSelectedRatio", "true"], // Add this to track user selection

      // Temporary ratio values (separate from permanent recipe data)
      ["tempMeatRatio", meat.toString()],
      ["tempBoneRatio", bone.toString()],
      ["tempOrganRatio", organ.toString()],
      ["tempPlantMatterRatio", plantMatter.toString()],
      ["tempSelectedRatio", ratio],
      ["tempIncludePlantMatter", (plantMatter > 0).toString()],
    ]

    if (ratio === "custom") {
      saveItems.push(
        ["customMeatRatio", meat.toString()],
        ["customBoneRatio", bone.toString()],
        ["customOrganRatio", organ.toString()],
        ["customPlantMatterRatio", plantMatter.toString()],
        ["customIncludePlantMatter", (plantMatter > 0).toString()],
      )
    }

    AsyncStorage.multiSet(saveItems)
      .then(() => {
        console.log("✅ Successfully saved ratio selection to AsyncStorage")

        // Force recalculation of correctors immediately after setting ratio
        if (
          currentMeatWeight === 0 &&
          currentBoneWeight === 0 &&
          currentOrganWeight === 0 &&
          currentPlantMatterWeight === 0
        ) {
          calculateSampleCorrectorsForFreshLaunch()
        } else {
          calculateCorrectors(
            currentMeatWeight,
            currentBoneWeight,
            currentOrganWeight,
            currentPlantMatterWeight,
            meat,
            bone,
            organ,
            plantMatter,
            plantMatter > 0,
          )
        }
      })
      .catch((error) => {
        console.error("❌ Failed to save ratio selection:", error)
      })

    // Update the route params to pass the ratio values to home
    // But don't update the recipe directly
    navigation.setParams({
      ratio: {
        meat: meat,
        bone: bone,
        organ: organ,
        plantMatter: plantMatter,
        includePlantMatter: plantMatter > 0,
        selectedRatio: ratio,
        isUserDefined: true,
        isTemporary: true, // Mark as temporary
      },
    })
  }

  // Modify the useFocusEffect to prioritize loading temporary ratio values
  useFocusEffect(
    React.useCallback(() => {
      const loadRatios = async () => {
        try {
          // First try to load temporary ratio values
          const tempSelectedRatio = await AsyncStorage.getItem("tempSelectedRatio")
          const tempMeatRatio = await AsyncStorage.getItem("tempMeatRatio")
          const tempBoneRatio = await AsyncStorage.getItem("tempBoneRatio")
          const tempOrganRatio = await AsyncStorage.getItem("tempOrganRatio")
          const tempPlantMatterRatio = await AsyncStorage.getItem("tempPlantMatterRatio")
          const tempIncludePlantMatter = await AsyncStorage.getItem("tempIncludePlantMatter")

          // If we have temporary values, use them
          if (tempSelectedRatio && tempMeatRatio && tempBoneRatio && tempOrganRatio) {
            console.log("🔄 Loading temporary ratio values:", {
              tempSelectedRatio,
              tempMeatRatio,
              tempBoneRatio,
              tempOrganRatio,
              tempPlantMatterRatio,
              tempIncludePlantMatter,
            })

            setSelectedRatio(tempSelectedRatio)
            setNewMeat(Number(tempMeatRatio))
            setNewBone(Number(tempBoneRatio))
            setNewOrgan(Number(tempOrganRatio))
            setNewPlantMatter(Number(tempPlantMatterRatio || "0"))
            setIncludePlantMatter(tempIncludePlantMatter === "true")

            // IMPORTANT: For custom ratios, also update the customRatio state
            if (tempSelectedRatio === "custom") {
              setCustomRatio({
                meat: Number(tempMeatRatio),
                bone: Number(tempBoneRatio),
                organ: Number(tempOrganRatio),
                plantMatter: Number(tempPlantMatterRatio || "0"),
                includePlantMatter: tempIncludePlantMatter === "true",
              })
            }

            // Force recalculation with the loaded values
            calculateCorrectors(
              currentMeatWeight,
              currentBoneWeight,
              currentOrganWeight,
              currentPlantMatterWeight,
              Number(tempMeatRatio),
              Number(tempBoneRatio),
              Number(tempOrganRatio),
              Number(tempPlantMatterRatio || "0"),
              tempIncludePlantMatter === "true",
            )

            return // Exit early after loading temporary values
          }

          // If no temporary values, check for selected recipe
          const selectedRecipeStr = await AsyncStorage.getItem("selectedRecipe")

          if (selectedRecipeStr) {
            const selectedRecipe = JSON.parse(selectedRecipeStr)

            // If the recipe has a ratio defined, use that
            if (selectedRecipe.ratio) {
              console.log("🔄 Loading recipe-specific ratio:", selectedRecipe.ratio)

              // Always set the ratio values from the recipe
              setSelectedRatio(selectedRecipe.ratio.selectedRatio)
              setNewMeat(selectedRecipe.ratio.meat)
              setNewBone(selectedRecipe.ratio.bone)
              setNewOrgan(selectedRecipe.ratio.organ)
              setNewPlantMatter(selectedRecipe.ratio.plantMatter || 0)
              setIncludePlantMatter(selectedRecipe.ratio.plantMatter > 0 || selectedRecipe.ratio.includePlantMatter)

              // For custom ratios, also update the customRatio state
              if (selectedRecipe.ratio.selectedRatio === "custom") {
                setCustomRatio({
                  meat: selectedRecipe.ratio.meat,
                  bone: selectedRecipe.ratio.bone,
                  organ: selectedRecipe.ratio.organ,
                  plantMatter: selectedRecipe.ratio.plantMatter || 0,
                  includePlantMatter: selectedRecipe.ratio.plantMatter > 0 || selectedRecipe.ratio.includePlantMatter,
                })
              }

              // Save to AsyncStorage to ensure persistence
              await AsyncStorage.multiSet([
                ["meatRatio", selectedRecipe.ratio.meat.toString()],
                ["boneRatio", selectedRecipe.ratio.bone.toString()],
                ["organRatio", selectedRecipe.ratio.organ.toString()],
                ["plantMatterRatio", (selectedRecipe.ratio.plantMatter || "0").toString()],
                ["selectedRatio", selectedRecipe.ratio.selectedRatio],
                [
                  "includePlantMatter",
                  (selectedRecipe.ratio.plantMatter > 0 || selectedRecipe.ratio.includePlantMatter).toString(),
                ],
                ["tempMeatRatio", selectedRecipe.ratio.meat.toString()],
                ["tempBoneRatio", selectedRecipe.ratio.bone.toString()],
                ["tempOrganRatio", selectedRecipe.ratio.organ.toString()],
                ["tempPlantMatterRatio", (selectedRecipe.ratio.plantMatter || "0").toString()],
                ["tempSelectedRatio", selectedRecipe.ratio.selectedRatio],
                [
                  "tempIncludePlantMatter",
                  (selectedRecipe.ratio.plantMatter > 0 || selectedRecipe.ratio.includePlantMatter).toString(),
                ],
              ])

              // For custom ratios, also save to custom ratio keys
              if (selectedRecipe.ratio.selectedRatio === "custom") {
                await AsyncStorage.multiSet([
                  ["customMeatRatio", selectedRecipe.ratio.meat.toString()],
                  ["customBoneRatio", selectedRecipe.ratio.bone.toString()],
                  ["customOrganRatio", selectedRecipe.ratio.organ.toString()],
                  ["customPlantMatterRatio", (selectedRecipe.ratio.plantMatter || "0").toString()],
                  [
                    "customIncludePlantMatter",
                    (selectedRecipe.ratio.plantMatter > 0 || selectedRecipe.ratio.includePlantMatter).toString(),
                  ],
                ])
              }

              return // Exit early after loading recipe-specific ratio
            }
          }

          // If no temporary values or recipe ratio, fall back to saved ratio
          const savedRatio = await AsyncStorage.getItem("selectedRatio")
          const savedMeat = await AsyncStorage.getItem("meatRatio")
          const savedBone = await AsyncStorage.getItem("boneRatio")
          const savedOrgan = await AsyncStorage.getItem("organRatio")
          const savedPlantMatter = await AsyncStorage.getItem("plantMatterRatio")
          const savedIncludePlantMatter = await AsyncStorage.getItem("includePlantMatter")

          console.log("🔄 Loading saved ratio:", {
            savedRatio,
            savedMeat,
            savedBone,
            savedOrgan,
            savedPlantMatter,
            savedIncludePlantMatter,
          })

          if (savedRatio) {
            // For custom ratios, check if they have valid values
            if (savedRatio === "custom") {
              const meat = Number(savedMeat) || 0
              const bone = Number(savedBone) || 0
              const organ = Number(savedOrgan) || 0
              const plantMatter = Number(savedPlantMatter) || 0
              const includeP = savedIncludePlantMatter === "true"

              const total = meat + bone + organ + (includeP ? plantMatter : 0)

              // Only use custom ratio if it has valid values
              if (total > 0 && Math.abs(total - 100) < 5) {
                setSelectedRatio("custom")
                setNewMeat(meat)
                setNewBone(bone)
                setNewOrgan(organ)
                setNewPlantMatter(plantMatter)
                setIncludePlantMatter(includeP)
                setCustomRatio({
                  meat: meat,
                  bone: bone,
                  organ: organ,
                  plantMatter: plantMatter,
                  includePlantMatter: includeP,
                })

                // Also save as temporary values for consistency
                await AsyncStorage.multiSet([
                  ["tempMeatRatio", meat.toString()],
                  ["tempBoneRatio", bone.toString()],
                  ["tempOrganRatio", organ.toString()],
                  ["tempPlantMatterRatio", plantMatter.toString()],
                  ["tempSelectedRatio", "custom"],
                  ["tempIncludePlantMatter", includeP.toString()],
                ])
              } else {
                // If custom ratio has invalid values, default to 80:10:10
                console.log("⚠️ Saved custom ratio has invalid values, defaulting to 80:10:10")
                setSelectedRatio("80:10:10")
                setNewMeat(80)
                setNewBone(10)
                setNewOrgan(10)
                setNewPlantMatter(0)
                setIncludePlantMatter(false)

                // Save the default ratio
                await AsyncStorage.multiSet([
                  ["meatRatio", "80"],
                  ["boneRatio", "10"],
                  ["organRatio", "10"],
                  ["plantMatterRatio", "0"],
                  ["selectedRatio", "80:10:10"],
                  ["includePlantMatter", "false"],
                  ["tempMeatRatio", "80"],
                  ["tempBoneRatio", "10"],
                  ["tempOrganRatio", "10"],
                  ["tempPlantMatterRatio", "0"],
                  ["tempSelectedRatio", "80:10:10"],
                  ["tempIncludePlantMatter", "false"],
                ])
              }
            } else {
              // For standard ratios, use the saved values
              setSelectedRatio(savedRatio)
              setNewMeat(Number(savedMeat) || 80)
              setNewBone(Number(savedBone) || 10)
              setNewOrgan(Number(savedOrgan) || 10)
              setNewPlantMatter(Number(savedPlantMatter) || 0)
              setIncludePlantMatter(savedIncludePlantMatter === "true")

              // Also save as temporary values for consistency
              await AsyncStorage.multiSet([
                ["tempMeatRatio", savedMeat || "80"],
                ["tempBoneRatio", savedBone || "10"],
                ["tempOrganRatio", savedOrgan || "10"],
                ["tempPlantMatterRatio", savedPlantMatter || "0"],
                ["tempSelectedRatio", savedRatio],
                ["tempIncludePlantMatter", savedIncludePlantMatter || "false"],
              ])
            }
          } else {
            // If no saved ratio at all, default to 80:10:10
            console.log("⚠️ No saved ratio found, defaulting to 80:10:10")
            setSelectedRatio("80:10:10")
            setNewMeat(80)
            setNewBone(10)
            setNewOrgan(10)
            setNewPlantMatter(0)
            setIncludePlantMatter(false)

            // Save the default ratio
            await AsyncStorage.multiSet([
              ["meatRatio", "80"],
              ["boneRatio", "10"],
              ["organRatio", "10"],
              ["plantMatterRatio", "0"],
              ["selectedRatio", "80:10:10"],
              ["includePlantMatter", "false"],
              ["tempMeatRatio", "80"],
              ["tempBoneRatio", "10"],
              ["tempOrganRatio", "10"],
              ["tempPlantMatterRatio", "0"],
              ["tempSelectedRatio", "80:10:10"],
              ["tempIncludePlantMatter", "false"],
            ])
          }
        } catch (error) {
          console.log("❌ Failed to load ratios:", error)
        }
      }

      loadRatios()
    }, [currentMeatWeight, currentBoneWeight, currentOrganWeight, currentPlantMatterWeight]), // Add weight dependencies to ensure correctors update
  )

  // Add a specific useFocusEffect to recalculate correctors when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log("🔄 Screen focused - recalculating correctors")

      // Always force a recalculation on focus, regardless of whether we have weights
      if (
        currentMeatWeight === 0 &&
        currentBoneWeight === 0 &&
        currentOrganWeight === 0 &&
        currentPlantMatterWeight === 0
      ) {
        // For fresh launch or no ingredients, use sample calculation
        calculateSampleCorrectorsForFreshLaunch()
      } else {
        // For normal case with ingredients, use actual weights
        calculateCorrectors(
          currentMeatWeight,
          currentBoneWeight,
          currentOrganWeight,
          currentPlantMatterWeight,
          newMeat,
          newBone,
          newOrgan,
          newPlantMatter,
          includePlantMatter,
        )
      }
    }, [
      newMeat,
      newBone,
      newOrgan,
      newPlantMatter,
      includePlantMatter,
      currentMeatWeight,
      currentBoneWeight,
      currentOrganWeight,
      currentPlantMatterWeight,
    ]),
  )

  const calculateSampleCorrectorsForFreshLaunch = () => {
    console.log("📊 Setting correctors to zero for fresh launch")

    // Set all corrector values to zero when no ingredients are present
    setMeatCorrect({ bone: 0, organ: 0, plantMatter: 0 })
    setBoneCorrect({ meat: 0, organ: 0, plantMatter: 0 })
    setOrganCorrect({ meat: 0, bone: 0, plantMatter: 0 })
    setPlantMatterCorrect({ meat: 0, bone: 0, organ: 0 })
  }

  function calculateCorrectors(
    meatWeight: number,
    boneWeight: number,
    organWeight: number,
    plantMatterWeight: number,
    newMeat: number,
    newBone: number,
    newOrgan: number,
    newPlantMatter: number,
    includePlantMatter: boolean,
  ) {
    console.log("📊 Calculating correctors with:", {
      meatWeight,
      boneWeight,
      organWeight,
      plantMatterWeight,
      newMeat,
      newBone,
      newOrgan,
      newPlantMatter,
      includePlantMatter,
    })

    // If we have no weights at all (fresh launch or no ingredients), set all values to zero
    if (meatWeight === 0 && boneWeight === 0 && organWeight === 0 && plantMatterWeight === 0) {
      console.log("📊 No ingredients detected, setting correctors to zero")
      setMeatCorrect({ bone: 0, organ: 0, plantMatter: 0 })
      setBoneCorrect({ meat: 0, organ: 0, plantMatter: 0 })
      setOrganCorrect({ meat: 0, bone: 0, plantMatter: 0 })
      setPlantMatterCorrect({ meat: 0, bone: 0, organ: 0 })
      return
    }

    const meatCorrect = { bone: 0, organ: 0, plantMatter: 0 }
    const boneCorrect = { meat: 0, organ: 0, plantMatter: 0 }
    const organCorrect = { meat: 0, bone: 0, plantMatter: 0 }
    const plantMatterCorrect = { meat: 0, bone: 0, organ: 0 }

    if (includePlantMatter) {
      // With plant matter included
      if (meatWeight > 0) {
        meatCorrect.bone = (meatWeight / newMeat) * newBone - boneWeight
        meatCorrect.organ = (meatWeight / newMeat) * newOrgan - organWeight
        meatCorrect.plantMatter = (meatWeight / newMeat) * newPlantMatter - plantMatterWeight
      }

      if (boneWeight > 0) {
        boneCorrect.meat = (boneWeight / newBone) * newMeat - meatWeight
        boneCorrect.organ = (boneWeight / newBone) * newOrgan - organWeight
        boneCorrect.plantMatter = (boneWeight / newBone) * newPlantMatter - plantMatterWeight
      }

      if (organWeight > 0) {
        organCorrect.meat = (organWeight / newOrgan) * newMeat - meatWeight
        organCorrect.bone = (organWeight / newOrgan) * newBone - boneWeight
        organCorrect.plantMatter = (organWeight / newOrgan) * newPlantMatter - plantMatterWeight
      }

      if (plantMatterWeight > 0) {
        plantMatterCorrect.meat = (plantMatterWeight / newPlantMatter) * newMeat - meatWeight
        plantMatterCorrect.bone = (plantMatterWeight / newPlantMatter) * newBone - boneWeight
        plantMatterCorrect.organ = (plantMatterWeight / newPlantMatter) * newOrgan - organWeight
      }
    } else {
      // Without plant matter
      if (meatWeight > 0) {
        meatCorrect.bone = (meatWeight / newMeat) * newBone - boneWeight
        meatCorrect.organ = (meatWeight / newMeat) * newOrgan - organWeight
      }

      if (boneWeight > 0) {
        boneCorrect.meat = (boneWeight / newBone) * newMeat - meatWeight
        boneCorrect.organ = (boneWeight / newBone) * newOrgan - organWeight
      }

      if (organWeight > 0) {
        organCorrect.meat = (organWeight / newOrgan) * newMeat - meatWeight
        organCorrect.bone = (organWeight / newOrgan) * newBone - boneWeight
      }
    }

    setMeatCorrect(meatCorrect)
    setBoneCorrect(boneCorrect)
    setOrganCorrect(organCorrect)
    setPlantMatterCorrect(plantMatterCorrect)
  }

  // Modified useEffect to ensure corrector calculations happen immediately
  useEffect(() => {
    const saveRatios = async () => {
      try {
        await AsyncStorage.setItem("meatRatio", newMeat.toString())
        await AsyncStorage.setItem("boneRatio", newBone.toString())
        await AsyncStorage.setItem("organRatio", newOrgan.toString())
        await AsyncStorage.setItem("plantMatterRatio", newPlantMatter.toString())
        await AsyncStorage.setItem("selectedRatio", selectedRatio)
        await AsyncStorage.setItem("includePlantMatter", includePlantMatter.toString())

        if (selectedRatio === "custom") {
          await AsyncStorage.setItem("customMeatRatio", newMeat.toString())
          await AsyncStorage.setItem("customBoneRatio", newBone.toString())
          await AsyncStorage.setItem("customOrganRatio", newOrgan.toString())
          await AsyncStorage.setItem("customPlantMatterRatio", newPlantMatter.toString())
          await AsyncStorage.setItem("customIncludePlantMatter", includePlantMatter.toString())
        }
      } catch (error) {
        console.log("Failed to save ratios:", error)
      }
    }

    if (newMeat !== null && newBone !== null && newOrgan !== null) {
      saveRatios()

      // Always use the latest weight values from state
      calculateCorrectors(
        currentMeatWeight,
        currentBoneWeight,
        currentOrganWeight,
        currentPlantMatterWeight,
        newMeat,
        newBone,
        newOrgan,
        newPlantMatter,
        includePlantMatter,
      )
    }
  }, [
    newMeat,
    newBone,
    newOrgan,
    newPlantMatter,
    selectedRatio,
    includePlantMatter,
    currentMeatWeight,
    currentBoneWeight,
    currentOrganWeight,
    currentPlantMatterWeight,
  ])

  const showRatioInfoAlert = () => {
    Alert.alert(
      "Ratio Info",
      "• Adult dogs: 80% meat, 10% bone, 10% secreting organs\n\n" +
        "• Puppies and pregnant/nursing dogs: 75% meat, 15% bone, 10% secreting organs\n\n" +
        "• With plant matter: 70% meat, 10% bone, 10% secreting organs, 10% plant matter\n\n" +
        "• Puppies with plant matter: 65% meat, 15% bone, 10% secreting organs, 10% plant matter\n\n" +
        "The higher bone content for puppies provides essential calcium for growth and lactation.",
      [{ text: "OK" }],
    )
  }

  const showInfoAlert = () => {
    Alert.alert(
      "Corrector Info",
      "The corrector values help you achieve the intended ratio. Adjust these values to match your desired meat, bone, organ, and plant matter distribution.",
      [{ text: "OK" }],
    )
  }

  const clearUserSelection = async () => {
    await AsyncStorage.setItem("userSelectedRatio", "false")
    setUserSelectedRatio(false)
  }

  // Updated formatWeight function to remove .00 for grams and make unit stick to number
  const formatWeight = (value: number, ingredient: string) => {
    if (isNaN(value)) value = 0

    // Format the number based on unit
    let formattedValue
    if (unit === "g") {
      // For grams, show whole numbers if possible
      formattedValue = Math.abs(value) % 1 === 0 ? Math.abs(value).toFixed(0) : Math.abs(value).toFixed(2)
    } else {
      // For kg and lbs, always show 2 decimal places
      formattedValue = Math.abs(value).toFixed(2)
    }

    const action = value > 0 ? "Add" : value < 0 ? "Remove" : "Add"
    // Return with no space between number and unit
    return `${action} ${formattedValue}${unit} of ${ingredient}`
  }

  const displayCustomRatio =
    selectedRatio === "custom"
      ? `${customRatio.meat || newMeat}:${customRatio.bone || newBone}:${customRatio.organ || newOrgan}${
          customRatio.includePlantMatter || includePlantMatter ? `:${customRatio.plantMatter || newPlantMatter}` : ""
        }`
      : "Custom Ratio"

  // Add this before the return statement
  console.log("Current ratio state:", {
    selectedRatio,
    newMeat,
    newBone,
    newOrgan,
    newPlantMatter,
    customRatio,
    displayCustomRatio,
  })

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
          <View style={styles.topBar} />

          {/* Ratio Selection */}
          <View style={styles.ratioTitleContainer}>
            <Text style={styles.ratioTitle}>Set your Meat: Bone: Organ ratio:</Text>
            <TouchableOpacity onPress={showRatioInfoAlert} style={styles.infoIcon}>
              <FontAwesome name="info-circle" size={rs(20)} color="#000080" />
            </TouchableOpacity>
          </View>
          <View style={styles.ratioButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.ratioButton,
                selectedRatio === "80:10:10" && selectedRatio !== "custom" && styles.selectedRatioButton,
              ]}
              onPress={() => setRatio(80, 10, 10, 0, "80:10:10")}
            >
              <Text
                style={[
                  styles.ratioButtonText,
                  selectedRatio === "80:10:10" && selectedRatio !== "custom" && { color: "white" },
                ]}
              >
                80:10:10
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ratioButton,
                selectedRatio === "75:15:10" && selectedRatio !== "custom" && styles.selectedRatioButton,
              ]}
              onPress={() => setRatio(75, 15, 10, 0, "75:15:10")}
            >
              <Text
                style={[
                  styles.ratioButtonText,
                  selectedRatio === "75:15:10" && selectedRatio !== "custom" && { color: "white" },
                ]}
              >
                75:15:10
              </Text>
            </TouchableOpacity>
          </View>

          {/* Second section */}
          <View style={styles.ratioTitleContainer}>
            <Text style={styles.ratioTitle}>To add fruit/veg, set your Meat:Bone:Organ:Plant ratio:</Text>
          </View>
          <View style={styles.ratioButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.ratioButton,
                selectedRatio === "70:10:10:10" && selectedRatio !== "custom" && styles.selectedRatioButton,
              ]}
              onPress={() => setRatio(70, 10, 10, 10, "70:10:10:10")}
            >
              <Text
                style={[
                  styles.ratioButtonText,
                  selectedRatio === "70:10:10:10" && selectedRatio !== "custom" && { color: "white" },
                ]}
              >
                70:10:10:10
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ratioButton,
                selectedRatio === "65:15:10:10" && selectedRatio !== "custom" && styles.selectedRatioButton,
              ]}
              onPress={() => setRatio(65, 15, 10, 10, "65:15:10:10")}
            >
              <Text
                style={[
                  styles.ratioButtonText,
                  selectedRatio === "65:15:10:10" && selectedRatio !== "custom" && { color: "white" },
                ]}
              >
                65:15:10:10
              </Text>
            </TouchableOpacity>
          </View>

          {/* Custom Ratio Button */}
          <TouchableOpacity
            style={[
              styles.customButton,
              selectedRatio === "custom"
                ? styles.selectedCustomButton
                : { backgroundColor: "white", borderColor: "navy" },
            ]}
            onPress={navigateToCustomRatio}
          >
            <Text
              style={[styles.customButtonText, selectedRatio === "custom" ? { color: "white" } : { color: "black" }]}
            >
              {selectedRatio === "custom" ? displayCustomRatio : "Custom Ratio"}
            </Text>
          </TouchableOpacity>

          {/* Corrector Information */}
          <View style={styles.correctorInfoContainer}>
            <Text style={styles.correctorInfoText}>Use the corrector to achieve the intended ratio:</Text>
            <TouchableOpacity onPress={showInfoAlert} style={styles.infoIcon}>
              <FontAwesome name="info-circle" size={rs(20)} color="#000080" />
            </TouchableOpacity>
          </View>

          {/* Corrector Boxes */}
          <View style={styles.correctorContainer}>
            {/* Meat Corrector */}
            <View style={[styles.correctorBox, styles.meatCorrector]}>
              <Text style={styles.correctorTitle}>If Meat is correct</Text>
              <Text style={styles.correctorText}>{formatWeight(meatCorrect.bone, "bones")}</Text>
              <Text style={styles.correctorText}>{formatWeight(meatCorrect.organ, "organs")}</Text>
              {includePlantMatter && (
                <Text style={styles.correctorText}>{formatWeight(meatCorrect.plantMatter, "plant matter")}</Text>
              )}
            </View>

            {/* Bone Corrector */}
            <View style={[styles.correctorBox, styles.boneCorrector]}>
              <Text style={styles.correctorTitle}>If Bone is correct</Text>
              <Text style={styles.correctorText}>{formatWeight(boneCorrect.meat, "meat")}</Text>
              <Text style={styles.correctorText}>{formatWeight(boneCorrect.organ, "organs")}</Text>
              {includePlantMatter && (
                <Text style={styles.correctorText}>{formatWeight(boneCorrect.plantMatter, "plant matter")}</Text>
              )}
            </View>

            {/* Organ Corrector */}
            <View style={[styles.correctorBox, styles.organCorrector]}>
              <Text style={styles.correctorTitle}>If Organ is correct</Text>
              <Text style={styles.correctorText}>{formatWeight(organCorrect.meat, "meat")}</Text>
              <Text style={styles.correctorText}>{formatWeight(organCorrect.bone, "bones")}</Text>
              {includePlantMatter && (
                <Text style={styles.correctorText}>{formatWeight(organCorrect.plantMatter, "plant matter")}</Text>
              )}
            </View>

            {/* Plant Matter Corrector */}
            {includePlantMatter && (
              <View style={[styles.correctorBox, styles.plantMatterCorrector]}>
                <Text style={styles.correctorTitle}>If Plant Matter is correct</Text>
                <Text style={styles.correctorText}>{formatWeight(plantMatterCorrect.meat, "meat")}</Text>
                <Text style={styles.correctorText}>{formatWeight(plantMatterCorrect.bone, "bones")}</Text>
                <Text style={styles.correctorText}>{formatWeight(plantMatterCorrect.organ, "organs")}</Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  topBar: {
    marginBottom: 16,
  },
  ratioTitle: {
    fontSize: rs(isSmallDevice ? 16 : 18),
    fontWeight: "bold",
    textAlign: "left",
    flex: 1,
  },
  ratioTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 1,
  },
  ratioButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  ratioButton: {
    paddingVertical: vs(10),
    paddingHorizontal: rs(20),
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "white",
    borderColor: "#000080",
  },
  selectedRatioButton: {
    backgroundColor: "#000080",
    borderColor: "green",
  },
  customButton: {
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: vs(10),
    paddingHorizontal: rs(50),
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "white",
    borderColor: "#000080",
  },
  selectedCustomButton: {
    backgroundColor: "#000080",
    borderColor: "green",
  },
  customButtonText: {
    color: "white",
    fontSize: rs(isSmallDevice ? 14 : 16),
    fontWeight: "600",
  },
  ratioButtonText: {
    fontSize: rs(isSmallDevice ? 14 : 16),
    fontWeight: "600",
    color: "black",
  },
  correctorInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  correctorInfoText: {
    fontSize: rs(isSmallDevice ? 16 : 18),
    color: "black",
    fontWeight: "bold",
    flex: 1,
  },
  correctorContainer: {
    flexDirection: "column",
    alignItems: "stretch",
    marginTop: 16,
  },
  correctorBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "transparent",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#4747f5",
  },
  correctorTitle: {
    fontSize: rs(isSmallDevice ? 14 : 16),
    fontWeight: "bold",
    marginBottom: 8,
  },
  correctorText: {
    fontSize: rs(isSmallDevice ? 12 : 14),
  },
  meatCorrector: {},
  boneCorrector: {},
  organCorrector: {},
  plantMatterCorrector: {
    borderColor: "#ff6347",
  },
  applyButton: {
    backgroundColor: "#000080",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  applyButtonText: {
    color: "white",
    fontSize: rs(isSmallDevice ? 16 : 18),
    fontWeight: "bold",
  },
})

export default CalculatorScreen