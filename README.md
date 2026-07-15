# 🥬 Verdura - Fruit & Vegetable E-Commerce Platform

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-00539C?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**A modern, full-stack e-commerce platform for fresh fruits and vegetables with Flutterwave payment integration**

[Features](#features) • [Architecture](#architecture) • [Installation](#installation) • [Usage](#usage) • [API Docs](#api-documentation)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Payment Integration](#payment-integration)
- [Admin Dashboard](#admin-dashboard)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

**Verdura** is an e-commerce platform specialized for selling fresh fruits and vegetables online. Built with modern technologies, it provides a seamless shopping experience for customers and powerful management tools for administrators.

### Problem It Solves

- Provides a dedicated platform for fresh produce sales
- Simplifies inventory and order management for vendors
- Offers secure payment processing with Flutterwave integration
- Delivers responsive, mobile-first user experience

### Key Benefits

 **Full-Featured E-Commerce** - Product catalog, shopping cart, checkout, and order management  
 **Secure Payments** - Flutterwave v4 API with OAuth 2.0 and AES-256 encryption  
 **Admin Dashboard** - Complete management interface with analytics  
 **Mobile Responsive** - Works beautifully on all devices  
 **Dark/Light Mode** - User preference support  
 **Production Ready** - Comprehensive error handling and security measures

---

## Features

### Customer Features

- **Product Catalog** - Browse products by category with images and details
- **Search Functionality** - Find products quickly
- **Shopping Cart** - Add, remove, and update quantities
- **Secure Checkout** - Card payment via Flutterwave (test mode supported)
- **Order Tracking** - View order history and status
- **User Profile** - Manage account details

### Admin Features

- **Dashboard Analytics** - Sales metrics and charts
- **Product Management** - CRUD operations for inventory
- **Order Management** - View and update order status
- **User Management** - Manage customer accounts
- **Theme Support** - Dark and light mode toggle
- **Responsive Design** - Manage on any device

### Technical Features

- **JWT Authentication** - Secure token-based auth with role-based access
- **Flutterwave Integration** - OAuth 2.0, webhook support, 3DS authentication
- **Type Safety** - Full TypeScript coverage on frontend
- **PostgreSQL** - Robust relational database
- **Alembic Migrations** - Database version control

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                              │
│                    (React + TypeScript)                       │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Home   │  │ Products │  │   Cart   │  │  Checkout│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Orders  │  │  Admin   │  │ Payment  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                         Backend                               │
│                      (FastAPI + SQLAlchemy)                   │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │ Products │  │  Orders  │  │ Payments │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Users   │  │ Webhooks │  │Fluttwave │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
         ↕                       ↕                   ↕
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│   PostgreSQL   │    │   Flutterwave  │    │    Redis       │
│    Database    │    │      API       │    │  (Rate Limit)  │
└────────────────┘    └────────────────┘    └────────────────┘
```

---

## Tech Stack

### Backend

- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, fast web framework for Python
- **[SQLAlchemy](https://www.sqlalchemy.org/)** - SQL toolkit and ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Advanced relational database
- **[Alembic](https://alembic.sqlalchemy.org/)** - Database migration tool
- **[python-jose](https://github.com/mpdavis/python-jose)** - JWT token handling
- **[passlib](https://passlib.readthedocs.io/)** - Password hashing
- **[httpx](https://www.python-httpx.org/)** - HTTP client for Flutterwave API
- **[cryptography](https://cryptography.io/)** - Card data encryption

### Frontend

- **[React 18](https://react.dev/)** - Modern UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Fast build tool
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[React Router](https://reactrouter.com/)** - Client-side routing
- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[Lucide Icons](https://lucide.dev/)** - Beautiful icons

### Payment

- **[Flutterwave v4 API](https://developer.flutterwave.com/)** - Payment gateway
  - OAuth 2.0 authentication
  - AES-256-GCM encryption
  - Webhook support
  - 3DS authentication

### DevOps & Tools

- **[Git](https://git-scm.com/)** - Version control
- **[ngrok](https://ngrok.com/)** - Local development tunnel for webhooks
- **UVicorn** - ASGI server
- **Postman** - API testing

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **PostgreSQL 12+** - [Download PostgreSQL](https://www.postgresql.org/download/)
- **npm or pnpm** - npm comes with Node.js, or install [pnpm](https://pnpm.io/)
- **Git** - [Download Git](https://git-scm.com/)

### Flutterwave Account

You'll need Flutterwave credentials for payment integration:

1. Sign up at [Flutterwave](https://flutterwave.com/)
2. Get your API credentials from the dashboard
3. Use sandbox credentials for development

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/fruit-veg-shop.git
cd fruit-veg-shop
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Create admin user
python scripts/create_admin.py

# Start the server
python -m uvicorn app.main:app --reload
```

### 3. Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
pnpm install
# or
npm install

# Set up environment variables
cp .env.example .env
# Edit .env if needed

# Start development server
pnpm dev
# or
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Admin Dashboard**: http://localhost:5173/admin

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fruitveg

# JWT Settings
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Flutterwave Credentials
FLW_CLIENT_ID=your_sandbox_client_id
FLW_CLIENT_SECRET=your_sandbox_client_secret
FLW_ENCRYPTION_KEY=your_sandbox_encryption_key
FLW_SECRET_HASH=your_webhook_secret_hash
FLW_BASE_URL=https://developersandbox-api.flutterwave.com
FLW_TOKEN_URL=https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token

# Frontend URL
FRONTEND_BASE_URL=http://localhost:5173

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:8000
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Database Setup

```bash
# Create PostgreSQL database
createdb fruitveg

# Run migrations
cd backend
alembic upgrade head

# Seed sample products (optional)
python scripts/seed_products.py
```

---

## Usage

### Running the Application

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

### Admin Login

After creating an admin user:

1. Navigate to http://localhost:5173/login
2. Login with admin credentials
3. Access admin dashboard at http://localhost:5173/admin

### Payment Testing

Use Flutterwave test cards for payment testing:

```
Successful Payment:
Card Number: 4187425075116567
CVV: 123
Expiry: Any future date

3DS Authentication:
Card Number: 4187425075116575
CVV: 123
Expiry: Any future date
```

### API Endpoints

```bash
# Get all products
curl http://localhost:8000/products

# Create a product (authenticated)
curl -X POST http://localhost:8000/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Apple","category":"fruit","price":1.99,"stock":100}'

# Initiate payment (authenticated)
curl -X POST http://localhost:8000/payments/initiate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## Project Structure

```
fruit-veg-shop/
├── backend/
│   ├── app/
│   │   ├── models.py           # Database models
│   │   ├── schemas.py          # Pydantic schemas
│   │   ├── database.py         # DB configuration
│   │   ├── main.py             # FastAPI app
│   │   ├── utils.py            # Utility functions
│   │   ├── routes/             # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── products.py
│   │   │   ├── orders.py
│   │   │   ├── payment.py
│   │   │   └── admin.py
│   │   ├── services/           # Business logic
│   │   │   ├── user_auth.py
│   │   │   ├── payment_service.py
│   │   │   └── flutterwave/    # Flutterwave integration
│   │   │       ├── auth.py
│   │   │       ├── client.py
│   │   │       ├── crypto.py
│   │   │       └── webhook.py
│   │   └── middleware/         # Middleware
│   │       └── rate_limit.py
│   ├── alembic/                # Migrations
│   ├── scripts/                # Utility scripts
│   ├── tests/                  # Test suite
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/          # Page components
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── ProductsPage.tsx
│   │   │   │   ├── CartPage.tsx
│   │   │   │   ├── CheckoutPage.tsx
│   │   │   │   ├── PaymentForm.tsx
│   │   │   │   ├── OrdersPage.tsx
│   │   │   │   └── Admin*.tsx
│   │   │   ├── components/     # Reusable components
│   │   │   ├── layouts/        # Layout components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   └── lib/            # Utility functions
│   │   ├── contexts/           # React contexts
│   │   ├── api/                # API client
│   │   ├── types/              # TypeScript types
│   │   └── styles/             # Global styles
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── PAYMENT_INTEGRATION_PLAN.md  # Payment documentation
└── README.md
```

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |

### Product Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | Get all products | No |
| GET | `/products/{id}` | Get product by ID | No |
| GET | `/products/category/{cat}` | Get products by category | No |
| POST | `/products` | Create product | Admin |
| PUT | `/products/{id}` | Update product | Admin |
| DELETE | `/products/{id}` | Delete product | Admin |

### Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/orders` | Get user orders | Yes |
| GET | `/orders/{id}` | Get order by ID | Yes |
| POST | `/orders` | Create order | Yes |
| PUT | `/orders/{id}/status` | Update order status | Admin |

### Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payments/initiate` | Initialize payment | Yes |
| GET | `/payments/{id}` | Get payment status | Yes |
| POST | `/payments/webhook` | Flutterwave webhook | No |
| GET | `/payments/callback` | Payment callback | No |

---

## Payment Integration

### Flutterwave v4 Integration

The platform uses Flutterwave's latest v4 API with OAuth 2.0 authentication:

#### Features

-  OAuth 2.0 token management with auto-refresh
-  AES-256-GCM card encryption
-  3DS authentication support
-  Webhook signature verification
-  Payment status tracking
-  Order status updates

#### Payment Flow

```
User Checkout → Create Order → Payment Form
     ↓
Enter Card Details → Encrypt Card → Flutterwave API
     ↓
3DS Auth (if required) → Webhook → Update Order
     ↓
Payment Confirmation → Success Page
```

#### Testing Payments

See [Payment Testing](#payment-testing) section for test card numbers.

For detailed integration documentation, see [PAYMENT_INTEGRATION_PLAN.md](./PAYMENT_INTEGRATION_PLAN.md)

---

## Admin Dashboard

The admin dashboard provides comprehensive management tools:

### Dashboard Features

- **Analytics** - Sales metrics, charts, and KPIs
- **Product Management** - Add, edit, delete products
- **Order Management** - View orders, update status
- **User Management** - Manage customer accounts

### Access

1. Create an admin user using the script
2. Login with admin credentials
3. Navigate to `/admin`


---

### Technologies & Tools

- **[FastAPI](https://fastapi.tiangolo.com/)** - For the amazing async web framework
- **[React](https://react.dev/)** - For the flexible UI library
- **[shadcn/ui](https://ui.shadcn.com/)** - For beautiful, accessible components
- **[Flutterwave](https://flutterwave.com/)** - For reliable payment processing
- **[Tailwind CSS](https://tailwindcss.com/)** - For the utility-first CSS framework

### Inspiration

- Modern e-commerce best practices
- Clean architecture principles
- Security-first development
