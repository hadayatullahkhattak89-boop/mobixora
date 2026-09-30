from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Category
from app.schemas import CategoryResponse, CategoryCreate, CategoryUpdate
from app.dependencies import get_current_admin

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
def get_categories(active_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(Category)
    if active_only:
        query = query.filter(Category.is_active == True)
    return query.order_by(Category.name.asc()).all()

@router.get("/{id_or_slug}", response_model=CategoryResponse)
def get_category(id_or_slug: str, db: Session = Depends(get_db)):
    if id_or_slug.isdigit():
        cat = db.query(Category).filter(Category.id == int(id_or_slug)).first()
    else:
        cat = db.query(Category).filter(Category.slug == id_or_slug).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return cat

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Category).filter(Category.slug == category_in.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")
    
    new_cat = Category(
        name=category_in.name,
        slug=category_in.slug.lower().strip(),
        description=category_in.description,
        image=category_in.image,
        is_active=category_in.is_active
    )
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

@router.put("/{cat_id}", response_model=CategoryResponse)
def update_category(
    cat_id: int,
    category_in: CategoryUpdate,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if category_in.name is not None:
        cat.name = category_in.name
    if category_in.slug is not None:
        cat.slug = category_in.slug.lower().strip()
    if category_in.description is not None:
        cat.description = category_in.description
    if category_in.image is not None:
        cat.image = category_in.image
    if category_in.is_active is not None:
        cat.is_active = category_in.is_active
        
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/{cat_id}")
def delete_category(
    cat_id: int,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully"}
