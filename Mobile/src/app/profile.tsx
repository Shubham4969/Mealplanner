import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import {
  User,
  Mail,
  Settings,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit3,
  Leaf,
  Heart,
  Target,
  X,
  Image as ImageIcon,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";

export default function ProfileScreen() {
  const { colors } = useTheme();

  const [profileImage, setProfileImage] =
    useState<string | null>(null);

  const [photoModalVisible, setPhotoModalVisible] =
    useState(false);

  /* =========================================
     OPEN PROFILE PHOTO MODAL
  ========================================== */

  const openPhotoSelector = () => {
    setPhotoModalVisible(true);
  };

  /* =========================================
     CHOOSE PHOTO FROM GALLERY
  ========================================== */

  const chooseFromGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow photo library access to choose a profile picture."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        setProfileImage(result.assets[0].uri);
        setPhotoModalVisible(false);
      }
    } catch (error) {
      console.log("Gallery error:", error);

      Alert.alert(
        "Error",
        "Unable to open the photo gallery."
      );
    }
  };

  /* =========================================
     REMOVE PHOTO
  ========================================== */

  const removePhoto = () => {
    setProfileImage(null);
    setPhotoModalVisible(false);
  };

  /* =========================================
     LOGOUT
  ========================================== */

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
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Account
          </Text>

          <Pressable
            style={[
              styles.settingsButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push("/settings")}
          >
            <Settings
              size={22}
              color={colors.text}
              strokeWidth={2}
            />
          </Pressable>
        </View>

        {/* =========================================
            PROFILE CARD
        ========================================== */}

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* PROFILE PHOTO */}

          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <Text style={styles.avatarText}>S</Text>
            )}

            {/* SMALL EDIT BUTTON */}

            <Pressable
              style={[
                styles.editAvatarButton,
                {
                  backgroundColor: colors.text,
                  borderColor: colors.card,
                },
              ]}
              onPress={openPhotoSelector}
            >
              <Edit3
                size={14}
                color={colors.card}
                strokeWidth={2.5}
              />
            </Pressable>
          </View>

          {/* USER INFORMATION */}

          <View style={styles.profileInfo}>
            <Text
              style={[
                styles.name,
                {
                  color: colors.text,
                },
              ]}
            >
              Shubham
            </Text>

            <View style={styles.emailRow}>
              <Mail
                size={15}
                color={colors.textSecondary}
                strokeWidth={2}
              />

              <Text
                style={[
                  styles.email,
                  {
                    color: colors.textSecondary,
                  },
                ]}
                numberOfLines={1}
              >
                shubham@example.com
              </Text>
            </View>

            <View style={styles.memberRow}>
              <Leaf
                size={14}
                color={colors.primary}
                strokeWidth={2.5}
              />

              <Text
                style={[
                  styles.memberText,
                  {
                    color: colors.primary,
                  },
                ]}
                numberOfLines={1}
              >
                Healthy eating journey
              </Text>
            </View>
          </View>
        </View>

        {/* =========================================
            YOUR PROGRESS
        ========================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Your Progress
        </Text>

        <View style={styles.statsContainer}>
          {/* MEALS PLANNED */}

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: colors.primaryLight,
                },
              ]}
            >
              <Heart
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            </View>

            <Text
              style={[
                styles.statNumber,
                {
                  color: colors.text,
                },
              ]}
            >
              12
            </Text>

            <Text
              style={[
                styles.statLabel,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Meals Planned
            </Text>
          </View>

          {/* DAY STREAK */}

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: colors.primaryLight,
                },
              ]}
            >
              <Target
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            </View>

            <Text
              style={[
                styles.statNumber,
                {
                  color: colors.text,
                },
              ]}
            >
              7
            </Text>

            <Text
              style={[
                styles.statLabel,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Day Streak
            </Text>
          </View>

          {/* GOAL */}

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: colors.primaryLight,
                },
              ]}
            >
              <Leaf
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
            </View>

            <Text
              style={[
                styles.statNumber,
                {
                  color: colors.text,
                },
              ]}
            >
              85%
            </Text>

            <Text
              style={[
                styles.statLabel,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Goal Progress
            </Text>
          </View>
        </View>

        {/* =========================================
            ACCOUNT
        ========================================== */}

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
            styles.menuCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <MenuItem
            icon={
              <User
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Personal Information"
            subtitle="Name, email and preferences"
            onPress={() =>
              router.push("/personal-information")
            }
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

          <MenuItem
            icon={
              <Bell
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Notifications"
            subtitle="Manage your notifications"
            onPress={() =>
              router.push("/notifications")
            }
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

          <MenuItem
            icon={
              <Lock
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
            }
            title="Privacy & Security"
            subtitle="Password and security"
            onPress={() =>
              router.push("/privacy-security")
            }
            colors={colors}
          />
        </View>

        {/* =========================================
            SUPPORT
        ========================================== */}

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
            styles.menuCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <MenuItem
            icon={
              <HelpCircle
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
            colors={colors}
          />
        </View>

        {/* =========================================
            LOGOUT
        ========================================== */}

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
            size={20}
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

      {/* ===========================================
          PROFILE PHOTO MODAL
      =========================================== */}

      <Modal
        visible={photoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setPhotoModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          {/* DARK BACKGROUND */}

          <Pressable
            style={styles.modalBackground}
            onPress={() =>
              setPhotoModalVisible(false)
            }
          />

          {/* BOTTOM SHEET */}

          <View
            style={[
              styles.photoModal,
              {
                backgroundColor: colors.background,
              },
            ]}
          >
            {/* HEADER */}

            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Profile Photo
              </Text>

              <Pressable
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: colors.card,
                  },
                ]}
                onPress={() =>
                  setPhotoModalVisible(false)
                }
              >
                <X
                  size={20}
                  color={colors.text}
                  strokeWidth={2}
                />
              </Pressable>
            </View>

            <Text
              style={[
                styles.modalSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Choose a new profile picture
            </Text>

            {/* =================================
                GALLERY BUTTON
            ================================== */}

            <Pressable
              style={[
                styles.galleryButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={chooseFromGallery}
            >
              <View
                style={[
                  styles.galleryIcon,
                  {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
              >
                <ImageIcon
                  size={24}
                  color={colors.primary}
                  strokeWidth={2}
                />
              </View>

              <View style={styles.optionText}>
                <Text
                  style={[
                    styles.optionTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Choose from Gallery
                </Text>

                <Text
                  style={[
                    styles.optionSubtitle,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Select a photo from your phone
                </Text>
              </View>

              <ChevronRight
                size={20}
                color={colors.textMuted}
                strokeWidth={2}
              />
            </Pressable>

            {/* REMOVE PHOTO */}

            {profileImage && (
              <Pressable
                style={[
                  styles.removeButton,
                  {
                    backgroundColor: colors.dangerLight,
                  },
                ]}
                onPress={removePhoto}
              >
                <Text
                  style={[
                    styles.removeButtonText,
                    {
                      color: colors.danger,
                    },
                  ]}
                >
                  Remove Photo
                </Text>
              </Pressable>
            )}

            {/* CANCEL */}

            <Pressable
              style={[
                styles.cancelButton,
                {
                  backgroundColor: colors.cardSecondary,
                },
              ]}
              onPress={() =>
                setPhotoModalVisible(false)
              }
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* =================================================
   MENU ITEM
================================================= */

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  colors,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: any;
}) {
  return (
    <Pressable
      style={styles.menuItem}
      onPress={onPress}
    >
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor: colors.primaryLight,
          },
        ]}
      >
        {icon}
      </View>

      <View style={styles.menuTextContainer}>
        <Text
          style={[
            styles.menuTitle,
            {
              color: colors.text,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.menuSubtitle,
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

/* =================================================
   STYLES
================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 35,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    elevation: 2,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },

  /* PROFILE CARD */

  profileCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    elevation: 2,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,

    marginBottom: 26,
  },

  /* AVATAR */

  avatarContainer: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
  },

  avatarText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  profileImage: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },

  editAvatarButton: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    elevation: 3,
  },

  /* PROFILE INFORMATION */

  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },

  name: {
    fontSize: 23,
    fontWeight: "800",
    marginBottom: 6,
  },

  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  email: {
    flex: 1,
    fontSize: 13,
    marginLeft: 6,
  },

  memberRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  memberText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },

  /* SECTIONS */

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  /* STATS */

  statsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 27,
  },

  statCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    elevation: 1,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  statNumber: {
    fontSize: 19,
    fontWeight: "800",
  },

  statLabel: {
    fontSize: 10,
    marginTop: 3,
    textAlign: "center",
  },

  /* MENU */

  menuCard: {
    borderRadius: 20,
    paddingHorizontal: 16,
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

  menuItem: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  menuTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  menuTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
  },

  menuSubtitle: {
    fontSize: 12,
  },

  divider: {
    height: 1,
    marginLeft: 55,
  },

  /* LOGOUT */

  logoutButton: {
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 18,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },

  version: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 2,
  },

  /* =============================================
     PHOTO MODAL
  ============================================== */

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  photoModal: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
  },

  modalSubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 18,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  /* GALLERY */

  galleryButton: {
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
  },

  galleryIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  optionText: {
    flex: 1,
    marginLeft: 13,
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  optionSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  /* REMOVE */

  removeButton: {
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  removeButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  /* CANCEL */

  cancelButton: {
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});