import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Normalize book from API: ensure `id` for frontend compatibility.
 * Progress fields (currentPage, status, rating, startDate, endDate) come from
 * the merged response when authenticated; may be absent when not.
 */
function normalizeBook(book) {
  if (!book) return null;
  return {
    ...book,
    id: book.id || book._id,
  };
}

function getErrorMessage(err) {
  const msg = err.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return err.message || 'Request failed';
}

export const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/books');
      const raw = response.data?.data?.books;
      const list = Array.isArray(raw) ? raw : [];
      setBooks(list.map(normalizeBook));
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(getErrorMessage(err));
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (bookData) => {
    try {
      setError(null);
      const response = await api.post('/books', bookData);
      const raw = response.data?.data?.book;
      const bookWithId = normalizeBook(raw);
      if (bookWithId) {
        setBooks(prev => [bookWithId, ...prev]);
      }
      return bookWithId;
    } catch (err) {
      console.error('Error adding book:', err);
      const msg = getErrorMessage(err);
      setError(msg);
      throw err;
    }
  };

  const updateBook = async (bookId, bookData) => {
    try {
      setError(null);
      const mongoId = typeof bookId === 'object' ? (bookId._id ?? bookId.id) : bookId;
      const response = await api.put(`/books/${mongoId}`, bookData);
      const raw = response.data?.data?.book;
      const bookWithId = normalizeBook(raw);
      if (bookWithId) {
        const targetId = bookId?.id ?? bookId?._id ?? bookId;
        setBooks(prev =>
          prev.map(b => (b.id === targetId || b._id === targetId ? bookWithId : b))
        );
      }
      return bookWithId;
    } catch (err) {
      console.error('Error updating book:', err);
      const msg = getErrorMessage(err);
      setError(msg);
      throw err;
    }
  };

  const deleteBook = async (bookId) => {
    try {
      setError(null);
      const mongoId = typeof bookId === 'object' ? (bookId._id ?? bookId.id) : bookId;
      await api.delete(`/books/${mongoId}`);
      const targetId = typeof bookId === 'object' ? (bookId._id ?? bookId.id) : bookId;
      setBooks(prev => prev.filter(b => b.id !== targetId && b._id !== targetId));
    } catch (err) {
      console.error('Error deleting book:', err);
      const msg = getErrorMessage(err);
      setError(msg);
      throw err;
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    loading,
    error,
    addBook,
    updateBook,
    deleteBook,
    refetch: fetchBooks,
  };
};
