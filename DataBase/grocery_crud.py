from sqlalchemy.orm import Session

from .grocery_table import Groceryitem


def get_all_grocery_items(
    session: Session,
    user_id: int
):
    return (
        session.query(Groceryitem)
        .filter(Groceryitem.user_id == user_id)
        .order_by(Groceryitem.id)
        .all()
    )


def get_grocery_item(
    session: Session,
    item_id: int,
    user_id: int
):
    return (
        session.query(Groceryitem)
        .filter(
            Groceryitem.id == item_id,
            Groceryitem.user_id == user_id
        )
        .first()
    )


def add_grocery_item(
    session: Session,
    user_id: int,
    item: str,
    quantity: float,
    unit: str
):
    grocery_item = Groceryitem(
        user_id=user_id,
        item=item,
        quantity=quantity,
        unit=unit,
        purchased=False
    )

    session.add(grocery_item)
    session.commit()
    session.refresh(grocery_item)

    return grocery_item


def update_grocery_item(
    session: Session,
    user_id: int,
    item_id: int,
    item: str | None = None,
    quantity: float | None = None,
    unit: str | None = None,
    purchased: bool | None = None
):
    grocery_item = get_grocery_item(
        session,
        item_id,
        user_id
    )

    if grocery_item is None:
        return None

    if item is not None:
        grocery_item.item = item

    if quantity is not None:
        grocery_item.quantity = quantity

    if unit is not None:
        grocery_item.unit = unit

    if purchased is not None:
        grocery_item.purchased = purchased

    session.commit()
    session.refresh(grocery_item)

    return grocery_item


def delete_grocery_item(
    session: Session,
    user_id: int,
    item_id: int
):
    grocery_item = get_grocery_item(
        session,
        item_id,
        user_id
    )

    if grocery_item is None:
        return None

    session.delete(grocery_item)
    session.commit()

    return grocery_item


def clear_grocery_items(
    session: Session,
    user_id: int
):
    session.query(Groceryitem).filter(
        Groceryitem.user_id == user_id
    ).delete(
        synchronize_session=False
    )

    session.commit()