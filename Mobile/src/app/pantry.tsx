import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useTheme } from "../context/ThemeContext";

import * as ImagePicker from "expo-image-picker";

import {
  Camera,
  Image as ImageIcon,
  Trash2,
  Plus,
} from "lucide-react-native";

type PantryUnit = "kg" | "g" | "L" | "ml" | "pcs";

type PantryItem = {
  id: string;
  name: string;
  quantity: string;
  unit: PantryUnit;
  image: string | null;
};

/* =========================================================
   UNIT LOGIC
========================================================= */

const getUnitForItem = (name: string): PantryUnit => {
  const item = name.toLowerCase().trim();

  if (
    item.includes("milk") ||
    item.includes("oil") ||
    item.includes("ghee") ||
    item.includes("juice") ||
    item.includes("water")
  ) {
    return "L";
  }

  if (
    item === "banana" ||
    item === "bananas" ||
    item === "egg" ||
    item === "eggs"
  ) {
    return "pcs";
  }

  return "kg";
};

const getUnitsForItem = (name: string): PantryUnit[] => {
  const item = name.toLowerCase().trim();

  if (
    item.includes("milk") ||
    item.includes("oil") ||
    item.includes("ghee") ||
    item.includes("juice") ||
    item.includes("water")
  ) {
    return ["L", "ml"];
  }

  if (
    item === "banana" ||
    item === "bananas" ||
    item === "egg" ||
    item === "eggs"
  ) {
    return ["pcs"];
  }

  return ["kg", "g"];
};

/* =========================================================
   INITIAL PANTRY
========================================================= */

