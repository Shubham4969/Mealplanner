import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { useTheme } from "../context/ThemeContext";
import {
  getApiErrorMessage,
  getStoredUserId,
  getNutrition,
  NutritionResponse,
} from "../services/api";

export default function NutritionScreen() {
  const { colors } = useTheme();

  const [nutrition, setNutrition] = useState<NutritionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");


const loadNutrition = useCallback(async () => {
  try {
    setError("");

    // Get the currently signed-in user's ID
    const userId = await getStoredUserId();

    // Load nutrition for this user only
    const response = await getNutrition(userId);

    console.log("🥗 Nutrition response:", response);

    setNutrition(response);
  } catch (err) {
    console.error("❌ Nutrition load error:", err);
    setError(getApiErrorMessage(err));
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);


  useFocusEffect(
    useCallback(() => {
      loadNutrition();
    }, [loadNutrition])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNutrition();
  };

  if (loading) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color="#208AEF" />
        <Text
          style={[
            styles.loadingText,
            { color: colors.textSecondary },
          ]}
        >
          Loading nutrition...
        </Text>
      </View>
    );
  }

  if (!nutrition) {
    return (
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
        contentContainerStyle={styles.centerContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Unable to load nutrition
        </Text>

        <Text
          style={[
            styles.errorText,
            { color: colors.textSecondary },
          ]}
        >
          {error || "Please try again."}
        </Text>
      </ScrollView>
    );
  }

  const calories = nutrition.consumed.calories;
  const calorieTarget = nutrition.daily_target.calories;
  const calorieProgress =
    calorieTarget > 0
      ? Math.min(calories / calorieTarget, 1)
      : 0;

  const macros = [
    {
      name: "Protein",
      value: nutrition.consumed.protein,
      target: nutrition.daily_target.protein,
      unit: "g",
      icon: "💪",
    },
    {
      name: "Carbs",
      value: nutrition.consumed.carbohydrates,
      target: nutrition.daily_target.carbohydrates,
      unit: "g",
      icon: "🌾",
    },
    {
      name: "Fat",
      value: nutrition.consumed.fat,
      target: nutrition.daily_target.fat,
      unit: "g",
      icon: "🥑",
    },
  ];

  const proteinStatus = getMacroStatus(
    nutrition.consumed.protein,
    nutrition.daily_target.protein
  );

  const calorieStatus =
    calories >= calorieTarget
      ? "Target reached"
      : `${Math.max(
          0,
          Math.round(nutrition.remaining.calories)
        )} kcal remaining`;

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
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
        Today's nutrition based on meals you have consumed.
      </Text>

      <View style={styles.calorieCard}>
        <Text style={styles.label}>DAILY CALORIES</Text>

        <Text style={styles.calories}>
          {formatNumber(calories)} kcal
        </Text>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progress,
              { width: `${calorieProgress * 100}%` },
            ]}
          />
        </View>

        <Text style={styles.progressText}>
          {formatNumber(calories)} of{" "}
          {formatNumber(calorieTarget)} kcal
        </Text>

        <Text style={styles.remainingText}>
          {calorieStatus}
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
        {macros.map((macro) => {
          const progress =
            macro.target > 0
              ? Math.min(macro.value / macro.target, 1)
              : 0;

          return (
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
                {formatNumber(macro.value)}
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

              <Text
                style={[
                  styles.targetText,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                {formatNumber(macro.target)} {macro.unit} target
              </Text>

              <View style={styles.smallProgressBackground}>
                <View
                  style={[
                    styles.smallProgress,
                    { width: `${progress * 100}%` },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.text,
          },
        ]}
      >
        Remaining
      </Text>

      <View
        style={[
          styles.remainingCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <RemainingRow
          label="Calories"
          value={`${formatNumber(
            nutrition.remaining.calories
          )} kcal`}
          colors={colors}
        />

        <RemainingRow
          label="Protein"
          value={`${formatNumber(
            nutrition.remaining.protein
          )} g`}
          colors={colors}
        />

        <RemainingRow
          label="Carbs"
          value={`${formatNumber(
            nutrition.remaining.carbohydrates
          )} g`}
          colors={colors}
        />

        <RemainingRow
          label="Fat"
          value={`${formatNumber(
            nutrition.remaining.fat
          )} g`}
          colors={colors}
          last
        />
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
          value={proteinStatus}
          description={
            nutrition.consumed.protein >=
            nutrition.daily_target.protein * 0.7
              ? "Protein intake is on track."
              : "More protein may be needed to reach today's target."
          }
          colors={colors}
        />

        <AnalysisRow
          label="Calories"
          value={
            calories >= calorieTarget ? "Target reached" : "In progress"
          }
          description={
            calories >= calorieTarget
              ? "You have reached today's calorie target."
              : `${formatNumber(
                  nutrition.remaining.calories
                )} kcal remain based on the current target.`
          }
          colors={colors}
        />

        <AnalysisRow
          label="Fiber"
          value="Not available"
          description="Fiber is not included in the current meal-plan nutrition data."
          colors={colors}
          last
        />
      </View>

      {error ? (
        <Text
          style={[
            styles.footerError,
            { color: colors.textSecondary },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </ScrollView>
  );
}

function RemainingRow({
  label,
  value,
  colors,
  last = false,
}: {
  label: string;
  value: string;
  colors: any;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.remainingRow,
        !last && {
          borderBottomColor: colors.divider,
        },
        last && styles.lastRemainingRow,
      ]}
    >
      <Text
        style={[
          styles.remainingLabel,
          { color: colors.text },
        ]}
      >
        {label}
      </Text>

      <Text style={styles.remainingValue}>{value}</Text>
    </View>
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

function getMacroStatus(
  value: number,
  target: number
): string {
  if (target <= 0) {
    return "No target";
  }

  const ratio = value / target;

  if (ratio >= 0.9) {
    return "Good";
  }

  if (ratio >= 0.7) {
    return "Moderate";
  }

  return "Low";
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  centerContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  errorText: {
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
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
    lineHeight: 19,
  },

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
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },

  progressText: {
    color: "#E8F4FF",
    fontSize: 12,
    marginTop: 8,
  },

  remainingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 13,
  },

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

  targetText: {
    fontSize: 10,
    marginTop: 7,
  },

  smallProgressBackground: {
    height: 5,
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: "rgba(128,128,128,0.2)",
    overflow: "hidden",
  },

  smallProgress: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#208AEF",
  },

  remainingCard: {
    borderRadius: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    elevation: 1,
    marginBottom: 25,
  },

  remainingRow: {
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },

  lastRemainingRow: {
    borderBottomWidth: 0,
  },

  remainingLabel: {
    fontSize: 14,
    fontWeight: "700",
  },

  remainingValue: {
    color: "#208AEF",
    fontSize: 14,
    fontWeight: "800",
  },

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

  footerError: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 12,
  },
});
