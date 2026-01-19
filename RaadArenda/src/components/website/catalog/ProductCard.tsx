'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '@/lib/website/types';
import { Card, Badge } from '@/components/website/ui';
import { formatPrice, cn } from '@/lib/website/utils';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const isFav = isFavorite(product.id);
  const hasDiscount = product.pricingTiers.length > 0 || product.quantityPricing.length > 0;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Sevimliga qo\'shish uchun hisobingizga kiring');
      return;
    }

    try {
      await toggleFavorite(product);
      toast.success(isFav ? 'Sevimlilardan o\'chirildi' : 'Sevimlilarga qo\'shildi');
    } catch (error) {
      toast.error('Sevimlilarni yangilab bo\'lmadi');
    }
  };

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card hover className={cn('overflow-hidden group', className)}>
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
            {product.photos[0] ? (
              <motion.div
                className="h-full w-full"
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={product.photos[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              </motion.div>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700">
                <span className="text-4xl font-bold text-slate-300 dark:text-slate-600">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {hasDiscount && (
                <Badge variant="success" size="sm">
                  Chegirma
                </Badge>
              )}
              {product.totalStock <= 3 && product.totalStock > 0 && (
                <Badge variant="warning" size="sm">
                  {product.totalStock} ta qoldi
                </Badge>
              )}
              {product.totalStock === 0 && (
                <Badge variant="destructive" size="sm">
                  Mavjud emas
                </Badge>
              )}
            </div>

            {/* Favorite Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isHovered || isFav ? 1 : 0, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteClick}
              className={cn(
                'absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center transition-colors',
                isFav
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-800'
              )}
            >
              <Heart className={cn('h-4 w-4', isFav && 'fill-current')} />
            </motion.button>

            {/* Quick View Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-black/20 flex items-center justify-center"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                className="flex gap-2"
              >
                <span className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg">
                  <Eye className="h-5 w-5" />
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-medium line-clamp-2 mb-2 group-hover:text-primary-500 transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-primary-500">
                  {formatPrice(product.dailyPrice)} UZS
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">kuniga</p>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-10 w-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 hover:bg-primary-500 hover:text-white transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
              </motion.div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
