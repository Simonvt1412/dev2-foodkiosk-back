import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import dotenv from 'dotenv';
import cors from 'cors';
import expressLayouts from 'express-ejs-layouts'; // Make sure this is imported

// Import middleware
import { logger } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';

// Import routes
import indexRoutes from './routes/index.routes';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import orderRoutes from './routes/order.routes';
import userRoutes from './routes/user.routes';
import apiRoutes from './routes/api.routes';
import dashboardRoutes from './routes/dashboard.routes'; // Make sure this is imported

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts); // Make sure this is added
app.set('layout', 'layout'); // Specify the layout file

// Set up middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method')); // For handling PUT/DELETE in forms
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Set up session
app.use(session({
  secret: process.env.SESSION_SECRET || 'foodkiosk-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Set up logging
app.use(logger);

// Make user available to all templates
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = req.session.isAuthenticated || false;
  next();
});

// Set up routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);
app.use('/dashboard', dashboardRoutes); // Make sure this is configured
app.use('/api', apiRoutes);

// Handle 404
app.use((req: Request, res: Response) => {
  res.status(404).render('error', {
    message: 'Pagina niet gevonden',
    error: { status: 404 },
    page: 'error',
    title: '404 - Pagina niet gevonden'
  });
});

// Set up error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;