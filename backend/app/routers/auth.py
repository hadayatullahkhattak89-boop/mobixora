from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models import User, Address
from app.schemas import UserCreate, UserLogin, UserResponse, UserUpdate, Token, AddressCreate, AddressResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check existing email
    existing_user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    
    # Check existing phone if provided
    if user_in.phone:
        existing_phone = db.query(User).filter(User.phone == user_in.phone.strip()).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this phone number already exists"
            )
            
    # Check if this is the first user, make admin, otherwise customer
    is_first = db.query(User).count() == 0
    role = "admin" if is_first else "customer"
    
    new_user = User(
        name=user_in.name.strip(),
        email=user_in.email.lower().strip(),
        phone=user_in.phone.strip() if user_in.phone else None,
        password_hash=get_password_hash(user_in.password),
        role=role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(subject=new_user.id, role=new_user.role)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    ident = login_data.email_or_phone.strip()
    user = db.query(User).filter(
        (User.email == ident.lower()) | (User.phone == ident)
    ).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/phone or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )
        
    access_token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.put("/me", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.name is not None:
        current_user.name = user_update.name.strip()
    if user_update.phone is not None:
        current_user.phone = user_update.phone.strip()
    if user_update.password:
        current_user.password_hash = get_password_hash(user_update.password)
        
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)

@router.get("/addresses", response_model=List[AddressResponse])
def get_addresses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    addresses = db.query(Address).filter(Address.user_id == current_user.id).order_by(Address.is_default.desc(), Address.id.desc()).all()
    return [AddressResponse.model_validate(a) for a in addresses]

@router.post("/addresses", response_model=AddressResponse)
def add_address(
    addr: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if addr.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})
    
    new_addr = Address(
        user_id=current_user.id,
        full_name=addr.full_name,
        phone=addr.phone,
        address=addr.address,
        city=addr.city,
        province=addr.province,
        postal_code=addr.postal_code,
        is_default=addr.is_default
    )
    db.add(new_addr)
    db.commit()
    db.refresh(new_addr)
    return AddressResponse.model_validate(new_addr)

@router.delete("/addresses/{address_id}")
def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    addr = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(addr)
    db.commit()
    return {"message": "Address deleted successfully"}
