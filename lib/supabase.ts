import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';

const isValidHttpUrl = (str: string) => {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const supabase =
  isValidHttpUrl(rawUrl) && rawKey.length > 0
    ? createClient(rawUrl, rawKey)
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
