import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Check,
  RefreshCw,
  ShoppingCart,
  Trash2,
} from "lucide-react-native";

import {
  useFocusEffect,
} from "expo-router";

import {
  useTheme,
} from "../context/ThemeContext";

import {
  GroceryItem,
  getGroceryList,
  generateGroceryList,
  updateGroceryItem,
  deleteGroceryItem,
  getApiErrorMessage,
} from "../services/api";


// ============================================================
// USER
// ============================================================

const USER_ID = 1;


// ============================================================
// SCREEN
// ============================================================

export default function GroceryScreen() {

  const { colors } = useTheme();


  // ==========================================================
  // STATE
  // ==========================================================

  const [items, setItems] = useState<GroceryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);


  // ==========================================================
// LOAD GROCERY LIST
// ==========================================================

const loadGroceryList = useCallback(async () => {
  try {
    setLoading(true);

    console.log(
      "🛒 Loading grocery list for user:",
      USER_ID
    );

    const response = await getGroceryList(USER_ID);

    console.log(
      "🛒 Grocery GET response:",
      JSON.stringify(response, null, 2)
    );

    const groceryItems = Array.isArray(response?.items)
  ? response.items
  : Array.isArray((response as any)?.data)
    ? (response as any).data
    : [];


    console.log(
      "🛒 Grocery items received:",
      groceryItems.length
    );

    setItems(groceryItems);

  } catch (error) {
    console.error(
      "❌ Grocery load error:",
      error
    );

    Alert.alert(
      "Error",
      getApiErrorMessage(error)
    );

  } finally {
    setLoading(false);
  }
}, []);


// ==========================================================
// LOAD EVERY TIME SCREEN GETS FOCUS
// ==========================================================

