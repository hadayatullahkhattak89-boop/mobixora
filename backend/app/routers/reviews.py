from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import Review, Product, Order, OrderItem, User
from app.schemas import ReviewCreate, ReviewResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()
    result = []
    for r in reviews:
        user_name = r.user.name if r.user else "Anonymous Customer"
        result.append(ReviewResponse(
            id=r.id,
            user_id=r.user_id,
            user_name=user_name,
            product_id=r.product_id,
            rating=r.rating,
            comment=r.comment,
            is_verified_purchase=r.is_verified_purchase,
            created_at=r.created_at
        ))
    return result

@router.get("/recent", response_model=List[ReviewResponse])
def get_recent_reviews(limit: int = 6, db: Session = Depends(get_db)):
    reviews = db.query(Review).order_by(Review.created_at.desc()).limit(limit).all()
    result = []
    for r in reviews:
        user_name = r.user.name if r.user else "Customer"
        result.append(ReviewResponse(
            id=r.id,
            user_id=r.user_id,
            user_name=user_name,
            product_id=r.product_id,
            rating=r.rating,
            comment=r.comment,
            is_verified_purchase=r.is_verified_purchase,
            created_at=r.created_at
        ))
    return result

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == review_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if verified purchase
    verified = db.query(OrderItem).join(Order).filter(
        Order.user_id == current_user.id,
        OrderItem.product_id == review_in.product_id,
        Order.order_status.in_(["Delivered", "Completed", "Processing", "Shipped"])
    ).first() is not None

    new_review = Review(
        user_id=current_user.id,
        product_id=review_in.product_id,
        rating=review_in.rating,
        comment=review_in.comment.strip(),
        is_verified_purchase=verified
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return ReviewResponse(
        id=new_review.id,
        user_id=new_review.user_id,
        user_name=current_user.name,
        product_id=new_review.product_id,
        rating=new_review.rating,
        comment=new_review.comment,
        is_verified_purchase=new_review.is_verified_purchase,
        created_at=new_review.created_at
    )
