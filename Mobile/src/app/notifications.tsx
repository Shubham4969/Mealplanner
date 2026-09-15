import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import {
  ArrowLeft,
  Bell,
  Utensils,
  RefreshCw,
  ShoppingCart,
  Package,
  Target,
  Droplets,
  Flame,
  Sparkles,
  Lightbulb,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";

export default function NotificationsScreen() {
  const { colors } = useTheme();

  /* =========================================
     NOTIFICATION STATES
  ========================================== */

  const [mealReminders, setMealReminders] = useState(true);
  const [newMealPlan, setNewMealPlan] = useState(true);
  const [mealPlanUpdates, setMealPlanUpdates] = useState(true);

  const [groceryReminders, setGroceryReminders] = useState(true);
  const [lowPantryItems, setLowPantryItems] = useState(true);

  const [dailyGoal, setDailyGoal] = useState(true);
  const [waterReminders, setWaterReminders] = useState(false);
  const [streakReminders, setStreakReminders] = useState(true);

  const [aiMealSuggestions, setAiMealSuggestions] = useState(true);
  const [nutritionInsights, setNutritionInsights] = useState(true);

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* =========================================
            HEADER
        ========================================== */}

        <View style={styles.header}>
          <Pressable
            style={[
              styles.backButton,
              {
                backgroundColor: colors.card,
              },
            ]}
            onPress={() => router.back()}
          >
            <ArrowLeft
              size={22}
              color={colors.text}
              strokeWidth={2.2}
            />
          </Pressable>

          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Notifications
          </Text>

          <View style={styles.headerSpace} />
        </View>

        {/* =========================================
            DESCRIPTION
        ========================================== */}

        <View
          style={[
            styles.introCard,
            {
              backgroundColor: colors.primaryLight,
            },
          ]}
        >
          <View
            style={[
              styles.introIcon,
              {
                backgroundColor: colors.card,
              },
            ]}
          >
            <Bell
              size={24}
              color={colors.primary}
              strokeWidth={2}
            />
          </View>

          <View style={styles.introTextContainer}>
            <Text
              style={[
                styles.introTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Stay updated
            </Text>

            <Text
              style={[
                styles.introText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Choose which notifications you want
              to receive from Meal Planner.
            </Text>
          </View>
        </View>

        {/* =========================================
            MEAL & MEAL PLAN
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Meal & Meal Plan
        </Text>

        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <NotificationItem
            icon={
              <Utensils
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Meal Reminders"
            subtitle="Get reminders for breakfast, lunch and dinner"
            value={mealReminders}
            onValueChange={setMealReminders}
            colors={colors}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.divider,
              },
            ]}
          />

          <NotificationItem
            icon={
              <Bell
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="New Meal Plan"
            subtitle="Know when your personalized meal plan is ready"
            value={newMealPlan}
            onValueChange={setNewMealPlan}
            colors={colors}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.divider,
              },
            ]}
          />

          <NotificationItem
            icon={
              <RefreshCw
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Meal Plan Updates"
            subtitle="Get notified when your meal plan changes"
            value={mealPlanUpdates}
            onValueChange={setMealPlanUpdates}
            colors={colors}
          />
        </View>

        {/* =========================================
            GROCERY & PANTRY
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Grocery & Pantry
        </Text>

        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <NotificationItem
            icon={
              <ShoppingCart
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Grocery Reminders"
            subtitle="Reminders about items on your grocery list"
            value={groceryReminders}
            onValueChange={setGroceryReminders}
            colors={colors}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.divider,
              },
            ]}
          />

          <NotificationItem
            icon={
              <Package
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Low Pantry Items"
            subtitle="Get notified when pantry items are running low"
            value={lowPantryItems}
            onValueChange={setLowPantryItems}
            colors={colors}
          />
        </View>

        {/* =========================================
            HEALTH & GOALS
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Health & Goals
        </Text>

        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <NotificationItem
            icon={
              <Target
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Daily Goal Reminders"
            subtitle="Stay on track with your nutrition goals"
            value={dailyGoal}
            onValueChange={setDailyGoal}
            colors={colors}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.divider,
              },
            ]}
          />

          <NotificationItem
            icon={
              <Droplets
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Water Reminders"
            subtitle="Receive reminders to stay hydrated"
            value={waterReminders}
            onValueChange={setWaterReminders}
            colors={colors}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.divider,
              },
            ]}
          />

          <NotificationItem
            icon={
              <Flame
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Streak Reminders"
            subtitle="Keep your healthy eating streak going"
            value={streakReminders}
            onValueChange={setStreakReminders}
            colors={colors}
          />
        </View>

        {/* =========================================
            AI RECOMMENDATIONS
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          AI Recommendations
        </Text>

        <View
          style={[
            styles.settingsCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <NotificationItem
            icon={
              <Sparkles
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="AI Meal Suggestions"
            subtitle="Receive personalized meal recommendations"
            value={aiMealSuggestions}
            onValueChange={setAiMealSuggestions}
            colors={colors}
          />

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.divider,
              },
            ]}
          />

          <NotificationItem
            icon={
              <Lightbulb
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Nutrition Insights"
            subtitle="Get useful insights about your nutrition"
            value={nutritionInsights}
            onValueChange={setNutritionInsights}
            colors={colors}
          />
        </View>

        {/* =========================================
            INFORMATION
        ========================================== */}

        <View style={styles.infoCard}>
          <Bell
            size={18}
            color={colors.textSecondary}
            strokeWidth={2}
          />

          <Text
            style={[
              styles.infoText,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            You can change these notification
            preferences anytime.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =================================================
   NOTIFICATION ITEM
================================================= */

function NotificationItem({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  colors,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors: any;
}) {
  return (
    <View style={styles.notificationItem}>
      {/* ICON */}

      <View
        style={[
          styles.notificationIcon,
          {
            backgroundColor: colors.primaryLight,
          },
        ]}
      >
        {icon}
      </View>

      {/* TEXT */}

      <View style={styles.notificationTextContainer}>
        <Text
          style={[
            styles.notificationTitle,
            {
              color: colors.text,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.notificationSubtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>

      {/* SWITCH */}

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.border,
          true: colors.primaryLight,
        }}
        thumbColor={
          value ? colors.primary : colors.card
        }
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

/* =================================================
   STYLES
================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    marginHorizontal: 10,
  },

  headerSpace: {
    width: 42,
  },

  /* INTRO */

  introCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  introTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  introTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 3,
  },

  introText: {
    fontSize: 12,
    lineHeight: 18,
  },

  /* SECTION */

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  /* SETTINGS CARD */

  settingsCard: {
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 27,
    borderWidth: 1,

    elevation: 1,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },

  /* NOTIFICATION ITEM */

  notificationItem: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
  },

  notificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  notificationTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },

  notificationSubtitle: {
    fontSize: 11,
    lineHeight: 16,
  },

  /* DIVIDER */

  divider: {
    height: 1,
    marginLeft: 54,
  },

  /* INFO */

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    marginTop: 2,
  },

  infoText: {
    fontSize: 11,
    marginLeft: 7,
    textAlign: "center",
  },
});