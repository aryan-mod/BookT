import { useState, useCallback, memo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const MemoizedPage = memo(function MemoizedPage({ pageNumber, width }) {
  return (
    <Page
      pageNumber={pageNumber}
      width={width}
      renderTextLayer={true}
      renderAnnotationLayer={true}
      loading={
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      }
      className="flex justify-center"
    />
  );
});

export default function PDFViewer({
  fileUrl,
  currentPage,
  scrollMode,
  onDocumentLoadSuccess,
  onError,
}) {
  const [numPages, setNumPages] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const width = 800;

  const handleLoadSuccess = useCallback(
    ({ numPages: n }) => {
      setNumPages(n);
      setLoadError(null);
      onDocumentLoadSuccess?.(n);
    },
    [onDocumentLoadSuccess]
  );

  const handleLoadError = useCallback(
    (err) => {
      setLoadError(err);
      onError?.(err);
    },
    [onError]
  );

  if (loadError) {
    return null;
  }

  return (
    <Document
      file={fileUrl}
      onLoadSuccess={handleLoadSuccess}
      onLoadError={handleLoadError}
      loading={
        <div className="flex justify-center py-24">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      }
      error={
        <div className="flex flex-col items-center justify-center py-24 text-red-600 dark:text-red-400">
          <p>Failed to load PDF</p>
          <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
            Please check the file and try again
          </p>
        </div>
      }
    >
      {numPages !== null &&
        (scrollMode ? (
          <div className="flex flex-col items-center gap-4 py-4">
            {Array.from({ length: numPages }, (_, i) => (
              <MemoizedPage key={i} pageNumber={i + 1} width={width} />
            ))}
          </div>
        ) : (
          currentPage >= 1 &&
          currentPage <= numPages && (
            <MemoizedPage pageNumber={currentPage} width={width} />
          )
        ))}
    </Document>
  );
}
