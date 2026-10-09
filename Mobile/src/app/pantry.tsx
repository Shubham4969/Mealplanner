import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
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
  Pencil,
  Check,
  X,
} from "lucide-react-native";

import {
  getStoredUserId,
  getPantry,
  addPantryItem,
  deletePantryItem,
  updatePantryItem,
  PantryItem as ApiPantryItem,
} from "../services/api";


// ============================================================
// TYPES
// ============================================================

type PantryUnit = "kg" | "g" | "L" | "ml" | "pcs";


type PantryItem = {
  id: string;
  name: string;
  quantity: string;
  unit: PantryUnit;
  image: string | null;
};


// ============================================================
// UNIT LOGIC
// ============================================================

const getUnitForItem = (
  name: string
): PantryUnit => {

  const item = name
    .toLowerCase()
    .trim();


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


const getUnitsForItem = (
  name: string
): PantryUnit[] => {

  const item = name
    .toLowerCase()
    .trim();


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


// ============================================================
// MAIN SCREEN
// ============================================================

export default function PantryScreen() {

  const { colors } = useTheme();

  const [userId, setUserId] = useState<number | null>(null);


  // ==========================================================
  // STATE
  // ==========================================================

  const [items, setItems] = useState<PantryItem[]>([]);

  const [newItem, setNewItem] = useState("");

  const [newQuantity, setNewQuantity] =
    useState("");

  const [newUnit, setNewUnit] =
    useState<PantryUnit>("kg");

  const [newImage, setNewImage] =
    useState<string | null>(null);


  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editName, setEditName] =
    useState("");

  const [editQuantity, setEditQuantity] =
    useState("");

  const [editUnit, setEditUnit] =
    useState<PantryUnit>("kg");


// ==========================================================
// LOAD PANTRY FROM BACKEND
// ==========================================================

useEffect(() => {

  const initializePantry = async () => {

    try {

      const id = await getStoredUserId();

      setUserId(id);

      await loadPantry(id);

    } catch (error) {

      console.log(
        "Pantry session error:",
        error
      );

      Alert.alert(
        "Session Error",
        error instanceof Error
          ? error.message
          : "Unable to load your account."
      );

      setLoading(false);

    }

  };

  initializePantry();

}, []);


const loadPantry = async (currentUserId: number) => {

  try {

    setLoading(true);

    const result = await getPantry(currentUserId);

    if (!result.success) {

      throw new Error(
        result.message ||
        "Unable to load pantry."
      );
    }

    const backendItems =
      result.data || [];

    const formattedItems: PantryItem[] =
      backendItems.map(
        (item: ApiPantryItem) => ({

          id: String(item.id),

          name: item.item,

          quantity: String(
            item.quantity
          ),

          unit: (
            item.unit ||
            getUnitForItem(item.item)
          ) as PantryUnit,

          /*
           * Current backend does not store images.
           */
          image: null,

        })
      );

    setItems(formattedItems);

  } catch (error) {

    console.log(
      "Load pantry error:",
      error
    );

    Alert.alert(
      "Pantry Error",
      error instanceof Error
        ? error.message
        : "Unable to load pantry."
    );

  } finally {

    setLoading(false);

  }

};


  // ==========================================================
  // CAMERA
  // ==========================================================

  const takePhoto = async () => {

    try {

      const permission =
        await ImagePicker
          .requestCameraPermissionsAsync();


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

        setNewImage(
          result.assets[0].uri
        );
      }

    } catch (error) {

      console.log(
        "Camera error:",
        error
      );


      Alert.alert(
        "Camera Error",
        "Unable to open the camera."
      );
    }
  };


  // ==========================================================
  // GALLERY
  // ==========================================================

  const chooseFromGallery = async () => {

    try {

      const permission =
        await ImagePicker
          .requestMediaLibraryPermissionsAsync();


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

        setNewImage(
          result.assets[0].uri
        );
      }

    } catch (error) {

      console.log(
        "Gallery error:",
        error
      );


      Alert.alert(
        "Gallery Error",
        "Unable to open the gallery."
      );
    }
  };


  // ==========================================================
  // INGREDIENT CHANGE
  // ==========================================================

  const handleIngredientChange = (
    value: string
  ) => {

    setNewItem(value);


    const units =
      getUnitsForItem(value);

    const suggestedUnit =
      getUnitForItem(value);


    if (!units.includes(newUnit)) {

      setNewUnit(
        suggestedUnit
      );
    }
  };


  // ==========================================================
  // ADD ITEM
  // ==========================================================

  const addItem = async () => {

  if (userId === null) {
    Alert.alert(
      "Session Error",
      "Your account is not ready. Please sign in again."
    );
    return;
  }

  const itemName =
    newItem.trim();
  const quantityText = newQuantity.trim();

  // rest of your existing code...


    // --------------------------------------------------------
    // VALIDATE ITEM
    // --------------------------------------------------------

    if (!itemName) {

      Alert.alert(
        "Missing Item",
        "Please enter an ingredient name."
      );

      return;
    }


    // --------------------------------------------------------
    // VALIDATE QUANTITY
    // --------------------------------------------------------

    if (!quantityText) {

      Alert.alert(
        "Missing Quantity",
        "Please enter the quantity."
      );

      return;
    }


    const quantity =
      Number(quantityText);


    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {

      Alert.alert(
        "Invalid Quantity",
        "Please enter a valid quantity."
      );

      return;
    }


    /*
     * IMPORTANT:
     *
     * Current PostgreSQL model uses:
     *
     * quantity = Integer
     *
     * Therefore we currently only allow
     * whole numbers.
     */

    if (!Number.isInteger(quantity)) {

      Alert.alert(
        "Invalid Quantity",
        "Your current database stores quantity as a whole number. Please enter an integer such as 1, 2, 5, etc."
      );

      return;
    }


    // --------------------------------------------------------
    // CHECK DUPLICATE
    // --------------------------------------------------------

    const exists =
      items.some(
        (item) =>
          item.name
            .toLowerCase()
            === itemName.toLowerCase()
      );


    if (exists) {

      Alert.alert(
        "Already in pantry",
        `${itemName} is already in your pantry.`
      );

      return;
    }


    // --------------------------------------------------------
    // UNIT
    // --------------------------------------------------------

    const allowedUnits =
      getUnitsForItem(itemName);


    const selectedUnit =
      allowedUnits.includes(newUnit)
        ? newUnit
        : allowedUnits[0];


    // --------------------------------------------------------
    // SEND TO BACKEND
    // --------------------------------------------------------

    try {

      setSaving(true);


      const result =
        await addPantryItem(
          itemName,
          quantity,
          selectedUnit,
          userId
        );

      if (!result.success) {

        throw new Error(
          result.message ||
          "Unable to add pantry item."
        );
      }


      if (!result.data) {

        throw new Error(
          "Backend did not return the pantry item."
        );
      }


      const backendItem =
        result.data;


      // ------------------------------------------------------
      // CREATE MOBILE ITEM
      // ------------------------------------------------------

      const newPantryItem: PantryItem = {

        id: String(
          backendItem.id
        ),

        name: backendItem.item,

        quantity: String(
          backendItem.quantity
        ),

        unit: (backendItem.unit || selectedUnit) as PantryUnit,

        /*
         * Image is currently local only.
         */
        image: newImage,
      };


      // ------------------------------------------------------
      // UPDATE UI
      // ------------------------------------------------------

      setItems(
        (current) => [
          ...current,
          newPantryItem,
        ]
      );


      // ------------------------------------------------------
      // CLEAR FORM
      // ------------------------------------------------------

      setNewItem("");

      setNewQuantity("");

      setNewUnit("kg");

      setNewImage(null);


      Alert.alert(
        "Success",
        `${itemName} added to your pantry.`
      );

    } catch (error) {

      console.log(
        "Add pantry item error:",
        error
      );


      Alert.alert(
        "Unable to Add",
        error instanceof Error
          ? error.message
          : "Unable to add pantry item."
      );

    } finally {

      setSaving(false);

    }
  };


  // ==========================================================
  // REMOVE ITEM
  // ==========================================================

  const removeItem = (
    id: string
  ) => {
    if (userId === null) {
  Alert.alert(
    "Session Error",
    "Your account is not ready. Please sign in again."
  );
  return;
}

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

          onPress: async () => {

            try {

              setSaving(true);


              const result =
                await deletePantryItem(
                  Number(id),
                  userId
                );


              if (!result.success) {

                throw new Error(
                  result.message ||
                  "Unable to delete pantry item."
                );
              }


              setItems(
                (current) =>
                  current.filter(
                    (item) =>
                      item.id !== id
                  )
              );


            } catch (error) {

              console.log(
                "Delete pantry item error:",
                error
              );


              Alert.alert(
                "Delete Error",
                error instanceof Error
                  ? error.message
                  : "Unable to delete pantry item."
              );

            } finally {

              setSaving(false);

            }
          },
        },
      ]
    );
  };


  // ==========================================================
