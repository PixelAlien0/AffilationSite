'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  ArrowUpRight,
  Search,
  ShoppingBag,
  Play,
  Sparkles,
  SlidersHorizontal,
  Tag,
  CheckCircle2,
} from 'lucide-react';
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

/* Bold Geometric Art (shapes.gallery inspired) */
function ShapesGalleryStar({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <polygon points="50,0 61,35 98,35 68,57 79,92 50,70 21,92 32,57 2,35 39,35" />
    </svg>
  );
}

function ShapesOctagonBurst({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <polygon points="50,0 65,30 95,20 75,45 100,65 68,68 75,100 50,78 25,100 32,68 0,65 25,45 5,20 35,30" />
    </svg>
  );
}

function GeometricProductGraphic({ index }: { index: number }) {
  const graphics = [
    <svg key="g1" viewBox="0 0 120 120" className="w-24 h-24 stroke-black fill-none" strokeWidth="2">
      <rect x="18" y="18" width="84" height="84" className="fill-white" />
      <rect x="34" y="34" width="52" height="52" className="fill-signal stroke-black" />
      <circle cx="60" cy="60" r="10" className="fill-black stroke-none" />
    </svg>,
    <svg key="g2" viewBox="0 0 120 120" className="w-24 h-24 stroke-black fill-none" strokeWidth="2">
      <circle cx="60" cy="60" r="44" className="fill-white" />
      <polygon points="60,24 92,80 28,80" className="fill-cobalt stroke-black" />
      <circle cx="60" cy="62" r="8" className="fill-white" />
    </svg>,
    <svg key="g3" viewBox="0 0 120 120" className="w-24 h-24 stroke-black fill-none" strokeWidth="2">
      <polygon points="60,12 108,60 60,108 12,60" className="fill-signal" />
      <rect x="42" y="42" width="36" height="36" className="fill-white stroke-black" />
    </svg>,
  ];
  return graphics[index % graphics.length];
}

