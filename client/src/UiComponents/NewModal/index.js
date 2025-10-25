import React from 'react';

const NewModal = ({ isOpen, onClose, children, widthClass, onPrint }) => {
  // console.log(isSupplier,"isOpen")
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className={`relative bg-white rounded-lg p-7  ${widthClass}`}>
        {onClose &&
          <button
            className="absolute top-0 right-0 m-1 text-gray-600 hover:text-gray-800 hover:bg-red-400 rounded focus:outline-none"
            onClick={onClose}
          >
            <svg
              className="h-6 w-6 fill-current"
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
        }
        {onPrint && 
        
        <div className="flex justify-end mb-2">
          <button
            onClick={onPrint}
            className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"
            title="Print Purchase Order"
          >
            🖨️ Print
          </button>
        </div>
        }

        {children}
      </div>
    </div>
  );
};

export default NewModal;
