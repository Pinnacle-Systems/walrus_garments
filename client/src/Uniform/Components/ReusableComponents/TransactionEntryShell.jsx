import { FaFileAlt } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { ModeChip } from "../../../Utils/helper";

const renderSummaryValue = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return value;
};

const TransactionEntryShell = ({
  title,
  readOnly,
  id,
  onClose,
  headerOpen,
  setHeaderOpen,
  summaryItems = [],
  headerContent,
  children,
  footer = null,
  titleBarClassName = "",
  contentClassName = "",
  headerPanelClassName = "",
  headerBodyClassName = "",
  footerClassName = "",
  openStateClassName = "max-h-[360px] opacity-100 overflow-visible",
}) => {
  const visibleSummaryItems = summaryItems.filter((item) => item && item.label);

  return (
    <div className={["flex h-full min-h-0 flex-col gap-2 overflow-hidden", contentClassName].filter(Boolean).join(" ")}>
      <div className={["w-full shrink-0 rounded-md bg-[#f1f1f0] px-2 py-1 shadow-md", titleBarClassName].filter(Boolean).join(" ")}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">{title} <ModeChip id={id} readOnly={readOnly} />
          </h1>
          <button onClick={onClose} className="text-indigo-600 hover:text-indigo-700" title="Open Report">
            <IoArrowBackCircleSharp className="w-7 h-7" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        <div className={["shrink-0 rounded-md border border-slate-200 bg-white shadow-sm", headerPanelClassName].filter(Boolean).join(" ")}>
          <button
            type="button"
            onClick={() => setHeaderOpen((open) => !open)}
            className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="text-[12px] font-medium text-slate-700">Header Details</span>
              {!headerOpen && visibleSummaryItems.length > 0 && (
                <div className="hidden min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-600 md:flex">
                  {visibleSummaryItems.map((item) => (
                    <span key={item.label} className="flex items-center gap-1">
                      <span className="uppercase tracking-wide text-[12px] font-semibold text-slate-400">
                        {item.label}
                      </span>
                      <span className="text-[12px] font-medium text-slate-700">{renderSummaryValue(item.value)}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <FiChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${headerOpen ? "rotate-180" : "rotate-0"}`}
            />
          </button>

          <div
            className={`transition-all duration-300 ease-in-out ${headerOpen ? openStateClassName : "max-h-0 opacity-0 overflow-hidden"
              }`}
          >
            <div className={["px-3 pb-3 overflow-visible", headerBodyClassName].filter(Boolean).join(" ")}>
              {headerContent}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>

        {footer ? (
          <div className={["shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1.5 shadow-sm", footerClassName].filter(Boolean).join(" ")}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TransactionEntryShell;
