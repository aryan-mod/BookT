import React, { memo, useState } from 'react';
import { BookOpen, Plus, Check, Loader2, ExternalLink } from 'lucide-react';
import api from '../api/axios';

function formatAuthors(authors) {
  if (!Array.isArray(authors) || authors.length === 0) return '';
  return authors.join(', ');
}

function safeText(value) {
  return typeof value === 'string' ? value : '';
}

function getBookKey(book) {
  const id = safeText(book?.id);
  const source = safeText(book?.source);
  return `${source}:${id}`;
}

function BookCard({
  book,
  onAdd,
  isAdded = false,
  isAdding = false,
}) {
  const title = safeText(book?.title) || 'Untitled';
  const authors = formatAuthors(book?.authors);
  const description = safeText(book?.description);
  const thumbnail = safeText(book?.thumbnail);
  const pageCount =
    typeof book?.pageCount === 'number' && Number.isFinite(book.pageCount) ? book.pageCount : null;
  const publishedDate = safeText(book?.publishedDate);
  const source = safeText(book?.source);

  const [isOpening, setIsOpening] = useState(false);
  const previewLink = typeof book?.previewLink === 'string' && book.previewLink.trim() ? book.previewLink : null;
  const canAdd = !isAdded && !isAdding && typeof onAdd === 'function';
  const showMeta = Boolean(publishedDate || pageCount || source);
  const showPreview =
    previewLink &&
    (source === 'google' || source === 'open-library');

  const handlePreviewClick = () => {
    if (!previewLink || isOpening) return;
    setIsOpening(true);
    api.post('/books/preview-click', { externalId: book?.id, source }).catch(() => {});
    window.open(previewLink, '_blank', 'noopener,noreferrer');
    setTimeout(() => setIsOpening(false), 0);
  };

  const sourceLabel =
    source === 'open-library' ? 'Open Library' : source === 'google' ? 'Google' : '';
  const sourceClasses =
    source === 'open-library'
      ? 'bg-emerald-600/90 text-white dark:bg-emerald-500/90'
      : source === 'google'
      ? 'bg-blue-600/90 text-white dark:bg-blue-500/90'
      : 'bg-gray-800/80 text-white';

  return (
    <div className="group flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700/60 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="relative overflow-hidden rounded-t-2xl">
          <div className="h-60 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="h-60 w-full object-cover rounded-lg"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-60 w-full grid place-items-center">
                <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-300">
                  <BookOpen className="h-10 w-10" />
                  <span className="text-xs font-medium">No cover</span>
                </div>
              </div>
            )}
          </div>
          {sourceLabel ? (
            <div className="absolute right-3 top-3">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${sourceClasses}`}
              >
                {sourceLabel}
              </span>
            </div>
          ) : null}
        </div>

        <div className="p-4 flex flex-col flex-1 min-h-0">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
              {title}
            </h3>
            {authors ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {authors}
              </p>
            ) : null}
          </div>

          {description ? (
            <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {description}
            </p>
          ) : (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-500 italic">
              No description available.
            </p>
          )}

          {showMeta ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {publishedDate ? (
                <span className="inline-flex rounded-full bg-gray-100 dark:bg-gray-700/60 px-2 py-0.5 text-[11px] text-gray-600 dark:text-gray-400">
                  {publishedDate}
                </span>
              ) : null}
              {pageCount !== null ? (
                <span className="inline-flex rounded-full bg-gray-100 dark:bg-gray-700/60 px-2 py-0.5 text-[11px] text-gray-600 dark:text-gray-400">
                  {pageCount} p
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="p-4 pt-0 space-y-2">
        <button
          type="button"
          onClick={() => (canAdd ? onAdd(book, getBookKey(book)) : undefined)}
          disabled={!canAdd}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 text-sm font-semibold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-600 dark:disabled:from-gray-700 dark:disabled:to-gray-700 dark:disabled:text-gray-300 disabled:cursor-not-allowed transition-all"
        >
          {isAdded ? (
            <>
              <Check className="h-4 w-4" />
              Added
            </>
          ) : isAdding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding…
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add to Library
            </>
          )}
        </button>
        {showPreview ? (
          <button
            type="button"
            onClick={handlePreviewClick}
            disabled={isOpening}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <ExternalLink className="h-3 w-3 shrink-0" />
            {source === 'google' ? 'Read Preview' : 'View on Open Library'}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default memo(BookCard);
