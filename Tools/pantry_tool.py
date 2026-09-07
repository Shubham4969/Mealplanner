from DataBase.pantry_table import Pantryitem
from DataBase.crud import (
    get_pantry_items,
    add_pantry_item,
    update_pantry_item,
    remove_pantry_item,
    ingredient_exists,
    low_stock_items,
)


def show_pantry()->list[Pantryitem]:
    """
    Return all pantry items.
    """
    return get_pantry_items()


def add_item(
    item: str,
    quantity: int,
)-> Pantryitem:
    """
    Add an item to the pantry.
    """
    return add_pantry_item(item, quantity)


def update_item(
    item: str,
    quantity: int,
) -> bool:
    """
    Update an existing pantry item.
    """
    return update_pantry_item(item, quantity)


def remove_item(
    item: str,
) -> bool:
    """
    Remove an item from the pantry.
    """
    return remove_pantry_item(item)


def item_exists(
    item: str,
) -> bool:
    """
    Check whether an item exists.
    """
    return ingredient_exists(item)


def get_low_stock(
    threshold: int = 2,
)-> list[Pantryitem]:
    """
    Return low stock pantry items.
    """
    return low_stock_items(threshold)