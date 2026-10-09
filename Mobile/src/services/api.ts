import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL = "https://mealplanner-6ec7.onrender.com";

export const USER_ID_KEY = "user_id";

/**
 * Get the backend user ID belonging to the currently
 * signed-in Firebase user.
 */
export async function getStoredUserId(): Promise<number> {
  const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);

  if (!storedUserId) {
    throw new Error(
      "Your account session is not ready. Please sign out and sign in again."
    );
  }

  const userId = Number(storedUserId);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error(
      "Your account session is invalid. Please sign out and sign in again."
    );
  }

  return userId;
}

// ============================================================
// TYPES
// ============================================================

export interface ChatResponse {
  success?: boolean;
  response?: string;
  message?: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
}

// ============================================================
// USER PROFILE
// ============================================================

export interface UserProfile {
  name?: string;
  age?: number;
  sex?: string;

  height?: number;
  weight?: number;

  goal?: string;
  activity_level?: string;
  diet_type?: string;
  meals_per_day?: number;
  budget?: string;

  allergies?: string[];
  disliked_foods?: string[];
  favorite_foods?: string[];

  health_considerations?: string[];
  daily_schedule?: string[];
  cuisine_preferences?: string[];
}

// ============================================================
// PANTRY
// ============================================================

export interface PantryItem {
  id: number;
  user_id: number;
  item: string;
  quantity: number;
  unit: string;
}

// ============================================================
// GROCERY
// ============================================================

export interface GroceryItem {
  id: number;
  user_id: number;
  item: string;
  quantity: number;
  unit: string;
  purchased: boolean;
}

export interface GroceryListResponse {
  success: boolean;
  message?: string;
  user_id?: number;
  items: GroceryItem[];
}

// ============================================================
// COMMON API REQUEST
// ============================================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 300000);

  try {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,

        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },

        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    let data: any = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message =
        data?.detail ||
        data?.message ||
        `Backend error: ${response.status}`;

      throw new Error(
        `${message} (${response.status} ${response.statusText}) - ${endpoint}`
      );
    }

    return data as T;

  } catch (error: any) {
    clearTimeout(timeout);

    if (error?.name === "AbortError") {
      throw new Error(
        "The request took too long. Please try again."
      );
    }

    if (
      error instanceof TypeError ||
      error?.message?.includes("Network request failed")
    ) {
      throw new Error(
        "Unable to connect to Meal Planner backend. Make sure FastAPI is running on port 8000."
      );
    }

    throw error;
  }
}

// ============================================================
// HEALTH
// ============================================================

export async function checkBackendHealth() {
  return apiRequest<{
    success?: boolean;
    status: string;
  }>("/health");
}

// ============================================================
// TEST BACKEND
// ============================================================

export async function testBackend() {
  return apiRequest<{
    success: boolean;
    message: string;
  }>("/test");
}

// ============================================================
// CHAT
// ============================================================

export async function sendChatMessage(
  message: string,
  userId: number
): Promise<ChatResponse> {
  if (!message.trim()) {
    throw new Error("Message cannot be empty.");
  }

  return apiRequest<ChatResponse>("/chat", {
    method: "POST",

    body: JSON.stringify({
      message: message.trim(),
      user_id: userId,
    }),
  });
}

// ============================================================
// QUICK ASK MEAL PLANNER
// ============================================================

export async function askMealPlanner(
  message: string,
  userId: number
): Promise<ChatResponse> {
  if (!message.trim()) {
    throw new Error("Message cannot be empty.");
  }

  return apiRequest<ChatResponse>("/ask", {
    method: "POST",

    body: JSON.stringify({
      message: message.trim(),
      user_id: userId,
    }),
  });
}

// ============================================================
// PROFILE
// ============================================================

export async function getProfile(
  userId: number
): Promise<ApiResponse<UserProfile>> {
  return apiRequest<ApiResponse<UserProfile>>(
    `/profile/${userId}`
  );
}

export async function updateProfile(
  profile: Partial<UserProfile>,
  userId: number
): Promise<ApiResponse<UserProfile>> {
  return apiRequest<ApiResponse<UserProfile>>(
    `/profile/${userId}`,
    {
      method: "PUT",

      body: JSON.stringify(profile),
    }
  );
}

// ============================================================
// PANTRY
// ============================================================

export async function getPantry(
  userId: number
): Promise<ApiResponse<PantryItem[]>> {
  return apiRequest<ApiResponse<PantryItem[]>>(
    `/pantry?user_id=${userId}`,
    {
      method: "GET",
    }
  );
}

export async function addPantryItem(
  item: string,
  quantity: number,
  unit: string,
  userId: number
): Promise<ApiResponse<PantryItem>> {
  return apiRequest<ApiResponse<PantryItem>>(
    `/pantry?user_id=${userId}`,
    {
      method: "POST",

      body: JSON.stringify({
        item,
        quantity,
        unit,
      }),
    }
  );
}

