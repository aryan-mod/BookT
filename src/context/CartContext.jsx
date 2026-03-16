import { createContext, useContext, useState, useCallback } from 'react';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((book) => {
    setItems((prev) => {
      const exists = prev.find((i) => String(i._id) === String(book._id));
      if (exists) return prev;
      return [...prev, book];
    });
  }, []);

  const removeItem = useCallback((bookId) => {
    setItems((prev) => prev.filter((i) => String(i._id) !== String(bookId)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + (i.price || 0), 0);
  const count = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
