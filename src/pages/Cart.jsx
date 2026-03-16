import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, BookOpen, CreditCard, CheckCircle, ArrowLeft, Package } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { ToastContext } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, clearCart, total, count } = useCart();
  const { showToast } = useContext(ToastContext) || {};
  const { user } = useContext(AuthContext);
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setChecking(true);
    setError('');
    try {
      const payload = { items: items.map((b) => ({ bookId: b._id, price: b.price || 0 })) };
      const { data } = await api.post('/orders/checkout', payload);
      setSuccess(true);
      clearCart();
      showToast?.(`🎉 ${data?.data?.newBooksAdded || items.length} book(s) added to your library!`);
      // Check for new badges
      api.post('/gamification/check-badges').catch(() => {});
    } catch (err) {
      setError(err?.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-gray-950 dark:to-violet-950 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 text-center max-w-md w-full border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Purchase Complete!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Your books have been added to your library. Start reading!</p>
          <div className="flex flex-col gap-3">
            <Link to="/dashboard" className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-colors text-center">
              Go to Library
            </Link>
            <Link to="/marketplace" className="w-full py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Browse More
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Discover books in the marketplace.</p>
          <Link to="/marketplace" className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-colors">
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/marketplace')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium mb-6">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Shopping Cart <span className="text-gray-400 font-normal text-lg">({count})</span>
            </h1>

            <AnimatePresence>
              {items.map((book) => {
                const cover = book.cover || book.coverImage || book.thumbnail;
                return (
                  <motion.div
                    key={book._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4"
                  >
                    <div className="w-14 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950 dark:to-indigo-950 flex-shrink-0">
                      {cover ? (
                        <img src={cover} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-violet-300 dark:text-violet-700" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{book.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{book.author}</p>
                      <p className="text-sm font-bold text-violet-600 dark:text-violet-400 mt-1">
                        {book.price ? `₹${book.price.toFixed(2)}` : 'Free'}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(book._id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-5">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({count} item{count !== 1 ? 's' : ''})</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Digital Delivery</span>
                  <span className="text-emerald-500">Free</span>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between font-bold text-gray-900 dark:text-white text-base">
                  <span>Total</span>
                  <span className="text-violet-600 dark:text-violet-400">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                onClick={handleCheckout}
                disabled={checking}
                className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-70 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {checking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Confirm Purchase
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Package className="w-3.5 h-3.5" />
                Books instantly added to your library
              </div>

              {!user && (
                <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                  You need to <Link to="/login" className="underline font-medium">sign in</Link> to complete your purchase.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
