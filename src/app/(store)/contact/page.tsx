'use client';

import { MessageCircle, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { WHATSAPP_NUMBER, PHONE_NUMBER, SUPER_ADMIN_EMAIL } from '@/lib/constants/config';

export default function ContactPage() {
  const { settings, isLoading } = useSettings();

  const whatsapp = settings.whatsappNumber || WHATSAPP_NUMBER;
  const phone = settings.storePhone || PHONE_NUMBER;
  const email = settings.storeEmail || SUPER_ADMIN_EMAIL;
  const location = settings.storeLocation || 'Colombo, Sri Lanka';

  const CONTACT_ITEMS = [
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      detail: `+${whatsapp}`,
      href: `https://wa.me/${whatsapp}`,
      badge: 'Fastest Response',
      badgeColor: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
    },
    {
      icon: Mail,
      title: 'Email',
      detail: email,
      href: `mailto:${email}`,
    },
    {
      icon: Phone,
      title: 'Phone',
      detail: phone,
      href: `tel:${phone.replace(/\s/g, '')}`,
    },
    {
      icon: MapPin,
      title: 'Location',
      detail: location,
      href: 'https://maps.google.com',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      detail: 'Mon – Sat: 9AM – 6PM',
      href: null,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-poppins font-bold text-[var(--text-primary)] mb-4">Contact Us</h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
          Have a question about a product? Want to place an order? We&apos;re here to help.
          The fastest way to reach us is via WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Contact Cards */}
        <div className="space-y-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 shimmer rounded-2xl" />
              ))
            : CONTACT_ITEMS.map(({ icon: Icon, title, detail, href, badge, badgeColor }) => {
                const content = (
                  <div className="flex items-center gap-4 p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl hover:border-blue-200 dark:hover:border-blue-800 transition-all group card-hover">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Icon size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-[var(--text-muted)] mb-0.5">{title}</p>
                      <p className="font-medium text-[var(--text-primary)]">{detail}</p>
                    </div>
                    {badge && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg ${badgeColor}`}>
                        {badge}
                      </span>
                    )}
                  </div>
                );

                return href ? (
                  <a key={title} href={href} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                ) : (
                  <div key={title}>{content}</div>
                );
              })}
        </div>

        {/* WhatsApp CTA */}
        <div className="flex flex-col items-center justify-center text-center bg-brand-gradient rounded-3xl p-10 text-white">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
            <MessageCircle size={36} />
          </div>
          <h2 className="text-2xl font-poppins font-bold mb-3">Chat on WhatsApp</h2>
          <p className="text-blue-100 mb-8 leading-relaxed">
            The fastest way to get help, ask about products, or place an order is directly via WhatsApp.
            We typically respond within minutes during business hours.
          </p>
          <a
            href={`https://wa.me/${whatsapp}?text=Hello Tech Ceylon, I have a question about a product.`}
            target="_blank"
            rel="noopener noreferrer"
            id="contact-whatsapp-btn"
            className="flex items-center gap-2 px-8 py-4 bg-white text-green-700 font-bold rounded-2xl hover:bg-green-50 transition-all shadow-xl"
          >
            <MessageCircle size={20} />
            Start WhatsApp Chat
          </a>
        </div>
      </div>
    </div>
  );
}
