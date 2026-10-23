import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export interface Product {
  id: string;
  slug: string;
  title: string;
  category: 'TECH' | 'SETUP' | 'DAILY';
  original_price: number;
  deal_price: number;
  affiliate_url: string;
  is_featured: boolean;
  spec_note?: string;
  rating?: string;
}
