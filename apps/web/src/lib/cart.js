'use client';

const KEY = 'zero-npc-cart';

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
  const existing = cart.find((c) => c.productId === item.productId);
  if (existing) existing.quantity += item.quantity || 1;
  else cart.push({ ...item, quantity: item.quantity || 1 });
  setCart(cart);
  return cart;
}

export function removeFromCart(productId) {
  const cart = getCart().filter((c) => c.productId !== productId);
  setCart(cart);
  return cart;
}

export function clearCart() {
  setCart([]);
}

export function totalCents(cart) {
  return cart.reduce((acc, c) => acc + c.priceCents * c.quantity, 0);
}
