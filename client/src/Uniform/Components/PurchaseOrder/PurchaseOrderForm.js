import { FaEye, FaFileAlt } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { DateInputNew, DropdownInput, DropdownWithSearch, ReusableSearchableInput, TextInput } from "../../../Inputs";
import { deliveryTypes, MaterialType, poMaterial, PoTypes, poTypes, purchaseType, stockTransferType, YarnMaterial } from "../../../Utils/DropdownData";
import { useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import { findFromList, getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import { useGetPartyByIdQuery, useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { toast } from "react-toastify";
import YarnPoItems from "./YarnPoItems";
import AccessoryPoItems from "./AccessoryPoItems";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa6";
import { useAddPoMutation, useDeletePoMutation, useGetPoByIdQuery, useUpdatePoMutation } from "../../../redux/uniformService/PoServices";
import { useGetOrderByIdQuery, useGetOrderItemsQuery, useGetOrderQuery } from "../../../redux/uniformService/OrderService";
import Swal from "sweetalert2";
import { PDFViewer } from "@react-pdf/renderer";
import PrintFormat from "./PrintFormat-PO";
import tw from "../../../Utils/tailwind-react-pdf";
import OrderPurchase from "./OrderPurchase";
import { useGetRequirementPlanningFormByIdQuery, useGetRequirementPlanningFormItemsQuery, useGetRequirementPlanningFormQuery } from "../../../redux/uniformService/RequirementPlanningFormServices";
import OrderDetailsSelection from "./OrderDetailsSelection";
import Modal from "../../../UiComponents/Modal";
import { Loader } from "../../../Basic/components";
import { useLazyGetExcessToleranceItemsQuery } from "../../../redux/services/ExcessToleranceServices";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices";
import { useGetTermsandCondtionsQuery } from "../../../redux/services/Term&ConditionsMasterService";
import PoSummary from "./PoSummary";
import GeneralYarnPoItems from "./GeneralYarnPoItems";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import { useGetBranchByIdQuery, useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetYarnCountsQuery, useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import PrintFormatGreyYarnPurchaseOrder from "./NewPrintFormat/index.js"
import { useReactToPrint } from "@etsoo/reactprint";
import NewModal from "../../../UiComponents/NewModal/index.js";
import YarnPurchaseOrderPrintFormat from "./PrintFormat-PO";
import useTaxDetailsHook from "../../../CustomHooks/TaxHookDetails/index.js";
import { groupBy } from "lodash";


const PurchaseOrderForm = ({ onClose, id, setId, readOnly, setReadOnly, docId, setDocId, poItems, setPoItems, tempPoItems, setTempPoItems, onNew , taxTypeList , supplierList , supplierDetails  , yarnList , uomList , colorList , termsData , branchList , hsnData  }) => {
 


  const today = new Date()


  const [date, setDate] = useState(moment.utc(today).format('YYYY-MM-DD'));
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [payTermId, setPayTermId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [poType, setPoType] = useState("Order Purchase");
  const [poMaterial, setPoMaterial] = useState("DyedYarn")
  const [supplierId, setSupplierId] = useState("");
  const [term, setTerm] = useState("")

  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [orderId, setOrderId] = useState("")
  const [remarks, setRemarks] = useState("")
  const [PurchaseType, setPurchaseType] = useState('General Purchase')
  const [summary, setSummary] = useState(false);


  const [deliveryType, setDeliveryType] = useState("")
  const [deliveryToId, setDeliveryToId] = useState("")
  const [showExtraCharge, setShowExtraCharge] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [tableDataView, setTableDataView] = useState(false)

  const [requirementId, setRequirementId] = useState("");


  const { branchId, userId, finYearId } = getCommonParams();
  const params = { branchId, userId, finYearId, poMaterial: poMaterial };



  // const componentRef = useRef();

  // const handlePrint = useReactToPrint({
  //   content: () => componentRef.current,
  //   documentTitle: docId,
  //   pageStyle: ` `
  // });

  const componentRef = useRef();



  const { data: requirementPlanningItemsData, isLoading: isRequirementLoading, isFetching: isRequirementFetching, refetch: RequirementRefetch } = useGetRequirementPlanningFormItemsQuery({ params });



  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPoByIdQuery(id, { skip: !id });



  const [addData] = useAddPoMutation();
  const [updateData] = useUpdatePoMutation();






  useEffect(() => {
    if (!requirementPlanningItemsData?.data) return;

    const filtered = requirementPlanningItemsData.data
      .filter(po => po.yarnType === poMaterial)
      .map(item => ({
        ...item,
        RequirementPlanningItemsId: item?.id,
        taxPercent: item?.Yarn?.Hsn?.tax,
        hsnId: item?.Yarn?.hsnId
      }));

    console.log(filtered, "filteredfiltered")

    // const Group = Object.values(
    //   filtered.reduce((acc, item) => {
    //     const key = `${item.orderId}-${item.yarnId}-${item.colorId}-${item.uomId}`;
    //     if (!acc[key]) acc[key] = { ...item };
    //     else
    //       acc[key].requiredQty =
    //         (parseFloat(acc[key].requiredQty || 0) + parseFloat(item.requiredQty || 0));
    //     return acc;
    //   }, {})
    // );

    const emptyCount = Math.max(15 - filtered.length, 0);

    const emptyRows = Array.from({ length: emptyCount }, () => ({
      RequirementPlanningItemsId: null,
      yarnType: '',
      qty: '',
      rate: '',
      amount: '',
    }));

    setTempPoItems([...filtered, ...emptyRows]);
  }, [isRequirementFetching, isRequirementLoading, poMaterial, requirementPlanningItemsData]);








  const { data: branchdata } = useGetBranchByIdQuery(branchId, { skip: !branchId });



  const syncFormWithDb = useCallback((data) => {


    // setReadOnly(true)


    setPoType(data?.poType ? data?.poType : "General Purchase");
    setDate(data?.createdAt
      ? moment.utc(data.createdAt).format("YYYY-MM-DD")
      : moment.utc(new Date()).format("YYYY-MM-DD")
    );
    setPoMaterial(data?.poMaterial ? data?.poMaterial : '')

    setPoItems(data?.PoItems ? data?.PoItems : []);
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
    setTerm(data?.termsAndCondtion ? data?.termsAndCondtion : "")
  }, [id]);




  useEffect(() => {
    if (id && singleData?.data) {
      syncFormWithDb(singleData.data);
    }
    //  else {
    //   syncFormWithDb(undefined);
    // }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);




  let data = {

    supplierId, dueDate, payTermId,
    branchId, id, userId,
    remarks,
    poItems: poItems?.filter(po => po.yarnId || po.fabricId || po.accessoryId || po.yarncategoryId),
    deliveryType, deliveryToId,
    discountType,
    discountValue,
    finYearId, orderId, PurchaseType, requirementId, poMaterial, poType, taxTemplateId, term
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
          if (nextProcess == "new") {
            // syncFormWithDb(undefined);
            onNew()
            RequirementRefetch()
          }
          if (nextProcess == "close") {
            // syncFormWithDb(undefined);
            onNew()
            onClose()
          }
          else {
            setId(returnData?.data?.id);
            RequirementRefetch()

          }
        }
        else {
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



  const dateRef = useRef(null);
  const inputPartyRef = useRef(null);
  const styleRef = useRef(null);

  useEffect(() => {
    if (dateRef.current && !id) {
      dateRef.current.focus();
    }
  }, []);

  const allSuppliers = supplierList ? supplierList.data : []

  function filterSupplier() {
    let finalSupplier = []
    if (poMaterial.toLowerCase().includes("yarn")) {
      finalSupplier = allSuppliers.filter(s => s.yarn)
    } else if (poMaterial.toLowerCase().includes("fabric")) {
      finalSupplier = allSuppliers.filter(s => s.fabric)
    } else {
      finalSupplier = allSuppliers.filter(s => s.PartyOnAccessoryItems?.length > 0)
    }
    return finalSupplier
  }
  let supplierListBasedOnSupply = filterSupplier()

  const { isLoading: isTaxHookDetailsLoading, ...taxDetails } = useTaxDetailsHook({ poItems: poItems, taxTypeId: taxTemplateId, discountType, discountValue })

  console.log(taxDetails, "useTaxDetailsHook")

  const taxGroupWise = groupBy(poItems, "taxPercent");

  const filtered = Object.fromEntries(
    Object.entries(taxGroupWise)
      .filter(([key]) => key && key !== 'undefined')
      .map(([key, arr]) => [key, arr.filter(item => item && item.yarnId)])
      .filter(([_, arr]) => arr.length > 0)
  );
  console.log(filtered, "filtered")

  const { data: deliveryToBranch } = useGetBranchByIdQuery(deliveryToId, { skip: deliveryType === "ToParty" })
  const { data: deliveryToSupplier } = useGetPartyByIdQuery(deliveryToId, { skip: deliveryType === "ToSelf" })

  let deliveryTo = deliveryType === "ToParty" ? deliveryToSupplier?.data : deliveryToBranch?.data;


  // if (isRequirementLoading || isRequirementFetching || isSingleFetching || isSingleLoading || isTaxLoading || isTaxfetching) return <Loader />




  return (

    <>

      <Modal
        isOpen={tableDataView && poType !== "General Purchase"}
        onClose={() => { setTableDataView(false); setPoItems([]); setSupplierId("") }}
        widthClass="  h-[82%] w-[92%]"
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
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <YarnPurchaseOrderPrintFormat
            isTaxHookDetailsLoading={isTaxHookDetailsLoading}

            branchData={branchdata?.data}
            data={id ? singleData?.data : "Null"}
            singleData={id ? singleData?.data : "Null"}
            date={id ? singleData?.data?.createdAt : date}
            docId={docId ? docId : ""}
            remarks={remarks}
            discountType={discountType}
            poType={poType}
            discountValue={discountValue}
            ref={componentRef}
            poNumber={docId} poDate={date} payTermId={payTermId}
            poItems={poItems?.filter(item => item?.yarnId)}
            supplierDetails={supplierDetails ? supplierDetails?.data : null}
            deliveryType={deliveryType}
            deliveryToId={deliveryToId}
            taxTemplateId={taxTemplateId}
            yarnList={yarnList} uomList={uomList} colorList={colorList}
            taxDetails={taxDetails}
            deliveryTo={deliveryTo}
            taxGroupWise={filtered}
            termsData={termsData}
            term={term}
          // termsAndCondition={termsAndCondition} payTermList={payTermList}

          />
        </PDFViewer>
      </Modal>
      {/* <div className="hidden">

          <PrintFormatGreyYarnPurchaseOrder
            remarks={remarks}
            discountType={discountType}
            poType={poType}
            discountValue={discountValue}
            ref={componentRef}
            poNumber={docId} poDate={date} dueDate={dueDate} payTermId={payTermId}
            poItems={poItems.filter(item => item.yarnId || item.accessoryId || item.fabricId)}
            supplierDetails={supplierDetails ? supplierDetails?.data : null}
            singleData={singleData ? singleData.data : null}
            deliveryType={deliveryType} deliveryToId={deliveryToId} taxTemplateId={taxTemplateId}
            yarnList={yarnList} uomList={uomList} colorList={colorList}
          />
      </div> */}

      <div className="w-full  mx-auto rounded-md shadow-lg px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Yarn Purchase Order</h1>
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
                nextRef={inputPartyRef}
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
                options={YarnMaterial}
                value={poMaterial}
                setValue={(value) => {
                  setPoMaterial(value);
                  setPoType("")
                  // fetchExcessToleranceItems({ params: params });

                }}
                required={true}
                readOnly={readOnly}
                disabled={orderId || id}
              />
              <DropdownInput name="Po Type"
                options={PoTypes}
                value={poType}
                setValue={(value) => { setPoType(value); }}

                required={true}
                readOnly={readOnly}
                disabled={orderId || id}
              />

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


              <div className="col-span-2"

              >

                <ReusableSearchableInput
                  label="Supplier Id"
                  component="PartyMaster"
                  placeholder="Search Supplier Id..."
                  optionList={supplierList?.data}
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
                disabled={true}
              />


              <TextInput
                name="Phone"
                placeholder="Contact name"
                value={findFromList(supplierId, supplierList?.data, "contactPersonNumber")}

                disabled={true}


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
                  <DropdownInput name="Delivery To" options={(deliveryType === "ToSelf") ? dropDownListObject(branchList ? branchList.data : [], "branchName", "id") : dropDownListObject(supplierListBasedOnSupply, "name", "id")} value={deliveryToId} setValue={setDeliveryToId} required={true} readOnly={readOnly} />
                  :

                  <DropdownInput name="Delivery To" options={dropDownListObject(supplierList?.data?.filter(val => val.isSupplier), "code", "id")} value={deliveryToId} setValue={setDeliveryToId} required={true} readOnly={readOnly} />
                }

              </div>










            </div>

          </div>







        </div>
        <fieldset className=''>
          {

            poType == "Order Purchase"
              ?
              <YarnPoItems id={id} transType={poType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly}
                poMaterial={poMaterial} hsnData={hsnData} setTableDataView={setTableDataView} supplierId={supplierId}

                yarnList={yarnList} uomList={uomList} colorList={colorList}

              />
              :
              <GeneralYarnPoItems id={id} transType={poType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} yarnList={yarnList} uomList={uomList} colorList={colorList}

                poMaterial={poMaterial} hsnData={hsnData} setTableDataView={setTableDataView} supplierId={supplierId}
              />


          }

        </fieldset>

        <div className="grid grid-cols-4 gap-3">

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">

            <div className="flex flex-col gap-2">
              <h2 className="font-bold text-slate-700 mb-2 text-base">Terms & Conditions</h2>

              <select
                value={term}
                onChange={e => {
                  setTerm(e.target.value)
                }}
                readOnly={readOnly}
                className="text-left h-15  w-full rounded py-1 border-2 border-gray-200 text-[13px]"

              >
                <option >
                </option>
                {(id ? termsData?.data : termsData?.data?.filter(item => item?.active))?.map((blend) =>
                  <option value={blend.id} key={blend.id}>
                    {blend?.termsAndCondition.substring(0, 50)}
                  </option>)}
              </select>
            </div>
          </div>





          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
            <textarea
              disabled={readOnly}
              className="w-full h-10 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
              value={findFromList(term, termsData?.data, "termsAndCondition")}
              onChange={e => setTerm(e.target.value)}
              placeholder="Select or type Terms & Conditions..."
            />
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
            <h2 className="font-medium text-slate-700 mb-2 text-base">Remarks</h2>
            <textarea
              readOnly={readOnly}
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value)
              }}
              className="w-full h-10 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder="Additional notes..."
            />
          </div>


          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
            <h2 className="font-bold text-slate-800 mb-2 text-base">
              Po Summary
            </h2>

            <button className="text-sm bg-sky-500 hover:text-white font-semibold hover:bg-sky-800 transition p-1 ml-5 rounded"
              onClick={() => {
                if (!taxTemplateId) {
                  toast.info("Please Select Tax Template !", { position: "top-center" })
                  return
                }
                setSummary(true)
              }}>
              View Po Summary
            </button>
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
            {/* <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm"
              onClick={() => {
                setPrintModalOpen(true)
              }}
            >
              <FaEye className="w-4 h-4 mr-2" />
              Preview
            </button> */}
            <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
              onClick={() => {
                // handlePrint()
                setPrintModalOpen(true)
              }}
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