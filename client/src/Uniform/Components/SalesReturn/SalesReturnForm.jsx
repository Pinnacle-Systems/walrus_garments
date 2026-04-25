// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { findFromList, getCommonParams, isGridDatasValid, sumArray } from "../../../Utils/helper";
// import { ReusableInput } from "../Order/CommonInput";
// import { DateInput, DropdownInput, ReusableSearchableInput, TextAreaNew, TextInput, TextInputNew } from "../../../Inputs";
// import { directOrPo } from "../../../Utils/DropdownData";
// import { dropDownListObject } from "../../../Utils/contructObject";
// import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
// import CommonFormFooter from "../ReusableComponents/CommonFormFooter";
// import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
// import { toast } from "react-toastify";
// import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
// import { HiOutlineRefresh, HiX } from "react-icons/hi";
// import { useAddDirectInwardOrReturnMutation, useGetDirectInwardOrReturnByIdQuery, useUpdateDirectInwardOrReturnMutation } from "../../../redux/uniformService/DirectInwardOrReturnServices";
// import moment from "moment";
// import Swal from "sweetalert2";
// import { useGetItemMasterQuery, useGetItemPriceListQuery } from "../../../redux/uniformService/ItemMasterService";
// import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";
// import { useAddSalesDeliveryMutation, useGetSalesDeliveryByIdQuery, useGetSalesDeliveryQuery, useUpdateSalesDeliveryMutation } from "../../../redux/uniformService/salesDeliveryServices";
// import Modal from "../../../UiComponents/Modal";
// import { PDFViewer } from "@react-pdf/renderer";
// import PremiumSalesPrintFormat from "../ReusableComponents/PremiumSalesPrintFormat";
// import ThermalSalesPrintFormat from "../ReusableComponents/ThermalSalesPrintFormat";
// import SalesReturnItems from "./SalesReturnItems";
// import { useAddSalesReturnMutation, useGetSalesReturnByIdQuery, useGetSalesReturnQuery, useUpdateSalesReturnMutation } from "../../../redux/uniformService/salesReturnServices";
// import { useGetPointOfSalesByIdQuery, useGetPointOfSalesQuery, useLazyCheckReferenceNumberQuery } from "../../../redux/uniformService/PointOfSalesService";
// import { useGetoffersPromotionsQuery } from "../../../redux/uniformService/Offer&PromotionsService";
// import { useGetEmployeeQuery } from "../../../redux/services/EmployeeMasterService";
// import { useLazyGetUnifiedStockByBarcodeQuery } from "../../../redux/services/StockService";
// import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
// import TransactionEntryShell from "../ReusableComponents/TransactionEntryShell";
// import TransactionHeaderSection from "../ReusableComponents/TransactionHeaderSection";
// import PosSalesReturnItems from "./PosSalesReturnItems";
// import PosItemsSelection from "./posItemsSelection";
// import SalesPersonModal from "../PointOfSale/components/SalesPersonModal";
// import PaymentModal from "../PointOfSale/components/PaymentModal";
// import BarcodeResolutionModal from "../PointOfSale/components/BarcodeResolutionModal";
// import { findDefaultPriceRow, normalizeLocalItemForPos } from "../PointOfSale/utils/posHelpers";
// import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
// import ItemOfferModal from "../PointOfSale/components/ItemOfferModal";



// const SalesReturnForm = ({ onClose, id, setId, docId, setDocId, date, setDate, readOnly, setReadOnly, transType, setTransType,
//   dcNo, setDcNo, dcDate, setDcDate, customerId, setCustomerId, payTermId, setPayTermId, locationId, setLocationId, storeId, setStoreId, poInwardOrDirectInward, setPoInwardOrDirectInward, inwardItemSelection, setInwardItemSelection, onNew, branchList, locationData, supplierList, setDeliveryItems, deliveryItems,
//   yarnList, colorList, uomList, hsnList, setSalesDeliveryId, salesDeliveryId, termsData,
//   returnType, setReturnType, posId, setPosId,
//   exchangeItems, setExchangeItems


// }) => {








//   const [vehicleNo, setVehicleNo] = useState("")
//   const [specialInstructions, setSpecialInstructions] = useState('')
//   const [remarks, setRemarks] = useState("")
//   const [terms, setTerms] = useState("")
//   const [term, setTerm] = useState("")
//   const [packingChargeEnabled, setPackingChargeEnabled] = useState(false);
//   const [packingCharge, setPackingCharge] = useState("");
//   const [shippingChargeEnabled, setShippingChargeEnabled] = useState(false);
//   const [shippingCharge, setShippingCharge] = useState("");
//   const [searchValue, setSearchValue] = useState("")
//   const [discountType, setDiscountType] = useState("")
//   const [discountValue, setDiscountValue] = useState("")
//   const [contextMenu, setContextMenu] = useState(false)
//   const [barcodePrintOpen, setBarcodePrintOpen] = useState(false);
//   const [printOpen, setPrintOpen] = useState(false);
//   const [thermalPrintOpen, setThermalPrintOpen] = useState(false);
//   const [isHeaderOpen, setIsHeaderOpen] = useState(true);



//   const childRecord = useRef(0);
//   const { branchId, companyId, userId, finYearId } = getCommonParams()

//   const branchIdFromApi = useRef(branchId);

//   const params = {
//     branchId, companyId, userId, finYearId
//   };
//   const parseChargeAmount = (value) => {
//     const parsedValue = parseFloat(value);
//     return Number.isFinite(parsedValue) ? parsedValue : 0;
//   };
//   const formatChargeValue = (value) => {
//     if (value === "" || value === null || value === undefined) {
//       return "";
//     }
//     return parseChargeAmount(value).toFixed(2);
//   };



//   const { data: salesDeliveryData } =
//     useGetSalesDeliveryQuery({ params: { ...params } });

//   const { data: singleSalesDeliveryData } =
//     useGetSalesDeliveryByIdQuery(salesDeliveryId, { skip: !salesDeliveryId || returnType !== "Bulk Sales" });


//   const { data: singlePosData } =
//     useGetPointOfSalesByIdQuery(posId, { skip: !posId || returnType !== "Pos" });

//   const { data: posData } = useGetPointOfSalesQuery({ params: { ...params } });


//   const { data: locationsData } = useGetLocationMasterQuery({ params: { branchId, companyId } });
//   const locations = locationsData?.data || [];

//   useEffect(() => {
//     if (locations.length > 0 && !storeId) {
//       const retailLoc = locations.find(l => l.storeName?.toLowerCase().includes('retail'));
//       if (retailLoc) {
//         setStoreId(retailLoc.id);
//       }
//     }
//   }, [locations, storeId, setStoreId]);

//   const { data: supplierDetails } =
//     useGetPartyByIdQuery(customerId, { skip: !customerId });

//   const salesItemParams = { ...params, active: true };
//   const { data: itemList } = useGetItemMasterQuery({ params: salesItemParams });
//   const { data: ItemPriceListData } = useGetItemPriceListQuery({ params: { branchId, userId, finYearId } });
//   const { data: sizeList } = useGetSizeMasterQuery({ params });


