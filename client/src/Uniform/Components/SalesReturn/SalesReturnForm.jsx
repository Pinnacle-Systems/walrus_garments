import { useCallback, useEffect, useRef, useState } from "react";
import { findFromList, getCommonParams, isGridDatasValid, sumArray } from "../../../Utils/helper";
import { ReusableInput } from "../Order/CommonInput";
import { DateInput, DropdownInput, ReusableSearchableInput, ReusableSearchableInputNewCustomerwithBranches, TextAreaNew, TextInput } from "../../../Inputs";
import { directOrPo } from "../../../Utils/DropdownData";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import CommonFormFooter from "../ReusableComponents/CommonFormFooter";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { toast } from "react-toastify";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import { useAddDirectInwardOrReturnMutation, useGetDirectInwardOrReturnByIdQuery, useUpdateDirectInwardOrReturnMutation } from "../../../redux/uniformService/DirectInwardOrReturnServices";
import moment from "moment";
import Swal from "sweetalert2";
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";
import { useAddSalesDeliveryMutation, useGetSalesDeliveryByIdQuery, useGetSalesDeliveryQuery, useUpdateSalesDeliveryMutation } from "../../../redux/uniformService/salesDeliveryServices";
import Modal from "../../../UiComponents/Modal";
import { PDFViewer } from "@react-pdf/renderer";
import PremiumSalesPrintFormat from "../ReusableComponents/PremiumSalesPrintFormat";
import ThermalSalesPrintFormat from "../ReusableComponents/ThermalSalesPrintFormat";
import SalesReturnItems from "./SalesReturnItems";
import { useAddSalesReturnMutation, useGetSalesReturnByIdQuery, useGetSalesReturnQuery, useUpdateSalesReturnMutation } from "../../../redux/uniformService/salesReturnServices";
import TransactionEntryShell from "../ReusableComponents/TransactionEntryShell";
import TransactionHeaderSection from "../ReusableComponents/TransactionHeaderSection";
import PosItemsSelection from "./posItemsSelection";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import SalesExchangeItems from "./SalesExchangeItems";



