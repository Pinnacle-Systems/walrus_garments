import { useState } from "react";
import { DateInput, DisabledInput } from "../../../Inputs"
import ExcelSelectionTable from "./ExcelSelectionTable"
import ManualAddStock from "./ManualAddStock"; // [NEW]
import { getCommonParams } from "../../../Utils/helper";
import { FaFileAlt, FaPlus, FaTable } from "react-icons/fa";

const OpeningStock = () => {


  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const [file, setFile] = useState(null);
  const [pres, setPres] = useState([]);
  const [stockItems, setStockItems] = useState([]);

  const [activeTab, setActiveTab] = useState("excel");

  const params = {
    branchId,
    userId,
    finYearId,
  };


  return (
    <>
      <div className="mx-auto flex h-[calc(100vh-6rem)] min-h-0 w-full flex-col overflow-hidden rounded-md bg-[#f1f1f0] px-2 py-1 shadow-md">
        <div className="mb-1 flex shrink-0 items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Opening Stock</h1>
          <div className="flex gap-2 bg-white p-1 rounded-md shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveTab("excel")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all duration-200 text-sm font-medium ${activeTab === "excel" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <FaTable className="w-4 h-4" />
              Excel Import
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all duration-200 text-sm font-medium ${activeTab === "manual" ? "bg-indigo-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <FaPlus className="w-4 h-4" />
              Manual Add
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 md:grid-cols-12">
          <div className="col-span-12 flex min-h-0 flex-col rounded-md border border-slate-200 bg-white p-2 shadow-sm">
            <div className="min-h-0 flex-1">
              {activeTab === "excel" ? (
                <ExcelSelectionTable
                  pres={pres}
                  setPres={setPres}
                  params={params}
                  file={file}
                  setFile={setFile}
                  stockItems={stockItems}
                  setStockItems={setStockItems}
                />
              ) : (
                <ManualAddStock params={params} />
              )}
            </div>
          </div>
        </div>
      </div>

    </>
  )
}
export default OpeningStock
