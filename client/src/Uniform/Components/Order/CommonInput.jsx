import { useState, useRef, useEffect } from 'react';
import { FaPlus, FaSearch, FaInfoCircle, FaEdit, FaTrash } from 'react-icons/fa';
import { useModal } from '../../../Basic/pages/home/context/ModalContext';
import Modal from "../../../UiComponents/Modal";
import { PartyMaster } from '../../../Basic/components';
import DynamicRenderer from './DynamicComponent';
import { findFromList } from '../../../Utils/helper';
export function ReusableSearchableInput({
  label,
  placeholder,
  onDeleteItem,
  optionList,
  component,
  setSearchTerm,
  searchTerm

}) {
  // const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [editingItem, setEditingItem] = useState("");
  const containerRef = useRef(null);
  const modal = useModal();
  const [openModel, setOpenModel] = useState(false)
  const { openAddModal } = modal || {};


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const handleEdit = (id, e) => {
    e.stopPropagation();
    setEditingItem(id);
    setIsDropdownOpen(false);
    setOpenModel(true)
  };

  const handleDelete = (itemId, e) => {
    // e.stopPropagation();
    onDeleteItem(itemId);
  };


  return (


    <>


      <Modal
        isOpen={openModel}
        onClose={() => setOpenModel(false)}
        widthClass={"w-[10%] h-[10%]"}
      >
        <DynamicRenderer componentName={component} editingItem={editingItem} onCloseForm={() => setOpenModel(false)} />
      </Modal>


      <div className="relative text-sm w-full" ref={containerRef}>
        <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>

        <div className="flex gap-2">
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
            <input
              className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-md 
              focus:border-indigo-300 focus:outline-none transition-all duration-200
              hover:border-slate-400"
              placeholder={placeholder}
              value={findFromList(searchTerm, optionList, "name")}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
            />
          </div>

          <div className="relative">
            <button
              className="h-full px-3 py-1.5 border border-green-500 rounded-md
              hover:bg-green-500 text-green-600 hover:text-white transition-colors flex items-center justify-center"
              onClick={() => {
                // openAddModal();
                // setIsDropdownOpen(false);
                setEditingItem("new");
                setOpenModel(true)
              }}
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
              aria-label="Add supplier"
            >
              <FaPlus className="text-sm" />
            </button>
            {tooltipVisible && (
              <div className="absolute  z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
                <div className="flex items-start">
                  <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                  <span>Click to add a new supplier</span>
                </div>
                <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
              </div>
            )}
          </div>
        </div>

        {isDropdownOpen && (
          <div className="border border-slate-200 rounded-md shadow-md bg-white mt-1 max-h-40 overflow-y-auto z-20 absolute w-full">
            {optionList?.length > 0 ? (
              optionList?.map((item) => (
                <div
                  key={item.id}
                  className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer transition-colors flex justify-between items-center group"
                  onClick={() => setSearchTerm(item.id)}
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {/* {item.code && (
                    <div className="text-xs text-slate-500">Code: {item.code}</div>
                  )} */}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                      onClick={(e) => handleEdit(item?.id, e)}
                      title="Edit supplier"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 p-1"
                      onClick={(e) => handleDelete(item?.id)}
                      title="Delete supplier"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-indigo-600 hover:bg-slate-50 flex items-center gap-2"
                onClick={() => {
                  setEditingItem(null);
                  setIsDropdownOpen(false);
                  openAddModal();
                }}
              >
                <FaPlus className="text-xs" />
                Create "{searchTerm}"
              </button>
            )}
          </div>
        )}
      </div>
    </>


  );
}

export function ReusableDropdown({
  label,
  options = [],
  value,
  setValue,
  onChange,
  readOnly = false,
  placeholder = "Select an option",
  className = "",
  disabled = false,
}) {

  const handleOnChange = (e) => {
    const selectedValue = e.target.value;

    setValue(selectedValue);

  };

  return (
    <div className="mb-2">
      {label && (
        <label className="block text-xs text-slate-500 mb-1">
          {label}
        </label>
      )}

      <select
        value={value}
        onChange={handleOnChange}
        disabled={disabled}
        className={`w-full   px-2 py-1 text-xs border border-slate-300 rounded-md 
          focus:border-indigo-300 focus:outline-none transition-all duration-200
          hover:border-slate-400 ${readOnly || disabled ? "bg-slate-100" : ""
          } ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option
            key={option.value}
            className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer transition-colors
             flex justify-between items-center group"
            value={option.value}
          >
            <div>
              <div className="font-medium">{option.name || option.show}</div>
            </div>
          </option>

          // <option className='' key={option.value} value={option.value}>
          //   {option.show || option.name}
          // </option>
        ))}
      </select>
    </div>
  );
}




export const handleOnChange = (event, setValue) => {
  const inputValue = event.target.value;
  const inputSelectionStart = event.target.selectionStart;
  const inputSelectionEnd = event.target.selectionEnd;

  const upperCaseValue = inputValue.toUpperCase();

  const valueBeforeCursor = upperCaseValue.slice(0, inputSelectionStart);
  const valueAfterCursor = upperCaseValue.slice(inputSelectionEnd);

  setValue(
    valueBeforeCursor +
    inputValue.slice(inputSelectionStart, inputSelectionEnd) +
    valueAfterCursor
  );

  // Set the cursor position to the end of the input value
  setTimeout(() => {
    event.target.setSelectionRange(
      valueBeforeCursor.length +
      inputValue.slice(inputSelectionStart, inputSelectionEnd).length,
      valueBeforeCursor.length +
      inputValue.slice(inputSelectionStart, inputSelectionEnd).length
    );
  });
};







export function ReusableInput(
  { setValue, label, type, value, className = "", textClassName = "", tabIndex = null, onChange, placeholder, readOnly, disabled }
) {
  return (
    <div className="mb-2">
      {label && (
        <label className="block text-xs text-slate-500 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) =>
          type === "number" ? setValue(e.target.value) : handleOnChange(e, setValue)
        }
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className={`w-full px-2 py-1 text-xs border border-slate-300 rounded-md 
          focus:border-indigo-300 focus:outline-none transition-all duration-200
          hover:border-slate-400 ${readOnly || disabled ? "bg-slate-100" : ""
          } ${className}`}
      />
    </div>
  );
}