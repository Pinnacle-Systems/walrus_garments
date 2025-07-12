import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetPurchaseCancelQuery,
  useGetPurchaseCancelByIdQuery,
  useAddPurchaseCancelMutation,
  useUpdatePurchaseCancelMutation,
  useDeletePurchaseCancelMutation,
} from "../../../redux/uniformService/PurchaseCancelServices";

import { useGetPartyQuery, useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import { DropdownInput, DisabledInput } from "../../../Inputs";
import { dropDownListObject, } from '../../../Utils/contructObject';
import { poTypes } from '../../../Utils/DropdownData';
import { useDispatch } from "react-redux";
import Modal from "../../../UiComponents/Modal";
import PoItemsSelection from "./PoItemsSelection";
import { getCommonParams, getDateFromDateTime, isGridDatasValid } from "../../../Utils/helper";
import YarnCancelItems from "./YarnCanceltems";
import AccessoryCancelItems from "./AccessoryCancelItems";
import FabricCancelItems from "./FabricCancelItems";
import moment from "moment";
import PurchaseInwardFormReport from "./PurchaseInwardFormReport";
import Consolidation from "../Consolidation";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";

const MODEL = "Purchase Cancel";

const PurchaseCancelForm = ({ onClose })  => {


  const dispatch = useDispatch()
  const today = new Date()
  const [inwardItemSelection, setInwardItemSelection] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [date, setDate] = useState(getDateFromDateTime(today));
  const [poType, setPoType] = useState("DyedYarn");
  const [supplierId, setSupplierId] = useState("");

  const [docId, setDocId] = useState("");

  const [inwardItems, setInwardItems] = useState([]);

  const [formReport, setFormReport] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const [remarks, setRemarks] = useState("")

  const childRecord = useRef(0);

  const { branchId, companyId, finYearId, userId } = getCommonParams()


  const branchIdFromApi = useRef(branchId);
  const params = {
    branchId, companyId
  };

  const { data: supplierList } =
    useGetPartyQuery({ params: { companyId, active: true } });

  const { data: supplierDetails } =
    useGetPartyByIdQuery(supplierId, { skip: !supplierId });

  const { data: allData, isLoading, isFetching } = useGetPurchaseCancelQuery({ params: { branchId, inwardOrReturn: "PurchaseCancel", finYearId } });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPurchaseCancelByIdQuery(id, { skip: !id });


  function isSupplierOutside() {
    if (supplierDetails) {
      return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
    }
    return false
  }
  const [addData] = useAddPurchaseCancelMutation();
  const [updateData] = useUpdatePurchaseCancelMutation();
  const [removeData] = useDeletePurchaseCancelMutation();

  const syncFormWithDb = useCallback((data) => {
    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
    if (data?.docId) {
      setDocId(data?.docId)
    }
    setPoType(data?.poType ? data.poType : "DyedFabric");

    setInwardItems(data?.cancelItems ? structuredClone(data.cancelItems) : [])
    if (data?.createdAt) setDate(moment.utc(data?.createdAt).format("YYYY-MM-DD"));
    setSupplierId(data?.supplierId ? data?.supplierId : "");
    setRemarks(data?.remarks ? data.remarks : "")
  }, [id]);

  const getNextDocId = useCallback(() => {
    if (isLoading || isFetching) return
    if (id) return
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
  }, [allData, isLoading, isFetching, id])

  useEffect(getNextDocId, [getNextDocId])

  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);



  const data = {
    poInwardOrDirectInward: "PurchaseCancel",
    poType, supplierId,
    branchId, id, userId,
    remarks,
    cancelItems: inwardItems,
    finYearId
  }

  const validateData = (data) => {
    let mandatoryFields = ["poItemsId", "qty"];
    if (poType === "GreyYarn" || poType === "DyedYarn") {
      mandatoryFields.push("noOfBags")
    }
    return data.poType && data.supplierId
      && isGridDatasValid(data.cancelItems, false, mandatoryFields)
      && data.cancelItems.length !== 0
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
      } else {
        toast.success(text + "Successfully");
        setId("")
        syncFormWithDb(undefined)
      }
      dispatch({
        type: `po/invalidateTags`,
        payload: ['po'],
      });
    } catch (error) {
      console.log("handle", error);
    }
  };


  const saveData = () => {

    if (!validateData(data)) {
      toast.info("Please fill all required fields...!", { position: "top-center" })
      return
    }
    if (id) {
      console.log(id, "id", data, "dataaa")
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  }

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

  const onNew = () => {
    setId("");
    setSearchValue("");
    setReadOnly(false);
    syncFormWithDb(undefined)
  };

  function removeItem(id) {
    setInwardItems(localInwardItems => {
      let newItems = structuredClone(localInwardItems);
      newItems = newItems.filter(item => parseInt(item.poItemsId) !== parseInt(id))
      return newItems
    });
  }

  const allSuppliers = supplierList ? supplierList.data : []

  function filterSupplier() {
    let finalSupplier = []
    if (poType.toLowerCase().includes("yarn")) {
      finalSupplier = allSuppliers.filter(s => s.yarn)
    } else if (poType.toLowerCase().includes("fabric")) {
      finalSupplier = allSuppliers.filter(s => s.fabric)
    } else {
      finalSupplier = allSuppliers.filter(s => s.PartyOnAccessoryItems.length > 0)
    }
    return finalSupplier
  }
  let supplierListBasedOnSupply = filterSupplier()
  function getTotalIssuedQty() {
    return inwardItems.reduce((total, current) => {
      return total + parseFloat(current?.qty)
    }, 0)
  }
  return (
    <>
  

      <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[70%] w-[90%]"}>
        <PurchaseInwardFormReport
          heading={MODEL}
          loading={
            isLoading || isFetching
          }

          allData={allData}
          tableWidth="100%"
          data={allData?.data}

          onClick={(id) => {
            setId(id);
            setFormReport(false);
          }
          }
          onNew={onNew}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </Modal>
      <Modal isOpen={inwardItemSelection} onClose={() => setInwardItemSelection(false)} widthClass={"w-[95%] h-[90%] py-10"}>
        <PoItemsSelection setInwardItemSelection={setInwardItemSelection} transtype={poType}
          supplierId={supplierId}
          inwardItems={inwardItems}
          setInwardItems={setInwardItems} />
      </Modal>
     
       <div className="w-full  mx-auto rounded-md shadow-lg px-2 py-1 overflow-y-auto">
                      <div className="flex justify-between items-center mb-1">
                          <h1 className="text-2xl font-bold text-gray-800">Purchse Cancel </h1>
                          <button
                              onClick={onClose}
                              className="text-indigo-600 hover:text-indigo-700"
                              title="Open Report"
                          >
                              <FaFileAlt className="w-5 h-5" />
                          </button>
                      </div>
      
                  </div>

          <div className="space-y-3 h-full py-3"> 
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">


                                  <div className="border border-slate-100 p-2 bg-white rounded-md shadow-sm col-span-1">
                                      {/* <h2 className="font-medium text-slate-700 mb-2">
                                          Inward Details
                                      </h2> */}
                                      <div className="grid grid-cols-2 gap-1">
                                      
                                                <div className="col-span-1">
                                                  <ReusableInput label="Doc Id" value={docId} required={true} readOnly={readOnly} />

                                                  </div>
                                                      <ReusableInput label="Doc Date" value={date} type={"date"} required={true} readOnly={readOnly} />
                                    <DropdownInput
                                        className={"w-[110px]"}
                                        name="Po Type"
                                        beforeChange={() => { setSupplierId(""); setInwardItems([]); }}
                                        options={poTypes}
                                        value={poType}
                                        setValue={setPoType}
                                        required={true}
                                        readOnly={readOnly}
                                      />
                                      </div>
                                  </div>

                                      <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                                          <h2 className="font-medium text-slate-700 mb-2">
                                          </h2>
                                          <div className="grid grid-cols-2 gap-1">
                                              <div className="col-span-1">

                                                            <DropdownInput name="Supplier" options={dropDownListObject(supplierListBasedOnSupply, "name", "id")} value={supplierId} setValue={setSupplierId} required={true} readOnly={id || readOnly} />
                                                      </div>
                                                          <div className="item-center mt-5  gap-5">
                                        <button className="p-1.5 text-xs bg-lime-400 rounded hover:bg-lime-600 font-semibold transition hover:text-white"
                                          onClick={() => {
                                            if (!supplierId || !poType) {
                                              toast.info("Please Select Inward/Return , Po type and Suppplier", { position: "top-center" })
                                              return
                                            }
                                            setInwardItemSelection(true)
                                          }}
                                        >Select Items</button>
                                      </div>

                                              
                                          
                                            

                                      </div>

                                  </div>


                                  <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                                      <h2 className="font-medium text-slate-700 mb-2">
                                          {/* Inward Details */}
                                      </h2>
                                      <div className="grid grid-cols-2 gap-1">
                                        
                                        
                                            <div className="col-span-1 pt-0.5">
                                    
                                      </div>

                                      <div className="col-span-1 pt-0.5">
                            
                                      </div>
                                      
                                      </div>

                                          </div>
                  </div>
                    <fieldset className=''>
                      {
                        poType.toLowerCase().includes("yarn")
                          ?
                          <YarnCancelItems purchaseInwardId={id} removeItem={removeItem}
                            transType={poType} inwardItems={inwardItems} setInwardItems={setInwardItems}
                            readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                          :
                          poType.toLowerCase().includes("fabric")
                            ?
                            <FabricCancelItems params={params} removeItem={removeItem} transType={poType} purchaseInwardId={id}
                              inwardItems={inwardItems} setInwardItems={setInwardItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                            :
                            <AccessoryCancelItems params={params} purchaseInwardId={id} removeItem={removeItem} transType={poType} inwardItems={inwardItems} setInwardItems={setInwardItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                      }
                    
                    </fieldset>
                            <div className="grid grid-cols-3 gap-3">
                                                               <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                                                                   <h2 className="font-bold text-slate-700 mb-2 text-base">Terms & Conditions</h2>
                                                                   <textarea
                                                                       readOnly={readOnly}
                                                                    //    value={term}
                                                                       onChange={(e) => {
                                                                        //    setTerm(e.target.value)
                                                                       }}
                                                                       className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                                                                       placeholder="Additional notes..."
                                       
                                                                   />
                                                                 
                                                               </div>
                                       
                                                          
                                       
                                       
                                                               <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
                                                                   <h2 className="font-bold text-slate-700 mb-2 text-base">Notes</h2>
                                                                   <textarea
                                                                       readOnly={readOnly}
                                                                    //    value={notes}
                                                                       onChange={(e) => {
                                                                        //    setNotes(e.target.value)
                                                                       }}
                                                                       className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                                                                       placeholder="Additional notes..."
                                                                   />
                                                               </div>
                                       
                                       
                                                               {/* Pricing Summary (Grand Total) Section */}
                                                               <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                                                                   <h2 className="font-bold text-slate-800 mb-2 text-base">
                                                                       Qty Summary
                                                                   </h2>
                                       
                                                                   <div className="space-y-1.5">
                                                                       <div className="flex justify-between py-1 text-sm">
                                                                           <span className="text-slate-800 font-bold">Total Qty</span>
                                                                           {/* <span className="font-bold">{parseInt(getTotalQty())}   No's</span> */}
                                                                       </div>
                                       
                                       
                                       
                                                                       <div className="flex justify-between py-1 text-sm">
                                                                           <span className="text-slate-600 font-bold">Order By</span>
                                                                           <input
                                                                               type="text"
                                                                               className="w-60 pl-2.5 pr-8 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                                                                               placeholder="Order By"
                                                                               readOnly
                                                                            //    value={orderBy}
                                                                            //    onChange={(e) => setOrderBy(e.target.value)}
                                                                           />
                                                                       </div>
                                       
                                                                       {/* <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                                                                           <span className="text-slate-800 font-semibold">Grand Total</span>
                                                                           <span className="font-bold text-indigo-700">$1,200.00</span>
                                                                       </div> */}
                                                {/* <div className="flex gap-5 items-center mb-1 text-xs">
                                                                           <button
                                                                               className="text-green-600 text-[14px] hover:text-white hover:bg-green-600 border border-green-700 px-2 py-1 rounded-md  flex items-center"
                                                                               onClick={() => setShowDiscount(true)}
                                                                           >
                                                                               <HiMinus className="w-2.5 h-2.5 mr-1" />
                                                                               <span>Add Discount</span>
                                                                           </button>
                                                                           <button
                                                                               className="text-indigo-600 text-[14px] hover:text-white hover:bg-indigo-600 border border-indigo-700 px-2 py-1 rounded-md flex items-center"
                                                                               onClick={() => setShowExtraCharge(true)}
                                                                           >
                                                                               <HiPlus className=" w-2.5 h-2.5 mr-1" />
                                                                               <span> Extra Charge</span>
                                                                           </button>
                                                                       </div> */}
                                            </div>
                                        </div>
{/*                     
                                        {showExtraCharge && (
                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                                <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-sm">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h3 className="text-base font-semibold">Add Extra Charge</h3>
                                                        <button onClick={() => setShowExtraCharge(false)} className="text-slate-400 hover:text-slate-600">
                                                            <HiX className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                placeholder="e.g. Delivery fee"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-700 mb-1">Amount</label>
                                                            <input
                                                                type="number"
                                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <button className="w-full bg-indigo-600 text-white py-1.5 px-3 rounded text-sm hover:bg-indigo-700 transition">
                                                            Apply Charge
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                     */}
                                        {/* {showDiscount && (
                                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                                <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-sm">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h3 className="text-base font-semibold">Add Discount</h3>
                                                        <button onClick={() => setShowDiscount(false)} className="text-slate-400 hover:text-slate-600">
                                                            <HiX className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                placeholder="e.g. Summer promotion"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                                                                <select className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                                                    <option>Percentage</option>
                                                                    <option>Fixed Amount</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-700 mb-1">Value</label>
                                                                <input
                                                                    type="number"
                                                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                    placeholder="0.00"
                                                                />
                                                            </div>
                                                        </div>
                                                        <button className="w-full bg-green-600 text-white py-1.5 px-3 rounded text-sm hover:bg-green-700 transition">
                                                            Apply Discount
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )} */}
                                    </div>
                    
                                    <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
                                        {/* Left Buttons */}
                                        <div className="flex gap-2 flex-wrap">
                                            <button onClick={() => saveData("new")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                                <FiSave className="w-4 h-4 mr-2" />
                                                Save & New
                                            </button>
                                            <button onClick={() => saveData("close")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                                <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                                Save & Close
                                            </button>
                                            <button onClick={() => saveData("draft")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                                <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                                Draft Save
                                            </button>
                                        </div>
                    
                                        {/* Right Buttons */}
                                        <div className="flex gap-2 flex-wrap">
                                            {/* <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                                                                       <FiShare2 className="w-4 h-4 mr-2" />
                                                                       Email
                                                                   </button> */}
                                            <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                                                onClick={() => setReadOnly(false)}
                                            >
                                                <FiEdit2 className="w-4 h-4 mr-2" />
                                                Edit
                                            </button>
                                            <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                                                <FaWhatsapp className="w-4 h-4 mr-2" />
                                                WhatsApp
                                            </button>
                                            <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm">
                                                <FiPrinter className="w-4 h-4 mr-2" />
                                                Print
                                            </button>
                                        </div>
                                    </div>
          </div>
            


  </>
                  
  )
}
export default PurchaseCancelForm