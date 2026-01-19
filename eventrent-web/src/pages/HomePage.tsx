import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Sparkles, Truck, Shield, Clock } from 'lucide-react';
import { categoriesApi, productsApi } from '@/lib/api';
import { Button, Card, CategoryCardSkeleton, ProductCardSkeleton } from '@/components/ui';
import { ProductCard } from '@/components/catalog/ProductCard';
import { CategoryCard } from '@/components/catalog/CategoryCard';

const features = [
  {
    icon: Sparkles,
    title: 'Широкий выбор',
    description: 'Более 500 товаров для любых мероприятий',
  },
  {
    icon: Truck,
    title: 'Быстрая доставка',
    description: 'Доставка по Ташкенту в день заказа',
  },
  {
    icon: Shield,
    title: 'Гарантия качества',
    description: 'Все товары проходят проверку',
  },
  {
    icon: Clock,
    title: 'Гибкие сроки',
    description: 'Аренда от 1 дня до месяца',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function HomePage() {
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { data: popularProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'popular'],
    queryFn: () => productsApi.getAll({ limit: 8, sort: 'popular' }),
  });

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 p-8 md:p-12 lg:p-16"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm mb-4"
            >
              Аренда для мероприятий
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
            >
              Всё для вашего идеального мероприятия
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/80 mb-8 max-w-lg"
            >
              Мебель, декор, свет, звук и многое другое. Арендуйте всё необходимое
              для свадьбы, корпоратива или частной вечеринки.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/catalog">
                <Button
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-white/90 shadow-xl"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Смотреть каталог
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card variant="outline" className="p-6 h-full">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Категории</h2>
            <p className="text-muted-foreground">Найдите то, что вам нужно</p>
          </div>
          <Link to="/catalog">
            <Button variant="ghost" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Все категории
            </Button>
          </Link>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {categories?.slice(0, 6).map((category) => (
              <motion.div key={category.id} variants={itemVariants}>
                <CategoryCard category={category} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Popular Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Популярные товары</h2>
            <p className="text-muted-foreground">Чаще всего арендуют</p>
          </div>
          <Link to="/catalog?sort=popular">
            <Button variant="ghost" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Все товары
            </Button>
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {popularProducts?.items.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-muted p-8 md:p-12 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Готовы организовать мероприятие?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Выберите всё необходимое из нашего каталога или свяжитесь с нами
            для индивидуального подбора.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/catalog">
              <Button size="lg" variant="gradient">
                Перейти в каталог
              </Button>
            </Link>
            <Link to="/contacts">
              <Button size="lg" variant="outline">
                Связаться с нами
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
