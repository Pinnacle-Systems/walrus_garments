import React, { useEffect, useState, useRef, useCallback } from "react";
import { useGetPartyQuery, useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
// import { useGetTaxTemplateQuery } from '../../../redux/ErpServices/TaxTemplateServices';
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";

// import { poTypes, } from '../../../Utils/DropdownData';

import moment from "moment";
// import PoSummary from "./PoSummary";

import {
  useAddDirectCancelOrReturnMutation, useDeleteDirectCancelOrReturnMutation,
  useGetDirectCancelOrReturnByIdQuery, useGetDirectCancelOrReturnQuery, useUpdateDirectCancelOrReturnMutation
}
  from "../../../redux/uniformService/DirectCancelOrReturnServices";
import { findFromList, getCommonParams, isGridDatasValid, sumArray } from "../../../Utils/helper";

import PurchaseReturnForm from "./PurchaseReturnForm";
import CommonTable from "../../../Shocks/CommonReport/CommonTable";
import { FaPlus } from "react-icons/fa";
import PurchaseCancelFormReport from "./PurchaseReturnFormReport";
import Swal from "sweetalert2";

const MODEL = "Purchase Return / Direct Return";


export default function Form() {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showManufacturer, setShowManufacturer] = useState(false);
  const [id, setId] = useState("");
  const { branchId, userId, companyId, finYearId } = getCommonParams();
  const [readOnly, setReadOnly] = useState(false);
  const [poInwardOrDirectInward, setPoInwardOrDirectInward] = useState("DirectReturn");
  const params = {
    branchId, userId, finYearId
  };
  const [directInwardReturnItems, setDirectInwardReturnItems] = useState([]);
  const { data: allData, isLoading, isFetching } = useGetDirectCancelOrReturnQuery({ params: { branchId, poInwardOrDirectInward, finYearId } });
  const { data: partyData } = useGetPartyQuery({ params })
  const [removeData] = useDeleteDirectCancelOrReturnMutation();





  const handleView = (id) => {

    setId(id);
    setShowManufacturer(true);
    setReadOnly(true);
  };

  const handleEdit = (id) => {
    setId(id);
    setShowManufacturer(true);
    setReadOnly(false);
  };

  const handleDelete = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        let deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          Swal.fire({
            icon: "error",
            title: "Child record Exists",
            text: deldata.data?.message || "Data cannot be deleted!",
          });
          return;
        }
        setId("");
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
          timer: 1000,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
      }
    }
  };
  const onNew = () => {
    setId("");
    setReadOnly(false);
    setDirectInwardReturnItems([]);

  }

  console.log(directInwardReturnItems, 'directInwardReturnItems')
  return (
    <>
      {showManufacturer ? (
        <PurchaseReturnForm isLoading={isLoading} isFetching={isFetching} poInwardOrDirectInward={poInwardOrDirectInward} setPoInwardOrDirectInward={setPoInwardOrDirectInward} id={id} setId={setId} allData={allData} directInwardReturnItems={directInwardReturnItems} setDirectInwardReturnItems={setDirectInwardReturnItems}
          onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }}
        />

      ) : (
        <div className="p-2 bg-[#F1F1F0] ">
          <h1 className="text-2xl font-bold text-gray-800">Yarn Purchase Return</h1>
          <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1.5 border rounded-md text-sm"
              >
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
              </select>
              <select
                value={selectedFinYear}
                onChange={(e) => setSelectedFinYear(e.target.value)}
                className="px-3 py-1.5 border rounded-md text-sm"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </select>

            </div>
            <button
              className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1.5 rounded-md flex items-center gap-2 text-sm"
              onClick={() => { setShowManufacturer(true); onNew() }}
            >
              <FaPlus /> Create New
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* <CommonTable
              columns={columns}
              data={allData?.data || []}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              itemsPerPage={10}
            /> */}
            <PurchaseCancelFormReport
              data={allData?.data || []}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}
    </>
  );





























}