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
      <div className="w-full h-[90vh] bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 ">
        <div className="flex justify-between items-center mb-1">
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-12">
            <div className="h-full">
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