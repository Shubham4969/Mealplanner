
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,

} from "react";

import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { useTheme } from "../context/ThemeContext";
import { sendChatMessage, getStoredUserId } from "../services/api";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

const QUICK_PROMPTS = [
  "Plan today's meals",
  "What can I cook with my pantry?",
  "Make a grocery list",
];

export default function ChatScreen() {
  const { colors } = useTheme();
  const { height: windowHeight } = useWindowDimensions();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text:
        "Hi! I'm your Meal Planner. Ask me about meals, your pantry, groceries or nutrition.",
    },
  ]);

  // --------------------------------------------------
  // ANDROID KEYBOARD FIX
  // Detect keyboard height and check whether Android
  // has resized the app window.
  // --------------------------------------------------

  const screenHeight = Dimensions.get("screen").height;

  const windowWasResized =
    keyboardHeight > 0 &&
    screenHeight - windowHeight > keyboardHeight * 0.5;

  // If Android hasn't resized the window, lift the
  // composer above the keyboard manually.
  const manuallyLiftComposer =
    Platform.OS === "android" &&
    keyboardHeight > 0 &&
    !windowWasResized;

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios"
        ? "keyboardWillShow"
        : "keyboardDidShow";

    const hideEvent =
      Platform.OS === "ios"
        ? "keyboardWillHide"
        : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(
      showEvent,
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );

    const hideSubscription = Keyboard.addListener(
      hideEvent,
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // --------------------------------------------------
  // AUTO SCROLL
  // --------------------------------------------------

  const scrollToLatest = useCallback(() => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    });
  }, []);

  useEffect(() => {
    if (keyboardHeight > 0) {
      scrollToLatest();
    }
  }, [keyboardHeight, scrollToLatest]);

  // --------------------------------------------------
  // SEND MESSAGE TO FASTAPI
  // --------------------------------------------------

  const sendMessage = async (messageText?: string) => {
    const text = (messageText ?? input).trim();

    if (!text || loading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    scrollToLatest();

    try {
      console.log("Sending message to FastAPI:", text);

       const userId = await getStoredUserId();
       const result = await sendChatMessage(text, userId);

      console.log("FASTAPI RESPONSE:", result);

      if (!result.success) {
        throw new Error(
          result.message ||
            "The backend could not process your request."
        );
      }

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text:
          result.response ||
          "Sorry, I couldn't generate a response.",
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("CHAT ERROR:", error);

      const errorText =
        error instanceof Error
          ? error.message
          : "Unable to connect to the Meal Planner backend.";

      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: `Sorry, something went wrong.\n\n${errorText}`,
      };

      setMessages((current) => [
        ...current,
        errorMessage,
      ]);
    } finally {
      setLoading(false);
      scrollToLatest();
    }
  };

  // --------------------------------------------------
  // WELCOME PROMPTS
  // --------------------------------------------------

  const choosePrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const hasStartedChat = messages.some(
    (message) => message.role === "user"
  );

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
      // iOS uses keyboard avoidance. Android uses its
      // native resize when available, with our fallback.
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* -------------------------------------------
          CHAT HISTORY
      ------------------------------------------- */}

      <ScrollView
        ref={scrollViewRef}
        style={styles.messages}
        contentContainerStyle={[
          styles.messageContent,
          {
            paddingBottom: manuallyLiftComposer
              ? keyboardHeight + 100
              : 16,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === "ios" ? "interactive" : "on-drag"
        }
        onContentSizeChange={scrollToLatest}
        showsVerticalScrollIndicator={false}
      >
        {/* WELCOME SECTION */}
        {!hasStartedChat && (
          <View style={styles.welcomeSection}>
            <View
              style={[
                styles.welcomeIcon,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.welcomeIconText}>✦</Text>
            </View>

            <Text
              style={[
                styles.welcomeTitle,
                { color: colors.text },
              ]}
            >
              Your personal{"\n"}Meal Planner
            </Text>

            <Text
              style={[
                styles.welcomeSubtitle,
                { color: colors.textSecondary },
              ]}
            >
              Plan delicious meals, manage your pantry,
              organize groceries and explore nutrition.
            </Text>

            <Text
              style={[
                styles.suggestionsTitle,
                { color: colors.text },
              ]}
            >
              What can I help you with?
            </Text>

            <View style={styles.promptList}>
              {QUICK_PROMPTS.map((prompt) => (
                <Pressable
                  key={prompt}
                  onPress={() => choosePrompt(prompt)}
                  style={({ pressed }) => [
                    styles.promptButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.promptText,
                      { color: colors.text },
                    ]}
                  >
                    {prompt}
                  </Text>

                  <Text
                    style={[
                      styles.promptArrow,
                      { color: colors.primary },
                    ]}
                  >
                    →
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* MESSAGES */}
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                isUser
                  ? styles.userRow
                  : styles.assistantRow,
              ]}
            >
              {!isUser && (
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.avatarText}>✦</Text>
                </View>
              )}

              <View
                style={[
                  styles.message,
                  isUser
                    ? [
                        styles.userMessage,
                        {
                          backgroundColor: colors.primary,
                        },
                      ]
                    : [
                        styles.assistantMessage,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ],
                ]}
              >
                {!isUser && (
                  <Text
                    style={[
                      styles.senderLabel,
                      { color: colors.primary },
                    ]}
                  >
                    MEAL PLANNER
                  </Text>
                )}

                <Text
                  selectable
                  style={[
                    styles.messageText,
                    {
                      color: isUser ? "#FFFFFF" : colors.text,
                    },
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          );
        })}

        {/* LOADING INDICATOR */}
        {loading && (
          <View style={styles.messageRow}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.avatarText}>✦</Text>
            </View>

            <View
              style={[
                styles.message,
                styles.assistantMessage,
                styles.loadingMessage,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <ActivityIndicator
                size="small"
                color={colors.primary}
              />

              <Text
                style={[
                  styles.loadingText,
                  { color: colors.textSecondary },
                ]}
              >
                Preparing your answer...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* -------------------------------------------
          INPUT BAR
          When Android overlays the keyboard, move
          the composer above it using translateY.
      ------------------------------------------- */}

      <View
        style={[
          styles.inputArea,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          manuallyLiftComposer && {
            transform: [
              { translateY: -keyboardHeight },
            ],
            zIndex: 20,
            elevation: 20,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.input,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            value={input}
            onChangeText={setInput}
            placeholder="Ask your Meal Planner..."
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              { color: colors.text },
            ]}
            multiline
            editable={!loading}
            maxLength={4000}
            textAlignVertical="center"
            accessibilityLabel="Message your Meal Planner"
            blurOnSubmit={false}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor:
                !input.trim() || loading
                  ? colors.textMuted
                  : colors.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.sendText}>↑</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  messages: {
    flex: 1,
  },

  messageContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Welcome section
  welcomeSection: {
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 28,
  },

  welcomeIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  welcomeIconText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "700",
  },

  welcomeTitle: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },

  welcomeSubtitle: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    maxWidth: 310,
    marginBottom: 26,
  },

  suggestionsTitle: {
    width: "100%",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },

  promptList: {
    width: "100%",
  },

  promptButton: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  promptText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    marginRight: 12,
  },

  promptArrow: {
    fontSize: 23,
    fontWeight: "600",
  },

  // Message layout
  messageRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },

  assistantRow: {
    justifyContent: "flex-start",
  },

  userRow: {
    justifyContent: "flex-end",
  },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 2,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },

  message: {
    maxWidth: "84%",
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 19,
  },

  assistantMessage: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderBottomLeftRadius: 5,
  },

  userMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
  },

  senderLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 23,
  },

  loadingMessage: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
  },

  loadingText: {
    fontSize: 13,
    marginLeft: 10,
  },

  // Composer
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  inputWrapper: {
    flex: 1,
    minHeight: 50,
    maxHeight: 125,
    borderWidth: 1,
    borderRadius: 20,
    justifyContent: "center",
    paddingHorizontal: 14,
    marginRight: 10,
  },

  input: {
    width: "100%",
    minHeight: 46,
    maxHeight: 118,
    paddingVertical: 11,
    fontSize: 16,
    lineHeight: 22,
  },

  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  sendText: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "700",
    marginTop: -2,
  },
});
