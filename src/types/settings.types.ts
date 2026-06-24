// Settings Types for Tech Ceylon

export interface AppSettings {
  storeName: string;
  storeTagline: string;
  storeEmail: string;
  storeLocation: string;
  storePhone: string;
  whatsappNumber: string;
  whatsappMessageTemplate: string;
  maintenanceMode: boolean;
  showOutOfStockProducts: boolean;
  lowStockThreshold: number;
  currency: string;
  currencyCode: string;
  heroStat1Label: string;
  heroStat1Value: string;
  heroStat2Label: string;
  heroStat2Value: string;
  heroStat3Label: string;
  heroStat3Value: string;
  updatedAt?: number;
  updatedBy?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  storeName: 'Tech Ceylon',
  storeTagline: 'Premium Tech Products',
  storeEmail: 'info@techceylon.lk',
  storeLocation: 'Colombo, Sri Lanka',
  storePhone: '+94 77 123 4567',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94771234567',
  whatsappMessageTemplate: 'Hello Tech Ceylon! I would like to order the following items:\n\n{items}\n\n*Order Total: {total}*\n\nMy Details:\n📛 Name: {name}\n📞 Phone: {phone}\n📍 Address: {address}\n\n{notes}',
  maintenanceMode: false,
  showOutOfStockProducts: true,
  lowStockThreshold: 5,
  currency: 'Rs.',
  currencyCode: 'LKR',
  heroStat1Label: 'Products',
  heroStat1Value: '200+',
  heroStat2Label: 'Happy Customers',
  heroStat2Value: '1K+',
  heroStat3Label: 'Categories',
  heroStat3Value: '10+',
};
