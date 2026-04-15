'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface FAQItem {
  question: string;
  answer: string;
}

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span className="font-medium pr-4">{item.question}</span>
        <ChevronDown
          className={cn('h-5 w-5 text-slate-400 shrink-0 transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 text-slate-600 dark:text-slate-400">{item.answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function FAQPage() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqData: FAQItem[] = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
    { question: t('faq.q6'), answer: t('faq.a6') },
    { question: t('faq.q7'), answer: t('faq.a7') },
    { question: t('faq.q8'), answer: t('faq.a8') },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="h-16 w-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="h-8 w-8 text-primary-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4">{t('faq.title')}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          {t('faq.subtitle')}
        </p>
      </motion.div>

      {/* FAQ List */}
      <div className="space-y-3">
        {faqData.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <FAQAccordion
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          </motion.div>
        ))}
      </div>

      {/* Contact CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">
            {t('faq.still_questions')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {t('faq.still_questions_desc')}
          </p>
          <a
            href="/contacts"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
          >
            {t('faq.contact_us')}
          </a>
        </Card>
      </motion.div>
    </div>
  );
}