export async function updatePantryItem(
  itemId: number,
  userId: number,
  item?: string,
  quantity?: number,
  unit?: string,
): Promise<ApiResponse<PantryItem>> {
  const body: {
    item?: string;
    quantity?: number;
    unit?: string;
  } = {};

  if (item !== undefined) {
    body.item = item;
  }

  if (quantity !== undefined) {
    body.quantity = quantity;
  }

  if (unit !== undefined) {
    body.unit = unit;
  }

  return apiRequest<ApiResponse<PantryItem>>(
    `/pantry/${itemId}?user_id=${userId}`,
    {
      method: "PUT",

      body: JSON.stringify(body),
    }
  );
}

export async function deletePantryItem(
  itemId: number,
  userId: number
): Promise<ApiResponse> {
  return apiRequest<ApiResponse>(
    `/pantry/${itemId}?user_id=${userId}`,
    {
      method: "DELETE",
    }
  );
}

// ============================================================
// MEAL PLAN
// ============================================================

export interface MealPlanResponse {
  success: boolean;
  user_id: number;
  days: number;
  meal_plan: string;
  meal_plan_data?: any;
  meal_plan_id?: number;
  message?: string;
}

export interface GetMealPlanResponse {
  success: boolean;
  user_id: number;
  days: number;
  meal_plan: string;
  meal_plan_data?: any;
  meal_plan_id?: number;
  id?: number;
  plan_date?: string;
  created_at?: string | null;
  message?: string;
}

export async function generateMealPlan(
  userId: number,
  days: number = 1,
  excludedIngredients: string[] = []
): Promise<MealPlanResponse> {
  return apiRequest<MealPlanResponse>("/meal-plan", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      days,
      excluded_ingredients: excludedIngredients
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    }),
  });
}

export async function getMealPlan(
  userId: number
): Promise<GetMealPlanResponse> {
  return apiRequest<GetMealPlanResponse>(
    `/meal-plan?user_id=${userId}`,
    {
      method: "GET",
    }
  );
}


// ============================================================
// GROCERY
// ============================================================

/**
 * Get currently saved grocery items.
 *
 * Backend:
 * GET /grocery?user_id=1
 */
export async function getGroceryList(
  userId: number
): Promise<GroceryListResponse> {
  return apiRequest<GroceryListResponse>(
    `/grocery?user_id=${userId}`,
    {
      method: "GET",
    }
  );
}


/**
 * Generate a new grocery list.
 *
 * Backend:
 * POST /grocery/generate?user_id=1
 */
export async function generateGroceryList(
  userId: number
): Promise<GroceryListResponse> {
  return apiRequest<GroceryListResponse>(
    `/grocery/generate?user_id=${userId}`,
    {
      method: "POST",
    }
  );
}


/**
 * Update grocery item.
 *
 * Used mainly for purchased/unpurchased state.
 *
 * Backend:
 * PUT /grocery/{item_id}?user_id=1
 */
export async function updateGroceryItem(
  itemId: number,
  data: {
    item?: string;
    quantity?: number;
    unit?: string;
    purchased?: boolean;
  },
  userId: number
): Promise<GroceryListResponse> {
  return apiRequest<GroceryListResponse>(
    `/grocery/${itemId}?user_id=${userId}`,
    {
      method: "PUT",

      body: JSON.stringify(data),
    }
  );
}


/**
 * Delete grocery item.
 *
 * Backend:
 * DELETE /grocery/{item_id}?user_id=1
 */
export async function deleteGroceryItem(
  itemId: number,
  userId: number
): Promise<ApiResponse> {
  return apiRequest<ApiResponse>(
    `/grocery/${itemId}?user_id=${userId}`,
    {
      method: "DELETE",
    }
  );
}

// ============================================================
// NUTRITION
// ============================================================

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface NutritionResponse {
  success: boolean;
  user_id: number;
  date: string;
  daily_target: NutritionTotals;
  consumed: NutritionTotals;
  remaining: NutritionTotals;
  consumed_meals: number;
  total_meals: number;
  message?: string;
}


export async function getNutrition(
  userId: number
): Promise<NutritionResponse> {
  return apiRequest<NutritionResponse>(
    `/nutrition/today?user_id=${userId}`,
    {
      method: "GET",
    }
  );
}

// ============================================================
// TODAY'S MEALS
// ============================================================

export interface MealIngredient {
  item: string;
  quantity: number;
  unit: string;
}

export interface DailyMeal {
  id: number;
  user_id: number;
  meal_date: string;
  meal_type: string;
  meal_name: string;
  description?: string;
  calories?: number;
  protein?: string;
  carbohydrates?: string;
  fat?: string;
  ingredients?: MealIngredient[];
  consumed?: boolean;
}