//   const {
//     data: singleData,
//     isFetching: isSingleFetching,
//     isLoading: isSingleLoading,
//   } = useGetSalesReturnByIdQuery(id, { skip: !id });

//   useEffect(() => {
//     if (!id) {
//       setTerm("");
//       setPackingChargeEnabled(false);
//       setPackingCharge("");
//       setShippingChargeEnabled(false);
//       setShippingCharge("");
//     }
//   }, [id]);



//   const [addData] = useAddSalesReturnMutation();
//   const [updateData] = useUpdateSalesReturnMutation();




//   const inwardTyperef = useRef(null);


//   const [showSalesPersonModal, setShowSalesPersonModal] = useState(false);
//   const [salesPersonBarcode, setSalesPersonBarcode] = useState('');
//   const [exchangeSearchQuery, setExchangeSearchQuery] = useState('');
//   const salesPersonScannerRef = useRef(null);
//   const exchangeScannerRef = useRef(null);

//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [paidCash, setPaidCash] = useState(0);
//   const [paidUPI, setPaidUPI] = useState(0);
//   const [paidCard, setPaidCard] = useState(0);
//   const [paidOnline, setPaidOnline] = useState(0);
//   const [upiRefNo, setUpiRefNo] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState("Cash");

//   const [activeRowIndex, setActiveRowIndex] = useState(0);
//   const [selectedOffersByRow, setSelectedOffersByRow] = useState({});
//   const [showItemOfferModal, setShowItemOfferModal] = useState(false);
//   const [selectedItemForOffers, setSelectedItemForOffers] = useState(null);

//   const [barcodeResolution, setBarcodeResolution] = useState({ open: false, matches: [], resolve: null });

//   const resolveBarcodeMatch = (matches = []) => {
//     return new Promise((resolve) => {
//       setBarcodeResolution({
//         open: true,
//         matches: matches.map(m => ({
//           ...m,
//           item_name: m.item_name || m?.Item?.name || "Item",
//           size: m.size || m?.Size?.name || "-",
//           color: m.color || m?.Color?.name || "-",
//           location: m.location || "-",
//           stockQty: m.stockQty || 0,
//           storeId: m.storeId || m.locationId
//         })),
//         resolve
//       });
//     });
//   };

//   const { data: employeeData } = useGetEmployeeQuery({
//     params: { branchId, userId, companyId, finYearId }
//   });
//   const employees = employeeData?.data || [];

//   const [getStockByBarcode, { isLoading: isBarcodeLoading }] = useLazyGetUnifiedStockByBarcodeQuery();

//   const { data: offersData } = useGetoffersPromotionsQuery({ params: { branchId, active: true } });
//   const activeOffers = offersData?.data || [];

//   const potentialOffers = useMemo(() => {
//     if (!exchangeItems.length || !activeOffers.length) return [];
//     const potential = [];
//     activeOffers.forEach(off => {
//       const inScopeItems = (exchangeItems || []).filter(item => {
//         if (item.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;
//         if (off.scopeMode === 'Global') return true;
//         if (off.scopeMode === 'Item' || off.scopeMode === 'Collection') return off.OfferScope?.some(s => s.refId === (item.itemId || item.id));
//         return false;
//       });
//       if (!inScopeItems.length) return;
//       const scopeQty = inScopeItems.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0);
//       const scopeValue = inScopeItems.reduce((sum, i) => sum + ((parseFloat(i.salesPrice || i.price) || 0) * (parseFloat(i.qty) || 0)), 0);
//       const rules = off.OfferRule?.[0]?.conditions?.rules || [];
//       const results = rules.map(rule => {
//         const target = rule.field === 'Minimum Quantity' ? scopeQty : (rule.field === 'Cart Value' ? scopeValue : 0);
//         if (rule.operator === '>=') return target >= parseFloat(rule.value);
//         if (rule.operator === '<=') return target <= parseFloat(rule.value);
//         if (rule.operator === '==') return target === parseFloat(rule.value);
//         return true;
//       });
//       const isValid = off.OfferRule?.[0]?.logic === 'OR' ? results.some(r => r) : results.every(r => r);
//       if (!isValid && rules.length > 0) return;
//       let discountValue = 0;
//       if (off.discountType === 'Percentage') {
//         discountValue = (scopeValue * (off.discountValue || 0)) / 100;
//         if (off.maxDiscountValue && discountValue > off.maxDiscountValue) discountValue = off.maxDiscountValue;
//       } else if (off.discountType === 'Fixed') {
//         discountValue = off.discountValue || 0;
//       } else if (['Volume', 'Override'].includes(off.discountType)) {
//         const sortedTiers = [...(off.OfferTier || [])].sort((a, b) => b.minQty - a.minQty);
//         const tier = sortedTiers.find(t => scopeQty >= t.minQty);
//         if (tier) {
//           if (tier.type === 'Percentage') discountValue = (scopeValue * tier.value) / 100;
//           else if (off.discountType === 'Override') discountValue = Math.max(0, scopeValue - (tier.value * scopeQty));
//           else discountValue = tier.value;
//         }
//       }
//       if (discountValue > 0) potential.push({ ...off, calculatedDiscount: discountValue, inScopeItems });
//     });
//     return potential;
//   }, [exchangeItems, activeOffers]);

//   const { cartWithOffers, appliedOffers } = useMemo(() => {

//     if (!exchangeItems.length) return { cartWithOffers: [], appliedOffers: [] };
//     const appliedSet = new Set();
//     const computed = exchangeItems.map(item => {
//       const cartKey = `${item.id}-${item.sizeId}-${item.colorId}`;
//       const rowOfferId = selectedOffersByRow[cartKey];

//       if (!rowOfferId) return { ...item, priceType: 'SalesPrice', price: item.salesPrice !== undefined ? item.salesPrice : item.price, appliedOfferName: null };
//       const selectedOffer = potentialOffers.find(o => o.id === rowOfferId) || activeOffers.find(o => o.id === rowOfferId);
//       if (!selectedOffer) return { ...item, priceType: 'SalesPrice', price: item.salesPrice !== undefined ? item.salesPrice : item.price, appliedOfferName: null };
//       appliedSet.add(selectedOffer);
//       let currentItemPrice = item.salesPrice !== undefined ? parseFloat(item.salesPrice) : parseFloat(item.price);
//       if (selectedOffer.discountType === 'Percentage') currentItemPrice *= (1 - parseFloat(selectedOffer.discountValue || 0) / 100);
//       else if (selectedOffer.discountType === 'Fixed') currentItemPrice = Math.max(0, currentItemPrice - ((selectedOffer.discountValue || 0) / (parseFloat(item.qty) || 1)));
//       else if (['Override', 'Volume'].includes(selectedOffer.discountType)) {
//         const tier = [...(selectedOffer.OfferTier || [])].sort((a, b) => b.minQty - a.minQty).find(t => parseFloat(item.qty) >= t.minQty);
//         if (tier) {
//           if (tier.type === 'Fixed') currentItemPrice = tier.value;
//           else currentItemPrice *= (1 - parseFloat(tier.value || 0) / 100);
//         }
//       }
//       return { ...item, priceType: 'offerPrice', price: Math.max(0, currentItemPrice), appliedOfferName: selectedOffer.name };
//     });
//     return { cartWithOffers: computed, appliedOffers: Array.from(appliedSet) };
//   }, [exchangeItems, selectedOffersByRow, potentialOffers, activeOffers]);

