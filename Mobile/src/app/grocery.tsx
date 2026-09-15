import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "../context/ThemeContext";

type GroceryItem = {
  id: number;
  name: string;
  quantity: string;
  checked: boolean;
};

const initialItems: GroceryItem[] = [
  {
    id: 1,
    name: "Paneer",
    quantity: "500 g",
    checked: false,
  },
  {
    id: 2,
    name: "Rice",
    quantity: "2 kg",
    checked: false,
  },
  {
    id: 3,
    name: "Dal",
    quantity: "1 kg",
    checked: false,
  },
  {
    id: 4,
    name: "Bananas",
    quantity: "1 dozen",
    checked: false,
  },
  {
    id: 5,
    name: "Tomatoes",
    quantity: "1 kg",
    checked: false,
  },
  {
    id: 6,
    name: "Onions",
    quantity: "1 kg",
    checked: false,
  },
];

export default function GroceryScreen() {
  const { colors } = useTheme();

  const [items, setItems] = useState(initialItems);

  const toggleItem = (id: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, checked: !item.checked }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const placeOrder = () => {
    const selectedItems = items.filter((item) => !item.checked);

    if (selectedItems.length === 0) {
      Alert.alert(
        "Grocery List Complete",
        "All grocery items are already checked."
      );
      return;
    }

    Alert.alert(
      "Place Order",
      `Your order for ${selectedItems.length} ${
        selectedItems.length === 1 ? "item" : "items"
      } will be placed here after the ordering system is connected.`
    );
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
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        Grocery List
      </Text>

      {/* Subtitle */}
      <Text
        style={[
          styles.subtitle,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        Ingredients needed for your current meal plan.
      </Text>

      {/* Summary */}
      <View
        style={[
          styles.summary,
          {
            backgroundColor: colors.primaryLight,
          },
        ]}
      >
        <Text
          style={[
            styles.summaryNumber,
            {
              color: colors.primary,
            },
          ]}
        >
          {items.length}
        </Text>

        <Text
          style={[
            styles.summaryText,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          items to buy
        </Text>
      </View>

      {/* Grocery Items */}
      {items.map((item) => (
        <View
          key={item.id}
          style={[
            styles.item,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Checkbox */}
          <Pressable
            style={[
              styles.checkbox,
              {
                borderColor: colors.border,
              },
              item.checked && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => toggleItem(item.id)}
          >
            {item.checked && (
              <Text style={styles.check}>✓</Text>
            )}
          </Pressable>

          {/* Item Information */}
          <View style={styles.itemInfo}>
            <Text
              style={[
                styles.itemName,
                {
                  color: colors.text,
                },
                item.checked && {
                  textDecorationLine: "line-through",
                  color: colors.textMuted,
                },
              ]}
            >
              {item.name}
            </Text>

            <Text
              style={[
                styles.quantity,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {item.quantity}
            </Text>
          </View>

          {/* Remove Button */}
          <Pressable
            onPress={() => removeItem(item.id)}
            style={[
              styles.removeButton,
              {
                backgroundColor: colors.dangerLight,
              },
            ]}
          >
            <Text
              style={[
                styles.remove,
                {
                  color: colors.danger,
                },
              ]}
            >
              ×
            </Text>
          </Pressable>
        </View>
      ))}

      {/* Place Order Button */}
      <Pressable
        style={[
          styles.orderButton,
          {
            backgroundColor: colors.primary,
          },
        ]}
        onPress={placeOrder}
      >
        <Text style={styles.orderText}>Place Order</Text>
      </Pressable>
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
    marginTop: 7,
    marginBottom: 20,
  },

  summary: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
  },

  summaryNumber: {
    fontSize: 30,
    fontWeight: "800",
  },

  summaryText: {
    marginTop: 2,
  },

  item: {
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    elevation: 1,
  },

  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  check: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },

  itemName: {
    fontSize: 16,
    fontWeight: "700",
  },

  quantity: {
    fontSize: 13,
    marginTop: 3,
  },

  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  remove: {
    fontSize: 23,
  },

  orderButton: {
    borderRadius: 15,
    padding: 17,
    alignItems: "center",
    marginTop: 12,
  },

  orderText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});