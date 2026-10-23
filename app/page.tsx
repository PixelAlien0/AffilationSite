'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowUpRight, Search } from 'lucide-react';
import { supabase, type Product } from '@/lib/supabase';

interface CurrencyConfig {
  code: string;
  rate: number;
  locale: string;
}

const REGION_CURRENCY_MAP: Record<string, CurrencyConfig> = {
  PH: { code: 'PHP', rate: 58.0, locale: 'en-PH' },
  SG: { code: 'SGD', rate: 1.34, locale: 'en-SG' },
  MY: { code: 'MYR', rate: 4.35, locale: 'ms-MY' },
  ID: { code: 'IDR', rate: 15600, locale: 'id-ID' },
  TH: { code: 'THB', rate: 33.5, locale: 'th-TH' },
  VN: { code: 'VND', rate: 25300, locale: 'vi-VN' },
  GB: { code: 'GBP', rate: 0.77, locale: 'en-GB' },
  CA: { code: 'CAD', rate: 1.39, locale: 'en-CA' },
  AU: { code: 'AUD', rate: 1.51, locale: 'en-AU' },
  JP: { code: 'JPY', rate: 152.0, locale: 'ja-JP' },
  KR: { code: 'KRW', rate: 1380.0, locale: 'ko-KR' },
  DE: { code: 'EUR', rate: 0.92, locale: 'de-DE' },
  FR: { code: 'EUR', rate: 0.92, locale: 'fr-FR' },
  IT: { code: 'EUR', rate: 0.92, locale: 'it-IT' },
  ES: { code: 'EUR', rate: 0.92, locale: 'es-ES' },
  NL: { code: 'EUR', rate: 0.92, locale: 'nl-NL' },
};

const TIMEZONE_REGION_MAP: Record<string, string> = {
  'Asia/Manila': 'PH',
  'Asia/Singapore': 'SG',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Jakarta': 'ID',
  'Asia/Bangkok': 'TH',
  'Asia/Ho_Chi_Minh': 'VN',
  'Europe/London': 'GB',
  'Asia/Tokyo': 'JP',
  'Asia/Seoul': 'KR',
  'Australia/Sydney': 'AU',
};

function detectUserCurrency(): CurrencyConfig {
  if (typeof window === 'undefined') {
    return { code: 'USD', rate: 1, locale: 'en-US' };
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_REGION_MAP[tz]) {
      return REGION_CURRENCY_MAP[TIMEZONE_REGION_MAP[tz]];
    }
    const lang = navigator.language || 'en-US';
    const region = lang.split('-')[1]?.toUpperCase();
    if (region && REGION_CURRENCY_MAP[region]) {
      return REGION_CURRENCY_MAP[region];
    }
  } catch {
    // Fallback to USD
  }
  return { code: 'USD', rate: 1, locale: 'en-US' };
}

/* Minimal Geometric Fallback (shapes.gallery inspired) when no product photo is set */
function GeometricPlaceholder({ index }: { index: number }) {
  const shapes = [
    <svg key="s1" viewBox="0 0 100 100" className="w-16 h-16 stroke-black fill-none" strokeWidth="1.5">
      <rect x="15" y="15" width="70" height="70" />
      <line x1="15" y1="50" x2="85" y2="50" />
      <line x1="50" y1="15" x2="50" y2="85" />
      <rect x="42" y="42" width="16" height="16" className="fill-signal stroke-none" />
    </svg>,
    <svg key="s2" viewBox="0 0 100 100" className="w-16 h-16 stroke-black fill-none" strokeWidth="1.5">
      <circle cx="50" cy="50" r="35" />
      <line x1="15" y1="50" x2="85" y2="50" />
      <circle cx="50" cy="50" r="6" className="fill-black" />
    </svg>,
    <svg key="s3" viewBox="0 0 100 100" className="w-16 h-16 stroke-black fill-none" strokeWidth="1.5">
      <polygon points="50,15 85,80 15,80" />
      <line x1="50" y1="15" x2="50" y2="80" />
    </svg>,
  ];
  return shapes[index % shapes.length];
}

