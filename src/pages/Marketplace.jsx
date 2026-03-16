import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Star, Search, TrendingUp, Award, Sparkles,
  BookOpen, SlidersHorizontal, ChevronLeft, ChevronRight, Store
} from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { ToastContext } from '../context/ToastContext';

const GENRES = ['Fiction','Non-Fiction','Science','History','Fantasy','Mystery','Romance','Biography','Technology','Self-Help'];

function StarRating({ rating }) {
  const r = Math.round(Math.max(0, Math.min(5, rating || 0)));
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`w-3 h-3 ${s <= r ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
      ))}
    </div>
  );
}

function PriceTag({ price }) {
  if (!price || price === 0) return <span className="text-emerald-400 font-bold text-sm">Free</span>;
  return <span className="text-violet-400 font-bold text-sm">₹{price.toFixed(2)}</span>;
}

function MktBookCard({ book, onAddToCart, isInCart }) {
  const cover = book.cover || book.coverImage || book.thumbnail;
  const rating = book.averageRating || 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="book-card-explore flex flex-col group"
    >
      <Link to={`/marketplace/${book._id}`} className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: '2/3' }}>
        {cover ? (
          <img src={cover} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/40 to-slate-900/70">
            <BookOpen className="w-10 h-10 text-violet-600/40" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        {book.isFeatured && (
          <span className="absolute top-2 left-2 badge-amber flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" />Featured</span>
        )}
        {book.isPremium && !book.isFeatured && (
          <span className="absolute top-2 left-2 badge-violet">PRO</span>
        )}
      </Link>
      <div className="p-3.5 flex flex-col flex-1 gap-2">
        <div>
          <Link to={`/marketplace/${book._id}`} className="text-sm font-semibold text-white line-clamp-2 hover:text-violet-300 transition-colors leading-snug">
            {book.title}
          </Link>
          <p className="text-xs text-slate-600 mt-0.5 truncate">{book.author}</p>
        </div>
        {(book.genre || []).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(book.genre || []).slice(0,2).map(g => (
              <span key={g} className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded-full">{g}</span>
            ))}
          </div>
        )}
        {rating > 0 && (
          <div className="flex items-center gap-1">
            <StarRating rating={rating} />
            <span className="text-[10px] text-slate-600">({book.reviewCount || 0})</span>
          </div>
        )}
        <div className="mt-auto pt-2 border-t border-white/[0.05] flex items-center justify-between">
          <PriceTag price={book.price} />
          <button
            onClick={() => onAddToCart(book)}
            disabled={isInCart}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isInCart
                ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 cursor-default'
                : 'bg-violet-600 hover:bg-violet-500 text-white active:scale-95 shadow-[0_0_10px_rgba(124,58,237,0.3)]'
            }`}
          >
            <ShoppingCart className="w-3 h-3" />
            {isInCart ? 'In Cart' : (book.price ? 'Buy' : 'Get Free')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function MktBookSkeleton() {
  return (
    <div className="book-card-explore overflow-hidden animate-pulse">
      <div className="skeleton" style={{ aspectRatio: '2/3' }} />
      <div className="p-3.5 space-y-2">
        <div className="skeleton h-4 rounded w-4/5" />
        <div className="skeleton h-3 rounded w-1/2" />
        <div className="skeleton h-6 rounded-lg mt-2" />
      </div>
    </div>
  );
}

function FeaturedCarousel({ books }) {
  const [idx, setIdx] = useState(0);
  const { addItem, items } = useCart();
  const book = books[idx];
  const cover = book?.cover || book?.coverImage;
  const isInCart = items.some(i => String(i._id) === String(book?._id));

  useEffect(() => {
    if (books.length < 2) return;
    const t = setInterval(() => setIdx(p => (p + 1) % books.length), 5000);
    return () => clearInterval(t);
  }, [books.length]);

  if (!book) return null;
  return (
    <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 flex items-end border border-white/[0.06]">
      {cover && <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060611] via-[#060611]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#060611]/80 via-transparent" />

      <div className="relative z-10 p-6 md:p-8 max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            {book.isFeatured && (
              <span className="inline-flex items-center gap-1 badge-amber mb-2"><Sparkles className="w-2.5 h-2.5" />Featured</span>
            )}
            <h2 className="text-xl md:text-2xl font-bold text-white line-clamp-2 mb-1">{book.title}</h2>
            <p className="text-violet-300 text-sm mb-4">{book.author}</p>
            <div className="flex items-center gap-3">
              <Link to={`/marketplace/${book._id}`}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-[0_0_15px_rgba(124,58,237,0.4)]">
                View Book
              </Link>
              <button onClick={() => addItem(book)} disabled={isInCart}
                className={`px-5 py-2 rounded-xl font-semibold text-sm transition-colors border ${
                  isInCart ? 'border-emerald-400/40 text-emerald-400' : 'border-white/20 text-white hover:bg-white/10'
                }`}>
                {isInCart ? '✓ In Cart' : (book.price ? `₹${book.price}` : 'Free')}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      {books.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
          {books.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-violet-400' : 'w-1.5 bg-white/30'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Marketplace() {
  const { addItem, items } = useCart();
  const { showToast } = useContext(ToastContext) || {};
  const navigate = useNavigate();

  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [books, setBooks]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [total, setTotal]                 = useState(0);
  const [page, setPage]                   = useState(1);
  const [activeTab, setActiveTab]         = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [search, setSearch]               = useState('');
  const [sort, setSort]                   = useState('newest');
  const [showFilters, setShowFilters]     = useState(false);

  const cartSet = new Set(items.map(i => String(i._id)));
  const TABS = [
    { id: 'all',         label: 'All Books',   icon: BookOpen },
    { id: 'trending',    label: 'Trending',    icon: TrendingUp },
    { id: 'bestsellers', label: 'Bestsellers', icon: Award },
  ];

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/marketplace';
      const params = { page, limit: 15, sort };
      if (selectedGenre) params.genre = selectedGenre;
      if (search) params.search = search;
      if (activeTab === 'trending')    url = '/marketplace/trending';
      else if (activeTab === 'bestsellers') url = '/marketplace/bestsellers';
      const { data } = await api.get(url, { params });
      const booksData = data?.data?.books || [];
      setBooks(booksData);
      setTotal(data?.data?.pagination?.total || booksData.length);
    } catch { setBooks([]); }
    finally { setLoading(false); }
  }, [page, sort, selectedGenre, search, activeTab]);

  useEffect(() => { api.get('/marketplace/featured').then(({ data }) => setFeaturedBooks(data?.data?.books || [])).catch(() => {}); }, []);
  useEffect(() => { setPage(1); }, [activeTab, selectedGenre, search, sort]);
  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleAddToCart = (book) => {
    addItem(book);
    showToast?.(`"${book.title}" added to cart!`);
  };

  return (
    <div className="pb-20">
      {/* ── Hero ──────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/[0.04] bg-gradient-to-r from-[#080814] via-[#0a0920] to-[#080814] pt-10 pb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-violet-600/8 blur-[80px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-400 text-xs font-semibold flex items-center gap-1">
                <Store className="w-3 h-3" /> Marketplace
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Book <span className="gradient-text">Marketplace</span>
            </h1>
            <p className="mt-2 text-slate-500 text-sm max-w-md">Premium books for every reader. Browse, buy, and start reading instantly.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Featured Carousel */}
        {featuredBooks.length > 0 && <FeaturedCarousel books={featuredBooks} />}

        {/* Tabs + Filters Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 gap-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === id
                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="pl-8 pr-3 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500/40 w-40 transition-all" />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="nx-select text-xs py-1.5 pl-2.5 pr-7 h-8">
              <option value="newest" className="bg-[#12122a]">Newest</option>
              <option value="popular" className="bg-[#12122a]">Popular</option>
              <option value="rating" className="bg-[#12122a]">Top Rated</option>
              <option value="price-asc" className="bg-[#12122a]">Price ↑</option>
              <option value="price-desc" className="bg-[#12122a]">Price ↓</option>
            </select>
            <button onClick={() => setShowFilters(p => !p)}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-xl border text-xs font-medium transition-all ${
                showFilters ? 'border-violet-500/40 bg-violet-600/15 text-violet-400' : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:text-slate-300'
              }`}>
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
            </button>
          </div>
        </div>

        {/* Genre pills */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedGenre('')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  !selectedGenre ? 'border-violet-500/40 bg-violet-600/25 text-violet-300' : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:text-slate-300 hover:border-white/20'
                }`}>All</button>
              {GENRES.map(g => (
                <button key={g} onClick={() => setSelectedGenre(g === selectedGenre ? '' : g)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedGenre === g ? 'border-violet-500/40 bg-violet-600/25 text-violet-300' : 'border-white/[0.08] bg-white/[0.03] text-slate-500 hover:text-slate-300 hover:border-white/20'
                  }`}>{g}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cart quick-access */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-600">{!loading && `${total || books.length} books`}</p>
          <button onClick={() => navigate('/cart')}
            className="relative flex items-center gap-2 px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/25 text-violet-400 rounded-xl text-xs font-semibold transition-all">
            <ShoppingCart className="w-3.5 h-3.5" /> Cart
            {items.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-violet-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </button>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <MktBookSkeleton key={i} />)
            : books.map(book => (
                <MktBookCard key={book._id} book={book} onAddToCart={handleAddToCart} isInCart={cartSet.has(String(book._id))} />
              ))
          }
        </div>

        {!loading && books.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
              <BookOpen className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No books found</h3>
            <p className="text-slate-600 text-sm">Try adjusting your filters or search.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && books.length > 0 && activeTab === 'all' && (
          <div className="flex items-center justify-center gap-4">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass border border-white/[0.08] text-sm font-medium text-slate-300 hover:text-white hover:border-violet-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm text-slate-500 font-mono">Page {page}</span>
            <button disabled={books.length < 15} onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass border border-white/[0.08] text-sm font-medium text-slate-300 hover:text-white hover:border-violet-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
