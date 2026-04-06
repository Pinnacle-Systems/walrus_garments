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
    <div className="mx-auto flex h-[calc(100vh-6rem)] min-h-0 w-full flex-col overflow-hidden rounded-md bg-[#f1f1f0] px-2 py-1 shadow-md">
      <div className="mb-1 flex shrink-0 items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Opening Stock</h1>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 md:grid-cols-12">
        <div className="col-span-12 flex min-h-0 flex-col rounded-md border border-slate-200 bg-white p-2 shadow-sm">
          <div className="min-h-0 flex-1">
            <ExcelSelectionTable
              params={params}
              file={file}
              setFile={setFile}
              stockItems={stockItems}
              setStockItems={setStockItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpeningStock;
