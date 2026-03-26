import { useCallback, useEffect, useRef, useState } from "react";
import { findFromList, getCommonParams, isGridDatasValid, sumArray } from "../../../Utils/helper";
import { FaFileAlt } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { DateInput, DropdownInput, ReusableSearchableInput, TextAreaNew, TextInput } from "../../../Inputs";
import { directOrPo } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { toast } from "react-toastify";
import { FiChevronDown, FiChevronUp, FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import { useAddDirectInwardOrReturnMutation, useGetDirectInwardOrReturnByIdQuery, useUpdateDirectInwardOrReturnMutation } from "../../../redux/uniformService/DirectInwardOrReturnServices";
import moment from "moment";
import Swal from "sweetalert2";
import { useGetItemMasterQuery, useGetItemPriceListQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";
import QuotationItems from "./QuotationItems";
import { useAddQuotationMasterMutation, useAddQuotationMutation, useGetQuotationByIdQuery, useGetQuotationMasterByIdQuery, useUpdateQuotationMasterMutation, useUpdateQuotationMutation } from "../../../redux/uniformService/quotationServices";
import Modal from "../../../UiComponents/Modal";
import { PDFViewer } from "@react-pdf/renderer";
import PremiumSalesPrintFormat from "../ReusableComponents/PremiumSalesPrintFormat";
import ThermalSalesPrintFormat from "../ReusableComponents/ThermalSalesPrintFormat";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import CommonFormFooter from "../ReusableComponents/CommonFormFooter";
import { useGetpriceTemplateQuery } from "../../../redux/uniformService/priceTemplateService";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";



const Quotaion = ({ onClose, id, setId, docId, setDocId, date, setDate, readOnly, setReadOnly, transType, setTransType,
  dcNo, setDcNo, dcDate, setDcDate, customerId, setCustomerId, payTermId, setPayTermId, locationId, setLocationId, storeId, setStoreId, poInwardOrDirectInward, setPoInwardOrDirectInward, inwardItemSelection, setInwardItemSelection, onNew, branchList, locationData, supplierList, setQuoteItems, quoteItems,
  yarnList, colorList, uomList, termsData, term, setTerm


}) => {








  const [vehicleNo, setVehicleNo] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [remarks, setRemarks] = useState("")
  const [minimumAdvancePayment, setMinimumAdvancePayment] = useState("");
  const [isMinimumAdvanceManuallyEdited, setIsMinimumAdvanceManuallyEdited] = useState(false);
  const [searchValue, setSearchValue] = useState("")
  const [discountType, setDiscountType] = useState("")
  const [discountValue, setDiscountValue] = useState("")
  const [terms, setTerms] = useState("")
  const [taxMethod, setTaxMethod] = useState("WithoutTax")
  const [contextMenu, setContextMenu] = useState(false)
  const [barcodePrintOpen, setBarcodePrintOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [thermalPrintOpen, setThermalPrintOpen] = useState(false);
  const [isHeaderOpen, setIsHeaderOpen] = useState(true);



  const { branchId, companyId, userId, finYearId } = getCommonParams()


  const params = {
    branchId, companyId, userId, finYearId
  };


  console.log(quoteItems, "quoteItems")



  const { data: supplierDetails } =
    useGetPartyByIdQuery(customerId, { skip: !customerId });

  const { data: itemList } = useGetItemMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: hsnList } = useGetHsnMasterQuery({ params });
  const { data: itemPriceList } = useGetItemPriceListQuery({ params });
  const { data: priceTemplateList } = useGetpriceTemplateQuery({ params });


  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetQuotationByIdQuery(id, { skip: !id });

  const [addData] = useAddQuotationMutation();
  const [updateData] = useUpdateQuotationMutation();
  const [invalidateTagsDispatch] = useInvalidateTags();




  const FirstInputFocus = useRef(null);


  useEffect(() => {
    if (FirstInputFocus.current && !id) {
      FirstInputFocus.current.focus();
    }
  }, []);


  const syncFormWithDb = useCallback((data) => {
    console.log(data?.DirectItems, "data?.DirectItems")
    if (id) {
      if (!data) return;
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
    setQuoteItems(data?.QuotationItems ? data.QuotationItems : []);
    setCustomerId(data?.customerId ? data?.customerId : "")
    if (data?.docId) {
      setDocId(data?.docId)
    }
    if (data?.date) setDate(data?.date);
    setTerm(data?.termId ? String(data.termId) : "");
    setRemarks(data?.remarks || "");
    setTerms(data?.termsAndCondition || "");
    if (data?.minimumAdvancePayment !== null && data?.minimumAdvancePayment !== undefined && data?.minimumAdvancePayment !== "") {
      setMinimumAdvancePayment(String(data.minimumAdvancePayment));
      setIsMinimumAdvanceManuallyEdited(true);
    } else {
      setMinimumAdvancePayment("");
      setIsMinimumAdvanceManuallyEdited(false);
    }

  }, [id]);

  useEffect(() => {
    if (id && singleData?.data) {
      syncFormWithDb(singleData?.data);
    } else if (!id) {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    docId,
    poType: transType,
    poInwardOrDirectInward,
    supplierId: customerId, dcDate,
    payTermId,
    id, userId,
    storeId,
    quoteItems: quoteItems?.filter(i => i.itemId),
    discountType,
    discountValue,
    dcNo,
    remarks,
    minimumAdvancePayment,
    specialInstructions,
    vehicleNo,
    finYearId,
    locationId: locationId ? parseInt(locationId) : undefined,
    branchId,
    customerId,
    termId: term ? parseInt(term) : undefined,
    termsAndCondition: terms,
    taxMethod
  }

  console.log(data, "data")






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

    if (data?.customerId) {
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
        toast.error(returnData.message);
      } else {

        if (returnData.statusCode === 0) {
          Swal.fire({
            icon: 'success',
            title: `${text || 'Saved'} Successfully`,
          });
          invalidateTagsDispatch()

          if (nextProcess == "new" || nextProcess == "close") {
            syncFormWithDb(undefined);
            onNew()
          }
          else {
            setId(returnData?.data?.id);

          }




        } else {
          toast.error(returnData?.message);
        }

      }
    } catch (error) {
      console.log("handle");
    }
  };

  function removeItem(id) {
    setQuoteItems(directInwardItems => {
      let newItems = structuredClone(directInwardItems);
      newItems = newItems.filter(item => parseInt(item.poItemsId) !== parseInt(id))
      return newItems
    });
  }






  const saveData = (nextProcess) => {

    let mandatoryFields = ["itemId", "sizeId", "colorId", "uomId", "qty", "price"];

    if (!validateData(data)) {


      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "success",

      });
      return
    }
    if (!isGridDatasValid((data?.quoteItems)?.filter(i => i.itemId), false, mandatoryFields)) {
      Swal.fire({
        title: "Please fill all Quote Items Mandatory fields...!",
        icon: "warning",
      });
      return;
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
    let qty = quoteItems?.reduce((acc, curr) => { return acc + parseFloat(curr?.qty ? curr?.qty : 0) }, 0)
    return parseFloat(qty || 0).toFixed(3)
  }
  const calculateTotals = () => {
    return (
      quoteItems?.reduce(
        (acc, curr) => {
          const price = parseFloat(curr.price || 0);
          const qty = parseFloat(curr.qty || 0);
          const taxPercent = parseFloat(curr.taxPercent || 0);
          const taxMethod = curr.taxMethod || "Inclusive";

          const discountType = curr.discountType; // "Percentage" | "Flat"
          const discountValue = parseFloat(curr.discountValue || 0);

          const gross = price * qty;

          // ✅ Step 1: Apply Discount
          let discountedAmount = gross;

          if (discountType === "Percentage") {
            discountedAmount =
              gross - (gross * discountValue) / 100;
          } else if (discountType === "Flat") {
            discountedAmount = gross - discountValue;
          }

          // Prevent negative
          discountedAmount = Math.max(0, discountedAmount);

          let subTotal = 0;
          let taxAmount = 0;
          let netAmount = 0;

          // ✅ Step 2: Tax Calculation
          if (taxMethod === "Inclusive" && taxPercent > 0) {
            subTotal = discountedAmount / (1 + taxPercent / 100);
            taxAmount = discountedAmount - subTotal;
            netAmount = discountedAmount;
          } else {
            subTotal = discountedAmount;
            taxAmount = subTotal * (taxPercent / 100);
            netAmount = subTotal + taxAmount;
          }

          // ✅ Accumulate
          acc.subtotal += subTotal;
          acc.taxAmount += taxAmount;
          acc.netAmount += netAmount;

          return acc;
        },
        { subtotal: 0, taxAmount: 0, netAmount: 0 }
      ) || { subtotal: 0, taxAmount: 0, netAmount: 0 }
    );
  };

  const { subtotal, taxAmount, netAmount } = calculateTotals();
  const defaultMinimumAdvancePayment = (parseFloat(netAmount || 0) * 0.25).toFixed(2);
  const displayedMinimumAdvancePayment =
    id && readOnly && singleData?.data?.minimumAdvancePayment !== null && singleData?.data?.minimumAdvancePayment !== undefined && singleData?.data?.minimumAdvancePayment !== ""
      ? String(singleData.data.minimumAdvancePayment)
      : minimumAdvancePayment;


  console.log(netAmount, "netAmount", taxAmount, 'taxAmount')

  useEffect(() => {
    if (!isMinimumAdvanceManuallyEdited) {
      setMinimumAdvancePayment(defaultMinimumAdvancePayment);
    }
  }, [defaultMinimumAdvancePayment, isMinimumAdvanceManuallyEdited]);


  function isSupplierOutside() {
    if (supplierDetails) {
      return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
    }
    return false
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




  return (
    <>
      <Modal isOpen={printOpen} onClose={() => setPrintOpen(false)} widthClass="w-[95%] h-[95%]">
        <PDFViewer style={{ width: "100%", height: "90vh" }}>
          <PremiumSalesPrintFormat
            title="QUOTATION"
            docId={docId}
            date={date}
            branchData={findFromList(branchId, branchList?.data, "all")}
            customerData={supplierDetails?.data}
            items={quoteItems?.filter(i => i.itemId)}
            remarks={remarks}
            itemList={itemList?.data}
            sizeList={sizeList?.data}
            colorList={colorList?.data}
            uomList={uomList?.data}
            hsnList={hsnList?.data}
            taxMethod={taxMethod}
            isSupplierOutside={isSupplierOutside()}
          />
        </PDFViewer>
      </Modal>

      <Modal isOpen={thermalPrintOpen} onClose={() => setThermalPrintOpen(false)} widthClass="w-[300pt] h-[95%]">
        <PDFViewer style={{ width: "100%", height: "90vh" }}>
          <ThermalSalesPrintFormat
            title="QUOTATION"
            docId={docId}
            date={date}
            branchData={findFromList(branchId, branchList?.data, "all")}
            customerData={supplierDetails?.data}
            items={quoteItems?.filter(i => i.itemId)}
            remarks={remarks}
            itemList={itemList?.data}
            sizeList={sizeList?.data}
            colorList={colorList?.data}
            uomList={uomList?.data}
            hsnList={hsnList?.data}
          />
        </PDFViewer>
      </Modal>

      <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Estimate / Quotation</h1>
            {/* <button
              onClick={() => setIsHeaderOpen(!isHeaderOpen)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors text-indigo-600"
              title={isHeaderOpen ? "Collapse Header" : "Expand Header"}
            >
              {isHeaderOpen ? <FiChevronUp className="w-6 h-6" /> : <FiChevronDown className="w-6 h-6" />}
            </button> */}
          </div>
          <button
            onClick={onClose}
            className="text-indigo-600 hover:text-indigo-700"
            title="Open Report"
          >
            <FaFileAlt className="w-5 h-5" />
          </button>
        </div>

      </div>
      <div className="flex flex-col h-full mt-2 gap-2">
        <div className="border border-slate-200 bg-white rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setIsHeaderOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors"
          >
            <span className="font-medium text-slate-700 text-sm">Header Details</span>
            <FiChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isHeaderOpen ? "rotate-180" : "rotate-0"
                }`}
            />
          </button>

          <div
            className={`transition-all duration-300 ease-in-out ${isHeaderOpen
              ? "max-h-[600px] opacity-100 overflow-visible"
              : "max-h-0 opacity-0 overflow-hidden"
              }`}
          >
            <div className="px-2 pb-2 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 overflow-visible">

                {/* Basic Details */}
                <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                  <h2 className="font-medium text-slate-700 mb-2">Basic Details</h2>
                  <div className="grid grid-cols-2 gap-1">
                    <ReusableInput label="Quotation No" readOnly value={docId} />
                    <ReusableInput label="Quotation Date" value={date} type="date" required readOnly disabled />
                  </div>
                </div>

                {/* Customer Details */}
                <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-3 overflow-visible">
                  <h2 className="font-medium text-slate-700 mb-2">Customer Details</h2>
                  <div className="grid grid-cols-7 gap-1 overflow-visible">
                    <div className="col-span-3 overflow-visible">

                      <ReusableSearchableInput
                        label="Customer Name"
                        component="PartyMaster"
                        placeholder="Search Customer Name..."
                        optionList={supplierList?.data}
                        setSearchTerm={(value) => { setCustomerId(value) }}
                        searchTerm={customerId}
                        show={"isClient"}
                        required={true}
                        disabled={id}
                      />
                    </div>
                    <TextInput name="Phone Number" value={findFromList(customerId, supplierList?.data, "contactPersonNumber")} disabled required />
                    <div className="col-span-3">
                      <TextAreaNew
                        name="Address"
                        placeholder="Addres"
                        value={findFromList(customerId, supplierList?.data, "address")}
                        disabled
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        <QuotationItems
          quoteItems={quoteItems}
          setQuoteItems={setQuoteItems}
          setInwardItemSelection={setInwardItemSelection}
          supplierId={customerId}
          handleRightClick={handleRightClick}
          contextMenu={contextMenu}
          handleCloseContextMenu={handleCloseContextMenu}
          yarnList={yarnList}
          colorList={colorList}
          uomList={uomList}
          itemList={itemList}
          sizeList={sizeList}
          readOnly={readOnly}
          taxMethod={taxMethod}
          setTaxMethod={setTaxMethod}
          isHeaderOpen={isHeaderOpen}
          itemPriceList={itemPriceList}
          priceTemplateList={priceTemplateList}
        />

        <div className="grid grid-cols-12 gap-3">

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-2">

            <div className="flex flex-col gap-2">
              <h2 className="font-bold text-slate-700 mb-2 text-sm">Terms & Conditions</h2>

              <select
                value={term}
                onChange={e => {
                  setTerm(e.target.value)
                }}
                readOnly={readOnly}
                className="text-left h-15  w-full rounded py-1 border-2 border-gray-200 text-[13px]"

              >
                <option value=""></option>
                {(id ? termsData?.data : termsData?.data?.filter(item => item?.active))?.map((blend) =>
                  <option value={blend.id} key={blend.id}>
                    {blend?.name}
                  </option>
                )}
              </select>
            </div>
          </div>





          <div className="border border-slate-200 p-1 bg-white rounded-md shadow-sm col-span-4">
            <textarea
              disabled={readOnly}
              className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
              value={terms}
              onChange={e => setTerms(e.target.value)}
              placeholder="Select or type Terms & Conditions..."
            />
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm  col-span-3">
            <h2 className="font-bold text-slate-700 mb-2 text-sm">Remarks</h2>
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

          <div className=" p-2 bg-white rounded-md shadow-sm col-span-3">

            <div className="flex justify-between py-1 text-sm">
              <span className="text-slate-600">Total Qty</span>
              <span className="font-medium">{parseFloat(getTotalQty()).toFixed(3)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span className="text-slate-600">Before Tax Amount</span>
              <span className="font-medium">Rs.{parseFloat(subtotal || 0).toFixed(2)} </span>
            </div>
            {/* <div className="flex justify-between py-1 text-sm">
              <span className="text-slate-600">Tax Amount</span>
              <span className="font-medium">Rs.{parseFloat(taxAmount || 0).toFixed(2)}</span>
            </div> */}
            <div className="flex justify-between py-1 text-sm">
              <span className="text-slate-600">Net Amount</span>
              <span className="font-medium">Rs.{parseFloat(netAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 py-1 text-sm">
              <span className="text-slate-600">Minimum Advance</span>
              <input
                type="number"
                value={displayedMinimumAdvancePayment}
                onChange={(e) => {
                  setMinimumAdvancePayment(e.target.value);
                  setIsMinimumAdvanceManuallyEdited(true);
                }}
                readOnly={readOnly}
                className={`w-32 rounded border border-slate-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500 ${readOnly ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white"
                  }`}
              />
            </div>
          </div>
        </div>


        <div className="flex flex-col md:flex-row gap-2 justify-between mt-1">
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
              onClick={() => {
                if (id && singleData?.data?.minimumAdvancePayment !== null && singleData?.data?.minimumAdvancePayment !== undefined && singleData?.data?.minimumAdvancePayment !== "") {
                  setMinimumAdvancePayment(String(singleData.data.minimumAdvancePayment));
                  setIsMinimumAdvanceManuallyEdited(true);
                }
                setReadOnly(false);
              }}
            >
              <FiEdit2 className="w-4 h-4 mr-2" />
              Edit
            </button>

            <button
              className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
              onClick={() => {
                if (!quoteItems?.filter(i => i.itemId).length) {
                  Swal.fire({
                    icon: 'warning',
                    title: `Please add some items first`,
                  });
                  return;
                }
                setPrintOpen(true);
              }}
            >
              <FiPrinter className="w-4 h-4 mr-2" />
              Print
            </button>

            <button
              className="bg-orange-600 text-white px-4 py-1 rounded-md hover:bg-orange-700 flex items-center text-sm ml-2"
              onClick={() => {
                if (!quoteItems?.filter(i => i.itemId).length) {
                  // toast.warning("Please add some items first");
                  Swal.fire({
                    icon: 'warning',
                    title: `Please add some items first`,
                  });

                  return;
                }
                setThermalPrintOpen(true);
              }}
            >
              <FiPrinter className="w-4 h-4 mr-2" />
              Thermal Print
            </button>
          </div>
        </div>
      </div>



    </>
  );
}

export default Quotaion;
