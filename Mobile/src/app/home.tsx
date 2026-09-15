import React, { useEffect, useState } from "react";
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
  SpeechToTextMode,
  SpeechToTextPermissionStatus,
  useSpeechToText,
} from "react-native-expo-speech-to-text";

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

import { router } from "expo-router";

import { useTheme } from "../context/ThemeContext";

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
  const [speechLocale, setSpeechLocale] = useState("en-US");

  // =========================================================
  // SPEECH TO TEXT
  // =========================================================

  const speech = useSpeechToText({
    locale: speechLocale,
    mode: SpeechToTextMode.Single,
    enablePartialResults: true,
    silenceTimeoutMs: 5000,
    enableCleanup: false,
  });

  // Put live/final speech directly into the input box.
  useEffect(() => {
    if (speech.transcript) {
      setMessage(speech.transcript);
    }
  }, [speech.transcript]);

  // Detect speech locales available on this Android device.
  useEffect(() => {
    let mounted = true;

    const loadSpeechLocales = async () => {
      try {
        const locales = await speech.getSupportedLocales();
        console.log("Supported speech locales:", locales);

        const normalizedLocales = locales.map((locale) =>
          locale.toLowerCase()
        );

        const preferredLocale = normalizedLocales.includes("en-in")
          ? locales[normalizedLocales.indexOf("en-in")]
          : normalizedLocales.includes("en-us")
            ? locales[normalizedLocales.indexOf("en-us")]
            : null;

        if (mounted && preferredLocale) {
          console.log("Selected speech locale:", preferredLocale);
          setSpeechLocale(preferredLocale);
        } else if (mounted) {
          console.log(
            "Neither en-IN nor en-US is reported as supported."
          );
        }
      } catch (error) {
        console.log(
          "Could not load supported speech locales:",
          error
        );
      }

      try {
        const capabilities = await speech.getCapabilities();
        console.log("Speech capabilities:", capabilities);
      } catch (error) {
        console.log(
          "Could not load speech capabilities:",
          error
        );
      }
    };

    loadSpeechLocales();

    return () => {
      mounted = false;
    };
  }, []);

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
  // MICROPHONE / SPEECH TO TEXT
  // =========================================================

  const handleMicPress = async () => {
    try {
      console.log("=================================");
      console.log("MIC BUTTON PRESSED");
      console.log("=================================");

      if (speech.stopping) {
        console.log("Speech recognition is still stopping...");
        return;
      }

      // If recognition is already active, stop it.
      if (speech.listening) {
        console.log("Stopping speech recognition...");
        await speech.stopListening();
        return;
      }

      console.log("Speech available:", speech.available);
      console.log("Speech ready:", speech.ready);
      console.log(
        "Speech permission:",
        speech.permissionStatus
      );
      console.log(
        "Speech capabilities:",
        speech.capabilities
      );
      console.log("Speech last error:", speech.lastError);

      // Check native speech recognition before starting.
      if (!speech.available) {
        Alert.alert(
          "Speech Recognition Unavailable",
          "Android does not currently have a usable speech recognition service. Make sure Google Speech Services is installed/enabled on the device, then try again."
        );
        return;
      }

      // Request permissions only after the user presses the mic.
      const permission = await speech.requestPermissions();

      console.log("Permission result:", permission);

      if (
        permission !==
        SpeechToTextPermissionStatus.Granted
      ) {
        Alert.alert(
          "Microphone Permission Required",
          "Please allow microphone and speech-recognition permissions in Android Settings."
        );
        return;
      }

      // Clear previous result.
      speech.resetTranscript();
      setMessage("");

      // Prepare on-device speech models.
      if (!speech.ready) {
        console.log(
          "Speech engine is not ready. Preparing on-device models..."
        );

        try {
          await speech.prepareOnDeviceModels();

          console.log(
            "On-device model preparation completed."
          );
          console.log(
            "Ready after preparation:",
            speech.ready
          );
        } catch (modelError) {
          console.log(
            "On-device model preparation error:",
            modelError
          );

          console.log(
            "Continuing with normal speech recognition attempt..."
          );
        }
      }

      console.log("Starting speech recognition...");

      await speech.startListening();

      console.log("Speech recognition started.");
      console.log(
        "Listening after start:",
        speech.listening
      );
      console.log("Ready after start:", speech.ready);
      console.log(
        "Last error after start:",
        speech.lastError
      );
    } catch (error) {
      console.log("=================================");
      console.log("SPEECH TO TEXT ERROR");
      console.log("=================================");
      console.log("Error:", error);
      console.log("Available:", speech.available);
      console.log("Ready:", speech.ready);
      console.log(
        "Permission:",
        speech.permissionStatus
      );
      console.log(
        "Capabilities:",
        speech.capabilities
      );
      console.log(
        "Last error:",
        speech.lastError
      );

      Alert.alert(
        "Speech Recognition Error",
        speech.lastError?.message ||
          "Unable to start voice input. Please make sure Google Speech Services is installed and enabled, then try again."
      );
    }
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const sendMessage = () => {
    if (!message.trim()) return;

    console.log("User message:", message);

    // Backend connection will be added later.
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
              onSubmitEditing={sendMessage}
            />

            {/* ASK BAR MIC */}

            <Pressable
              style={[
                styles.micButton,
                speech.listening &&
                  styles.recordingMicButton,
                speech.stopping &&
                  styles.disabledMicButton,
              ]}
              onPress={handleMicPress}
              disabled={speech.stopping}
            >
              <Mic
                size={24}
                color="#FFFFFF"
                strokeWidth={2}
              />
            </Pressable>
          </View>

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
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Today's Meal
                </Text>

                <Text
                  style={[
                    styles.todayMealSubtitle,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Your meals for today
                </Text>
              </View>

              <ChevronRight
                size={22}
                color={colors.textSecondary}
                strokeWidth={2}
              />
            </View>

            {/* BREAKFAST */}
            <View
              style={[
                styles.mealRow,
                {
                  backgroundColor: "#62B8E8",
                  borderColor: "#278FBE",
                },
              ]}
            >
              <View
                style={[
                  styles.mealIconBox,
                  {
                    backgroundColor: "#39A9E8",
                    borderColor: "#1789C7",
                    borderWidth: 1,
                  },
                ]}
              >
                <View style={styles.mealIconPlate}>
                  <EggFried
                    size={25}
                    color="#087FA6"
                    strokeWidth={2}
                  />
                </View>
              </View>

              <View style={styles.mealInfo}>
                <Text
                  style={[
                    styles.mealType,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Breakfast
                </Text>

                <Text
                  style={[
                    styles.mealName,
                    {
                      color: colors.text,
                    },
                  ]}
                  numberOfLines={1}
                >
                  Oatmeal with Banana
                </Text>
              </View>
            </View>

            {/* LUNCH */}
            <View
              style={[
                styles.mealRow,
                {
                  backgroundColor: "#F3C04F",
                  borderColor: "#D39A18",
                },
              ]}
            >
              <View
                style={[
                  styles.mealIconBox,
                  {
                    backgroundColor: "#F6C344",
                    borderColor: "#D59B16",
                    borderWidth: 1,
                  },
                ]}
              >
                <View style={styles.mealIconPlate}>
                  <Salad
                    size={25}
                    color="#B97900"
                    strokeWidth={2}
                  />
                </View>
              </View>

              <View style={styles.mealInfo}>
                <Text
                  style={[
                    styles.mealType,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Lunch
                </Text>

                <Text
                  style={[
                    styles.mealName,
                    {
                      color: colors.text,
                    },
                  ]}
                  numberOfLines={1}
                >
                  Paneer Rice Bowl
                </Text>
              </View>
            </View>

            {/* DINNER */}
            <View
              style={[
                styles.mealRow,
                {
                  backgroundColor: "#E86A6A",
                  borderColor: "#C83E3E",
                },
              ]}
            >
              <View
                style={[
                  styles.mealIconBox,
                  {
                    backgroundColor: "#E85B5B",
                    borderColor: "#C83D3D",
                    borderWidth: 1,
                  },
                ]}
              >
                <View style={styles.mealIconPlate}>
                  <UtensilsCrossed
                    size={25}
                    color="#B82F32"
                    strokeWidth={2}
                  />
                </View>
              </View>

              <View style={styles.mealInfo}>
                <Text
                  style={[
                    styles.mealType,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Dinner
                </Text>

                <Text
                  style={[
                    styles.mealName,
                    {
                      color: colors.text,
                    },
                  ]}
                  numberOfLines={1}
                >
                  Vegetable Roti
                </Text>
              </View>
            </View>
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

          {/* CENTER MIC */}

          <Pressable
            style={[
              styles.centerMicButton,
              speech.listening &&
                styles.recordingCenterMicButton,
              speech.stopping &&
                styles.disabledCenterMicButton,
            ]}
            onPress={handleMicPress}
            disabled={speech.stopping}
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