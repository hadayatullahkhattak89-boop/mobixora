from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# --- AUTH & USER ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email_or_phone: str
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None


# --- CATEGORY ---
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- BRAND ---
class BrandBase(BaseModel):
    name: str
    slug: str
    logo: Optional[str] = None
    is_active: bool = True

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    logo: Optional[str] = None
    is_active: Optional[bool] = None

class BrandResponse(BrandBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- PRODUCT SUB-ITEMS ---
class ProductImageResponse(BaseModel):
    id: int
    image_url: str
    sort_order: int

    class Config:
        from_attributes = True

class ProductVariantCreate(BaseModel):
    variant_name: str
    variant_value: str
    price_adjustment: Decimal = Decimal("0.00")
    stock: int = 10

class ProductVariantResponse(ProductVariantCreate):
    id: int

    class Config:
        from_attributes = True

class ProductSpecCreate(BaseModel):
    specification_name: str
    specification_value: str

class ProductSpecResponse(ProductSpecCreate):
    id: int

    class Config:
        from_attributes = True


# --- PRODUCT ---
class ProductBase(BaseModel):
    name: str
    slug: str
    sku: str
    description: Optional[str] = None
    brand_id: Optional[int] = None
    category_id: Optional[int] = None
    price: Decimal
    sale_price: Optional[Decimal] = None
    stock: int = 0
    is_featured: bool = False
    is_new: bool = False
    is_active: bool = True

class ProductCreate(ProductBase):
    images: Optional[List[str]] = []
    variants: Optional[List[ProductVariantCreate]] = []
    specifications: Optional[List[ProductSpecCreate]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    brand_id: Optional[int] = None
    category_id: Optional[int] = None
    price: Optional[Decimal] = None
    sale_price: Optional[Decimal] = None
    stock: Optional[int] = None
    is_featured: Optional[bool] = None
    is_new: Optional[bool] = None
    is_active: Optional[bool] = None
    images: Optional[List[str]] = None
    variants: Optional[List[ProductVariantCreate]] = None
    specifications: Optional[List[ProductSpecCreate]] = None

class ProductResponse(ProductBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    brand: Optional[BrandResponse] = None
    category: Optional[CategoryResponse] = None
    images: List[ProductImageResponse] = []
    rating: float = 0.0
    reviews_count: int = 0

    class Config:
        from_attributes = True

class ProductDetailResponse(ProductResponse):
    variants: List[ProductVariantResponse] = []
    specifications: List[ProductSpecResponse] = []


# --- REVIEWS ---
class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    product_id: int
    rating: int
    comment: str
    is_verified_purchase: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- CART ---
class CartItemAdd(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    variant_id: Optional[int] = None
    quantity: int
    product: ProductResponse
    variant: Optional[ProductVariantResponse] = None
    item_total: Decimal

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    session_id: Optional[str] = None
    items: List[CartItemResponse] = []
    subtotal: Decimal
    items_count: int


# --- WISHLIST ---
class WishlistToggle(BaseModel):
    product_id: int

class WishlistResponse(BaseModel):
    id: int
    product_id: int
    product: ProductResponse

    class Config:
        from_attributes = True


# --- ADDRESS ---
class AddressBase(BaseModel):
    full_name: str
    phone: str
    address: str
    city: str
    province: str
    postal_code: Optional[str] = None
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressResponse(AddressBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- ORDERS ---
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    variant_id: Optional[int] = None

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    shipping_address: str
    shipping_city: str
    shipping_province: str
    shipping_postal_code: Optional[str] = None
    payment_method: str = "Cash on Delivery"
    coupon_code: Optional[str] = None
    notes: Optional[str] = None
    items: Optional[List[OrderItemCreate]] = None # If null, will pull from current user cart

class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_name: str
    product_image: Optional[str] = None
    quantity: int
    price: Decimal
    subtotal: Decimal
    variant_info: Optional[str] = None

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: Optional[int] = None
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    shipping_city: str
    shipping_province: str
    shipping_postal_code: Optional[str] = None
    subtotal: Decimal
    discount: Decimal
    shipping_fee: Decimal
    total: Decimal
    payment_method: str
    payment_status: str
    order_status: str
    notes: Optional[str] = None
    coupon_code: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    order_status: Optional[str] = None
    payment_status: Optional[str] = None


# --- COUPON ---
class CouponBase(BaseModel):
    code: str
    discount_type: str = "percentage"  # "percentage", "fixed"
    discount_value: Decimal
    minimum_order: Decimal = Decimal("0.00")
    maximum_discount: Optional[Decimal] = None
    expiry_date: Optional[datetime] = None
    usage_limit: int = 100
    is_active: bool = True

class CouponCreate(CouponBase):
    pass

class CouponResponse(CouponBase):
    id: int
    times_used: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CouponValidateRequest(BaseModel):
    code: str
    subtotal: Decimal

class CouponValidateResponse(BaseModel):
    valid: bool
    code: str
    discount_type: str
    discount_value: Decimal
    discount_amount: Decimal
    message: str


# --- ADMIN DASHBOARD ---
class DashboardStats(BaseModel):
    total_revenue: Decimal
    total_orders: int
    total_customers: int
    total_products: int
    pending_orders: int
    delivered_orders: int
    low_stock_products: int
    cancelled_orders: int
    recent_orders: List[OrderResponse] = []
    top_selling_products: List[dict] = []
