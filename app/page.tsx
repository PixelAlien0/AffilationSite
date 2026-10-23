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
  Sparkles,
  X,
} from 'lucide-react';
import { supabase, type Product } from '@/lib/supabase';

/* Material 3 Expressive Shapes (Clover, Arch, Pill, Scallop) */
function M3ExpressivePlaceholder({ index }: { index: number }) {
  const shapes = [
    // M3 Arch Shape
    <svg key="m3-1" viewBox="0 0 120 140" className="w-24 h-28" fill="none">
      <path d="M24,124 L24,56 A36,36 0 0,1 96,56 L96,124 Z" fill="#FFD9E0" />
      <circle cx="60" cy="56" r="16" fill="#9C3B56" />
    </svg>,
    // M3 4-Leaf Cookie / Clover Shape
    <svg key="m3-2" viewBox="0 0 120 120" className="w-24 h-24" fill="none">
      <circle cx="42" cy="42" r="24" fill="#FFD9E0" />
      <circle cx="78" cy="42" r="24" fill="#FFD9E0" />
      <circle cx="42" cy="78" r="24" fill="#FFD9E0" />
      <circle cx="78" cy="78" r="24" fill="#FFD9E0" />
      <circle cx="60" cy="60" r="14" fill="#9C3B56" />
    </svg>,
    // M3 Pill Stadium + Star
    <svg key="m3-3" viewBox="0 0 120 140" className="w-24 h-28" fill="none">
      <rect x="26" y="18" width="68" height="104" rx="34" fill="#FFDCC4" />
      <path
        d="M60 44 C62 62 68 68 86 70 C68 72 62 78 60 96 C58 78 52 72 34 70 C52 68 58 62 60 44 Z"
        fill="#9C3B56"
      />
    </svg>,
  ];
  return shapes[index % shapes.length];
}

const DEFAULT_FASHION_CATEGORIES = [
  'All Looks',
  'Dresses & Sets',
  'Tops & Knits',
  'Footwear',
  'Bags & Accs',
  'Denim & Skirts',
];

