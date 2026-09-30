from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func, desc, asc
from typing import List, Optional
from decimal import Decimal
import re

from app.core.database import get_db
from app.models import Product, ProductImage, ProductVariant, ProductSpecification, Category, Brand, Review
from app.schemas import (
    ProductResponse, ProductDetailResponse, ProductCreate, ProductUpdate,
    ProductVariantCreate, ProductSpecCreate
)
from app.dependencies import get_current_admin

router = APIRouter(prefix="/products", tags=["Products"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'[^\w\-]', '', text)
    return text

def enrich_product_data(product: Product, db: Session) -> dict:
    # Compute rating & review count
    review_stats = db.query(
        func.avg(Review.rating).label("avg_rating"),
        func.count(Review.id).label("count")
    ).filter(Review.product_id == product.id).first()

    avg_rating = float(review_stats.avg_rating or 0.0) if review_stats else 0.0
    count = int(review_stats.count or 0) if review_stats else 0

    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "sku": product.sku,
        "description": product.description,
        "brand_id": product.brand_id,
        "category_id": product.category_id,
        "price": product.price,
        "sale_price": product.sale_price,
        "stock": product.stock,
        "is_featured": product.is_featured,
        "is_new": product.is_new,
        "is_active": product.is_active,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
        "brand": product.brand,
        "category": product.category,
        "images": sorted(product.images, key=lambda x: x.sort_order),
        "variants": product.variants,
        "specifications": product.specifications,
        "rating": round(avg_rating, 1),
        "reviews_count": count
    }

@router.get("")
def get_products(
    q: Optional[str] = Query(None, description="Search term for name, description, SKU, brand"),
    category: Optional[str] = Query(None, description="Category slug or ID"),
    brand: Optional[str] = Query(None, description="Brand slug or ID"),
    min_price: Optional[Decimal] = Query(None),
    max_price: Optional[Decimal] = Query(None),
    min_rating: Optional[float] = Query(None),
    in_stock: Optional[bool] = Query(None),
    is_featured: Optional[bool] = Query(None),
    is_new: Optional[bool] = Query(None),
    on_sale: Optional[bool] = Query(None),
    sort: Optional[str] = Query("newest", description="newest, price_asc, price_desc, popular, rating_desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.images)
    )

    if active_only:
        query = query.filter(Product.is_active == True)

    if q:
        search_fmt = f"%{q.strip()}%"
        query = query.join(Product.brand, isouter=True).join(Product.category, isouter=True).filter(
            or_(
                Product.name.ilike(search_fmt),
                Product.description.ilike(search_fmt),
                Product.sku.ilike(search_fmt),
                Brand.name.ilike(search_fmt),
                Category.name.ilike(search_fmt)
            )
        )

    if category:
        if category.isdigit():
            query = query.filter(Product.category_id == int(category))
        else:
            query = query.join(Product.category).filter(Category.slug == category)

    if brand:
        if brand.isdigit():
            query = query.filter(Product.brand_id == int(brand))
        else:
            query = query.join(Product.brand).filter(Brand.slug == brand)

    if min_price is not None:
        query = query.filter(
            or_(
                and_(Product.sale_price.isnot(None), Product.sale_price >= min_price),
                and_(Product.sale_price.is_(None), Product.price >= min_price)
            )
        )

    if max_price is not None:
        query = query.filter(
            or_(
                and_(Product.sale_price.isnot(None), Product.sale_price <= max_price),
                and_(Product.sale_price.is_(None), Product.price <= max_price)
            )
        )

    if in_stock is True:
        query = query.filter(Product.stock > 0)

    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)

    if is_new is not None:
        query = query.filter(Product.is_new == is_new)

    if on_sale is True:
        query = query.filter(Product.sale_price.isnot(None), Product.sale_price < Product.price)

    # Sorting
    if sort == "price_asc":
        query = query.order_by(func.coalesce(Product.sale_price, Product.price).asc())
    elif sort == "price_desc":
        query = query.order_by(func.coalesce(Product.sale_price, Product.price).desc())
    elif sort == "popular":
        query = query.order_by(Product.is_featured.desc(), Product.id.desc())
    elif sort == "rating_desc":
        # Sort by rating using subquery
        rating_sub = db.query(Review.product_id, func.avg(Review.rating).label("avg_r")).group_by(Review.product_id).subquery()
        query = query.outerjoin(rating_sub, Product.id == rating_sub.c.product_id).order_by(rating_sub.c.avg_r.desc().nullslast())
    else: # newest
        query = query.order_by(Product.created_at.desc(), Product.id.desc())

    total = query.distinct().count()
    items = query.distinct().offset((page - 1) * limit).limit(limit).all()

    enriched_items = [enrich_product_data(item, db) for item in items]

    if min_rating is not None and min_rating > 0:
        enriched_items = [item for item in enriched_items if item["rating"] >= min_rating]

    pages = (total + limit - 1) // limit if total > 0 else 1

    return {
        "items": enriched_items,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages
    }

