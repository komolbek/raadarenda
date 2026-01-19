import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Instagram, Facebook, Send } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    catalog: [
      { label: 'Все категории', href: '/catalog' },
      { label: 'Популярное', href: '/catalog?sort=popular' },
      { label: 'Новинки', href: '/catalog?sort=newest' },
    ],
    company: [
      { label: 'О нас', href: '/about' },
      { label: 'Доставка', href: '/delivery' },
      { label: 'Оплата', href: '/payment' },
      { label: 'Контакты', href: '/contacts' },
    ],
    support: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Условия аренды', href: '/terms' },
      { label: 'Политика конфиденциальности', href: '/privacy' },
    ],
  };

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="font-bold text-xl">EventRent</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Аренда оборудования для мероприятий в Ташкенте. Широкий выбор,
              доступные цены, быстрая доставка.
            </p>
            <div className="flex gap-3">
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <Send className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          {/* Catalog Links */}
          <div>
            <h3 className="font-semibold mb-4">Каталог</h3>
            <ul className="space-y-2">
              {footerLinks.catalog.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Компания</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+998901234567"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  +998 90 123 45 67
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@eventrent.uz"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  info@eventrent.uz
                </a>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>г. Ташкент, ул. Амир Темур, 1</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} EventRent. Все права защищены.
          </p>
          <div className="flex gap-6">
            {footerLinks.support.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
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