//   const totalOfferDiscount = cartWithOffers.reduce((sum, item) => item.priceType === 'offerPrice' ?
//     sum + Math.max(0, (parseFloat(item.salesPrice || item.price || 0) - parseFloat(item.price || 0)) * parseFloat(item.qty || 0)) : sum, 0);

//   const handleShowItemOffers = (item) => { setSelectedItemForOffers(item); setShowItemOfferModal(true); };

//   const getItemApplicableOffers = (item) => {
//     if (!item || !activeOffers.length) return [];
//     return activeOffers.filter(off => {
//       if (item.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;
//       let isInScope = off.scopeMode === 'Global' || (off.scopeMode === 'Item' && off.OfferScope?.some(s => s.refId === item.itemId)) || (off.scopeMode === 'Collection' && off.OfferScope?.some(s => s.refId === item.itemId));
//       if (!isInScope) return false;
//       const inScopeItems = cartWithOffers.filter(cit => {
//         if (cit.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;
//         return off.scopeMode === 'Global' || (off.scopeMode === 'Item' && off.OfferScope?.some(s => s.refId === cit.itemId)) || (off.scopeMode === 'Collection' && off.OfferScope?.some(s => s.refId === cit.itemId));
//       });
//       const scopeQty = inScopeItems.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0);
//       const scopeValue = inScopeItems.reduce((sum, i) => sum + ((parseFloat(i.price) || 0) * (parseFloat(i.qty) || 0)), 0);
//       const rules = off.OfferRule?.[0]?.conditions?.rules || [];
//       const results = rules.map(rule => {
//         const target = rule.field === 'Minimum Quantity' ? scopeQty : (rule.field === 'Cart Value' ? scopeValue : 0);
//         if (rule.operator === '>=') return target >= parseFloat(rule.value);
//         if (rule.operator === '<=') return target <= parseFloat(rule.value);
//         if (rule.operator === '==') return target === parseFloat(rule.value);
//         return true;
//       });
//       const isValid = off.OfferRule?.[0]?.logic === 'OR' ? results.some(r => r) : results.every(r => r);
//       return isValid || rules.length === 0;
//     });
//   };

//   const handleExchangeScan = async (e) => {
//     if (e.key === 'Enter') {
//       const barcode = exchangeSearchQuery.trim();
//       if (!barcode) return;
//       try {
//         const response = await getStockByBarcode({ params: { barcode, branchId } }).unwrap();
//         const resolvedData = response?.needsResolution ? await resolveBarcodeMatch(response.matches || []) : response?.data;
//         if (response?.needsResolution && !resolvedData) return;
//         if (response.statusCode === 0 && resolvedData) {
//           if (Array.isArray(resolvedData)) resolvedData.forEach(item => addToExchange({ ...item }));
//           else addToExchange({ ...resolvedData });
//           setExchangeSearchQuery('');
//           return;
//         }
//       } catch (error) { console.error("Barcode search failed", error); }

//       // Fallback to local item search
//       const items = itemList?.data || [];
//       const retailStoreId = storeId || branchId; // Fallback to provided storeId
//       const localItem = items.find(i =>
//         i.name?.toLowerCase() === barcode.toLowerCase() ||
//         i.code?.toLowerCase() === barcode.toLowerCase() ||
//         i.ItemPriceList?.some(row => row.ItemBarcodes?.some(b => b.barcode === barcode))
//       );
//       if (!localItem) { Swal.fire({ title: "Warning", text: "Barcode not found", icon: "warning" }); return; }
//       const normItem = normalizeLocalItemForPos(localItem, branchId, retailStoreId);
//       if (!normItem?.barcode) { Swal.fire({ title: "Warning", text: "Item missing barcode", icon: "warning" }); return; }
//       try {
//         const localRes = await getStockByBarcode({ params: { barcode: normItem.barcode, branchId } }).unwrap();
//         const resLocalData = localRes?.needsResolution ? await resolveBarcodeMatch(localRes.matches || []) : localRes?.data;
//         if (localRes.statusCode === 0 && resLocalData) {
//           if (Array.isArray(resLocalData)) resLocalData.forEach(item => addToExchange({ ...item }));
//           else addToExchange({ ...resLocalData });
//           setExchangeSearchQuery('');
//           return;
//         }
//       } catch (error) { console.error("Local lookup failed", error); }
//       Swal.fire({ title: "Warning", text: "Product out of stock", icon: "warning" });
//     }
//   };

//   const addToExchange = (product) => {
//     if ((parseFloat(product.stockQty) || 0) <= 0) {
//       Swal.fire({ title: "Error", text: "Out of stock!", icon: "error" });
//       return;
//     }

//     // Resolve price from ItemPriceListData to ensure we use master price, not stock-specific price
//     const itemMaster = itemList?.data?.find(i => i.id === product.itemId);
//     const isLegacy = itemMaster?.isLegacy;

//     const masterPriceEntry = ItemPriceListData?.data?.find(p => {
//       if (isLegacy) {
//         return p.itemId === product.itemId;
//       }
//       return (
//         p.itemId === product.itemId &&
//         p.sizeId === product.sizeId &&
//         p.colorId === product.colorId
//       );
//     });

//     console.log(masterPriceEntry, "masterPriceEntry");
//     const resolvedPrice = masterPriceEntry ? parseFloat(masterPriceEntry.salesPrice || masterPriceEntry.price) : (parseFloat(product.salesPrice) || parseFloat(product.price) || 0);

//     setExchangeItems(prev => {
//       const existing = prev.find(item => item.itemId === product.itemId && item.sizeId === product.sizeId && item.colorId === product.colorId);
//       if (existing) {
//         return prev.map(item =>
//           (item.itemId === product.itemId && item.sizeId === product.sizeId && item.colorId === product.colorId)
//             ? { ...item, qty: Math.min(parseFloat(item.stockQty), parseFloat(item.qty) + 1) }
//             : item
//         );
//       }
//       return [...prev, {
//         ...product,
//         qty: 1,
//         id: product.id || product.itemId,
//         barcode: product.barcode,
//         itemName: product.itemName || product.item_name,
//         price: resolvedPrice,
//         salesPrice: resolvedPrice,
//         sourceStoreId: product.storeId || storeId || branchId,
//         salesPersonId: null,
//         salesPersonName: null,
//         salesPersonCode: null,
//       }];
//     });
//     setShowSalesPersonModal(true);
//     setTimeout(() => salesPersonScannerRef.current?.focus(), 500);
//   };

