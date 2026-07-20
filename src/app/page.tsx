'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search, ShoppingCart, User, ChevronLeft, ChevronRight, Star, Plus, Minus,
  X, Clock, TrendingUp, Zap, Heart,
  Monitor, Smartphone, Shirt, Home, Sparkles, Dumbbell, UtensilsCrossed,
  ShoppingBag, ArrowRight, Package, Truck, Shield, Headphones,
  Gift, HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCartStore, CartItem } from '@/store/cart';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  mrp: number;
  discount: number;
  images: string;
  categoryId: string;
  subCategoryId: string | null;
  features: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isFeatured: boolean;
  isDealOfDay: boolean;
  brand: string;
  seller: string;
  category: { id: string; name: string; slug: string; image: string };
  subCategory?: { id: string; name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  order: number;
  active: boolean;
  subcategories: { id: string; name: string; slug: string; image: string; order: number }[];
}

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  order: number;
  active: boolean;
}

interface HomeData {
  banners: Banner[];
  categories: Category[];
  featuredByCategory: { category: string; slug: string; products: Product[] }[];
  dealOfTheDay: Product[];
}

const PLACEHOLDER_IMG = 'https://placehold.co/300x300/f1f3f6/878787?text=No+Image';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return '₹' + price.toLocaleString('en-IN');
}

function parseImages(imagesStr: string): string[] {
  try {
    const parsed = JSON.parse(imagesStr);
    return Array.isArray(parsed) ? parsed : [imagesStr];
  } catch {
    return imagesStr ? [imagesStr] : [];
  }
}

function parseFeatures(featuresStr: string): string[] {
  try {
    const parsed = JSON.parse(featuresStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getTimeLeftToMidnight(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src !== PLACEHOLDER_IMG) {
    img.src = PLACEHOLDER_IMG;
  }
}

// ─── Loading Skeletons ──────────────────────────────────────────────────────

function HeaderSkeleton() {
  return (
    <div className="bg-[#2874f0]">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-2 sm:px-4 py-2.5">
        <Skeleton className="h-7 w-20 sm:h-8 sm:w-28 bg-white/20" />
        <Skeleton className="h-9 w-full max-w-lg sm:max-w-xl bg-white/20 mx-2 sm:mx-4" />
        <div className="flex items-center gap-2 sm:gap-4">
          <Skeleton className="h-7 w-12 sm:h-8 sm:w-16 bg-white/20 hidden sm:block" />
          <Skeleton className="h-7 w-20 sm:h-8 sm:w-28 bg-white/20 hidden sm:block" />
          <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 bg-white/20" />
        </div>
      </div>
    </div>
  );
}

function BannerSkeleton() {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-2">
      <div className="relative w-full aspect-[4/3] xs:aspect-[16/9] sm:aspect-[16/6] md:aspect-[16/5] lg:aspect-[16/4] rounded-sm bg-gray-200">
        <Skeleton className="w-full h-full rounded-sm" />
      </div>
    </div>
  );
}

function CategoryStripSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-2 bg-white rounded-sm shadow-sm py-3 sm:py-4">
      <div className="flex gap-4 sm:gap-6 overflow-hidden">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 sm:gap-2 min-w-[60px] sm:min-w-[80px]">
            <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-full" />
            <Skeleton className="h-2 w-12 sm:h-3 sm:w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-2 sm:p-3 min-w-[140px] sm:min-w-[160px] max-w-[160px] sm:max-w-[200px] w-full flex-shrink-0">
      <Skeleton className="h-28 sm:h-36 w-full rounded-md mb-2 sm:mb-3" />
      <Skeleton className="h-3 sm:h-4 w-full mb-1" />
      <Skeleton className="h-3 sm:h-4 w-2/3 mb-1 sm:mb-2" />
      <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 mb-1" />
      <Skeleton className="h-2 sm:h-3 w-12 sm:w-16" />
    </div>
  );
}

function DealsSectionSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-2">
      <div className="bg-white rounded-sm shadow-sm p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <Skeleton className="h-5 w-28 sm:h-7 sm:w-36" />
            <Skeleton className="h-5 w-20 sm:h-6 sm:w-24" />
          </div>
          <Skeleton className="h-4 w-16 sm:h-5 sm:w-20" />
        </div>
        <div className="flex gap-2 sm:gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategorySectionSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-2 mb-3">
      <div className="bg-white rounded-sm shadow-sm p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Skeleton className="h-5 w-32 sm:h-6 sm:w-40" />
          <Skeleton className="h-4 w-16 sm:h-5 sm:w-20" />
        </div>
        <div className="flex gap-2 sm:gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ────────────────────────────────────────────────────────────

