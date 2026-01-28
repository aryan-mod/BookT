const Book = require('../models/Book');

const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      cover,
      rating,
      pages,
      genre,
      status,
      startDate,
      endDate,
      currentPage,
      highlights,
      review,
      reactions,
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: 'Please provide title and author' });
    }

    const book = await Book.create({
      title,
      author,
      cover: cover || '',
      rating: rating || 0,
      pages: pages || 0,
      genre: genre || [],
      status: status || 'wishlist',
      startDate: startDate || '',
      endDate: endDate || '',
      currentPage: currentPage || 0,
      highlights: highlights || [],
      review: review || '',
      reactions: reactions || {},
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({ message: 'Book removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
