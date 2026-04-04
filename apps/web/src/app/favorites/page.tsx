'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button, EmptyState, ProductCardSkeleton } from '@/components/ui';
import { ProductCard } from '@/components/catalog/ProductCard';
import { AuthGuard } from '@/components/auth-guard';
import { useFavoritesStore } from '@/stores/favorites-store';
import { useAuthStore } from '@/stores/auth-store';

function FavoritesPageContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { favorites, isLoading, fetchFavorites } = useFavoritesStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Избранное</h1>
          <p className="text-muted-foreground">
            {favorites.length} товаров
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-16 w-16" />}
          title="Нет избранных товаров"
          description="Добавляйте понравившиеся товары в избранное, чтобы быстро их найти"
          action={
            <Link href="/catalog">
              <Button size="lg" variant="gradient">
                Перейти в каталог
              </Button>
            </Link>
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {favorites.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <AuthGuard>
      <FavoritesPageContent />
    </AuthGuard>
  );
}
