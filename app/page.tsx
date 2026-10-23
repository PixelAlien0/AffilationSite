'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Plus, Check, Terminal } from 'lucide-react';
import { supabase, type Product } from '@/lib/supabase';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const CATEGORIES = ['ALL', 'TECH', 'SETUP', 'DAILY'] as const;

/* Dynamic Local Currency Mapping & Base USD Exchange Rates */
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
    const parts = lang.split('-');
    const region = parts[1]?.toUpperCase();
    if (region && REGION_CURRENCY_MAP[region]) {
      return REGION_CURRENCY_MAP[region];
    }
  } catch {
    // Fallback to USD
  }
  return { code: 'USD', rate: 1, locale: 'en-US' };
}

/* Geometric Silhouette Vector Component (shapes.gallery inspired) */
function GeometricGlyph({ index }: { index: number }) {
  const glyphs = [
    <svg key="g1" viewBox="0 0 120 120" className="w-24 h-24 stroke-black fill-none" strokeWidth="1.5">
      <rect x="16" y="16" width="88" height="88" />
      <line x1="0" y1="60" x2="120" y2="60" />
      <line x1="60" y1="0" x2="60" y2="120" />
      <rect x="48" y="48" width="24" height="24" className="fill-signal stroke-none" />
    </svg>,
    <svg key="g2" viewBox="0 0 120 120" className="w-24 h-24 stroke-black fill-none" strokeWidth="1.5">
      <polygon points="60,12 108,36 108,84 60,108 12,84 12,36" />
      <line x1="12" y1="36" x2="60" y2="60" />
      <line x1="108" y1="36" x2="60" y2="60" />
      <line x1="60" y1="60" x2="60" y2="108" />
      <circle cx="60" cy="60" r="6" className="fill-black" />
    </svg>,
    <svg key="g3" viewBox="0 0 120 120" className="w-24 h-24 stroke-black fill-none" strokeWidth="1.5">
      <circle cx="60" cy="60" r="44" />
      <line x1="16" y1="16" x2="104" y2="104" />
      <line x1="104" y1="16" x2="16" y2="104" />
      <rect x="52" y="12" width="16" height="96" className="fill-white stroke-black" />
    </svg>,
  ];
  return glyphs[index % glyphs.length];
}

