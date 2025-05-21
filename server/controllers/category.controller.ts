import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

export async function getCategories(req: Request, res: Response) {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function addCategory(req: Request, res: Response) {
  const { name, description } = req.body;
  const { data, error } = await supabase.from('categories').insert([{ name, description }]);
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}