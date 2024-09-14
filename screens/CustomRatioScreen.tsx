import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSaveContext } from '../SaveContext';

type RootStackParamList = {
  FoodInputScreen: undefined;
  FoodInfoScreen: { ingredient: Ingredient; editMode: boolean };
  SearchScreen: undefined;
  CalculatorScreen: { meat: number; bone: number; organ: number; plantmatter: number };
  CustomRatioScreen: { onSave?: (meat: number, bone: number, organ: number, plantMatter: number, includePlantMatter: boolean) => void };
};

type CustomRatioScreenRouteProp = RouteProp<RootStackParamList, 'CustomRatioScreen'>;

const CustomRatioScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<CustomRatioScreenRouteProp>();
  const { saveCustomRatios } = useSaveContext(); 
  
  const [includePlantMatter, setIncludePlantMatter] = useState(false);
  const [meatRatio, setMeatRatio] = useState<number>(0);
  const [boneRatio, setBoneRatio] = useState<number>(0);
  const [organRatio, setOrganRatio] = useState<number>(0);
  const [plantMatterRatio, setPlantMatterRatio] = useState<number>(0);
  const [buttonText, setButtonText] = useState('Use Ratio');

  useEffect(() => {
    const loadSavedRatios = async () => {
      try {
        const savedIncludePlantMatter = await AsyncStorage.getItem('includePlantMatter');
        const savedMeatRatio = await AsyncStorage.getItem('meatRatio');
        const savedBoneRatio = await AsyncStorage.getItem('boneRatio');
        const savedOrganRatio = await AsyncStorage.getItem('organRatio');
        const savedPlantMatterRatio = await AsyncStorage.getItem('plantMatterRatio');

        setIncludePlantMatter(savedIncludePlantMatter === 'true');
        setMeatRatio(savedMeatRatio ? parseFloat(savedMeatRatio) : 0);
        setBoneRatio(savedBoneRatio ? parseFloat(savedBoneRatio) : 0);
        setOrganRatio(savedOrganRatio ? parseFloat(savedOrganRatio) : 0);
        setPlantMatterRatio(savedPlantMatterRatio ? parseFloat(savedPlantMatterRatio) : 0);
      } catch (error) {
        console.log('Failed to load saved ratios:', error);
      }
    };
    loadSavedRatios();
  }, []);

  const calculateTotalRatio = () => {
    return includePlantMatter
      ? meatRatio + boneRatio + organRatio + plantMatterRatio
      : meatRatio + boneRatio + organRatio;
  };

  const handleTogglePlantMatter = async (value: boolean) => {
    setIncludePlantMatter(value);
    if (!value) {
      setPlantMatterRatio(0);
    } else {
      try {
        const savedPlantMatterRatio = await AsyncStorage.getItem('plantMatterRatio');
        setPlantMatterRatio(savedPlantMatterRatio ? parseFloat(savedPlantMatterRatio) : 0);
      } catch (error) {
        console.log('Failed to load plant matter ratio:', error);
        setPlantMatterRatio(0);
      }
    }
  };

  const handleAddRatio = async () => {
    const totalRatio = calculateTotalRatio();
    const difference = totalRatio - 100;
    if (difference !== 0) {
      Alert.alert(
        'Error',
        difference > 0
          ? `You’re ${difference.toFixed(2)}% over the limit. Adjust the values so the total ratio equals 100%.`
          : `You’re ${Math.abs(difference).toFixed(2)}% under 100%. Add more to make the ratio total 100%.`
      );
      return;
    }
  
    const saveCustomRatioAndGoBack = (meat: number, bone: number, organ: number, plantMatter: number, includePlantMatter: boolean) => {
      saveCustomRatios({ meat, bone, organ, plantMatter, includePlantMatter });
      navigation.goBack();
    };
    
    try {
      await AsyncStorage.setItem('includePlantMatter', includePlantMatter.toString());
      await AsyncStorage.setItem('meatRatio', meatRatio.toString());
      await AsyncStorage.setItem('boneRatio', boneRatio.toString());
      await AsyncStorage.setItem('organRatio', organRatio.toString());
      await AsyncStorage.setItem('plantMatterRatio', plantMatterRatio.toString());
  
      const ratioString = includePlantMatter
        ? `${meatRatio}:${boneRatio}:${organRatio}:${plantMatterRatio}`
        : `${meatRatio}:${boneRatio}:${organRatio}`;
      setButtonText(ratioString);
  
      // Call onSave callback to pass the new ratios back to CalculatorScreen
      route.params?.onSave?.(meatRatio, boneRatio, organRatio, plantMatterRatio, includePlantMatter);
      
      saveCustomRatioAndGoBack(meatRatio, boneRatio, organRatio, plantMatterRatio, includePlantMatter);
  
    } catch (error) {
      console.log('Failed to save ratios:', error);
      Alert.alert('Error', 'Failed to save the ratio. Please try again.');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadSavedRatios = async () => {
        try {
          const savedIncludePlantMatter = await AsyncStorage.getItem('includePlantMatter');
          const savedMeatRatio = await AsyncStorage.getItem('meatRatio');
          const savedBoneRatio = await AsyncStorage.getItem('boneRatio');
          const savedOrganRatio = await AsyncStorage.getItem('organRatio');
          const savedPlantMatterRatio = await AsyncStorage.getItem('plantMatterRatio');
          setIncludePlantMatter(savedIncludePlantMatter === 'true');
          setMeatRatio(savedMeatRatio ? parseFloat(savedMeatRatio) : 0);
          setBoneRatio(savedBoneRatio ? parseFloat(savedBoneRatio) : 0);
          setOrganRatio(savedOrganRatio ? parseFloat(savedOrganRatio) : 0);
          setPlantMatterRatio(savedPlantMatterRatio ? parseFloat(savedPlantMatterRatio) : 0);
        } catch (error) {
          console.log('Failed to load saved ratios:', error);
        }
      };
      loadSavedRatios();
    }, [])
  );

  const handleInputChange = (value: string, setState: React.Dispatch<React.SetStateAction<number>>) => {
    const sanitizedValue = parseFloat(value.replace(/[^0-9.]/g, ''));
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
  },
  customRatioTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratioInputContainer: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputWrapper: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratioInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#000080',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomRatioScreen;
