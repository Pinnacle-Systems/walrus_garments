import { useCallback, useEffect, useRef, useState } from "react";
import { findFromList, getCommonParams, isSalesTransactionItemsValid, resolveBarcodeGenerationMethod, sumArray } from "../../../Utils/helper";
import { ReusableInput } from "../Order/CommonInput";
import { DateInput, DropdownInput, ReusableSearchableInput, TextAreaNew, TextInput } from "../../../Inputs";
import { directOrPo } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { toast } from "react-toastify";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import { useAddDirectInwardOrReturnMutation, useGetDirectInwardOrReturnByIdQuery, useUpdateDirectInwardOrReturnMutation } from "../../../redux/uniformService/DirectInwardOrReturnServices";
import moment from "moment";
import Swal from "sweetalert2";
import { useGetItemMasterQuery, useGetItemPriceListQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetpriceTemplateQuery } from "../../../redux/uniformService/priceTemplateService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useAddQuotationMutation, useUpdateQuotationMutation } from "../../../redux/uniformService/quotationServices";
import SalesInvoiceItems from "./SalesInvoiceItems";
import { useAddSalesInvoiceMutation, useGetSalesInvoiceByIdQuery, useUpdateSalesInvoiceMutation } from "../../../redux/uniformService/salesInvoiceServices";
import { PDFViewer } from "@react-pdf/renderer";
import PremiumSalesPrintFormat from "../ReusableComponents/PremiumSalesPrintFormat";
import ThermalSalesPrintFormat from "../ReusableComponents/ThermalSalesPrintFormat";
import Modal from "../../../UiComponents/Modal";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import CommonFormFooter from "../ReusableComponents/CommonFormFooter";
import { push } from "../../../redux/features/opentabs";
import TransactionEntryShell from "../ReusableComponents/TransactionEntryShell";
import TransactionHeaderSection from "../ReusableComponents/TransactionHeaderSection";
import { useGetItemControlPanelMasterQuery } from "../../../redux/uniformService/ItemControlPanelService";



