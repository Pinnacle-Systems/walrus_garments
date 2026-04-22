import { useDispatch, useSelector } from 'react-redux';
import {
    Plus,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useGetItemMasterQuery, useGetItemPriceListQuery } from '../../../redux/uniformService/ItemMasterService';
import { useGetPartyQuery, useAddPartyMutation } from '../../../redux/services/PartyMasterService';
import { useAddSalesInvoiceMutation } from '../../../redux/uniformService/salesInvoiceServices';
import { useGetLocationMasterQuery } from '../../../redux/uniformService/LocationMasterServices';
import { useLazyGetUnifiedStockByBarcodeQuery } from '../../../redux/services/StockService';
import { getCommonParams } from '../../../Utils/helper';
import Swal from 'sweetalert2';
import {
    useGetPointOfSalesQuery,
    useLazyGetPointOfSalesQuery,
    useLazyGetPointOfSalesByIdQuery,
    useAddPointOfSalesMutation,
    useUpdatePointOfSalesMutation,
    useGetPointOfSalesByIdQuery,
    useLazyCheckReferenceNumberQuery
} from '../../../redux/uniformService/PointOfSalesService';
import { useGetoffersPromotionsQuery } from '../../../redux/uniformService/Offer&PromotionsService';
import { useGetEmployeeQuery } from '../../../redux/services/EmployeeMasterService';
import PosReports from './PosReports';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { findDefaultPriceRow, normalizeLocalItemForPos } from './utils/posHelpers';

// Sub-components
import POSHeader from './components/POSHeader';
import POSCartTable from './components/POSCartTable';
import POSSidebar from './components/POSSidebar';
import POSFooter from './components/POSFooter';
import ItemOfferModal from './components/ItemOfferModal';
import ReturnExchangeModal from './components/ReturnExchangeModal';
import BarcodeResolutionModal from './components/BarcodeResolutionModal';
import SalesPersonModal from './components/SalesPersonModal';
import PaymentModal from './components/PaymentModal';
import ReceiptViewerModal from './components/ReceiptViewerModal';
import StockLocationModal from './components/StockLocationModal';
import PosReportsNew from './PosReportsNew';


