// ============================================================
//  app.js — Express Application Configuration
//  Spill The Beans Backend API
// ============================================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter, authLimiter, paymentLimiter } from './middleware/rateLimiter.js';
import logger from './middleware/logger.js';
import { auditLogger } from './middleware/auditLog.js';

// Route imports
import userRoutes     from './routes/users.js';
import productRoutes  from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes     from './routes/cart.js';
import orderRoutes    from './routes/orders.js';
import couponRoutes   from './routes/coupons.js';
import adminRoutes    from './routes/admin.js';

const app = express();

// ─────────────────────────────────────────────────────────────
// SECURITY MIDDLEWARE
// ─────────────────────────────────────────────────────────────
// Helmet for setting secure HTTP response headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.clerk.accounts.dev", "https://clerk.spillthebeans.in"],
      connectSrc: ["'self'", "https://*.clerk.accounts.dev", "https://clerk.spillthebeans.in", "https://api.stripe.com", "https://api.razorpay.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://img.clerk.com", "https://res.cloudinary.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-clerk-id'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────
// LOGGING MIDDLEWARE
// ─────────────────────────────────────────────────────────────
// Morgan HTTP request logger configured to log requests via Winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// ─────────────────────────────────────────────────────────────
// RATE LIMITING
// ─────────────────────────────────────────────────────────────
app.use('/api/', generalLimiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/orders/checkout', paymentLimiter);
app.use('/api/orders/verify', paymentLimiter);

// ─────────────────────────────────────────────────────────────
// AUDIT LOGGING FOR ADMIN ENDPOINTS
// ─────────────────────────────────────────────────────────────
app.use('/api/admin', auditLogger(), adminRoutes);

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Spill The Beans API',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// ─────────────────────────────────────────────────────────────
// API ROUTES (Non-Admin routes)
// ─────────────────────────────────────────────────────────────
app.use('/api/users',      userRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart',       cartRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/coupons',    couponRoutes);

// ─────────────────────────────────────────────────────────────
// ERROR HANDLING — must be LAST
// ─────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
