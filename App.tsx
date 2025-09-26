import type React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, Platform, Dimensions, StatusBar } from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FoodInputScreen from "./screens/FoodInputScreen";
import FoodInfoScreen from "./screens/FoodInfoScreen";
import SearchScreen from "./screens/SearchScreen";
import CalculatorScreen from "./screens/CalculatorScreen";
import FAQScreen from "./screens/FAQScreen";
import CustomRatioScreen from "./screens/CustomRatioScreen";
import RawFeedingFAQScreen from "./screens/RawFeedingFAQScreen";
import InfoAndSupportScreen from "./screens/InfoAndSupportScreen";
import RecipeScreen from "./screens/RecipeScreen";

import { UnitProvider } from "./UnitContext";
import { SaveProvider } from "./SaveContext";

// Define the ingredient type
interface Ingredient {
  name: string;
  // Add other properties of Ingredient as needed
}

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

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isSmallDevice = SCREEN_WIDTH < 375;
const isIOS = Platform.OS === "ios";
const scale = SCREEN_WIDTH / 375;
const rs = (size: number) => Math.round(size * (isIOS ? Math.min(scale, 1.2) : scale));

// Centralized tab config
const TAB_CONFIG = [
  {
    name: "InfoAndSupport",
    label: "Support",
    icon: "gear",
    component: InfoAndSupportScreen,
    options: {
      title: "Support",
      headerTitleAlign: "center",
      headerStyle: { backgroundColor: "white" },
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: "600",
        color: "black",
        fontFamily: "Roboto-Medium",
      },
    },
  },
  {
    name: "HomeTabsHome",
    label: "Home",
    icon: "house",
    component: FoodInputScreen,
    options: { headerShown: false },
  },
  {
    name: "Recipe",
    label: "Recipes",
    icon: "book",
    component: RecipeScreen,
    options: {
      title: "Recipes",
      headerTitleAlign: "center",
      headerStyle: { backgroundColor: "white" },
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: "600",
        color: "black",
        fontFamily: "Roboto-Medium",
      },
    },
  },
];

const HomeTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="HomeTabsHome"
      screenOptions={({ route }) => {
        const tab = TAB_CONFIG.find((t) => t.name === route.name);

        return {
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 4 }}>
              <FontAwesome6
                name={tab?.icon}
                size={rs(22)}
                color="white"
                style={{ textAlign: "center" }}
              />
              <Text
                style={{
                  color: "white",
                  fontSize: 10,
                  marginTop: 2,
                  fontFamily: "Roboto-Regular",
                }}
              >
                {tab?.label}
              </Text>
            </View>
          ),
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#000080",
            height: 60 + insets.bottom, // responsive height
            paddingBottom: insets.bottom, // safe area for iPhone notch / Android
            paddingTop: 6,
          },
        };
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} options={tab.options} />
      ))}
    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <UnitProvider>
        <SaveProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            <Stack.Navigator
              initialRouteName="HomeTabs"
              screenOptions={{
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: "600",
                  color: "black",
                  fontFamily: "Roboto-Medium",
                },
                headerTitleAlign: "center",
                headerBackTitle: "Back",
                headerBackTitleVisible: false,
              }}
            >
              <Stack.Screen
                name="HomeTabs"
                component={HomeTabs}
                options={{ headerShown: false }}
                initialParams={{ screen: "HomeTabsHome" }}
              />
              <Stack.Screen name="FoodInfoScreen" component={FoodInfoScreen} options={{ title: "Food Information" }} />
              <Stack.Screen
                name="SearchScreen"
                component={SearchScreen}
                options={{
                  title: "Search Ingredients",
                  headerBackTitleVisible: false,
                  headerBackTitle: "Home",
                }}
              />
              <Stack.Screen
                name="CalculatorScreen"
                component={CalculatorScreen}
                options={{
                  title: "Calculator",
                  headerBackTitleVisible: false,
                  headerBackTitle: "Home",
                }}
              />
              <Stack.Screen name="CustomRatioScreen" component={CustomRatioScreen} options={{ title: "Custom Ratio" }} />
              <Stack.Screen name="InfoAndSupportScreen" component={InfoAndSupportScreen} />
              <Stack.Screen name="RecipeScreen" component={RecipeScreen} />
              <Stack.Screen
                name="FAQScreen"
                component={FAQScreen}
                options={{
                  title: "App FAQs",
                  headerBackTitleVisible: false,
                  headerBackTitle: "Home",
                }}
              />
              <Stack.Screen
                name="RawFeedingFAQScreen"
                component={RawFeedingFAQScreen}
                options={{
                  title: "Raw Feeding FAQs",
                  headerBackTitleVisible: false,
                  headerBackTitle: "Home",
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SaveProvider>
      </UnitProvider>
    </View>
  );
};

export default App;
