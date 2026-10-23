'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  ArrowUpRight,
  Search,
  ShoppingBag,
  Sparkles,
  SlidersHorizontal,
  Heart,
  Check,
  Play,
} from 'lucide-react';
import { supabase, type Product } from '@/lib/supabase';

/* Fashion & Atelier Geometric Motifs (shapes.gallery inspired - Zero Blurs) */
function AtelierFlowerSeal({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="currentColor">
      <path d="M60 4 L71 39 L102 18 L81 49 L116 60 L81 71 L102 102 L71 81 L60 116 L49 81 L18 102 L39 71 L4 60 L39 49 L18 18 L49 39 Z" />
    </svg>
  );
}

function FashionDiamondStar({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="currentColor">
      <polygon points="30,0 38,22 60,30 38,38 30,60 22,38 0,30 22,22" />
    </svg>
  );
}

function LookbookPlaceholderGraphic({ index }: { index: number }) {
  const motifs = [
    // 01: Editorial Archway & Sunburst
    <svg key="m1" viewBox="0 0 120 140" className="w-28 h-32 stroke-ink fill-none" strokeWidth="1.75">
      <path d="M24,124 L24,56 A36,36 0 0,1 96,56 L96,124 Z" className="fill-blush" />
      <circle cx="60" cy="56" r="14" className="fill-rouge stroke-ink" />
      <line x1="12" y1="124" x2="108" y2="124" />
    </svg>,
    // 02: Geometric Handbag / Silhouette Frame
    <svg key="m2" viewBox="0 0 120 140" className="w-28 h-32 stroke-ink fill-none" strokeWidth="1.75">
      <path d="M42,50 A18,18 0 0,1 78,50" strokeWidth="2.5" />
      <polygon points="26,50 94,50 104,118 16,118" className="fill-canvas stroke-ink" />
      <rect x="48" y="68" width="24" height="16" className="fill-rouge stroke-ink" />
    </svg>,
    // 03: Concentric Couture Star
    <svg key="m3" viewBox="0 0 120 140" className="w-28 h-32 stroke-ink fill-none" strokeWidth="1.75">
      <rect x="22" y="22" width="76" height="96" className="fill-blush" />
      <polygon points="60,34 69,58 94,68 69,78 60,102 51,78 26,68 51,58" className="fill-canvas stroke-ink" />
      <circle cx="60" cy="68" r="5" className="fill-rouge stroke-none" />
    </svg>,
  ];
  return motifs[index % motifs.length];
}

const DEFAULT_FASHION_CATEGORIES = [
  'ALL LOOKS',
  'DRESSES & SETS',
  'TOPS & KNITS',
  'FOOTWEAR',
  'BAGS & ACCS',
  'DENIM & SKIRTS',
];

