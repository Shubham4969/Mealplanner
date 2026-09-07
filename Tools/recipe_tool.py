from Qdrant.retrieve import search_result

def search_recipes(query: str):
    """
    Search the recipes knowalage based for revelant resipes.
    """
    return search_result(query)

def find_recipes_by_name(recipes_name: str):
    """
    Search for specific by name.
    """
    return search_result(recipes_name)

def find_recipes_by_category(catogary: str):
    """
    Search for recipes belong to a catogary.
    """
    return search_result(catogary)

def find_recipes_by_diet(diet: str):
    """
    Search for recipes matching a dietary preference.
    """
    return search_result(diet)