export default function KripplingFindsStorefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL FINDS');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_LOW' | 'PRICE_HIGH'>('NEWEST');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyConfig>({
    code: 'USD',
    rate: 1,
    locale: 'en-US',
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrency(detectUserCurrency());

    if (badgeRef.current) {
      gsap.to(badgeRef.current, {
        rotation: 360,
        duration: 18,
        repeat: -1,
        ease: 'none',
      });
    }

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

  // Build universal shopping categories dynamically or fallback to popular TikTok verticals
  const dynamicCategories = Array.from(
    new Set(products.map((p) => p.category?.toUpperCase()).filter(Boolean))
  );
  const categories =
    dynamicCategories.length > 0
      ? ['ALL FINDS', ...dynamicCategories]
      : ['ALL FINDS', 'VIRAL PICKS', 'DAILY ESSENTIALS', 'ROOM & HOME', 'GADGETS', 'STYLE & CARE'];

  const filteredProducts = products
    .filter((p) => {
      const matchesCategory =
        activeCategory === 'ALL FINDS' || p.category?.toUpperCase() === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.spec_note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'PRICE_LOW') return Number(a.deal_price) - Number(b.deal_price);
      if (sortBy === 'PRICE_HIGH') return Number(b.deal_price) - Number(a.deal_price);
      return 0;
    });

  const featuredDeal = products.find((p) => p.is_featured) || products[0];

  useEffect(() => {
    if (!gridRef.current || filteredProducts.length === 0) return;
    const cards = gridRef.current.querySelectorAll('.product-card');
    gsap.killTweensOf(cards);
    gsap.fromTo(
      cards,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
      }
    );
  }, [activeCategory, searchQuery, sortBy, filteredProducts.length]);

  return (
    <div className="min-h-screen bg-canvas text-ink pb-16 selection:bg-signal selection:text-white">
      {/* 1. KINETIC MARQUEE TICKER TAPE */}
      <div className="bg-black text-white border-b border-black overflow-hidden py-2 font-mono text-[11px] font-bold uppercase tracking-wider">
        <div className="animate-marquee flex items-center space-x-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-8 shrink-0">
              <span className="text-signal">★</span>
              <span>KRIPPLINGFINDS OFFICIAL TIKTOK SHOP DIRECTORY</span>
              <span className="text-cobalt">■</span>
              <span>AS SEEN ON @KRIPPLINGFINDS SHORT VIDEOS</span>
              <span className="text-signal">★</span>
              <span>VERIFIED VIRAL DEALS &amp; DIRECT LINKS</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. STOREFRONT NAVIGATION BAR */}
      <header className="sticky top-0 z-40 h-16 bg-canvas border-b border-black px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-signal border border-black flex items-center justify-center text-white shadow-hard-sm">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-sans font-black text-xl tracking-swiss uppercase block leading-none">
              KRIPPLING<span className="text-signal">FINDS</span>
            </span>
            <span className="font-mono text-[10px] text-neutral-500 block mt-0.5">
              TIKTOK CURATOR STOREFRONT
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-xs">
          <div className="hidden sm:flex items-center border border-black px-2.5 py-1.5 bg-surface font-bold">
            <span>PRICE IN: {currency.code}</span>
          </div>
          <a
            href="https://www.tiktok.com/@KripplingFinds"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-swiss px-3.5 py-2 border border-black font-bold flex items-center gap-1.5 shadow-hard"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>@KripplingFinds</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto border-x border-black">
        {/* 3. EXPRESSIVE SWISS POSTER HERO + TIKTOK VIDEO SHOWCASE CARD */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-black">
          {/* Left 8 Columns: High-Impact Typography & Search Bar */}
          <div className="lg:col-span-8 p-6 sm:p-10 md:p-12 border-b lg:border-b-0 lg:border-r border-black relative overflow-hidden flex flex-col justify-between bg-canvas">
            {/* Decorative Dot-Matrix Corner Block */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-dot-matrix opacity-15 pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 bg-signal text-white font-mono text-xs font-bold px-3 py-1 border border-black mb-6 shadow-hard">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SEEN IT IN A TIKTOK? GRAB IT HERE.</span>
              </div>

              <h1 className="font-sans font-black text-4xl sm:text-6xl md:text-7xl leading-[0.92] tracking-swiss uppercase mb-6">
                SHOP EVERY FIND FROM OUR{' '}
                <span className="bg-black text-white px-2 inline-block">SHORT VIDEOS.</span>
              </h1>

              <p className="font-mono text-xs sm:text-sm text-neutral-700 max-w-2xl leading-relaxed mb-8">
                Welcome to the official <strong>KripplingFinds</strong> shopping directory. Every
                product featured in our TikTok short-form videos is cataloged below with direct deal
                links and local {currency.code} pricing.
              </p>
            </div>

            {/* Storefront Search Bar */}
            <div className="w-full">
              <label className="font-mono text-[11px] font-bold uppercase block mb-2">
                SEARCH BY VIDEO ITEM NAME OR NUMBER (#01, #02...):
              </label>
              <div className="flex items-stretch border-2 border-black bg-canvas shadow-hard">
                <div className="px-4 flex items-center justify-center bg-surface border-r border-black">
                  <Search className="w-5 h-5 text-black" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type product name, category, or keyword from TikTok..."
                  className="w-full px-4 py-3.5 bg-transparent font-mono text-xs sm:text-sm focus:outline-none placeholder:text-neutral-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 font-mono text-xs font-bold bg-black text-white hover:bg-signal"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Visual Graphic Poster & 9:16 Short-Form Video Card */}
          <div className="lg:col-span-4 bg-cobalt text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden bg-dot-matrix-white">
            {/* Rotating Geometric Star Badge */}
            <div
              ref={badgeRef}
              className="absolute -right-6 -top-6 text-signal pointer-events-none"
            >
              <ShapesOctagonBurst className="w-28 h-28" />
            </div>

            <div className="relative z-10 flex items-center justify-between border-b border-white/30 pb-4 mb-6">
              <div className="font-mono text-xs font-bold uppercase">
                <span className="block text-signal bg-white px-1.5 py-0.5 border border-black mb-1 inline-block">
                  9:16 SHORT-FORM FEED
                </span>
                <span className="block mt-1">@KRIPPLINGFINDS</span>
              </div>
              <div className="w-10 h-10 bg-white text-black border border-black flex items-center justify-center font-sans font-black text-sm">
                KF
              </div>
            </div>

            {/* Simulated 9:16 TikTok Short Card Frame */}
            <div className="relative z-10 bg-white text-black border-2 border-black p-5 shadow-hard my-auto">
              <div className="flex items-center justify-between font-mono text-[11px] font-bold border-b border-black pb-2.5 mb-4">
                <span className="flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-signal text-signal" />
                  HOW TO SHOP
                </span>
                <span className="bg-black text-white px-1.5 py-0.5 text-[10px]">3 STEPS</span>
              </div>

              <ol className="space-y-3 font-mono text-xs">
                <li className="flex items-start gap-2.5">
                  <span className="bg-signal text-white font-bold px-1.5 py-0.5 text-[10px] border border-black shrink-0">
                    01
                  </span>
                  <span>Watch a short video on <strong>@KripplingFinds</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="bg-black text-white font-bold px-1.5 py-0.5 text-[10px] border border-black shrink-0">
                    02
                  </span>
                  <span>Search the item name or browse the category tabs below.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="bg-cobalt text-white font-bold px-1.5 py-0.5 text-[10px] border border-black shrink-0">
                    03
                  </span>
                  <span>Click <strong>SHOP THIS FIND</strong> to open the verified deal.</span>
                </li>
              </ol>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-white/30 flex items-center justify-between font-mono text-[11px]">
              <span>UPDATED WITH EVERY POST</span>
              <span className="font-bold">100% DIRECT LINKS</span>
            </div>
          </div>
        </section>

        {/* 4. SHOPPING CATEGORY PILLS & SORT CONTROLS */}
        <section className="border-b border-black bg-surface flex flex-col md:flex-row md:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex overflow-x-auto border-b md:border-b-0 border-black">
            {categories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-4 font-mono text-xs font-bold border-r border-black uppercase whitespace-nowrap transition-none flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-signal text-white'
                      : 'bg-canvas text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {isActive && <span>★</span>}
                  <span>{category}</span>
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="px-4 py-2.5 flex items-center justify-between md:justify-end gap-3 font-mono text-xs bg-canvas md:border-l border-black">
            <span className="flex items-center gap-1.5 text-neutral-600 font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              SORT:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-surface border border-black px-2.5 py-1 font-mono text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="NEWEST">LATEST VIDEO DROPS</option>
              <option value="PRICE_LOW">PRICE: LOW TO HIGH</option>
              <option value="PRICE_HIGH">PRICE: HIGH TO LOW</option>
            </select>
          </div>
        </section>

        {/* 5. SHOPPING PRODUCT GRID */}
        {loading ? (
          <section className="p-20 font-mono text-xs font-bold uppercase text-center bg-canvas">
            LOADING KRIPPLINGFINDS CATALOG...
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="p-12 sm:p-20 bg-dot-matrix-light border-b border-black flex flex-col items-center justify-center text-center">
            <div className="border-2 border-black bg-canvas p-8 max-w-md w-full shadow-hard space-y-4">
              <div className="w-12 h-12 bg-signal text-white border border-black mx-auto flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="font-sans font-black text-2xl uppercase tracking-swiss">
                {products.length === 0 ? 'NEW DROPS COMING SOON' : 'NO MATCHING FINDS'}
              </div>
              <p className="font-mono text-xs text-neutral-600 leading-relaxed">
                {products.length === 0
                  ? 'We are updating the @KripplingFinds catalog with products from our latest TikTok videos. Add items in your Supabase products table to display them here!'
                  : `No items matched "${searchQuery}". Try clearing your search or switching category tabs.`}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('ALL FINDS');
                  }}
                  className="btn-swiss px-5 py-2.5 font-mono text-xs font-bold uppercase border border-black inline-block"
                >
                  SHOW ALL FINDS
                </button>
              )}
            </div>
          </section>
        ) : (
          <section
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-b border-black bg-canvas"
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
              const findNumber = String(idx + 1).padStart(2, '0');

              return (
                <article
                  key={product.id}
                  className="product-card flex flex-col justify-between border-b sm:border-r border-black bg-canvas group"
                >
                  <div>
                    {/* Shopping Card Top Bar */}
                    <div className="px-4 py-3 border-b border-black flex items-center justify-between font-mono text-xs bg-surface">
                      <span className="bg-black text-white px-2 py-0.5 font-bold">
                        FIND #{findNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="border border-black bg-canvas px-2 py-0.5 text-[10px] font-bold uppercase">
                          {product.category}
                        </span>
                        {discountPct > 0 && (
                          <span className="bg-signal text-white border border-black px-2 py-0.5 text-[10px] font-bold">
                            SAVE {discountPct}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Image / Geometric Art Frame */}
                    <div className="aspect-square w-full border-b border-black bg-dot-matrix-light relative flex items-center justify-center overflow-hidden p-6">
                      {product.is_featured && (
                        <div className="absolute top-3 left-3 z-10 bg-signal text-white border border-black px-2.5 py-1 font-mono text-[10px] font-bold uppercase shadow-hard">
                          ★ TIKTOK VIRAL PICK
                        </div>
                      )}

                      {product.rating && (
                        <div className="absolute top-3 right-3 z-10 bg-canvas text-black border border-black px-2 py-0.5 font-mono text-[10px] font-bold">
                          ★ {product.rating}
                        </div>
                      )}

                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover border border-black bg-canvas"
                        />
                      ) : (
                        <div className="w-full h-full border border-black bg-canvas flex flex-col items-center justify-center p-4 shadow-hard">
                          <GeometricProductGraphic index={idx} />
                          <span className="font-mono text-[10px] text-neutral-500 mt-3 uppercase">
                            @KripplingFinds Pick
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Title & Short Video Note */}
                    <div className="p-5 pb-3">
                      <h2 className="font-sans font-black text-xl leading-tight tracking-swiss uppercase group-hover:text-signal">
                        {product.title}
                      </h2>
                      {product.spec_note && (
                        <p className="font-mono text-xs text-neutral-600 mt-2 leading-relaxed">
                          {product.spec_note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shopping Price Box & Buy CTA */}
                  <div className="p-5 pt-2">
                    <div className="bg-surface border border-black p-3 mb-3 flex items-baseline justify-between font-mono">
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase font-bold">
                          DEAL PRICE ({currency.code})
                        </span>
                        <span className="text-2xl font-bold text-black">
                          {formatPrice(Number(product.deal_price))}
                        </span>
                      </div>
                      {product.original_price && (
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-500 block uppercase">
                            BEFORE
                          </span>
                          <span className="text-xs line-through text-neutral-400">
                            {formatPrice(Number(product.original_price))}
                          </span>
                        </div>
                      )}
                    </div>

                    <a
                      href={`/go/${product.slug}`}
                      className="btn-swiss w-full py-3.5 px-4 font-mono text-xs font-bold uppercase flex items-center justify-between border border-black shadow-hard"
                    >
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        <span>SHOP THIS FIND</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </a>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* 6. WHY SHOP VIA KRIPPLINGFINDS (DESIGN ACCENT BANNER) */}
        <section className="grid grid-cols-1 md:grid-cols-3 border-b border-black bg-canvas font-mono text-xs">
          <div className="p-6 border-b md:border-b-0 md:border-r border-black flex items-start gap-3.5">
            <div className="w-8 h-8 bg-signal text-white border border-black flex items-center justify-center shrink-0 font-bold">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-sans font-black text-sm uppercase mb-1">
                FEATURED IN SHORT VIDEOS
              </h3>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                Every item is hand-picked and showcased in @KripplingFinds TikTok videos so you can see it in action first.
              </p>
            </div>
          </div>

          <div className="p-6 border-b md:border-b-0 md:border-r border-black flex items-start gap-3.5">
            <div className="w-8 h-8 bg-cobalt text-white border border-black flex items-center justify-center shrink-0 font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans font-black text-sm uppercase mb-1">
                LOCAL {currency.code} PRICING
              </h3>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                Prices automatically adjust to your local currency ({currency.code}) for fast comparison while shopping.
              </p>
            </div>
          </div>

          <div className="p-6 flex items-start gap-3.5">
            <div className="w-8 h-8 bg-black text-white border border-black flex items-center justify-center shrink-0 font-bold">
              <CheckCircle2 className="w-4 h-4 text-signal" />
            </div>
            <div>
              <h3 className="font-sans font-black text-sm uppercase mb-1">
                VERIFIED MERCHANT LINKS
              </h3>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                Direct one-click redirects straight to the official TikTok Shop or merchant listing.
              </p>
            </div>
          </div>
        </section>

        {/* 7. BRANDED FOOTER */}
        <footer className="p-6 md:px-10 bg-black text-white flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <ShapesGalleryStar className="w-5 h-5 text-signal" />
            <span className="font-sans font-black text-base tracking-swiss uppercase">
              KRIPPLINGFINDS
            </span>
            <span className="text-neutral-400">// @KripplingFinds</span>
          </div>
          <div className="text-neutral-400 text-[11px] text-center sm:text-right">
            TIKTOK AFFILIATE SHOPPING DIRECTORY &bull; ALL RIGHTS RESERVED
          </div>
        </footer>
      </main>

      {/* 8. STICKY BOTTOM BAR (MOBILE VIEWPORT - ONLY RENDERS WHEN PRODUCT EXISTS) */}
      {featuredDeal && (
        <div className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-canvas border-t-2 border-black flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center space-x-2 overflow-hidden pr-2">
            <span className="bg-signal text-white font-mono text-[10px] font-bold px-2 py-0.5 border border-black shrink-0">
              VIRAL PICK
            </span>
            <span className="font-sans font-bold text-xs truncate uppercase">
              {featuredDeal.title}
            </span>
          </div>
          <a
            href={`/go/${featuredDeal.slug}`}
            className="bg-black text-white hover:bg-signal font-mono text-xs font-bold px-4 h-9 flex items-center shrink-0 border border-black"
          >
            SHOP ↗
          </a>
        </div>
      )}
    </div>
  );
}
