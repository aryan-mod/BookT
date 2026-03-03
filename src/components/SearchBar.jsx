import React, { memo, useCallback } from 'react';
import { Search, X } from 'lucide-react';

function SearchBar({ value, onChange, onClear, placeholder = 'Search books…' }) {
  const handleChange = useCallback(
    (e) => {
      onChange?.(e.target.value);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onClear?.();
  }, [onClear]);

  const showClear = Boolean(value && String(value).length > 0);

  return (
    <div className="w-full">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          value={value}
          onChange={handleChange}
          type="text"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          className="block w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-10 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {showClear ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default memo(SearchBar);

