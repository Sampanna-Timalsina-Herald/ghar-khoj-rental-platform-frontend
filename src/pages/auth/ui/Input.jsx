import React from 'react';
import { AlertCircle } from 'lucide-react';

const Input = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  rightElement,
  footer, // 🟢 NEW: Prop to render custom content below the input/error message
  ...props
}) => {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full 
            ${icon ? 'pl-10' : 'pl-4'} 
            ${rightElement ? 'pr-10' : 'pr-4'} 
            py-3 
            bg-white 
            border 
            rounded-xl 
            text-slate-900 
            placeholder-slate-400 
            focus:outline-none 
            focus:ring-2 
            focus:ring-offset-0 
            transition-all 
            duration-200
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : 'border-slate-200 hover:border-slate-300 focus:border-primary-600 focus:ring-primary-100'
            }
          `}
          {...props}
        />
        
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightElement}
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-1 mt-1.5 text-red-500 text-xs animate-slide-up">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
      
      {/* 🟢 Render custom footer content */}
      {footer}
    </div>
  );
};

export default Input;