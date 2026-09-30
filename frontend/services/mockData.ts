import { Product, Category, Brand, Review, ProductListResponse, User, DashboardStats, Order, Coupon } from '@/types';

export const MOCK_ADMIN_USER: User = {
  id: 1,
  name: "Mobixora Admin",
  email: "admin@mobixora.com",
  phone: "03001234567",
  role: "admin",
  is_active: true,
  created_at: "2026-09-01T00:00:00Z",
  orders_count: 5,
  total_spent: 450000
};

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Smartphones", slug: "smartphones", description: "Latest cutting-edge mobile smartphones from top global manufacturers.", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80", is_active: true },
  { id: 2, name: "iPhones", slug: "iphones", description: "Authentic Apple iPhones with official manufacturer warranty and PTA approval.", image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80", is_active: true },
  { id: 3, name: "Android Phones", slug: "android-phones", description: "High performance flagship and budget Android devices.", image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80", is_active: true },
  { id: 4, name: "Chargers", slug: "chargers", description: "Ultra fast GaN chargers, adapters, and certified high-wattage power supplies.", image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80", is_active: true },
  { id: 5, name: "Earbuds", slug: "earbuds", description: "Crystal clear wireless earbuds, spatial audio, and active noise cancelling earphones.", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80", is_active: true },
  { id: 6, name: "Power Banks", slug: "power-banks", description: "High capacity portable battery packs with multi-device fast charge support.", image: "https://images.unsplash.com/photo-1609592424361-9c322b7a9502?w=600&auto=format&fit=crop&q=80", is_active: true },
  { id: 7, name: "Smart Watches", slug: "smart-watches", description: "Smart health trackers, fitness monitors, AMOLED smart wearables.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80", is_active: true },
  { id: 8, name: "Mobile Covers", slug: "mobile-covers", description: "Military grade drop-tested protective cases and stylish slim covers.", image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80", is_active: true },
];

export const MOCK_BRANDS: Brand[] = [
  { id: 1, name: "Apple", slug: "apple", logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300&auto=format&fit=crop&q=80", is_active: true },
  { id: 2, name: "Samsung", slug: "samsung", logo: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&auto=format&fit=crop&q=80", is_active: true },
  { id: 3, name: "Xiaomi", slug: "xiaomi", logo: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=300&auto=format&fit=crop&q=80", is_active: true },
  { id: 4, name: "OnePlus", slug: "oneplus", logo: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=300&auto=format&fit=crop&q=80", is_active: true },
  { id: 5, name: "Google", slug: "google", logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=300&auto=format&fit=crop&q=80", is_active: true },
  { id: 6, name: "Oppo", slug: "oppo", logo: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=300&auto=format&fit=crop&q=80", is_active: true },
  { id: 7, name: "Vivo", slug: "vivo", logo: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=300&auto=format&fit=crop&q=80", is_active: true },
  { id: 8, name: "Realme", slug: "realme", logo: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80", is_active: true },
  { id: 9, name: "Infinix", slug: "infinix", logo: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop&q=80", is_active: true },
  { id: 10, name: "Tecno", slug: "tecno", logo: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300&auto=format&fit=crop&q=80", is_active: true },
  { id: 11, name: "Anker", slug: "anker", logo: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80", is_active: true },
  { id: 12, name: "Spigen", slug: "spigen", logo: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=300&auto=format&fit=crop&q=80", is_active: true },
];

export let MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Apple iPhone 16 Pro Max",
    slug: "apple-iphone-16-pro-max",
    sku: "MBX-IPH-16PM-256",
    price: 499999,
    sale_price: 479999,
    stock: 18,
    is_featured: true,
    is_new: true,
    is_active: true,
    rating: 4.9,
    reviews_count: 28,
    description: "Experience peak mobile power with Apple iPhone 16 Pro Max featuring Grade 5 Titanium design, groundbreaking A18 Pro chip, 48MP Fusion camera system with 5x telephoto, and Camera Control button for immediate precision shooting.",
    category_id: 2,
    brand_id: 1,
    category: MOCK_CATEGORIES[1],
    brand: MOCK_BRANDS[0],
    images: [
      { id: 1, image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80", sort_order: 0 },
      { id: 2, image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80", sort_order: 1 },
    ],
    variants: [
      { id: 1, variant_name: "Color", variant_value: "Desert Titanium", price_adjustment: 0, stock: 8 },
      { id: 2, variant_name: "Color", variant_value: "Natural Titanium", price_adjustment: 0, stock: 5 },
      { id: 3, variant_name: "Storage", variant_value: "256GB", price_adjustment: 0, stock: 8 },
      { id: 4, variant_name: "Storage", variant_value: "512GB", price_adjustment: 45000, stock: 6 },
    ],
    specifications: [
      { id: 1, specification_name: "Display", specification_value: "Super Retina XDR OLED, ProMotion 120Hz" },
      { id: 2, specification_name: "Processor", specification_value: "Apple A18 Pro (3nm)" },
      { id: 3, specification_name: "RAM", specification_value: "8GB Unified" },
      { id: 4, specification_name: "Rear Camera", specification_value: "48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto" },
      { id: 5, specification_name: "Battery", specification_value: "4685 mAh, Up to 33 hours playback" },
      { id: 6, specification_name: "Operating System", specification_value: "iOS 18 with Apple Intelligence" },
      { id: 7, specification_name: "Network", specification_value: "5G NR, Dual SIM, PTA Approved" },
    ]
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    sku: "MBX-SAM-S24U-256",
    price: 399999,
    sale_price: 374999,
    stock: 22,
    is_featured: true,
    is_new: true,
    is_active: true,
    rating: 4.8,
    reviews_count: 24,
    description: "Meet Galaxy S24 Ultra with a new titanium exterior, 6.8-inch flat Dynamic AMOLED 2X display, Galaxy AI, and a 200MP Quad Telephoto camera system.",
    category_id: 3,
    brand_id: 2,
    category: MOCK_CATEGORIES[2],
    brand: MOCK_BRANDS[1],
    images: [
      { id: 3, image_url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80", sort_order: 0 },
      { id: 4, image_url: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80", sort_order: 1 },
    ],
    variants: [
      { id: 5, variant_name: "Color", variant_value: "Titanium Gray", price_adjustment: 0, stock: 10 },
      { id: 6, variant_name: "Storage", variant_value: "256GB", price_adjustment: 0, stock: 12 },
    ],
    specifications: [
      { id: 8, specification_name: "Display", specification_value: "Dynamic AMOLED 2X, 120Hz, 2600 nits" },
      { id: 9, specification_name: "Processor", specification_value: "Snapdragon 8 Gen 3 for Galaxy" },
      { id: 10, specification_name: "RAM", specification_value: "12GB LPDDR5X" },
      { id: 11, specification_name: "Rear Camera", specification_value: "200MP + 50MP + 10MP + 12MP" },
      { id: 12, specification_name: "Battery", specification_value: "5000 mAh, 45W Fast Charging" },
    ]
  },
  {
    id: 3,
    name: "Google Pixel 9 Pro XL",
    slug: "google-pixel-9-pro-xl",
    sku: "MBX-PIX-9PXL-128",
    price: 349999,
    sale_price: 329999,
    stock: 14,
    is_featured: true,
    is_new: true,
    is_active: true,
    rating: 4.7,
    reviews_count: 18,
    description: "The most powerful Pixel yet with Google Tensor G4, pro-level triple camera system with Super Res Zoom up to 30x, and Gemini AI deeply integrated.",
    category_id: 3,
    brand_id: 5,
    category: MOCK_CATEGORIES[2],
    brand: MOCK_BRANDS[4],
    images: [
      { id: 5, image_url: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800&auto=format&fit=crop&q=80", sort_order: 0 }
    ],
    variants: [
      { id: 7, variant_name: "Color", variant_value: "Obsidian", price_adjustment: 0, stock: 8 },
      { id: 8, variant_name: "Storage", variant_value: "128GB", price_adjustment: 0, stock: 8 },
    ],
    specifications: [
      { id: 13, specification_name: "Processor", specification_value: "Google Tensor G4 with Titan M2" },
      { id: 14, specification_name: "RAM", specification_value: "16GB RAM" },
      { id: 15, specification_name: "Rear Camera", specification_value: "50MP Main + 48MP Ultrawide + 48MP 5x Telephoto" }
    ]
  },
  {
    id: 4,
    name: "Apple AirPods Pro (2nd Gen, USB-C)",
    slug: "apple-airpods-pro-2-usbc",
    sku: "MBX-ACC-APP2-USBC",
    price: 68999,
    sale_price: 64999,
    stock: 35,
    is_featured: true,
    is_new: false,
    is_active: true,
    rating: 4.9,
    reviews_count: 42,
    description: "AirPods Pro (2nd generation) with USB-C deliver up to 2x more Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio.",
    category_id: 5,
    brand_id: 1,
    category: MOCK_CATEGORIES[4],
    brand: MOCK_BRANDS[0],
    images: [
      { id: 6, image_url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80", sort_order: 0 }
    ],
    variants: [
      { id: 9, variant_name: "Case", variant_value: "MagSafe (USB-C)", price_adjustment: 0, stock: 35 }
    ],
    specifications: [
      { id: 16, specification_name: "Chip", specification_value: "Apple H2 Headphone chip" },
      { id: 17, specification_name: "Battery", specification_value: "Up to 6 hours listening with ANC" }
    ]
  },
  {
    id: 5,
    name: "Anker 737 GaNPrime 140W Charger",
    slug: "anker-737-ganprime-140w-charger",
    sku: "MBX-ACC-ANK-140W",
    price: 24999,
    sale_price: 21999,
    stock: 45,
    is_featured: true,
    is_new: false,
    is_active: true,
    rating: 4.9,
    reviews_count: 31,
    description: "Ultra-powerful 140W multi-device fast charger powered by GaNPrime technology. Charges laptops, tablets, and phones simultaneously.",
    category_id: 4,
    brand_id: 11,
    category: MOCK_CATEGORIES[3],
    brand: MOCK_BRANDS[10],
    images: [
      { id: 7, image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80", sort_order: 0 }
    ],
    variants: [],
    specifications: [
      { id: 18, specification_name: "Total Output", specification_value: "140W Max" },
      { id: 19, specification_name: "Ports", specification_value: "2x USB-C + 1x USB-A" }
    ]
  },
  {
    id: 6,
    name: "Apple Watch Ultra 2 (Titanium, 49mm)",
    slug: "apple-watch-ultra-2-49mm",
    sku: "MBX-ACC-AWU2-49",
    price: 254999,
    sale_price: 239999,
    stock: 12,
    is_featured: true,
    is_new: true,
    is_active: true,
    rating: 4.9,
    reviews_count: 15,
    description: "The most rugged and capable Apple Watch. Designed for endurance, outdoor adventure, and water sports with a lightweight titanium case.",
    category_id: 7,
    brand_id: 1,
    category: MOCK_CATEGORIES[6],
    brand: MOCK_BRANDS[0],
    images: [
      { id: 8, image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80", sort_order: 0 }
    ],
    variants: [
      { id: 10, variant_name: "Band", variant_value: "Alpine Loop Orange", price_adjustment: 0, stock: 6 },
      { id: 11, variant_name: "Band", variant_value: "Trail Loop Black", price_adjustment: 0, stock: 6 }
    ],
    specifications: [
      { id: 20, specification_name: "Case Size", specification_value: "49mm Aerospace-grade Titanium" },
      { id: 21, specification_name: "Display", specification_value: "3000 nits Always-On Retina" }
    ]
  },
  {
    id: 7,
    name: "Spigen Ultra Hybrid MagFit Case for iPhone 16 Pro Max",
    slug: "spigen-ultra-hybrid-magfit-iphone-16-pro-max",
    sku: "MBX-ACC-SPG-16PM",
    price: 7999,
    sale_price: 6999,
    stock: 50,
    is_featured: false,
    is_new: true,
    is_active: true,
    rating: 4.8,
    reviews_count: 22,
    description: "Crystal clear case with built-in magnetic ring for seamless MagSafe compatibility and air cushion technology for drop protection.",
    category_id: 8,
    brand_id: 12,
    category: MOCK_CATEGORIES[7],
    brand: MOCK_BRANDS[11],
    images: [
      { id: 9, image_url: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80", sort_order: 0 }
    ],
    variants: [],
    specifications: [
      { id: 22, specification_name: "Material", specification_value: "Polycarbonate + Thermoplastic Polyurethane" }
    ]
  },
  {
    id: 8,
    name: "Anker 737 Power Bank (PowerCore 24K)",
    slug: "anker-737-power-bank-24k",
    sku: "MBX-ACC-ANK-PB24K",
    price: 36999,
    sale_price: 33499,
    stock: 28,
    is_featured: true,
    is_new: false,
    is_active: true,
    rating: 4.9,
    reviews_count: 19,
    description: "Equipped with Power Delivery 3.1 and bi-directional technology to quickly recharge the portable charger or get a 140W ultra-powerful charge.",
    category_id: 6,
    brand_id: 11,
    category: MOCK_CATEGORIES[5],
    brand: MOCK_BRANDS[10],
    images: [
      { id: 10, image_url: "https://images.unsplash.com/photo-1609592424361-9c322b7a9502?w=800&auto=format&fit=crop&q=80", sort_order: 0 }
    ],
    variants: [],
    specifications: [
      { id: 23, specification_name: "Capacity", specification_value: "24,000 mAh" },
      { id: 24, specification_name: "Max Output", specification_value: "140W Max Fast Output" }
    ]
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 1,
    user_id: 1,
    user_name: "Muhammad Usman",
    product_id: 1,
    rating: 5,
    comment: "100% Original and PTA Approved! Received within 2 days in Lahore. Sealed pack, checked PTA status and it was active immediately. Mobixora customer support is exceptional!",
    is_verified_purchase: true,
    created_at: "2026-09-28T10:00:00Z"
  },
  {
    id: 2,
    user_id: 2,
    user_name: "Zainab Tariq",
    product_id: 2,
    rating: 5,
    comment: "Best phone buying experience in Pakistan. Cash on delivery worked smoothly. S24 Ultra display and Galaxy AI camera are mind-blowing. Thank you Mobixora!",
    is_verified_purchase: true,
    created_at: "2026-09-27T14:30:00Z"
  },
  {
    id: 3,
    user_id: 3,
    user_name: "Bilal Farooq",
    product_id: 5,
    rating: 5,
    comment: "Heavy duty original Anker charger. Saved me carrying 3 separate bricks for travel. Super fast delivery in Islamabad.",
    is_verified_purchase: true,
    created_at: "2026-09-26T08:15:00Z"
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    order_number: "ORD-2026-000101",
    customer_name: "Ahmed Khan",
    customer_email: "ahmed.k@example.com",
    customer_phone: "03123456789",
    shipping_address: "House 12, Street 4, Sector F-11",
    shipping_city: "Islamabad",
    shipping_province: "Islamabad Capital Territory",
    subtotal: 479999,
    discount: 0,
    shipping_fee: 0,
    total: 479999,
    payment_method: "Cash on Delivery",
    payment_status: "pending",
    order_status: "Processing",
    created_at: "2026-09-29T11:20:00Z",
    items: [
      {
        id: 1,
        order_id: 1,
        product_name: "Apple iPhone 16 Pro Max",
        quantity: 1,
        price: 479999,
        subtotal: 479999
      }
    ]
  },
  {
    id: 2,
    order_number: "ORD-2026-000102",
    customer_name: "Sara Ali",
    customer_email: "sara.ali@example.com",
    customer_phone: "03219876543",
    shipping_address: "Apartment 5B, Phase 8, DHA",
    shipping_city: "Karachi",
    shipping_province: "Sindh",
    subtotal: 64999,
    discount: 5000,
    shipping_fee: 0,
    total: 59999,
    payment_method: "Cash on Delivery",
    payment_status: "paid",
    order_status: "Delivered",
    created_at: "2026-09-28T16:45:00Z",
    items: [
      {
        id: 2,
        order_id: 2,
        product_name: "Apple AirPods Pro (2nd Gen, USB-C)",
        quantity: 1,
        price: 64999,
        subtotal: 64999
      }
    ]
  }
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  stats: {
    total_revenue: 1425000,
    total_orders: 28,
    total_customers: 64,
    total_products: MOCK_PRODUCTS.length,
    pending_orders: 4,
    delivered_orders: 22,
    cancelled_orders: 2,
    low_stock_products: 3,
  },
  sales_chart: [
    { date: "Mon", revenue: 180000, orders: 3 },
    { date: "Tue", revenue: 290000, orders: 5 },
    { date: "Wed", revenue: 210000, orders: 4 },
    { date: "Thu", revenue: 340000, orders: 6 },
    { date: "Fri", revenue: 420000, orders: 8 },
    { date: "Sat", revenue: 380000, orders: 7 },
    { date: "Sun", revenue: 510000, orders: 9 }
  ],
  status_breakdown: {
    "Pending": 4,
    "Processing": 3,
    "Shipped": 5,
    "Delivered": 22,
    "Cancelled": 2
  },
  recent_orders: MOCK_ORDERS
};

export const MOCK_COUPONS: Coupon[] = [
  { id: 1, code: "WELCOME10", discount_type: "percentage", discount_value: 10, minimum_order: 5000, usage_limit: 500, times_used: 120, is_active: true },
  { id: 2, code: "MOBIXORA500", discount_type: "fixed", discount_value: 500, minimum_order: 3000, usage_limit: 1000, times_used: 340, is_active: true }
];

export function getMockFallback<T>(endpoint: string, options?: RequestInit): T | undefined {
  const clean = endpoint.split('?')[0];
  const method = (options?.method || 'GET').toUpperCase();

  // Auth
  if (clean === '/auth/login' || clean === '/auth/register') {
    return {
      access_token: "mock_jwt_token_admin_session",
      token_type: "bearer",
      user: MOCK_ADMIN_USER
    } as unknown as T;
  }
  if (clean === '/auth/me') {
    return MOCK_ADMIN_USER as unknown as T;
  }
  if (clean === '/auth/addresses') {
    return [] as unknown as T;
  }

  // Admin Stats & Orders
  if (clean === '/admin/stats') {
    return MOCK_DASHBOARD_STATS as unknown as T;
  }
  if (clean === '/admin/orders') {
    return MOCK_ORDERS as unknown as T;
  }
  if (clean === '/admin/customers') {
    return [
      MOCK_ADMIN_USER,
      { id: 2, name: "Ahmed Khan", email: "ahmed@example.com", phone: "03123456789", role: "customer", is_active: true, orders_count: 3, total_spent: 540000 },
      { id: 3, name: "Sara Ali", email: "sara@example.com", phone: "03219876543", role: "customer", is_active: true, orders_count: 2, total_spent: 120000 }
    ] as unknown as T;
  }
  if (clean === '/admin/inventory') {
    return MOCK_PRODUCTS as unknown as T;
  }
  if (clean === '/admin/coupons' || clean === '/coupons') {
    return MOCK_COUPONS as unknown as T;
  }

  // Categories
  if (clean === '/categories') {
    return MOCK_CATEGORIES as unknown as T;
  }
  if (clean.startsWith('/categories/')) {
    const slug = clean.replace('/categories/', '');
    const found = MOCK_CATEGORIES.find(c => c.slug === slug || String(c.id) === slug);
    return (found || MOCK_CATEGORIES[0]) as unknown as T;
  }

  // Brands
  if (clean === '/brands') {
    return MOCK_BRANDS as unknown as T;
  }
  if (clean.startsWith('/brands/')) {
    const slug = clean.replace('/brands/', '');
    const found = MOCK_BRANDS.find(b => b.slug === slug || String(b.id) === slug);
    return (found || MOCK_BRANDS[0]) as unknown as T;
  }

  // Products
  if (clean === '/products') {
    if (method === 'POST') {
      try {
        const body = options?.body ? JSON.parse(options.body as string) : {};
        const newProduct: Product = {
          id: MOCK_PRODUCTS.length + 1,
          name: body.name || "New Client Product",
          slug: (body.name || "new-product").toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          sku: body.sku || `MBX-PRD-${Date.now().toString().slice(-4)}`,
          price: Number(body.price) || 1000,
          sale_price: body.sale_price ? Number(body.sale_price) : null,
          stock: Number(body.stock) || 20,
          is_featured: Boolean(body.is_featured),
          is_new: true,
          is_active: true,
          rating: 5.0,
          reviews_count: 0,
          description: body.description || "Freshly added client product.",
          category_id: body.category_id || 1,
          brand_id: body.brand_id || 1,
          category: MOCK_CATEGORIES.find(c => c.id === body.category_id) || MOCK_CATEGORIES[0],
          brand: MOCK_BRANDS.find(b => b.id === body.brand_id) || MOCK_BRANDS[0],
          images: body.images?.length ? body.images : [
            { id: Date.now(), image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80", sort_order: 0 }
          ],
          variants: body.variants || [],
          specifications: body.specifications || []
        };
        MOCK_PRODUCTS.unshift(newProduct);
        return newProduct as unknown as T;
      } catch {
        return MOCK_PRODUCTS[0] as unknown as T;
      }
    }

    const isFeatured = endpoint.includes('is_featured=true');
    const isNew = endpoint.includes('is_new=true');
    let items = [...MOCK_PRODUCTS];
    if (isFeatured) items = items.filter(p => p.is_featured);
    if (isNew) items = items.filter(p => p.is_new);
    const resp: ProductListResponse = {
      items: items.length > 0 ? items : MOCK_PRODUCTS,
      total: MOCK_PRODUCTS.length,
      page: 1,
      limit: 16,
      pages: 1
    };
    return resp as unknown as T;
  }

  if (clean.startsWith('/products/')) {
    const slug = clean.replace('/products/', '');
    if (method === 'DELETE') {
      MOCK_PRODUCTS = MOCK_PRODUCTS.filter(p => String(p.id) !== slug && p.slug !== slug);
      return { message: "Product deleted successfully" } as unknown as T;
    }
    const found = MOCK_PRODUCTS.find(p => p.slug === slug || String(p.id) === slug);
    return (found || MOCK_PRODUCTS[0]) as unknown as T;
  }

  // Reviews
  if (clean === '/reviews/recent' || clean === '/reviews') {
    return MOCK_REVIEWS as unknown as T;
  }

  // Cart
  if (clean === '/cart') {
    return {
      id: 1,
      items: [],
      subtotal: 0,
      items_count: 0
    } as unknown as T;
  }

  // Wishlist
  if (clean === '/wishlist') {
    return [] as unknown as T;
  }

  return undefined;
}