export default function KripplingFindsM3Storefront() {
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

  // M3 Standard Decelerate Motion (cubic-bezier(0, 0, 0, 1))
  useEffect(() => {
    if (!gridRef.current || filteredProducts.length === 0) return;
    const cards = gridRef.current.querySelectorAll('.m3-card');
    gsap.killTweensOf(cards);
    gsap.fromTo(
      cards,
      { y: 18, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power3.out',
      }
    );
  }, [activeCategory, searchQuery, sortBy, filteredProducts.length]);

  return (
    <div
      className={`min-h-screen flex flex-col bg-md-background text-md-on-background selection:bg-md-primary-container selection:text-md-on-primary-container font-sans ${
        featuredDeal ? 'pb-20 md:pb-0' : ''
      }`}
    >
      {/* 1. MATERIAL 3 TOP APP BAR */}
      <header className="sticky top-0 z-40 h-16 bg-md-surface-low border-b border-md-outline-variant/50 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-m3-md bg-md-primary-container text-md-on-primary-container flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-2xl sm:text-3xl tracking-tight text-md-on-surface block leading-none">
              Krippling<span className="italic text-md-primary">Finds</span>
            </span>
            <span className="text-[11px] font-medium text-md-on-surface-variant block">
              Women’s Clothing, Footwear &amp; OOTD
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* M3 Assist Chip for Currency */}
          <span className="hidden sm:inline-flex items-center h-8 px-3 rounded-m3-sm bg-md-secondary-container text-md-on-secondary-container text-xs font-semibold">
            ₱ PHP
          </span>

          {/* M3 Filled Tonal Button */}
          <a
            href="https://www.tiktok.com/@KripplingFinds"
            target="_blank"
            rel="noopener noreferrer"
            className="m3-filled-button h-10 px-5 text-xs font-semibold flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>@KripplingFinds</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* 2. MATERIAL 3 HERO CONTAINER (28px Extra-Large Radius) */}
        <section className="rounded-m3-xl bg-md-surface-low border border-md-outline-variant/60 p-6 sm:p-10 md:p-12 mb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left 7 Columns: Headline & M3 Search Bar */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 h-8 px-3.5 rounded-m3-sm bg-md-primary-container text-md-on-primary-container text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-md-primary" />
              <span>As Featured on @KripplingFinds Short Videos</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl md:text-[4.25rem] leading-[1.02] text-md-on-surface">
              Curated Wardrobe,{' '}
              <span className="italic text-md-primary font-normal">Statement Footwear</span> &amp;
              Daily Fits.
            </h1>

            <p className="text-md-on-surface-variant text-sm sm:text-base max-w-xl leading-relaxed">
              Seen an outfit, pair of heels, sandals, or bag in our{' '}
              <strong className="text-md-on-surface font-semibold">@KripplingFinds</strong> TikTok
              videos? Find the exact piece below and shop directly in Philippine Peso (₱ PHP).
            </p>

            {/* Material 3 Search Bar Component (56px height, full pill radius) */}
            <div className="pt-2 max-w-xl">
              <div className="h-14 rounded-full bg-md-surface-high border border-md-outline-variant focus-within:border-md-primary focus-within:bg-white px-5 flex items-center gap-3 transition-colors">
                <Search className="w-5 h-5 text-md-on-surface-variant shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dresses, tops, footwear, bags, or Look #..."
                  className="w-full bg-transparent text-sm text-md-on-surface focus:outline-none placeholder:text-md-on-surface-variant/75"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="w-8 h-8 rounded-full hover:bg-md-secondary-container flex items-center justify-center text-md-on-surface-variant"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: M3 Tonal Surface Card */}
          <div className="lg:col-span-5">
            <div className="rounded-m3-xl bg-md-primary-container/65 border border-md-outline-variant/60 p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-md-on-primary-container/10">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-md-primary block">
                    Quick Guide
                  </span>
                  <h2 className="font-serif text-2xl text-md-on-primary-container">
                    How to Shop Our TikToks
                  </h2>
                </div>
                <div className="w-11 h-11 rounded-m3-lg bg-md-primary text-md-on-primary flex items-center justify-center font-serif italic text-xl">
                  KF
                </div>
              </div>

              <ol className="space-y-3.5 text-sm text-md-on-primary-container">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-md-primary text-md-on-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span className="leading-relaxed">
                    Watch a short outfit or footwear review on{' '}
                    <strong>@KripplingFinds</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-md-primary text-md-on-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span className="leading-relaxed">
                    Use the search bar or filter chips below to match the{' '}
                    <strong>Look #</strong> or category.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-md-primary text-md-on-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span className="leading-relaxed">
                    Tap <strong>Shop Now</strong> to open the verified listing in{' '}
                    <strong>₱ PHP</strong>.
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* 3. MATERIAL 3 FILTER CHIPS BAR (8px radius chips with checkmark state) */}
        <section className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {categories.map((category) => {
              const isSelected = activeCategory === category.toUpperCase();
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category.toUpperCase())}
                  className={`h-9 px-4 rounded-m3-sm text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                    isSelected
                      ? 'bg-md-secondary-container text-md-on-secondary-container border border-md-primary/30'
                      : 'bg-transparent text-md-on-surface-variant border border-md-outline-variant hover:bg-md-surface-high'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-md-primary stroke-[2.5]" />}
                  <span>{category}</span>
                </button>
              );
            })}
          </div>

          {/* M3 Outlined Sort Menu */}
          <div className="flex items-center justify-between md:justify-end gap-2.5 text-xs">
            <span className="flex items-center gap-1.5 text-md-on-surface-variant font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-9 bg-md-surface-low border border-md-outline-variant rounded-m3-sm px-3 text-xs font-semibold text-md-on-surface focus:outline-none focus:border-md-primary cursor-pointer"
            >
              <option value="NEWEST">Newest Drops</option>
              <option value="PRICE_LOW">Price: Low to High (₱)</option>
              <option value="PRICE_HIGH">Price: High to Low (₱)</option>
            </select>
          </div>
        </section>

        {/* 4. MATERIAL 3 FILLED & OUTLINED PRODUCT CARDS GRID */}
        {loading ? (
          <section className="py-24 text-center text-sm font-medium text-md-on-surface-variant">
            Loading @KripplingFinds collection...
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="py-16 flex flex-col items-center justify-center text-center">
            <div className="rounded-m3-xl bg-md-surface-low border border-md-outline-variant/60 p-10 max-w-md w-full space-y-3">
              <div className="w-12 h-12 rounded-m3-lg bg-md-primary-container text-md-primary mx-auto flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-3xl text-md-on-surface">
                {products.length === 0 ? 'New Collection Coming Soon' : 'No Matching Pieces'}
              </h2>
              <p className="text-xs text-md-on-surface-variant leading-relaxed">
                {products.length === 0
                  ? 'Add your clothing, footwear, and accessory finds in your Supabase products table (with PHP prices) to display them here.'
                  : `No items matched "${searchQuery}". Try clearing your search or selecting another category chip.`}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('ALL LOOKS');
                  }}
                  className="m3-tonal-button h-10 px-6 text-xs font-semibold inline-flex items-center mt-2"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </section>
        ) : (
          <section
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 mb-14"
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
                  className="m3-card flex flex-col justify-between rounded-m3-lg bg-md-surface-low hover:bg-md-surface-high border border-md-outline-variant/60 overflow-hidden transition-colors group"
                >
                  <div>
                    {/* Portrait 4:5 Fashion Container */}
                    <div className="aspect-[4/5] w-full bg-white relative flex items-center justify-center overflow-hidden">
                      {/* M3 Assist Chip: Look Number */}
                      <span className="absolute top-3 left-3 z-10 h-7 px-3 rounded-m3-sm bg-md-surface-low/95 border border-md-outline-variant/60 text-[11px] font-semibold text-md-on-surface flex items-center">
                        Look #{lookNumber}
                      </span>

                      {/* M3 Badges */}
                      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
                        {discountPct > 0 && (
                          <span className="h-6 px-2.5 rounded-m3-sm bg-md-primary text-md-on-primary text-[11px] font-semibold flex items-center">
                            Save {discountPct}%
                          </span>
                        )}
                        {product.is_featured && (
                          <span className="h-6 px-2.5 rounded-m3-sm bg-md-tertiary-container text-md-on-tertiary-container text-[10px] font-bold flex items-center">
                             Viral Pick
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
                          <M3ExpressivePlaceholder index={idx} />
                          <span className="text-xs font-medium text-md-on-surface-variant mt-3">
                            @KripplingFinds Lookbook
                          </span>
                        </div>
                      )}
                    </div>

                    {/* M3 Card Content Area */}
                    <div className="p-4 pb-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-md-primary uppercase tracking-wider mb-1">
                        <span>{product.category}</span>
                        {product.rating && <span>★ {product.rating}</span>}
                      </div>
                      <h2 className="font-serif text-2xl leading-snug text-md-on-surface">
                        {product.title}
                      </h2>
                      {product.spec_note && (
                        <p className="text-xs text-md-on-surface-variant mt-1 leading-relaxed">
                          {product.spec_note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* M3 Card Actions & Price */}
                  <div className="p-4 pt-3">
                    <div className="flex items-baseline gap-2 mb-3.5">
                      <span className="text-xl font-bold text-md-on-surface">
                        {formatPhp(Number(product.deal_price))}
                      </span>
                      {product.original_price && (
                        <span className="text-xs line-through text-md-on-surface-variant">
                          {formatPhp(Number(product.original_price))}
                        </span>
                      )}
                    </div>

                    <a
                      href={`/go/${product.slug}`}
                      className="m3-filled-button w-full h-11 px-5 text-xs font-semibold flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        <span>Shop Now</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* 5. MATERIAL 3 TONAL FEATURE CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="rounded-m3-lg bg-md-surface-low border border-md-outline-variant/50 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-m3-md bg-md-primary-container text-md-primary flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-md-on-surface mb-1">
                Women’s Fits &amp; Footwear
              </h3>
              <p className="text-md-on-surface-variant text-xs leading-relaxed">
                Curated dresses, tops, skirts, heels, sandals, and bags showcased on @KripplingFinds.
              </p>
            </div>
          </div>

          <div className="rounded-m3-lg bg-md-surface-low border border-md-outline-variant/50 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-m3-md bg-md-secondary-container text-md-on-secondary-container flex items-center justify-center shrink-0 font-bold text-sm">
              ₱
            </div>
            <div>
              <h3 className="font-serif text-xl text-md-on-surface mb-1">
                Philippine Peso (₱ PHP)
              </h3>
              <p className="text-md-on-surface-variant text-xs leading-relaxed">
                Every item is priced directly in ₱ PHP to match your local TikTok Shop cart.
              </p>
            </div>
          </div>

          <div className="rounded-m3-lg bg-md-surface-low border border-md-outline-variant/50 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-m3-md bg-md-tertiary-container text-md-on-tertiary-container flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-md-on-surface mb-1">
                Verified Direct Links
              </h3>
              <p className="text-md-on-surface-variant text-xs leading-relaxed">
                One tap takes you straight to the official product page featured in our short videos.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 6. MATERIAL 3 FOOTER */}
      <footer className="mt-auto border-t border-md-outline-variant/50 bg-md-surface-low py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-2xl text-md-on-surface">
              Krippling<span className="italic text-md-primary">Finds</span>
            </span>
            <span className="text-xs text-md-on-surface-variant">&bull; @KripplingFinds</span>
          </div>
          <div className="text-xs text-md-on-surface-variant text-center sm:text-right">
            Women’s Clothing, Footwear &amp; OOTD Directory &bull; ₱ PHP
          </div>
        </div>
      </footer>

      {/* 7. MATERIAL 3 BOTTOM APP BAR / EXTENDED FAB (MOBILE) */}
      {featuredDeal && (
        <div className="fixed bottom-4 left-4 right-4 z-50 h-16 rounded-m3-xl bg-md-secondary-container border border-md-outline-variant px-4 flex items-center justify-between md:hidden">
          <div className="flex items-center space-x-2.5 overflow-hidden pr-2">
            <span className="bg-md-primary text-md-on-primary text-[10px] font-bold px-2.5 py-1 rounded-m3-sm shrink-0">
              Top Pick
            </span>
            <span className="font-serif text-lg truncate text-md-on-secondary-container">
              {featuredDeal.title}
            </span>
          </div>
          <a
            href={`/go/${featuredDeal.slug}`}
            className="m3-filled-button h-10 px-4 text-xs font-semibold flex items-center shrink-0"
          >
            ₱{Number(featuredDeal.deal_price).toLocaleString('en-PH')} ↗
          </a>
        </div>
      )}
    </div>
  );
}
