from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import Wishlist, Product, User
from app.schemas import WishlistToggle
from app.dependencies import get_current_user
from app.routers.products import enrich_product_data

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.get("")
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()
    result = []
    for item in items:
        if item.product and item.product.is_active:
            result.append({
                "id": item.id,
                "product_id": item.product_id,
                "product": enrich_product_data(item.product, db),
                "created_at": item.created_at
            })
    return result

@router.post("/toggle")
def toggle_wishlist(
    data: WishlistToggle,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == data.product_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"action": "removed", "in_wishlist": False, "message": "Product removed from wishlist"}
    else:
        new_item = Wishlist(user_id=current_user.id, product_id=data.product_id)
        db.add(new_item)
        db.commit()
        return {"action": "added", "in_wishlist": True, "message": "Product added to wishlist"}

@router.delete("/{product_id}")
def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not in wishlist")

    db.delete(item)
    db.commit()
    return {"message": "Product removed from wishlist"}