// UPDATE QUANTITY
// ==========================================================
const updateQuantity = async (
  id: string,
  quantityText: string
) => {

  if (userId === null) {
    Alert.alert(
      "Session Error",
      "Your account is not ready. Please sign in again."
    );
    return;
  }

  const quantity =
    Number(quantityText);

  if (
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    !Number.isInteger(quantity)
  ) {
    return;
  }

  try {

    const result =
      await updatePantryItem(
        Number(id),
        userId,
        undefined,
        quantity,
        undefined,
      );

    if (!result.success) {

      throw new Error(
        result.message ||
        "Unable to update quantity."
      );
    }

    setItems(
      (current) =>
        current.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  quantity:
                    String(quantity),
                }
              : item
        )
    );

  } catch (error) {

    console.log(
      "Update quantity error:",
      error
    );

    Alert.alert(
      "Update Error",
      error instanceof Error
        ? error.message
        : "Unable to update quantity."
    );
  }
};


  // ==========================================================
  // EDIT ITEM
  // ==========================================================

  const startEditItem = (item: PantryItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditQuantity(item.quantity);
    setEditUnit(item.unit);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditQuantity("");
    setEditUnit("kg");
  };

  const saveEditItem = async () => {

  if (userId === null) {
    Alert.alert(
      "Session Error",
      "Your account is not ready. Please sign in again."
    );
    return;
  }

  if (!editingId) return;

    const itemName = editName.trim();
    const quantity = Number(editQuantity);

    if (!itemName) {
      Alert.alert("Missing Item", "Please enter an ingredient name.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      Alert.alert("Invalid Quantity", "Please enter a valid whole-number quantity.");
      return;
    }

    const allowedUnits = getUnitsForItem(itemName);
    const selectedUnit = allowedUnits.includes(editUnit) ? editUnit : allowedUnits[0];

    try {
      setSaving(true);

      const result = await updatePantryItem(
        Number(editingId),
        userId,
        itemName,
        quantity,
        selectedUnit,
      );

      if (!result.success) {
        throw new Error(result.message || "Unable to update pantry item.");
      }

      if (!result.data) {
        throw new Error("Backend did not return the updated pantry item.");
      }

      const backendItem = result.data;

      setItems((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: backendItem.item,
                quantity: String(backendItem.quantity),
                unit: (backendItem.unit || selectedUnit) as PantryUnit,
              }
            : item
        )
      );

      cancelEdit();
      Alert.alert("Updated", `${backendItem.item} was updated successfully.`);
    } catch (error) {
      console.log("Update pantry item error:", error);
      Alert.alert(
        "Update Error",
        error instanceof Error ? error.message : "Unable to update pantry item."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // CHANGE ITEM IMAGE
  // ==========================================================

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

            try {

              const permission =
                await ImagePicker
                  .requestCameraPermissionsAsync();


              if (!permission.granted) {

                Alert.alert(
                  "Camera Permission",
                  "Please allow camera access."
                );

                return;
              }


              const result =
                await ImagePicker
                  .launchCameraAsync({

                    mediaTypes: ["images"],

                    allowsEditing: true,

                    aspect: [1, 1],

                    quality: 0.8,
                  });


              if (!result.canceled) {

                setItems(
                  (current) =>
                    current.map(
                      (item) =>
                        item.id === id
                          ? {
                              ...item,
                              image:
                                result.assets[0]
                                  .uri,
                            }
                          : item
                    )
                );
              }

            } catch (error) {

              console.log(
                "Camera error:",
                error
              );
            }
          },
        },

        {
          text: "Gallery",

          onPress: async () => {

            try {

              const permission =
                await ImagePicker
                  .requestMediaLibraryPermissionsAsync();


              if (!permission.granted) {

                Alert.alert(
                  "Gallery Permission",
                  "Please allow gallery access."
                );

                return;
              }


              const result =
                await ImagePicker
                  .launchImageLibraryAsync({

                    mediaTypes: ["images"],

                    allowsEditing: true,

                    aspect: [1, 1],

                    quality: 0.8,
                  });


              if (!result.canceled) {

                setItems(
                  (current) =>
                    current.map(
                      (item) =>
                        item.id === id
                          ? {
                              ...item,
                              image:
                                result.assets[0]
                                  .uri,
                            }
                          : item
                    )
                );
              }

            } catch (error) {

              console.log(
                "Gallery error:",
                error
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


  // ==========================================================
  // UI
  // ==========================================================

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

      showsVerticalScrollIndicator={
        false
      }
    >

      {/* ====================================================
          HEADER
      ==================================================== */}

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


      {/* ====================================================
          ADD ITEM CARD
      ==================================================== */}

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

          onChangeText={
            handleIngredientChange
          }

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

              color:
                colors.text,
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


        <View
          style={styles.quantityRow}
        >

          <TextInput
            value={newQuantity}

            onChangeText={(value) =>
              setNewQuantity(
                value.replace(
                  /[^0-9]/g,
                  ""
                )
              )
            }

            placeholder="0"

            placeholderTextColor={
              colors.textMuted
            }

            keyboardType="numeric"

            style={[
              styles.quantityInput,
              {
                backgroundColor:
                  colors.input,

                borderColor:
                  colors.inputBorder,

                color:
                  colors.text,
              },
            ]}
          />


          <View
            style={styles.unitSelector}
          >

            {getUnitsForItem(
              newItem
            ).map(
              (itemUnit) => {

                const selected =
                  newUnit ===
                  itemUnit;


                return (

                  <Pressable
                    key={itemUnit}

                    onPress={() =>
                      setNewUnit(
                        itemUnit
                      )
                    }

                    style={[
                      styles.unitButton,
                      {
                        backgroundColor:
                          selected
                            ? colors.primary
                            : colors.cardSecondary,

                        borderColor:
                          selected
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                  >

                    <Text
                      style={[
                        styles.unitButtonText,
                        {
                          color:
                            selected
                              ? "#FFFFFF"
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      {itemUnit}
                    </Text>

                  </Pressable>
                );
              }
            )}

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

          <View
            style={
              styles.previewContainer
            }
          >

            <Image
              source={{
                uri: newImage,
              }}

              style={
                styles.previewImage
              }
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
                style={
                  styles.removePreviewText
                }
              >
                ×
              </Text>

            </Pressable>

          </View>

        ) : (

          <View
            style={styles.photoButtons}
          >

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
                takePhoto
              }
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
                saving
                  ? colors.textMuted
                  : "#208AEF",
            },
          ]}

          onPress={
            addItem
          }

          disabled={
            saving
          }
        >

          {saving ? (

            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

          ) : (

            <Plus
              size={21}
              color="#FFFFFF"
              strokeWidth={2.5}
            />

          )}


          <Text
            style={
              styles.addButtonText
            }
          >
            {saving
              ? "Saving..."
              : "Add to Pantry"}
          </Text>

        </Pressable>

      </View>


      {/* ====================================================
          COUNT
      ==================================================== */}

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


      {/* ====================================================
          LOADING
      ==================================================== */}

      {loading ? (

        <View
          style={
            styles.loadingContainer
          }
        >

          <ActivityIndicator
            size="large"
            color={
              colors.primary
            }
          />


          <Text
            style={[
              styles.loadingText,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            Loading pantry...
          </Text>

        </View>

      ) : null}


      {/* ====================================================
          PANTRY ITEMS
      ==================================================== */}

      {!loading &&
        items.map(
          (item) => (

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
                      uri:
                        item.image,
                    }}

                    style={
                      styles.itemImage
                    }
                  />

                ) : (

                  <Text
                    style={
                      styles.itemEmoji
                    }
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


              {editingId === item.id ? (

                <View style={styles.editInfo}>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Ingredient"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.editNameInput, {
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    }]}
                  />

                  <View style={styles.editQuantityRow}>
                    <TextInput
                      value={editQuantity}
                      onChangeText={(value) => setEditQuantity(value.replace(/[^0-9]/g, ""))}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      style={[styles.editQuantityInput, {
                        backgroundColor: colors.input,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      }]}
                    />

                    <View style={styles.editUnitSelector}>
                      {getUnitsForItem(editName).map((itemUnit) => {
                        const selected = editUnit === itemUnit;
                        return (
                          <Pressable
                            key={itemUnit}
                            onPress={() => setEditUnit(itemUnit)}
                            style={[styles.editUnitButton, {
                              backgroundColor: selected ? colors.primary : colors.cardSecondary,
                              borderColor: selected ? colors.primary : colors.border,
                            }]}
                          >
                            <Text style={[styles.unitButtonText, {
                              color: selected ? "#FFFFFF" : colors.textSecondary,
                            }]}>{itemUnit}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.editActions}>
                    <Pressable
                      onPress={cancelEdit}
                      disabled={saving}
                      style={[styles.editCancelButton, {
                        backgroundColor: colors.cardSecondary,
                        borderColor: colors.border,
                      }]}
                    >
                      <X size={16} color={colors.textSecondary} strokeWidth={2.5} />
                      <Text style={[styles.editCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                    </Pressable>

                    <Pressable
                      onPress={saveEditItem}
                      disabled={saving}
                      style={[styles.editSaveButton, {
                        backgroundColor: saving ? colors.textMuted : colors.primary,
                      }]}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                      )}
                      <Text style={styles.editSaveText}>{saving ? "Saving..." : "Save"}</Text>
                    </Pressable>
                  </View>
                </View>

              ) : (

                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>

                  <View style={styles.quantityDisplay}>
                    <Text style={[styles.quantityValue, { color: colors.primary }]}>{item.quantity}</Text>
                    <Text style={[styles.quantityUnit, { color: colors.textSecondary }]}>{item.unit}</Text>
                  </View>

                  <Text style={[styles.photoHint, { color: colors.textMuted }]}>
                    Tap image to change photo
                  </Text>
                </View>

              )}

              {editingId !== item.id && (
                <Pressable
                  style={[styles.editButton, { backgroundColor: colors.primaryLight }]}
                  onPress={() => startEditItem(item)}
                  disabled={saving}
                >
                  <Pencil size={18} color={colors.primary} strokeWidth={2.2} />
                </Pressable>
              )}

              {editingId !== item.id && (
                <Pressable
                  style={[styles.deleteButton, { backgroundColor: colors.dangerLight }]}
                  onPress={() => removeItem(item.id)}
                  disabled={saving}
                >
                  <Trash2 size={19} color={colors.danger} strokeWidth={2} />
                </Pressable>
              )}

            </View>

          )
        )}

    </ScrollView>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({

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


    // --------------------------------------------------------
    // ADD CARD
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // QUANTITY
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // PHOTO
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // ADD BUTTON
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // COUNT
    // --------------------------------------------------------

    count: {
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 10,
    },


    // --------------------------------------------------------
    // LOADING
    // --------------------------------------------------------

    loadingContainer: {
      paddingVertical: 40,
      alignItems: "center",
      justifyContent: "center",
    },


    loadingText: {
      marginTop: 10,
      fontSize: 14,
    },


    // --------------------------------------------------------
    // ITEM
    // --------------------------------------------------------

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


    editInfo: {
      flex: 1,
      marginLeft: 13,
    },

    editNameInput: {
      height: 42,
      borderRadius: 11,
      borderWidth: 1,
      paddingHorizontal: 10,
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 7,
    },

    editQuantityRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },

    editQuantityInput: {
      flex: 1,
      height: 40,
      borderRadius: 11,
      borderWidth: 1,
      paddingHorizontal: 10,
      fontSize: 14,
    },

    editUnitSelector: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginLeft: 6,
    },

    editUnitButton: {
      minWidth: 38,
      height: 36,
      paddingHorizontal: 7,
      borderRadius: 9,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    editActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 7,
    },

    editCancelButton: {
      height: 34,
      paddingHorizontal: 9,
      borderRadius: 9,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },

    editCancelText: {
      fontSize: 11,
      fontWeight: "700",
    },

    editSaveButton: {
      height: 34,
      paddingHorizontal: 10,
      borderRadius: 9,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },

    editSaveText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "800",
    },

    editButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 5,
    },

    deleteButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 5,
    },

  });