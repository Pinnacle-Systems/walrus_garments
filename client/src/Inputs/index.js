import validator from "validator";
import React, { useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import Select from "react-dropdown-select";
import { findFromList } from "../Utils/helper";
import "./index.css";
import { TextField } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setLastTab, setOpenPartyModal } from "../redux/features/openModel";
import { push } from "../redux/features/opentabs";

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
  return (
    <div
      className={`md:grid-cols-3 items-center z-0  ${className}`}
    >
      <label className={`text-xs text-slate-800 group-hover:text-blue-600 md:text-start flex mb-1 ${labelName}`}>{name}</label>
      <MultiSelect
        className={`focus:outline-none   rounded text-black text-xs border border-slate-300 ${inputClass}`}
        // className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-xs"
        options={options}
        value={selected}
        onChange={readOnly ? () => { } : setSelected}
        labelledBy="Select"
      />
    </div>
  );
};

// export const TextInput = ({ name, type, value, setValue, readOnly, className, inputClass, required = false, disabled = false, tabIndex = null, onBlur = null }) => {
//     return (
//         <div className='input-group grid-cols-1 md:grid-cols-3 items-center md:my-0.5 md:px-1 data gap-1'>
//             <label className={`md:text-start flex ${className}`}>{required ? <RequiredLabel name={name} /> : `${name}`}</label>
//             <input onBlur={onBlur} tabIndex={tabIndex ? tabIndex : undefined} type={type} disabled={disabled}
//                 required={required} className={`${"input-field focus:outline-none md:col-span-2 border-gray-500 border rounded"} ${inputClass}`} value={value} onChange={(e) => { type === "number" ? setValue(e.target.value) : handleOnChange(e, setValue) }} readOnly={readOnly}
//                 placeholder={`${name}`}
//             />
//         </div>
//     )
// }

export const TextInput = ({
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
          className="input-label group-hover:text-blue-600  font-weight: 100 text-xs mb-1"
        >
          <span className="flex items-center gap-2  font-weight: 100">
            {required ? <RequiredLabel name={name} /> : `${name}`}
          </span>
        </label>
        <input
          id={name}
          variant="standard"
          name={`${name}`}
          className="w-full px-2 py-1 h-7 border border-slate-300 rounded-lg shadow-sm focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-xs"
          // className={`bg-white text-gray-900 px-2 py-1 focus:outline-none border border-gray-400 rounded-md text-sm text-black shadow-sm w-full h-7 ${className}`}

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
          disabled={readOnly}
          required={required}
          value={value}
          onChange={(e) => {
            type === "number"
              ? setValue(e.target.value)
              : handleOnChange(e, setValue);
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

export const DisabledInput = ({ name, type, value, className = "", textClassName = "", tabIndex = null }) => {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {/* <label className={`text-gray-900 text-sm mb-1 ${className}`}>{name}</label> */}
      <label
        htmlFor="title"
        className="input-label group-hover:text-blue-600  font-weight: 100 text-xs "
      >{name}</label>
      <input
        tabIndex={tabIndex ? tabIndex : undefined}
        type={type}
        className={`bg-white text-gray-900 px-2 py-1 focus:outline-none border border-gray-400 rounded-md text-xs text-black shadow-sm w-full h-7 ${textClassName}`}
        value={value}
        disabled
      />
    </div>
  )
}


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
  rows = 2,
  cols = 30,
  tabIndex = null,
}) => {
  return (
    <div className=" grid-cols-1 md:grid-cols-3 md:my-1 md:px-1 data">
      <label className="md:text-start flex">
        {required ? <RequiredLabel name={name} /> : `${name}`}
      </label>
      <textarea
        tabIndex={tabIndex ? tabIndex : undefined}
        name={name}
        disabled={disabled}
        required={required}
        className="focus:outline-none md:col-span-2 border border-gray-500 rounded"
        cols={cols}
        rows={rows}
        value={value}
        onChange={(e) => {
          handleOnChange(e, setValue);
        }}
        readOnly={readOnly}
      ></textarea>
    </div>
  );
};
export const DropdownInput = ({
  name,
  onBlur = null,
  options = [],
  value,
  setValue,
  defaultValue = "",
  className = "",
  readOnly = false,
  required = false,
  disabled = false,
  clear = true,
  tabIndex = null,
  autoFocus = false,
  masterName = "",
  lastTab,
  setAliasName,
}) => {
  const dispatch = useDispatch();

  const handleOnChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === "__create_new__") {
      dispatch(setOpenPartyModal(true));
      dispatch(setLastTab(lastTab));
      dispatch(push({ name: masterName }));
    } else {
      setValue(selectedValue);
    }
  };

  return (
    <div className={`flex flex-col mb-4 `}>
      {/* <label className={`input-label group-hover:text-blue-600  font-weight: 100 text-xs`}>
        {required ? <RequiredLabel name={name} /> : name}
      </label> */}
      <label
        htmlFor="title"
        className="input-label group-hover:text-blue-600  font-weight: 100 text-xs mb-1"
      >  {required ? <RequiredLabel name={name} /> : name}</label>

      <select
        onBlur={onBlur}
        autoFocus={autoFocus}
        tabIndex={tabIndex || undefined}
        defaultValue={defaultValue}
        required={required}
        value={value}
        name={name}
        onChange={handleOnChange}
        disabled={readOnly || disabled}
        // className={`bg-white text-gray-900 px-2 py-1 focus:outline-none border border-gray-400 rounded-md text-sm text-black shadow-sm w-full h-7 `}
        className="w-full px-2 py-1 h-7 border border-slate-300 rounded-lg shadow-sm focus:border-indigo-400 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-xs"

      // className="text-xs border-0 border-b-2 border-gray-400 bg-transparent px-1  focus:outline-none focus:border-blue-400"
      >
        {clear && (
          <option value="" disabled>
            -- Select {name} --
          </option>
        )}
        {masterName && (
          <option value="__create_new__" className="text-blue-600 font-semibold bg-gray-100">
            + Create New
          </option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.show}
          </option>
        ))}
      </select>
    </div>
  );
};



