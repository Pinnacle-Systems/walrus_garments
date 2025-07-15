import { Modal } from "@mui/material";
import { FaFileAlt } from "react-icons/fa";
import { ReusableInput, ReusableSearchableInput } from "../Order/CommonInput";
import { DropdownInput } from "../../../Inputs";
import { deliveryTypes, poTypes } from "../../../Utils/DropdownData";
import { useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import { getCommonParams } from "../../../Utils/helper";
import { useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { dropDownListObject } from "../../../Utils/contructObject";
import { toast } from "react-toastify";
import YarnPoItems from "./YarnPoItems";
import AccessoryPoItems from "./AccessoryPoItems";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa6";
import { useAddPoMutation, useDeletePoMutation, useGetPoByIdQuery, useGetPoQuery, useUpdatePoMutation } from "../../../redux/uniformService/PoServices";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useSelector } from "react-redux";

const PurchaseOrderForm = ( {  onClose , id  , setId , readOnly , setReadOnly , allData})  => {


    const today = new Date()
      const componentRef = useRef();
    
      const [poItems, setPoItems] = useState([]);
      const [docId, setDocId] = useState("")
      const [date, setDate] = useState(moment.utc(today).format('YYYY-MM-DD'));
      const [taxTemplateId, setTaxTemplateId] = useState("");
      const [payTermId, setPayTermId] = useState("");
      const [dueDate, setDueDate] = useState("");
      const [transType, setTransType] = useState("GreyYarn");
      const [supplierId, setSupplierId] = useState("");
    
      const [discountType, setDiscountType] = useState("Percentage");
      const [discountValue, setDiscountValue] = useState(0);
      const [partyId, setPartyId] = useState(false);
    
      const [remarks, setRemarks] = useState("")
    
      const [formReport, setFormReport] = useState(false);
    
      const [searchValue, setSearchValue] = useState("");
      const [deliveryType, setDeliveryType] = useState("")
      const [deliveryToId, setDeliveryToId] = useState("")
          const [showExtraCharge, setShowExtraCharge] = useState(false)
          const [showDiscount, setShowDiscount] = useState(false)
    
      const childRecord = useRef(0);

            const [suppliers, setSuppliers] = useState([
        "Supplier One",
        "Supplier Two",
        "Supplier Three",
    ]);
      const { branchId, companyId, finYearId, userId } = getCommonParams()
        const params = {
    branchId, companyId 
  };


  
    const getNextDocId = useCallback(() => {
    //   if (id || isLoading || isFetching) return
      if (allData?.nextDocId) {
        setDocId(allData.nextDocId)
      }
    }, [allData, id])
  
    useEffect(getNextDocId, [getNextDocId])
  
    const {
      data: singleData,
      isFetching: isSingleFetching,
      isLoading: isSingleLoading,
    } = useGetPoByIdQuery(id, { skip: !id });
  
    const [addData] = useAddPoMutation();
    const [updateData] = useUpdatePoMutation();
    const [removeData] = useDeletePoMutation();

      
          const { data: supplierList } =
              useGetPartyQuery({ params: { ...params } });

    const allSuppliers = supplierList ? supplierList.data : []

  function filterSupplier() {
    let finalSupplier = []
    if (transType.toLowerCase().includes("yarn")) {
      finalSupplier = allSuppliers.filter(s => s.yarn)
    } else if (transType.toLowerCase().includes("fabric")) {
      finalSupplier = allSuppliers.filter(s => s.fabric)
    } 
    else if (transType.toLowerCase() === "accessory" ) {
      finalSupplier = allSuppliers.filter(s => s.accessoryGroup)
    } 
    else {
      finalSupplier = allSuppliers.filter(s => s.PartyOnAccessoryItems?.length > 0)

    }
    return finalSupplier
  }
  let supplierListBasedOnSupply = filterSupplier()

  const clientDetail = ((allSuppliers || []).filter(val => val.isClient === true));


    const handleAddSupplier = (newName) => {
        if (!suppliers.includes(newName)) {
            setSuppliers([...suppliers, newName]);
        }
    };
      const activeTab = useSelector((state) =>
        state.openTabs.tabs.find((tab) => tab.active).name
      );

  const { data: branchList } = useGetBranchQuery({ params: { companyId } });

  const { data: supplierDetails } =
    useGetPartyByIdQuery(supplierId, { skip: !supplierId });

  function isSupplierOutside() {
    if (supplierDetails) {
      return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
    }
    return false
  }

      
        function getTotalQty() {
        let qty = poItems?.reduce((acc, curr) => { return acc + parseInt(curr?.qty ? curr?.qty : 0) }, 0)
        return parseInt(qty)
    }

const partyFilter = (data) => {
  console.log(data, "data");

  return data?.filter((party) =>
    party?.PartyMaterials?.some((material) => {
      console.log(material.name?.toLowerCase() === transType?.toLowerCase(), "material");
      return material.name?.toLowerCase() === transType?.toLowerCase();
    })
  );
};


    const syncFormWithDb = useCallback((data) => {
    //   if (id) {
    //     setReadOnly(true);
    //   } else {
    //     setReadOnly(false);
    //   }
  
      setTransType(data?.transType ? data.transType : "GreyYarn");
      setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(new Date()).format("YYYY-MM-DD"));
    
      setPoItems(data?.PoItems ? data?.PoItems : [])
      if (data?.docId) {
        setDocId(data?.docId)
      }
      if (data?.date) setDate(data?.date);
        setPartyId(data?.partyId ? data?.partyId : '' )
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
    let data = {
    transType, supplierId, dueDate, payTermId,
    branchId, id, userId,
    remarks,
    poItems: poItems.filter(po => po.yarnId || po.fabricId || po.accessoryId),
    deliveryType, deliveryToId,
    discountType,
    discountValue,
    finYearId
  }
 const handleSubmitCustom = async (callback, data, text) => {
  console.log(callback,"callback")
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
        // syncFormWithDb(undefined)
      }
    } catch (error) {
      console.log("handle");
    }
  };
    const saveData = (nextProcess) => {
        // if (!validateData(data)) {
        //     toast.info("Please fill all required fields...!", { position: "top-center" })
        //     return
        // }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (nextProcess == "draft" && !id) {
      console.log(nextProcess,"nextProcess")

            handleSubmitCustom(addData, data = { ...data, draftSave: true }, "Added", nextProcess);
          }


        else if (id && nextProcess == "draft") {

            handleSubmitCustom(updateData, data = { ...data, draftSave: true }, "Updated", nextProcess);
        }
        else if (id) {

            handleSubmitCustom(updateData, data, "Updated", nextProcess);
        } else {
            handleSubmitCustom(addData, data, "Added", nextProcess);
        }
    }
    return (
        <>
        
              {/* <Modal isOpen={inwardItemSelection} onClose={() => setInwardItemSelection(false)} widthClass={"w-[95%] h-[90%] py-10"}>
        <PoItemsSelection setInwardItemSelection={setInwardItemSelection} transtype={transType}
          supplierId={supplierId}
          inwardItems={directInwardReturnItems}
          setInwardItems={setDirectInwardReturnItems} />
      </Modal> */}
            <div className="w-full  mx-auto rounded-md shadow-lg px-2 py-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-2xl font-bold text-gray-800">Purchase Order </h1>
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


                    <div className="border border-slate-100 p-2 bg-white rounded-md shadow-sm col-span-1 flex flex-row gap-8">
                        {/* <h2 className="font-medium text-slate-700 mb-2">
                            Inward Details
                        </h2> */}
                        {/* <div className="grid grid-cols-3 gap-1 "> */}
                          <div className="w-28">

                            <ReusableInput label="Doc. Id" readOnly value={docId}  />
                          </div>
                            <div className="w-28">

                            <ReusableInput label="Doc Date" value={date} type={"date"} required={true} readOnly={true} disabled />
                            </div>
                                    <div className="w-28">
                           <ReusableInput
                            label="Due Date"
                            value={dueDate}
                            setValue={setDueDate}
                            required
                            type={"date"}
                            readOnly={readOnly}
                          />
                        {/* </div> */}
                                {/* <DropdownInput name="Inward Type"
                            beforeChange={() => { setDirectInwardReturnItems([]) }}
                            options={directOrPo}
                            value={poInwardOrDirectInward} setValue={setPoInwardOrDirectInward} required={true} readOnly={readOnly} /> */}
                             {/* <DropdownInput name="Po Type"
                                options={poTypes}
                                value={transType}
                                setValue={setTransType}
                                required={true}
                                readOnly={readOnly} /> */}
                  

                        </div>
                    </div>

                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1 flex flex-row gap-8">
                         
                            <div className="w-48 ">
                            <DropdownInput name="Po Type"
                                  options={poTypes}
                                  value={transType}
                                  setValue={setTransType}
                                  required={true}
                                  readOnly={readOnly} />
                          </div>
                           <div className="w flex flex-row gap-8">

                            <ReusableSearchableInput
                                            label="Supplier"
                                            component="PartyMaster"
                                            placeholder="Search Parties..."
                                            optionList={partyFilter(supplierList?.data)  }
                                            onAddItem={handleAddSupplier}
                                            // onDeleteItem={onDeleteItem}
                                            setSearchTerm={setPartyId}
                                            searchTerm={partyId}
                                            readOnly={readOnly}
                                            disable ={!transType}
                                        /> 
                   
                        </div>
                                     
                                   

                               

                    </div>


                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                      
                        <div className="grid grid-cols-2 gap-1">
                          
                            {/* <DropdownInput name="Location"
                                options={branchList ? (dropDownListObject(id ? branchList?.data : branchList?.data?.filter(item => item.active), "branchName", "id")) : []}
                                value={locationId}
                                setValue={(value) => { setLocationId(value); setStoreId("") }}
                                required={true} 
                                readOnly={ readOnly}
                                 />
                                 <DropdownInput name="Store"
                            options={dropDownListObject(id ? storeOptions : storeOptions?.filter(item => item.active), "storeName", "id")}
                            value={storeId} setValue={setStoreId} required={true} 
                            readOnly={id || readOnly}
                             /> */}
                              {/* <div className="col-span-1 pt-0.5">
                           <DropdownInput
                            name="Delivery Type"
                            options={deliveryTypes}
                            value={deliveryType}
                            setValue={setDeliveryType}
                            required
                            readOnly={readOnly}
                          />
                        </div> */}
                          
                                                      <DropdownInput name="Customer" options={dropDownListObject(supplierListBasedOnSupply, "name", "id")} value={supplierId} setValue={setSupplierId} required={true}                             readOnly={readOnly}
 />

                        {/* <div className="col-span-1 pt-0.5">
                          <DropdownInput
                            name="Delivery To"
                            options={
                              deliveryType === "ToSelf"
                                ? dropDownListObject(branchList?.data || [], "branchName", "id")
                                : dropDownListObject(clientDetail, "name", "id")
                            }
                            masterName="PARTY MASTER"
                            lastTab={activeTab}
                            value={deliveryToId}
                            setValue={setDeliveryToId}
                            required
                            readOnly={readOnly}
                          />
                        </div>
                          */}
                        </div>

                       </div>
                   </div>
                             <fieldset className=''>                      
                       {transType.toLowerCase().includes("GreyYarn".toLowerCase())
                        ?
                        <YarnPoItems greyFilter={transType.toLowerCase().includes("grey")} id={id} transType={transType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                        :
                        (
                          transType.toLowerCase().includes("DyedYarn".toLowerCase())
                            ?
                            <YarnPoItems greyFilter={transType.toLowerCase().includes("Dyed")} id={id} transType={transType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                            :
                            <AccessoryPoItems id={id} transType={transType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                        )
                      }
                      {/* <Consolidation readOnly={readOnly} remarks={remarks} setRemarks={setRemarks}
                      /> */}
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
                                                       <span className="font-bold">{parseInt(getTotalQty())}   No's</span>
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

                    {showDiscount && (
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
                    )}
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
export default PurchaseOrderForm;