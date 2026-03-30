import React from "react";

const defaultTotalsRows = ({ totalQty, subtotal, taxAmount, netAmount }) => [
  {
    key: "totalQty",
    label: "Total Quantity",
    value: totalQty || 0,
  },
  {
    key: "subtotal",
    label: "Subtotal",
    value: `₹${(subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
  },
  {
    key: "taxAmount",
    label: "GST Amount",
    value: `₹${(taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
  },
  {
    key: "netAmount",
    label: "Net Amount",
    value: `₹${(netAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    emphasized: true,
  },
];

const CommonFormFooter = ({
  remarks,
  setRemarks,
  terms,
  setTerms,
  totalQty,
  subtotal,
  taxAmount,
  netAmount,
  readOnly = false,
  showTermSelect = false,
  termValue = "",
  onTermChange = () => {},
  termOptions = [],
  totalsRows,
  extraTotalsContent = null,
  leftActions = null,
  rightActions = null,
  remarksPlaceholder = "Additional notes...",
  termsPlaceholder = "Select or type Terms & Conditions...",
}) => {
  const resolvedTotalsRows =
    totalsRows && totalsRows.length > 0
      ? totalsRows
      : defaultTotalsRows({ totalQty, subtotal, taxAmount, netAmount });

  const termsColumnClassName = showTermSelect ? "md:col-span-4" : "md:col-span-5";
  const remarksColumnClassName = showTermSelect ? "md:col-span-3" : "md:col-span-4";

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
        {showTermSelect ? (
          <div className="rounded-md border border-slate-200 bg-white p-1.5 shadow-sm md:col-span-2">
            <div className="flex flex-col gap-1">
              <h2 className="mb-1 text-[12px] font-bold text-slate-700">Terms & Conditions</h2>
              <select
                value={termValue}
                onChange={(e) => onTermChange(e.target.value)}
                disabled={readOnly}
                className="h-9 w-full rounded border border-gray-200 px-2 py-1 text-left text-[11px]"
              >
                <option value=""></option>
                {termOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        <div className={`rounded-md border border-slate-200 bg-white p-1.5 shadow-sm ${termsColumnClassName}`}>
          <textarea
            disabled={readOnly}
            className="h-14 w-full overflow-auto rounded-md border border-slate-300 px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
            value={terms || ""}
            onChange={(e) => setTerms(e.target.value)}
            placeholder={termsPlaceholder}
          />
        </div>

        <div className={`rounded-md border border-slate-200 bg-white p-1.5 shadow-sm ${remarksColumnClassName}`}>
          <h2 className="mb-1 text-[12px] font-bold text-slate-700">Remarks</h2>
          <textarea
            readOnly={readOnly}
            value={remarks || ""}
            onChange={(e) => setRemarks(e.target.value)}
            className="h-8 w-full overflow-auto rounded-md border border-slate-300 px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
            placeholder={remarksPlaceholder}
          />
        </div>

        <div className="rounded-md bg-white p-1.5 shadow-sm md:col-span-3">
          {resolvedTotalsRows.map((row, index) => (
            <div
              key={row.key || row.label || index}
              className={[
                "flex justify-between py-0.5 text-[12px]",
                row.emphasized ? "border-t border-slate-100 pt-1.5" : "",
                row.className || "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                className={[
                  row.emphasized ? "font-semibold text-slate-700" : "text-slate-600",
                  row.labelClassName || "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {row.label}
              </span>
              <span
                className={[
                  row.emphasized ? "font-semibold text-indigo-700" : "font-medium",
                  row.valueClassName || "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {row.value}
              </span>
            </div>
          ))}
          {extraTotalsContent ? <div className="pt-0.5">{extraTotalsContent}</div> : null}
        </div>
      </div>

      {leftActions || rightActions ? (
        <div className="mt-0.5 flex flex-col justify-between gap-1.5 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-2">{leftActions}</div>
          <div className="flex flex-wrap gap-2">{rightActions}</div>
        </div>
      ) : null}
    </div>
  );
};

export default CommonFormFooter;
