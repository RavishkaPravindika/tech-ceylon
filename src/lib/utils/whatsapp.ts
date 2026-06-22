// WhatsApp utility for Tech Ceylon

import { WHATSAPP_NUMBER } from '@/lib/constants/config';
import { WhatsAppOrderMessage } from '@/types/order.types';
import { formatPrice } from './formatters';

/**
 * Generate a formatted WhatsApp order message
 */
export function generateWhatsAppMessage(order: WhatsAppOrderMessage): string {
  const { customerInfo, items, total } = order;

  const itemLines = items
    .map(
      (item, index) =>
        `${index + 1}.\nProduct: ${item.name}\nCode: ${item.productCode}\nQty: ${item.quantity}\nPrice: ${formatPrice(item.subtotal)}`
    )
    .join('\n\n');

  const message = `Hello Tech Ceylon,

I would like to place an order.

*Customer:*
Name: ${customerInfo.name}
Phone: ${customerInfo.phone}
Email: ${customerInfo.email}
Address: ${customerInfo.address}

*Products:*

${itemLines}

*Total: ${formatPrice(total)}*${
    customerInfo.notes
      ? `

*Notes:*
${customerInfo.notes}`
      : ''
  }

Thank you.`;

  return message;
}

/**
 * Generate a WhatsApp URL with the encoded order message
 */
export function generateWhatsAppURL(order: WhatsAppOrderMessage, number?: string): string {
  const phone = number || WHATSAPP_NUMBER;
  const message = generateWhatsAppMessage(order);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}

/**
 * Open WhatsApp in a new tab with the order message
 */
export function openWhatsApp(order: WhatsAppOrderMessage, number?: string): void {
  const url = generateWhatsAppURL(order, number);
  window.open(url, '_blank', 'noopener,noreferrer');
}
