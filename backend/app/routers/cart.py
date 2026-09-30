from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from decimal import Decimal

from app.core.database import get_db
from app.models import Cart, CartItem, Product, ProductVariant, User
from app.schemas import CartItemAdd, CartItemUpdate
from app.dependencies import get_optional_user
from app.routers.products import enrich_product_data

router = APIRouter(prefix="/cart", tags=["Cart"])

def get_or_create_cart(db: Session, user: Optional[User], session_id: Optional[str]) -> Cart:
    if user:
        cart = db.query(Cart).filter(Cart.user_id == user.id).first()
        if not cart:
            cart = Cart(user_id=user.id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        return cart
    elif session_id:
        cart = db.query(Cart).filter(Cart.session_id == session_id).first()
        if not cart:
            cart = Cart(session_id=session_id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        return cart
    else:
        # Create an anonymous cart
        import uuid
        new_sess = str(uuid.uuid4())
        cart = Cart(session_id=new_sess)
        db.add(cart)
        db.commit()
        db.refresh(cart)
        return cart

def format_cart_response(cart: Cart, db: Session) -> dict:
    items_data = []
    subtotal = Decimal("0.00")
    total_qty = 0

    for item in cart.items:
        if not item.product or not item.product.is_active:
            continue

        base_price = item.product.sale_price if item.product.sale_price is not None else item.product.price
        adjustment = item.variant.price_adjustment if item.variant else Decimal("0.00")
        unit_price = Decimal(str(base_price)) + Decimal(str(adjustment))
        item_total = unit_price * item.quantity

        subtotal += item_total
        total_qty += item.quantity

        enriched_p = enrich_product_data(item.product, db)

        items_data.append({
            "id": item.id,
            "product_id": item.product_id,
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "product": enriched_p,
            "variant": {
                "id": item.variant.id,
                "variant_name": item.variant.variant_name,
                "variant_value": item.variant.variant_value,
                "price_adjustment": item.variant.price_adjustment,
                "stock": item.variant.stock
            } if item.variant else None,
            "unit_price": unit_price,
            "item_total": item_total
        })

    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "session_id": cart.session_id,
        "items": items_data,
        "subtotal": subtotal,
        "items_count": total_qty
    }

@router.get("")
def get_cart(
    x_session_id: Optional[str] = Header(None),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    cart = get_or_create_cart(db, current_user, x_session_id)
    return format_cart_response(cart, db)

@router.post("/items")
def add_to_cart(
    item_in: CartItemAdd,
    x_session_id: Optional[str] = Header(None),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == item_in.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or inactive")

    if product.stock < item_in.quantity:
        raise HTTPException(status_code=400, detail=f"Only {product.stock} items in stock")

    if item_in.variant_id:
        variant = db.query(ProductVariant).filter(
            ProductVariant.id == item_in.variant_id,
            ProductVariant.product_id == product.id
        ).first()
        if not variant:
            raise HTTPException(status_code=404, detail="Selected variant does not exist")
        if variant.stock < item_in.quantity:
            raise HTTPException(status_code=400, detail=f"Variant stock is low ({variant.stock} available)")

    cart = get_or_create_cart(db, current_user, x_session_id)

    # Check if item already exists in cart with same variant
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_in.product_id,
        CartItem.variant_id == item_in.variant_id
    ).first()

    if existing_item:
        new_quantity = existing_item.quantity + item_in.quantity
        if product.stock < new_quantity:
            raise HTTPException(status_code=400, detail=f"Cannot add more. Total in cart ({new_quantity}) exceeds stock ({product.stock})")
        existing_item.quantity = new_quantity
    else:
        new_item = CartItem(
            cart_id=cart.id,
            product_id=item_in.product_id,
            variant_id=item_in.variant_id,
            quantity=item_in.quantity
        )
        db.add(new_item)

    db.commit()
    db.refresh(cart)
    return format_cart_response(cart, db)

@router.put("/items/{item_id}")
def update_cart_item(
    item_id: int,
    item_in: CartItemUpdate,
    x_session_id: Optional[str] = Header(None),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    cart = get_or_create_cart(db, current_user, x_session_id)
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if item_in.quantity <= 0:
        db.delete(cart_item)
    else:
        if cart_item.product.stock < item_in.quantity:
            raise HTTPException(status_code=400, detail=f"Only {cart_item.product.stock} items available in stock")
        cart_item.quantity = item_in.quantity

    db.commit()
    db.refresh(cart)
    return format_cart_response(cart, db)

@router.delete("/items/{item_id}")
def remove_cart_item(
    item_id: int,
    x_session_id: Optional[str] = Header(None),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    cart = get_or_create_cart(db, current_user, x_session_id)
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()
    db.refresh(cart)
    return format_cart_response(cart, db)

@router.delete("/clear")
def clear_cart(
    x_session_id: Optional[str] = Header(None),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    cart = get_or_create_cart(db, current_user, x_session_id)
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    db.refresh(cart)
    return format_cart_response(cart, db)
