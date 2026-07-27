# Spill The Beans — Premium D2C Coffee Platform

Spill The Beans is a modern, high-end e-commerce application built for specialty coffee lovers. This repository integrates a performant React SPA frontend, an Express REST API gateway, and PostgreSQL/Prisma database schema.

---

## 🚀 Live Production Environments

- **Frontend App (Vercel)**: [https://spill-the-beans-mu.vercel.app](https://spill-the-beans-mu.vercel.app)
- **Backend API (Render)**: [https://spill-the-beans.onrender.com](https://spill-the-beans.onrender.com)

---

## ⚡ Quickstart

### Prerequisites
- Node.js (v18+)
- PostgreSQL database instance
- Clerk project API Keys

### Installation & Run

1. **Clone & Install Dependencies**:
   ```bash
   # Root (Frontend)
   npm install
   
   # Server (Backend)
   cd server && npm install
   ```

2. **Configure Environment Variables**:
   - Copy `.env.example` in root to `.env` and fill key settings.
   - Copy `server/.env.example` to `server/.env` and update secrets.

3. **Start Development Environments**:
   ```bash
   # Start client dev server (localhost:5173)
   npm run dev
   
   # Start Express backend (localhost:4000)
   cd server && npm run dev
   ```

---

## 🐳 Docker Deployment

Deploy the entire stack with Docker Compose:
```bash
docker-compose up -d --build
```
Apply migrations:
```bash
docker exec -it stb_api npx prisma db push
```

---

## 🧪 Testing

Run frontend unit, integration, and component tests:
```bash
npm run test
```

---

## 📁 Project Architecture & Docs

Please refer to our architectural and operational guides inside `/docs`:
- [DEPLOYMENT.md](file:///docs/DEPLOYMENT.md) — Comprehensive deployment strategies.
- [API.md](file:///docs/API.md) — Endpoint directory references.
- [ARCHITECTURE.md](file:///docs/ARCHITECTURE.md) — Folder layout and design methodologies.
