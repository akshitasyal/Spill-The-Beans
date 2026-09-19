#  Spill the Beans

### A Modern Full-Stack Coffee E-Commerce Platform

**Spill the Beans** is a modern D2C coffee e-commerce platform built with **Next.js**, designed to provide a complete online coffee-shopping experience — from product discovery and authentication to secure payments, order management, and administration.

The project focuses on building a realistic, scalable e-commerce workflow with a premium coffee-brand experience while also demonstrating full-stack development, API integration, authentication, payment processing, and role-based administration.

---

##  Live Demo

**Live Website:** [spill-the-beans-mu.vercel.app](https://spill-the-beans-mu.vercel.app/)



---

## 📸 Screenshots

> Add screenshots/GIFs here to showcase the actual working application.

### Homepage

![Homepage](./screenshots/homepage.png)

### Product Listing

![Products](./screenshots/products.png)

### Product Details

![Product Details](./screenshots/product-details.png)

### Cart & Checkout

![Checkout](./screenshots/checkout.png)

### Admin Dashboard

![Admin Dashboard](./screenshots/admin-dashboard.png)

---

#  Features

##  Customer Experience
### Product Discovery

* Browse the complete coffee collection
* Product categorization
* Product search and filtering
* Product details with images and descriptions
* Pricing and availability information
* Responsive product cards

###  Shopping Cart

* Add products to cart
* Update product quantities
* Remove products
* Automatic cart total calculation
* Persistent cart state
* Order summary before checkout

###  Secure Checkout

The application supports online payment processing through integrated payment gateways.

Features include:

* Secure checkout flow
* Payment verification
* Order creation after successful payment
* Payment status tracking
* Failed-payment handling

**Payment integrations:**

* Razorpay
* Stripe

---

#  Authentication

Spill the Beans uses **Clerk** for authentication and user management.

Users can:

* Create an account
* Log in securely
* Manage their profile
* Access their orders
* View order history
* Maintain authenticated sessions

Authentication is also used to protect user-specific functionality and administrative routes.

---

#  Order Management

After completing checkout, users can view their orders and track their purchase history.

### Order workflow

```text
Product Selection
       ↓
Add to Cart
       ↓
Checkout
       ↓
Payment
       ↓
Payment Verification
       ↓
Order Creation
       ↓
Order Processing
       ↓
Shipment Creation
       ↓
Delivery Tracking
```

Each order contains information such as:

* Order ID
* Customer details
* Products
* Quantity
* Total amount
* Payment status
* Order status
* Shipping information
* Creation date

---

#  ShipMate Integration

One of the major features of Spill the Beans is its integration with **ShipMate**, the logistics and shipment-management platform developed as a separate project.

When a customer places an order successfully, the order can be sent to ShipMate through an API integration.

```text
             SPILL THE BEANS
                    │
                    │ Order Created
                    ↓
               API Request
                    │
                    ↓
                SHIPMATE
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
     Shipment Created     Tracking
          │                   │
          └─────────┬─────────┘
                    ↓
              Delivery Status
```

This demonstrates how an e-commerce platform can communicate with an external logistics system rather than managing shipments entirely inside the storefront.

### Integration capabilities

* Organization/API-key based authentication
* Automatic order transmission
* Shipment creation
* Customer/shipping information transfer
* Shipment status synchronization
* Tracking workflow

---

# 👨‍💼 Admin Dashboard

The platform includes an administrative interface for managing the e-commerce system.

### Admin capabilities

#### Product Management

* Add products
* Edit products
* Delete products
* Update prices
* Manage product information
* Manage inventory/availability

#### Order Management

* View customer orders
* View order details
* Monitor payment status
* Monitor order status
* Review customer information
* Manage fulfillment workflow

#### Customer Management

* View registered customers
* Review customer activity
* Manage customer-related information

#### Dashboard Analytics

The dashboard provides an overview of important business metrics such as:

```text
Total Orders
Total Revenue
Total Customers
Products
Pending Orders
Completed Orders
```

This provides a centralized interface for monitoring the operation of the online store.

---

# 🏗️ Project Architecture

The application follows a full-stack architecture where the frontend, backend logic, database, authentication, payment processing, and external logistics integrations work together.

```text
┌─────────────────────────────┐
│        Customer UI          │
│      Next.js / React        │
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────┐
│       Application Layer     │
│     Next.js API Routes      │
└───────┬─────────┬───────────┘
        │         │
        ↓         ↓
   ┌────────┐  ┌────────────┐
   │Database│  │ Clerk Auth │
   └────────┘  └────────────┘
        │
        ↓
┌─────────────────────────────┐
│      Payment Gateway        │
│     Razorpay / Stripe       │
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────┐
│          ShipMate           │
│    Logistics Integration    │
└─────────────────────────────┘
```

---

# 🧩 Major Modules

## 1. Homepage

The homepage acts as the primary storefront and contains:

* Brand introduction
* Featured coffee products
* Product categories
* Promotional sections
* Calls-to-action
* Navigation
* Customer-focused product discovery

---

## 2. Product Module

Responsible for displaying and managing coffee products.

### Customer side

```text
Products
   ↓
Category / Search
   ↓
Product Details
   ↓
Add to Cart
```

### Admin side

```text
Admin
  ↓
Product Management
  ├── Create
  ├── Read
  ├── Update
  └── Delete
```

---

## 3. Cart Module

Handles:

* Cart state
* Product quantities
* Subtotal calculation
* Total calculation
* Product removal
* Checkout preparation

---

## 4. Authentication Module

Powered by **Clerk**.

Authentication is used to:

* Protect user accounts
* Maintain sessions
* Protect customer order information
* Restrict admin functionality
* Associate orders with customers

---

## 5. Payment Module

The payment system handles the transition from cart to confirmed order.

```text
Cart
 ↓
Checkout
 ↓
Payment Gateway
 ↓
Payment Verification
 ↓
Create Order
```

The application avoids treating a payment attempt as a completed order until the payment workflow has been verified.

---

## 6. Order Module

Responsible for:

* Creating orders
* Storing order information
* Linking orders to users
* Tracking order status
* Displaying order history
* Managing fulfillment information

---

## 7. Admin Module

Provides administrative controls for the platform.

```text
Admin Dashboard
       │
       ├── Products
       ├── Orders
       ├── Customers
       ├── Payments
       └── Analytics
```

---

## 8. Logistics Integration

The ShipMate integration connects the e-commerce platform with an external shipment-management system.

This creates a separation between:

**Commerce**

and

**Logistics**

allowing each platform to focus on its own responsibilities.

---

# 🛠️ Tech Stack

## Frontend

* **Next.js**
* **React.js**
* **Tailwind CSS**
* JavaScript / TypeScript

## Backend

* **Next.js API Routes**
* REST APIs
* Server-side application logic

## Authentication

* **Clerk**

## Database

* MongoDB / [update if using another DB]

## Payments

* **Razorpay**
* **Stripe**

## Logistics

* **ShipMate API**

## Development Tools

* Git
* GitHub
* VS Code
* npm

## Deployment

* Vercel

---

# 📁 Project Structure

```text
spill-the-beans/
│
├── app/
│   ├── api/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── payments/
│   │   └── shipmate/
│   │
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── admin/
│   └── ...
│
├── components/
│   ├── Navbar/
│   ├── ProductCard/
│   ├── Cart/
│   ├── Checkout/
│   └── ...
│
├── lib/
│   ├── database/
│   ├── payments/
│   ├── auth/
│   └── shipmate/
│
├── public/
│   ├── images/
│   └── ...
│
├── models/
│   ├── Product
│   ├── Order
│   └── User
│
├── .env.local
├── package.json
└── README.md
```

> Update this structure to match the exact folders in your repository.

---

# ⚙️ Getting Started

## Prerequisites

Make sure you have installed:

* Node.js 18+
* npm
* Git
* MongoDB / MongoDB Atlas
* Clerk account
* Razorpay or Stripe account

---

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/spill-the-beans.git
```

```bash
cd spill-the-beans
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env.local` file:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key

# ShipMate
SHIPMATE_API_URL=your_shipmate_api_url
SHIPMATE_API_KEY=your_shipmate_api_key
SHIPMATE_ORGANIZATION_CODE=your_organization_code
```

> Never commit `.env.local` or any secret API keys to GitHub.

---

## 4. Run the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🔄 Complete User Flow

```text
                 ┌──────────────┐
                 │    Visitor   │
                 └──────┬───────┘
                        ↓
                 Browse Products
                        ↓
                 Product Details
                        ↓
                   Add to Cart
                        ↓
                    Checkout
                        ↓
                  User Login
                        ↓
                 Payment Gateway
                        ↓
               Payment Verification
                        ↓
                  Order Created
                        ↓
              Send Order to ShipMate
                        ↓
               Shipment Processing
                        ↓
                 Order Tracking
                        ↓
                    Delivered
```

---

# 🔒 Security Considerations

The project follows common application-security practices including:

* Environment variables for sensitive credentials
* Server-side handling of secret API keys
* Protected authenticated routes
* Role-based access for administrative functionality
* Payment verification
* API authentication for ShipMate integration
* Input validation
* Secure session management through Clerk

---

# 📊 Example Business Workflow

A customer purchases coffee from Spill the Beans:

```text
Customer
   │
   ├── Selects Coffee
   │
   ├── Adds to Cart
   │
   ├── Proceeds to Checkout
   │
   ├── Completes Payment
   │
   ↓
Spill the Beans
   │
   ├── Verifies Payment
   │
   ├── Creates Order
   │
   └── Sends Order → ShipMate
                         │
                         ├── Creates Shipment
                         ├── Generates Tracking
                         └── Updates Delivery Status
```

This architecture allows the storefront and logistics platform to remain independent while communicating through APIs.

---

# 🚀 Future Improvements

Potential future enhancements include:

* AI-powered coffee recommendations
* Subscription-based coffee deliveries
* Personalized coffee preferences
* Loyalty and rewards system
* Discount and coupon management
* Advanced inventory management
* Real-time shipment tracking
* Email/SMS order notifications
* Customer reviews and ratings
* Sales analytics
* Recommendation engine
* Automated low-stock alerts
* Multi-warehouse fulfillment

---

# 🎯 Project Highlights

Spill the Beans demonstrates practical experience with:

* Full-stack web development
* Next.js application architecture
* REST API development
* Authentication
* Database management
* Payment gateway integration
* Admin dashboards
* E-commerce workflows
* Third-party API integration
* Logistics automation
* Environment and secret management
* Production deployment

---

# 👩‍💻 Developer

**Akshita Syal**

B.Tech Computer Science

### Technologies

`JavaScript` `React` `Next.js` `Node.js` `Express.js` `MongoDB` `PostgreSQL` `Prisma` `Tailwind CSS` `REST APIs` `Git` `GitHub`

---

# ⭐ Project

If you found this project interesting, consider giving the repository a ⭐ on GitHub.

**Spill the Beans — From the first sip to the final delivery. ☕**
