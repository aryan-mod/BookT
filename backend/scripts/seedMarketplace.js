/**
 * Seed script: populates the marketplace with demo books.
 * Run once: node backend/scripts/seedMarketplace.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Book = require('../src/models/Book');

const DEMO_BOOKS = [
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: ['Self-Help', 'Non-Fiction'],
    description: 'An easy and proven way to build good habits and break bad ones. Tiny changes, remarkable results.',
    cover: 'https://covers.openlibrary.org/b/id/10517086-L.jpg',
    pages: 320,
    price: 399,
    isPremium: true,
    isFeatured: true,
    tags: ['habits', 'productivity', 'self-improvement'],
    language: 'English',
    averageRating: 4.8,
    reviewCount: 12,
    salesCount: 45,
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'David Thomas & Andrew Hunt',
    genre: ['Technology', 'Non-Fiction'],
    description: 'A landmark work in software development — a guide to modern programming, from designing maintainable code to career tips.',
    cover: 'https://covers.openlibrary.org/b/id/8739161-L.jpg',
    pages: 352,
    price: 549,
    isPremium: true,
    isFeatured: true,
    tags: ['programming', 'software', 'career'],
    language: 'English',
    averageRating: 4.7,
    reviewCount: 8,
    salesCount: 30,
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    genre: ['Self-Help', 'Non-Fiction'],
    description: 'Rules for focused success in a distracted world. Master the skill of deep concentration for transformative results.',
    cover: 'https://covers.openlibrary.org/b/id/8739162-L.jpg',
    pages: 296,
    price: 349,
    isFeatured: false,
    tags: ['focus', 'productivity', 'work'],
    language: 'English',
    averageRating: 4.5,
    reviewCount: 5,
    salesCount: 20,
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: ['Fiction', 'Classic'],
    description: "A portrait of the Jazz Age in all of its decadence and excess. Jay Gatsby's story of obsession, ambition, and tragic romance.",
    cover: 'https://covers.openlibrary.org/b/id/8432907-L.jpg',
    pages: 180,
    price: 0,
    isFeatured: false,
    tags: ['classic', 'american', 'romance'],
    language: 'English',
    averageRating: 4.2,
    reviewCount: 20,
    salesCount: 100,
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    genre: ['Fiction', 'Fantasy'],
    description: "The science fiction epic about politics, religion, and ecology on the desert planet Arrakis. The greatest science fiction adventure of all time.",
    cover: 'https://covers.openlibrary.org/b/id/12674038-L.jpg',
    pages: 688,
    price: 499,
    isPremium: true,
    isFeatured: true,
    tags: ['scifi', 'epic', 'fantasy'],
    language: 'English',
    averageRating: 4.9,
    reviewCount: 15,
    salesCount: 60,
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    genre: ['History', 'Non-Fiction'],
    description: 'A brief history of humankind, from the Stone Age to the twenty-first century. Challenges assumptions about what it means to be human.',
    cover: 'https://covers.openlibrary.org/b/id/9255019-L.jpg',
    pages: 443,
    price: 449,
    isFeatured: true,
    tags: ['history', 'anthropology', 'philosophy'],
    language: 'English',
    averageRating: 4.6,
    reviewCount: 10,
    salesCount: 35,
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    genre: ['Technology', 'Non-Fiction'],
    description: 'A handbook of agile software craftsmanship. Learn to write code that is clean, readable, and maintainable.',
    cover: 'https://covers.openlibrary.org/b/id/8432906-L.jpg',
    pages: 464,
    price: 599,
    isPremium: true,
    tags: ['programming', 'software-engineering', 'best-practices'],
    language: 'English',
    averageRating: 4.4,
    reviewCount: 6,
    salesCount: 25,
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: ['Fiction', 'Classic', 'Romance'],
    description: 'The beloved classic romance of Elizabeth Bennet and Mr. Darcy. A timeless masterpiece of wit, social commentary, and love.',
    cover: 'https://covers.openlibrary.org/b/id/8739160-L.jpg',
    pages: 432,
    price: 0,
    isFeatured: false,
    tags: ['classic', 'romance', 'british'],
    language: 'English',
    averageRating: 4.5,
    reviewCount: 18,
    salesCount: 120,
  },
  {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    genre: ['Non-Fiction', 'Technology'],
    description: 'How constant innovation creates radically successful businesses. An essential guide for entrepreneurs worldwide.',
    cover: 'https://covers.openlibrary.org/b/id/8739163-L.jpg',
    pages: 336,
    price: 399,
    tags: ['startup', 'business', 'innovation'],
    language: 'English',
    averageRating: 4.3,
    reviewCount: 7,
    salesCount: 28,
  },
  {
    title: 'Harry Potter and the Philosopher\'s Stone',
    author: 'J.K. Rowling',
    genre: ['Fiction', 'Fantasy'],
    description: 'The magical journey begins. Young Harry Potter discovers he is a wizard and enters the world of Hogwarts School of Witchcraft and Wizardry.',
    cover: 'https://covers.openlibrary.org/b/id/10110415-L.jpg',
    pages: 309,
    price: 299,
    isFeatured: true,
    tags: ['magic', 'fantasy', 'adventure'],
    language: 'English',
    averageRating: 4.9,
    reviewCount: 25,
    salesCount: 150,
  },
  {
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    genre: ['Self-Help', 'Non-Fiction'],
    description: 'The classic personal development book that has helped millions achieve financial success through the power of mindset.',
    cover: 'https://covers.openlibrary.org/b/id/8739164-L.jpg',
    pages: 238,
    price: 199,
    tags: ['wealth', 'mindset', 'success'],
    language: 'English',
    averageRating: 4.1,
    reviewCount: 9,
    salesCount: 40,
  },
  {
    title: '1984',
    author: 'George Orwell',
    genre: ['Fiction', 'Classic'],
    description: "The chilling dystopia of Big Brother's totalitarian surveillance state. A haunting vision that remains frighteningly relevant.",
    cover: 'https://covers.openlibrary.org/b/id/8432908-L.jpg',
    pages: 328,
    price: 0,
    tags: ['dystopia', 'classic', 'political'],
    language: 'English',
    averageRating: 4.7,
    reviewCount: 22,
    salesCount: 110,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/booktracker');
    console.log('✅ Connected to MongoDB');

    let added = 0;
    for (const b of DEMO_BOOKS) {
      const exists = await Book.findOne({ title: b.title, author: b.author });
      if (!exists) {
        await Book.create({ ...b, isApproved: true });
        console.log(`  ➕ Added: ${b.title}`);
        added++;
      } else {
        // Update marketplace fields on existing books
        await Book.findByIdAndUpdate(exists._id, {
          price: b.price, isPremium: b.isPremium || false,
          isFeatured: b.isFeatured || false, isApproved: true,
          tags: b.tags, averageRating: b.averageRating || 0,
          reviewCount: b.reviewCount || 0, salesCount: b.salesCount || 0,
        });
        console.log(`  🔄 Updated: ${b.title}`);
      }
    }

    console.log(`\n🎉 Seeding complete! Added ${added} new books.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
