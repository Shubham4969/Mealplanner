import React, { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

type SectionCardProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export default function SectionCard({
  title,
  subtitle,
  children,
}: SectionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      {subtitle && (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },

  title: {
    color: "#172033",
    fontSize: 18,
    fontWeight: "800",
  },

  subtitle: {
    color: "#687386",
    fontSize: 14,
    marginTop: 5,
  },
});