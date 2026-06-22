'use client';

// Header component for Tech Ceylon public store

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Search, Sun, Moon, Menu, X, ChevronDown } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/lib/firebase/auth';
import { logUserLogout } from '@/lib/services/users.service';
import toast from 'react-hot-toast';
import { getInitials, stringToColor } from '@/lib/utils/formatters';

const NAV_LINKS = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Products', href: ROUTES.PRODUCTS },
  { label: 'Categories', href: ROUTES.CATEGORIES },
  { label: 'About', href: ROUTES.ABOUT },
  { label: 'Contact', href: ROUTES.CONTACT },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { getItemCount } = useCartStore();
  const { theme, toggleTheme, openCart, isMobileMenuOpen, openMobileMenu, closeMobileMenu } = useUIStore();
  const { firebaseUser, isAuthenticated, clearAuth } = useAuthStore();

  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      if (firebaseUser) {
        await logUserLogout(firebaseUser.uid, firebaseUser.displayName || 'User');
      }
      await signOut();
      clearAuth();
      setUserMenuOpen(false);
      toast.success('Signed out successfully');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[var(--bg-primary)]/95 backdrop-blur-md shadow-md border-b border-[var(--border-color)]'
            : 'bg-[var(--bg-primary)] border-b border-[var(--border-color)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={ROUTES.HOME} className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">TC</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-poppins font-700 text-lg text-gradient">Tech Ceylon</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                id="theme-toggle"
                aria-label="Toggle theme"
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {/* Cart Button */}
              <button
                onClick={openCart}
                id="cart-button"
                aria-label="Open cart"
                className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-fade-in">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* User Menu / Sign In */}
              {isAuthenticated && firebaseUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    id="user-menu-button"
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-[var(--bg-secondary)] transition-all"
                  >
                    {firebaseUser.photoURL ? (
                      <Image
                        src={firebaseUser.photoURL}
                        alt={firebaseUser.displayName || 'User'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: stringToColor(firebaseUser.displayName || 'U') }}
                      >
                        {getInitials(firebaseUser.displayName || 'U')}
                      </div>
                    )}
                    <ChevronDown size={14} className="text-[var(--text-muted)] hidden sm:block" />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl z-50 animate-fade-in overflow-hidden">
                        <div className="p-3 border-b border-[var(--border-color)]">
                          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                            {firebaseUser.displayName}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] truncate">
                            {firebaseUser.email}
                          </p>
                        </div>
                        <div className="p-1">
                          <Link
                            href={ROUTES.CART}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-all"
                          >
                            My Cart
                          </Link>
                          <button
                            onClick={handleSignOut}
                            id="sign-out-btn"
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all text-left"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href={ROUTES.LOGIN}
                  id="sign-in-btn"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-blue-500/25"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
                id="mobile-menu-toggle"
                className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
          <nav className="fixed top-16 left-0 right-0 bg-[var(--bg-card)] border-b border-[var(--border-color)] z-40 lg:hidden animate-fade-in shadow-xl">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link
                  href={ROUTES.LOGIN}
                  onClick={closeMobileMenu}
                  className="mt-2 px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl text-center"
                >
                  Sign In with Google
                </Link>
              )}
            </div>
          </nav>
        </>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}