//   const handleSalesPersonScan = (barcode) => {
//     if (!barcode) return;
//     const employee = employees.find(e => e.employeeId === barcode || e.regNo === barcode);
//     setExchangeItems(prev => prev.map(item => !item.salesPersonId ? {
//       ...item,
//       salesPersonId: employee?.id || null,
//       salesPersonName: employee?.name || "Unknown",
//       salesPersonCode: employee?.employeeId || employee?.regNo || null
//     } : item));
//     setShowSalesPersonModal(false);
//     setSalesPersonBarcode('');
//     setTimeout(() => exchangeScannerRef.current?.focus(), 100);
//   };

//   const returnTotal = deliveryItems.reduce((sum, item) => sum + (parseFloat(item.qty || 0) * parseFloat(item.price || 0)), 0);
//   const exchangeTotal = cartWithOffers.reduce((sum, item) => sum + (parseFloat(item.qty || 0) * parseFloat(item.price || 0)), 0);
//   const posNetAmount = Math.round(exchangeTotal - returnTotal);

//   const handlePayNow = () => {
//     if (returnType === "Pos" && posNetAmount > 0) {
//       setShowPaymentModal(true);
//     } else {
//       saveData("close");
//     }
//   };

//   useEffect(() => {
//     if (inwardTyperef.current && !id) {
//       inwardTyperef.current.focus();
//     }
//   }, []);

//   useEffect(() => {
//     if (returnType === "Pos" && !showSalesPersonModal && !showPaymentModal) {
//       setTimeout(() => exchangeScannerRef.current?.focus(), 500);
//     }
//   }, [returnType, showSalesPersonModal, showPaymentModal]);


//   const syncFormWithDb = useCallback((data) => {
//     console.log(data?.DirectItems, "data?.DirectItems")
//     const today = new Date()
//     if (id) {
//       setReadOnly(true);
//     } else {
//       setReadOnly(false);
//     }
//     setTransType(data?.poType ? data.poType : "DyedYarn");
//     setPoInwardOrDirectInward(data?.poInwardOrDirectInward ? data?.poInwardOrDirectInward : "DirectInward")
//     setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
//     setDeliveryItems(data?.SalesDeliveryItems ? data.SalesDeliveryItems : []);
//     if (data?.docId) {
//       setDocId(data?.docId)
//     }
//     if (data?.date) setDate(data?.date);
//     // setTaxTemplateId(data?.taxTemplateId ? data?.taxTemplateId : "");
//     setPayTermId(data?.payTermId ? data?.payTermId : "");
//     setCustomerId(data?.customerId ? data?.customerId : "");
//     setSalesDeliveryId(data?.salesDeliveryId ? data?.salesDeliveryId : "");
//     setDcDate(data?.dcDate ? moment.utc(data?.dcDate).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
//     setDcNo(data?.dcNo ? data.dcNo : "")
//     setLocationId(data?.branchId ? data?.branchId : "")
//     setStoreId(data?.storeId ? data.storeId : "")
//     setVehicleNo(data?.vehicleNo ? data?.vehicleNo : "")
//     setSpecialInstructions(data?.specialInstructions ? data?.specialInstructions : "")
//     setRemarks(data?.remarks ? data?.remarks : "")
//     setTerms(data?.terms ? data?.terms : "")
//     setReturnType(data?.returnType ? data?.returnType : "Bulk Sales")
//     const nextPackingCharge = formatChargeValue(data?.packingCharge);
//     const nextShippingCharge = formatChargeValue(data?.shippingCharge);
//     setPackingCharge(nextPackingCharge);
//     setShippingCharge(nextShippingCharge);
//     setPackingChargeEnabled(Boolean(data?.packingChargeEnabled) || parseChargeAmount(nextPackingCharge) > 0);
//     setShippingChargeEnabled(Boolean(data?.shippingChargeEnabled) || parseChargeAmount(nextShippingCharge) > 0);
//     if (data?.branchId) {
//       branchIdFromApi.current = data?.branchId
//     }
//   }, [id]);

//   useEffect(() => {
//     if (id) {
//       syncFormWithDb(singleData?.data);
//     } else {
//       syncFormWithDb(undefined);
//     }
//   }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

//   const data = {
//     docId,
//     poType: transType,
//     poInwardOrDirectInward,
//     supplierId: customerId, dcDate,
//     payTermId,
//     id, userId,
//     storeId,
//     deliveryItems: deliveryItems?.filter(i => i.itemId),
//     discountType,
//     discountValue,
//     dcNo,
//     remarks,
//     specialInstructions,
//     vehicleNo,
//     posId,
//     returnType,
//     finYearId,
//     locationId: locationId ? parseInt(locationId) : undefined,
//     branchId,
//     customerId,
//     terms,
//     salesDeliveryId,
//     packingChargeEnabled,
//     packingCharge: packingChargeEnabled ? String(parseChargeAmount(packingCharge).toFixed(2)) : "",
//     shippingChargeEnabled,
//     shippingCharge: shippingChargeEnabled ? String(parseChargeAmount(shippingCharge).toFixed(2)) : "",

//   }

//   console.log(data, "data")




//   useEffect(() => {
//     if (returnType === "Pos" && posId) {
//       const selectedPos = posData?.data?.filter(p => p.id == posId)?.[0];
//       if (selectedPos?.customerId) {
//         setCustomerId(selectedPos.customerId);
//       }
//       console.log(posData?.data, 'returnType', posId, selectedPos)

//     }
//   }, [posId, returnType, posData]);




//   useEffect(() => {
//     if (returnType === "Bulk Sales" && salesDeliveryId) {
//       const selectedSd = salesDeliveryData?.data?.find(sd => sd.id === salesDeliveryId);
//       if (selectedSd?.customerId) {
//         setCustomerId(selectedSd.customerId);
//       }
//     }
//   }, [salesDeliveryId, returnType, salesDeliveryData]);

//   console.log(posId, "customerId", customerId);

//   const validateData = (data) => {

//     if (data?.customerId) {
//       return true
//     }

//     return false
//   }
//   console.log(data, "data")







//   const handleSubmitCustom = async (callback, data, text, nextProcess) => {
//     try {
//       let returnData;
//       if (text === "Updated") {
//         returnData = await callback(data).unwrap();
//       } else {
//         returnData = await callback(data).unwrap();
//       }
//       if (returnData.statusCode === 1) {
//         toast.error(returnData.message);
//       } else {
//         Swal.fire({
//           icon: 'success',
//           title: `${text || 'Saved'} Successfully`,
//           showConfirmButton: false,
//           timer: 2000
//         });

//         if (returnData.statusCode === 0) {
//           if (nextProcess == "new") {
//             syncFormWithDb(undefined);
//             onNew()
//           }
//           else if (nextProcess == "close") {
//             onClose()
//           }
//           else {
//             setId(returnData?.data?.id);

//           }




//         } else {
//           toast.error(returnData?.message);
//         }

//       }
//     } catch (error) {
//       console.log("handle");
//     }
//   };

//   function removeItem(id) {
//     setDeliveryItems(directInwardItems => {
//       let newItems = structuredClone(directInwardItems);
//       newItems = newItems.filter(item => parseInt(item.poItemsId) !== parseInt(id))
//       return newItems
//     });
//   }