const initialItems: PantryItem[] = [
  {
    id: "1",
    name: "Rice",
    quantity: "5",
    unit: "kg",
    image: null,
  },
  {
    id: "2",
    name: "Wheat Flour",
    quantity: "2",
    unit: "kg",
    image: null,
  },
  {
    id: "3",
    name: "Dal",
    quantity: "2",
    unit: "kg",
    image: null,
  },
  {
    id: "4",
    name: "Paneer",
    quantity: "1",
    unit: "kg",
    image: null,
  },
  {
    id: "5",
    name: "Milk",
    quantity: "2",
    unit: "L",
    image: null,
  },
  {
    id: "6",
    name: "Eggs",
    quantity: "1",
    unit: "kg",
    image: null,
  },
  {
    id: "7",
    name: "Tomatoes",
    quantity: "2",
    unit: "kg",
    image: null,
  },
  {
    id: "8",
    name: "Onions",
    quantity: "2",
    unit: "kg",
    image: null,
  },
  {
    id: "9",
    name: "Potatoes",
    quantity: "3",
    unit: "kg",
    image: null,
  },
  {
    id: "10",
    name: "Spinach",
    quantity: "1",
    unit: "kg",
    image: null,
  },
];

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function PantryScreen() {
  const { colors } = useTheme();

  const [items, setItems] = useState<PantryItem[]>(
    initialItems
  );

  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnit, setNewUnit] = useState<PantryUnit>("kg");
  const [newImage, setNewImage] = useState<string | null>(
    null
  );

  /* =======================================================
     CAMERA
  ======================================================= */

  const takePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission",
          "Please allow camera access to take a pantry item photo."
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (!result.canceled) {
        setNewImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Camera error:", error);

      Alert.alert(
        "Camera Error",
        "Unable to open the camera."
      );
    }
  };

  /* =======================================================
     GALLERY
  ======================================================= */

  const chooseFromGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Gallery Permission",
          "Please allow gallery access to select a pantry item photo."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (!result.canceled) {
        setNewImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Gallery error:", error);

      Alert.alert(
        "Gallery Error",
        "Unable to open the gallery."
      );
    }
  };

  const handleIngredientChange = (value: string) => {
    setNewItem(value);

    const units = getUnitsForItem(value);
    const suggestedUnit = getUnitForItem(value);

    if (!units.includes(newUnit)) {
      setNewUnit(suggestedUnit);
    }
  };

  /* =======================================================
     ADD ITEM
  ======================================================= */

  const addItem = () => {
    const itemName = newItem.trim();
    const quantity = newQuantity.trim();

    if (!itemName) {
      Alert.alert(
        "Missing Item",
        "Please enter an ingredient name."
      );
      return;
    }

    if (!quantity) {
      Alert.alert(
        "Missing Quantity",
        "Please enter the quantity."
      );
      return;
    }

    const exists = items.some(
      (item) =>
        item.name.toLowerCase() ===
        itemName.toLowerCase()
    );

    if (exists) {
      Alert.alert(
        "Already in pantry",
        `${itemName} is already in your pantry.`
      );
      return;
    }

    const allowedUnits = getUnitsForItem(itemName);
    const selectedUnit = allowedUnits.includes(newUnit)
      ? newUnit
      : allowedUnits[0];

    const newPantryItem: PantryItem = {
      id: Date.now().toString(),
      name: itemName,
      quantity,
      unit: selectedUnit,
      image: newImage,
    };

    setItems((current) => [
      ...current,
      newPantryItem,
    ]);

    // Clear form
    setNewItem("");
    setNewQuantity("");
    setNewUnit("kg");
    setNewImage(null);
  };

  /* =======================================================
     REMOVE ITEM
  ======================================================= */

  const removeItem = (id: string) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your pantry?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setItems((current) =>
              current.filter(
                (item) => item.id !== id
              )
            );
          },
        },
      ]
    );
  };

  /* =======================================================
     UPDATE QUANTITY
  ======================================================= */

  const updateQuantity = (
    id: string,
    quantity: string
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  /* =======================================================
     CHANGE ITEM IMAGE
  ======================================================= */

  const changeItemImage = async (
    id: string
  ) => {
    Alert.alert(
      "Add Item Photo",
      "Choose how you want to add the photo.",
      [
        {
          text: "Camera",
          onPress: async () => {
            const permission =
              await ImagePicker.requestCameraPermissionsAsync();

            if (!permission.granted) {
              Alert.alert(
                "Camera Permission",
                "Please allow camera access."
              );
              return;
            }

            const result =
              await ImagePicker.launchCameraAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

            if (!result.canceled) {
              setItems((current) =>
                current.map((item) =>
                  item.id === id
                    ? {
                        ...item,
                        image:
                          result.assets[0].uri,
                      }
                    : item
                )
              );
            }
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const permission =
              await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
              Alert.alert(
                "Gallery Permission",
                "Please allow gallery access."
              );
              return;
            }

            const result =
              await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

            if (!result.canceled) {
              setItems((current) =>
                current.map((item) =>
                  item.id === id
                    ? {
                        ...item,
                        image:
                          result.assets[0].uri,
                      }
                    : item
                )
              );
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        My Pantry
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color:
              colors.textSecondary,
          },
        ]}
      >
        Manage the ingredients available
        at home.
      </Text>

      {/* =================================================
          ADD ITEM CARD
      ================================================= */}

      <View
        style={[
          styles.addCard,
          {
            backgroundColor:
              colors.card,
            borderColor:
              colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.addTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Add Pantry Item
        </Text>

        {/* ITEM NAME */}

        <Text
          style={[
            styles.label,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          Ingredient
        </Text>

        <TextInput
          value={newItem}
          onChangeText={handleIngredientChange}
          placeholder="e.g. Rice, Milk, Oil, Banana"
          placeholderTextColor={
            colors.textMuted
          }
          style={[
            styles.input,
            {
              backgroundColor:
                colors.input,
              borderColor:
                colors.inputBorder,
              color: colors.text,
            },
          ]}
        />

        {/* QUANTITY */}

        <Text
          style={[
            styles.label,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          Quantity
        </Text>

        <View style={styles.quantityRow}>
          <TextInput
            value={newQuantity}
            onChangeText={(value) =>
              setNewQuantity(
                value.replace(/[^0-9.]/g, "")
              )
            }
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            style={[
              styles.quantityInput,
              {
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
          />

          <View style={styles.unitSelector}>
            {getUnitsForItem(newItem).map((itemUnit) => {
              const selected = newUnit === itemUnit;

              return (
                <Pressable
                  key={itemUnit}
                  onPress={() => setNewUnit(itemUnit)}
                  style={[
                    styles.unitButton,
                    {
                      backgroundColor: selected
                        ? colors.primary
                        : colors.cardSecondary,
                      borderColor: selected
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      {
                        color: selected
                          ? "#FFFFFF"
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {itemUnit}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text
          style={[
            styles.unitHint,
            {
              color:
                colors.textMuted,
            },
          ]}
        >
          {newUnit === "L"
            ? "Liquid item → measured in litres"
            : newUnit === "ml"
              ? "Liquid item → measured in millilitres"
              : newUnit === "pcs"
                ? "Measured by number of pieces"
                : newUnit === "g"
                  ? "Measured in grams"
                  : "Measured in kilograms"}
        </Text>

        {/* IMAGE */}

        <Text
          style={[
            styles.label,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          Item Photo
        </Text>

        {newImage ? (
          <View style={styles.previewContainer}>
            <Image
              source={{
                uri: newImage,
              }}
              style={styles.previewImage}
            />

            <Pressable
              style={[
                styles.removePreview,
                {
                  backgroundColor:
                    colors.danger,
                },
              ]}
              onPress={() =>
                setNewImage(null)
              }
            >
              <Text
                style={styles.removePreviewText}
              >
                ×
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.photoButtons}>
            <Pressable
              style={[
                styles.photoButton,
                {
                  backgroundColor:
                    colors.primaryLight,
                  borderColor:
                    colors.border,
                },
              ]}
              onPress={takePhoto}
            >
              <Camera
                size={20}
                color={
                  colors.primary
                }
                strokeWidth={2}
              />

              <Text
                style={[
                  styles.photoButtonText,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                Camera
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.photoButton,
                {
                  backgroundColor:
                    colors.primaryLight,
                  borderColor:
                    colors.border,
                },
              ]}
              onPress={
                chooseFromGallery
              }
            >
              <ImageIcon
                size={20}
                color={
                  colors.primary
                }
                strokeWidth={2}
              />

              <Text
                style={[
                  styles.photoButtonText,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                Gallery
              </Text>
            </Pressable>
          </View>
        )}

        {/* ADD BUTTON */}

        <Pressable
          style={[
            styles.addButton,
            {
              backgroundColor:
                "#208AEF",
            },
          ]}
          onPress={addItem}
        >
          <Plus
            size={21}
            color="#FFFFFF"
            strokeWidth={2.5}
          />

          <Text
            style={styles.addButtonText}
          >
            Add to Pantry
          </Text>
        </Pressable>
      </View>

      {/* COUNT */}

      <Text
        style={[
          styles.count,
          {
            color:
              colors.textSecondary,
          },
        ]}
      >
        {items.length}{" "}
        {items.length === 1
          ? "ingredient"
          : "ingredients"}
      </Text>

      {/* =================================================
          PANTRY ITEMS
      ================================================= */}

      {items.map((item) => (
        <View
          key={item.id}
          style={[
            styles.item,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
          ]}
        >
          {/* IMAGE */}

          <Pressable
            style={[
              styles.itemImageContainer,
              {
                backgroundColor:
                  colors.iconBackground,
              },
            ]}
            onPress={() =>
              changeItemImage(
                item.id
              )
            }
          >
            {item.image ? (
              <Image
                source={{
                  uri: item.image,
                }}
                style={styles.itemImage}
              />
            ) : (
              <Text
                style={styles.itemEmoji}
              >
                🥫
              </Text>
            )}

            <View
              style={[
                styles.cameraBadge,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <Camera
                size={12}
                color="#FFFFFF"
                strokeWidth={2.5}
              />
            </View>
          </Pressable>

          {/* INFORMATION */}

          <View
            style={styles.itemInfo}
          >
            <Text
              style={[
                styles.itemName,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {item.name}
            </Text>

            <View
              style={styles.quantityDisplay}
            >
              <Text
                style={[
                  styles.quantityValue,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                {item.quantity}
              </Text>

              <Text
                style={[
                  styles.quantityUnit,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {item.unit}
              </Text>
            </View>

            <Text
              style={[
                styles.photoHint,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Tap image to change photo
            </Text>
          </View>

          {/* DELETE */}

          <Pressable
            style={[
              styles.deleteButton,
              {
                backgroundColor:
                  colors.dangerLight,
              },
            ]}
            onPress={() =>
              removeItem(item.id)
            }
          >
            <Trash2
              size={19}
              color={
                colors.danger
              }
              strokeWidth={2}
            />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  title: {
    marginTop: 20,
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 7,
    marginBottom: 20,
    lineHeight: 20,
    fontSize: 14,
  },

  /* ADD CARD */

  addCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
  },

  addTitle: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
  },

  input: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 15,
  },

  /* QUANTITY */

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  quantityInput: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },

  unitSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 8,
  },

  unitButton: {
    minWidth: 48,
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  unitButtonText: {
    fontSize: 13,
    fontWeight: "800",
  },

  unitHint: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },

  /* PHOTO */

  photoButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  photoButton: {
    flex: 1,
    height: 48,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  photoButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  previewContainer: {
    width: 100,
    height: 100,
    marginBottom: 16,
    position: "relative",
  },

  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 15,
  },

  removePreview: {
    position: "absolute",
    right: -7,
    top: -7,
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  removePreviewText: {
    color: "#FFFFFF",
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "700",
  },

  /* ADD */

  addButton: {
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  /* COUNT */

  count: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },

  /* ITEM */

  item: {
    borderRadius: 17,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    elevation: 1,
  },

  itemImageContainer: {
    width: 65,
    height: 65,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
  },

  itemImage: {
    width: 65,
    height: 65,
    borderRadius: 14,
  },

  itemEmoji: {
    fontSize: 27,
  },

  cameraBadge: {
    position: "absolute",
    right: -5,
    bottom: -5,
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  itemInfo: {
    flex: 1,
    marginLeft: 13,
  },

  itemName: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 5,
  },

  quantityDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  quantityValue: {
    fontSize: 17,
    fontWeight: "800",
  },

  quantityUnit: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },

  photoHint: {
    fontSize: 10,
    marginTop: 3,
  },

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});