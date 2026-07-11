'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { COLLECTIONS } from '@/lib/sample-data';
import { formatDZD } from '@/lib/format';
import { Filter, X } from 'lucide-react';

export default function ShopPage() {
  const products = useStore((state) => state.products);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const fromProducts = Array.from(new Set(products.map((p) => p.category)));
    return fromProducts.length > 0 ? fromProducts : COLLECTIONS;
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = selectedCategory
      ? products.filter((p) => p.category === selectedCategory)
      : products;

    if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [products, selectedCategory, sortBy]);

  return (
    <main className="bg-background min-h-screen">
      <Header />

      {/* Page Header */}
      <section className="border-b border-border py-12 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">
              Shop Collection
            </h1>
            <p className="text-lg text-muted-foreground">
              {filteredAndSortedProducts.length} premium pieces
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block w-56 flex-shrink-0"
          >
            <div className="sticky top-24">
              <h3 className="font-bold text-lg mb-6 text-foreground">Filters</h3>

              {/* Categories */}
              <div className="mb-8">
                <h4 className="font-bold text-sm mb-4 text-foreground uppercase">
                  Category
                </h4>
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`block text-sm transition-colors ${
                      selectedCategory === ''
                        ? 'text-primary font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All Items
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block text-sm transition-colors ${
                        selectedCategory === category
                          ? 'text-primary font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h4 className="font-bold text-sm mb-4 text-foreground uppercase">
                  Sort By
                </h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded text-foreground text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded font-bold text-sm"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden mb-6 bg-card border border-border p-6 rounded-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-foreground">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-sm mb-3 uppercase">Category</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setShowFilters(false);
                    }}
                    className="block text-sm text-muted-foreground hover:text-foreground"
                  >
                    All Items
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowFilters(false);
                      }}
                      className="block text-sm text-muted-foreground hover:text-foreground"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-3 uppercase">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Products Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            {filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No products found</p>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSortBy('featured');
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Link href={`/product/${product.id}`}>
                      <div className="group cursor-pointer h-full">
                        <div className="relative overflow-hidden rounded-lg bg-muted aspect-square mb-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black text-primary">
                            {formatDZD(product.price)}
                          </span>
                          <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
