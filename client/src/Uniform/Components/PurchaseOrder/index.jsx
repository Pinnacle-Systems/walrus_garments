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
import { DisabledInput, DropdownInput, DateInput } from "../../../Inputs";
import { dropDownListObject, } from '../../../Utils/contructObject';
import { poTypes } from '../../../Utils/DropdownData';
import YarnPoItems from "./YarnPoItems";
import FabricPoItems from "./FabricPoItems";
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
  const [purchaseOrderForm,setPurchaseOrderForm]  = useState("")
const [selectedPeriod, setSelectedPeriod] = useState('this-month');
    const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
  const { branchId, companyId, finYearId, userId } = getCommonParams()

  const branchIdFromApi = useRef(branchId);
  const params = {
    branchId, companyId, finYearId
  };

  const { data: supplierList } =
    useGetPartyQuery({ params: { ...params } });


  const { data: taxTypeList } =
    useGetTaxTemplateQuery({ params: { ...params } });

  const { data: supplierDetails } =
    useGetPartyByIdQuery(supplierId, { skip: !supplierId });

  const { data: payTermList } =
    useGetPaytermMasterQuery({ params: { ...params } });
    
  const handlePrint = () => {
    setPrintModalOpen(true);
  };
  const activeTab = useSelector((state) =>
    state.openTabs.tabs.find((tab) => tab.active).name
  );
  console.log(activeTab, "activeTab")


  const { data: allData, isLoading, isFetching } = useGetPoQuery({ params, searchParams: searchValue });

  const { data: branchList } = useGetBranchQuery({ params: { companyId } });

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
    // if (data?.branchId) {
    //   branchIdFromApi.current = data?.branchId
    // }
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



  function isSupplierOutside() {
    if (supplierDetails) {
      return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
    }
    return false
  }
   console.log(transType,"transtype")
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
  console.log(poItems, "poItems")
  const deleteData = async () => {
    if (id) {
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

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };


  const tableHeadings = ["PoNo", "PoDate", "transType", "DueDate", "Supplier"]
  const tableDataNames = ['dataObj?.id', 'dataObj.active ? ACTIVE : INACTIVE']
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
   console.log(supplierListBasedOnSupply,"supplierListBasedOnSupply")
    console.log(supplierId,"supplierId")
    const payTermDay = supplierListBasedOnSupply?.find(item => item.id === Number(supplierId))?.payTermDay ?? 0;

   console.log(payTermDay, "payTermDay from supplierListBasedOnSupply");
  const columns = [
        {
            header: 'S.No',
            accessor: (item, index) => index + 1,
            cellClass: () => 'font-medium text-gray-900'
        },
        
        {
            header: 'Inward No.',
            accessor: (item) => item.docId,
            cellClass: () => 'font-medium text-gray-900'
        },
           {
            header: 'TransType',
            accessor: (item) => item.transType,
            cellClass: () => 'text-gray-800 uppercase'
        },
        {
            header: 'Inward Date',
            accessor: (item) => moment.utc(item.createdAt).format("YYYY-MM-DD")
        },
        {
            header: 'Supplier',
            accessor: (item) => findFromList(item.supplierId, supplierList?.data ,"name"),
            cellClass: () => 'uppercase'
        },
           {
            header: '',
            accessor: (item) =>  item.ff,
            cellClass: () => 'uppercase'
        },
      {
            header: '',
            accessor: (item) =>  item.ff,
            cellClass: () => 'uppercase'
        },   {
            header: '',
            accessor: (item) =>  item.ff,
            cellClass: () => 'uppercase'
        },   {
            header: '',
            accessor: (item) => item.ff,
            cellClass: () => 'uppercase'
        },   {
            header: '',
            accessor: (item) =>  item.ff,
            cellClass: () => 'uppercase'
        },   {
            header: '',
            accessor: (item) =>  item.ff,
            cellClass: () => 'uppercase'
        },   {
            header: '',
            accessor: (item) =>  item.ff,
            cellClass: () => 'uppercase'
        },   {
            header: '',
            accessor: (item) =>  item.ff,
            cellClass: () => 'uppercase'
        },   {
            header: '',
            accessor: (item) =>  item.ff,
            cellClass: () => 'uppercase'
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
   
       const handleDelete = async (orderId) => {
           if (orderId) {
               if (!window.confirm("Are you sure to delete...?")) {
                   return;
               }
               try {
                   // await removeData(orderId)
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
   

  return (
//     <div
//       onKeyDown={handleKeyDown}
//       className="md:items-start md:justify-items-center grid h-full bg-theme overflow-auto">

//       <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[90%]"}>
//         <PurchaseOrderFormReport
//           heading={MODEL}
//           tableHeaders={tableHeadings}
//           tableDataNames={tableDataNames}
//           loading={
//             isLoading || isFetching
//           }
//           tableWidth="100%"
//           data={allData?.data}
//           onClick={(id) => {
//             setId(id);
//             setFormReport(false);
//           }
//           }
//           searchValue={searchValue}
//           setSearchValue={setSearchValue}
//         />
//       </Modal>
//       <Modal
//         isOpen={printModalOpen}
//         onClose={() => setPrintModalOpen(false)}
//         widthClass={"w-[90%] h-[90%]"}
//       >
//         <PDFViewer style={tw("w-full h-full")}>
//           <PrintFormat
//             data={id ? singleData?.data : "Null"}
//             singleData={id ? singleData?.data : "Null"}
//             date={id ? singleData?.data?.selectedDate : date}
//             docId={docId ? docId : ""}

//           />
//         </PDFViewer>
//       </Modal>


//       <div className="flex flex-col frame w-full h-full">
//         <FormHeader
//           onNew={onNew}
//           model={MODEL}
//           saveData={saveData}
//           setReadOnly={setReadOnly}
//           deleteData={deleteData}
//           onPrint={id ? handlePrint : null}
//           openReport={() => { setFormReport(true) }}
//           childRecord={childRecord.current}
//         />
//         <div className="flex-1 grid gap-x-2">
//           <div className="col-span-3 grid overflow-auto">
//             <div className='col-span-3 grid overflow-auto'>
//               <div className='mr-1'>
//                 <div className={`grid`}>
//                   <div className={"flex flex-col"}>
//                     <fieldset className="border border-gray-600 rounded-tr-lg rounded-bl-lg px-4 py-3 w-full">
//                       <legend className="text-sm font-semibold text-gray-700 px-2">Purchase Info</legend>

//                       <div className="grid grid-cols-10 gap-x-4 gap-y-3 mt-2">
//                         <div className="col-span-1">
//                           <DisabledInput name="Po no." value={docId} required />
//                         </div>

//                         <div className="col-span-1">
//                           <DateInput
//                             name="Po Date"
//                             value={date}
//                             type="date"
//                             required
//                             readOnly={readOnly}
//                             disabled
//                           />
//                         </div>

//                         <div className="col-span-1 pt-0.5">
//                           <DropdownInput
//                             name="Po Type"
//                             options={poTypes}
//                             value={transType}
//                             setValue={setTransType}
//                             required
//                             readOnly={readOnly}
//                           />
//                         </div>

//                         <div className="col-span-2 pt-0.5">
//                           <DropdownInput
//                             name="Supplier"
//                             options={dropDownListObject(supplierListBasedOnSupply, "name", "id")}
//                             value={supplierId}
//                             setValue={setSupplierId}
//                             required
//                             readOnly={readOnly}
//                             masterName="PARTY MASTER"
//                             lastTab={activeTab}
//                           />
//                         </div>

//                         <div className="col-span-1">
//                           <DateInput
//                             name="Due Date"
//                             value={dueDate}
//                             setValue={setDueDate}
//                             required
//                             readOnly={readOnly}
//                           />
//                         </div>

//                         <div className="col-span-1 pt-0.5">
//                         <DisabledInput 
//   name="Pay Terms" 
//   value={payTermDay} 
//   required 
// />

//                         </div>

//                         <div className="col-span-1 pt-0.5">
//                           <DropdownInput
//                             name="Delivery Type"
//                             options={deliveryTypes}
//                             value={deliveryType}
//                             setValue={setDeliveryType}
//                             required
//                             readOnly={readOnly}
//                           />
//                         </div>

//                         <div className="col-span-2 pt-0.5">
//                           <DropdownInput
//                             name="Delivery To"
//                             options={
//                               deliveryType === "ToSelf"
//                                 ? dropDownListObject(branchList?.data || [], "branchName", "id")
//                                 : dropDownListObject(clientDetail, "name", "id")
//                             }
//                             masterName="PARTY MASTER"
//                             lastTab={activeTab}
//                             value={deliveryToId}
//                             setValue={setDeliveryToId}
//                             required
//                             readOnly={readOnly}
//                           />
//                         </div>
//                       </div>

//                     </fieldset>{console.log(poItems,"poItems")}

//                     <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 border border-gray-600 md:pb-5 flex h-[370px] px-1 w-full overflow-auto'>
//                       <legend className='sub-heading'>Purchase Details</legend>
//                       {transType.toLowerCase().includes("GreyYarn".toLowerCase())
//                         ?
//                         <YarnPoItems greyFilter={transType.toLowerCase().includes("grey")} id={id} transType={transType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
//                         :
//                         (
//                           transType.toLowerCase().includes("DyedYarn".toLowerCase())
//                             ?
//                             <YarnPoItems greyFilter={transType.toLowerCase().includes("Dyed")} id={id} transType={transType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
//                             :
//                             <AccessoryPoItems id={id} transType={transType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
//                         )
//                       }
//                       <Consolidation readOnly={readOnly} remarks={remarks} setRemarks={setRemarks}
//                       />
//                     </fieldset>

//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>



  <>
            {purchaseOrderForm ? (
                <PurchaseOrderForm
                    onClose={() => { setPurchaseOrderForm(false); setReadOnly(prev => !prev) }}  id={id}  setId={setId} readOnly={readOnly} setReadOnly={setReadOnly}
                //  orderDetails={orderDetails} setOrderDetails={setOrderDetails}  id={id} setId={setId} onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }}
                //     partyData={partyData?.data}
                />

            ) : (
                <div className="p-2 bg-[#F1F1F0] min-h-screen">
                    <h1 className="text-2xl font-bold text-gray-800">Purchase Order</h1>
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
                        <CommonTable
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