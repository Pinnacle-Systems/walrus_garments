import { useEffect, useRef } from "react";
import { FiPrinter, FiArrowRight } from "react-icons/fi";

const PopUp = ({
  setIsPrintOpen,
  onClose,
  setPrintModalOpen,
  nextprocess,
  formclose,
  syncFormWithDb,
  inputRef,
  setId
}) => {

  const firstInputRef = useRef(null)
  const secondInputRef = useRef(null)

  useEffect(() => {
    // Standard focus on mount
    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden">
      {/* Header section with a subtle theme color */}
      <div className="bg-indigo-50 py-6 px-4 border-b border-indigo-100 flex flex-col items-center justify-center text-center">
        <div className="p-3 bg-indigo-100 rounded-full mb-4">
          <FiPrinter className="text-indigo-600 text-2xl" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">
          Purchase Return Print
        </h3>
        <p className="text-sm text-slate-500 mt-1 max-w-[80%] mx-auto">
          Would you like to view the print format for this transaction?
        </p>
      </div>

      <div className="flex-1 flex flex-row items-center justify-center gap-4 p-6">
        <button
          className="flex-1 max-w-[140px] flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          ref={(el) => {
            firstInputRef.current = el;
            if (el) el.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // onClose();
              setPrintModalOpen(true);
            }
            if (e.key === "ArrowRight") {
              secondInputRef?.current?.focus();
            }
          }}
          onClick={() => {
            // onClose();
            setPrintModalOpen(true);
          }}
        >
          <FiPrinter className="text-lg" />
          YES
        </button>

        <button
          className="flex-1 max-w-[140px] flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-200 transition duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          ref={secondInputRef}
          onClick={() => {
            setIsPrintOpen(false);
            if (nextprocess === "close") {
              formclose();
            } else {
              setId("");
              syncFormWithDb(undefined);
              inputRef.current?.focus();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsPrintOpen(false);
              if (nextprocess === "close") {
                formclose();
              } else {
                setId("");
                syncFormWithDb(undefined);
                inputRef.current?.focus();
              }
            }
            if (e.key === "ArrowLeft") {
              firstInputRef?.current?.focus();
            }
          }}

        >
          {nextprocess === "close" ? <FiArrowRight className="text-lg" /> : <FiArrowRight className="text-lg" />}
          NO
        </button>
      </div>
    </div>
  );
};

export default PopUp;