export default function AffiliateArchivePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>('ALL');
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

  const filteredProducts =
    activeCategory === 'ALL'
      ? products
      : products.filter((p) => p.category === activeCategory);

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
        duration: 0.45,
        stagger: 0.08,
        ease: 'power2.out',
      }
    );
  }, [activeCategory, filteredProducts.length]);

  return (
    <div className="min-h-screen bg-canvas text-ink pb-16 selection:bg-signal selection:text-white">
      {/* 1. TOP INDEX BAR */}
      <header className="sticky top-0 z-40 h-11 bg-canvas border-b border-black px-4 md:px-8 flex items-center justify-between font-mono text-xs tracking-tight">
        <div className="flex items-center space-x-3">
          <span className="font-bold">ARCHIVE // TIKTOK PICKS</span>
          <span className="hidden sm:inline text-neutral-400">|</span>
          <span className="hidden sm:inline text-neutral-600">SYS.REF.2026</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="border border-black px-1.5 py-0.5 text-[10px] font-bold">
            [CURRENCY: {currency.code}]
          </span>
          <span className="border border-black px-1.5 py-0.5 text-[10px] font-bold">
            [INDEX: {String(products.length).padStart(2, '0')}]
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto border-x border-black">
        {/* 2. HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-black">
          <div className="lg:col-span-9 p-6 md:p-12 border-b lg:border-b-0 lg:border-r border-black">
            <div className="font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>SWISS TECHNICAL INDEX // DIRECT STREAM REDIRECT</span>
            </div>
            <h1 className="font-sans font-black text-4xl sm:text-6xl md:text-7xl leading-[0.92] tracking-swiss uppercase">
              CURATED EQUIPMENT &amp; STREAM DEALS.
            </h1>
          </div>

          <div className="lg:col-span-3 flex flex-col justify-between bg-surface">
            <div className="p-6 border-b border-black bg-dot-matrix-subtle flex-1 flex flex-col justify-end">
              <p className="font-mono text-xs leading-relaxed bg-canvas p-3 border border-black">
                ALL UNITS FIELD-TESTED ON STREAM. DIRECT VERIFIED MERCHANT LINKS WITH ZERO MARKUP.
              </p>
            </div>
            <div className="p-4 font-mono text-[11px] flex justify-between items-center bg-canvas">
              <span>REGION: {currency.code}</span>
              <span className="font-bold text-signal">[VERIFIED]</span>
            </div>
          </div>
        </section>

        {/* 3-COLUMN METADATA BAR */}
        <section className="grid grid-cols-3 border-b border-black font-mono text-xs">
          <div className="p-3 md:px-6 border-r border-black flex items-center justify-between">
            <span className="text-neutral-500 hidden sm:inline">SCHEDULE</span>
            <span className="font-bold">[CURATION: DAILY]</span>
          </div>
          <div className="p-3 md:px-6 border-r border-black flex items-center justify-between">
            <span className="text-neutral-500 hidden sm:inline">QUALITY CONTROL</span>
            <span className="font-bold">[TESTED: YES]</span>
          </div>
          <div className="p-3 md:px-6 flex items-center justify-between">
            <span className="text-neutral-500 hidden sm:inline">AVAILABILITY</span>
            <span className="font-bold text-signal">
              [ITEMS: {products.length > 0 ? 'ACTIVE' : 'STANDBY'}]
            </span>
          </div>
        </section>

        {/* 3. CATEGORY FILTER & DOT-MATRIX SEPARATOR */}
        <section className="border-b border-black flex flex-col sm:flex-row sm:items-center justify-between bg-canvas">
          <div className="flex border-b sm:border-b-0 border-black overflow-x-auto">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-4 font-mono text-xs font-bold border-r border-black uppercase tracking-wider transition-none ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-canvas text-black hover:bg-signal hover:text-white'
                  }`}
                >
                  {isActive ? `■ ${category}` : category}
                </button>
              );
            })}
          </div>
          <div className="h-6 sm:h-12 flex-1 bg-dot-matrix opacity-20 hidden md:block" />
          <div className="px-4 py-2 font-mono text-[11px] border-l border-black hidden sm:flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>SHOWING {filteredProducts.length} UNITS</span>
          </div>
        </section>

        {/* 4. PRODUCT INDEX GRID */}
        {loading ? (
          <section className="p-12 border-b border-black font-mono text-xs uppercase text-center">
            [INITIALIZING DATABASE QUERY...]
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="p-16 border-b border-black bg-surface flex flex-col items-center justify-center text-center">
            <div className="border border-black bg-canvas p-6 max-w-md w-full font-mono text-xs space-y-2">
              <div className="font-bold text-signal">[INDEX STATUS // 00 UNITS]</div>
              <p className="text-neutral-600">
                NO PRODUCTS CATALOGED IN THIS SECTOR YET. ADD RECORDS VIA SUPABASE TABLE EDITOR TO POPULATE THIS GRID.
              </p>
            </div>
          </section>
        ) : (
          <section
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-b border-black"
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
              const itemNumber = String(idx + 1).padStart(3, '0');

              return (
                <article
                  key={product.id}
                  className="product-card flex flex-col justify-between border-b md:border-r border-black bg-canvas relative group"
                >
                  <div>
                    <div className="px-4 py-3 border-b border-black flex items-center justify-between font-mono text-xs">
                      <span className="font-bold">ITEM // {itemNumber}</span>
                      <div className="flex items-center gap-2">
                        <span className="border border-black px-1.5 py-0.5 text-[10px]">
                          {product.category}
                        </span>
                        {discountPct > 0 && (
                          <span className="bg-signal text-white px-1.5 py-0.5 text-[10px] font-bold">
                            -{discountPct}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Crisp 4:3 Geometric Frame */}
                    <div className="aspect-[4/3] w-full border-b border-black bg-surface relative flex items-center justify-center p-6 overflow-hidden">
                      <span className="absolute top-2 left-2 font-mono text-[10px] leading-none">+</span>
                      <span className="absolute top-2 right-2 font-mono text-[10px] leading-none">+</span>
                      <span className="absolute bottom-2 left-2 font-mono text-[10px] leading-none">+</span>
                      <span className="absolute bottom-2 right-2 font-mono text-[10px] leading-none">+</span>

                      <GeometricGlyph index={idx} />

                      {product.spec_note && (
                        <div className="absolute bottom-3 left-4 font-mono text-[10px] bg-canvas border border-black px-2 py-0.5">
                          SPEC: {product.spec_note}
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h2 className="font-sans font-black text-xl leading-tight tracking-swiss uppercase">
                        {product.title}
                      </h2>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2">
                    <div className="border-t border-black pt-4 mb-4 flex items-baseline justify-between font-mono">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-500 uppercase">
                          VERIFIED DEAL ({currency.code})
                        </span>
                        <span className="text-2xl font-bold tracking-tight">
                          {formatPrice(Number(product.deal_price))}
                        </span>
                      </div>
                      {product.original_price && (
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-500 block uppercase">MSRP</span>
                          <span className="text-sm line-through text-neutral-400">
                            {formatPrice(Number(product.original_price))}
                          </span>
                        </div>
                      )}
                    </div>

                    <a
                      href={`/go/${product.slug}`}
                      className="btn-swiss w-full py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between border border-black"
                    >
                      <span>REDEEM DEAL</span>
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </a>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* 5. TECHNICAL COMPARISON TABLE */}
        <section className="bg-canvas">
          <div className="p-6 border-b border-black flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-signal font-bold block mb-1">
                [SECTION 02 // VERIFICATION MATRIX]
              </span>
              <h3 className="font-sans font-black text-2xl uppercase tracking-swiss">
                BENCHMARK &amp; SPECIFICATION LOG
              </h3>
            </div>
            <span className="font-mono text-xs border border-black px-2 py-1 hidden sm:inline">
              PROTOCOL: RANDOM-A11Y-AAA
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-black bg-surface uppercase">
                  <th className="py-3.5 px-4 border-r border-black">INDEX</th>
                  <th className="py-3.5 px-4 border-r border-black">UNIT DESIGNATION</th>
                  <th className="py-3.5 px-4 border-r border-black">PRIMARY TELEMETRY</th>
                  <th className="py-3.5 px-4 border-r border-black">SCORE</th>
                  <th className="py-3.5 px-4 text-right">OUTBOUND</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr className="border-b border-black">
                    <td colSpan={5} className="py-6 px-4 text-center text-neutral-500">
                      [AWAITING PRODUCT TELEMETRY DATA]
                    </td>
                  </tr>
                ) : (
                  products.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="border-b border-black hover:bg-surface"
                    >
                      <td className="py-3.5 px-4 border-r border-black font-bold">
                        [{String(idx + 1).padStart(2, '0')}]
                      </td>
                      <td className="py-3.5 px-4 border-r border-black font-sans font-bold uppercase">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-4 border-r border-black text-neutral-700">
                        <span className="inline-flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-signal stroke-[2.5]" />
                          {item.spec_note || 'VERIFIED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 border-r border-black font-bold">
                        {item.rating || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`/go/${item.slug}`}
                          className="inline-flex items-center gap-1 font-bold underline hover:text-signal"
                        >
                          <span>[{formatPrice(Number(item.deal_price))}]</span>
                          <span>↗</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* 6. STICKY BOTTOM BAR (MOBILE VIEWPORT - ONLY RENDERS WHEN PRODUCT EXISTS) */}
      {featuredDeal && (
        <div className="fixed bottom-0 left-0 right-0 z-50 h-12 bg-canvas border-t border-black flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center space-x-2 overflow-hidden pr-2">
            <span className="bg-signal text-white font-mono text-[10px] font-bold px-1.5 py-0.5 shrink-0">
              TOP PICK
            </span>
            <span className="font-sans font-bold text-xs truncate uppercase">
              {featuredDeal.title}
            </span>
          </div>
          <a
            href={`/go/${featuredDeal.slug}`}
            className="bg-signal text-white font-mono text-xs font-bold px-4 h-8 flex items-center shrink-0 border border-black"
          >
            GET DEAL ↗
          </a>
        </div>
      )}
    </div>
  );
}
