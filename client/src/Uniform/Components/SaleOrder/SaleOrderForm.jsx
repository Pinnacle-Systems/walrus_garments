import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { findFromList, getCommonParams, sumArray } from "../../../Utils/helper";
import { ReusableInput } from "../Order/CommonInput";
import { DateInput, DropdownInput, ReusableSearchableInput, ReusableSearchableInputNewCustomerwithBranches, TextAreaNew, TextInput } from "../../../Inputs";
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
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import SaleOrderItems from "./SaleOrderItems";
import { useAddsaleOrderMutation, useGetsaleOrderByIdQuery, useUpdatesaleOrderMutation } from "../../../redux/uniformService/saleOrderServices";
import { useGetQuotationByIdQuery, useGetQuotationQuery } from "../../../redux/uniformService/quotationServices";
import Modal from "../../../UiComponents/Modal";
import { PDFViewer } from "@react-pdf/renderer";
import PremiumSalesPrintFormat from "../ReusableComponents/PremiumSalesPrintFormat";
import ThermalSalesPrintFormat from "../ReusableComponents/ThermalSalesPrintFormat";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import CommonFormFooter from "../ReusableComponents/CommonFormFooter";
import { push } from "../../../redux/features/opentabs";
import TransactionEntryShell from "../ReusableComponents/TransactionEntryShell";
import TransactionHeaderSection from "../ReusableComponents/TransactionHeaderSection";
import { areSalesRowsValid } from "../../../Utils/salesCatalogRules";
import { useGetoffersPromotionsQuery } from "../../../redux/uniformService/Offer&PromotionsService";
import ItemOfferModal from "../PointOfSale/components/ItemOfferModal";
import { calculateCartWithOffers, getPotentialOffers } from "../../../Utils/offerEngine";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import { useGetcollectionsQuery } from "../../../redux/uniformService/CollectionsService";



