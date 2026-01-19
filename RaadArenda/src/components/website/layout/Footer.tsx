'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Instagram, Facebook, Send } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    catalog: [
      { label: 'Barcha kategoriyalar', href: '/catalog' },
      { label: 'Mashhurlar', href: '/catalog?sort=popular' },
      { label: 'Yangiliklar', href: '/catalog?sort=newest' },
    ],
    company: [
      { label: 'Biz haqimizda', href: '/about' },
      { label: 'Yetkazib berish', href: '/delivery' },
      { label: 'Tolov', href: '/payment' },
      { label: 'Kontaktlar', href: '/contacts' },
    ],
    support: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Arenda shartlari', href: '/terms' },
      { label: 'Maxfiylik siyosati', href: '/privacy' },
    ],
  };

  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="font-bold text-xl">RaadArenda</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Toshkentda tadbirlar uchun jihozlar ijarasi. Keng tanlov,
              qulay narxlar, tezkor yetkazib berish.
            </p>
            <div className="flex gap-3">
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors"
              >
                <Send className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          {/* Catalog Links */}
          <div>
            <h3 className="font-semibold mb-4">Katalog</h3>
            <ul className="space-y-2">
              {footerLinks.catalog.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Kompaniya</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Kontaktlar</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+998901234567"
                  className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors text-sm"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  +998 90 123 45 67
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@raadarenda.uz"
                  className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors text-sm"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  info@raadarenda.uz
                </a>
              </li>
              <li className="flex items-start gap-3 text-slate-500 dark:text-slate-400 text-sm">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Toshkent sh., Amir Temur ko&apos;chasi, 1</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-200 dark:border-slate-700 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {currentYear} RaadArenda. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex gap-6">
            {footerLinks.support.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
