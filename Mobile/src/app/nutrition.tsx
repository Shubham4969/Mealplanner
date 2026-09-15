import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "../context/ThemeContext";

const macros = [
  {
    name: "Protein",
    value: "82",
    unit: "g",
    icon: "💪",
  },
  {
    name: "Carbs",
    value: "235",
    unit: "g",
    icon: "🌾",
  },
  {
    name: "Fat",
    value: "61",
    unit: "g",
    icon: "🥑",
  },
];

export default function NutritionScreen() {
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
        Nutrition
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        Example daily nutrition summary.
      </Text>

      <View style={styles.calorieCard}>
        <Text style={styles.label}>DAILY CALORIES</Text>

        <Text style={styles.calories}>
          1,850 kcal
        </Text>

        <View style={styles.progressBackground}>
          <View style={styles.progress} />
        </View>

        <Text style={styles.progressText}>
          1,850 of 2,200 kcal
        </Text>
      </View>

      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.text,
          },
        ]}
      >
        Macronutrients
      </Text>

      <View style={styles.grid}>
        {macros.map((macro) => (
          <View
            key={macro.name}
            style={[
              styles.macroCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.icon}>{macro.icon}</Text>

            <Text
              style={[
                styles.macroName,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {macro.name}
            </Text>

            <Text
              style={[
                styles.macroValue,
                {
                  color: colors.text,
                },
              ]}
            >
              {macro.value}
              <Text
                style={[
                  styles.unit,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                {" "}
                {macro.unit}
              </Text>
            </Text>
          </View>
        ))}
      </View>

      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.text,
          },
        ]}
      >
        Today's Analysis
      </Text>

      <View
        style={[
          styles.analysisCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <AnalysisRow
          label="Protein"
          value="Good"
          description="Protein intake is on track."
          colors={colors}
        />

        <AnalysisRow
          label="Fiber"
          value="Moderate"
          description="Consider adding more vegetables and whole grains."
          colors={colors}
        />

        <AnalysisRow
          label="Added Sugar"
          value="Low"
          description="Good control of added sugar."
          colors={colors}
          last
        />
      </View>
    </ScrollView>
  );
}

function AnalysisRow({
  label,
  value,
  description,
  colors,
  last = false,
}: {
  label: string;
  value: string;
  description: string;
  colors: any;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.analysisRow,
        !last && {
          borderBottomColor: colors.divider,
        },
        last && styles.lastAnalysisRow,
      ]}
    >
      <View style={styles.analysisHeader}>
        <Text
          style={[
            styles.analysisLabel,
            {
              color: colors.text,
            },
          ]}
        >
          {label}
        </Text>

        <Text style={styles.analysisValue}>
          {value}
        </Text>
      </View>

      <Text
        style={[
          styles.description,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {description}
      </Text>
    </View>
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
    marginTop: 7,
    marginBottom: 20,
  },

  /* ---------------- CALORIE CARD ---------------- */

  calorieCard: {
    backgroundColor: "#208AEF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },

  label: {
    color: "#DCEEFF",
    fontSize: 11,
    fontWeight: "800",
  },

  calories: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 6,
  },

  progressBackground: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    marginTop: 18,
    overflow: "hidden",
  },

  progress: {
    width: "84%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },

  progressText: {
    color: "#E8F4FF",
    fontSize: 12,
    marginTop: 8,
  },

  /* ---------------- SECTION ---------------- */

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 13,
  },

  /* ---------------- MACROS ---------------- */

  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  macroCard: {
    width: "31.5%",
    borderRadius: 17,
    padding: 13,
    borderWidth: 1,
    elevation: 1,
  },

  icon: {
    fontSize: 23,
  },

  macroName: {
    fontSize: 12,
    marginTop: 8,
  },

  macroValue: {
    fontSize: 17,
    fontWeight: "800",
    marginTop: 4,
  },

  unit: {
    fontSize: 11,
    fontWeight: "500",
  },

  /* ---------------- ANALYSIS ---------------- */

  analysisCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    elevation: 1,
  },

  analysisRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },

  lastAnalysisRow: {
    borderBottomWidth: 0,
  },

  analysisHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  analysisLabel: {
    fontSize: 15,
    fontWeight: "700",
  },

  analysisValue: {
    color: "#208AEF",
    fontSize: 13,
    fontWeight: "800",
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
});