//   const saveData = (nextProcess) => {
//     const mandatoryFields = ["itemId", "uomId", "qty", "price"];
//     const salesRows = (data?.deliveryItems || []).filter(i => i.itemId);
//     const requiresLegacyAwareVariantFields = salesRows.some((row) => {
//       const selectedItem = itemList?.data?.find((item) => String(item.id) === String(row.itemId));
//       return !selectedItem?.isLegacy;
//     });
//     const finalMandatoryFields = requiresLegacyAwareVariantFields
//       ? [...mandatoryFields, "sizeId", "colorId"]
//       : mandatoryFields;

//     // if (!validateData(data)) {


//     //   Swal.fire({
//     //     title: "Please fill all required fields...!",
//     //     icon: "success",

//     //   });
//     //   return
//     // }
//     if (!isGridDatasValid(salesRows, false, finalMandatoryFields)) {
//       Swal.fire({
//         title: "Please fill all Delivery Items Mandatory fields...!",
//         icon: "warning",
//       });
//       return;
//     }
//     if (returnType === "Pos" && posNetAmount > 0 && (paidCash + paidUPI + paidCard + paidOnline) < posNetAmount) {
//       setShowPaymentModal(true);
//       return;
//     }

//     if (!window.confirm("Are you sure save the details ...?")) {
//       return
//     }
//     if (nextProcess == "draft" && !id) {
//       handleSubmitCustom(addData, data = { ...data, draftSave: true }, "Added", nextProcess);
//     }


//     const posPayments = [
//       ...(paidCash > 0 ? [{ amount: String(paidCash), paymentMode: 'Cash' }] : []),
//       ...(paidUPI > 0 ? [{ amount: String(paidUPI), paymentMode: 'UPI', reference_no: upiRefNo }] : []),
//       ...(paidCard > 0 ? [{ amount: String(paidCard), paymentMode: 'Card' }] : []),
//       ...(paidOnline > 0 ? [{ amount: String(paidOnline), paymentMode: 'Online' }] : []),
//     ];

//     const finalData = {
//       ...data,
//       returnType,
//       exchangeItems: returnType === "Pos" ? exchangeItems : [],
//       posPayments: returnType === "Pos" ? posPayments : [],
//       netAmount: returnType === "Pos" ? posNetAmount : adjustedNetAmount,
//       receivedAmount: paidCash + paidUPI + paidCard + paidOnline,
//       originalPosId: posId // Mapping posId prop to originalPosId field
//     };

//     if (id && nextProcess == "draft") {
//       handleSubmitCustom(updateData, { ...finalData, draftSave: true }, "Updated", nextProcess);
//     }
//     else if (id) {
//       handleSubmitCustom(updateData, finalData, "Updated", nextProcess);
//     } else {
//       handleSubmitCustom(addData, finalData, "Added", nextProcess);
//     }
//   }

//   function getTotalQty() {
//     let qty = deliveryItems?.reduce((acc, curr) => { return acc + parseFloat(curr?.qty ? curr?.qty : 0) }, 0)
//     return parseFloat(qty || 0).toFixed(3)
//   }

//   const calculateTotals = () => {
//     return deliveryItems?.reduce((acc, curr) => {
//       const price = parseFloat(curr.price || 0);
//       const qty = parseFloat(curr.qty || 0);
//       const taxPercent = parseFloat(curr.tax || 0);
//       const subtotal = price * qty;
//       const taxAmount = (subtotal * taxPercent) / 100;

//       acc.subtotal += subtotal;
//       acc.taxAmount += taxAmount;
//       acc.netAmount += (subtotal + taxAmount);
//       return acc;
//     }, { subtotal: 0, taxAmount: 0, netAmount: 0 }) || { subtotal: 0, taxAmount: 0, netAmount: 0 };
//   }

//   const { subtotal, taxAmount, netAmount } = calculateTotals();
//   const extraCharges = (packingChargeEnabled ? parseChargeAmount(packingCharge) : 0) + (shippingChargeEnabled ? parseChargeAmount(shippingCharge) : 0);
//   const adjustedNetAmount = netAmount + extraCharges;
//   const chargeRows = returnType === "Pos" ? [] : [
//     ...(packingChargeEnabled
//       ? [{
//         key: "packingCharge",
//         label: "Packing Charge",
//         summaryColumn: "right",
//         renderValue: () => (
//           <input
//             type="number"
//             value={packingCharge}
//             onChange={(event) => setPackingCharge(event.target.value)}
//             onBlur={() => setPackingCharge(formatChargeValue(packingCharge))}
//             readOnly={readOnly}
//             className={`h-7 w-24 rounded border border-slate-300 px-1.5 py-0 text-right text-[11px] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200 ${readOnly ? "cursor-not-allowed bg-slate-100 text-slate-500" : "bg-white"}`}
//           />
//         ),
//       }]
//       : []),
//     ...(shippingChargeEnabled
//       ? [{
//         key: "shippingCharge",
//         label: "Shipping Charge",
//         summaryColumn: "right",
//         renderValue: () => (
//           <input
//             type="number"
//             value={shippingCharge}
//             onChange={(event) => setShippingCharge(event.target.value)}
//             onBlur={() => setShippingCharge(formatChargeValue(shippingCharge))}
//             readOnly={readOnly}
//             className={`h-7 w-24 rounded border border-slate-300 px-1.5 py-0 text-right text-[11px] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-200 ${readOnly ? "cursor-not-allowed bg-slate-100 text-slate-500" : "bg-white"}`}
//           />
//         ),
//       }]
//       : []),
//   ];
//   function isSupplierOutside() {
//     if (supplierDetails) {
//       return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
//     }
//     return false
//   }

//   const handleRightClick = (event, rowIndex, type) => {
//     event.preventDefault();
//     setContextMenu({
//       mouseX: event.clientX,
//       mouseY: event.clientY,
//       rowId: rowIndex,
//       type,
//     });
//   };

//   const handleCloseContextMenu = () => {
//     setContextMenu(null);
//   };

//   const summaryItems = [
//     { label: "No", value: docId },
//     { label: "Date", value: date },
//     {
//       label: "Customer",
//       value:
//         supplierDetails?.data?.name ||
//         findFromList(customerId, supplierList?.data, "name") ||
//         findFromList(customerId, supplierList?.data, "aliasName"),
//     },
//     {
//       label: "Phone",
//       value:
//         supplierDetails?.data?.contactPersonNumber ||
//         findFromList(customerId, supplierList?.data, "contactPersonNumber"),
//     },
//     {
//       label: "Address",
//       value:
//         supplierDetails?.data?.address ||
//         findFromList(customerId, supplierList?.data, "address"),
//     },
//     {
//       label: "Delivery",
//       value: findFromList(salesDeliveryId, salesDeliveryData?.data, "docId"),
//     },
//   ];

//   const handleTermTemplateChange = (value) => {
//     setTerm(value);
//   };

