import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { findFromList, getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import { useAddPoMutation, useGetPoByIdQuery, useUpdatePoMutation } from "../../../redux/uniformService/PoServices";
import { useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useGetRequirementPlanningFormItemsQuery } from "../../../redux/uniformService/RequirementPlanningFormServices";
import Modal from "../../../UiComponents/Modal";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import PrintFormat from "../CuttingOrderGeneration/PrintFormat-CO";
import { FaFileAlt } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { DateInputNew, DropdownInput, ReusableSearchableInput, TextInput } from "../../../Inputs";
import { deliveryTypes, MaterialType, PoTypes } from "../../../Utils/DropdownData";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import AccessoryPoItems from "./AccessoryPoItems";
import { Loader } from "../../../Basic/components";
import OrderDetailsSelection from "./OrderDetailsSelection";
import { useAddAccessoryPoMutation, useGetAccessoryPoByIdQuery, useUpdateAccessoryPoMutation } from "../../../redux/uniformService/AccessoryPoServices";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetAccessoryGroupMasterQuery } from "../../../redux/uniformService/AccessoryGroupMasterServices";
import { useGetAccessoryItemMasterQuery } from "../../../redux/uniformService/AccessoryItemMasterServices";
import { useGetAccessoryMasterQuery } from "../../../redux/uniformService/AccessoryMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import GeneralAccessoryPoItems from "./GeneralAccessoryPoItems";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import PoSummary from "./PoSummary";
import AccessoryPurchaseOrderPrintFormat from "./PrintFormat-PR";
import { useGetBranchByIdQuery } from "../../../redux/services/BranchMasterService";
import useTaxDetailsHook from "../../../CustomHooks/TaxHookDetails";
import { groupBy } from "lodash";



