from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

from app.core.database import get_db
from app.models import Order, OrderItem, Product, ProductVariant, Cart, CartItem, Coupon, User
from app.schemas import OrderCreate, OrderResponse, OrderStatusUpdate
from app.dependencies import get_optional_user, get_current_user, get_current_admin
from app.routers.cart import get_or_create_cart

router = APIRouter(prefix="/orders", tags=["Orders"])

def generate_order_number(db: Session) -> str:
    count = db.query(Order).count() + 1
    year = datetime.now().year
    return f"ORD-{year}-{count:06d}"

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    x_session_id: Optional[str] = Header(None),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    cart = get_or_create_cart(db, current_user, x_session_id)
    
    # Determine items: either from request body or cart
    order_items_to_process = []
    
    if order_in.items and len(order_in.items) > 0:
        for it in order_in.items:
            prod = db.query(Product).filter(Product.id == it.product_id, Product.is_active == True).first()
            if not prod:
                raise HTTPException(status_code=400, detail=f"Product ID {it.product_id} is unavailable")
            var = None
            if it.variant_id:
                var = db.query(ProductVariant).filter(ProductVariant.id == it.variant_id, ProductVariant.product_id == prod.id).first()
            order_items_to_process.append((prod, var, it.quantity))
    else:
        if not cart.items:
            raise HTTPException(status_code=400, detail="Your cart is empty")
        for ci in cart.items:
            if not ci.product or not ci.product.is_active:
                continue
            order_items_to_process.append((ci.product, ci.variant, ci.quantity))

    if not order_items_to_process:
        raise HTTPException(status_code=400, detail="No valid items to place order")

    # Stock verification & Subtotal calculation
    subtotal = Decimal("0.00")
    for prod, var, qty in order_items_to_process:
        if prod.stock < qty:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for '{prod.name}'. Only {prod.stock} left.")
        if var and var.stock < qty:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for variant '{var.variant_value}'. Only {var.stock} left.")

        base_price = prod.sale_price if prod.sale_price is not None else prod.price
        adj = var.price_adjustment if var else Decimal("0.00")
        unit_price = Decimal(str(base_price)) + Decimal(str(adj))
        subtotal += unit_price * qty

    # Coupon validation
    discount_amount = Decimal("0.00")
    applied_coupon = None
    if order_in.coupon_code:
        coupon = db.query(Coupon).filter(
            Coupon.code == order_in.coupon_code.strip().upper(),
            Coupon.is_active == True
        ).first()
        if coupon and subtotal >= coupon.minimum_order:
            if coupon.discount_type == "percentage":
                discount_amount = (subtotal * coupon.discount_value) / Decimal("100.00")
                if coupon.maximum_discount and discount_amount > coupon.maximum_discount:
                    discount_amount = coupon.maximum_discount
            else:
                discount_amount = min(coupon.discount_value, subtotal)
            applied_coupon = coupon

    # Shipping fee calculation (Free delivery above Rs. 3,000)
    shipping_fee = Decimal("0.00") if subtotal >= Decimal("3000.00") else Decimal("250.00")
    total = max(Decimal("0.00"), subtotal - discount_amount + shipping_fee)

    # Create Order
    order_number = generate_order_number(db)
    new_order = Order(
        order_number=order_number,
        user_id=current_user.id if current_user else None,
        customer_name=order_in.customer_name.strip(),
        customer_email=order_in.customer_email.lower().strip(),
        customer_phone=order_in.customer_phone.strip(),
        shipping_address=order_in.shipping_address.strip(),
        shipping_city=order_in.shipping_city.strip(),
        shipping_province=order_in.shipping_province.strip(),
        shipping_postal_code=order_in.shipping_postal_code.strip() if order_in.shipping_postal_code else None,
        subtotal=subtotal,
        discount=discount_amount,
        shipping_fee=shipping_fee,
        total=total,
        payment_method=order_in.payment_method,
        payment_status="Pending" if order_in.payment_method == "Cash on Delivery" else "Paid",
        order_status="Pending",
        notes=order_in.notes,
        coupon_code=applied_coupon.code if applied_coupon else None
    )
    db.add(new_order)
    db.flush()

    # Create OrderItems and decrease inventory
    for prod, var, qty in order_items_to_process:
        base_price = prod.sale_price if prod.sale_price is not None else prod.price
        adj = var.price_adjustment if var else Decimal("0.00")
        unit_price = Decimal(str(base_price)) + Decimal(str(adj))
        item_subtotal = unit_price * qty

        variant_info = f"{var.variant_name}: {var.variant_value}" if var else None
        first_img = prod.images[0].image_url if prod.images else None

        order_item = OrderItem(
            order_id=new_order.id,
            product_id=prod.id,
            product_name=prod.name,
            product_image=first_img,
            quantity=qty,
            price=unit_price,
            subtotal=item_subtotal,
            variant_id=var.id if var else None,
            variant_info=variant_info
        )
        db.add(order_item)

        # Decrement stock
        prod.stock = max(0, prod.stock - qty)
        if var:
            var.stock = max(0, var.stock - qty)

    # Increment coupon usage
    if applied_coupon:
        applied_coupon.times_used += 1

    # Empty user/session cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("", response_model=List[OrderResponse])
def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).options(
        joinedload(Order.items)
    ).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/{order_number_or_id}", response_model=OrderResponse)
def get_order_details(
    order_number_or_id: str,
    db: Session = Depends(get_db)
):
    query = db.query(Order).options(joinedload(Order.items))
    if order_number_or_id.isdigit():
        order = query.filter(Order.id == int(order_number_or_id)).first()
    else:
        order = query.filter(Order.order_number == order_number_or_id.upper()).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order

@router.put("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")

    if order.order_status in ["Delivered", "Cancelled", "Returned"]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel order in '{order.order_status}' status")

    # Restore inventory
    for item in order.items:
        if item.product_id:
            prod = db.query(Product).filter(Product.id == item.product_id).first()
            if prod:
                prod.stock += item.quantity
        if item.variant_id:
            var = db.query(ProductVariant).filter(ProductVariant.id == item.variant_id).first()
            if var:
                var.stock += item.quantity

    order.order_status = "Cancelled"
    db.commit()
    db.refresh(order)
    return order
