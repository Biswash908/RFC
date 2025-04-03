"use client";

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useUnit } from "../UnitContext";

type RootStackParamList = {
  FoodInfoScreen: {
    ingredient: {
      id: string;
      name: string;
      meat?: number;
      bone?: number;
      organ?: number;
      type?: string;
      weight?: number;
      unit: "g" | "kg" | "lbs";
    };
    editMode: boolean;
  };
  FoodInputScreen: {
    updatedIngredient: {
      id: string;
      name: string;
      meat?: number;
      bone?: number;
      organ?: number;
      weight: number;
      meatWeight?: number;
      boneWeight?: number;
      organWeight?: number;
      totalWeight: number;
      unit: "g" | "kg" | "lbs";
    };
  };
};

type FoodInfoScreenRouteProp = RouteProp<RootStackParamList, "FoodInfoScreen">;
type FoodInfoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FoodInfoScreen"
>;

type Props = {
  route: FoodInfoScreenRouteProp;
  navigation: FoodInfoScreenNavigationProp;
};

const FoodInfoScreen = ({ route, navigation }: Props) => {
  const { setUnit } = useUnit();
  const { ingredient, editMode } = route.params;
  const [weight, setWeight] = useState(
    ingredient.weight || ingredient.totalWeight
      ? (ingredient.weight || ingredient.totalWeight).toString()
      : ""
  );
  const [selectedUnit, setSelectedUnit] = useState<"g" | "kg" | "lbs">(
    ingredient.unit || "g"
  );

  const convertWeight = (weight: number) => {
    switch (selectedUnit) {
      case "kg":
        return weight;
      case "lbs":
        return weight;
      default:
        return weight;
    }
  };

  const formatWeightForDisplay = (value: string, unit: "g" | "kg" | "lbs") => {
    const numValue = Number.parseFloat(value);
    if (isNaN(numValue)) return value;

    if (unit === "g") {
      // For grams, display as whole numbers
      return Math.round(numValue).toString();
    } else {
      // For kg and lbs, keep decimal places
      return numValue.toString();
    }
  };

  const calculateWeight = (percentage: number) => {
    const weightNum = Number.parseFloat(weight);
    return isNaN(weightNum) ? 0 : (weightNum * percentage) / 100;
  };

  const handleSaveIngredient = () => {
    const weightValue = Number.parseFloat(weight);
    // For grams, ensure we're using whole numbers
    const formattedWeight =
      selectedUnit === "g" ? Math.round(weightValue) : weightValue;

    const meatWeight = ingredient.meat
      ? calculateWeight(ingredient.meat)
      : undefined;
    const boneWeight = ingredient.bone
      ? calculateWeight(ingredient.bone)
      : undefined;
    const organWeight = ingredient.organ
      ? calculateWeight(ingredient.organ)
      : undefined;
    const totalWeight = formattedWeight;

    const updatedIngredient = {
      ...ingredient,
      weight: formattedWeight,
      meatWeight,
      boneWeight,
      organWeight,
      totalWeight,
      unit: selectedUnit,
    };

    setUnit(selectedUnit);

    navigation.navigate("HomeTabs", {
      screen: "HomeTabsHome",
      params: { updatedIngredient },
    });
  };

  const isNonMeat =
    ingredient.type === "Vegetable" ||
    ingredient.type === "Fruit" ||
    ingredient.type === "Nut & Seed";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Display ingredient type and name for non-meat ingredients */}
        <Text style={styles.title}>
          {isNonMeat
            ? `${ingredient.type} - ${ingredient.name}`
            : ingredient.name}
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
              style={[
                styles.unitButton,
                selectedUnit === item
                  ? styles.activeUnitButton
                  : styles.inactiveUnitButton,
              ]}
              onPress={() => {
                const newUnit = item as "g" | "kg" | "lbs";
                setSelectedUnit(newUnit);
                // Format the weight according to the new unit
                setWeight(formatWeightForDisplay(weight, newUnit));
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
                : convertWeight(calculateWeight(ingredient.meat!)).toFixed(
                    2
                  )}{" "}
              {selectedUnit}
            </Text>
            <Text style={styles.resultText}>
              Bone: {ingredient.bone}% -{" "}
              {selectedUnit === "g"
                ? Math.round(convertWeight(calculateWeight(ingredient.bone!)))
                : convertWeight(calculateWeight(ingredient.bone!)).toFixed(
                    2
                  )}{" "}
              {selectedUnit}
            </Text>
            <Text style={styles.resultText}>
              Organ: {ingredient.organ}% -{" "}
              {selectedUnit === "g"
                ? Math.round(convertWeight(calculateWeight(ingredient.organ!)))
                : convertWeight(calculateWeight(ingredient.organ!)).toFixed(
                    2
                  )}{" "}
              {selectedUnit}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSaveIngredient}>
          <Text style={styles.buttonText}>
            {editMode ? "Save Ingredient" : "Add Ingredient"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
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
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  unitButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
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
  },
  resultContainer: {
    marginTop: 15,
  },
  resultText: {
    fontSize: 18,
    marginVertical: 5,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#000080",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default FoodInfoScreen;
