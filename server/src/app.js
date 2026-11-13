import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

// Route imports
import healthRoutes from './routes/healthRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import diseaseRoutes from './routes/diseaseRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import fertilizerRoutes from './routes/fertilizerRoutes.js';
import irrigationRoutes from './routes/irrigationRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// HTTP Request logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Body parsing with safe size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Rate Limiter for standard API endpoints
app.use('/api/v1', generalLimiter);

// API v1 Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/crops', cropRoutes);
app.use('/api/v1/disease', diseaseRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/fertilizer', fertilizerRoutes);
app.use('/api/v1/irrigation', irrigationRoutes);
app.use('/api/v1/assistant', assistantRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// 404 and Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