useFocusEffect(
  useCallback(() => {
    loadGroceryList();

    return () => {
      // Screen lost focus
    };
  }, [loadGroceryList])
);


  // ==========================================================
  // GENERATE GROCERY LIST
  // ==========================================================

  const handleGenerate = async () => {

    try {

      setGenerating(true);

      const response =
        await generateGroceryList(USER_ID);


      if (!response.success) {

        Alert.alert(
          "Error",
          response.message ||
            "Could not generate grocery list."
        );

        return;
      }


      setItems(
        response.items || []
      );


      Alert.alert(
        "Grocery List Updated",
        "Your grocery list has been generated from your meal plan and pantry."
      );

    } catch (error) {

      console.error(
        "Grocery generation error:",
        error
      );

      Alert.alert(
        "Error",
        getApiErrorMessage(error)
      );

    } finally {

      setGenerating(false);
    }
  };


  // ==========================================================
  // TOGGLE PURCHASED
  // ==========================================================

  const togglePurchased = async (
    item: GroceryItem
  ) => {

    if (updatingId !== null) {
      return;
    }


    const newPurchased =
      !item.purchased;


    try {

      setUpdatingId(item.id);


      // --------------------------------------------
      // Optimistic UI update
      // --------------------------------------------

      setItems((currentItems) =>
        currentItems.map(
          (currentItem) =>
            currentItem.id === item.id
              ? {
                  ...currentItem,
                  purchased:
                    newPurchased,
                }
              : currentItem
        )
      );


      // --------------------------------------------
      // Update PostgreSQL
      // --------------------------------------------

      await updateGroceryItem(
        item.id,
        {
          purchased:
            newPurchased,
        },
        USER_ID
      );


    } catch (error) {

      console.error(
        "Grocery update error:",
        error
      );


      // Restore original state
      setItems((currentItems) =>
        currentItems.map(
          (currentItem) =>
            currentItem.id === item.id
              ? {
                  ...currentItem,
                  purchased:
                    item.purchased,
                }
              : currentItem
        )
      );


      Alert.alert(
        "Error",
        getApiErrorMessage(error)
      );

    } finally {

      setUpdatingId(null);
    }
  };


  // ==========================================================
  // DELETE ITEM
  // ==========================================================

  const handleDelete = async (
    itemId: number
  ) => {

    if (deletingId !== null) {
      return;
    }


    try {

      setDeletingId(itemId);


      await deleteGroceryItem(
        itemId,
        USER_ID
      );


      setItems((currentItems) =>
        currentItems.filter(
          (item) =>
            item.id !== itemId
        )
      );


    } catch (error) {

      console.error(
        "Grocery delete error:",
        error
      );


      Alert.alert(
        "Error",
        getApiErrorMessage(error)
      );

    } finally {

      setDeletingId(null);
    }
  };


  // ==========================================================
  // CONFIRM DELETE
  // ==========================================================

  const confirmDelete = (
    item: GroceryItem
  ) => {

    Alert.alert(
      "Remove Item",
      `Remove ${item.item} from your grocery list?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Remove",
          style: "destructive",

          onPress: () =>
            handleDelete(item.id),
        },
      ]
    );
  };


  // ==========================================================
  // PLACE ORDER
  // ==========================================================

  const placeOrder = () => {

    const selectedItems =
      items.filter(
        (item) =>
          !item.purchased
      );


    if (
      selectedItems.length === 0
    ) {

      Alert.alert(
        "Grocery List Complete",
        "All grocery items are already checked."
      );

      return;
    }


    Alert.alert(
      "Place Order",
      `Your order for ${selectedItems.length} ${
        selectedItems.length === 1
          ? "item"
          : "items"
      } will be placed here after the ordering system is connected.`
    );
  };


  // ==========================================================
  // COUNTS
  // ==========================================================

  const totalItems =
    items.length;

  const remainingItems =
    items.filter(
      (item) =>
        !item.purchased
    ).length;

  const purchasedItems =
    items.filter(
      (item) =>
        item.purchased
    ).length;


  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {

    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >

        <ActivityIndicator
          size="large"
          color={colors.primary}
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
          Loading grocery list...
        </Text>

      </View>
    );
  }


  // ==========================================================
  // MAIN SCREEN
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

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <View
        style={styles.headerRow}
      >

        <View
          style={styles.headerText}
        >

          <Text
            style={[
              styles.title,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Grocery List
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
            Ingredients needed for your
            current meal plan.
          </Text>

        </View>


        {/* Refresh */}

        <Pressable
          onPress={loadGroceryList}
          disabled={loading}
          style={[
            styles.refreshButton,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
          ]}
        >

          <RefreshCw
            size={20}
            color={colors.primary}
          />

        </Pressable>

      </View>


      {/* ================================================== */}
      {/* SUMMARY */}
      {/* ================================================== */}

      <View
        style={[
          styles.summary,
          {
            backgroundColor:
              colors.primaryLight,
          },
        ]}
      >

        <View
          style={styles.summaryIcon}
        >

          <ShoppingCart
            size={28}
            color={colors.primary}
          />

        </View>


        <View
          style={styles.summaryInfo}
        >

          <Text
            style={[
              styles.summaryNumber,
              {
                color:
                  colors.primary,
              },
            ]}
          >
            {remainingItems}
          </Text>


          <Text
            style={[
              styles.summaryText,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            items to buy
          </Text>

        </View>


        <View
          style={styles.summaryRight}
        >

          <Text
            style={[
              styles.summarySmall,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            Total
          </Text>


          <Text
            style={[
              styles.summarySmallNumber,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {totalItems}
          </Text>


          {purchasedItems > 0 && (

            <Text
              style={[
                styles.purchasedCount,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              {purchasedItems} purchased
            </Text>

          )}

        </View>

      </View>


      {/* ================================================== */}
      {/* GENERATE BUTTON */}
      {/* ================================================== */}

      <Pressable
        style={[
          styles.generateButton,
          {
            backgroundColor:
              colors.primary,
          },

          generating &&
            styles.disabledButton,
        ]}
        onPress={handleGenerate}
        disabled={generating}
      >

        {generating ? (

          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />

        ) : (

          <RefreshCw
            size={20}
            color="#FFFFFF"
          />

        )}


        <Text
          style={styles.generateText}
        >
          {generating
            ? "Generating..."
            : "Generate Grocery List"}
        </Text>

      </Pressable>


      {/* ================================================== */}
      {/* EMPTY STATE */}
      {/* ================================================== */}

      {items.length === 0 ? (

        <View
          style={[
            styles.emptyContainer,
            {
              backgroundColor:
                colors.card,
              borderColor:
                colors.border,
            },
          ]}
        >

          <View
            style={[
              styles.emptyIcon,
              {
                backgroundColor:
                  colors.primaryLight,
              },
            ]}
          >

            <ShoppingCart
              size={35}
              color={colors.primary}
            />

          </View>


          <Text
            style={[
              styles.emptyTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            No Grocery Items
          </Text>


          <Text
            style={[
              styles.emptyText,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            Generate your grocery list
            from your current meal plan
            and pantry.
          </Text>

        </View>

      ) : (

        /* ================================================== */
        /* GROCERY ITEMS */
        /* ================================================== */

        items.map((item) => (

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

              item.purchased &&
                styles.purchasedItem,
            ]}
          >

            {/* ========================================== */}
            {/* CHECKBOX */}
            {/* ========================================== */}

            <Pressable
              style={[
                styles.checkbox,
                {
                  borderColor:
                    colors.border,
                },

                item.purchased && {
                  backgroundColor:
                    colors.primary,

                  borderColor:
                    colors.primary,
                },
              ]}
              onPress={() =>
                togglePurchased(item)
              }
              disabled={
                updatingId === item.id
              }
            >

              {item.purchased && (

                <Check
                  size={19}
                  color="#FFFFFF"
                  strokeWidth={3}
                />

              )}

            </Pressable>


            {/* ========================================== */}
            {/* ITEM INFORMATION */}
            {/* ========================================== */}

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

                  item.purchased && {
                    textDecorationLine:
                      "line-through",

                    color:
                      colors.textMuted,
                  },
                ]}
              >
                {item.item}
              </Text>


              <Text
                style={[
                  styles.quantity,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {item.quantity}{" "}
                {item.unit}
              </Text>

            </View>


            {/* ========================================== */}
            {/* DELETE */}
            {/* ========================================== */}

            <Pressable
              onPress={() =>
                confirmDelete(item)
              }
              disabled={
                deletingId === item.id
              }
              style={[
                styles.removeButton,
                {
                  backgroundColor:
                    colors.dangerLight,
                },
              ]}
            >

              {deletingId === item.id ? (

                <ActivityIndicator
                  size="small"
                  color={colors.danger}
                />

              ) : (

                <Trash2
                  size={18}
                  color={colors.danger}
                />

              )}

            </Pressable>

          </View>

        ))

      )}


      {/* ================================================== */}
      {/* PLACE ORDER */}
      {/* ================================================== */}

      {items.length > 0 && (

        <Pressable
          style={[
            styles.orderButton,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          onPress={placeOrder}
        >

          <ShoppingCart
            size={20}
            color="#FFFFFF"
          />

          <Text
            style={styles.orderText}
          >
            Place Order
          </Text>

        </Pressable>

      )}

    </ScrollView>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },


  // ==========================================================
  // HEADER
  // ==========================================================

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 7,
    lineHeight: 20,
  },

  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },


  // ==========================================================
  // SUMMARY
  // ==========================================================

  summary: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryInfo: {
    marginLeft: 12,
    flex: 1,
  },

  summaryNumber: {
    fontSize: 30,
    fontWeight: "800",
  },

  summaryText: {
    marginTop: 2,
  },

  summaryRight: {
    alignItems: "flex-end",
  },

  summarySmall: {
    fontSize: 12,
  },

  summarySmallNumber: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },

  purchasedCount: {
    fontSize: 11,
    marginTop: 3,
  },


  // ==========================================================
  // GENERATE
  // ==========================================================

  generateButton: {
    borderRadius: 15,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    marginBottom: 15,
  },

  generateText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.65,
  },


  // ==========================================================
  // ITEM
  // ==========================================================

  item: {
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    elevation: 1,
  },

  purchasedItem: {
    opacity: 0.65,
  },

  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
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


  // ==========================================================
  // DELETE
  // ==========================================================

  removeButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },


  // ==========================================================
  // PLACE ORDER
  // ==========================================================

  orderButton: {
    borderRadius: 15,
    padding: 17,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    marginTop: 12,
  },

  orderText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },


  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyContainer: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "800",
  },

  emptyText: {
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },


  // ==========================================================
  // LOADING
  // ==========================================================

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },

});