//   const handleFillItems = (selectedItems) => {
//     const newItems = selectedItems.map(item => {
//       const masterItem = itemList?.data?.find(i => i.id === item.itemId);
//       return {
//         ...item,
//         itemName: item.itemName || masterItem?.name,
//         itemCode: item.itemCode || masterItem?.code,
//         sizeName: item.sizeName || findFromList(item.sizeId, sizeList?.data, "name"),
//         colorName: item.colorName || findFromList(item.colorId, colorList?.data, "name"),
//         uomName: item.uomName || findFromList(item.uomId, uomList?.data, "name"),
//         qty: item.qty,
//         price: item.price || item.salesPrice,
//         tax: item.tax || masterItem?.Hsn?.tax || 0,
//       }
//     });
//     setDeliveryItems(newItems);
//     setInwardItemSelection(false);
//   }

//   const handleDiscard = () => {
//     Swal.fire({
//       title: "Clear Form?",
//       text: "This will remove all items and reset the current entry.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#6366f1",
//       cancelButtonColor: "#f43f5e",
//       confirmButtonText: "Yes, Clear All",
//       cancelButtonText: "Cancel",
//       background: "#ffffff",
//       borderRadius: "16px",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setDeliveryItems([]);
//         setExchangeItems([]);
//         setCustomerId(null);
//         setPosId(null);
//         setSalesDeliveryId(null);
//         setRemarks("");
//         setTerms("");
//         setTerm("");
//         setPackingChargeEnabled(false);
//         setPackingCharge("");
//         setShippingChargeEnabled(false);
//         setShippingCharge("");
//         if (onNew) onNew();
//         toast.success("Form cleared successfully");
//       }
//     });
//   };

//   const footerContent = (
//     <CommonFormFooter
//       remarks={remarks}
//       setRemarks={setRemarks}
//       terms={terms}
//       setTerms={setTerms}
//       readOnly={readOnly}
//       showTermSelect
//       termValue={term}
//       onTermChange={handleTermTemplateChange}
//       showTerms={returnType !== "Pos"}
//       showRemarks={returnType !== "Pos"}
//       termOptions={((id ? termsData?.data : termsData?.data?.filter((item) => item?.active)) || []).map((blend) => ({
//         value: blend.id,
//         label: blend?.name,
//         templateText: blend?.termsAndCondition || blend?.description || "",
//       }))}
//       chargeOptions={returnType === "Pos" ? [] : [
//         {
//           key: "packingChargeToggle",
//           label: "Packing",
//           checked: packingChargeEnabled,
//           onToggle: (checked) => {
//             setPackingChargeEnabled(checked);
//             if (!checked) {
//               setPackingCharge("");
//             } else if (!packingCharge) {
//               setPackingCharge("0.00");
//             }
//           },
//         },
//         {
//           key: "shippingChargeToggle",
//           label: "Shipping",
//           checked: shippingChargeEnabled,
//           onToggle: (checked) => {
//             setShippingChargeEnabled(checked);
//             if (!checked) {
//               setShippingCharge("");
//             } else if (!shippingCharge) {
//               setShippingCharge("0.00");
//             }
//           },
//         },
//       ]}
//       totalsRows={returnType === "Pos" ? [] : [
//         {
//           key: "totalQty",
//           label: "Total Quantity",
//           value: getTotalQty() || 0,
//           summaryColumn: "left",
//         },
//         {
//           key: "subtotal",
//           label: "Gross Amount",
//           value: `₹${(subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
//           summaryColumn: "right",
//         },
//         {
//           key: "taxAmount",
//           label: "GST Amount",
//           value: `₹${(taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
//           summaryColumn: "right",
//         },
//         ...chargeRows,
//         {
//           key: "netAmount",
//           label: "Net Amount",
//           value: `₹${(adjustedNetAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
//           emphasized: true,
//           summaryColumn: "right",
//         },
//       ]}
//       leftActions={
//         <div className="flex items-center gap-2">
//           <button
//             onClick={handleDiscard}
//             className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-[11px] font-bold hover:bg-red-50 transition-all shadow-sm active:scale-95"
//           >
//             <HiOutlineRefresh className="w-3.5 h-3.5" />
//             Clear All
//           </button>
//           <button onClick={() => saveData("new")} className="bg-indigo-500 text-white px-4 py-1.5 rounded-md hover:bg-indigo-600 flex items-center text-sm font-medium transition-all shadow-sm active:scale-95">
//             <FiSave className="mr-1.5" /> Save & New
//           </button>
//           <button onClick={() => saveData("close")} className="bg-indigo-700 text-white px-4 py-1.5 rounded-md hover:bg-indigo-800 flex items-center text-sm font-medium transition-all shadow-sm active:scale-95">
//             <FiSave className="mr-1.5" /> Save & Close
//           </button>
//         </div>
//       }
//       rightActions={
//         <>
//           <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
//             onClick={() => setReadOnly(false)}
//           >
//             <FiEdit2 className="w-4 h-4 mr-2" />
//             Edit
//           </button>
//           <button
//             className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
//             onClick={() => {
//               if (!deliveryItems?.filter(i => i.itemId).length) {
//                 toast.warning("Please add some items first");
//                 return;
//               }
//               setPrintOpen(true);
//             }}
//           >
//             <FiPrinter className="w-4 h-4 mr-2" />
//             Print
//           </button>
//           <button
//             className="bg-orange-600 text-white px-4 py-1 rounded-md hover:bg-orange-700 flex items-center text-sm ml-2"
//             onClick={() => {
//               if (!deliveryItems?.filter(i => i.itemId).length) {
//                 toast.warning("Please add some items first");
//                 return;
//               }
//               setThermalPrintOpen(true);
//             }}
//           >
//             <FiPrinter className="w-4 h-4 mr-2" />
//             Thermal Print
//           </button>
//         </>
//       }
//     />
//   );


//   return (
//     <>
//       <Modal isOpen={printOpen} onClose={() => setPrintOpen(false)} widthClass="w-[95%] h-[95%]">
//         <PDFViewer style={{ width: "100%", height: "90vh" }}>
//           <PremiumSalesPrintFormat
//             title="DELIVERY CHALLAN"
//             docId={docId}
//             date={date}
//             branchData={findFromList(branchId, branchList?.data, "all")}
//             customerData={supplierDetails?.data}
//             items={deliveryItems?.filter(i => i.itemId)}
//             remarks={remarks}
//             itemList={itemList?.data}
//             sizeList={sizeList?.data}
//             colorList={colorList?.data}
//             uomList={uomList?.data}
//             hsnList={hsnList?.data}
//           />
//         </PDFViewer>
//       </Modal>

//       <Modal
//         isOpen={inwardItemSelection}
//         onClose={() => setInwardItemSelection(false)}
//         title={returnType === "Pos" ? "Select Items from POS Bill" : "Select Items from Delivery Challan"}
//         widthClass="w-[85vw] h-[85vh]"
//       >
//         <PosItemsSelection
//           returnType={returnType}
//           singlePosData={singlePosData}
//           singleSalesDeliveryData={singleSalesDeliveryData}
//           handleFillItems={handleFillItems}
//           setInwardItemSelection={setInwardItemSelection}
//           itemList={itemList}
//           colorList={colorList}
//           sizeList={sizeList}
//           findFromList={findFromList}
//         />
//       </Modal>

