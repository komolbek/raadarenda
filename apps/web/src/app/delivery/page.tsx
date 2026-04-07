'use client';

import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, Package, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui';

export default function DeliveryPage() {
  const deliverySteps = [
    {
      icon: Package,
      title: 'Оформите заказ',
      description: 'Выберите товары и укажите даты аренды',
    },
    {
      icon: CheckCircle,
      title: 'Подтверждение',
      description: 'Мы свяжемся с вами для подтверждения',
    },
    {
      icon: Truck,
      title: 'Доставка',
      description: 'Привезем в удобное для вас время',
    },
    {
      icon: Clock,
      title: 'Возврат',
      description: 'Заберем после окончания аренды',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Доставка</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Мы доставляем оборудование по всему Ташкенту
        </p>
      </motion.div>

      {/* Delivery Info */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary-500" />
              </div>
              <h2 className="text-xl font-semibold">Зона доставки</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Мы осуществляем доставку по всему Ташкенту. Доставка бесплатная при заказе от 500 000 сум.
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li>Центр города - бесплатно</li>
              <li>Спальные районы - от 30 000 сум</li>
              <li>Пригород - договорная</li>
            </ul>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary-500" />
              </div>
              <h2 className="text-xl font-semibold">Время доставки</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Доставляем в удобное для вас время. Рекомендуем заказывать за 1-2 дня до мероприятия.
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li>Стандартная доставка: 09:00 - 21:00</li>
              <li>Срочная доставка: в течение 3 часов</li>
              <li>Ночная доставка: по договоренности</li>
            </ul>
          </Card>
        </motion.div>
      </div>

      {/* Process Steps */}
      <h2 className="text-2xl font-bold text-center mb-8">
        Как это работает
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {deliverySteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 text-center h-full">
              <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                <step.icon className="h-6 w-6 text-primary-500" />
              </div>
              <div className="text-sm font-medium text-primary-500 mb-2">
                {'Шаг'} {index + 1}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{step.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
