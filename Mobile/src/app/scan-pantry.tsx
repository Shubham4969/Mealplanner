import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "../context/ThemeContext";

export default function ScanPantryScreen() {
  const { colors } = useTheme();

  const [imageUri, setImageUri] =
    useState<string | null>(null);

  const [items, setItems] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setItems([]);
    }
  };

  const takePhoto = async () => {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow camera access."
      );
      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setItems([]);
    }
  };

  const identifyItems = async () => {
    if (!imageUri) {
      Alert.alert(
        "Select image",
        "Select or capture a pantry image first."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * Backend integration will be added here.
       *
       * Eventually:
       *
       * Mobile
       *   ↓
       * FastAPI /image
       *   ↓
       * Image_Uploader/image.py
       *   ↓
       * OpenAI Vision
       *   ↓
       * PantryAgent
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      setItems([
        "Rice",
        "Dal",
        "Tomatoes",
        "Onions",
        "Potatoes",
      ]);
    } catch {
      Alert.alert(
        "Scan failed",
        "Unable to identify ingredients."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      contentContainerStyle={styles.content}
    >
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        Scan Pantry
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        Take a photo or choose an image to identify
        ingredients.
      </Text>

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.preview}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={styles.cameraIcon}>📷</Text>

          <Text
            style={[
              styles.placeholderTitle,
              {
                color: colors.text,
              },
            ]}
          >
            No image selected
          </Text>

          <Text
            style={[
              styles.placeholderText,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Add a pantry photo to get started.
          </Text>
        </View>
      )}

      <View style={styles.buttons}>
        <Pressable
          style={[
            styles.primaryButton,
            {
              backgroundColor: "#208AEF",
            },
          ]}
          onPress={takePhoto}
        >
          <Text style={styles.buttonText}>
            📷 Take Photo
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.secondaryButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={pickImage}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              {
                color: "#208AEF",
              },
            ]}
          >
            🖼️ Choose Image
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={[
          styles.scanButton,
          {
            backgroundColor: colors.text,
          },
          (!imageUri || loading) && styles.disabled,
        ]}
        disabled={!imageUri || loading}
        onPress={identifyItems}
      >
        <Text
          style={[
            styles.scanText,
            {
              color: colors.card,
            },
          ]}
        >
          {loading
            ? "Identifying..."
            : "Identify Ingredients"}
        </Text>
      </Pressable>

      {items.length > 0 && (
        <View
          style={[
            styles.resultCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.resultTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Detected Ingredients
          </Text>

          {items.map((item) => (
            <View
              key={item}
              style={[
                styles.resultRow,
                {
                  borderBottomColor: colors.divider,
                },
              ]}
            >
              <Text style={styles.check}>✓</Text>

              <Text
                style={[
                  styles.resultItem,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    marginTop: 20,
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 20,
  },

  placeholder: {
    height: 250,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  cameraIcon: {
    fontSize: 45,
  },

  placeholderTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginTop: 12,
  },

  placeholderText: {
    marginTop: 5,
  },

  preview: {
    width: "100%",
    height: 250,
    borderRadius: 20,
  },

  buttons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  primaryButton: {
    flex: 1,
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
  },

  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  secondaryButtonText: {
    fontWeight: "800",
  },

  scanButton: {
    borderRadius: 14,
    padding: 17,
    alignItems: "center",
    marginTop: 12,
  },

  disabled: {
    opacity: 0.4,
  },

  scanText: {
    fontWeight: "800",
    fontSize: 15,
  },

  resultCard: {
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
  },

  check: {
    color: "#18A558",
    fontSize: 17,
    fontWeight: "800",
  },

  resultItem: {
    fontSize: 15,
    marginLeft: 10,
  },
});