const SalesReturnForm = ({ onClose, id, setId, docId, setDocId, date, setDate, readOnly, setReadOnly, transType, setTransType,
  dcNo, setDcNo, dcDate, setDcDate, customerId, setCustomerId, payTermId, setPayTermId, locationId, setLocationId, storeId, setStoreId, poInwardOrDirectInward, setPoInwardOrDirectInward, inwardItemSelection, setInwardItemSelection, onNew, branchList, locationData, supplierList, setDeliveryItems, deliveryItems,
  yarnList, colorList, uomList, hsnList, setSalesDeliveryId, salesDeliveryId, termsData, convertSalesDeliveryId, invalidateTagsDispatch
  , deliveryId

}) => {








  const [vehicleNo, setVehicleNo] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [remarks, setRemarks] = useState("")
  const [terms, setTerms] = useState("")
  const [term, setTerm] = useState("")
  const [returnChargeEnabled, setReturnChargeEnabled] = useState(false);
  const [returnCharge, setReturnCharge] = useState("");
  const [returnChargeType, setReturnChargeType] = useState("Flat");
  const [searchValue, setSearchValue] = useState("")
  const [discountType, setDiscountType] = useState("")
  const [discountValue, setDiscountValue] = useState("")
  const [contextMenu, setContextMenu] = useState(false)
  const [barcodePrintOpen, setBarcodePrintOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [thermalPrintOpen, setThermalPrintOpen] = useState(false);
  const [isHeaderOpen, setIsHeaderOpen] = useState(true);
  const [linkedDeliveryId, setLinkedDeliveryId] = useState(convertSalesDeliveryId || "");
  const [salesType, setSalesType] = useState("Return");
  const [exchangeItems, setExchangeItems] = useState([]);



  const childRecord = useRef(0);
  const { branchId, companyId, userId, finYearId } = getCommonParams()

  const branchIdFromApi = useRef(branchId);

  const params = {
    branchId, companyId, userId, finYearId
  };
  const getWarehouseLocationId = useCallback(() => {
    const locations = locationData?.data || [];
    // Priority: Retail > Warehouse > First Active
    const retail = locations.find((location) => (
      String(location?.storeName || "").toLowerCase().includes("retail")
    ));
    if (retail) return retail.id;

    const warehouse = locations.find((location) => (
      String(location?.storeName || "").toLowerCase().includes("warehouse")
    ));
    if (warehouse) return warehouse.id;

    return locations.find(l => l.active)?.id || "";
  }, [locationData]);
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



  const { data: salesDeliveryData } =
    useGetSalesDeliveryQuery({ params: { ...params } });

  const { data: singleSalesDeliveryData } =
    useGetSalesDeliveryByIdQuery(salesDeliveryId, { skip: !salesDeliveryId });


  const { data: supplierDetails } =
    useGetPartyByIdQuery(customerId, { skip: !customerId });

  const salesItemParams = { ...params, active: true };
  const { data: itemList } = useGetItemMasterQuery({ params: salesItemParams });
  const { data: sizeList } = useGetSizeMasterQuery({ params });


  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetSalesReturnByIdQuery(id, { skip: !id });

  useEffect(() => {
    if (!id) {
      setTerm("");
      setReturnChargeEnabled(false);
      setReturnCharge("");
      setReturnChargeType("Flat");
    }
  }, [id]);

  useEffect(() => {
    if (id) return;
    const warehouseId = getWarehouseLocationId();
    if (warehouseId && String(storeId || "") !== String(warehouseId)) {
      setStoreId(warehouseId);
    }
  }, [getWarehouseLocationId, id, setStoreId, storeId]);



  const [addData] = useAddSalesReturnMutation();
  const [updateData] = useUpdateSalesReturnMutation();


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

  const handleFillItems = (selectedItems) => {
    const newItems = selectedItems.map(item => {
      const masterItem = itemList?.data?.find(i => i.id === (item.itemId || item.id));
      return {
        ...item,
        itemName: item.itemName || masterItem?.name,
        itemCode: item.itemCode || masterItem?.code,
        sizeName: item.sizeName || findFromList(item.sizeId, sizeList?.data, "name"),
        colorName: item.colorName || (colorList?.data ? findFromList(item.colorId, colorList?.data, "name") : ""),
        uomName: item.uomName || (uomList?.data ? findFromList(item.uomId, uomList?.data, "name") : ""),
        qty: item.qty,
        price: item.price || item.salesPrice,
        tax: item.tax || masterItem?.Hsn?.tax || 0,
      }
    });

    setDeliveryItems(newItems);
    setInwardItemSelection(false);
  }

  const handleDiscard = () => {
    Swal.fire({
      title: "Clear Form?",
      text: "This will remove all items and reset the current entry.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#f43f5e",
      confirmButtonText: "Yes, Clear All",
      cancelButtonText: "Cancel",
      background: "#ffffff",
      borderRadius: "16px",
    }).then((result) => {
      if (result.isConfirmed) {
        setDeliveryItems([]);
        setCustomerId(null);
        setSalesDeliveryId(null);
        setRemarks("");
        setTerms("");
        setTerm("");
        setReturnChargeEnabled(false);
        setReturnCharge("");
        setReturnChargeType("Flat");
        if (onNew) onNew();
        toast.success("Form cleared successfully");
      }
    });
  };


  const syncFormWithDb = useCallback((data) => {
    const today = new Date()
    setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));

    if (linkedDeliveryId) return;


    setDeliveryItems(data?.SalesReturnItems ? data.SalesReturnItems : []);
    if (data?.docId) {
      setDocId(data?.docId)
    }
    if (data?.date) setDate(data?.date);
    setPayTermId(data?.payTermId ? data?.payTermId : "");
    setCustomerId(data?.customerId ? data?.customerId : "");
    setSalesDeliveryId(data?.salesDeliveryId ? data?.salesDeliveryId : "");
    setDcDate(data?.dcDate ? moment.utc(data?.dcDate).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
    setDcNo(data?.dcNo ? data.dcNo : "")
    setLocationId(data?.branchId ? data?.branchId : "")
    setStoreId(data?.storeId ? data.storeId : "")
    setVehicleNo(data?.vehicleNo ? data?.vehicleNo : "")
    setSpecialInstructions(data?.specialInstructions ? data?.specialInstructions : "")
    setRemarks(data?.remarks ? data?.remarks : "")
    setTerms(data?.terms ? data?.terms : "")
    const nextReturnCharge = formatChargeValue(data?.returnCharge);
    setReturnCharge(nextReturnCharge);
    setReturnChargeEnabled(Boolean(data?.returnChargeEnabled) || parseChargeAmount(nextReturnCharge) > 0);
    setReturnChargeType(data?.returnChargeType ? data?.returnChargeType : "Flat");
    setSalesType(data?.returnType ? data?.returnType : "Return");
    setExchangeItems(data?.ExchangeItems || []);
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

  const calculateTotals = () => {
    return (
      deliveryItems?.reduce(
        (acc, curr) => {
          const price = parseFloat(curr?.price || 0);
          const qty = parseFloat(curr?.qty || 0);
          const taxPercent = parseFloat(curr?.taxPercent || 0);
          const taxMethod = curr?.taxMethod || "Inclusive";

          const discountType = curr?.discountType; // "Percentage" | "Flat"
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

  const data = {
    docId,
    poType: transType,
    poInwardOrDirectInward,
    supplierId: customerId,
    dcDate,
    payTermId,
    id,
    userId,
    storeId: getWarehouseLocationId(),
    deliveryItems: (deliveryItems || [])?.filter(i => i.itemId),
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
    salesDeliveryId,
    packingChargeEnabled: returnChargeEnabled,
    packingCharge: returnChargeEnabled
      ? String((returnChargeType === "Percentage" ? (netAmount * parseChargeAmount(returnCharge)) / 100 : parseChargeAmount(returnCharge)).toFixed(2))
      : "",
    shippingChargeEnabled: false,
    shippingCharge: "",
    salesType,
    exchangeItems: (exchangeItems || [])?.filter(i => i.itemId),
    returnChargeType,
    returnCharge,
    returnChargeEnabled
  };

  console.log(data, "data")
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
        Swal.fire({
          icon: "error",
          text: returnData?.message,

        });
      } else {
        Swal.fire({
          icon: 'success',
          title: `${text || 'Saved'} Successfully`,


        });
        setLinkedDeliveryId("")
        setId(null)
        invalidateTagsDispatch()
        dispatch(push({ name: "SALES RETURN", projectId: null }));

        if (returnData.statusCode === 0) {
          if (nextProcess == "new") {
            syncFormWithDb(undefined);
            onNew()
          }
          else {
            onClose()

          }




        } else {
          // toast.error(returnData?.message);
          Swal.fire({
            icon: "error",
            title: returnData?.message,
          });
        }

      }
    } catch (error) {
      console.log("handle");
    }
  };

  function removeItem(id) {
    setDeliveryItems(directInwardItems => {
      let newItems = structuredClone(directInwardItems);
      newItems = newItems.filter(item => parseInt(item.poItemsId) !== parseInt(id))
      return newItems
    });
  }






  const saveData = (nextProcess) => {
    const mandatoryFields = ["itemId", "uomId", "qty", "price"];
    const salesRows = (data?.deliveryItems || []).filter(i => i.itemId);
    const requiresLegacyAwareVariantFields = salesRows.some((row) => {
      const selectedItem = itemList?.data?.find((item) => String(item.id) === String(row.itemId));
      return !selectedItem?.isLegacy;
    });
    const finalMandatoryFields = requiresLegacyAwareVariantFields
      ? [...mandatoryFields, "sizeId", "colorId"]
      : mandatoryFields;

    if (!validateData(data)) {


      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "success",

      });
      return
    }
    if (!data?.storeId) {
      Swal.fire({
        title: "Return location not found",
        text: "Please configure an active retail or warehouse location before saving.",
        icon: "warning",
      });
      return;
    }
    if (!isGridDatasValid(salesRows, false, finalMandatoryFields)) {
      Swal.fire({
        title: "Please fill all Return Items Mandatory fields...!",
        icon: "warning",
      });
      return;
    }
    if (salesType === "Exchange") {
      const exchangeRows = (data?.exchangeItems || []).filter(i => i.itemId);
      if (!isGridDatasValid(exchangeRows, false, finalMandatoryFields)) {
        Swal.fire({
          title: "Please fill all Exchange Items Mandatory fields...!",
          icon: "warning",
        });
        return;
      }

      const { rawReturnNet, rawExchangeNet } = calculateTotals();

      if (Math.abs(rawReturnNet - rawExchangeNet) > 0.01) {
        Swal.fire({
          icon: "warning",
          title: "Exchange Value Mismatch",
          text: `The Exchange Total (₹${rawExchangeNet.toFixed(2)}) must exactly match the Return Total (₹${rawReturnNet.toFixed(2)}).`,
        });
        return;
      }
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return
    }
    if (nextProcess == "draft" && !id) {
      handleSubmitCustom(addData, { ...data, draftSave: true }, "Added", nextProcess);
    }


    else if (id && nextProcess == "draft") {

      handleSubmitCustom(updateData, { ...data, draftSave: true }, "Updated", nextProcess);
    }
    else if (id) {

      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  }

  function getTotalQty() {
    let qty = deliveryItems?.reduce((acc, curr) => { return acc + parseFloat(curr?.qty ? curr?.qty : 0) }, 0)
    if (salesType === "Exchange") {
      qty -= exchangeItems?.reduce((acc, curr) => { return acc + parseFloat(curr?.qty ? curr?.qty : 0) }, 0)
    }
    return parseFloat(qty || 0).toFixed(3)
  }

  const extraCharges = !returnChargeEnabled ? 0 : (
    returnChargeType === "Percentage"
      ? (netAmount * parseChargeAmount(returnCharge)) / 100
      : parseChargeAmount(returnCharge)
  );

  const adjustedNetAmount = netAmount + extraCharges;
  const chargeRows = [
    ...(returnChargeEnabled
      ? [{
        key: "returnCharge",
        label: "Return Charges",
        summaryColumn: "right",
        renderValue: () => (
          <div className="flex items-center gap-1">
            <select
              value={returnChargeType}
              onChange={(e) => setReturnChargeType(e.target.value)}
              disabled={readOnly}
              className={`h-7 rounded border border-slate-300 bg-white px-1 text-[11px] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200 ${readOnly ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""}`}
            >
              <option value="Flat">₹</option>
              <option value="Percentage">%</option>
            </select>
            <input
              type="number"
              value={returnCharge}
              onChange={(event) => setReturnCharge(event.target.value)}
              onBlur={() => setReturnCharge(formatChargeValue(returnCharge))}
              readOnly={readOnly}
              className={`h-7 w-16 rounded border border-slate-300 px-1.5 py-0 text-right text-[11px] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200 ${readOnly ? "cursor-not-allowed bg-slate-100 text-slate-500" : "bg-white"}`}
            />
          </div>
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

  const summaryItems = [
    { label: "No", value: docId },
    { label: "Date", value: date },
    {
      label: "Customer",
      value:
        supplierDetails?.data?.name ||
        findFromList(customerId, supplierList?.data, "name") ||
        findFromList(customerId, supplierList?.data, "aliasName"),
    },
    {
      label: "Phone",
      value:
        supplierDetails?.data?.contactPersonNumber ||
        findFromList(customerId, supplierList?.data, "contactPersonNumber"),
    },
    {
      label: "Address",
      value:
        supplierDetails?.data?.address ||
        findFromList(customerId, supplierList?.data, "address"),
    },
    {
      label: "Delivery",
      value: findFromList(salesDeliveryId, salesDeliveryData?.data, "docId"),
    },
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
          key: "returnChargeToggle",
          label: "Return Charges",
          checked: returnChargeEnabled,
          onToggle: (checked) => {
            setReturnChargeEnabled(checked);
            if (!checked) {
              setReturnCharge("");
              setReturnChargeType("Flat");
            } else if (!returnCharge) {
              setReturnCharge("0.00");
            }
          },
        },
      ]}
      totalsRows={[
        {
          key: "totalQty",
          label: "Total Quantity",
          value: getTotalQty() || 0,
          summaryColumn: "left",
        },
        {
          key: "subtotal",
          label: "Gross Amount",
          value: `₹${(subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          summaryColumn: "right",
        },
        {
          key: "taxAmount",
          label: "GST Amount",
          value: `₹${(taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          summaryColumn: "right",
        },
        ...chargeRows,
        {
          key: "netAmount",
          label: "Net Amount",
          value: `₹${(adjustedNetAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          emphasized: true,
          summaryColumn: "right",
        },
      ]}
      leftActions={
        <div className="flex items-center gap-2">
          {/* <button
            onClick={handleDiscard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-[11px] font-bold hover:bg-red-50 transition-all shadow-sm active:scale-95"
          >
            <HiOutlineRefresh className="w-3.5 h-3.5" />
            Clear All
          </button> */}
          <button onClick={() => saveData("new")} className="bg-indigo-500 text-white px-4 py-1.5 rounded-md hover:bg-indigo-600 flex items-center text-sm font-medium transition-all shadow-sm active:scale-95">
            <FiSave className="mr-1.5" /> Save & New
          </button>
          <button onClick={() => saveData("close")} className="bg-indigo-700 text-white px-4 py-1.5 rounded-md hover:bg-indigo-800 flex items-center text-sm font-medium transition-all shadow-sm active:scale-95">
            <FiSave className="mr-1.5" /> Save & Close
          </button>
        </div>
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
              if (!deliveryItems?.filter(i => i.itemId).length) {
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
              if (!deliveryItems?.filter(i => i.itemId).length) {
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
            title="SALES RETURN"
            subTitle="Sales Return" docId={docId}
            date={date}
            branchData={findFromList(branchId, branchList?.data, "all")}
            customerData={supplierDetails?.data}
            items={deliveryItems?.filter(i => i.itemId)}
            remarks={remarks}
            itemList={itemList?.data}
            sizeList={sizeList?.data}
            colorList={colorList?.data}
            uomList={uomList?.data}
            hsnList={hsnList?.data}
          />
        </PDFViewer>
      </Modal>

      <Modal isOpen={thermalPrintOpen} onClose={() => setThermalPrintOpen(false)} widthClass="w-[300pt] h-[95%]">
        <PDFViewer style={{ width: "100%", height: "90vh" }}>
          <ThermalSalesPrintFormat
            title="SALES RETURN"
            subTitle="Sales Return"

            docId={docId}
            date={date}
            branchData={findFromList(branchId, branchList?.data, "all")}
            customerData={supplierDetails?.data}
            items={deliveryItems?.filter(i => i.itemId)}
            remarks={remarks}
            itemList={itemList?.data}
            sizeList={sizeList?.data}
            colorList={colorList?.data}
            uomList={uomList?.data}
            hsnList={hsnList?.data}
          />
        </PDFViewer>
      </Modal>
      <Modal isOpen={inwardItemSelection}
        onClose={() => setInwardItemSelection(false)}
        widthClass={"w-[95%] h-[90%] py-10"}>
        <PosItemsSelection
          returnType="SalesReturn"
          singleSalesDeliveryData={singleSalesDeliveryData}
          handleFillItems={handleFillItems}
          setInwardItemSelection={setInwardItemSelection}
          itemList={itemList}
          colorList={colorList}
          sizeList={sizeList}
          findFromList={findFromList}
        />

      </Modal>
      <TransactionEntryShell
        title="Sales Return"
        id={id}
        readOnly={readOnly}
        onClose={onClose}
        headerOpen={isHeaderOpen}
        setHeaderOpen={setIsHeaderOpen}
        summaryItems={summaryItems}
        openStateClassName="max-h-[420px] opacity-100 overflow-visible"
        footer={footerContent}
        headerContent={(
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">

            <TransactionHeaderSection title="Basic Details" className="col-span-1" bodyClassName="grid-cols-3">
              <ReusableInput label="Sales Return No" readOnly value={docId} />
              <ReusableInput label="Sales Return Date" value={date} type={"date"} required={true} readOnly={true} disabled />
              <div className="col-span-1">
                <DropdownInput
                  name="Return Type"
                  options={[
                    { value: "Return", show: "Return" },
                    // { value: "Exchange", show: "Exchange" }
                  ]}
                  value={salesType}
                  setValue={setSalesType}
                  readOnly={readOnly || id}
                  required={true}
                />
              </div>
            </TransactionHeaderSection>

            <TransactionHeaderSection title="Customer Details" className="col-span-2 overflow-visible" bodyClassName="grid-cols-7 gap-1 overflow-visible">


              <div className="col-span-3 overflow-visible">
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

              <div className="col-span-1">
                <DropdownInput name="Sales Delivery No"
                  options={dropDownListObject(
                    id
                      ? salesDeliveryData?.data
                      : salesDeliveryData?.data?.filter(i => i.customerId == customerId && i?.canConvertToReturn),
                    "docId",
                    "id"
                  )}
                  value={salesDeliveryId} setValue={setSalesDeliveryId} required={true} readOnly={id || readOnly} />
              </div>


              <div className="w-28 mt-7">
                <button
                  className="flex items-center gap-1 px-1 py-[1px] text-[10px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 focus:outline-none focus:ring-1 focus:ring-indigo-300 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setInwardItemSelection(true);
                    }
                  }}
                  disabled={!customerId || id}
                  onClick={() => {
                    if (!customerId) {
                      Swal.fire({
                        icon: "warning",
                        title: "Choose Customer",
                      });
                      return;
                    }
                    if (!salesDeliveryId) {
                      Swal.fire({
                        icon: "warning",
                        title: "Select Sales Order No",
                      });
                      return;
                    }
                    setInwardItemSelection(true);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
                  </svg>

                  Fill Delivery Items
                </button>

              </div>
            </TransactionHeaderSection>



          </div>
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className={`h-full flex ${salesType === "Exchange" ? "flex-col gap-4" : "flex-col"}`}>
            <div className={salesType === "Exchange" ? "h-1/2" : "h-full"}>
              <SalesReturnItems
                title={salesType === "Exchange" ? "Return Items" : ""}
                type="Return"
                deliveryItems={deliveryItems} setDeliveryItems={setDeliveryItems} setInwardItemSelection={setInwardItemSelection} supplierId={customerId} handleRightClick={handleRightClick} contextMenu={contextMenu}
                handleCloseContextMenu={handleCloseContextMenu} yarnList={yarnList} colorList={colorList} uomList={uomList}
                itemList={itemList} sizeList={sizeList}
                handlers={handlers} movedToNextSaveNewRef={movedToNextSaveNewRef}
              />
            </div>
            {salesType === "Exchange" && (
              <div className="h-1/2">
                <SalesExchangeItems
                  title="Exchange Items"
                  deliveryItems={exchangeItems} setDeliveryItems={setExchangeItems} setInwardItemSelection={setInwardItemSelection} supplierId={customerId} handleRightClick={(e, index) => handleRightClick(e, index, "exchange")} contextMenu={contextMenu}
                  handleCloseContextMenu={handleCloseContextMenu} yarnList={yarnList} colorList={colorList} uomList={uomList}
                  itemList={itemList} sizeList={sizeList}
                  handlers={handlers} movedToNextSaveNewRef={movedToNextSaveNewRef}
                />
              </div>
            )}
          </div>
        </div>
      </TransactionEntryShell>
    </>
  );
}

export default SalesReturnForm;
