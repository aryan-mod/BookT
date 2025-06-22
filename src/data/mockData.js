export const mockBooks = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    cover: "https://images.pexels.com/photos/1314410/pexels-photo-1314410.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.5,
    pages: 288,
    genre: ["Fiction", "Philosophy", "Contemporary"],
    status: "completed",
    startDate: "2024-01-15",
    endDate: "2024-01-22",
    highlights: [
      { text: "Between life and death there is a library", timestamp: "2024-01-16T10:30:00Z", page: 45 },
      { text: "The only way to learn is to live", timestamp: "2024-01-18T14:20:00Z", page: 156 }
    ],
    review: "A profound exploration of life's infinite possibilities. Haig masterfully weaves philosophy with storytelling to create a narrative that's both entertaining and deeply meaningful. The concept of the Midnight Library serves as a perfect metaphor for the paths we don't take and the lives we might have lived.",
    reactions: { "❤️": 12, "🤔": 8, "📚": 15 }
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    cover: "https://images.pexels.com/photos/1553962/pexels-photo-1553962.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 5,
    pages: 320,
    genre: ["Self-Help", "Psychology", "Productivity"],
    status: "reading",
    startDate: "2024-01-25",
    currentPage: 180,
    highlights: [
      { text: "You do not rise to the level of your goals. You fall to the level of your systems.", timestamp: "2024-01-26T09:15:00Z", page: 27 }
    ],
    review: "",
    reactions: { "💪": 20, "🎯": 15, "✨": 10 }
  },
  {
    id: 3,
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    cover: "https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.8,
    pages: 400,
    genre: ["Fiction", "Romance", "Historical"],
    status: "completed",
    startDate: "2024-01-01",
    endDate: "2024-01-08",
    highlights: [
      { text: "Never let anyone make you feel ordinary", timestamp: "2024-01-03T16:45:00Z", page: 89 },
      { text: "The greatest tragedy of life is not death, but a life without purpose", timestamp: "2024-01-06T11:30:00Z", page: 234 }
    ],
    review: "An absolutely captivating tale of love, ambition, and the price of fame. Reid's storytelling is masterful, creating a character in Evelyn Hugo who is both larger than life and deeply human.",
    reactions: { "❤️": 25, "😭": 18, "🌟": 22 }
  }
];

export const mockStreakData = {
  current: 15,
  longest: 28,
  thisWeek: [true, true, false, true, true, true, false],
  thisMonth: Array(30).fill(null).map(() => Math.random() > 0.3)
};

export const suggestedBooks = [
  { title: "Klara and the Sun", author: "Kazuo Ishiguro", match: 85 },
  { title: "The Invisible Life of Addie LaRue", author: "V.E. Schwab", match: 78 },
  { title: "Educated", author: "Tara Westover", match: 82 },
  { title: "Where the Crawdads Sing", author: "Delia Owens", match: 76 }
];