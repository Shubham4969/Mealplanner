import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  Heart,
  IndianRupee,
  Clock,
  ShieldAlert,
  X,
  Check,
  Star,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";

import {
  getProfile,
  updateProfile,
} from "../services/api";

// ============================================================
// USER ID
// ============================================================

const USER_ID = 1;

// ============================================================
// TYPES
// ============================================================

type DropdownOption = {
  label: string;
  value: string;
};

// ============================================================
// SCREEN
// ============================================================

export default function PersonalInformationScreen() {
  const { colors } = useTheme();

  // ==========================================================
  // BASIC INFORMATION
  // ==========================================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("shubham@example.com");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  // ==========================================================
  // BODY INFORMATION
  // ==========================================================

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // ==========================================================
  // FOOD / LIFESTYLE
  // ==========================================================

  const [activityLevel, setActivityLevel] = useState("");
  const [diet, setDiet] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState("");
  const [budget, setBudget] = useState("");

  // ==========================================================
  // FOOD PREFERENCES
  // ==========================================================

  const [allergies, setAllergies] = useState("");
  const [dislikedFoods, setDislikedFoods] = useState("");
  const [favoriteFoods, setFavoriteFoods] = useState("");

  // ==========================================================
  // HEALTH / SCHEDULE
  // ==========================================================

  const [healthConsiderations, setHealthConsiderations] =
    useState("");

  const [dailySchedule, setDailySchedule] =
    useState("");

  // ==========================================================
  // CUISINE
  // ==========================================================

  const [cuisinePreferences, setCuisinePreferences] =
    useState<string[]>([]);

  // ==========================================================
  // GOAL
  // ==========================================================

  const [goal, setGoal] = useState("");

  // ==========================================================
  // LOADING / SAVING
  // ==========================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ==========================================================
  // DROPDOWN
  // ==========================================================

  const [activeDropdown, setActiveDropdown] =
    useState<string | null>(null);

  // ==========================================================
  // OPTIONS
  // ==========================================================

  const genderOptions: DropdownOption[] = [
    {
      label: "Male",
      value: "male",
    },
    {
      label: "Female",
      value: "female",
    },
    {
      label: "Other",
      value: "other",
    },
    {
      label: "Prefer not to say",
      value: "prefer_not_to_say",
    },
  ];

  const activityOptions: DropdownOption[] = [
    {
      label: "Sedentary",
      value: "sedentary",
    },
    {
      label: "Lightly Active",
      value: "light",
    },
    {
      label: "Moderately Active",
      value: "moderate",
    },
    {
      label: "Very Active",
      value: "very_active",
    },
    {
      label: "Extremely Active",
      value: "extremely_active",
    },
    {
      label: "Gym",
      value: "gym",
    },
    {
      label: "Athlete",
      value: "athlete",
    },
  ];

  const dietOptions: DropdownOption[] = [
    {
      label: "Vegetarian",
      value: "vegetarian",
    },
    {
      label: "Non-Vegetarian",
      value: "non_vegetarian",
    },
    {
      label: "Vegan",
      value: "vegan",
    },
    {
      label: "Eggetarian",
      value: "eggetarian",
    },
    {
      label: "Pescatarian",
      value: "pescatarian",
    },
    {
      label: "Jain",
      value: "jain",
    },
  ];

  const mealsOptions: DropdownOption[] = [
    {
      label: "2 meals",
      value: "2",
    },
    {
      label: "3 meals",
      value: "3",
    },
    {
      label: "4 meals",
      value: "4",
    },
    {
      label: "5 meals",
      value: "5",
    },
    {
      label: "6 meals",
      value: "6",
    },
  ];

  const budgetOptions: DropdownOption[] = [
    {
      label: "Low Budget",
      value: "low",
    },
    {
      label: "Medium Budget",
      value: "medium",
    },
    {
      label: "High Budget",
      value: "high",
    },
  ];

  const goalOptions: DropdownOption[] = [
    {
      label: "Lose Weight",
      value: "weight_loss",
    },
    {
      label: "Maintain Weight",
      value: "maintenance",
    },
    {
      label: "Gain Weight",
      value: "weight_gain",
    },
    {
      label: "Build Muscle",
      value: "muscle_gain",
    },
    {
      label: "Improve Overall Health",
      value: "general_health",
    },
  ];

  const cuisineOptions: DropdownOption[] = [
    {
      label: "North Indian",
      value: "north_indian",
    },
    {
      label: "South Indian",
      value: "south_indian",
    },
    {
      label: "Punjabi",
      value: "punjabi",
    },
    {
      label: "Gujarati",
      value: "gujarati",
    },
    {
      label: "Bengali",
      value: "bengali",
    },
    {
      label: "Maharashtrian",
      value: "maharashtrian",
    },
    {
      label: "Chinese",
      value: "chinese",
    },
    {
      label: "Italian",
      value: "italian",
    },
    {
      label: "Mexican",
      value: "mexican",
    },
    {
      label: "Mediterranean",
      value: "mediterranean",
    },
  ];

  // ==========================================================
  // HELPER
  // ==========================================================

  const normalizeArray = (value: any): string[] => {
    if (Array.isArray(value)) {
      return value
        .filter(
          (item) =>
            item !== null &&
            item !== undefined &&
            String(item).trim() !== "" &&
            String(item).toLowerCase() !== "string"
        )
        .map((item) => String(item));
    }

    if (typeof value === "string") {
      if (
        value.trim() === "" ||
        value.toLowerCase() === "string"
      ) {
        return [];
      }

      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  const arrayToText = (value: any): string => {
    return normalizeArray(value).join(", ");
  };

  const textToArray = (value: string): string[] => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const getDisplayValue = (
    value: string,
    options: DropdownOption[]
  ) => {
    const found = options.find(
      (option) => option.value === value
    );

    return found ? found.label : value;
  };

  // ==========================================================
  // LOAD PROFILE
  // ==========================================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      console.log(
        "Loading profile for user:",
        USER_ID
      );

      const result = await getProfile(USER_ID);

      console.log(
        "PROFILE RESPONSE:",
        result
      );

      if (
        !result ||
        !result.success ||
        !result.data
      ) {
        throw new Error(
          result?.message ||
            "Unable to load your profile."
        );
      }

      const profile: any = result.data;

      // ======================================================
      // BASIC
      // ======================================================

      if (profile.name) {
        setName(String(profile.name));
      }

      if (
        profile.age !== null &&
        profile.age !== undefined &&
        Number(profile.age) > 0
      ) {
        setAge(String(profile.age));
      }

      if (profile.sex) {
        setGender(String(profile.sex));
      }

      // ======================================================
      // BODY
      // ======================================================

      if (
        profile.height !== null &&
        profile.height !== undefined &&
        Number(profile.height) > 0
      ) {
        setHeight(String(profile.height));
      }

      if (
        profile.weight !== null &&
        profile.weight !== undefined &&
        Number(profile.weight) > 0
      ) {
        setWeight(String(profile.weight));
      }

      // ======================================================
      // ACTIVITY
      // ======================================================

      if (profile.activity_level) {
        setActivityLevel(
          String(profile.activity_level)
        );
      }

      // ======================================================
      // DIET
      // ======================================================

      if (profile.diet_type) {
        setDiet(
          String(profile.diet_type)
        );
      }

      // ======================================================
      // MEALS PER DAY
      // ======================================================

      if (
        profile.meals_per_day !== null &&
        profile.meals_per_day !== undefined &&
        Number(profile.meals_per_day) > 0
      ) {
        setMealsPerDay(
          String(profile.meals_per_day)
        );
      }

      // ======================================================
      // BUDGET
      // ======================================================

      if (profile.budget) {
        setBudget(
          String(profile.budget)
        );
      }

      // ======================================================
      // ALLERGIES
      // ======================================================

      setAllergies(
        arrayToText(profile.allergies)
      );

      // ======================================================
      // DISLIKED FOODS
      // ======================================================

      setDislikedFoods(
        arrayToText(profile.disliked_foods)
      );

      // ======================================================
      // FAVORITE FOODS
      // ======================================================

      setFavoriteFoods(
        arrayToText(profile.favorite_foods)
      );

      // ======================================================
      // HEALTH CONSIDERATIONS
      // ======================================================

      setHealthConsiderations(
        arrayToText(
          profile.health_considerations
        )
      );

      // ======================================================
      // DAILY SCHEDULE
      // ======================================================

      setDailySchedule(
        arrayToText(
          profile.daily_schedule
        )
      );

      // ======================================================
      // CUISINE
      // ======================================================

      setCuisinePreferences(
        normalizeArray(
          profile.cuisine_preferences
        )
      );

      // ======================================================
      // GOAL
      // ======================================================

      if (profile.goal) {
        setGoal(
          String(profile.goal)
        );
      }
    } catch (error) {
      console.error(
        "PROFILE LOAD ERROR:",
        error
      );

      Alert.alert(
        "Profile Error",
        error instanceof Error
          ? error.message
          : "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const handleSave = async () => {
    // ========================================================
    // VALIDATION
    // ========================================================

    if (!name.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter your name."
      );
      return;
    }

    if (
      age.trim() &&
      Number.isNaN(Number(age))
    ) {
      Alert.alert(
        "Invalid Age",
        "Please enter a valid age."
      );
      return;
    }

    if (
      height.trim() &&
      Number.isNaN(Number(height))
    ) {
      Alert.alert(
        "Invalid Height",
        "Please enter a valid height."
      );
      return;
    }

    if (
      weight.trim() &&
      Number.isNaN(Number(weight))
    ) {
      Alert.alert(
        "Invalid Weight",
        "Please enter a valid weight."
      );
      return;
    }

    try {
      setSaving(true);

      // ======================================================
      // PROFILE DATA
      // ======================================================

      const profileData = {
        name: name.trim(),

        age: age.trim()
          ? Number(age)
          : undefined,

        sex: gender || undefined,

        height: height.trim()
          ? Number(height)
          : undefined,

        weight: weight.trim()
          ? Number(weight)
          : undefined,

        goal: goal || undefined,

        activity_level:
          activityLevel || undefined,

        diet_type:
          diet || undefined,

        meals_per_day:
          mealsPerDay
            ? Number(mealsPerDay)
            : undefined,

        budget:
          budget || undefined,

        allergies:
          textToArray(allergies),

        disliked_foods:
          textToArray(dislikedFoods),

        favorite_foods:
          textToArray(favoriteFoods),

        health_considerations:
          textToArray(
            healthConsiderations
          ),

        daily_schedule:
          textToArray(dailySchedule),

        cuisine_preferences:
          cuisinePreferences,
      };

      console.log(
        "PROFILE UPDATE DATA:",
        JSON.stringify(
          profileData,
          null,
          2
        )
      );

      // ======================================================
      // SEND TO FASTAPI
      // ======================================================

      const result =
        await updateProfile(
          profileData,
          USER_ID
        );

      console.log(
        "PROFILE UPDATE RESPONSE:",
        result
      );

      // ======================================================
      // CHECK
      // ======================================================

      if (
        !result ||
        !result.success
      ) {
        throw new Error(
          result?.message ||
            "Unable to update your profile."
        );
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      Alert.alert(
        "Information Saved",
        "Your personal information has been updated successfully.",
        [
          {
            text: "OK",
            onPress: () =>
              router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(
        "PROFILE UPDATE ERROR:",
        error
      );

      Alert.alert(
        "Save Failed",
        error instanceof Error
          ? error.message
          : "Unable to save your information."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DROPDOWN
  // ==========================================================

  const renderDropdown = (
    label: string,
    value: string,
    options: DropdownOption[],
    icon: React.ReactNode,
    dropdownKey: string,
    onSelect: (value: string) => void
  ) => {
    const isOpen =
      activeDropdown === dropdownKey;

    return (
      <View
        style={styles.fieldContainer}
      >
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
              backgroundColor:
                colors.input,

              borderColor:
                isOpen
                  ? colors.primary
                  : colors.inputBorder,
            },
          ]}
          onPress={() =>
            setActiveDropdown(
              isOpen
                ? null
                : dropdownKey
            )
          }
        >
          <View
            style={
              styles.dropdownLeft
            }
          >
            <View
              style={[
                styles.fieldIcon,
                {
                  backgroundColor:
                    colors.primaryLight,
                },
              ]}
            >
              {icon}
            </View>

            <Text
              style={[
                styles.dropdownValue,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {value
                ? getDisplayValue(
                    value,
                    options
                  )
                : "Select"}
            </Text>
          </View>

          <ChevronDown
            size={20}
            color={
              colors.textSecondary
            }
            strokeWidth={2}
            style={{
              transform: [
                {
                  rotate:
                    isOpen
                      ? "180deg"
                      : "0deg",
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
                backgroundColor:
                  colors.card,

                borderColor:
                  colors.border,
              },
            ]}
          >
            {options.map(
              (option) => {
                const selected =
                  option.value ===
                  value;

                return (
                  <Pressable
                    key={
                      option.value
                    }
                    style={[
                      styles.option,
                      selected && {
                        backgroundColor:
                          colors.primaryLight,
                      },
                    ]}
                    onPress={() => {
                      onSelect(
                        option.value
                      );

                      setActiveDropdown(
                        null
                      );
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color:
                            selected
                              ? colors.primary
                              : colors.text,

                          fontWeight:
                            selected
                              ? "700"
                              : "400",
                        },
                      ]}
                    >
                      {option.label}
                    </Text>

                    {selected && (
                      <Check
                        size={18}
                        color={
                          colors.primary
                        }
                      />
                    )}
                  </Pressable>
                );
              }
            )}
          </View>
        )}
      </View>
    );
  };

  // ==========================================================
  // MULTI SELECT CUISINE
  // ==========================================================

  const renderCuisineSelector = () => {
    return (
      <View
        style={
          styles.fieldContainer
        }
      >
        <Text
          style={[
            styles.label,
            {
              color: colors.text,
            },
          ]}
        >
          Cuisine Preferences
        </Text>

        <Text
          style={[
            styles.helperText,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          Select all cuisines you enjoy
        </Text>

        <View
          style={
            styles.chipsContainer
          }
        >
          {cuisineOptions.map(
            (option) => {
              const selected =
                cuisinePreferences.includes(
                  option.value
                );

              return (
                <Pressable
                  key={
                    option.value
                  }
                  onPress={() => {
                    setCuisinePreferences(
                      (previous) => {
                        if (
                          previous.includes(
                            option.value
                          )
                        ) {
                          return previous.filter(
                            (item) =>
                              item !==
                              option.value
                          );
                        }

                        return [
                          ...previous,
                          option.value,
                        ];
                      }
                    );
                  }}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        selected
                          ? colors.primary
                          : colors.input,

                      borderColor:
                        selected
                          ? colors.primary
                          : colors.inputBorder,
                    },
                  ]}
                >
                  {selected && (
                    <Check
                      size={14}
                      color="#FFFFFF"
                    />
                  )}

                  <Text
                    style={[
                      styles.chipText,
                      {
                        color:
                          selected
                            ? "#FFFFFF"
                            : colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>
      </View>
    );
  };

  // ==========================================================
  // TEXT AREA
  // ==========================================================

  const renderTextArea = (
    label: string,
    value: string,
    onChangeText: (
      value: string
    ) => void,
    placeholder: string,
    icon: React.ReactNode,
    helper?: string
  ) => {
    return (
      <View
        style={
          styles.fieldContainer
        }
      >
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

        <View
          style={[
            styles.inputContainer,
            styles.textAreaContainer,
            {
              backgroundColor:
                colors.input,

              borderColor:
                colors.inputBorder,
            },
          ]}
        >
          <View
            style={[
              styles.fieldIcon,
              styles.textAreaIcon,
              {
                backgroundColor:
                  colors.primaryLight,
              },
            ]}
          >
            {icon}
          </View>

          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                color:
                  colors.text,
              },
            ]}
            value={value}
            onChangeText={
              onChangeText
            }
            placeholder={
              placeholder
            }
            placeholderTextColor={
              colors.textMuted
            }
            multiline
            textAlignVertical="top"
          />
        </View>

        {helper && (
          <Text
            style={[
              styles.helperText,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {helper}
          </Text>
        )}
      </View>
    );
  };

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor:
              colors.background,

            alignItems:
              "center",

            justifyContent:
              "center",
          },
        ]}
        edges={[
          "top",
          "left",
          "right",
        ]}
      >
        <ActivityIndicator
          size="large"
          color={
            colors.primary
          }
        />

        <Text
          style={{
            color:
              colors.text,

            fontSize: 16,

            fontWeight:
              "600",

            marginTop: 14,
          }}
        >
          Loading your profile...
        </Text>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            colors.background,
        },
      ]}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <KeyboardAvoidingView
        style={
          styles.keyboardView
        }
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.container
          }
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.header
            }
          >
            <Pressable
              style={[
                styles.backButton,
                {
                  backgroundColor:
                    colors.card,
                },
              ]}
              onPress={() =>
                router.back()
              }
            >
              <ArrowLeft
                size={22}
                color={
                  colors.text
                }
                strokeWidth={2.2}
              />
            </Pressable>

            <Text
              style={[
                styles.headerTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Personal Information
            </Text>

            <View
              style={
                styles.headerSpace
              }
            />
          </View>

          <Text
            style={[
              styles.description,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            Keep your information updated so
            Meal Planner can create meals that
            better fit your needs.
          </Text>

          {/* ==================================================
              BASIC INFORMATION
          ================================================== */}

          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Basic Information
          </Text>

          {/* NAME */}

          <View
            style={
              styles.fieldContainer
            }
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Full Name
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor:
                    colors.input,

                  borderColor:
                    colors.inputBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.fieldIcon,
                  {
                    backgroundColor:
                      colors.primaryLight,
                  },
                ]}
              >
                <User
                  size={19}
                  color={
                    colors.primary
                  }
                  strokeWidth={2}
                />
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    color:
                      colors.text,
                  },
                ]}
                value={name}
                onChangeText={
                  setName
                }
                placeholder="Enter your name"
                placeholderTextColor={
                  colors.textMuted
                }
              />
            </View>
          </View>

          {/* EMAIL */}

          <View
            style={
              styles.fieldContainer
            }
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Email Address
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor:
                    colors.input,

                  borderColor:
                    colors.inputBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.fieldIcon,
                  {
                    backgroundColor:
                      colors.primaryLight,
                  },
                ]}
              >
                <Mail
                  size={19}
                  color={
                    colors.primary
                  }
                  strokeWidth={2}
                />
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    color:
                      colors.text,
                  },
                ]}
                value={email}
                onChangeText={
                  setEmail
                }
                placeholder="Enter your email"
                placeholderTextColor={
                  colors.textMuted
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text
              style={[
                styles.helperText,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              Email is currently stored only
              on this screen.
            </Text>
          </View>

          {/* AGE */}

          <View
            style={
              styles.fieldContainer
            }
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Age
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor:
                    colors.input,

                  borderColor:
                    colors.inputBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.fieldIcon,
                  {
                    backgroundColor:
                      colors.primaryLight,
                  },
                ]}
              >
                <Calendar
                  size={19}
                  color={
                    colors.primary
                  }
                  strokeWidth={2}
                />
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    color:
                      colors.text,
                  },
                ]}
                value={age}
                onChangeText={
                  setAge
                }
                placeholder="Enter your age"
                placeholderTextColor={
                  colors.textMuted
                }
                keyboardType="numeric"
                maxLength={3}
              />

              <Text
                style={[
                  styles.unit,
                  {
                    color:
                      colors.textSecondary,
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
              color={
                colors.primary
              }
              strokeWidth={2}
            />,

            "gender",
            setGender
          )}

          {/* ==================================================
              BODY INFORMATION
          ================================================== */}

          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Body Information
          </Text>

          {/* HEIGHT */}

          <View
            style={
              styles.fieldContainer
            }
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Height
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor:
                    colors.input,

                  borderColor:
                    colors.inputBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.fieldIcon,
                  {
                    backgroundColor:
                      colors.primaryLight,
                  },
                ]}
              >
                <Ruler
                  size={19}
                  color={
                    colors.primary
                  }
                  strokeWidth={2}
                />
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    color:
                      colors.text,
                  },
                ]}
                value={height}
                onChangeText={
                  setHeight
                }
                placeholder="Enter your height"
                placeholderTextColor={
                  colors.textMuted
                }
                keyboardType="decimal-pad"
              />

              <Text
                style={[
                  styles.unit,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                cm
              </Text>
            </View>
          </View>

          {/* WEIGHT */}

          <View
            style={
              styles.fieldContainer
            }
          >
            <Text
              style={[
                styles.label,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              Weight
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor:
                    colors.input,

                  borderColor:
                    colors.inputBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.fieldIcon,
                  {
                    backgroundColor:
                      colors.primaryLight,
                  },
                ]}
              >
                <Weight
                  size={19}
                  color={
                    colors.primary
                  }
                  strokeWidth={2}
                />
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    color:
                      colors.text,
                  },
                ]}
                value={weight}
                onChangeText={
                  setWeight
                }
                placeholder="Enter your weight"
                placeholderTextColor={
                  colors.textMuted
                }
                keyboardType="decimal-pad"
              />

              <Text
                style={[
                  styles.unit,
                  {
                    color:
                      colors.textSecondary,
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
              color={
                colors.primary
              }
              strokeWidth={2}
            />,

            "activity",
            setActivityLevel
          )}

          {/* ==================================================
              FOOD PREFERENCES
          ================================================== */}

          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
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
              color={
                colors.primary
              }
              strokeWidth={2}
            />,

            "diet",
            setDiet
          )}

          {/* MEALS PER DAY */}

          {renderDropdown(
            "Meals Per Day",
            mealsPerDay,
            mealsOptions,

            <Utensils
              size={19}
              color={
                colors.primary
              }
              strokeWidth={2}
            />,

            "meals",
            setMealsPerDay
          )}

          {/* BUDGET */}

          {renderDropdown(
            "Food Budget",
            budget,
            budgetOptions,

            <IndianRupee
              size={19}
              color={
                colors.primary
              }
              strokeWidth={2}
            />,

            "budget",
            setBudget
          )}

          {/* ALLERGIES */}

          {renderTextArea(
            "Allergies / Food Restrictions",
            allergies,
            setAllergies,
            "e.g. Peanuts, lactose, gluten...",
            <ShieldAlert
              size={19}
              color={
                colors.primary
              }
              strokeWidth={2}
            />,
            "Separate multiple items with commas."
          )}

          {/* DISLIKED FOODS */}

          {renderTextArea(
            "Disliked Foods",
            dislikedFoods,
            setDislikedFoods,
            "e.g. broccoli, mushrooms...",
            <X
              size={19}
              color={
                colors.primary
              }
              strokeWidth={2}
            />,
            "Foods you do not want in your meal plans."
          )}

          {/* FAVORITE FOODS */}

          {renderTextArea(
            "Favorite Foods",
            favoriteFoods,
            setFavoriteFoods,
            "e.g. paneer, rice, chicken...",
            <Heart
              size={19}
              color={
                colors.primary
              }
              strokeWidth={2}
            />,
            "Foods you enjoy eating."
          )}

          {/* ==================================================
              CUISINE PREFERENCES
          ================================================== */}

          {renderCuisineSelector()}

          {/* ==================================================
              HEALTH & LIFESTYLE
          ================================================== */}

          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Health & Lifestyle
          </Text>

          {/* HEALTH CONSIDERATIONS */}

          {renderTextArea(
            "Health Considerations",
            healthConsiderations,
            setHealthConsiderations,
            "e.g. diabetes, high cholesterol, none...",
            <Heart
              size={19}
              color={
                colors.primary
              }
              strokeWidth={2}
            />,
            "Mention anything the meal planner should consider."
          )}

          {/* DAILY SCHEDULE */}

          {renderTextArea(
            "Daily Schedule",
            dailySchedule,
            setDailySchedule,
            "e.g. breakfast 8am, lunch 1pm, dinner 8pm...",
            <Clock
              size={19}
              color={
                colors.primary
              }
              strokeWidth={2}
            />,
            "Separate your meal timings with commas."
          )}

          {/* ==================================================
              HEALTH GOAL
          ================================================== */}

          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
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
              color={
                colors.primary
              }
              strokeWidth={2}
            />,

            "goal",
            setGoal
          )}

          {/* ==================================================
              SAVE BUTTON
          ================================================== */}

          <Pressable
            style={[
              styles.saveButton,
              {
                backgroundColor:
                  colors.primary,

                opacity:
                  saving
                    ? 0.7
                    : 1,
              },
            ]}
            onPress={
              handleSave
            }
            disabled={
              saving
            }
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Save
                size={20}
                color="#FFFFFF"
                strokeWidth={2.2}
              />
            )}

            <Text
              style={
                styles.saveButtonText
              }
            >
              {saving
                ? "Saving..."
                : "Save Information"}
            </Text>
          </Pressable>

          <Text
            style={[
              styles.bottomNote,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            Your information will help
            generate personalized meal plans.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({
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

    // ========================================================
    // HEADER
    // ========================================================

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
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

    // ========================================================
    // SECTION
    // ========================================================

    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 14,
      marginTop: 8,
    },

    // ========================================================
    // FIELD
    // ========================================================

    fieldContainer: {
      marginBottom: 17,
    },

    label: {
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 7,
    },

    helperText: {
      fontSize: 11,
      lineHeight: 16,
      marginTop: 6,
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

    // ========================================================
    // DROPDOWN
    // ========================================================

    dropdown: {
      minHeight: 54,
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
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
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    optionText: {
      fontSize: 14,
    },

    // ========================================================
    // TEXT AREA
    // ========================================================

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

    // ========================================================
    // CUISINE CHIPS
    // ========================================================

    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    chip: {
      minHeight: 38,
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    chipText: {
      fontSize: 12,
      fontWeight: "600",
    },

    // ========================================================
    // SAVE
    // ========================================================

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