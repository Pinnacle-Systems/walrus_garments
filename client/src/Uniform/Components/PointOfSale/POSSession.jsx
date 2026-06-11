import { useDispatch, useSelector } from 'react-redux';
import {
    Plus, RefreshCw
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useGetItemMasterQuery, useGetItemPriceListQuery } from '../../../redux/uniformService/ItemMasterService';
import { useGetPartyQuery, useAddPartyMutation } from '../../../redux/services/PartyMasterService';
import { useAddSalesInvoiceMutation } from '../../../redux/uniformService/salesInvoiceServices';
import { useGetLocationMasterQuery } from '../../../redux/uniformService/LocationMasterServices';
import { useLazyGetUnifiedStockByBarcodeQuery } from '../../../redux/services/StockService';
import { findFromList, getCommonParams } from '../../../Utils/helper';
import Swal from 'sweetalert2';
import {
    useGetPointOfSalesQuery,
    useLazyGetPointOfSalesQuery,
    useLazyGetPointOfSalesByIdQuery,
    useAddPointOfSalesMutation,
    useUpdatePointOfSalesMutation,
    useGetPointOfSalesByIdQuery,
    useLazyCheckReferenceNumberQuery,
    useLazyGetPartyCreditBalanceQuery,
    useRequestDiscountMutation,
    useApproveDiscountMutation
} from '../../../redux/uniformService/PointOfSalesService';
import { useGetoffersPromotionsQuery } from '../../../redux/uniformService/Offer&PromotionsService';
import { useGetEmployeeQuery } from '../../../redux/services/EmployeeMasterService';
import PosReports from './PosReports';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { findDefaultPriceRow, normalizeLocalItemForPos, allocateStock, filterSearchSuggestions } from './utils/posHelpers';

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
import { pdf } from '@react-pdf/renderer';
import PosMultiCopyPrint from './PosMultiCopyPrint';
import printJS from 'print-js';
import StockLocationModal from './components/StockLocationModal';
import { useGetcollectionsQuery } from '../../../redux/uniformService/CollectionsService';
import { useGetRolesQuery } from '../../../redux/services/RolesMasterService';
import secureLocalStorage from 'react-secure-storage';

