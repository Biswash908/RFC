"use client"

import React, { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch, Platform, Dimensions } from "react-native"
import { useNavigation, useRoute, type RouteProp, useFocusEffect } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Add responsive sizing utilities
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const isSmallDevice = SCREEN_WIDTH < 375
const isIOS = Platform.OS === "ios"
const scale = SCREEN_WIDTH / 375
const verticalScale = SCREEN_HEIGHT / 812

// Responsive sizing functions
const rs = (size: number) => Math.round(size * (isIOS ? Math.min(scale, 1.2) : scale))
const vs = (size: number) => Math.round(size * (isIOS ? Math.min(verticalScale, 1.2) : verticalScale))

interface Ingredient {
  name: string
  amount: number
  unit: string
  protein: number
  fat: number
  carbs: number
  bone: number
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

type CustomRatioScreenRouteProp = RouteProp<RootStackParamList, "CustomRatioScreen">

const CustomRatioScreen: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute<CustomRatioScreenRouteProp>()

  const [includePlantMatter, setIncludePlantMatter] = useState(false)
  const [meatRatio, setMeatRatio] = useState<number>(60)
  const [boneRatio, setBoneRatio] = useState<number>(20)
  const [organRatio, setOrganRatio] = useState<number>(15)
  const [plantMatterRatio, setPlantMatterRatio] = useState<number>(5)
  const [buttonText, setButtonText] = useState("Use Ratio")
  const [valuesModified, setValuesModified] = useState(false)

  const loadSavedRatios = async () => {
    try {
      // First try to load temporary values if they exist
      const tempIncludePlantMatter = await AsyncStorage.getItem("tempIncludePlantMatter")
      const tempMeatRatio = await AsyncStorage.getItem("tempMeatRatio")
      const tempBoneRatio = await AsyncStorage.getItem("tempBoneRatio")
      const tempOrganRatio = await AsyncStorage.getItem("tempOrganRatio")
      const tempPlantMatterRatio = await AsyncStorage.getItem("tempPlantMatterRatio")

      // If we have temporary values, use them
      if (tempMeatRatio && tempBoneRatio && tempOrganRatio && tempIncludePlantMatter) {
        console.log("📥 Loading temporary ratio values in CustomRatioScreen")
        setIncludePlantMatter(tempIncludePlantMatter === "true")
        setMeatRatio(Number.parseFloat(tempMeatRatio))
        setBoneRatio(Number.parseFloat(tempBoneRatio))
        setOrganRatio(Number.parseFloat(tempOrganRatio))
        setPlantMatterRatio(tempPlantMatterRatio ? Number.parseFloat(tempPlantMatterRatio) : 5)
        return
      }

      // Otherwise fall back to regular saved values
      const savedIncludePlantMatter = await AsyncStorage.getItem("includePlantMatter")
      const savedMeatRatio = await AsyncStorage.getItem("meatRatio")
      const savedBoneRatio = await AsyncStorage.getItem("boneRatio")
      const savedOrganRatio = await AsyncStorage.getItem("organRatio")
      const savedPlantMatterRatio = await AsyncStorage.getItem("plantMatterRatio")

      setIncludePlantMatter(savedIncludePlantMatter === "true")
      setMeatRatio(savedMeatRatio ? Number.parseFloat(savedMeatRatio) : 60)
      setBoneRatio(savedBoneRatio ? Number.parseFloat(savedBoneRatio) : 20)
      setOrganRatio(savedOrganRatio ? Number.parseFloat(savedOrganRatio) : 15)
      setPlantMatterRatio(savedPlantMatterRatio ? Number.parseFloat(savedPlantMatterRatio) : 5)
    } catch (error) {
      console.log("Failed to load saved ratios:", error)
    }
  }

  useEffect(() => {
    loadSavedRatios()
  }, [])

  const calculateTotalRatio = () => {
    return includePlantMatter
      ? meatRatio + boneRatio + organRatio + plantMatterRatio
      : meatRatio + boneRatio + organRatio
  }

  // Update the useEffect that loads values from route params to set default values for custom ratio
  useEffect(() => {
    // Use values passed from CalculatorScreen if available
    if (route.params?.currentValues) {
      const { meat, bone, organ, plantMatter, includePlantMatter: includeP } = route.params.currentValues
      setMeatRatio(meat || 60)
      setBoneRatio(bone || 20)
      setOrganRatio(organ || 15)
      setPlantMatterRatio(plantMatter || 5)
      setIncludePlantMatter(includeP || false)
      setValuesModified(false) // Reset modification flag when new values are loaded
    } else {
      // Otherwise load from AsyncStorage
      loadSavedRatios()
    }
  }, [route.params?.currentValues])

  const handleTogglePlantMatter = async (value: boolean) => {
    setIncludePlantMatter(value)
    setValuesModified(true) // Mark values as modified

    // Adjust ratios when toggling plant matter
    if (!value) {
      // When turning off plant matter, redistribute the plant matter percentage
      const plantValue = plantMatterRatio
      const total = meatRatio + boneRatio + organRatio

      if (total > 0) {
        // Proportionally distribute plant matter percentage to other components
        const newMeat = Math.round(meatRatio + (meatRatio / total) * plantValue)
        const newBone = Math.round(boneRatio + (boneRatio / total) * plantValue)
        const newOrgan = 100 - newMeat - newBone // Ensure total is 100%

        setMeatRatio(newMeat)
        setBoneRatio(newBone)
        setOrganRatio(newOrgan)
        setPlantMatterRatio(0)
      } else {
        // Default values if total is 0
        setMeatRatio(80)
        setBoneRatio(10)
        setOrganRatio(10)
        setPlantMatterRatio(0)
      }
    } else {
      // When turning on plant matter, take percentage from other components
      const plantValue = 5 // Default plant matter value

      // Reduce other components proportionally
      const reductionFactor = (100 - plantValue) / 100
      const newMeat = Math.round(meatRatio * reductionFactor)
      const newBone = Math.round(boneRatio * reductionFactor)
      const newOrgan = Math.round(organRatio * reductionFactor)

      setMeatRatio(newMeat)
      setBoneRatio(newBone)
      setOrganRatio(newOrgan)
      setPlantMatterRatio(plantValue)
    }
  }

