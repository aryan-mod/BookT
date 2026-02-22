import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Plus, Send, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import api from '../api/axios';
import Header from '../components/Header';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

const requestBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(200),
  pages: z.coerce.number().min(0).optional().default(0),
  description: z.string().max(2000).optional().default(''),
});

function normalizeBook(book) {
  if (!book) return null;
  return { ...book, id: book.id || book._id };
}

function getErrorMessage(err) {
  const msg = err.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return err.message || 'Request failed';
}

export default function Explore() {
  const { user, logout } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext) || {};
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(requestBookSchema),
    defaultValues: { title: '', author: '', pages: 0, description: '' },
  });

  const fetchExploreBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/books/explore');
      const raw = response.data?.data?.books;
      const list = Array.isArray(raw) ? raw.map(normalizeBook) : [];
      setBooks(list);
    } catch (err) {
      console.error('Error fetching explore books:', err);
      setError(getErrorMessage(err));
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExploreBooks();
  }, []);

  const handleAddToLibrary = async (book) => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    const bookId = book.id || book._id;
    try {
      setAddingId(bookId);
      setError(null);
      await api.post(`/books/${bookId}/add-to-library`, {
        currentPage: 0,
        status: 'reading',
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Error adding to library:', err);
      setError(getErrorMessage(err));
    } finally {
      setAddingId(null);
    }
  };

  const onSubmitRequest = async (data) => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      setError(null);
      await api.post('/book-requests', {
        title: data.title,
        author: data.author,
        pages: data.pages ? Number(data.pages) : 0,
        description: data.description || '',
      });
      reset();
      setRequestDialogOpen(false);
      showToast?.('Book request submitted. An admin will review it shortly.', 'success');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const coverUrl = (book) => book?.cover || book?.coverImage || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery=""
        setSearchQuery={() => {}}
        onAddBook={() => navigate('/dashboard')}
        user={user}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Explore Books</h1>
          </div>
          {user && (
            <Button
              variant="primary"
              onClick={() => setRequestDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Request a book
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && books.length === 0 && !error && (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No books in the catalogue yet.
          </div>
        )}

        {!loading && books.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div
                key={book.id || book._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-900/40 flex flex-col"
              >
                <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700">
                  {coverUrl(book) ? (
                    <img
                      src={coverUrl(book)}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                    {book.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{book.author}</p>
                  {(book.genre?.length > 0 || book.categories?.length > 0) && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                      {(book.genre || book.categories || []).join(', ')}
                    </p>
                  )}
                  {book.pages > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                      {book.pages} pages
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToLibrary(book);
                    }}
                    disabled={addingId === (book.id || book._id)}
                    className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-sm"
                  >
                    {addingId === (book.id || book._id) ? (
                      <span className="animate-pulse">Adding…</span>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add to Library
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogClose onClick={() => setRequestDialogOpen(false)}><X className="h-5 w-5" /></DialogClose>
          <DialogHeader>
            <DialogTitle>Request a book</DialogTitle>
            <DialogDescription>
              Suggest a book for the global catalogue. An admin will review your request.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitRequest)} className="space-y-4 px-6 pb-6">
            <div>
              <Label htmlFor="request-title" className="block mb-1.5">Title</Label>
              <Input
                id="request-title"
                {...register('title')}
                placeholder="Book title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="request-author" className="block mb-1.5">Author</Label>
              <Input
                id="request-author"
                {...register('author')}
                placeholder="Author name"
                className={errors.author ? 'border-red-500' : ''}
              />
              {errors.author && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.author.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="request-pages" className="block mb-1.5">Pages (optional)</Label>
              <Input
                id="request-pages"
                type="number"
                min={0}
                {...register('pages')}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="request-description" className="block mb-1.5">Description (optional)</Label>
              <textarea
                id="request-description"
                {...register('description')}
                placeholder="Brief description"
                rows={3}
                className="flex w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRequestDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
                <Send className="h-4 w-4" />
                Submit request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
