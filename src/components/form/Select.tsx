import React, { useState } from "react";


interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  name?: string;
  options: Option[];
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  defaultValue?: string;
  value?: string | number | null; // <-- Agregado para hacerlo controlable externamente
  error?: string;
  isInvalid?: boolean;
}

const   Select: React.FC<SelectProps> = ({
  name,
  options,
  placeholder = "Seleccione",
  onChange,
  className = "",
  defaultValue = "",
  value,
  error,
  isInvalid
}) => {
  // Manage the selected value
  const [internalValue, setInternalValue] = useState<string>(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (onChange) onChange(e); // <-- pasa el evento completo como el textarea
  };

  const selectedValue = value !== undefined ? value : internalValue;


  return (
    <>
      <select
        className={`h-11 w-full appearance-none rounded-lg border border-gray-300  px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800
          ${selectedValue ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-gray-400"}
          ${error || isInvalid ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-300"}
          ${className}`}
        name={name}
        value={selectedValue !== null ? String(selectedValue) : ""}
        onChange={handleChange}
      >
        {/* Placeholder option */}
        <option
          value=""
          disabled
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {placeholder}
        </option>
        {/* Map over options */}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </>
  );
};

export default Select;
