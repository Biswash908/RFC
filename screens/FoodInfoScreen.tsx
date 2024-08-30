import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useUnit } from '../UnitContext';

type RootStackParamList = {
  FoodInfoScreen: { ingredient: { id: string; name: string; meat?: number; bone?: number; organ?: number; type?: string; weight?: number, unit: 'g' | 'kg' | 'lbs' }, editMode: boolean };
  FoodInputScreen: { updatedIngredient: { id: string; name: string; meat?: number; bone?: number; organ?: number; weight: number; meatWeight?: number; boneWeight?: number; organWeight?: number; totalWeight: number, unit: 'g' | 'kg' | 'lbs' } };
};

type FoodInfoScreenRouteProp = RouteProp<RootStackParamList, 'FoodInfoScreen'>;
type FoodInfoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FoodInfoScreen'>;

type Props = {
  route: FoodInfoScreenRouteProp;
  navigation: FoodInfoScreenNavigationProp;
};

const FoodInfoScreen = ({ route, navigation }: Props) => {
  const { setUnit } = useUnit();
  const { ingredient, editMode } = route.params;
  const [weight, setWeight] = useState(ingredient.weight ? ingredient.weight.toString() : '');
  const [selectedUnit, setSelectedUnit] = useState<'g' | 'kg' | 'lbs'>(ingredient.unit || 'g');

  const convertWeight = (weight: number) => {
    switch (selectedUnit) {
      case 'kg':
        return weight;
      case 'lbs':
        return weight;
      default:
        return weight;
    }
  };

  const calculateWeight = (percentage: number) => {
    const weightNum = parseFloat(weight);
    return isNaN(weightNum) ? 0 : (weightNum * percentage) / 100;
  };

  const handleSaveIngredient = () => {
    const weightInGrams = parseFloat(weight);
    const meatWeight = ingredient.meat ? calculateWeight(ingredient.meat) : undefined;
    const boneWeight = ingredient.bone ? calculateWeight(ingredient.bone) : undefined;
    const organWeight = ingredient.organ ? calculateWeight(ingredient.organ) : undefined;
    const totalWeight = weightInGrams;

    const updatedIngredient = {
      ...ingredient,
      weight: weightInGrams,
      meatWeight,
      boneWeight,
      organWeight,
      totalWeight,
      unit: selectedUnit,
    };

    setUnit(selectedUnit);

    navigation.navigate('HomeTabs', { 
        screen: 'Home',
        params: { updatedIngredient } 
    });
  };

  const isNonMeat = ingredient.type === 'Vegetable' || ingredient.type === 'Fruit' || ingredient.type === 'Nut';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Display ingredient type and name for non-meat ingredients */}
        <Text style={styles.title}>{isNonMeat ? `${ingredient.type} - ${ingredient.name}` : ingredient.name}</Text>
        <View style={styles.underline} />
        
        <TextInput
          style={styles.input}
          placeholder={`Enter ingredient weight in ${selectedUnit}`}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
        
        <View style={styles.buttonContainer}>
          {['g', 'kg', 'lbs'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.unitButton,
                selectedUnit === item ? styles.activeUnitButton : styles.inactiveUnitButton,
              ]}
              onPress={() => setSelectedUnit(item as 'g' | 'kg' | 'lbs')}
            >
              <Text style={styles.unitButtonText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Only show meat, bone, and organ percentages if the ingredient is meat */}
        {!isNonMeat && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>Meat: {ingredient.meat}% - {convertWeight(calculateWeight(ingredient.meat!)).toFixed(2)} {selectedUnit}</Text>
            <Text style={styles.resultText}>Bone: {ingredient.bone}% - {convertWeight(calculateWeight(ingredient.bone!)).toFixed(2)} {selectedUnit}</Text>
            <Text style={styles.resultText}>Organ: {ingredient.organ}% - {convertWeight(calculateWeight(ingredient.organ!)).toFixed(2)} {selectedUnit}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSaveIngredient}
        >
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
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  underline: {
    height: 2,
    backgroundColor: 'black',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    backgroundColor: '#000080',
  },
  inactiveUnitButton: {
    backgroundColor: '#ccc',
  },
  unitButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
    backgroundColor: '#000080',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FoodInfoScreen;