const PointOfSale = () => {
    const dispatch = useDispatch();

    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCartMobile, setShowCartMobile] = useState(false);

    const [discount, setDiscount] = useState(0);
    const [customerQuery, setCustomerQuery] = useState('');
    const [isGuestCustomer, setIsGuestCustomer] = useState(true);
    const [guestName, setGuestName] = useState('');
    const [guestMobile, setGuestMobile] = useState('');
    const [showReports, setShowReports] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editingInvoiceId, setEditingInvoiceId] = useState(null);
    const [addParty] = useAddPartyMutation();
    const scannerRef = useRef(null);
    const discountRef = useRef(null);
    const qtyInputRefs = useRef({});
    const [activeRowIndex, setActiveRowIndex] = useState(0);
    const [printData, setPrintData] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [docId, setDocId] = useState("");


    const [transactionType, setTransactionType] = useState("SALE");
    const [showReturnExchnageModal, setShowReturnExchnageModal] = useState(false);



    const [barcodeResolution, setBarcodeResolution] = useState({ open: false, matches: [], resolve: null });

    const [showSalesPersonModal, setShowSalesPersonModal] = useState(false);
    const [salesPersonBarcode, setSalesPersonBarcode] = useState('');
    const salesPersonScannerRef = useRef(null);

    const [exchangeSalesNo, setExchangeSalesNo] = useState('');

    // Reports Pagination & Search States
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [dataPerPage, setDataPerPage] = useState("10");
    const [reportsSearchDocNo, setReportsSearchDocNo] = useState("");
    const [reportsSearchDate, setReportsSearchDate] = useState("");
    const [reportsSearchCustomerName, setReportsSearchCustomerName] = useState("");
    const [showStockModal, setShowStockModal] = useState(false);
    const [selectedItemForStock, setSelectedItemForStock] = useState(null);

    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin = user?.role === 'Admin' || user?.roleName === 'Admin' || user?.Role?.name === 'Admin';

    const lastPopulatedRef = useRef("");
    const [checkRefNo] = useLazyCheckReferenceNumberQuery();

    const { data: employeeData } = useGetEmployeeQuery({
        params: { branchId, userId, companyId, finYearId }
    });
    const employees = employeeData?.data || [];

    const handlePayNow = () => {
        if (cart.length === 0 || isProcessing) return;

        const currentPhone = selectedCustomer ? selectedCustomer.contact : guestMobile;
        const phoneRegex = /^[0-9]{10}$/;
        const cleanPhone = currentPhone?.toString().replace(/\D/g, '') || '';

        if (!phoneRegex.test(cleanPhone)) {
            Swal.fire({ title: "Error", text: "A valid 10-digit mobile number is required!", icon: "error" });
            return;
        }

        if (isGuestCustomer && !guestName.trim()) {
            Swal.fire({ title: "Error", text: "Customer name is required!", icon: "error" });
            return;
        }

        if (total === 0) {
            Swal.fire({
                title: 'Equal Exchange',
                text: 'The return value matches the purchase value. Save this exchange?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#4f46e5',
                confirmButtonText: 'Yes, Save'
            }).then((result) => {
                if (result.isConfirmed) {
                    handleCheckout();
                }
            });
        } else {
            setShowPaymentModal(true);
        }
    };

    const allocateStock = useCallback((totalQty, stockDetails, retailStoreId) => {
        let remaining = parseFloat(totalQty) || 0;
        const fulfillments = [];
        const sortedStocks = [...(stockDetails || [])].sort((a, b) => {
            const isARetail = a.storeName?.toLowerCase().includes('retail') || parseInt(a.storeId) === parseInt(retailStoreId);
            const isBRetail = b.storeName?.toLowerCase().includes('retail') || parseInt(b.storeId) === parseInt(retailStoreId);
            if (isARetail && !isBRetail) return -1;
            if (!isARetail && isBRetail) return 1;
            return 0;
        });

        sortedStocks.forEach(s => {
            const take = Math.min(remaining, parseFloat(s.stockQty) || 0);
            fulfillments.push({ storeId: s.storeId, storeName: s.storeName, qty: take });
            remaining -= take;
        });

        // If still remaining (though shouldn't happen with stock limits), add to last or retail
        if (remaining > 0 && fulfillments.length > 0) {
            fulfillments[0].qty += remaining;
        }

        return fulfillments;
    }, []);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = document.activeElement?.tagName?.toLowerCase();
            const isTyping = tag === 'input' || tag === 'textarea';

            if (e.key === 'F10') { e.preventDefault(); scannerRef.current?.focus(); return; }
            if (e.key === 'F8') { e.preventDefault(); handlePayNow(); return; }
            if (e.key === 'F2') {
                e.preventDefault();
                if (cart.length > 0) {
                    const idx = Math.min(activeRowIndex, cart.length - 1);
                    const item = cart[idx];
                    const key = `${item.id}-${item.sizeId}-${item.colorId}`;
                    qtyInputRefs.current[key]?.focus();
                    qtyInputRefs.current[key]?.select();
                }
                return;
            }
            if (e.key === 'F3') { e.preventDefault(); discountRef.current?.focus(); discountRef.current?.select(); return; }
            if (e.key === 'F4') {
                e.preventDefault();
                if (cart.length > 0) {
                    Swal.fire({
                        title: 'Void All Items?',
                        text: 'This will clear all items from the cart.',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#ef4444',
                        cancelButtonColor: '#94a3b8',
                        confirmButtonText: 'Void All'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            setCart([]);
                            setDiscount(0);
                            setActiveRowIndex(0);
                        }
                    });
                }
                return;
            }

            if (!isTyping) {
                if (e.key === 'ArrowDown') { e.preventDefault(); setActiveRowIndex(prev => Math.min(prev + 1, cart.length - 1)); return; }
                if (e.key === 'ArrowUp') { e.preventDefault(); setActiveRowIndex(prev => Math.max(prev - 1, 0)); return; }
                if (e.key === 'Delete' && cart.length > 0) {
                    e.preventDefault();
                    const idx = Math.min(activeRowIndex, cart.length - 1);
                    const item = cart[idx];
                    removeFromCart(`${item.id}-${item.sizeId}-${item.colorId}`);
                    setActiveRowIndex(prev => Math.max(prev - 1, 0));
                    return;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, activeRowIndex, isProcessing, guestName, guestMobile, isGuestCustomer, selectedCustomer]);

    // Offers & Promotions Logic
    const [selectedOffersByRow, setSelectedOffersByRow] = useState({});
    const { data: offersData } = useGetoffersPromotionsQuery({
        params: { branchId, userId, finYearId, active: true }
    });
    const activeOffers = offersData?.data || [];

    const potentialOffers = useMemo(() => {
        if (!activeOffers.length || !cart.length) return [];

        const potential = [];
        activeOffers.forEach(off => {
            const inScopeItems = cart.filter(item => {
                if (item.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;
                if (off.scopeMode === 'Global') return true;
                if (off.scopeMode === 'Item' || off.scopeMode === 'Collection') return off.OfferScope?.some(s => s.refId === (item.itemId || item.id));
                return false;
            });
            if (!inScopeItems.length) return;

            const scopeQty = inScopeItems.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0);
            const scopeValue = inScopeItems.reduce((sum, i) => sum + ((parseFloat(i.salesPrice || i.price) || 0) * (parseFloat(i.qty) || 0)), 0);

            const rules = off.OfferRule?.[0]?.conditions?.rules || [];
            const results = rules.map(rule => {
                const target = rule.field === 'Minimum Quantity' ? scopeQty : (rule.field === 'Cart Value' ? scopeValue : 0);
                if (rule.operator === '>=') return target >= parseFloat(rule.value);
                if (rule.operator === '<=') return target <= parseFloat(rule.value);
                if (rule.operator === '==') return target === parseFloat(rule.value);
                return true;
            });

            const isValid = off.OfferRule?.[0]?.logic === 'OR' ? results.some(r => r) : results.every(r => r);
            if (!isValid && rules.length > 0) return;

            let discountValue = 0;
            if (off.discountType === 'Percentage') {
                discountValue = (scopeValue * (off.discountValue || 0)) / 100;
                if (off.maxDiscountValue && discountValue > off.maxDiscountValue) discountValue = off.maxDiscountValue;
            } else if (off.discountType === 'Fixed') {
                discountValue = off.discountValue || 0;
            } else if (['Volume', 'Override'].includes(off.discountType)) {
                const sortedTiers = [...(off.OfferTier || [])].sort((a, b) => b.minQty - a.minQty);
                const tier = sortedTiers.find(t => scopeQty >= t.minQty);
                if (tier) {
                    if (tier.type === 'Percentage') discountValue = (scopeValue * tier.value) / 100;
                    else if (off.discountType === 'Override') discountValue = Math.max(0, scopeValue - (tier.value * scopeQty));
                    else discountValue = tier.value;
                }
            }
            if (discountValue > 0) potential.push({ ...off, calculatedDiscount: discountValue, inScopeItems });
        });
        return potential;
    }, [cart, activeOffers]);

    const { cartWithOffers, appliedOffers } = useMemo(() => {
        if (!cart.length) return { cartWithOffers: [], appliedOffers: [] };
        const appliedSet = new Set();
        const computed = cart.map(item => {
            const cartKey = `${item.id}-${item.sizeId}-${item.colorId}`;
            const rowOfferId = selectedOffersByRow[cartKey];
            if (!rowOfferId) return { ...item, priceType: 'SalesPrice', price: item.salesPrice !== undefined ? item.salesPrice : item.price, appliedOfferName: null };

            const selectedOffer = potentialOffers.find(o => o.id === rowOfferId) || activeOffers.find(o => o.id === rowOfferId);
            if (!selectedOffer) return { ...item, priceType: 'SalesPrice', price: item.salesPrice !== undefined ? item.salesPrice : item.price, appliedOfferName: null };

            appliedSet.add(selectedOffer);
            let currentItemPrice = item.salesPrice !== undefined ? parseFloat(item.salesPrice) : parseFloat(item.price);

            if (selectedOffer.discountType === 'Percentage') currentItemPrice *= (1 - parseFloat(selectedOffer.discountValue || 0) / 100);
            else if (selectedOffer.discountType === 'Fixed') currentItemPrice = Math.max(0, currentItemPrice - ((selectedOffer.discountValue || 0) / (parseFloat(item.qty) || 1)));
            else if (['Override', 'Volume'].includes(selectedOffer.discountType)) {
                const tier = [...(selectedOffer.OfferTier || [])].sort((a, b) => b.minQty - a.minQty).find(t => parseFloat(item.qty) >= t.minQty);
                if (tier) {
                    if (tier.type === 'Fixed') currentItemPrice = tier.value;
                    else currentItemPrice *= (1 - parseFloat(tier.value || 0) / 100);
                }
            }
            return { ...item, priceType: 'offerPrice', price: Math.max(0, currentItemPrice), appliedOfferName: selectedOffer.name };
        });
        return { cartWithOffers: computed, appliedOffers: Array.from(appliedSet) };
    }, [cart, selectedOffersByRow, potentialOffers, activeOffers]);

    const [showItemOfferModal, setShowItemOfferModal] = useState(false);
    const [selectedItemForOffers, setSelectedItemForOffers] = useState(null);

    const totalOfferDiscount = cartWithOffers.reduce((sum, item) => item.priceType === 'offerPrice' ? sum + Math.max(0, (parseFloat(item.salesPrice || item.price || 0) - parseFloat(item.price || 0)) * parseFloat(item.qty || 0)) : sum, 0);

    const handleShowItemOffers = (item) => { setSelectedItemForOffers(item); setShowItemOfferModal(true); };

    const getItemApplicableOffers = (item) => {
        if (!item || !activeOffers.length) return [];
        return activeOffers.filter(off => {
            if (item.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;
            let isInScope = off.scopeMode === 'Global' || (off.scopeMode === 'Item' && off.OfferScope?.some(s => s.refId === item.itemId)) || (off.scopeMode === 'Collection' && off.OfferScope?.some(s => s.refId === item.itemId));
            if (!isInScope) return false;
            const inScopeItems = cartWithOffers.filter(cit => {
                if (cit.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;
                return off.scopeMode === 'Global' || (off.scopeMode === 'Item' && off.OfferScope?.some(s => s.refId === cit.itemId)) || (off.scopeMode === 'Collection' && off.OfferScope?.some(s => s.refId === cit.itemId));
            });
            const scopeQty = inScopeItems.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0);
            const scopeValue = inScopeItems.reduce((sum, i) => sum + ((parseFloat(i.price) || 0) * (parseFloat(i.qty) || 0)), 0);
            const rules = off.OfferRule?.[0]?.conditions?.rules || [];
            const results = rules.map(rule => {
                const target = rule.field === 'Minimum Quantity' ? scopeQty : (rule.field === 'Cart Value' ? scopeValue : 0);
                if (rule.operator === '>=') return target >= parseFloat(rule.value);
                if (rule.operator === '<=') return target <= parseFloat(rule.value);
                if (rule.operator === '==') return target === parseFloat(rule.value);
                return true;
            });
            return off.OfferRule?.[0]?.logic === 'OR' ? results.some(r => r) : results.every(r => r);
        });
    };

    // Data Fetching
    const { data: itemsData } = useGetItemMasterQuery({ params: { branchId, userId, finYearId, active: true } });
    const { data: ItemPriceListData } = useGetItemPriceListQuery({ params: { branchId, userId, finYearId } });
    const { data: customerData } = useGetPartyQuery({ params: { branchId, userId, finYearId } });
    const { data: locationsData } = useGetLocationMasterQuery({ params: { branchId, companyId } });
    const [addPointOfSales] = useAddPointOfSalesMutation();
    const [updatePointOfSales] = useUpdatePointOfSalesMutation();
    const [getStockByBarcode, { isLoading: isBarcodeLoading }] = useLazyGetUnifiedStockByBarcodeQuery();
    const [fetchRecentSales, { data: posData, isFetching: isRecentSalesFetching }] = useLazyGetPointOfSalesQuery();

    // Single Query Sync States
    const [selectedReportSaleId, setSelectedReportSaleId] = useState(null);
    const { data: fetchedSaleResponse, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetPointOfSalesByIdQuery(selectedReportSaleId, { skip: !selectedReportSaleId });




    const syncFormWithDb = useCallback((sale) => {
        if (!sale) {
            setCart([]);
            setDiscount(0);
            setEditingInvoiceId(null);
            setSelectedCustomer(null);
            setIsGuestCustomer(true);
            setGuestName("");
            setGuestMobile("");
            setPaidCash(0);
            setPaidUPI(0);
            setPaidCard(0);
            setPaidOnline(0);
            setDocId("");
            setUpiRefNo("");
            return;
        }

        const mappedCart = (sale.PosItems || []).map(item => {
            const masterItem = items.find(i => i.id === item.itemId);
            const employee = employees.find(e => e.id === item.salesPersonId);
            return {
                ...item,
                id: item.itemId,
                // Item: masterItem,
                salesPrice: parseFloat(item.price),
                price: parseFloat(item.price),
                qty: parseFloat(item.qty),
                taxPercent: masterItem?.Hsn?.tax || 5,
                salesPersonId: item.salesPersonId,
                // salesPersonName: employee?.name,
                stockQty: 0,
                sourceStoreId: retailStoreId
            };
        });

        setCart(mappedCart);
        setEditingInvoiceId(sale.id);

        const payments = sale.PosPayments || [];
        let cash = 0, upi = 0, card = 0, online = 0;

        payments.forEach(p => {
            const mode = (p.paymentMode || p.mode || "").toLowerCase();
            const amt = parseFloat(p.amount) || 0;
            if (mode.includes('cash')) cash += amt;
            else if (mode.includes('upi')) upi += amt;
            else if (mode.includes('card')) card += amt;
            else if (mode.includes('online')) online += amt;
        });

        setDiscount(parseFloat(sale.discountValue || 0));
        setPaymentMethod(sale.paymentMethod || 'Cash');
        setPaidCash(cash);
        setPaidUPI(upi);
        setPaidCard(card);
        setPaidOnline(online);

        if (sale.Party) {
            setSelectedCustomer(sale.Party);
            setIsGuestCustomer(false);
            setGuestName(sale.Party.name);
            setGuestMobile(sale.Party.contact);
        } else {
            setSelectedCustomer(null);
            setIsGuestCustomer(true);
            setGuestName(sale.customerName || "Walk-in");
            setGuestMobile(sale.customerMobile || "");
        }
        if (sale.docId) setDocId(sale.docId);
        setShowReports(true);
    }, [selectedReportSaleId]);

    useEffect(() => {
        if (selectedReportSaleId) syncFormWithDb(fetchedSaleResponse?.data);
        else syncFormWithDb(undefined);
    }, [isSingleLoading, isSingleFetching, selectedReportSaleId, fetchedSaleResponse, syncFormWithDb]);


    useEffect(() => {
        if (!showReports) {
            fetchRecentSales({
                params: {
                    branchId,
                    companyId,
                    finYearId,
                    pagination: true,
                    pageNumber: currentPageNumber,
                    dataPerPage,
                    serachDocNo: reportsSearchDocNo,
                    searchDate: reportsSearchDate,
                    searchCustomerName: reportsSearchCustomerName
                }
            });
        }
    }, [showReports, currentPageNumber, reportsSearchDocNo, reportsSearchDate, reportsSearchCustomerName, dataPerPage, fetchRecentSales, branchId, companyId, finYearId]);

    useEffect(() => {
        setCurrentPageNumber(1);
    }, [reportsSearchDocNo, reportsSearchDate, reportsSearchCustomerName, dataPerPage]);

    const items = itemsData?.data || [];
    const recentSales = posData?.data?.slice(0, 50) || [];
    const customers = (customerData?.data || []).filter(c => c.isB2C);
    const locations = locationsData?.data || [];
    const retailLocation = locations.find(l => l.storeName?.toLowerCase().includes('retail'));
    const retailStoreId = retailLocation?.id;

    // Barcode Handling
    const resolveBarcodeMatch = (matches = []) => {
        return new Promise((resolve) => {
            setBarcodeResolution({
                open: true,
                matches: matches.map(m => ({
                    ...m,
                    item_name: m.item_name || m?.Item?.name || "Item",
                    size: m.size || m?.Size?.name || "-",
                    color: m.color || m?.Color?.name || "-",
                    location: m.location || "-",
                    stockQty: m.stockQty || 0,
                    storeId: m.storeId || m.locationId
                })),
                resolve
            });
        });
    };

    const handleScan = async (e) => {
        if (e.key === 'Enter') {
            const barcode = searchQuery.trim();
            if (!barcode) return;
            try {
                const response = await getStockByBarcode({ params: { barcode, branchId } }).unwrap();
                const resolvedData = response?.needsResolution ? await resolveBarcodeMatch(response.matches || []) : response?.data;
                if (response?.needsResolution && !resolvedData) return;
                if (response.statusCode === 0 && resolvedData) {
                    if (Array.isArray(resolvedData)) resolvedData.forEach(item => addToCart({ ...item }));
                    else addToCart({ ...resolvedData });
                    setSearchQuery('');
                    return;
                }
            } catch (error) { console.error("Barcode search failed", error); }
            const localItem = items.find(i =>
                i.name?.toLowerCase() === barcode.toLowerCase() ||
                i.code?.toLowerCase() === barcode.toLowerCase() ||
                i.ItemPriceList?.some(row => row.ItemBarcodes?.some(b => b.barcode === barcode))
            );
            if (!localItem) { Swal.fire({ title: "Warning", text: "Barcode not found", icon: "warning" }); return; }
            const normItem = normalizeLocalItemForPos(localItem, branchId, retailStoreId);
            if (!normItem?.barcode) { Swal.fire({ title: "Warning", text: "Item missing barcode", icon: "warning" }); return; }
            try {
                const localRes = await getStockByBarcode({ params: { barcode: normItem.barcode, storeId: retailStoreId, branchId } }).unwrap();
                const resLocalData = localRes?.needsResolution ? await resolveBarcodeMatch(localRes.matches || []) : localRes?.data;
                if (localRes.statusCode === 0 && resLocalData) {
                    if (Array.isArray(resLocalData)) resLocalData.forEach(item => addToCart({ ...item }));
                    else addToCart({ ...resLocalData });
                    setSearchQuery('');
                    return;
                }
            } catch (error) { console.error("Local lookup failed", error); }
            Swal.fire({ title: "Warning", text: "Product out of stock in this store", icon: "warning" });
        }
    };

    // Cart Actions
    const addToCart = (product) => {


        console.log(product, "product")


        const itemId = product.itemId || product.id;
        const sizeId = product.sizeId || 0;
        const colorId = product.colorId || 0;
        const uomId = product.uomId || product.Item?.uomId || 0;

        console.log("DEBUG: addToCart Search Target:", { itemId, sizeId, colorId, uomId, isReturn: !!product.isReturn });

        setCart(prev => {
            const existingIndex = prev.findIndex((item, i) => {
                const isIdMatch = (item.itemId == itemId) || (item.id == itemId);
                const isSizeMatch = (item.sizeId || 0) == (sizeId || 0);
                const isColorMatch = (item.colorId || 0) == (colorId || 0);
                const isUomMatch = (item.uomId || 0) == (uomId || 0);
                const isReturnMatch = !!item.isReturn === !!product.isReturn;




                if (isIdMatch && isReturnMatch) {
                    console.log(`   - Checking Row ${i}: ID Match! Size: ${isSizeMatch}, Color: ${isColorMatch}, Uom: ${isUomMatch}`);
                }

                return isIdMatch && isSizeMatch && isColorMatch && isUomMatch && isReturnMatch;
            });

            console.log(existingIndex, "existingIndex")


            if (existingIndex > -1) {
                const existing = prev[existingIndex];

                console.log(existing, "existing")
                const newQty = (parseFloat(existing.qty) || 0) + 1;

                if (existing.isReturn) {
                    if (newQty > (existing.maxReturnQty || 0)) {
                        toast.warning(`Max return limit: ${existing.maxReturnQty}`);
                        return prev;
                    }
                    const updatedCart = [...prev];
                    updatedCart[existingIndex] = { ...existing, qty: newQty };
                    return updatedCart;
                } else {
                    const stockDetails = [...(existing.stockDetails || [])];
                    const currentStoreId = product.storeId || product.locationId;
                    if (currentStoreId && !stockDetails.find(s => s.storeId == currentStoreId)) {
                        stockDetails.push({
                            storeId: currentStoreId,
                            storeName: product.location || "Store",
                            stockQty: product.stockQty || 0
                        });
                    }

                    const totalStock = stockDetails.reduce((sum, s) => sum + (parseFloat(s.stockQty) || 0), 0);

                    if (newQty > totalStock) {
                        toast.warning("Max stock reached");
                        return prev;
                    }

                    const updatedFulfillments = allocateStock(newQty, stockDetails, retailStoreId);
                    const updatedCart = [...prev];
                    updatedCart[existingIndex] = {
                        ...existing,
                        qty: newQty,
                        stockQty: totalStock,
                        stockDetails,
                        fulfillments: updatedFulfillments
                    };
                    return updatedCart;
                }
            }

            const fullPriceList = ItemPriceListData?.data || [];
            const itemPrices = fullPriceList.filter(p => p.itemId === itemId);
            const variantHit = itemPrices.find(p => p.sizeId === product.sizeId && p.colorId === product.colorId);
            const lookupPrice = variantHit?.salesPrice || itemPrices.find(p => !p.sizeId && !p.colorId)?.salesPrice || itemPrices[0]?.salesPrice || 0;
            const masterItem = product?.Item || items.find(i => i.id === itemId);

            const stockDetails = [{
                storeId: product.storeId || product.locationId || retailStoreId,
                storeName: product.location || "Retail Store",
                stockQty: product.stockQty || 0
            }];

            const totalStock = stockDetails.reduce((sum, s) => sum + (parseFloat(s.stockQty) || 0), 0);
            const initialFulfillments = allocateStock(1, stockDetails, retailStoreId);

            return [...prev, {
                ...product,
                itemId,
                Item: masterItem,
                salesPrice: lookupPrice,
                price: lookupPrice,
                rate: lookupPrice,
                qty: 1,
                priceType: 'SalesPrice',
                taxPercent: masterItem?.Hsn?.tax || 5,
                stockQty: totalStock,
                stockDetails,
                fulfillments: initialFulfillments,
                sourceStoreId: retailStoreId // Default for non-clubbed awareness
            }];
        });
        setShowSalesPersonModal(true);
        setTimeout(() => salesPersonScannerRef.current?.focus(), 500);
    };

    const handleSalesPersonScan = (barcode) => {
        if (!barcode) return;
        const employee = employees.find(e => e.employeeId === barcode || e.regNo === barcode);
        setCart(prev => prev.map(item => !item.salesPersonId ? { ...item, salesPersonId: employee?.id || null, salesPersonBarcode: barcode, salesPersonName: employee?.name || "Unknown" } : item));
        setShowSalesPersonModal(false);
        setSalesPersonBarcode('');
        setTimeout(() => scannerRef.current?.focus(), 100);
    };

    const handleRowSalesPersonChange = (index, empId) => {
        if (!empId) { setCart(prev => prev.map((item, i) => i === index ? { ...item, salesPersonId: null, salesPersonName: null, salesPersonBarcode: null } : item)); return; }
        const employee = employees.find(e => e.id === parseInt(empId));
        setCart(prev => prev.map((item, i) => i === index ? { ...item, salesPersonId: employee?.id, salesPersonName: employee?.name, salesPersonBarcode: employee?.employeeId || employee?.regNo } : item));
    };

    const handleEditPOS = (sale) => {
        console.log(sale, 'sale')
        setEditMode(true);
        setSelectedReportSaleId(sale.id);
    };



    const removeFromCart = (cartKey) => setCart(prev => prev.filter(item => `${item.id}-${item.sizeId}-${item.colorId}` !== cartKey));

    const updateQuantity = (id, value, sizeId, colorId, isDirect = false) => {
        setCart(prev => prev.map(item => {
            if (item.id === id && item.sizeId === sizeId && item.colorId === colorId) {
                const stockLimit = parseFloat(item.stockQty) || 0;
                const isReturn = !!item.isReturn;

                let newQty;
                if (isReturn) {
                    newQty = isDirect ? (parseFloat(value) || 0) : (parseFloat(item.qty) || 0) + (parseFloat(value) || 0);
                    if (newQty > (item.maxReturnQty || 0)) {
                        Swal.fire({ title: "Warning", text: `Maximum return quantity is ${item.maxReturnQty}`, icon: "warning" });
                        newQty = (item.maxReturnQty || 0);
                    }
                    if (newQty < 0) newQty = 0;
                } else {
                    newQty = isDirect ? Math.max(0, parseFloat(value) || 0) : Math.max(1, (parseFloat(item.qty) || 0) + (parseFloat(value) || 0));
                    if (newQty > stockLimit) { Swal.fire({ title: "Warning", text: `Stock limit: ${stockLimit}`, icon: "warning" }); newQty = stockLimit; }
                }

                const updatedFulfillments = allocateStock(newQty, item.stockDetails, retailStoreId);
                return { ...item, qty: newQty, fulfillments: updatedFulfillments };
            }
            return item;
        }));
    };

    const updateFulfillments = (itemId, sizeId, colorId, isReturn, fulfillments) => {
        setCart(prev => prev.map(item =>
            (item.itemId || item.id) === itemId &&
                item.sizeId === sizeId &&
                item.colorId === colorId &&
                !!item.isReturn === !!isReturn
                ? { ...item, fulfillments, qty: fulfillments.reduce((sum, f) => sum + f.qty, 0) }
                : item
        ));
        setShowStockModal(false);
    };

    const updateRate = (id, value, sizeId, colorId) => {
        setCart(prev => prev.map(item => (item.id === id && item.sizeId === sizeId && item.colorId === colorId) ? { ...item, rate: parseFloat(value) || 0, price: parseFloat(value) || 0 } : item));
    };

    const handleCustomerMobileChange = (val) => {
        const cleanPhone = val.replace(/\D/g, '').substring(0, 10);
        setGuestMobile(cleanPhone);
        if (cleanPhone.length === 10) {
            const hit = customers.find(c => (c.contact || '').toString().replace(/\D/g, '') === cleanPhone);
            if (hit) { setSelectedCustomer(hit); setIsGuestCustomer(false); setGuestName(hit.name); }
            else { setSelectedCustomer(null); setIsGuestCustomer(true); }
        } else if (selectedCustomer) { setSelectedCustomer(null); setIsGuestCustomer(true); }
    };

    // Totals Calculation
    const returnTotal = cartWithOffers.reduce((sum, item) => item.isReturn ? sum + (parseFloat(item.price || 0) * parseFloat(item.qty || 0)) : sum, 0);
    const purchaseTotalBeforeOffer = cartWithOffers.reduce((sum, item) => !item.isReturn ? sum + (parseFloat(item.salesPrice || item.price || 0) * parseFloat(item.qty || 0)) : sum, 0);

    const totalBeforeOffer = purchaseTotalBeforeOffer - returnTotal;
    const totalBeforeDiscount = purchaseTotalBeforeOffer - totalOfferDiscount - returnTotal;
    const totalWithoutRounding = totalBeforeDiscount - discount;
    const total = Math.round(totalWithoutRounding);
    const roundOff = parseFloat((total - totalWithoutRounding).toFixed(2));
    const tax = cartWithOffers.reduce((sum, item) => {
        const itemTaxPercent = parseFloat(item.taxPercent || item.Hsn?.tax || item.tax || 0);
        const itemValue = (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0);
        const multiplier = item.isReturn ? -1 : 1;
        // Basic proportional discount spread (simplified)
        const itemDiscount = totalBeforeDiscount !== 0 ? (itemValue / Math.abs(totalBeforeDiscount)) * discount : 0;
        const netItemTotal = itemValue - itemDiscount;
        const itemTax = (netItemTotal - (netItemTotal / (1 + (itemTaxPercent / 100)))) * multiplier;
        return sum + itemTax;
    }, 0);
    const subtotal = totalWithoutRounding - tax;

    const [paidCash, setPaidCash] = useState(0);
    const [paidUPI, setPaidUPI] = useState(0);
    const [paidCard, setPaidCard] = useState(0);
    const [paidOnline, setPaidOnline] = useState(0);
    const [upiRefNo, setUpiRefNo] = useState('');
    const receivedAmount = paidCash + paidUPI + paidCard + paidOnline;
    const balanceReturn = Math.max(0, receivedAmount - total);

    const handleCheckout = async () => {
        if (cart.length === 0) { Swal.fire({ title: "Error", text: "Cart is empty", icon: "error" }); return; }
        if (receivedAmount < total) { Swal.fire({ title: "Error", text: "Incomplete payment", icon: "error" }); return; }

        // const result = await Swal.fire({
        //     title: 'Confirm Sale',
        //     html: `
        //         <div class="text-left space-y-2 p-4 bg-slate-50 rounded-xl">
        //             <div class="flex justify-between"><span>Subtotal:</span> <b>₹${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></div>
        //             <div class="flex justify-between"><span>Discount:</span> <b class="text-red-500">-₹${discount.toLocaleString()}</b></div>
        //             <div class="flex justify-between text-lg border-t pt-2 mt-2 font-bold"><span>Total:</span> <b class="text-indigo-600">₹${total.toLocaleString()}</b></div>
        //         </div>
        //     `,
        //     icon: 'question', showCancelButton: true, confirmButtonColor: '#4f46e5', cancelButtonColor: '#94a3b8', confirmButtonText: 'Confirm & Process'
        // });

        // if (!result.isConfirmed) return;
        setIsProcessing(true);

        try {
            let customerId = selectedCustomer?.id;
            if (isGuestCustomer) {
                const guestPayload = { name: guestName || 'Walk-in Customer', contact: guestMobile, isClient: true, isB2C: true, companyId, userId, partyCode: `WALK-${guestMobile.slice(-4)}-${Math.floor(Math.random() * 1000)}`, active: true, address: 'Walk-in Store', pincode: '000000', gstNo: 'N/A' };
                try { const res = await addParty(guestPayload).unwrap(); customerId = res.data.id; }
                catch (e) { customerId = customers.find(c => c.contact === guestMobile)?.id; if (!customerId) throw new Error("Could not register guest."); }
            }

            const posPayments = [
                ...(paidCash > 0 ? [{ amount: String(paidCash), paymentMode: 'Cash' }] : []),
                ...(paidUPI > 0 ? [{ amount: String(paidUPI), paymentMode: 'UPI', reference_no: upiRefNo }] : []),
                ...(paidCard > 0 ? [{ amount: String(paidCard), paymentMode: 'Card' }] : []),
                ...(paidOnline > 0 ? [{ amount: String(paidOnline), paymentMode: 'Online', }] : []),
            ];

            const invoicePayload = {
                date: new Date().toISOString().split('T')[0],
                customerId,
                supplierId: customerId,
                branchId, userId, companyId, finYearId,
                paymentMethod,
                storeId: retailStoreId,
                poType: "General", poInwardOrDirectInward: "DirectInward",
                netAmount: total, taxAmount: tax, discountValue: discount, discountType: "Flat",
                paidCash, paidUPI, paidCard, paidOnline, receivedAmount, balanceReturn,
                posItems: cartWithOffers,
                posPayments,
                promotionalDiscount: totalOfferDiscount, manualDiscount: discount, roundOff, transactionType,
                exchangeSalesNo
            };

            let apiResponse;
            if (editMode) {
                apiResponse = await updatePointOfSales({ id: editingInvoiceId, ...invoicePayload }).unwrap();
            } else {
                apiResponse = await addPointOfSales(invoicePayload).unwrap();
            }

            if (apiResponse.statusCode !== 0) {
                throw new Error(apiResponse.message || "Failed to save invoice.");
            }

            Swal.fire({ title: editMode ? 'Updated Successfully!' : 'Payment Successful!', icon: 'success', timer: 2000, showConfirmButton: false });
            setPrintData({ docId: apiResponse?.data?.docId || docId, date: new Date(), customerData: selectedCustomer || { name: guestName, contact: guestMobile }, items: cart, payments: { cash: paidCash, upi: paidUPI, card: paidCard }, summary: { subtotal, tax, discount, total, received: receivedAmount, balance: balanceReturn, roundOff }, branchData: locations.find(l => l.id === retailStoreId) });
            setCart([]); setDiscount(0); setSelectedCustomer(null); setPaidCash(0); setPaidUPI(0); setPaidCard(0); setUpiRefNo("");
            setEditMode(false); setEditingInvoiceId(null);
        } catch (error) { Swal.fire({ title: "Error", text: error.message || "Failed to save invoice.", icon: "error" }); }
        finally { setIsProcessing(false); }
    };

    const handleBillSelected = (bill) => {

        console.log(bill, "bill");
        if (!bill) return;

        if (bill.Party) {
            setSelectedCustomer(bill.Party);
            setIsGuestCustomer(false);
            setGuestName(bill.Party.name);
            setGuestMobile(bill.Party.contact);
        } else {
            setSelectedCustomer(null);
            setIsGuestCustomer(true);
            setGuestName(bill.customerName || "Walk-in");
            setGuestMobile(bill.customerMobile || "");
        }

        const returnItems = (bill.PosItems || []).map(item => {
            const masterItem = items.find(i => i.id === item.itemId);
            return {
                ...item,
                Item: masterItem,
                price: parseFloat(item.price),
                qty: parseFloat(item.qty) - parseFloat(item.returnedQty || 0),
                maxReturnQty: parseFloat(item.qty) - parseFloat(item.returnedQty || 0),
                isReturn: true,
                retunBillId: bill.id,
                originalItemId: item.id,
                taxPercent: masterItem?.Hsn?.tax || 5,
                sourceStoreId: retailStoreId
            };
        });

        setCart(prev => [...prev, ...returnItems]);
        Swal.fire({
            title: 'Items Added',
            text: `${returnItems.length} items from Bill ${bill.docId} added as returns.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    };


    const onNew = () => {
        setShowReports(true);
        setEditMode(false);
        setEditingInvoiceId(null);
        setCart([]);
        setDiscount(0);
        setSelectedReportSaleId(null)
    }

    const onViewStock = (item) => {
        setSelectedItemForStock(item);
        setShowStockModal(true);
    };
    return (
        <>
            <ItemOfferModal
                isOpen={showItemOfferModal}
                onClose={() => setShowItemOfferModal(false)}
                selectedItemForOffers={selectedItemForOffers}
                getItemApplicableOffers={getItemApplicableOffers}
                selectedOffersByRow={selectedOffersByRow}
                setSelectedOffersByRow={setSelectedOffersByRow}
                Swal={Swal}
            />
            <ReturnExchangeModal
                isOpen={showReturnExchnageModal}
                onClose={() => setShowReturnExchnageModal(false)}
                onBillSelected={handleBillSelected}
                Swal={Swal}
                salesNo={exchangeSalesNo}
                setSalesNo={setExchangeSalesNo}
            />


            <BarcodeResolutionModal
                barcodeResolution={barcodeResolution}
                setBarcodeResolution={setBarcodeResolution}
            />

            {showReports ? (
                <div className="flex flex-col h-[85vh] bg-[#f1f5f9] text-slate-800 overflow-hidden font-sans select-none border border-slate-200">
                    <POSHeader
                        isBarcodeLoading={isBarcodeLoading}
                        scannerRef={scannerRef}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        handleScan={handleScan}
                        setShowReports={setShowReports}
                        retailLocation={retailLocation}
                        setSelectedReportSaleId={setSelectedReportSaleId}
                        transactionType={transactionType}
                        setTransactionType={setTransactionType}
                        setShowReturnExchnageModal={setShowReturnExchnageModal}
                    />

                    <div className="flex-1 flex overflow-hidden">
                        <POSCartTable
                            isBarcodeLoading={isBarcodeLoading}
                            cart={cartWithOffers}
                            activeRowIndex={activeRowIndex}
                            setActiveRowIndex={setActiveRowIndex}
                            updateQuantity={updateQuantity}
                            handleShowItemOffers={handleShowItemOffers}
                            onViewStock={onViewStock}
                            employees={employees}
                            handleRowSalesPersonChange={handleRowSalesPersonChange}
                            updateRate={updateRate}
                            removeFromCart={removeFromCart}
                            qtyInputRefs={qtyInputRefs}
                        />

                        <POSSidebar
                            isGuestCustomer={isGuestCustomer}
                            guestMobile={guestMobile}
                            handleCustomerMobileChange={handleCustomerMobileChange}
                            guestName={guestName}
                            setGuestName={setGuestName}
                            subtotal={subtotal}
                            totalOfferDiscount={totalOfferDiscount}
                            appliedOffers={appliedOffers}
                            discount={discount}
                            setDiscount={setDiscount}
                            discountRef={discountRef}
                            tax={tax}
                            roundOff={roundOff}
                            total={total}
                            isProcessing={isProcessing}
                            cart={cartWithOffers}
                            handlePayNow={handlePayNow}
                            printData={printData}
                            setPrintData={setPrintData}
                            returnTotal={returnTotal}
                            purchaseTotal={purchaseTotalBeforeOffer}
                        />
                    </div>

                    <POSFooter
                        cart={cart}
                        activeRowIndex={activeRowIndex}
                        qtyInputRefs={qtyInputRefs}
                        discountRef={discountRef}
                        setShowReports={setShowReports}
                        handlePayNow={handlePayNow}
                        scannerRef={scannerRef}
                    />
                </div>
            ) : (
                <div className=" bg-[#F1F1F0] min-h-screen">
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-3 items-start sm:items-center  gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
                        <h1 className="text-md font-bold text-gray-800">Point Of Sale</h1>
                        <button className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-2 rounded-md flex items-center gap-2 text-sm transition-colors shadow-sm" onClick={() => { onNew() }}>
                            <Plus size={14} /> Create New
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[85vh] mt-2 border-2">
                        {/* <PosReports
                            recentSales={posData?.data || []}
                            totalCount={posData?.totalCount || 0}
                            currentPageNumber={currentPageNumber}
                            setCurrentPageNumber={setCurrentPageNumber}
                            dataPerPage={dataPerPage}
                            setDataPerPage={setDataPerPage}
                            serachDocNo={reportsSearchDocNo}
                            setSerachDocNo={setReportsSearchDocNo}
                            searchDate={reportsSearchDate}
                            setSearchDate={setReportsSearchDate}
                            searchCustomerName={reportsSearchCustomerName}
                            setSearchCustomerName={setReportsSearchCustomerName}
                            onEdit={handleEditPOS}
                            isLoading={isRecentSalesFetching}
                        /> */}


                        <PosReportsNew
                            onEdit={handleEditPOS}
                            onDelete={true}
                            onView={true}
                        />
                    </div>
                </div>
            )}

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                total={total}
                paidCash={paidCash}
                setPaidCash={setPaidCash}
                paidUPI={paidUPI}
                setPaidUPI={setPaidUPI}
                paidCard={paidCard}
                setPaidCard={setPaidCard}
                paidOnline={paidOnline}
                setPaidOnline={setPaidOnline}
                upiRefNo={upiRefNo}
                setUpiRefNo={setUpiRefNo}
                receivedAmount={receivedAmount}
                handleCheckout={handleCheckout}
                isProcessing={isProcessing}
                checkRefNo={checkRefNo}
                isAdmin={isAdmin}
                setIsProcessing={setIsProcessing}
            />

            <ReceiptViewerModal
                printData={printData}
                setPrintData={setPrintData}
                Swal={Swal}
            />

            <SalesPersonModal
                isOpen={showSalesPersonModal}
                onClose={() => setShowSalesPersonModal(false)}
                salesPersonScannerRef={salesPersonScannerRef}
                salesPersonBarcode={salesPersonBarcode}
                setSalesPersonBarcode={setSalesPersonBarcode}
                handleSalesPersonScan={handleSalesPersonScan}
                employees={employees}
            />

            <StockLocationModal
                isOpen={showStockModal}
                onClose={() => setShowStockModal(false)}
                item={selectedItemForStock}
                onSave={(fulfillments) => {
                    updateFulfillments(
                        selectedItemForStock.itemId || selectedItemForStock.id,
                        selectedItemForStock.sizeId,
                        selectedItemForStock.colorId,
                        selectedItemForStock.isReturn,
                        fulfillments
                    );
                }}
            />
        </>
    );
};

export default PointOfSale;
