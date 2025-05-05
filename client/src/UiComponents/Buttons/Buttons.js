import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faClose, faUserPlus, faEdit, faTrashCan, faPlusCircle, faRefresh, faPrint, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';




export const AddNewButton = ({ onClick, disabled = false }) => {

    return (
        <button className='text-green-600 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()} disabled={disabled}>
            {<FontAwesomeIcon icon={faUserPlus} />} Add New
        </button>
    )
}

export const New = ({ name, setFormHidden }) => {
    return (
        <button className='text-green-600 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => { setFormHidden(false); }}>
            {<FontAwesomeIcon icon={faPlusCircle} />} Add {name}
        </button>
    )
}

export const GenerateButton = ({ onClick, hidden, name = "Generate" }) => {
    return (
        <button className='text-green-600 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => { onClick(); }} hidden={hidden}>
            {<FontAwesomeIcon icon={faRefresh} />} {name}
        </button>
    )
}

export const Delete = ({ onClick }) => {
    return (
        <button className='text-red-500 px-3 py-1.5 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faTrashCan} />}
        </button>
    )
}

const baseClasses = "flex items-center text-sm font-medium py-2 px-4 rounded-xl shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1";

export const NewButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className={`${baseClasses} text-white bg-violet-500 hover:bg-violet-600 hover:scale-105`}
    >
        <FontAwesomeIcon icon={faUserPlus} className="me-2" /> New
    </button>
);

export const EditButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className={`${baseClasses} text-white bg-amber-700 hover:bg-amber-800 hover:scale-105`}
    >
        <FontAwesomeIcon icon={faEdit} className="me-2" /> Edit
    </button>
);

export const EditButtonOnly = ({ onClick }) => {
    return (
        <button className="text-white px-3 pb-1  mt-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faEdit} />}
        </button>
    )
}

const baseButtonStyles = " items-center gap-1 text-xs font-medium px-4 py-2 rounded-lg shadow-sm transition-all duration-200";

export const SaveButton = ({ onClick }) => {
  const [isDisabled, setIsDisabled] = useState(false);

  const disableButton = () => {
    setIsDisabled(true);  
    setTimeout(() => setIsDisabled(false), 5000);
  };

  return (
    <button
      disabled={isDisabled}
      onClick={() => {
        onClick();
        disableButton();
      }}
      className={`${baseButtonStyles} ${
        isDisabled
          ? "bg-green-300 text-white cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white"
      }`}
    >
      <FontAwesomeIcon icon={faSave} /> Save
    </button>
  );
};

export const SaveExitButton = ({ onClick }) => {
  const [isDisabled, setIsDisabled] = useState(false);

  const disableButton = () => {
    setIsDisabled(true);
    setTimeout(() => setIsDisabled(false), 5000);
  };

  return (
    <button
      disabled={isDisabled}
      onClick={() => {
        onClick();
        disableButton();
      }}
      className={`${baseButtonStyles} ${
        isDisabled
          ? "bg-green-300 text-white cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white"
      }`}
    >
      <FontAwesomeIcon icon={faSave} /> Save & Exit
    </button>
  );
};

  
export const CloseButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 text-xs font-medium px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-all duration-200 shadow-sm"
  >
    <FontAwesomeIcon icon={faClose} /> Cancel
  </button>
);


export const OpenTable = ({ onClick }) => {
    return (
        <button className='text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline button' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faSearch} />} Search
        </button>
    )
}

export const DeleteButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 text-xs font-medium px-4 py-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-300 transition-all duration-200 shadow-sm"
  >
    <FontAwesomeIcon icon={faTrashCan} /> Delete
  </button>
);




export const CloseButtonOnly = ({ onClick }) => {
    return (
        <button className='text-black px-3 py-1.5 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faClose} />}
        </button>
    )
}

export const PrintButtonOnly = ({ onClick }) => {
    return (
        <button className='text-pink-500 px-3 py-1.5 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faPrint} />} Print
        </button>
    )
}

export const SearchButton = ({ onClick }) => {
    return (
        <button className='text-gray-300 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
            {<FontAwesomeIcon icon={faSearch} />} Search
        </button>
    )
}

export const ExcelButton = ({ onClick, width = 18, height = 18 }) => {
    return (
        <button className='rounded focus:outline-none focus:shadow-outline' onClick={(e) => onClick(e)}>
            <img alt='' width={width} height={height} />
        </button>
    )
}




