if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
}
import type React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Text, View, Platform, Dimensions, StatusBar } from "react-native"
import FontAwesome6 from "react-native-vector-icons/FontAwesome6" // Import FontAwesome6 for icons
import FoodInputScreen from "./screens/FoodInputScreen"
import FoodInfoScreen from "./screens/FoodInfoScreen"
import SearchScreen from "./screens/SearchScreen"
import CalculatorScreen from "./screens/CalculatorScreen"
import FAQScreen from "./screens/FAQScreen"
import CustomRatioScreen from "./screens/CustomRatioScreen"
import RawFeedingFAQScreen from "./screens/RawFeedingFAQScreen"
import InfoAndSupportScreen from "./screens/InfoAndSupportScreen"
import RecipeScreen from "./screens/RecipeScreen"
import { UnitProvider } from "./UnitContext"
import { SaveProvider } from "./SaveContext"

// Define the ingredient type
interface Ingredient {
  name: string
  // Add other properties of Ingredient as needed
}

// Define the stack's parameter list
export type RootStackParamList = {
  FoodInputScreen: undefined
  FoodInfoScreen: { ingredient: Ingredient; editMode: boolean }
  SearchScreen: undefined
  CalculatorScreen: { meat: number; bone: number; organ: number }
  FAQScreen: undefined
}

const Stack = createStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator()

const { width: SCREEN_WIDTH } = Dimensions.get("window")
const isSmallDevice = SCREEN_WIDTH < 375
const isIOS = Platform.OS === "ios"
const scale = SCREEN_WIDTH / 375
const rs = (size: number) => Math.round(size * (isIOS ? Math.min(scale, 1.2) : scale))

// Centralized tab config
const TAB_CONFIG = [
  {
    name: "HomeTabsHome",
    label: "Home",
    icon: "house",
    component: FoodInputScreen,
    options: { headerShown: false },
  },
  {
    name: "InfoAndSupport",
    label: "Support",
    icon: "gear",
    component: InfoAndSupportScreen,
    options: {
      title: "Support",
      headerTitleAlign: "center",
      headerStyle: {
        backgroundColor: "white",
        height: isIOS && isSmallDevice ? 60 : undefined,
      },
      headerTitleStyle: {
        fontSize: isIOS ? (isSmallDevice ? 16 : 22) : rs(isSmallDevice ? 18 : 25),
        fontWeight: "600",
        color: "black",
        fontFamily: "Roboto-Medium",
      },
    },
  },
  {
    name: "Recipe",
    label: "Recipes",
    icon: "book",
    component: RecipeScreen,
    options: {
      title: "Recipes",
      headerTitleAlign: "center",
      headerStyle: {
        backgroundColor: "white",
        height: isIOS && isSmallDevice ? 60 : undefined,
      },
      headerTitleStyle: {
        fontSize: isIOS ? (isSmallDevice ? 16 : 22) : rs(isSmallDevice ? 18 : 25),
        fontWeight: "600",
        color: "black",
        fontFamily: "Roboto-Medium",
      },
    },
  },
]

const HomeTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTabsHome"
      screenOptions={({ route }) => {
        const tab = TAB_CONFIG.find(t => t.name === route.name)
        return {
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: isIOS ? (isSmallDevice ? 30 : 40) : isSmallDevice ? 40 : 50,
              }}
            >
              <FontAwesome6
                name={tab?.icon}
                size={isIOS ? (isSmallDevice ? 18 : 24) : isSmallDevice ? 22 : 26}
                color={focused ? "white" : "#cccccc"}
                style={{ textAlign: "center" }}
              />
              <Text
                style={{
                  color: "white",
                  fontSize: isIOS ? (isSmallDevice ? 8 : 10) : isSmallDevice ? 10 : 12,
                  marginTop: 0,
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
            paddingVertical: isIOS ? (isSmallDevice ? 0 : 3) : isSmallDevice ? 2 : 5,
            height: isIOS ? (isSmallDevice ? 40 : 50) : isSmallDevice ? 45 : 55,
          },
        }
      }}
    >
      {TAB_CONFIG.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={tab.options}
        />
      ))}
    </Tab.Navigator>
  )
}

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
                  fontSize: isIOS ? (isSmallDevice ? 16 : 20) : rs(isSmallDevice ? 18 : 22),
                  fontWeight: "600",
                  color: "black",
                  fontFamily: "Roboto-Medium",
                },
                headerTitleAlign: "center",
                headerStyle: {
                  height: isIOS && isSmallDevice ? 60 : undefined,
                },
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
              <Stack.Screen
                name="FoodInfoScreen"
                component={FoodInfoScreen}
                options={{ title: "Food Information" }}
              />
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
              <Stack.Screen
                name="CustomRatioScreen"
                component={CustomRatioScreen}
                options={{ title: "Custom Ratio" }}
              />
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
  )
}

export default App
