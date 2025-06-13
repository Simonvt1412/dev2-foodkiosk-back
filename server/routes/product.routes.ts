import express from 'express';
import * as productController from '../controllers/product.controller';
import multer from 'multer';
import path from 'path';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Alleen afbeeldingsbestanden zijn toegestaan!'));
    }
  }
});

// Products routes
router.get('/', productController.getProducts);
router.post('/', upload.single('product_image'), productController.addProduct);
router.put('/:id', upload.single('product_image'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;