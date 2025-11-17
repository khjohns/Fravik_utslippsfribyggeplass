import React, { ChangeEvent } from 'react';

interface FileUploadFieldProps {
  label: string;
  id: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  fileName: string | null;
  error?: string;
  required?: boolean;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({ label, id, onChange, fileName, error, required }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink-dim mb-1">
        {label} {required && <span className="text-warn">*</span>}
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border-color border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <svg className="mx-auto h-12 w-12 text-muted" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex text-sm text-ink-dim">
            <label htmlFor={id} className="relative cursor-pointer bg-body-bg rounded-md font-medium text-pri hover:text-pri-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pri">
              <span>Last opp en fil</span>
              <input id={id} name={id} type="file" className="sr-only" onChange={onChange} required={required} />
            </label>
            <p className="pl-1">eller dra og slipp</p>
          </div>
          <p className="text-xs text-muted">PNG, JPG, PDF opp til 10MB</p>
        </div>
      </div>
       {fileName && <p className="mt-2 text-sm text-ink">Valgt fil: {fileName}</p>}
       {error && <p className="mt-1 text-sm text-warn">{error}</p>}
    </div>
  );
};
