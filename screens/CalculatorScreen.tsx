"use client";

import React, { useEffect, useState, useCallback } from "react";
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
} from "react-native";
import {
  useNavigation,
  useRoute,
  type RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUnit } from "../UnitContext";

// Define the Ingredient type
interface Ingredient {
  name: string;
  amount: number;
  unit: string;
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
  CustomRatioScreen: undefined; // Add this to the stack param list
};

type CalculatorScreenRouteProp = RouteProp<
  RootStackParamList,
  "CalculatorScreen"
>;

const CalculatorScreen: React.FC = () => {
  const route = useRoute<CalculatorScreenRouteProp>();
  const navigation = useNavigation();

  const [newPlantMatter, setNewPlantMatter] = useState<number>(10); // Default to 10, similar to others
  const [plantMatterCorrect, setPlantMatterCorrect] = useState<{
    meat: number;
    bone: number;
    organ: number;
  }>({
    meat: 0,
    bone: 0,
    organ: 0,
  });
  const [includePlantMatter, setIncludePlantMatter] = useState<boolean>(false);

  const initialMeatWeight = route.params?.meat ?? 0;
  const initialBoneWeight = route.params?.bone ?? 0;
  const initialOrganWeight = route.params?.organ ?? 0;
  const initialPlantMatterWeight = route.params?.plantmatter ?? 0; // Initialize with route param
  const initialSelectedRatio = route.params?.selectedRatio ?? "80:10:10"; // ✅ Read selectedRatio
  const [userSelectedRatio, setUserSelectedRatio] = useState<boolean>(false);

  const { unit } = useUnit();

  const [newMeat, setNewMeat] = useState<number>(0);
  const [newBone, setNewBone] = useState<number>(0);
  const [newOrgan, setNewOrgan] = useState<number>(0);
  const [selectedRatio, setSelectedRatio] = useState<string>("80:10:10"); // Default is '80:10:10'
  const [customRatio, setCustomRatio] = useState<{
    meat: number;
    bone: number;
    organ: number;
    plantMatter: number;
    includePlantMatter: boolean;
  }>({
    meat: 0,
    bone: 0,
    organ: 0,
    plantMatter: 0,
    includePlantMatter: false,
  });

  const [meatCorrect, setMeatCorrect] = useState<{
    bone: number;
    organ: number;
    plantMatter: number;
  }>({
    bone: 0,
    organ: 0,
    plantMatter: 0,
  });
  const [boneCorrect, setBoneCorrect] = useState<{
    meat: number;
    organ: number;
    plantMatter: number;
  }>({
    meat: 0,
    organ: 0,
    plantMatter: 0,
  });
  const [organCorrect, setOrganCorrect] = useState<{
    meat: number;
    bone: number;
    plantMatter: number;
  }>({
    meat: 0,
    bone: 0,
    plantMatter: 0,
  });

  useEffect(() => {
    navigation.setOptions({ title: "Calculator" });
  }, [navigation]);

  // Update the navigateToCustomRatio function to use default values for custom ratio
  const navigateToCustomRatio = async () => {
    try {
      // Mark as user-selected when navigating to custom ratio screen
      await AsyncStorage.setItem("userSelectedRatio", "true");

      // Set default values for custom ratio that are different from predefined ratios
      let customRatioValues = {
        meat: 60,
        bone: 20,
        organ: 15,
        plantMatter: 5,
        includePlantMatter: true,
      };

      // First check for temporary values
      const tempMeatRatio = await AsyncStorage.getItem("tempMeatRatio");
      const tempBoneRatio = await AsyncStorage.getItem("tempBoneRatio");
      const tempOrganRatio = await AsyncStorage.getItem("tempOrganRatio");
      const tempPlantMatterRatio = await AsyncStorage.getItem(
        "tempPlantMatterRatio"
      );
      const tempIncludePlantMatter = await AsyncStorage.getItem(
        "tempIncludePlantMatter"
      );

      // If we have temporary values, use them
      if (tempMeatRatio && tempBoneRatio && tempOrganRatio) {
        customRatioValues = {
          meat: Number(tempMeatRatio),
          bone: Number(tempBoneRatio),
          organ: Number(tempOrganRatio),
          plantMatter: Number(tempPlantMatterRatio || "0"),
          includePlantMatter: tempIncludePlantMatter === "true",
        };
        console.log(
          "📥 Loaded temporary ratio values for custom ratio:",
          customRatioValues
        );
      }
      // If selectedRatio is already "custom", load the saved custom values
      else if (selectedRatio === "custom") {
        try {
          const customMeatRatio = await AsyncStorage.getItem("customMeatRatio");
          const customBoneRatio = await AsyncStorage.getItem("customBoneRatio");
          const customOrganRatio = await AsyncStorage.getItem(
            "customOrganRatio"
          );
          const customPlantMatterRatio = await AsyncStorage.getItem(
            "customPlantMatterRatio"
          );
          const includeP = await AsyncStorage.getItem(
            "customIncludePlantMatter"
          );

          if (customMeatRatio && customBoneRatio && customOrganRatio) {
            customRatioValues = {
              meat: Number(customMeatRatio),
              bone: Number(customBoneRatio),
              organ: Number(customOrganRatio),
              plantMatter: Number(customPlantMatterRatio || "0"),
              includePlantMatter: includeP === "true",
            };
            console.log(
              "📥 Loaded custom ratio values from storage:",
              customRatioValues
            );
          }
        } catch (error) {
          console.error("Failed to load custom ratio values:", error);
        }
      }

      // Navigate to CustomRatioScreen with these values
      navigation.navigate("CustomRatioScreen", {
        onSave: (
          meat: number,
          bone: number,
          organ: number,
          plantMatter: number,
          includePlantMatter: boolean
        ) => {
          console.log("📥 Received custom ratio from CustomRatioScreen:", {
            meat,
            bone,
            organ,
            plantMatter,
            includePlantMatter,
          });

          // Use the setRatio function to ensure consistent behavior with predefined ratios
          setRatio(meat, bone, organ, plantMatter, "custom");

          // Also update the customRatio state
          setCustomRatio({
            meat,
            bone,
            organ,
            plantMatter,
            includePlantMatter,
          });
        },
        currentValues: customRatioValues,
      });
    } catch (error) {
      console.error("Failed to navigate to custom ratio screen:", error);
    }
  };

  useEffect(() => {
    if (route.params?.ratio) {
      console.log("Handling ratio from route params:", route.params.ratio);

      const {
        meat,
        bone,
        organ,
        selectedRatio: routeRatio,
      } = route.params.ratio;

      // Override any manually selected ratio
      setUserSelectedRatio(false);

      // Update state
      setNewMeat(meat);
      setNewBone(bone);
      setNewOrgan(organ);
      setSelectedRatio(routeRatio);

      // Update custom ratio if needed
      if (routeRatio === "custom") {
        setCustomRatio({
          meat: meat,
          bone: bone,
          organ: organ,
        });
      }

      // Save to AsyncStorage
      AsyncStorage.multiSet([
        ["meatRatio", meat.toString()],
        ["boneRatio", bone.toString()],
        ["organRatio", organ.toString()],
        ["selectedRatio", routeRatio],
      ]);
    }
  }, [route.params?.ratio]);

  // Update the loadRatios function to properly handle temporary ratios
  const loadRatios = useCallback(async () => {
    try {
      console.log("🔄 Loading ratios on focus");

      // First check for temporary ratio values
      const tempSelectedRatio = await AsyncStorage.getItem("tempSelectedRatio");
      const tempMeatRatio = await AsyncStorage.getItem("tempMeatRatio");
      const tempBoneRatio = await AsyncStorage.getItem("tempBoneRatio");
      const tempOrganRatio = await AsyncStorage.getItem("tempOrganRatio");
      const tempPlantMatterRatio = await AsyncStorage.getItem(
        "tempPlantMatterRatio"
      );
      const tempIncludePlantMatter = await AsyncStorage.getItem(
        "tempIncludePlantMatter"
      );

      // If we have temporary values, use them
      if (
        tempSelectedRatio &&
        tempMeatRatio &&
        tempBoneRatio &&
        tempOrganRatio
      ) {
        console.log("📥 Loading temporary ratio values:", {
          tempSelectedRatio,
          tempMeatRatio,
          tempBoneRatio,
          tempOrganRatio,
          tempPlantMatterRatio,
          tempIncludePlantMatter,
        });

        // Update all state values with the temporary ratio
        setNewMeat(Number(tempMeatRatio));
        setNewBone(Number(tempBoneRatio));
        setNewOrgan(Number(tempOrganRatio));
        setNewPlantMatter(Number(tempPlantMatterRatio || "0"));
        setIncludePlantMatter(tempIncludePlantMatter === "true");
        setSelectedRatio(tempSelectedRatio);
        setUserSelectedRatio(true);

        // If it's a custom ratio, also update the customRatio state
        if (tempSelectedRatio === "custom") {
          setCustomRatio({
            meat: Number(tempMeatRatio),
            bone: Number(tempBoneRatio),
            organ: Number(tempOrganRatio),
            plantMatter: Number(tempPlantMatterRatio || "0"),
            includePlantMatter: tempIncludePlantMatter === "true",
          });
        }

        // Calculate correctors with the loaded values
        calculateCorrectors(
          initialMeatWeight,
          initialBoneWeight,
          initialOrganWeight,
          tempIncludePlantMatter === "true" ? initialPlantMatterWeight : 0,
          Number(tempMeatRatio),
          Number(tempBoneRatio),
          Number(tempOrganRatio),
          Number(tempPlantMatterRatio || "0"),
          tempIncludePlantMatter === "true"
        );

        return; // Exit early since we found and loaded temporary values
      }

      // If no temporary values, check if there's a current recipe ID
      const currentRecipeId = await AsyncStorage.getItem("currentRecipeId");

      // If we have a current recipe ID, try to load the recipe-specific ratio
      if (currentRecipeId) {
        console.log(
          `📥 Checking for recipe-specific ratio for ${currentRecipeId}`
        );
        const recipeRatio = await AsyncStorage.getItem(
          `recipe_ratio_${currentRecipeId}`
        );

        if (recipeRatio) {
          // We found a saved ratio for this recipe
          const ratioData = JSON.parse(recipeRatio);
          console.log(
            `📥 Found saved ratio for recipe ${currentRecipeId}:`,
            ratioData
          );

          // Update all state values with the saved ratio
          setNewMeat(ratioData.meat || 0);
          setNewBone(ratioData.bone || 0);
          setNewOrgan(ratioData.organ || 0);
          setNewPlantMatter(ratioData.plantMatter || 0);
          setIncludePlantMatter(
            ratioData.plantMatter > 0 || ratioData.includePlantMatter
          );

          // IMPORTANT: Check for custom ratio first and respect it
          if (ratioData.selectedRatio === "custom") {
            setSelectedRatio("custom");
            // Update custom ratio state
            setCustomRatio({
              meat: ratioData.meat,
              bone: ratioData.bone,
              organ: ratioData.organ,
              plantMatter: ratioData.plantMatter || 0,
              includePlantMatter:
                ratioData.plantMatter > 0 || ratioData.includePlantMatter,
            });
            console.log("📥 Loaded custom ratio from recipe");
          } else if (
            ratioData.selectedRatio === "80:10:10" ||
            ratioData.selectedRatio === "75:15:10" ||
            ratioData.selectedRatio === "70:10:10:10" ||
            ratioData.selectedRatio === "65:15:10:10"
          ) {
            setSelectedRatio(ratioData.selectedRatio);
          } else {
            // If it's not a recognized ratio string, default to custom
            setSelectedRatio("custom");
            // Update custom ratio state
            setCustomRatio({
              meat: ratioData.meat,
              bone: ratioData.bone,
              organ: ratioData.organ,
              plantMatter: ratioData.plantMatter || 0,
              includePlantMatter:
                ratioData.plantMatter > 0 || ratioData.includePlantMatter,
            });
            console.log("📥 Defaulted to custom ratio for unrecognized ratio");
          }

          // Calculate correctors with the loaded values
          calculateCorrectors(
            initialMeatWeight,
            initialBoneWeight,
            initialOrganWeight,
            ratioData.plantMatter > 0 || ratioData.includePlantMatter
              ? initialPlantMatterWeight
              : 0,
            ratioData.meat,
            ratioData.bone,
            ratioData.organ,
            ratioData.plantMatter || 0,
            ratioData.plantMatter > 0 || ratioData.includePlantMatter
          );

          return; // Exit early since we found and loaded a recipe-specific ratio
        }
      }

      // If we don't have a recipe-specific ratio, fall back to the global ratio
      console.log("📥 No recipe-specific ratio found, loading global ratio");

      const savedRatio = await AsyncStorage.getItem("selectedRatio");
      const isCustomRatio = await AsyncStorage.getItem("isCustomRatio");
      console.log(
        "📥 Loading from AsyncStorage, selectedRatio:",
        savedRatio,
        "isCustomRatio:",
        isCustomRatio
      );

      // Check if we're using a custom ratio
      if (savedRatio === "custom" || isCustomRatio === "true") {
        // For custom ratio, load from dedicated custom keys
        const customMeat =
          Number(await AsyncStorage.getItem("customMeatRatio")) || 0;
        const customBone =
          Number(await AsyncStorage.getItem("customBoneRatio")) || 0;
        const customOrgan =
          Number(await AsyncStorage.getItem("customOrganRatio")) || 0;
        const customPlantMatter =
          Number(await AsyncStorage.getItem("customPlantMatterRatio")) || 0;
        const includeP =
          ((await AsyncStorage.getItem("customIncludePlantMatter")) ||
            (await AsyncStorage.getItem("includePlantMatter"))) === "true";

        console.log("📥 Loading custom ratio:", {
          customMeat,
          customBone,
          customOrgan,
          customPlantMatter,
          includeP,
        });

        // Update custom ratio state
        setCustomRatio({
          meat: customMeat,
          bone: customBone,
          organ: customOrgan,
          plantMatter: customPlantMatter,
          includePlantMatter: includeP,
        });

        // Update main state
        setNewMeat(customMeat);
        setNewBone(customBone);
        setNewOrgan(customOrgan);
        setNewPlantMatter(customPlantMatter);
        setIncludePlantMatter(includeP);
        setSelectedRatio("custom");
        setUserSelectedRatio(true);

        // Calculate correctors with the loaded values
        calculateCorrectors(
          initialMeatWeight,
          initialBoneWeight,
          initialOrganWeight,
          includeP ? initialPlantMatterWeight : 0,
          customMeat,
          customBone,
          customOrgan,
          customPlantMatter,
          includeP
        );
      } else if (savedRatio) {
        // For predefined ratios, parse the ratio string
        if (savedRatio.includes(":")) {
          const ratioParts = savedRatio.split(":").map(Number);
          setNewMeat(ratioParts[0] || 0);
          setNewBone(ratioParts[1] || 0);
          setNewOrgan(ratioParts[2] || 0);
          setNewPlantMatter(ratioParts[3] || 0);
          setIncludePlantMatter(ratioParts.length > 3 && ratioParts[3] > 0);
        } else {
          // Fallback to saved values
          const savedMeat =
            Number(await AsyncStorage.getItem("meatRatio")) || 0;
          const savedBone =
            Number(await AsyncStorage.getItem("boneRatio")) || 0;
          const savedOrgan =
            Number(await AsyncStorage.getItem("organRatio")) || 0;
          const savedPlantMatter =
            Number(await AsyncStorage.getItem("plantMatterRatio")) || 0;
          const savedIncludePlantMatter =
            (await AsyncStorage.getItem("includePlantMatter")) === "true";

          setNewMeat(savedMeat);
          setNewBone(savedBone);
          setNewOrgan(savedOrgan);
          setNewPlantMatter(savedPlantMatter);
          setIncludePlantMatter(savedIncludePlantMatter);
        }

        setSelectedRatio(savedRatio);

        // Calculate correctors with the loaded values
        calculateCorrectors(
          initialMeatWeight,
          initialBoneWeight,
          initialOrganWeight,
          includePlantMatter ? initialPlantMatterWeight : 0,
          newMeat,
          newBone,
          newOrgan,
          newPlantMatter,
          includePlantMatter
        );
      } else {
        // Default values
        setSelectedRatio("80:10:10");
        setNewMeat(80);
        setNewBone(10);
        setNewOrgan(10);
        setNewPlantMatter(0);
        setIncludePlantMatter(false);

        // Calculate correctors with default values
        calculateCorrectors(
          initialMeatWeight,
          initialBoneWeight,
          initialOrganWeight,
          0,
          80,
          10,
          10,
          0,
          false
        );
      }
    } catch (error) {
      console.log("❌ Failed to load ratios:", error);
    }
  }, [
    initialMeatWeight,
    initialBoneWeight,
    initialOrganWeight,
    initialPlantMatterWeight,
  ]);

  useFocusEffect(
    React.useCallback(() => {
      loadRatios();
    }, [loadRatios])
  );

  useEffect(() => {
    const saveRatios = async () => {
      try {
        // Save to regular storage for UI display
        await AsyncStorage.setItem("meatRatio", newMeat.toString());
        await AsyncStorage.setItem("boneRatio", newBone.toString());
        await AsyncStorage.setItem("organRatio", newOrgan.toString());
        await AsyncStorage.setItem(
          "plantMatterRatio",
          newPlantMatter.toString()
        );
        await AsyncStorage.setItem("selectedRatio", selectedRatio);
        await AsyncStorage.setItem(
          "includePlantMatter",
          includePlantMatter.toString()
        );

        // Save to temporary storage for pending changes
        await AsyncStorage.setItem("tempMeatRatio", newMeat.toString());
        await AsyncStorage.setItem("tempBoneRatio", newBone.toString());
        await AsyncStorage.setItem("tempOrganRatio", newOrgan.toString());
        await AsyncStorage.setItem(
          "tempPlantMatterRatio",
          newPlantMatter.toString()
        );
        await AsyncStorage.setItem("tempSelectedRatio", selectedRatio);
        await AsyncStorage.setItem(
          "tempIncludePlantMatter",
          includePlantMatter.toString()
        );

        // Save additional data if the ratio is custom
        if (selectedRatio === "custom") {
          await AsyncStorage.setItem("customMeatRatio", newMeat.toString());
          await AsyncStorage.setItem("customBoneRatio", newBone.toString());
          await AsyncStorage.setItem("customOrganRatio", newOrgan.toString());
          await AsyncStorage.setItem(
            "customPlantMatterRatio",
            newPlantMatter.toString()
          );
          await AsyncStorage.setItem(
            "customIncludePlantMatter",
            includePlantMatter.toString()
          );
          await AsyncStorage.setItem("isCustomRatio", "true");
        }

        // Note: We're NOT saving to recipe_ratio here anymore
        // That will only happen when the user explicitly saves the recipe
      } catch (error) {
        console.log("Failed to save ratios:", error);
      }
    };

    saveRatios();

    // Make sure correctors are calculated with the latest values
    calculateCorrectors(
      initialMeatWeight,
      initialBoneWeight,
      initialOrganWeight,
      includePlantMatter ? initialPlantMatterWeight : 0,
      newMeat,
      newBone,
      newOrgan,
      newPlantMatter,
      includePlantMatter
    );
  }, [
    newMeat,
    newBone,
    newOrgan,
    newPlantMatter,
    selectedRatio,
    includePlantMatter,
  ]);

  function calculateCorrectors(
    meatWeight: number,
    boneWeight: number,
    organWeight: number,
    plantMatterWeight: number,
    newMeat: number,
    newBone: number,
    newOrgan: number,
    newPlantMatter: number,
    includePlantMatter: boolean
  ) {
    const meatCorrect = { bone: 0, organ: 0, plantMatter: 0 };
    const boneCorrect = { meat: 0, organ: 0, plantMatter: 0 };
    const organCorrect = { meat: 0, bone: 0, plantMatter: 0 };
    const plantMatterCorrect = { meat: 0, bone: 0, organ: 0 };

    if (includePlantMatter) {
      if (meatWeight > 0) {
        meatCorrect.bone = (meatWeight / newMeat) * newBone - boneWeight;
        meatCorrect.organ = (meatWeight / newMeat) * newOrgan - organWeight;
        meatCorrect.plantMatter =
          (meatWeight / newMeat) * newPlantMatter - plantMatterWeight;
      }

      if (boneWeight > 0) {
        boneCorrect.meat = (boneWeight / newBone) * newMeat - meatWeight;
        boneCorrect.organ = (boneWeight / newBone) * newOrgan - organWeight;
        boneCorrect.plantMatter =
          (boneWeight / newBone) * newPlantMatter - plantMatterWeight;
      }

      if (organWeight > 0) {
        organCorrect.meat = (organWeight / newOrgan) * newMeat - meatWeight;
        organCorrect.bone = (organWeight / newOrgan) * newBone - boneWeight;
        organCorrect.plantMatter =
          (organWeight / newOrgan) * newPlantMatter - plantMatterWeight;
      }

      if (plantMatterWeight > 0) {
        plantMatterCorrect.meat =
          (plantMatterWeight / newPlantMatter) * newMeat - meatWeight;
        plantMatterCorrect.bone =
          (plantMatterWeight / newPlantMatter) * newBone - boneWeight;
        plantMatterCorrect.organ =
          (plantMatterWeight / newPlantMatter) * newOrgan - organWeight;
      }
    } else {
      if (meatWeight > 0) {
        meatCorrect.bone = (meatWeight / newMeat) * newBone - boneWeight;
        meatCorrect.organ = (meatWeight / newMeat) * newOrgan - organWeight;
      }

      if (boneWeight > 0) {
        boneCorrect.meat = (boneWeight / newBone) * newMeat - meatWeight;
        boneCorrect.organ = (boneWeight / newBone) * newOrgan - organWeight;
      }

      if (organWeight > 0) {
        organCorrect.meat = (organWeight / newOrgan) * newMeat - meatWeight;
        organCorrect.bone = (organWeight / newOrgan) * newBone - boneWeight;
      }
    }

    setMeatCorrect(meatCorrect);
    setBoneCorrect(boneCorrect);
    setOrganCorrect(organCorrect);
    if (includePlantMatter) {
      setPlantMatterCorrect(plantMatterCorrect);
    }
  }

  // Update the setRatio function to save to temporary storage
  const setRatio = (
    meat: number,
    bone: number,
    organ: number,
    plantMatter: number,
    ratio: string
  ) => {
    console.log(
      `✅ Manually setting ratio: ${ratio} (Meat: ${meat}, Bone: ${bone}, Organ: ${organ}, Plant: ${plantMatter})`
    );

    // Update state values
    setNewMeat(meat);
    setNewBone(bone);
    setNewOrgan(organ);
    setNewPlantMatter(plantMatter);
    setIncludePlantMatter(plantMatter > 0);
    setSelectedRatio(ratio);
    setUserSelectedRatio(true);

    // Update customRatio state when 'custom' is selected
    if (ratio === "custom") {
      setCustomRatio({
        meat,
        bone,
        organ,
        plantMatter,
        includePlantMatter: plantMatter > 0,
      });
    }
    // Save to AsyncStorage immediately and synchronously
    (async () => {
      try {
        // Format the ratio for display
        const formattedRatio =
          ratio === "custom"
            ? `${meat}:${bone}:${organ}${
                plantMatter > 0 ? `:${plantMatter}` : ""
              }`
            : ratio;

        // Create a comprehensive batch of all ratio-related data
        const batch = [
          // Regular ratio values (used for UI display)
          ["meatRatio", meat.toString()],
          ["boneRatio", bone.toString()],
          ["organRatio", organ.toString()],
          ["plantMatterRatio", plantMatter.toString()],
          ["selectedRatio", ratio],
          ["includePlantMatter", (plantMatter > 0).toString()],
          ["userSelectedRatio", "true"],

          // Temporary ratio values (for pending changes)
          ["tempMeatRatio", meat.toString()],
          ["tempBoneRatio", bone.toString()],
          ["tempOrganRatio", organ.toString()],
          ["tempPlantMatterRatio", plantMatter.toString()],
          ["tempSelectedRatio", ratio],
          ["tempIncludePlantMatter", (plantMatter > 0).toString()],
        ];

        // If it's a custom ratio, save to the custom keys as well and set the isCustomRatio flag
        if (ratio === "custom") {
          batch.push(
            ["customMeatRatio", meat.toString()],
            ["customBoneRatio", bone.toString()],
            ["customOrganRatio", organ.toString()],
            ["customPlantMatterRatio", plantMatter.toString()],
            ["customIncludePlantMatter", (plantMatter > 0).toString()],
            ["isCustomRatio", "true"],
            ["tempIsCustomRatio", "true"]
          );
        } else {
          // If it's not a custom ratio, make sure to remove the isCustomRatio flag
          batch.push(
            ["isCustomRatio", "false"],
            ["tempIsCustomRatio", "false"]
          );
        }

        // Use Promise.all for faster parallel saving
        await Promise.all(
          batch.map(([key, value]) => AsyncStorage.setItem(key, value))
        );

        console.log(`✅ Saved ratio ${formattedRatio} to AsyncStorage`);

        // Note: We're NOT saving to recipe_ratio here anymore
        // That will only happen when the user explicitly saves the recipe

        // Calculate correctors with the new values
        calculateCorrectors(
          initialMeatWeight,
          initialBoneWeight,
          initialOrganWeight,
          plantMatter > 0 ? initialPlantMatterWeight : 0,
          meat,
          bone,
          organ,
          plantMatter,
          plantMatter > 0
        );
      } catch (error) {
        console.log("❌ Failed to save ratios:", error);
        Alert.alert("Error", "Failed to save the ratio. Please try again.");
      }
    })();
  };

  // This is the original handleApplyRatio function that we need to understand
  const handleApplyRatio = () => {
    // Ensure custom ratio is saved as numbers, not "custom"
    const formattedRatio =
      selectedRatio === "custom"
        ? `${newMeat}:${newBone}:${newOrgan}${
            newPlantMatter > 0 ? `:${newPlantMatter}` : ""
          }`
        : selectedRatio;

    console.log("✅ Sending selected ratio to HomeTabsHome:", {
      meat: newMeat,
      bone: newBone,
      organ: newOrgan,
      plantMatter: newPlantMatter,
      selectedRatio: formattedRatio, // ✅ Now it has actual numbers!
      isTemporary: true, // Mark as temporary
    });

    navigation.navigate("HomeTabs", {
      screen: "HomeTabsHome",
      params: {
        ratio: {
          meat: newMeat,
          bone: newBone,
          organ: newOrgan,
          plantMatter: newPlantMatter,
          selectedRatio: formattedRatio, // ✅ Now it's a proper ratio
          isTemporary: true, // Mark as temporary
        },
      },
    });
  };

  const showInfoAlert = () => {
    Alert.alert(
      "Corrector Info",
      "The corrector values help you achieve the intended ratio. Adjust these values to match your desired meat, bone, and organ distribution.",
      [{ text: "OK" }]
    );
  };

  useEffect(() => {
    console.log("🖥 Rerender triggered - Current displayed ratio:", {
      selectedRatio,
      newMeat,
      newBone,
      newOrgan,
      newPlantMatter,
      userSelectedRatio,
    });
  }, [
    selectedRatio,
    newMeat,
    newBone,
    newOrgan,
    newPlantMatter,
    userSelectedRatio,
  ]);

  const formatWeight = (value: number, ingredient: string) => {
    const formattedValue = isNaN(value) ? "0.00" : Math.abs(value).toFixed(2);
    const action = value > 0 ? "Add" : value < 0 ? "Remove" : "Add";
    return `${action} ${formattedValue} ${unit} of ${ingredient}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <View style={styles.topBar} />

          {/* First section */}
          <View style={styles.ratioTitleContainer}>
            <Text style={styles.ratioTitle}>
              Select your Meat:Bone:Organ ratio
            </Text>
          </View>
          <View style={styles.ratioButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.ratioButton,
                selectedRatio === "80:10:10" &&
                  selectedRatio !== "custom" &&
                  styles.selectedRatioButton,
              ]}
              onPress={() => setRatio(80, 10, 10, 0, "80:10:10")}
            >
              <Text
                style={[
                  styles.ratioButtonText,
                  selectedRatio === "80:10:10" &&
                    selectedRatio !== "custom" && { color: "white" },
                ]}
              >
                80:10:10
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ratioButton,
                selectedRatio === "75:15:10" &&
                  selectedRatio !== "custom" &&
                  styles.selectedRatioButton,
              ]}
              onPress={() => setRatio(75, 15, 10, 0, "75:15:10")}
            >
              <Text
                style={[
                  styles.ratioButtonText,
                  selectedRatio === "75:15:10" &&
                    selectedRatio !== "custom" && { color: "white" },
                ]}
              >
                75:15:10
              </Text>
            </TouchableOpacity>
          </View>

          {/* Second section */}
          <View style={styles.ratioTitleContainer}>
            <Text style={styles.ratioTitle}>
              To add fruit/veg, set your Meat:Bone:Organ:Plant ratio:
            </Text>
          </View>
          <View style={styles.ratioButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.ratioButton,
                selectedRatio === "70:10:10:10" &&
                  selectedRatio !== "custom" &&
                  styles.selectedRatioButton,
              ]}
              onPress={() => setRatio(70, 10, 10, 10, "70:10:10:10")}
            >
              <Text
                style={[
                  styles.ratioButtonText,
                  selectedRatio === "70:10:10:10" &&
                    selectedRatio !== "custom" && { color: "white" },
                ]}
              >
                70:10:10:10
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ratioButton,
                selectedRatio === "65:15:10:10" &&
                  selectedRatio !== "custom" &&
                  styles.selectedRatioButton,
              ]}
              onPress={() => setRatio(65, 15, 10, 10, "65:15:10:10")}
            >
              <Text
                style={[
                  styles.ratioButtonText,
                  selectedRatio === "65:15:10:10" &&
                    selectedRatio !== "custom" && { color: "white" },
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
              selectedRatio === "custom" ||
              (selectedRatio !== "80:10:10" &&
                selectedRatio !== "75:15:10" &&
                selectedRatio !== "70:10:10:10" &&
                selectedRatio !== "65:15:10:10")
                ? styles.selectedCustomButton
                : { backgroundColor: "white", borderColor: "navy" },
            ]}
            onPress={navigateToCustomRatio}
          >
            <Text
              style={[
                styles.customButtonText,
                selectedRatio === "custom" ||
                (selectedRatio !== "80:10:10" &&
                  selectedRatio !== "75:15:10" &&
                  selectedRatio !== "70:10:10:10" &&
                  selectedRatio !== "65:15:10:10")
                  ? { color: "white" }
                  : { color: "black" },
              ]}
            >
              {selectedRatio === "custom" ||
              (selectedRatio !== "80:10:10" &&
                selectedRatio !== "75:15:10" &&
                selectedRatio !== "70:10:10:10" &&
                selectedRatio !== "65:15:10:10")
                ? `${newMeat}:${newBone}:${newOrgan}${
                    includePlantMatter ? `:${newPlantMatter}` : ""
                  }`
                : "Custom Ratio"}
            </Text>
          </TouchableOpacity>

          <View style={styles.correctorInfoContainer}>
            <Text style={styles.correctorInfoText}>
              Use the corrector to achieve the intended ratio:
            </Text>
            <TouchableOpacity onPress={showInfoAlert} style={styles.infoIcon}>
              <FontAwesome name="info-circle" size={20} color="#000080" />
            </TouchableOpacity>
          </View>

          <View style={styles.correctorContainer}>
            {/* Meat Corrector */}
            <View style={[styles.correctorBox, styles.meatCorrector]}>
              <Text style={styles.correctorTitle}>If Meat is correct</Text>
              <Text style={styles.correctorText}>
                {formatWeight(meatCorrect.bone, "bones")}
              </Text>
              <Text style={styles.correctorText}>
                {formatWeight(meatCorrect.organ, "organs")}
              </Text>
              {includePlantMatter && (
                <Text style={styles.correctorText}>
                  {formatWeight(meatCorrect.plantMatter, "plant matter")}
                </Text>
              )}
            </View>

            {/* Bone Corrector */}
            <View style={[styles.correctorBox, styles.boneCorrector]}>
              <Text style={styles.correctorTitle}>If Bone is correct</Text>
              <Text style={styles.correctorText}>
                {formatWeight(boneCorrect.meat, "meat")}
              </Text>
              <Text style={styles.correctorText}>
                {formatWeight(boneCorrect.organ, "organs")}
              </Text>
              {includePlantMatter && (
                <Text style={styles.correctorText}>
                  {formatWeight(boneCorrect.plantMatter, "plant matter")}
                </Text>
              )}
            </View>

            {/* Organ Corrector */}
            <View style={[styles.correctorBox, styles.organCorrector]}>
              <Text style={styles.correctorTitle}>If Organ is correct</Text>
              <Text style={styles.correctorText}>
                {formatWeight(organCorrect.meat, "meat")}
              </Text>
              <Text style={styles.correctorText}>
                {formatWeight(organCorrect.bone, "bones")}
              </Text>
              {includePlantMatter && (
                <Text style={styles.correctorText}>
                  {formatWeight(organCorrect.plantMatter, "plant matter")}
                </Text>
              )}
            </View>

            {/* Plant Matter Corrector */}
            {includePlantMatter && (
              <View style={[styles.correctorBox, styles.plantMatterCorrector]}>
                <Text style={styles.correctorTitle}>
                  If Plant Matter is correct
                </Text>
                <Text style={styles.correctorText}>
                  {formatWeight(plantMatterCorrect.meat, "meat")}
                </Text>
                <Text style={styles.correctorText}>
                  {formatWeight(plantMatterCorrect.bone, "bones")}
                </Text>
                <Text style={styles.correctorText}>
                  {formatWeight(plantMatterCorrect.organ, "organs")}
                </Text>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    fontSize: 18,
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
    paddingVertical: 10,
    paddingHorizontal: 20,
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
    paddingVertical: 10,
    paddingHorizontal: 50,
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
    fontSize: 16,
    fontWeight: "600",
  },
  ratioButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
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
    fontSize: 18,
    fontWeight: "bold",
  },
  correctorInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  correctorInfoText: {
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  correctorText: {
    fontSize: 14,
  },
  plantMatterCorrector: {
    borderColor: "#ff6347",
  },
});

export default CalculatorScreen;
