import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  useAddPoMutation,
  useDeletePoMutation,
  useUpdatePoMutation,
  useGetPoQuery,
  useGetPoByIdQuery
} from "../../../redux/uniformService/PoServices";
import { useGetPartyQuery, useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";

import { toast } from "react-toastify";


import moment from "moment";


import { findFromList, getCommonParams, isGridDatasValid } from "../../../Utils/helper";



import PurchaseOrderForm from "./PurchaseOrderForm";
import { Loader } from "../../../Basic/components";
import Swal from "sweetalert2";
import { FaPlus } from "react-icons/fa";
import { ReusableTable } from "../../../Inputs";
import PurchaseOrderFormReport from "./PurchaseOrderFormReport";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices";
import { useGetTermsandCondtionsQuery } from "../../../redux/services/Term&ConditionsMasterService";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";



export default function Form() {

  const today = new Date()

  const [readOnly, setReadOnly] = useState(false);
  const [docId, setDocId] = useState("new")
  const [id, setId] = useState("");
  const [date, setDate] = useState(moment.utc(today).format('YYYY-MM-DD'));
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [payTermId, setPayTermId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [transType, setTransType] = useState("GreyYarn");
  const [supplierId, setSupplierId] = useState("");

  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [poItems, setPoItems] = useState([]);
  const [tempPoItems, setTempPoItems] = useState([]);


  const [remarks, setRemarks] = useState("")


  const [searchValue, setSearchValue] = useState("");
  const [deliveryType, setDeliveryType] = useState("")
  const [deliveryToId, setDeliveryToId] = useState("")

  const childRecord = useRef(0);
  const [purchaseOrderForm, setPurchaseOrderForm] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
  const { branchId, companyId, finYearId, userId } = getCommonParams()

  const params = {
    branchId, companyId, finYearId
  };












  const { data: taxTypeList, isLoading: isTaxLoading, isFetching: isTaxfetching } =
    useGetTaxTemplateQuery({ params: { ...params } });

      const { data: supplierList } = useGetPartyQuery({ params: { ...params } });
      const { data: termsData } = useGetTermsandCondtionsQuery({ params: { ...params } });
      const { data: branchList } = useGetBranchQuery({ params: { ...params } });
      const { data: hsnData } =
    useGetHsnMasterQuery({ params });
      const { data: supplierDetails } =
        useGetPartyByIdQuery(supplierId, { skip: !supplierId });
    
      const { data: yarnList } = useGetYarnMasterQuery({ params });
    
      const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
    
      const { data: colorList, isLoading: isColorLoading, isFetching: isColorFetching, } = useGetColorMasterQuery({ params: { ...params, } });
    
    

  const { data: allData, isLoading, isFetching, refetch } = useGetPoQuery({ params, searchParams: searchValue });





  const [removeData] = useDeletePoMutation();








  const data = {
    transType, supplierId, dueDate, payTermId,
    branchId, id, userId,
    remarks,
    poItems: poItems.filter(po => po.yarnId || po.fabricId || po.accessoryId),
    deliveryType, deliveryToId,
    discountType,
    discountValue,
    finYearId
  }




















  const handleView = (id) => {

    setId(id)
    setPurchaseOrderForm(true)
    setReadOnly(true);
  };

  const handleEdit = (id) => {
    setReadOnly(false);
    setId(id)
    setPurchaseOrderForm(true)
  };

  console.log(childRecord?.current, "childrecord");


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
    setPoItems([])
    setTempPoItems([])
    setDocId("New")


  }

  if (isLoading || isFetching) return <Loader />

  return (



    <>
      {purchaseOrderForm ? (
        <PurchaseOrderForm
          onClose={() => { setPurchaseOrderForm(false); setReadOnly(prev => !prev) }} id={id} setId={setId} readOnly={readOnly} setReadOnly={setReadOnly} allData={allData}
          docId={docId} setDocId={setDocId} setTempPoItems={setTempPoItems} tempPoItems={tempPoItems} poItems={poItems} setPoItems={setPoItems} onNew={onNew} taxTypeList={taxTypeList}
           supplierList={supplierList} supplierDetails={supplierDetails} branchList={branchList} hsnData={hsnData}
          yarnList={yarnList} uomList={uomList}  colorList={colorList}  termsData={termsData} 
        />

      ) : (
        <div className="p-2 bg-[#F1F1F0] min-h-screen">
          <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">

            <h1 className="text-2xl font-bold text-gray-800 mb-1 shadow-2xl">Yarn Purchase Order</h1>
            <button
              className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1.5 rounded-md flex items-center gap-2 text-sm"
              onClick={() => { setPurchaseOrderForm(true); onNew() }}
            >
              <FaPlus /> Create New
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <PurchaseOrderFormReport
              data={allData?.data || []}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              itemsPerPage={10}
            />
          </div>

        </div>
      )}
    </>
  );
}