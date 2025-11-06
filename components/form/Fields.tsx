import React, { ChangeEvent, forwardRef, useState, useEffect, useRef } from 'react';
import { CheckIcon, ChevronUpDownIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({ label, id, error, required, ...props }, ref) => (
  <div>
    <label htmlFor={id || props.name} className="block text-sm font-medium text-ink-dim mb-1">
      {label} {required && <span className="text-warn">*</span>}
    </label>
    <input
      id={id || props.name}
      ref={ref}
      required={required}
      className={`w-full px-3 py-2 bg-card-bg border ${error ? 'border-warn' : 'border-muted'} rounded-md shadow-sm focus:outline-none focus:ring-pri focus:border-pri`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-warn">{error}</p>}
  </div>
));
InputField.displayName = "InputField";


interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  rows?: number;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(({ label, id, error, required, rows = 4, ...props }, ref) => (
  <div>
    <label htmlFor={id || props.name} className="block text-sm font-medium text-ink-dim mb-1">
      {label} {required && <span className="text-warn">*</span>}
    </label>
    <textarea
      id={id || props.name}
      ref={ref}
      rows={rows}
      required={required}
      className={`w-full px-3 py-2 bg-card-bg border ${error ? 'border-warn' : 'border-muted'} rounded-md shadow-sm focus:outline-none focus:ring-pri focus:border-pri`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-warn">{error}</p>}
  </div>
));
TextAreaField.displayName = "TextAreaField";

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(({ label, id, error, required, children, ...props }, ref) => (
  <div>
    <label htmlFor={id || props.name} className="block text-sm font-medium text-ink-dim mb-1">
      {label} {required && <span className="text-warn">*</span>}
    </label>
    <div className="relative">
      <select
        id={id || props.name}
        ref={ref}
        required={required}
        className={`w-full appearance-none px-3 py-2 bg-card-bg border ${error ? 'border-warn' : 'border-muted'} rounded-md shadow-sm focus:outline-none focus:ring-pri focus:border-pri pr-8`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <ChevronUpDownIcon className="h-5 w-5" />
      </div>
    </div>
    {error && <p className="mt-1 text-sm text-warn">{error}</p>}
  </div>
));
SelectField.displayName = "SelectField";


interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  value?: string;
  name?: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({ id, label, checked, onChange, className, value, name }) => (
  <label htmlFor={id} className={`inline-flex items-center gap-3 cursor-pointer group ${className}`}>
    <input 
      id={id} 
      name={name || id}
      type="checkbox" 
      checked={checked} 
      onChange={onChange} 
      value={value}
      className="sr-only peer"
    />
    <span className={`
      w-5 h-5 rounded border flex items-center justify-center transition-all duration-150
      bg-white border-muted
      group-hover:border-pri/70
      peer-checked:bg-pri peer-checked:border-pri
      peer-focus:ring-2 peer-focus:ring-pri/30
    `}>
      <CheckIcon className={`
        w-3 h-3 text-white transition-opacity duration-100
        ${checked ? 'opacity-100' : 'opacity-0'}
      `} />
    </span>
    <span className="text-ink select-none">{label}</span>
  </label>
);


interface RadioGroupProps {
  label: string;
  name: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

export const RadioGroupField: React.FC<RadioGroupProps> = ({ label, name, options, value, onChange, error, required }) => (
  <div>
    <label className="block text-sm font-medium text-ink-dim">
        {label} {required && <span className="text-warn">*</span>}
    </label>
    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
      {options.map((option) => (
        <label key={option.value} htmlFor={`${name}-${option.value}`} className="inline-flex items-center gap-3 cursor-pointer group">
          <input
            id={`${name}-${option.value}`}
            name={name}
            type="radio"
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            required={required}
            className="sr-only peer"
          />
          {/* Custom radio button circle */}
          <span className={`
            w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-150
            bg-white border-muted
            group-hover:border-pri/70
            peer-checked:border-pri
            peer-focus:ring-2 peer-focus:ring-pri/30
          `}>
            {/* Inner dot */}
            <span className={`
              w-2.5 h-2.5 rounded-full bg-pri transition-transform duration-150 transform
              ${value === option.value ? 'scale-100' : 'scale-0'}
            `} />
          </span>
          {/* Label text */}
          <span className="text-ink select-none">
            {option.label}
          </span>
        </label>
      ))}
    </div>
    {error && <p className="mt-1 text-sm text-warn">{error}</p>}
  </div>
);


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


// ----- Date Picker -----
interface DatePickerFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  required?: boolean;
  error?: string;
}

const MONTH_NAMES = ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"];
const DAY_NAMES = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

export const DatePickerField: React.FC<DatePickerFieldProps> = ({ label, name, value, onChange, required, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const datepickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync with external value changes
    if (value) {
      const newDate = new Date(value);
      if (selectedDate?.getTime() !== newDate.getTime()) {
        setSelectedDate(newDate);
        setCurrentDate(newDate);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);
  
  useEffect(() => {
    // Handle click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (datepickerRef.current && !datepickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleDateSelect = (day: number) => {
    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newSelectedDate);
    const formattedDate = newSelectedDate.toISOString().split('T')[0];
    onChange({ target: { name, value: formattedDate } });
    setIsOpen(false);
  };
  
  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7; // 0=Mon, 6=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Pad start
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Fill days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const calendarDays = getCalendarDays();
  const today = new Date();

  return (
    <div className="relative" ref={datepickerRef}>
      <label htmlFor={name} className="block text-sm font-medium text-ink-dim mb-1">
        {label} {required && <span className="text-warn">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type="text"
          readOnly
          required={required}
          value={value}
          onClick={() => setIsOpen(!isOpen)}
          placeholder="YYYY-MM-DD"
          className={`w-full cursor-pointer px-3 py-2 bg-card-bg border ${error ? 'border-warn' : 'border-muted'} rounded-md shadow-sm focus:outline-none focus:ring-pri focus:border-pri`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <CalendarIcon className="h-5 w-5" />
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-warn">{error}</p>}
      
      {isOpen && (
        <div className="absolute z-10 mt-2 w-72 rounded-md bg-card-bg shadow-lg border border-border-color p-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-body-bg"><ChevronLeftIcon className="w-5 h-5 text-muted"/></button>
            <span className="font-semibold text-ink">{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-body-bg"><ChevronRightIcon className="w-5 h-5 text-muted"/></button>
          </div>
          {/* Days Grid */}
          <div className="grid grid-cols-7 text-center text-xs text-muted">
            {DAY_NAMES.map(day => <div key={day} className="py-1">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) return <div key={`pad-${index}`} />;
              
              const isSelected = selectedDate && 
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentDate.getMonth() &&
                selectedDate.getFullYear() === currentDate.getFullYear();
              
              const isToday = today.getDate() === day &&
                today.getMonth() === currentDate.getMonth() &&
                today.getFullYear() === currentDate.getFullYear();

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`
                    w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors
                    ${isSelected ? 'bg-pri text-white font-bold' : ''}
                    ${!isSelected && isToday ? 'bg-pri-light text-pri' : ''}
                    ${!isSelected ? 'text-ink hover:bg-body-bg' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};