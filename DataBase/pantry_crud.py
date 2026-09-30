from sqlalchemy.orm import Session

from .pantry_table import Pantryitem


def get_all_pantry_items(
    session: Session,
    user_id: int
):
    return (
        session.query(Pantryitem)
        .filter(Pantryitem.user_id == user_id)
        .order_by(Pantryitem.id)
        .all()
    )


def get_pantry_item(
    session: Session,
    item_id: int,
    user_id: int
):
    return (
        session.query(Pantryitem)
        .filter(
            Pantryitem.id == item_id,
            Pantryitem.user_id == user_id
        )
        .first()
    )


def add_pantry_item(
    session: Session,
    user_id: int,
    item: str,
    quantity: int,
    unit: str
):
    pantry_item = Pantryitem(
        user_id=user_id,
        item=item,
        quantity=quantity,
        unit=unit
    )

    session.add(pantry_item)
    session.commit()
    session.refresh(pantry_item)

    return pantry_item


def update_pantry_item(
    session: Session,
    user_id: int,
    item_id: int,
    item: str | None = None,
    quantity: int | None = None,
    unit: str | None = None
):
    pantry_item = get_pantry_item(
        session,
        item_id,
        user_id
    )

    if pantry_item is None:
        return None

    if item is not None:
        pantry_item.item = item

    if quantity is not None:
        pantry_item.quantity = quantity

    if unit is not None:
        pantry_item.unit = unit

    session.commit()
    session.refresh(pantry_item)

    return pantry_item


def delete_pantry_item(
    session: Session,
    user_id: int,
    item_id: int
):
    pantry_item = get_pantry_item(
        session,
        item_id,
        user_id
    )

    if pantry_item is None:
        return None

    session.delete(pantry_item)
    session.commit()

    return pantry_item