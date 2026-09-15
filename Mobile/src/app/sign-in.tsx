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

import { router } from "expo-router";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Leaf,
  Mail,
  Lock,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";

export default function SignInScreen() {
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const handleSignIn = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter your email and password."
      );
      return;
    }

    // Temporary navigation.
    // We will connect this to your backend authentication later.
    router.replace("/home");
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
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
          />
        </Pressable>

        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logo,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Leaf
              size={32}
              color="#FFFFFF"
              strokeWidth={2.2}
            />
          </View>
        </View>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Welcome back
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Sign in to continue planning healthier meals.
        </Text>

        <View style={styles.form}>
          <Text
            style={[
              styles.label,
              {
                color: colors.text,
              },
            ]}
          >
            Email
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
            <Mail
              size={20}
              color={colors.textMuted}
            />

            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={
                colors.textMuted
              }
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text
            style={[
              styles.label,
              {
                color: colors.text,
              },
            ]}
          >
            Password
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
            <Lock
              size={20}
              color={colors.textMuted}
            />

            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={
                colors.textMuted
              }
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            <Pressable
              onPress={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <EyeOff
                  size={21}
                  color={colors.textMuted}
                />
              ) : (
                <Eye
                  size={21}
                  color={colors.textMuted}
                />
              )}
            </Pressable>
          </View>

          <Pressable
            style={styles.forgotButton}
            onPress={() =>
              Alert.alert(
                "Coming soon",
                "Password recovery will be connected to the backend."
              )
            }
          >
            <Text
              style={[
                styles.forgotText,
                {
                  color: colors.primary,
                },
              ]}
            >
              Forgot password?
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.signInButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={handleSignIn}
          >
            <Text style={styles.signInText}>
              Sign In
            </Text>
          </Pressable>

          <View style={styles.dividerContainer}>
            <View
              style={[
                styles.divider,
                {
                  backgroundColor: colors.divider,
                },
              ]}
            />

            <Text
              style={[
                styles.orText,
                {
                  color: colors.textMuted,
                },
              ]}
            >
              OR
            </Text>

            <View
              style={[
                styles.divider,
                {
                  backgroundColor: colors.divider,
                },
              ]}
            />
          </View>

          <Pressable
            style={[
              styles.googleButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() =>
              Alert.alert(
                "Coming soon",
                "Google Sign In will be connected later."
              )
            }
          >
            <Text style={styles.googleG}>
              G
            </Text>

            <Text
              style={[
                styles.googleText,
                {
                  color: colors.text,
                },
              ]}
            >
              Continue with Google
            </Text>
          </Pressable>

          <View style={styles.signupContainer}>
            <Text
              style={[
                styles.signupLabel,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Don't have an account?
            </Text>

            <Pressable
              onPress={() =>
                router.push("/sign-up")
              }
            >
              <Text
                style={[
                  styles.signupText,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                Sign Up
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 55,
    paddingBottom: 35,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    borderWidth: 1,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 22,
  },

  logo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 9,
    paddingHorizontal: 25,
  },

  form: {
    marginTop: 35,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 17,
  },

  inputContainer: {
    height: 56,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  input: {
    flex: 1,
    fontSize: 15,
    marginLeft: 11,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 11,
  },

  forgotText: {
    fontSize: 14,
    fontWeight: "700",
  },

  signInButton: {
    height: 56,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },

  signInText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },

  divider: {
    flex: 1,
    height: 1,
  },

  orText: {
    fontSize: 12,
    fontWeight: "700",
    marginHorizontal: 13,
  },

  googleButton: {
    height: 56,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  googleG: {
    color: "#4285F4",
    fontSize: 20,
    fontWeight: "800",
    marginRight: 10,
  },

  googleText: {
    fontSize: 15,
    fontWeight: "700",
  },

  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },

  signupLabel: {
    fontSize: 14,
  },

  signupText: {
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 5,
  },
});