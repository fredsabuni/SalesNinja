/**
 * SearchableDropdown component with real-time filtering
 */

import * as React from 'react';
import * as Select from '@radix-ui/react-select';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
}

export interface SearchableDropdownProps {
  options: DropdownOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

const SearchableDropdown = React.forwardRef<
  React.ElementRef<typeof Select.Trigger>,
  SearchableDropdownProps
>(({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  label,
  error,
  required,
  disabled,
  loading,
  onSearch,
  className,
}, ref) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  // Debounced search function
  const debouncedSearch = React.useMemo(
    () => debounce((query: string) => {
      onSearch?.(query);
    }, 300),
    [onSearch]
  );

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    
    const query = searchQuery.toLowerCase();
    return options.filter(
      option =>
        option.label.toLowerCase().includes(query) ||
        option.description?.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={cn('space-y-2 w-full', className)}>
      {label && (
        <label
          className={cn(
            'block text-sm font-medium text-neutral-900',
            required && "after:content-['*'] after:ml-0.5 after:text-error-500"
          )}
        >
          {label}
        </label>
      )}

      <Select.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || loading}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <Select.Trigger
          ref={ref}
          className={cn(
            'flex h-12 w-full items-center justify-between rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-base placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
          )}
        >
          <Select.Value placeholder={placeholder}>
            <span className="text-neutral-900">{selectedOption?.label || placeholder}</span>
          </Select.Value>
          <Select.Icon className="h-4 w-4 opacity-50">
            {loading ? (
              <svg
                className="animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-md animate-in fade-in-0 zoom-in-95"
            position="popper"
            sideOffset={4}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-neutral-200">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-8 px-2 text-sm text-neutral-900 bg-white border border-neutral-300 rounded placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
              />
            </div>

            <Select.Viewport className="p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-neutral-600">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm text-neutral-900 outline-none focus:bg-primary-50 focus:text-primary-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Select.ItemIndicator>
                        <svg
                          className="h-4 w-4 text-primary-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Select.ItemIndicator>
                    </span>

                    <div className="flex flex-col">
                      <Select.ItemText className="text-neutral-900">{option.label}</Select.ItemText>
                      {option.description && (
                        <span className="text-xs text-neutral-600">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </Select.Item>
                ))
              )}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {error && (
        <p className="text-sm text-error-500 flex items-center gap-1">
          <svg
            className="h-4 w-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

SearchableDropdown.displayName = 'SearchableDropdown';

export { SearchableDropdown };