from sqlalchemy.orm import Session
from DataBase.connection import SessionLocal
from DataBase.pantry_table import Pantryitem
from DataBase.conversation_table import Conversation, ConversationHistory

def get_pantry_items()-> list[Pantryitem]:
    db: Session = SessionLocal()

    try:
        return (
            db.query(Pantryitem)
                .order_by(Pantryitem.item)
                .all()
)
    finally:
        db.close()


def add_pantry_item(
    item: str,
    quantity: int
) -> Pantryitem:
    """
    Add a new pantry item.
    If the item already exists, increase its quantity if required.
    """

    db: Session = SessionLocal()

    try:
        existing_item = (
            db.query(Pantryitem)
            .filter(Pantryitem.item == item)
            .first()
        )

        if existing_item:
            existing_item.quantity += quantity
            db.commit()
            db.refresh(existing_item)
            return existing_item

        pantry_item = Pantryitem(
            item=item,
            quantity=quantity
        )

        db.add(pantry_item)
        db.commit()
        db.refresh(pantry_item)
        return pantry_item
    
    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def update_pantry_item(
    item: str,
    quantity: int
)->bool:
    db: Session = SessionLocal()

    try:
        pantry_item = (
            db.query(Pantryitem)
            .filter(Pantryitem.item == item)
            .first()
        )

        if pantry_item:
            pantry_item.quantity = quantity
            db.commit()
            db.refresh(pantry_item)
            return True
        return False
    
    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def remove_pantry_item(
        item: str
        )->bool:
    db: Session = SessionLocal()

    try:
        pantry_item = (
            db.query(Pantryitem)
            .filter(Pantryitem.item == item)
            .first()
        )

        if pantry_item:
            db.delete(pantry_item)
            db.commit()
            return True
        return False
    
    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def ingredient_exists(
        item: str
        ) -> bool:
    """
    Check whether an ingredient exists in the pantry.
    """
    db: Session = SessionLocal()

    try:
        pantry_item = (
            db.query(Pantryitem)
            .filter(Pantryitem.item == item)
            .first()
        )
        return pantry_item is not None
    
    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
        

def low_stock_items(
    threshold: int = 2
)-> list[Pantryitem]:
    db: Session = SessionLocal()

    try:
        return (
            db.query(Pantryitem)
            .filter(Pantryitem.quantity <= threshold)
            .order_by(Pantryitem.quantity)
            .all()
        )
    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

def create_conversation(
    user_id: int,
    title: str
) -> Conversation:

    db: Session = SessionLocal()

    try:

        conversation = Conversation(
            user_id=user_id,
            title=title
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def save_message(
    conversation_id: int,
    role: str,
    message: str
) -> ConversationHistory:

    db: Session = SessionLocal()

    try:

        conversation = ConversationHistory(
            conversation_id=conversation_id,
            role=role,
            message=message
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()