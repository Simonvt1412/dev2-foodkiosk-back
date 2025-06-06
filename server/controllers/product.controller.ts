import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

export async function getProducts(req: Request, res: Response) {
  const { data, error } = await supabase.from('products').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.render("products/list", {products: data});
}

export async function getProductsByCategory(req: Request, res: Response) {
  const { category_id } = req.params;
  const { data, error } = await supabase.from('products').select('*').eq('category_id', category_id);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function addProduct(req: Request, res: Response) {
  const { name, description, price, category_id, stock } = req.body;
  const { data, error } = await supabase
    .from('products')
    .insert([{ name, description, price, category_id, stock }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;
  const { name, description, price, category_id, stock } = req.body;
  const { data, error } = await supabase
    .from('products')
    .update({ name, description, price, category_id, stock })
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function getProductStock(req: Request, res: Response) {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('products')
    .select('stock')
    .eq('id', id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ stock: data?.stock });
}