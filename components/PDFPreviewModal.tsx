import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PktButton } from '@oslokommune/punkt-react';

// Sett opp worker (viktig for ytelse)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFPreviewModalProps {
  pdfBlob: Blob | null;
  onClose: () => void;
  onSubmit: () => void;
  mode?: 'submit' | 'process';
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  pdfBlob,
  onClose,
  onSubmit,
  mode = 'submit'
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);

  // Juster bredde ved resize for responsivitet
  useEffect(() => {
    const updateWidth = () => {
      const width = Math.min(window.innerWidth - 40, 800); // Max 800px, ellers full bredde minus padding
      setContainerWidth(width);
    };

    window.addEventListener('resize', updateWidth);
    updateWidth(); // Initial call

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const handleDownload = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fraviksoknad-utkast.pdf';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!pdfBlob) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-preview-title"
    >
      {/* Modal Container */}
      <div
        className="bg-white w-full max-w-4xl h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-white shrink-0 z-10">
          <h2 id="pdf-preview-title" className="text-xl font-bold text-pri">
            Forhåndsvisning av søknad
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-2xl leading-none transition-colors"
            aria-label="Lukk forhåndsvisning"
          >
            &times;
          </button>
        </div>

        {/* Scrollable PDF Area */}
        <div className="flex-grow overflow-y-auto bg-gray-100 p-4 md:p-8 flex justify-center">
          <div className="bg-white shadow-lg">
            <Document
              file={pdfBlob}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center h-64 p-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pri mb-4"></div>
                  <p className="text-ink-dim">Genererer visning...</p>
                </div>
              }
              error={
                <div className="p-10 text-center">
                  <p className="text-red-600 font-semibold mb-2">Kunne ikke laste forhåndsvisning.</p>
                  <p className="text-sm text-ink-dim mb-4">Prøv å laste ned filen i stedet.</p>
                  <PktButton onClick={handleDownload} skin="primary">
                    Last ned PDF
                  </PktButton>
                </div>
              }
            >
              {/* Rendrer alle sider sekvensielt */}
              {numPages && Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={containerWidth}
                  className="mb-4 last:mb-0 shadow-sm border border-gray-200"
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
              ))}
            </Document>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            onClick={handleDownload}
            className="text-sm text-blue-600 hover:underline order-2 sm:order-1"
          >
            Last ned PDF
          </button>

          <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
            <PktButton
              onClick={onClose}
              skin="secondary"
              size="medium"
              className="flex-1 sm:flex-none"
            >
              Rediger søknad
            </PktButton>
            <PktButton
              onClick={() => {
                onClose();
                onSubmit();
              }}
              skin="primary"
              size="medium"
              className="flex-1 sm:flex-none"
            >
              {mode === 'process' ? 'Fortsett til vedtak' : 'Send inn søknad'}
            </PktButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