@router.get("/{slug_or_id}", response_model=ProductDetailResponse)
def get_product(slug_or_id: str, db: Session = Depends(get_db)):
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.category),
        joinedload(Product.images),
        joinedload(Product.variants),
        joinedload(Product.specifications)
    )

    if slug_or_id.isdigit():
        product = query.filter(Product.id == int(slug_or_id)).first()
    else:
        product = query.filter(Product.slug == slug_or_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return enrich_product_data(product, db)

@router.post("", response_model=ProductDetailResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Verify slug uniqueness
    slug = product_in.slug or slugify(product_in.name)
    existing_slug = db.query(Product).filter(Product.slug == slug).first()
    if existing_slug:
        slug = f"{slug}-{int(func.unix_timestamp(func.now()))}"

    # Verify SKU uniqueness
    existing_sku = db.query(Product).filter(Product.sku == product_in.sku).first()
    if existing_sku:
        raise HTTPException(status_code=400, detail="SKU already exists")

    new_prod = Product(
        name=product_in.name,
        slug=slug,
        sku=product_in.sku,
        description=product_in.description,
        brand_id=product_in.brand_id,
        category_id=product_in.category_id,
        price=product_in.price,
        sale_price=product_in.sale_price,
        stock=product_in.stock,
        is_featured=product_in.is_featured,
        is_new=product_in.is_new,
        is_active=product_in.is_active
    )
    db.add(new_prod)
    db.flush()

    # Images
    if product_in.images:
        for idx, img_url in enumerate(product_in.images):
            db.add(ProductImage(product_id=new_prod.id, image_url=img_url, sort_order=idx))

    # Variants
    if product_in.variants:
        for v in product_in.variants:
            db.add(ProductVariant(
                product_id=new_prod.id,
                variant_name=v.variant_name,
                variant_value=v.variant_value,
                price_adjustment=v.price_adjustment,
                stock=v.stock
            ))

    # Specifications
    if product_in.specifications:
        for s in product_in.specifications:
            db.add(ProductSpecification(
                product_id=new_prod.id,
                specification_name=s.specification_name,
                specification_value=s.specification_value
            ))

    db.commit()
    db.refresh(new_prod)
    return enrich_product_data(new_prod, db)

@router.put("/{product_id}", response_model=ProductDetailResponse)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    update_fields = [
        "name", "description", "brand_id", "category_id",
        "price", "sale_price", "stock", "is_featured", "is_new", "is_active"
    ]
    for field in update_fields:
        val = getattr(product_in, field)
        if val is not None:
            setattr(prod, field, val)

    if product_in.slug:
        prod.slug = product_in.slug.lower().strip()
    if product_in.sku:
        prod.sku = product_in.sku.strip()

    if product_in.images is not None:
        db.query(ProductImage).filter(ProductImage.product_id == prod.id).delete()
        for idx, img_url in enumerate(product_in.images):
            db.add(ProductImage(product_id=prod.id, image_url=img_url, sort_order=idx))

    if product_in.variants is not None:
        db.query(ProductVariant).filter(ProductVariant.product_id == prod.id).delete()
        for v in product_in.variants:
            db.add(ProductVariant(
                product_id=prod.id,
                variant_name=v.variant_name,
                variant_value=v.variant_value,
                price_adjustment=v.price_adjustment,
                stock=v.stock
            ))

    if product_in.specifications is not None:
        db.query(ProductSpecification).filter(ProductSpecification.product_id == prod.id).delete()
        for s in product_in.specifications:
            db.add(ProductSpecification(
                product_id=prod.id,
                specification_name=s.specification_name,
                specification_value=s.specification_value
            ))

    db.commit()
    db.refresh(prod)
    return enrich_product_data(prod, db)

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(prod)
    db.commit()
    return {"message": "Product deleted successfully"}
