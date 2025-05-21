import express from 'express';
import path from 'path';
import productRoutes from './routes/product.routes';
// ...andere imports...

const app = express();

// ...middleware...

// Serve static files from server/views
app.use(express.static(path.join(__dirname, 'views')));

// Fallback: stuur index.html voor alle niet-API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// ...API routes...
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));