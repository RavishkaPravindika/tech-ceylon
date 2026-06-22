'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { useSettings } from '@/hooks/useSettings';
import { WHATSAPP_NUMBER, PHONE_NUMBER } from '@/lib/constants/config';

const FOOTER_LINKS = {
  shop: [
    { label: 'All Products', href: ROUTES.PRODUCTS },
    { label: 'Categories', href: ROUTES.CATEGORIES },
    { label: 'Featured', href: `${ROUTES.PRODUCTS}?featured=true` },
  ],
  company: [
    { label: 'About Us', href: ROUTES.ABOUT },
    { label: 'Contact', href: ROUTES.CONTACT },
  ],
  support: [
    { label: 'WhatsApp Us', href: '#' },
    { label: 'Order Help', href: ROUTES.CONTACT },
  ],
};

export function Footer() {
  const { settings } = useSettings();

  const whatsapp = settings.whatsappNumber || WHATSAPP_NUMBER;
  const phone = settings.storePhone || PHONE_NUMBER;
  const email = settings.storeEmail || 'info@techceylon.lk';
  const location = settings.storeLocation || 'Colombo, Sri Lanka';

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href={ROUTES.HOME} className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow">
                <span className="text-white font-bold text-sm">TC</span>
              </div>
              <span className="font-poppins font-semibold text-lg text-gradient">Tech Ceylon</span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
              Your trusted source for premium technology products in Sri Lanka. 
              Order conveniently via WhatsApp.
            </p>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              id="footer-whatsapp-link"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-all shadow-md"
            >
              <MessageCircle size={16} />
              WhatsApp Order
            </a>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info — live from settings */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <Phone size={15} className="mt-0.5 shrink-0 text-blue-500" />
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-blue-600 transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <Mail size={15} className="mt-0.5 shrink-0 text-blue-500" />
                <a href={`mailto:${email}`} className="hover:text-blue-600 transition-colors">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <MapPin size={15} className="mt-0.5 shrink-0 text-blue-500" />
                <span>{location}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} Tech Ceylon. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[var(--text-muted)]">Orders via</span>
            <span className="text-xs font-medium text-green-600 ml-1">WhatsApp</span>
            <span className="text-xs text-[var(--text-muted)] mx-1">·</span>
            <span className="text-xs text-[var(--text-muted)]">No online payments</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
