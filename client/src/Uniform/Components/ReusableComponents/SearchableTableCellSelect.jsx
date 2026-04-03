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
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showAddNew, setShowAddNew] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => String(option.value) === String(value)),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    const query = normalize(search);
    if (!query) return options;
    return options.filter((option) => normalize(option.label).includes(query));
  }, [options, search]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const closeDropdown = () => {
    setIsOpen(false);
    setSearch("");
    setHighlightedIndex(-1);
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
    setHighlightedIndex(-1);
  }, [search]);

  const scrollIntoView = (index) => {
    if (!listRef.current) return;
    const item = listRef.current.children[index];
    if (item) item.scrollIntoView({ block: "nearest" });
  };

  const displayValue = isOpen ? search : selectedOption?.label || "";

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-full w-full border-0 bg-transparent py-0 pl-1 pr-5 text-[11px] shadow-none outline-none focus:bg-transparent focus:outline-none ${align === "right" ? "text-right" : "text-left"
          }`}
        onFocus={(event) => {
          if (disabled) return;
          setIsOpen(true);
          setSearch("");
          setHighlightedIndex(-1);
          requestAnimationFrame(() => event.target.select());
        }}
        onChange={(event) => {
          setIsOpen(true);
          setSearch(event.target.value);
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

          if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex((prev) => {
              const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
              scrollIntoView(next);
              return next;
            });
            return;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex((prev) => {
              const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
              scrollIntoView(next);
              return next;
            });
            return;
          }

          if (event.key === "Enter" && filteredOptions.length > 0) {
            event.preventDefault();
            const idx = highlightedIndex >= 0 && highlightedIndex < filteredOptions.length
              ? highlightedIndex
              : 0;
            commitSelection(filteredOptions[idx].value);

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
        <div ref={listRef} className="absolute left-0 top-[calc(100%+4px)] z-40 max-h-48 w-full overflow-auto border border-slate-300 bg-white shadow-lg">
          {childComponent && (
            <button
              type="button"
              className="block w-full border-b border-slate-100 px-2 py-1.5 text-left text-[11px] font-semibold text-blue-600 hover:bg-blue-50"
              onMouseDown={(event) => {
                event.preventDefault();
                setIsOpen(false);
                setSearch("");
                setShowAddNew(true);
              }}
            >
              {addNewLabel}
            </button>
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                key={option.value}
                type="button"
                className={`block w-full border-b border-slate-100 px-2 py-1 text-left text-[11px] ${index === highlightedIndex ? "bg-blue-100" : "hover:bg-slate-100"
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
            <div className="px-2 py-1 text-[11px] text-slate-500">No matches</div>
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
