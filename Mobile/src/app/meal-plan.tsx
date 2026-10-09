import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  CalendarDays,
  Coffee,
  Cookie,
  Moon,
  RefreshCw,
  Utensils,
  Sun,
} from "lucide-react-native";

import { useFocusEffect } from "expo-router";

import { generateMealPlan, getMealPlan, getStoredUserId, } from "../services/api";
import { useTheme } from "../context/ThemeContext";

/* =========================================================
   TYPES
========================================================= */

interface Meal {
  meal_type: string;
  meal_name: string;
  description?: string;
  calories?: number;
  protein?: string;
  carbohydrates?: string;
  fat?: string;
}

interface MealPlanDay {
  day: number;
  date_offset: number;
  meals: Meal[];
}

interface MealPlanData {
  days: MealPlanDay[];
}

/* =========================================================
   HELPERS
========================================================= */

function parseMealPlan(response: any): MealPlanData | null {
  if (!response) {
    return null;
  }

  let raw =
    response.meal_plan_data ??
    response.meal_plan ??
    response.plan_text ??
    response.data?.meal_plan_data ??
    response.data?.meal_plan ??
    response.data?.plan_text;

  if (!raw) {
    return null;
  }

  // Already an object
  if (typeof raw === "object") {
    if (Array.isArray(raw.days)) {
      return raw;
    }

    return null;
  }

  // JSON string
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);

      if (parsed && Array.isArray(parsed.days)) {
        return parsed;
      }
    } catch (error) {
      console.error("Could not parse meal plan JSON:", error);
    }
  }

  return null;
}

/* =========================================================
   MEAL ICON
========================================================= */

function MealIcon({
  mealType,
  color,
}: {
  mealType: string;
  color: string;
}) {
  const type = mealType.toLowerCase();

  if (type.includes("breakfast")) {
    return <Coffee size={22} color={color} />;
  }

  if (type.includes("lunch")) {
    return <Sun size={22} color={color} />;
  }

  if (type.includes("snack")) {
    return <Cookie size={22} color={color} />;
  }

  if (type.includes("dinner")) {
    return <Moon size={22} color={color} />;
  }

  return <Utensils size={22} color={color} />;
}

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function MealPlanScreen() {
  const { colors } = useTheme();

  const [mealPlan, setMealPlan] = useState<MealPlanData | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingSavedPlan, setLoadingSavedPlan] = useState(true);

  const [days, setDays] = useState(1);

  /* =======================================================
     LOAD SAVED PLAN
  ======================================================= */


const loadSavedMealPlan = useCallback(async () => {
  try {
    setLoadingSavedPlan(true);

    const userId = await getStoredUserId();
    const response = await getMealPlan(userId);

    console.log("Saved meal plan:", response);

    const parsedPlan = parseMealPlan(response);

    if (parsedPlan) {
      setMealPlan(parsedPlan);

      if (parsedPlan.days?.length) {
        setDays(parsedPlan.days.length);
      }
    } else {
      setMealPlan(null);
    }
  } catch (error: any) {
    console.error("Load meal plan error:", error);
    setMealPlan(null);
  } finally {
    setLoadingSavedPlan(false);
  }
}, []);


  /* =======================================================
     RELOAD WHEN SCREEN GETS FOCUS
  ======================================================= */

  useFocusEffect(
    useCallback(() => {
      loadSavedMealPlan();
    }, [loadSavedMealPlan])
  );

  /* =======================================================
     GENERATE PLAN
  ======================================================= */


