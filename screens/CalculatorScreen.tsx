import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Alert, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUnit } from '../UnitContext';

type RootStackParamList = {
  FoodInputScreen: undefined;
  FoodInfoScreen: { ingredient: Ingredient; editMode: boolean };
  SearchScreen: undefined;
  CalculatorScreen: { meat: number; bone: number; organ: number; plantmatter: number };
  CustomRatioScreen: undefined; // Add this to the stack param list
};

type CalculatorScreenRouteProp = RouteProp<RootStackParamList, 'CalculatorScreen'>;

const CalculatorScreen: React.FC = () => {
  const route = useRoute<CalculatorScreenRouteProp>();
  const navigation = useNavigation();

  const [newPlantMatter, setNewPlantMatter] = useState<number>(10); // Default to 10, similar to others
  const [plantMatterCorrect, setPlantMatterCorrect] = useState<{ meat: number; bone: number; organ: number }>({ meat: 0, bone: 0, organ: 0 });
  const [includePlantMatter, setIncludePlantMatter] = useState<boolean>(false);

  const initialMeatWeight = route.params?.meat ?? 0;
  const initialBoneWeight = route.params?.bone ?? 0;
  const initialOrganWeight = route.params?.organ ?? 0;
  const initialPlantMatterWeight = route.params?.plantmatter ?? 0; // Initialize with route param
  const initialSelectedRatio = route.params?.selectedRatio ?? '80:10:10'; // ✅ Read selectedRatio
  const [userSelectedRatio, setUserSelectedRatio] = useState<boolean>(false);

  const { unit } = useUnit();

  const [newMeat, setNewMeat] = useState<number>(0);
  const [newBone, setNewBone] = useState<number>(0);
  const [newOrgan, setNewOrgan] = useState<number>(0);
  const [selectedRatio, setSelectedRatio] = useState<string>('80:10:10'); // Default is '80:10:10'
  const [customRatio, setCustomRatio] = useState<{ meat: number; bone: number; organ: number; plantMatter: number; includePlantMatter: boolean }>({
    meat: 0,
    bone: 0,
    organ: 0,
    plantMatter: 0,
    includePlantMatter: false,
  });

  const [meatCorrect, setMeatCorrect] = useState<{ bone: number; organ: number }>({ bone: 0, organ: 0 });
  const [boneCorrect, setBoneCorrect] = useState<{ meat: number; organ: number }>({ meat: 0, organ: 0 });
  const [organCorrect, setOrganCorrect] = useState<{ meat: number; bone: number }>({ meat: 0, bone: 0 });

  useEffect(() => {
    navigation.setOptions({ title: 'Calculator' });
  }, [navigation]);

  const navigateToCustomRatio = () => {
    navigation.navigate('CustomRatioScreen', {
      onSave: async (meat: number, bone: number, organ: number, plantMatter: number, includePlantMatter: boolean) => {
        console.log("📥 Received custom ratio from CustomRatioScreen:", { meat, bone, organ, plantMatter, includePlantMatter });
        
        try {
          // Save to dedicated custom ratio keys
          const keyValuePairs = [
            ['selectedRatio', 'custom'],
            ['customMeatRatio', meat.toString()],
            ['customBoneRatio', bone.toString()],
            ['customOrganRatio', organ.toString()],
            ['customPlantMatterRatio', plantMatter.toString()],
            ['includePlantMatter', includePlantMatter.toString()],
            // Also save to regular keys for compatibility
            ['meatRatio', meat.toString()],
            ['boneRatio', bone.toString()],
            ['organRatio', organ.toString()],
            ['plantMatterRatio', plantMatter.toString()]
          ];
          
          await AsyncStorage.multiSet(keyValuePairs);
          console.log("✅ Custom ratio saved to AsyncStorage");
          
          // Update state
          setCustomRatio({ meat, bone, organ, plantMatter, includePlantMatter });
          setNewMeat(meat);
          setNewBone(bone);
          setNewOrgan(organ);
          setNewPlantMatter(plantMatter);
          setIncludePlantMatter(includePlantMatter);
          setSelectedRatio('custom');
          setUserSelectedRatio(true);
          
          // Update correctors
          calculateCorrectors(
            initialMeatWeight,
            initialBoneWeight,
            initialOrganWeight,
            includePlantMatter ? initialPlantMatterWeight : 0,
            meat,
            bone,
            organ,
            plantMatter,
            includePlantMatter
          );
        } catch (error) {
          console.error("❌ Failed to save custom ratio:", error);
        }
      },
      currentValues: {
        meat: customRatio.meat || newMeat,
        bone: customRatio.bone || newBone,
        organ: customRatio.organ || newOrgan,
        plantMatter: customRatio.plantMatter || newPlantMatter,
        includePlantMatter: customRatio.includePlantMatter || includePlantMatter
      }
    });
  };
  useEffect(() => {
    if (route.params?.ratio) {
      console.log("Handling ratio from route params:", route.params.ratio);
      
      const { meat, bone, organ, selectedRatio: routeRatio } = route.params.ratio;
      
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
        ["selectedRatio", routeRatio]
      ]);
    }
  }, [route.params?.ratio]);
