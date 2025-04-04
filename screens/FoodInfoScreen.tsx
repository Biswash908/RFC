"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import type { RouteProp } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
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

type RootStackParamList = {
  FoodInfoScreen: {
    ingredient: {
      id: string
      name: string
      meat?: number
      bone?: number
      organ?: number
      type?: string
      weight?: number
      unit: "g" | "kg" | "lbs"
      isSupplementInfo?: boolean
      supplementInfo?: string
    }
    editMode: boolean
  }
  FoodInputScreen: {
    updatedIngredient: {
      id: string
      name: string
      meat?: number
      bone?: number
      organ?: number
      weight: number
      meatWeight?: number
      boneWeight?: number
      organWeight?: number
      totalWeight: number
      unit: "g" | "kg" | "lbs"
      type?: string
      isSupplementInfo?: boolean
      supplementInfo?: string
    }
  }
}

type FoodInfoScreenRouteProp = RouteProp<RootStackParamList, "FoodInfoScreen">
type FoodInfoScreenNavigationProp = StackNavigationProp<RootStackParamList, "FoodInfoScreen">

type Props = {
  route: FoodInfoScreenRouteProp
  navigation: FoodInfoScreenNavigationProp
}

const FoodInfoScreen = ({ route, navigation }: Props) => {
  const { setUnit } = useUnit()
  const { ingredient, editMode } = route.params
  const [weight, setWeight] = useState(
    ingredient.weight || ingredient.totalWeight ? (ingredient.weight || ingredient.totalWeight).toString() : "",
  )
  const [selectedUnit, setSelectedUnit] = useState<"g" | "kg" | "lbs">(ingredient.unit || "g")
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipOpacity = useState(new Animated.Value(0))[0]

  const convertWeight = (weight: number) => {
    switch (selectedUnit) {
      case "kg":
        return weight
      case "lbs":
        return weight
      default:
        return weight
    }
  }

  const formatWeightForDisplay = (value: string, unit: "g" | "kg" | "lbs") => {
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) return value

    if (unit === "g") {
      // For grams, display as whole numbers
      return Math.round(numValue).toString()
    } else {
      // For kg and lbs, keep decimal places
      return numValue.toString()
    }
  }

  const calculateWeight = (percentage: number) => {
    const weightNum = Number.parseFloat(weight)
    return isNaN(weightNum) ? 0 : (weightNum * percentage) / 100
  }

  const handleSaveIngredient = () => {
    const weightValue = Number.parseFloat(weight)
    // For grams, ensure we're using whole numbers
    const formattedWeight = selectedUnit === "g" ? Math.round(weightValue) : weightValue

    const meatWeight = ingredient.meat ? calculateWeight(ingredient.meat) : undefined
    const boneWeight = ingredient.bone ? calculateWeight(ingredient.bone) : undefined
    const organWeight = ingredient.organ ? calculateWeight(ingredient.organ) : undefined
    const totalWeight = formattedWeight

    const updatedIngredient = {
      ...ingredient,
      weight: formattedWeight,
      meatWeight,
      boneWeight,
      organWeight,
      totalWeight,
      unit: selectedUnit,
    }

    setUnit(selectedUnit)

    navigation.navigate("HomeTabs", {
      screen: "HomeTabsHome",
      params: { updatedIngredient },
    })
  }

  const isNonMeat = ingredient.type === "Vegetable" || ingredient.type === "Fruit" || ingredient.type === "Nut & Seed"

  const isSupplement = ingredient.name === "Bone Meal" || ingredient.name === "Powdered Eggshell"

  const toggleTooltip = () => {
    if (showTooltip) {
      // Fade out
      Animated.timing(tooltipOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowTooltip(false)
      })
    } else {
      // Show and fade in
      setShowTooltip(true)
      Animated.timing(tooltipOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }

  // Auto-hide tooltip after 5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showTooltip) {
      timer = setTimeout(() => {
        Animated.timing(tooltipOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowTooltip(false)
        })
      }, 5000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [showTooltip, tooltipOpacity])

  const getSupplementInfo = () => {
    if (ingredient.name === "Bone Meal") {
      return "Bone Meal is shown as 416.667% bone because it's a concentrated calcium and phosphorus supplement. This percentage reflects its equivalent calcium content compared to raw bone, not its actual weight."
    } else if (ingredient.name === "Powdered Eggshell") {
      return "Powdered Eggshell is listed as 2500% bone due to its extremely high calcium concentration. Just 1g can replace about 25g of raw bone, making it a potent bone substitute in boneless diets."
    }
    return ""
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Display ingredient type and name for non-meat ingredients */}
        <Text style={styles.title}>
          {isNonMeat ? `${ingredient.type} - ${ingredient.name}` : ingredient.name}
          {isSupplement && <Text style={styles.supplementLabel}> (Supplement)</Text>}
        </Text>
        <View style={styles.underline} />

        <TextInput
          style={styles.input}
          placeholder={`Enter ingredient weight in ${selectedUnit}`}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />

        <View style={styles.buttonContainer}>
          {["g", "kg", "lbs"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.unitButton, selectedUnit === item ? styles.activeUnitButton : styles.inactiveUnitButton]}
              onPress={() => {
                const newUnit = item as "g" | "kg" | "lbs"
                setSelectedUnit(newUnit)
                // Format the weight according to the new unit
                setWeight(formatWeightForDisplay(weight, newUnit))
              }}
            >
              <Text style={styles.unitButtonText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Only show meat, bone, and organ percentages if the ingredient is meat */}
        {!isNonMeat && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>
              Meat: {ingredient.meat}% -{" "}
              {selectedUnit === "g"
                ? Math.round(convertWeight(calculateWeight(ingredient.meat!)))
                : convertWeight(calculateWeight(ingredient.meat!)).toFixed(2)}{" "}
              {selectedUnit}
            </Text>

            <View style={styles.boneRow}>
              <Text style={styles.resultText}>
                Bone: {ingredient.bone}% -{" "}
                {selectedUnit === "g"
                  ? Math.round(convertWeight(calculateWeight(ingredient.bone!)))
                  : convertWeight(calculateWeight(ingredient.bone!)).toFixed(2)}{" "}
                {selectedUnit}
              </Text>

              {isSupplement && (
                <View style={styles.tooltipContainer}>
                  <TouchableOpacity onPress={toggleTooltip} style={styles.infoButton}>
                    <FontAwesome name="info-circle" size={20} color="#000080" />
                  </TouchableOpacity>

                  {showTooltip && (
                    <>
                      <TouchableOpacity style={styles.tooltipOverlay} activeOpacity={1} onPress={toggleTooltip} />
                      <Animated.View style={[styles.tooltip, { opacity: tooltipOpacity }]}>
                        <Text style={styles.tooltipText}>{getSupplementInfo()}</Text>
                        <View style={styles.tooltipArrow} />
                      </Animated.View>
                    </>
                  )}
                </View>
              )}
            </View>

            <Text style={styles.resultText}>
              Organ: {ingredient.organ}% -{" "}
              {selectedUnit === "g"
                ? Math.round(convertWeight(calculateWeight(ingredient.organ!)))
                : convertWeight(calculateWeight(ingredient.organ!)).toFixed(2)}{" "}
              {selectedUnit}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSaveIngredient}>
          <Text style={styles.buttonText}>{editMode ? "Save Ingredient" : "Add Ingredient"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: rs(isSmallDevice ? 20 : 24),
    fontWeight: "bold",
    textAlign: "center",
  },
  underline: {
    height: 2,
    backgroundColor: "black",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginTop: 15,
    fontSize: rs(isSmallDevice ? 14 : 16),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  unitButton: {
    paddingVertical: vs(10),
    paddingHorizontal: rs(25),
    borderRadius: 5,
  },
  activeUnitButton: {
    backgroundColor: "#000080",
  },
  inactiveUnitButton: {
    backgroundColor: "#ccc",
  },
  unitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: rs(isSmallDevice ? 14 : 16),
  },
  resultContainer: {
    marginTop: 15,
  },
  resultText: {
    fontSize: rs(isSmallDevice ? 16 : 18),
    marginVertical: 5,
  },
  boneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative", // For positioning the tooltip
  },
  infoButton: {
    marginLeft: 10,
    padding: 5,
  },
  tooltipContainer: {
    position: "relative",
  },
  tooltipOverlay: {
    position: "absolute",
    top: -1000,
    left: -1000,
    width: 3000,
    height: 3000,
    backgroundColor: "transparent",
    zIndex: 999,
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "#e3f2fd",
    borderRadius: 6,
    padding: 10,
    width: SCREEN_WIDTH * 0.7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#000080",
    top: 30,
    right: -100, // Adjusted to position more to the right
    zIndex: 1000,
  },
  tooltipText: {
    fontSize: rs(isSmallDevice ? 12 : 14),
    color: "#333",
  },
  tooltipArrow: {
    position: "absolute",
    top: -10,
    right: 105, // Adjusted to match the new tooltip position
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#000080",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#000080",
    paddingVertical: vs(15),
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: rs(isSmallDevice ? 16 : 18),
    fontWeight: "bold",
  },
})

export default FoodInfoScreen