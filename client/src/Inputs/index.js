
import validator from "validator";
import React, { useEffect, useRef, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import Select from "react-dropdown-select";
import { findFromList } from "../Utils/helper";
import "./index.css";
import { FormControl, MenuItem, TextField } from "@mui/material";
import { push } from "../redux/features/opentabs";
import { useDispatch } from "react-redux";

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
  labelName,
  setSelected,
  options,
  readOnly = false,
  tabIndex = null,
  className = "",
  inputClass,
}) => {
  console.log(options, "oiptiosn");
  return (
    <div
      className={`m-1  md:grid-cols-3 items-center z-0 md:my-0.5 md:py-3 data ${className}`}
    >
      <label className={`md:text-start flex ${labelName}`}>{name}</label>
      <MultiSelect
        className={`focus:outline-none  border border-gray-500 rounded text-black  ${inputClass}`}
        options={options}
        value={selected}
        onChange={readOnly ? () => { } : setSelected}
        labelledBy="Select"
      />
    </div>
  );
};
export const TextInput = ({
  name,
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
}) => {
  return (
    <div className={`mb-2 ${width}`}>
      {name && (
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {required ? <RequiredLabel name={name} /> : name}
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
        onBlur={onBlur}
        placeholder={name}
        readOnly={readOnly}
        disabled={disabled}
        tabIndex={tabIndex ?? undefined}
        className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm
          ${readOnly || disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white hover:border-gray-400"}
          ${className}`}
      />
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
      <label className="md:text-start flex">
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type={type}
        disabled={disabled}
        required={required}
        className={className}
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
    <div className="mb-3 w-full">
      {name && (
        <label className="block text-xs font-medium text-gray-600 mb-1">
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
        onChange={(e) => setValue(e.target.value)}
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


export const DropdownInput = ({
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
}) => {
  const handleOnChange = (e) => {
    setValue(e.target.value);
  };

  const isDisabled = readOnly || disabled;

  return (
    <div className={`mb-2 ${width}`}>
      {name && (
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {required ? <RequiredLabel name={name} /> : name}
        </label>
      )}
      <select
        onBlur={onBlur}
        autoFocus={autoFocus}
        tabIndex={tabIndex ?? undefined}
        defaultValue={defaultValue}
        required={required}
        className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm appearance-none
          ${isDisabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white hover:border-gray-400 cursor-pointer"}
          ${className}`}
        value={value}
        onChange={(e) => {
          beforeChange();
          handleOnChange(e);
        }}
        disabled={isDisabled}
      >
        <option value="" hidden={!clear}>
          Select {name || "option"}
        </option>
        {options?.map((option, index) => (
          <option
            key={index}
            value={option.value}
            className="text-xs py-1"
          >
            {option.show}
          </option>
        ))}
      </select>
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
        className={` md:col-span-2 col-span-1 px-2 py-1.5  focus:outline-none focus:ring-2 focus:ring-blue-400 border border-gray-300 w-${width}`}
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
        className="input-field focus:outline-none md:col-span-2 border rounded"
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
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${inputClass}
          `}
        />
      </div>
    </div>
  );
};

export const DateInputNew = ({
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
}) => {
  console.log(type, "type");

  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="   grid-cols-1 md:grid-cols-3 items-center  md:px-1 w-24">
      <label
        htmlFor="id"
        className={`md:text-start flex  pb-[3px] text-xs ${inputHead} font-semibold group-hover:text-blue-600`}
      >
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type={type}
        disabled={disabled}
        required={required}
        min={type === "date" ? today : undefined}
        className={`focus:outline-none md:col-span-2 border border-gray-400 text-xs p-0.5  rounded-md w-24 ${inputClass}`}
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

export const DropdownWithSearch = ({
  className,
  options,
  value,
  setValue,
  readOnly,
  disabled,
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
    <div id={`dropdown${currentIndex}`} className={`${className}mb-2`}>
      {label && (
        <label className="block text-xs text-slate-500 mb-1">
          {label}
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
          <option key={option.id} value={option.id} classname>
            {option[labelField]}
          </option>
        ))}
      </select>
    </div>
  );
};

export const Modal = ({ isOpen, onClose = null, children, widthClass }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center  justify-center overflow-auto bg-gray-800 bg-opacity-50 mb-5">
      <div className={`relative bg-white rounded-lg ${widthClass}`}>
        {onClose ? (
          <button
            className="absolute top-0 hover:bg-red-400 right-0 m-4 text-gray-600 hover:text-gray-800 focus:outline-none mb-5"
            onClick={onClose}
          >
            <svg
              className="h-6 w-6 fill-current "
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Close</title>
              <path
                d="M14.348 5.652a.999.999 0 00-1.414 0L10 8.586l-2.93-2.93a.999.999 0 10-1.414 1.414L8.586 10l-2.93 2.93a.999.999 0 101.414 1.414L10 11.414l2.93 2.93a.999.999 0 101.414-1.414L11.414 10l2.93-2.93a.999.999 0 000-1.414z"
                fillRule="evenodd"
              />
            </svg>
          </button>
        ) : (
          ""
        )}
        {children}
      </div>
    </div>
  );
};

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

          <span className="text-xs ml-2">{value ? "Active" : "Inactive"}</span>
        </div>
      </div>
    </div>
  );
};
