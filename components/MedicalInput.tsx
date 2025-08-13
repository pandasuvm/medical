import React, { useState } from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface MedicalInputProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'tel' | 'email';
  register: UseFormRegister<any>;
  error?: FieldError;
  placeholder?: string;
  unit?: string;
  normalRange?: string;
  autoComplete?: string;
  pattern?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'decimal';
  suggestions?: string[];
  critical?: boolean;
  quickValues?: Array<{ label: string; value: string | number }>;
  onQuickSelect?: (value: string | number) => void;
  clinicalHints?: string[];
  value?: string | number;
  onChange?: (value: string | number) => void;
}

const MedicalInput: React.FC<MedicalInputProps> = ({
  label,
  name,
  type = 'text',
  register,
  error,
  placeholder,
  unit,
  normalRange,
  autoComplete,
  pattern,
  inputMode,
  suggestions = [],
  critical = false,
  quickValues = [],
  onQuickSelect,
  clinicalHints = [],
  value,
  onChange
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes((value || '').toString().toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || '' : e.target.value;
    onChange?.(newValue);
    setShowSuggestions(suggestions.length > 0 && e.target.value.length > 0);
  };

  const handleQuickSelect = (selectedValue: string | number) => {
    onQuickSelect?.(selectedValue);
    onChange?.(selectedValue);
    setShowSuggestions(false);
  };

  const getClinicalStatus = () => {
    if (!value || !normalRange) return null;

    const numValue = parseFloat(value.toString());
    if (isNaN(numValue)) return null;

    // Parse normal range (e.g., "60-100", ">95", "<140")
    if (normalRange.includes('-')) {
      const [min, max] = normalRange.split('-').map(v => parseFloat(v));
      if (numValue < min) return 'below';
      if (numValue > max) return 'above';
      return 'normal';
    } else if (normalRange.startsWith('>')) {
      const threshold = parseFloat(normalRange.slice(1));
      return numValue > threshold ? 'normal' : 'below';
    } else if (normalRange.startsWith('<')) {
      const threshold = parseFloat(normalRange.slice(1));
      return numValue < threshold ? 'normal' : 'above';
    }

    return null;
  };

  const clinicalStatus = getClinicalStatus();

  return (
    <div className="space-y-3">
      {/* Enhanced Label with Clinical Context */}
      <div className="flex items-center justify-between">
        <label className={`
          block text-sm font-medium leading-tight flex items-center space-x-2
          ${critical ? 'text-red-700' : 'text-gray-700'}
        `}>
          <span>{label}</span>
          {critical && <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />}
          {normalRange && (
            <span className="text-xs text-gray-500 font-normal">
              (Normal: {normalRange}{unit && ` ${unit}`})
            </span>
          )}
        </label>

        {clinicalHints.length > 0 && (
          <button
            type="button"
            onMouseEnter={() => setShowHints(true)}
            onMouseLeave={() => setShowHints(false)}
            className="text-blue-500 hover:text-blue-600"
          >
            <InformationCircleIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Clinical Hints Tooltip */}
      {showHints && clinicalHints.length > 0 && (
        <div className="absolute z-20 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg max-w-xs">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Clinical Guidelines</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            {clinicalHints.map((hint, index) => (
              <li key={index} className="flex items-start space-x-1">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Value Buttons */}
      {quickValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickValues.map((quick, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleQuickSelect(quick.value)}
              className="
                px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md
                hover:bg-blue-200 transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                border border-blue-200
              "
            >
              {quick.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        {/* Main Input Field */}
        <div className="relative">
          <input
            {...register(name, {
              valueAsNumber: type === 'number',
              onChange: handleInputChange
            })}
            type={type}
            inputMode={inputMode}
            pattern={pattern}
            autoComplete={autoComplete}
            placeholder={placeholder}
            value={value || ''}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className={`
              w-full px-4 py-3 text-base border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-offset-1
              transition-all duration-200
              ${error 
                ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                : critical
                ? 'border-red-200 focus:ring-red-500 bg-red-25'
                : clinicalStatus === 'normal'
                ? 'border-green-300 focus:ring-green-500 bg-green-50'
                : clinicalStatus === 'above' || clinicalStatus === 'below'
                ? 'border-yellow-300 focus:ring-yellow-500 bg-yellow-50'
                : 'border-gray-300 focus:ring-blue-500 bg-white'
              }
              ${unit ? 'pr-16' : ''}
              font-mono text-base
            `}
            style={{ fontSize: '16px' }} // Prevent iOS zoom
          />

          {/* Unit and Status Indicators */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
            {clinicalStatus && (
              <div className="flex items-center">
                {clinicalStatus === 'normal' && (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                )}
                {(clinicalStatus === 'above' || clinicalStatus === 'below') && (
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            )}

            {unit && (
              <span className="text-sm text-gray-500 font-medium">
                {unit}
              </span>
            )}
          </div>
        </div>

        {/* Predictive Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="
            absolute z-10 w-full mt-1 bg-white border border-gray-300
            rounded-lg shadow-lg max-h-40 overflow-y-auto
          ">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  onChange?.(suggestion);
                  setShowSuggestions(false);
                }}
                className="
                  w-full px-4 py-3 text-left text-sm hover:bg-gray-100
                  focus:outline-none focus:bg-gray-100
                  first:rounded-t-lg last:rounded-b-lg
                  flex items-center justify-between
                "
              >
                <span>{suggestion}</span>
                <span className="text-xs text-gray-400">Click to select</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clinical Status Message */}
      {clinicalStatus && clinicalStatus !== 'normal' && (
        <div className={`
          text-xs p-2 rounded-lg flex items-center space-x-2
          ${clinicalStatus === 'above' ? 'bg-yellow-50 text-yellow-800' : 'bg-yellow-50 text-yellow-800'}
        `}>
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span>
            Value is {clinicalStatus === 'above' ? 'above' : 'below'} normal range.
            Consider clinical correlation.
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-xs font-medium flex items-center space-x-2">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
};

export default MedicalInput;
