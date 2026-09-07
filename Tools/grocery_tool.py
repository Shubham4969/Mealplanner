def find_missing_ingredient(
        pantry: list[str],
        recipe: list[str]
)-> list[str]:
    """
    Return ingredients that are required by the recipe
    but are not available in the pantry.
    """

    pantry_set = {item.lower() for item in pantry}

    missing = [
        ingredient
        for ingredient in recipe
        if ingredient.lower() not in pantry_set
    ]

    return missing

def generate_grocery_list(missing_item: list[str])->str:
    """
    Convert missing ingredients into
    a user-friendly grocery list.
    """

    if not missing_item:
        return "✅ You already have everything needed."

    grocery_list = "\n".join(
        f"- {item}"
        for item in missing_item
    )

    return f"🛒 Grocery List:\n\n{grocery_list}"

CATEGORIES = { 
    "tomato": "Vegetables",
    "onion": "Vegetables",
    "milk": "Dairy",
    "cheese": "Dairy",
    "chicken": "Meat",
    "rice": "Grains"
}

def categorize_items(items: list[str])-> dict[str, list[str]]:
    result = {}

    for item in items:
        category = CATEGORIES.get(item.lower(), "Other")

        result.setdefault(category, []).append(item)

    return result
