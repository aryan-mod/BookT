import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import PDFViewer from '../components/PDFViewer';

function useDebouncedCallback(callback, delay) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return useCallback(
    (...args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        callbackRef.current?.(...args);
      }, delay);
    },
    [delay]
  );
}

function getFriendlyError(err) {
  const code = err?.code;
  if (code === 'ERR_CANCELED') return null;

  const status = err?.response?.status;
  if (status === 401) return 'Please sign in to continue.';
  if (status === 403) return 'You do not have access to this book.';
  if (status === 404) return 'Book not found.';

  const msg = err?.response?.data?.message;
  if (typeof msg === 'string' && msg.trim()) return msg.trim();

  return 'Something went wrong. Please try again.';
}

export default function Reader() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [book, setBook] = useState(null);
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error

  const saveInFlightRef = useRef(false);
  const sessionSecondsRef = useRef(0);
  const lastTickRef = useRef(null);

  const percentage = useMemo(() => {
    const total = Math.max(1, Number(numPages) || 1);
    const page = Math.min(Math.max(1, Number(currentPage) || 1), total);
    return Math.round((page / total) * 100);
  }, [currentPage, numPages]);

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    (async () => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams(location.search || '');
        const requestedPage = Number(params.get('page'));

        const [bookRes, progressRes] = await Promise.all([
          api.get(`/reader/${bookId}`, { signal: controller.signal }),
          api.get('/reader/progress', { params: { bookId }, signal: controller.signal }),
        ]);

        if (!alive) return;

        const b = bookRes?.data?.data ?? null;
        setBook(b);

        const p = progressRes?.data?.data ?? {};
        const savedPage = Number(p?.currentPage) || 1;
        const initialTotal = Number(p?.totalPages) || 1;

        const effective =
          Number.isFinite(requestedPage) && requestedPage >= 1
            ? requestedPage
            : savedPage;

        setCurrentPage(Math.max(1, effective));
        setNumPages(Math.max(1, initialTotal));
      } catch (err) {
        if (!alive) return;
        const msg = getFriendlyError(err);
        if (msg) setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [bookId, location.search]);

  const saveProgress = useCallback(
    async (page, total) => {
      if (!bookId) return;
      if (saveInFlightRef.current) return;
      saveInFlightRef.current = true;
      setSaveStatus('saving');

      try {
        await api.patch('/reader/progress', {
          bookId,
          currentPage: page,
          totalPages: total,
        });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      } finally {
        saveInFlightRef.current = false;
      }
    },
    [bookId]
  );

  const debouncedSave = useDebouncedCallback(saveProgress, 500);

  const handleDocumentLoadSuccess = useCallback(
    (pages) => {
      const total = Math.max(1, Number(pages) || 1);
      setNumPages(total);
      setCurrentPage((p) => Math.min(Math.max(1, p), total));
    },
    []
  );

  const goToPage = useCallback(
    (next) => {
      const total = Math.max(1, Number(numPages) || 1);
      const page = Math.min(Math.max(1, next), total);
      setCurrentPage(page);
      debouncedSave(page, total);
    },
    [debouncedSave, numPages]
  );

  const canPrev = currentPage > 1;
  const canNext = currentPage < numPages;

  useEffect(() => {
    if (!bookId) return undefined;

    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      if (lastTickRef.current != null) {
        const deltaSeconds = (now - lastTickRef.current) / 1000;
        if (deltaSeconds > 0) {
          sessionSecondsRef.current += deltaSeconds;
        }
      }
      lastTickRef.current = now;
    }, 30000);

    return () => {
      clearInterval(interval);
      const now = Date.now();
      if (lastTickRef.current != null) {
        const deltaSeconds = (now - lastTickRef.current) / 1000;
        if (deltaSeconds > 0) {
          sessionSecondsRef.current += deltaSeconds;
        }
      }
      lastTickRef.current = null;
      const durationSeconds = Math.round(sessionSecondsRef.current || 0);
      sessionSecondsRef.current = 0;
      if (!durationSeconds || durationSeconds <= 0) return;
      api
        .post('/reader/session', { bookId, durationInSeconds: durationSeconds })
        .catch(() => {});
    };
  }, [bookId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !book?.fileUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <p className="text-red-600 dark:text-red-400 text-center">
          {error || 'Unable to open this PDF.'}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <h1 className="font-semibold text-gray-900 dark:text-white truncate flex-1 text-center px-2">
            {book.title || 'Reader'}
          </h1>

          <div className="flex items-center gap-3 justify-end min-w-[160px]">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentPage} / {numPages}
            </span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {percentage}%
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto py-6">
        <div className="max-w-4xl mx-auto px-4 flex justify-center">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <PDFViewer
              fileUrl={book.fileUrl}
              currentPage={currentPage}
              scrollMode={false}
              onDocumentLoadSuccess={handleDocumentLoadSuccess}
              onError={() => setError('Failed to load PDF.')}
            />
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-2 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={!canPrev}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {numPages} · <span className="font-medium text-blue-600 dark:text-blue-400">{percentage}%</span>
              </span>
              {saveStatus === 'saving' ? (
                <span className="text-xs text-amber-600 dark:text-amber-400">Saving…</span>
              ) : null}
              {saveStatus === 'saved' ? (
                <span className="text-xs text-green-600 dark:text-green-400">Saved</span>
              ) : null}
              {saveStatus === 'error' ? (
                <span className="text-xs text-red-600 dark:text-red-400">Save failed</span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={!canNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

