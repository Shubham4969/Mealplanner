import {
  initializeApp,
  getApp,
  getApps,
} from "firebase/app";

import {
  Auth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  initializeAuth,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { getReactNativePersistence } from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { GoogleSignin } from "@react-native-google-signin/google-signin";

// =========================================================
// FIREBASE CONFIG
// =========================================================

const firebaseConfig = {
  apiKey: "AIzaSyCeG7mQdiDBEmRIcv9nKdLiwxlLZVzsT3c",
  authDomain: "meal-planner-cfae5.firebaseapp.com",
  projectId: "meal-planner-cfae5",
  storageBucket: "meal-planner-cfae5.firebasestorage.app",
  messagingSenderId: "935203519726",
  appId: "1:935203519726:web:421bf4f954f66b43b407ff",
};

// =========================================================
// INITIALIZE FIREBASE APP
// =========================================================

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

// =========================================================
// INITIALIZE FIREBASE AUTH
// =========================================================
//
// Your project uses:
// @react-native-async-storage/async-storage 2.2.0
//
// Therefore we use the AsyncStorage v2 persistence API.
//
// This makes Firebase remember the signed-in user after
// the React Native app is restarted.
// =========================================================

let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(
      AsyncStorage
    ),
  });
} catch (error) {
  // During Expo/Metro Fast Refresh, Firebase Auth may
  // already have been initialized.
  //
  // In that case reuse the existing Auth instance.
  auth = getAuth(app);
}

export { auth };

// =========================================================
// GOOGLE CONFIGURATION
// =========================================================
//
// This MUST be the OAuth 2.0 CLIENT ID whose type is:
//
// Web application
//
// Do NOT use:
// - Firebase App ID
// - Android Client ID
// =========================================================

const GOOGLE_WEB_CLIENT_ID =
  "935203519726-4u58fkkedv69n5v0c9f08fl2leq5rpmb.apps.googleusercontent.com";

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

// =========================================================
// EMAIL + PASSWORD SIGN UP
// =========================================================

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  const userCredential =
    await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

  const user = userCredential.user;

  if (cleanName) {
    await updateProfile(user, {
      displayName: cleanName,
    });
  }

  return userCredential;
}

// =========================================================
// EMAIL + PASSWORD SIGN IN
// =========================================================

export async function signInWithEmail(
  email: string,
  password: string
) {
  const cleanEmail = email.trim().toLowerCase();

  const userCredential =
    await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

  return userCredential;
}

// =========================================================
// GOOGLE SIGN IN
// =========================================================

export async function signInWithGoogle() {
  // Check Google Play Services first.
  await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });

  // Open Google's native account chooser.
  const response = await GoogleSignin.signIn({});

  // User cancelled Google sign-in.
  if (response.type !== "success") {
    throw new Error(
      "Google sign-in was cancelled."
    );
  }

  const idToken = response.data.idToken;

  if (!idToken) {
    throw new Error(
      "Google ID token was not returned. Check your Web OAuth Client ID."
    );
  }

  // Convert Google ID token into Firebase credential.
  const credential =
    GoogleAuthProvider.credential(idToken);

  // Sign into Firebase.
  const userCredential =
    await signInWithCredential(
      auth,
      credential
    );

  return userCredential;
}

// =========================================================
// FORGOT PASSWORD
// =========================================================

export async function resetPassword(
  email: string
) {
  const cleanEmail = email.trim().toLowerCase();

  return sendPasswordResetEmail(
    auth,
    cleanEmail
  );
}

// =========================================================
// SIGN OUT
// =========================================================

export async function signOutUser() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Ignore Google sign-out errors when the
    // current user was not signed in with Google.
  }

  await signOut(auth);
}

// =========================================================
// CURRENT USER
// =========================================================

export function getCurrentUser() {
  return auth.currentUser;
}