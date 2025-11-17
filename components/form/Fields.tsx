import React, { ChangeEvent, useRef, useState, useCallback } from 'react';

interface FileUploadFieldProps {
  label: string;
  id: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  fileName: string | null;
  error?: string;
  required?: boolean;
  accept?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  id,
  onChange,
  fileName,
  error,
  required,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && inputRef.current) {
      // Create a synthetic event to match the onChange signature
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      inputRef.current.files = dataTransfer.files;

      // Trigger onChange with the file
      const syntheticEvent = {
        target: inputRef.current,
        currentTarget: inputRef.current,
      } as ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
    }
  }, [onChange]);

  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = `${id}-description`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink-dim mb-1">
        {label} {required && <span className="text-warn" aria-label="påkrevd">*</span>}
      </label>
      <div
        className={`
          mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md
          transition-colors duration-200 cursor-pointer
          ${isDragging
            ? 'border-pri bg-pri-light/20'
            : error
              ? 'border-warn'
              : 'border-border-color hover:border-pri/50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${label}. Trykk Enter eller Space for å velge fil, eller dra og slipp fil her`}
        aria-describedby={`${descriptionId}${errorId ? ` ${errorId}` : ''}`}
      >
        <div className="space-y-1 text-center">
          <svg
            className={`mx-auto h-12 w-12 transition-colors duration-200 ${isDragging ? 'text-pri' : 'text-muted'}`}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-ink-dim justify-center">
            <span className="font-medium text-pri">Last opp en fil</span>
            <p className="pl-1">eller dra og slipp</p>
          </div>
          <p id={descriptionId} className="text-xs text-muted">
            PNG, JPG, PDF opp til 10MB
          </p>
          <input
            ref={inputRef}
            id={id}
            name={id}
            type="file"
            className="sr-only"
            onChange={onChange}
            required={required}
            accept={accept}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={errorId}
          />
        </div>
      </div>

      {fileName && (
        <p className="mt-2 text-sm text-ink" aria-live="polite">
          <span className="font-medium">Valgt fil:</span> {fileName}
        </p>
      )}

      {error && (
        <p id={errorId} className="mt-1 text-sm text-warn" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
