import { useState, useEffect, useRef, type ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface BaseDropdownOption<T = string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface BaseDropdownProps<T = string> {
  value: T;
  options: BaseDropdownOption<T>[];
  onSelect: (value: T) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  /** Optional: render custom option content. Receives option and whether it's selected. */
  renderOption?: (option: BaseDropdownOption<T>, selected: boolean) => ReactNode;
}

/**
 * Base dropdown with trigger + panel, styled like Jira/GitHub selectors.
 * Use for simple single-select lists (e.g. project picker). For search/async, extend or use a specialized component.
 */
export default function BaseDropdown<T = string>({
  value,
  options,
  onSelect,
  placeholder = 'Select…',
  label,
  disabled = false,
  className = '',
  renderOption,
}: BaseDropdownProps<T>) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowDropdown(false);
      }
    };
    const timeoutId = setTimeout(() => document.addEventListener('click', handleClickOutside), 100);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className={className} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setShowDropdown((s) => !s)}
          disabled={disabled}
          className="w-full flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-left text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2 min-w-0 truncate">
            {selectedOption?.icon}
            <span className="truncate">{displayLabel}</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          />
        </button>
        {showDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No options
              </div>
            ) : (
              options.map((option) => {
                const selected = option.value === value;
                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => {
                      onSelect(option.value);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border-0 bg-transparent"
                  >
                    {renderOption ? (
                      renderOption(option, selected)
                    ) : (
                      <>
                        {option.icon != null && (
                          <span className="flex-shrink-0 text-gray-500">{option.icon}</span>
                        )}
                        <span className="flex-1 min-w-0 truncate">{option.label}</span>
                        {selected && (
                          <Check className="w-4 h-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </>
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
