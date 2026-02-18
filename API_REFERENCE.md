# Y-store API Reference

**Base URL:** `https://store-rebuild-3.preview.emergentagent.com/api`

## Authentication

### Login
```
POST /auth/login
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "User Name",
    "role": "customer"
  }
}
```

### Register
```
POST /auth/register

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "User Name",
  "role": "customer"  // customer | seller | admin
}
```

## Products

### Get All Products
```
GET /products
Query params:
  - limit: number (default: 100)
  - skip: number (default: 0)
  - category_id: string
  - sort_by: 'popularity' | 'newest' | 'price_asc' | 'price_desc'
  - search: string
```

### Get Single Product
```
GET /products/{id}
```

### Create Product (Admin)
```
POST /products
Authorization: Bearer {token}

Body:
{
  "title": "Product Name",
  "description": "Description",
  "price": 999.99,
  "category_id": "uuid",
  "stock_level": 10,
  "images": ["url1", "url2"],
  "specifications": [
    {"group": "Main", "key": "CPU", "value": "Intel i9"}
  ]
}
```

### Toggle Bestseller (Admin)
```
PUT /admin/products/{id}/bestseller?is_bestseller=true
Authorization: Bearer {token}
```

## Categories

### Get All Categories
```
GET /categories
```

### Create Category (Admin)
```
POST /categories
Authorization: Bearer {token}

Body:
{
  "name": "Category Name",
  "slug": "category-slug",
  "parent_id": "uuid" // optional
}
```

## Cart

### Get Cart
```
GET /cart
Authorization: Bearer {token}
```

### Add to Cart
```
POST /cart/items
Authorization: Bearer {token}

Body:
{
  "product_id": "uuid",
  "quantity": 1
}
```

### Remove from Cart
```
DELETE /cart/items/{product_id}
Authorization: Bearer {token}
```

## Orders

### Create Order
```
POST /orders
Authorization: Bearer {token}

Body:
{
  "shipping_address": {
    "street": "Street",
    "city": "City",
    "postal_code": "12345"
  },
  "payment_method": "cash_on_delivery" | "rozetkapay"
}
```

### Get My Orders
```
GET /orders
Authorization: Bearer {token}
```

## Hero Slides

### Get Active Slides (Public)
```
GET /slides
```

### Get All Slides (Admin)
```
GET /admin/slides
Authorization: Bearer {token}
```

### Create Slide (Admin)
```
POST /admin/slides
Authorization: Bearer {token}

Body: HeroSlide (see types above)
```

### Update Slide (Admin)
```
PUT /admin/slides/{id}
Authorization: Bearer {token}
```

### Delete Slide (Admin)
```
DELETE /admin/slides/{id}
Authorization: Bearer {token}
```

## Popular Categories

### Get Active (Public)
```
GET /popular-categories
```

### Admin CRUD
```
GET    /admin/popular-categories
POST   /admin/popular-categories
PUT    /admin/popular-categories/{id}
DELETE /admin/popular-categories/{id}
```

## Actual Offers

### Get Active Offers (Public)
```
GET /actual-offers
```

### Get Single Offer with Products (Public)
```
GET /actual-offers/{id}

Response:
{
  ...ActualOffer fields,
  "products": [Product, Product, ...]
}
```

### Admin CRUD
```
GET    /admin/actual-offers
POST   /admin/actual-offers
PUT    /admin/actual-offers/{id}
DELETE /admin/actual-offers/{id}
```

## CRM System

### Dashboard
```
GET /crm/dashboard
Authorization: Bearer {token} (admin)

Response:
{
  "sales_funnel": {...},
  "customer_segments": {...},
  "customer_activity": {...},
  "pending_tasks": number,
  "overdue_tasks": number
}
```

### Customers
```
GET /crm/customers?segment=VIP
GET /crm/customer/{id}
```

### Notes
```
POST /crm/notes
GET  /crm/notes/{customer_id}
```

### Tasks
```
GET  /crm/tasks?status=pending
POST /crm/tasks
PUT  /crm/tasks/{id}
```

### Leads
```
GET  /crm/leads?status=new
POST /crm/leads
PUT  /crm/leads/{id}
```

## Image Upload

```
POST /upload/image
Authorization: Bearer {token} (admin)
Content-Type: multipart/form-data

Form data:
  file: File

Response:
{
  "url": "/uploads/slides/filename.jpg",
  "filename": "filename.jpg",
  "original_filename": "original.jpg"
}
```

## Admin Analytics

### Stats
```
GET /admin/stats
GET /admin/analytics/revenue?days=30
GET /admin/analytics/top-products?limit=5
GET /admin/analytics/user-growth?days=30
```

### Advanced Analytics
```
GET /admin/analytics/advanced/visits
GET /admin/analytics/advanced/abandoned-carts
GET /admin/analytics/advanced/wishlist
GET /admin/analytics/advanced/conversion-funnel
GET /admin/analytics/advanced/product-performance
GET /admin/analytics/advanced/customer-ltv
GET /admin/analytics/advanced/category-performance
GET /admin/analytics/advanced/time-on-pages
GET /admin/analytics/advanced/product-page-analytics
GET /admin/analytics/advanced/user-behavior-flow
```

## Payment (RozetkaPay)

```
POST /payment/rozetkapay/create
GET  /payment/rozetkapay/callback
GET  /payment/rozetkapay/info/{payment_id}
```

## Nova Poshta Integration

```
GET /novaposhta/cities?query=Київ
GET /novaposhta/warehouses?city_ref={ref}
```

## Все эндпоинты (полный список)

**Public:**
- GET  /products
- GET  /products/{id}
- GET  /categories
- GET  /slides
- GET  /popular-categories
- GET  /actual-offers
- GET  /actual-offers/{id}
- POST /auth/login
- POST /auth/register
- GET  /novaposhta/cities
- GET  /novaposhta/warehouses

**Authenticated (Customer):**
- GET    /cart
- POST   /cart/items
- DELETE /cart/items/{id}
- DELETE /cart
- GET    /orders
- POST   /orders
- GET    /users/me
- PUT    /users/me
- POST   /reviews

**Admin Only (80+ endpoints):**
- Products CRUD
- Categories CRUD
- Slides CRUD
- Popular Categories CRUD
- Actual Offers CRUD
- CRM (customers, notes, tasks, leads)
- Analytics (10+ endpoints)
- Admin stats
- Payouts management
- Orders analytics
- Image upload

## Примечания для разработчика

1. **Backend уже готов** - не нужно переписывать
2. **MongoDB схема** - документно-ориентированная, UUID вместо ObjectId
3. **JWT токены** - хранятся в localStorage
4. **File uploads** - сохраняются в `/app/frontend/public/uploads/`
5. **CORS** - уже настроен, может потребоваться обновить для Next.js dev server

## Support

При возникновении вопросов:
- Проверьте этот документ и API_REFERENCE.md
- Изучите текущий React код в /app/frontend/src
- Тестируйте API через Postman/curl
