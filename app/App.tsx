import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, StyleSheet } from "react-native";

import HomeScreen from "./screens/HomeScreen";
import RecipeScreen from "./screens/RecipeScreen";
import CookScreen from "./screens/CookScreen";
import ShoppingScreen from "./screens/ShoppingScreen";
import RecipeLibraryScreen from "./screens/RecipeLibraryScreen";
import PlanWeekScreen from "./screens/PlanWeekScreen";
import CookLauncherScreen from "./screens/CookLauncherScreen";
import ProfileScreen from "./screens/ProfileScreen";
import MyLibraryScreen from "./screens/MyLibraryScreen";

// Stack navigator for Recipe flow
const RecipeStack = createNativeStackNavigator();
function RecipeStackScreen() {
  return (
    <RecipeStack.Navigator screenOptions={{ headerShown: false }}>
      <RecipeStack.Screen name="CookLauncher" component={CookLauncherScreen} />
      <RecipeStack.Screen name="RecipeHome" component={RecipeScreen} />
      <RecipeStack.Screen name="Cook" component={CookScreen} />
      <RecipeStack.Screen name="RecipeLibrary" component={RecipeLibraryScreen} />
      <RecipeStack.Screen name="MyLibrary" component={MyLibraryScreen} />
      <RecipeStack.Screen name="PlanWeek" component={PlanWeekScreen} />
      <RecipeStack.Screen name="Profile" component={ProfileScreen} />
    </RecipeStack.Navigator>
  );
}

// Main tab navigator
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator 
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => {
            let emoji = '';
            if (route.name === 'Home') emoji = '🏠';
            else if (route.name === 'Cook') emoji = '👨‍🍳';
            else if (route.name === 'Shopping') emoji = '🛒';
            return <Text style={styles.tabIcon}>{emoji}</Text>;
          },
          tabBarActiveTintColor: '#FF8C42',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: styles.tabBar,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen 
          name="Cook" 
          component={RecipeStackScreen}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Prevent default behavior
              e.preventDefault();
              // Always navigate to CookLauncher
              navigation.navigate('Cook', { screen: 'CookLauncher' });
            },
          })}
        />
        <Tab.Screen name="Shopping" component={ShoppingScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 24,
  },
  tabBar: {
    backgroundColor: '#FFF8E7',
    borderTopColor: '#87CEEB',
    borderTopWidth: 2,
    paddingTop: 8,
    paddingBottom: 8,
    height: 64,
  },
});
