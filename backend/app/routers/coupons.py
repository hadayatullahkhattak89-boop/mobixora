from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from decimal import Decimal

from app.core.database import get_db
from app.models import Coupon
from app.schemas import CouponCreate, CouponResponse, CouponValidateRequest, CouponValidateResponse
from app.dependencies import get_current_admin

router = APIRouter(prefix="/coupons", tags=["Coupons"])

@router.post("/validate", response_model=CouponValidateResponse)
def validate_coupon(req: CouponValidateRequest, db: Session = Depends(get_db)):
    code_clean = req.code.strip().upper()
    coupon = db.query(Coupon).filter(
        Coupon.code == code_clean,
        Coupon.is_active == True
    ).first()

    if not coupon:
        return CouponValidateResponse(
            valid=False,
            code=code_clean,
            discount_type="none",
            discount_value=Decimal("0.00"),
            discount_amount=Decimal("0.00"),
            message="Invalid or expired coupon code"
        )

    # Check expiry
    if coupon.expiry_date and coupon.expiry_date < datetime.now(timezone.utc):
        return CouponValidateResponse(
            valid=False,
            code=code_clean,
            discount_type=coupon.discount_type,
            discount_value=coupon.discount_value,
            discount_amount=Decimal("0.00"),
            message="Coupon has expired"
        )

    # Check usage limit
    if coupon.usage_limit and coupon.times_used >= coupon.usage_limit:
        return CouponValidateResponse(
            valid=False,
            code=code_clean,
            discount_type=coupon.discount_type,
            discount_value=coupon.discount_value,
            discount_amount=Decimal("0.00"),
            message="Coupon usage limit reached"
        )

    # Check minimum order
    if req.subtotal < coupon.minimum_order:
        return CouponValidateResponse(
            valid=False,
            code=code_clean,
            discount_type=coupon.discount_type,
            discount_value=coupon.discount_value,
            discount_amount=Decimal("0.00"),
            message=f"Minimum order of Rs. {int(coupon.minimum_order):,} required for this coupon"
        )

    # Calculate discount
    if coupon.discount_type == "percentage":
        discount = (req.subtotal * coupon.discount_value) / Decimal("100.00")
        if coupon.maximum_discount and discount > coupon.maximum_discount:
            discount = coupon.maximum_discount
    else:  # fixed
        discount = min(coupon.discount_value, req.subtotal)

    return CouponValidateResponse(
        valid=True,
        code=coupon.code,
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        discount_amount=round(discount, 2),
        message="Coupon applied successfully!"
    )

@router.get("", response_model=List[CouponResponse])
def get_coupons(
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Coupon).order_by(Coupon.id.desc()).all()

@router.post("", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
def create_coupon(
    coupon_in: CouponCreate,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    code_upper = coupon_in.code.strip().upper()
    existing = db.query(Coupon).filter(Coupon.code == code_upper).first()
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    new_coupon = Coupon(
        code=code_upper,
        discount_type=coupon_in.discount_type,
        discount_value=coupon_in.discount_value,
        minimum_order=coupon_in.minimum_order,
        maximum_discount=coupon_in.maximum_discount,
        expiry_date=coupon_in.expiry_date,
        usage_limit=coupon_in.usage_limit,
        is_active=coupon_in.is_active
    )
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return new_coupon

@router.delete("/{coupon_id}")
def delete_coupon(
    coupon_id: int,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    db.delete(coupon)
    db.commit()
    return {"message": "Coupon deleted successfully"}
