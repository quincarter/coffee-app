"use client";

import React, { useState, useRef, useEffect } from "react";
import { useId } from "react";
import Chip from "./Chip";

type Option = {
  value: string;
  label: string;
};

type SearchableDropdownProps = {
  options: Option[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  onSearch?: (searchTerm: string) => void;
  placeholder?: string;
  label?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
  noOptionsMessage?: string;
  onAddNew?: (newValue: string) => void;
  allowAddNew?: boolean;
  // addNewText?: string; // No longer used
  multiple?: boolean;
};

export default function SearchableDropdown({
  options,
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  label,
  name,
  disabled = false,
  required = false,
  className = "",
  error,
  noOptionsMessage = "No options found",
  onAddNew,
  allowAddNew = false,
  // addNewText = "Add new item", // Unused variable
  multiple = false,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const labelId = useId();
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Convert value to array if multiple is true
  const selectedValues = multiple
    ? Array.isArray(value)
      ? value
      : [value].filter(Boolean)
    : [];

  // Find the selected option labels for multiple selection
  const selectedOptions = multiple
    ? selectedValues.map((value) => {
        // First try to find in existing options
        const existingOption = options.find((option) => option.value === value);
        if (existingOption) return existingOption;

        // If not found, create a new option object
        return { value, label: value };
      })
    : [];

  // Find the selected option label for single selection
  const selectedOption = !multiple
    ? options.find((option) => option.value === value)
    : null;

  // Filter options based on search term
  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
      // For multiple selection, don't show already selected options
      !(multiple && selectedValues.includes(option.value))
  );

  useEffect(() => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  }, [searchTerm, onSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(0);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const newValues = [...selectedValues, optionValue];
      onChange(newValues);
      // Don't close dropdown for multiple selection to allow selecting more items
    } else {
      onChange(optionValue);
      setIsOpen(false); // Close dropdown for single selection
    }

    // Clear the search term after selection
    setSearchTerm("");

    // Focus the input after selection
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRemoveOption = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.filter((val) => val !== optionValue);
      onChange(newValues);
    } else {
      onChange("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prevIndex) =>
        Math.min(prevIndex + 1, filteredOptions.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (e.key === "Enter" && isOpen) {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        const selectedValue = filteredOptions[highlightedIndex].value;
        handleOptionClick(selectedValue);
      } else if (searchTerm && allowAddNew) {
        // If no options match but we have a search term and allowAddNew is true,
        // add the search term as a new option
        handleAddNewItem();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Function to handle adding a new item
  const handleAddNewItem = (e?: React.MouseEvent) => {
    // If this was triggered by a click event, prevent default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!searchTerm.trim() || !onAddNew) return;

    // Call the onAddNew handler without modifying the current selection
    onAddNew(searchTerm.trim());

    // Clear the search term
    setSearchTerm("");
  };

  const handleInputBlur = () => {
    // Use a small timeout to allow click events on dropdown items to fire first
    blurTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleOptionMouseDown = () => {
    // Cancel the blur timeout if user is clicking on an option
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // If we have a selected option and no active search, show the selected option's label
    if (!multiple && selectedOption && !searchTerm) {
      // Don't update the search term when the dropdown is open to avoid interfering with searching
      if (!isOpen) {
        // This is a visual-only update, not triggering a new search
        const inputElement = inputRef.current;
        if (inputElement) {
          inputElement.placeholder = selectedOption.label;
        }
      }
    }
  }, [multiple, selectedOption, searchTerm, isOpen]);

  // Update the display when value changes
  useEffect(() => {
    if (!multiple && value && !searchTerm) {
      const option = options.find((opt) => opt.value === value);
      if (option && inputRef.current) {
        inputRef.current.placeholder = option.label;
      }
    }
  }, [multiple, value, options, searchTerm]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label
          id={labelId}
          htmlFor={name}
          className="block text-sm font-medium mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Selected chips for multiple selection */}
      {multiple && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
          {selectedOptions.map((option, index) => (
            <Chip
              disabled={disabled}
              key={option.value}
              label={option.label}
              onRemove={() => handleRemoveOption(option.value)}
              isPrimary={index === 0}
            />
          ))}
        </div>
      )}

      {/* Selected chip for single selection */}
      {!multiple && selectedOption && !searchTerm && (
        <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
          <Chip
            disabled={disabled}
            label={selectedOption.label}
            onRemove={() => {
              onChange(multiple ? [] : "");
            }}
          />
        </div>
      )}

      {/* Empty space placeholder when no chips are selected to maintain consistent height */}
      {/* {((multiple && selectedOptions.length === 0) ||
        (!multiple && (!value || searchTerm))) && (
        <div className="min-h-[32px] mb-2"></div>
      )} */}

      <div className="relative">
        {/* Hidden input to store the actual value for form submission */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={multiple ? selectedValues.join(",") : (value as string)}
          />
        )}

        <input
          ref={inputRef}
          type="text"
          id={name ? `${name}-display` : undefined}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`input input-bordered w-full ${
            error ? "input-error" : ""
          }`}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={isOpen ? listboxId : undefined}
          aria-labelledby={label ? labelId : undefined}
          autoComplete="off"
        />

        {error && <div className="text-error text-xs mt-1">{error}</div>}

        {isOpen && (
          <ul
            id={listboxId}
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white coffee:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <li className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-500">
                {noOptionsMessage}
              </li>
            ) : (
              <>
                {filteredOptions.map((option, index) => (
                  <li
                    key={option.value}
                    className={`relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                      index === highlightedIndex
                        ? "bg-primary text-white"
                        : "text-gray-900 coffee:text-gray-100"
                    }`}
                    onClick={() => handleOptionClick(option.value)}
                    onMouseDown={handleOptionMouseDown}
                    role="option"
                    aria-selected={index === highlightedIndex}
                  >
                    {option.label}
                  </li>
                ))}
              </>
            )}

            {allowAddNew && searchTerm && (
              <li
                className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-primary hover:bg-gray-100 coffee:hover:bg-gray-700 border-t w-full"
                onClick={(e) => handleAddNewItem(e)}
                onMouseDown={handleOptionMouseDown}
                role="option"
              >
                <div className="w-full h-full flex items-center">
                  + Add "{searchTerm}"
                </div>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
