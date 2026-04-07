'use client';

import { motion } from 'framer-motion';
import { Banknote, Shield, HelpCircle, Wallet } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui';

type PaymentMethod = {
  id: string;
  title: string;
  description: string;
  logo?: string;
  icon?: React.ReactNode;
};

export default function PaymentPage() {
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'payme',
      title: 'Payme',
      description: 'Оплата через приложение Payme',
      logo: '/images/payments/payme.svg',
    },
    {
      id: 'click',
      title: 'Click',
      description: 'Оплата через приложение Click',
      logo: '/images/payments/click.svg',
    },
    {
      id: 'uzum',
      title: 'Uzum',
      description: 'Оплата через Uzum Bank',
      logo: '/images/payments/uzum.svg',
    },
    {
      id: 'cash',
      title: 'Наличные',
      description: 'Оплата при получении',
      icon: <Wallet className="h-10 w-10 text-primary-500" />,
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
        <h1 className="text-4xl font-bold mb-4">Оплата</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Удобные способы оплаты для вашего удобства
        </p>
      </motion.div>

      {/* Payment Methods */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {paymentMethods.map((method, index) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 text-center h-full">
              <div className="h-16 flex items-center justify-center mb-4">
                {method.logo ? (
                  <Image
                    src={method.logo}
                    alt={method.title}
                    width={120}
                    height={48}
                    className="h-12 w-auto object-contain"
                  />
                ) : (
                  method.icon
                )}
              </div>
              <h3 className="font-semibold mb-2">{method.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{method.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Payment Info */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-primary-500" />
              </div>
              <h2 className="text-xl font-semibold">Залог</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              При получении товара вносится залог, который возвращается после возврата оборудования в надлежащем состоянии.
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li>Размер залога зависит от стоимости товара</li>
              <li>Залог возвращается в течение 24 часов</li>
              <li>Возможен безналичный залог</li>
            </ul>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-500" />
              </div>
              <h2 className="text-xl font-semibold">Безопасность</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Все платежи защищены и обрабатываются через официальные платежные системы Узбекистана.
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li>Шифрование всех транзакций</li>
              <li>Мгновенные уведомления об оплате</li>
              <li>Чеки и квитанции об оплате</li>
            </ul>
          </Card>
        </motion.div>
      </div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="h-6 w-6 text-primary-500" />
            <h2 className="text-xl font-semibold">Часто задаваемые вопросы</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Когда нужно оплатить?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Оплата производится при получении товара или онлайн при оформлении заказа.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Можно ли оплатить частями?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Да, для крупных заказов возможна оплата в рассрочку.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Как вернуть залог?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Залог возвращается автоматически после приемки возвращенного оборудования.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
