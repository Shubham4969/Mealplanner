import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";
import { Leaf } from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";

export default function SplashScreen() {
  const { colors } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/sign-in");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.logoCircle,
          {
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Leaf
          size={58}
          color="#FFFFFF"
          strokeWidth={2}
        />
      </View>

      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        Meal Planner
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        Eat healthy, live better
      </Text>

      <View style={styles.loadingContainer}>
        <View
          style={[
            styles.loadingDot,
            {
              backgroundColor: colors.primary,
            },
          ]}
        />

        <View
          style={[
            styles.loadingDot,
            {
              backgroundColor: colors.primary,
            },
          ]}
        />

        <View
          style={[
            styles.loadingDot,
            {
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
  },

  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },

  loadingContainer: {
    flexDirection: "row",
    marginTop: 45,
    gap: 7,
  },

  loadingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});