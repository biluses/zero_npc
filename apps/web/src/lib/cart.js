'use client';

const KEY = 'zero-npc-cart';

/**
 * Cart item shape (unificado):
 *   { id, name, priceCents, currency, imageUrl, qty, color?, size? }
 */

export function getCart() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function setCart(items) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToCart(item) {
  const cart = getCart();
  const variantKey = `${item.id}::${item.color || ''}::${item.size || ''}`;
  const existing = cart.find((c) => `${c.id}::${c.color || ''}::${c.size || ''}` === variantKey);
  if (existing) {
    existing.qty += item.qty || 1;
  } else {
    cart.push({ qty: 1, ...item });
  }
  setCart(cart);
  return cart;
}

export function removeFromCart(id) {
  const cart = getCart().filter((c) => c.id !== id);
  setCart(cart);
  return cart;
}

export function clearCart() {
  setCart([]);
}

export function totalCents(cart) {
  return cart.reduce((acc, c) => acc + (c.priceCents || 0) * (c.qty || 1), 0);
}
