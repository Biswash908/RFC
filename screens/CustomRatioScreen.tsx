"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from "react-native";
import {
  useNavigation,
  useRoute,
  type RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSaveContext } from "../SaveContext";

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  protein: number;
  fat: number;
  carbs: number;
  bone: number;
  type: string;
}

type RootStackParamList = {
  FoodInputScreen: undefined;
  FoodInfoScreen: { ingredient: Ingredient; editMode: boolean };
  SearchScreen: undefined;
  CalculatorScreen: {
    meat: number;
    bone: number;
    organ: number;
    plantmatter: number;
  };
  CustomRatioScreen: {
    onSave?: (
      meat: number,
      bone: number,
      organ: number,
      plantMatter: number,
      includePlantMatter: boolean
    ) => void;
    currentValues?: {
      meat: number;
      bone: number;
      organ: number;
      plantMatter: number;
      includePlantMatter: boolean;
    };
  };
};

type CustomRatioScreenRouteProp = RouteProp<
  RootStackParamList,
  "CustomRatioScreen"
>;

const CustomRatioScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<CustomRatioScreenRouteProp>();
  const { saveCustomRatios } = useSaveContext();

  const [includePlantMatter, setIncludePlantMatter] = useState(false);
  const [meatRatio, setMeatRatio] = useState<number>(0);
  const [boneRatio, setBoneRatio] = useState<number>(0);
  const [organRatio, setOrganRatio] = useState<number>(0);
  const [plantMatterRatio, setPlantMatterRatio] = useState<number>(0);
  const [buttonText, setButtonText] = useState("Use Ratio");
  const [valuesModified, setValuesModified] = useState(false);

  const loadSavedRatios = async () => {
    try {
      // First try to load temporary values if they exist
      const tempIncludePlantMatter = await AsyncStorage.getItem(
        "tempIncludePlantMatter"
      );
      const tempMeatRatio = await AsyncStorage.getItem("tempMeatRatio");
      const tempBoneRatio = await AsyncStorage.getItem("tempBoneRatio");
      const tempOrganRatio = await AsyncStorage.getItem("tempOrganRatio");
      const tempPlantMatterRatio = await AsyncStorage.getItem(
        "tempPlantMatterRatio"
      );

      // If we have temporary values, use them
      if (
        tempMeatRatio &&
        tempBoneRatio &&
        tempOrganRatio &&
        tempIncludePlantMatter
      ) {
        console.log("📥 Loading temporary ratio values in CustomRatioScreen");
        setIncludePlantMatter(tempIncludePlantMatter === "true");
        setMeatRatio(Number.parseFloat(tempMeatRatio));
        setBoneRatio(Number.parseFloat(tempBoneRatio));
        setOrganRatio(Number.parseFloat(tempOrganRatio));
        setPlantMatterRatio(
          tempPlantMatterRatio ? Number.parseFloat(tempPlantMatterRatio) : 0
        );
        return;
      }

      // Otherwise fall back to regular saved values
      const savedIncludePlantMatter = await AsyncStorage.getItem(
        "includePlantMatter"
      );
      const savedMeatRatio = await AsyncStorage.getItem("meatRatio");
      const savedBoneRatio = await AsyncStorage.getItem("boneRatio");
      const savedOrganRatio = await AsyncStorage.getItem("organRatio");
      const savedPlantMatterRatio = await AsyncStorage.getItem(
        "plantMatterRatio"
      );

      setIncludePlantMatter(savedIncludePlantMatter === "true");
      setMeatRatio(savedMeatRatio ? Number.parseFloat(savedMeatRatio) : 0);
      setBoneRatio(savedBoneRatio ? Number.parseFloat(savedBoneRatio) : 0);
      setOrganRatio(savedOrganRatio ? Number.parseFloat(savedOrganRatio) : 0);
      setPlantMatterRatio(
        savedPlantMatterRatio ? Number.parseFloat(savedPlantMatterRatio) : 0
      );
    } catch (error) {
      console.log("Failed to load saved ratios:", error);
    }
  };

  useEffect(() => {
    loadSavedRatios();
  }, []);

  const calculateTotalRatio = () => {
    return includePlantMatter
      ? meatRatio + boneRatio + organRatio + plantMatterRatio
      : meatRatio + boneRatio + organRatio;
  };

  // Update the useEffect that loads values from route params to set default values for custom ratio
  useEffect(() => {
    // Use values passed from CalculatorScreen if available
    if (route.params?.currentValues) {
      const {
        meat,
        bone,
        organ,
        plantMatter,
        includePlantMatter: includeP,
      } = route.params.currentValues;
      setMeatRatio(meat || 0);
      setBoneRatio(bone || 0);
      setOrganRatio(organ || 0);
      setPlantMatterRatio(plantMatter || 0);
      setIncludePlantMatter(includeP || false);
      setValuesModified(false); // Reset modification flag when new values are loaded
    } else {
      // Otherwise load from AsyncStorage
      loadSavedRatios();
    }
  }, [route.params?.currentValues]);

  const handleTogglePlantMatter = async (value: boolean) => {
    setIncludePlantMatter(value);
    setValuesModified(true); // Mark values as modified
    if (!value) {
      setPlantMatterRatio(0);
    } else {
      try {
        // First check for temporary values
        const tempPlantMatterRatio = await AsyncStorage.getItem(
          "tempPlantMatterRatio"
        );
        if (tempPlantMatterRatio) {
          setPlantMatterRatio(Number.parseFloat(tempPlantMatterRatio));
          return;
        }

        // Otherwise use saved values
        const savedPlantMatterRatio = await AsyncStorage.getItem(
          "plantMatterRatio"
        );
        setPlantMatterRatio(
          savedPlantMatterRatio ? Number.parseFloat(savedPlantMatterRatio) : 0
        );
      } catch (error) {
        console.log("Failed to load plant matter ratio:", error);
        setPlantMatterRatio(0);
      }
    }
  };

  // Update the handleAddRatio function to save to temporary storage
  const handleAddRatio = async () => {
    const totalRatio = calculateTotalRatio();
    const difference = totalRatio - 100;
    if (difference !== 0) {
      Alert.alert(
        "Error",
        difference > 0
          ? `You're ${difference.toFixed(
              2
            )}% over the limit. Adjust the values so the total ratio equals 100%.`
          : `You're ${Math.abs(difference).toFixed(
              2
            )}% under 100%. Add more to make the ratio total 100%.`
      );
      return;
    }

    console.log("🚀 Using custom ratio (modified: " + valuesModified + "):", {
      meatRatio,
      boneRatio,
      organRatio,
      plantMatterRatio,
      includePlantMatter,
    });

    try {
      // Always call onSave with the current values, even if they haven't been modified
      if (route.params?.onSave) {
        route.params.onSave(
          meatRatio,
          boneRatio,
          organRatio,
          plantMatterRatio,
          includePlantMatter
        );
        console.log("✅ Custom Ratio sent to CalculatorScreen via onSave!");
      } else {
        console.log("❌ No onSave callback found!");

        // Create a comprehensive batch of all ratio-related data
        const batch = [
          // Regular ratio values (used for UI display)
          ["meatRatio", meatRatio.toString()],
          ["boneRatio", boneRatio.toString()],
          ["organRatio", organRatio.toString()],
          ["plantMatterRatio", plantMatterRatio.toString()],
          ["includePlantMatter", includePlantMatter.toString()],
          ["selectedRatio", "custom"],
          ["userSelectedRatio", "true"],
          ["isCustomRatio", "true"], // Add a flag to indicate this is a custom ratio

          // Custom ratio specific keys - crucial for persistence
          ["customMeatRatio", meatRatio.toString()],
          ["customBoneRatio", boneRatio.toString()],
          ["customOrganRatio", organRatio.toString()],
          ["customPlantMatterRatio", plantMatterRatio.toString()],
          ["customIncludePlantMatter", includePlantMatter.toString()],

          // Temporary ratio values (for pending changes)
          ["tempMeatRatio", meatRatio.toString()],
          ["tempBoneRatio", boneRatio.toString()],
          ["tempOrganRatio", organRatio.toString()],
          ["tempPlantMatterRatio", plantMatterRatio.toString()],
          ["tempIncludePlantMatter", includePlantMatter.toString()],
          ["tempSelectedRatio", "custom"],
          ["tempIsCustomRatio", "true"],
        ];

        // Use Promise.all for faster parallel saving
        await Promise.all(
          batch.map(([key, value]) => AsyncStorage.setItem(key, value))
        );
      }

      // Navigate back to calculator screen
      navigation.goBack();
    } catch (error) {
      console.log("❌ Failed to save ratios:", error);
      Alert.alert("Error", "Failed to save the ratio. Please try again.");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSavedRatios();
    }, [])
  );

  const handleInputChange = (
    value: string,
    setState: React.Dispatch<React.SetStateAction<number>>
  ) => {
    setValuesModified(true); // Mark values as modified when user changes input
    const sanitizedValue = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(sanitizedValue)) {
      setState(0);
    } else {
      setState(sanitizedValue);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.customRatioTitle}>
        <Text style={styles.customRatioTitle}>Select your Custom ratio:</Text>
      </View>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Include Plant Matter</Text>
        <Switch
          value={includePlantMatter}
          onValueChange={handleTogglePlantMatter}
        />
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
                onChangeText={(value) =>
                  handleInputChange(value, setPlantMatterRatio)
                }
              />
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleAddRatio}>
        <Text style={styles.addButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF",
  },
  customRatioTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  ratioInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#000080",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CustomRatioScreen;