// export const DropdownInput = ({
//     name,
//     beforeChange = () => { },
//     onBlur = null,
//     options = [],
//     value,
//     setValue,
//     defaultValue,
//     className = "",
//     readOnly = false,
//     required = false,
//     disabled = false,
//     clear = false,
//     tabIndex = null,
//     autoFocus = false,
//     width
// }) => {

//     const handleChange = (e) => {
//         beforeChange();
//         setValue(e.target.value);
//     };

//     return (
//         <div className={`group input-group ${className}`}>
//             <FormControl
//                 variant="standard"
//                 className="w-full"
//                 sx={{
//                     "& .MuiInputBase-input": { fontSize: "12px", padding: "1.5px" },
//                     "& .MuiInputBase-input.Mui-disabled": {
//                         color: "#333",
//                         WebkitTextFillColor: "#333",
//                     },
//                 }}
//             >
//                 <label className="input-label group-hover:text-blue-600 text-normal">
//                     <span className="flex items-center gap-2">
//                         {required ? <RequiredLabel name={name} /> : name}
//                     </span>
//                 </label>

//                 <Select
//                     name="name"
//                     value={value}
//                     onChange={handleChange}
//                     onBlur={onBlur}
//                     defaultValue={defaultValue}
//                     required={required}
//                     disabled={readOnly || disabled}
//                     autoFocus={autoFocus}
//                     tabIndex={tabIndex ?? undefined}
//                     className="rounded border-none mt-0"
//                     sx={{
//                         "& .MuiInputBase-input": { fontSize: "12px" },
//                         "& .MuiInputBase-input.Mui-disabled": {
//                             color: "#333",
//                             WebkitTextFillColor: "#333",
//                         },
//                     }}
//                 >
//                     {clear && (
//                         <MenuItem value="">
//                             <em>Select</em>
//                         </MenuItem>
//                     )}

