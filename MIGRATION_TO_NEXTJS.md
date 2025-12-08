# Миграция Y-store на Next.js + TypeScript

## Обзор проекта

**Текущий стек:**
- Frontend: React 19 (Create React App)
- Backend: FastAPI (Python)
- Database: MongoDB
- Styling: Tailwind CSS

**Целевой стек:**
- Frontend: Next.js 15 + TypeScript
- Backend: FastAPI (без изменений)
- Database: MongoDB (без изменений)
- Styling: Tailwind CSS

## Архитектура

```
┌─────────────────────────────────────────┐
│         Next.js Frontend (SSR)          │
│  - App Router                           │
│  - TypeScript                           │
│  - Tailwind CSS                         │
│  - React Server Components              │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST API
                  │
┌─────────────────▼───────────────────────┐
│         FastAPI Backend                 │
│  - Python 3.11                          │
│  - Pydantic models                      │
│  - JWT Authentication                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│            MongoDB                      │
│  - Collections: users, products,        │
│    orders, categories, etc.             │
└─────────────────────────────────────────┘
```

## Структура Next.js проекта

```
nextjs-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (main)/
│   │   ├── layout.tsx              # Main layout with header/footer
│   │   ├── page.tsx                # Home page
│   │   ├── products/
│   │   │   ├── page.tsx            # Products list
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Product detail
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   ├── offer/
│   │   │   └── [offerId]/
│   │   │       └── page.tsx        # Offer landing page
│   │   └── profile/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout
│   │   ├── page.tsx                # Dashboard
│   │   ├── products/
│   │   ├── categories/
│   │   ├── slides/
│   │   ├── crm/
│   │   └── analytics/
│   ├── api/                        # Optional Next.js API routes (proxy)
│   │   └── [...path]/
│   │       └── route.ts
│   ├── layout.tsx                  # Root layout
│   └── globals.css
├── components/
│   ├── ui/                         # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── shared/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileMenu.tsx
│   │   └── ...
│   ├── home/
│   │   ├── HeroBanner.tsx
│   │   ├── PopularCategories.tsx
│   │   ├── ActualOffers.tsx
│   │   └── ...
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductDetail.tsx
│   │   └── ...
│   └── admin/
│       ├── CRMDashboard.tsx
│       ├── SlidesManagement.tsx
│       └── ...
├── lib/
│   ├── api/                        # API client
│   │   ├── client.ts               # Axios instance
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── ...
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── validators.ts
│   └── contexts/                   # React Context (optional with Next.js)
├── types/
│   ├── api.ts                      # API response types
│   ├── models.ts                   # Data models
│   └── components.ts
├── public/
│   └── uploads/
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## API Документация

### Authentication

```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'seller' | 'admin';
  phone?: string;
  // ... other fields
}
```

### Products

```typescript
// GET /api/products
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compare_price?: number;
  category_id: string;
  images: string[];
  stock_level: number;
  is_bestseller: boolean;
  is_featured: boolean;
  specifications: Specification[];
  // ...
}

interface Specification {
  group: string;
  key: string;
  value: string;
}
```

### Hero Slides

```typescript
// GET /api/slides
interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  type: 'banner' | 'product';
  image_url?: string;
  product_id?: string;
  background_gradient?: string;
  promo_text?: string;
  button_text?: string;
  button_link?: string;
  countdown_enabled: boolean;
  countdown_end_date?: string;
  order: number;
  active: boolean;
}
```

### Popular Categories

```typescript
// GET /api/popular-categories
interface PopularCategory {
  id: string;
  name: string;
  icon: string;  // emoji
  order: number;
  active: boolean;
}
```

### Actual Offers

```typescript
// GET /api/actual-offers
interface ActualOffer {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image_url: string;
  link_url: string;
  product_ids: string[];
  background_color: string;
  text_color: string;
  position: number;
  order: number;
  active: boolean;
}

// GET /api/actual-offers/{id}
interface ActualOfferDetail extends ActualOffer {
  products: Product[];
}
```

### CRM

```typescript
// GET /api/crm/customers
interface CRMCustomer {
  id: string;
  email: string;
  full_name: string;
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
  segment: 'VIP' | 'Active' | 'Regular' | 'At Risk' | 'Inactive' | 'New';
  last_order_date?: string;
  // ...
}

interface CustomerNote {
  id: string;
  customer_id: string;
  note: string;
  type: 'general' | 'call' | 'email' | 'meeting' | 'complaint';
  author_name: string;
  created_at: string;
}

