# Spill The Beans — Architecture & Directory Layout

This document describes the high-level architecture, directory layout, and design conventions used throughout the Spill The Beans ecommerce platform.

---

## 1. Directory Structure

```txt
impulse-coffee/
├── config/                   # Custom application configuration modules
├── docs/                     # Documentation files (API, Deployment, Architecture, Task Tracker)
├── public/                   # Static assets (robots.txt, sitemap.xml, favicon)
├── scripts/                  # Utility, maintenance, and asset automation scripts
├── server/                   # Express Backend Application
│   ├── controllers/          # Request handlers and route controllers
│   ├── db/                   # Prisma database client configuration
│   ├── middleware/           # Express middleware (rate limiting, logging, errors)
│   ├── prisma/               # Schema design (schema.prisma) and migration scripts
│   ├── routes/               # API route maps
│   ├── services/             # Backplane utilities (emailService, payment integrations)
│   └── templates/            # Transactional HTML templates (emails)
└── src/                      # Vite Frontend Application
    ├── __tests__/            # Unit and component integration tests
    ├── components/           # Reusable UI widgets and blocks
    ├── context/              # Global application states (Cart, Currency, Wishlist)
    ├── data/                 # Seeding mock data arrays
    ├── lib/                  # Runtime utilities (env validation, helper scripts)
    ├── pages/                # Route level screens (Admin pages in /pages/admin)
    ├── services/             # Frontend client API callers with local fallback logic
    └── main.jsx              # Client entry point
```

---

## 2. Technical Design Patterns

### Offline-First Fallback Mechanics
Every frontend service (e.g. `ReviewService`, `CouponService`, `ProductService`) follows a dual integration strategy:
1. **Try HTTP request** to the Express backend (`VITE_API_URL`).
2. **If request fails (network error, offline mode)**, catch the exception, load standard mock data, read/write to `localStorage` key space, and return a clean success mock object.

This keeps the application fully functional and interactive as a demo even without a running server instance.

---

## 3. Data Integrity & Verification
- **Input Sanitization**: Client forms and server routes use **Zod schemas** to sanitize, validate, and parse payloads (e.g. coupons, products, checkouts) to eliminate XSS, code execution, and database exploits.
- **Error Boundaries**: Client runtime exceptions are caught by `ErrorBoundary` to render branded error cards rather than showing blank/crashed browser windows.
