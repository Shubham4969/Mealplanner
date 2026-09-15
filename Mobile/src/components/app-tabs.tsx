import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
};

export default function AppButton({
  title,
  onPress,
  loading = false,
}: AppButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: "#208AEF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  pressed: {
    opacity: 0.7,
  },

  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});