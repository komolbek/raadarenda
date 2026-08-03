'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, Truck, Shield, Clock, Phone, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { CategoryCard } from '@/components/catalog/CategoryCard';
import { settingsApi, categoriesApi } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/useTranslation';

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function HomePage() {
  const { t } = useTranslation();

  const { data: settings } = useQuery({
    queryKey: ['businessSettings'],
    queryFn: () => settingsApi.getBusinessInfo(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', 'home'],
    queryFn: categoriesApi.getAll,
  });

  const phoneNumber = settings?.phone || '+998901234567';

  const features = [
    {
      icon: Sparkles,
      title: t('home.feature_wide_selection'),
      description: t('home.feature_wide_selection_desc'),
    },
    {
      icon: Truck,
      title: t('home.feature_fast_delivery'),
      description: t('home.feature_fast_delivery_desc'),
    },
    {
      icon: Shield,
      title: t('home.feature_quality'),
      description: t('home.feature_quality_desc'),
    },
    {
      icon: Clock,
      title: t('home.feature_flexible'),
      description: t('home.feature_flexible_desc'),
    },
  ];

  // Marquee reuses the (translated) feature titles so nothing hard-codes text.
  const marqueeItems = [...features.map((f) => f.title), ...features.map((f) => f.title)];

  // Map the API shape (imageUrl / iconName) to the UI Category type the card
  // expects, applying the same name localization used across the catalog.
  const localizeName = (name: string) => {
    const translated = t(`category_name.${name}` as never);
    return translated.startsWith('category_name.') ? name : translated;
  };
  const topCategories = (categories ?? [])
    .filter((c) => !c.parentCategoryId)
    .slice(0, 8)
    .map((c) => ({
      id: c.id,
      name: localizeName(c.name),
      image: c.imageUrl,
      icon: c.iconName,
      parentCategoryId: c.parentCategoryId,
      displayOrder: c.displayOrder,
      isActive: c.isActive,
      _count: c._count,
      createdAt: c.createdAt,
    }));

  return (
    <div className="pb-8">
      {/* ================= HERO ================= */}
      <section className="container mx-auto px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="u-grain relative overflow-hidden rounded-3xl bg-brand-graphite text-white"
        >
          {/* Backdrop layers */}
          <div className="bg-dotgrid absolute inset-0 text-white/[0.14]" aria-hidden="true" />
          <div
            className="absolute -right-32 -top-24 h-[28rem] w-[28rem] rounded-full opacity-70 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(242,86,41,0.55), transparent 62%)' }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-40 -left-24 h-[24rem] w-[24rem] rounded-full opacity-50 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.4), transparent 65%)' }}
            aria-hidden="true"
          />

          <div className="relative z-10 px-6 pt-12 pb-10 sm:px-10 md:px-14 md:pt-20 md:pb-14">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="eyebrow mb-6 inline-flex items-center gap-2 text-primary-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t('home.hero_badge')}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="font-display max-w-4xl text-4xl font-semibold leading-[1.03] sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {t('home.hero_title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg"
            >
              {t('home.hero_description')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link href="/catalog">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  {t('home.view_catalog')}
                </Button>
              </Link>
              <a href={`tel:${phoneNumber}`}>
                <Button
                  size="lg"
                  className="border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/35 shadow-none"
                  leftIcon={<Phone className="h-5 w-5" />}
                >
                  {t('home.call')}
                </Button>
              </a>
            </motion.div>
          </div>

          {/* Marquee strip */}
          <div className="relative z-10 border-t border-white/10 py-4">
            <div className="marquee-mask overflow-hidden">
              <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
                {marqueeItems.map((label, i) => (
                  <span key={i} className="flex items-center gap-8 text-sm text-white/45">
                    <span className="font-display italic">{label}</span>
                    <span className="text-primary">✦</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================= CATEGORIES ================= */}
      {topCategories.length > 0 && (
        <section className="container mx-auto px-4 pt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3 text-primary">{t('nav.catalog')}</p>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                {t('footer.all_categories')}
              </h2>
            </div>
            <Link
              href="/catalog"
              className="link-underline hidden shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              {t('home.view_catalog')}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
          >
            {topCategories.map((category) => (
              <motion.div key={category.id} variants={itemVariants}>
                <CategoryCard category={category} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* ================= FEATURES (editorial) ================= */}
      <section className="container mx-auto px-4 pt-20">
        <p className="eyebrow mb-3 text-primary">{t('home.why_eyebrow')}</p>
        <h2 className="font-display mb-10 max-w-2xl text-3xl font-semibold sm:text-4xl">
          {t('home.why_title')}
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative -mb-px -mr-px border-b border-r border-border p-7 transition-colors hover:bg-muted/40"
            >
              <span className="font-mono text-xs text-muted-foreground/60">
                {`0${index + 1}`}
              </span>
              <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ================= CTA ================= */}
      <section className="container mx-auto px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="u-grain relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 text-center sm:px-10 md:py-20"
        >
          <div
            className="absolute inset-x-0 -top-24 mx-auto h-56 w-[36rem] max-w-full opacity-60 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(242,86,41,0.25), transparent 60%)' }}
            aria-hidden="true"
          />
          <p className="eyebrow relative mb-5 text-primary">rent event.</p>
          <h2 className="font-display relative mx-auto max-w-2xl text-3xl font-semibold sm:text-4xl md:text-5xl">
            {t('home.cta_title')}
          </h2>
          <p className="relative mx-auto mt-5 max-w-lg text-muted-foreground">
            {t('home.cta_description')}
          </p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/catalog">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="h-5 w-5" />}>
                {t('home.go_to_catalog')}
              </Button>
            </Link>
            <a href={`tel:${phoneNumber}`}>
              <Button size="lg" variant="outline" leftIcon={<Phone className="h-5 w-5" />}>
                {t('home.call')}
              </Button>
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
