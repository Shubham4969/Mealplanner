import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Ruler,
  Weight,
  Activity,
  Utensils,
  Target,
  Save,
  ChevronDown,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";

export default function PersonalInformationScreen() {
  const { colors } = useTheme();

  /* =========================================
     USER INFORMATION
  ========================================== */

  const [name, setName] = useState("Shubham");
  const [email, setEmail] = useState("shubham@example.com");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [gender, setGender] = useState("Male");
  const [activityLevel, setActivityLevel] =
    useState("Moderately Active");
  const [diet, setDiet] = useState("Vegetarian");
  const [goal, setGoal] = useState("Maintain Weight");
  const [allergies, setAllergies] = useState("");

  /* =========================================
     DROPDOWN STATE
  ========================================== */

  const [activeDropdown, setActiveDropdown] =
    useState<string | null>(null);

  /* =========================================
     DROPDOWN OPTIONS
  ========================================== */

  const genderOptions = [
    "Male",
    "Female",
    "Other",
    "Prefer not to say",
  ];

  const activityOptions = [
    "Sedentary",
    "Lightly Active",
    "Moderately Active",
    "Very Active",
    "Extremely Active",
  ];

  const dietOptions = [
    "Vegetarian",
    "Non-Vegetarian",
    "Vegan",
    "Eggetarian",
    "Pescatarian",
  ];

  const goalOptions = [
    "Lose Weight",
    "Maintain Weight",
    "Gain Weight",
    "Build Muscle",
    "Improve Overall Health",
  ];

  /* =========================================
     SAVE INFORMATION
  ========================================== */

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter your name."
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter your email."
      );
      return;
    }

    Alert.alert(
      "Information Saved",
      "Your personal information has been updated.",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  /* =========================================
     DROPDOWN COMPONENT
  ========================================== */

  const renderDropdown = (
    label: string,
    value: string,
    options: string[],
    icon: React.ReactNode,
    dropdownKey: string,
    onSelect: (value: string) => void
  ) => {
    const isOpen = activeDropdown === dropdownKey;

    return (
      <View style={styles.fieldContainer}>
        <Text
          style={[
            styles.label,
            {
              color: colors.text,
            },
          ]}
        >
          {label}
        </Text>

        <Pressable
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.input,
              borderColor: isOpen
                ? colors.primary
                : colors.inputBorder,
            },
          ]}
          onPress={() =>
            setActiveDropdown(
              isOpen ? null : dropdownKey
            )
          }
        >
          <View style={styles.dropdownLeft}>
            <View
              style={[
                styles.fieldIcon,
                {
                  backgroundColor: colors.primaryLight,
                },
              ]}
            >
              {icon}
            </View>

            <Text
              style={[
                styles.dropdownValue,
                {
                  color: colors.text,
                },
              ]}
            >
              {value}
            </Text>
          </View>

          <ChevronDown
            size={20}
            color={colors.textSecondary}
            strokeWidth={2}
            style={{
              transform: [
                {
                  rotate: isOpen ? "180deg" : "0deg",
                },
              ],
            }}
          />
        </Pressable>

        {isOpen && (
          <View
            style={[
              styles.optionsContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            {options.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.option,
                  option === value && {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
                onPress={() => {
                  onSelect(option);
                  setActiveDropdown(null);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        option === value
                          ? colors.primary
                          : colors.text,
                      fontWeight:
                        option === value
                          ? "700"
                          : "400",
                    },
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
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
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
        >
          {/* =====================================
              HEADER
          ====================================== */}

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
              Personal Information
            </Text>

            <View style={styles.headerSpace} />
          </View>

          <Text
            style={[
              styles.description,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Keep your information updated so Meal
            Planner can create meals that better fit
            your needs.
          </Text>

          {/* =====================================
              BASIC INFORMATION
          ====================================== */}

          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Basic Information
          </Text>

          {/* NAME */}

          <View style={styles.fieldContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Full Name
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.fieldIcon,
                  {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
              >
                <User
                  size={19}
                  color={colors.primary}
                  strokeWidth={2}
                />
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          {/* EMAIL */}

          <View style={styles.fieldContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Email Address
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.fieldIcon,
                  {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
              >
                <Mail
                  size={19}
                  color={colors.primary}
                  strokeWidth={2}
                />
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                  },
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* AGE */}

          <View style={styles.fieldContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Age
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.fieldIcon,
                  {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
              >
                <Calendar
                  size={19}
                  color={colors.primary}
                  strokeWidth={2}
                />
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                  },
                ]}
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={3}
              />

              <Text
                style={[
                  styles.unit,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                years
              </Text>
            </View>
          </View>

          {/* GENDER */}

          {renderDropdown(
            "Gender",
            gender,
            genderOptions,
            <User
              size={19}
              color={colors.primary}
              strokeWidth={2}
            />,
            "gender",
            setGender
          )}

          {/* =====================================
              BODY INFORMATION
          ====================================== */}

          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Body Information
          </Text>

          {/* HEIGHT */}

          <View style={styles.fieldContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Height
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.fieldIcon,
                  {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
              >
                <Ruler
                  size={19}
                  color={colors.primary}
                  strokeWidth={2}
                />
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                  },
                ]}
                value={height}
                onChangeText={setHeight}
                placeholder="Enter your height"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />

              <Text
                style={[
                  styles.unit,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                cm
              </Text>
            </View>
          </View>

          {/* WEIGHT */}

          <View style={styles.fieldContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Weight
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.fieldIcon,
                  {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
              >
                <Weight
                  size={19}
                  color={colors.primary}
                  strokeWidth={2}
                />
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                  },
                ]}
                value={weight}
                onChangeText={setWeight}
                placeholder="Enter your weight"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
              />

              <Text
                style={[
                  styles.unit,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                kg
              </Text>
            </View>
          </View>

          {/* ACTIVITY */}

          {renderDropdown(
            "Activity Level",
            activityLevel,
            activityOptions,
            <Activity
              size={19}
              color={colors.primary}
              strokeWidth={2}
            />,
            "activity",
            setActivityLevel
          )}

          {/* =====================================
              FOOD PREFERENCES
          ====================================== */}

          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Food Preferences
          </Text>

          {/* DIET */}

          {renderDropdown(
            "Dietary Preference",
            diet,
            dietOptions,
            <Utensils
              size={19}
              color={colors.primary}
              strokeWidth={2}
            />,
            "diet",
            setDiet
          )}

          {/* ALLERGIES */}

          <View style={styles.fieldContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Allergies / Food Restrictions
            </Text>

            <View
              style={[
                styles.inputContainer,
                styles.textAreaContainer,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.fieldIcon,
                  styles.textAreaIcon,
                  {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
              >
                <Utensils
                  size={19}
                  color={colors.primary}
                  strokeWidth={2}
                />
              </View>

              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    color: colors.text,
                  },
                ]}
                value={allergies}
                onChangeText={setAllergies}
                placeholder="e.g. Peanuts, lactose, gluten..."
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* =====================================
              HEALTH GOAL
          ====================================== */}

          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Health Goal
          </Text>

          {renderDropdown(
            "Your Main Goal",
            goal,
            goalOptions,
            <Target
              size={19}
              color={colors.primary}
              strokeWidth={2}
            />,
            "goal",
            setGoal
          )}

          {/* =====================================
              SAVE BUTTON
          ====================================== */}

          <Pressable
            style={[
              styles.saveButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={handleSave}
          >
            <Save
              size={20}
              color="#FFFFFF"
              strokeWidth={2.2}
            />

            <Text style={styles.saveButtonText}>
              Save Information
            </Text>
          </Pressable>

          <Text
            style={[
              styles.bottomNote,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Your information will help generate
            personalized meal plans.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =================================================
   STYLES
================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  keyboardView: {
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
    marginBottom: 15,
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
    marginHorizontal: 10,
  },

  headerSpace: {
    width: 42,
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 27,
  },

  /* SECTION */

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
    marginTop: 4,
  },

  /* FIELD */

  fieldContainer: {
    marginBottom: 17,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
  },

  inputContainer: {
    minHeight: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
  },

  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  input: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
    paddingVertical: 4,
  },

  unit: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 5,
    marginRight: 5,
  },

  /* DROPDOWN */

  dropdown: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  dropdownValue: {
    fontSize: 14,
    marginLeft: 10,
  },

  optionsContainer: {
    borderRadius: 16,
    marginTop: 6,
    paddingVertical: 5,
    borderWidth: 1,
    overflow: "hidden",
  },

  option: {
    paddingHorizontal: 16,
    paddingVertical: 13,
  },

  optionText: {
    fontSize: 14,
  },

  /* TEXT AREA */

  textAreaContainer: {
    alignItems: "flex-start",
    paddingVertical: 10,
  },

  textAreaIcon: {
    marginTop: 1,
  },

  textArea: {
    minHeight: 75,
    paddingTop: 5,
  },

  /* SAVE */

  saveButton: {
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 10,
    elevation: 3,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 7,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },

  bottomNote: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 12,
    lineHeight: 17,
  },
});