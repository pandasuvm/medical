import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface Option {
  value: string | number;
  label: string;
  description?: string;
  critical?: boolean;
  color?: 'red' | 'yellow' | 'green' | 'blue';
}

interface MedicalRadioProps {
  label: string;
  name: string;
  options: Option[];
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid';
  size?: 'sm' | 'md' | 'lg';
}

const MedicalRadio: React.FC<MedicalRadioProps> = ({
  label,
  name,
  options,
  register,
  error,
  required = false,
  layout = 'vertical',
  size = 'md',
}) => {
  const getOptionStyles = (option: Option, isSelected: boolean = false) => {
    const baseStyles = `
      flex items-start space-x-3 p-3 border rounded-lg cursor-pointer
      transition-all duration-200 ease-in-out
      ${isSelected ? 'ring-2 ring-offset-1' : ''}
    `;

    if (option.critical) {
      return `${baseStyles} ${
        isSelected 
          ? 'bg-red-100 border-red-400 ring-red-500' 
          : 'border-red-200 hover:bg-red-50 hover:border-red-300'
      }`;
    }

    const colorMap = {
      red: isSelected
        ? 'bg-red-100 border-red-400 ring-red-500'
        : 'border-red-200 hover:bg-red-50',
      yellow: isSelected
        ? 'bg-yellow-100 border-yellow-400 ring-yellow-500'
        : 'border-yellow-200 hover:bg-yellow-50',
      green: isSelected
        ? 'bg-green-100 border-green-400 ring-green-500'
        : 'border-green-200 hover:bg-green-50',
      blue: isSelected
        ? 'bg-blue-100 border-blue-400 ring-blue-500'
        : 'border-blue-200 hover:bg-blue-50',
    };

    if (option.color && colorMap[option.color]) {
      return `${baseStyles} ${colorMap[option.color]}`;
    }

    return `${baseStyles} ${
      isSelected 
        ? 'bg-blue-100 border-blue-400 ring-blue-500' 
        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
    }`;
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-wrap gap-2';
      case 'grid':
        return 'grid grid-cols-1 sm:grid-cols-2 gap-2';
      default:
        return 'space-y-2';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm p-2';
      case 'lg':
        return 'text-base p-4';
      default:
        return 'text-sm p-3';
    }
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <legend className="block text-sm font-medium text-gray-700 leading-tight">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </legend>

      {/* Options */}
      <fieldset className={getLayoutClasses()}>
        {options.map((option, index) => (
          <label
            key={index}
            className={getOptionStyles(option)}
          >
            <input
              {...register(name, {
                required: required ? `${label} is required` : false,
                valueAsNumber: typeof option.value === 'number'
              })}
              type="radio"
              value={option.value}
              className={`
                mt-0.5 h-4 w-4 flex-shrink-0
                ${option.critical || option.color === 'red' 
                  ? 'text-red-600 focus:ring-red-500' 
                  : option.color === 'yellow'
                  ? 'text-yellow-600 focus:ring-yellow-500'
                  : option.color === 'green'
                  ? 'text-green-600 focus:ring-green-500'
                  : 'text-blue-600 focus:ring-blue-500'
                }
                focus:ring-2 focus:ring-offset-1
              `}
            />
            <div className="flex-1 min-w-0">
              <div className={`font-medium leading-tight ${getSizeClasses()}`}>
                {option.label}
              </div>
              {option.description && (
                <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {option.description}
                </div>
              )}
            </div>
          </label>
        ))}
      </fieldset>

      {/* Error message */}
      {error && (
        <p className="text-red-600 text-xs font-medium flex items-center space-x-1">
          <span className="w-1 h-1 bg-red-600 rounded-full"></span>
          <span>{error.message}</span>
        </p>
      )}
    </div>
  );
};

export default MedicalRadio;
