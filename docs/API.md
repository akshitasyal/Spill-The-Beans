# Spill The Beans — REST API Documentation

Base URL: `https://api.spillthebeans.in/api` (Production) or `http://localhost:4000/api` (Development)

---

## 1. Authentication & Security
- All requests targeting `/api/admin/*` require a valid JWT session provided by Clerk in the `Authorization` header (`Bearer <token>`).
- Client requests must include the customer ID/JWT if checking out custom items.
- Rate limits apply to all endpoints (100 queries per 15 minutes for general routes, 15 for auth, 10 for checkout).

---

## 2. Endpoints Directory

### 📂 Products & Categories
#### `GET /products`
Returns all products available in the shop catalog.
- **Query Parameters**:
  - `category` (optional): Filter products by category slug.
  - `search` (optional): Query keyword.

#### `GET /categories`
Returns all product categories.

---

### 🛒 Cart & Checkout
#### `POST /orders/checkout`
Submit a list of products to generate an order and initiate payment intents.
- **Request Body**:
  ```json
  {
    "items": [
      { "productId": "p-101", "quantity": 2 }
    ],
    "shippingAddress": {
      "name": "Jane Doe",
      "address": "123 Coffee Lane",
      "city": "Bengaluru",
      "state": "Karnataka",
      "postalCode": "560034"
    },
    "paymentMethod": "RAZORPAY"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "orderId": "stb-order-9824",
    "total": 59800,
    "paymentGatewayId": "order_Hjdf82Hjdf"
  }
  ```

---

### 👑 Admin Moderation
#### `PATCH /admin/settings/:section`
Update settings section.
- **Authorized roles**: `ADMIN`
- **Request Body**: Section settings data payload.

#### `DELETE /admin/newsletter/:id`
Remove subscriber from mailing lists.
- **Authorized roles**: `ADMIN`
