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
import authRoutes    from './routes/auth.js';
import userRoutes     from './routes/users.js';
import productRoutes  from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes     from './routes/cart.js';
import orderRoutes    from './routes/orders.js';
import couponRoutes   from './routes/coupons.js';
import wishlistRoutes from './routes/wishlist.js';
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
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://api.razorpay.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
const getOrigins = () => {
  const envOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://spill-the-beans-mu.vercel.app',
  ];

  return Array.from(new Set([...envOrigins, ...defaultOrigins]));
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');
    const allowedList = getOrigins();

    const isAllowed =
      allowedList.includes(normalizedOrigin) ||
      allowedList.includes('*') ||
      /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(normalizedOrigin);

    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'X-Requested-With', 'Accept'],
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
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
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
app.use('/api/auth',       authRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart',       cartRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/coupons',    couponRoutes);
app.use('/api/wishlist',   wishlistRoutes);

// ─────────────────────────────────────────────────────────────
// ERROR HANDLING — must be LAST
// ─────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
