import React, { useEffect, useState, useRef, useCallback } from "react";
import { useGetPartyQuery, useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
import { toast } from "react-toastify";


import moment from "moment";

import {
  useAddDirectCancelOrReturnMutation, useDeleteDirectCancelOrReturnMutation,
  useGetDirectCancelOrReturnByIdQuery, useGetDirectCancelOrReturnQuery, useUpdateDirectCancelOrReturnMutation
}
  from "../../../redux/uniformService/DirectCancelOrReturnServices";
import { findFromList, getCommonParams, isGridDatasValid, sumArray } from "../../../Utils/helper";

import CommonTable from "../../../Shocks/CommonReport/CommonTable";
import { FaPlus } from "react-icons/fa";
import PurchaseReturnForm from "./PurchaseReturnForm";
import PurchaseReturnFormReport from "./PurchaseReturnFormReport";
import { useDeleteAccessoryPurchaseReturnMutation } from "../../../redux/uniformService/AccessoryPoReturnServices";
import Swal from "sweetalert2";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetAccessoryMasterQuery } from "../../../redux/uniformService/AccessoryMasterServices";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";




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
  // const { data: allData, isLoading, isFetching } = useGetDirectCancelOrReturnQuery({ params: { branchId, poInwardOrDirectInward, finYearId } });


  const [removeData] = useDeleteAccessoryPurchaseReturnMutation();



  const { data: colorList } =
    useGetColorMasterQuery({ params: { ...params } });
  const { data: accessoryList } =
    useGetAccessoryMasterQuery({ params });

  const { data: sizeList } =
    useGetSizeMasterQuery({ params });
  const { data: uomList } =
    useGetUomQuery({ params });



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
        const deleteData = await removeData(id)
        setId("");
        onNew();
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
          draggable: true,
          timer: 1000,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
      } catch (error) {
        toast.error("Something went wrong");
      }
    }

  };
  const onNew = () => {
    setId("");
    setReadOnly(false);
    setDirectInwardReturnItems([]);

  }

  console.log(showManufacturer, 'showManufacturer')
  return (
    <>
      {showManufacturer ? (
        <PurchaseReturnForm poInwardOrDirectInward={poInwardOrDirectInward} setPoInwardOrDirectInward={setPoInwardOrDirectInward} id={id} setId={setId} directInwardReturnItems={directInwardReturnItems} setDirectInwardReturnItems={setDirectInwardReturnItems}
          onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }} 
          colorList={colorList} uomList={uomList} accessoryList={accessoryList} sizeList={sizeList}
        />

      ) : (
        <div className="p-2 bg-[#F1F1F0] ">
          <h1 className="text-2xl font-bold text-gray-800">Accessory Purchase Return</h1>
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
            <PurchaseReturnFormReport
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