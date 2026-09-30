from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, or_
from typing import List, Optional
from decimal import Decimal
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.models import Order, OrderItem, Product, User, Category, Brand
from app.schemas import OrderResponse, OrderStatusUpdate, UserResponse
from app.dependencies import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard")
def get_dashboard_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_rev = db.query(func.sum(Order.total)).filter(Order.order_status != "Cancelled").scalar() or Decimal("0.00")
    total_orders = db.query(Order).count()
    total_cust = db.query(User).filter(User.role == "customer").count()
    total_prods = db.query(Product).count()

    pending_orders = db.query(Order).filter(Order.order_status == "Pending").count()
    delivered_orders = db.query(Order).filter(Order.order_status == "Delivered").count()
    cancelled_orders = db.query(Order).filter(Order.order_status == "Cancelled").count()
    low_stock_prods = db.query(Product).filter(Product.stock <= 5).count()

    recent_orders = db.query(Order).options(joinedload(Order.items)).order_by(Order.created_at.desc()).limit(6).all()

    # Sales by day (past 7 days)
    sales_by_day = []
    now = datetime.now()
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_str = day.strftime("%b %d")
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)

        day_orders = db.query(Order).filter(
            Order.created_at >= day_start,
            Order.created_at <= day_end,
            Order.order_status != "Cancelled"
        ).all()

        day_revenue = sum([o.total for o in day_orders], Decimal("0.00"))
        sales_by_day.append({
            "date": day_str,
            "revenue": float(day_revenue),
            "orders": len(day_orders)
        })

    # Order status breakdown
    statuses = ["Pending", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"]
    status_counts = {}
    for s in statuses:
        status_counts[s] = db.query(Order).filter(Order.order_status == s).count()

    return {
        "stats": {
            "total_revenue": total_rev,
            "total_orders": total_orders,
            "total_customers": total_cust,
            "total_products": total_prods,
            "pending_orders": pending_orders,
            "delivered_orders": delivered_orders,
            "cancelled_orders": cancelled_orders,
            "low_stock_products": low_stock_prods
        },
        "sales_chart": sales_by_day,
        "status_breakdown": status_counts,
        "recent_orders": [OrderResponse.model_validate(o) for o in recent_orders]
    }

@router.get("/orders", response_model=List[OrderResponse])
def get_admin_orders(
    status_filter: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Order).options(joinedload(Order.items))
    if status_filter and status_filter.lower() != "all":
        query = query.filter(Order.order_status == status_filter)
    if q:
        search_fmt = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Order.order_number.ilike(search_fmt),
                Order.customer_name.ilike(search_fmt),
                Order.customer_phone.ilike(search_fmt),
                Order.customer_email.ilike(search_fmt)
            )
        )
    return query.order_by(Order.created_at.desc()).all()

@router.put("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_in: OrderStatusUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    old_status = order.order_status

    if status_in.order_status is not None:
        new_status = status_in.order_status
        order.order_status = new_status

        # If cancelled or returned, restore inventory if previously active
        if new_status in ["Cancelled", "Returned"] and old_status not in ["Cancelled", "Returned"]:
            for item in order.items:
                if item.product_id:
                    p = db.query(Product).filter(Product.id == item.product_id).first()
                    if p:
                        p.stock += item.quantity
        # If reactivated from cancelled/returned, deduct inventory again
        elif old_status in ["Cancelled", "Returned"] and new_status not in ["Cancelled", "Returned"]:
            for item in order.items:
                if item.product_id:
                    p = db.query(Product).filter(Product.id == item.product_id).first()
                    if p:
                        p.stock = max(0, p.stock - item.quantity)

    if status_in.payment_status is not None:
        order.payment_status = status_in.payment_status

    db.commit()
    db.refresh(order)
    return order

@router.get("/customers")
def get_admin_customers(
    q: Optional[str] = Query(None),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.role == "customer")
    if q:
        search_fmt = f"%{q.strip()}%"
        query = query.filter(
            or_(
                User.name.ilike(search_fmt),
                User.email.ilike(search_fmt),
                User.phone.ilike(search_fmt)
            )
        )
    users = query.order_by(User.id.desc()).all()
    results = []
    for u in users:
        order_count = db.query(Order).filter(Order.user_id == u.id).count()
        total_spent = db.query(func.sum(Order.total)).filter(Order.user_id == u.id, Order.order_status != "Cancelled").scalar() or Decimal("0.00")
        results.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "orders_count": order_count,
            "total_spent": total_spent
        })
    return results

@router.put("/customers/{customer_id}/toggle-status")
def toggle_customer_status(
    customer_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == customer_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot deactivate admin accounts")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"Customer status updated to {'Active' if user.is_active else 'Inactive'}", "is_active": user.is_active}

@router.get("/inventory")
def get_inventory(
    low_stock_only: bool = Query(False),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Product).options(joinedload(Product.brand), joinedload(Product.category))
    if low_stock_only:
        query = query.filter(Product.stock <= 5)
    products = query.order_by(Product.stock.asc()).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "brand": p.brand.name if p.brand else "N/A",
            "category": p.category.name if p.category else "N/A",
            "price": p.price,
            "sale_price": p.sale_price,
            "stock": p.stock,
            "is_low_stock": p.stock <= 5,
            "is_active": p.is_active
        }
        for p in products
    ]

@router.put("/inventory/{product_id}/stock")
def update_inventory_stock(
    product_id: int,
    stock: int = Query(..., ge=0),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    prod.stock = stock
    db.commit()
    return {"message": "Stock updated successfully", "product_id": prod.id, "new_stock": prod.stock}
