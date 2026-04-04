# ShopElite - Full-Stack Ecommerce Platform

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Zustand, React Query, next-intl
- **Backend**: Django 4.2, Django REST Framework, MySQL, Celery (DB broker), JWT Auth
- **Payments**: Stripe, Razorpay
- **Languages**: English, Hindi, Arabic
- **Currencies**: INR, USD, EUR

---

## Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Git

---

## 1. MySQL Setup

```sql
-- Login to MySQL
mysql -u root -p

-- Create database and user
CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'shopelite'@'localhost' IDENTIFIED BY 'SecurePass123!';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'shopelite'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 2. Backend Setup

```bash
cd ecommerce/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Linux/Mac
# venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env
# Edit .env with your values (DB password, API keys, etc.)

# Run migrations
python manage.py migrate

# Create database cache table (for Celery broker & Django cache)
python manage.py createcachetable

# Seed sample data
python manage.py seed_data

# Create superuser (if not done by seed)
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Start Django development server
python manage.py runserver 0.0.0.0:8000
```

### Start Celery Worker (separate terminal)
```bash
cd ecommerce/backend
source venv/bin/activate
celery -A config worker --loglevel=info --pool=solo
```

### Start Celery Beat (optional, for scheduled tasks)
```bash
celery -A config beat --loglevel=info
```

---

## 3. Frontend Setup

```bash
cd ecommerce/frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

The app will be available at http://localhost:3000

---

## 4. Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopelite.com | Admin@123 |
| Customer | customer@test.com | Test@123 |

Admin panel: http://localhost:3000/en/admin/dashboard

---

## 5. Environment Variables

### Backend (.env)
```
SECRET_KEY=your-super-secret-key
DEBUG=True
DB_NAME=ecommerce_db
DB_USER=shopelite
DB_PASSWORD=SecurePass123!
DB_HOST=localhost
DB_PORT=3306
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_SECRET=...
GOOGLE_CLIENT_ID=...
EMAIL_HOST_USER=your@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

---

## 6. API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/ | Register user |
| POST | /api/auth/login/ | Login |
| POST | /api/auth/google/ | Google OAuth |
| POST | /api/auth/logout/ | Logout |
| POST | /api/auth/token/refresh/ | Refresh JWT |
| GET/PATCH | /api/auth/profile/ | Get/update profile |
| POST | /api/auth/change-password/ | Change password |
| POST | /api/auth/password-reset/ | Request reset |
| POST | /api/auth/password-reset/confirm/ | Confirm reset |
| POST | /api/auth/verify-email/ | Verify email |
| GET/POST | /api/auth/addresses/ | List/create addresses |
| PATCH/DELETE | /api/auth/addresses/{id}/ | Update/delete address |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products/ | List products (search, filter, sort) |
| GET | /api/products/featured/ | Featured products |
| GET | /api/products/{slug}/ | Product detail |
| GET | /api/products/{slug}/reviews/ | Product reviews |
| POST | /api/products/{slug}/reviews/ | Add review |
| GET | /api/products/{slug}/recommended/ | Recommendations |
| GET | /api/products/categories/ | All categories |
| GET/POST | /api/products/wishlist/ | Wishlist |
| GET | /api/products/recently-viewed/ | Recently viewed |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cart/ | Get cart |
| POST | /api/cart/items/ | Add item |
| PATCH | /api/cart/items/{id}/ | Update quantity |
| DELETE | /api/cart/items/{id}/ | Remove item |
| POST | /api/cart/coupon/ | Apply coupon |
| DELETE | /api/cart/coupon/ | Remove coupon |
| POST | /api/cart/merge/ | Merge guest cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders/checkout/ | Place order |
| POST | /api/orders/stripe/intent/ | Stripe payment intent |
| POST | /api/orders/stripe/webhook/ | Stripe webhook |
| POST | /api/orders/razorpay/create/ | Razorpay order |
| POST | /api/orders/razorpay/verify/ | Razorpay verify |
| GET | /api/orders/ | My orders |
| GET | /api/orders/{id}/ | Order detail |
| POST | /api/orders/{id}/cancel/ | Cancel order |
| POST | /api/orders/{id}/refund/ | Request refund |

### Finance (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/finance/dashboard/ | Dashboard stats |
| GET | /api/finance/revenue-chart/ | Revenue chart data |
| GET | /api/finance/profit-loss/ | P&L report |
| GET | /api/finance/top-products/ | Top selling products |
| GET | /api/finance/transactions/ | Transaction logs |
| GET | /api/finance/currency-rates/ | Exchange rates |
| POST | /api/finance/convert/ | Convert currency |

### CMS
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cms/pages/ | All pages |
| GET | /api/cms/pages/{slug}/ | Page by slug |
| GET | /api/cms/homepage-sections/ | Homepage sections |
| GET | /api/cms/banners/ | Banners |
| GET | /api/cms/settings/ | Site settings |

---

## 7. Database Schema

### Core Tables
- **users** - User accounts with role-based access
- **addresses** - Shipping/billing addresses
- **password_reset_tokens** - Password reset tokens
- **email_verification_tokens** - Email verification

### Product Tables
- **categories** - Nested categories (parent/child)
- **products** - Core product data with SEO
- **product_images** - Product gallery images
- **product_variants** - Size/color variants
- **product_attributes** - Attribute definitions (Color, Size)
- **product_attribute_values** - Attribute values
- **variant_attributes** - M2M: variants ↔ attribute values
- **reviews** - Product reviews with approval
- **wishlist** - User wishlists
- **recently_viewed** - Browsing history
- **tags** - Product tags

### Commerce Tables
- **carts** - User and guest carts
- **cart_items** - Items in cart
- **coupons** - Discount coupons
- **orders** - Order records with JSON address snapshot
- **order_items** - Ordered products
- **order_status_history** - Status change log
- **refunds** - Refund requests
- **tax_rates** - Region-based tax configuration

### Finance Tables
- **transactions** - Payment transaction log
- **invoices** - PDF invoices linked to orders
- **currency_rates** - Admin-controlled exchange rates
- **revenue_snapshots** - Daily revenue snapshots

### CMS Tables
- **cms_pages** - Dynamic pages (About, Policy, etc.)
- **homepage_sections** - JSON-based homepage builder
- **banners** - Promotional banners
- **navigation_menus** - Site navigation
- **site_settings** - Key-value site configuration

---

## 8. Deployment

### Backend - Railway / Render

```bash
# Add Procfile to backend/
echo "web: gunicorn config.wsgi:application --bind 0.0.0.0:\$PORT" > Procfile
echo "worker: celery -A config worker --loglevel=info" >> Procfile
```

Set environment variables in Railway/Render dashboard.

### Frontend - Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd ecommerce/frontend
vercel --prod
```

