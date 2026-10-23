'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  ArrowUpRight,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Heart,
  Check,
  Play,
} from 'lucide-react';
import { supabase, type Product } from '@/lib/supabase';

/* Delicate Editorial Vector Motifs (shapes.gallery inspired - Clean, non-brutalist) */
function EditorialStar({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="currentColor">
      <path d="M30 0 C32 22 38 28 60 30 C38 32 32 38 30 60 C28 38 22 32 0 30 C22 28 28 22 30 0 Z" />
    </svg>
  );
}

function LookbookSilhouette({ index }: { index: number }) {
  const motifs = [
    // 01: Minimalist Arch & Botanical Stem
    <svg key="m1" viewBox="0 0 120 150" className="w-24 h-32 stroke-ink/40 fill-none" strokeWidth="1">
      <path d="M25,130 L25,60 A35,35 0 0,1 95,60 L95,130 Z" className="fill-surface" />
      <circle cx="60" cy="58" r="14" className="fill-blush stroke-rouge/50" />
      <line x1="60" y1="72" x2="60" y2="115" className="stroke-ink/40" />
    </svg>,
    // 02: Chic Handbag Outline
    <svg key="m2" viewBox="0 0 120 150" className="w-24 h-32 stroke-ink/40 fill-none" strokeWidth="1">
      <path d="M44,56 A16,16 0 0,1 76,56" strokeWidth="1.25" />
      <polygon points="30,56 90,56 98,116 22,116" className="fill-surface" />
      <circle cx="60" cy="76" r="4" className="fill-rouge stroke-none" />
    </svg>,
    // 03: Delicate Editorial Frame
    <svg key="m3" viewBox="0 0 120 150" className="w-24 h-32 stroke-ink/40 fill-none" strokeWidth="1">
      <rect x="24" y="24" width="72" height="102" rx="36" className="fill-surface" />
      <path d="M60 50 C62 66 68 72 84 75 C68 78 62 84 60 100 C58 84 52 78 36 75 C52 72 58 66 60 50 Z" className="fill-blush stroke-rouge/40" />
    </svg>,
  ];
  return motifs[index % motifs.length];
}

const DEFAULT_FASHION_CATEGORIES = [
  'All Looks',
  'Dresses & Sets',
  'Tops & Knits',
  'Footwear',
  'Bags & Accs',
  'Denim & Skirts',
];

