import os
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models import (
    User, Category, Brand, Product, ProductImage, ProductVariant,
    ProductSpecification, Coupon, Review, Order, OrderItem, Address
)

def seed():
    # Make sure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@mobixora.com").first():
            print("Database already contains seed data. Skipping or re-verifying...")
            return

        print("Seeding Mobixora Database...")

        # 1. USERS
        admin_user = User(
            name="Mobixora Admin",
            email="admin@mobixora.com",
            phone="03001234567",
            password_hash=get_password_hash("admin12345"),
            role="admin",
            is_active=True
        )
        customer1 = User(
            name="Ahmed Khan",
            email="customer@example.com",
            phone="03123456789",
            password_hash=get_password_hash("customer123"),
            role="customer",
            is_active=True
        )
        customer2 = User(
            name="Sara Ali",
            email="sara.ali@example.com",
            phone="03219876543",
            password_hash=get_password_hash("customer123"),
            role="customer",
            is_active=True
        )
        db.add_all([admin_user, customer1, customer2])
        db.flush()

        # Addresses
        addr1 = Address(
            user_id=customer1.id,
            full_name="Ahmed Khan",
            phone="03123456789",
            address="House # 42, Street 7, Sector F-11/2",
            city="Islamabad",
            province="Islamabad Capital Territory",
            postal_code="44000",
            is_default=True
        )
        addr2 = Address(
            user_id=customer2.id,
            full_name="Sara Ali",
            phone="03219876543",
            address="Apartment 5B, Creek Vista, Phase 8, DHA",
            city="Karachi",
            province="Sindh",
            postal_code="75500",
            is_default=True
        )
        db.add_all([addr1, addr2])

        # 2. CATEGORIES (8+)
        categories_data = [
            {"name": "Smartphones", "slug": "smartphones", "description": "Latest cutting-edge mobile smartphones from top global manufacturers.", "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"},
            {"name": "iPhones", "slug": "iphones", "description": "Authentic Apple iPhones with official manufacturer warranty and PTA approval.", "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80"},
            {"name": "Android Phones", "slug": "android-phones", "description": "High performance flagship and budget Android devices.", "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80"},
            {"name": "Chargers", "slug": "chargers", "description": "Ultra fast GaN chargers, adapters, and certified high-wattage power supplies.", "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80"},
            {"name": "Earbuds", "slug": "earbuds", "description": "Crystal clear wireless earbuds, spatial audio, and active noise cancelling earphones.", "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80"},
            {"name": "Power Banks", "slug": "power-banks", "description": "High capacity portable battery packs with multi-device fast charge support.", "image": "https://images.unsplash.com/photo-1609592424361-9c322b7a9502?w=600&auto=format&fit=crop&q=80"},
            {"name": "Smart Watches", "slug": "smart-watches", "description": "Smart health trackers, fitness monitors, AMOLED smart wearables.", "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"},
            {"name": "Mobile Covers", "slug": "mobile-covers", "description": "Military grade drop-tested protective cases and stylish slim covers.", "image": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80"},
        ]
        cat_map = {}
        for c in categories_data:
            cat = Category(name=c["name"], slug=c["slug"], description=c["description"], image=c["image"], is_active=True)
            db.add(cat)
            db.flush()
            cat_map[c["slug"]] = cat

        # 3. BRANDS (10+)
        brands_data = [
            {"name": "Apple", "slug": "apple", "logo": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300&auto=format&fit=crop&q=80"},
            {"name": "Samsung", "slug": "samsung", "logo": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&auto=format&fit=crop&q=80"},
            {"name": "Xiaomi", "slug": "xiaomi", "logo": "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=300&auto=format&fit=crop&q=80"},
            {"name": "OnePlus", "slug": "oneplus", "logo": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=300&auto=format&fit=crop&q=80"},
            {"name": "Google", "slug": "google", "logo": "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=300&auto=format&fit=crop&q=80"},
            {"name": "Oppo", "slug": "oppo", "logo": "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=300&auto=format&fit=crop&q=80"},
            {"name": "Vivo", "slug": "vivo", "logo": "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=300&auto=format&fit=crop&q=80"},
            {"name": "Realme", "slug": "realme", "logo": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80"},
            {"name": "Infinix", "slug": "infinix", "logo": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop&q=80"},
            {"name": "Tecno", "slug": "tecno", "logo": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300&auto=format&fit=crop&q=80"},
            {"name": "Anker", "slug": "anker", "logo": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80"},
            {"name": "Spigen", "slug": "spigen", "logo": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=300&auto=format&fit=crop&q=80"},
        ]
        brand_map = {}
        for b in brands_data:
            brand = Brand(name=b["name"], slug=b["slug"], logo=b["logo"], is_active=True)
            db.add(brand)
            db.flush()
            brand_map[b["slug"]] = brand

        # 4. PRODUCTS (12 Smartphones + 12 Accessories)
        # Helper to create product with images, variants, specs
        def create_full_product(info):
            p = Product(
                name=info["name"],
                slug=info["slug"],
                sku=info["sku"],
                description=info["description"],
                brand_id=brand_map[info["brand"]].id,
                category_id=cat_map[info["category"]].id,
                price=Decimal(str(info["price"])),
                sale_price=Decimal(str(info["sale_price"])) if info.get("sale_price") else None,
                stock=info.get("stock", 25),
                is_featured=info.get("is_featured", False),
                is_new=info.get("is_new", False),
                is_active=True
            )
            db.add(p)
            db.flush()

            for idx, img in enumerate(info.get("images", [])):
                db.add(ProductImage(product_id=p.id, image_url=img, sort_order=idx))

            for v in info.get("variants", []):
                db.add(ProductVariant(
                    product_id=p.id,
                    variant_name=v["name"],
                    variant_value=v["value"],
                    price_adjustment=Decimal(str(v.get("price_adj", 0))),
                    stock=v.get("stock", 15)
                ))

            for s in info.get("specifications", []):
                db.add(ProductSpecification(
                    product_id=p.id,
                    specification_name=s["name"],
                    specification_value=s["value"]
                ))

            return p

        # -- SMARTPHONES (12) --
        smartphones = [
            {
                "name": "Apple iPhone 16 Pro Max",
                "slug": "apple-iphone-16-pro-max",
                "sku": "MBX-IPH-16PM-256",
                "brand": "apple",
                "category": "iphones",
                "price": 499999,
                "sale_price": 479999,
                "stock": 18,
                "is_featured": True,
                "is_new": True,
                "description": "Experience peak mobile power with Apple iPhone 16 Pro Max featuring Grade 5 Titanium design, groundbreaking A18 Pro chip, 48MP Fusion camera system with 5x telephoto, and Camera Control button for immediate precision shooting.",
                "images": [
                    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Desert Titanium", "price_adj": 0, "stock": 8},
                    {"name": "Color", "value": "Natural Titanium", "price_adj": 0, "stock": 5},
                    {"name": "Color", "value": "Black Titanium", "price_adj": 0, "stock": 5},
                    {"name": "Storage", "value": "256GB", "price_adj": 0, "stock": 8},
                    {"name": "Storage", "value": "512GB", "price_adj": 45000, "stock": 6},
                    {"name": "Storage", "value": "1TB", "price_adj": 95000, "stock": 4},
                ],
                "specifications": [
                    {"name": "Display", "value": "Super Retina XDR OLED, ProMotion 120Hz"},
                    {"name": "Display Size", "value": "6.9 inches"},
                    {"name": "Resolution", "value": "2868 x 1320 pixels at 460 ppi"},
                    {"name": "Processor", "value": "Apple A18 Pro (3nm)"},
                    {"name": "RAM", "value": "8GB Unified"},
                    {"name": "Storage", "value": "256GB / 512GB / 1TB NVMe"},
                    {"name": "Rear Camera", "value": "48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto"},
                    {"name": "Front Camera", "value": "12MP TrueDepth with Autofocus"},
                    {"name": "Battery", "value": "4685 mAh, Up to 33 hours video playback"},
                    {"name": "Operating System", "value": "iOS 18 with Apple Intelligence"},
                    {"name": "Network", "value": "5G NR, Gigabit LTE, PTA Approved"},
                    {"name": "SIM", "value": "Dual SIM (Nano-SIM and eSIM)"},
                    {"name": "Charging", "value": "25W MagSafe, USB-C 3.0 (up to 10Gbps)"},
                    {"name": "Connectivity", "value": "Wi-Fi 7, Bluetooth 5.3, Ultra Wideband Gen 2"},
                    {"name": "Colors", "value": "Desert Titanium, Natural Titanium, White Titanium, Black Titanium"}
                ]
            },
            {
                "name": "Samsung Galaxy S24 Ultra",
                "slug": "samsung-galaxy-s24-ultra",
                "sku": "MBX-SAM-S24U-256",
                "brand": "samsung",
                "category": "android-phones",
                "price": 399999,
                "sale_price": 374999,
                "stock": 22,
                "is_featured": True,
                "is_new": True,
                "description": "Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. Built with Galaxy AI for live translation, Circle to Search with Google, and 200MP camera with Quad Telephoto zoom.",
                "images": [
                    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Titanium Gray", "price_adj": 0, "stock": 10},
                    {"name": "Color", "value": "Titanium Black", "price_adj": 0, "stock": 8},
                    {"name": "Color", "value": "Titanium Violet", "price_adj": 0, "stock": 4},
                    {"name": "Storage", "value": "256GB", "price_adj": 0, "stock": 12},
                    {"name": "Storage", "value": "512GB", "price_adj": 35000, "stock": 10},
                ],
                "specifications": [
                    {"name": "Display", "value": "Dynamic AMOLED 2X, 120Hz, HDR10+, 2600 nits"},
                    {"name": "Display Size", "value": "6.8 inches with Corning Gorilla Armor"},
                    {"name": "Resolution", "value": "3120 x 1440 (Quad HD+)"},
                    {"name": "Processor", "value": "Snapdragon 8 Gen 3 for Galaxy (4nm)"},
                    {"name": "RAM", "value": "12GB LPDDR5X"},
                    {"name": "Storage", "value": "256GB / 512GB UFS 4.0"},
                    {"name": "Rear Camera", "value": "200MP Main + 50MP 5x Telephoto + 10MP 3x + 12MP Ultra-wide"},
                    {"name": "Front Camera", "value": "12MP Dual Pixel AF"},
                    {"name": "Battery", "value": "5000 mAh"},
                    {"name": "Operating System", "value": "Android 14, One UI 6.1 (7 Years OS updates)"},
                    {"name": "Network", "value": "5G SA/NSA, PTA Approved"},
                    {"name": "SIM", "value": "Dual SIM (2 Nano-SIMs + eSIM)"},
                    {"name": "Charging", "value": "45W Fast Wired, 15W Wireless, Wireless PowerShare"},
                    {"name": "Connectivity", "value": "Wi-Fi 7, Bluetooth 5.3, S Pen Included"},
                    {"name": "Colors", "value": "Titanium Gray, Titanium Black, Titanium Violet, Titanium Yellow"}
                ]
            },
            {
                "name": "Google Pixel 9 Pro XL",
                "slug": "google-pixel-9-pro-xl",
                "sku": "MBX-PIX-9PXL-128",
                "brand": "google",
                "category": "android-phones",
                "price": 349999,
                "sale_price": 329999,
                "stock": 14,
                "is_featured": True,
                "is_new": True,
                "description": "Pixel 9 Pro XL brings you the most advanced AI features with Google Tensor G4, Gemini Live integrated on-device, Super Res Zoom 30x, and the highest rated smartphone camera in the world.",
                "images": [
                    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Obsidian", "price_adj": 0, "stock": 7},
                    {"name": "Color", "value": "Porcelain", "price_adj": 0, "stock": 7},
                    {"name": "Storage", "value": "128GB", "price_adj": 0, "stock": 8},
                    {"name": "Storage", "value": "256GB", "price_adj": 28000, "stock": 6}
                ],
                "specifications": [
                    {"name": "Display", "value": "Super Actua LTPO OLED 1-120Hz, 3000 nits"},
                    {"name": "Display Size", "value": "6.8 inches"},
                    {"name": "Resolution", "value": "1344 x 2992 pixels"},
                    {"name": "Processor", "value": "Google Tensor G4 (4nm) with Titan M2 security"},
                    {"name": "RAM", "value": "16GB RAM for Gemini Nano"},
                    {"name": "Storage", "value": "128GB / 256GB / 512GB UFS 3.1"},
                    {"name": "Rear Camera", "value": "50MP Octa PD + 48MP Quad PD Ultrawide + 48MP 5x Telephoto"},
                    {"name": "Front Camera", "value": "42MP Dual PD with Ultrawide 103° FOV"},
                    {"name": "Battery", "value": "5060 mAh, 70% in 30 mins"},
                    {"name": "Operating System", "value": "Android 15 (7 Years Feature Drops)"},
                    {"name": "Network", "value": "5G Sub6 & mmWave, PTA Certified"},
                    {"name": "Charging", "value": "37W Fast Charging, Qi Certified Wireless"}
                ]
            },
            {
                "name": "Xiaomi 14 Ultra 5G",
                "slug": "xiaomi-14-ultra-5g",
                "sku": "MBX-XIA-14U-512",
                "brand": "xiaomi",
                "category": "android-phones",
                "price": 319999,
                "sale_price": 299999,
                "stock": 16,
                "is_featured": True,
                "is_new": True,
                "description": "Co-engineered with Leica, Xiaomi 14 Ultra features an all-new 1-inch LYT-900 image sensor with stepless variable aperture (f/1.63-f/4.0), Leica quad camera, and Snapdragon 8 Gen 3.",
                "images": [
                    "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Vegan Leather Black", "price_adj": 0, "stock": 9},
                    {"name": "Color", "value": "White Ceramic", "price_adj": 5000, "stock": 7},
                    {"name": "Storage", "value": "512GB / 16GB RAM", "price_adj": 0, "stock": 16}
                ],
                "specifications": [
                    {"name": "Display", "value": "LTPO AMOLED, 120Hz, Dolby Vision, 3000 nits"},
                    {"name": "Display Size", "value": "6.73 inches C8 AMOLED"},
                    {"name": "Resolution", "value": "3200 x 1440 WQHD+"},
                    {"name": "Processor", "value": "Snapdragon 8 Gen 3"},
                    {"name": "RAM", "value": "16GB LPDDR5X"},
                    {"name": "Storage", "value": "512GB UFS 4.0"},
                    {"name": "Rear Camera", "value": "Leica Quad 50MP + 50MP + 50MP + 50MP with Stepless Aperture"},
                    {"name": "Front Camera", "value": "32MP 4K Video"},
                    {"name": "Battery", "value": "5000 mAh"},
                    {"name": "Charging", "value": "90W HyperCharge Wired, 80W Wireless HyperCharge"}
                ]
            },
            {
                "name": "OnePlus 12",
                "slug": "oneplus-12",
                "sku": "MBX-OP-12-256",
                "brand": "oneplus",
                "category": "android-phones",
                "price": 249999,
                "sale_price": 234999,
                "stock": 20,
                "is_featured": True,
                "is_new": False,
                "description": "Smooth Beyond Belief. Powered by Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera for Mobile, 2K 120Hz ProXDR Display, and 100W SUPERVOOC fast charging.",
                "images": [
                    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Flowy Emerald", "price_adj": 0, "stock": 10},
                    {"name": "Color", "value": "Silky Black", "price_adj": 0, "stock": 10},
                    {"name": "RAM/Storage", "value": "12GB / 256GB", "price_adj": 0, "stock": 12},
                    {"name": "RAM/Storage", "value": "16GB / 512GB", "price_adj": 22000, "stock": 8}
                ],
                "specifications": [
                    {"name": "Display", "value": "2K 120Hz ProXDR Display with LTPO 3.0"},
                    {"name": "Display Size", "value": "6.82 inches"},
                    {"name": "Processor", "value": "Qualcomm Snapdragon 8 Gen 3"},
                    {"name": "Rear Camera", "value": "50MP Sony LYT-808 + 64MP 3x Periscope + 48MP Ultra-wide"},
                    {"name": "Battery", "value": "5400 mAh Dual-Cell"},
                    {"name": "Charging", "value": "100W SUPERVOOC, 50W AIRVOOC"}
                ]
            },
            {
                "name": "Vivo X100 Pro",
                "slug": "vivo-x100-pro",
                "sku": "MBX-VIV-X100P-512",
                "brand": "vivo",
                "category": "android-phones",
                "price": 269999,
                "sale_price": 254999,
                "stock": 12,
                "is_featured": False,
                "is_new": True,
                "description": "Photography redefined with ZEISS APO Telephoto camera, MediaTek Dimensity 9300 flagship chipset, and customized Vivo V3 imaging chip for cinema-grade portrait video.",
                "images": [
                    "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Asteroid Black", "price_adj": 0, "stock": 6},
                    {"name": "Color", "value": "Sunset Orange", "price_adj": 0, "stock": 6}
                ],
                "specifications": [
                    {"name": "Display", "value": "6.78-inch AMOLED 120Hz 3000 nits"},
                    {"name": "Processor", "value": "MediaTek Dimensity 9300 (4nm)"},
                    {"name": "Camera", "value": "ZEISS 50MP 1-inch sensor + 50MP APO Telephoto + 50MP Ultrawide"},
                    {"name": "Battery", "value": "5400 mAh, 100W FlashCharge"}
                ]
            },
            {
                "name": "Apple iPhone 15",
                "slug": "apple-iphone-15",
                "sku": "MBX-IPH-15-128",
                "brand": "apple",
                "category": "iphones",
                "price": 289999,
                "sale_price": 269999,
                "stock": 25,
                "is_featured": True,
                "is_new": False,
                "description": "Dynamic Island, 48MP Main camera with 2x Telephoto, durable color-infused glass and aluminum design, and USB-C connectivity.",
                "images": [
                    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Black", "price_adj": 0, "stock": 10},
                    {"name": "Color", "value": "Blue", "price_adj": 0, "stock": 8},
                    {"name": "Color", "value": "Pink", "price_adj": 0, "stock": 7},
                    {"name": "Storage", "value": "128GB", "price_adj": 0, "stock": 15},
                    {"name": "Storage", "value": "256GB", "price_adj": 25000, "stock": 10}
                ],
                "specifications": [
                    {"name": "Display", "value": "Super Retina XDR OLED 6.1 inches"},
                    {"name": "Processor", "value": "A16 Bionic chip with 5-core GPU"},
                    {"name": "Camera", "value": "48MP Main + 12MP Ultra Wide with 2x optical zoom"},
                    {"name": "Charging", "value": "USB-C, MagSafe wireless"}
                ]
            },
            {
                "name": "Samsung Galaxy A55 5G",
                "slug": "samsung-galaxy-a55-5g",
                "sku": "MBX-SAM-A55-256",
                "brand": "samsung",
                "category": "android-phones",
                "price": 129999,
                "sale_price": 119999,
                "stock": 35,
                "is_featured": True,
                "is_new": False,
                "description": "Premium metal frame and Corning Gorilla Glass Victus+, 50MP OIS camera, vibrant 120Hz Super AMOLED display, and IP67 water/dust resistance.",
                "images": [
                    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Awesome Iceblue", "price_adj": 0, "stock": 15},
                    {"name": "Color", "value": "Awesome Navy", "price_adj": 0, "stock": 20},
                    {"name": "RAM/Storage", "value": "8GB / 256GB", "price_adj": 0, "stock": 35}
                ],
                "specifications": [
                    {"name": "Display", "value": "6.6-inch Super AMOLED, 120Hz, 1000 nits"},
                    {"name": "Processor", "value": "Exynos 1480 (4nm) with AMD Xclipse 530 GPU"},
                    {"name": "Rear Camera", "value": "50MP Main with OIS + 12MP Ultra-wide + 5MP Macro"},
                    {"name": "Battery", "value": "5000 mAh with 25W Fast Charging"}
                ]
            },
            {
                "name": "Realme GT 6",
                "slug": "realme-gt-6",
                "sku": "MBX-RLM-GT6-256",
                "brand": "realme",
                "category": "android-phones",
                "price": 149999,
                "sale_price": 139999,
                "stock": 18,
                "is_featured": False,
                "is_new": True,
                "description": "The AI Flagship Killer. Snapdragon 8s Gen 3, world record 6000-nit ultra-bright display, 50MP Sony LYT-808 OIS camera, and 120W SUPERVOOC charging.",
                "images": [
                    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Fluid Silver", "price_adj": 0, "stock": 10},
                    {"name": "Color", "value": "Razor Green", "price_adj": 0, "stock": 8}
                ],
                "specifications": [
                    {"name": "Display", "value": "6.78-inch 8T LTPO AMOLED 120Hz 6000 nits"},
                    {"name": "Processor", "value": "Snapdragon 8s Gen 3"},
                    {"name": "Battery", "value": "5500 mAh, 120W fast charging (50% in 10 mins)"}
                ]
            },
            {
                "name": "Infinix Zero 30 5G",
                "slug": "infinix-zero-30-5g",
                "sku": "MBX-INF-Z30-256",
                "brand": "infinix",
                "category": "android-phones",
                "price": 84999,
                "sale_price": 79999,
                "stock": 30,
                "is_featured": False,
                "is_new": False,
                "description": "Capture your story in 4K 60FPS vlog video with 50MP front camera, 144Hz 3D curved AMOLED display, MediaTek Dimensity 8020, and 68W Super Charge.",
                "images": [
                    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Golden Hour", "price_adj": 0, "stock": 15},
                    {"name": "Color", "value": "Rome Green", "price_adj": 0, "stock": 15}
                ],
                "specifications": [
                    {"name": "Display", "value": "6.78-inch 3D Curved AMOLED 144Hz"},
                    {"name": "Front Camera", "value": "50MP 4K 60fps PDAF Video"},
                    {"name": "Rear Camera", "value": "108MP OIS Ultra Clear Camera"},
                    {"name": "Charging", "value": "68W Super Charge"}
                ]
            },
            {
                "name": "Tecno Camon 30 Premier 5G",
                "slug": "tecno-camon-30-premier-5g",
                "sku": "MBX-TEC-C30P-512",
                "brand": "tecno",
                "category": "android-phones",
                "price": 139999,
                "sale_price": 129999,
                "stock": 16,
                "is_featured": False,
                "is_new": True,
                "description": "Dual imaging chip system with Sony CXD5622GG ISP, full-focal quad 50MP camera system, 70W Ultra Charge, and aerospace-grade metal chassis.",
                "images": [
                    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Alps Snowy Silver", "price_adj": 0, "stock": 8},
                    {"name": "Color", "value": "Hawaii Lava Black", "price_adj": 0, "stock": 8}
                ],
                "specifications": [
                    {"name": "Display", "value": "6.77-inch 1.5K LTPO AMOLED 120Hz"},
                    {"name": "Processor", "value": "MediaTek Dimensity 8200 Ultimate"},
                    {"name": "Camera", "value": "Quad 50MP with Sony IMX890 sensor"}
                ]
            },
            {
                "name": "Oppo Find X7 Ultra",
                "slug": "oppo-find-x7-ultra",
                "sku": "MBX-OPP-FX7U-512",
                "brand": "oppo",
                "category": "android-phones",
                "price": 289999,
                "sale_price": 274999,
                "stock": 10,
                "is_featured": False,
                "is_new": True,
                "description": "World's first quad main camera with dual periscope telephoto sensors. Hasselblad portrait system, Snapdragon 8 Gen 3, and 100W SUPERVOOC charging.",
                "images": [
                    "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Ocean Blue Leather", "price_adj": 0, "stock": 5},
                    {"name": "Color", "value": "Sepia Brown", "price_adj": 0, "stock": 5}
                ],
                "specifications": [
                    {"name": "Display", "value": "6.82-inch LTPO OLED 120Hz 4500 nits"},
                    {"name": "Processor", "value": "Snapdragon 8 Gen 3"},
                    {"name": "Rear Camera", "value": "50MP 1-inch LYT-900 + Dual 50MP Periscopes (3x & 6x) + 50MP Ultrawide"}
                ]
            }
        ]

        # -- ACCESSORIES (12) --
        accessories = [
            {
                "name": "Anker Prime 67W GaN Wall Charger (3-Port)",
                "slug": "anker-prime-67w-gan-charger",
                "sku": "MBX-ANK-67W-GAN",
                "brand": "anker",
                "category": "chargers",
                "price": 14999,
                "sale_price": 12999,
                "stock": 45,
                "is_featured": True,
                "is_new": True,
                "description": "Compact 3-port ultra-fast GaN charger capable of powering your laptop, smartphone, and earbuds simultaneously with intelligent ActiveShield 2.0 temperature control.",
                "images": [
                    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Black", "price_adj": 0, "stock": 25},
                    {"name": "Color", "value": "Silver", "price_adj": 0, "stock": 20}
                ],
                "specifications": [
                    {"name": "Total Wattage", "value": "67W Max"},
                    {"name": "Ports", "value": "2x USB-C, 1x USB-A"},
                    {"name": "Technology", "value": "GaNPrime, PowerIQ 4.0"}
                ]
            },
            {
                "name": "Apple 20W USB-C Power Adapter (Original)",
                "slug": "apple-20w-usbc-power-adapter",
                "sku": "MBX-APL-20W-ADPT",
                "brand": "apple",
                "category": "chargers",
                "price": 6999,
                "sale_price": 5999,
                "stock": 60,
                "is_featured": True,
                "is_new": False,
                "description": "Original Apple 20W USB-C Power Adapter offers fast, efficient charging at home, in the office, or on the go. Compatible with any USB-C enabled device.",
                "images": [
                    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80"
                ],
                "specifications": [
                    {"name": "Wattage", "value": "20W"},
                    {"name": "Port", "value": "USB-C PD 3.0"},
                    {"name": "Compatibility", "value": "iPhone 16/15/14/13/12 series, iPad Pro/Air"}
                ]
            },
            {
                "name": "Samsung 45W Super Fast Charger 2.0 with Cable",
                "slug": "samsung-45w-super-fast-charger",
                "sku": "MBX-SAM-45W-SFC",
                "brand": "samsung",
                "category": "chargers",
                "price": 9499,
                "sale_price": 7999,
                "stock": 50,
                "is_featured": False,
                "is_new": False,
                "description": "Official Samsung 45W Super Fast Charging adapter with included 5A braided USB-C to USB-C cable for Galaxy S24 Ultra, S23 Ultra, and tablets.",
                "images": [
                    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80"
                ],
                "specifications": [
                    {"name": "Power", "value": "45W Super Fast Charging 2.0 (PPS)"},
                    {"name": "Cable", "value": "1.8m 5A E-Marker USB-C"}
                ]
            },
            {
                "name": "Apple AirPods Pro (2nd Gen) with USB-C MagSafe Case",
                "slug": "apple-airpods-pro-2-usbc",
                "sku": "MBX-APL-APP2-USBC",
                "brand": "apple",
                "category": "earbuds",
                "price": 74999,
                "sale_price": 68999,
                "stock": 25,
                "is_featured": True,
                "is_new": True,
                "description": "Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, Personalized Spatial Audio with dynamic head tracking, and USB-C charging.",
                "images": [
                    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80"
                ],
                "specifications": [
                    {"name": "Chip", "value": "Apple H2 headphone chip, U1 chip in case"},
                    {"name": "Battery Life", "value": "Up to 6 hours listening (30 hours with case)"},
                    {"name": "Water Resistance", "value": "IP54 dust, sweat, and water resistant"}
                ]
            },
            {
                "name": "Samsung Galaxy Buds2 Pro",
                "slug": "samsung-galaxy-buds2-pro",
                "sku": "MBX-SAM-BUDS2P",
                "brand": "samsung",
                "category": "earbuds",
                "price": 38999,
                "sale_price": 34999,
                "stock": 30,
                "is_featured": True,
                "is_new": False,
                "description": "24-bit Hi-Fi audio for studio quality listening experience, Intelligent ANC with 3 high SNR microphones, 360 Audio with direct multi-channel support.",
                "images": [
                    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Graphite", "price_adj": 0, "stock": 15},
                    {"name": "Color", "value": "White", "price_adj": 0, "stock": 15}
                ],
                "specifications": [
                    {"name": "Audio", "value": "24-bit Hi-Fi Sound"},
                    {"name": "ANC", "value": "Intelligent Active Noise Cancelling"},
                    {"name": "Water Rating", "value": "IPX7"}
                ]
            },
            {
                "name": "Anker 737 Power Bank (PowerCore 24K 140W)",
                "slug": "anker-737-power-bank-24k-140w",
                "sku": "MBX-ANK-737-24K",
                "brand": "anker",
                "category": "power-banks",
                "price": 38999,
                "sale_price": 34999,
                "stock": 20,
                "is_featured": True,
                "is_new": True,
                "description": "Equipped with the latest Power Delivery 3.1 and bi-directional technology to quickly recharge the portable charger or get a 140W ultra-powerful charge for phones & laptops.",
                "images": [
                    "https://images.unsplash.com/photo-1609592424361-9c322b7a9502?w=800&auto=format&fit=crop&q=80"
                ],
                "specifications": [
                    {"name": "Capacity", "value": "24,000 mAh"},
                    {"name": "Max Output", "value": "140W PD 3.1"},
                    {"name": "Display", "value": "Smart Digital Display with input/output wattage"}
                ]
            },
            {
                "name": "Xiaomi 22.5W Power Bank 10000mAh",
                "slug": "xiaomi-22-5w-power-bank-10000mah",
                "sku": "MBX-XIA-PB-10K",
                "brand": "xiaomi",
                "category": "power-banks",
                "price": 6499,
                "sale_price": 5499,
                "stock": 55,
                "is_featured": False,
                "is_new": False,
                "description": "Slim, metallic aluminum alloy body, 22.5W two-way fast charge, triple output ports for charging up to three devices at once.",
                "images": [
                    "https://images.unsplash.com/photo-1609592424361-9c322b7a9502?w=800&auto=format&fit=crop&q=80"
                ],
                "specifications": [
                    {"name": "Capacity", "value": "10,000 mAh (37Wh)"},
                    {"name": "Output Ports", "value": "2x USB-A, 1x Type-C"},
                    {"name": "Max Output", "value": "22.5W Max"}
                ]
            },
            {
                "name": "Samsung Galaxy Watch6 Classic 47mm",
                "slug": "samsung-galaxy-watch6-classic-47mm",
                "sku": "MBX-SAM-W6C-47",
                "brand": "samsung",
                "category": "smart-watches",
                "price": 79999,
                "sale_price": 71999,
                "stock": 15,
                "is_featured": True,
                "is_new": False,
                "description": "Classic rotating bezel, Super AMOLED Sapphire Crystal display, advanced sleep coaching, ECG, Blood Pressure monitoring, and Wear OS powered by Samsung.",
                "images": [
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Black", "price_adj": 0, "stock": 8},
                    {"name": "Color", "value": "Silver", "price_adj": 0, "stock": 7}
                ],
                "specifications": [
                    {"name": "Display", "value": "1.5-inch Super AMOLED Sapphire Crystal"},
                    {"name": "Sensors", "value": "BioActive Sensor (Optical Heart Rate + Electrical Heart + BIA)"},
                    {"name": "Durability", "value": "5ATM + IP68 / MIL-STD-810H"}
                ]
            },
            {
                "name": "Apple Watch Series 9 GPS 45mm",
                "slug": "apple-watch-series-9-gps-45mm",
                "sku": "MBX-APL-AW9-45",
                "brand": "apple",
                "category": "smart-watches",
                "price": 129999,
                "sale_price": 119999,
                "stock": 18,
                "is_featured": True,
                "is_new": False,
                "description": "S9 SiP chip, Double Tap gesture control, bright 2000-nit display, Precision Finding for iPhone, and comprehensive heart health metrics.",
                "images": [
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Midnight Aluminum", "price_adj": 0, "stock": 9},
                    {"name": "Color", "value": "Starlight Aluminum", "price_adj": 0, "stock": 9}
                ],
                "specifications": [
                    {"name": "Display", "value": "Always-On Retina display, 2000 nits"},
                    {"name": "Processor", "value": "S9 SiP 64-bit dual-core"},
                    {"name": "Sensors", "value": "ECG, Blood Oxygen, Temperature sensing, Fall Detection"}
                ]
            },
            {
                "name": "Spigen Ultra Hybrid MagFit Case for iPhone 16 Pro Max",
                "slug": "spigen-ultra-hybrid-case-iphone-16-pro-max",
                "sku": "MBX-SPG-UH-16PM",
                "brand": "spigen",
                "category": "mobile-covers",
                "price": 7499,
                "sale_price": 6499,
                "stock": 40,
                "is_featured": False,
                "is_new": True,
                "description": "Crystal clear PC back with shock-absorbing TPU bumper. Built-in magnetic ring compatible with all MagSafe accessories with Air Cushion technology.",
                "images": [
                    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Crystal Clear", "price_adj": 0, "stock": 25},
                    {"name": "Color", "value": "Frost Black", "price_adj": 500, "stock": 15}
                ],
                "specifications": [
                    {"name": "Material", "value": "Polycarbonate + Thermoplastic Polyurethane"},
                    {"name": "Protection", "value": "Military Grade Drop-tested MIL-STD 810G-516.6"},
                    {"name": "MagSafe", "value": "Strong N52 Neodymium Magnetic Ring"}
                ]
            },
            {
                "name": "Spigen Tough Armor Case for Samsung Galaxy S24 Ultra",
                "slug": "spigen-tough-armor-case-galaxy-s24-ultra",
                "sku": "MBX-SPG-TA-S24U",
                "brand": "spigen",
                "category": "mobile-covers",
                "price": 7999,
                "sale_price": 6999,
                "stock": 35,
                "is_featured": False,
                "is_new": False,
                "description": "Dual layer design with extreme shock foam inside, tactile buttons, built-in kickstand for hands-free landscape viewing.",
                "images": [
                    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80"
                ],
                "variants": [
                    {"name": "Color", "value": "Gunmetal", "price_adj": 0, "stock": 18},
                    {"name": "Color", "value": "Black", "price_adj": 0, "stock": 17}
                ],
                "specifications": [
                    {"name": "Features", "value": "Integrated Kickstand, Extreme Protection Foam"},
                    {"name": "Compatibility", "value": "Samsung Galaxy S24 Ultra with Wireless Charging"}
                ]
            },
            {
                "name": "Anker 3-in-1 Cube with MagSafe Wireless Charger",
                "slug": "anker-3-in-1-cube-magsafe",
                "sku": "MBX-ANK-3IN1-CUBE",
                "brand": "anker",
                "category": "chargers",
                "price": 38999,
                "sale_price": 34999,
                "stock": 16,
                "is_featured": True,
                "is_new": True,
                "description": "Compact foldable travel cube charger certified by Apple for 15W high-speed MagSafe wireless charging. Charges iPhone, Apple Watch, and AirPods at once.",
                "images": [
                    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80"
                ],
                "specifications": [
                    {"name": "Certification", "value": "Made for MagSafe (MFM), Made for Watch"},
                    {"name": "Charging Power", "value": "15W Phone + 5W Watch + 5W Earbuds"},
                    {"name": "Included in Box", "value": "3-in-1 Cube, 30W Power Adapter, 1.5m USB-C Cable"}
                ]
            }
        ]

        all_created_products = []
        for sp in smartphones:
            p = create_full_product(sp)
            all_created_products.append(p)

        for acc in accessories:
            p = create_full_product(acc)
            all_created_products.append(p)

        # 5. COUPONS
        coupons_data = [
            {"code": "WELCOME10", "type": "percentage", "value": 10, "min_order": 5000, "max_discount": 5000},
            {"code": "MOBIXORA500", "type": "fixed", "value": 500, "min_order": 2000, "max_discount": 500},
            {"code": "SUPERTECH", "type": "percentage", "value": 5, "min_order": 10000, "max_discount": 8000},
            {"code": "FLASH20", "type": "percentage", "value": 20, "min_order": 15000, "max_discount": 10000},
        ]
        for cp in coupons_data:
            c = Coupon(
                code=cp["code"],
                discount_type=cp["type"],
                discount_value=Decimal(str(cp["value"])),
                minimum_order=Decimal(str(cp["min_order"])),
                maximum_discount=Decimal(str(cp["max_discount"])),
                expiry_date=datetime.now(timezone.utc) + timedelta(days=90),
                usage_limit=500,
                times_used=12,
                is_active=True
            )
            db.add(c)

        # 6. REVIEWS
        sample_reviews = [
            {"product_idx": 0, "user_id": customer1.id, "rating": 5, "comment": "The iPhone 16 Pro Max from Mobixora arrived in immaculate genuine sealed packaging. PTA approval verified instantly via DIRBS. Amazing fast 2-day delivery to Islamabad!", "verified": True},
            {"product_idx": 1, "user_id": customer2.id, "rating": 5, "comment": "Samsung Galaxy S24 Ultra is a beast of a machine. Titanium build feels super premium. Best camera zoom I have ever experienced. Mobixora customer service is top tier!", "verified": True},
            {"product_idx": 2, "user_id": customer1.id, "rating": 5, "comment": "Pixel 9 Pro XL has unmatched photo colors and skin tone accuracy. Gemini features work flawlessly. Highly recommended tech store!", "verified": True},
            {"product_idx": 3, "user_id": customer2.id, "rating": 4, "comment": "Xiaomi 14 Ultra with Leica lenses is unbelievable for photography. Smooth performance and hyper fast charging. Battery easily lasts all day.", "verified": True},
            {"product_idx": 12, "user_id": customer1.id, "rating": 5, "comment": "The Anker 67W GaN charger charges both my laptop and phone at lightning speed without getting hot. Very portable and sleek.", "verified": True},
            {"product_idx": 15, "user_id": customer2.id, "rating": 5, "comment": "AirPods Pro 2 USB-C are 100% original. Noise cancellation on flights and in Karachi traffic is pure magic. Thank you Mobixora!", "verified": True},
            {"product_idx": 17, "user_id": customer1.id, "rating": 5, "comment": "Anker 737 power bank is a lifesaver during travels and load shedding. The smart screen showing real-time watts is so cool!", "verified": True},
            {"product_idx": 21, "user_id": customer2.id, "rating": 5, "comment": "Spigen Ultra Hybrid case fits like a glove on iPhone 16 Pro Max. MagSafe magnets are ultra strong. Worth every rupee.", "verified": True},
        ]
        for rev in sample_reviews:
            p_target = all_created_products[rev["product_idx"]]
            r = Review(
                user_id=rev["user_id"],
                product_id=p_target.id,
                rating=rev["rating"],
                comment=rev["comment"],
                is_verified_purchase=rev["verified"]
            )
            db.add(r)

        # 7. SAMPLE ORDERS
        orders_data = [
            {
                "order_number": "ORD-2026-000001",
                "user_id": customer1.id,
                "name": "Ahmed Khan",
                "email": "customer@example.com",
                "phone": "03123456789",
                "address": "House # 42, Street 7, Sector F-11/2",
                "city": "Islamabad",
                "province": "Islamabad Capital Territory",
                "postal_code": "44000",
                "subtotal": Decimal("479999.00"),
                "discount": Decimal("5000.00"),
                "shipping_fee": Decimal("0.00"),
                "total": Decimal("474999.00"),
                "payment_method": "Cash on Delivery",
                "payment_status": "Paid",
                "order_status": "Delivered",
                "coupon_code": "WELCOME10",
                "items": [
                    {"product": all_created_products[0], "qty": 1, "price": Decimal("479999.00"), "variant_info": "Color: Desert Titanium, Storage: 256GB"}
                ]
            },
            {
                "order_number": "ORD-2026-000002",
                "user_id": customer2.id,
                "name": "Sara Ali",
                "email": "sara.ali@example.com",
                "phone": "03219876543",
                "address": "Apartment 5B, Creek Vista, Phase 8, DHA",
                "city": "Karachi",
                "province": "Sindh",
                "postal_code": "75500",
                "subtotal": Decimal("103998.00"),
                "discount": Decimal("500.00"),
                "shipping_fee": Decimal("0.00"),
                "total": Decimal("103498.00"),
                "payment_method": "Bank Transfer",
                "payment_status": "Paid",
                "order_status": "Shipped",
                "coupon_code": "MOBIXORA500",
                "items": [
                    {"product": all_created_products[15], "qty": 1, "price": Decimal("68999.00"), "variant_info": "Case: USB-C MagSafe"},
                    {"product": all_created_products[17], "qty": 1, "price": Decimal("34999.00"), "variant_info": "Capacity: 24,000mAh"}
                ]
            },
            {
                "order_number": "ORD-2026-000003",
                "user_id": customer1.id,
                "name": "Ahmed Khan",
                "email": "customer@example.com",
                "phone": "03123456789",
                "address": "House # 42, Street 7, Sector F-11/2",
                "city": "Islamabad",
                "province": "Islamabad Capital Territory",
                "postal_code": "44000",
                "subtotal": Decimal("19498.00"),
                "discount": Decimal("0.00"),
                "shipping_fee": Decimal("0.00"),
                "total": Decimal("19498.00"),
                "payment_method": "Cash on Delivery",
                "payment_status": "Pending",
                "order_status": "Processing",
                "coupon_code": None,
                "items": [
                    {"product": all_created_products[12], "qty": 1, "price": Decimal("12999.00"), "variant_info": "Color: Black"},
                    {"product": all_created_products[21], "qty": 1, "price": Decimal("6499.00"), "variant_info": "Color: Crystal Clear"}
                ]
            }
        ]

        for ord_info in orders_data:
            ord_obj = Order(
                order_number=ord_info["order_number"],
                user_id=ord_info["user_id"],
                customer_name=ord_info["name"],
                customer_email=ord_info["email"],
                customer_phone=ord_info["phone"],
                shipping_address=ord_info["address"],
                shipping_city=ord_info["city"],
                shipping_province=ord_info["province"],
                shipping_postal_code=ord_info["postal_code"],
                subtotal=ord_info["subtotal"],
                discount=ord_info["discount"],
                shipping_fee=ord_info["shipping_fee"],
                total=ord_info["total"],
                payment_method=ord_info["payment_method"],
                payment_status=ord_info["payment_status"],
                order_status=ord_info["order_status"],
                coupon_code=ord_info["coupon_code"]
            )
            db.add(ord_obj)
            db.flush()

            for it in ord_info["items"]:
                p_it = it["product"]
                first_img = p_it.images[0].image_url if p_it.images else None
                db.add(OrderItem(
                    order_id=ord_obj.id,
                    product_id=p_it.id,
                    product_name=p_it.name,
                    product_image=first_img,
                    quantity=it["qty"],
                    price=it["price"],
                    subtotal=it["price"] * it["qty"],
                    variant_info=it["variant_info"]
                ))

        db.commit()
        print("Successfully seeded Mobixora database with comprehensive real-world data!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