const PurchaseOrderForm = ({ onClose, id, setId, readOnly, setReadOnly, docId, setDocId, poItems, setPoItems, tempPoItems, setTempPoItems, onNew,
  supplierList, taxTypeList, branchList, requirementPlanningItemsData, isRequirementLoading, isRequirementFetching, RequirementRefetch,


  date, setDate,
  taxTemplateId, setTaxTemplateId,
  payTermId, setPayTermId,
  dueDate, setDueDate,
  poType, setPoType,
  poMaterial, setPoMaterial,
  supplierId, setSupplierId,
  discountType, setDiscountType,
  discountValue, setDiscountValue,
  orderId, setOrderId,
  remarks, setRemarks,
  PurchaseType, setPurchaseType,
  deliveryType, setDeliveryType,
  deliveryToId, setDeliveryToId,
  showExtraCharge, setShowExtraCharge,
  printModalOpen, setPrintModalOpen,
  tableDataView, setTableDataView,
  requirementId, setRequirementId,
  term, setTerm

}) => {




  const [summary, setSummary] = useState(false);


  const { branchId, userId, finYearId } = getCommonParams();
  const params = { branchId, userId, finYearId, poMaterial: poMaterial };

  const [currentSelectedIndex, setCurrentSelectedIndex] = useState("")
  const [contextMenu, setContextMenu] = useState(null);

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetAccessoryPoByIdQuery(id, { skip: !id });

  const [addData] = useAddAccessoryPoMutation();
  const [updateData] = useUpdateAccessoryPoMutation();




  const { data: accessoryGroupList } = useGetAccessoryGroupMasterQuery({
    params,
  });

  const { data: accessoryItemList } = useGetAccessoryItemMasterQuery({
    params,
  });

  const { data: accessoryList } = useGetAccessoryMasterQuery({ params });

  const { data: colorList } = useGetColorMasterQuery({ params });

  const { data: uomList } = useGetUomQuery({ params });

  const { data: sizeList } = useGetSizeMasterQuery({ params });



  const { data: supplierDetails } =
    useGetPartyByIdQuery(supplierId, { skip: !supplierId });


  const { data: hsnData } =
    useGetHsnMasterQuery({ params });








  useEffect(() => {

    setTempPoItems(requirementPlanningItemsData?.data?.filter(po => po.yarnType === poMaterial)?.map(item => ({
      ...item,
      RequirementPlanningItemsId: item?.id  // assuming qty is the field you want to base 10% on
    })))

  }, [isRequirementFetching, isRequirementLoading, poMaterial, requirementPlanningItemsData]);








  function getTotalQty() {
    let qty = poItems?.reduce((acc, curr) => { return acc + parseInt(curr?.qty ? curr?.qty : 0) }, 0)
    return parseInt(qty)
  }





  const syncFormWithDb = useCallback((data) => {

    setReadOnly(true)


    setPoType(data?.poType ? data?.poType : "");
    setDate(data?.createdAt
      ? moment.utc(data.createdAt).format("YYYY-MM-DD")
      : moment.utc(new Date()).format("YYYY-MM-DD")
    );
    setPoMaterial(data?.poMaterial ? data?.poMaterial : 'Accessory')

    setPoItems(data?.AccessoryPoItems ? data?.AccessoryPoItems : []);
    setDocId(data?.docId ? data?.docId : "New");
    setPayTermId(data?.payTermId || "");
    setDiscountType(data?.discountType || "");
    setDiscountValue(data?.discountValue || "0");
    setSupplierId(data?.supplierId || "");
    setDueDate(data?.dueDate
      ? moment.utc(data.dueDate).format("YYYY-MM-DD")
      : ""
    );
    setDeliveryType(data?.deliveryType || "");
    setDeliveryToId(
      data?.deliveryType === "ToSelf"
        ? data?.deliveryBranchId
        : data?.deliveryPartyId || ""
    );
    setRemarks(data?.remarks || "");
    setPurchaseType(data?.PurchaseType ? data?.PurchaseType : "")
    setOrderId(data?.orderId ? data?.orderId : "")
    setRequirementId(data?.requirementId ? data?.requirementId : "")
    setTaxTemplateId(data?.taxTemplateId ? data?.taxTemplateId : "")

  }, [id]);
  console.log(poItems, "poItems");




  useEffect(() => {
    if (id && singleData?.data) {
      syncFormWithDb(singleData.data);
    }

  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);




  let data = {
    supplierId, dueDate, payTermId,
    branchId, id, userId,
    remarks,
    poItems: poItems?.filter(po => po.yarnId || po.fabricId || po.accessoryId || po.yarncategoryId),
    deliveryType, deliveryToId,
    discountType,
    discountValue,
    finYearId, orderId, PurchaseType, requirementId, poMaterial, poType, taxTemplateId
  }



  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
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
        Swal.fire({
          icon: 'success',
          title: `${text || 'Saved'} Successfully`,
          showConfirmButton: false,
          timer: 2000
        });

        if (returnData.statusCode === 0) {
          if (nextProcess === "new") {
            onNew()
            syncFormWithDb(undefined)
            setReadOnly(false);

          }
          if (nextProcess === "close") {
            onClose()
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






  console.log(data, "dataaaa")

  const validateData = (data) => {
    let mandatoryFields = ["uomId", "price"];
    if (poMaterial === "GreyYarn" || poMaterial === "DyedYarn") {
      mandatoryFields = [...mandatoryFields, "yarnId"]
    } else if (poMaterial === "GreyFabric" || poMaterial === "DyedFabric") {
      mandatoryFields = [...mandatoryFields, ...["fabricId", "designId", "gaugeId", "loopLengthId", "gsmId", "kDiaId", "fDiaId"]]
    } else if (poMaterial === "Accessory") {
      mandatoryFields = [...mandatoryFields, ...["accessoryId"]]
    }




    return data.poMaterial && data.supplierId && data?.dueDate
      // &&
      // (
      //   (data.poType === "Accessory")
      //     ?
      //     isGridDatasValid(data.directInwardReturnItems, false, [...mandatoryFields, "qty"])
      //     :
      //     data.directInwardReturnItems.every(item =>  isGridDatasValid(item?.inwardLotDetails, false, lotMandatoryFields))
      // )
      && isGridDatasValid(data?.poItems, false, mandatoryFields)
      && data?.poItems?.length !== 0



  }


  // const validateData = (data) => {
  //   if (data?.dueDate && data?.poMaterial && data?.poType && data?.supplierId) {
  //     return true;
  //   }


  //   return false;
  // };
  const saveData = (nextProcess) => {
    if (!validateData(data)) {
      Swal.fire({
        // title: "Total percentage exceeds 100%",
        title: "Please fill all required fields...!",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      }); return
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return
    }
    if (nextProcess == "draft" && !id) {
      console.log(nextProcess, "nextProcess")

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


  const { data: branchdata } = useGetBranchByIdQuery(branchId, { skip: !branchId });



  const { isLoading: isTaxHookDetailsLoading, ...taxDetails } = useTaxDetailsHook({ poItems: poItems, taxTypeId: taxTemplateId, discountType, discountValue })

  const taxGroupWise = groupBy(poItems, "taxPercent");



  const { data: deliveryToBranch } = useGetBranchByIdQuery(deliveryToId, { skip: deliveryType === "ToParty" })
  const { data: deliveryToSupplier } = useGetPartyByIdQuery(deliveryToId, { skip: deliveryType === "ToSelf" })

  let deliveryTo = deliveryType === "ToParty" ? deliveryToSupplier?.data : deliveryToBranch?.data;

  console.log(taxDetails, "taxDetails")
  const dateRef = useRef(null);


  useEffect(() => {
    if (dateRef.current) {
      dateRef.current.focus();
    }
  }, []);


  return (

    <>
      <Modal isOpen={summary} onClose={() => setSummary(false)} widthClass={"p-10"}>
        <PoSummary
          remarks={remarks}
          setRemarks={setRemarks}
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          poItems={poItems} taxTypeId={taxTemplateId} readOnly={readOnly} />
      </Modal>
      <Modal
        isOpen={tableDataView && poType !== "General Purchase"}
        onClose={() => { setTableDataView(false); setPoType(""); setPoItems([]); setSupplierId("") }}
        widthClass="  h-[80%] w-[90%]"
      >
        <OrderDetailsSelection
          onClose={() => setTableDataView(false)}
          tempPoItems={tempPoItems}
          requirementPlanningItemsData={requirementPlanningItemsData?.data}
          setPoItems={setPoItems}
          poItems={poItems}
          setPoType={setPoType}
          poMaterial={poMaterial}
        />
      </Modal>
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <AccessoryPurchaseOrderPrintFormat
            isTaxHookDetailsLoading={isTaxHookDetailsLoading}
            branchData={branchdata?.data}
            data={id ? singleData?.data : "Null"}
            singleData={id ? singleData?.data : "Null"}
            date={id ? singleData?.data?.selectedDate : date}
            docId={docId ? docId : ""}
            remarks={remarks}
            discountType={discountType}
            poType={poType}
            discountValue={discountValue}
            poNumber={docId} poDate={date} payTermId={payTermId}
            poItems={poItems?.filter(item => item.accessoryId)}
            supplierDetails={supplierDetails ? supplierDetails?.data : null}
            taxDetails={taxDetails} taxTemplateId={taxTemplateId} deliveryType={deliveryType}
            deliveryToId={deliveryToId} deliveryTo={deliveryTo} taxGroupWise={taxGroupWise}
            // termsAndCondition={termsAndCondition} 
            colorList={colorList} uomList={uomList} accessoryList={accessoryList} sizeList={sizeList}
            term={term}
          />
        </PDFViewer>
      </Modal>

      <div className="w-full  mx-auto rounded-md shadow-lg px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Accessory Purchase Order</h1>
          <button
            onClick={() => {
              onNew()
              onClose()
              RequirementRefetch()
            }
            }
            className="text-indigo-600 hover:text-indigo-700"
            title="Open Report"
          >
            <FaFileAlt className="w-5 h-5" />
          </button>
        </div>

      </div>
      <div className="space-y-3 h-full py-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">



          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">
              Basic Details
            </h2>
            <div className="grid grid-cols-2 gap-1">
              <ReusableInput label="Doc. Id" readOnly value={docId} />
              <ReusableInput label="Doc Date" value={date} type={"date"} required={true} readOnly={true} disabled />
              <DateInputNew
                name="Delivery Date"
                value={dueDate}
                setValue={setDueDate}
                type={"date"}
                required={true}
                ref={dateRef}
                // nextRef={inputPartyRef}

                readOnly={readOnly}
              />

            </div>

          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">
              Po Details
            </h2>
            <div className="grid grid-cols-2 gap-1 ">
              <DropdownInput name="Material "
                options={MaterialType}
                value={poMaterial}
                setValue={(value) => {
                  setPoMaterial(value);
                  setPoType("")
                }}
                required={true}
                readOnly={readOnly}
                disabled={true}
              />
              <DropdownInput name="Po Type"
                options={PoTypes}
                value={poType}
                setValue={(value) => { setPoType(value); }}

                required={true}
                readOnly={readOnly}
                disabled={orderId || id}
              />
              {/* {poType === "ORDER" &&
                <DropdownWithSearch
                  label="Order No"
                  options={orderData?.data}
                  labelField={"docId"}
                  value={orderId}
                  required={true}
                  setValue={(value) => { setOrderId(value); setTableDataView(true) }}
                />
              } */}
              <DropdownInput name="Tax Type" options={dropDownListObject(taxTypeList ? taxTypeList?.data : [], "name", "id")} value={taxTemplateId} setValue={setTaxTemplateId} required={true} readOnly={readOnly} />


              <div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">
              Supplier Details
            </h2>
            <div className="grid grid-cols-2 gap-2">

              <div className="col-span-2">

                <ReusableSearchableInput
                  label="Supplier Id"
                  component="PartyMaster"
                  placeholder="Search Supplier Id..."
                  optionList={supplierList?.data}
                  // onAddItem={handleAddSupplier}
                  // onDeleteItem={onDeleteItem}
                  // setSearchTerm={setSupplierId}
                  setSearchTerm={(value) => { setSupplierId(value) }}

                  searchTerm={supplierId}
                  show={"isSupplier"}
                  required={true}
                  disabled={id}
                />
              </div>


              <TextInput
                name="Contact Person"
                placeholder="Contact name"
                value={findFromList(supplierId, supplierList?.data, "contactPersonEmail")}
                // setValue={setContactPersonName}
                disabled={true}
              />{console.log(findFromList(supplierId, supplierList?.data, "contactPersonNumber"), "phone")}
              <TextInput
                name="Phone"
                placeholder="Contact name"
                value={findFromList(supplierId, supplierList?.data, "contactPersonNumber")}
                // setValue={setPhone}
                disabled={true}
              // onChange={(e) => setPhone(e.target.value)}

              />







            </div>

          </div>
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">
              Delivery Details
            </h2>
            <div className="grid grid-cols-3 gap-2">


              <DropdownInput name="Delivery Type"
                options={deliveryTypes}
                // option={delivery}
                value={deliveryType}
                setValue={setDeliveryType}
                required={true} readOnly={readOnly} />
              <div className="col-span-2">

                {deliveryType == "ToSelf"
                  ?
                  <DropdownInput name="Delivery To" options={dropDownListObject(branchList ? branchList.data : [], "branchName", "id")} value={deliveryToId} setValue={setDeliveryToId} required={true} readOnly={readOnly}

                  />
                  :

                  <DropdownInput name="Delivery To" options={dropDownListObject(supplierList?.data?.filter(val => val.isSupplier), "code", "id")} value={deliveryToId} setValue={setDeliveryToId} required={true} readOnly={readOnly} />
                }

              </div>










            </div>

          </div>









        </div>
        <fieldset className=''>
          {poType == "General Purchase"

            ?
            <>

              <GeneralAccessoryPoItems id={id} transType={poType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} tableDataView={tableDataView} setTableDataView={setTableDataView} supplierId={supplierId}
                accessoryGroupList={accessoryGroupList}
                accessoryItemList={accessoryItemList}
                accessoryList={accessoryList}
                colorList={colorList}
                uomList={uomList}
                sizeList={sizeList} hsnData={hsnData} handleRightClick={handleRightClick} handleCloseContextMenu={handleCloseContextMenu} contextMenu={contextMenu}

              />
            </>

            :
            <AccessoryPoItems id={id} transType={poType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} tableDataView={tableDataView} setTableDataView={setTableDataView} supplierId={supplierId}
              accessoryGroupList={accessoryGroupList}
              accessoryItemList={accessoryItemList}
              accessoryList={accessoryList}
              colorList={colorList}
              uomList={uomList}
              sizeList={sizeList} hsnData={hsnData} handleRightClick={handleRightClick} handleCloseContextMenu={handleCloseContextMenu}
              contextMenu={contextMenu}
            />
          }

        </fieldset>

        <div className="grid grid-cols-4 gap-3">
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
            <h2 className="font-bold text-slate-700 mb-2 text-base">Terms & Conditions</h2>
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
            <h2 className="font-bold text-slate-700 mb-2 text-base">Remarks</h2>
            <textarea
              readOnly={readOnly}
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value)
              }}
              placeholder="Remarks..."

              className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
            />
          </div>
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
            <h2 className="font-bold text-slate-800 mb-2 text-base">
              Po Summary
            </h2>

            <button className="text-sm bg-sky-500 hover:text-white font-semibold hover:bg-sky-800 transition p-1 ml-5 rounded"
              onClick={() => {
                if (!taxTemplateId) {
                  // toast.info("Please Select Tax Template !", { position: "top-center" })
                  Swal.fire({
                    title: "Please Select Tax Template !",
                    icon: "success",
                    draggable: true,
                    timer: 1000,
                    showConfirmButton: false,
                    didOpen: () => {
                      Swal.showLoading();
                    }
                  });
                  return
                }
                setSummary(true)
              }}>
              View Po Summary
            </button>
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">


            <div className="space-y-1.5">





              <div className=" p-2 bg-white rounded-md shadow-sm">

                <div className="flex justify-between py-1 text-sm">
                  <span className="text-slate-600">Total Qty (Kg)</span>
                  <span className="font-medium">{parseInt(getTotalQty())}</span>
                </div>
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-slate-600">Taxable Amount</span>
                  <span className="font-medium">Rs.{taxDetails?.grossAmount}</span>
                </div>
                {/* <div className="flex justify-between py-1 text-sm">
                  <span className="text-slate-600">Tax Amount</span>
                  <span className="font-medium">Rs.{taxDetails?.grossAmount}</span>
                </div> */}
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-slate-600">Net Amount</span>
                  <span className="font-medium">Rs.{taxDetails?.netAmount}</span>
                </div>


              </div>
            </div>


          </div>






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

          </div>


          <div className="flex gap-2 flex-wrap">

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
            <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
              onClick={() => setPrintModalOpen(true)}
            >
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