import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUnit } from '../UnitContext';

type RootStackParamList = {
  FoodInputScreen: undefined;
  FoodInfoScreen: { ingredient: Ingredient; editMode: boolean };
  SearchScreen: undefined;
  CalculatorScreen: { meat: number; bone: number; organ: number; plantMatter: number };
};

type CalculatorScreenRouteProp = RouteProp<RootStackParamList, 'CalculatorScreen'>;

const CalculatorScreen: React.FC = () => {
  const route = useRoute<CalculatorScreenRouteProp>();
  const navigation = useNavigation();

  const [newPlantMatter, setNewPlantMatter] = useState<number>(10); // Default to 10, similar to others
  const [plantMatterCorrect, setPlantMatterCorrect] = useState<{ meat: number; bone: number; organ: number }>({
    meat: 0,
    bone: 0,
    organ: 0,
  });
  const [includePlantMatter, setIncludePlantMatter] = useState<boolean>(false);

  const initialMeatWeight = route.params?.meat ?? 0;
  const initialBoneWeight = route.params?.bone ?? 0;
  const initialOrganWeight = route.params?.organ ?? 0;
  const initialPlantMatterWeight = route.params?.plantMatter ?? 0; // Initialize with route param

  const { unit } = useUnit();

  const [newMeat, setNewMeat] = useState<number>(80);
  const [newBone, setNewBone] = useState<number>(10);
  const [newOrgan, setNewOrgan] = useState<number>(10);

  const [selectedRatio, setSelectedRatio] = useState<string>('80:10:10');

  const [meatCorrect, setMeatCorrect] = useState<{ bone: number; organ: number }>({ bone: 0, organ: 0 });
  const [boneCorrect, setBoneCorrect] = useState<{ meat: number; organ: number }>({ meat: 0, organ: 0 });
  const [organCorrect, setOrganCorrect] = useState<{ meat: number; bone: number }>({ meat: 0, bone: 0 });

  useEffect(() => {
    navigation.setOptions({ title: 'Calculator' });
  }, [navigation]);

  useEffect(() => {
    const loadRatios = async () => {
      try {
        const savedMeat = await AsyncStorage.getItem('meatRatio');
        const savedBone = await AsyncStorage.getItem('boneRatio');
        const savedOrgan = await AsyncStorage.getItem('organRatio');
        const savedPlantMatter = await AsyncStorage.getItem('plantMatterRatio'); // Load plant matter ratio
        const savedRatio = await AsyncStorage.getItem('selectedRatio');

        setNewMeat(savedMeat ? Number(savedMeat) : 80);
        setNewBone(savedBone ? Number(savedBone) : 10);
        setNewOrgan(savedOrgan ? Number(savedOrgan) : 10);
        setNewPlantMatter(savedPlantMatter ? Number(savedPlantMatter) : 10); // Initialize correctly

        if (savedRatio) {
          setSelectedRatio(savedRatio);
          setIncludePlantMatter(savedRatio.split(':').length === 4); // True if the ratio has 4 parts (including plant matter)
        } else {
          setSelectedRatio('80:10:10');
          setIncludePlantMatter(false);
        }
      } catch (error) {
        console.log('Failed to load ratios:', error);
        setNewMeat(80);
        setNewBone(10);
        setNewOrgan(10);
        setNewPlantMatter(10);
        setIncludePlantMatter(false);
      }
    };
    loadRatios();
  }, []);

  useEffect(() => {
    const saveRatios = async () => {
      try {
        await AsyncStorage.setItem('meatRatio', newMeat.toString());
        await AsyncStorage.setItem('boneRatio', newBone.toString());
        await AsyncStorage.setItem('organRatio', newOrgan.toString());
        await AsyncStorage.setItem('plantMatterRatio', newPlantMatter.toString()); // Save plant matter ratio
        await AsyncStorage.setItem('selectedRatio', selectedRatio);
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
        includePlantMatter ? initialPlantMatterWeight : 0
      );
    }
  }, [newMeat, newBone, newOrgan, newPlantMatter, selectedRatio, includePlantMatter]);

  const calculateCorrectors = (
    meatWeight: number,
    boneWeight: number,
    organWeight: number,
    plantMatterWeight: number = 0
  ) => {
    // Reset all correctors to 0 initially
    setMeatCorrect({ bone: 0, organ: 0 });
    setBoneCorrect({ meat: 0, organ: 0 });
    setOrganCorrect({ meat: 0, bone: 0 });
    setPlantMatterCorrect({ meat: 0, bone: 0, organ: 0 });

    if (selectedRatio.split(':').length === 3) {
      // 3-part ratios (Meat, Bone, Organ)

      // Meat Corrector
      if (meatWeight > 0) {
        const bone = (meatWeight / newMeat) * newBone - boneWeight;
        const organ = (meatWeight / newMeat) * newOrgan - organWeight;
        setMeatCorrect({
          bone: isNaN(bone) ? 0 : parseFloat(bone.toFixed(2)),
          organ: isNaN(organ) ? 0 : parseFloat(organ.toFixed(2)),
        });
      }

      // Bone Corrector
      if (boneWeight > 0) {
        const meat = (boneWeight / newBone) * newMeat - meatWeight;
        const organ = (boneWeight / newBone) * newOrgan - organWeight;
        setBoneCorrect({
          meat: isNaN(meat) ? 0 : parseFloat(meat.toFixed(2)),
          organ: isNaN(organ) ? 0 : parseFloat(organ.toFixed(2)),
        });
      }

      // Organ Corrector
      if (organWeight > 0) {
        const meat = (organWeight / newOrgan) * newMeat - meatWeight;
        const bone = (organWeight / newOrgan) * newBone - boneWeight;
        setOrganCorrect({
          meat: isNaN(meat) ? 0 : parseFloat(meat.toFixed(2)),
          bone: isNaN(bone) ? 0 : parseFloat(bone.toFixed(2)),
        });
      }

      // No Plant Matter corrector needed for 3-part ratios
      setPlantMatterCorrect({ meat: 0, bone: 0, organ: 0 });
    } else if (selectedRatio.split(':').length === 4) {
      // 4-part ratios (Meat, Bone, Organ, Plant Matter)

      // Meat Corrector
      if (meatWeight > 0) {
        const bone = (meatWeight / newMeat) * newBone - boneWeight;
        const organ = (meatWeight / newMeat) * newOrgan - organWeight;
        const plant = (meatWeight / newMeat) * newPlantMatter - plantMatterWeight;
        setMeatCorrect({
          bone: isNaN(bone) ? 0 : parseFloat(bone.toFixed(2)),
          organ: isNaN(organ) ? 0 : parseFloat(organ.toFixed(2)),
        });
        setPlantMatterCorrect((prevState) => ({
          ...prevState,
          meat: isNaN(plant) ? 0 : parseFloat(plant.toFixed(2)),
        }));
      }

      // Bone Corrector
      if (boneWeight > 0) {
        const meat = (boneWeight / newBone) * newMeat - meatWeight;
        const organ = (boneWeight / newBone) * newOrgan - organWeight;
        const plant = (boneWeight / newBone) * newPlantMatter - plantMatterWeight;
        setBoneCorrect({
          meat: isNaN(meat) ? 0 : parseFloat(meat.toFixed(2)),
          organ: isNaN(organ) ? 0 : parseFloat(organ.toFixed(2)),
        });
        setPlantMatterCorrect((prevState) => ({
          ...prevState,
          bone: isNaN(plant) ? 0 : parseFloat(plant.toFixed(2)),
        }));
      }

      // Organ Corrector
      if (organWeight > 0) {
        const meat = (organWeight / newOrgan) * newMeat - meatWeight;
        const bone = (organWeight / newOrgan) * newBone - boneWeight;
        const plant = (organWeight / newOrgan) * newPlantMatter - plantMatterWeight;
        setOrganCorrect({
          meat: isNaN(meat) ? 0 : parseFloat(meat.toFixed(2)),
          bone: isNaN(bone) ? 0 : parseFloat(bone.toFixed(2)),
        });
        setPlantMatterCorrect((prevState) => ({
          ...prevState,
          organ: isNaN(plant) ? 0 : parseFloat(plant.toFixed(2)),
        }));
      }

      // Plant Matter Corrector
      if (plantMatterWeight > 0) {
        const meat = (plantMatterWeight / newPlantMatter) * newMeat - meatWeight;
        const bone = (plantMatterWeight / newPlantMatter) * newBone - boneWeight;
        const organ = (plantMatterWeight / newPlantMatter) * newOrgan - organWeight;
        setPlantMatterCorrect({
          meat: isNaN(meat) ? 0 : parseFloat(meat.toFixed(2)),
          bone: isNaN(bone) ? 0 : parseFloat(bone.toFixed(2)),
          organ: isNaN(organ) ? 0 : parseFloat(organ.toFixed(2)),
        });
      }
    }
  };

  const formatWeight = (value: number, component: string): string => {
    if (value === 0) return `Add 0.00 g of ${component}`;
    if (value > 0) return `Add ${value.toFixed(2)} g of ${component}`;
    return `Remove ${Math.abs(value).toFixed(2)} g of ${component}`;
  };

  const handleSaveRatios = () => {
    Alert.alert('Ratios Saved', `Meat: ${newMeat}%, Bone: ${newBone}%, Organ: ${newOrgan}%`);
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <ScrollView>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Adjust Ratios</Text>
              <TouchableOpacity onPress={handleSaveRatios}>
                <FontAwesome name="save" size={24} color="green" />
              </TouchableOpacity>
            </View>

            {/* Corrector Boxes */}
            <View style={styles.correctorContainer}>
              {/* Meat Corrector */}
              <View style={[styles.correctorBox, styles.meatCorrector]}>
                <Text style={styles.correctorTitle}>If Meat is correct</Text>
                <Text style={styles.correctorText}>{formatWeight(meatCorrect.bone, 'bones')}</Text>
                <Text style={styles.correctorText}>{formatWeight(meatCorrect.organ, 'organs')}</Text>
                {includePlantMatter && (
                  <Text style={styles.correctorText}>{formatWeight(plantMatterCorrect.meat, 'plant matter')}</Text>
                )}
              </View>

              {/* Bone Corrector */}
              <View style={[styles.correctorBox, styles.boneCorrector]}>
                <Text style={styles.correctorTitle}>If Bone is correct</Text>
                <Text style={styles.correctorText}>{formatWeight(boneCorrect.meat, 'meat')}</Text>
                <Text style={styles.correctorText}>{formatWeight(boneCorrect.organ, 'organs')}</Text>
                {includePlantMatter && (
                  <Text style={styles.correctorText}>{formatWeight(plantMatterCorrect.bone, 'plant matter')}</Text>
                )}
              </View>

              {/* Organ Corrector */}
              <View style={[styles.correctorBox, styles.organCorrector]}>
                <Text style={styles.correctorTitle}>If Organ is correct</Text>
                <Text style={styles.correctorText}>{formatWeight(organCorrect.meat, 'meat')}</Text>
                <Text style={styles.correctorText}>{formatWeight(organCorrect.bone, 'bones')}</Text>
                {includePlantMatter && (
                  <Text style={styles.correctorText}>{formatWeight(plantMatterCorrect.organ, 'plant matter')}</Text>
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
    borderColor: 'blue',
  },
  selectedRatioButton: {
    backgroundColor: '#000080',
    borderColor: 'green',
  },
  customButton: {
    alignSelf: 'center',
    marginTop: 5,
    marginBottom: 20,
    borderWidth: 1,
    marginRight: 25,
    backgroundColor: 'white',
    borderColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
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
