import React from "react";

import {
  Alert,
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
  ChevronRight,
  CircleHelp,
  FileText,
  Lock,
  LogOut,
  Moon,
  Shield,
  Smartphone,
  User,
  Utensils,
  Info,
  Trash2,
  Download,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";

/* =====================================================
   MAIN SETTINGS
===================================================== */

export default function SettingsScreen() {
  const {
    colors,
    isDark,
    setDarkMode,
  } = useTheme();

  /* ===================================================
     LOGOUT
  =================================================== */

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            router.replace("/sign-in");
          },
        },
      ]
    );
  };

  /* ===================================================
     DELETE ACCOUNT
  =================================================== */

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. Your account and associated data will be permanently deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Coming Soon",
              "Account deletion will be connected to the backend later."
            );
          },
        },
      ]
    );
  };

  /* ===================================================
     DOWNLOAD DATA
  =================================================== */

  const handleDownloadData = () => {
    Alert.alert(
      "Download My Data",
      "Your personal data export will be available after the backend is connected."
    );
  };

  /* ===================================================
     TERMS
  =================================================== */

  const handleTerms = () => {
    Alert.alert(
      "Terms & Conditions",
      "Terms & Conditions page will be added here."
    );
  };

  /* ===================================================
     ABOUT
  =================================================== */

  const handleAbout = () => {
    Alert.alert(
      "Meal Planner",
      "Meal Planner\n\nEat healthy, live better.\n\nVersion 1.0.0"
    );
  };

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
        {/* ==========================================
            HEADER
        =========================================== */}

        <View style={styles.header}>
          <Pressable
            style={[
              styles.backButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
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
            Settings
          </Text>

          <View style={styles.headerSpace} />
        </View>

        {/* ==========================================
            ACCOUNT
        =========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Account
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <SettingItem
            colors={colors}
            icon={
              <User
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Personal Information"
            subtitle="Manage your personal details"
            onPress={() =>
              router.push("/personal-information")
            }
          />

          <Divider colors={colors} />

          <SettingItem
            colors={colors}
            icon={
              <Lock
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Privacy & Security"
            subtitle="Password, privacy and security"
            onPress={() =>
              router.push("/privacy-security")
            }
          />
        </View>

        {/* ==========================================
            PREFERENCES
        =========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Preferences
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <SettingItem
            colors={colors}
            icon={
              <Bell
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Notification Settings"
            subtitle="Customize individual notifications"
            onPress={() =>
              router.push("/notifications")
            }
          />

          <Divider colors={colors} />

          {/* ======================================
              DARK MODE
          ======================================= */}

          <View style={styles.settingRow}>
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor:
                    colors.iconBackground,
                },
              ]}
            >
              <Moon
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            </View>

            <View style={styles.settingText}>
              <Text
                style={[
                  styles.settingTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Dark Mode
              </Text>

              <Text
                style={[
                  styles.settingSubtitle,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                Change the appearance of the app
              </Text>
            </View>

            <Switch
              value={isDark}
              onValueChange={setDarkMode}
              trackColor={{
                false: colors.border,
                true: colors.primaryLight,
              }}
              thumbColor={colors.primary}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        {/* ==========================================
            MEAL PLANNER
        =========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Meal Planner
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <SettingItem
            colors={colors}
            icon={
              <Utensils
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Meal Preferences"
            subtitle="Manage dietary and meal preferences"
            onPress={() =>
              router.push("/personal-information")
            }
          />

          <Divider colors={colors} />

          <SettingItem
            colors={colors}
            icon={
              <Smartphone
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Pantry"
            subtitle="Manage your available ingredients"
            onPress={() =>
              router.push("/pantry")
            }
          />
        </View>

        {/* ==========================================
            DATA & PRIVACY
        =========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Data & Privacy
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <SettingItem
            colors={colors}
            icon={
              <Download
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Download My Data"
            subtitle="Get a copy of your Meal Planner data"
            onPress={handleDownloadData}
          />

          <Divider colors={colors} />

          <SettingItem
            colors={colors}
            icon={
              <Shield
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Privacy & Security"
            subtitle="Manage your privacy preferences"
            onPress={() =>
              router.push("/privacy-security")
            }
          />

          <Divider colors={colors} />

          <SettingItem
            colors={colors}
            icon={
              <Trash2
                size={21}
                color={colors.danger}
                strokeWidth={2}
              />
            }
            title="Delete Account"
            subtitle="Permanently delete your account"
            danger
            onPress={handleDeleteAccount}
          />
        </View>

        {/* ==========================================
            SUPPORT
        =========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Support
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <SettingItem
            colors={colors}
            icon={
              <CircleHelp
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Help & Support"
            subtitle="Get help with Meal Planner"
            onPress={() =>
              router.push("/help-support")
            }
          />

          <Divider colors={colors} />

          <SettingItem
            colors={colors}
            icon={
              <FileText
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Terms & Conditions"
            subtitle="Read our terms and conditions"
            onPress={handleTerms}
          />

          <Divider colors={colors} />

          <SettingItem
            colors={colors}
            icon={
              <Info
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="About Meal Planner"
            subtitle="Version and app information"
            onPress={handleAbout}
          />
        </View>

        {/* ==========================================
            LOGOUT
        =========================================== */}

        <Pressable
          style={[
            styles.logoutButton,
            {
              backgroundColor: colors.dangerLight,
            },
          ]}
          onPress={handleLogout}
        >
          <LogOut
            size={21}
            color={colors.danger}
            strokeWidth={2}
          />

          <Text
            style={[
              styles.logoutText,
              {
                color: colors.danger,
              },
            ]}
          >
            Log Out
          </Text>
        </Pressable>

        {/* ==========================================
            VERSION
        =========================================== */}

        <Text
          style={[
            styles.version,
            {
              color: colors.textMuted,
            },
          ]}
        >
          Meal Planner • Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =====================================================
   SETTING ITEM
===================================================== */

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  colors,
  danger = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: any;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={styles.settingRow}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: danger
              ? colors.dangerLight
              : colors.iconBackground,
          },
        ]}
      >
        {icon}
      </View>

      <View style={styles.settingText}>
        <Text
          style={[
            styles.settingTitle,
            {
              color: danger
                ? colors.danger
                : colors.text,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.settingSubtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <ChevronRight
        size={20}
        color={colors.textMuted}
        strokeWidth={2}
      />
    </Pressable>
  );
}

/* =====================================================
   DIVIDER
===================================================== */

function Divider({
  colors,
}: {
  colors: any;
}) {
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: colors.divider,
        },
      ]}
    />
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 45,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,

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
    marginHorizontal: 8,
  },

  headerSpace: {
    width: 42,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  card: {
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

  settingRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  settingText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  settingTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },

  settingSubtitle: {
    fontSize: 11,
    lineHeight: 16,
  },

  divider: {
    height: 1,
    marginLeft: 54,
  },

  logoutButton: {
    height: 58,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    marginBottom: 20,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 9,
  },

  version: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 2,
  },
});