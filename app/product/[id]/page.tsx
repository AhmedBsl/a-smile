'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { useStore } from '@/lib/store';
import { SAMPLE_PRODUCTS } from '@/lib/sample-data';
import { formatDZD } from '@/lib/format';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingBag, Minus, Plus, ChevronDown, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const SIZES = ['S', 'M', 'L', 'XL', 'فري سايز'];
const COLORS = [
  { name: 'أسود', value: '#1A1A2E' },
  { name: 'أبيض', value: '#FFFFFF' },
  { name: 'وردي', value: '#F06292' },
  { name: 'أحمر', value: '#E91E63' },
  { name: 'نود', value: '#D4A574' },
  { name: 'زيتي', value: '#556B2F' },
];

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const addToCart = useStore((state) => state.addToCart);

  const product = SAMPLE_PRODUCTS.find((p) => p.id === params.id);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product?.size || '');
  const [selectedColor, setSelectedColor] = useState(product?.color || '');
  const [showVariants, setShowVariants] = useState(false);
  const [added, setAdded] = useState(false);

  // For multi-piece products
  const pieceCount = product?.pieces || 1;
  const [pieceSelections, setPieceSelections] = useState(
    Array.from({ length: pieceCount }, () => ({
      size: product?.size || 'M',
      color: product?.color || 'أسود',
    }))
  );
  const [expandedPiece, setExpandedPiece] = useState<number | null>(0);

  if (!product) {
    return (
      <main className="bg-background min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">المنتج غير موجود</h1>
          <Link href="/shop" className="text-primary hover:underline font-bold">العودة للمتجر</Link>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        size: pieceCount > 1 ? pieceSelections.map((p) => p.size).join(', ') : selectedSize,
        color: pieceCount > 1 ? pieceSelections.map((p) => p.color).join(', ') : selectedColor,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return (
    <main className="bg-background min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">الرئيسية</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-primary">المتجر</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-bold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-border">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {discount > 0 && (
              <div className="absolute top-4 right-4 bg-primary text-white font-black px-3 py-1.5 rounded-full">
                -{discount}%
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm text-muted-foreground mr-2">{product.rating}</span>
              </div>
            )}

            <h1 className="text-3xl font-black text-foreground">{product.name}</h1>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-primary font-mono">{formatDZD(product.price)}</span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-lg text-muted-foreground line-through font-mono">{formatDZD(product.oldPrice)}</span>
              )}
            </div>

            {/* Multi-Piece Variant Selector */}
            {pieceCount > 1 && (
              <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 space-y-3">
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{pieceCount} قطع</span>
                  اختر المقاس واللون لكل قطعة
                </p>
                {Array.from({ length: pieceCount }).map((_, i) => (
                  <div key={i} className="border border-white rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedPiece(expandedPiece === i ? null : i)}
                      className="w-full flex items-center justify-between p-3 bg-white text-sm font-bold"
                    >
                      <span>حجاب - قطعة {i + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {pieceSelections[i].size} · {pieceSelections[i].color}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedPiece === i ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedPiece === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 space-y-3 bg-white border-t border-pink-100">
                            {/* Size */}
                            <div>
                              <p className="text-xs font-bold text-muted-foreground mb-2">المقاس</p>
                              <div className="flex flex-wrap gap-2">
                                {SIZES.map((size) => (
                                  <button
                                    key={size}
                                    onClick={() => {
                                      const newSelections = [...pieceSelections];
                                      newSelections[i] = { ...newSelections[i], size };
                                      setPieceSelections(newSelections);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                      pieceSelections[i].size === size
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-border hover:border-primary/40'
                                    }`}
                                  >
                                    {size}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {/* Color */}
                            <div>
                              <p className="text-xs font-bold text-muted-foreground mb-2">اللون</p>
                              <div className="flex flex-wrap gap-2">
                                {COLORS.map((color) => (
                                  <button
                                    key={color.name}
                                    onClick={() => {
                                      const newSelections = [...pieceSelections];
                                      newSelections[i] = { ...newSelections[i], color: color.name };
                                      setPieceSelections(newSelections);
                                    }}
                                    className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                                      pieceSelections[i].color === color.name
                                        ? 'border-primary scale-110'
                                        : 'border-border hover:border-primary/40'
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                  >
                                    {pieceSelections[i].color === color.name && (
                                      <Check className="w-3 h-3 text-primary drop-shadow-sm" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}

            {/* Single Product Variant Selectors */}
            {pieceCount === 1 && (
              <div className="space-y-4">
                {/* Size */}
                <div>
                  <p className="text-sm font-bold mb-2">المقاس</p>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                          selectedSize === size
                            ? 'border-primary bg-primary text-white'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Color */}
                <div>
                  <p className="text-sm font-bold mb-2">اللون</p>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColor === color.name
                            ? 'border-primary scale-110'
                            : 'border-border hover:border-primary/40'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {selectedColor === color.name && (
                          <Check className="w-4 h-4 text-primary drop-shadow-sm" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-bold mb-2">الكمية</p>
              <div className="inline-flex items-center gap-3 bg-muted rounded-xl px-3 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:bg-white rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 hover:bg-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-primary text-white hover:bg-redDim animate-pulse-btn'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  تمت الإضافة!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  أطلب الآن — {formatDZD(product.price * quantity)}
                </>
              )}
            </button>

            {/* Stock */}
            <p className="text-xs text-muted-foreground text-center">
              {product.stock > 10 ? (
                <span className="text-green-600">✓ متوفر في المخزون ({product.stock})</span>
              ) : product.stock > 0 ? (
                <span className="text-yellow-600">⚠ متبقي {product.stock} فقط</span>
              ) : (
                <span className="text-red-600">✗ نفد المخزون</span>
              )}
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
