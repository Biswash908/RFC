import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import FoodInputScreen from './screens/FoodInputScreen';
import FoodInfoScreen from './screens/FoodInfoScreen';
import SearchScreen from './screens/SearchScreen';
import CalculatorScreen from './screens/CalculatorScreen';
import SettingsScreen from './screens/SettingsScreen';
import SupportScreen from './screens/SupportScreen';
import FAQScreen from './screens/FAQScreen';
import RawFeedingFAQScreen from './screens/RawFeedingFAQScreen';
import { UnitProvider } from './UnitContext';

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
  // Define sizes for each icon to ensure visual consistency
  const homeIconSize = 36; // Adjust if needed
  const settingsIconSize = 30; // Adjust if needed
  const supportIconSize = 31; // Adjust if needed

  return (
    <Tab.Navigator
      initialRouteName="HomeTabsHome"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName;
          let label;
          let iconSize;

          // Define icon name, label, and sizes for individual icons
          if (route.name === 'HomeTabsHome') {
            iconName = 'home';
            label = 'Home';
            iconSize = homeIconSize;
          } else if (route.name === 'Settings') {
            iconName = 'info';
            label = 'Info';
            iconSize = settingsIconSize;
          } else if (route.name === 'Support') {
            iconName = 'headset';
            label = 'Support';
            iconSize = supportIconSize;
          }

          return (
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 35,
                  height: 35,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <MaterialIcons name={iconName} size={iconSize} color={'white'} />
              </View>
              <Text style={{ color: 'white', fontSize: 12 }}>{label}</Text>
            </View>
          );
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#000080',
          paddingVertical: 10,
          height: 70,
        },
      })}
    >
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
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
        }}
      />
      <Tab.Screen
        name="Support"
        component={SupportScreen}
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
    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  return (
    <UnitProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="HomeTabs">
          <Stack.Screen
            name="HomeTabs"
            component={HomeTabs}
            options={{ headerShown: false }}
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
              headerBackTitleVisible: false, // Hides the text next to the back arrow
            }}
          />
          <Stack.Screen name="CalculatorScreen" component={CalculatorScreen} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
          <Stack.Screen name="SupportScreen" component={SupportScreen} />
          <Stack.Screen 
            name="FAQScreen" 
            component={FAQScreen}
            options={{ title: 'App FAQs' }} 
          />
          <Stack.Screen 
            name="RawFeedingFAQScreen" 
            component={RawFeedingFAQScreen}
            options={{title: 'Raw Feeding FAQs'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UnitProvider>
  );
};

export default App;
