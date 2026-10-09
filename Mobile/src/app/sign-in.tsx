import React, { useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncUserWithBackend } from "../services/api";

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
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../services/firebase";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Leaf,
  Mail,
  Lock,
} from "lucide-react-native";

import { useTheme } from "../context/ThemeContext";

import {
  signInWithEmail,
  signInWithGoogle,
  resetPassword,
} from "../services/firebase";

export default function SignInScreen() {
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // =========================================================
  // EMAIL/PASSWORD SIGN IN
  // =========================================================

  const getAuthErrorMessage = (code?: string) => {
  switch (code) {
    case "auth/invalid-credential":
      return "Invalid email or password.";

    case "auth/user-not-found":
      return "No account found with this email.";

    case "auth/wrong-password":
      return "Incorrect password.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    default:
      return "Unable to sign in. Please try again.";
  }
};
  const handleSignIn = async () => {
  if (!email.trim() || !password) {
    Alert.alert(
      "Missing information",
      "Please enter your email and password."
    );
    return;
  }

  try {
    setLoading(true);

    // 1. Firebase login
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const firebaseUser = credential.user;

    console.log(
      "Email sign-in successful:",
      firebaseUser.email
    );

    // 2. Get Firebase user information
    const authenticatedEmail =
  firebaseUser.email?.trim().toLowerCase();

const displayName =
  firebaseUser.displayName?.trim() || null;

if (!authenticatedEmail) {
  throw new Error(
    "Firebase account does not have an email address."
  );
}

// Get a Firebase ID token for backend verification.
const idToken = await firebaseUser.getIdToken();

// Sync Firebase user with PostgreSQL.
console.log("Syncing user with backend...");

const syncResponse = await syncUserWithBackend(
  idToken,
  displayName
);

    console.log(
      "Backend sync response:",
      syncResponse
    );

    // 4. Make sure backend returned numeric user_id
    if (
      !syncResponse.success ||
      !syncResponse.data?.user_id
    ) {
      throw new Error(
        syncResponse.message ||
        "Backend user synchronization failed."
      );
    }

    const backendUserId =
      syncResponse.data.user_id;

    console.log(
      "Backend user_id:",
      backendUserId
    );

    // 5. Save PostgreSQL user_id
    await AsyncStorage.setItem(
      "user_id",
      String(backendUserId)
    );

    // Optional but useful
    await AsyncStorage.setItem(
      "user_email",
      authenticatedEmail
    );

    await AsyncStorage.setItem(
      "user_name",
      displayName ||
        authenticatedEmail.split("@")[0]
    );

    // 6. Verify that it was actually saved
    const savedUserId =
      await AsyncStorage.getItem("user_id");

    console.log(
      "Saved AsyncStorage user_id:",
      savedUserId
    );

    if (!savedUserId) {
      throw new Error(
        "Failed to save user_id in AsyncStorage."
      );
    }

    // 7. Now go to home
    router.replace("/home");

  } catch (error: any) {
    console.log(
      "Email sign-in error:",
      error
    );

    Alert.alert(
      "Sign in failed",
      error?.message ||
        getAuthErrorMessage(error?.code)
    );
  } finally {
    setLoading(false);
  }
};

  // =========================================================
  // GOOGLE SIGN IN
  // =========================================================

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      const userCredential = await signInWithGoogle();

      console.log(
        "Google sign-in successful:",
        userCredential.user.email
      );

      router.replace("/home");
    } catch (error: any) {
      console.error("Google sign-in error:", error);

      const message =
        error?.message ||
        "Unable to sign in with Google.";

      Alert.alert(
        "Google Sign-In Failed",
        message
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORGOT PASSWORD
  // =========================================================

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      Alert.alert(
        "Enter your email",
        "Please enter your email address first."
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

    try {
      setLoading(true);

      await resetPassword(cleanEmail);

      Alert.alert(
        "Password reset email sent",
        "Check your email for instructions to reset your password."
      );
    } catch (error: any) {
      console.error(
        "Password reset error:",
        error
      );

      let message =
        "Unable to send password reset email.";

      if (error?.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      }

      Alert.alert(
        "Password Reset Failed",
        message
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

        {/* FORM */}

        <View style={styles.form}>
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
              placeholder="Enter your password"
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

          {/* FORGOT PASSWORD */}

          <Pressable
            style={styles.forgotButton}
            onPress={handleForgotPassword}
            disabled={loading}
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

          {/* SIGN IN */}

          <Pressable
            style={[
              styles.signInButton,
              {
                backgroundColor: colors.primary,
                opacity: loading ? 0.6 : 1,
              },
            ]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.signInText}>
              {loading ? "Signing In..." : "Sign In"}
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
            onPress={handleGoogleSignIn}
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

          {/* SIGN UP */}

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
              disabled={loading}
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