const POSSession = ({ isActive = true, tabId, onCartUpdate, globalReservedStock = {}, initialEditSaleId = null, onGoToReports, autoOpenPayment = false }) => {

    // =========================================================================
    // CATEGORY 1: CORE HOOKS, PARAMS & REDUX APIS
    // =========================================================================
    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const dispatch = useDispatch();

    // Redux Selectors
    const openTabsState = useSelector((state) => state.openTabs);
    const currentTab = openTabsState?.tabs?.find(t => t.active && t.name === "POINT OF SALES");
    const pendingPosId = currentTab?.projectId;

    // Redux Lazy Queries & Mutation Hooks
    const [fetchCreditBalance] = useLazyGetPartyCreditBalanceQuery();
    const [fetchPointOfSales] = useLazyGetPointOfSalesQuery();
    const [checkRefNo] = useLazyCheckReferenceNumberQuery();
    const [addParty] = useAddPartyMutation();
    const [addPointOfSales] = useAddPointOfSalesMutation();
    const [updatePointOfSales] = useUpdatePointOfSalesMutation();
    const [requestDiscount] = useRequestDiscountMutation();
    const [approveDiscount] = useApproveDiscountMutation();
    const [getStockByBarcode, { isLoading: isBarcodeLoading }] = useLazyGetUnifiedStockByBarcodeQuery();
    const [fetchRecentSales, { data: posData, isFetching: isRecentSalesFetching }] = useLazyGetPointOfSalesQuery();

    // Redux Subscriptions (Queries)
    const { data: employeeData } = useGetEmployeeQuery({
        params: { branchId, userId, companyId, finYearId }
    });
    const { data: roledData } = useGetRolesQuery({
        params: { branchId, userId, companyId, finYearId }
    });
    const { data: offersData } = useGetoffersPromotionsQuery({
        params: { branchId, userId, finYearId, active: true }
    });
    const { data: collectionsData } = useGetcollectionsQuery({
        params: { branchId, userId, finYearId, active: true }
    });
    const { data: itemsData } = useGetItemMasterQuery({
        params: { branchId, userId, finYearId, active: true }
    });
    const { data: ItemPriceListData } = useGetItemPriceListQuery({
        params: { branchId, userId, finYearId }
    });
    const { data: customerData } = useGetPartyQuery({
        params: { branchId, userId, finYearId }
    });
    const { data: locationsData } = useGetLocationMasterQuery({
        params: { branchId, companyId }
    });

    // Edit Transaction Query
    const [selectedReportSaleId, setSelectedReportSaleId] = useState(initialEditSaleId || null);
    const { data: fetchedSaleResponse, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetPointOfSalesByIdQuery(selectedReportSaleId, { skip: !selectedReportSaleId });

    // Authorization & User Details
    const userRoleId = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'userRoleId');
    const isAdmin = findFromList(userRoleId, roledData?.data, "name") === 'ADMIN' || findFromList(userRoleId, roledData?.data, "name") === 'DEFAULT ADMIN';


    // =========================================================================
    // CATEGORY 2: STATE DECLARATIONS
    // =========================================================================

    // Cart & Product Search States
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMode, setSearchMode] = useState('BARCODE'); // BARCODE or NAME
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All'); // Keeps slot reserved for category alignment
    const [barcodeResolution, setBarcodeResolution] = useState({ open: false, matches: [], resolve: null });

    // Customer States
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerQuery, setCustomerQuery] = useState('');
    const [isGuestCustomer, setIsGuestCustomer] = useState(true);
    const [guestName, setGuestName] = useState('');
    const [guestMobile, setGuestMobile] = useState('');
    const [availableCredit, setAvailableCredit] = useState(0);

    // Transaction Type & Status States
    const [transactionType, setTransactionType] = useState("SALE"); // SALE or RETURN
    const [activeRowIndex, setActiveRowIndex] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [docId, setDocId] = useState("");
    const [approvalStatus, setApprovalStatus] = useState("NONE");
    const [currentBilStatus, setCurrentBilStatus] = useState("PAID");
    const [isCancelBill, setIsCancelBill] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingInvoiceId, setEditingInvoiceId] = useState(null);
    const [returnBillId, setReturnBillId] = useState('');
    const [availableReturnBills, setAvailableReturnBills] = useState([]);
    const [selectedReturnBills, setSelectedReturnBills] = useState(null);

    // Modal & Interactive View Toggles
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReturnExchnageModal, setShowReturnExchnageModal] = useState(false);
    const [showSalesPersonModal, setShowSalesPersonModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [showCartMobile, setShowCartMobile] = useState(false);
    const [showItemOfferModal, setShowItemOfferModal] = useState(false);

    // Modal Context States
    const [selectedItemForStock, setSelectedItemForStock] = useState(null);
    const [selectedItemForOffers, setSelectedItemForOffers] = useState(null);
    const [salesPersonBarcode, setSalesPersonBarcode] = useState('');
    const [selectedOffersByRow, setSelectedOffersByRow] = useState({});

    // Payments Breakdown States
    const [paidCash, setPaidCash] = useState(0);
    const [paidUPI, setPaidUPI] = useState(0);
    const [paidCard, setPaidCard] = useState(0);
    const [paidOnline, setPaidOnline] = useState(0);
    const [upiRefNo, setUpiRefNo] = useState('');
    const [paymentTriggered, setPaymentTriggered] = useState(false);

    // Printing/Receipt States
    const [printData, setPrintData] = useState(null);

    // Reports Pagination & Search States
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [dataPerPage, setDataPerPage] = useState("10");
    const [reportsSearchDocNo, setReportsSearchDocNo] = useState("");
    const [reportsSearchDate, setReportsSearchDate] = useState("");
    const [reportsSearchCustomerName, setReportsSearchCustomerName] = useState("");
    const [reportsTransactionType, setReportsTransactionType] = useState("SALE");
    const [lastRefresh, setLastRefresh] = useState(Date.now());


    // =========================================================================
    // CATEGORY 3: REACT REFS
    // =========================================================================
    const scannerRef = useRef(null);
    const discountRef = useRef(null);
    const qtyInputRefs = useRef({});
    const salesPersonScannerRef = useRef(null);


    // =========================================================================
    // CATEGORY 4: CONFIGURED DATA TRANSFORMS & CONSTANTS
    // =========================================================================
    const employees = employeeData?.data || [];
    const recentSales = posData?.data?.slice(0, 50) || [];
    const customers = (customerData?.data || []);
    const locations = locationsData?.data || [];
    const retailLocation = locations.find(l => l.storeName?.toLowerCase().includes('retail'));
    const retailStoreId = retailLocation?.id;
    const activeOffers = offersData?.data || [];


    // =========================================================================
    // CATEGORY 5: INITIALIZATION & DATA SYNC EFFECTS
    // =========================================================================

    useEffect(() => {
        if (onCartUpdate && tabId !== undefined) {
            onCartUpdate(tabId, cart);
        }
    }, [cart, tabId, onCartUpdate]);

    console.log(availableCredit, "availableCredit")
    useEffect(() => {

        if (selectedReportSaleId) {
            return;
        }
        if (selectedCustomer?.id && !selectedReportSaleId && transactionType === "SALE") {
            fetchCreditBalance(selectedCustomer.id).unwrap().then(res => {
                if (res.statusCode === 0) setAvailableCredit(res.data);
            });
            fetchPointOfSales({ params: { customerId: selectedCustomer.id, reportsTransactionType: 'RETURN', branchId } }).unwrap().then(res => {
                if (res.statusCode === 0) setAvailableReturnBills(res.data);
            });
        } else {
            setAvailableCredit(0);
            setAvailableReturnBills([]);
            setSelectedReturnBills(null);
        }
    }, [selectedCustomer, branchId, fetchCreditBalance, fetchPointOfSales]);

    // Sync selected report sale ID with Redux global pending active state
    useEffect(() => {
        if (pendingPosId) {
            setSelectedReportSaleId(pendingPosId);
        }
    }, [pendingPosId]);

    // Watcher for external initial edit requests
    useEffect(() => {
        if (initialEditSaleId) {
            setSelectedReportSaleId(initialEditSaleId);
            setEditMode(true);
        }
    }, [initialEditSaleId]);

    // DB-to-form values mapping handler
    const syncFormWithDb = useCallback((sale) => {
        console.log(sale, "sale");

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
            setApprovalStatus("NONE");
            setCurrentBilStatus("PAID");
            setIsCancelBill(false);
            return;
        }

        const mappedCart = (sale.PosItems || []).map(item => {
            const masterItem = itemsData?.data?.find(i => i.id === item.itemId);
            return {
                ...item,
                id: item.itemId,
                salesPrice: parseFloat(item.price),
                price: parseFloat(item.price),
                qty: parseFloat(item.qty),
                taxPercent: masterItem?.Hsn?.tax || 5,
                salesPersonId: item.salesPersonId,
                salesPersonBarcode: item?.Employee?.employeeId,
                stockQty: 0,
                sourceStoreId: retailStoreId
            };
        });

        setCart(mappedCart);
        setEditingInvoiceId(sale.id);

        if (sale.LinkedReturnBill) {
            setSelectedReturnBills({ value: sale.LinkedReturnBill.id, label: sale.LinkedReturnBill.docId });
        } else if (sale.isRetrunBillId) {
            setSelectedReturnBills({ value: sale.isRetrunBillId, label: `Bill ID: ${sale.isRetrunBillId}` });
        } else {
            setSelectedReturnBills(null);
        }

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
        setDocId(sale.docId || "");
        setTransactionType(sale.transactionType || "SALE");

        if (sale.Party) {
            setSelectedCustomer(sale.Party);
            setIsGuestCustomer(false);
            setGuestName(sale.Party.name);
            setGuestMobile(sale.Party.contactPersonNumber);
        } else {
            setSelectedCustomer(null);
            setIsGuestCustomer(true);
            setGuestName(sale.customerName || "Walk-in");
            setGuestMobile(sale.customerMobile || "");
        }

        setPaidCash(cash);
        setPaidUPI(upi);
        setPaidCard(card);
        setPaidOnline(online);

        setApprovalStatus(sale.approvalStatus || "NA");
        setCurrentBilStatus(sale.bilStatus ? sale.bilStatus : "NA");
        setIsCancelBill(sale?.isCancel ? sale?.isCancel : false);
        setAvailableCredit(sale?.availableCredit ? sale?.availableCredit : 0)

    }, [itemsData, retailStoreId]);

    // Trigger form synchronization when fetched sale changes
    useEffect(() => {
        if (selectedReportSaleId) syncFormWithDb(fetchedSaleResponse?.data);
        else syncFormWithDb(undefined);
    }, [isSingleLoading, isSingleFetching, selectedReportSaleId, fetchedSaleResponse, syncFormWithDb]);

    useEffect(() => {
        setPaymentTriggered(false);
    }, [selectedReportSaleId]);

    useEffect(() => {
        if (autoOpenPayment && cart.length > 0 && selectedReportSaleId && !paymentTriggered) {
            handlePayNow();
            setPaymentTriggered(true);
        }
    }, [autoOpenPayment, cart, selectedReportSaleId, paymentTriggered]);

    // View router helper
    const setShowReports = (val) => {
        if (val === false && onGoToReports) {
            onGoToReports();
        }
    };


    // =========================================================================
    // CATEGORY 6: OFFERS & PROMOTIONS LOGIC (useMemo & Helpers)
    // =========================================================================

    // Evaluates which store promotions/offers are valid for current cart
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
            } else if (off.discountType === 'Override') {
                const sortedTiers = [...(off.OfferTier || [])].sort((a, b) => b.minQty - a.minQty);
                const tier = sortedTiers.find(t => scopeQty >= t.minQty);
                if (tier) {
                    if (tier.type === 'Percentage') discountValue = (scopeValue * tier.value) / 100;
                    else discountValue = Math.max(0, scopeValue - (tier.value * scopeQty));
                }
            } else if (off.discountType === 'Volume') {
                const sortedTiers = [...(off.OfferTier || [])].sort((a, b) => b.minQty - a.minQty);
                const tier = sortedTiers.find(t => scopeQty >= t.minQty);
                if (tier) {
                    if (tier.type === 'Percentage') discountValue = (scopeValue * tier.value) / 100;
                    else discountValue = tier.value * scopeQty;
                }
            }
            if (discountValue > 0) potential.push({ ...off, calculatedDiscount: discountValue, inScopeItems });
        });
        return potential;
    }, [cart, activeOffers]);

    // Recalculates item pricing based on selected promotions
    const { cartWithOffers, appliedOffers } = useMemo(() => {
        if (!cart.length) return { cartWithOffers: [], appliedOffers: [] };

        const offerScopeTotals = {};
        activeOffers.forEach(off => {
            const inScopeItems = cart.filter(item => {
                if (item.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;
                if (item.barcodeType === 'REGULAR' && !off.applyToRegular) return false;
                if (off.scopeMode === 'Global') return true;
                if (off.scopeMode === 'Item') return off.OfferScope?.some(s => String(s.refId) === String(item.itemId));
                if (off.scopeMode === 'Collection') {
                    return off.OfferScope?.some(scope => {
                        const matchedCollection = collectionsData?.data?.find(col => String(col.id) === String(scope.refId));
                        return matchedCollection?.CollectionItems?.some(ci => String(ci.itemId) === String(item.itemId));
                    });
                }
                return false;
            });
            offerScopeTotals[off.id] = inScopeItems.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0);
        });

        const appliedSet = new Set();
        const computed = cart.map(item => {
            const cartKey = `${item.itemId}-${item.sizeId}-${item.colorId}-${item.barcodeType}`;
            const rowOfferId = selectedOffersByRow[cartKey];
            if (!rowOfferId) return { ...item, priceType: 'SalesPrice', price: item.salesPrice !== undefined ? item.salesPrice : item.price, appliedOfferName: null };

            const selectedOffer = potentialOffers.find(o => o.id === rowOfferId) || activeOffers.find(o => o.id === rowOfferId);
            if (!selectedOffer) return { ...item, priceType: 'SalesPrice', price: item.salesPrice !== undefined ? item.salesPrice : item.price, appliedOfferName: null };

            appliedSet.add(selectedOffer);
            let currentItemPrice = item.salesPrice !== undefined ? parseFloat(item.salesPrice) : parseFloat(item.price);
            const totalScopeQty = offerScopeTotals[selectedOffer.id] || 0;

            if (selectedOffer.discountType === 'Percentage') currentItemPrice *= (1 - parseFloat(selectedOffer.discountValue || 0) / 100);
            else if (selectedOffer.discountType === 'Fixed')
                currentItemPrice = Math.max(0, currentItemPrice - parseFloat(selectedOffer.discountValue || 0));
            else if (selectedOffer.discountType === 'Override') {
                const tier = [...(selectedOffer.OfferTier || [])].sort((a, b) => b.minQty - a.minQty).find(t => totalScopeQty >= t.minQty);
                if (tier) {
                    if (tier.type === 'Fixed') currentItemPrice = tier.value;
                    else currentItemPrice *= (1 - parseFloat(tier.value || 0) / 100);
                }
            }
            else if (selectedOffer.discountType === 'Volume') {
                const tier = [...(selectedOffer.OfferTier || [])].sort((a, b) => b.minQty - a.minQty).find(t => totalScopeQty >= t.minQty);
                if (tier) {
                    if (tier.type === 'Fixed') currentItemPrice = Math.max(0, currentItemPrice - parseFloat(tier.value || 0));
                    else currentItemPrice *= (1 - parseFloat(tier.value || 0) / 100);
                }
            }
            return { ...item, priceType: 'offerPrice', price: Math.max(0, currentItemPrice), appliedOfferName: selectedOffer.name };
        });
        return { cartWithOffers: computed, appliedOffers: Array.from(appliedSet) };
    }, [cart, selectedOffersByRow, potentialOffers, activeOffers, collectionsData]);

    const totalOfferDiscount = cartWithOffers.reduce((sum, item) => item.priceType === 'offerPrice' ? sum + Math.max(0, (parseFloat(item.salesPrice || item.price || 0) - parseFloat(item.price || 0)) * parseFloat(item.qty || 0)) : sum, 0);

    const handleShowItemOffers = (item) => {
        setSelectedItemForOffers(item);
        setShowItemOfferModal(true);
    };

    // Resolves promotions that are explicitly applicable to a product
    const getItemApplicableOffers = (item) => {
        if (!item || !activeOffers.length) return [];

        return activeOffers.map(off => {
            if (item.barcodeType === 'CLEARANCE' && !off.applyToClearance) return null;
            if (item.barcodeType === 'REGULAR' && !off.applyToRegular) return null;

            const targetId = item.itemId;
            let isInScope = false;

            if (off.scopeMode === 'Global') {
                isInScope = true;
            } else if (off.scopeMode === 'Item') {
                isInScope = off.OfferScope?.some(s => String(s.refId) === String(targetId));
            } else if (off.scopeMode === 'Collection') {
                isInScope = off.OfferScope?.some(scope => {
                    if (scope.type !== 'Collection') return false;
                    const matchedCollection = collectionsData?.data?.find(col => String(col.id) === String(scope.refId));
                    if (!matchedCollection) return false;
                    return matchedCollection?.CollectionItems?.some(ci => String(ci.itemId) === String(targetId));
                });
            }

            if (!isInScope) return null;

            const inScopeItems = cartWithOffers.filter(cit => {
                if (cit.barcodeType === 'CLEARANCE' && !off.applyToClearance) return false;
                if (cit.barcodeType === 'REGULAR' && !off.applyToRegular) return false;
                const citId = cit.itemId;
                if (off.scopeMode === 'Global') {
                    return true;
                } else if (off.scopeMode === 'Item') {
                    return off.OfferScope?.some(s => String(s.refId) === String(citId));
                } else if (off.scopeMode === 'Collection') {
                    return off.OfferScope?.some(scope => {
                        if (scope.type !== 'Collection') return false;
                        const matchedCollection = collectionsData?.data?.find(col => String(col.id) === String(scope.refId));
                        if (!matchedCollection) return false;
                        return matchedCollection.CollectionItems?.some(ci => String(ci.itemId) === String(citId));
                    });
                }
                return false;
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

            const isMatched = off.OfferRule?.[0]?.logic === 'OR' ? results.some(r => r) : results.every(r => r);

            if (isMatched) {
                return { ...off, _metrics: { scopeQty, scopeValue } };
            }
            return null;
        }).filter(Boolean);
    };


    // =========================================================================
    // CATEGORY 7: BARCODE SCANNER & SUGGESTIONS SEARCH
    // =========================================================================

    // Auto-complete suggestion queries based on active search Mode
    useEffect(() => {
        const query = searchQuery?.trim().toLowerCase();
        if (!query || query.length < 1 || selectedReportSaleId || searchMode !== 'NAME') {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        let active = true;

        const items = itemsData?.data || [];
        const itemPriceList = ItemPriceListData?.data || [];
        const allMatches = filterSearchSuggestions({ query, items, itemPriceList, retailStoreId });

        // Clear suggestions initially to only show items once their stock is verified
        setSuggestions([]);
        setShowSuggestions(false);

        if (allMatches.length > 0) {
            (async () => {
                const updated = await Promise.all(allMatches.slice(0, 100).map(async (m) => {
                    try {
                        const res = await getStockByBarcode({ params: { barcode: m.barcode, storeId: retailStoreId, branchId } }).unwrap();
                        const totalStock = res?.data?.stockQty || (res?.matches ? res.matches.reduce((sum, match) => sum + (match.stockQty || 0), 0) : 0);
                        return { ...m, stockQty: totalStock, uomId: res?.data?.uomId || (res?.matches?.[0]?.uomId) };
                    } catch { return m; }
                }));
                if (!active) return;
                const withStockOnly = updated.filter(item => item.stockQty > 0);
                setSuggestions(withStockOnly);
                setShowSuggestions(withStockOnly.length > 0);
            })();
        }

        return () => {
            active = false;
        };
    }, [searchQuery, itemsData, ItemPriceListData, selectedReportSaleId, branchId, retailStoreId, searchMode, getStockByBarcode]);

    // Triggers barcode resolution logic on enter
    const handleScan = async (e) => {
        if (e.key === 'Enter') {
            if (selectedReportSaleId) return;
            const barcode = searchQuery.trim();
            if (!barcode) return;

            if (searchMode === 'BARCODE') {
                try {
                    const response = await getStockByBarcode({ params: { barcode, branchId } }).unwrap();
                    if (response.statusCode === 0) {
                        const { data, matches, needsResolution } = response;

                        if (needsResolution || (Array.isArray(matches) && matches.length > 1)) {
                            setBarcodeResolution({
                                open: true,
                                matches: matches,
                                resolve: (selectedItems) => {
                                    if (Array.isArray(selectedItems)) {
                                        selectedItems.forEach(item => addToCart(item));
                                    } else if (selectedItems) {
                                        addToCart(selectedItems);
                                    }
                                }
                            });
                            setSearchQuery('');
                            setTimeout(() => scannerRef.current?.focus(), 100);

                        } else if (data || (Array.isArray(matches) && matches.length === 1)) {
                            const resolvedData = data || matches[0];
                            addToCart({ ...resolvedData });
                            setSearchQuery('');
                            setTimeout(() => scannerRef.current?.focus(), 100);
                        } else {
                            Swal.fire({ title: "Warning", text: "Barcode not found", icon: "warning" });
                        }
                        return;
                    } else {
                        Swal.fire({ title: "Warning", text: response.message || "Barcode not found", icon: "warning" });
                    }
                } catch (error) {
                    console.error("Barcode search failed", error);
                    Swal.fire({ title: "Error", text: "Failed to fetch barcode details", icon: "error" });
                }
            }
        }
    };

    // Adds unique product to cart when selection is made from name searches
    const handleSelectSuggestion = async (suggestion) => {
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
        try {
            const res = await getStockByBarcode({ params: { barcode: suggestion.barcode, storeId: retailStoreId, branchId } }).unwrap();

            if (res.statusCode === 0) {
                const { data, matches, needsResolution } = res;

                if (needsResolution || (Array.isArray(matches) && matches.length > 1)) {
                    setBarcodeResolution({
                        open: true,
                        matches: matches,
                        resolve: (selectedItems) => {
                            if (Array.isArray(selectedItems)) {
                                selectedItems.forEach(item => addToCart(item));
                            } else if (selectedItems) {
                                addToCart(selectedItems);
                            }
                        }
                    });
                } else if (data || (Array.isArray(matches) && matches.length === 1)) {
                    const resolvedData = data || matches[0];
                    addToCart({ ...resolvedData });
                } else {
                    addToCart(suggestion);
                }
            } else {
                addToCart(suggestion);
            }
        } catch (error) {
            console.error("Suggestion selection failed", error);
            addToCart(suggestion);
        }
        scannerRef.current?.focus();
    };


    // =========================================================================
    // CATEGORY 8: CART OPERATIONS (Cart modifiers, Stock allocations)
    // =========================================================================

    // Greedy stock allocation helper is imported from utils/posHelpers.js

    // Resolves and appends items to shopping Cart list
    const addToCart = (product) => {
        const itemId = product.itemId || product.id;
        const sizeId = product.sizeId || 0;
        const colorId = product.colorId || 0;
        const uomId = product.uomId || product.Item?.uomId || 0;
        const barcode = product.barcode || "";

        setCart(prev => {
            const existingIndex = prev.findIndex((item) => {
                const isIdMatch = (item.itemId === itemId) || (item.id === itemId);
                const isSizeMatch = (item.sizeId || 0) === (sizeId || 0);
                const isColorMatch = (item.colorId || 0) === (colorId || 0);
                const isUomMatch = (item.uomId || 0) === (uomId || 0);
                const isBarcodeMatch = (item.barcode || "") === (barcode || "");
                const isReturnMatch = !!item.isReturn === !!product.isReturn;

                return isIdMatch && isSizeMatch && isColorMatch && isUomMatch && isBarcodeMatch && isReturnMatch;
            });

            if (existingIndex > -1) {
                const existing = prev[existingIndex];
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
                    if (currentStoreId && !stockDetails.find(s => s.storeId === currentStoreId)) {
                        stockDetails.push({
                            storeId: currentStoreId,
                            storeName: product.location || "Store",
                            stockQty: product.stockQty || 0
                        });
                    }

                    const totalStock = stockDetails.reduce((sum, s) => sum + (parseFloat(s.stockQty) || 0), 0);
                    const key = `${existing.itemId || existing.id}-${existing.sizeId || 0}-${existing.colorId || 0}-${existing.uomId || 0}`;
                    const othersReserved = (globalReservedStock[key] || 0) - (parseFloat(existing.qty) || 0);
                    const effectiveTotalStock = Math.max(0, totalStock - Math.max(0, othersReserved));

                    if (newQty > effectiveTotalStock) {
                        Swal.fire({
                            icon: "warning",
                            title: "Max stock reached (Reserved in other tab)",
                            showConfirmButton: false,
                        });
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

            const items = itemsData?.data || [];
            const fullPriceList = ItemPriceListData?.data || [];
            const itemPrices = fullPriceList.filter(p => p.itemId === itemId);
            const variantHit = itemPrices.find(p => p.sizeId === product.sizeId && p.colorId === product.colorId);
            const lookupPrice = variantHit?.salesPrice || itemPrices.find(p => !p.sizeId && !p.colorId)?.salesPrice || itemPrices[0]?.salesPrice || 0;
            const masterItem = product?.Item || items.find(i => i.id === itemId);
            const barcodeDetails = ItemPriceListData?.data?.flatMap(item => item.ItemBarcodes)?.filter(i => i.barcode === barcode)?.[0];

            const stockDetails = [{
                storeId: product.storeId || product.locationId || retailStoreId,
                storeName: product.location || "Retail Store",
                stockQty: product.stockQty || 0
            }];

            const totalStock = stockDetails.reduce((sum, s) => sum + (parseFloat(s.stockQty) || 0), 0);
            const key = `${itemId}-${product.sizeId || 0}-${product.colorId || 0}-${product.uomId || product.Item?.uomId || 0}`;
            const othersReserved = globalReservedStock[key] || 0;
            const effectiveTotalStock = Math.max(0, totalStock - othersReserved);

            if (!product.isReturn && effectiveTotalStock < 1) {
                toast.warning("Max stock reached (Reserved in other tab)");
                return prev;
            }

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
                sourceStoreId: retailStoreId,
                barcodeType: barcodeDetails?.barcodeType,
            }];
        });

        const existingItem = cart.find(item => {
            const isIdMatch = (item.itemId === itemId) || (item.id === itemId);
            const isSizeMatch = (item.sizeId || 0) === (sizeId || 0);
            const isColorMatch = (item.colorId || 0) === (colorId || 0);
            const isUomMatch = (item.uomId || 0) === (uomId || 0);
            const isBarcodeMatch = (item.barcode || "") === (barcode || "");
            const isReturnMatch = !!item.isReturn === !!product.isReturn;
            return isIdMatch && isSizeMatch && isColorMatch && isUomMatch && isBarcodeMatch && isReturnMatch;
        });

        if (!existingItem || !existingItem.salesPersonId) {
            setShowSalesPersonModal(true);
            setTimeout(() => salesPersonScannerRef.current?.focus(), 500);
        } else {
            setTimeout(() => scannerRef.current?.focus(), 100);
        }
    };

    // Removes an element matching given composite keys
    const removeFromCart = (cartKey) => {
        setCart(prev => prev.filter(item => `${item.id}-${item.sizeId || 0}-${item.colorId || 0}-${item.uomId || 0}-${!!item.isReturn}` !== cartKey));
    };

    // Adjusts element quantity within stock parameters
    const updateQuantity = (id, value, sizeId, colorId, isDirect = false) => {
        setCart(prev => prev.map(item => {
            if (item.id === id && item.sizeId === sizeId && item.colorId === colorId) {
                const key = `${item.itemId || item.id}-${item.sizeId || 0}-${item.colorId || 0}-${item.uomId || 0}`;
                const othersReserved = (globalReservedStock[key] || 0) - (parseFloat(item.qty) || 0);
                const stockLimit = Math.max(0, (parseFloat(item.stockQty) || 0) - Math.max(0, othersReserved));
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
                    if (newQty > stockLimit) {
                        Swal.fire({ title: "Warning", text: `Stock limit: ${stockLimit} (Reserved in other tabs)`, icon: "warning" });
                        newQty = stockLimit;
                    }
                }

                const updatedFulfillments = allocateStock(newQty, item.stockDetails, retailStoreId);
                return { ...item, qty: newQty, fulfillments: updatedFulfillments };
            }
            return item;
        }));
    };

    // Custom stock location fulfillment update callback
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

    // Manual override for rates
    const updateRate = (id, value, sizeId, colorId) => {
        setCart(prev => prev.map(item => (item.id === id && item.sizeId === sizeId && item.colorId === colorId) ? { ...item, rate: parseFloat(value) || 0, price: parseFloat(value) || 0 } : item));
    };


    // =========================================================================
    // CATEGORY 9: SALES PERSON ASSIGNMENTS
    // =========================================================================

    // Assigns salesperson to unassigned rows upon scanning employee badge
    const handleSalesPersonScan = (barcode) => {
        if (!barcode) return;
        const employee = employees.find(e => e.employeeId === barcode || e.regNo === barcode);
        setCart(prev => prev.map(item => !item.salesPersonId ? { ...item, salesPersonId: employee?.id || null, salesPersonBarcode: barcode, salesPersonName: employee?.name || "Unknown" } : item));
        setShowSalesPersonModal(false);
        setSalesPersonBarcode('');
        setTimeout(() => scannerRef.current?.focus(), 100);
    };

    // Updates row's salesperson assignment manually
    const handleRowSalesPersonChange = (index, empId) => {
        if (!empId) {
            setCart(prev => prev.map((item, i) => i === index ? { ...item, salesPersonId: null, salesPersonName: null, salesPersonBarcode: null } : item));
            return;
        }
        const employee = employees.find(e => e.id === parseInt(empId));
        setCart(prev => prev.map((item, i) => i === index ? { ...item, salesPersonId: employee?.id, salesPersonName: employee?.name, salesPersonBarcode: employee?.employeeId || employee?.regNo } : item));
    };


    // =========================================================================
    // CATEGORY 10: CUSTOMER & PROFILE SELECTION HANDLERS
    // =========================================================================

    // Manages mobile number inputs and auto-looks up profiles
    const handleCustomerMobileChange = (val) => {
        const cleanPhone = val.replace(/\D/g, '').substring(0, 10);
        setGuestMobile(cleanPhone);
        if (cleanPhone.length === 10) {
            const hit = customers.find(c => (c.contactPersonNumber || '').toString().replace(/\D/g, '') === cleanPhone);
            if (hit) {
                setSelectedCustomer(hit);
                setIsGuestCustomer(false);
                setGuestName(hit.name);
            } else {
                if (selectedCustomer) setGuestName("");
                setSelectedCustomer(null);
                setIsGuestCustomer(true);
            }
        } else if (selectedCustomer) {
            setGuestName("");
            setSelectedCustomer(null);
            setIsGuestCustomer(true);
        }
    };


    // =========================================================================
    // CATEGORY 11: FINANCIAL CALCULATIONS & TOTALS
    // =========================================================================
    const returnTotal = cartWithOffers.reduce((sum, item) => item.isReturn ? sum + (parseFloat(item.price || 0) * parseFloat(item.qty || 0)) : sum, 0);
    const purchaseTotalBeforeOffer = cartWithOffers.reduce((sum, item) => !item.isReturn ? sum + (parseFloat(item.salesPrice || item.price || 0) * parseFloat(item.qty || 0)) : sum, 0);

    const totalBeforeOffer = purchaseTotalBeforeOffer - returnTotal;
    const totalBeforeDiscount = purchaseTotalBeforeOffer - totalOfferDiscount - returnTotal;
    // const totalWithoutRounding = totalBeforeDiscount - discount;
    const totalWithoutRounding = totalBeforeDiscount;

    // const total = Math.round(totalWithoutRounding) ;

    const total = Math.round(totalWithoutRounding) - discount;
    const roundOff = parseFloat((total - totalWithoutRounding).toFixed(2));

    const tax = cartWithOffers.reduce((sum, item) => {
        const itemTaxPercent = parseFloat(item.taxPercent || item.Hsn?.tax || item.tax || 0);
        const itemValue = (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0);
        const multiplier = item.isReturn ? -1 : 1;
        const itemDiscount = totalBeforeDiscount !== 0 ? (itemValue / Math.abs(totalBeforeDiscount)) * discount : 0;
        const netItemTotal = itemValue - itemDiscount;
        const itemTax = (netItemTotal - (netItemTotal / (1 + (itemTaxPercent / 100)))) * multiplier;
        return sum + itemTax;
    }, 0);

    const subtotal = totalWithoutRounding - tax;

    // Settlement and Payout values
    const receivedAmount = paidCash + paidUPI + paidCard + paidOnline;
    const netPayableValue = total - availableCredit;
    const absNetPayableValue = Math.abs(netPayableValue);
    const balanceReturn = Math.max(0, receivedAmount - absNetPayableValue);


    // =========================================================================
    // CATEGORY 12: CHECKOUT & TRANSACTION HANDLERS
    // =========================================================================

    const handlePayNow = async () => {
        if (cart.length === 0 || isProcessing) return;

        if (transactionType === 'RETURN') {
            const result = await Swal.fire({
                title: 'Save Return?',
                text: 'Do you want to save this return transaction?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#4f46e5',
                confirmButtonText: 'Yes, Save'
            });
            if (result.isConfirmed) {
                handleCheckout();
            }
            return;
        }

        if (isAdmin && approvalStatus === 'PENDING') {
            if (discount <= 0) {
                const result = await Swal.fire({
                    title: 'No Discount Entered',
                    text: 'You have not entered any discount. Do you want to proceed with 0 discount?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#4f46e5',
                    confirmButtonText: 'Yes, Approve'
                });
                if (!result.isConfirmed) return;
            }
            setIsProcessing(true);
            try {
                const res = await approveDiscount({ id: editingInvoiceId, discountValue: discount }).unwrap();
                if (res.statusCode === 0) {
                    Swal.fire({ title: 'Approved Successfully!', icon: 'success', timer: 2000, showConfirmButton: false });
                    setCart([]);
                    setDiscount(0);
                    setSelectedCustomer(null);
                    setGuestName("");
                    setGuestMobile("");
                    setEditMode(false);
                    setEditingInvoiceId(null);
                    setSelectedReportSaleId(null);
                    setSearchMode('BARCODE');
                } else {
                    throw new Error(res.message || "Failed to approve request.");
                }
            } catch (error) {
                Swal.fire({ title: "Error", text: error.message || "Failed to approve request.", icon: "error" });
            } finally {
                setIsProcessing(false);
            }
            return;
        }

        const currentPhone = selectedCustomer ? selectedCustomer.contactPersonNumber : guestMobile;
        const phoneRegex = /^[0-9]{10}$/;
        const cleanPhone = currentPhone?.toString().replace(/\D/g, '') || '';

        if (!phoneRegex.test(cleanPhone)) {
            Swal.fire({ title: "Error", text: "A valid 10-digit mobile number is required!", icon: "error" });
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
    const triggerSilentPrint = async (printPayload) => {
        <Modal isOpen={true} widthClass="w-[300pt] h-[95%]">
            <PDFViewer style={{ width: "100%", height: "90vh" }}>
                <PosMultiCopyPrint
                    {...printPayload}
                // branchData={branchList?.data?.find(b => b.id === branchId)}
                />
            </PDFViewer>
        </Modal>
    };


    const handleRequestDiscount = async () => {
        if (cart.length === 0) { Swal.fire({ title: "Error", text: "Cart is empty", icon: "error" }); return; }

        const currentPhone = selectedCustomer ? selectedCustomer.contactPersonNumber : guestMobile;
        const phoneRegex = /^[0-9]{10}$/;
        const cleanPhone = currentPhone?.toString().replace(/\D/g, '') || '';

        if (!phoneRegex.test(cleanPhone)) {
            Swal.fire({
                title: "Mobile Number Required",
                text: "A valid 10-digit customer mobile number is mandatory to request a discount!",
                icon: "warning"
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Request Discount Approval?',
            text: 'This will send your current cart to the Admin for discount entry.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            confirmButtonText: 'Yes, Send Request'
        });

        if (!result.isConfirmed) return;
        setIsProcessing(true);

        try {
            let customerId = selectedCustomer?.id;
            if (isGuestCustomer) {
                const existingCustomer = customers.find(c => c.contactPersonNumber === guestMobile && c.isB2C === true);
                if (existingCustomer) {
                    Swal.fire({
                        title: "Customer Already Exists",
                        text: `The mobile number ${guestMobile} is already registered to ${existingCustomer.name}. Please search and select the existing customer.`,
                        icon: "warning"
                    });
                    setIsProcessing(false);
                    return;
                }

                const guestPayload = { name: guestName || 'Walk-in Customer', contactPersonNumber: guestMobile, isClient: true, isB2C: true, companyId, userId, partyCode: `WALK-${guestMobile.slice(-4)}-${Math.floor(Math.random() * 1000)}`, active: true, address: 'Walk-in Store', pincode: '000000', gstNo: 'N/A' };
                try {
                    const res = await addParty(guestPayload).unwrap();
                    customerId = res.data.id;
                } catch (e) {
                    customerId = customers.find(c => c.contactPersonNumber === guestMobile)?.id;
                    if (!customerId) throw new Error("Could not register guest.");
                }
            }

            const invoicePayload = {
                date: new Date().toISOString().split('T')[0],
                customerId,
                supplierId: customerId,
                branchId, userId, companyId, finYearId,
                paymentMethod: "Cash",
                storeId: retailStoreId,
                poType: "General", poInwardOrDirectInward: "DirectInward",
                netAmount: total, taxAmount: tax, discountValue: 0, discountType: "Flat",
                paidCash: 0, paidUPI: 0, paidCard: 0, paidOnline: 0, receivedAmount: 0, balanceReturn: 0,
                posItems: cartWithOffers,
                posPayments: [],
                promotionalDiscount: totalOfferDiscount, manualDiscount: 0, roundOff,
                approvalStatus: "PENDING",
                transactionType,
                // bilStatus: "UNPAID"
            };

            const apiResponse = await requestDiscount(invoicePayload).unwrap();

            if (apiResponse.statusCode !== 0) {
                throw new Error(apiResponse.message || "Failed to send request.");
            }

            Swal.fire({ title: 'Request Sent!', text: 'Bill saved as PENDING. Admin can now enter discount.', icon: 'success' });
            setCart([]);
            setDiscount(0);
            setSelectedCustomer(null);
            setGuestName("");
            setGuestMobile("");
        } catch (error) {
            Swal.fire({ title: "Error", text: error.message || "Failed to send request.", icon: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveUnpaid = async () => {
        if (cart.length === 0 || isProcessing) return;

        if (isGuestCustomer && !guestMobile) {
            Swal.fire({ title: "Error", text: "Customer mobile is required for credit sales!", icon: "error" });
            return;
        }

        const result = await Swal.fire({
            title: 'Save as Unpaid?',
            text: 'This bill will be saved as a Credit Sale. Ledger entry will not be created.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            confirmButtonText: 'Yes, Save'
        });

        if (result.isConfirmed) {
            handleCheckout(false, true, "UNPAID", "DELIVERYRECEIPT");
        }
    };



    const handleSaveAndPrint = async () => {
        if (cart.length === 0 || isProcessing) return;

        const currentPhone = selectedCustomer ? selectedCustomer.contactPersonNumber : guestMobile;
        const phoneRegex = /^[0-9]{10}$/;
        const cleanPhone = currentPhone?.toString().replace(/\D/g, '') || '';

        if (!phoneRegex.test(cleanPhone)) {
            Swal.fire({ title: "Error", text: "A valid 10-digit mobile number is required!", icon: "error" });
            return;
        }

        handleCheckout(true, false, "UNPAID", "DELIVERYRECEIPT");
    };

    console.log(editMode, "editMode", editingInvoiceId)


    const handleCheckout = async (isApprovalOnly = false, isCreditSale = false, saleType = '', printType = '') => {
        if (cart.length === 0) { Swal.fire({ title: "Error", text: "Cart is empty", icon: "error" }); return; }

        if (!isApprovalOnly && !isCreditSale && transactionType !== "RETURN") {
            const isRefundMode = netPayableValue < 0;

            if (isRefundMode) {
                if (receivedAmount > absNetPayableValue) {
                    Swal.fire({
                        title: "Error",
                        text: `Refund payout (₹${receivedAmount}) cannot exceed the excess credit available (₹${absNetPayableValue}).`,
                        icon: "error"
                    });
                    return;
                }
            } else {
                if (receivedAmount !== absNetPayableValue) {
                    Swal.fire({
                        title: "Error",
                        text: "Payment amount mismatch. Please enter the exact net payable amount.",
                        icon: "error"
                    });
                    return;
                }
            }
        }

        setIsProcessing(true);

        try {
            let customerId = selectedCustomer?.id;
            if (isGuestCustomer) {
                const existingCustomer = customers.find(c => c.contactPersonNumber === guestMobile);
                if (existingCustomer) {
                    Swal.fire({
                        title: "Customer Already Exists",
                        text: `The mobile number ${guestMobile} is already registered to ${existingCustomer.name}. Please search and select the existing customer.`,
                        icon: "warning"
                    });
                    setIsProcessing(false);
                    return;
                }

                const guestPayload = {
                    name: guestName || 'Walk-in Customer', contactPersonNumber: guestMobile, isClient: true,
                    isB2C: existingCustomer ? false : true,
                    companyId, userId, partyCode: `WALK-${guestMobile.slice(-4)}-${Math.floor(Math.random() * 1000)}`, active: true
                };
                try {
                    const res = await addParty(guestPayload).unwrap();
                    customerId = res.data.id;
                } catch (e) {
                    customerId = customers.find(c => c.contactPersonNumber === guestMobile)?.id;
                    if (!customerId) throw new Error("Could not register guest.");
                }
            }

            const totalPayableBeforeCredit = total;
            const appliedCredit = total > 0 ? Math.min(availableCredit, totalPayableBeforeCredit) : 0;
            const netPayable = totalPayableBeforeCredit - appliedCredit;
            const isRefundMode = netPayableValue < 0;

            const posPayments = [
                ...(appliedCredit > 0 ? [{ amount: String(appliedCredit), paymentMode: 'STORE_CREDIT' }] : []),
                ...(paidCash > 0 ? [{ amount: String(paidCash), paymentMode: isRefundMode ? 'Cash Refund' : 'Cash' }] : []),
                ...(paidUPI > 0 ? [{ amount: String(paidUPI), paymentMode: isRefundMode ? 'UPI Refund' : 'UPI', reference_no: upiRefNo }] : []),
                ...(paidCard > 0 ? [{ amount: String(paidCard), paymentMode: isRefundMode ? 'Card Refund' : 'Card' }] : []),
                ...(paidOnline > 0 ? [{ amount: String(paidOnline), paymentMode: isRefundMode ? 'Online Refund' : 'Online' }] : []),
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
                exchangeSalesNo: returnBillId,
                returnBillId: returnBillId,
                bilStatus: transactionType == "RETURN" ? "RETURNED" : saleType,
                isRetrunBillId: selectedReturnBills?.value || null,
                isExchange: selectedReturnBills ? true : false,
                isExchangeBillId: selectedReturnBills?.value || null,

                availableCredit,
                approvalStatus: (editMode && approvalStatus === 'PENDING' && isAdmin) ? "APPROVED" :
                    (editMode && docId === 'DRAFT' && isAdmin) ? "APPROVED" :
                        (editMode && docId === 'PROCEED') ? "COMPLETED" : "NONE"
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

            const getSuccessMessage = () => {
                if (editMode) return 'Updated Successfully!';
                if (transactionType === 'RETURN') return 'Return Saved Successfully!';
                if (saleType == "UNPAID") return "unpaid bill save ";
                return 'Payment Successful!';
            };

            Swal.fire({ title: getSuccessMessage(), icon: 'success', timer: 2000, showConfirmButton: false });

            if (transactionType !== 'RETURN') {
                const printPayload = {
                    docId: apiResponse?.data?.docId || docId,
                    date: new Date(),
                    customerData: selectedCustomer || { name: guestName, contactPersonNumber: guestMobile },
                    items: cart,
                    payments: { cash: paidCash, upi: paidUPI, card: paidCard },
                    summary: { subtotal, tax, discount, total, received: Math.abs(receivedAmount), balance: Math.abs(balanceReturn), roundOff },
                    branchData: locations.find(l => l.id === retailStoreId),
                    returnReferences: selectedReturnBills ? [selectedReturnBills.label] : (returnBillId ? [returnBillId] : []),
                    bilStatus: transactionType == "RETURN" ? "RETURNED" : saleType,
                    printCopies: 2,
                    showSummarySlip: editMode ? false : true
                };


                console.log(printType == 'RECEIPTWITHBILL', "printType")


                if (printType == "DELIVERYRECEIPT") {
                    setPrintData({ ...printPayload, isDeliveryReceipt: true });
                }
                else if (printType == "RECEIPTWITHBILL") {
                    setPrintData(printPayload);
                } else {
                    setPrintData(printPayload);
                }
            }

            setCart([]);
            setDiscount(0);
            setSelectedCustomer(null);
            setPaidCash(0);
            setPaidUPI(0);
            setPaidCard(0);
            setUpiRefNo("");
            setAvailableCredit(0);
            setAvailableReturnBills([]);
            setSelectedReturnBills(null);
            setEditMode(false);
            setEditingInvoiceId(null);
            setSelectedReportSaleId(null);
            setGuestName("");
            setGuestMobile("");
            setIsGuestCustomer(true);
            setSearchMode('BARCODE');

        } catch (error) {
            Swal.fire({ title: "Error", text: error.message || "Failed to save invoice.", icon: "error" });
        } finally {
            setIsProcessing(false);
        }
    };

    // Loads return items from older transactions into cart
    const handleBillSelected = (bill) => {
        console.log(bill, "bill");
        if (!bill) return;

        if (bill.Party) {
            setSelectedCustomer(bill.Party);
            setIsGuestCustomer(false);
            setGuestName(bill.Party.name);
            setGuestMobile(bill.Party.contactPersonNumber);
        } else {
            setSelectedCustomer(null);
            setIsGuestCustomer(true);
            setGuestName(bill.customerName || "Walk-in");
            setGuestMobile(bill.customerMobile || "");
        }

        const returnItems = (bill.PosItems || []).map(item => {
            const masterItem = itemsData?.data?.find(i => i.id === item.itemId);
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
                sourceStoreId: retailStoreId,
                salesPersonBarcode: item.Employee?.employeeId
            };
        });

        setCart(prev => {
            const filteredCart = prev.filter(item => !(item.isReturn && item.retunBillId === bill.id));
            return [...filteredCart, ...returnItems];
        });

        Swal.fire({
            title: 'Items Added',
            text: `${returnItems.length} items from Bill ${bill.docId} added as returns.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    };

    // Resets current billing terminal session parameters
    const onNew = () => {
        setShowReports(true);
        setEditMode(false);
        setEditingInvoiceId(null);
        setCart([]);
        setDiscount(0);
        setSelectedReportSaleId(null);
        setGuestMobile("");
        setGuestName("Walk-in");
        setIsGuestCustomer(true);
        setSelectedCustomer(null);
        setTransactionType("SALE");
        setSearchQuery("");
        setCurrentBilStatus("PAID");
        setAvailableCredit(0);
    };

    // Triggers stock viewer popup
    const onViewStock = (item) => {
        setSelectedItemForStock(item);
        setShowStockModal(true);
    };

    // Redirects editing triggers inside recent transactions list
    const handleEditPOS = (sale) => {
        console.log(sale, 'sale');
        setEditMode(true);
        setSelectedReportSaleId(sale.id);
    };


    // =========================================================================
    // CATEGORY 13: KEYBOARD SHORTCUTS & EVENT LISTENERS
    // =========================================================================
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isActive) return;
            const tag = document.activeElement?.tagName?.toLowerCase();
            const isTyping = tag === 'input' || tag === 'textarea';

            if (e.key === 'F10') { e.preventDefault(); scannerRef.current?.focus(); return; }
            if (e.key === 'F8') { e.preventDefault(); handlePayNow(); return; }
            if (e.key === 'F9') { e.preventDefault(); handleSaveUnpaid(); return; }
            if (e.key === 'F7') { e.preventDefault(); handleSaveAndPrint(); return; }

            if (e.key === 'F2') {
                e.preventDefault();
                setSearchMode('BARCODE');
                scannerRef.current?.focus();
                return;
            }

            if (e.key === 'F3') {
                e.preventDefault();
                setSearchMode('NAME');
                scannerRef.current?.focus();
                return;
            }

            if (e.key === 'F4' && !selectedReportSaleId) {
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

                if (e.key === 'Delete' && cart.length > 0 && !selectedReportSaleId) {
                    e.preventDefault();
                    const idx = Math.min(activeRowIndex, cart.length - 1);
                    const item = cart[idx];
                    removeFromCart(`${item.id}-${item.sizeId || 0}-${item.colorId || 0}-${item.uomId || 0}-${!!item.isReturn}`);
                    setActiveRowIndex(prev => Math.max(prev - 1, 0));
                    return;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart, activeRowIndex, isProcessing, guestName, guestMobile, isGuestCustomer, selectedCustomer, isActive, selectedReportSaleId, setSearchMode, scannerRef]);


    // =========================================================================
    // CATEGORY 14: JSX UI RENDERING
    // =========================================================================
    return (
        <>
            {/* Modal Elements */}
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
                setShowReturnExchnageModal={setShowReturnExchnageModal}
                onClose={() => { setShowReturnExchnageModal(false); }}
                onBillSelected={handleBillSelected}
                Swal={Swal}
                salesNo={returnBillId}
                setSalesNo={setReturnBillId}
                setTransactionType={setTransactionType}
                cart={cart}
            />

            {/* Layout Wrapper */}
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
                    selectedReportSaleId={selectedReportSaleId}
                    approvalStatus={approvalStatus}
                    isAdmin={isAdmin}
                    onNew={onNew}
                    suggestions={suggestions}
                    showSuggestions={showSuggestions}
                    setShowSuggestions={setShowSuggestions}
                    onSelectSuggestion={handleSelectSuggestion}
                    searchMode={searchMode}
                    setSearchMode={setSearchMode}
                    cart={cart}
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
                        selectedReportSaleId={selectedReportSaleId}
                        approvalStatus={approvalStatus}
                        isAdmin={isAdmin}
                        currentBilStatus={currentBilStatus}
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
                        selectedReportSaleId={selectedReportSaleId}
                        isAdmin={isAdmin}
                        handleRequestDiscount={handleRequestDiscount}
                        handleSaveUnpaid={handleSaveUnpaid}
                        handleSaveAndPrint={handleSaveAndPrint}
                        approvalStatus={approvalStatus}
                        currentBilStatus={currentBilStatus}
                        transactionType={transactionType}
                        availableCredit={availableCredit}
                        availableReturnBills={availableReturnBills}
                        selectedReturnBills={selectedReturnBills}
                        setSelectedReturnBills={setSelectedReturnBills}
                        isCancelBill={isCancelBill}
                    />
                </div>

                <POSFooter
                    cart={cart}
                    activeRowIndex={activeRowIndex}
                    qtyInputRefs={qtyInputRefs}
                    discountRef={discountRef}
                    setShowReports={setShowReports}
                    handlePayNow={handlePayNow}
                    handleSaveUnpaid={handleSaveUnpaid}
                    scannerRef={scannerRef}
                    isAdmin={isAdmin}
                    approvalStatus={approvalStatus}
                    setSearchMode={setSearchMode}
                />
            </div>

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
                availableCredit={availableCredit}
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

            <BarcodeResolutionModal
                barcodeResolution={barcodeResolution}
                setBarcodeResolution={setBarcodeResolution}
            />
        </>
    );
};

export default POSSession;
