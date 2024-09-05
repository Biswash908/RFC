import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, Platform } from 'react-native';
import FoodInputScreen from './screens/FoodInputScreen';
import FoodInfoScreen from './screens/FoodInfoScreen';
import SearchScreen from './screens/SearchScreen';
import CalculatorScreen from './screens/CalculatorScreen';
import SettingsScreen from './screens/SettingsScreen';
import SupportScreen from './screens/SupportScreen';
import FAQScreen from './screens/FAQScreen';
import RawFeedingFAQScreen from './screens/RawFeedingFAQScreen';
import { UnitProvider } from './UnitContext';
import Svg, { Path } from 'react-native-svg'; // Import for custom icons

export type RootStackParamList = {
  FoodInputScreen: undefined;
  FoodInfoScreen: { ingredient: Ingredient; editMode: boolean };
  SearchScreen: undefined;
  CalculatorScreen: { meat: number; bone: number; organ: number };
  FAQScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Custom SVG Icon Components
const HomeIcon = ({ color }) => (
  <Svg width="35" height="42" viewBox="0 0 24 23.5" fill={color}>
  <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
</Svg>
);

const SettingsIcon = ({ color }) => (
  <Svg width="32" height="30" viewBox="0 0 24 24" fill={color}>
    <Path d="M19.14,12.94a7,7,0,0,0,.14-1,7,7,0,0,0-.14-1l2.11-1.65a.5.5,0,0,0,.12-.61l-2-3.46a.5.5,0,0,0-.6-.23l-2.49,1a6.84,6.84,0,0,0-1.7-1l-.38-2.65A.5.5,0,0,0,14,2H10a.5.5,0,0,0-.49.42L9.14,5.06a6.84,6.84,0,0,0-1.7,1l-2.49-1a.5.5,0,0,0-.6.23l-2,3.46a.5.5,0,0,0,.12.61L4.86,11a7,7,0,0,0-.14,1,7,7,0,0,0,.14,1l-2.11,1.65a.5.5,0,0,0-.12.61l2,3.46a.5.5,0,0,0,.6.23l2.49-1a6.84,6.84,0,0,0,1.7,1l.38,2.65A.5.5,0,0,0,10,22h4a.5.5,0,0,0,.49-.42l.38-2.65a6.84,6.84,0,0,0,1.7-1l2.49,1a.5.5,0,0,0,.6-.23l2-3.46a.5.5,0,0,0-.12-.61ZM12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
  </Svg>
);

const SupportIcon = ({ color }) => (
  <Svg width="32" height="29" viewBox="0 0 24 22" fill={color}>
    <Path d="M12 2C6.48 2 2 6.48 2 12v5c0 1.65 1.35 3 3 3h1c1.1 0 2-.9 2-2v-3c0-1.1-.9-2-2-2H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-1c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h1c1.65 0 3-1.35 3-3v-5c0-5.52-4.48-10-10-10z" />
  </Svg>
);

const HomeTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTabsHome"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let IconComponent;
          let label;

          if (route.name === 'HomeTabsHome') {
            IconComponent = HomeIcon;
            label = 'Home';
          } else if (route.name === 'Settings') {
            IconComponent = SettingsIcon;
            label = 'Settings';
          } else if (route.name === 'Support') {
            IconComponent = SupportIcon;
            label = 'Support';
          }

          return (
            <View style={{ alignItems: 'center', justifyContent: 'flex-end', height: 50 }}>
              {/* Align the icon */}
              <View style={{ height: 32, justifyContent: 'center' }}>
                <IconComponent color={focused ? 'white' : 'white'} />
              </View>
              {/* Align the label */}
              <Text style={{ color: focused ? 'white' : 'white', fontSize: 12, marginTop: 0 }}>{label}</Text>
            </View>
          );
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#000080',
          paddingVertical: 0,
          height: Platform.OS === 'ios' ? 70 : 60, // Adjust height for platform differences
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
