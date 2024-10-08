import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Alert, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSaveContext } from '../SaveContext';  // Only import useSaveContext here
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
  const { customRatios, saveCustomRatios } = useSaveContext();  // Correct usage of useSaveContext
  const navigation = useNavigation();

  const navigateToCustomRatio = () => {
    navigation.navigate('CustomRatioScreen');
  };

  const [newPlantMatter, setNewPlantMatter] = useState<number>(10); // Default to 10, similar to others
  const [plantMatterCorrect, setPlantMatterCorrect] = useState<{ meat: number; bone: number; organ: number }>({ meat: 0, bone: 0, organ: 0 });
  const [includePlantMatter, setIncludePlantMatter] = useState<boolean>(false);

  const initialMeatWeight = route.params?.meat ?? 0;
  const initialBoneWeight = route.params?.bone ?? 0;
  const initialOrganWeight = route.params?.organ ?? 0;
  const initialPlantMatterWeight = route.params?.plantmatter ?? 0; // Initialize with route param

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

  useFocusEffect(
    React.useCallback(() => {
      const loadRatios = async () => {
        try {
          const savedMeat = route.params?.meatRatio ?? (await AsyncStorage.getItem('meatRatio'));
          const savedBone = route.params?.boneRatio ?? (await AsyncStorage.getItem('boneRatio'));
          const savedOrgan = route.params?.organRatio ?? (await AsyncStorage.getItem('organRatio'));
          const savedPlantMatter = route.params?.plantMatterRatio ?? (await AsyncStorage.getItem('plantMatterRatio'));
          const savedRatio = await AsyncStorage.getItem('selectedRatio');
          const savedIncludePlantMatter = await AsyncStorage.getItem('includePlantMatter');

          if (savedRatio === 'custom') {
            setCustomRatio({
              meat: Number(savedMeat) || 0,
              bone: Number(savedBone) || 0,
              organ: Number(savedOrgan) || 0,
              plantMatter: Number(savedPlantMatter) || 0,
              includePlantMatter: savedIncludePlantMatter === 'true',
            });
            setSelectedRatio('custom');
            setIncludePlantMatter(savedIncludePlantMatter === 'true');
            setNewMeat(Number(savedMeat) || 0);
            setNewBone(Number(savedBone) || 0);
            setNewOrgan(Number(savedOrgan) || 0);
            setNewPlantMatter(Number(savedPlantMatter) || 0);
          } else if (savedRatio) {
            setSelectedRatio(savedRatio);
            setIncludePlantMatter(savedIncludePlantMatter === 'true');
            setNewMeat(Number(savedMeat) || 0);
            setNewBone(Number(savedBone) || 0);
            setNewOrgan(Number(savedOrgan) || 0);
            setNewPlantMatter(Number(savedPlantMatter) || 0);
          } else {
            setSelectedRatio('80:10:10');
            setIncludePlantMatter(false);
            setNewMeat(80);
            setNewBone(10);
            setNewOrgan(10);
            setNewPlantMatter(0);
          }
        } catch (error) {
          console.log('Failed to load ratios:', error);
          setNewMeat(80);
          setNewBone(10);
          setNewOrgan(10);
          setNewPlantMatter(0);
          setIncludePlantMatter(false);
        }
      };

      loadRatios();
    }, [route.params])
  );

  useFocusEffect(
    React.useCallback(() => {
      if (customRatios) {
        setNewMeat(customRatios.meat);
        setNewBone(customRatios.bone);
        setNewOrgan(customRatios.organ);
        setNewPlantMatter(customRatios.plantMatter);
        setIncludePlantMatter(customRatios.includePlantMatter);
        setSelectedRatio('custom');
      }
    }, [customRatios])
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

  const setRatio = (meat: number, bone: number, organ: number, plantMatter: number, ratio: string) => {
    setNewMeat(meat);
    setNewBone(bone);
    setNewOrgan(organ);
    setNewPlantMatter(plantMatter);
    
    // Determine includePlantMatter based on actual plant matter value
    const plantMatterIncluded = plantMatter > 0;
    setIncludePlantMatter(plantMatterIncluded);
    
    setSelectedRatio(ratio);

    if (ratio === 'custom') {
        setCustomRatio({ meat, bone, organ, plantMatter, includePlantMatter: plantMatterIncluded });
        
        // Save custom ratio in AsyncStorage
        AsyncStorage.setItem('meatRatio', meat.toString());
        AsyncStorage.setItem('boneRatio', bone.toString());
        AsyncStorage.setItem('organRatio', organ.toString());
        AsyncStorage.setItem('plantMatterRatio', plantMatter.toString());
        AsyncStorage.setItem('selectedRatio', 'custom');
        AsyncStorage.setItem('includePlantMatter', plantMatterIncluded.toString());
    } else {
        AsyncStorage.setItem('selectedRatio', ratio);
    }

    calculateCorrectors(
        initialMeatWeight,
        initialBoneWeight,
        initialOrganWeight,
        plantMatterIncluded ? initialPlantMatterWeight : 0,
        meat,
        bone,
        organ,
        plantMatter,
        plantMatterIncluded
    );
};


  const showInfoAlert = () => {
    Alert.alert(
      'Corrector Info',
      'The corrector values help you achieve the intended ratio. Adjust these values to match your desired meat, bone, and organ distribution.',
      [{ text: 'OK' }]
    );
  };

  const formatWeight = (value: number, ingredient: string) => {
    const formattedValue = isNaN(value) ? '0.00' : Math.abs(value).toFixed(2);
    const action = value > 0 ? 'Add' : value < 0 ? 'Remove' : 'Add';
    return `${action} ${formattedValue} ${unit} of ${ingredient}`;
  };

  const displayCustomRatio = customRatios.includePlantMatter
    ? `${customRatios.meat}:${customRatios.bone}:${customRatios.organ}:${customRatios.plantMatter}`
    : `${customRatios.meat}:${customRatios.bone}:${customRatios.organ}`;


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
              selectedRatio === 'custom' ? styles.selectedCustomButton : { backgroundColor: 'white', borderColor: 'navy' },
            ]}
            onPress={navigateToCustomRatio}
          >
            <Text style={[
              styles.customButtonText,
              selectedRatio === 'custom' ? { color: 'white' } : { color: 'black' }
            ]}>
              {selectedRatio === 'custom' ? displayCustomRatio : "Custom Ratio"}
            </Text>
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
