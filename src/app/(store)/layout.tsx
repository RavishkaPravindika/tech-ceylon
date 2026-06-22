import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/store/CartDrawer';
import { GoogleOneTap } from '@/components/auth/GoogleOneTap';

export const metadata: Metadata = {
  title: {
    default: 'Tech Ceylon — Premium Tech Products',
    template: '%s | Tech Ceylon',
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartDrawer />
      <GoogleOneTap />
    </>
  );
}
