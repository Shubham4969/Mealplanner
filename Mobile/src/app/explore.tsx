import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "../context/ThemeContext";

const features = [
  {
    title: "Personalized Meal Plans",
    description:
      "Create meal plans based on your preferences, goals, budget and pantry.",
    icon: "🍽️",
    route: "/meal-plan" as const,
  },
  {
    title: "Nutrition Analysis",
    description:
      "Understand calories, protein, carbohydrates and fats.",
    icon: "🥗",
    route: "/nutrition" as const,
  },
  {
    title: "Pantry Management",
    description:
      "Add, remove and check ingredients available at home.",
    icon: "🥫",
    route: "/pantry" as const,
  },
  {
    title: "Grocery Planning",
    description:
      "Generate a shopping list from your meal plan and pantry.",
    icon: "🛒",
    route: "/grocery" as const,
  },
  {
    title: "Voice Assistant",
    description:
      "Speak naturally with your Meal Planner assistant.",
    icon: "🎙️",
    route: "/voice" as const,
  },
  {
    title: "Scan Pantry",
    description:
      "Use your camera to identify pantry ingredients.",
    icon: "📷",
    route: "/scan-pantry" as const,
  },
];

export default function ExploreScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      contentContainerStyle={styles.content}
    >
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        Explore
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        Everything you need for smarter meal planning.
      </Text>

      {features.map((feature) => (
        <Pressable
          key={feature.title}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            pressed && styles.pressed,
          ]}
          onPress={() => router.push(feature.route as any)}
        >
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: colors.primaryLight,
              },
            ]}
          >
            <Text style={styles.icon}>{feature.icon}</Text>
          </View>

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.cardTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {feature.title}
            </Text>

            <Text
              style={[
                styles.cardDescription,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {feature.description}
            </Text>
          </View>

          <Text
            style={[
              styles.arrow,
              {
                color: colors.primary,
              },
            ]}
          >
            ›
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    marginTop: 20,
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 22,
  },

  card: {
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
  },

  pressed: {
    opacity: 0.7,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 26,
  },

  textContainer: {
    flex: 1,
    marginLeft: 14,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
  },

  cardDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  arrow: {
    fontSize: 28,
    marginLeft: 8,
  },
});