  // Update the handleAddRatio function to save to temporary storage
  const handleAddRatio = async () => {
    const totalRatio = calculateTotalRatio()
    const difference = totalRatio - 100
    if (difference !== 0) {
      Alert.alert(
        "Error",
        difference > 0
          ? `You're ${difference.toFixed(2)}% over the limit. Adjust the values so the total ratio equals 100%.`
          : `You're ${Math.abs(difference).toFixed(2)}% under 100%. Add more to make the ratio total 100%.`,
      )
      return
    }

    console.log("🚀 Using custom ratio:", {
      meatRatio,
      boneRatio,
      organRatio,
      plantMatterRatio,
      includePlantMatter,
    })

    try {
      // Create a comprehensive batch of all ratio-related data
      const batch = [
        // Regular ratio values
        ["meatRatio", meatRatio.toString()],
        ["boneRatio", boneRatio.toString()],
        ["organRatio", organRatio.toString()],
        ["plantMatterRatio", plantMatterRatio.toString()],
        ["includePlantMatter", includePlantMatter.toString()],
        ["selectedRatio", "custom"],
        ["userSelectedRatio", "true"],
        ["isCustomRatio", "true"],

        // Custom ratio specific keys
        ["customMeatRatio", meatRatio.toString()],
        ["customBoneRatio", boneRatio.toString()],
        ["customOrganRatio", organRatio.toString()],
        ["customPlantMatterRatio", plantMatterRatio.toString()],
        ["customIncludePlantMatter", includePlantMatter.toString()],

        // Temporary ratio values
        ["tempMeatRatio", meatRatio.toString()],
        ["tempBoneRatio", boneRatio.toString()],
        ["tempOrganRatio", organRatio.toString()],
        ["tempPlantMatterRatio", plantMatterRatio.toString()],
        ["tempIncludePlantMatter", includePlantMatter.toString()],
        ["tempSelectedRatio", "custom"],
      ]

      await Promise.all(batch.map(([key, value]) => AsyncStorage.setItem(key, value)))

      // Navigate back to calculator screen with the custom ratio
      navigation.navigate("CalculatorScreen", {
        ratio: {
          meat: meatRatio,
          bone: boneRatio,
          organ: organRatio,
          plantMatter: plantMatterRatio,
          includePlantMatter: includePlantMatter,
          selectedRatio: "custom",
          isUserDefined: true,
        },
      })
    } catch (error) {
      console.log("❌ Failed to save ratios:", error)
      Alert.alert("Error", "Failed to save the ratio. Please try again.")
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      loadSavedRatios()
    }, []),
  )

  const handleInputChange = (value: string, setState: React.Dispatch<React.SetStateAction<number>>) => {
    setValuesModified(true) // Mark values as modified when user changes input
    const sanitizedValue = Number.parseFloat(value.replace(/[^0-9.]/g, ""))
    if (isNaN(sanitizedValue)) {
      setState(0)
    } else {
      setState(sanitizedValue)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.customRatioTitle}>
        <Text style={styles.customRatioTitle}>Select your Custom ratio:</Text>
      </View>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Include Plant Matter</Text>
        <Switch value={includePlantMatter} onValueChange={handleTogglePlantMatter} />
      </View>
      <View style={styles.ratioInputContainer}>
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Meat Ratio</Text>
            <TextInput
              style={styles.ratioInput}
              keyboardType="numeric"
              value={meatRatio.toString()}
              onChangeText={(value) => handleInputChange(value, setMeatRatio)}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Bone Ratio</Text>
            <TextInput
              style={styles.ratioInput}
              keyboardType="numeric"
              value={boneRatio.toString()}
              onChangeText={(value) => handleInputChange(value, setBoneRatio)}
            />
          </View>
        </View>
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Organ Ratio</Text>
            <TextInput
              style={styles.ratioInput}
              keyboardType="numeric"
              value={organRatio.toString()}
              onChangeText={(value) => handleInputChange(value, setOrganRatio)}
            />
          </View>
          {includePlantMatter && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Plant Matter Ratio</Text>
              <TextInput
                style={styles.ratioInput}
                keyboardType="numeric"
                value={plantMatterRatio.toString()}
                onChangeText={(value) => handleInputChange(value, setPlantMatterRatio)}
              />
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleAddRatio}>
        <Text style={styles.addButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF",
  },
  customRatioTitle: {
    fontWeight: "bold",
    fontSize: rs(isSmallDevice ? 18 : 20),
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: rs(isSmallDevice ? 16 : 18),
    fontWeight: "bold",
  },
  ratioInputContainer: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  inputWrapper: {
    width: "48%",
  },
  inputLabel: {
    fontSize: rs(isSmallDevice ? 14 : 16),
    fontWeight: "bold",
    marginBottom: 5,
  },
  ratioInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: rs(isSmallDevice ? 14 : 16),
  },
  addButton: {
    backgroundColor: "#000080",
    paddingVertical: vs(isSmallDevice ? 12 : 15),
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: rs(isSmallDevice ? 16 : 18),
    fontWeight: "bold",
  },
})

export default CustomRatioScreen

