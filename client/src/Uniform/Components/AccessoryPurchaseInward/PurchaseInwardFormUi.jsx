import { useCallback, useEffect, useRef, useState } from "react";
import { getCommonParams, isGridDatasValid, sumArray } from "../../../Utils/helper";
import moment from "moment";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { useGetPartyBranchByIdQuery, useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useAddAccessoryPurchaseInwardMutation, useGetAccessoryPurchaseInwardByIdQuery, useUpdateAccessoryPurchaseInwardMutation } from "../../../redux/uniformService/AccessoryInwardServices";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import Modal from "../../../UiComponents/Modal";
import { ReusableInput } from "../Order/CommonInput";
import { DateInput, DateInputNew, DropdownInput, ReusableSearchableInput, TextInput } from "../../../Inputs";
import { directOrPo, poTypes } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";
import { toast } from "react-toastify";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import Swal from "sweetalert2";
import { Loader } from "../../../Basic/components";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import PoItemsSelection from "./PoItemsSelection";
import AccessoryInwardItems from "./AccessoryInwardItems";
import DirectInwardItems from "./DirectInward";
import DirectInward from "./DirectInward";




const PurchaseInwardForm = ({ onClose, id, setId, docId, setDocId, date, setDate, readOnly, setReadOnly, transType, setTransType,
  dcNo, setDcNo, dcDate, setDcDate, supplierId, setSupplierId, payTermId, setPayTermId, locationId, setLocationId, storeId, setStoreId, poInwardOrDirectInward, setPoInwardOrDirectInward, inwardItemSelection, setInwardItemSelection, directInwardReturnItems, setDirectInwardReturnItems, partyId, setPartyId, onNew, branchList, supplierList, locationData,
  colorList, uomList, accessoryList, sizeList, accessoryGroupList, accessoryItemList, storeOptions
}) => {






  const [showExtraCharge, setShowExtraCharge] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState("");
  const [term, setTerm] = useState("");
  const [notes, setNotes] = useState("");
  const [orderBy, setOrderBy] = useState("")
  const [showAddressPopup, setShowAddressPopup] = useState(false)
  const [vehicleNo, setVehicleNo] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [remarks, setRemarks] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [discountType, setDiscountType] = useState("")
  const [discountValue, setDiscountValue] = useState("")

  const [contextMenu, setContextMenu] = useState(false)

  const childRecord = useRef(0);
  const { branchId, companyId, userId, finYearId } = getCommonParams()

  // const branchIdFromApi = useRef(branchId);

  const params = {
    branchId, companyId
  };

  const inwardTyperef = useRef(null);
  const dcdate = useRef(null)


  useEffect(() => {
    if (inwardTyperef.current) {
      inwardTyperef.current.focus();
    }
  }, []);


  //   const { data: taxTypeList } =
  //     useGetTaxTemplateQuery({ params: { ...params } });


  //   const { data: payTermList } =
  //     useGetPaytermMasterQuery({ params: { ...params } });



  // const getNextDocId = useCallback(() => {
  //   if (isLoading || isFetching) return
  //   if (id) return
  //   if (allData?.nextDocId) {
  //     setDocId(allData.nextDocId)
  //   }
  // }, [allData, isLoading, isFetching, id])

  // useEffect(getNextDocId, [getNextDocId])

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetAccessoryPurchaseInwardByIdQuery(id, { skip: !id });

  const [addData] = useAddAccessoryPurchaseInwardMutation();
  const [updateData] = useUpdateAccessoryPurchaseInwardMutation();


  // useEffect(() => {
  //   if (id) return
  //   console.log(directInwardReturnItems, "hit", id)
  //   setDirectInwardReturnItems([])
  // }, [transType, id])

  const syncFormWithDb = useCallback((data) => {
    console.log(data?.DirectItems, "data?.DirectItems")
    const today = new Date()
    // if (id) {
    //   setReadOnly(true);
    // } else {
    //   setReadOnly(false);
    // }
    setTransType(data?.poType ? data.poType : "Accessory");
    setPoInwardOrDirectInward(data?.poInwardOrDirectInward ? data?.poInwardOrDirectInward : "PurchaseInward")
    setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
    setDirectInwardReturnItems(data?.AccessoryInwardItems ? data.AccessoryInwardItems : []);
    if (data?.docId) {
      setDocId(data?.docId)
    }
    if (data?.date) setDate(data?.date);
    // setTaxTemplateId(data?.taxTemplateId ? data?.taxTemplateId : "");
    setPayTermId(data?.payTermId ? data?.payTermId : "");
    setSupplierId(data?.supplierId ? data?.supplierId : "");
    setDcDate(data?.dcDate ? moment.utc(data?.dcDate).format("YYYY-MM-DD") : "");
    setDcNo(data?.dcNo ? data.dcNo : "")
    setLocationId(data?.branchId ? data?.branchId : "")
    setStoreId(data?.storeId ? data.storeId : "")
    setVehicleNo(data?.vehicleNo ? data?.vehicleNo : "")
    setSpecialInstructions(data?.specialInstructions ? data?.specialInstructions : "")
    setPartyId(data?.supplierId ? data?.supplierId : "")
    setRemarks(data?.remarks ? data?.remarks : "")
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
    docId,
    poType: transType,
    poInwardOrDirectInward,
    supplierId, dcDate,
    payTermId,
    branchId, id, userId,
    storeId,
    directInwardReturnItems : directInwardReturnItems?.filter(i => i.accessoryId),
    discountType,
    discountValue,
    dcNo,
    remarks,
    specialInstructions,
    vehicleNo,
    finYearId,
    locationId: locationId ? parseInt(locationId) : undefined,
    partyId
  }

  console.log( directInwardReturnItems?.filter(i => i.accessoryId), "directInwardReturnItemsFilter")





  // async function onDeleteItem(itemId) {
  //   await removeData(itemId).unwrap();
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






  const validateData = (data) => {

    let mandatoryFields = ["qty"];
    if (transType === "GreyYarn" || transType === "DyedYarn") {
      mandatoryFields = [...mandatoryFields, "yarnId"]
    } else if (transType === "GreyFabric" || transType === "DyedFabric") {
      mandatoryFields = [...mandatoryFields, ...["fabricId", "designId", "gaugeId", "loopLengthId", "gsmId", "kDiaId", "fDiaId"]]
    } else if (transType === "Accessory") {
      mandatoryFields = [...mandatoryFields, ...["accessoryId"]]
    }


    if (data?.partyId && data?.locationId && data?.storeId && data?.poInwardOrDirectInward && data?.poType && data?.dcDate && data?.dcDate) {
      return true
    }

    return false
  }
  console.log(data, "data")






  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback(data).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      if (returnData.statusCode === 1) {
        // toast.error(returnData.message);
      } else {
        Swal.fire({
          icon: 'success',
          title: `${text || 'Saved'} Successfully`,
          showConfirmButton: false,
          timer: 2000
        });

        if (returnData.statusCode === 0) {
          if (nextProcess == "new") {
            syncFormWithDb(undefined);
            onNew()
          }
          if (nextProcess === "close") {
            onClose()
          }
          else {
            setId(returnData?.data?.id);

          }




        } else {
          toast.error(returnData?.message);
        }
        // setId()
        // syncFormWithDb(undefined)
      }
    } catch (error) {
      console.log("handle");
    }
  };











  // useEffect(() => {
  //   if (id) return
  //   setDirectInwardReturnItems([]);
  //   setSupplierId("")
  // }, [transType])



  function removeItem(id) {
    setDirectInwardReturnItems(directInwardItems => {
      let newItems = structuredClone(directInwardItems);
      newItems = newItems.filter(item => parseInt(item.poItemsId) !== parseInt(id))
      return newItems
    });
  }



  let taxItems = transType !== "Accessory" ? directInwardReturnItems.map(item => {
    let newItem = structuredClone(item)
    newItem["qty"] = sumArray(newItem?.inwardLotDetails ? newItem?.inwardLotDetails : [], "qty")
    return newItem
  }) : directInwardReturnItems

  console.log(directInwardReturnItems?.some(item => item.yarnId === "" || item.fabricId === "" || item.accessoryId === ""), "condition")

  const saveData = (nextProcess) => {

    let mandatoryFields = ["qty"];
    if (!validateData(data)) {
      // toast.info("Please fill all required fields...!", { position: "top-center" })


      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "success",

      });
      return
    }
    if (
      directInwardReturnItems?.filter(item => item.accessoryId !== "")?.length === 0
    ) {
      Swal.fire({
        title: "Please Fill at least one Accessory Po item!",
        icon: "warning", 
      });
      return;
    }

    if (!isGridDatasValid(data?.directInwardReturnItems?.filter(i => i.accessoryId != ""), false, mandatoryFields)) {
      Swal.fire({
        title: "Enter The Inward Qty",
        icon: "success",
      });
      return
    }
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
  //   function isSupplierOutside() {
  //     if (supplierDetails) {
  //       return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
  //     }
  //     return false
  //   }
  //   if (!branchList || !locationData) return <Loader />



  const handleRightClick = (event, rowIndex, type) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      rowId: rowIndex,
      type,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };


  return (
    <>
      <Modal isOpen={inwardItemSelection} onClose={() => setInwardItemSelection(false)} widthClass={"w-[95%] h-[85%] py-10"}>
        <PoItemsSelection setInwardItemSelection={setInwardItemSelection} transtype={transType}
          supplierId={partyId}
          inwardItems={directInwardReturnItems}
          setInwardItems={setDirectInwardReturnItems} poInwardOrDirectInward={poInwardOrDirectInward} />
      </Modal>
      <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Accessory Purchase Inward </h1>
          <button
            onClick={onClose}
            className="text-indigo-600 hover:text-indigo-700"
            title="Open Report"
          >
            <FaFileAlt className="w-5 h-5" />
          </button>
        </div>

      </div>
      <div className="space-y-3 h-full mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">


          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">
              Basic Details
            </h2>
            <div className="grid grid-cols-2 gap-1">
              <ReusableInput label="Accessory Purchase Inward Id" readOnly value={docId} />
              <ReusableInput label="Doc Date" value={date} type={"date"} required={true} readOnly={true} disabled />


            </div>
          </div>




          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">
              Inward Details
            </h2>
            <div className="grid grid-cols-2 gap-1">
              <DropdownInput name="Inward Type"
                ref={inwardTyperef}

                beforeChange={() => { setDirectInwardReturnItems([]) }}
                options={directOrPo}
                value={poInwardOrDirectInward}
                setValue={setPoInwardOrDirectInward}
                required={true} readOnly={readOnly}
                disabled={id}


              />
              <DropdownInput name="Po Type"
                options={poTypes}
                value={transType}
                setValue={setTransType}
                required={true}
                readOnly={true}
                disabled={id}
              />

              <DropdownInput name="Location"
                options={branchList ? (dropDownListObject(id ? branchList?.data : branchList?.data?.filter(item => item.active), "branchName", "id")) : []}
                value={locationId}
                setValue={(value) => { setLocationId(value); setStoreId("") }}
                required={true} disabled={id}

              // readOnly={ readOnly}
              />
              <DropdownInput name="Store"
                options={dropDownListObject(id ? storeOptions : storeOptions?.filter(item => item.active), "storeName", "id")}
                value={storeId} setValue={setStoreId} required={true} disabled={id}

              />

            </div>

          </div>
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">
              Supplier Details
            </h2>
            <div className="grid grid-cols-2 gap-1">

              <div className="col-span-2">

                <ReusableSearchableInput
                  label="Supplier Id"
                  component="PartyMaster"
                  placeholder="Search Supplier Id..."
                  optionList={supplierList?.data}
                  setSearchTerm={setPartyId}
                  searchTerm={partyId}

                  show={"isSupplier"}
                  disabled={id}

                />
              </div>
              <TextInput name={"Dc No"} value={dcNo} setValue={setDcNo} readOnly={readOnly} required />
              <DateInputNew name="Dc Date" value={dcDate} setValue={setDcDate} required={true} readOnly={readOnly} ref={dcdate}
                type={"date"}
              />

            </div>

          </div>
        </div>
        <fieldset>

          {

            (poInwardOrDirectInward == "DirectInward") &&

            <DirectInward
              inwardItems={directInwardReturnItems} setInwardItems={setDirectInwardReturnItems} readOnly={readOnly} setInwardItemSelection={setInwardItemSelection} supplierId={partyId} handleRightClick={handleRightClick} contextMenu={contextMenu} handleCloseContextMenu={handleCloseContextMenu}
              colorList={colorList} uomList={uomList} accessoryList={accessoryList} sizeList={sizeList} accessoryGroupList={accessoryGroupList} accessoryItemList={accessoryItemList}

            />

          }

          {

            (poInwardOrDirectInward == "GeneralInward" || poInwardOrDirectInward == "PurchaseInward") &&


            <AccessoryInwardItems
              inwardItems={directInwardReturnItems} setInwardItems={setDirectInwardReturnItems} readOnly={readOnly} setInwardItemSelection={setInwardItemSelection} supplierId={partyId} handleRightClick={handleRightClick} contextMenu={contextMenu} handleCloseContextMenu={handleCloseContextMenu}
              colorList={colorList} uomList={uomList} accessoryList={accessoryList} sizeList={sizeList} accessoryGroupList={accessoryGroupList} accessoryItemList={accessoryItemList}
              poInwardOrDirectInward={poInwardOrDirectInward}

            />
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
                <span className="text-slate-600">Total Qty (Kg)</span>
                <span className="font-medium">{parseInt(getTotalQty())}</span>
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


            </div>
          </div>



        </div>

        <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
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

          <div className="flex gap-2 flex-wrap">

            <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
              onClick={() => setReadOnly(false)}
            >
              <FiEdit2 className="w-4 h-4 mr-2" />
              Edit
            </button>
            {/* <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
              <FaWhatsapp className="w-4 h-4 mr-2" />
              WhatsApp
            </button> */}
            {/* <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm">
              <FiPrinter className="w-4 h-4 mr-2" />
              Print
            </button> */}
          </div>
        </div>
      </div>




    </>
  );
}

export default PurchaseInwardForm;