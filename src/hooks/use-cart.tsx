'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CartItem, Product } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitial, setIsInitial] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Solo se ejecuta en el cliente
    try {
        const storedCart = localStorage.getItem('caliope_cart');
        if (storedCart) {
          setItems(JSON.parse(storedCart));
        }
    } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        setItems([]);
    }
    setIsInitial(false);
  }, []);
  
  useEffect(() => {
    // No guardar en localStorage durante el renderizado inicial en el servidor
    if (!isInitial) {
      localStorage.setItem('caliope_cart', JSON.stringify(items));
    }
  }, [items, isInitial]);

  const addItem = (product: Product, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { product, quantity }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      setItems(prevItems =>
        prevItems.map(item =>
          item.product.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const value = { items, addItem, removeItem, updateItemQuantity, clearCart, totalItems, totalPrice };
  
  // Evitar renderizar children hasta que esté montado para prevenir hydration mismatch
  // si el contenido depende del estado inicial del carrito.
  // Sin embargo, para SEO y renderizado inicial rápido, es mejor renderizar children.
  // Pero si el error es grave, devolvemos null hasta montar.
  // En este caso, devolveremos children envueltos en el provider siempre, 
  // confiando en que useEffect maneja la sincronización.
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
