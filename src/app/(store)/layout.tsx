import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/store/CartDrawer';
import { GoogleOneTap } from '@/components/auth/GoogleOneTap';
import { getSettings } from '@/lib/services/settings.service';
import { Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: {
    default: 'Tech Ceylon — Premium Tech Products',
    template: '%s | Tech Ceylon',
  },
};

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  let maintenanceMode = false;
  try {
    const settings = await getSettings();
    maintenanceMode = settings.maintenanceMode;
  } catch (error) {
    console.error("Failed to load settings:", error);
  }

  if (maintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center px-4">
          <Wrench className="w-16 h-16 mx-auto mb-4 text-[var(--accent)] animate-pulse" />
          <h1 className="text-3xl font-bold mb-2">Under Maintenance</h1>
          <p className="text-[var(--text-secondary)]">
            We are currently performing scheduled maintenance. Please check back later.
          </p>
        </div>
      </div>
    );
  }

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