export interface TodayMealsResponse {
  success: boolean;
  date: string;
  meals: DailyMeal[];
}

export async function getTodayMeals(
  userId: number
): Promise<TodayMealsResponse> {
  return apiRequest<TodayMealsResponse>(
    `/meals/today?user_id=${userId}`
  );
}

export interface ConsumeMealResponse {
  success: boolean;
  message: string;
  meal_id: number;
  meal_name: string;
  consumed: boolean;
  pantry_updates?: Array<{
    item: string;
    previous_quantity: number;
    previous_unit: string;
    deducted_quantity: number;
    deducted_unit: string;
    remaining_quantity: number;
    remaining_unit: string;
  }>;
}

export async function consumeMeal(
  mealId: number,
  userId: number
): Promise<ConsumeMealResponse> {
  return apiRequest<ConsumeMealResponse>("/meals/consume", {
    method: "POST",
    body: JSON.stringify({
      meal_id: mealId,
      user_id: userId,
    }),
  });
}

// ============================================================
// ERROR HANDLER
// ============================================================

export function getApiErrorMessage(
  error: unknown
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while connecting to the backend.";
}

// ============================================================
// AUDIO TRANSCRIPTION
// ============================================================

/** Upload a phone recording to FastAPI and return the recognized text.
 * Backend endpoint: POST /transcribe (multipart field: audio).
 *
 * Uses Expo FileSystem's native multipart uploader instead of fetch + FormData,
 * which avoids "Unsupported FormDataPart implementation" on some RN versions.
 */
export async function transcribeAudio(audioUri: string): Promise<string> {
  if (!audioUri || typeof audioUri !== "string") {
    throw new Error("Audio recording URI is missing. Please record again.");
  }

  try {
    // The legacy module exposes uploadAsync, which performs a native multipart upload.
    const FileSystem = await import("expo-file-system/legacy");

    const uploadTask = FileSystem.uploadAsync(
      `${API_BASE_URL}/transcribe`,
      audioUri,
      {
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "audio",
        mimeType: "audio/mp4",
        headers: {
          Accept: "application/json",
        },
      }
    );

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error("Transcription timed out. Please try again.")),
        120000
      );
    });

    let result: Awaited<typeof uploadTask>;
    try {
      result = await Promise.race([uploadTask, timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    let data: any = null;
    try {
      data = JSON.parse(result.body);
    } catch {
      data = null;
    }

    if (result.status < 200 || result.status >= 300) {
      const detail =
        data?.detail ||
        data?.message ||
        `Transcription failed (${result.status})`;
      throw new Error(
        typeof detail === "string" ? detail : JSON.stringify(detail)
      );
    }

    if (typeof data?.text !== "string" || !data.text.trim()) {
      throw new Error(
        data?.detail || "No speech was detected. Please try again."
      );
    }

    return data.text.trim();
  } catch (error: any) {
    if (
      error?.message?.includes("Transcription timed out") ||
      error?.name === "AbortError"
    ) {
      throw new Error("Transcription timed out. Please try again.");
    }

    if (
      error instanceof TypeError ||
      error?.message?.includes("Network request failed") ||
      error?.message?.includes("Unable to resolve host")
    ) {
      throw new Error(
        "Cannot connect to the backend. Make sure FastAPI is running on port 8000 and the Android emulator can reach it."
      );
    }

    throw error;
  }
}

// ============================================================
// TEXT TO SPEECH — ALEXA-STYLE VOICE RESPONSE
// ============================================================

export async function textToSpeech(
  text: string
): Promise<string> {
  if (!text.trim()) {
    throw new Error("There is no answer to speak.");
  }

  const result = await apiRequest<{
    audio_base64: string;
    mime_type: string;
  }>("/tts", {
    method: "POST",
    body: JSON.stringify({ text: text.trim() }),
  });

  if (!result.audio_base64) {
    throw new Error("The backend returned no speech audio.");
  }

  return result.audio_base64;
}

export interface SyncUserResponse {
  success: boolean;
  message?: string;

  data?: {
    user_id: number;
    email: string;
    name?: string | null;
    firebase_uid: string;
  };
}

export async function syncUserWithBackend(
  idToken: string,
  name: string | null
): Promise<SyncUserResponse> {
  if (!idToken.trim()) {
    throw new Error("Firebase ID token is missing. Please sign in again.");
  }

  const response = await apiRequest<SyncUserResponse>(
    "/auth/sync-user",
    {
      method: "POST",
      body: JSON.stringify({
        id_token: idToken,
        name: name?.trim() || null,
      }),
    }
  );

  if (!response.success || !response.data?.user_id) {
    throw new Error(
      response.message || "Unable to synchronize your account."
    );
  }

  await AsyncStorage.setItem(
    USER_ID_KEY,
    String(response.data.user_id)
  );

  console.log(
    "Backend user_id saved:",
    response.data.user_id
  );

  return response;
}