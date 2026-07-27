# Spill The Beans — Deployment Guide

This guide details the procedure for deploying the Spill The Beans ecommerce platform (Vite SPA frontend + Express backend + PostgreSQL database) to production environments.

---

## 1. Environment Variables Configuration

Before deploying, ensure you configure production keys in your hosting provider's dashboard.

### Frontend (.env)
- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk Production Publishable Key
- `VITE_API_URL`: URL pointing to the deployed Express backend (e.g. `https://api.spillthebeans.in`)
- `VITE_MAINTENANCE_MODE`: Set to `false`

### Backend (.env)
- `PORT`: Port to run the application on (defaults to `4000`)
- `NODE_ENV`: Set to `production`
- `CLIENT_URL`: Comma-separated allowed origin URLs (e.g. `http://localhost:5173,https://spill-the-beans-mu.vercel.app`)
- `DATABASE_URL`: Production PostgreSQL connection string
- `CLERK_SECRET_KEY`: Clerk Secret Key
- `STRIPE_SECRET_KEY`: Stripe API Production Secret Key
- `STRIPE_WEBHOOK_SECRET`: Stripe Webhook signing secret
- `RAZORPAY_KEY_ID`: Razorpay production key
- `RAZORPAY_KEY_SECRET`: Razorpay production secret
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS`: Transactional mail delivery details

---

## 2. Option A: Docker Deployment (Recommended)

To spin up the entire application stack including Postgres in a single command:

```bash
docker-compose -f docker-compose.yml up -d --build
```

### Apply Database Migrations (Post-deployment)
Once the containers are running, push database schema updates:
```bash
docker exec -it stb_api npx prisma db push
```

---

## 3. Option B: Platform as a Service (Vercel + Railway/Render)

### Frontend: Vercel
1. Link your git repository to Vercel.
2. Select the repository root.
3. Configure settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Ensure `vercel.json` exists in root to rewrite all routes to `/index.html` (prevents 404 on page refresh/direct URL navigation like `/cart`).
5. Input the required frontend Environment Variables.
6. Click **Deploy**.

### Backend: Railway or Render
1. Select the `server` directory or use `Dockerfile` inside `/server` to deploy.
2. Link your production PostgreSQL database instance.
3. Add the server Environment Variables.
4. Set the build/start command to:
   - Build: `npm run db:generate`
   - Start: `npm start`
