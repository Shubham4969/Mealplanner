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
  User,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";

import {
  signUpWithEmail,
  signInWithGoogle,
} from "../services/firebase";

export default function SignUpScreen() {
  const { colors } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  // =========================================================
  // EMAIL/PASSWORD SIGN UP
  // =========================================================

  const handleSignUp = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (
      !cleanName ||
      !cleanEmail ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert(
        "Missing information",
        "Please fill in all the fields."
      );
      return;
    }

    if (!cleanEmail.includes("@")) {
      Alert.alert(
        "Invalid email",
        "Please enter a valid email address."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Password too short",
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Passwords don't match",
        "Please make sure both passwords are the same."
      );
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signUpWithEmail(
        cleanEmail,
        password,
        cleanName
      );

      console.log(
        "Account created:",
        userCredential.user.email
      );

      router.replace("/home");
    } catch (error: any) {
      console.error(
        "Email sign-up error:",
        error
      );

      let message =
        "Unable to create your account.";

      switch (error?.code) {
        case "auth/email-already-in-use":
          message =
            "An account with this email already exists. Please sign in.";
          break;

        case "auth/invalid-email":
          message =
            "Please enter a valid email address.";
          break;

        case "auth/weak-password":
          message =
            "Please choose a stronger password.";
          break;

        case "auth/network-request-failed":
          message =
            "Network error. Please check your internet connection.";
          break;

        case "auth/operation-not-allowed":
          message =
            "Email/password authentication is not enabled in Firebase.";
          break;
      }

      Alert.alert(
        "Sign Up Failed",
        message
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GOOGLE SIGN UP
  // =========================================================

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);

      const userCredential = await signInWithGoogle();

      console.log(
        "Google account authenticated:",
        userCredential.user.email
      );

      router.replace("/home");
    } catch (error: any) {
      console.error(
        "Google sign-up error:",
        error
      );

      Alert.alert(
        "Google Sign-Up Failed",
        error?.message ||
          "Unable to continue with Google."
      );
    } finally {
      setLoading(false);
    }
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
        {/* BACK BUTTON */}

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

        {/* LOGO */}

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

        {/* TITLE */}

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Create your account
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Join Meal Planner and start eating healthier.
        </Text>

        <View style={styles.form}>
          {/* NAME */}

          <Text
            style={[
              styles.label,
              {
                color: colors.text,
              },
            ]}
          >
            Full name
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
            <User
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
              placeholder="Enter your full name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* EMAIL */}

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
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* PASSWORD */}

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
              placeholder="Create a password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Pressable
              onPress={() =>
                setShowPassword(!showPassword)
              }
              disabled={loading}
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

          {/* CONFIRM PASSWORD */}

          <Text
            style={[
              styles.label,
              {
                color: colors.text,
              },
            ]}
          >
            Confirm password
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
              placeholder="Confirm your password"
              placeholderTextColor={colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Pressable
              onPress={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              disabled={loading}
            >
              {showConfirmPassword ? (
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

          {/* SIGN UP */}

          <Pressable
            style={[
              styles.signUpButton,
              {
                backgroundColor: colors.primary,
                opacity: loading ? 0.6 : 1,
              },
            ]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.signUpText}>
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </Text>
          </Pressable>

          {/* OR */}

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

          {/* GOOGLE */}

          <Pressable
            style={[
              styles.googleButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: loading ? 0.6 : 1,
              },
            ]}
            onPress={handleGoogleSignUp}
            disabled={loading}
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

          {/* SIGN IN */}

          <View style={styles.signInContainer}>
            <Text
              style={[
                styles.signInLabel,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Already have an account?
            </Text>

            <Pressable
              onPress={() =>
                router.replace("/sign-in")
              }
              disabled={loading}
            >
              <Text
                style={[
                  styles.signInText,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                Sign In
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =========================================================
// STYLES
// =========================================================

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
    marginBottom: 20,
    borderWidth: 1,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 18,
  },

  logo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
    paddingHorizontal: 25,
  },

  form: {
    marginTop: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 14,
  },

  inputContainer: {
    height: 54,
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

  signUpButton: {
    height: 56,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },

  signUpText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
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
    height: 54,
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

  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },

  signInLabel: {
    fontSize: 14,
  },

  signInText: {
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 5,
  },
});