import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose, faUserPlus, faEdit, faTrashCan, faPlusCircle, faRefresh, faSearch, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';
import excelIcon from "../assets/icons8-microsoft-excel-48.png"
import {
  faPlus,
  faPenToSquare,
  faFloppyDisk,
  faTrash,
  faMagnifyingGlass,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";


export const AddNewButton = ({ onClick, disabled = false }) => {

  return (
    <button className='text-yellow-300 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()} disabled={disabled}>
      {<FontAwesomeIcon icon={faUserPlus} />} Add New
    </button>
  )
}

export const New = ({ name, setFormHidden }) => {
  return (
    <button className='text-yellow-300 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => { setFormHidden(false); }}>
      {<FontAwesomeIcon icon={faPlusCircle} />} Add {name}
    </button>
  )
}

export const GenerateButton = ({ onClick, hidden }) => {
  return (
    <button className='text-yellow-300 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => { onClick(); }} hidden={hidden}>
      {<FontAwesomeIcon icon={faRefresh} />} Generate
    </button>
  )
}

export const Delete = ({ onClick }) => {
  return (
    <button className='text-red-500 py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
      {<FontAwesomeIcon icon={faTrashCan} />}
    </button>
  )
}

export const OpenProjectButton = ({ setNavigateProjectId, quotesData, onClick }) => {
  return (
    <button className='text-green-400 text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => { onClick(); }}>
      {<FontAwesomeIcon icon={faUserPlus} />} {quotesData?.projectId ? "Go To Project" : "Create Project"}
    </button>
  )
}

const baseClasses = "flex items-center text-xs font-semibold py-1.5 px-2.5 rounded-lg shadow-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 hover:scale-105";

export const NewButton = ({ onClick }) => (
  <button onClick={onClick} className={`${baseClasses} text-white bg-emerald-500 hover:bg-emerald-600`}>
    <FontAwesomeIcon icon={faPlus} className="me-1" /> New
  </button>
);

export const EditButton = ({ onClick }) => (
  <button onClick={onClick} className={`${baseClasses} text-white bg-amber-800 hover:bg-amber-900`}>
    <FontAwesomeIcon icon={faPenToSquare} className="me-1" /> Edit
  </button>
);

export const EditButtonOnly = ({ onClick }) => {
  return (
    <button className='text-yellow-500 text-sm px-2 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
      {<FontAwesomeIcon icon={faEdit} />}
    </button>
  )
}
export const SaveButton = ({ onClick }) => {
  const [isDisabled, setIsDisabled] = useState(false);
  const disableButton = () => {
    setIsDisabled(true);
    setTimeout(() => setIsDisabled(false), 5000);
  };
  return (
    <button
      onClick={() => {
        onClick();
        disableButton();
      }}
      disabled={isDisabled}
      className={`${baseClasses} ${isDisabled
        ? "bg-sky-200 text-white cursor-not-allowed"
        : "bg-sky-500 text-white hover:bg-sky-600"
        }`}
    >
      <FontAwesomeIcon icon={faFloppyDisk} className="me-1" /> Save
    </button>
  );
};
export const CloseButton = ({ onClick }) => {
  return (
    <button onClick={onClick} className={`${baseClasses} text-white bg-indigo-500 hover:bg-indigo-600`}>
      <FontAwesomeIcon icon={faClose} className="me-1" /> Close
    </button>
  )
}
export const DeleteButton = ({ onClick }) => (
  <button onClick={onClick} className={`${baseClasses} text-white bg-rose-500 hover:bg-rose-600`}>
    <FontAwesomeIcon icon={faTrash} className="me-1" /> Delete
  </button>
);




export const CloseButtonOnly = ({ onClick }) => {
  return (
    <button onClick={onClick} className={`${baseClasses} text-white bg-indigo-500 hover:bg-indigo-600`}>
      <FontAwesomeIcon icon={faClose} className="me-1" /> Close
    </button>
  )
}

export const SearchButton = ({ onClick }) => (
  <button onClick={onClick} className={`${baseClasses} text-white bg-indigo-500 hover:bg-indigo-600`}>
    <FontAwesomeIcon icon={faMagnifyingGlass} className="me-1" /> Search
  </button>
);

export const PrintButtonOnly = ({ onClick }) => (
  <button onClick={onClick} className={`${baseClasses} text-white bg-purple-500 hover:bg-purple-600`}>
    <FontAwesomeIcon icon={faPrint} className="me-1" /> Print
  </button>
)

export const ExcelButton = ({ onClick, width = 18, height = 18 }) => {
  return (
    <button className='rounded focus:outline-none focus:shadow-outline' onClick={(e) => onClick(e)}>
      <img src={excelIcon} width={width} height={height} />
    </button>
  )
}

export const PreviewButtonOnly = ({ onClick }) => {
  return (
    <button className='text-pink-500 text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
      {<FontAwesomeIcon icon={faPrint} />} Preview
    </button>
  )
}

export const ViewButtton = ({ onClick }) => {
  return (
    <button className='text-pink-200 text-sm py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={() => onClick()}>
      View
    </button>
  )
}