//       <SalesPersonModal
//         isOpen={showSalesPersonModal}
//         onClose={() => setShowSalesPersonModal(false)}
//         salesPersonScannerRef={salesPersonScannerRef}
//         salesPersonBarcode={salesPersonBarcode}
//         setSalesPersonBarcode={setSalesPersonBarcode}
//         handleSalesPersonScan={handleSalesPersonScan}
//         employees={employees}
//       />

//       <PaymentModal
//         isOpen={showPaymentModal}
//         onClose={() => setShowPaymentModal(false)}
//         total={posNetAmount}
//         paidCash={paidCash}
//         setPaidCash={setPaidCash}
//         paidUPI={paidUPI}
//         setPaidUPI={setPaidUPI}
//         paidCard={paidCard}
//         setPaidCard={setPaidCard}
//         paidOnline={paidOnline}
//         setPaidOnline={setPaidOnline}
//         upiRefNo={upiRefNo}
//         setUpiRefNo={setUpiRefNo}
//         handleCheckout={() => saveData("close")}
//         paymentMethod={paymentMethod}
//         setPaymentMethod={setPaymentMethod}
//       />

//       <ItemOfferModal
//         isOpen={showItemOfferModal}
//         onClose={() => setShowItemOfferModal(false)}
//         selectedItemForOffers={selectedItemForOffers}
//         getItemApplicableOffers={getItemApplicableOffers}
//         selectedOffersByRow={selectedOffersByRow}
//         setSelectedOffersByRow={setSelectedOffersByRow}
//         Swal={Swal}
//       />

//       <BarcodeResolutionModal
//         barcodeResolution={barcodeResolution}
//         setBarcodeResolution={setBarcodeResolution}
//       />

//       <Modal isOpen={thermalPrintOpen} onClose={() => setThermalPrintOpen(false)} widthClass="w-[300pt] h-[95%]">
//         <PDFViewer style={{ width: "100%", height: "90vh" }}>
//           <ThermalSalesPrintFormat
//             title="DELIVERY CHALLAN"
//             docId={docId}
//             date={date}
//             branchData={findFromList(branchId, branchList?.data, "all")}
//             customerData={supplierDetails?.data}
//             items={deliveryItems?.filter(i => i.itemId)}
//             remarks={remarks}
//             itemList={itemList?.data}
//             sizeList={sizeList?.data}
//             colorList={colorList?.data}
//             uomList={uomList?.data}
//             hsnList={hsnList?.data}
//           />
//         </PDFViewer>
//       </Modal>

//       <TransactionEntryShell
//         title="Sales Return"
//         onClose={onClose}
//         headerOpen={isHeaderOpen}
//         setHeaderOpen={setIsHeaderOpen}
//         summaryItems={summaryItems}
//         openStateClassName="max-h-[420px] opacity-100 overflow-visible"
//         footer={footerContent}
//         headerContent={(
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-2">

//             <TransactionHeaderSection title="Basic Details" className="col-span-1" bodyClassName="grid-cols-2">
//               <ReusableInput label="Sales Return No" readOnly value={docId} />
//               <ReusableInput label="Sales Return Date" value={date} type={"date"} required={true} readOnly={true} disabled />

//             </TransactionHeaderSection>

//             <TransactionHeaderSection title="Customer Details" className="col-span-3 overflow-visible" bodyClassName="grid-cols-8 gap-1 overflow-visible">
//               {/* <div className="col-span-1">
//                 <DropdownInput
//                   name="Return Type"
//                   options={[
//                     { show: "Bulk Sales", value: "Bulk Sales" },
//                     { show: "Pos", value: "Pos" },
//                   ]}
//                   value={returnType}
//                   setValue={setReturnType}
//                   required={true}
//                   readOnly={readOnly}
//                 />
//               </div> */}


//               <div className="col-span-1">
//                 <DropdownInput name="Sales Order No"
//                   options={
//                     returnType === "Pos"
//                       ? dropDownListObject(posData?.data, "docId", "id")
//                       : dropDownListObject(salesDeliveryData?.data, "docId", "id")
//                   }
//                   value={returnType === "Pos" ? posId : salesDeliveryId}
//                   setValue={returnType === "Pos" ? setPosId : setSalesDeliveryId}
//                   required={true} readOnly={id || readOnly} />
//               </div>
//               <div className="col-span-3 overflow-visible">


//                 {/* <ReusableSearchableInput
//                   label="Customer Name"
//                   component="PartyMaster"
//                   placeholder="Search Customer Name..."
//                   optionList={supplierList?.data}
//                   setSearchTerm={(value) => { setCustomerId(value) }}
//                   searchTerm={customerId}
//                   show={"isClient"}
//                   required={true}
//                   disabled={true}
//                 /> */}
//                 <TextInputNew
//                   name="Customer Name"
//                   value={findFromList(customerId, supplierList?.data, "name")}
//                   setValue={setCustomerId}
//                   required={true}
//                   readOnly={true}
//                 />

//               </div>{console.log(findFromList(customerId, supplierList?.data, "name"), "customerName", customerId, supplierList?.data)}


//             </TransactionHeaderSection>



//           </div>
//         )}
//       >
//         <div className="min-h-0 flex-1 overflow-hidden">
//           <fieldset className="h-full min-h-0">

//             {returnType === "Pos" ? (
//               <PosSalesReturnItems
//                 deliveryItems={deliveryItems}
//                 setDeliveryItems={setDeliveryItems}
//                 exchangeItems={exchangeItems}
//                 setExchangeItems={setExchangeItems}
//                 itemList={itemList}
//                 sizeList={sizeList}
//                 colorList={colorList}
//                 locations={locations}
//                 uomList={uomList}
//                 readOnly={readOnly}
//                 handleRightClick={handleRightClick}
//                 contextMenu={contextMenu}
//                 handleCloseContextMenu={handleCloseContextMenu}
//                 setInwardItemSelection={setInwardItemSelection}
//                 exchangeSearchQuery={exchangeSearchQuery}
//                 setExchangeSearchQuery={setExchangeSearchQuery}
//                 handleExchangeScan={handleExchangeScan}
//                 exchangeScannerRef={exchangeScannerRef}
//                 returnTotal={returnTotal}
//                 handlePayNow={handlePayNow}
//                 // Offer Props
//                 handleShowItemOffers={handleShowItemOffers}
//                 selectedOffersByRow={selectedOffersByRow}
//                 cartWithOffers={cartWithOffers}
//                 employees={employees}
//                 // Stock Location Resolution
//                 getStockByBarcode={getStockByBarcode}
//                 resolveBarcodeMatch={resolveBarcodeMatch}
//               />
//             ) : (
//               <SalesReturnItems
//                 deliveryItems={deliveryItems} setDeliveryItems={setDeliveryItems} setInwardItemSelection={setInwardItemSelection} supplierId={customerId} handleRightClick={handleRightClick} contextMenu={contextMenu}
//                 handleCloseContextMenu={handleCloseContextMenu} yarnList={yarnList} colorList={colorList} uomList={uomList}
//                 itemList={itemList} sizeList={sizeList}
//               />
//             )}
//           </fieldset>
//         </div>
//       </TransactionEntryShell>
//     </>
//   );
// }

