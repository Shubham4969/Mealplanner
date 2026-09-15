import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useTheme } from "../context/ThemeContext";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

export default function ChatScreen() {
  const { colors } = useTheme();

  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text:
        "Hi! I'm your Meal Planner. Ask me about meals, your pantry, groceries or nutrition.",
    },
  ]);

  const sendMessage = () => {
    const text = input.trim();

    if (!text) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: "user",
        text,
      },
      {
        id: Date.now() + 1,
        role: "assistant",
        text:
          "I received your request. The FastAPI backend will process this through your MealPlannerOrchestrator once connected.",
      },
    ]);

    setInput("");
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      behavior={
        Platform.OS === "ios" ? "padding" : undefined
      }
    >
      <ScrollView
        style={[
          styles.messages,
          {
            backgroundColor: colors.background,
          },
        ]}
        contentContainerStyle={styles.messageContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.message,
              message.role === "user"
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
            <Text
              style={[
                styles.messageText,
                {
                  color:
                    message.role === "user"
                      ? "#FFFFFF"
                      : colors.text,
                },
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View
        style={[
          styles.inputArea,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask something..."
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: colors.input,
              color: colors.text,
              borderColor: colors.inputBorder,
            },
          ]}
          multiline
        />

        <Pressable
          style={[
            styles.sendButton,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={sendMessage}
        >
          <Text style={styles.sendText}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  messages: {
    flex: 1,
  },

  messageContent: {
    padding: 18,
  },

  message: {
    maxWidth: "84%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },

  assistantMessage: {
    alignSelf: "flex-start",
    borderWidth: 1,
  },

  userMessage: {
    alignSelf: "flex-end",
  },

  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },

  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
  },

  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 110,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
  },

  sendButton: {
    width: 48,
    height: 48,
    marginLeft: 8,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  sendText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
});