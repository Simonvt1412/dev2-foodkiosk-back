import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';
import path from 'path';
import fs from 'fs';

// Get all products with optional category filter
export const getProducts = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Fetching products...');
    
    // Get query params
    const message = req.query.message;
    const categoryId = req.query.category || 'all';
    
    // Build base query
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name)
      `)
      .order('name');
    
    // Apply category filter if specified
    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }
    
    // Execute query
    const { data: products, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching products:', error);
      return res.status(500).render('error', {
        message: 'Er is een fout opgetreden bij het ophalen van de producten',
        error,
        page: 'error'
      });
    }
    
    console.log(`✅ Found ${products?.length || 0} products`);
    
    // Fetch all categories for the dropdown filter
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (categoryError) {
      console.error('❌ Error fetching categories:', categoryError);
    }
    
    // Render products page with data
    res.render('products/index', { 
      products, 
      categories: categories || [],
      selectedCategoryId: categoryId,
      message, 
      page: 'products',
      title: 'Producten'
    });
  } catch (error) {
    console.error('❌ Unexpected error in getProducts:', error);
    res.status(500).render('error', { 
      message: 'Er is een fout opgetreden',
      error,
      page: 'error'
    });
  }
};

// Add a new product
export const addProduct = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category_id, 
      voorraad,
      is_available
    } = req.body;
    
    console.log('📝 Adding product:', { name, price, category_id });
    
    // Validate required fields
    if (!name || !category_id) {
      return res.status(400).json({ 
        error: 'Naam en categorie zijn verplicht' 
      });
    }
    
    // Handle image path
    let finalImageUrl = '';
    
    // If a file was uploaded, use that path
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
      console.log('📁 Using uploaded image:', finalImageUrl);
    } 
    // Otherwise if URL was provided
    else if (req.body.image_url) {
      finalImageUrl = req.body.image_url;
      console.log('🔗 Using image URL:', finalImageUrl);
    }
    
    // Create product with current timestamp
    const { data, error } = await supabase
      .from('products')
      .insert([{ 
        name, 
        description: description || '', 
        price: price ? parseFloat(price) : 0, 
        category_id: parseInt(category_id), 
        voorraad: voorraad ? parseInt(voorraad) : 0,
        is_available: is_available === '1' || is_available === 'on' || is_available === true,
        image_url: finalImageUrl,
        created_at: new Date().toISOString() // Using created_at for all timestamp updates
      }])
      .select();
    
    if (error) {
      console.error('❌ Error adding product:', error);
      return res.status(500).json({ error: 'Er is een fout opgetreden bij het toevoegen van het product' });
    }
    
    console.log('✅ Product added successfully:', data);
    
    // Return JSON or redirect based on request headers
    if (req.headers.accept?.includes('application/json')) {
      return res.status(201).json(data?.[0] || {});
    } else {
      return res.redirect('/products?message=Product+succesvol+toegevoegd');
    }
  } catch (error) {
    console.error('❌ Unexpected error in addProduct:', error);
    return res.status(500).json({ error: 'Er is een fout opgetreden bij het toevoegen van het product' });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      category_id, 
      voorraad,
      is_available,
      image_url
    } = req.body;
    
    console.log('🔄 Updating product:', id, req.body);
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Naam is verplicht' });
    }
    
    // Build update data object
    const updateData: any = {
      name,
      description: description || '',
      created_at: new Date().toISOString() // Using created_at for timestamp updates
    };
    
    // Only update fields if they are provided
    if (price !== undefined && price !== null) {
      updateData.price = parseFloat(price);
    }
    
    if (category_id !== undefined && category_id !== null) {
      updateData.category_id = parseInt(category_id);
    }
    
    if (voorraad !== undefined && voorraad !== null) {
      updateData.voorraad = parseInt(String(voorraad));
    }
    
    if (is_available !== undefined) {
      updateData.is_available = Boolean(is_available);
    }
    
    // Update image URL if provided
    if (image_url) {
      updateData.image_url = image_url;
    }
    
    console.log('📝 Update data:', updateData);
    
    // Update product
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('❌ Error updating product:', error);
      return res.status(500).json({ error: 'Er is een fout opgetreden bij het bijwerken van het product' });
    }
    
    console.log('✅ Product updated successfully:', data);
    
    // Return updated product
    return res.json(data[0] || {});
  } catch (error) {
    console.error('❌ Unexpected error in updateProduct:', error);
    return res.status(500).json({ error: 'Er is een fout opgetreden bij het bijwerken van het product' });
  }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Error deleting product:', error);
      return res.status(500).json({ error: 'Er is een fout opgetreden bij het verwijderen van het product' });
    }
    
    console.log('✅ Product deleted successfully:', id);
    
    // Return JSON or redirect based on request headers
    if (req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, id });
    } else {
      return res.redirect('/products?message=Product+succesvol+verwijderd');
    }
  } catch (error) {
    console.error('❌ Unexpected error in deleteProduct:', error);
    return res.status(500).json({ error: 'Er is een fout opgetreden bij het verwijderen van het product' });
  }
};