interface CRMTask {
  id: string;
  title: string;
  description?: string;
  customer_id?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  // ...
}
```

## Шаги миграции

### Этап 1: Подготовка

1. **Создать новый Next.js проект:**
```bash
npx create-next-app@latest nextjs-frontend --typescript --tailwind --app --no-src-dir
cd nextjs-frontend
```

2. **Установить зависимости:**
```bash
npm install axios axios-retry
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react
npm install sonner  # для toast notifications
npm install date-fns  # для работы с датами
npm install next-themes  # для темной темы
```

3. **Настроить окружение (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://go-lang-13.preview.emergentagent.com/api
```

### Этап 2: Создание типов

**types/api.ts** - все TypeScript интерфейсы для API
**types/models.ts** - модели данных

### Этап 3: API Client

**lib/api/client.ts:**
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const isAuthEndpoint = error.config?.url?.includes('/auth/');
        if (!isAuthEndpoint && window.location.pathname !== '/login') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Этап 4: Ключевые компоненты

**Пример: app/page.tsx (Home)**
```typescript
import { HeroBanner } from '@/components/home/HeroBanner';
import { PopularCategories } from '@/components/home/PopularCategories';
import { ActualOffers } from '@/components/home/ActualOffers';
import { ProductGrid } from '@/components/product/ProductGrid';
import { getProducts, getCategories } from '@/lib/api/products';

export default async function HomePage() {
  // Server-side data fetching
  const [products, categories] = await Promise.all([
    getProducts({ limit: 12 }),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-gray-50">
      <HeroBanner />
      <ProductGrid products={products} title="Обрані товари" />
      <PopularCategories categories={categories} />
      <ActualOffers />
      {/* Хіти продажу - client component */}
    </main>
  );
}
```

## Преимущества Next.js для вашего проекта

### 1. **SEO и производительность**
- ✅ Server-Side Rendering - поисковики видят контент
- ✅ Automatic image optimization
- ✅ Automatic code splitting
- ✅ Fast refresh

### 2. **Type Safety**
- ✅ TypeScript во всем проекте
- ✅ Автокомплит в IDE
- ✅ Меньше runtime ошибок
- ✅ Лучшая документация кода

### 3. **Developer Experience**
- ✅ File-based routing
- ✅ Built-in API routes (если нужно)
- ✅ Automatic TypeScript config
- ✅ Vercel deployment (опционально)

### 4. **Современные паттерны**
- ✅ React Server Components
- ✅ Streaming SSR
- ✅ Parallel data fetching
- ✅ Suspense boundaries

## Рекомендации по миграции

### Порядок переноса:

**Фаза 1 - Фундамент (1-2 недели):**
1. Создать Next.js проект
2. Настроить Tailwind CSS
3. Создать все TypeScript типы
4. Реализовать API client
5. Создать layout (Header, Footer)

**Фаза 2 - Основные страницы (2-3 недели):**
1. Главная страница (Home)
2. Каталог товаров (Products)
3. Страница товара (ProductDetail)
4. Корзина (Cart)
5. Checkout
6. Login/Register

**Фаза 3 - Админка (3-4 недели):**
1. Admin layout
2. Analytics dashboard
3. Product management
4. CRM система
5. Slides management
6. Orders management

**Фаза 4 - Дополнительно (1-2 недели):**
1. Мобильная оптимизация
2. Тестирование
3. Оптимизация производительности
4. SEO metadata

## Backend FastAPI - без изменений

**Текущий backend ОСТАЕТСЯ как есть:**
- ✅ Все 80+ API endpoints работают
- ✅ MongoDB подключение
- ✅ JWT authentication
- ✅ CRM сервис
- ✅ Analytics
- ✅ Payment integration

**Единственное изменение:**
Обновить CORS настройки для Next.js:

```python
# backend/server.py
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev
        "https://your-production-domain.com",
        "*"  # temporary for development
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Что передать Next.js разработчику

### 1. Этот документ (MIGRATION_TO_NEXTJS.md)
### 2. API_REFERENCE.md (полная документация API)
### 3. COMPONENTS_GUIDE.md (описание компонентов)
### 4. Доступ к:
   - Текущему коду (GitHub)
   - Backend API (URL)
   - Figma/дизайн (если есть)
   - Тестовые аккаунты

## Контакты и support

**Backend API URL:** https://go-lang-13.preview.emergentagent.com/api
**Current React app:** https://go-lang-13.preview.emergentagent.com

**Админ доступ:**
- Email: admin@bazaar.com
- Password: admin123

**Тестовый пользователь:**
- Email: testcustomer@example.com  
- Password: customer123