// Update the loadRatios function in useFocusEffect
useFocusEffect(
  React.useCallback(() => {
    const loadRatios = async () => {
      try {
        console.log("🔄 Loading ratios on focus");
        
        // If we have route params, use those values
        if (route.params?.selectedRatio) {
          console.log("📥 Loading ratio from route params:", route.params);
          
          // Parse the ratio string (e.g., "65:25:10" -> [65, 25, 10])
          const selectedRatioFromParams = route.params.selectedRatio;
          const ratioParts = selectedRatioFromParams.split(':').map(Number);
          
          const meatRatio = ratioParts[0] || 0;
          const boneRatio = ratioParts[1] || 0;
          const organRatio = ratioParts[2] || 0;
          const plantMatterRatio = ratioParts[3] || 0;
          
          console.log("📊 Parsed ratio:", { meatRatio, boneRatio, organRatio, plantMatterRatio });
          
          // Check if this is a standard ratio or custom
          const isStandardRatio = 
            selectedRatioFromParams === '80:10:10' || 
            selectedRatioFromParams === '75:15:10' || 
            selectedRatioFromParams === '70:10:10:10' || 
            selectedRatioFromParams === '65:15:10:10';
          
          // If it's not a standard ratio, mark it as custom
          setSelectedRatio(isStandardRatio ? selectedRatioFromParams : 'custom');
          
          // If it's custom, update the custom ratio state
          if (!isStandardRatio) {
            setCustomRatio({
              meat: meatRatio,
              bone: boneRatio,
              organ: organRatio,
              plantMatter: plantMatterRatio,
              includePlantMatter: plantMatterRatio > 0
            });
          }
          
          setNewMeat(meatRatio);
          setNewBone(boneRatio);
          setNewOrgan(organRatio);
          setNewPlantMatter(plantMatterRatio);
          setIncludePlantMatter(plantMatterRatio > 0);
          setUserSelectedRatio(true);
          
          return; // Exit early
        }

        const savedRatio = await AsyncStorage.getItem('selectedRatio');
        console.log("📥 Loading from AsyncStorage, selectedRatio:", savedRatio);
        
        if (savedRatio === 'custom') {
          // For custom ratio, load from dedicated custom keys
          const customMeat = Number(await AsyncStorage.getItem('customMeatRatio')) || 0;
          const customBone = Number(await AsyncStorage.getItem('customBoneRatio')) || 0;
          const customOrgan = Number(await AsyncStorage.getItem('customOrganRatio')) || 0;
          const customPlantMatter = Number(await AsyncStorage.getItem('customPlantMatterRatio')) || 0;
          const includeP = (await AsyncStorage.getItem('includePlantMatter')) === 'true';
          
          console.log("📥 Loading custom ratio:", { 
            customMeat, customBone, customOrgan, customPlantMatter, includeP 
          });
          
          // Update custom ratio state
          setCustomRatio({
            meat: customMeat,
            bone: customBone,
            organ: customOrgan,
            plantMatter: customPlantMatter,
            includePlantMatter: includeP
          });
          
          // Update main state
          setNewMeat(customMeat);
          setNewBone(customBone);
          setNewOrgan(customOrgan);
          setNewPlantMatter(customPlantMatter);
          setIncludePlantMatter(includeP);
          setSelectedRatio('custom');
        } else if (savedRatio) {
          // For predefined ratios, parse the ratio string
          if (savedRatio.includes(':')) {
            const ratioParts = savedRatio.split(':').map(Number);
            setNewMeat(ratioParts[0] || 0);
            setNewBone(ratioParts[1] || 0);
            setNewOrgan(ratioParts[2] || 0);
            setNewPlantMatter(ratioParts[3] || 0);
            setIncludePlantMatter(ratioParts.length > 3 && ratioParts[3] > 0);
          } else {
            // Fallback to saved values
            const savedMeat = Number(await AsyncStorage.getItem('meatRatio')) || 0;
            const savedBone = Number(await AsyncStorage.getItem('boneRatio')) || 0;
            const savedOrgan = Number(await AsyncStorage.getItem('organRatio')) || 0;
            const savedPlantMatter = Number(await AsyncStorage.getItem('plantMatterRatio')) || 0;
            const savedIncludePlantMatter = (await AsyncStorage.getItem('includePlantMatter')) === 'true';
            
            setNewMeat(savedMeat);
            setNewBone(savedBone);
            setNewOrgan(savedOrgan);
            setNewPlantMatter(savedPlantMatter);
            setIncludePlantMatter(savedIncludePlantMatter);
          }
          
          setSelectedRatio(savedRatio);
        } else {
          // Default values
          setSelectedRatio('80:10:10');
          setNewMeat(80);
          setNewBone(10);
          setNewOrgan(10);
          setNewPlantMatter(0);
          setIncludePlantMatter(false);
        }
      } catch (error) {
        console.log('❌ Failed to load ratios:', error);
      }
    };

    loadRatios();
  }, [route.params])
);

  useEffect(() => {
    const saveRatios = async () => {
      try {
        await AsyncStorage.setItem('meatRatio', newMeat.toString());
        await AsyncStorage.setItem('boneRatio', newBone.toString());
        await AsyncStorage.setItem('organRatio', newOrgan.toString());
        await AsyncStorage.setItem('plantMatterRatio', newPlantMatter.toString());
        await AsyncStorage.setItem('selectedRatio', selectedRatio);
        await AsyncStorage.setItem('includePlantMatter', includePlantMatter.toString());

        // Save additional data if the ratio is custom
        if (selectedRatio === 'custom') {
          await AsyncStorage.setItem('customMeatRatio', newMeat.toString());
          await AsyncStorage.setItem('customBoneRatio', newBone.toString());
          await AsyncStorage.setItem('customOrganRatio', newOrgan.toString());
          await AsyncStorage.setItem('customPlantMatterRatio', newPlantMatter.toString());
          await AsyncStorage.setItem('includePlantMatter', includePlantMatter.toString());
        }
      } catch (error) {
        console.log('Failed to save ratios:', error);
      }
    };

    if (newMeat !== null && newBone !== null && newOrgan !== null && newPlantMatter !== null) {
      saveRatios();
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
    }
  }, [newMeat, newBone, newOrgan, newPlantMatter, selectedRatio, includePlantMatter]);

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
    let meatCorrect = { bone: 0, organ: 0, plantMatter: 0 };
    let boneCorrect = { meat: 0, organ: 0, plantMatter: 0 };
    let organCorrect = { meat: 0, bone: 0, plantMatter: 0 };
    let plantMatterCorrect = { meat: 0, bone: 0, organ: 0 };

    if (includePlantMatter) {
      if (meatWeight > 0) {
        meatCorrect.bone = ((meatWeight / newMeat) * newBone) - boneWeight;
        meatCorrect.organ = ((meatWeight / newMeat) * newOrgan) - organWeight;
        meatCorrect.plantMatter = ((meatWeight / newMeat) * newPlantMatter) - plantMatterWeight;
      }

      if (boneWeight > 0) {
        boneCorrect.meat = ((boneWeight / newBone) * newMeat) - meatWeight;
        boneCorrect.organ = ((boneWeight / newBone) * newOrgan) - organWeight;
        boneCorrect.plantMatter = ((boneWeight / newBone) * newPlantMatter) - plantMatterWeight;
      }

      if (organWeight > 0) {
        organCorrect.meat = ((organWeight / newOrgan) * newMeat) - meatWeight;
        organCorrect.bone = ((organWeight / newOrgan) * newBone) - boneWeight;
        organCorrect.plantMatter = ((organWeight / newOrgan) * newPlantMatter) - plantMatterWeight;
      }

      if (plantMatterWeight > 0) {
        plantMatterCorrect.meat = ((plantMatterWeight / newPlantMatter) * newMeat) - meatWeight;
        plantMatterCorrect.bone = ((plantMatterWeight / newPlantMatter) * newBone) - boneWeight;
        plantMatterCorrect.organ = ((plantMatterWeight / newPlantMatter) * newOrgan) - organWeight;
      }
    } else {
      if (meatWeight > 0) {
        meatCorrect.bone = ((meatWeight / newMeat) * newBone) - boneWeight;
        meatCorrect.organ = ((meatWeight / newMeat) * newOrgan) - organWeight;
      }

      if (boneWeight > 0) {
        boneCorrect.meat = ((boneWeight / newBone) * newMeat) - meatWeight;
        boneCorrect.organ = ((boneWeight / newBone) * newOrgan) - organWeight;
      }

      if (organWeight > 0) {
        organCorrect.meat = ((organWeight / newOrgan) * newMeat) - meatWeight;
        organCorrect.bone = ((organWeight / newOrgan) * newBone) - boneWeight;
      }
    }

    setMeatCorrect(meatCorrect);
    setBoneCorrect(boneCorrect);
    setOrganCorrect(organCorrect);
    if (includePlantMatter) {
      setPlantMatterCorrect(plantMatterCorrect);
    }
  }

  const handleApplyRatio = () => {
    // Ensure custom ratio is saved as numbers, not "custom"
    const formattedRatio = selectedRatio === 'custom' 
      ? `${newMeat}:${newBone}:${newOrgan}${newPlantMatter > 0 ? `:${newPlantMatter}` : ''}`
      : selectedRatio;
  
    console.log("✅ Sending selected ratio to HomeTabsHome:", { 
      meat: newMeat, 
      bone: newBone, 
      organ: newOrgan, 
      plantMatter: newPlantMatter, 
      selectedRatio: formattedRatio // ✅ Now it has actual numbers!
    });
  
    navigation.navigate('HomeTabs', {
      screen: 'HomeTabsHome',
      params: {
        ratio: {
          meat: newMeat,
          bone: newBone,
          organ: newOrgan,
          plantMatter: newPlantMatter,
          selectedRatio: formattedRatio, // ✅ Now it's a proper ratio
        },
      },
    });
  };  

  const setRatio = (meat: number, bone: number, organ: number, plantMatter: number, ratio: string) => {
    console.log(`✅ Manually setting ratio: ${ratio} (Meat: ${meat}, Bone: ${bone}, Organ: ${organ}, Plant: ${plantMatter})`);
  
    // Update state values
    setNewMeat(meat);
    setNewBone(bone);
    setNewOrgan(organ);
    setNewPlantMatter(plantMatter);
    setIncludePlantMatter(plantMatter > 0);
    setSelectedRatio(ratio);
    setUserSelectedRatio(true);
  
    // Update customRatio state when 'custom' is selected
    if (ratio === 'custom') {
      setCustomRatio({
        meat,
        bone,
        organ,
        plantMatter,
        includePlantMatter: plantMatter > 0
      });
    }
  
    // Save to AsyncStorage immediately and synchronously
    (async () => {
      try {
        const batch = [
          ['meatRatio', meat.toString()],
          ['boneRatio', bone.toString()],
          ['organRatio', organ.toString()],
          ['plantMatterRatio', plantMatter.toString()],
          ['selectedRatio', ratio],
          ['includePlantMatter', (plantMatter > 0).toString()]
        ];
  
        // Use Promise.all for faster parallel saving
        await Promise.all(batch.map(([key, value]) => AsyncStorage.setItem(key, value)));
        
        console.log(`✅ Saved ratio ${ratio} to AsyncStorage`);
      } catch (error) {
        console.log('❌ Failed to save ratios:', error);
      }
    })();
  };
  
  const showInfoAlert = () => {
    Alert.alert(
      'Corrector Info',
      'The corrector values help you achieve the intended ratio. Adjust these values to match your desired meat, bone, and organ distribution.',
      [{ text: 'OK' }]
    );
  };

  useEffect(() => {
    console.log("🖥 Rerender triggered - Current displayed ratio:", {
      selectedRatio, newMeat, newBone, newOrgan, newPlantMatter, userSelectedRatio
    });
  }, [selectedRatio, newMeat, newBone, newOrgan, newPlantMatter, userSelectedRatio]);  

  const formatWeight = (value: number, ingredient: string) => {
    const formattedValue = isNaN(value) ? '0.00' : Math.abs(value).toFixed(2);
    const action = value > 0 ? 'Add' : value < 0 ? 'Remove' : 'Add';
    return `${action} ${formattedValue} ${unit} of ${ingredient}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
          <View style={styles.topBar} />

          {/* First section */}
          <View style={styles.ratioTitleContainer}>
            <Text style={styles.ratioTitle}>Select your Meat:Bone:Organ ratio</Text>
          </View>
          <View style={styles.ratioButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.ratioButton,
                selectedRatio === '80:10:10' && selectedRatio !== 'custom' && styles.selectedRatioButton,
              ]}
              onPress={() => setRatio(80, 10, 10, 0, '80:10:10')}
            >
              <Text style={[styles.ratioButtonText, selectedRatio === '80:10:10' && selectedRatio !== 'custom' && { color: 'white' }]}>
                80:10:10
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ratioButton,
                selectedRatio === '75:15:10' && selectedRatio !== 'custom' && styles.selectedRatioButton,
              ]}
              onPress={() => setRatio(75, 15, 10, 0, '75:15:10')}
            >
              <Text style={[styles.ratioButtonText, selectedRatio === '75:15:10' && selectedRatio !== 'custom' && { color: 'white' }]}>
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
                selectedRatio === '70:10:10:10' && selectedRatio !== 'custom' && styles.selectedRatioButton,
              ]}
              onPress={() => setRatio(70, 10, 10, 10, '70:10:10:10')}
            >
              <Text style={[styles.ratioButtonText, selectedRatio === '70:10:10:10' && selectedRatio !== 'custom' && { color: 'white' }]}>
                70:10:10:10
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ratioButton,
                selectedRatio === '65:15:10:10' && selectedRatio !== 'custom' && styles.selectedRatioButton,
              ]}
              onPress={() => setRatio(65, 15, 10, 10, '65:15:10:10')}
            >
              <Text style={[styles.ratioButtonText, selectedRatio === '65:15:10:10' && selectedRatio !== 'custom' && { color: 'white' }]}>
                65:15:10:10
              </Text>
            </TouchableOpacity>
          </View>

          {/* Custom Ratio Button */}
          <TouchableOpacity
            style={[
              styles.customButton,
              selectedRatio === 'custom' || 
              (selectedRatio !== '80:10:10' && 
              selectedRatio !== '75:15:10' && 
              selectedRatio !== '70:10:10:10' && 
              selectedRatio !== '65:15:10:10')
                ? styles.selectedCustomButton 
                : { backgroundColor: 'white', borderColor: 'navy' },
            ]}
            onPress={navigateToCustomRatio}
          >
            <Text style={[
              styles.customButtonText,
              selectedRatio === 'custom' || 
              (selectedRatio !== '80:10:10' && 
              selectedRatio !== '75:15:10' && 
              selectedRatio !== '70:10:10:10' && 
              selectedRatio !== '65:15:10:10')
                ? { color: 'white' } 
                : { color: 'black' }
            ]}>
              {selectedRatio === 'custom' || 
              (selectedRatio !== '80:10:10' && 
                selectedRatio !== '75:15:10' && 
                selectedRatio !== '70:10:10:10' && 
                selectedRatio !== '65:15:10:10')
                ? `${newMeat}:${newBone}:${newOrgan}${includePlantMatter ? `:${newPlantMatter}` : ''}`
                : "Custom Ratio"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyRatio}>
            <Text style={styles.applyButtonText}>Apply Ratio</Text>
          </TouchableOpacity>

          <View style={styles.correctorInfoContainer}>
            <Text style={styles.correctorInfoText}>Use the corrector to achieve the intended ratio:</Text>
            <TouchableOpacity onPress={showInfoAlert} style={styles.infoIcon}>
              <FontAwesome name="info-circle" size={20} color="#000080" />
            </TouchableOpacity>
          </View>

          <View style={styles.correctorContainer}>
            {/* Meat Corrector */}
            <View style={[styles.correctorBox, styles.meatCorrector]}>
              <Text style={styles.correctorTitle}>If Meat is correct</Text>
              <Text style={styles.correctorText}>{formatWeight(meatCorrect.bone, 'bones')}</Text>
              <Text style={styles.correctorText}>{formatWeight(meatCorrect.organ, 'organs')}</Text>
              {includePlantMatter && (
                <Text style={styles.correctorText}>{formatWeight(meatCorrect.plantMatter, 'plant matter')}</Text>
              )}
            </View>

            {/* Bone Corrector */}
            <View style={[styles.correctorBox, styles.boneCorrector]}>
              <Text style={styles.correctorTitle}>If Bone is correct</Text>
              <Text style={styles.correctorText}>{formatWeight(boneCorrect.meat, 'meat')}</Text>
              <Text style={styles.correctorText}>{formatWeight(boneCorrect.organ, 'organs')}</Text>
              {includePlantMatter && (
                <Text style={styles.correctorText}>{formatWeight(boneCorrect.plantMatter, 'plant matter')}</Text>
              )}
            </View>

            {/* Organ Corrector */}
            <View style={[styles.correctorBox, styles.organCorrector]}>
              <Text style={styles.correctorTitle}>If Organ is correct</Text>
              <Text style={styles.correctorText}>{formatWeight(organCorrect.meat, 'meat')}</Text>
              <Text style={styles.correctorText}>{formatWeight(organCorrect.bone, 'bones')}</Text>
              {includePlantMatter && (
                <Text style={styles.correctorText}>{formatWeight(organCorrect.plantMatter, 'plant matter')}</Text>
              )}
            </View>

            {/* Plant Matter Corrector */}
            {includePlantMatter && (
              <View style={[styles.correctorBox, styles.plantMatterCorrector]}>
                <Text style={styles.correctorTitle}>If Plant Matter is correct</Text>
                <Text style={styles.correctorText}>{formatWeight(plantMatterCorrect.meat, 'meat')}</Text>
                <Text style={styles.correctorText}>{formatWeight(plantMatterCorrect.bone, 'bones')}</Text>
                <Text style={styles.correctorText}>{formatWeight(plantMatterCorrect.organ, 'organs')}</Text>
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
    backgroundColor: '#FFF',
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
    fontWeight: 'bold',
    textAlign: 'left',
    flex: 1,
  },
  ratioTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 1,
  },
  ratioButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  ratioButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'white',
    borderColor: '#000080',
  },
  selectedRatioButton: {
    backgroundColor: '#000080',
    borderColor: 'green',
  },
  customButton: {
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'white',
    borderColor: '#000080',
  },
  selectedCustomButton: {
    backgroundColor: '#000080',
    borderColor: 'green',
  },
  customButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  ratioButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  applyButton: {
    backgroundColor: '#000080',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },  
  correctorInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  correctorInfoText: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    flex: 1,
  },
  correctorContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginTop: 16,
  },
  correctorBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#4747f5',
  },
  correctorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  correctorText: {
    fontSize: 14,
  },
  plantMatterCorrector: {
    borderColor: '#ff6347',
  },
});

export default CalculatorScreen;