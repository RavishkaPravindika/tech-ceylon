// Slug utility for Tech Ceylon

/**
 * Convert a string to a URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generate a unique slug by appending a short timestamp suffix if needed
 */
export function generateSlug(name: string): string {
  const base = slugify(name);
  const suffix = Date.now().toString(36).slice(-4);
  return `${base}-${suffix}`;
}
