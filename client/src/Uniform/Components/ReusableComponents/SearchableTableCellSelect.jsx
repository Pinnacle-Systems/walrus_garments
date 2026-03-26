import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const normalize = (value) => String(value ?? "").toLowerCase().trim();

const SearchableTableCellSelect = ({
  value,
  options = [],
  onChange,
  disabled = false,
  align = "left",
  placeholder = "",
}) => {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

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
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const commitSelection = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
    setSearch("");
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
        className={`h-full w-full border-0 bg-transparent py-0 pl-1 pr-5 text-[11px] shadow-none outline-none focus:bg-transparent focus:outline-none ${
          align === "right" ? "text-right" : "text-left"
        }`}
        onFocus={(event) => {
          if (disabled) return;
          setIsOpen(true);
          setSearch("");
          requestAnimationFrame(() => event.target.select());
        }}
        onChange={(event) => {
          setIsOpen(true);
          setSearch(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
            setSearch("");
            return;
          }

          if (event.key === "Delete") {
            event.preventDefault();
            commitSelection("");
            return;
          }

          if (event.key === "Enter" && filteredOptions.length > 0) {
            event.preventDefault();
            commitSelection(filteredOptions[0].value);
          }
        }}
      />

      <FaChevronDown className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-slate-500" />

      {isOpen && !disabled && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-40 max-h-48 w-full overflow-auto border border-slate-300 bg-white shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="block w-full border-b border-slate-100 px-2 py-1 text-left text-[11px] hover:bg-slate-100"
                onMouseDown={(event) => {
                  event.preventDefault();
                  commitSelection(option.value);
                }}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="px-2 py-1 text-[11px] text-slate-500">No matches</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableTableCellSelect;
