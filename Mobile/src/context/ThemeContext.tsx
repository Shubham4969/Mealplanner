import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

/* =====================================================
   TYPES
===================================================== */

type ThemeMode = "light" | "dark";

type ThemeColors = {
  background: string;
  card: string;
  cardSecondary: string;

  text: string;
  textSecondary: string;
  textMuted: string;

  border: string;
  divider: string;

  primary: string;
  primaryLight: string;

  danger: string;
  dangerLight: string;

  input: string;
  inputBorder: string;

  iconBackground: string;

  shadow: string;
};

type ThemeContextType = {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;

  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
};

/* =====================================================
   LIGHT COLORS
===================================================== */

const lightColors: ThemeColors = {
  background: "#F7FBF7",

  card: "#FFFFFF",
  cardSecondary: "#EEF8EE",

  text: "#172033",
  textSecondary: "#718071",
  textMuted: "#A0AAA0",

  border: "#E7ECE7",
  divider: "#EEF1EE",

  primary: "#4CAF50",
  primaryLight: "#EEF8EE",

  danger: "#E05252",
  dangerLight: "#FFF1F1",

  input: "#FFFFFF",
  inputBorder: "#E7ECE7",

  iconBackground: "#EEF8EE",

  shadow: "#000000",
};

/* =====================================================
   DARK COLORS
===================================================== */

const darkColors: ThemeColors = {
  background: "#0F1410",

  card: "#182019",
  cardSecondary: "#1E2B20",

  text: "#F4F7F4",
  textSecondary: "#B3BDB4",
  textMuted: "#7F8A80",

  border: "#2A352C",
  divider: "#29342B",

  primary: "#69C96D",
  primaryLight: "#203A24",

  danger: "#FF6B6B",
  dangerLight: "#3A2020",

  input: "#182019",
  inputBorder: "#303C32",

  iconBackground: "#203A24",

  shadow: "#000000",
};

/* =====================================================
   CONTEXT
===================================================== */

const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

/* =====================================================
   PROVIDER
===================================================== */

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] =
    useState<ThemeMode>("light");

  const [loading, setLoading] =
    useState(true);

  /* ================================================
     LOAD SAVED THEME
  ================================================= */

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme =
        await AsyncStorage.getItem(
          "@meal_planner_theme"
        );

      if (savedTheme === "dark") {
        setTheme("dark");
      } else {
        setTheme("light");
      }
    } catch (error) {
      console.log(
        "Failed to load theme:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================================================
     SAVE THEME
  ================================================= */

  const saveTheme = async (
    newTheme: ThemeMode
  ) => {
    try {
      await AsyncStorage.setItem(
        "@meal_planner_theme",
        newTheme
      );
    } catch (error) {
      console.log(
        "Failed to save theme:",
        error
      );
    }
  };

  /* ================================================
     SET DARK MODE
  ================================================= */

  const setDarkMode = (value: boolean) => {
    const newTheme: ThemeMode = value
      ? "dark"
      : "light";

    setTheme(newTheme);
    saveTheme(newTheme);
  };

  /* ================================================
     TOGGLE DARK MODE
  ================================================= */

  const toggleDarkMode = () => {
    const newTheme: ThemeMode =
      theme === "dark" ? "light" : "dark";

    setTheme(newTheme);
    saveTheme(newTheme);
  };

  /* ================================================
     COLORS
  ================================================= */

  const colors =
    theme === "dark"
      ? darkColors
      : lightColors;

  /* ================================================
     LOADING
  ================================================= */

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor:
              lightColors.background,
          },
        ]}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={
            lightColors.background
          }
        />

        <ActivityIndicator
          size="large"
          color={lightColors.primary}
        />
      </View>
    );
  }

  /* ================================================
     PROVIDER
  ================================================= */

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        colors,
        toggleDarkMode,
        setDarkMode,
      }}
    >
      <StatusBar
        barStyle={
          theme === "dark"
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={colors.background}
      />

      {children}
    </ThemeContext.Provider>
  );
}

/* =====================================================
   HOOK
===================================================== */

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});