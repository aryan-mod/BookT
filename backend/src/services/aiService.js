/**
 * AI Service – wraps Google Gemini 1.5 Flash.
 * Falls back gracefully if GEMINI_API_KEY is not set.
 */

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-1.5-flash';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGemini(prompt) {
  if (!API_KEY) {
    return {
      ok: false,
      error: 'AI features require a GEMINI_API_KEY environment variable. Please configure it in your backend .env file.',
    };
  }

  const url = `${BASE}/${MODEL}:generateContent?key=${API_KEY}`;
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      topP: 0.9,
    },
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err?.error?.message || `Gemini API error ${res.status}` };
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { ok: true, text };
  } catch (e) {
    return { ok: false, error: e.message || 'Network error calling AI service.' };
  }
}

module.exports = {
  async summarize(text, bookTitle = '') {
    const prompt = `You are a reading assistant. Summarize the following passage${bookTitle ? ` from the book "${bookTitle}"` : ''} in 3-5 clear, concise sentences. Focus on key ideas.\n\nPassage:\n"""\n${text.slice(0, 4000)}\n"""`;
    return callGemini(prompt);
  },

  async explain(text) {
    const prompt = `Explain the following paragraph in simple, clear language. Break down complex ideas and vocabulary so a general reader can understand it easily.\n\nParagraph:\n"""\n${text.slice(0, 2000)}\n"""`;
    return callGemini(prompt);
  },

  async define(word, context = '') {
    const prompt = `Define the word "${word}"${context ? ` as used in this context: "${context.slice(0, 500)}"` : ''}. Give: 1) A clear definition, 2) Part of speech, 3) One example sentence. Keep it concise.`;
    return callGemini(prompt);
  },

  async ask(question, context = '') {
    const prompt = `You are an expert reading assistant. Answer the following question based on the provided book context.\n\nContext:\n"""\n${context.slice(0, 3000)}\n"""\n\nQuestion: ${question}\n\nProvide a helpful, accurate answer based on the context. If the answer isn't in the context, say so.`;
    return callGemini(prompt);
  },

  async smartNotes(highlights) {
    const highlightText = highlights
      .map((h, i) => `${i + 1}. "${h.text || h}"`)
      .join('\n');
    const prompt = `Transform these reading highlights into organized, structured notes. Group related ideas, add context, and format as clear bullet points with headers.\n\nHighlights:\n${highlightText.slice(0, 4000)}\n\nGenerate structured notes:`;
    return callGemini(prompt);
  },
};
