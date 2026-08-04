'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Category } from '@/types';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { resolveCategoryIcon } from '@/lib/categoryIcon';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const { t } = useTranslation();
  const LucideIcon = resolveCategoryIcon(category.icon);
  // A raw icon *name* (e.g. "monitor") that isn't in the map must never render
  // as text — only render category.icon directly when it's an actual emoji.
  const isEmoji = !!category.icon && !LucideIcon && !/^[\x00-\x7F]+$/.test(category.icon);
  return (
    <Link href={`/catalog?category=${category.id}`} className="block h-full">
      <motion.div whileTap={{ scale: 0.98 }} className="h-full">
        <Card
          hover
          className={cn(
            'group relative flex h-full flex-col justify-between gap-6 overflow-hidden p-5',
            className
          )}
        >
          {/* Corner action affordance */}
          <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </span>

          {category.image ? (
            <div className="h-14 w-14 overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : LucideIcon ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/15">
              <LucideIcon className="h-6 w-6" />
            </div>
          ) : isEmoji ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl transition-colors duration-300 group-hover:bg-primary/15">
              {category.icon}
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary-100),var(--color-accent-100))] dark:bg-[linear-gradient(135deg,rgba(242,86,41,0.18),rgba(245,158,11,0.14))]">
              <span className="font-display text-2xl font-semibold text-primary">
                {category.name.charAt(0)}
              </span>
            </div>
          )}

          <div>
            <h3 className="font-medium leading-snug transition-colors group-hover:text-primary">
              {category.name}
            </h3>
            {category._count?.products !== undefined && (
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {t('category.products_count', { count: category._count.products })}
              </p>
            )}
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