export default function KripplingFindsBoutique() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL LOOKS');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_LOW' | 'PRICE_HIGH'>('NEWEST');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    new Set(products.map((p) => p.category?.trim()).filter(Boolean))
  );
  const categories =
    dynamicCategories.length > 0
      ? ['All Looks', ...dynamicCategories]
      : DEFAULT_FASHION_CATEGORIES;

  const filteredProducts = products
    .filter((p) => {
      const matchesCategory =
        activeCategory === 'ALL LOOKS' ||
        p.category?.toUpperCase() === activeCategory;
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
      { y: 16, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
      }
    );
  }, [activeCategory, searchQuery, sortBy, filteredProducts.length]);

  return (
    <div className="min-h-screen bg-canvas text-ink pb-20 selection:bg-rouge selection:text-canvas font-sans">
      {/* 1. SUBTLE TOP ANNOUNCEMENT BAR */}
      <div className="bg-surface text-ink border-b border-line py-2.5 px-4 text-center text-xs tracking-wide">
        <span className="inline-flex items-center gap-2 font-medium">
          <EditorialStar className="w-3 h-3 text-rouge" />
          <span>
            Curated Women’s Clothing, Footwear &amp; OOTD Finds from{' '}
            <strong className="font-semibold">@KripplingFinds</strong> on TikTok &bull; All Prices in{' '}
            <strong className="font-semibold">₱ PHP</strong>
          </span>
          <EditorialStar className="w-3 h-3 text-rouge" />
        </span>
      </div>

      {/* 2. CHIC BOUTIQUE HEADER */}
      <header className="sticky top-0 z-40 h-20 bg-canvas/95 border-b border-line px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-3xl sm:text-4xl tracking-tight text-ink">
            Krippling<span className="italic text-rouge">Finds</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-widest text-muted">
          <span>Womenswear</span>
          <span>Footwear</span>
          <span>Bags &amp; Accessories</span>
          <span>TikTok Edit</span>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full bg-surface border border-line text-xs font-medium text-ink">
            ₱ PHP
          </span>
          <a
            href="https://www.tiktok.com/@KripplingFinds"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-atelier px-4 py-2.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-2"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>@KripplingFinds</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12">
        {/* 3. SOFT EDITORIAL HERO & SEARCH */}
        <section className="py-12 md:py-16 border-b border-line grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left 7 Columns: Editorial Headline & Search */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blush text-rouge text-xs font-medium tracking-wide">
              <EditorialStar className="w-3 h-3" />
              <span>Official TikTok OOTD &amp; Shopping Directory</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.02] tracking-editorial text-ink">
              Effortless Wardrobe,{' '}
              <span className="italic text-rouge font-normal">Statement Footwear</span> &amp;
              Everyday Finds.
            </h1>

            <p className="text-muted text-sm sm:text-base max-w-xl leading-relaxed">
              Loved an outfit, pair of heels, sandals, or bag from our{' '}
              <strong className="text-ink font-medium">@KripplingFinds</strong> short videos?
              Browse the curated lookbook below and shop directly on TikTok Shop in Philippine Peso (₱).
            </p>

            {/* Clean Boutique Search Bar */}
            <div className="pt-2 max-w-xl">
              <div className="flex items-center rounded-full border border-line bg-white px-4 py-1.5 focus-within:border-ink">
                <Search className="w-4 h-4 text-muted mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dresses, tops, shoes, bags, or look number..."
                  className="w-full py-2 bg-transparent text-sm text-ink focus:outline-none placeholder:text-muted/70"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-medium text-muted hover:text-ink px-2"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Soft Archway Editorial Card */}
          <div className="lg:col-span-5">
            <div className="bg-surface border border-line rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-rouge block">
                    The Closet Edit
                  </span>
                  <span className="font-serif text-2xl text-ink">
                    How to Shop Our Videos
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-blush text-rouge flex items-center justify-center font-serif italic text-lg">
                  KF
                </div>
              </div>

              <ol className="space-y-4 text-sm text-ink/80">
                <li className="flex items-start gap-3.5">
                  <span className="w-6 h-6 rounded-full bg-white border border-line text-xs font-semibold flex items-center justify-center shrink-0 text-rouge">
                    1
                  </span>
                  <span className="leading-relaxed">
                    Spot a dress, top, or pair of shoes in a{' '}
                    <strong className="text-ink font-medium">@KripplingFinds</strong> short video.
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="w-6 h-6 rounded-full bg-white border border-line text-xs font-semibold flex items-center justify-center shrink-0 text-rouge">
                    2
                  </span>
                  <span className="leading-relaxed">
                    Search the item name above or filter by category (Clothing, Footwear, Bags).
                  </span>
                </li>
                <li className="flex items-start gap-3.5">
                  <span className="w-6 h-6 rounded-full bg-white border border-line text-xs font-semibold flex items-center justify-center shrink-0 text-rouge">
                    3
                  </span>
                  <span className="leading-relaxed">
                    Tap <strong className="text-ink font-medium">Shop This Piece</strong> to open the verified listing in <strong className="text-ink font-medium">₱ PHP</strong>.
                  </span>
                </li>
              </ol>

              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-xs text-muted">
                <span>Updated with every TikTok post</span>
                <span className="text-rouge font-medium">100% Direct Links</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SOFT PILL CATEGORY NAVIGATION & SORT BAR */}
        <section className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {categories.map((category) => {
              const isActive = activeCategory === category.toUpperCase();
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category.toUpperCase())}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-ink text-canvas'
                      : 'bg-surface text-ink/80 hover:bg-blush hover:text-rouge border border-line'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2.5 text-xs">
            <span className="flex items-center gap-1.5 text-muted font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-white border border-line rounded-full px-3.5 py-1.5 text-xs font-medium text-ink focus:outline-none cursor-pointer"
            >
              <option value="NEWEST">Newest Arrivals</option>
              <option value="PRICE_LOW">Price: Low to High (₱)</option>
              <option value="PRICE_HIGH">Price: High to Low (₱)</option>
            </select>
          </div>
        </section>

        {/* 5. LOOKBOOK PRODUCT GRID */}
        {loading ? (
          <section className="py-24 text-center text-sm text-muted">
            Loading @KripplingFinds lookbook...
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="py-20 flex flex-col items-center justify-center text-center">
            <div className="bg-surface border border-line rounded-2xl p-10 max-w-md w-full space-y-3">
              <div className="w-11 h-11 rounded-full bg-blush text-rouge mx-auto flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-3xl text-ink">
                {products.length === 0 ? 'New Collection Coming Soon' : 'No Matching Pieces'}
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                {products.length === 0
                  ? 'Add your clothing, footwear, and accessory finds in your Supabase products table (with PHP prices) to display them in your boutique.'
                  : `We couldn't find any items matching "${searchQuery}". Try clearing your search or choosing another category.`}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('ALL LOOKS');
                  }}
                  className="btn-atelier px-5 py-2.5 rounded-full text-xs font-medium inline-block mt-2"
                >
                  View All Looks
                </button>
              )}
            </div>
          </section>
        ) : (
          <section
            ref={gridRef}
            className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
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
                  className="lookbook-card flex flex-col justify-between bg-white border border-line rounded-xl overflow-hidden group"
                >
                  <div>
                    {/* Portrait 4:5 Fashion Image Container */}
                    <div className="aspect-[4/5] w-full bg-surface relative flex items-center justify-center overflow-hidden border-b border-line">
                      {/* Look Number Pill */}
                      <span className="absolute top-3 left-3 z-10 bg-white/95 border border-line px-2.5 py-1 rounded-full text-[11px] font-medium text-ink">
                        Look #{lookNumber}
                      </span>

                      {/* Discount or Featured Badge */}
                      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
                        {discountPct > 0 && (
                          <span className="bg-rouge text-white px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                            -{discountPct}%
                          </span>
                        )}
                        {product.is_featured && (
                          <span className="bg-blush text-rouge border border-rouge/20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                            Featured Fit
                          </span>
                        )}
                      </div>

                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                          <LookbookSilhouette index={idx} />
                          <span className="font-serif italic text-sm text-muted mt-2">
                            KripplingFinds Edit
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 pb-2">
                      <div className="flex items-center justify-between text-[11px] text-muted uppercase tracking-wider mb-1">
                        <span>{product.category}</span>
                        {product.rating && <span>★ {product.rating}</span>}
                      </div>
                      <h2 className="font-serif text-2xl leading-snug text-ink group-hover:text-rouge transition-colors">
                        {product.title}
                      </h2>
                      {product.spec_note && (
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                          {product.spec_note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="p-4 pt-3">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold text-ink">
                        {formatPhp(Number(product.deal_price))}
                      </span>
                      {product.original_price && (
                        <span className="text-xs line-through text-muted">
                          {formatPhp(Number(product.original_price))}
                        </span>
                      )}
                    </div>

                    <a
                      href={`/go/${product.slug}`}
                      className="btn-atelier w-full py-2.5 px-4 rounded-lg text-xs font-medium flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Shop This Piece</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* 6. BOUTIQUE TRUST HIGHLIGHTS */}
        <section className="py-12 border-t border-line grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blush text-rouge flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-ink mb-1">
                Curated Women’s Fits &amp; Footwear
              </h3>
              <p className="text-muted text-xs leading-relaxed">
                Hand-picked dresses, tops, flattering basics, sandals, heels, and bags styled in our short-form videos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-surface border border-line text-ink flex items-center justify-center shrink-0 font-serif text-base">
              ₱
            </div>
            <div>
              <h3 className="font-serif text-xl text-ink mb-1">
                Direct Philippine Peso (₱) Pricing
              </h3>
              <p className="text-muted text-xs leading-relaxed">
                All pieces are listed in ₱ PHP to match your local TikTok Shop checkout without guesswork.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-surface border border-line text-rouge flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-ink mb-1">
                Instant One-Tap Shopping
              </h3>
              <p className="text-muted text-xs leading-relaxed">
                Skip searching through video comments—tap any look to open the verified store link immediately.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 7. CLEAN BOUTIQUE FOOTER */}
      <footer className="border-t border-line bg-surface py-10 px-6 md:px-12 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <EditorialStar className="w-4 h-4 text-rouge" />
            <span className="font-serif text-2xl text-ink">
              Krippling<span className="italic text-rouge">Finds</span>
            </span>
            <span className="text-xs text-muted">&bull; @KripplingFinds</span>
          </div>
          <div className="text-xs text-muted text-center sm:text-right">
            Women’s Clothing, Footwear &amp; OOTD Directory &bull; Prices in ₱ PHP
          </div>
        </div>
      </footer>

      {/* 8. STICKY BOTTOM BAR (MOBILE VIEWPORT - ONLY RENDERS WHEN PRODUCT EXISTS) */}
      {featuredDeal && (
        <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/95 border-t border-line flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center space-x-2.5 overflow-hidden pr-2">
            <span className="bg-blush text-rouge text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0">
              Featured
            </span>
            <span className="font-serif text-lg truncate text-ink">
              {featuredDeal.title}
            </span>
          </div>
          <a
            href={`/go/${featuredDeal.slug}`}
            className="btn-atelier text-xs font-medium px-4 py-2 rounded-full flex items-center shrink-0"
          >
            Shop ₱{Number(featuredDeal.deal_price).toLocaleString('en-PH')} ↗
          </a>
        </div>
      )}
    </div>
  );
}
