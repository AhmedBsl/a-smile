'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDZD } from '@/lib/format';

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const product = useStore((state) =>
    state.products.find((p) => p.id === params.id)
  );
  const addToCart = useStore((state) => state.addToCart);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product?.size || 'M');
  const [selectedColor, setSelectedColor] = useState(product?.color || 'Black');
  const [showNotification, setShowNotification] = useState(false);

  if (!product) {
    return (
      <main className="bg-background min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product not found</h1>
          <Link href="/shop" className="text-primary hover:underline font-bold">
            Back to shop
          </Link>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
    });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = [
    { name: 'Black', value: 'black' },
    { name: 'Red', value: 'red' },
    { name: 'White', value: 'white' },
  ];

  return (
    <main className="bg-background min-h-screen">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative overflow-hidden rounded-xl bg-muted aspect-square sticky top-24">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-start"
          >
            {/* Category Badge */}
            <div className="inline-flex w-fit mb-4">
              <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            {/* Title & Price */}
            <h1 className="text-4xl font-black text-foreground mb-2">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-primary mb-6">
              {formatDZD(product.price)}
            </p>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-8">
              {product.description}
            </p>

            {/* Size Selection */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-foreground mb-3 uppercase">
                Size
              </label>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border-2 rounded transition-all ${
                      selectedSize === size
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-foreground hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-foreground mb-3 uppercase">
                Color
              </label>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.name)}
                    className={`px-4 py-2 border-2 rounded transition-all text-sm font-bold ${
                      selectedColor === color.name
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-foreground hover:border-primary'
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-foreground mb-3 uppercase">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-border hover:bg-muted transition-colors rounded"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold text-foreground w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(
                      Math.min(product.stock, quantity + 1)
                    )
                  }
                  className="p-2 border border-border hover:bg-muted transition-colors rounded"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {product.stock} available in stock
              </p>
            </div>

            {/* Stock Status */}
            {product.stock <= 0 ? (
              <div className="text-lg font-bold text-destructive mb-6">
                Out of Stock
              </div>
            ) : (
              <div className="text-sm font-bold text-accent mb-6">
                ✓ Ships within 2-3 business days
              </div>
            )}

            {/* Add to Cart Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full bg-primary text-primary-foreground py-4 font-bold text-lg rounded-lg flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-4"
            >
              <ShoppingBag className="w-5 h-5" />
              Add to Cart
            </motion.button>

            {/* Notification */}
            {showNotification && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-accent text-accent-foreground px-4 py-3 rounded-lg text-sm font-bold text-center"
              >
                Added to cart! ✓
              </motion.div>
            )}

            {/* Product Details */}
            <div className="border-t border-border pt-8 mt-8">
              <h3 className="font-bold text-foreground mb-4">Product Details</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="font-bold text-foreground">Material:</span> Premium
                  cotton blend
                </li>
                <li>
                  <span className="font-bold text-foreground">Care:</span> Machine wash
                  cold
                </li>
                <li>
                  <span className="font-bold text-foreground">Fit:</span> Regular fit
                </li>
                <li>
                  <span className="font-bold text-foreground">Origin:</span> Designed in
                  Algeria
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
