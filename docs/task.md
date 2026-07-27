# Phase 5 — Production Readiness Tasks

## Install Deps
- [x] Install server: helmet, express-rate-limit, morgan, winston, nodemailer
- [x] Install frontend: vitest, @testing-library/react, @testing-library/jest-dom, jsdom, @vitest/coverage-v8

## 1. Performance — Code Splitting
- [x] Update `vite.config.js` with manual chunks + build optimization
- [x] Convert `src/App.jsx` to React.lazy + Suspense
- [x] Create `src/components/PageLoader.jsx`

## 2. Security — Server
- [x] Create `server/middleware/rateLimiter.js`
- [x] Create `server/middleware/logger.js` (winston)
- [x] Create `server/middleware/auditLog.js`
- [x] Update `server/app.js` with helmet + rate limiting + morgan

## 3. Error System — Frontend
- [x] Create `src/components/ErrorBoundary.jsx`
- [x] Create `src/pages/errors/NotFoundPage.jsx`
- [x] Create `src/pages/errors/ServerErrorPage.jsx`
- [x] Create `src/pages/errors/MaintenancePage.jsx`
- [x] Create `src/pages/errors/UnauthorizedPage.jsx`
- [x] Update `src/App.jsx` — ErrorBoundary wrapper + maintenance mode

## 4. SEO — Schemas + Static Files
- [x] Create `src/components/seo/ProductSchema.jsx`
- [x] Create `src/components/seo/BlogSchema.jsx`
- [x] Create `src/components/seo/BreadcrumbSchema.jsx`
- [x] Create `src/components/seo/FAQSchema.jsx`
- [x] Create `src/components/seo/SearchActionSchema.jsx`
- [x] Create `public/robots.txt`
- [x] Create `public/sitemap.xml`

## 5. Email Architecture
- [x] Create `server/services/emailService.js`
- [x] Create `server/templates/email/welcome.js`
- [x] Create `server/templates/email/orderConfirmation.js`
- [x] Create `server/templates/email/shippingUpdate.js`
- [x] Create `server/templates/email/passwordReset.js`
- [x] Create `server/templates/email/reviewRequest.js`

## 6. Docker & Deployment
- [x] Create root `Dockerfile` (frontend Nginx)
- [x] Create `server/Dockerfile` (backend Node)
- [x] Create `docker-compose.yml`
- [x] Create `.dockerignore`

## 7. Environment Variables
- [x] Update `.env.example` (frontend — complete)
- [x] Update `server/.env.example` (backend — complete)
- [x] Create `src/lib/env.js` (Zod runtime validation)

## 8. Testing Setup
- [x] Create `vitest.config.js`
- [x] Create `src/__tests__/utils.test.js`
- [x] Create `src/__tests__/ErrorBoundary.test.jsx`
- [x] Create `src/__tests__/CartContext.test.jsx`
- [x] Create `src/__tests__/api.test.js`

## 9. Documentation
- [x] Update `README.md` (comprehensive)
- [x] Create `docs/DEPLOYMENT.md`
- [x] Create `docs/API.md`
- [x] Create `docs/ARCHITECTURE.md`

## Verification
- [x] npm run build passes
- [x] npm run test passes