Set environment variables in Vercel dashboard.

### Production Checklist
- [ ] Set `DEBUG=False` in backend
- [ ] Set strong `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set up SSL certificate
- [ ] Configure Stripe/Razorpay live keys
- [ ] Set up email SMTP
- [ ] Configure S3/CloudFront for media files
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Enable database backups

---

## 9. Features Summary

### Store Features
✅ Multi-language (EN, HI, AR)
✅ Multi-currency (INR, USD, EUR)
✅ Product variants (size, color, storage)
✅ Inventory tracking
✅ Category tree (parent/subcategories)
✅ Product reviews & ratings
✅ Search with filters (price, category, stock)
✅ Wishlist
✅ Recently viewed
✅ Product recommendations
✅ Guest + authenticated cart
✅ Coupon/discount system

### Payments
✅ Stripe (international cards)
✅ Razorpay (UPI, netbanking, cards)
✅ Cash on Delivery

### Admin Panel
✅ Premium custom UI (no Django default admin)
✅ Dashboard with revenue charts
✅ Product CRUD with image management
✅ Order management with status workflow
✅ Customer management
✅ Finance dashboard (P&L, revenue charts)
✅ CMS (pages, homepage sections, banners)
✅ Currency rate management
✅ Tax configuration
✅ Refund management

### Finance
✅ Revenue tracking
✅ Profit/loss calculation
✅ Tax configuration (region-based)
✅ PDF invoice generation
✅ Refund management
✅ Transaction logs
✅ Currency conversion

### Technical
✅ JWT authentication (access + refresh)
✅ Google OAuth
✅ Celery background jobs (DB broker, no Redis)
✅ MySQL only (no PostgreSQL, no Redis)
✅ Database-based caching
✅ Email notifications (Celery)
✅ SEO-friendly URLs
✅ Skeleton loaders (no spinners)
✅ Page transitions (Framer Motion)
✅ Scroll animations
✅ Hover micro-interactions
✅ Fully responsive
