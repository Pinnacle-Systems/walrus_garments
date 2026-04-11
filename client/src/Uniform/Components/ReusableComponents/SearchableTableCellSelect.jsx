import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import Modal from "../../../UiComponents/Modal";

const normalize = (value) => String(value ?? "").toLowerCase().trim();

const SearchableTableCellSelect = ({
  value,
  options = [],
  onChange,
  disabled = false,
  align = "left",
  placeholder = "",
  childComponent = null,
  addNewLabel = "+ Add New",
  addNewModalWidth = "w-[40%] h-[45%]",
  movedToNextSaveNewRef,
  handlers,
}) => {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-2);
  const [showAddNew, setShowAddNew] = useState(false);
  const [openUp, setOpenUp] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => String(option.value) === String(value)),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!isSearching && isOpen) return options;
    const query = normalize(search);
    if (!query) return options;

    return options
      .map((option) => {
        const label = normalize(option.label);

        let score = 0;

        if (label.startsWith(query)) score = 3; // best
        // else if (label.startsWith(query)) score = 2;
        // else if (label.includes(query)) score = 1;

        return { ...option, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [options, search]);

  const handleBlur = (event) => {
    // Check if the focus is moving to an element outside the container
    if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
      closeDropdown();
    }
  };

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 200; // max-h-48 is ~192px + some padding

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setOpenUp(true);
      } else {
        setOpenUp(false);
      }
    }
  }, [isOpen]);

  const closeDropdown = () => {
    setIsOpen(false);
    setIsSearching(false);
    setSearch("");
    setHighlightedIndex(-2);
  };

  const commitSelection = (nextValue) => {
    onChange(nextValue);
    closeDropdown();
  };

  const handleAddNewSuccess = (newValue) => {
    onChange(newValue);
    setShowAddNew(false);
    closeDropdown();
  };

  useEffect(() => {
    if (search.trim() !== "" && filteredOptions.length > 0) {
      setHighlightedIndex(0);
    } else if (isOpen && (value !== undefined && value !== null && value !== "") && !isSearching) {
      const index = options.findIndex((option) => String(option.value) === String(value));
      if (index !== -1) {
        setHighlightedIndex(index);
        // Delay scroll to ensure DOM is fully rendered
        const timeoutId = setTimeout(() => scrollIntoView(index), 50);
        return () => clearTimeout(timeoutId);
      } else {
        setHighlightedIndex(-2);
      }
    } else {
      setHighlightedIndex(-2);
    }
  }, [search, filteredOptions, value, options, isOpen, isSearching]);

  const scrollIntoView = (index) => {
    if (!listRef.current) return;
    const domIndex = childComponent ? index + 1 : index;
    const item = listRef.current.children[domIndex];
    if (item) item.scrollIntoView({ block: "nearest" });
  };

  const displayValue = (isOpen && isSearching) ? search : selectedOption?.label || "";

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      onBlur={handleBlur}
    >
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-full w-full border-0 bg-transparent py-0   text-[11px] shadow-none outline-none focus:bg-transparent focus:outline-none ${align === "right" ? "text-right" : "text-left"
          }`}
        onFocus={(event) => {
          if (disabled) return;
          setIsOpen(true);
          setIsSearching(false);
          setSearch("");
          requestAnimationFrame(() => event.target.select());
        }}
        onChange={(event) => {
          setIsOpen(true);
          setIsSearching(true);
          setSearch(String(event.target.value ?? "").toUpperCase());
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeDropdown();
            return;
          }

          if (event.key === "Delete") {
            event.preventDefault();
            commitSelection("");
            return;
          }

          if (event.key === "Enter") {
            const minIdx = childComponent ? -1 : 0;
            const maxIdx = filteredOptions.length - 1;

            if (highlightedIndex === -1 && childComponent) {
              event.preventDefault();
              event.stopPropagation();
              setIsOpen(false);
              setSearch("");
              setShowAddNew(true);
              return;
            }

            if (highlightedIndex >= 0 && highlightedIndex <= maxIdx) {
              event.preventDefault();
              commitSelection(filteredOptions[highlightedIndex].value);
              if (handlers?.handleTabKeyDown) {
                handlers.handleTabKeyDown(event);
              }
              return;
            }
            console.log(isOpen, isSearching, search.trim() === "", "isOpen, isSearching, search.trim()")

            if (isOpen && isSearching && search.trim() === "") {
              event.preventDefault();
              event.stopPropagation();

              commitSelection("");
              setIsOpen(false);
              setSearch("");
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            // Toggle dropdown if no selection is made
            setIsOpen((prev) => !prev);
            if (isOpen) setSearch("");
            return;
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            const minIdx = childComponent ? -1 : 0;
            const maxIdx = filteredOptions.length - 1;

            if (maxIdx < minIdx) return;

            if (!isOpen) {
              setIsOpen(true);
              return;
            }

            setHighlightedIndex((prev) => {
              const startIdx = prev === -2 ? minIdx - 1 : prev;
              const next = startIdx < maxIdx ? startIdx + 1 : minIdx;
              scrollIntoView(next);
              return next;
            });
            return;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            const minIdx = childComponent ? -1 : 0;
            const maxIdx = filteredOptions.length - 1;

            if (maxIdx < minIdx) return;

            if (!isOpen) {
              setIsOpen(true);
              return;
            }

            setHighlightedIndex((prev) => {
              const next = (prev > minIdx && prev !== -2) ? prev - 1 : maxIdx;
              scrollIntoView(next);
              return next;
            });
            return;
          }
          if (event.key === "Tab" && movedToNextSaveNewRef) {
            setIsOpen(false);

            event.preventDefault();
            handlers.handleTabKeyDown(event)

          }
        }}
      />

      <FaChevronDown className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-slate-500" />

      {isOpen && !disabled && (
        <div
          ref={listRef}
          className={`absolute left-0 z-40 max-h-48 w-full overflow-auto border border-slate-300 bg-white shadow-lg ${openUp ? "bottom-[calc(100%+4px)]" : "top-[calc(100%+4px)]"
            }`}
        >
          {childComponent && (
            <button
              type="button"
              className={`block w-full border-b border-slate-100 px-2 py-1.5 text-left text-[11px] font-semibold text-blue-600 ${highlightedIndex === -1 ? 'bg-blue-50' : 'hover:bg-blue-50'
                }`}
              onMouseDown={(event) => {
                event.preventDefault();
                setIsOpen(false);
                setSearch("");
                setShowAddNew(true);
              }}
              onMouseEnter={() => setHighlightedIndex(-1)}
            >
              {addNewLabel}
            </button>
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions?.map((option, index) => (
              <button
                ref={handlers?.secondInputRef}
                key={option.value}
                type="button"
                className={`block w-full border-b border-slate-100 px-2 py-1 text-left text-[11px] transition-colors ${
                  index === highlightedIndex
                    ? "bg-blue-600 text-white"
                    : String(option.value) === String(value)
                    ? "bg-blue-50 font-medium text-blue-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  commitSelection(option.value);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="px-2 py-0 text-[11px] text-slate-500">No matches</div>
          )}
        </div>
      )}

      {showAddNew && childComponent && (() => {
        const AddNew = childComponent;
        return (
          <Modal isOpen={showAddNew} onClose={() => setShowAddNew(false)} widthClass={addNewModalWidth}>
            <AddNew onSuccess={handleAddNewSuccess} onClose={() => setShowAddNew(false)} />
          </Modal>
        );
      })()}
    </div>
  );
};

export default SearchableTableCellSelect;
