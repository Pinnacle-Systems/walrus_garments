import { useState, useEffect, useRef } from "react";

const FinYear = ({
  selectedYear,
  selectmonths,
  setSelectmonths,
  autoFocusBuyer,
  autoBorder
}) => {
  const [months, setMonths] = useState([]);
  const buyerRef = useRef(null);

  useEffect(() => {
    if (autoFocusBuyer && buyerRef.current) {
      buyerRef.current.focus();
    }
  }, [autoFocusBuyer, selectmonths]);
  useEffect(() => {
    if (!selectedYear || typeof selectedYear !== "string") return;

    const [startStr, endStr] = selectedYear.split("-").map(Number);
    const startYear = 2000 + startStr;
    const endYear = 2000 + (endStr < startStr ? endStr + 100 : endStr);

    const monthNames = [
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
      "January",
      "February",
      "March",
    ];

    const monthList = monthNames.map((month, index) => {
      const year = index < 9 ? startYear : endYear;
      return `${month} ${year}`;
    });

    setMonths(monthList);


    const now = new Date();
    const currentMonthName = now.toLocaleString("default", { month: "long" });
    const currentYear = now.getFullYear();

    const currentMonthValue = `${currentMonthName} ${currentYear}`;

    if (monthList?.includes(currentMonthValue)) {
      setSelectmonths(currentMonthValue);
    }

  }, [selectedYear]);





  return (
    <div className="max-w-md mx-auto">
      <div>
        <select
          ref={buyerRef}
          className={`w-40 px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 shadow-sm ${
            autoBorder
              ? "border-2 border-blue-600"
              : "border-gray-300"
          } text-gray-900`}
          value={selectmonths}
          onChange={(e) => setSelectmonths(e.target.value)}
        >
          <option value="">Select Month</option>
          {months.map((month, index) => (
            <option key={index} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FinYear;