function ProductCard({ product, onOpen, onAddToCart }: {
  product: Product;
  onOpen: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}) {
  const images = parseImages(product.images);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-md p-2 sm:p-3 min-w-[140px] sm:min-w-[160px] max-w-[160px] sm:max-w-[200px] w-full flex-shrink-0 cursor-pointer transition-colors relative group"
      onClick={() => onOpen(product)}
    >
      <button
        onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
        className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 p-1 sm:p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        aria-label="Wishlist"
      >
        <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
      </button>

      <div className="relative overflow-hidden rounded-md mb-2 sm:mb-3 bg-gray-50">
        <div className="aspect-square w-full">
          {!imgLoaded && <Skeleton className="absolute inset-0 rounded-md" />}
          <img
            src={images[0] || PLACEHOLDER_IMG}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onLoad={() => setImgLoaded(true)}
            onError={(e) => { handleImgError(e); setImgLoaded(true); }}
          />
        </div>
        {product.discount > 0 && (
          <div className="absolute bottom-1 left-1">
            <span className="bg-[#388e3c] text-white text-[8px] sm:text-[10px] font-bold px-1 py-0.5 rounded">
              {Math.round(product.discount)}% OFF
            </span>
          </div>
        )}
      </div>

      <div className="space-y-0.5 sm:space-y-1">
        <h3 className="text-[11px] sm:text-sm font-normal text-[#212121] line-clamp-2 leading-tight min-h-[2rem] sm:min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-center gap-1">
          <span className="bg-[#388e3c] text-white text-[10px] sm:text-xs font-medium px-1 py-0.5 rounded-sm flex items-center gap-0.5">
            <span className="text-[8px] sm:text-[10px]">★</span>
            <span>{product.rating}</span>
          </span>
          <span className="text-[9px] sm:text-xs text-[#878787]">({product.reviewCount.toLocaleString('en-IN')})</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <span className="text-xs sm:text-base font-bold text-[#212121]">{formatPrice(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-[9px] sm:text-xs text-[#878787] line-through">{formatPrice(product.mrp)}</span>
          )}
          {product.discount > 0 && (
            <span className="text-[9px] sm:text-xs font-medium text-[#388e3c]">{Math.round(product.discount)}% off</span>
          )}
        </div>
      </div>

      {product.isDealOfDay && (
        <Button
          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
          className="w-full mt-2 sm:mt-3 bg-[#fb641b] hover:bg-[#e85d19] text-white text-[10px] sm:text-sm font-medium h-7 sm:h-9 rounded-sm"
        >
          Buy
        </Button>
      )}
    </motion.div>
  );
}

// ─── Horizontal Scroll Row ───────────────────────────────────────────────────

function ScrollRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const resizeObs = new ResizeObserver(checkScroll);
    resizeObs.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      resizeObs.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkScroll]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.7;
    el.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className={`relative group/scroll ${className}`}>
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute left-0 top-0 bottom-0 z-10 w-6 sm:w-10 items-center justify-center bg-gradient-to-r from-white via-white/90 to-transparent opacity-0 group-hover/scroll:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 sm:h-8 sm:w-8 text-[#212121]" />
        </button>
      )}
      <div ref={scrollRef} className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2 px-0.5 sm:px-1 snap-x snap-mandatory sm:snap-none">
        {children}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex absolute right-0 top-0 bottom-0 z-10 w-6 sm:w-10 items-center justify-center bg-gradient-to-l from-white via-white/90 to-transparent opacity-0 group-hover/scroll:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 sm:h-8 sm:w-8 text-[#212121]" />
        </button>
      )}
    </div>
  );
}

// ─── Product Detail Modal ───────────────────────────────────────────────────

