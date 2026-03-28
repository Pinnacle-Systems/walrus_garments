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
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        {showTermSelect ? (
          <div className="rounded-md border border-slate-200 bg-white p-2 shadow-sm md:col-span-2">
            <div className="flex flex-col gap-2">
              <h2 className="mb-2 text-[12px] font-bold text-slate-700">Terms & Conditions</h2>
              <select
                value={termValue}
                onChange={(e) => onTermChange(e.target.value)}
                disabled={readOnly}
                className="h-15 w-full rounded border-2 border-gray-200 py-1 text-left text-[11px]"
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

        <div className={`rounded-md border border-slate-200 bg-white p-1 shadow-sm ${termsColumnClassName}`}>
          <textarea
            disabled={readOnly}
            className="h-20 w-full overflow-auto rounded-md border border-slate-300 px-2.5 py-2 text-[11px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
            value={terms || ""}
            onChange={(e) => setTerms(e.target.value)}
            placeholder={termsPlaceholder}
          />
        </div>

        <div className={`rounded-md border border-slate-200 bg-white p-2 shadow-sm ${remarksColumnClassName}`}>
          <h2 className="mb-2 text-[12px] font-bold text-slate-700">Remarks</h2>
          <textarea
            readOnly={readOnly}
            value={remarks || ""}
            onChange={(e) => setRemarks(e.target.value)}
            className="h-10 w-full overflow-auto rounded-md border border-slate-300 px-2.5 py-2 text-[11px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
            placeholder={remarksPlaceholder}
          />
        </div>

        <div className="rounded-md bg-white p-2 shadow-sm md:col-span-3">
          {resolvedTotalsRows.map((row, index) => (
            <div
              key={row.key || row.label || index}
              className={[
                "flex justify-between py-1 text-[12px]",
                row.emphasized ? "border-t border-slate-100 pt-2" : "",
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
          {extraTotalsContent ? <div className="pt-1">{extraTotalsContent}</div> : null}
        </div>
      </div>

      {leftActions || rightActions ? (
        <div className="mt-1 flex flex-col justify-between gap-2 md:flex-row">
          <div className="flex flex-wrap gap-2">{leftActions}</div>
          <div className="flex flex-wrap gap-2">{rightActions}</div>
        </div>
      ) : null}
    </div>
  );
};

export default CommonFormFooter;
