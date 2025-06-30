import { useCallback, useEffect, useRef, useState } from "react";
import { getCommonParams, sumArray } from "../../../Utils/helper";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { DateInput, DropdownInput, TextInput } from "../../../Inputs";
import { directOrPo, poTypes } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { toast } from "react-toastify";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import { useAddDirectInwardOrReturnMutation, useDeleteDirectInwardOrReturnMutation, useGetDirectInwardOrReturnByIdQuery, useGetDirectInwardOrReturnQuery, useUpdateDirectInwardOrReturnMutation } from "../../../redux/uniformService/DirectInwardOrReturnServices";
import moment from "moment";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import AccessoryPoItems from "./AccessoryPoItems";
import Modal from "../../../UiComponents/Modal";
import PoItemsSelection from "./PoItemsSelection";
import YarnPoItems from "./YarnPoItems";
import YarnInwardPoItems from "./YarnInwardItem";
import AccessoryInwardItems from "./AccessoryInwardItems";
const  PurchaseInwardForm = ({ onClose  , id  , setId }) => {




  const [docId,setDocId] = useState("")
  const [ date,setDate] = useState("")
  const [readOnly,setReadOnly] = useState('')
  const [transType, setTransType] = useState("GreyYarn");
  const [dcNo,setDcNo] = useState("")
  const [dcDate,setDcDate] = useState('')
  const [supplierId,setSupplierId] = useState('')
  const [payTermId, setPayTermId] = useState("");
  const [locationId, setLocationId] = useState('');
  const [storeId, setStoreId] = useState("")
  const [poInwardOrDirectInward, setPoInwardOrDirectInward] = useState("DirectInward");
  const [inwardItemSelection, setInwardItemSelection] = useState(false)
  const [directInwardReturnItems,   setDirectInwardReturnItems] = useState([]);

    // console.log(directInwardReturnItems,"directInwardReturnItems");

    const [showExtraCharge, setShowExtraCharge] = useState(false)
    const [showDiscount, setShowDiscount] = useState(false)
    const [isEditing, setIsEditing] = useState(false);
    const [editingItem, setEditingItem] = useState("");
    const [term, setTerm] = useState("");
    const [notes, setNotes] = useState("");
    const [orderBy, setOrderBy] = useState("")
    const [showAddressPopup, setShowAddressPopup] = useState(false)
    const [ vehicleNo,setVehicleNo] =  useState("")
    const [specialInstructions,setSpecialInstructions] = useState('')
    const [remarks,setRemarks]  = useState("")
    const [searchValue,setSearchValue] = useState("")
    const [discountType,setDiscountType]  =  useState("")
    const [discountValue,setDiscountValue]  = useState("")


  const childRecord = useRef(0);
  const { branchId, companyId , userId  , finYearId} = getCommonParams()

  const branchIdFromApi = useRef(branchId);

  const params = {
    branchId, companyId 
  };

    const { data: supplierList } =
        useGetPartyQuery({ params: { ...params } });


 const { data: taxTypeList } =
   useGetTaxTemplateQuery({ params: { ...params } });

  const { data: supplierDetails } =
    useGetPartyByIdQuery(supplierId, { skip: !supplierId });

    const { data: payTermList } =
        useGetPaytermMasterQuery({ params: { ...params } });

  const { data: allData, isLoading, isFetching } = useGetDirectInwardOrReturnQuery({ params: { branchId, poInwardOrDirectInward } });

    const { data: branchList } = useGetBranchQuery({ params: { companyId } });

  const getNextDocId = useCallback(() => {
    if (isLoading || isFetching) return
    if (id) return
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
  }, [allData, isLoading, isFetching, id])

  useEffect(getNextDocId, [getNextDocId])

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetDirectInwardOrReturnByIdQuery(id, { skip: !id });

  const [addData] = useAddDirectInwardOrReturnMutation();
  const [updateData] = useUpdateDirectInwardOrReturnMutation();
  const [removeData] = useDeleteDirectInwardOrReturnMutation();


      useEffect(() => {
      if (id) return
      console.log(directInwardReturnItems,"hit",id)
      setDirectInwardReturnItems([])
    }, [transType,id])

  const syncFormWithDb = useCallback((data) => {
    const today = new Date()
    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
    setTransType(data?.poType ? data.poType : "GreyYarn");
    setPoInwardOrDirectInward(data?.poInwardOrDirectInward ? data?.poInwardOrDirectInward : "DirectInward")
    setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
    setDirectInwardReturnItems(data?.DirectItems ? data.DirectItems : []);
    if (data?.docId) {
      setDocId(data?.docId)
    }
    if (data?.date) setDate(data?.date);
    // setTaxTemplateId(data?.taxTemplateId ? data?.taxTemplateId : "");
    setPayTermId(data?.payTermId ? data?.payTermId : "");
    setSupplierId(data?.supplierId ? data?.supplierId : "");
    setDcDate(data?.dcDate ? moment.utc(data?.dcDate).format("YYYY-MM-DD") : "");
    setDcNo(data?.dcNo ? data.dcNo : "")
    setLocationId(data?.Store ? data.Store.locationId : "")
    setStoreId(data?.storeId ? data.storeId : "")
    setVehicleNo(data?.vehicleNo ? data?.vehicleNo : "")
    setSpecialInstructions(data?.specialInstructions ? data?.specialInstructions : "")
    setRemarks(data?.remarks ? data?.remarks : "")
    if (data?.branchId) {
      branchIdFromApi.current = data?.branchId
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    docId,
    poType: transType,
    poInwardOrDirectInward,
    supplierId, dcDate,
    payTermId,
    branchId, id, userId,
    storeId,
    directInwardReturnItems,
    discountType,
    discountValue,
    dcNo,
    remarks,
    specialInstructions,
    vehicleNo,
    finYearId
}

console.log(data,"data")


    // function isSupplierOutside() {
    //   if (supplierDetails) {
    //     return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
    //   }
    //   return false
    // }



    // const validateData = (data) => {
    //   let mandatoryFields = ["uomId", "colorId", "price"];
    //   let lotMandatoryFields = ["qty"]
    //   if (transType === "GreyYarn" || transType === "DyedYarn") {
    //     mandatoryFields = [...mandatoryFields, "yarnId"]
    //     lotMandatoryFields = [...lotMandatoryFields, "noOfBags", "weightPerBag"]
    //   } else if (transType === "GreyFabric" || transType === "DyedFabric") {
    //     mandatoryFields = [...mandatoryFields, ...["fabricId", "designId", "gaugeId", "loopLengthId", "gsmId", "kDiaId", "fDiaId"]]
    //     lotMandatoryFields = [...lotMandatoryFields, "noOfRolls"]
    //   } else if (transType === "Accessory") {
    //     mandatoryFields = [...mandatoryFields, ...["accessoryId"]]
    //   }




    //   return data.poType && data.supplierId && data.dcDate && data.payTermId && data.dcNo
    //     &&
    //     (
    //       (data.poType === "Accessory")
    //         ?
    //         isGridDatasValid(data.directInwardReturnItems, false, [...mandatoryFields, "qty"])
    //         :
    //         data.directInwardReturnItems.every(item => item?.inwardLotDetails && isGridDatasValid(item?.inwardLotDetails, false, lotMandatoryFields))
    //     )
    //     && isGridDatasValid(data.directInwardReturnItems, false, mandatoryFields)
    //     && data.directInwardReturnItems.length !== 0



    // }

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
    } catch (error) {
      console.log("handle");
    }
  };


//   const saveData = () => {
//     if (!validateData(data)) {
//       toast.info("Please fill all required fields...!", { position: "top-center" })
//       return
//     }
//     if (id) {
//       handleSubmitCustom(updateData, data, "Updated");
//     } else {
//       handleSubmitCustom(addData, data, "Added");
//     }
//   }

    // const deleteData = async () => {
    //   if (id) {
    //     if (!window.confirm("Are you sure to delete...?")) {
    //       return;
    //     }
    //     try {
    //       await removeData(id)
    //       setId("");
    //       onNew();
    //       toast.success("Deleted Successfully");
    //     } catch (error) {
    //       toast.error("something went wrong");
    //     }
    //   }
    // };

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
    getNextDocId()
  };

    const tableHeadings = ["PoNo", "PoDate", "PoType", "DueDate", "Supplier"]
    const tableDataNames = ['dataObj?.id', 'dataObj.active ? ACTIVE : INACTIVE']




    const allSuppliers = supplierList ? supplierList.data : []

    console.log(allSuppliers,"allSuppliers")
  function filterSupplier() {
    let finalSupplier = []
    if (transType.toLowerCase().includes("yarn")) {
      finalSupplier = allSuppliers.filter(s => s.yarn)
    } else if (transType.toLowerCase().includes("fabric")) {
      finalSupplier = allSuppliers.filter(s => s.fabric)
    } 
    else if (transType.toLowerCase().includes("accessory")) {
      finalSupplier = allSuppliers.filter(s => s.accessoryGroup)
    } 
    // else {
    //   finalSupplier = allSuppliers.filter(s => s.PartyOnAccessoryItems.length > 0)
    // }
    return finalSupplier
  }
  let supplierListBasedOnSupply = filterSupplier()

    // const getTotalIssuedQty = () => {
    //   if (transType === "Accessory") {
    //     return directInwardReturnItems?.reduce((total, current) => total + current?.qty, 0)
    //   }
    //   else {

    //     return directInwardReturnItems?.reduce((total, current) => {
    //       return total + sumArray(current?.inwardLotDetails ? current.inwardLotDetails : [], "qty")
    //     }, 0)
    //   }

    // }

  useEffect(() => {
    if (id) return
    setDirectInwardReturnItems([]);
    setSupplierId("")
  }, [transType])

  const { data: locationData } = useGetLocationMasterQuery({ params: { branchId }, searchParams: searchValue });

  const storeOptions = locationData ?
    locationData.data.filter(item => parseInt(item.locationId) === parseInt(locationId)) :
    [];

  function removeItem(id) {
    setDirectInwardReturnItems(directInwardItems => {
      let newItems = structuredClone(directInwardItems);
      newItems = newItems.filter(item => parseInt(item.poItemsId) !== parseInt(id))
      return newItems
    });
  }


    // if (!branchList || !locationData) return <Loader />

  let taxItems = transType !== "Accessory" ? directInwardReturnItems.map(item => {
    let newItem = structuredClone(item)
    newItem["qty"] = sumArray(newItem?.inwardLotDetails ? newItem?.inwardLotDetails : [], "qty")
    return newItem
  }) : directInwardReturnItems

    const saveData = (nextProcess) => {
        // if (!validateData(data)) {
        //     toast.info("Please fill all required fields...!", { position: "top-center" })
        //     return
        // }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (nextProcess == "draft" && !id) {


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
    
        function getTotalQty() {
        let qty = directInwardReturnItems?.reduce((acc, curr) => { return acc + parseInt(curr?.qty ? curr?.qty : 0) }, 0)
        return parseInt(qty)
    }
  function isSupplierOutside() {
    if (supplierDetails) {
      return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
    }
    return false
  }

  return (
      <>
        <Modal isOpen={inwardItemSelection} onClose={() => setInwardItemSelection(false)} widthClass={"w-[95%] h-[90%] py-10"}>
        <PoItemsSelection setInwardItemSelection={setInwardItemSelection} transtype={transType}
          supplierId={supplierId}
          inwardItems={directInwardReturnItems}
          setInwardItems={setDirectInwardReturnItems} />
      </Modal>
            <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-2xl font-bold text-gray-800">Purchse Inward </h1>
                    <button
                        onClick={onClose}
                        className="text-indigo-600 hover:text-indigo-700"
                        title="Open Report"
                    >
                        <FaFileAlt className="w-5 h-5" />
                    </button>
                </div>

            </div>
            <div className="space-y-3 h-full ">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">


                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                        <h2 className="font-medium text-slate-700 mb-2">
                            Inward Details
                        </h2>
                        <div className="grid grid-cols-2 gap-1">
                            <ReusableInput label="Doc. Id" readOnly value={docId} />
                            <ReusableInput label="Doc Date" value={date} type={"date"} required={true} readOnly={true} disabled />
                                <DropdownInput name="Inward Type"
                            beforeChange={() => { setDirectInwardReturnItems([]) }}
                            options={directOrPo}
                            value={poInwardOrDirectInward} setValue={setPoInwardOrDirectInward} required={true} readOnly={readOnly} />
                             <DropdownInput name="Po Type"
                                options={poTypes}
                                value={transType}
                                setValue={setTransType}
                                required={true}
                                readOnly={readOnly} />

                        </div>
                    </div>

                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-medium text-slate-700 mb-2">
                            </h2>
                            <div className="grid grid-cols-2 gap-1">
                          
                            <DropdownInput name="Supplier" options={dropDownListObject(supplierListBasedOnSupply, "name", "id")} value={supplierId} setValue={setSupplierId} required={true} readOnly={id} />
                            <TextInput name={"Dc No."} value={dcNo} setValue={setDcNo} readOnly={readOnly} required />
                            <DateInput name="Dc Date" value={dcDate} setValue={setDcDate} required={true} readOnly={readOnly} />
                            <DropdownInput name="Pay Terms" options={dropDownListObject(payTermList ? payTermList?.data : [], "name", "id")} value={payTermId} setValue={(value) => { setPayTermId(value); }} required={true} readOnly={readOnly} />
                        </div>

                    </div>


                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                        <h2 className="font-medium text-slate-700 mb-2">
                            {/* Inward Details */}
                        </h2>
                        <div className="grid grid-cols-2 gap-1">
                            <DropdownInput name="Location"
                                options={branchList ? (dropDownListObject(id ? branchList?.data : branchList?.data?.filter(item => item.active), "branchName", "id")) : []}
                                value={locationId}
                                setValue={(value) => { setLocationId(value); setStoreId("") }}
                                required={true} readOnly={id || readOnly} />
                                 <DropdownInput name="Store"
                            options={dropDownListObject(id ? storeOptions : storeOptions.filter(item => item.active), "storeName", "id")}
                            value={storeId} setValue={setStoreId} required={true} readOnly={id || readOnly} />
                            {/* {(!readOnly && poInwardOrDirectInward == "PurchaseInward") && */}
                                < div className="">
                                    <button className="p-1.5 text-xs bg-lime-400 rounded hover:bg-lime-600 font-semibold transition hover:text-white"
                                        onClick={() => {
                                            // if (!supplierId) {
                                            //     toast.info("Please Select Suppplier", { position: "top-center" })
                                            //     return
                                            // }
                                            setInwardItemSelection(true)
                                        }}
                                    >Select Items
                                    </button>
                                </div>
                            {/* } */}
                        </div>

                            </div>
                   </div>
                   <fieldset>
                      {

                        poInwardOrDirectInward == "DirectInward" &&
                        (transType.toLowerCase().includes("yarn")
                          ?
                          <YarnPoItems 
                            poItems={directInwardReturnItems} setPoItems={setDirectInwardReturnItems}                           />
                          :
                          
                            // transType.toLowerCase().includes("fabric")
                            //   ?
                            //   <FabricPoItems greyFilter={transType.toLowerCase().includes("grey")} id={id} transType={transType} params={params} poItems={directInwardReturnItems} setPoItems={setDirectInwardReturnItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                            //   :
                              <AccessoryPoItems
                              //  id={id} transType={transType}  params={params} poItems={directInwardReturnItems} setPoItems={setDirectInwardReturnItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} 
                               />
                          
                        )
                      }
                   
                   
                      {

                        
                    poInwardOrDirectInward == "PurchaseInward" &&
                   (
                    
                    transType.toLowerCase().includes("yarn")  ? 
                          <YarnInwardPoItems inwardItems={directInwardReturnItems} setInwardItems={setDirectInwardReturnItems} 
                          removeItem={removeItem} transType={transType} purchaseInwardId={id} params={params}
                               readOnly={readOnly} isSupplierOutside={isSupplierOutside()}
                          />
                    :
                    
                          transType.toLowerCase().includes("fabric")
                            ?
                            // <FabricPoItems 
                            // greyFilter={transType.toLowerCase().includes("grey")} id={id} transType={transType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} 
                            // />
                            <></>
                            :
                            <AccessoryInwardItems  poItems={directInwardReturnItems} setPoItems={setDirectInwardReturnItems} readOnly={readOnly}
                            //  id={id} transType={transType} taxTypeId={taxTemplateId} params={params}  isSupplierOutside={isSupplierOutside()} 
                             />
                   )
                   }         
                   </fieldset>
               
                     <div className="grid grid-cols-3 gap-3">
                                           <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                                               <h2 className="font-medium text-slate-700 mb-2 text-base">Terms & Conditions</h2>
                                               <textarea
                                                   readOnly={readOnly}
                                                   value={term}
                                                   onChange={(e) => {
                                                       setTerm(e.target.value)
                                                   }}
                                                   className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                                                   placeholder="Additional notes..."
                   
                                               />
                                             
                                           </div>
                   
                                      
                   
                   
                                           <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
                                               <h2 className="font-medium text-slate-700 mb-2 text-base">Notes</h2>
                                               <textarea
                                                   readOnly={readOnly}
                                                   value={notes}
                                                   onChange={(e) => {
                                                       setNotes(e.target.value)
                                                   }}
                                                   className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                                                   placeholder="Additional notes..."
                                               />
                                           </div>
                   
                   
                                           {/* Pricing Summary (Grand Total) Section */}
                                           <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                                               <h2 className="font-semibold text-slate-800 mb-2 text-base">
                                                   Qty Summary
                                               </h2>
                   
                                               <div className="space-y-1.5">
                                                   <div className="flex justify-between py-1 text-sm">
                                                       <span className="text-slate-600">Total Qty</span>
                                                       <span className="font-medium">{parseInt(getTotalQty())}   No's</span>
                                                   </div>
                   
                   
                   
                                                   <div className="flex justify-between py-1 text-sm">
                                                       <span className="text-slate-600">Order By</span>
                                                       <input
                                                           type="text"
                                                           className="w-60 pl-2.5 pr-8 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                                                           placeholder="Order By"
                                                           readOnly
                                                           value={orderBy}
                                                           onChange={(e) => setOrderBy(e.target.value)}
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
    );
}

export default PurchaseInwardForm;