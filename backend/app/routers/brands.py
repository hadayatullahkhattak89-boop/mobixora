from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Brand
from app.schemas import BrandResponse, BrandCreate, BrandUpdate
from app.dependencies import get_current_admin

router = APIRouter(prefix="/brands", tags=["Brands"])

@router.get("", response_model=List[BrandResponse])
def get_brands(active_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(Brand)
    if active_only:
        query = query.filter(Brand.is_active == True)
    return query.order_by(Brand.name.asc()).all()

@router.get("/{id_or_slug}", response_model=BrandResponse)
def get_brand(id_or_slug: str, db: Session = Depends(get_db)):
    if id_or_slug.isdigit():
        brand = db.query(Brand).filter(Brand.id == int(id_or_slug)).first()
    else:
        brand = db.query(Brand).filter(Brand.slug == id_or_slug).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand

@router.post("", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
def create_brand(
    brand_in: BrandCreate,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Brand).filter(Brand.slug == brand_in.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Brand slug already exists")
    
    new_brand = Brand(
        name=brand_in.name,
        slug=brand_in.slug.lower().strip(),
        logo=brand_in.logo,
        is_active=brand_in.is_active
    )
    db.add(new_brand)
    db.commit()
    db.refresh(new_brand)
    return new_brand

@router.put("/{brand_id}", response_model=BrandResponse)
def update_brand(
    brand_id: int,
    brand_in: BrandUpdate,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    if brand_in.name is not None:
        brand.name = brand_in.name
    if brand_in.slug is not None:
        brand.slug = brand_in.slug.lower().strip()
    if brand_in.logo is not None:
        brand.logo = brand_in.logo
    if brand_in.is_active is not None:
        brand.is_active = brand_in.is_active
        
    db.commit()
    db.refresh(brand)
    return brand

@router.delete("/{brand_id}")
def delete_brand(
    brand_id: int,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    db.delete(brand)
    db.commit()
    return {"message": "Brand deleted successfully"}
