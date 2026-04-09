import { useState } from "react";
import ExcelSelectionTable from "./ExcelSelectionTable";
import { getCommonParams } from "../../../Utils/helper";

const OpeningStock = () => {
  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const [file, setFile] = useState(null);
  const [stockItems, setStockItems] = useState([]);

  const params = {
    branchId,
    userId,
    finYearId,
  };


  return (
    <div className="h-[calc(100vh-5rem)] min-h-0 overflow-hidden">
      <ExcelSelectionTable
        params={params}
        file={file}
        setFile={setFile}
        stockItems={stockItems}
        setStockItems={setStockItems}
      />
    </div>
  );
};

export default OpeningStock;