//                     {options.map((option, index) => (
//                         <MenuItem
//                             key={index}
//                             value={option.value}
//                             sx={{ fontSize: "12px" }}
//                         >
//                             {option.show}
//                         </MenuItem>
//                     ))}
//                 </Select>
//             </FormControl>
//         </div>
//     );
// };

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
        tabIndex={tabIndex ? tabIndex : undefined}
        defaultValue={defaultValue}
        id="dd"
        required={required}
        name="name"
        className={`border border-gray-500 h-6 rounded ${className} col-span-10`}
        value={value}
        onChange={(e) => {
          handleOnChange(e);
        }}
        disabled={readOnly}
      >
        <option value="">Select</option>
        {options.map((option, index) => (
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
  readOnly = false,
  required = false,
  type = "date",
  disabled = false,
  tabIndex = null,
  inputClass = "",
  inputHead = "",
}) => (
  <div className={`flex flex-col mb-4`}>
    {/* <label htmlFor={name} className={`text-gray-700 font-medium mb-1 ${inputHead} `} style={{ fontSize: "10px" }}>
      {required ? <RequiredLabel name={name} /> : name}
    </label> */}


    <label
      htmlFor="title"
      className="input-label group-hover:text-blue-600  font-weight: 100 text-xs "
    > {required ? <RequiredLabel name={name} /> : name}</label>



    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={(e) =>
        type === "number" ? setValue(e.target.value) : handleOnChange(e, setValue)
      }
      variant="standard"
      required={required}
      disabled={readOnly || disabled}
      tabIndex={tabIndex || undefined}
      readOnly={readOnly}
      className={`bg-white text-gray-900 px-2 py-1 focus:outline-none border border-gray-400 rounded-md text-sm  shadow-sm w-full h-7 ${inputClass}`}
      // className={`text-xs border-0 border-b-2 border-gray-400 bg-transparent px-1  focus:outline-none focus:border-blue-400 ${inputClass}`}
      sx={{
        "& .MuiInputBase-input": { fontSize: "12px" },
        "& .MuiInputBase-input.Mui-disabled": {
          color: "#333",
          WebkitTextFillColor: "#333",
        },
      }}
    />
  </div>
);


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
  console.log("value", value);
  return (
    <div className="items-center md:my-1 md:px-1 data  ">
      <label htmlFor="id" className={`md:text-start items-center ${className}`}>
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
  onCreateNew = null,
}) => {
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

  // const ItemRenderer = ({ item, itemIndex, props, state, methods }) =>
  //     <div onClick={() => methods.addItem(item)} tabIndex={0} className='hover:bg-blue-500'>{item.name}</div>

  // const ContentRenderer = ({ state }) =>
  //     <div tabIndex={0} className='hover:bg-blue-500'>{`${state?.values[0]}1`}</div>

  return (
    <div
      id={`dropdown${currentIndex}`}
      className={`${className} ${"bg-white text-black"}`}
    >
      <Select
        searchBy="name"
        options={options || []}
        key={value}
        create={onCreateNew ? true : false}
        onCreateNew={onCreateNew}
        // ContentRenderer={ContentRenderer}
        // itemRenderer={ItemRenderer}
        className={`${className} ${"text-black"}`}
        disabled={readOnly}
        labelField="name"
        valueField="id"
        multi={false}
        values={
          value
            ? [
              {
                id: value,
                name: findFromList(value, options || [], "name"),
              },
            ]
            : []
        }
        onChange={(value) => {
          setValue(value[0] ? value[0]?.id : "");
        }}
      />
    </div>
  );
};

export const Modal = ({ isOpen, onClose = null, children, widthClass }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center  justify-center overflow-auto bg-gray-800 bg-opacity-50">
      <div className={`relative bg-white rounded-lg ${widthClass}`}>
        {onClose ? (
          <button
            className="absolute top-3 right-5 m-4 text-red-600 hover:text-red-800 bg-white rounded-xl  focus:outline-none "
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
  form,
}) => {
  const [isToggled, setIsToggled] = useState(false);

  useEffect(() => {
    if (value) {
      setIsToggled(true);
      console.log("here");
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
