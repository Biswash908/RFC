import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CustomRatioScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { onSave: (meat: number, bone: number, organ: number, plantMatter: number, includePlantMatter: boolean) => void } }, 'params'>>();

  // State for ratios
  const [includePlantMatter, setIncludePlantMatter] = useState(false);
  const [meatRatio, setMeatRatio] = useState<number>(0);
  const [boneRatio, setBoneRatio] = useState<number>(0);
  const [organRatio, setOrganRatio] = useState<number>(0);
  const [plantMatterRatio, setPlantMatterRatio] = useState<number>(0);
  
  const [buttonText, setButtonText] = useState('Use Ratio');
  

  // Load saved custom ratio from AsyncStorage when the component mounts
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

// Function to calculate the total ratio
const calculateTotalRatio = () => {
  return includePlantMatter
    ? meatRatio + boneRatio + organRatio + plantMatterRatio
    : meatRatio + boneRatio + organRatio;
};

const [ratio, setRatio] = useState({
  meat: 0,
  bone: 0,
  organ: 0,
  plantMatter: 0, // Add this if it doesn't exist
});

const handleTogglePlantMatter = (value: boolean) => {
  setIncludePlantMatter(value);
  if (!value) {
    setPlantMatterRatio(0);
  } else {
    const lastPlantMatterRatio = parseFloat(AsyncStorage.getItem('plantMatterRatio')) || 0;
    setPlantMatterRatio(lastPlantMatterRatio);
  }
};

// Validate ratios and handle adding ratio
const handleAddRatio = async () => {
  const totalRatio = calculateTotalRatio();
  const difference = totalRatio - 100;

  if (difference !== 0) {
    if (difference > 0) {
      Alert.alert('Error', `You’re ${difference.toFixed(2)}% over the limit. Adjust the values so the total ratio equals 100%.`);
    } else {
      Alert.alert('Error', `You’re ${Math.abs(difference).toFixed(2)}% under 100%. Add more to make the ratio total 100%.`);
    }
    return;
  } 
  

  // Save the custom ratios in AsyncStorage
  try {
    await AsyncStorage.setItem('includePlantMatter', includePlantMatter.toString());
    await AsyncStorage.setItem('meatRatio', meatRatio.toString());
    await AsyncStorage.setItem('boneRatio', boneRatio.toString());
    await AsyncStorage.setItem('organRatio', organRatio.toString());
    await AsyncStorage.setItem('plantMatterRatio', plantMatterRatio.toString());

    const ratioString = includePlantMatter
      ? `${meatRatio}:${boneRatio}:${organRatio}:${plantMatterRatio}`
      : `${meatRatio}:${boneRatio}:${organRatio}`;

    // Update the button text with the used ratio
    setButtonText(ratioString);

    // Call the onSave callback passed from CalculatorScreen and navigate back
    route.params.onSave(meatRatio, boneRatio, organRatio, includePlantMatter ? plantMatterRatio : 0, includePlantMatter);
    navigation.goBack();
  } catch (error) {
    console.log('Failed to save ratios:', error);
    Alert.alert('Error', 'Failed to save the ratio. Please try again.');
  }
};

useFocusEffect(
  React.useCallback(() => {
    // Reload saved ratios when returning to this screen
    const loadSavedRatios = async () => {
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
    };

    loadSavedRatios();
  }, [])
);

const handleInputChange = (value: string, setState: React.Dispatch<React.SetStateAction<number>>) => {
  // Allow decimal input and sanitize the input
  const sanitizedValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  if (isNaN(sanitizedValue)) {
    setState(0);  // Set to zero if input is invalid
  } else {
    setState(sanitizedValue);
  }
};

return (
  <View style={styles.container}>
    <View style={styles.customRatioTitle}>
      <Text style={styles.customRatioTitle}>Select your Custom ratio:</Text>
    </View>

    {/* Plant Matter Toggle */}
    <View style={styles.toggleContainer}>
      <Text style={styles.toggleLabel}>Include Plant Matter</Text>
      <Switch
        value={includePlantMatter}
        onValueChange={(value) => {
          setIncludePlantMatter(value);
          setPlantMatterRatio(0); // Reset plant matter ratio when toggling
        }}
      />
    </View>

    {/* Ratio Input Boxes in a 2x2 Layout */}
    <View style={styles.ratioInputContainer}>
      {/* Row 1: Meat and Bone Ratios */}
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

      {/* Row 2: Organ Ratio and Plant Matter Ratio (if included) */}
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

    {/* Add Ratio Button */}
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
