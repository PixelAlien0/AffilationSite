import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const referer = request.headers.get('referer') || 'direct_tiktok';
  const origin = new URL(request.url).origin;

  try {
    if (supabase) {
      const { data: product, error } = await supabase
        .from('products')
        .select('id, affiliate_url')
        .eq('slug', slug)
        .single();

      if (!error && product) {
        supabase
          .from('clicks')
          .insert({
            product_id: product.id,
            referer,
          })
          .then(({ error: clickErr }) => {
            if (clickErr) console.error('[CLICK_LOG_ERR]', clickErr.message);
          });

        return NextResponse.redirect(new URL(product.affiliate_url), 307);
      }
    }

    return NextResponse.redirect(new URL('/', origin), 307);
  } catch {
    return NextResponse.redirect(new URL('/', origin), 307);
  }
}
