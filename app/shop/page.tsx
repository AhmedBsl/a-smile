'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { useStore } from '@/lib/store';
import { SAMPLE_PRODUCTS, COLLECTIONS } from '@/lib/sample-data';
import { formatDZD } from '@/lib/format';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, Heart, Filter, X, Search } from 'lucide-react';
import Link from 'next/link';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('');
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);

  const addToCart = useStore((state) => state.addToCart);

  const filteredProducts = useMemo(() => {
    let products = [...SAMPLE_PRODUCTS];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      products = products.filter((p) => p.category === selectedCategory);
    }

    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        products.sort((a, b) => Number(b.id) - Number(a.id));
        break;
    }

    return products;
  }, [selectedCategory, sortBy, searchTerm]);

  const handleAddToCart = (product: typeof SAMPLE_PRODUCTS[0]) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      size: product.size,
      color: product.color,
    });
  };

  return (
    <main className="bg-background min-h-screen">
      <Header />

      <div className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-black text-foreground">المتجر</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredProducts.length} منتج
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full pr-10 pl-4 py-2.5 border border-border rounded-full bg-white text-sm focus:outline-none focus:border-primary"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 border border-border rounded-full bg-white text-sm font-bold focus:outline-none focus:border-primary"
          >
            <option value="">ترتيب حسب</option>
            <option value="price-low">السعر: من الأقل</option>
            <option value="price-high">السعر: من الأعلى</option>
            <option value="rating">الأعلى تقييماً</option>
            <option value="newest">الأحدث</option>
          </select>

          {/* Filter Toggle (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden p-2.5 border border-border rounded-full hover:bg-muted"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills */}
        <div className={`flex flex-wrap gap-2 mb-6 ${showFilters ? '' : 'hidden md:flex'}`}>
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              selectedCategory === ''
                ? 'bg-primary text-white'
                : 'border border-border bg-white hover:border-primary/40'
            }`}
          >
            الكل
          </button>
          {COLLECTIONS.map((col) => (
            <button
              key={col.id}
              onClick={() => setSelectedCategory(col.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                selectedCategory === col.id
                  ? 'bg-primary text-white'
                  : 'border border-border bg-white hover:border-primary/40'
              }`}
            >
              <span>{col.icon}</span>
              {col.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-2">لم يتم العثور على منتجات</p>
            <p className="text-sm text-muted-foreground">جربي البحث بكلمات مختلفة</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/product/${product.id}`}
                  className="group block bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-pink-100/50 transition-all"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.oldPrice && product.oldPrice > product.price && (
                      <div className="absolute top-3 right-3 bg-primary text-white text-xs font-black px-2.5 py-1 rounded-full">
                        -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {product.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < Math.floor(product.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    )}

                    <h3 className="font-bold text-foreground text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-black text-primary text-lg font-mono">{formatDZD(product.price)}</span>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through font-mono">{formatDZD(product.oldPrice)}</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-redDim transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      أطلب الآن
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <main className="bg-background min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </main>
    }>
      <ShopContent />
    </Suspense>
  );
}