const generatePlan = async () => {
  try {
    setLoading(true);

    const userId = await getStoredUserId();
    const response = await generateMealPlan(userId, days);

    console.log("Generated meal plan:", response);

    const parsedPlan = parseMealPlan(response);

    if (parsedPlan) {
      setMealPlan(parsedPlan);
    } else {
      Alert.alert(
        "Error",
        "Meal plan was generated but could not be displayed."
      );
    }
  } catch (error: any) {
    console.error("Meal plan error:", error);

    Alert.alert(
      "Error",
      error?.message || "Failed to generate meal plan."
    );
  } finally {
    setLoading(false);
  }
};


  /* =======================================================
     RENDER MEAL CARD
  ======================================================= */

  const renderMeal = (meal: Meal, index: number) => {
    return (
      <View
        key={`${meal.meal_type}-${index}`}
        style={[
          styles.mealCard,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Meal header */}

        <View style={styles.mealHeader}>
          <View
            style={[
              styles.mealIcon,
              {
                backgroundColor: colors.primary + "20",
              },
            ]}
          >
            <MealIcon
              mealType={meal.meal_type}
              color={colors.primary}
            />
          </View>

          <View style={styles.mealHeaderText}>
            <Text
              style={[
                styles.mealType,
                { color: colors.primary },
              ]}
            >
              {meal.meal_type}
            </Text>

            <Text
              style={[
                styles.mealName,
                { color: colors.text },
              ]}
            >
              {meal.meal_name}
            </Text>
          </View>
        </View>

        {/* Description */}

        {meal.description ? (
          <Text
            style={[
              styles.description,
              { color: colors.textSecondary },
            ]}
          >
            {meal.description}
          </Text>
        ) : null}

        {/* Nutrition */}

        <View
          style={[
            styles.nutritionRow,
            {
              borderTopColor: colors.border,
            },
          ]}
        >
          {meal.calories !== undefined && (
            <View style={styles.nutritionItem}>
              <Text
                style={[
                  styles.nutritionValue,
                  { color: colors.text },
                ]}
              >
                {meal.calories}
              </Text>

              <Text
                style={[
                  styles.nutritionLabel,
                  { color: colors.textSecondary },
                ]}
              >
                kcal
              </Text>
            </View>
          )}

          {meal.protein && (
            <View style={styles.nutritionItem}>
              <Text
                style={[
                  styles.nutritionValue,
                  { color: colors.text },
                ]}
              >
                {meal.protein}
              </Text>

              <Text
                style={[
                  styles.nutritionLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Protein
              </Text>
            </View>
          )}

          {meal.carbohydrates && (
            <View style={styles.nutritionItem}>
              <Text
                style={[
                  styles.nutritionValue,
                  { color: colors.text },
                ]}
              >
                {meal.carbohydrates}
              </Text>

              <Text
                style={[
                  styles.nutritionLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Carbs
              </Text>
            </View>
          )}

          {meal.fat && (
            <View style={styles.nutritionItem}>
              <Text
                style={[
                  styles.nutritionValue,
                  { color: colors.text },
                ]}
              >
                {meal.fat}
              </Text>

              <Text
                style={[
                  styles.nutritionLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Fat
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text
              style={[
                styles.title,
                { color: colors.text },
              ]}
            >
              Meal Plan
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: colors.textSecondary },
              ]}
            >
              Personalized meals based on your profile and
              pantry
            </Text>
          </View>

          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  colors.primary + "20",
              },
            ]}
          >
            <CalendarDays
              size={26}
              color={colors.primary}
            />
          </View>
        </View>

        {/* =================================================
            DAYS SELECTOR
        ================================================= */}

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            Plan duration
          </Text>

          <View style={styles.daysRow}>
            {[1, 3, 7].map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => setDays(value)}
                style={[
                  styles.dayButton,
                  {
                    backgroundColor:
                      days === value
                        ? colors.primary
                        : colors.background,

                    borderColor:
                      days === value
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    {
                      color:
                        days === value
                          ? "#fff"
                          : colors.text,
                    },
                  ]}
                >
                  {value} {value === 1 ? "Day" : "Days"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* =================================================
            GENERATE BUTTON
        ================================================= */}

        <TouchableOpacity
          onPress={generatePlan}
          disabled={loading}
          style={[
            styles.generateButton,
            {
              backgroundColor: colors.primary,
              opacity: loading ? 0.7 : 1,
            },
          ]}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#fff" />

              <Text style={styles.generateText}>
                Creating Meal Plan...
              </Text>
            </>
          ) : (
            <>
              <RefreshCw
                size={21}
                color="#fff"
              />

              <Text style={styles.generateText}>
                Generate Meal Plan
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* =================================================
            LOADING SAVED PLAN
        ================================================= */}

        {loadingSavedPlan && !mealPlan ? (
          <View
            style={[
              styles.loadingCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />

            <Text
              style={[
                styles.loadingText,
                { color: colors.textSecondary },
              ]}
            >
              Loading your meal plan...
            </Text>
          </View>
        ) : null}

        {/* =================================================
            MEAL PLAN
        ================================================= */}

        {mealPlan?.days?.length ? (
          <View>
            {/* Plan heading */}

            <View
              style={[
                styles.planCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.planHeader}>
                <View
                  style={[
                    styles.mealIcon,
                    {
                      backgroundColor:
                        colors.primary + "20",
                    },
                  ]}
                >
                  <Utensils
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <View>
                  <Text
                    style={[
                      styles.planTitle,
                      { color: colors.text },
                    ]}
                  >
                    Your Meal Plan
                  </Text>

                  <Text
                    style={[
                      styles.planSubtitle,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {mealPlan.days.length}{" "}
                    {mealPlan.days.length === 1
                      ? "day"
                      : "days"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Each day */}

            {mealPlan.days.map((day) => (
              <View
                key={day.day}
                style={styles.daySection}
              >
                {/* Day title */}

                <View style={styles.dayTitleRow}>
                  <View
                    style={[
                      styles.dayNumber,
                      {
                        backgroundColor:
                          colors.primary,
                      },
                    ]}
                  >
                    <Text style={styles.dayNumberText}>
                      {day.day}
                    </Text>
                  </View>

                  <View>
                    <Text
                      style={[
                        styles.dayTitle,
                        { color: colors.text },
                      ]}
                    >
                      Day {day.day}
                    </Text>

                    <Text
                      style={[
                        styles.daySubtitle,
                        {
                          color:
                            colors.textSecondary,
                        },
                      ]}
                    >
                      Your personalized meals
                    </Text>
                  </View>
                </View>

                {/* Meals */}

                {day.meals?.map((meal, index) =>
                  renderMeal(meal, index)
                )}
              </View>
            ))}
          </View>
        ) : !loadingSavedPlan ? (
          /* =================================================
             EMPTY STATE
          ================================================= */

          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Utensils
              size={42}
              color={colors.primary}
            />

            <Text
              style={[
                styles.emptyTitle,
                { color: colors.text },
              ]}
            >
              No Meal Plan Yet
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              Generate a personalized meal plan using
              your profile, dietary preferences, goals,
              and pantry items.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 15,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 14,
    marginTop: 5,
    lineHeight: 20,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 14,
  },

  daysRow: {
    flexDirection: "row",
    gap: 10,
  },

  dayButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },

  dayButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  generateButton: {
    minHeight: 54,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },

  generateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  loadingCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 35,
    alignItems: "center",
    marginBottom: 20,
  },

  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },

  /* Plan heading */

  planCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 22,
  },

  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  planTitle: {
    fontSize: 20,
    fontWeight: "800",
  },

  planSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },

  mealIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Day */

  daySection: {
    marginBottom: 26,
  },

  dayTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  dayNumber: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  dayNumberText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },

  dayTitle: {
    fontSize: 20,
    fontWeight: "800",
  },

  daySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  /* Meal card */

  mealCard: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 16,
    marginBottom: 12,
  },

  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  mealHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  mealType: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  mealName: {
    fontSize: 17,
    fontWeight: "800",
    marginTop: 3,
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },

  nutritionRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 12,
    gap: 22,
  },

  nutritionItem: {
    alignItems: "flex-start",
  },

  nutritionValue: {
    fontSize: 13,
    fontWeight: "800",
  },

  nutritionLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  /* Empty */

  emptyCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 240,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 15,
  },

  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
  },
});