// export default SalesReturnForm;


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



const SalesReturnForm = ({ onClose, id, setId, docId, setDocId, date, setDate, readOnly, setReadOnly, transType, setTransType,
  dcNo, setDcNo, dcDate, setDcDate, customerId, setCustomerId, payTermId, setPayTermId, locationId, setLocationId, storeId, setStoreId, poInwardOrDirectInward, setPoInwardOrDirectInward, inwardItemSelection, setInwardItemSelection, onNew, branchList, locationData, supplierList, setDeliveryItems, deliveryItems,
  yarnList, colorList, uomList, hsnList, setSalesDeliveryId, salesDeliveryId, termsData


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
  const [isHeaderOpen, setIsHeaderOpen] = useState(true);



  const childRecord = useRef(0);
  const { branchId, companyId, userId, finYearId } = getCommonParams()

  const branchIdFromApi = useRef(branchId);

  const params = {
    branchId, companyId, userId, finYearId
  };
  const getWarehouseLocationId = useCallback(() => {
    const locations = locationData?.data || [];
    return locations.find((location) => (
      String(location?.storeName || "").toLowerCase().includes("warehouse")
    ))?.id || "";
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
      setPackingChargeEnabled(false);
      setPackingCharge("");
      setShippingChargeEnabled(false);
      setShippingCharge("");
    }
  }, [id]);

  useEffect(() => {
    if (id) return;
    const warehouseId = getWarehouseLocationId();
    if (warehouseId && String(storeId || "") !== String(warehouseId)) {
      setStoreId(warehouseId);
    }
  }, [getWarehouseLocationId, id, setStoreId, storeId]);

  useEffect(() => {
    if (id || !salesDeliveryId || !singleSalesDeliveryData?.data) return;

    const salesDelivery = singleSalesDeliveryData.data;
    setCustomerId(salesDelivery?.customerId || "");
    setDeliveryItems(salesDelivery?.remainingReturnItems || []);

    const warehouseId = getWarehouseLocationId();
    if (warehouseId) {
      setStoreId(warehouseId);
    }
  }, [
    getWarehouseLocationId,
    id,
    salesDeliveryId,
    setCustomerId,
    setDeliveryItems,
    setStoreId,
    singleSalesDeliveryData,
  ]);

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
        setPackingChargeEnabled(false);
        setPackingCharge("");
        setShippingChargeEnabled(false);
        setShippingCharge("");
        if (onNew) onNew();
        toast.success("Form cleared successfully");
      }
    });
  };


  const syncFormWithDb = useCallback((data) => {
    console.log(data?.DirectItems, "data?.DirectItems")
    const today = new Date()
    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
    setTransType(data?.poType ? data.poType : "DyedYarn");
    setPoInwardOrDirectInward(data?.poInwardOrDirectInward ? data?.poInwardOrDirectInward : "DirectInward")
    setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
    setDeliveryItems(data?.SalesDeliveryItems ? data.SalesDeliveryItems : []);
    if (data?.docId) {
      setDocId(data?.docId)
    }
    if (data?.date) setDate(data?.date);
    // setTaxTemplateId(data?.taxTemplateId ? data?.taxTemplateId : "");
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
    deliveryItems: deliveryItems?.filter(i => i.itemId),
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
    packingChargeEnabled,
    packingCharge: packingChargeEnabled ? String(parseChargeAmount(packingCharge).toFixed(2)) : "",
    shippingChargeEnabled,
    shippingCharge: shippingChargeEnabled ? String(parseChargeAmount(shippingCharge).toFixed(2)) : "",

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
          else if (nextProcess == "close") {
            onClose()
          }
          else {
            setId(returnData?.data?.id);

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
        title: "Warehouse return location not found",
        text: "Please configure an active warehouse location before saving a sales return.",
        icon: "warning",
      });
      return;
    }
    if (!isGridDatasValid(salesRows, false, finalMandatoryFields)) {
      Swal.fire({
        title: "Please fill all Delivery Items Mandatory fields...!",
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
    let qty = deliveryItems?.reduce((acc, curr) => { return acc + parseFloat(curr?.qty ? curr?.qty : 0) }, 0)
    return parseFloat(qty || 0).toFixed(3)
  }

  const calculateTotals = () => {
    return deliveryItems?.reduce((acc, curr) => {
      const price = parseFloat(curr.price || 0);
      const qty = parseFloat(curr.qty || 0);
      const taxPercent = parseFloat(curr.tax || 0);
      const subtotal = price * qty;
      const taxAmount = (subtotal * taxPercent) / 100;

      acc.subtotal += subtotal;
      acc.taxAmount += taxAmount;
      acc.netAmount += (subtotal + taxAmount);
      return acc;
    }, { subtotal: 0, taxAmount: 0, netAmount: 0 }) || { subtotal: 0, taxAmount: 0, netAmount: 0 };
  }

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
            title="DELIVERY CHALLAN"
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

      <Modal isOpen={thermalPrintOpen} onClose={() => setThermalPrintOpen(false)} widthClass="w-[300pt] h-[95%]">
        <PDFViewer style={{ width: "100%", height: "90vh" }}>
          <ThermalSalesPrintFormat
            title="DELIVERY CHALLAN"
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
        onClose={onClose}
        headerOpen={isHeaderOpen}
        setHeaderOpen={setIsHeaderOpen}
        summaryItems={summaryItems}
        openStateClassName="max-h-[420px] opacity-100 overflow-visible"
        footer={footerContent}
        headerContent={(
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">

            <TransactionHeaderSection title="Basic Details" className="col-span-1" bodyClassName="grid-cols-2">
              <ReusableInput label="Sales Return No" readOnly value={docId} />
              <ReusableInput label="Sales Return Date" value={date} type={"date"} required={true} readOnly={true} disabled />
            </TransactionHeaderSection>

            <TransactionHeaderSection title="Customer Details" className="col-span-2 overflow-visible" bodyClassName="grid-cols-7 gap-1 overflow-visible">

              {/* 


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
              </div> */}
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
        <div className="min-h-0 flex-1 overflow-hidden">
          <fieldset className="h-full min-h-0">
            <SalesReturnItems
              deliveryItems={deliveryItems} setDeliveryItems={setDeliveryItems} setInwardItemSelection={setInwardItemSelection} supplierId={customerId} handleRightClick={handleRightClick} contextMenu={contextMenu}
              handleCloseContextMenu={handleCloseContextMenu} yarnList={yarnList} colorList={colorList} uomList={uomList}
              itemList={itemList} sizeList={sizeList}
            />
          </fieldset>
        </div>
      </TransactionEntryShell>
    </>
  );
}

export default SalesReturnForm;