export default function KripplingFindsFashionBoutique() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL LOOKS');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_LOW' | 'PRICE_HIGH'>('NEWEST');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const gridRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sealRef.current) {
      gsap.to(sealRef.current, {
        rotation: 360,
        duration: 24,
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

  // Format strictly in Philippine Peso (₱ PHP)
  const formatPhp = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Build fashion categories dynamically from DB or fallback to curated women's wear tabs
  const dynamicCategories = Array.from(
    new Set(products.map((p) => p.category?.toUpperCase()).filter(Boolean))
  );
  const categories =
    dynamicCategories.length > 0
      ? ['ALL LOOKS', ...dynamicCategories]
      : DEFAULT_FASHION_CATEGORIES;

  const filteredProducts = products
    .filter((p) => {
      const matchesCategory =
        activeCategory === 'ALL LOOKS' || p.category?.toUpperCase() === activeCategory;
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
    const cards = gridRef.current.querySelectorAll('.lookbook-card');
    gsap.killTweensOf(cards);
    gsap.fromTo(
      cards,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out',
      }
    );
  }, [activeCategory, searchQuery, sortBy, filteredProducts.length]);

  return (
    <div className="min-h-screen bg-canvas text-ink pb-16 selection:bg-rouge selection:text-canvas font-sans">
      {/* 1. RUNWAY TICKER RIBBON */}
      <div className="bg-ink text-canvas border-b border-ink overflow-hidden py-2 font-mono text-[11px] tracking-widest uppercase">
        <div className="animate-marquee flex items-center space-x-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-10 shrink-0">
              <span className="text-rouge">✦</span>
              <span>KRIPPLINGFINDS // WOMEN’S APPAREL, FOOTWEAR &amp; ACCESSORIES</span>
              <span className="text-blush">✦</span>
              <span>AS FEATURED ON @KRIPPLINGFINDS TIKTOK OOTD VIDEOS</span>
              <span className="text-rouge">✦</span>
              <span>ALL PRICES IN PHILIPPINE PESO (₱ PHP)</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. EDITORIAL BOUTIQUE HEADER */}
      <header className="sticky top-0 z-40 h-16 bg-canvas border-b border-ink px-4 md:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-rouge border border-ink flex items-center justify-center text-canvas shadow-editorial-sm">
            <FashionDiamondStar className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif text-2xl sm:text-3xl tracking-tight leading-none block">
              Krippling<span className="italic text-rouge">Finds</span>
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 font-mono text-[11px] uppercase tracking-wider text-ink/70">
          <span>WOMENSWEAR</span>
          <span>&bull;</span>
          <span>FOOTWEAR</span>
          <span>&bull;</span>
          <span>DAILY OOTD</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center border border-ink px-2.5 py-1 bg-blush font-mono text-[11px] font-bold">
            ₱ PHP
          </span>
          <a
            href="https://www.tiktok.com/@KripplingFinds"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-boutique px-3.5 py-2 border border-ink font-mono text-xs font-bold flex items-center gap-1.5 shadow-editorial-sm"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>@KripplingFinds</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto border-x border-ink">
        {/* 3. HIGH-FASHION EDITORIAL LOOKBOOK HERO */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-ink">
          {/* Left 8 Columns: Couture Editorial Headline + Search */}
          <div className="lg:col-span-8 p-6 sm:p-10 md:p-14 border-b lg:border-b-0 lg:border-r border-ink relative overflow-hidden flex flex-col justify-between bg-canvas">
            {/* Subtle Dot-Matrix Texture Accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-dot-matrix-soft opacity-60 pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-blush text-ink font-mono text-[11px] font-bold px-3 py-1 border border-ink mb-6 shadow-editorial-sm uppercase">
                <Sparkles className="w-3.5 h-3.5 text-rouge" />
                <span>CURATED TIKTOK LOOKBOOK &amp; SHOP</span>
              </div>

              <h1 className="font-serif text-5xl sm:text-7xl md:text-[5.25rem] leading-[0.94] tracking-editorial mb-6">
                Everyday Wardrobe,{' '}
                <span className="italic text-rouge font-normal">Statement Footwear</span> &amp;
                Viral OOTD Finds.
              </h1>

              <p className="font-sans text-sm sm:text-base text-ink/80 max-w-xl leading-relaxed mb-8">
                Seen an outfit, pair of heels, sneakers, or bag in our{' '}
                <strong className="font-bold text-ink">@KripplingFinds</strong> short videos? Browse
                the complete lookbook below and shop direct TikTok Shop links in{' '}
                <strong className="font-mono text-xs bg-blush px-1.5 py-0.5 border border-ink">
                  ₱ PHP
                </strong>
                .
              </p>
            </div>

            {/* Boutique Search Bar */}
            <div className="w-full relative z-10">
              <label className="font-mono text-[11px] font-bold uppercase tracking-wider block mb-2">
                FIND AN ITEM FROM A VIDEO (E.G. &ldquo;MARY JANES&rdquo;, &ldquo;LINEN DRESS&rdquo;, &ldquo;LOOK #01&rdquo;):
              </label>
              <div className="flex items-stretch border border-ink bg-canvas shadow-editorial">
                <div className="px-4 flex items-center justify-center bg-blush border-r border-ink">
                  <Search className="w-4 h-4 text-ink" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clothing, shoes, bags, or look number..."
                  className="w-full px-4 py-3.5 bg-transparent font-sans text-sm focus:outline-none placeholder:text-ink/40"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 font-mono text-xs font-bold bg-ink text-canvas hover:bg-rouge"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Atelier Lookbook Card & Rotating Seal */}
          <div className="lg:col-span-4 bg-blush p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden bg-dot-matrix-rouge">
            {/* Rotating Geometric Flower Seal */}
            <div
              ref={sealRef}
              className="absolute -right-8 -top-8 text-rouge pointer-events-none"
            >
              <AtelierFlowerSeal className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex items-center justify-between border-b border-ink pb-4 mb-6">
              <div className="font-mono text-[11px] font-bold uppercase">
                <span className="bg-rouge text-canvas px-2 py-0.5 border border-ink inline-block mb-1">
                  SEASONAL EDIT
                </span>
                <span className="block text-ink">@KRIPPLINGFINDS CLOSET</span>
              </div>
              <div className="w-10 h-10 bg-canvas text-ink border border-ink flex items-center justify-center font-serif italic text-xl shadow-editorial-sm">
                KF
              </div>
            </div>

            {/* 9:16 OOTD Shopping Guide Card */}
            <div className="relative z-10 bg-canvas border border-ink p-6 shadow-editorial my-auto">
              <div className="flex items-center justify-between border-b border-ink pb-3 mb-4">
                <span className="font-serif italic text-2xl text-rouge">
                  How to Shop the Look
                </span>
                <span className="font-mono text-[10px] font-bold bg-ink text-canvas px-2 py-0.5">
                  OOTD GUIDE
                </span>
              </div>

              <ol className="space-y-3.5 text-xs">
                <li className="flex items-start gap-3">
                  <span className="font-mono bg-rouge text-canvas font-bold px-2 py-0.5 text-[10px] border border-ink shrink-0">
                    01
                  </span>
                  <span className="leading-relaxed">
                    Spot an outfit, dress, or pair of shoes on{' '}
                    <strong>@KripplingFinds</strong> TikTok.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-mono bg-blush text-ink font-bold px-2 py-0.5 text-[10px] border border-ink shrink-0">
                    02
                  </span>
                  <span className="leading-relaxed">
                    Match the <strong>Look #</strong> or filter by Clothing, Footwear, or Bags below.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-mono bg-ink text-canvas font-bold px-2 py-0.5 text-[10px] border border-ink shrink-0">
                    03
                  </span>
                  <span className="leading-relaxed">
                    Tap <strong>SHOP THIS PIECE</strong> to checkout directly on TikTok Shop in{' '}
                    <strong>₱ PHP</strong>.
                  </span>
                </li>
              </ol>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-ink flex items-center justify-between font-mono text-[11px] font-bold">
              <span>CURATED FOR HER</span>
              <span className="text-rouge">✦ DIRECT TIKTOK LINKS</span>
            </div>
          </div>
        </section>

        {/* 4. WARDROBE CATEGORY TABS & SORT BAR */}
        <section className="border-b border-ink bg-surface flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex overflow-x-auto border-b md:border-b-0 border-ink">
            {categories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-4 font-mono text-xs font-bold border-r border-ink uppercase whitespace-nowrap transition-none flex items-center gap-2 ${
                    isActive
                      ? 'bg-rouge text-canvas'
                      : 'bg-canvas text-ink hover:bg-blush'
                  }`}
                >
                  {isActive && <span>✦</span>}
                  <span>{category}</span>
                </button>
              );
            })}
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between md:justify-end gap-3 font-mono text-xs bg-canvas md:border-l border-ink">
            <span className="flex items-center gap-1.5 text-ink/70 font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              SORT BY:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-surface border border-ink px-2.5 py-1 font-mono text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="NEWEST">NEWEST ARRIVALS</option>
              <option value="PRICE_LOW">PRICE: LOW TO HIGH (₱)</option>
              <option value="PRICE_HIGH">PRICE: HIGH TO LOW (₱)</option>
            </select>
          </div>
        </section>

        {/* 5. LOOKBOOK PRODUCT GRID (PORTRAIT 3:4 FASHION ASPECT RATIO) */}
        {loading ? (
          <section className="p-20 font-mono text-xs font-bold uppercase text-center bg-canvas">
            LOADING @KRIPPLINGFINDS WARDROBE...
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="p-12 sm:p-20 bg-dot-matrix-soft border-b border-ink flex flex-col items-center justify-center text-center">
            <div className="border border-ink bg-canvas p-8 max-w-md w-full shadow-editorial space-y-4">
              <div className="w-12 h-12 bg-blush text-rouge border border-ink mx-auto flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="font-serif italic text-3xl text-ink">
                {products.length === 0 ? 'New Collection Dropping Soon' : 'No Matching Pieces Found'}
              </div>
              <p className="font-sans text-xs text-ink/70 leading-relaxed">
                {products.length === 0
                  ? 'Add your clothing, footwear, and accessory finds in your Supabase products table (with PHP prices) to populate the lookbook.'
                  : `We couldn't find any pieces matching "${searchQuery}". Try another keyword or select "ALL LOOKS".`}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('ALL LOOKS');
                  }}
                  className="btn-boutique px-5 py-2.5 font-mono text-xs font-bold uppercase border border-ink inline-block"
                >
                  VIEW ALL LOOKS
                </button>
              )}
            </div>
          </section>
        ) : (
          <section
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-b border-ink bg-canvas"
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
              const lookNumber = String(idx + 1).padStart(2, '0');

              return (
                <article
                  key={product.id}
                  className="lookbook-card flex flex-col justify-between border-b sm:border-r border-ink bg-canvas group"
                >
                  <div>
                    {/* Editorial Card Header */}
                    <div className="px-4 py-3 border-b border-ink flex items-center justify-between font-mono text-xs bg-surface">
                      <span className="font-bold tracking-wider">LOOK #{lookNumber}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="border border-ink bg-canvas px-2 py-0.5 text-[10px] font-bold uppercase">
                          {product.category}
                        </span>
                        {discountPct > 0 && (
                          <span className="bg-rouge text-canvas border border-ink px-2 py-0.5 text-[10px] font-bold">
                            -{discountPct}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Portrait 4:5 Fashion Frame */}
                    <div className="aspect-[4/5] w-full border-b border-ink bg-surface relative flex items-center justify-center overflow-hidden p-5">
                      {product.is_featured && (
                        <div className="absolute top-3 left-3 z-10 bg-rouge text-canvas border border-ink px-2.5 py-1 font-mono text-[10px] font-bold uppercase shadow-editorial-sm">
                          ✦ MUST-HAVE FIND
                        </div>
                      )}

                      {product.rating && (
                        <div className="absolute top-3 right-3 z-10 bg-canvas text-ink border border-ink px-2 py-0.5 font-mono text-[10px] font-bold">
                          ★ {product.rating}
                        </div>
                      )}

                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover border border-ink bg-canvas"
                        />
                      ) : (
                        <div className="w-full h-full border border-ink bg-canvas flex flex-col items-center justify-center p-6 shadow-editorial">
                          <LookbookPlaceholderGraphic index={idx} />
                          <span className="font-serif italic text-base text-ink/70 mt-3">
                            KripplingFinds Atelier
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Piece Title & Styling Note */}
                    <div className="p-5 pb-3">
                      <h2 className="font-serif text-2xl leading-snug text-ink group-hover:text-rouge">
                        {product.title}
                      </h2>
                      {product.spec_note && (
                        <p className="font-sans text-xs text-ink/70 mt-1.5 leading-relaxed">
                          {product.spec_note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* PHP Price Tag & Shop Button */}
                  <div className="p-5 pt-2">
                    <div className="bg-blush/50 border border-ink p-3 mb-3 flex items-baseline justify-between font-mono">
                      <div>
                        <span className="text-[10px] text-ink/60 block uppercase font-bold">
                          TIKTOK SHOP PRICE
                        </span>
                        <span className="text-2xl font-bold text-ink">
                          {formatPhp(Number(product.deal_price))}
                        </span>
                      </div>
                      {product.original_price && (
                        <div className="text-right">
                          <span className="text-[10px] text-ink/60 block uppercase">
                            REGULAR
                          </span>
                          <span className="text-xs line-through text-ink/40">
                            {formatPhp(Number(product.original_price))}
                          </span>
                        </div>
                      )}
                    </div>

                    <a
                      href={`/go/${product.slug}`}
                      className="btn-boutique w-full py-3.5 px-4 font-mono text-xs font-bold uppercase flex items-center justify-between border border-ink shadow-editorial"
                    >
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        <span>SHOP THIS PIECE</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </a>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* 6. BOUTIQUE EDITORIAL HIGHLIGHTS */}
        <section className="grid grid-cols-1 md:grid-cols-3 border-b border-ink bg-canvas">
          <div className="p-6 border-b md:border-b-0 md:border-r border-ink flex items-start gap-3.5">
            <div className="w-9 h-9 bg-blush text-rouge border border-ink flex items-center justify-center shrink-0 shadow-editorial-sm">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-serif italic text-xl text-ink mb-1">
                Curated Women’s Fits &amp; Footwear
              </h3>
              <p className="text-ink/70 text-xs leading-relaxed">
                From flattering dresses and everyday basics to comfy heels, sandals, and sneakers tested in our short videos.
              </p>
            </div>
          </div>

          <div className="p-6 border-b md:border-b-0 md:border-r border-ink flex items-start gap-3.5">
            <div className="w-9 h-9 bg-rouge text-canvas border border-ink flex items-center justify-center shrink-0 font-mono text-xs font-bold shadow-editorial-sm">
              ₱
            </div>
            <div>
              <h3 className="font-serif italic text-xl text-ink mb-1">
                Direct Philippine Peso (₱) Pricing
              </h3>
              <p className="text-ink/70 text-xs leading-relaxed">
                No confusing currency conversions—every price is listed directly in ₱ PHP to match your TikTok Shop checkout.
              </p>
            </div>
          </div>

          <div className="p-6 flex items-start gap-3.5">
            <div className="w-9 h-9 bg-ink text-canvas border border-ink flex items-center justify-center shrink-0 shadow-editorial-sm">
              <Check className="w-4 h-4 text-blush stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-serif italic text-xl text-ink mb-1">
                Instant One-Tap Links
              </h3>
              <p className="text-ink/70 text-xs leading-relaxed">
                Skip digging through video comments—tap any piece to jump straight to the verified product page.
              </p>
            </div>
          </div>
        </section>

        {/* 7. BRANDED ATELIER FOOTER */}
        <footer className="p-8 md:px-12 bg-ink text-canvas flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FashionDiamondStar className="w-5 h-5 text-rouge" />
            <span className="font-serif text-2xl tracking-tight">
              Krippling<span className="italic text-blush">Finds</span>
            </span>
            <span className="font-mono text-xs text-canvas/60">// @KripplingFinds</span>
          </div>
          <div className="font-mono text-[11px] text-canvas/60 text-center sm:text-right uppercase">
            WOMEN’S CLOTHING, FOOTWEAR &amp; ACCESSORIES DIRECTORY &bull; ₱ PHP
          </div>
        </footer>
      </main>

      {/* 8. STICKY BOTTOM BAR (MOBILE VIEWPORT - ONLY RENDERS WHEN PRODUCT EXISTS) */}
      {featuredDeal && (
        <div className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-canvas border-t border-ink flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center space-x-2 overflow-hidden pr-2">
            <span className="bg-rouge text-canvas font-mono text-[10px] font-bold px-2 py-0.5 border border-ink shrink-0">
              FEATURED FIT
            </span>
            <span className="font-serif italic text-base truncate">
              {featuredDeal.title}
            </span>
          </div>
          <a
            href={`/go/${featuredDeal.slug}`}
            className="btn-boutique font-mono text-xs font-bold px-4 h-9 flex items-center shrink-0 border border-ink shadow-editorial-sm"
          >
            SHOP ₱{Number(featuredDeal.deal_price).toLocaleString('en-PH')} ↗
          </a>
        </div>
      )}
    </div>
  );
}