export default function AffiliateDirectoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyConfig>({
    code: 'USD',
    rate: 1,
    locale: 'en-US',
  });
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrency(detectUserCurrency());

    async function fetchProducts() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data as Product[]);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const formatPrice = (amountInUsd: number) => {
    const converted = amountInUsd * currency.rate;
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: currency.rate >= 100 ? 0 : 2,
    }).format(converted);
  };

  // Dynamically derive universal categories from actual products (fallback to universal defaults)
  const dynamicCategories = Array.from(
    new Set(products.map((p) => p.category?.toUpperCase()).filter(Boolean))
  );
  const categories =
    dynamicCategories.length > 0
      ? ['ALL', ...dynamicCategories]
      : ['ALL', 'ESSENTIALS', 'HOME', 'LIFESTYLE', 'TECH'];

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'ALL' || p.category?.toUpperCase() === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.spec_note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredDeal = products.find((p) => p.is_featured) || products[0];

  useEffect(() => {
    if (!gridRef.current || filteredProducts.length === 0) return;
    const cards = gridRef.current.querySelectorAll('.product-card');
    gsap.killTweensOf(cards);
    gsap.fromTo(
      cards,
      { y: 16, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.35,
        stagger: 0.06,
        ease: 'power2.out',
      }
    );
  }, [activeCategory, searchQuery, filteredProducts.length]);

  return (
    <div className="min-h-screen bg-canvas text-ink pb-16 selection:bg-signal selection:text-white">
      {/* 1. COMPACT TOP BAR */}
      <header className="sticky top-0 z-40 h-12 bg-canvas border-b border-black px-4 md:px-8 flex items-center justify-between font-mono text-xs">
        <span className="font-bold tracking-tight">TIKTOK FINDS // DIRECTORY</span>
        <div className="flex items-center gap-2">
          <span className="border border-black px-2 py-0.5 text-[11px] font-bold">
            {currency.code}
          </span>
          <span className="bg-black text-white px-2 py-0.5 text-[11px] font-bold">
            {products.length} {products.length === 1 ? 'ITEM' : 'ITEMS'}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto border-x border-black">
        {/* 2. CLEAN SWISS HERO + SEARCH */}
        <section className="p-6 md:p-10 border-b border-black bg-canvas">
          <p className="font-mono text-xs text-signal font-bold uppercase mb-2">
            SHORT-FORM VIDEO PICKS
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h1 className="font-sans font-black text-4xl sm:text-6xl leading-[0.94] tracking-swiss uppercase">
              FEATURED IN VIDEOS.
            </h1>

            {/* Search Input for quick video item lookup */}
            <div className="w-full md:w-72 flex items-center border border-black bg-surface px-3 h-11">
              <Search className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search item or keyword..."
                className="w-full bg-transparent font-mono text-xs focus:outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>
        </section>

        {/* 3. UNIVERSAL CATEGORY TABS */}
        <section className="border-b border-black flex items-center justify-between bg-canvas overflow-x-auto">
          <div className="flex">
            {categories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-3.5 font-mono text-xs font-bold border-r border-black uppercase whitespace-nowrap transition-none ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-canvas text-black hover:bg-signal hover:text-white'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
          <div className="h-10 flex-1 bg-dot-matrix opacity-15 hidden sm:block" />
        </section>

        {/* 4. UNIVERSAL PRODUCT GRID */}
        {loading ? (
          <section className="p-16 font-mono text-xs uppercase text-center">
            LOADING PICKS...
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="p-16 bg-surface flex flex-col items-center justify-center text-center">
            <div className="border border-black bg-canvas p-6 max-w-sm w-full font-mono text-xs space-y-1.5">
              <div className="font-bold">NO ITEMS FOUND</div>
              <p className="text-neutral-500">
                {products.length === 0
                  ? 'Add products in your Supabase table to display them here.'
                  : 'Try another search term or category.'}
              </p>
            </div>
          </section>
        ) : (
          <section
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredProducts.map((product, idx) => {
              const discountPct =
                product.original_price && product.original_price > product.deal_price
                  ? Math.round(
                      ((product.original_price - product.deal_price) /
                        product.original_price) *
                        100
                    )
                  : 0;
              const itemNumber = String(idx + 1).padStart(2, '0');

              return (
                <article
                  key={product.id}
                  className="product-card flex flex-col justify-between border-b sm:border-r border-black bg-canvas"
                >
                  <div>
                    {/* Minimal Card Header */}
                    <div className="px-4 py-2.5 border-b border-black flex items-center justify-between font-mono text-xs">
                      <span className="font-bold">#{itemNumber}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] uppercase text-neutral-600">
                          {product.category}
                        </span>
                        {discountPct > 0 && (
                          <span className="bg-signal text-white px-1.5 py-0.5 text-[10px] font-bold">
                            -{discountPct}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Visual (Supports Image URL or Geometric Vector Fallback) */}
                    <div className="aspect-square w-full border-b border-black bg-surface relative flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <GeometricPlaceholder index={idx} />
                      )}
                    </div>

                    {/* Title & Short Note */}
                    <div className="p-5 pb-3">
                      <h2 className="font-sans font-black text-lg leading-snug tracking-swiss uppercase">
                        {product.title}
                      </h2>
                      {product.spec_note && (
                        <p className="font-mono text-xs text-neutral-600 mt-1.5">
                          {product.spec_note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price & Direct Action */}
                  <div className="p-5 pt-2">
                    <div className="border-t border-black pt-3 mb-3 flex items-baseline justify-between font-mono">
                      <span className="text-xl font-bold">
                        {formatPrice(Number(product.deal_price))}
                      </span>
                      {product.original_price && (
                        <span className="text-xs line-through text-neutral-400">
                          {formatPrice(Number(product.original_price))}
                        </span>
                      )}
                    </div>

                    <a
                      href={`/go/${product.slug}`}
                      className="btn-swiss w-full py-3 px-4 font-mono text-xs font-bold uppercase flex items-center justify-between border border-black"
                    >
                      <span>VIEW ITEM</span>
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </a>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      {/* 5. STICKY BOTTOM BAR (MOBILE VIEWPORT - ONLY RENDERS WHEN PRODUCT EXISTS) */}
      {featuredDeal && (
        <div className="fixed bottom-0 left-0 right-0 z-50 h-12 bg-canvas border-t border-black flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center space-x-2 overflow-hidden pr-2">
            <span className="bg-signal text-white font-mono text-[10px] font-bold px-1.5 py-0.5 shrink-0">
              FEATURED
            </span>
            <span className="font-sans font-bold text-xs truncate uppercase">
              {featuredDeal.title}
            </span>
          </div>
          <a
            href={`/go/${featuredDeal.slug}`}
            className="bg-signal text-white font-mono text-xs font-bold px-4 h-8 flex items-center shrink-0 border border-black"
          >
            OPEN ↗
          </a>
        </div>
      )}
    </div>
  );
}
