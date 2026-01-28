import { useState, useEffect } from 'react';

const API_BASE_URL = "https://bookt-g6ix.onrender.com/api";

export const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch books from backend
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/books`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.statusText}`);
      }
      
      const data = await response.json();
      // Map MongoDB _id to id for frontend compatibility
      const booksWithId = Array.isArray(data) ? data.map(book => ({
        ...book,
        id: book._id || book.id
      })) : [];
      setBooks(booksWithId);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err.message);
      setBooks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Add a new book
  const addBook = async (bookData) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        throw new Error(`Failed to add book: ${response.statusText}`);
      }

      const newBook = await response.json();
      // Map _id to id
      const bookWithId = {
        ...newBook,
        id: newBook._id || newBook.id
      };
      setBooks(prevBooks => [bookWithId, ...prevBooks]);
      return bookWithId;
    } catch (err) {
      console.error('Error adding book:', err);
      setError(err.message);
      throw err;
    }
  };

  // Update an existing book
  const updateBook = async (bookId, bookData) => {
    try {
      setError(null);
      // Use _id if available, otherwise use id
      const mongoId = typeof bookId === 'object' ? (bookId._id || bookId.id) : bookId;
      const response = await fetch(`${API_BASE_URL}/books/${mongoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update book: ${response.statusText}`);
      }

      const updatedBook = await response.json();
      // Map _id to id
      const bookWithId = {
        ...updatedBook,
        id: updatedBook._id || updatedBook.id
      };
      setBooks(prevBooks =>
        prevBooks.map(book => {
          const currentId = book.id || book._id;
          const targetId = bookId.id || bookId._id || bookId;
          return currentId === targetId ? bookWithId : book;
        })
      );
      return bookWithId;
    } catch (err) {
      console.error('Error updating book:', err);
      setError(err.message);
      throw err;
    }
  };

  // Delete a book
  const deleteBook = async (bookId) => {
    try {
      setError(null);
      // Use _id if available, otherwise use id
      const mongoId = typeof bookId === 'object' ? (bookId._id || bookId.id) : bookId;
      const response = await fetch(`${API_BASE_URL}/books/${mongoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete book: ${response.statusText}`);
      }

      const targetId = typeof bookId === 'object' ? (bookId._id || bookId.id) : bookId;
      setBooks(prevBooks =>
        prevBooks.filter(book => {
          const currentId = book.id || book._id;
          return currentId !== targetId;
        })
      );
    } catch (err) {
      console.error('Error deleting book:', err);
      setError(err.message);
      throw err;
    }
  };

  // Fetch books on mount
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
