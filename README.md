# ☕ Spill the Beans

A modern full-stack coffee e-commerce platform built with **Next.js**, offering a premium shopping experience with secure authentication, product management, online payments, and an admin dashboard. The project replicates the workflow of a real-world D2C coffee brand, from product discovery to order management.

---

## 🚀 Live Demo

> **Website:** [https://your-live-demo-link.vercel.app](https://spill-the-beans-mu.vercel.app/)

---

## 📌 Features

### Customer

- Browse coffee products by category
- Search for products
- Product variants (different weights)
- Add products to cart
- Wishlist functionality
- Secure user authentication
- Razorpay & Stripe payment integration
- Order placement
- Order history
- Responsive design for all devices

### Admin

- Secure admin dashboard
- Add, edit, and delete products
- Manage categories
- Manage customer orders
- Inventory management
- Product variant management
- Sales overview

---

## 🛠 Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend

- Next.js API Routes
- Node.js

### Database

- MongoDB
- Mongoose

### Authentication

- Clerk

### Payments

- Razorpay
- Stripe

### Deployment

- Vercel

---

## 📂 Folder Structure

```text
spill-the-beans/
│
├── app/
├── components/
├── hooks/
├── lib/
├── models/
├── public/
├── styles/
├── middleware/
├── utils/
├── app/api/
└── README.md
```

---

## ⚙️ Getting Started

### Clone the repository

```bash
git clone https://github.com/yourusername/spill-the-beans.git
cd spill-the-beans
```

### Install dependencies

```bash
npm install
```

### Create Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
MONGODB_URI=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=

NEXTAUTH_SECRET=
```

### Start the development server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 📸 Screenshots

### Home Page

_Add screenshot here_

### Product Page

_Add screenshot here_

### Cart

_Add screenshot here_

### Checkout

_Add screenshot here_

### Admin Dashboard

_Add screenshot here_

---

## 🔐 Authentication

The application uses **Clerk Authentication** for secure login and user management.

- Email Authentication
- Google Sign-In
- Protected Routes
- Session Management

---

## 💳 Payment Integration

Integrated with:

- Razorpay
- Stripe

Supports secure online payments and order verification.

---

## 📱 Responsive Design

The application is fully responsive and optimized for:

- Desktop
- Tablet
- Mobile

---

## 📈 Future Improvements

- AI-based coffee recommendations
- Product reviews & ratings
- Coupon system
- Loyalty rewards
- Subscription plans
- Email notifications
- Sales analytics
- Dark mode

---

## 📚 What I Learned

This project helped me strengthen my understanding of:

- Building scalable full-stack applications
- Authentication and authorization
- REST API development
- MongoDB database design
- Payment gateway integration
- Responsive UI development
- State management
- Deployment with Vercel
- Real-world e-commerce workflows

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👩‍💻 Author

**Akshita Syal**

If you like this project, consider giving it a ⭐ to support the repository.
