import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, Platform } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'; // Import FontAwesome6 for icons
import FoodInputScreen from './screens/FoodInputScreen';
import FoodInfoScreen from './screens/FoodInfoScreen';
import SearchScreen from './screens/SearchScreen';
import CalculatorScreen from './screens/CalculatorScreen';
import SettingsScreen from './screens/SettingsScreen';
import SupportScreen from './screens/SupportScreen';
import FAQScreen from './screens/FAQScreen';
import CustomRatioScreen from './screens/CustomRatioScreen';
import RawFeedingFAQScreen from './screens/RawFeedingFAQScreen';
import InfoAndSupportScreen from './screens/InfoAndSupportScreen';
import RecipeScreen from './screens/RecipeScreen';
import { UnitProvider } from './UnitContext';
import { SaveProvider } from './SaveContext';

// Define the stack's parameter list
export type RootStackParamList = {
  FoodInputScreen: undefined;
  FoodInfoScreen: { ingredient: Ingredient; editMode: boolean };
  SearchScreen: undefined;
  CalculatorScreen: { meat: number; bone: number; organ: number };
  FAQScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTabsHome"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName;
          let label;

          if (route.name === 'HomeTabsHome') {
            iconName = 'house'; // FontAwesome6 icon for Home
            label = 'Home';
          } else if (route.name === 'Recipe') {
            iconName = 'book'; // FontAwesome6 icon for Recipes
            label = 'Recipes';
          } else if (route.name === 'InfoAndSupport') {
            iconName = 'gear'; // FontAwesome6 icon for Support
            label = 'Support';
          }

          return (
            <View style={{ alignItems: 'center', justifyContent: 'center', height: 50 }}>
              <FontAwesome6
                name={iconName}
                size={28}
                color="white"
                style={{ textAlign: 'center' }}
              />
              <Text style={{ color: 'white', fontSize: 12 }}>{label}</Text>
            </View>
          );
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#000080',
          paddingVertical: 5,
          height: Platform.OS === 'ios' ? 70 : 60,
        },
      })}
    >
      <Tab.Screen
        name="InfoAndSupport"
        component={InfoAndSupportScreen}
        options={{
          title: 'Support',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTitleStyle: {
            fontSize: 25,
            fontWeight: '600',
            color: 'black',
          },
        }}
      />
      <Tab.Screen
        name="HomeTabsHome"
        component={FoodInputScreen}
        options={{
          title: 'Raw Feeding Calculator',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#000080',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: 'white',
          },
          headerShown: false, // Optional: to hide the top header for the Home screen
        }}
      />
      <Tab.Screen
        name="Recipe"
        component={RecipeScreen}
        options={{
          title: 'Recipes',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTitleStyle: {
            fontSize: 25,
            fontWeight: '600',
            color: 'black',
          },
        }}
      />
    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  return (
    <UnitProvider>
      <SaveProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="HomeTabs">
            <Stack.Screen
              name="HomeTabs"
              component={HomeTabs}
              options={{ headerShown: false }}
              initialParams={{ screen: 'HomeTabsHome' }}
            />
            <Stack.Screen
              name="FoodInfoScreen"
              component={FoodInfoScreen}
              options={{ title: 'Food Information' }}
            />
            <Stack.Screen
              name="SearchScreen"
              component={SearchScreen}
              options={{
                title: 'Search Ingredients',
                headerBackTitleVisible: false,
                headerBackTitle: 'Home',
              }}
            />
            <Stack.Screen
              name="CustomRatioScreen"
              options={{ title: 'Custom Ratio' }}
            >
              {props => <CustomRatioScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
            <Stack.Screen
              name="CalculatorScreen"
              component={CalculatorScreen}
              options={{
                title: 'Calculator',
                headerBackTitleVisible: false,
                headerBackTitle: 'Home',
              }}
            />
            <Stack.Screen name="SupportScreen" component={SupportScreen} />
            <Stack.Screen
              name="FAQScreen"
              component={FAQScreen}
              options={{
                title: 'App FAQs',
                headerBackTitleVisible: false,
                headerBackTitle: 'Home',
              }}
            />
            <Stack.Screen
              name="RawFeedingFAQScreen"
              component={RawFeedingFAQScreen}
              options={{
                title: 'Raw Feeding FAQs',
                headerBackTitleVisible: false,
                headerBackTitle: 'Home',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SaveProvider>
    </UnitProvider>
  );
};

export default App;
