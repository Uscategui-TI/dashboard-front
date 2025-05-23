import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface TextAreaValidateProps {
  name: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  hint?: string;
  register: UseFormRegisterReturn; // Props de react-hook-form
}

const TextAreaValidate: React.FC<TextAreaValidateProps> = ({
  name,
  placeholder = "Enter your message",
  rows = 3,
  className = "",
  disabled = false,
  error = false,
  hint = "",
  register,
}) => {
  let textareaClasses = `w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden ${className}`;

  if (disabled) {
    textareaClasses += ` bg-gray-100 opacity-50 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    textareaClasses += ` bg-transparent text-gray-400 border-gray-300 focus:border-error-300 focus:ring-3 focus:ring-error-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-error-800`;
  } else {
    textareaClasses += ` bg-transparent text-gray-400 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative">
      <textarea
        {...register}
        name={name}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={textareaClasses}
      />
      {hint && (
        <p
          className={`mt-2 text-sm ${
            error ? "text-error-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default TextAreaValidate;