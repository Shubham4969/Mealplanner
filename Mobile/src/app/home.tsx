import React, { useCallback, useEffect, useState } from "react";
import { useFonts, GreatVibes_400Regular } from "@expo-google-fonts/great-vibes";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";


import { SafeAreaView } from "react-native-safe-area-context";

import * as ImagePicker from "expo-image-picker";

import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import {
  BarChart3,
  ChevronRight,
  FileText,
  Mic,
  Package,
  Plus,
  ShoppingCart,
  CircleUserRound,
  Utensils,
  Settings,
  EggFried,
  Salad,
  UtensilsCrossed,
} from "lucide-react-native";

import { router, useFocusEffect } from "expo-router";

import { useTheme } from "../context/ThemeContext";
import {
  getTodayMeals,
  askMealPlanner,
  transcribeAudio,
  type DailyMeal,
} from "../services/api";

const HEALTH_QUOTES = [
  { text: "Good food. Good mood.", author: "Healthy Living" },
  { text: "Nourish your body, nourish your life.", author: "Wellness Daily" },
  { text: "Eat well, live well.", author: "Meal Planner" },
  { text: "Your body deserves good nutrition.", author: "Healthy Living" },
  { text: "Small healthy choices create big changes.", author: "Wellness Daily" },
  { text: "Fuel your body, feed your soul.", author: "Healthy Living" },
  { text: "Eat fresh. Feel fresh.", author: "Meal Planner" },
  { text: "Healthy habits start with healthy food.", author: "Wellness Daily" },
  { text: "Make every meal a healthy choice.", author: "Healthy Living" },
  { text: "Nourish your body to flourish your life.", author: "Wellness Daily" },
  { text: "Choose food that fuels your body.", author: "Healthy Living" },
  { text: "Eat clean, stay strong, live well.", author: "Meal Planner" },
  { text: "A healthy meal is an investment in yourself.", author: "Wellness Daily" },
  { text: "Take care of your body. It is the only place you have to live.", author: "Healthy Living" },
  { text: "You are what you eat, so choose wisely.", author: "Meal Planner" },
  { text: "Healthy food makes you feel good.", author: "Wellness Daily" },
  { text: "Let food nourish you, not just fill you.", author: "Healthy Living" },
  { text: "Eat for the life you want to live.", author: "Meal Planner" },
  { text: "Wellness begins with what you put on your plate.", author: "Wellness Daily" },
  { text: "Feed your body what it needs.", author: "Healthy Living" },
  { text: "Better food, better energy, better days.", author: "Meal Planner" },
  { text: "Healthy eating is a form of self-respect.", author: "Wellness Daily" },
  { text: "Give your body the care it deserves.", author: "Healthy Living" },
  { text: "Eat green. Be healthy.", author: "Meal Planner" },
  { text: "Every healthy choice is a step toward a better you.", author: "Wellness Daily" },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const [fontsLoaded] = useFonts({
    GreatVibes_400Regular,
  });

  const [message, setMessage] = useState("");
  const [assistantResponse, setAssistantResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Audio recording with metering enabled so we can detect silence.
  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(recorder, 200);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const isRecordingRef = React.useRef(false);
  const micActionRef = React.useRef(false);
  const speechDetectedRef = React.useRef(false);
  const silenceTimerRef =
    React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRecordingTimerRef =
    React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [todayMeals, setTodayMeals] = useState<DailyMeal[]>([]);
  const [mealsLoading, setMealsLoading] = useState(false);

  const [quote, setQuote] = useState(HEALTH_QUOTES[0]);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  // Change the header quote automatically at a random time
  // between 1 and 2 hours.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const scheduleNextQuote = () => {
      const minDelay = 60 * 60 * 1000; // 1 hour
      const maxDelay = 2 * 60 * 60 * 1000; // 2 hours
      const delay =
        Math.floor(
          Math.random() * (maxDelay - minDelay + 1)
        ) + minDelay;

      timeout = setTimeout(() => {
        setQuote((currentQuote) => {
          const availableQuotes = HEALTH_QUOTES.filter(
            (item) => item.text !== currentQuote.text
          );

          return availableQuotes[
            Math.floor(Math.random() * availableQuotes.length)
          ];
        });

        scheduleNextQuote();
      }, delay);
    };

    scheduleNextQuote();

    return () => clearTimeout(timeout);
  }, []);
  const USER_ID = 1;

  // =========================================================
  // TODAY'S MEALS
  // =========================================================

  const loadTodayMeals = useCallback(async () => {
    try {
      setMealsLoading(true);

      const response = await getTodayMeals(USER_ID);

      if (response.success) {
        setTodayMeals(response.meals || []);
      } else {
        setTodayMeals([]);
      }
    } catch (error) {
      console.log("Today's meals error:", error);
      setTodayMeals([]);
    } finally {
      setMealsLoading(false);
    }
  }, []);

  // Reload whenever Home gets focus.
  // This immediately picks up a meal plan generated on
  // another screen and refreshes the current day's meals.
  useFocusEffect(
    useCallback(() => {
      loadTodayMeals();
    }, [loadTodayMeals])
  );

  // Refresh automatically at local midnight.
  // This avoids making an API request every minute.
  useEffect(() => {
    let midnightTimeout: ReturnType<typeof setTimeout>;

    const scheduleMidnightRefresh = () => {
      const now = new Date();

      // Calculate the next local midnight.
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);

      // Small buffer so the date has definitely changed.
      const delay = Math.max(
        1000,
        nextMidnight.getTime() - now.getTime() + 1000
      );

      midnightTimeout = setTimeout(async () => {
        await loadTodayMeals();
        scheduleMidnightRefresh();
      }, delay);
    };

    scheduleMidnightRefresh();

    return () => {
      clearTimeout(midnightTimeout);
    };
  }, [loadTodayMeals]);

  const getMealColors = (mealType: string) => {
    const type = mealType.toLowerCase();

    if (type.includes("breakfast")) {
      return {
        backgroundColor: "#62B8E8",
        borderColor: "#278FBE",
        iconBackground: "#39A9E8",
        iconColor: "#087FA6",
      };
    }

    if (type.includes("lunch")) {
      return {
        backgroundColor: "#F3C04F",
        borderColor: "#D39A18",
        iconBackground: "#F6C344",
        iconColor: "#B97900",
      };
    }

    if (type.includes("dinner")) {
      return {
        backgroundColor: "#E86A6A",
        borderColor: "#C83E3E",
        iconBackground: "#E85B5B",
        iconColor: "#B82F32",
      };
    }

    return {
      backgroundColor: "#8A7BE8",
      borderColor: "#6253C9",
      iconBackground: "#7767DD",
      iconColor: "#4D3FB4",
    };
  };

  const renderMealIcon = (mealType: string, color: string) => {
    const type = mealType.toLowerCase();

    if (type.includes("breakfast")) {
      return (
        <EggFried
          size={25}
          color={color}
          strokeWidth={2}
        />
      );
    }

    if (type.includes("lunch")) {
      return (
        <Salad
          size={25}
          color={color}
          strokeWidth={2}
        />
      );
    }

    return (
      <UtensilsCrossed
        size={25}
        color={color}
        strokeWidth={2}
      />
    );
  };

  // =========================================================
  // IMAGE PICKER
  // =========================================================

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        alert("Permission to access your photos is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;

        console.log("Selected image:", imageUri);

        // Later:
        // Send imageUri to your backend / AI agent.
      }
    } catch (error) {
      console.log("Image picker error:", error);

      alert("Something went wrong while selecting the image.");
    }
  };

  // =========================================================
  // MICROPHONE / AUTOMATIC SILENCE DETECTION / TRANSCRIPTION
  // =========================================================

  const clearVoiceTimers = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }
  };

  const stopAndTranscribe = useCallback(async () => {
    if (!isRecordingRef.current || micActionRef.current) {
      return;
    }

    micActionRef.current = true;
    clearVoiceTimers();

    try {
      console.log("Speech pause detected. Stopping recording...");

      await recorder.stop();

      isRecordingRef.current = false;
      setIsRecording(false);

      const audioUri = recorder.uri;
      console.log("Saved audio URI:", audioUri);

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      if (!audioUri) {
        throw new Error("No audio file was saved. Please try again.");
      }

      const FileSystem = await import("expo-file-system/legacy");
      const fileInfo = await FileSystem.getInfoAsync(audioUri);

      if (
        !fileInfo.exists ||
        !("size" in fileInfo) ||
        fileInfo.size <= 0
      ) {
        throw new Error("The audio recording is empty. Please try again.");
      }

      console.log("Audio file size:", fileInfo.size, "bytes");

      setIsTranscribing(true);
      console.log("Uploading audio for transcription...");

      const transcript = (await transcribeAudio(audioUri)).trim();

      if (!transcript) {
        throw new Error("No speech was detected. Please try again.");
      }

      console.log("Transcription result:", transcript);
      setMessage(transcript);

      // Submit the recognized query automatically; the user does not
      // need to press Send after speaking.
      setChatLoading(true);
      setAssistantResponse("");

      const response = await askMealPlanner(transcript, USER_ID);
      const answer =
        response.response ||
        response.message ||
        "I couldn't generate an answer right now.";

      setAssistantResponse(answer);
      setMessage("");
      console.log("Meal Planner voice query completed.");
    } catch (error) {
      console.error("Automatic voice query failed:", error);

      Alert.alert(
        "Voice Input Error",
        error instanceof Error
          ? error.message
          : "Unable to record or process your voice query."
      );
    } finally {
      clearVoiceTimers();
      isRecordingRef.current = false;
      micActionRef.current = false;
      setIsRecording(false);
      setIsTranscribing(false);
      setChatLoading(false);

      try {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      } catch (audioModeError) {
        console.warn("Could not restore audio mode:", audioModeError);
      }
    }
  }, [recorder]);

  // Watch the recorder's audio level. Once speech has been heard,
  // 1.8 seconds of quiet automatically stops the recording.
  useEffect(() => {
    if (!isRecording || !isRecordingRef.current) {
      return;
    }

    const level = recorderState.metering;

    // Some devices may briefly return no metering value.
    if (typeof level !== "number" || !Number.isFinite(level)) {
      return;
    }

    // Decibels closer to zero are louder. This is a starting threshold;
    // adjust it if very quiet speech or background noise causes problems.
    const speechThresholdDb = -42;

    if (level > speechThresholdDb) {
      speechDetectedRef.current = true;

      // The user has started speaking again, so cancel the stop timer.
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      return;
    }

    // Do not stop before the user has spoken at least once.
    if (!speechDetectedRef.current || silenceTimerRef.current) {
      return;
    }

    silenceTimerRef.current = setTimeout(() => {
      silenceTimerRef.current = null;
      void stopAndTranscribe();
    }, 1800);
  }, [recorderState.metering, isRecording, stopAndTranscribe]);

  // Safety timeout: stop after 30 seconds even if metering never reports
  // silence, so the microphone cannot remain active indefinitely.
  useEffect(() => {
    if (!isRecording) {
      return;
    }

    maxRecordingTimerRef.current = setTimeout(() => {
      console.log("Maximum voice recording time reached.");
      void stopAndTranscribe();
    }, 30000);

    return () => {
      if (maxRecordingTimerRef.current) {
        clearTimeout(maxRecordingTimerRef.current);
        maxRecordingTimerRef.current = null;
      }
    };
  }, [isRecording, stopAndTranscribe]);

  // Clear timers if the screen unmounts.
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (maxRecordingTimerRef.current) {
        clearTimeout(maxRecordingTimerRef.current);
      }
    };
  }, []);

  const handleMicPress = async () => {
    if (micActionRef.current || isTranscribing || chatLoading) {
      return;
    }

    // Keep a second tap as an optional manual-stop fallback. Normal use
    // automatically stops when silence is detected.
    if (isRecordingRef.current) {
      void stopAndTranscribe();
      return;
    }

    micActionRef.current = true;

    try {
      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Microphone Permission Required",
          "Please allow microphone access in Android Settings."
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      clearVoiceTimers();
      speechDetectedRef.current = false;

      await recorder.prepareToRecordAsync();
      recorder.record();

      isRecordingRef.current = true;
      setIsRecording(true);
      setMessage("");

      console.log("Recording started. Speak your query.");
      console.log("Recording will stop automatically after silence.");

    } catch (error) {
      console.error("Could not start voice recording:", error);

      isRecordingRef.current = false;
      setIsRecording(false);

      Alert.alert(
        "Microphone Error",
        error instanceof Error
          ? error.message
          : "Could not start recording."
      );

      try {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      } catch (audioModeError) {
        console.warn("Could not restore audio mode:", audioModeError);
      }
    } finally {
      micActionRef.current = false;
    }
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const sendMessage = async () => {
    const userMessage = message.trim();

    if (!userMessage || chatLoading) {
      return;
    }

    try {
      setChatLoading(true);
      setAssistantResponse("");
      setMessage("");

      // Home "Ask Meal Planner" uses the lightweight /ask endpoint.
      // This avoids the full orchestrator for simple questions.
      const response = await askMealPlanner(
        userMessage,
        USER_ID
      );

      const answer =
        response.response ||
        response.message ||
        "I couldn't generate an answer right now.";

      setAssistantResponse(answer);
    } catch (error: any) {
      console.error("Quick Meal Planner error:", error);

      Alert.alert(
        "Meal Planner",
        error?.message ||
          "Unable to connect to the Meal Planner assistant."
      );
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        {/* ================= COLLAPSING HOME HEADER ================= */}
        <Animated.View
          style={[
            styles.header,
            {
              backgroundColor: colors.card,
              height: scrollY.interpolate({
                inputRange: [0, 90],
                outputRange: [172, 70],
                extrapolate: "clamp",
              }),
            },
          ]}
        >
          {/* Greeting disappears while scrolling */}
          <Animated.View
            style={[
              styles.greetingAbsolute,
              {
                opacity: scrollY.interpolate({
                  inputRange: [0, 30, 65],
                  outputRange: [1, 0.45, 0],
                  extrapolate: "clamp",
                }),
                transform: [
                  {
                    translateY: scrollY.interpolate({
                      inputRange: [0, 90],
                      outputRange: [0, -18],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.greetingRow}>
              <Text style={[styles.greeting, { color: colors.text }]}>
                Hello, Shubham
              </Text>
              <Text style={styles.leaf}>🌿</Text>
            </View>
          </Animated.View>

          {/* Quote remains and becomes smaller */}
          {fontsLoaded && (
            <Animated.View
              style={[
                styles.quoteContainer,
                {
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.primary + "30",
                  top: scrollY.interpolate({
                    inputRange: [0, 90],
                    outputRange: [62, 10],
                    extrapolate: "clamp",
                  }),
                  width: scrollY.interpolate({
                    inputRange: [0, 90],
                    outputRange: [220, 205],
                    extrapolate: "clamp",
                  }),
                  minHeight: scrollY.interpolate({
                    inputRange: [0, 90],
                    outputRange: [66, 46],
                    extrapolate: "clamp",
                  }),
                  paddingVertical: scrollY.interpolate({
                    inputRange: [0, 90],
                    outputRange: [7, 3],
                    extrapolate: "clamp",
                  }),
                },
              ]}
            >
              <Animated.Text
                style={[
                  styles.quoteMark,
                  {
                    color: colors.primary,
                    fontSize: scrollY.interpolate({
                      inputRange: [0, 90],
                      outputRange: [38, 24],
                      extrapolate: "clamp",
                    }),
                    lineHeight: scrollY.interpolate({
                      inputRange: [0, 90],
                      outputRange: [42, 27],
                      extrapolate: "clamp",
                    }),
                  },
                ]}
              >
                “
              </Animated.Text>

              <View style={styles.quoteContent}>
                <Animated.Text
                  style={[
                    styles.quoteText,
                    {
                      color: colors.text,
                      fontFamily: "GreatVibes_400Regular",
                      fontSize: scrollY.interpolate({
                        inputRange: [0, 90],
                        outputRange: [18, 14],
                        extrapolate: "clamp",
                      }),
                      lineHeight: scrollY.interpolate({
                        inputRange: [0, 90],
                        outputRange: [25, 18],
                        extrapolate: "clamp",
                      }),
                    },
                  ]}
                  numberOfLines={2}
                >
                  {quote.text}
                </Animated.Text>

                <Animated.Text
                  style={[
                    styles.quoteAuthor,
                    {
                      color: colors.textSecondary,
                      fontSize: scrollY.interpolate({
                        inputRange: [0, 90],
                        outputRange: [10, 8],
                        extrapolate: "clamp",
                      }),
                    },
                  ]}
                >
                  — {quote.author}
                </Animated.Text>
              </View>
            </Animated.View>
          )}

          {/* Settings stays on the right */}
          <Animated.View
            style={{
              position: "absolute",
              right: 22,
              top: scrollY.interpolate({
                inputRange: [0, 90],
                outputRange: [55, 12],
                extrapolate: "clamp",
              }),
            }}
          >
            <Pressable
              style={[
                styles.profileButton,
                {
                  backgroundColor: colors.cardSecondary,
                },
              ]}
              onPress={() => router.push("/settings")}
            >
              <Settings
                size={24}
                color={colors.textSecondary}
                strokeWidth={2}
              />
            </Pressable>
          </Animated.View>
        </Animated.View>

        {/* ================= CONTENT ================= */}

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          onScroll={(event) => {
            scrollY.setValue(event.nativeEvent.contentOffset.y);
          }}
          scrollEventThrottle={16}
        >
          {/* ================= ASK MEAL PLANNER ================= */}

          <View style={styles.askContainer}>
            {/* PLUS / IMAGE */}

            <Pressable
              style={styles.plusButton}
              onPress={pickImage}
            >
              <Plus
                size={25}
                color="#A8B0BC"
                strokeWidth={2}
              />
            </Pressable>

            {/* TEXT INPUT */}

            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Ask Meal Planner..."
              placeholderTextColor={colors.textMuted}
              style={[
                styles.askInput,
                {
                  color: "#FFFFFF",
                },
              ]}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={sendMessage}
            />

            {/* ASK BAR MIC */}

            <Pressable
              style={[
                styles.micButton,
                isRecording && styles.recordingMicButton,
                (isTranscribing || chatLoading) && styles.disabledMicButton,
              ]}
              onPress={handleMicPress}
              disabled={isTranscribing || chatLoading}
            >
              <Mic
                size={24}
                color="#FFFFFF"
                strokeWidth={2}
              />
            </Pressable>
          </View>

          {/* ================= AI ANSWER ================= */}

          {(chatLoading || assistantResponse) && (
            <View
              style={[
                styles.answerCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.answerHeader}>
                <View
                  style={[
                    styles.answerIcon,
                    {
                      backgroundColor:
                        colors.primary + "20",
                    },
                  ]}
                >
                  <Utensils
                    size={20}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.answerHeaderText}>
                  <Text
                    style={[
                      styles.answerTitle,
                      { color: colors.text },
                    ]}
                  >
                    Meal Planner
                  </Text>

                  <Text
                    style={[
                      styles.answerSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {chatLoading
                      ? "Thinking..."
                      : "AI answer"}
                  </Text>
                </View>
              </View>

              {chatLoading ? (
                <Text
                  style={[
                    styles.answerText,
                    { color: colors.textSecondary },
                  ]}
                >
                  I'm checking your profile, pantry, and meal
                  planner knowledge...
                </Text>
              ) : (
                <Text
                  style={[
                    styles.answerText,
                    { color: colors.text },
                  ]}
                >
                  {assistantResponse}
                </Text>
              )}
            </View>
          )}

          {/* ================= TODAY'S MEALS ================= */}

          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Today's Meals
          </Text>

          <Pressable
            style={[
              styles.todayMealCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push("/meal-plan")}
          >
            <View style={styles.todayMealHeader}>
              <View>
                <Text
                  style={[
                    styles.todayMealTitle,
                    { color: colors.text },
                  ]}
                >
                  Today's Meal
                </Text>

                <Text
                  style={[
                    styles.todayMealSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {mealsLoading
                    ? "Loading today's meals..."
                    : todayMeals.length > 0
                      ? `${todayMeals.length} meals planned for today`
                      : "Generate a meal plan to see today's meals"}
                </Text>
              </View>

              <ChevronRight
                size={22}
                color={colors.textSecondary}
                strokeWidth={2}
              />
            </View>

            {mealsLoading ? (
              <View style={styles.mealsLoadingContainer}>
                <Text
                  style={[
                    styles.mealsLoadingText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Loading meals...
                </Text>
              </View>
            ) : todayMeals.length > 0 ? (
              todayMeals.map((meal) => {
                const mealColors = getMealColors(
                  meal.meal_type
                );

                return (
                  <View
                    key={meal.id}
                    style={[
                      styles.mealRow,
                      {
                        backgroundColor:
                          mealColors.backgroundColor,
                        borderColor:
                          mealColors.borderColor,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.mealIconBox,
                        {
                          backgroundColor:
                            mealColors.iconBackground,
                          borderColor:
                            mealColors.borderColor,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <View style={styles.mealIconPlate}>
                        {renderMealIcon(
                          meal.meal_type,
                          mealColors.iconColor
                        )}
                      </View>
                    </View>

                    <View style={styles.mealInfo}>
                      <Text
                        style={[
                          styles.mealType,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {meal.meal_type}
                      </Text>

                      <Text
                        style={[
                          styles.mealName,
                          { color: colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {meal.meal_name}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.noMealsContainer}>
                <Text
                  style={[
                    styles.noMealsText,
                    { color: colors.textSecondary },
                  ]}
                >
                  No meals are saved for today yet.
                </Text>

                <Pressable
                  style={[
                    styles.noMealsButton,
                    {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => router.push("/meal-plan")}
                >
                  <Text style={styles.noMealsButtonText}>
                    Create Meal Plan
                  </Text>
                </Pressable>
              </View>
            )}
          </Pressable>

          {/* ================= QUICK ACTIONS ================= */}

          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Quick Actions
          </Text>

          <View style={styles.quickGrid}>
            {/* MEAL PLAN */}
            <Pressable
              style={[
                styles.actionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push("/meal-plan")}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: "#268CF2",
                  },
                ]}
              >
                <Utensils
                  size={27}
                  color="#FFFFFF"
                  strokeWidth={2}
                />
              </View>

              <View style={styles.actionTextContainer}>
                <Text
                  style={[
                    styles.actionTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Meal Plan
                </Text>

                <Text
                  style={[
                    styles.actionDescription,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Get personalized{"\n"}
                  meal plans
                </Text>
              </View>

              <ChevronRight
                size={23}
                color={colors.textSecondary}
                strokeWidth={2}
                style={styles.cardArrow}
              />
            </Pressable>

            {/* GROCERY */}
            <Pressable
              style={[
                styles.actionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push("/grocery")}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: "#35C66A",
                  },
                ]}
              >
                <ShoppingCart
                  size={27}
                  color="#FFFFFF"
                  strokeWidth={2}
                />
              </View>

              <View style={styles.actionTextContainer}>
                <Text
                  style={[
                    styles.actionTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Grocery List
                </Text>

                <Text
                  style={[
                    styles.actionDescription,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Smart shopping{"\n"}
                  made easy
                </Text>
              </View>

              <ChevronRight
                size={23}
                color={colors.textSecondary}
                strokeWidth={2}
                style={styles.cardArrow}
              />
            </Pressable>

            {/* PANTRY */}
            <Pressable
              style={[
                styles.actionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push("/pantry")}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: "#FFA52F",
                  },
                ]}
              >
                <Package
                  size={27}
                  color="#FFFFFF"
                  strokeWidth={2}
                />
              </View>

              <View style={styles.actionTextContainer}>
                <Text
                  style={[
                    styles.actionTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Pantry
                </Text>

                <Text
                  style={[
                    styles.actionDescription,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Manage your{"\n"}
                  ingredients
                </Text>
              </View>

              <ChevronRight
                size={23}
                color={colors.textSecondary}
                strokeWidth={2}
                style={styles.cardArrow}
              />
            </Pressable>

            {/* NUTRITION */}
            <Pressable
              style={[
                styles.actionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push("/nutrition")}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: "#5B62E8",
                  },
                ]}
              >
                <BarChart3
                  size={27}
                  color="#FFFFFF"
                  strokeWidth={2}
                />
              </View>

              <View style={styles.actionTextContainer}>
                <Text
                  style={[
                    styles.actionTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Nutrition
                </Text>

                <Text
                  style={[
                    styles.actionDescription,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Track your{"\n"}
                  nutrition
                </Text>
              </View>

              <ChevronRight
                size={23}
                color={colors.textSecondary}
                strokeWidth={2}
                style={styles.cardArrow}
              />
            </Pressable>
          </View>

          <View style={styles.bottomSpace} />
        </Animated.ScrollView>

        {/* ================= BOTTOM NAVIGATION ================= */}

        <View
          style={[
            styles.bottomNav,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
            },
          ]}
        >
          {/* HOME */}

          <Pressable
            style={styles.navItem}
            onPress={() =>
              router.push("/home")
            }
          >
            <View style={styles.activeNavIcon}>
              <View style={styles.homeShape}>
                <Text
                  style={[
                    styles.homeSymbol,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  ⌂
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.activeNavText,
                {
                  color: colors.primary,
                },
              ]}
            >
              Home
            </Text>
          </Pressable>

          {/* CHAT */}

          <Pressable
            style={styles.navItem}
            onPress={() =>
              router.push("/chat")
            }
          >
            <View style={styles.navIcon}>
              <Text
                style={[
                  styles.chatSymbol,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                ○
              </Text>
            </View>

            <Text
              style={[
                styles.navText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Chat
            </Text>
          </Pressable>

          {/* CENTER MIC: opens the dedicated voice assistant screen.
              The upper Ask Meal Planner microphone keeps its existing behavior. */}

          <Pressable
            style={styles.centerMicButton}
            onPress={() => router.push("/voice")}
            accessibilityRole="button"
            accessibilityLabel="Open voice assistant"
          >
            <Mic
              size={29}
              color="#FFFFFF"
              strokeWidth={2}
            />
          </Pressable>

          {/* CART */}

          <Pressable
            style={styles.navItem}
            onPress={() =>
              router.push("/grocery")
            }
          >
            <View style={styles.cartNavWrapper}>
              <ShoppingCart
                size={26}
                color={colors.textSecondary}
                strokeWidth={2}
              />

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.card,
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  2
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.navText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Cart
            </Text>
          </Pressable>

          {/* PROFILE */}

          <Pressable
            style={styles.navItem}
            onPress={() => {
              router.push("/profile");
            }}
          >
            <View
              style={[
                styles.accountIconCircle,
                {
                  backgroundColor: colors.cardSecondary,
                },
              ]}
            >
              <CircleUserRound
                size={28}
                color={colors.textSecondary}
                strokeWidth={1.8}
              />
            </View>

            <Text
              style={[
                styles.navText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Account
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  /* ================= HEADER ================= */

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 22,
    overflow: "hidden",
  },

  greetingAbsolute: {
    position: "absolute",
    left: 22,
    top: 18,
  },

  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  greeting: {
    fontSize: 27,
    fontWeight: "600",
  },

  leaf: {
    fontSize: 27,
    marginLeft: 8,
  },

  quoteContainer: {
    marginTop: 8,
    maxWidth: 320,
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },

  quoteMark: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "700",
    marginRight: 5,
    alignSelf: "flex-start",
    marginTop: -2,
  },

  quoteContent: {
    flex: 1,
    paddingRight: 3,
  },

  quoteText: {
    fontSize: 18,
    lineHeight: 25,
  },

  quoteAuthor: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "600",
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ================= CONTENT ================= */

  content: {
    paddingTop: 192,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  /* ================= ASK BAR ================= */

  askContainer: {
    height: 58,
    borderRadius: 30,

    // Keep the Ask Meal Planner bar dark in both themes.
    backgroundColor: "#202124",

    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,

    elevation: 4,
  },

  plusButton: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
  },

  askInput: {
    flex: 1,
    height: 52,
    fontSize: 16,
    paddingHorizontal: 5,
  },

  micButton: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
  },

  recordingMicButton: {
    backgroundColor: "#E53935",
    borderRadius: 22,
  },

  disabledMicButton: {
    opacity: 0.5,
  },

  /* ================= SECTION ================= */

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 27,
    marginBottom: 15,
  },

  /* ================= QUICK ACTIONS ================= */

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  actionCard: {
    width: "48.2%",
    minHeight: 180,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,

    borderWidth: 1,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,

    elevation: 2,
  },

  actionIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  actionTextContainer: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 5,
  },

  actionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  cardArrow: {
    position: "absolute",
    right: 14,
    bottom: 17,
  },

  /* ================= RECENT ================= */

  recentCard: {
    minHeight: 76,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 13,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,

    elevation: 2,
  },

  recentIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  recentText: {
    flex: 1,
    marginLeft: 13,
  },

  recentTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  recentTime: {
    fontSize: 13,
    marginTop: 3,
  },

  /* ================= AI ANSWER ================= */

  answerCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginTop: 12,
    marginBottom: 8,
  },

  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  answerIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  answerHeaderText: {
    marginLeft: 11,
    flex: 1,
  },

  answerTitle: {
    fontSize: 16,
    fontWeight: "800",
  },

  answerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  answerText: {
    fontSize: 15,
    lineHeight: 23,
  },

  /* ================= TODAY'S MEALS ================= */

  mealsLoadingContainer: {
    paddingVertical: 18,
    alignItems: "center",
  },

  mealsLoadingText: {
    fontSize: 14,
  },

  noMealsContainer: {
    paddingVertical: 10,
    alignItems: "center",
  },

  noMealsText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },

  noMealsButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },

  noMealsButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  todayMealCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,

    elevation: 2,
  },

  todayMealHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  todayMealTitle: {
    fontSize: 17,
    fontWeight: "800",
  },

  todayMealSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 8,
    marginBottom: 6,
    borderRadius: 14,
    borderWidth: 1,
  },

  mealIconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  mealIconPlate: {
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  mealInfo: {
    flex: 1,
  },

  mealType: {
    fontSize: 12,
    marginBottom: 2,
  },

  mealName: {
    fontSize: 14,
    fontWeight: "700",
  },

  bottomSpace: {
    height: 20,
  },

  /* ================= BOTTOM NAV ================= */

  bottomNav: {
    height: 82,
    borderTopWidth: 1,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",

    paddingHorizontal: 8,
    paddingBottom: 8,
  },

  navItem: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  navIcon: {
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  accountIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -6,
  },

  activeNavIcon: {
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  homeShape: {
    width: 29,
    height: 29,
    alignItems: "center",
    justifyContent: "center",
  },

  homeSymbol: {
    fontSize: 31,
    lineHeight: 31,
    fontWeight: "700",
  },

  chatSymbol: {
    fontSize: 31,
    lineHeight: 28,
  },

  navText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },

  activeNavText: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },

  /* ================= CENTER MIC ================= */

  centerMicButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#202124",

    alignItems: "center",
    justifyContent: "center",

    marginTop: -28,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,

    elevation: 6,
  },

  recordingCenterMicButton: {
    backgroundColor: "#E53935",
  },

  disabledCenterMicButton: {
    opacity: 0.5,
  },

  /* ================= CART ================= */

  cartNavWrapper: {
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  badge: {
    position: "absolute",
    right: -9,
    top: -7,

    minWidth: 19,
    height: 19,
    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1.5,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});