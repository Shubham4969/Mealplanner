const API_BASE_URL = "http://10.0.2.2:8000";

export async function sendChatMessage(
  message: string
) {
  const response = await fetch(
    `${API_BASE_URL}/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Backend error: ${response.status}`
    );
  }

  return response.json();
}

export async function getMealPlan() {
  const response = await fetch(
    `${API_BASE_URL}/meal-plan`
  );

  if (!response.ok) {
    throw new Error(
      `Backend error: ${response.status}`
    );
  }

  return response.json();
}

export async function getPantry() {
  const response = await fetch(
    `${API_BASE_URL}/pantry`
  );

  if (!response.ok) {
    throw new Error(
      `Backend error: ${response.status}`
    );
  }

  return response.json();
}

export async function getGroceryList() {
  const response = await fetch(
    `${API_BASE_URL}/grocery`
  );

  if (!response.ok) {
    throw new Error(
      `Backend error: ${response.status}`
    );
  }

  return response.json();
}

export async function getNutrition() {
  const response = await fetch(
    `${API_BASE_URL}/nutrition`
  );

  if (!response.ok) {
    throw new Error(
      `Backend error: ${response.status}`
    );
  }

  return response.json();
}