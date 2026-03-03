import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUp, Upload } from 'lucide-react';
import api from '../api/axios';
import { ToastContext } from '../context/ToastContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';

const MAX_BYTES = 20 * 1024 * 1024; // 20MB

function isPdfFile(file) {
  if (!file) return false;
  if (file.type === 'application/pdf') return true;
  if (typeof file.name === 'string' && file.name.toLowerCase().endsWith('.pdf')) return true;
  return false;
}

function getFriendlyError(err) {
  const code = err?.code;
  if (code === 'ERR_CANCELED') return null;

  const status = err?.response?.status;
  if (status === 401) return 'Please sign in to upload.';
  if (status === 413) return 'File is too large. Maximum size is 20MB.';

  const msg = err?.response?.data?.message;
  if (typeof msg === 'string' && msg.trim()) return msg.trim();

  return 'Upload failed. Please try again.';
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext) || {};

  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [percent, setPercent] = useState(0);
  const inputRef = useRef(null);

  const canSubmit = useMemo(() => {
    const t = String(title || '').trim();
    return Boolean(t) && Boolean(file) && !uploading;
  }, [file, title, uploading]);

  const validate = useCallback(() => {
    const t = String(title || '').trim();
    if (!t) return 'Title is required.';
    if (!file) return 'Please choose a PDF file.';
    if (!isPdfFile(file)) return 'Only PDF files are allowed.';
    if (typeof file.size === 'number' && file.size > MAX_BYTES) {
      return 'File is too large. Maximum size is 20MB.';
    }
    return '';
  }, [file, title]);

  const handlePickFile = useCallback((e) => {
    const next = e.target.files?.[0] || null;
    setError('');
    setPercent(0);
    setFile(next);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (uploading) return;

      const msg = validate();
      if (msg) {
        setError(msg);
        return;
      }

      setUploading(true);
      setError('');
      setPercent(0);

      try {
        const formData = new FormData();
        formData.append('title', String(title).trim());
        formData.append('file', file);

        const res = await api.post('/reader/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (evt) => {
            const total = evt?.total;
            if (!total) return;
            const p = Math.round((evt.loaded * 100) / total);
            setPercent(Math.max(0, Math.min(100, p)));
          },
        });

        const uploaded = res?.data?.data;
        const id = uploaded?._id || uploaded?.id;
        if (!id) {
          setError('Upload succeeded but could not open the reader. Please try again.');
          return;
        }

        showToast?.('PDF uploaded successfully.');
        navigate(`/reader/${id}`);
      } catch (err) {
        const friendly = getFriendlyError(err);
        if (friendly) setError(friendly);
      } finally {
        setUploading(false);
      }
    },
    [file, navigate, showToast, title, uploading, validate]
  );

  const fileName = file?.name ? String(file.name) : 'No file selected';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <Card className="shadow-xl shadow-blue-500/5 dark:shadow-blue-950/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-2xl bg-blue-100 dark:bg-blue-900/40 border border-blue-200/60 dark:border-blue-800/50">
                <FileUp className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              </div>
              <div>
                <CardTitle>Upload PDF</CardTitle>
                <CardDescription>Add a PDF to read with progress tracking.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Atomic Habits"
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <Label>PDF File</Label>
                <label className="block rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/30 px-4 py-6 cursor-pointer transition-colors hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/20">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <Upload className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        Drag &amp; drop your PDF here
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        or click to browse (max 20MB)
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 max-w-full line-clamp-1">
                      {fileName}
                    </div>
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    disabled={uploading}
                    onChange={handlePickFile}
                  />
                </label>
              </div>

              {uploading ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Uploading…</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              ) : null}

              {error ? (
                <div
                  className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-xs text-red-800 dark:text-red-200"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}
            </CardContent>

            <CardFooter className="justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={uploading}
                disabled={!canSubmit}
              >
                Upload
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