function ProductDetailModal({ product, open, onClose, onAddToCart }: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setSelectedImage(0);
    setImgLoaded(false);
  }, [product]);

  if (!product) return null;

  const images = parseImages(product.images);
  const features = parseFeatures(product.features);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="w-[calc(100%-1.5rem)] sm:w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto p-0 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          <div className="p-2 sm:p-4 border-b sm:border-b-0 sm:border-r border-gray-100">
            <div className="relative bg-gray-50 rounded-lg overflow-hidden aspect-square mb-2 sm:mb-3">
              {!imgLoaded && <Skeleton className="absolute inset-0 rounded-lg" />}
              <img
                src={images[selectedImage] || images[0] || PLACEHOLDER_IMG}
                alt={product.name}
                className="w-full h-full object-contain"
                onLoad={() => setImgLoaded(true)}
                onError={(e) => { handleImgError(e); setImgLoaded(true); }}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-1 sm:gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedImage(i); setImgLoaded(false); }}
                    className={`flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-md border-2 overflow-hidden ${selectedImage === i ? 'border-[#2874f0]' : 'border-gray-200'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" onError={handleImgError} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm text-[#878787] mb-1">{product.brand || product.category?.name}</p>
              <h2 className="text-base sm:text-lg font-medium text-[#212121] leading-snug">{product.name}</h2>
              {product.seller && (
                <p className="text-xs sm:text-sm text-[#878787] mt-1">Seller: {product.seller}</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#388e3c] text-white text-xs sm:text-sm font-medium px-1.5 sm:px-2 py-0.5 rounded-sm flex items-center gap-1">
                <span className="text-[9px] sm:text-xs">★</span>
                <span>{product.rating}</span>
              </span>
              <span className="text-xs sm:text-sm text-[#878787]">
                {product.reviewCount.toLocaleString('en-IN')} Ratings &amp; {Math.floor(product.reviewCount * 0.3).toLocaleString('en-IN')} Reviews
              </span>
            </div>

            <div className="bg-gray-50 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 sm:py-3 space-y-1">
              <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                <span className="text-xl sm:text-2xl font-bold text-[#212121]">{formatPrice(product.price)}</span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-sm sm:text-base text-[#878787] line-through">{formatPrice(product.mrp)}</span>
                    <span className="text-sm sm:text-base font-medium text-[#388e3c]">{Math.round(product.discount)}% off</span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#388e3c] font-medium">Special Price</p>
              {product.mrp > product.price && (
                <p className="text-[10px] sm:text-xs text-[#878787]">
                  You save {formatPrice(product.mrp - product.price)}
                </p>
              )}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <p className="font-medium text-[#212121] text-xs sm:text-sm">Available Offers</p>
              <div className="space-y-1 text-[10px] sm:text-xs text-[#212121]">
                <p className="flex gap-2"><span className="text-[#388e3c] font-medium">Bank Offer</span> 10% off on HDFC Credit Card, up to ₹1,500. On orders of ₹5,000 and above</p>
                <p className="flex gap-2"><span className="text-[#388e3c] font-medium">Bank Offer</span> 5% Cashback on Flipkart Axis Bank Card</p>
                <p className="flex gap-2"><span className="text-[#388e3c] font-medium">No Cost EMI</span> starting from ₹{(product.price / 3).toFixed(0)}/month</p>
              </div>
            </div>

            {features.length > 0 && (
              <div className="space-y-1 sm:space-y-2">
                <p className="font-medium text-[#212121] text-xs sm:text-sm">Key Features</p>
                <ul className="space-y-0.5 sm:space-y-1">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#212121]">
                      <span className="text-[#2874f0] mt-0.5">•</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.description && (
              <div className="space-y-1 sm:space-y-2">
                <p className="font-medium text-[#212121] text-xs sm:text-sm">Description</p>
                <p className="text-xs sm:text-sm text-[#878787] leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#388e3c] flex-shrink-0" />
                <span className="text-[#212121] font-medium">Free Delivery</span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#878787]">Estimated delivery by {new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            </div>

            <div className="flex gap-2 sm:gap-3 pt-2 sticky bottom-0 bg-white sm:static pb-2 sm:pb-0">
              <Button
                onClick={() => onAddToCart(product)}
                className="flex-1 h-9 sm:h-11 bg-[#ff9f00] hover:bg-[#e89100] text-white font-medium rounded-sm text-xs sm:text-sm"
              >
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={() => { onAddToCart(product); onClose(); }}
                className="flex-1 h-9 sm:h-11 bg-[#fb641b] hover:bg-[#e85d19] text-white font-medium rounded-sm text-xs sm:text-sm"
              >
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Buy Now
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-1 sm:gap-2 pt-2 border-t border-gray-100">
              <div className="flex flex-col items-center text-center gap-0.5 sm:gap-1 py-1 sm:py-2">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-[#2874f0]" />
                <span className="text-[8px] sm:text-[10px] text-[#878787]">1 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center gap-0.5 sm:gap-1 py-1 sm:py-2">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-[#2874f0]" />
                <span className="text-[8px] sm:text-[10px] text-[#878787]">7 Day Return</span>
              </div>
              <div className="flex flex-col items-center text-center gap-0.5 sm:gap-1 py-1 sm:py-2">
                <Headphones className="h-4 w-4 sm:h-5 sm:w-5 text-[#2874f0]" />
                <span className="text-[8px] sm:text-[10px] text-[#878787]">Free Support</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Cart Drawer ────────────────────────────────────────────────────────────

function CartDrawer({ onOpenProduct }: { onOpenProduct: (p: Product) => void }) {
  const { items, isOpen, setCartOpen, subtotal, total, updateQuantity } = useCartStore();

  const updateCartItemQty = async (id: string, quantity: number) => {
    updateQuantity(id, quantity);
    if (quantity <= 0) {
      try { await fetch(`/api/cart?id=${id}`, { method: 'DELETE' }); } catch {}
      return;
    }
    try {
      await fetch('/api/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, quantity }) });
    } catch {}
  };

  const openItemDetails = async (item: CartItem) => {
    setCartOpen(false);
    try {
      const res = await fetch(`/api/products/${item.productId}`);
      if (res.ok) {
        const fullProduct = await res.json();
        onOpenProduct(fullProduct);
        return;
      }
    } catch {}
    // Fallback: open with the partial data we already have rather than doing nothing
    onOpenProduct({
      ...item.product,
      slug: '',
      description: '',
      categoryId: '',
      subCategoryId: null,
      features: '[]',
      rating: 0,
      reviewCount: 0,
      inStock: true,
      isFeatured: false,
      isDealOfDay: false,
      brand: '',
      seller: '',
      category: { id: '', name: '', slug: '', image: '' },
      subCategory: null,
    } as Product);
  };

  const totalSavings = items.reduce((sum, item) => sum + (item.product.mrp - item.product.price) * item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-3 sm:p-4 pb-2 border-b bg-white">
          <SheetTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            My Cart ({total})
          </SheetTitle>
          <SheetDescription className="text-[10px] sm:text-xs text-[#878787]">
            {total === 0 ? 'Your cart is empty' : `${total} item${total > 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>

        {total === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 sm:gap-4 p-4 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-[#878787]" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-medium text-[#212121]">Your cart is empty!</p>
              <p className="text-xs sm:text-sm text-[#878787] mt-1">Add items to it now.</p>
            </div>
            <Button onClick={() => setCartOpen(false)} className="bg-[#2874f0] hover:bg-[#1a5dc8] text-white text-xs sm:text-sm">
              Shop Now
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
              {items.map((item) => {
                const images = parseImages(item.product.images);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-2 sm:gap-3 bg-white border border-gray-100 rounded-lg p-2 sm:p-3"
                  >
                    <img
                      src={images[0] || PLACEHOLDER_IMG}
                      alt={item.product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md cursor-pointer flex-shrink-0"
                      onClick={() => openItemDetails(item)}
                      onError={handleImgError}
                    />
                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-xs sm:text-sm font-medium text-[#212121] line-clamp-2 cursor-pointer"
                        onClick={() => openItemDetails(item)}
                      >
                        {item.product.name}
                      </h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xs sm:text-sm font-bold text-[#212121]">{formatPrice(item.product.price)}</span>
                        {item.product.mrp > item.product.price && (
                          <span className="text-[10px] sm:text-xs text-[#878787] line-through">{formatPrice(item.product.mrp)}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                        <div className="flex items-center border border-gray-300 rounded-sm">
                          <button
                            onClick={() => updateCartItemQty(item.id, item.quantity - 1)}
                            className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[#212121] hover:bg-gray-50 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </button>
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium text-[#212121] border-x border-gray-300 min-w-[28px] sm:min-w-[36px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItemQty(item.id, item.quantity + 1)}
                            className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[#212121] hover:bg-gray-50 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => updateCartItemQty(item.id, 0)}
                          className="text-[10px] sm:text-xs font-bold text-[#212121] uppercase hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <SheetFooter className="p-3 sm:p-4 border-t bg-white space-y-2 sm:space-y-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              {totalSavings > 0 && (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-[#388e3c] font-medium">You will save on this order</span>
                  <span className="text-[#388e3c] font-bold">{formatPrice(totalSavings)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm sm:text-base">
                <span className="font-medium text-[#878787]">Total Amount</span>
                <span className="font-bold text-[#212121]">{formatPrice(subtotal)}</span>
              </div>
              <Button className="w-full h-9 sm:h-11 bg-[#fb641b] hover:bg-[#e85d19] text-white font-bold text-xs sm:text-sm rounded-sm">
                PLACE ORDER
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Custom Banner Component ──────────────────────────────────────────────

function CustomBanner() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#ff6b6b] via-[#ee5a24] to-[#f0932b] flex items-center justify-center p-3 sm:p-6">
      {/* Decorative sparkles */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative z-10 text-center text-white max-w-3xl mx-auto py-2">
        <p className="text-[10px] sm:text-sm md:text-base font-medium tracking-wide uppercase mb-1 sm:mb-2">
          Celebrate Diwali in style now
        </p>
        <p className="text-[9px] sm:text-xs md:text-sm font-light mb-2 sm:mb-4">
          Buy Now, Pay Later with <span className="font-bold text-yellow-300">ZestMoney</span>
        </p>

        <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-8xl font-black uppercase leading-[1.1] tracking-wider drop-shadow-2xl">
          BIG<br className="sm:hidden" />
          <span className="inline-block sm:inline">DIWALI</span><br className="sm:hidden" />
          <span className="inline-block sm:inline">SALE</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 mt-2 sm:mt-3">
          <span className="text-xs sm:text-lg md:text-2xl font-bold text-yellow-300 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1 rounded-full whitespace-nowrap">
            8TH - 13TH NOV
          </span>
          <span className="text-sm sm:text-xl md:text-3xl font-black text-white drop-shadow-lg">
            NOW
          </span>
        </div>

        <div className="mt-2 sm:mt-4">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[9px] sm:text-xs md:text-sm font-medium px-3 sm:px-4 py-1 rounded-full border border-white/30">
            🪔 Up to 80% Off
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────

export default function HomePage() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState(getTimeLeftToMidnight());
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { sessionId, setSessionId, setItems, setCartOpen, total: cartTotal } = useCartStore();

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let sid = localStorage.getItem('cartSessionId');
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('cartSessionId', sid);
    }
    setSessionId(sid);

    (async () => {
      try {
        const res = await fetch(`/api/cart?sessionId=${sid}`);
        if (res.ok) {
          const data = await res.json();
          setItems(
            data.items.map((item: CartItem) => ({
              id: item.id,
              productId: item.productId,
              quantity: item.quantity,
              product: {
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                mrp: item.product.mrp,
                discount: item.product.discount,
                images: item.product.images,
              },
            })),
            data.subtotal,
            data.savings
          );
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/home');
        if (res.ok) {
          const data = await res.json();
          setHomeData(data);
        } else {
          setHomeData(getMockHomeData());
        }
      } catch {
        setHomeData(getMockHomeData());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeftToMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!homeData?.banners.length || homeData.banners.length < 2) return;
    bannerIntervalRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % homeData.banners.length);
    }, 4500);
    return () => { if (bannerIntervalRef.current) clearInterval(bannerIntervalRef.current); };
  }, [homeData?.banners.length]);

  const goToBanner = (index: number) => {
    setCurrentBanner(index);
    if (bannerIntervalRef.current) clearInterval(bannerIntervalRef.current);
    if ((homeData?.banners.length || 0) < 2) return;
    bannerIntervalRef.current = setInterval(() => {
      setCurrentBanner((prev) => ((prev + 1) % (homeData?.banners.length || 1)));
    }, 4500);
  };

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products);
          setShowSearch(true);
        }
      } catch {}
    }, 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCategoryClick = async (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
      setCategoryProducts([]);
      return;
    }
    setActiveCategory(categoryId);
    setCategoryLoading(true);
    try {
      const res = await fetch(`/api/products?categoryId=${categoryId}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setCategoryProducts(data.products);
      }
    } catch {
      showToast('Could not load category products');
    } finally {
      setCategoryLoading(false);
    }
  };

  const addToCart = async (product: Product) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, productId: product.id, quantity: 1 }),
      });
      if (res.ok) {
        const created = await res.json();
        useCartStore.getState().addItem({
          id: created.id,
          productId: product.id,
          quantity: 1,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            mrp: product.mrp,
            discount: product.discount,
            images: product.images,
          },
        });
        showToast(`${product.name.substring(0, 30)}${product.name.length > 30 ? '...' : ''} added to cart!`);
      } else {
        showToast('Failed to add to cart');
      }
    } catch {
      showToast('Failed to add to cart');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    'Mobiles': <Smartphone className="h-4 w-4 sm:h-6 sm:w-6" />,
    'Laptops': <Monitor className="h-4 w-4 sm:h-6 sm:w-6" />,
    'Fashion': <Shirt className="h-4 w-4 sm:h-6 sm:w-6" />,
    'Electronics': <Sparkles className="h-4 w-4 sm:h-6 sm:w-6" />,
    'Home & Furniture': <Home className="h-4 w-4 sm:h-6 sm:w-6" />,
    'Appliances': <Zap className="h-4 w-4 sm:h-6 sm:w-6" />,
    'Beauty & Health': <Heart className="h-4 w-4 sm:h-6 sm:w-6" />,
    'Grocery': <UtensilsCrossed className="h-4 w-4 sm:h-6 sm:w-6" />,
    'Sports & Toys': <Dumbbell className="h-4 w-4 sm:h-6 sm:w-6" />,
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f3f6]">
      <header className="sticky top-0 z-40 bg-[#2874f0] shadow-md pt-[env(safe-area-inset-top)]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-2 sm:px-4 py-1.5 sm:py-2 gap-1 sm:gap-2">
          <div className="flex-shrink-0">
            <h1 className="text-white text-base sm:text-xl font-bold tracking-tight italic">Flipkart</h1>
            <p className="text-[9px] sm:text-[11px] text-yellow-300 -mt-0.5 italic hidden xs:block">Explore <span className="text-white font-medium">Plus</span></p>
          </div>

          <div ref={searchRef} className="relative flex-1 max-w-lg sm:max-w-xl mx-1 sm:mx-3 md:mx-6 min-w-0">
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-[#2874f0]" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search for Products, Brands and More"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery.length >= 2) setShowSearch(true); }}
                className="pl-7 sm:pl-9 pr-7 sm:pr-9 h-8 sm:h-10 bg-white rounded-sm text-xs sm:text-sm text-[#212121] placeholder:text-[#878787] placeholder:text-[10px] sm:placeholder:text-sm border-0 focus-visible:ring-1 focus-visible:ring-white/50 min-w-0 w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearch(false); }}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4 text-[#878787]" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {showSearch && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 max-h-80 sm:max-h-96 overflow-y-auto z-50"
                >
                  {searchResults.map((product) => {
                    const images = parseImages(product.images);
                    return (
                      <button
                        key={product.id}
                        onClick={() => {
                          openProductModal(product);
                          setShowSearch(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-2 sm:gap-3 w-full p-2 sm:p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                      >
                        <img
                          src={images[0] || PLACEHOLDER_IMG}
                          alt={product.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded flex-shrink-0"
                          onError={handleImgError}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-[#212121] line-clamp-1">{product.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-[#212121]">{formatPrice(product.price)}</span>
                            {product.discount > 0 && (
                              <span className="text-[10px] sm:text-xs text-[#388e3c]">{Math.round(product.discount)}% off</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[8px] sm:text-[10px] text-[#878787] hidden sm:block flex-shrink-0">{product.category?.name}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => { setShowSearch(false); }}
                    className="w-full p-1.5 sm:p-2.5 text-center text-xs sm:text-sm text-[#2874f0] font-medium hover:bg-gray-50 border-t border-gray-100"
                  >
                    View All Results
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
            <button className="hidden sm:flex items-center gap-1 bg-white text-[#2874f0] px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-sm font-medium text-xs sm:text-sm hover:bg-gray-50 transition-colors h-6 sm:h-8">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              Login
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-1 text-white cursor-pointer relative p-1"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Cart</span>
              {cartTotal > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-2 sm:-right-2 bg-[#ff6161] text-white text-[8px] sm:text-[10px] font-bold rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center">
                  {cartTotal > 99 ? '99+' : cartTotal}
                </span>
              )}
            </button>
          </div>
        </div>

        {!loading && homeData?.categories && homeData.categories.length > 0 && (
          <div className="bg-white shadow-sm border-t border-gray-100">
            <div className="max-w-[1400px] mx-auto px-2">
              <div className="flex items-center overflow-x-auto scrollbar-hide">
                {homeData.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`flex-shrink-0 px-2 sm:px-4 md:px-5 py-2 sm:py-3 text-[10px] sm:text-xs md:text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                      activeCategory === cat.id
                        ? 'text-[#2874f0] border-[#2874f0]'
                        : 'text-[#212121] border-transparent hover:text-[#2874f0]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 pb-2 sm:pb-4">
        {loading ? (
          <div className="space-y-2 sm:space-y-3 pt-2">
            <BannerSkeleton />
            <CategoryStripSkeleton />
            <DealsSectionSkeleton />
            <CategorySectionSkeleton />
            <CategorySectionSkeleton />
            <CategorySectionSkeleton />
          </div>
        ) : (
          <>
            {activeCategory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="max-w-[1400px] mx-auto px-2 mb-2 sm:mb-3"
              >
                <div className="bg-white rounded-sm shadow-sm p-2 sm:p-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <h2 className="text-sm sm:text-xl font-bold text-[#2874f0]">
                      {homeData?.categories.find(c => c.id === activeCategory)?.name || 'Category'} Products
                    </h2>
                    <button
                      onClick={() => { setActiveCategory(null); setCategoryProducts([]); }}
                      className="text-xs sm:text-sm text-[#2874f0] font-medium flex items-center gap-1 hover:underline"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" /> Close
                    </button>
                  </div>
                  {categoryLoading ? (
                    <div className="flex gap-2 sm:gap-3 overflow-hidden">
                      {Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                  ) : categoryProducts.length > 0 ? (
                    <ScrollRow>
                      {categoryProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onOpen={openProductModal}
                          onAddToCart={addToCart}
                        />
                      ))}
                    </ScrollRow>
                  ) : (
                    <p className="text-xs sm:text-sm text-[#878787] py-4 text-center">No products found in this category yet.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── Responsive Banner Carousel ──────────────────────────────── */}
            {homeData?.banners && homeData.banners.length > 0 && (
              <div className="max-w-[1400px] mx-auto px-2 mb-2 sm:mb-3">
                <div className="relative rounded-sm overflow-hidden shadow-sm bg-gray-100">
                  <div className="relative w-full aspect-[4/3] xs:aspect-[16/9] sm:aspect-[16/6] md:aspect-[16/5] lg:aspect-[16/4]">
                    <AnimatePresence mode="wait">
                      {homeData.banners[currentBanner]?.image === 'custom-diwali' ? (
                        <motion.div
                          key={currentBanner}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 w-full h-full"
                        >
                          <CustomBanner />
                        </motion.div>
                      ) : (
                        <motion.div
                          key={currentBanner}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 w-full h-full"
                        >
                          {/* Blurred, scaled copy fills the box edge-to-edge so there's never an empty
                              letterbox gap, while the sharp image below is never cropped. */}
                          <img
                            src={homeData.banners[currentBanner]?.image}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
                            onError={handleImgError}
                          />
                          <img
                            src={homeData.banners[currentBanner]?.image}
                            alt={homeData.banners[currentBanner]?.title}
                            className="absolute inset-0 w-full h-full object-contain"
                            onError={handleImgError}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {/* subtle bottom scrim so pagination dots stay legible over any banner image */}
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 sm:h-12 bg-gradient-to-t from-black/25 to-transparent" />
                  </div>

                  {homeData.banners.length > 1 && (
                    <>
                      <button
                        onClick={() => goToBanner((currentBanner - 1 + homeData.banners.length) % homeData.banners.length)}
                        className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1 sm:p-1.5 shadow-md transition-colors z-10"
                        aria-label="Previous banner"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#212121]" />
                      </button>

                      <button
                        onClick={() => goToBanner((currentBanner + 1) % homeData.banners.length)}
                        className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1 sm:p-1.5 shadow-md transition-colors z-10"
                        aria-label="Next banner"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-[#212121]" />
                      </button>

                      <div className="absolute bottom-1.5 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-10">
                        {homeData.banners.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => goToBanner(idx)}
                            className={`rounded-full transition-all duration-300 ${
                              idx === currentBanner
                                ? 'bg-white w-4 h-1.5 sm:w-5 sm:h-2'
                                : 'bg-white/50 hover:bg-white/70 w-1.5 h-1.5 sm:w-2 sm:h-2'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {homeData?.categories && homeData.categories.length > 0 && (
              <div className="max-w-[1400px] mx-auto px-2 mb-2 sm:mb-3">
                <div className="bg-white rounded-sm shadow-sm py-3 sm:py-5 px-2 sm:px-4">
                  <ScrollRow>
                    {homeData.categories.map((cat) => {
                      const icon = categoryIcons[cat.name] || <ShoppingBag className="h-4 w-4 sm:h-6 sm:w-6" />;
                      return (
                        <motion.button
                          key={cat.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCategoryClick(cat.id)}
                          className="flex flex-col items-center gap-1 sm:gap-2 min-w-[60px] sm:min-w-[80px] cursor-pointer group"
                        >
                          <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#2874f0] transition-colors bg-gray-50 flex items-center justify-center">
                            {cat.image ? (
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                                onError={handleImgError}
                              />
                            ) : (
                              <span className="text-[#2874f0]">{icon}</span>
                            )}
                          </div>
                          <span className="text-[9px] sm:text-xs lg:text-sm font-medium text-[#212121] text-center line-clamp-2 group-hover:text-[#2874f0] transition-colors">
                            {cat.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </ScrollRow>
                </div>
              </div>
            )}

            {homeData?.dealOfTheDay && homeData.dealOfTheDay.length > 0 && (
              <div className="max-w-[1400px] mx-auto px-2 mb-2 sm:mb-3">
                <div className="bg-white rounded-sm shadow-sm p-2 sm:p-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-4 flex-wrap gap-1 sm:gap-2">
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                      <h2 className="text-sm sm:text-2xl font-bold text-[#212121]">Deals of the Day</h2>
                      <div className="flex items-center gap-0.5 sm:gap-1 bg-[#878787] text-white rounded-sm px-1.5 sm:px-2 py-0.5 sm:py-1">
                        <Clock className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                        <div className="flex gap-0.5 sm:gap-1 text-[8px] sm:text-xs font-bold">
                          <span className="bg-[#212121] rounded px-0.5 sm:px-1">{pad(timeLeft.hours)}</span>
                          <span>:</span>
                          <span className="bg-[#212121] rounded px-0.5 sm:px-1">{pad(timeLeft.minutes)}</span>
                          <span>:</span>
                          <span className="bg-[#212121] rounded px-0.5 sm:px-1">{pad(timeLeft.seconds)}</span>
                        </div>
                      </div>
                    </div>
                    <button className="bg-[#2874f0] text-white text-[9px] sm:text-xs font-bold px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-sm hover:bg-[#1a5dc8] transition-colors flex items-center gap-0.5 sm:gap-1">
                      VIEW ALL <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  </div>
                  <ScrollRow>
                    {homeData.dealOfTheDay.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onOpen={openProductModal}
                        onAddToCart={addToCart}
                      />
                    ))}
                  </ScrollRow>
                </div>
              </div>
            )}

            {homeData?.featuredByCategory && homeData.featuredByCategory.map((section) => (
              section.products.length > 0 && (
                <div key={section.slug} className="max-w-[1400px] mx-auto px-2 mb-2 sm:mb-3">
                  <div className="bg-white rounded-sm shadow-sm p-2 sm:p-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {categoryIcons[section.category] || <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#2874f0]" />}
                        <h2 className="text-sm sm:text-xl font-bold text-[#2874f0]">{section.category}</h2>
                      </div>
                      <button className="bg-[#2874f0] text-white text-[9px] sm:text-xs font-bold px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-sm hover:bg-[#1a5dc8] transition-colors flex items-center gap-0.5 sm:gap-1">
                        VIEW ALL <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                    </div>
                    <ScrollRow>
                      {section.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onOpen={openProductModal}
                          onAddToCart={addToCart}
                        />
                      ))}
                    </ScrollRow>
                  </div>
                </div>
              )
            ))}

            <div className="max-w-[1400px] mx-auto px-2 mb-2 sm:mb-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-white rounded-sm shadow-sm p-2 sm:p-4 flex items-center gap-2 sm:gap-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#2874f0]/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-[#2874f0]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#212121] text-xs sm:text-sm">Top Offers</h3>
                    <p className="text-[10px] sm:text-xs text-[#878787]">Up to 80% off on top brands</p>
                    <span className="text-[10px] sm:text-xs text-[#2874f0] font-medium">Shop Now →</span>
                  </div>
                </div>
                <div className="bg-white rounded-sm shadow-sm p-2 sm:p-4 flex items-center gap-2 sm:gap-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#ff9f00]/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-[#ff9f00]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#212121] text-xs sm:text-sm">Flash Deals</h3>
                    <p className="text-[10px] sm:text-xs text-[#878787]">Limited time lightning deals</p>
                    <span className="text-[10px] sm:text-xs text-[#2874f0] font-medium">Explore Now →</span>
                  </div>
                </div>
              </div>
            </div>

            {(!homeData?.featuredByCategory?.length && !homeData?.dealOfTheDay?.length) && (
              <div className="max-w-[1400px] mx-auto px-2 mb-2 sm:mb-3">
                <div className="bg-white rounded-sm shadow-sm p-4 sm:p-6 text-center">
                  <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-[#878787] mx-auto mb-2 sm:mb-3" />
                  <h2 className="text-base sm:text-lg font-medium text-[#212121]">Welcome to Flipkart!</h2>
                  <p className="text-xs sm:text-sm text-[#878787] mt-1">Products are being added. Check back soon for amazing deals!</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mt-auto bg-[#172337] text-white">
        <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-6 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h4 className="text-[10px] sm:text-xs text-[#878787] font-bold uppercase tracking-wider mb-2 sm:mb-4">About</h4>
              <ul className="space-y-1.5 sm:space-y-2.5">
                <li>
                  <Link href="/about/contact-us" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/about/about-us" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/about/careers" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/about/press" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="/about/corporate-information" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">
                    Corporate Information
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] sm:text-xs text-[#878787] font-bold uppercase tracking-wider mb-2 sm:mb-4">Help</h4>
              <ul className="space-y-1.5 sm:space-y-2.5">
                <li><Link href="/help/payments" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">Payments</Link></li>
                <li><Link href="/help/shipping" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">Shipping</Link></li>
                <li><Link href="/help/cancellation-returns" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">Cancellation &amp; Returns</Link></li>
                <li><Link href="/help/faq" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">FAQ</Link></li>
                <li><Link href="/help/report-infringement" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">Report Infringement</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] sm:text-xs text-[#878787] font-bold uppercase tracking-wider mb-2 sm:mb-4">Policy</h4>
              <ul className="space-y-1.5 sm:space-y-2.5">
                <li><Link href="/policy/return-policy" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">Return Policy</Link></li>
                <li><Link href="/policy/terms-of-use" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">Terms Of Use</Link></li>
                <li><Link href="/policy/security" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">Security</Link></li>
                <li><Link href="/policy/privacy" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">Privacy</Link></li>
                <li><Link href="/policy/sitemap" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">Sitemap</Link></li>
                <li><Link href="/policy/grievance-redressal" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">Grievance Redressal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] sm:text-xs text-[#878787] font-bold uppercase tracking-wider mb-2 sm:mb-4">Social</h4>
              <ul className="space-y-1.5 sm:space-y-2.5">
                <li><Link href="#" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">Facebook</Link></li>
                <li><Link href="#" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">Twitter</Link></li>
                <li><Link href="#" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">YouTube</Link></li>
                <li><Link href="#" className="text-[10px] sm:text-xs text-white hover:underline hover:text-[#2874f0] transition-colors">Instagram</Link></li>
              </ul>
              <div className="mt-4 sm:mt-6">
                <h4 className="text-[10px] sm:text-xs text-[#878787] font-bold uppercase tracking-wider mb-2 sm:mb-3">Mail Us</h4>
                <p className="text-[10px] sm:text-xs text-white leading-relaxed">
                  Flipkart Internet Private Limited,<br />
                  Buildings Alyssa, Begonia &amp; Clove Embassy Tech Village,<br />
                  Bengaluru, 560103, Karnataka, India
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#2e3a4e] pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
              <span className="text-[9px] sm:text-xs text-[#878787] flex items-center gap-1 sm:gap-1.5">
                <Star className="h-3 w-3 sm:h-4 sm:w-4" /> Advertise
              </span>
              <span className="text-[9px] sm:text-xs text-[#878787] flex items-center gap-1 sm:gap-1.5">
                <Gift className="h-3 w-3 sm:h-4 sm:w-4" /> Gift Cards
              </span>
              <span className="text-[9px] sm:text-xs text-[#878787] flex items-center gap-1 sm:gap-1.5">
                <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" /> Help Center
              </span>
            </div>
            <p className="text-[9px] sm:text-xs text-[#878787]">
              © 2024 Flipkart. All rights reserved.   {/* 👈 "Clone" removed */}
            </p>
          </div>
        </div>
      </footer>

      <ProductDetailModal
        product={selectedProduct}
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onAddToCart={addToCart}
      />

      <CartDrawer onOpenProduct={openProductModal} />

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#212121] text-white px-3 sm:px-5 py-2 sm:py-3 rounded-lg shadow-2xl text-xs sm:text-sm font-medium max-w-[85vw] sm:max-w-[90vw] text-center"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mock Data ─────────────────────────────────────────────────────────────

function getMockHomeData(): HomeData {
  const mockProduct = (id: string, name: string, price: number, mrp: number, discount: number, category: string): Product => ({
    id,
    name,
    slug: name.toLowerCase().replace(/ /g, '-'),
    description: 'This is a great product that you will love.',
    price,
    mrp,
    discount,
    images: JSON.stringify(['https://placehold.co/300x300/f1f3f6/878787?text=' + name.substring(0, 3)]),
    categoryId: 'cat1',
    subCategoryId: null,
    features: JSON.stringify(['Feature 1', 'Feature 2', 'Feature 3']),
    rating: 4.5,
    reviewCount: 120,
    inStock: true,
    isFeatured: true,
    isDealOfDay: true,
    brand: 'Brand',
    seller: 'Seller Name',
    category: { id: 'cat1', name: category, slug: category.toLowerCase(), image: 'https://placehold.co/100x100/f1f3f6/878787' },
    subCategory: null,
  });

  return {
    banners: [
      {
        id: 'b1',
        title: 'Diwali Sale',
        subtitle: 'Biggest Sale of the Year',
        image: 'custom-diwali',
        link: '#',
        order: 1,
        active: true
      },
      {
        id: 'b2',
        title: 'Electronics',
        subtitle: 'Up to 50% off',
        image: 'https://placehold.co/1400x400/ff9f00/ffffff?text=Electronics',
        link: '#',
        order: 2,
        active: true
      },
    ],
    categories: [
      { id: 'c1', name: 'Mobiles', slug: 'mobiles', image: 'https://placehold.co/80x80/2874f0/ffffff?text=M', order: 1, active: true, subcategories: [] },
      { id: 'c2', name: 'Laptops', slug: 'laptops', image: 'https://placehold.co/80x80/2874f0/ffffff?text=L', order: 2, active: true, subcategories: [] },
      { id: 'c3', name: 'Fashion', slug: 'fashion', image: 'https://placehold.co/80x80/2874f0/ffffff?text=F', order: 3, active: true, subcategories: [] },
      { id: 'c4', name: 'Home & Furniture', slug: 'home', image: 'https://placehold.co/80x80/2874f0/ffffff?text=H', order: 4, active: true, subcategories: [] },
    ],
    featuredByCategory: [
      {
        category: 'Mobiles',
        slug: 'mobiles',
        products: [
          mockProduct('p1', 'Smartphone X', 19999, 24999, 20, 'Mobiles'),
          mockProduct('p2', 'Smartphone Y', 14999, 19999, 25, 'Mobiles'),
          mockProduct('p3', 'Smartphone Z', 24999, 29999, 16, 'Mobiles'),
        ],
      },
      {
        category: 'Laptops',
        slug: 'laptops',
        products: [
          mockProduct('p4', 'Laptop A', 49999, 59999, 16, 'Laptops'),
          mockProduct('p5', 'Laptop B', 39999, 49999, 20, 'Laptops'),
        ],
      },
    ],
    dealOfTheDay: [
      mockProduct('d1', 'Deal Phone', 9999, 14999, 33, 'Mobiles'),
      mockProduct('d2', 'Deal Watch', 2999, 4999, 40, 'Electronics'),
      mockProduct('d3', 'Deal Headphones', 1499, 2499, 40, 'Electronics'),
    ],
  };
}