const SalesInvoiceForm = ({ onClose, id, setId, docId, setDocId, date, setDate, readOnly, setReadOnly, transType, setTransType,
  dcNo, setDcNo, dcDate, setDcDate, customerId, setCustomerId, payTermId, setPayTermId, locationId, setLocationId, storeId, setStoreId, poInwardOrDirectInward, setPoInwardOrDirectInward, inwardItemSelection, setInwardItemSelection, onNew, branchList, locationData, supplierList, setInvoiceItems, invoiceItems,
  yarnList, colorList, uomList, convertSaleOrderId, sourceSaleOrderDocId, sourceAdvanceReceived = 0, termsData, invalidateTagsDispatch ,dispatch


}) => {








  const [vehicleNo, setVehicleNo] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [remarks, setRemarks] = useState("")
  const [terms, setTerms] = useState("")
  const [term, setTerm] = useState("")
  const [packingChargeEnabled, setPackingChargeEnabled] = useState(false);
  const [packingCharge, setPackingCharge] = useState("");
  const [shippingChargeEnabled, setShippingChargeEnabled] = useState(false);
  const [shippingCharge, setShippingCharge] = useState("");
  const [searchValue, setSearchValue] = useState("")
  const [discountType, setDiscountType] = useState("")
  const [discountValue, setDiscountValue] = useState("")
  const [contextMenu, setContextMenu] = useState(false)
  const [barcodePrintOpen, setBarcodePrintOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [thermalPrintOpen, setThermalPrintOpen] = useState(false);
  const [taxMethod, setTaxMethod] = useState("WithoutTax")
  const [isHeaderOpen, setIsHeaderOpen] = useState(true);

  const [suppliers, setSuppliers] = useState([
    "Supplier One",
    "Supplier Two",
    "Supplier Three",
  ]);

  const childRecord = useRef(0);
  const { branchId, companyId, userId, finYearId } = getCommonParams()

  const branchIdFromApi = useRef(branchId);

  const params = {
    branchId, companyId, userId, finYearId
  };
  const parseChargeAmount = (value) => {
    const parsedValue = parseFloat(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  };
  const formatChargeValue = (value) => {
    if (value === "" || value === null || value === undefined) {
      return "";
    }
    return parseChargeAmount(value).toFixed(2);
  };






  const { data: supplierDetails } =
    useGetPartyByIdQuery(customerId, { skip: !customerId });

  const { data: itemList } = useGetItemMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: hsnList } = useGetHsnMasterQuery({ params });
  const { data: itemPriceList } = useGetItemPriceListQuery({ params });
  const { data: priceTemplateList } = useGetpriceTemplateQuery({ params });
  const { data: itemControlPanel } = useGetItemControlPanelMasterQuery({ params });
  const barcodeGenerationMethod = resolveBarcodeGenerationMethod(itemControlPanel?.data?.[0]);


  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetSalesInvoiceByIdQuery(id, { skip: !id });
  const saleOrderDocId = singleData?.data?.Saleorder?.docId || sourceSaleOrderDocId || "";
  const paymentReceivedAmount = id
    ? (singleData?.data?.Saleorder?.Quotation?.paymentData || []).reduce(
      (acc, curr) => acc + parseFloat(curr?.paidAmount || 0),
      0
    ) + (singleData?.data?.paymentData || []).reduce(
      (acc, curr) => acc + parseFloat(curr?.paidAmount || 0),
      0
    )
    : sourceAdvanceReceived;
  const shouldShowPaymentReceived = parseFloat(paymentReceivedAmount || 0) > 0;

  const [addData] = useAddSalesInvoiceMutation();
  const [updateData] = useUpdateSalesInvoiceMutation();




  const inwardTyperef = useRef(null);


  useEffect(() => {
    if (inwardTyperef.current && !id) {
      inwardTyperef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setTerm("");
      setPackingChargeEnabled(false);
      setPackingCharge("");
      setShippingChargeEnabled(false);
      setShippingCharge("");
    }
  }, [id]);


  const syncFormWithDb = useCallback((data) => {
    console.log(data?.DirectItems, "data?.DirectItems")
    const today = new Date()
    if (convertSaleOrderId && !id) return
    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
    setTransType(data?.poType ? data.poType : "DyedYarn");
    setPoInwardOrDirectInward(data?.poInwardOrDirectInward ? data?.poInwardOrDirectInward : "DirectInward")
    setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
    setInvoiceItems(data?.SalesInvoiceItems ? data.SalesInvoiceItems : []);
    if (data?.docId) {
      setDocId(data?.docId)
    }
    if (data?.date) setDate(data?.date);
    // setTaxTemplateId(data?.taxTemplateId ? data?.taxTemplateId : "");
    setPayTermId(data?.payTermId ? data?.payTermId : "");
    setCustomerId(data?.customerId ? data?.customerId : "");
    setDcDate(data?.dcDate ? moment.utc(data?.dcDate).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
    setDcNo(data?.dcNo ? data.dcNo : "")
    setLocationId(data?.branchId ? data?.branchId : "")
    setStoreId(data?.storeId ? data.storeId : "")
    setVehicleNo(data?.vehicleNo ? data?.vehicleNo : "")
    setSpecialInstructions(data?.specialInstructions ? data?.specialInstructions : "")
    setRemarks(data?.remarks ? data?.remarks : "")
    setTerms(data?.terms ? data?.terms : "")
    const nextPackingCharge = formatChargeValue(data?.packingCharge);
    const nextShippingCharge = formatChargeValue(data?.shippingCharge);
    setPackingCharge(nextPackingCharge);
    setShippingCharge(nextShippingCharge);
    setPackingChargeEnabled(Boolean(data?.packingChargeEnabled) || parseChargeAmount(nextPackingCharge) > 0);
    setShippingChargeEnabled(Boolean(data?.shippingChargeEnabled) || parseChargeAmount(nextShippingCharge) > 0);
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
    supplierId: customerId, dcDate,
    payTermId,
    id, userId,
    storeId,
    invoiceItems: invoiceItems?.filter(i => i.itemId),
    discountType,
    discountValue,
    dcNo,
    remarks,
    specialInstructions,
    vehicleNo,
    finYearId,
    locationId: locationId ? parseInt(locationId) : undefined,
    branchId,
    customerId,
    terms,
    saleOrderId: convertSaleOrderId,
    packingChargeEnabled,
    packingCharge: packingChargeEnabled ? String(parseChargeAmount(packingCharge).toFixed(2)) : "",
    shippingChargeEnabled,
    shippingCharge: shippingChargeEnabled ? String(parseChargeAmount(shippingCharge).toFixed(2)) : "",
  }

  console.log(convertSaleOrderId, "convertSaleOrderId")
  const validateData = (data) => {

    if (data?.customerId) {
      return true
    }

    return false
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


        if (returnData.statusCode === 0) {
          Swal.fire({
            icon: 'success',
            title: `${text || 'Saved'} Successfully`,

          });
          dispatch(push({ name: "SALES INVOICE", projectId: null }));
          invalidateTagsDispatch()
          if (nextProcess == "new") {
            syncFormWithDb(undefined);
            onNew()
          }
          else if (nextProcess == "close") {
            onClose()
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








  const saveData = (nextProcess) => {
    if (!validateData(data)) {


      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "success",

      });
      return
    }
    if (!isSalesTransactionItemsValid((data?.invoiceItems)?.filter(i => i.itemId), itemList?.data, barcodeGenerationMethod)) {
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
    let qty = invoiceItems?.reduce((acc, curr) => { return acc + parseFloat(curr?.qty ? curr?.qty : 0) }, 0)
    return parseFloat(qty || 0).toFixed(3)
  }
  const calculateTotals = () => {
    return (
      invoiceItems?.reduce(
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
  const extraCharges = (packingChargeEnabled ? parseChargeAmount(packingCharge) : 0) + (shippingChargeEnabled ? parseChargeAmount(shippingCharge) : 0);
  const adjustedNetAmount = netAmount + extraCharges;
  const chargeRows = [
    ...(packingChargeEnabled
      ? [{
          key: "packingCharge",
          label: "Packing Charge",
          summaryColumn: "right",
          renderValue: () => (
            <input
              type="number"
              value={packingCharge}
              onChange={(event) => setPackingCharge(event.target.value)}
              onBlur={() => setPackingCharge(formatChargeValue(packingCharge))}
              readOnly={readOnly}
              className={`h-7 w-24 rounded border border-slate-300 px-1.5 py-0 text-right text-[11px] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200 ${readOnly ? "cursor-not-allowed bg-slate-100 text-slate-500" : "bg-white"}`}
            />
          ),
        }]
      : []),
    ...(shippingChargeEnabled
      ? [{
          key: "shippingCharge",
          label: "Shipping Charge",
          summaryColumn: "right",
          renderValue: () => (
            <input
              type="number"
              value={shippingCharge}
              onChange={(event) => setShippingCharge(event.target.value)}
              onBlur={() => setShippingCharge(formatChargeValue(shippingCharge))}
              readOnly={readOnly}
              className={`h-7 w-24 rounded border border-slate-300 px-1.5 py-0 text-right text-[11px] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200 ${readOnly ? "cursor-not-allowed bg-slate-100 text-slate-500" : "bg-white"}`}
            />
          ),
        }]
      : []),
  ];

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

  const customerPhone =
    supplierDetails?.data?.contactPersonNumber ||
    findFromList(customerId, supplierList?.data, "contactPersonNumber");

  const customerAddress =
    supplierDetails?.data?.address ||
    findFromList(customerId, supplierList?.data, "address");


  const summaryItems = [
    { label: "No", value: docId },
    { label: "Date", value: date },
    { label: "Sale Order", value: saleOrderDocId },
    {
      label: "Customer",
      value:
        supplierDetails?.data?.name ||
        findFromList(customerId, supplierList?.data, "name") ||
        findFromList(customerId, supplierList?.data, "aliasName"),
    },
    { label: "Phone", value: customerPhone },
    { label: "Address", value: customerAddress },
  ];

  const handleTermTemplateChange = (value) => {
    setTerm(value);
  };

  const footerContent = (
    <CommonFormFooter
      remarks={remarks}
      setRemarks={setRemarks}
      terms={terms}
      setTerms={setTerms}
      readOnly={readOnly}
      showTermSelect
      termValue={term}
      onTermChange={handleTermTemplateChange}
      termOptions={((id ? termsData?.data : termsData?.data?.filter((item) => item?.active)) || []).map((blend) => ({
        value: blend.id,
        label: blend?.name,
        templateText: blend?.termsAndCondition || blend?.description || "",
      }))}
      chargeOptions={[
        {
          key: "packingChargeToggle",
          label: "Packing",
          checked: packingChargeEnabled,
          onToggle: (checked) => {
            setPackingChargeEnabled(checked);
            if (!checked) {
              setPackingCharge("");
            } else if (!packingCharge) {
              setPackingCharge("0.00");
            }
          },
        },
        {
          key: "shippingChargeToggle",
          label: "Shipping",
          checked: shippingChargeEnabled,
          onToggle: (checked) => {
            setShippingChargeEnabled(checked);
            if (!checked) {
              setShippingCharge("");
            } else if (!shippingCharge) {
              setShippingCharge("0.00");
            }
          },
        },
      ]}
      totalsRows={[
        {
          key: "totalQty",
          label: "Total Qty",
          value: parseFloat(getTotalQty()).toFixed(3),
          summaryColumn: "left",
        },
        {
          key: "beforeTaxAmount",
          label: "Gross Amount",
          value: `Rs.${parseFloat(subtotal || 0).toFixed(2)}`,
          summaryColumn: "right",
        },
        {
          key: "taxAmount",
          label: "Tax Amount",
          value: `Rs.${parseFloat(taxAmount || 0).toFixed(2)}`,
          summaryColumn: "right",
        },
        ...chargeRows,
        {
          key: "netAmount",
          label: "Net Amount",
          value: `Rs.${parseFloat(adjustedNetAmount || 0).toFixed(2)}`,
          summaryColumn: "right",
          emphasized: true,
        },
        ...(shouldShowPaymentReceived
          ? [
              {
                key: "paymentReceived",
                label: "Payment Received",
                value: `Rs.${parseFloat(paymentReceivedAmount || 0).toFixed(2)}`,
                summaryColumn: "left",
              },
            ]
          : []),
      ]}
      leftActions={
        <>
          <button onClick={() => saveData("new")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
            <FiSave className="w-4 h-4 mr-2" />
            Save & New
          </button>
          <button onClick={() => saveData("close")} className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
            <HiOutlineRefresh className="w-4 h-4 mr-2" />
            Save & Close
          </button>
        </>
      }
      rightActions={
        <>
          <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
            onClick={() => setReadOnly(false)}
          >
            <FiEdit2 className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
            onClick={() => {
              if (!invoiceItems?.filter(i => i.itemId).length) {
                toast.warning("Please add some items first");
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
              if (!invoiceItems?.filter(i => i.itemId).length) {
                toast.warning("Please add some items first");
                return;
              }
              setThermalPrintOpen(true);
            }}
          >
            <FiPrinter className="w-4 h-4 mr-2" />
            Thermal Print
          </button>
        </>
      }
    />
  );

  return (
    <>

      <Modal isOpen={printOpen} onClose={() => setPrintOpen(false)} widthClass="w-[95%] h-[95%]">
        <PDFViewer style={{ width: "100%", height: "90vh" }}>
          <PremiumSalesPrintFormat
            title="SALES INVOICE"
            docId={docId}
            date={date}
            branchData={findFromList(branchId, branchList?.data, "all")}
            customerData={supplierDetails?.data}
            items={invoiceItems?.filter(i => i.itemId)}
            remarks={remarks}
            itemList={itemList?.data}
            sizeList={sizeList?.data}
            colorList={colorList?.data}
            uomList={uomList?.data}
          />
        </PDFViewer>
      </Modal>

      <Modal isOpen={thermalPrintOpen} onClose={() => setThermalPrintOpen(false)} widthClass="w-[300pt] h-[95%]">
        <PDFViewer style={{ width: "100%", height: "90vh" }}>
          <ThermalSalesPrintFormat
            title="SALES INVOICE"
            docId={docId}
            date={date}
            branchData={findFromList(branchId, branchList?.data, "all")}
            customerData={supplierDetails?.data}
            items={invoiceItems?.filter(i => i.itemId)}
            remarks={remarks}
            itemList={itemList?.data}
            sizeList={sizeList?.data}
            colorList={colorList?.data}
            uomList={uomList?.data}
            hsnList={hsnList?.data}
          />
        </PDFViewer>
      </Modal>
      <TransactionEntryShell
        title="Sales Invoice"
        onClose={onClose}
        headerOpen={isHeaderOpen}
        setHeaderOpen={setIsHeaderOpen}
        summaryItems={summaryItems}
        openStateClassName="max-h-[600px] opacity-100 overflow-visible"
        footer={footerContent}
        headerContent={(
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 overflow-visible">

                <TransactionHeaderSection title="Basic Details" className="col-span-1" bodyClassName={`${saleOrderDocId ? "grid-cols-12" : "grid-cols-2"}`}>
                    <div className={saleOrderDocId ? "col-span-4" : ""}>
                      <ReusableInput label="Sales Invoice No" readOnly value={docId} />
                    </div>
                    <div className={saleOrderDocId ? "col-span-4" : ""}>
                      <ReusableInput label="Sales Invoice Date" value={date} type="date" required readOnly disabled />
                    </div>
                    {saleOrderDocId && (
                      <div className="col-span-4">
                        <ReusableInput label="Sale Order No" readOnly value={saleOrderDocId} />
                      </div>
                    )}
                </TransactionHeaderSection>

                <TransactionHeaderSection title="Customer Details" className="col-span-2 overflow-visible" bodyClassName="grid-cols-7 gap-1 overflow-visible">
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
                    <TextInput name="Phone Number" value={customerPhone} disabled required />
                    <div className="col-span-3">
                      <TextAreaNew
                        name="Address"
                        placeholder="Address"
                        value={customerAddress}
                        disabled
                      />
                    </div>
                </TransactionHeaderSection>

          </div>
        )}
      >
        <div className="min-h-0 flex-1 overflow-hidden">
          <fieldset className="h-full min-h-0">
            <SalesInvoiceItems
              invoiceItems={invoiceItems}
              setInvoiceItems={setInvoiceItems}
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
              barcodeGenerationMethod={barcodeGenerationMethod}
            />
          </fieldset>
        </div>
      </TransactionEntryShell>



    </>
  )
}
export default SalesInvoiceForm;
