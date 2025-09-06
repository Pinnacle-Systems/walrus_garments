import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  useAddPoMutation,
  useDeletePoMutation,
  useUpdatePoMutation,
  useGetPoQuery,
  useGetPoByIdQuery
} from "../../../redux/uniformService/PoServices";
import { useGetPartyQuery, useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
import { useGetTaxTemplateQuery } from '../../../redux/services/TaxTemplateServices';
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import { DisabledInput, DropdownInput, DateInput, ReusableTable } from "../../../Inputs";
import { dropDownListObject, } from '../../../Utils/contructObject';
import { poTypes } from '../../../Utils/DropdownData';
import YarnPoItems from "./YarnPoItems";
import FabricPoItems from "./OrderPurchase";
import AccessoryPoItems from "./AccessoryPoItems"
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import moment from "moment";
import PrintFormat from "./PrintFormat-PO/index";
import Modal from "../../../UiComponents/Modal";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import PurchaseOrderFormReport from "./PurchaseOrderFormReport";
import { deliveryTypes } from "../../../Utils/DropdownData";

import { findFromList, getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import Consolidation from "./Cosolidation";
import { useSelector } from "react-redux";
import CommonTable from "../../../Shocks/CommonReport/CommonTable";
import { FaPlus } from "react-icons/fa6";
import PurchaseOrderForm from "./PurchaseOrderForm";
import { Loader } from "../../../Basic/components";
const MODEL = "Purchase Order";


export default function Form() {

  const today = new Date()
  const componentRef = useRef();

  const [readOnly, setReadOnly] = useState(false);
  const [poItems, setPoItems] = useState([]);
  const [docId, setDocId] = useState("")
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

  const [remarks, setRemarks] = useState("")

  const [formReport, setFormReport] = useState(false);

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

  const { data: supplierList } =
    useGetPartyQuery({ params: { ...params } });



  const { data: supplierDetails } =
    useGetPartyByIdQuery(supplierId, { skip: !supplierId });





  const { data: allData, isLoading, isFetching } = useGetPoQuery({ params, searchParams: searchValue });


  const getNextDocId = useCallback(() => {
    if (id || isLoading || isFetching) return
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
  }, [allData, isLoading, isFetching, id])

  useEffect(getNextDocId, [getNextDocId])

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPoByIdQuery(id, { skip: !id });

  const [addData] = useAddPoMutation();
  const [updateData] = useUpdatePoMutation();
  const [removeData] = useDeletePoMutation();

  const syncFormWithDb = useCallback((data) => {
    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }

    setTransType(data?.transType ? data.transType : "GreyYarn");
    setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(new Date()).format("YYYY-MM-DD"));

    setPoItems(data?.PoItems ? data?.PoItems : [])
    if (data?.docId) {
      setDocId(data?.docId)
    }
    if (data?.date) setDate(data?.date);

    setPayTermId(data?.payTermId ? data?.payTermId : "");
    setDiscountType(data?.discountType ? data?.discountType : "Percentage")
    setDiscountValue(data?.discountValue ? data?.discountValue : "0")
    setSupplierId(data?.supplierId ? data?.supplierId : "");
    setDueDate(data?.dueDate ? moment.utc(data?.dueDate).format("YYYY-MM-DD") : "");
    setDeliveryType(data?.deliveryType ? data?.deliveryType : "")
    if (data) {
      setDeliveryToId(data?.deliveryType === "ToSelf" ? data?.deliveryBranchId : data?.deliveryPartyId)
    } else {
      setDeliveryToId("")
    }
    setRemarks(data?.remarks ? data.remarks : "")

  }, [id]);




  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

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




  const validateData = (data) => {
    let mandatoryFields = ["uomId", "colorId", "qty", "price"];
    if (transType === "GreyYarn" || transType === "DyedYarn") {
      mandatoryFields = [...mandatoryFields, ...["yarnId", "noOfBags"]]
    } else if (transType === "GreyFabric" || transType === "DyedFabric") {
      mandatoryFields = [...mandatoryFields, ...["fabricId", "designId", "gaugeId", "loopLengthId", "gsmId", "kDiaId", "fDiaId"]]
    }
    return data.supplierId && data.dueDate && data.payTermId
      && isGridDatasValid(data.poItems, false, mandatoryFields) && data.poItems.length !== 0
  }

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback(data).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }

      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
        return
      }
      setId("")
      syncFormWithDb(undefined)
      toast.success(text + "Successfully");
    } catch (error) {
      console.log("handle");
    }
  };


  const saveData = () => {
    console.log(data, "data for valitation")

    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  }


  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };



  useEffect(() => {
    if (id) return
    setPoItems([]);
    setSupplierId("")
  }, [transType, id])

  const allSuppliers = supplierList ? supplierList?.data : []
  console.log(allSuppliers, "allSuppliers")
  function filterSupplier() {
    let finalSupplier = []
    if (transType.toLowerCase().includes("GreyYarn".toLowerCase())) {
      finalSupplier = allSuppliers.filter(s => s.isGy)
    } else if (transType.toLowerCase().includes("DyedYarn".toLowerCase())) {
      finalSupplier = allSuppliers.filter(s => s.isDy)
    } else {
      finalSupplier = allSuppliers.filter(s => s.isAcc)
    }
    return finalSupplier
  }
  const clientDetail = ((allSuppliers || []).filter(val => val.isClient === true));
  console.log(clientDetail, "clientDetail")

  let supplierListBasedOnSupply = filterSupplier()
  transType.toLowerCase().includes("greyyarn".toLowerCase())
  console.log(supplierListBasedOnSupply, "supplierListBasedOnSupply")
  console.log(supplierId, "supplierId")
  const payTermDay = supplierListBasedOnSupply?.find(item => item.id === Number(supplierId))?.payTermDay ?? 0;

  console.log(payTermDay, "payTermDay from supplierListBasedOnSupply");
  const columns = [
    {
      header: 'S.No',
      accessor: (item, index) => parseInt(index) + 1,
      className: 'font-medium text-gray-900 w-[20px] py-1 text-center'
    },

    {
      header: 'Inward No',
      accessor: (item) => item.docId,
      className: 'font-medium uppercase text-gray-900 w-[40px]  py-1  px-2'
    },
    {
      header: 'TransType',
      accessor: (item) => item.transType,
      className: 'text-gray-800 uppercase w-[40px]  py-1  px-2'
    },
    {
      header: 'Inward Date',
      accessor: (item) => moment.utc(item.createdAt).format("YYYY-MM-DD"),
      className: 'text-gray-800 uppercase w-[100px]  py-1  px-2'
    },
    {
      header: 'Supplier',
      accessor: (item) => findFromList(item.supplierId, supplierList?.data, "name"),
      className: 'text-gray-800 uppercase w-[500px]'
    },
  

  ];






  const handleView = (id) => {

    setId(id)
    setPurchaseOrderForm(true)
    setReadOnly(true);
  };

  const handleEdit = (orderId) => {
    setId(orderId)
    setPurchaseOrderForm(true)
    setReadOnly(false);
  };

  console.log(childRecord?.current,"childrecord");
  

  const handleDelete = async (id) => {
    if (id) {
      if (childRecord.current > 0) {
        toast.info("Child Record Exist", { position: "top-center" })
        return

      }
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id)
        setId("");
        onNew();
        toast.success("Deleted Successfully");
      } catch (error) {
        toast.error("something went wrong");
      }
    }

  };
  const onNew = () => {
    setId("");
    setReadOnly(false);
    //  setOrderDetails([]);

  }

  if (isLoading || isFetching) return <Loader />

  return (



    <>
      {purchaseOrderForm ? (
        <PurchaseOrderForm
          onClose={() => { setPurchaseOrderForm(false); setReadOnly(prev => !prev) }} id={id} setId={setId} readOnly={readOnly} setReadOnly={setReadOnly} allData={allData}
        //  orderDetails={orderDetails} setOrderDetails={setOrderDetails}  id={id} setId={setId} onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }}
        //     partyData={partyData?.data}
        />

      ) : (
        <div className="p-2 bg-[#F1F1F0] min-h-screen">
          <h1 className="text-2xl font-bold text-gray-800 mb-1 shadow-2xl">Purchase Order</h1>
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
              onClick={() => { setPurchaseOrderForm(true); onNew() }}
            >
              <FaPlus /> Create New
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <ReusableTable
              columns={columns}
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