const SaleOrderForm = ({ onClose, id, setId, docId, setDocId, date, setDate, readOnly, setReadOnly, transType, setTransType,
  dcNo, setDcNo, dcDate, setDcDate, customerId, setCustomerId, payTermId, setPayTermId, locationId, setLocationId, storeId, setStoreId, poInwardOrDirectInward, setPoInwardOrDirectInward, inwardItemSelection, setInwardItemSelection, onNew, branchList, locationData, supplierList, setSaleOrderItems, saleOrderItems,
  yarnList, colorList, uomList, quoteId, sourceQuotationDocId, sourceQuotationAdvanceReceived = 0, sourceQuotationPackingChargeEnabled = false, sourceQuotationPackingCharge = "", sourceQuotationShippingChargeEnabled = false, sourceQuotationShippingCharge = "", termsData, invalidateTagsDispatch, dispatch


}) => {








  const [vehicleNo, setVehicleNo] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [remarks, setRemarks] = useState("")
  const [discountType, setDiscountType] = useState("")
  const [discountValue, setDiscountValue] = useState("")
  const [terms, setTerms] = useState("")
  const [packingChargeEnabled, setPackingChargeEnabled] = useState(false);
  const [packingCharge, setPackingCharge] = useState("");
  const [shippingChargeEnabled, setShippingChargeEnabled] = useState(false);
  const [shippingCharge, setShippingCharge] = useState("");
  const [contextMenu, setContextMenu] = useState(false)
  const [printOpen, setPrintOpen] = useState(false);
  const [thermalPrintOpen, setThermalPrintOpen] = useState(false);
  const [term, setTerm] = useState("")
  const [taxMethod, setTaxMethod] = useState("WithoutTax")
  const [isHeaderOpen, setIsHeaderOpen] = useState(true);
  const [selectedOffersByRow, setSelectedOffersByRow] = useState({});
  const [showItemOfferModal, setShowItemOfferModal] = useState(false);
  const [selectedItemForOffers, setSelectedItemForOffers] = useState(null);
  const [linkedQuoteId, setLinkedQuoteId] = useState(quoteId || "");

  const { branchId, companyId, userId, finYearId } = getCommonParams()
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

  const salesItemParams = { ...params, active: true };
  const { data: itemList } = useGetItemMasterQuery({ params: salesItemParams });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: hsnList } = useGetHsnMasterQuery({ params });
  const { data: itemPriceList } = useGetItemPriceListQuery({ params: salesItemParams });
  const { data: offersData } = useGetoffersPromotionsQuery({ params: { ...params, active: true } });
  const activeOffers = offersData?.data || [];

  const { data: collectionsData } = useGetcollectionsQuery({
    params: { branchId, userId, finYearId, active: true }
  })
  const { data: quotationList } = useGetQuotationQuery({ params });
  const { data: linkedQuotationData } = useGetQuotationByIdQuery(linkedQuoteId, { skip: !linkedQuoteId || id });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetsaleOrderByIdQuery(id, { skip: !id });
  const estimateDocId = singleData?.data?.Quotation?.docId || sourceQuotationDocId || findFromList(linkedQuoteId, quotationList?.data, "docId") || "";
  const advanceReceivedAmount = id
    ? (singleData?.data?.Quotation?.paymentData || []).reduce(
      (acc, curr) => acc + parseFloat(curr?.paidAmount || 0),
      0
    )
    : sourceQuotationAdvanceReceived;
  const shouldShowAdvanceReceived = Boolean(estimateDocId) && parseFloat(advanceReceivedAmount || 0) > 0;

  const [addData] = useAddsaleOrderMutation();
  const [updateData] = useUpdatesaleOrderMutation();



  const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();
  const {
    firstInputRef,
    secondInputRef,
    movedToNextSaveNewRef,
    saveNewButtonRef,
    saveCloseButtonRef,
  } = refs;


  const inwardTyperef = useRef(null);


  useEffect(() => {
    if (inwardTyperef.current && !id) {
      inwardTyperef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!id && !linkedQuoteId) {
      setTerm("");
      setPackingChargeEnabled(false);
      setPackingCharge("");
      setShippingChargeEnabled(false);
      setShippingCharge("");
    }
  }, [id, linkedQuoteId]);

  useEffect(() => {
    if (quoteId && String(linkedQuoteId || "") !== String(quoteId)) {
      setLinkedQuoteId(quoteId);
    }
  }, [linkedQuoteId, quoteId]);




  useEffect(() => {
    console.log("inside", linkedQuotationData)

    if (id || !linkedQuotationData?.data || !linkedQuoteId) return;

    console.log("inside", linkedQuotationData)

    const quoteData = linkedQuotationData.data;
    setCustomerId(quoteData.customerId || "");
    setSaleOrderItems((quoteData.QuotationItems || []).map((item) => ({
      ...item,
      quotationItemId: item.id,
    })));
    setPackingChargeEnabled(Boolean(quoteData?.packingChargeEnabled) || parseChargeAmount(quoteData?.packingCharge) > 0);
    setPackingCharge(quoteData?.packingChargeEnabled ? formatChargeValue(quoteData?.packingCharge) : "");
    setShippingChargeEnabled(Boolean(quoteData?.shippingChargeEnabled) || parseChargeAmount(quoteData?.shippingCharge) > 0);
    setShippingCharge(quoteData?.shippingChargeEnabled ? formatChargeValue(quoteData?.shippingCharge) : "");
  }, [id, linkedQuotationData, linkedQuoteId, setCustomerId, setSaleOrderItems]);





  useEffect(() => {
    if (!quoteId || id) {
      return;
    }

    const nextPackingCharge = formatChargeValue(sourceQuotationPackingCharge);
    const nextShippingCharge = formatChargeValue(sourceQuotationShippingCharge);
    const shouldEnablePacking = Boolean(sourceQuotationPackingChargeEnabled) || parseChargeAmount(nextPackingCharge) > 0;
    const shouldEnableShipping = Boolean(sourceQuotationShippingChargeEnabled) || parseChargeAmount(nextShippingCharge) > 0;

    setPackingChargeEnabled(shouldEnablePacking);
    setPackingCharge(shouldEnablePacking ? nextPackingCharge : "");
    setShippingChargeEnabled(shouldEnableShipping);
    setShippingCharge(shouldEnableShipping ? nextShippingCharge : "");
  }, [
    id,
    quoteId,
    sourceQuotationPackingCharge,
    sourceQuotationPackingChargeEnabled,
    sourceQuotationShippingCharge,
    sourceQuotationShippingChargeEnabled,
  ]);


  const syncFormWithDb = useCallback((data) => {
    const today = new Date()

    if (linkedQuoteId && !id) return

    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
    setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
    setCustomerId(data?.customerId ? data?.customerId : undefined)
    if (data?.docId) {
      setDocId(data?.docId)
    }
    if (data?.date) setDate(data?.date);
    setRemarks(data?.remarks || "");
    setTerms(data?.termsAndCondition || "");
    const nextPackingCharge = formatChargeValue(data?.packingCharge);
    const nextShippingCharge = formatChargeValue(data?.shippingCharge);
    setPackingCharge(nextPackingCharge);
    setShippingCharge(nextShippingCharge);
    setPackingChargeEnabled(Boolean(data?.packingChargeEnabled) || parseChargeAmount(nextPackingCharge) > 0);
    setShippingChargeEnabled(Boolean(data?.shippingChargeEnabled) || parseChargeAmount(nextShippingCharge) > 0);
    setSelectedOffersByRow(data?.selectedOffersByRow || {});
    setLinkedQuoteId(data?.quotationId || "")
    setSaleOrderItems(data?.SaleOrderItems ? data.SaleOrderItems : []);


  }, [id, linkedQuoteId]);

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
    saleOrderItems: saleOrderItems?.filter(i => i.itemId),
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
    quoteId: linkedQuoteId || undefined,
    terms,
    packingChargeEnabled,
    packingCharge: packingChargeEnabled ? String(parseChargeAmount(packingCharge).toFixed(2)) : "",
    shippingChargeEnabled,
    shippingCharge: shippingChargeEnabled ? String(parseChargeAmount(shippingCharge).toFixed(2)) : "",
    selectedOffersByRow,
    termsAndCondition: terms,
  }










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
      dispatch(push({ name: "SALE ORDER", projectId: null }))
      setLinkedQuoteId("")
      if (returnData.statusCode === 1) {
        // toast.error(returnData.message);
        Swal.fire({
          icon: 'error',
          title: returnData.message,
        });
      } else {


        if (returnData.statusCode === 0) {
          Swal.fire({
            icon: 'success',
            title: `${text || 'Saved'} Successfully`,

          });
          invalidateTagsDispatch()

          if (nextProcess == "new") {
            syncFormWithDb(undefined);
            onNew()
          } else {
            onClose()
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
    if (!areSalesRowsValid((data?.saleOrderItems)?.filter(i => i.itemId), itemList?.data, itemPriceList?.data)) {
      Swal.fire({
        title: "Please fill all Sale Order Items Mandatory fields...!",
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


  const potentialOffers = useMemo(() => getPotentialOffers(activeOffers, saleOrderItems || []), [activeOffers, saleOrderItems]);
  const { cartWithOffers: rawItemsWithOffers } = useMemo(() => calculateCartWithOffers(saleOrderItems || [], selectedOffersByRow, potentialOffers, activeOffers), [saleOrderItems, selectedOffersByRow, potentialOffers, activeOffers]);

  const saleOrderItemsWithOffers = useMemo(() => {
    let items = [...(rawItemsWithOffers || [])];
    const length = 20; // Standard placeholder row count
    if (items.length < length) {
      const padding = Array.from({ length: length - items.length }, () => ({
        itemId: "",
        qty: "0.00",
        tax: "0",
        colorId: "",
        uomId: "",
        price: "0.00",
        discountValue: "0.00",
        discountType: "",
        noOfBags: "0",
        weightPerBag: "0.00",
        id: '',
        poItemsId: "",
        taxMethod: "",
        barcode: "",
        barcodeType: "REGULAR"
      }));
      return [...items, ...padding];
    }
    return items;
  }, [rawItemsWithOffers]);

  const totalOfferDiscount = saleOrderItemsWithOffers.reduce((sum, item) => item.priceType === 'offerPrice' ? sum + Math.max(0, (parseFloat(item.salesPrice || item.price || 0) - parseFloat(item.price || 0)) * parseFloat(item.qty || 0)) : sum, 0);

  function getTotalQty() {
    let qty = saleOrderItemsWithOffers?.reduce((acc, curr) => { return acc + parseFloat(curr?.qty ? curr?.qty : 0) }, 0)
    return parseFloat(qty || 0).toFixed(3)
  }
  const calculateTotals = () => {
    return (
      saleOrderItemsWithOffers?.reduce(
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

  const customerPhone =
    supplierDetails?.data?.contactPersonNumber ||
    findFromList(customerId, supplierList?.data, "contactPersonNumber");

  const customerAddress =
    supplierDetails?.data?.address ||
    findFromList(customerId, supplierList?.data, "address");


  const summaryItems = [
    { label: "No", value: docId },
    { label: "Date", value: date },
    { label: "Estimate", value: estimateDocId },
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
        // {
        //   key: "promoDiscount",
        //   label: "Promo Discount",
        //   value: `Rs.${parseFloat(totalOfferDiscount || 0).toFixed(2)}`,
        //   summaryColumn: "right",
        //   className: "text-emerald-600 font-bold"
        // },
        ...chargeRows,
        {
          key: "netAmount",
          label: "Net Amount",
          value: `Rs.${parseFloat(adjustedNetAmount || 0).toFixed(2)}`,
          summaryColumn: "right",
          emphasized: true,
        },
        ...(shouldShowAdvanceReceived
          ? [
            {
              key: "advanceReceived",
              label: "Advance Received",
              value: `Rs.${parseFloat(advanceReceivedAmount || 0).toFixed(2)}`,
              summaryColumn: "left",
            },
          ]
          : []),
      ]}
      leftActions={
        <>
          <button onClick={() => saveData("new")}
            disabled={readOnly}
            className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
            <FiSave className="w-4 h-4 mr-2" />
            Save & New
          </button>
          <button onClick={() => saveData("close")}
            disabled={readOnly}
            className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
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
              if (!saleOrderItems?.filter(i => i.itemId).length) {
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
              if (saleOrderItems?.filter(i => i.itemId).length) {
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
        </>
      }
    />
  );

  return (
    <>
      <Modal isOpen={printOpen} onClose={() => setPrintOpen(false)} widthClass="w-[95%] h-[95%]">
        <PDFViewer style={{ width: "100%", height: "90vh" }}>
          <PremiumSalesPrintFormat
            title="SALE ORDER"
            subTittle="Sale Order"
            docId={docId}
            date={date}
            branchData={branchList?.data?.filter(i => i.id == branchId)}
            customerData={supplierDetails?.data}
            items={saleOrderItems?.filter(i => i.itemId)}
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
            title="SALE ORDER"
            docId={docId}
            date={date}
            branchData={findFromList(branchId, branchList?.data, "all")}
            customerData={supplierDetails?.data}
            items={saleOrderItems?.filter(i => i.itemId)}
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
        title="Sale Order"
        id={id}
        readOnly={readOnly}
        onClose={onClose}
        headerOpen={isHeaderOpen}
        setHeaderOpen={setIsHeaderOpen}
        summaryItems={summaryItems}
        openStateClassName="max-h-[600px] opacity-100 overflow-visible"
        footer={footerContent}
        headerContent={(
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 overflow-visible">

            <TransactionHeaderSection title="Basic Details" className="col-span-1" bodyClassName={`${estimateDocId ? "grid-cols-12" : "grid-cols-4"}`}>
              <div className={estimateDocId ? "col-span-3" : ""}>
                <ReusableInput label="Sale Order No" readOnly value={docId} />
              </div>
              <div className={estimateDocId ? "col-span-3" : ""}>
                <ReusableInput label="Sale Order Date" value={date} type="date" required readOnly disabled />
              </div>
              <div className={estimateDocId ? "col-span-6" : "col-span-2"}>
                <DropdownInput
                  name="Estimate No"
                  options={dropDownListObject(
                    id ? quotationList?.data : quotationList?.data?.filter((item) => item?.canConvertToSaleOrder || String(item?.id) === String(linkedQuoteId)),
                    "docId",
                    "id"
                  )}
                  value={linkedQuoteId}
                  setValue={setLinkedQuoteId}
                  clear
                  readOnly={Boolean(id) || readOnly}
                />
              </div>
            </TransactionHeaderSection>

            <TransactionHeaderSection title="Customer Details" className="col-span-2 overflow-visible" bodyClassName="grid-cols-7 gap-1 overflow-visible">
              <div className="col-span-3 overflow-visible">
                {/* <ReusableSearchableInput
                        label="Customer Name"
                        component="PartyMaster"
                        placeholder="Search Customer Name..."
                        optionList={supplierList?.data}
                        setSearchTerm={(value) => { setCustomerId(value) }}
                        searchTerm={customerId}
                        show={"isClient"}
                        required={true}
                        disabled={id}
                      /> */}
                <ReusableSearchableInputNewCustomerwithBranches
                  label="Customer Name"
                  component="PartyMaster"
                  placeholder="Search Customer Name..."
                  optionList={supplierList?.data}
                  setSearchTerm={(value) => { setCustomerId(value) }}
                  searchTerm={customerId}
                  show={"isClient"}
                  required={true}
                  disabled={id}
                  ref={firstInputRef}
                  nextRef={secondInputRef}
                />
              </div>
              <TextInput name="Phone Number" value={customerPhone} disabled required />
              <div className="col-span-3">
                <TextAreaNew
                  rows={1}
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
            <SaleOrderItems
              saleOrderItems={saleOrderItems}
              setSaleOrderItems={setSaleOrderItems}
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
              activeOffers={activeOffers}
              selectedOffersByRow={selectedOffersByRow}
              setSelectedOffersByRow={setSelectedOffersByRow}
              setSelectedItemForOffers={setSelectedItemForOffers}
              setShowItemOfferModal={setShowItemOfferModal}
            />
          </fieldset>
        </div>
      </TransactionEntryShell>

      <ItemOfferModal
        isOpen={showItemOfferModal}
        onClose={() => setShowItemOfferModal(false)}
        selectedItemForOffers={selectedItemForOffers}
        getItemApplicableOffers={(item) => {
          if (!item || !activeOffers.length) return [];
          const { getItemApplicableOffers } = require("../../../Utils/offerEngine");
          return getItemApplicableOffers(item, saleOrderItems, activeOffers, collectionsData);
        }}
        selectedOffersByRow={selectedOffersByRow}
        setSelectedOffersByRow={setSelectedOffersByRow}
        Swal={Swal}
      />
    </>
  );
}

export default SaleOrderForm;
