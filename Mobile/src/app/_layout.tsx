import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import {
  ThemeProvider,
  useTheme,
} from "../context/ThemeContext";

function AppNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar
        style={isDark ? "light" : "dark"}
      />

      <Stack
        screenOptions={{
          headerShown: true,

          headerStyle: {
            backgroundColor: colors.card,
          },

          headerTintColor: colors.text,

          headerTitleStyle: {
            fontWeight: "700",
            color: colors.text,
          },

          headerBackTitle: "Back",

          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="explore"
          options={{
            title: "Explore",
          }}
        />

        <Stack.Screen
          name="chat"
          options={{
            title: "Ask Meal Planner",
          }}
        />

        <Stack.Screen
          name="meal-plan"
          options={{
            title: "Meal Plan",
          }}
        />

        <Stack.Screen
          name="grocery"
          options={{
            title: "Grocery List",
          }}
        />

        <Stack.Screen
          name="pantry"
          options={{
            title: "My Pantry",
          }}
        />

        <Stack.Screen
          name="nutrition"
          options={{
            title: "Nutrition",
          }}
        />

        <Stack.Screen
          name="voice"
          options={{
            title: "Voice Assistant",
          }}
        />

        <Stack.Screen
          name="scan-pantry"
          options={{
            title: "Scan Pantry",
          }}
        />

        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="home"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="settings"
          options={{
            title: "Settings",
          }}
        />

        <Stack.Screen
          name="personal-information"
          options={{
            title: "Personal Information",
          }}
        />

        <Stack.Screen
          name="notifications"
          options={{
            title: "Notifications",
          }}
        />

        <Stack.Screen
          name="privacy-security"
          options={{
            title: "Privacy & Security",
          }}
        />

        <Stack.Screen
          name="help-support"
          options={{
            title: "Help & Support",
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}