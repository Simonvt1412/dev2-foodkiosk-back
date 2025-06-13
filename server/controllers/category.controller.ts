import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Fetching categories...');
    
    // Get URL query params
    const message = req.query.message;
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching categories:', error);
      return res.status(500).render('error', {
        message: 'Er is een fout opgetreden bij het ophalen van de categorieën',
        error,
        page: 'error'
      });
    }
    
    console.log(`✅ Found ${categories?.length || 0} categories`);
    
    res.render('categories/index', { 
      categories, 
      message, 
      page: 'categories',
      title: 'Categorieën' 
    });
  } catch (error) {
    console.error('❌ Unexpected error in getCategories:', error);
    res.status(500).render('error', { 
      message: 'Er is een fout opgetreden',
      error,
      page: 'error'
    });
  }
};

// Add new category
export const addCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Naam is verplicht' });
    }
    
    const { data, error } = await supabase
      .from('categories')
      .insert([
        { 
          name, 
          description: description || ''
        }
      ])
      .select();
    
    if (error) {
      console.error('❌ Error adding category:', error);
      
      // Check if it's a unique constraint error
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Een categorie met deze naam bestaat al' });
      }
      
      return res.status(500).json({ error: 'Er is een fout opgetreden bij het toevoegen van de categorie' });
    }
    
    console.log('✅ Category added successfully:', data);
    
    // Return JSON response
    return res.status(201).json(data?.[0] || {});
  } catch (error) {
    console.error('❌ Unexpected error in addCategory:', error);
    return res.status(500).json({ error: 'Er is een fout opgetreden' });
  }
};

// Update category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    console.log('🔄 Updating category:', id, { name, description });
    
    if (!name) {
      return res.status(400).json({ error: 'Naam is verplicht' });
    }
    
    const { data, error } = await supabase
      .from('categories')
      .update({ 
        name, 
        description: description || ''
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('❌ Error updating category:', error);
      
      // Check if it's a unique constraint error
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Een categorie met deze naam bestaat al' });
      }
      
      return res.status(500).json({ error: 'Er is een fout opgetreden bij het bijwerken van de categorie' });
    }
    
    if (!data || data.length === 0) {
      console.error('❌ Category not found for update');
      return res.status(404).json({ error: 'Categorie niet gevonden' });
    }
    
    console.log('✅ Category updated successfully:', data[0]);
    
    // Return JSON response
    return res.json(data[0]);
  } catch (error) {
    console.error('❌ Unexpected error in updateCategory:', error);
    return res.status(500).json({ error: 'Er is een fout opgetreden' });
  }
};

// Delete category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if category has products
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);
    
    if (countError) {
      console.error('❌ Error checking products:', countError);
      return res.status(500).json({ error: 'Er is een fout opgetreden bij het controleren van producten in deze categorie' });
    }
    
    if (count && count > 0) {
      return res.status(400).json({ 
        error: `Categorie kan niet worden verwijderd omdat er nog ${count} producten aan zijn gekoppeld. Verplaats of verwijder eerst deze producten.` 
      });
    }
    
    // Delete the category if no products are assigned
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Error deleting category:', error);
      return res.status(500).json({ error: 'Er is een fout opgetreden bij het verwijderen van de categorie' });
    }
    
    console.log('✅ Category deleted successfully:', id);
    
    // Return success response
    return res.json({ success: true, id });
  } catch (error) {
    console.error('❌ Unexpected error in deleteCategory:', error);
    return res.status(500).json({ error: 'Er is een fout opgetreden' });
  }
};

// Get combinations
export const getCombinations = async (req: Request, res: Response) => {
  try {
    // Sample combinations data
    const combinations = [
      {
        products: ['Spaghetti', 'Bolognese', 'Parmezaanse kaas'],
        count: 145,
        avgValue: 13.50
      },
      {
        products: ['Penne', 'Arrabiata', 'Rucola'],
        count: 98,
        avgValue: 18.25
      },
      {
        products: ['Fusilli', 'Pesto', 'Pijnboompitten'],
        count: 67,
        avgValue: 22.75
      }
    ];
    
    res.render('categories/combinations', { 
      combinations,
      page: 'combinations',
      title: 'Productcombinaties' 
    });
  } catch (error) {
    console.error('❌ Error in getCombinations:', error);
    res.status(500).render('error', { 
      message: 'Er is een fout opgetreden bij het ophalen van combinaties',
      error,
      page: 'error'
    });
  }
};