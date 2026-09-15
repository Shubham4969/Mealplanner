import React, { useState } from "react";
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
  Lock,
  ShieldCheck,
  Smartphone,
  Eye,
  Sparkles,
  Database,
  Download,
  Trash2,
  History,
  LogOut,
  ChevronRight,
  KeyRound,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";

export default function PrivacySecurityScreen() {
  const { colors } = useTheme();

  /* =========================================
     PRIVACY SETTINGS
  ========================================== */

  const [personalizedRecommendations, setPersonalizedRecommendations] =
    useState(true);

  const [aiDataUsage, setAiDataUsage] = useState(true);

  /* =========================================
     2FA
  ========================================== */

  const [twoFactorEnabled, setTwoFactorEnabled] =
    useState(false);

  /* =========================================
     PROFILE VISIBILITY
  ========================================== */

  const [profileVisibility, setProfileVisibility] =
    useState(true);

  /* =========================================
     CHANGE PASSWORD
  ========================================== */

  const handleChangePassword = () => {
    Alert.alert(
      "Change Password",
      "Password change functionality will be connected to your authentication system later."
    );
  };

  /* =========================================
     TWO FACTOR AUTHENTICATION
  ========================================== */

  const handleTwoFactorChange = (value: boolean) => {
    if (value) {
      Alert.alert(
        "Two-Factor Authentication",
        "Two-factor authentication will be connected when authentication is implemented.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Enable",
            onPress: () => setTwoFactorEnabled(true),
          },
        ]
      );
    } else {
      setTwoFactorEnabled(false);
    }
  };

  /* =========================================
     LOGIN ACTIVITY
  ========================================== */

  const handleLoginActivity = () => {
    Alert.alert(
      "Login Activity",
      "Login activity will be available once authentication and session tracking are connected."
    );
  };

  /* =========================================
     PROFILE VISIBILITY
  ========================================== */

  const handleProfileVisibility = () => {
    setProfileVisibility((previous) => !previous);
  };

  /* =========================================
     DOWNLOAD DATA
  ========================================== */

  const handleDownloadData = () => {
    Alert.alert(
      "Download My Data",
      "Your data export feature will be connected to the backend later."
    );
  };

  /* =========================================
     CLEAR MEAL HISTORY
  ========================================== */

  const handleClearMealHistory = () => {
    Alert.alert(
      "Clear Meal History",
      "Are you sure you want to clear your meal history?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Meal History",
              "Your meal history will be cleared after the backend is connected."
            );
          },
        },
      ]
    );
  };

  /* =========================================
     DELETE ACCOUNT
  ========================================== */

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action will permanently delete your account and associated data. This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Account Deletion",
              "Account deletion will be connected to PostgreSQL later."
            );
          },
        },
      ]
    );
  };

  /* =========================================
     LOG OUT ALL DEVICES
  ========================================== */

  const handleLogoutAllDevices = () => {
    Alert.alert(
      "Log Out All Devices",
      "Are you sure you want to log out from all devices?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Coming Soon",
              "Multi-device session management will be connected later."
            );
          },
        },
      ]
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
            Privacy & Security
          </Text>

          <View style={styles.headerSpace} />
        </View>

        {/* =========================================
            INTRO
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
            <ShieldCheck
              size={25}
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
              Your privacy matters
            </Text>

            <Text
              style={[
                styles.introText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Manage your account security and control
              how your Meal Planner data is used.
            </Text>
          </View>
        </View>

        {/* =========================================
            ACCOUNT SECURITY
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Account Security
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
          <ActionItem
            icon={
              <KeyRound
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Change Password"
            subtitle="Update your account password"
            onPress={handleChangePassword}
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

          <SwitchItem
            icon={
              <Lock
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Two-Factor Authentication"
            subtitle="Add an extra layer of account security"
            value={twoFactorEnabled}
            onValueChange={handleTwoFactorChange}
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

          <ActionItem
            icon={
              <Smartphone
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Login Activity"
            subtitle="View recent devices and sessions"
            onPress={handleLoginActivity}
            colors={colors}
          />
        </View>

        {/* =========================================
            PRIVACY
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Privacy
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
          <SwitchItem
            icon={
              <Eye
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Profile Visibility"
            subtitle="Control whether your profile is visible"
            value={profileVisibility}
            onValueChange={handleProfileVisibility}
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

          <SwitchItem
            icon={
              <Sparkles
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Personalized Recommendations"
            subtitle="Use your profile to improve meal suggestions"
            value={personalizedRecommendations}
            onValueChange={setPersonalizedRecommendations}
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

          <SwitchItem
            icon={
              <Database
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="AI Data Usage"
            subtitle="Allow your meal data to personalize AI results"
            value={aiDataUsage}
            onValueChange={setAiDataUsage}
            colors={colors}
          />
        </View>

        {/* =========================================
            YOUR DATA
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Your Data
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
          <ActionItem
            icon={
              <Download
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Download My Data"
            subtitle="Request a copy of your account data"
            onPress={handleDownloadData}
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

          <ActionItem
            icon={
              <History
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Clear Meal History"
            subtitle="Remove your previous meal history"
            onPress={handleClearMealHistory}
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

          <ActionItem
            icon={
              <Trash2
                size={20}
                color={colors.danger}
                strokeWidth={2}
              />
            }
            title="Delete My Account"
            subtitle="Permanently delete your account and data"
            onPress={handleDeleteAccount}
            danger
            colors={colors}
          />
        </View>

        {/* =========================================
            ACTIVE SESSIONS
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Active Sessions
        </Text>

        <View
          style={[
            styles.sessionCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.sessionIcon,
              {
                backgroundColor: colors.primaryLight,
              },
            ]}
          >
            <Smartphone
              size={21}
              color={colors.primary}
              strokeWidth={2}
            />
          </View>

          <View style={styles.sessionInfo}>
            <Text
              style={[
                styles.sessionTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              This Device
            </Text>

            <Text
              style={[
                styles.sessionSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Android • Current session
            </Text>
          </View>

          <View
            style={[
              styles.activeBadge,
              {
                backgroundColor: colors.primaryLight,
              },
            ]}
          >
            <View
              style={[
                styles.activeDot,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            />

            <Text
              style={[
                styles.activeText,
                {
                  color: colors.primary,
                },
              ]}
            >
              Active
            </Text>
          </View>
        </View>

        {/* LOGOUT ALL DEVICES */}

        <Pressable
          style={[
            styles.logoutAllButton,
            {
              backgroundColor: colors.dangerLight,
            },
          ]}
          onPress={handleLogoutAllDevices}
        >
          <LogOut
            size={19}
            color={colors.danger}
            strokeWidth={2}
          />

          <Text
            style={[
              styles.logoutAllText,
              {
                color: colors.danger,
              },
            ]}
          >
            Log Out All Devices
          </Text>
        </Pressable>

        {/* =========================================
            SECURITY NOTE
        ========================================== */}

        <View style={styles.securityNote}>
          <ShieldCheck
            size={18}
            color={colors.textSecondary}
            strokeWidth={2}
          />

          <Text
            style={[
              styles.securityNoteText,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Your security settings will be securely
            stored with your account when the backend
            is connected.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =================================================
   ACTION ITEM
================================================= */

function ActionItem({
  icon,
  title,
  subtitle,
  onPress,
  danger = false,
  colors,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
  colors: any;
}) {
  return (
    <Pressable
      style={styles.actionItem}
      onPress={onPress}
    >
      <View
        style={[
          styles.itemIcon,
          {
            backgroundColor: danger
              ? colors.dangerLight
              : colors.primaryLight,
          },
        ]}
      >
        {icon}
      </View>

      <View style={styles.itemTextContainer}>
        <Text
          style={[
            styles.itemTitle,
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
            styles.itemSubtitle,
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
        color={
          danger
            ? colors.danger
            : colors.textMuted
        }
        strokeWidth={2}
      />
    </Pressable>
  );
}

/* =================================================
   SWITCH ITEM
================================================= */

function SwitchItem({
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
    <View style={styles.actionItem}>
      <View
        style={[
          styles.itemIcon,
          {
            backgroundColor: colors.primaryLight,
          },
        ]}
      >
        {icon}
      </View>

      <View style={styles.itemTextContainer}>
        <Text
          style={[
            styles.itemTitle,
            {
              color: colors.text,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.itemSubtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>

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
    fontSize: 21,
    fontWeight: "800",
    marginHorizontal: 8,
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

  /* ITEM */

  actionItem: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
  },

  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  itemTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },

  itemSubtitle: {
    fontSize: 11,
    lineHeight: 16,
  },

  /* DIVIDER */

  divider: {
    height: 1,
    marginLeft: 54,
  },

  /* ACTIVE SESSION */

  sessionCard: {
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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

  sessionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  sessionInfo: {
    flex: 1,
    marginLeft: 12,
  },

  sessionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },

  sessionSubtitle: {
    fontSize: 11,
  },

  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  activeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  /* LOGOUT */

  logoutAllButton: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 22,
  },

  logoutAllText: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },

  /* SECURITY NOTE */

  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  securityNoteText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 7,
    textAlign: "center",
  },
});