
import validator from "validator";
import React, { useEffect, useRef, useState, forwardRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { MultiSelect } from "react-multi-select-component";
import { findFromList } from "../Utils/helper";
import "./index.css";
import { FormControl, MenuItem, TextField } from "@mui/material";
import { push } from "../redux/features/opentabs";
import { useDispatch } from "react-redux";
import { FaChevronLeft, FaChevronRight, FaEdit, FaInfoCircle, FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import secureLocalStorage from "react-secure-storage";
import { useDeletePartyMutation, useGetPartyQuery } from "../redux/services/PartyMasterService";
import { useModal } from "../Basic/pages/home/context/ModalContext";
import useOutsideClick from "../CustomHooks/handleOutsideClick";
import DynamicRenderer from "../Uniform/Components/Order/DynamicComponent";
import Select, { components } from "react-select";
import Modal from "../UiComponents/Modal";
import { usePermissionForUsers } from "../Basic/components/HasPermission";
import Swal from "sweetalert2";

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
export const FancyCheckBox = ({ label, value, onChange, readOnly }) => {
  return (
    <label
      style={{ fontSize: 11 }}
      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer w-full text-xs font-medium text-gray-700 ${readOnly ? "bg-gray-100 cursor-not-allowed" : "hover:bg-gray-50"
        }`}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={readOnly}
        className="accent-blue-600"
      />
      <span className="break-words text-xs text-wrap w-full">{label}</span>
    </label>
  );
};
export const handleOnChangeforpassword = (event, setValue) => {
  const inputValue = event.target.value;
  const inputSelectionStart = event.target.selectionStart;
  const inputSelectionEnd = event.target.selectionEnd;

  const LowerCaseValue = inputValue.toLowerCase();

  const valueBeforeCursor = LowerCaseValue.slice(0, inputSelectionStart);
  const valueAfterCursor = LowerCaseValue.slice(inputSelectionEnd);

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


export const MultiSelectDropdown = ({
  name,
  selected,
  label,
  setSelected,
  options,
  readOnly = false,
  tabIndex = null,
  className = "",
  required,
  disabled
}) => {
  console.log(options, "options");
  console.log(selected, "selected");
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "16px",
      height: "16px",
      padding: "13px 4px",
      fontSize: "12px",
      borderRadius: "8px",
      fontFamily: "'Segoe UI'",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 6px",
      marginTop: "-8px",
      fontFamily: "'Segoe UI'",
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      fontFamily: "'Segoe UI'",
    }),
    singleValue: (base) => ({
      ...base,
      fontFamily: "'Segoe UI'",
    }),
    placeholder: (base) => ({
      ...base,
      fontFamily: "'Segoe UI'",
    }),
    menu: (base) => ({
      ...base,
      fontFamily: "'Segoe UI'",
      maxHeight: 150,
      overflowY: "auto",
    }),
    option: (base) => ({
      ...base,
      fontFamily: "'Segoe UI'",
      fontSize: "12px",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      display: "none",
      height: "28px",
      marginTop: "-12px",
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: 150,
      overflowY: "auto",
    }),
  };

  return (
    <div
      className={`block text-xs font-bold text-gray-600 mb-1   ${className}`}
    >
      <span className="mb-3">
        {required ? <RequiredLabel name={label ? label : name} /> : name}
      </span>
      <div>
        {/* <MultiSelect
          options={options}
          value={selected}
          onChange={readOnly ? () => { } : setSelected}
          labelledBy="Select"
          hasSelectAll={false}
          disabled={disabled}

          styles={customSelectStyles}
        /> */}
        <MultiSelect
          options={options}
          value={selected}
          onChange={readOnly ? () => { } : setSelected}
          labelledBy="Select"
          hasSelectAll={false}
          disabled={disabled}
          className="w-full"       // container width
          overrideStrings={{
            selectSomeItems: "Select",
          }}
          // ItemRenderer={ItemRenderer}
          // valueRenderer={ValueRenderer}
          // Custom styling using override
          styles={{
            multiselectContainer: {
              width: "100%",
            },
            searchBox: {
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            },
            optionListContainer: {
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
            },
            chips: {
              backgroundColor: "#e5e7eb",
              color: "#1f2937",
              borderRadius: "6px",
              fontSize: "10px",
              padding: "2px 6px",
            },
          }}
        />
      </div>




    </div>
  );
};

const Option = (props) => {
  return (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null}
        style={{ marginRight: 8 }}
      />
      {props.label}
    </components.Option>
  );
};

const ValueContainer = ({ children, ...props }) => {
  const { getValue } = props;
  const selected = getValue();

  const MAX_DISPLAY = 5;

  let displayText = "";

  if (selected.length > 0) {
    const labels = selected.slice(0, MAX_DISPLAY).map((item) => item.label);

    if (selected.length > MAX_DISPLAY) {
      displayText = `${labels.join(", ")} +${selected.length - MAX_DISPLAY
        } more`;
    } else {
      displayText = labels.join(", ");
    }
  }

  return (
    <components.ValueContainer {...props}>
      <div
        style={{
          fontSize: "13px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {displayText}
      </div>
      {children[1]}
    </components.ValueContainer>
  );
};
export const MultiSelectDropdownNew = ({
  name,
  selected,
  label,
  setSelected,
  options,
  readOnly = false,
  tabIndex = null,
  className = "",
  required,
  disabled,
}) => {

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: "30px",
      height: "28px",
      borderRadius: "6px",
      fontSize: "13px",
      borderColor: "#d1d5db",
      padding: "0",
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "#f3f4f6"
        : "#ffffff",
      color: "#111827",
      fontSize: "11px",
      paddingTop: "4px",
      paddingBottom: "4px",
    }),

    menu: (base) => ({
      ...base,
      zIndex: 9999,   // 🔥 important
    }),

    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,   // 🔥 for modals
    }),

    valueContainer: (base) => ({
      ...base,
      padding: "0 6px",
      height: "28px",
    }),

    input: (base) => ({
      ...base,
      margin: "0",
      padding: "0",
    }),

    multiValue: (base) => ({
      ...base,
      padding: "0 4px",
    }),

    indicatorsContainer: (base) => ({
      ...base,
      height: "28px",
    }),
  };
  return (
    <div className={`block text-xs font-bold text-gray-600 mb-1 ${className} `}>
      <span className="mb-3">
        {required ? <RequiredLabel name={label ? label : name} /> : name}
      </span>

      <div className="mt-1 ">
        <Select
          isMulti
          options={options}
          value={selected}
          onChange={setSelected}
          components={{ Option, ValueContainer }}
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          placeholder=""
          maxMenuHeight={200}
          styles={customStyles}


        />
      </div>
    </div>
  );
};

export const TextInput = ({
  name,
  label,
  type = "text",
  value,
  setValue,
  readOnly = false,
  className = "",
  required = false,
  disabled = false,
  tabIndex = null,
  onBlur = null,
  width = "full",
  max
}) => {
  console.log(max, "max")
  return (
    <div className={`mb-2 ${width}`}>
      {name && (
        <label className="block text-xs font-bold text-gray-600 mb-1">
          {required ? <RequiredLabel name={label ? label : name} /> : name}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) =>
          type === "number"
            ? setValue(e.target.value)
            : handleOnChange(e, setValue)
        }
        onKeyDown={(e) => {
          if (e.key === " ") {
            e.preventDefault();
          }
        }}
        onBlur={onBlur}
        placeholder={name}
        readOnly={readOnly}
        disabled={disabled}
        tabIndex={tabIndex ?? undefined}
        max={max ? String(max) : undefined}
        className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm 
                  ${readOnly || disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white hover:border-gray-400"}
          ${className}`
        }
      />
      {/* ${readOnly || disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white hover:border-gray-400"} */}
    </div>
  );
};



export const PasswordTextInput = ({
  name,
  type,
  value,
  setValue,
  readOnly,
  className,
  required = false,
  disabled = false,
  tabIndex = null,
  onBlur = null,
  width,
}) => {
  return (
    <>
      <div className="group input-group  text-sm">
        <label
          htmlFor="title"
          className="input-label group-hover:text-blue-600  font-weight: 100 "
        >
          <span className="flex items-center gap-2  font-weight: 100">
            {required ? <RequiredLabel name={name} /> : `${name}`}
          </span>
        </label>
        <TextField
          id={name}
          variant="standard"
          name={`${name}`}
          className={`input-base field-text p-0.5 rounded border border-gray-500 font-weight: 100 `}
          // placeholder={`${name}`}

          sx={{
            "& .MuiInputBase-input": { fontSize: "12px" },
            "& .MuiInputBase-input.Mui-disabled": {
              color: "#333",
              WebkitTextFillColor: "#333",
            },
          }}
          onBlur={onBlur}
          tabIndex={tabIndex ? tabIndex : undefined}
          type={type}
          // disabled={readOnly}
          required={required}
          value={value}
          onChange={(e) => {
            type === "number"
              ? setValue(e.target.value)
              : handleOnChangeforpassword(e, setValue);
          }}
          readOnly={readOnly}
        />
      </div>
    </>
  );
};

export const LongTextInput = ({
  name,
  type,
  value,
  setValue,
  className,
  readOnly,
  required = false,
  disabled = false,
  tabIndex = null,
}) => {
  return (
    <div className="input-group grid-cols-1 md:grid-cols-2 items-center md:my-0.5 md:px-1 data gap-1">
      <label className="block text-xs font-bold text-gray-600 mb-1">
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        cla
        type={type}
        disabled={disabled}
        required={required}
        className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm"
        value={value}
        onChange={(e) => {
          type === "number"
            ? setValue(e.target.value)
            : handleOnChange(e, setValue);
        }}
        readOnly={readOnly}
      />
    </div>
  );
};

export const TextAreaNew = ({
  name,
  value,
  setValue,
  readOnly,
  required = false,
  disabled = false,
  rows = 2,
  cols = 30,
  tabIndex = null,
  label = null,
  inputClass = "",
  onBlur = null,
}) => {
  return (
    <div className=" w-full">
      {name && (
        <label className="block text-xs font-bold text-gray-600 mb-1">
          {required ? <RequiredLabel name={label ?? name} /> : (label ?? name)}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        rows={rows}
        cols={cols}
        // tabIndex={tabIndex ?? undefined}
        disabled={disabled}
        required={required}
        readOnly={readOnly}
        value={value}
        onChange={(e) => handleOnChange(e, setValue)}
        onBlur={onBlur}
        placeholder={name}
        className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm  resize-y

          ${readOnly || disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white hover:border-gray-400"}
          ${inputClass}`}
      ></textarea>
    </div>
  );
};

export const DisabledInput = ({
  name,
  type,
  value,
  className = "",
  textClassName = "",
  tabIndex = null,
}) => {
  return (
    <div
      className={`grid-cols-1 md:grid-cols-3 items-center md:my-0.5 md:px-1  font-size:11.5px ${className}`}
    >
      <label
        className={`md:text-start flex ${className} input-label group-hover:text-blue-600 `}
      >
        {name}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type={type}
        className={`input-field ${textClassName}  p-0.5 focus:outline-none md:col-span-1 border-b border-b-gray-500 group-hover:text-blue-600  text-xs  w-32`}
        value={value}
        disabled
      />
    </div>
  );
};

export const SpecialInput = ({
  name,
  type,
  value,
  className = "",
  textClassName = "",
  tabIndex = null,
}) => {
  return (
    <div
      className={`flex flex-col  md:my-0.5 md:px-1  font-size:16.5px ${className}  gap-4 border-b border-b-gray-500 w-32 `}
    >
      <label
        className={`md:text-start flex ${className}  group-hover:text-blue-600  w-32`}
      >
        {name}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type={type}
        className={` ${textClassName}   focus:outline-none md:col-span-1  group-hover:text-blue-600  text-xs  w-32`}
        value={value}
      />
    </div>
  );
};

export const FloatingLabelInput = ({
  label,
  type = "text",
  required = false,
  value,
  setValue,
  autoFocus = false,
  disabled = false,
}) => {
  const [focus, setFocus] = useState(autoFocus);
  return (
    <div className="static flex flex-col p-6">
      <label
        className={
          focus || value
            ? "z-0 absolute -translate-y-6 duration-300 "
            : "absolute mx-1 duration-300 text-gray-400"
        }
      >
        {label}
      </label>
      <input
        disabled={disabled}
        id={label}
        type={type}
        className="z-10 transparent border-2 rounded"
        required={required}
        value={value}
        onFocus={(e) => setFocus(true)}
        onBlur={(e) => setFocus(false)}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        autoFocus={autoFocus}
      />
    </div>
  );
};

export const LongDisabledInput = ({
  name,
  type,
  value,
  className,
  tabIndex = null,
}) => {
  return (
    <div
      className={` grid-flow-col  items-center md:my-0.5 md:px-1 data ${className}`}
    >
      <label className={`md:text-start flex ${className} `}>{name}</label>
      <input
        type={type}
        className={`h-6 border border-gray-500 rounded`}
        value={value}
        disabled
      />
    </div>
  );
};

export const TextArea = ({
  name,
  value,
  setValue,
  readOnly,
  required = false,
  disabled = false,
  rows = 3,
  cols = 30,
  tabIndex = null,
  label = null,
  inputClass = "",
  onBlur = null,
}) => {
  return (
    <div className="mb-1 w-full">
      {name && (
        <label className="block text-xs font-bold text-gray-600 mb-1">
          {required ? <RequiredLabel name={label ?? name} /> : (label ?? name)}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        rows={rows}
        cols={cols}
        tabIndex={tabIndex ?? undefined}
        disabled={disabled}
        required={required}
        readOnly={readOnly}
        value={value}
        onChange={(e) => handleOnChange(e, setValue)}
        onBlur={onBlur}
        placeholder={name}
        className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm resize-none
          ${readOnly || disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white hover:border-gray-400"}
          ${inputClass}`}
      ></textarea>
    </div>
  );
};


// export const DropdownInput = ({
//   name,
//   beforeChange = () => { },
//   onBlur = null,
//   options,
//   value,
//   setValue,
//   defaultValue,
//   className = "",
//   readOnly = false,
//   required = false,
//   disabled = false,
//   clear = false,
//   tabIndex = null,
//   autoFocus = false,
//   width = "full",
//   country
// }) => {
//   const handleOnChange = (e) => {
//     setValue(e.target.value);
//   };

//   const isDisabled = readOnly || disabled;
//   console.log(options, "options in dropdown", value);

//   return (
//     <div className={`mb-2 ${width}`}>
//       {name && (
//         <label className="block text-xs font-bold text-slate-700 mb-1">
//           {required ? <RequiredLabel name={name} /> : name}
//         </label>
//       )}
//       <select
//         onBlur={onBlur}
//         autoFocus={autoFocus}
//         tabIndex={tabIndex ?? undefined}
//         defaultValue={defaultValue}
//         required={required}
//         className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
//           focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
//           transition-all duration-150 shadow-sm

//           ${className}`}
//         value={value}
//         onChange={(e) => {
//           beforeChange();
//           handleOnChange(e);
//         }}
//         disabled={isDisabled}
//       >
//         <option value="" hidden={!clear} className="text-gray-800">
//           Select {name || "option"}
//         </option>
//         {options?.map((option, index) => (
//           <option
//             key={index}
//             value={option.value}
//             className="text-xs py-1 text-gray-800"
//           >
//             {option.show}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// };


export const DropdownInput = forwardRef(({
  name,
  beforeChange = () => { },
  onBlur = null,
  options,
  value,
  setValue,
  defaultValue,
  className = "",
  readOnly = false,
  required = false,
  disabled = false,
  clear = false,
  tabIndex = null,
  autoFocus = false,
  width = "full",
  country,
  openOnFocus = false,   // new prop
}, ref) => {


  const handleOnChange = (e) => {
    setValue(e.target.value);
  };

  const isDisabled = readOnly || disabled;

  useEffect(() => {
    if (ref?.current && openOnFocus) {
      ref.current.focus();

    }
  }, [openOnFocus]);


  return (
    <div className={` ${width}`}>
      {name && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {required ? <RequiredLabel name={name} /> : name}
        </label>
      )}
      <select
        ref={ref}
        onBlur={onBlur}
        autoFocus={autoFocus}
        tabIndex={tabIndex ?? undefined}
        defaultValue={defaultValue}
        required={required}
        className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm
          ${className}`}
        value={value}
        onChange={(e) => {
          beforeChange();
          handleOnChange(e);
        }}
        onFocus={(e) => {
          if (openOnFocus) {
            e.target.click();
          }
        }}
        disabled={isDisabled}
      >
        <option value="" hidden={!clear} className="text-gray-800">
          Select
        </option>
        {options?.map((option, index) => (
          <option
            key={index}
            value={option.value}
            className="text-xs py-1 text-gray-800"
          >
            {option.show}
          </option>
        ))}
      </select>
    </div>
  );
});

export const DropdownInputSearch = ({
  name,
  options,
  value,
  setValue,
  readOnly = false,
  className = "",
  required = false,
  disabled = false,
  placeholder = "Select",
}) => {
  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: "30px",
      height: "28px",
      borderRadius: "6px",
      fontSize: "13px",
      borderColor: "#d1d5db",
      padding: "0",
      backgroundColor: readOnly || disabled ? "#f3f4f6" : "#ffffff",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#f3f4f6" : "#ffffff",
      color: "#111827",
      fontSize: "11px",
      paddingTop: "4px",
      paddingBottom: "4px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 6px",
      height: "28px",
    }),
    input: (base) => ({
      ...base,
      margin: "0",
      padding: "0",
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: "11px",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "28px",
    }),
  };

  const selectedOption = options?.find((opt) => String(opt.value) === String(value));

  return (
    <div className={`block text-xs font-bold text-gray-600 mb-1 ${className}`}>
      <span className="mb-3">
        {required ? <RequiredLabel name={name} /> : name}
      </span>
      <div className="mt-1">
        <Select
          options={options}
          value={selectedOption}
          onChange={(opt) => setValue(opt ? opt.value : "")}
          getOptionLabel={(opt) => opt.show}
          placeholder={placeholder}
          isClearable
          isSearchable
          styles={customStyles}
          isDisabled={readOnly || disabled}
        />
      </div>
    </div>
  );
};



export const DropdownInputForm = ({
  name,
  beforeChange = () => { },
  onBlur = null,
  options,
  value,
  setValue,
  defaultValue,
  className,
  readOnly,
  required = false,
  disabled = false,
  clear = false,
  tabIndex = null,
  autoFocus = false,
  width = "32",
}) => {
  const handleOnChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="input-group items-center md:my-1 md:px-1 data ">
      <label className={`md:text-start flex  text-xs ${className}`}>
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <select
        onBlur={onBlur}
        autoFocus={autoFocus}
        tabIndex={tabIndex ? tabIndex : undefined}
        defaultValue={defaultValue}
        id="dd"
        required={required}
        name="name"
        className={` md:col-span-2 col-span-1 px-3  focus:outline-none focus:ring-2 focus:ring-blue-400 border border-gray-300 w-${width}`}
        value={value}
        onChange={(e) => {
          beforeChange();
          handleOnChange(e);
        }}
        disabled={readOnly}
      >
        <option value="" hidden={!clear}>
          Select
        </option>
        {options?.map((option, index) => (
          <option key={index} value={option.value}>
            {option.show}
          </option>
        ))}
      </select>
    </div>
  );
};

export const LongDropdownInput = ({
  name,
  options,
  value,
  setValue,
  defaultValue,
  className,
  readOnly,
  required = false,
  disabled = false,
  clear = false,
  tabIndex = null,
}) => {
  const handleOnChange = (e) => {
    setValue(e.target.value);
  };
  return (
    <div className=" grid-cols-12 items-center md:my-1 md:px-1 data">
      <label className={`text-start col-span-2 `}>
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <select
        tabIndex={tabIndex || undefined}
        defaultValue={defaultValue}
        id="dd"
        required={required}
        name="name"
        className={`border border-gray-500 h-6 rounded ${className} col-span-10`}
        value={value}
        onChange={handleOnChange}
        disabled={readOnly || disabled}
      >
        <option value="">Select</option>
        {(Array.isArray(options) ? options : []).map((option, index) => (
          <option key={index} value={option.value}>
            {option.show}
          </option>
        ))}
      </select>
    </div>
  );
};

export const RadioButton = ({
  label,
  value,
  onChange,
  readOnly,
  className,
  tabIndex = null,
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <input
        type="radio"
        tabIndex={tabIndex ? tabIndex : undefined}
        checked={value}
        onChange={onChange}
      />
      <label>{label}</label>
    </div>
  );
};

export const DropdownInputWithoutLabel = ({
  options,
  value,
  setValue,
  readOnly,
  required = false,
  disabled = false,
  tabIndex = null,
}) => {
  const handleOnChange = (e) => {
    setValue(e.target.value);
  };
  return (
    <div className=" grid-cols-1 md:grid-cols-3 items-center md:my-1 md:px-1 data">
      <select
        tabIndex={tabIndex ? tabIndex : undefined}
        required={required}
        name="name"
        className="input-field md:col-span-2 border col-span-1 rounded"
        value={value}
        onChange={(e) => {
          handleOnChange(e);
        }}
        disabled={readOnly}
      >
        <option value="" hidden>
          Select
        </option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.show}
          </option>
        ))}
      </select>
    </div>
  );
};

export const CurrencyInput = ({
  name,
  value,
  setValue,
  readOnly,
  required = false,
  disabled = false,
  tabIndex = null,
}) => {
  const handleOnChange = (e) => {
    setValue(e.target.value);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 items-center md:my-1 md:px-1 data">
      <label htmlFor="id" className="md:text-start flex">
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type="number"
        disabled={disabled}
        required={required}
        className=" focus:outline-none md:col-span-2  rounded"
        min="1"
        step="any"
        id="id"
        value={value}
        onChange={(e) => {
          handleOnChange(e);
        }}
        readOnly={readOnly}
      />
    </div>
  );
};

const RequiredLabel = ({ name }) => (
  <p>
    {`${name}`}
    <span className="text-red-500">*</span>{" "}
  </p>
);

export const DateInput = ({
  name,
  value,
  setValue,
  readOnly,
  required = false,
  type = "date",
  disabled = false,
  tabIndex = null,
  inputClass = "",
  inputHead = null,
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label
        htmlFor={name}
        className={`text-xs font-medium text-gray-700 ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ""
          }`}
      >
        {inputHead ?? name}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          tabIndex={tabIndex}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`
            w-full px-2 py-1 text-[12px] 
            border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            text-gray-700
            ${readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
            ${inputClass}
          `}
        />
      </div>
    </div>
  );
};


export const DateInputNew = forwardRef(({
  name,
  value,
  setValue,
  readOnly,
  required = false,
  type = "",
  disabled = false,
  tabIndex = null,
  inputClass,
  inputHead,
  className,
  nextRef
}, ref) => {
  const today = new Date().toISOString().split("T")[0];
  const [pickerOpen, setPickerOpen] = useState(false);




  const handleFocus = () => {
    // Only attempt to show picker if browser supports it
    if (type === "date" && ref?.current?.showPicker) {
      ref.current.showPicker();
    }
  };

  // const handleKeyDown = (e) => {
  //   if (e.key === "Enter") {
  //     console.log("Enter pressed!");
  //     ref?.current?.showPicker();
  //   }
  // };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!pickerOpen) {
        // First Enter → open the date picker
        ref.current?.showPicker();
        setPickerOpen(true);
      } else {
        // Second Enter → remove focus (close picker)
        ref.current?.blur(); // removes focus
        setPickerOpen(false);
      }
    }
  };
  return (
    <div className="grid-cols-1 md:grid-cols-3 items-center md:px-1">
      {name && (
        <label className={`block  font-bold text-slate-700 mb-1 text-ms ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ""
          }`}>
          {name}
        </label>
      )}
      <input
        ref={ref}
        tabIndex={tabIndex ?? undefined}
        type={type}
        disabled={disabled}
        required={required}
        min={type === "date" ? today : undefined}
        className={`w-full px-2 py-1 text-xs border border-slate-300 rounded-md 
          focus:border-indigo-300 focus:outline-none transition-all duration-200
          hover:border-slate-400 ${readOnly || disabled ? "bg-slate-100" : ""} ${className}`}
        id="id"
        value={value}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}

        onChange={(e) => {
          setValue(e.target.value)

          nextRef?.current?.focus()
        }}
        readOnly={readOnly}


      />
    </div>
  );
});


export const LongDateInput = ({
  name,
  value,
  setValue,
  readOnly,
  className,
  required = false,
  type = "date",
  disabled = false,
  tabIndex = null,
}) => {



  return (
    <div className=" grid-flow-col item-center justify-center gap-12 w-56 items-center md:px-1 data">
      <label htmlFor="id" className="md:text-start flex">
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type={type}
        disabled={disabled}
        required={required}
        className={`${className} focus:outline-none border border-gray-500 form-border-color rounded h-6`}
        id="id"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        readOnly={readOnly}
      />
    </div>
  );
};

export const CheckBox = ({
  name,
  value,
  setValue,
  readOnly = false,
  className,
  required = false,
  disabled = false,
  tabIndex = null,
}) => {
  const handleOnChange = (e) => {
    setValue(!value);
  };

  return (
    <div className="items-center md:my-1 md:px-1 data text-xs ">
      <label
        htmlFor="id"
        className={`md:text-start items-center ${className}  text-xs`}
      >
        <input
          tabIndex={tabIndex ? tabIndex : undefined}
          type="checkbox"
          required={required}
          className="mx-2 py-2"
          checked={value}
          onChange={(e) => {
            handleOnChange(e);
          }}
          disabled={readOnly}
        />
        {name}
      </label>
    </div>
  );
};

export const validateEmail = (data) => {
  return validator.isEmail(data);
};

export const validateMobile = (data) => {
  let regMobile = /^[6-9]\d{9}$/;
  return regMobile.test(data);
};

export const validatePan = (data) => {
  let regpan = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
  return regpan.test(data);
};

export const validatePincode = (data) => {
  return data.toString().length === 6;
};

// export const DropdownWithSearch = ({
//   className,
//   options,
//   value,
//   setValue,
//   readOnly,
//   disabled,
//   required = false,

//   labelField,
//   label,
// }) => {
//   console.log(options, "options");

//   const dispatch = useDispatch();


//   const [currentIndex, setCurrentIndex] = useState("");
//   useEffect(() => setCurrentIndex(new Date()), []);
//   useEffect(() => {
//     const dropDownElement = document.getElementById(`dropdown${currentIndex}`);
//     dropDownElement.addEventListener("keydown", function (ev) {
//       var focusableElementsString = '[tabindex="0"]';
//       let ol = dropDownElement.querySelectorAll(focusableElementsString);
//       if (ev.key === "ArrowDown") {
//         for (let i = 0; i < ol.length; i++) {
//           if (ol[i] === ev.target) {
//             let o = i < ol.length - 1 ? ol[i + 1] : ol[0];
//             o.focus();
//             break;
//           }
//         }
//         ev.preventDefault();
//       } else if (ev.key === "ArrowUp") {
//         for (let i = 0; i < ol.length; i++) {
//           if (ol[i] === ev.target) {
//             let o = ol[i - 1];
//             o.focus();
//             break;
//           }
//         }
//         ev.preventDefault();
//       }
//     });

//     return () => {
//       dropDownElement.removeEventListener("keydown", () => { });
//     };
//   }, [currentIndex]);

//   return (
//     <div id={`dropdown${currentIndex}`} className={`${className} mb-2`}>
//       {label && (
//         <label className="block text-xs font-bold text-slate-700 mb-1">
//           {required ? <RequiredLabel name={label} /> : `${label}`}

//         </label>
//       )}
//       <select
//         // className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
//         className={`w-full px-2 py-1 text-xs border border-slate-300 rounded-md 
//           focus:border-indigo-300 focus:outline-none transition-all duration-200
//           hover:border-slate-400 ${readOnly || disabled ? "bg-slate-100" : ""
//           } ${className}`}

//         disabled={readOnly}
//         readOnly={readOnly}
//         value={value || ""}
//         onChange={(e) => {
//           setValue(e.target.value)
//         }}
//       >
//         {/* {!value && <option value="">Select {optionName}</option>} */}

//         <option value={""}>Select</option>
//         {(options || []).map((option) => (
//           <option key={option.id} value={option.id} classname>
//             {option[labelField]}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// };


export const DropdownWithSearch = forwardRef(({
  className,
  options,
  value,
  setValue,
  readOnly,
  disabled,
  required = false,
  labelField,
  label,
  nextRef = null,
  classNameForOptions  // 👈 next input ref
}, ref) => {

  // 👈 next input ref
  console.log(classNameForOptions, "classNameForOptions")

  const [currentIndex, setCurrentIndex] = useState("");
  useEffect(() => setCurrentIndex(Date.now()), []);

  useEffect(() => {
    const dropDownElement = document.getElementById(`dropdown${currentIndex}`);
    if (!dropDownElement) return;

    const handleKeyDown = (ev) => {
      if (ev.key === "Enter" || ev.key === "Tab") {
        if (nextRef?.current) {
          nextRef.current.focus();
          ev.preventDefault();
        }
      }
    };

    dropDownElement.addEventListener("keydown", handleKeyDown);

    return () => {
      dropDownElement.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, nextRef]);

  return (
    <div id={`dropdown${currentIndex}`} className={``}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {required ? <RequiredLabel name={label} /> : `${label}`}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-2 py-1.5 text-xs border border-slate-300 rounded-md 
    focus:border-indigo-300 focus:outline-none transition-all duration-200
    hover:border-slate-400 ${readOnly || disabled ? "bg-slate-100" : ""} 
    ${className}`}
        disabled={disabled}
        readOnly={readOnly}
        value={value || ""}
        onChange={(e) => setValue(e.target.value)}
      >
        <option value="">Select</option>
        {(options || []).map((option) => (
          <option
            key={option.id}
            value={option.id}
          >
            <span></span>   {option[labelField]}
          </option>
        ))}
      </select>
    </div>
  );
});


export const DropdownWithSearchNew = ({
  className,
  options,
  value,
  setValue,
  readOnly,
  disabled,
  required = false,
  optionValue,
  labelField,
  label,
}) => {
  console.log(options, "options");

  const dispatch = useDispatch();


  const [currentIndex, setCurrentIndex] = useState("");
  useEffect(() => setCurrentIndex(new Date()), []);
  useEffect(() => {
    const dropDownElement = document.getElementById(`dropdown${currentIndex}`);
    dropDownElement.addEventListener("keydown", function (ev) {
      var focusableElementsString = '[tabindex="0"]';
      let ol = dropDownElement.querySelectorAll(focusableElementsString);
      if (ev.key === "ArrowDown") {
        for (let i = 0; i < ol.length; i++) {
          if (ol[i] === ev.target) {
            let o = i < ol.length - 1 ? ol[i + 1] : ol[0];
            o.focus();
            break;
          }
        }
        ev.preventDefault();
      } else if (ev.key === "ArrowUp") {
        for (let i = 0; i < ol.length; i++) {
          if (ol[i] === ev.target) {
            let o = ol[i - 1];
            o.focus();
            break;
          }
        }
        ev.preventDefault();
      }
    });

    return () => {
      dropDownElement.removeEventListener("keydown", () => { });
    };
  }, [currentIndex]);

  return (
    <div id={`dropdown${currentIndex}`} className={`${className} mb-2`}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {required ? <RequiredLabel name={label} /> : `${label}`}

        </label>
      )}
      <select
        // className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
        className={`w-full px-2 py-1 text-xs border border-slate-300 rounded-md 
          focus:border-indigo-300 focus:outline-none transition-all duration-200
          hover:border-slate-400 ${readOnly || disabled ? "bg-slate-100" : ""
          } ${className}`}

        disabled={disabled}
        readOnly={readOnly}
        value={value || ""}
        onChange={(e) => {
          setValue(e.target.value)
        }}
      >
        {/* {!value && <option value="">Select {optionName}</option>} */}

        <option value={""}>Select</option>
        {(options || []).map((option) => (
          <option key={option[optionValue]} value={option[optionValue]} classname>
            {option[labelField]}
          </option>
        ))}
      </select>
    </div>
  );
};

// export const Modal = ({ isOpen, onClose = null, children, widthClass }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center  justify-center overflow-auto bg-gray-800 bg-opacity-50 mb-5">
//       <div className={`relative bg-white rounded-lg ${widthClass}`}>
//         {onClose ? (
//           <button
//             className="absolute top-0 hover:bg-red-400 right-0 m-4 text-gray-600 hover:text-gray-800 focus:outline-none mb-5"
//             onClick={onClose}
//           >
//             <svg
//               className="h-6 w-6 fill-current "
//               viewBox="0 0 20 20"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <title>Close</title>
//               <path
//                 d="M14.348 5.652a.999.999 0 00-1.414 0L10 8.586l-2.93-2.93a.999.999 0 10-1.414 1.414L8.586 10l-2.93 2.93a.999.999 0 101.414 1.414L10 11.414l2.93 2.93a.999.999 0 101.414-1.414L11.414 10l2.93-2.93a.999.999 0 000-1.414z"
//                 fillRule="evenodd"
//               />
//             </svg>
//           </button>
//         ) : (
//           ""
//         )}
//         {children}
//       </div>
//     </div>
//   );
// };

export const ToggleButton = ({
  name,
  value,
  setActive,
  required,
  readOnly,
  disabled = false,
}) => {
  const [isToggled, setIsToggled] = useState(false);

  useEffect(() => {
    if (value) {
      setIsToggled(true);
    } else {
      setIsToggled(false);
    }
  }, [value, isToggled]);

  return (
    <div>
      <div className="">
        {/* <label className={`md:text-start flex`}>{required ? <RequiredLabel name={name} /> : `${name}`}</label> */}
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isToggled}
              onChange={() => {
                if (!readOnly) {
                  setIsToggled(!isToggled);
                  setActive(!value);
                }
              }}
              disabled={disabled}
              required
            />
            <div className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 peer transition duration-300"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full peer-checked:translate-x-6 transition-transform duration-300 shadow-sm"></div>
          </label>

          <span className="ml-2 block text-xs font-bold text-gray-600">{value ? "Active" : "Inactive"}</span>
        </div>
      </div>
    </div>
  );
};


const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export function isValidPAN(pan) {
  return panRegex.test(pan.toUpperCase());
}



export const ReusableTable = ({
  columns,
  data,
  itemsPerPage = 15,
  onView,
  onEdit,
  onDelete,
  emptyStateMessage = 'No data available',
  rowActions = true,
  width
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math?.ceil(data?.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem);


  const { hasPermission } = usePermissionForUsers()

  // console.log(hasPermission, "permission")

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const Pagination = () => {
    // if (totalPages <= 1) return null;

    return (
      <div className=" w-full flex flex-col sm:flex-row justify-between items-center p-2 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2 sm:mb-0">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data?.length)} of {data?.length} entries
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
          >
            <FaChevronLeft className="inline" />
          </button>

          {Array?.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded-md ${currentPage === pageNum
                  ? 'bg-indigo-800 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="px-3 py-1">...</span>
          )}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className={`px-3 py-1 rounded-md ${currentPage === totalPages
                ? 'bg-indigo-800 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
          >
            <FaChevronRight className="inline" />
          </button>
        </div>
      </div>
    );
  };



  return (
    <>
      <div className="bg-[#F1F1F0] shadow-sm h-[71vh]">
        <div className="h-[100vh] rounded-lg bg-[#F1F1F0] shadow-sm">
          <div className="h-[68vh]">
            <table className="">
              <thead className="bg-gray-200 text-gray-800 ">

                <tr>
                  {columns?.map((column, index) => (
                    <th
                      key={index}
                      className={` font-medium text-gray-900 py-2 text-[12px] px-8 text-center uppercase  ${column.header !== "" ? "border-r border-white/50" : ""
                        } `}
                    >
                      {column.header}
                    </th>
                  ))}
                  {rowActions && (
                    <th className="px-4 py-2 text-center text-[12px] font-medium justify-end">
                      ACTIONS
                    </th>
                  )}
                </tr>





              </thead>
              <tbody>
                {currentItems?.length === 0 ? (
                  <tr>
                    <td colSpan={columns?.length + (rowActions ? 1 : 0)} className="px-4 py-4 text-center text-gray-500">
                      {emptyStateMessage}
                    </td>
                  </tr>
                ) : (
                  currentItems?.map((item, index) => (

                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        }`}
                    >

                      {columns?.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className={` ${column.className ? column.className : ""} ${column.header !== "" ? 'border-r border-white/50' : ''} h-7 px-1.5`}
                        >
                          {column.accessor(item, indexOfFirstItem + index)}
                        </td>
                      ))}
                      {rowActions && (
                        <td className=" w-[30px] border-gray-200 gap-1 px-2   h-8 justify-end">
                          <div className="flex">
                            {onView && (
                              <button
                                className="text-blue-600  flex items-center   px-1  bg-blue-50 rounded"
                                onClick={() => hasPermission(() => onView(item.id), "read")}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                            {onEdit && (
                              <button
                                className="text-green-600 gap-1 px-1   bg-green-50 rounded"
                                onClick={() => hasPermission(() => onEdit(item.id), "edit")}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                            )}
                            {onDelete && (
                              <button
                                className=" text-red-800 flex items-center gap-1 px-1  bg-red-50 rounded"
                                onClick={() => hasPermission(() => onDelete(item.id), "delete", item?._count)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {/* <span className="text-xs">delete</span> */}
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="h-[10vh]">
        <Pagination />
      </div>

    </>





  );
};



// export function ReusableSearchableInput({
//   label,
//   placeholder,
//   onDeleteItem,
//   optionList,
//   component,
//   setSearchTerm,
//   searchTerm,
//   readOnly,
//   ref,
//   nextRef

// }) {
//   const companyId = secureLocalStorage.getItem(
//     sessionStorage.getItem("sessionId") + "userCompanyId"
//   );
//   const branchId = secureLocalStorage.getItem(
//     sessionStorage.getItem("sessionId") + "currentBranchId"
//   );
//   const userId = secureLocalStorage.getItem(
//     sessionStorage.getItem("sessionId") + "userId"
//   ); const {
//     data: partyList,
//     isLoading: isPartyLoading,
//     isFetching: isPartyFetching,
//   } = useGetPartyQuery({params: {companyId, userId} });
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [tooltipVisible, setTooltipVisible] = useState(false);
//   const [editingItem, setEditingItem] = useState("");
//   const containerRef = useRef(null);
//   const modal = useModal();
//   const [openModel, setOpenModel] = useState(false)
//   const {openAddModal} = modal || { };
//   const [search, setSearch] = useState("");
//   const [filteredPages, setFilteredPages] = useState([]);

//   const [isListShow, setIsListShow] = useState(false);
//   const inputRef = useOutsideClick(() => {
//     setIsListShow(false);
//   });

//   console.log(optionList, "optionList")
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (containerRef.current && !containerRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);



//   const handleEdit = (id, e) => {
//     e.stopPropagation();
//     setEditingItem(id);
//     setIsDropdownOpen(false);
//     setOpenModel(true)
//   };

//   const handleDelete = (itemId, e) => {
//     onDeleteItem(itemId);
//   };


//   useEffect(() => {
//     if (!partyList) return;
//     if (!search) {
//       setFilteredPages(partyList?.data);
//     }
//     setFilteredPages(
//       partyList?.data?.filter((page) =>
//         page?.code?.toLowerCase().includes(search.toLowerCase())
//       )
//     );
//   }, [search, partyList, isPartyFetching, isPartyLoading]);


//   useEffect(() => {
//     let pageSearchComponent = document.getElementById("pageSearch");
//     if (!pageSearchComponent) return;
//     pageSearchComponent.addEventListener("keydown", function (ev) {
//       var focusableElementsString = '[tabindex="0"]';
//       let ol = document.querySelectorAll(focusableElementsString);
//       if (ev.key === "ArrowDown") {
//         for (let i = 0; i < ol.length; i++) {
//           if (ol[i] === ev.target) {
//             let o = i < ol.length - 1 ? ol[i + 1] : ol[0];
//             o.focus();
//             break;
//           }
//         }
//         ev.preventDefault();
//       } else if (ev.key === "ArrowUp") {
//         for (let i = 0; i < ol.length; i++) {
//           if (ol[i] === ev.target) {
//             let o = ol[i - 1];
//             o.focus();
//             break;
//           }
//         }
//         ev.preventDefault();
//       }
//     });
//     return () => {
//       pageSearchComponent.removeEventListener("keydown", () => { });
//     };
//   }, []);

//   return (
//     <>
//       <Modal
//         isOpen={openModel}
//         onClose={() => setOpenModel(false)}
//         widthClass={"w-[10%] h-[10%]"}
//       >
//         <DynamicRenderer componentName={component} editingItem={editingItem} onCloseForm={() => setOpenModel(false)} />
//       </Modal>


//       <div className="relative text-sm w-full" id="pageSearch" ref={ref}>
//         <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>

//         <div className="flex gap-2">
//           <div className="relative flex-grow">
//             <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
//             {isListShow ? (
//               <input
//                 className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-md 
//               focus:border-indigo-300 focus:outline-none transition-all duration-200
//               hover:border-slate-400 text-gray-800"
//                 placeholder={placeholder}
//                 value={search}
//                 onChange={(e) => {
//                   // setSearchTerm(e.target.value);
//                   setIsDropdownOpen(true);
//                   setSearch(e.target.value)
//                 }}
//                 onFocus={() => {
//                   setIsDropdownOpen(true)
//                   setIsListShow(true);
//                 }}
//                 disabled={readOnly}
//                 tabIndex={0}
//                 ref={ref}

//               />
//             ) :
//               (

//                 <input
//                   className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-md 
//                   focus:border-indigo-300 focus:outline-none transition-all duration-200
//                   hover:border-slate-400 text-gray-800"
//                   ref={ref}
//                   placeholder={placeholder}
//                   value={findFromList(searchTerm, optionList, "code")}
//                   onChange={(e) => {
//                     //  setSearchTerm(e.target.value);
//                     setIsDropdownOpen(true);
//                     if (e.key === "Enter") {
//                       e.preventDefault();
//                       nextRef.current.focus();
//                       if (nextRef?.current) {
//                         console.log("Focusing next input ref:", nextRef.current);
//                         nextRef.current.focus();
//                       }
//                     }
//                   }}
//                   onFocus={() => {
//                     setIsDropdownOpen(true)
//                     setIsListShow(true);
//                   }}
//                   disabled={readOnly}
//                   tabIndex={0}

//                 />
//               )

//             }


//           </div>

//           <div className="relative">
//             <button
//               className="h-full px-3 py-1.5 border border-green-500 rounded-md
//               hover:bg-green-500 text-green-600 hover:text-white transition-colors flex items-center justify-center"
//               disabled={readOnly}
//               onClick={() => {
//                 // openAddModal();
//                 // setIsDropdownOpen(false);
//                 setEditingItem("new");
//                 setOpenModel(true)
//               }}
//               onMouseEnter={() => setTooltipVisible(true)}
//               onMouseLeave={() => setTooltipVisible(false)}
//               aria-label="Add supplier"

//             >
//               <FaPlus className="text-sm" />
//             </button>
//             {tooltipVisible && (
//               <div className="absolute  z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
//                 <div className="flex items-start">
//                   <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
//                   <span>Click to add a new supplier</span>
//                 </div>
//                 <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
//               </div>
//             )}
//           </div>
//         </div>

//         {isDropdownOpen && (
//           <div className="border border-slate-200 rounded-md shadow-md bg-white mt-1 max-h-40 overflow-y-auto z-20 absolute w-full">
//             {optionList?.length > 0 ? (
//               filteredPages?.map((item) => (
//                 <div
//                   key={item.id}
//                   tabIndex={0}
//                   className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer transition-colors flex justify-between items-center group"
//                   onClick={() => { setSearchTerm(item.id); setIsDropdownOpen(false); setSearch(""); setIsListShow(false) }}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       setSearchTerm(item.id);
//                       setSearch("");
//                       setIsListShow(false);
//                       setIsDropdownOpen(false);

//                     }
//                   }}
//                 >
//                   <div>
//                     <div className="font-medium">{item.code}</div>

//                   </div>
//                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                     <button
//                       className="text-indigo-600 hover:text-indigo-800 p-1"
//                       onClick={(e) => handleEdit(item?.id, e)}
//                       title="Edit supplier"
//                     >
//                       <FaEdit className="text-sm" />
//                     </button>
//                     <button
//                       className="text-red-600 hover:text-red-800 p-1"
//                       onClick={(e) => handleDelete(item?.id)}
//                       title="Delete supplier"
//                     >
//                       <FaTrash className="text-sm" />
//                     </button>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <button
//                 type="button"
//                 className="w-full px-3 py-2 text-left text-indigo-600 hover:bg-slate-50 flex items-center gap-2"
//                 onClick={() => {
//                   setEditingItem(null);
//                   setIsDropdownOpen(false);
//                   openAddModal();
//                 }}
//               >
//                 {/* <FaPlus className="text-xs" />
//                 Create "{searchTerm}" */}
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </>


//   );
// }



export const ReusableSearchableInput = forwardRef(
  (
    {
      label,
      placeholder,
      onDeleteItem,
      component,
      setSearchTerm,
      searchTerm,
      readOnly,
      nextRef,
      required,
      show,
      name,
      disabled,
      optionList
    },
    ref
  ) => {

    // console.log(optionList?.filter(item  => item[show]), "optionList")

    const companyId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    );

    const userId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userId"
    );

    const {
      data: partyList,
      isLoading: isPartyLoading,
      isFetching: isPartyFetching,
    } = useGetPartyQuery({ params: { companyId, userId, isAddressCombined: true } });


    console.log(partyList, "partyList")

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [editingItem, setEditingItem] = useState("");
    const containerRef = useRef(null);
    const modal = useModal();
    const [openModel, setOpenModel] = useState(false);
    const { openAddModal } = modal || {};
    const [search, setSearch] = useState("");
    const [filteredPages, setFilteredPages] = useState([]);
    const [isListShow, setIsListShow] = useState(false);

    const inputRef = useOutsideClick(() => {
      setIsListShow(false);
    });

    // close dropdown if click outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setIsDropdownOpen(false);
          setIsListShow(false)

        }
        console.log(event, "eventevent")
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleEdit = (id, e) => {
      e.stopPropagation();
      setEditingItem(id);
      setIsDropdownOpen(false);
      setOpenModel(true);
    };

    const handleDelete = (itemId, e) => {
      onDeleteItem(itemId);
    };

    useEffect(() => {
      if (!partyList) return;
      if (!search) {
        setFilteredPages(partyList?.data);
      }
      setFilteredPages(
        partyList?.data?.filter((page) => {
          return (
            page?.name?.toLowerCase().includes(search.toLowerCase()) &&
            page[show]
          );
        })
      );
    }, [search, partyList, isPartyFetching, isPartyLoading]);

    // Arrow navigation
    useEffect(() => {
      let pageSearchComponent = document.getElementById("pageSearch");
      if (!pageSearchComponent) return;
      const keyHandler = (ev) => {
        var focusableElementsString = '[tabindex="0"]';
        let ol = document.querySelectorAll(focusableElementsString);
        if (ev.key === "ArrowDown") {
          for (let i = 0; i < ol.length; i++) {
            if (ol[i] === ev.target) {
              let o = i < ol.length - 1 ? ol[i + 1] : ol[0];
              o.focus();
              break;
            }
          }
          ev.preventDefault();
        } else if (ev.key === "ArrowUp") {
          for (let i = 0; i < ol.length; i++) {
            if (ol[i] === ev.target) {
              let o = ol[i - 1];
              o.focus();
              break;
            }
          }
          ev.preventDefault();
        }
      };
      pageSearchComponent.addEventListener("keydown", keyHandler);
      return () => {
        pageSearchComponent.removeEventListener("keydown", keyHandler);
      };
    }, [isDropdownOpen]);


    console.log(filteredPages, "filteredPages")


    return (
      <>
        <Modal
          isOpen={openModel}
          onClose={() => setOpenModel(false)}
          widthClass={"w-[90%] h-[98%] "}
        >
          <DynamicRenderer
            componentName={component}
            editingItem={editingItem}
            onCloseForm={() => setOpenModel(false)}
            show={show}
          // childId={childId}
          />
        </Modal>

        <div className="relative text-sm w-full" id="pageSearch" ref={containerRef}>
          {/* <label className="block text-xs font-bold text-slate-700 mb-1">
            {label}
          </label> */}
          {label && (
            <label className="block text-xs font-bold text-gray-600 mb-1">
              {required ? <RequiredLabel name={label ? label : name} /> : label}
            </label>
          )}

          <div className="flex gap-2">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
              {isListShow ? (
                <input
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-md 
              focus:border-indigo-300 focus:outline-none transition-all duration-200
              hover:border-slate-400 text-gray-800"
                  placeholder={placeholder}
                  value={search}
                  onChange={(e) => {
                    setIsDropdownOpen(true);
                    setSearchTerm(e.target.value)
                  }}
                  onFocus={(e) => {
                    // setSearchTerm(e.target.value)

                    setIsDropdownOpen(true);
                    setIsListShow(true);
                  }}
                  disabled={disabled || readOnly}
                  tabIndex={0}
                  ref={ref}
                />
              ) : (
                <input
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-md 
                  focus:border-indigo-300 focus:outline-none transition-all duration-200
                  hover:border-slate-400 text-gray-800"
                  ref={ref} // ✅ parent gets this ref
                  placeholder={placeholder}
                  value={findFromList(searchTerm, optionList, "name")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (nextRef?.current) {
                        nextRef.current.focus();
                      }
                    }
                  }}
                  onFocus={() => {
                    setIsDropdownOpen(true);
                    setIsListShow(true);
                  }}
                  disabled={disabled || readOnly}
                  tabIndex={0}
                />
              )}
            </div>

            <div className="relative">
              <button
                className="h-full px-3 py-1.5 border border-green-500 rounded-md
              hover:bg-green-500 text-green-600 hover:text-white transition-colors flex items-center justify-center"
                disabled={disabled || readOnly}
                onClick={() => {
                  setEditingItem("new");
                  setOpenModel(true);
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
              {partyList?.data?.length > 0 ? (
                filteredPages?.map((item) => (
                  <div
                    key={item.id}
                    tabIndex={0}
                    className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer transition-colors flex justify-between items-center group"
                    onClick={() => {
                      setSearchTerm(item.id);
                      setIsDropdownOpen(false);
                      setSearch("");
                      setIsListShow(false);
                      if (nextRef?.current) {
                        nextRef?.current?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearchTerm(item.id);
                        setSearch("");
                        setIsListShow(false);
                        setIsDropdownOpen(false);
                        if (nextRef?.current) {
                          e.preventDefault();
                          nextRef?.current?.focus();
                        }

                      }
                    }}
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
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
                </button>
              )}
            </div>
          )}
        </div>
      </>
    );
  }
);


export const TextInputNew = ({
  name,
  label,
  type = "text",
  value,
  setValue,
  readOnly = false,
  className = "",
  required = false,
  disabled = false,
  tabIndex = null,
  onBlur = null,
  width = "full",
  max,
  handleChange
}) => {
  console.log(max, "max")
  return (
    <div className={`mb-2 ${width}`}>
      {name && (
        <label className="block text-xs font-bold text-gray-600 mb-1">
          {required ? <RequiredLabel name={label ? label : name} /> : name}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) =>

          handleChange ? handleOnChange(e, setValue) : setValue(e.target.value)
        }

        onBlur={onBlur}
        placeholder={name}
        readOnly={readOnly}
        disabled={disabled}
        tabIndex={tabIndex ?? undefined}
        max={max ? String(max) : undefined}
        className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm
         
          ${className}`
        }
      />
      {/* ${readOnly || disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white hover:border-gray-400"} */}
    </div>
  );
};

export const TextInputNew1 = forwardRef(({
  name,
  label,
  type = "text",
  value,
  setValue,
  readOnly = false,
  className = "",
  required = false,
  disabled = false,
  tabIndex = null,
  onBlur = null,
  width = "full",
  max,
  handleChange
}, ref) => {
  return (
    <div className={`mb ${width}`}>
      {name && (
        <label className="block text-xs font-bold text-gray-600 mb-1">
          {required ? <RequiredLabel name={label ? label : name} /> : name}
        </label>
      )}
      <input
        ref={ref}  // ✅ ref attached here
        type={type}
        value={value}
        onChange={(e) => {
          const val = e.target.value.toUpperCase();
          setValue(val);
          if (handleChange) handleChange(val);
        }}
        onBlur={onBlur}
        placeholder={name}
        readOnly={readOnly}
        disabled={disabled}
        tabIndex={tabIndex ?? undefined}
        max={max ? String(max) : undefined}
        className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-150 shadow-sm ${readOnly || disabled ? "bg-slate-100" : ""}
            ${className}`}
      />
    </div>
  );
});

export function childRecordCount(count) {
  if (!count) return false
  return Object.values(count).some(v => v > 0);

}


export const DropdownInputNew = forwardRef(({
  name,
  beforeChange = () => { },
  onBlur = null,
  options,
  value,
  setValue,
  defaultValue,
  className = "",
  readOnly = false,
  required = false,
  disabled = false,
  clear = false,
  tabIndex = null,
  autoFocus = false,
  width = "full",
  country,
  openOnFocus = false,
  show,
  searchable = false,
  addNewLabel = "+ Add New",
  childComponent = null,
  addNewModalWidth = "w-[40%] h-[45%]",
  widthClass
}, ref) => {

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [deletingOption, setDeletingOption] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const openedByFocusRef = useRef(false);

  const isDisabled = readOnly || disabled;

  const handleAddNewSuccess = (newValue) => {
    beforeChange();
    setValue(newValue);
    setShowAddNew(false);
    setIsOpen(false);
    setSearch("");
    if (onBlur) onBlur();
  };

  const handleDeleteSuccess = () => {
    if (deletingOption && String(deletingOption.value) === String(value)) {
      beforeChange();
      setValue("");
      if (onBlur) onBlur();
    }
    setDeletingOption(null);
  };

  // Use custom dropdown when addNewComponent is provided (native select can't host clickable options)
  const useCustomDropdown = searchable || !!childComponent;

  const updateDropdownPos = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom, left: rect.left, width: rect.width });
    }
  }, []);

  // Close on outside click (searchable mode)
  useEffect(() => {
    if (!useCustomDropdown) return;
    const handleClickOutside = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [useCustomDropdown]);

  // Focus search input when dropdown opens; reset highlight
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
    if (!isOpen) setHighlightedIndex(-1);
  }, [isOpen]);

  // Reset highlight when search changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [search]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex];
      if (item) item.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // Reposition dropdown on resize or scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const handleReposition = () => updateDropdownPos();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, updateDropdownPos]);

  useEffect(() => {
    if (ref?.current && openOnFocus) {
      ref.current.focus();
    }
  }, [openOnFocus]);

  // Native select (non-searchable, no addNewComponent)
  if (!useCustomDropdown) {
    const handleOnChange = (e) => {
      setValue(e.target.value);
    };
    return (
      <div className={`mb-1 ${width}`}>
        {name && (
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {required ? <RequiredLabel name={name} /> : name}
          </label>
        )}
        <select
          ref={ref}
          onBlur={onBlur}
          autoFocus={autoFocus}
          tabIndex={tabIndex ?? undefined}
          defaultValue={defaultValue}
          required={required}
          className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-150 shadow-sm ${readOnly || disabled ? "bg-slate-100" : ""}
            ${className}`}
          value={value}
          onChange={(e) => {
            beforeChange();
            handleOnChange(e);
          }}
          onFocus={(e) => {
            if (openOnFocus) {
              e.target.click();
            }
          }}
          disabled={isDisabled}
        >
          <option value="" hidden={!clear} className="text-gray-800">
            Select
          </option>
          {options?.map((option, index) => (
            <option
              key={index}
              value={option.value}
              className="text-xs py-1 text-gray-800"
            >
              {option.show}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Custom dropdown (searchable or has addNewComponent)
  const selectedLabel = options?.find((o) => String(o.value) === String(value))?.show || "";
  const filtered = (options || []).filter((o) =>
    String(o.show).toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (optionValue) => {
    beforeChange();
    setValue(optionValue);
    setIsOpen(false);
    setSearch("");
    if (onBlur) onBlur();
  };

  return (
    <div className={`mb-1 ${width}`} ref={containerRef}>
      {name && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {required ? <RequiredLabel name={name} /> : name}
        </label>
      )}
      <button
        ref={buttonRef}
        type="button"
        disabled={isDisabled}
        tabIndex={tabIndex ?? undefined}
        onFocus={() => {
          if (!isDisabled) {
            openedByFocusRef.current = true;
            updateDropdownPos();
            setIsOpen(true);
          }
        }}
        onClick={() => {
          if (!isDisabled) {
            if (openedByFocusRef.current) {
              openedByFocusRef.current = false;
              return;
            }
            updateDropdownPos();
            setIsOpen((o) => !o);
          }
        }}
        className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-left
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm flex justify-between items-center
          ${isDisabled ? "bg-slate-100 cursor-not-allowed" : "bg-white cursor-pointer"}
          ${className}`}
      >
        <span className={selectedLabel ? "text-gray-800" : "text-gray-400"}>
          {selectedLabel || "Select"}
        </span>
        <svg className={`w-3 h-3 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: "fixed", top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
          className="bg-white border border-gray-300 rounded-lg shadow-lg"
        >
          <div className="p-1.5 border-b border-gray-200">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightedIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
                    handleSelect(filtered[highlightedIndex].value);
                  }
                } else if (e.key === "Escape") {
                  setIsOpen(false);
                  setSearch("");
                  buttonRef.current?.focus();
                }
              }}
            />
          </div>
          <ul ref={listRef} className="max-h-48 overflow-y-auto py-1">
            {childComponent && !isDisabled && (
              <li
                onClick={() => { setIsOpen(false); setSearch(""); setShowAddNew(true); }}
                className="px-3 py-1.5 text-xs text-blue-600 font-semibold hover:bg-blue-50 cursor-pointer border-b border-gray-100"
              >
                {addNewLabel}
              </li>
            )}
            {clear && (
              <li
                onClick={() => handleSelect("")}
                className="px-3 py-1.5 text-xs text-gray-400 hover:bg-blue-50 cursor-pointer"
              >
                Select
              </li>
            )}
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-gray-400 text-center">No results</li>
            ) : (
              filtered.map((option, index) => (
                <li
                  key={index}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`group px-3 py-1.5 text-xs cursor-pointer flex justify-between items-center
                    ${index === highlightedIndex ? "bg-blue-50" : ""}
                    ${String(option.value) === String(value) ? "bg-blue-100 font-semibold text-blue-700" : "text-gray-800"}`}
                >
                  <span onClick={() => handleSelect(option.value)} className="flex-1 truncate">{option.show}</span>
                  {(childComponent || childComponent) && !isDisabled && (
                    <span className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {childComponent && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setIsOpen(false); setSearch(""); setEditingOption(option); }}
                          className="p-0.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded"
                        >
                          <FaEdit size={10} />
                        </button>
                      )}
                      {childComponent && (
                        <button
                          type="button"
                          onClick={(e) => {
                            console.log(option, "option")
                            if (childRecordCount(option?._count)) {
                              Swal.fire({
                                title: `Child Record Exists`,
                                icon: "warning",
                              });
                              return;
                            }
                            e.stopPropagation(); setIsOpen(false); setSearch(""); setDeletingOption(option)
                          }}
                          className="p-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <FaTrash size={10} />
                        </button>
                      )}
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>,
        document.body
      )}
      {showAddNew && childComponent && (() => {
        const AddNew = childComponent;
        return (
          <Modal isOpen={showAddNew} onClose={() => setShowAddNew(false)} widthClass={addNewModalWidth}>
            <AddNew onSuccess={handleAddNewSuccess} onClose={() => setShowAddNew(false)} />
          </Modal>
        );
      })()}
      {editingOption && childComponent && (() => {
        const EditComp = childComponent;
        return (
          <Modal isOpen={!!editingOption} onClose={() => setEditingOption(null)} widthClass={addNewModalWidth}>
            <EditComp
              editId={editingOption.value}
              onSuccess={() => setEditingOption(null)}
              onClose={() => setEditingOption(null)}
            />
          </Modal>
        );
      })()}
      {deletingOption && childComponent && (() => {
        const DeleteComp = childComponent;
        return (
          <Modal isOpen={!!deletingOption} onClose={() => setDeletingOption(null)} widthClass={addNewModalWidth}>
            <DeleteComp
              deleteId={deletingOption.value}
              deleteLabel={deletingOption.show}
              onSuccess={handleDeleteSuccess}
              onClose={() => setDeletingOption(null)}
            />
          </Modal>
        );
      })()}
    </div>
  );
});


export const PriceInputWithTax = forwardRef(({
  name,
  value,
  setValue,
  taxType,
  setTaxType,
  required = false,
  disabled = false,
}, ref) => {

  return (
    <div className="mb w-full">
      <label className="block text-xs font-bold text-gray-600 mb-1">
        {name}
      </label>

      <div className="flex">
        {/* Price Input */}
        <input
          ref={ref}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-1.5 text-xs border border-gray-300 
          rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter Price"
        />

        {/* Dropdown */}
        <select
          value={taxType}
          onChange={(e) => setTaxType(e.target.value)}
          disabled={disabled}
          className="px-2 text-xs border border-l-0 border-gray-300 
          rounded-r-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="withTax">With Tax</option>
          <option value="withoutTax">Without Tax</option>
        </select>
      </div>
    </div>
  );
});



export const ReusableSearchableInputNewCustomerwithBranches = forwardRef(
  (
    {
      label,
      placeholder,
      onDeleteItem,
      component,
      setSearchTerm,   // selected value (partyId)
      searchTerm,
      readOnly,
      nextRef,
      required,
      name,
      disabled,
      show,
      id,
    },

    ref

  ) => {
    /* ---------------------------------- DATA ---------------------------------- */

    const companyId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    );
    const userId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userId"
    );

    const { data: partyList } = useGetPartyQuery({
      params: { companyId, userId, isAddressCombined: true },
    });
    const [removeData] = useDeletePartyMutation();

    console.log(searchTerm, "searchTerm")

    /* ---------------------------------- STATE --------------------------------- */

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [openModel, setOpenModel] = useState(false);
    const [childId, setChildId] = useState('')

    const [search, setSearch] = useState("");           // 🔹 search text
    const [filteredPages, setFilteredPages] = useState([]);
    const [isListShow, setIsListShow] = useState(false);

    const containerRef = useRef(null);
    const modal = useModal();
    const { openAddModal } = modal || {};




    /* ---------------------------- OUTSIDE CLICK ---------------------------- */
    // useEffect(() => {
    //   if (id) return;
    //   setIsDropdownOpen(true);
    // }, []);


    useEffect(() => {
      const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setIsDropdownOpen(false);
          setIsListShow(false)

        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ---------------------------- FILTER PARTIES ---------------------------- */

    useEffect(() => {
      if (!partyList?.data) return;

      if (!search.trim()) {
        setFilteredPages(partyList?.data?.filter(i => i[show]));
        return;
      }

      const filtered = partyList?.data?.filter((item) =>

        item?.name?.toLowerCase().includes(search.toLowerCase())
      );

      setFilteredPages(filtered);
    }, [search, partyList]);


    /* ---------------------------- ARROW NAVIGATION --------------------------- */

    useEffect(() => {
      const pageSearch = document.getElementById("pageSearch");
      if (!pageSearch) return;

      const handler = (e) => {

        const items = pageSearch.querySelectorAll('[tabindex="0"]');




        const index = Array.from(items).indexOf(document.activeElement);

        if (e.key === "ArrowDown") {
          items[index + 1]?.focus();
          e.preventDefault();
        }

        if (e.key === "ArrowUp") {
          items[index - 1]?.focus();
          e.preventDefault();
        }
      };

      pageSearch.addEventListener("keydown", handler);
      return () => pageSearch.removeEventListener("keydown", handler);
    }, []);


    /* ---------------------------------- HANDLERS ------------------------------ */

    const handleEdit = (id, e, isChildid) => {
      e.stopPropagation();
      setEditingItem(id);
      setIsDropdownOpen(false);
      setIsListShow(false);
      setOpenModel(true);
      // setChildId(isChildid)

    };

    const handleDelete = async (id, item) => {
      // 1. Validation Check
      if (childRecordCount(item?._count)) {
        return Swal.fire({
          icon: 'error',
          text: 'Child Record Exists',
        });
      }

      try {
        // 2. Execute Delete (Assuming removeData is an RTK Query mutation)
        const deldata = await removeData(id).unwrap();

        // 3. Handle Business Logic Errors from API
        if (deldata?.statusCode === 1) {
          return Swal.fire({
            icon: 'error',
            text: deldata?.message || 'Action failed',
          });
        }



        await Swal.fire({
          icon: 'success',
          title: 'Deleted Successfully',
          showConfirmButton: false,
          timer: 2000
        });


      } catch (error) {
        // 6. Handle Network or Server Errors
        Swal.fire({
          icon: 'error',
          title: 'Submission error',
          text: error?.data?.message || error?.message || 'Something went wrong!',
        });
      }
    };

    /* ---------------------------------- JSX ---------------------------------- */

    return (
      <>
        {/* ----------------------------- MODAL ----------------------------- */}
        <Modal
          isOpen={openModel}
          onClose={() => setOpenModel(false)}
          widthClass="w-[90%] h-[99%]"
        >
          <DynamicRenderer
            componentName={component}
            editingItem={editingItem}
            childId={childId}
            onCloseForm={() => setOpenModel(false)}
          />
        </Modal>

        {/* ----------------------------- INPUT ----------------------------- */}
        <div
          className="relative text-sm w-full overflow-visible"
          id="pageSearch"
          ref={containerRef}
        >
          {label && (
            <label className="block text-xs font-bold text-gray-600 mb-1">
              {required ? <RequiredLabel name={label || name} /> : label}
            </label>
          )}

          <div className="flex gap-2">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />

              {isListShow ? (
                /* ---------------- SEARCH INPUT ---------------- */
                <input
                  ref={ref}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border rounded-md"
                  placeholder={placeholder}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsListShow(true);
                    setIsDropdownOpen(true);
                  }}
                  disabled={disabled || readOnly}
                  tabIndex={0}
                />
              ) : (
                /* ---------------- SELECTED VALUE ---------------- */
                <input
                  ref={ref}
                  className="w-full pl-8 pr-2 py-1.5 text-xs border rounded-md"
                  placeholder={placeholder}
                  value={findFromList(
                    searchTerm,
                    partyList?.data,
                    "name"
                  )}
                  onFocus={() => {
                    setIsListShow(true);
                    setIsDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && nextRef?.current) {
                      nextRef.current.focus();
                    }
                  }}
                  disabled={disabled || readOnly}
                  tabIndex={0}
                />
              )}
            </div>

            {/* ---------------- ADD BUTTON ---------------- */}
            <div className="relative">
              <button
                className="h-full px-3 py-1.5 border border-green-500 rounded-md
                hover:bg-green-500 text-green-600 hover:text-white"
                disabled={disabled || readOnly}
                onClick={() => {
                  setEditingItem("new");
                  setOpenModel(true);
                }}
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
              >
                <FaPlus />
              </button>

              {tooltipVisible && (
                <div className="absolute z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2">
                  <FaInfoCircle className="inline mr-1" />
                  Click to add new party
                </div>
              )}
            </div>
          </div>

          {/* ---------------- DROPDOWN LIST ---------------- */}
          {/* {isDropdownOpen && (
            <div className="absolute w-full mt-1 max-h-40 overflow-y-auto  rounded bg-white z-20 border border-gray-200" ref={ref}>
              {filteredPages.length > 0 ? (
                filteredPages?.map((item) => (
                  <div
                    key={item.id}
                    tabIndex={0}
                    className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer flex justify-between group border rounded-sm border-gray-400"
                    onClick={() => {
                      setSearchTerm(item.id);
                      setSearch("");
                      setIsDropdownOpen(false);
                      setIsListShow(false);
                      nextRef?.current?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearchTerm(item.id);
                        setSearch("");
                        setIsDropdownOpen(false);
                        setIsListShow(false);
                        nextRef?.current?.focus();
                      }
                    }}
                  >
                    <span className='0'>{item.name}</span>

                  
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500">
                  No party found
                </div>
              )}
            </div>
          )} */}
          {isDropdownOpen && (
            <div className="border border-slate-200 rounded-md shadow-md bg-white mt-1 max-h-40 overflow-y-auto z-20 absolute w-full">
              {filteredPages?.length > 0 ? (
                filteredPages?.map((item) => (
                  <div
                    key={item.id}
                    tabIndex={0}
                    className="px-3 py-2 text-xs hover:bg-slate-100 cursor-pointer transition-colors flex justify-between items-center group"
                    onClick={() => {
                      setSearchTerm(item.id);
                      setIsDropdownOpen(false);
                      setSearch("");
                      setIsListShow(false);
                      if (nextRef?.current) {
                        nextRef?.current?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearchTerm(item.id);
                        setSearch("");
                        setIsListShow(false);
                        setIsDropdownOpen(false);
                        if (nextRef?.current) {
                          e.preventDefault();
                          nextRef?.current?.focus();
                        }

                      }
                    }}
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="text-indigo-600 hover:text-indigo-800 p-1"
                        // onClick={(e) => handleEdit(item?.parentId ? item?.parentId : item?.id, e, item?.parentId ? item.id : null)}
                        onClick={(e) => handleEdit(item.id, e)}
                        title="Edit Customer"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-1"
                        onClick={(e) => handleDelete(item?.id, item)}
                        title="Delete Customer"
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
                </button>
              )}
            </div>
          )}
        </div>
      </>
    );
  }
);