import { useDispatch, useSelector } from 'react-redux';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import PosThermalPrint from './PosThermalPrint';
import {
    Search,
    ShoppingCart,
    User,
    Plus,
    Minus,
    Trash2,
    CreditCard,
    Banknote,
    ScanBarcode,
    X,
    ChevronRight,
    Package,
    CheckCircle2,
    Clock,
    Calendar,
    Filter,
    Loader2,
    Eye,
    Gift,
    Zap,
    FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useGetItemMasterQuery, useGetItemPriceListQuery } from '../../../redux/uniformService/ItemMasterService';
import { useGetPartyQuery, useAddPartyMutation } from '../../../redux/services/PartyMasterService';
import { useAddSalesInvoiceMutation } from '../../../redux/uniformService/salesInvoiceServices';
import { useGetLocationMasterQuery } from '../../../redux/uniformService/LocationMasterServices';
import { useLazyGetUnifiedStockByBarcodeQuery } from '../../../redux/services/StockService';
import { getCommonParams } from '../../../Utils/helper';
import Swal from 'sweetalert2';
import { useGetPointOfSalesQuery, useAddPointOfSalesMutation } from '../../../redux/uniformService/PointOfSalesService';
import { useGetoffersPromotionsQuery } from '../../../redux/uniformService/Offer&PromotionsService';
import { useGetEmployeeQuery } from '../../../redux/services/EmployeeMasterService';
import PosReports from './PosReports';
import { useEffect, useRef, useState } from 'react';
import Modal from '../../../UiComponents/Modal';
import VarientsSelection from '../StockTransfer/VarientsSelection';

// Child components can be defined in separate files later or kept here for now for speed
// I'll define them in-line for now since I'm building the "Page" as requested.

const findDefaultPriceRow = (item) => {
    const priceRows = item?.ItemPriceList || [];
    return priceRows.find((row) => !row?.sizeId && !row?.colorId) || priceRows[0] || null;
};

const normalizeLocalItemForPos = (item, branchId, storeId) => {
    const defaultPriceRow = findDefaultPriceRow(item);
    if (!item || !defaultPriceRow) {
        return null;
    }

    return {
        id: item.id,
        itemId: item.id,
        Item: item,
        Size: null,
        Color: null,
        sizeId: null,
        colorId: null,
        uomId: null,
        branchId,
        storeId,
        barcode: defaultPriceRow?.barcode || "",
        itemName: item?.name || "",
        itemCode: item?.code || "",
        salesPrice: defaultPriceRow?.salesPrice || item?.salesPrice || 0,
        offerPrice: defaultPriceRow?.offerPrice || 0,
        price: defaultPriceRow?.salesPrice || item?.salesPrice || 0,
        priceType: "SalesPrice",
    };
};

const buildResolutionLabel = (match) =>
    `${match.item_name || match?.Item?.name || "Item"} / ${match.size || match?.Size?.name || "-"} / ${match.color || match?.Color?.name || "-"} / Loc: ${match.location || "-"} / Qty ${match.stockQty || 0}`;

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
    const [addParty] = useAddPartyMutation();
    const scannerRef = useRef(null);
    const discountRef = useRef(null);
    const qtyInputRefs = useRef({});
    const [activeRowIndex, setActiveRowIndex] = useState(0);
    const [printData, setPrintData] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [docId, setDocId] = useState("");
    const [barcodeResolution, setBarcodeResolution] = useState({ open: false, matches: [], resolve: null });
    const [showSalesPersonModal, setShowSalesPersonModal] = useState(false);
    const [salesPersonBarcode, setSalesPersonBarcode] = useState('');
    const salesPersonScannerRef = useRef(null);

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

        setShowPaymentModal(true);
    };

    // Key Map — POS Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = document.activeElement?.tagName?.toLowerCase();
            const isTyping = tag === 'input' || tag === 'textarea';

            // F10 — Focus barcode scanner
            if (e.key === 'F10') {
                e.preventDefault();
                scannerRef.current?.focus();
                return;
            }

            // F8 — Open payment modal
            if (e.key === 'F8') {
                e.preventDefault();
                handlePayNow();
                return;
            }

            // F2 — Focus Qty of active cart row
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

            // F3 — Focus Discount input
            if (e.key === 'F3') {
                e.preventDefault();
                discountRef.current?.focus();
                discountRef.current?.select();
                return;
            }

            // F4 — Void (clear cart)
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
                            Swal.fire({ title: "Info", text: "Cart cleared", icon: "info", timer: 1500, showConfirmButton: false });
                        }
                    });
                }
                return;
            }

            // F12 — Toggle POS Reports menu
            if (e.key === 'F12') {
                e.preventDefault();
                setShowReports(prev => !prev);
                return;
            }

            // Arrow Up/Down — Navigate cart rows (only when not typing)
            if (!isTyping) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveRowIndex(prev => Math.min(prev + 1, cart.length - 1));
                    return;
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveRowIndex(prev => Math.max(prev - 1, 0));
                    return;
                }
                // Delete — remove active row
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

    const [appliedOffers, setAppliedOffers] = useState([]);
    const [potentialOffers, setPotentialOffers] = useState([]);
    const [showItemOfferModal, setShowItemOfferModal] = useState(false);
    const [selectedItemForOffers, setSelectedItemForOffers] = useState(null);
    const [selectedOffersByRow, setSelectedOffersByRow] = useState({});
    const { data: offersData } = useGetoffersPromotionsQuery({
        params: { branchId, userId, finYearId, active: true }
    });

    const activeOffers = offersData?.data || [];




    useEffect(() => {
        if (!activeOffers.length || !cart.length) {
            setPotentialOffers([]);
            setAppliedOffers([]);
            setCart(prev => prev.map(item => ({ ...item, priceType: 'SalesPrice', price: item.salesPrice || item.price })));
            return;
        }

        const potentialOffersTemp = [];
        const itemPromos = {}; // Map of cart item key -> best offer
        let discountValue = 0;

        activeOffers.forEach(off => {
            const inScopeItems = cart.filter(item => {
                const cartKey = `${item.id}-${item.sizeId}-${item.colorId}`;
                if (off.scopeMode === 'Global') return true;
                if (off.scopeMode === 'Item') return off.OfferScope?.some(s => s.refId === (item.itemId || item.id));
                // Add more scope checks if needed
                return false;
            });

            if (!inScopeItems.length) return;

            const scopeQty = inScopeItems.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0);
            const scopeValue = inScopeItems.reduce((sum, i) => sum + ((parseFloat(i.salesPrice || i.price) || 0) * (parseFloat(i.qty) || 0)), 0);

            const rules = off.OfferRule?.[0]?.conditions?.rules || [];
            const logic = off.OfferRule?.[0]?.logic || 'AND';

            const results = rules.map(rule => {
                const target = rule.field === 'Minimum Quantity' ? scopeQty : (rule.field === 'Cart Value' ? scopeValue : 0);
                if (rule.operator === '>=') return target >= parseFloat(rule.value);
                if (rule.operator === '<=') return target <= parseFloat(rule.value);
                if (rule.operator === '==') return target === parseFloat(rule.value);
                return true;
            });

            const isValid = logic === 'AND' ? results.every(r => r) : results.some(r => r);
            if (!isValid && rules.length > 0) return;

            console.log(off, 'off')
            if (off.discountType === 'Percentage') {
                discountValue = (scopeValue * (off.discountValue || 0)) / 100;

                if (off.maxDiscountValue && discountValue > off.maxDiscountValue) discountValue = off.maxDiscountValue;

            } else if (off.discountType === 'Fixed') {
                discountValue = off.discountValue || 0;
            } else if (['Volume', 'Override'].includes(off.discountType)) {
                const tiers = off.OfferTier || [];
                const sortedTiers = [...tiers].sort((a, b) => b.minQty - a.minQty);
                const tier = sortedTiers.find(t => scopeQty >= t.minQty);

                if (tier) {
                    if (tier.type === 'Percentage') {
                        discountValue = (scopeValue * tier.value) / 100;
                    } else if (off.discountType === 'Override') {
                        // Discount is (Current Sales Value - New Override Value)
                        const overrideTotal = tier.value * scopeQty;
                        discountValue = Math.max(0, scopeValue - overrideTotal);
                    } else {
                        discountValue = tier.value;
                    }
                }
            }

            if (discountValue > 0) {
                potentialOffersTemp.push({ ...off, calculatedDiscount: discountValue, inScopeItems });
            }
        });

        console.log(discountValue, 'discountValue')

        console.log(potentialOffersTemp, 'potentialOffers')

        // Store potential offers but don't apply them yet
        setPotentialOffers(potentialOffersTemp);
    }, [cart, activeOffers]);

    // Apply offers only when explicitly selected through modal
    useEffect(() => {
        if (!cart.length) {
            setAppliedOffers([]);
            return;
        }

        const newAppliedOffersMap = new Map();

        const newCart = cart.map(item => {
            const cartKey = `${item.id}-${item.sizeId}-${item.colorId}`;
            const rowOfferId = selectedOffersByRow[cartKey];

            if (!rowOfferId) {
                return {
                    ...item,
                    priceType: 'SalesPrice',
                    price: item.salesPrice !== undefined ? item.salesPrice : item.price,
                    appliedOfferName: null
                };
            }

            const selectedOffer = potentialOffers.find(o => o.id === rowOfferId) || activeOffers.find(o => o.id === rowOfferId);

            if (!selectedOffer) {
                return {
                    ...item,
                    priceType: 'SalesPrice',
                    price: item.salesPrice !== undefined ? item.salesPrice : item.price,
                    appliedOfferName: null
                };
            }

            newAppliedOffersMap.set(selectedOffer.id, selectedOffer);

            let currentItemPrice = item.salesPrice !== undefined ? parseFloat(item.salesPrice) : parseFloat(item.price);

            if (selectedOffer.discountType === 'Percentage') {
                const discountPercent = parseFloat(selectedOffer.discountValue || 0);
                currentItemPrice = currentItemPrice * (1 - discountPercent / 100);
            } else if (selectedOffer.discountType === 'Fixed') {
                const discountPerUnit = parseFloat(item.qty) > 0 ? (selectedOffer.discountValue || 0) / parseFloat(item.qty) : 0;
                currentItemPrice = Math.max(0, currentItemPrice - discountPerUnit);
            } else if (selectedOffer.discountType === 'Override') {
                const tiers = selectedOffer.OfferTier || [];
                const itemQty = parseFloat(item.qty) || 0;
                const tier = [...tiers].sort((a, b) => b.minQty - a.minQty).find(t => itemQty >= t.minQty);
                if (tier) {
                    if (tier.type === 'Fixed') {
                        currentItemPrice = tier.value;
                    } else if (tier.type === 'Percentage') {
                        currentItemPrice = currentItemPrice * (1 - parseFloat(tier.value || 0) / 100);
                    }
                }
            } else if (selectedOffer.discountType === 'Volume') {
                const tiers = selectedOffer.OfferTier || [];
                const itemQty = parseFloat(item.qty) || 0;
                const tier = [...tiers].sort((a, b) => b.minQty - a.minQty).find(t => itemQty >= t.minQty);
                if (tier) {
                    if (tier.type === 'Percentage') {
                        currentItemPrice = currentItemPrice * (1 - parseFloat(tier.value || 0) / 100);
                    } else {
                        currentItemPrice = Math.max(0, currentItemPrice - parseFloat(tier.value || 0));
                    }
                }
            }

            return {
                ...item,
                priceType: 'offerPrice',
                price: Math.max(0, currentItemPrice),
                appliedOfferName: selectedOffer.name
            };
        });

        if (JSON.stringify(newCart) !== JSON.stringify(cart)) {
            setCart(newCart);
        }

        setAppliedOffers(Array.from(newAppliedOffersMap.values()));
    }, [selectedOffersByRow, potentialOffers, activeOffers]);

    const totalOfferDiscount = cart.reduce((sum, item) => {
        if (item.priceType === 'offerPrice') {
            const diff = (parseFloat(item.salesPrice || item.price || 0) - parseFloat(item.price || 0)) * parseFloat(item.qty || 0);
            return sum + Math.max(0, diff);
        }
        return sum;
    }, 0);

    const handleShowItemOffers = (item) => {
        setSelectedItemForOffers(item);
        setShowItemOfferModal(true);
    };

    console.log(selectedItemForOffers, "selectedItemForOffers")
    console.log(cart, "cart")
    console.log(activeOffers, "activeOffers")
    console.log(appliedOffers, "appliedOffers")

    const getItemApplicableOffers = (item) => {

        console.log(item, 'checking offers for item')

        if (!item || !activeOffers.length) return [];

        return activeOffers.filter(off => {
            // Check Scope
            let isInScope = false;
            if (off.scopeMode === 'Global') isInScope = true;
            else if (off.scopeMode === 'Item') isInScope = off.OfferScope?.some(s => s.refId === item.itemId);
            else if (off.scopeMode === 'Collection') isInScope = off.OfferScope?.some(s => s.refId === (item.itemId));
            console.log('isInScope', isInScope);

            if (!isInScope) return false;

            // Check if Conditions are currently met to show as "Available"
            const inScopeItems = cart.filter(cit => {
                if (off.scopeMode === 'Global') return true;
                if (off.scopeMode === 'Item') return off.OfferScope?.some(s => s.refId === cit.itemId);
                if (off.scopeMode === 'Collection') return off.OfferScope?.some(s => s.refId === (cit.itemId));


                return false;
            });

            console.log('inScopeItems', inScopeItems);


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

    // Queries
    const { data: itemsData, isLoading: itemsLoading } = useGetItemMasterQuery({
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
    const [addPointOfSales] = useAddPointOfSalesMutation();
    const [getStockByBarcode, { isLoading: isBarcodeLoading }] = useLazyGetUnifiedStockByBarcodeQuery();
    const { data: posData } = useGetPointOfSalesQuery({
        params: { branchId, companyId, finYearId }
    });


    const items = itemsData?.data || [];
    const recentSales = posData?.data?.slice(0, 50) || [];
    const customers = (customerData?.data || []).filter(c => c.isB2C);

    console.log(customers, "customers")
    const locations = locationsData?.data || [];

    // Identify Retail Location
    const retailLocation = locations.find(l =>
        l.storeName?.toLowerCase().includes('retail'));
    const retailStoreId = retailLocation?.id;

    // Filter items
    const filteredItems = items.filter(item => {
        const defaultPriceRow = findDefaultPriceRow(item);
        const itemName = item?.name?.toLowerCase() || '';
        const itemCode = item?.code?.toLowerCase() || '';
        const barcode = defaultPriceRow?.barcode?.toLowerCase() || '';
        const matchesSearch = (
            itemName.includes(searchQuery.toLowerCase()) ||
            itemCode.includes(searchQuery.toLowerCase()) ||
            barcode.includes(searchQuery.toLowerCase())
        );
        return matchesSearch;
    });

    // Handle Quick Scan
    const resolveBarcodeMatch = (matches = []) => {
        const normalizedMatches = matches.map(m => ({
            ...m,
            item_name: m.item_name || m?.Item?.name || "Item",
            size: m.size || m?.Size?.name || "-",
            color: m.color || m?.Color?.name || "-",
            location: m.location || "-",
            stockQty: m.stockQty || 0,
        }));

        return new Promise((resolve) => {
            setBarcodeResolution({
                open: true,
                matches: normalizedMatches,
                resolve
            });
        });
    };

    const handleScan = async (e) => {
        if (e.key === 'Enter') {
            const barcode = searchQuery.trim();
            if (!barcode) return;

            // Prioritize API search for real-time stock/details
            try {
                const response = await getStockByBarcode({
                    params: {
                        barcode,
                        // storeId: retailStoreId,
                        branchId
                    }
                }).unwrap();

                const resolvedData = response?.needsResolution
                    ? await resolveBarcodeMatch(response.matches || [])
                    : response?.data;

                if (response?.needsResolution && !resolvedData) return;

                if (response.statusCode === 0 && resolvedData) {
                    if (Array.isArray(resolvedData)) {
                        resolvedData.forEach(item => addToCart({ ...item }));
                    } else {
                        addToCart({ ...resolvedData });
                    }
                    setSearchQuery('');
                    return;
                }
            } catch (error) {
                console.error("Barcode API search failed:", error);
            }

            // Fallback to local items if API fails or not found
            const localItem = items.find((item) => {
                const defaultPriceRow = findDefaultPriceRow(item);
                return (
                    item?.name?.toLowerCase() === barcode.toLowerCase() ||
                    item?.code?.toLowerCase() === barcode.toLowerCase() ||
                    defaultPriceRow?.barcode === barcode
                );
            });

            if (!localItem) {
                Swal.fire({ title: "Warning", text: "Barcode not found in stock or local database", icon: "warning" });
                return;
            }

            const normalizedLocalItem = normalizeLocalItemForPos(localItem, branchId, retailStoreId);
            if (!normalizedLocalItem?.barcode) {
                Swal.fire({ title: "Warning", text: "Selected item is missing a barcode on its default price row", icon: "warning" });
                return;
            }

            try {
                const localResponse = await getStockByBarcode({
                    params: {
                        barcode: normalizedLocalItem.barcode,
                        storeId: retailStoreId,
                        branchId
                    }
                }).unwrap();

                const resolvedLocalData = localResponse?.needsResolution
                    ? await resolveBarcodeMatch(localResponse.matches || [])
                    : localResponse?.data;

                if (localResponse?.needsResolution && !resolvedLocalData) return;

                if (localResponse.statusCode === 0 && resolvedLocalData) {
                    if (Array.isArray(resolvedLocalData)) {
                        resolvedLocalData.forEach(item => addToCart({ ...item }));
                    } else {
                        addToCart({ ...resolvedLocalData });
                    }
                    setSearchQuery('');
                    return;
                }
            } catch (error) {
                console.error("Local item stock lookup failed:", error);
            }

            Swal.fire({ title: "Warning", text: "Item was found in Item Master but is not available in current store stock", icon: "warning" });
        }
    };

    // Price calculation utility
    const calculateEffectivePrice = (item, qty) => {
        const salesPrice = parseFloat(item.salesPrice || item.price || 0);
        return { price: salesPrice, priceType: 'SalesPrice' };
    };

    const getVariantPrice = (itemId, sizeId, colorId) => {
        const fullPriceList = ItemPriceListData?.data || [];
        const itemPrices = fullPriceList.filter(p => p.itemId === itemId);

        // Match specific variant
        const variantHit = itemPrices.find(p => p.sizeId === sizeId && p.colorId === colorId);
        if (variantHit && variantHit.salesPrice) return variantHit.salesPrice;

        // Fallback to default (Legacy Stock pattern)
        const defaultHit = itemPrices.find(p => !p.sizeId && !p.colorId) || itemPrices[0];
        return defaultHit?.salesPrice || 0;
    };

    // Cart actions
    const addToCart = (product) => {
        // Guard: Initial Stock Check
        const stockLimit = parseFloat(product.stockQty) || 0;
        if (stockLimit <= 0) {
            Swal.fire({ title: "Error", text: "Out of stock!", icon: "error" });
            return;
        }

        setCart(prev => {
            // Check for uniqueness based on ID + Size + Color
            const prodId = product.id;
            const existing = prev.find(item =>
                item.id === prodId &&
                item.sizeId === product.sizeId &&
                item.colorId === product.colorId
            );

            if (existing) {
                const currentQty = parseFloat(existing.qty) || 0;
                if (currentQty >= stockLimit) {
                    toast.warning(`Maximum stock limit reached (${stockLimit})`);
                    return prev;
                }

                return prev.map(item => {
                    if (item.id === prodId &&
                        item.sizeId === product.sizeId &&
                        item.colorId === product.colorId) {
                        const newQty = currentQty + 1;
                        // Preserve current price; offer engine will re-evaluate based on new qty
                        return { ...item, qty: newQty };
                    }
                    return item;
                });
            }

            // Determine correct Sales Price from Price List based on Variant
            const itemId = product.itemId || product.id;
            const lookupPrice = getVariantPrice(itemId, product.sizeId, product.colorId);
            const masterItem = product?.Item || items.find(i => i.id === itemId);
            const initialProduct = { ...product, Item: masterItem, salesPrice: lookupPrice, price: lookupPrice };

            const { price, priceType } = calculateEffectivePrice(initialProduct, 1);
            return [...prev, {
                ...initialProduct,
                qty: 1,
                price: price,
                rate: price,
                priceType: priceType,
                taxPercent: product?.Item?.Hsn?.tax || 5
            }];
        });
        Swal.fire({ title: "Success", text: `${product.itemName || product.item_name} Added`, icon: "success", timer: 1500, showConfirmButton: false });
        setShowSalesPersonModal(true);
        setTimeout(() => salesPersonScannerRef.current?.focus(), 500);
    };

    const handleSalesPersonScan = (barcode) => {
        if (!barcode) return;

        const employee = employees.find(e => e.employeeId === barcode || e.regNo === barcode);

        setCart(prev => {
            // Assign salesperson to all items that don't have one yet in the current batch
            return prev.map(item =>
                !item.salesPersonId
                    ? {
                        ...item,
                        salesPersonId: employee?.id || null,
                        salesPersonBarcode: barcode,
                        salesPersonName: employee?.name || "Unknown"
                    }
                    : item
            );
        });

        setShowSalesPersonModal(false);
        setSalesPersonBarcode('');
        setTimeout(() => scannerRef.current?.focus(), 100);
    };

    const handleRowSalesPersonChange = (index, empId) => {
        if (!empId) {
            setCart(prev => prev.map((item, i) =>
                i === index ? { ...item, salesPersonId: null, salesPersonName: null, salesPersonBarcode: null } : item
            ));
            return;
        }

        const employee = employees.find(e => e.id === parseInt(empId));
        setCart(prev => prev.map((item, i) =>
            i === index ? {
                ...item,
                salesPersonId: employee?.id,
                salesPersonName: employee?.name,
                salesPersonBarcode: employee?.employeeId || employee?.regNo
            } : item
        ));
    };

    // Sync active row to last item when cart grows
    useEffect(() => {
        if (cart.length > 0) {
            setActiveRowIndex(cart.length - 1);
        }
    }, [cart.length]);

    console.log(cart, "cartt")

    const removeFromCart = (cartKey) => {
        setCart(prev => prev.filter(item => `${item.id}-${item.sizeId}-${item.colorId}` !== cartKey));
    };

    const updateQuantity = (id, value, sizeId, colorId, isDirect = false) => {
        setCart(prev => prev.map(item => {
            if (item.id === id && item.sizeId === sizeId && item.colorId === colorId) {
                const stockLimit = parseFloat(item.stockQty) || 0;
                let newQty;
                if (isDirect) {
                    newQty = Math.max(0, parseFloat(value) || 0);
                    if (newQty % 1 !== 0) newQty = parseFloat(newQty.toFixed(3));
                } else {
                    newQty = Math.max(1, (parseFloat(item.qty) || 0) + (parseFloat(value) || 0));
                }

                // Restrict to stock limit
                if (newQty > stockLimit) {
                    Swal.fire({ title: "Warning", text: `Restricted to stock quantity: ${stockLimit}`, icon: "warning" });
                    newQty = stockLimit;
                }

                // Preserve the current price/priceType so the offer engine can re-evaluate on next render
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const updateRate = (id, value, sizeId, colorId) => {
        setCart(prev => prev.map(item => {
            if (item.id === id && item.sizeId === sizeId && item.colorId === colorId) {
                const newRate = parseFloat(value) || 0;
                return { ...item, rate: newRate, price: newRate };
            }
            return item;
        }));
    };

    const totalBeforeOffer = cart.reduce((sum, item) => sum + (parseFloat(item.salesPrice || item.price) || 0) * (parseFloat(item.qty) || 0), 0);
    const totalBeforeDiscount = Math.max(0, totalBeforeOffer - totalOfferDiscount);
    const totalWithoutRounding = Math.max(0, totalBeforeDiscount - discount);
    const total = Math.round(totalWithoutRounding);
    const roundOff = parseFloat((total - totalWithoutRounding).toFixed(2));

    const tax = cart.reduce((sum, item) => {
        const itemTaxPercent = parseFloat(item.taxPercent || item.Hsn?.tax || item.tax || 0);
        const itemTotal = (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0);
        const itemDiscount = totalBeforeDiscount > 0 ? (itemTotal / totalBeforeDiscount) * discount : 0;
        const netItemTotal = itemTotal - itemDiscount;
        // Inclusive Tax Formula: Tax = Amount - (Amount / (1 + TaxRate/100))
        const itemTax = netItemTotal - (netItemTotal / (1 + (itemTaxPercent / 100)));
        return sum + itemTax;
    }, 0);

    const subtotal = totalWithoutRounding - tax; // subtotal is the taxable amount (Exclusive)

    const handleCheckout = async () => {
        // 1. Initial Guards
        if (cart.length === 0) { Swal.fire({ title: "Error", text: "Cart is empty", icon: "error" }); return; }
        if (cart.some(item => (parseFloat(item.qty) || 0) <= 0)) {
            Swal.fire({ title: "Error", text: "One or more items have zero quantity!", icon: "error" });
            return;
        }


        // 3. Payment Validation
        if (receivedAmount < total) {
            Swal.fire({ title: "Error", text: `Incomplete payment! Missing: ₹${(total - receivedAmount).toLocaleString()}`, icon: "error" });
            return;
        }

        // 4. Confirm Dialog (Await the result!)
        const result = await Swal.fire({
            title: 'Confirm Sale',
            html: `
            <div class="text-left space-y-2 p-4 bg-slate-50 rounded-xl">
                <div class="flex justify-between"><span>Subtotal:</span> <b>₹${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></div>
                <div class="flex justify-between"><span>Discount:</span> <b class="text-red-500">-₹${discount.toLocaleString()}</b></div>
                <div class="flex justify-between"><span>Tax:</span> <b>₹${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></div>
                <div class="flex justify-between"><span>Round Off:</span> <b>₹${roundOff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></div>
                <div class="flex justify-between text-lg border-t pt-2 mt-2 font-bold">
                    <span>Total:</span> <b class="text-indigo-600">₹${total.toLocaleString()}</b>
                </div>
            </div>
        `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Confirm & Process'
        });

        if (!result.isConfirmed) return; // Exit if user cancels
        console.log(result?.isConfirmed, 'result')
        setIsProcessing(true);

        try {
            let customerId = selectedCustomer?.id;

            // 5. Handle Guest Customer Creation
            if (isGuestCustomer) {
                try {
                    const guestPayload = {
                        name: guestName || 'Walk-in Customer',
                        contact: guestMobile,
                        isClient: true,
                        isB2C: true,
                        companyId,
                        userId,
                        partyCode: `WALK-${guestMobile.slice(-4)}-${Math.floor(Math.random() * 1000)}`,
                        active: true,
                        address: 'Walk-in Store',
                        pincode: '000000',
                        gstNo: 'N/A',
                        // salesPersonId: selectedSalesPerson?.id || null,
                    };
                    const res = await addParty(guestPayload).unwrap();
                    customerId = res.data.id;
                } catch (e) {
                    // Fallback: Check if guest already exists by phone
                    const existing = customers.find(c => c.contact === guestMobile);
                    if (existing) {
                        customerId = existing.id;
                    } else {
                        throw new Error("Could not register or find guest customer.");
                    }
                }
            }

            const invoicePayload = {
                date: new Date().toISOString().split('T')[0],
                customerId,
                supplierId: customerId,
                branchId,
                userId,
                companyId,
                finYearId,
                paymentMethod,
                storeId: retailStoreId,
                poType: "General",
                poInwardOrDirectInward: "DirectInward",
                netAmount: total,
                taxAmount: tax,
                discountValue: discount,
                discountType: "Flat",
                paidCash,
                paidUPI,
                paidCard,
                receivedAmount,
                balanceReturn,
                posItems: cart,
                promotionalDiscount: totalOfferDiscount,
                manualDiscount: discount,
                roundOff: roundOff,
            };

            const apiResponse = await addPointOfSales(invoicePayload).unwrap();

            // 7. Success & Reset
            Swal.fire({
                title: 'Payment Successful!',
                text: `Invoice generated successfully.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            // Prepare Printing Data
            setPrintData({
                docId: apiResponse?.data?.docId || docId,
                date: new Date(),
                customerData: selectedCustomer || { name: guestName, contact: guestMobile },
                items: cart,
                payments: { cash: paidCash, upi: paidUPI, card: paidCard },
                summary: { subtotal, tax, discount, total, received: receivedAmount, balance: balanceReturn, roundOff },
                branchData: locations.find(l => l.id === retailStoreId)
            });

            // Clear Form
            setCart([]);
            setDiscount(0);
            setSelectedCustomer(null);
            setPaidCash(0);
            setPaidUPI(0);
            setPaidCard(0);

        } catch (error) {
            Swal.fire({ title: "Error", text: error.message || "Failed to save invoice.", icon: "error" });
            console.error("Checkout Error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrintPreview = () => {
        if (cart.length === 0) {
            Swal.fire({ title: "Error", text: "Add items first to see preview", icon: "error" });
            return;
        }
        setPrintData({
            docId: "DRAFT-" + Math.floor(Math.random() * 1000),
            date: new Date(),
            customerData: selectedCustomer || { name: guestName || 'Walk-in Customer', contact: guestMobile || '9999999999' },
            items: cart,
            payments: { cash: paidCash, upi: paidUPI, card: paidCard },
            summary: { subtotal, tax, discount, total, received: receivedAmount, balance: balanceReturn },
            branchData: locations.find(l => l.id === retailStoreId)
        });
    };




    const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
    const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

    const handleCustomerSelect = (value) => {
        setCustomerQuery(value);
        setShowCustomerSuggestions(true);
        setSelectedCustomer(null);

        const cleanPhone = value.replace(/\D/g, '');
        if (!selectedCustomer && value.length >= 10 && /^\d+$/.test(value)) {
            // Prompt add if no match occurs, but users can see suggestions instead
            const exactMatch = customers.find(c => c.contact?.replace(/\D/g, '') === cleanPhone);
            if (!exactMatch) {
                setIsAddingNewCustomer(true);
                setGuestMobile(value);
                setGuestName('');
            } else {
                setIsAddingNewCustomer(false);
            }
        } else {
            setIsAddingNewCustomer(false);
        }
    }

    // 1. Pre-process query once
    const searchVal = (customerQuery || '').toLowerCase();
    const cleanPhoneQuery = searchVal.replace(/\D/g, '');
    const isPhoneSearch = cleanPhoneQuery.length >= 3;
    const isNameSearch = searchVal.length >= 3;

    const filteredCustomerSuggestions = isNameSearch || isPhoneSearch
        ? customers.filter(c => {
            // Phone Match
            if (isPhoneSearch && c.contact?.toString().replace(/\D/g, '').includes(cleanPhoneQuery)) {
                return true;
            }
            // Name Match
            if (isNameSearch && c.name?.toLowerCase().includes(searchVal)) {
                return true;
            }
            return false;
        }).slice(0, 8)
        : [];

    const handleCustomerMobileChange = (val) => {
        const cleanPhone = val.replace(/\D/g, '').substring(0, 10);
        setGuestMobile(cleanPhone);

        if (cleanPhone.length === 10) {
            const hit = customers.find(c => (c.contact || '').toString().replace(/\D/g, '') === cleanPhone);
            if (hit) {
                setSelectedCustomer(hit);
                setIsGuestCustomer(false);
                setGuestName(hit.name);
                Swal.fire({ title: "Info", text: `Welcome back, ${hit.name}`, icon: "info", timer: 1500, showConfirmButton: false });
            } else {
                setSelectedCustomer(null);
                setIsGuestCustomer(true);
                // We keep current guestName unless it was explicitly one from the last hit
            }
        } else {
            // If they delete digits, we should clear the selected status but keep the mobile digits
            if (selectedCustomer) {
                setSelectedCustomer(null);
                setIsGuestCustomer(true);
            }
        }
    }

    const [paidCash, setPaidCash] = useState(0);
    const [paidUPI, setPaidUPI] = useState(0);
    const [paidCard, setPaidCard] = useState(0);

    const receivedAmount = paidCash + paidUPI + paidCard;
    const balanceReturn = Math.max(0, receivedAmount - total);

    return (
        <>
            <Modal isOpen={showItemOfferModal} widthClass="w-[450px]" onClose={() => setShowItemOfferModal(false)}>
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
                    {/* Header */}
                    <div className="p-3 bg-gradient-to-br from-indigo-900 to-blue-900 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-white/20 rounded-lg">
                                <Gift size={18} className="text-yellow-300" />
                            </div>
                            <div>
                                <h2 className="text-xs font-black uppercase tracking-widest">{selectedItemForOffers?.Item?.name}</h2>
                                <p className="text-[9px] font-bold text-blue-200 uppercase tracking-tighter">Available Promotions</p>
                            </div>
                        </div>
                        <button onClick={() => setShowItemOfferModal(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Offer List */}
                    <div className="p-3 bg-slate-50 space-y-2 max-h-[400px] overflow-auto">{console.log(getItemApplicableOffers(selectedItemForOffers), "Applicable offers for item")}
                        {getItemApplicableOffers(selectedItemForOffers).length > 0 ? (
                            getItemApplicableOffers(selectedItemForOffers).map((off, idx) => {
                                const activeItemKey = selectedItemForOffers ? `${selectedItemForOffers.id}-${selectedItemForOffers.sizeId}-${selectedItemForOffers.colorId}` : null;
                                const isOfferSelected = activeItemKey && selectedOffersByRow[activeItemKey] === off.id;

                                return (
                                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all group">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <span className="text-[10px] font-black text-slate-800 uppercase group-hover:text-indigo-600 transition-colors">{off.name}</span>
                                            <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border border-indigo-100">
                                                {off.discountType}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium leading-snug mb-2">
                                            {off.OfferRule?.[0]?.conditions?.rules?.[0] ?
                                                `Triggers when ${off.OfferRule[0].conditions.rules[0].field} is ${off.OfferRule[0].conditions.rules[0].operator} ${off.OfferRule[0].conditions.rules[0].value}.` :
                                                "Applicable on all eligible quantities."
                                            }
                                        </p>
                                        <div className="flex items-center gap-2 text-indigo-600 font-black text-xs bg-indigo-50/50 p-1.5 rounded-lg border border-dashed border-indigo-200">
                                            <Zap size={12} fill="currentColor" />
                                            <span className="text-[9px]">
                                                REWARD: {['Volume', 'Override'].includes(off.discountType) ? "Tiered Benefit" : (off.discountType === 'Percentage' ? `${off.discountValue}% Off` : `₹${off.discountValue} Off`)}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setSelectedOffersByRow(prev => ({
                                                    ...prev,
                                                    [activeItemKey]: isOfferSelected ? null : off.id
                                                }));
                                                setShowItemOfferModal(false);
                                                Swal.fire({ title: 'Success', icon: 'success', text: isOfferSelected ? "Manual offer removed" : `Offer "${off.name}" Applied!`, timer: 1500, showConfirmButton: false });
                                            }}
                                            className={`w-full mt-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isOfferSelected ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}
                                        >
                                            {isOfferSelected ? 'Remove Offer' : 'Select This Offer'}
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-10 text-center text-slate-400 space-y-2">
                                <Package className="mx-auto opacity-20" size={40} />
                                <p className="text-xs font-bold uppercase tracking-widest">No Offers Found</p>
                                <p className="text-[10px] font-medium leading-none">There are no active promotions for this item.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-2 bg-white border-t border-slate-100 text-center uppercase tracking-widest font-black text-[8px] text-slate-400">
                        Offer Engine v1.0 • Real-time Sync
                    </div>
                </div>
            </Modal>
            <Modal isOpen={barcodeResolution.open} widthClass="w-[90vw] max-w-5xl" onClose={() => {
                if (barcodeResolution.resolve) barcodeResolution.resolve(null);
                setBarcodeResolution({ open: false, matches: [], resolve: null });
            }}>
                <div className="h-[75vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col pt-3">
                    <VarientsSelection
                        matches={barcodeResolution.matches}
                        title="Select Stock Row"
                        stockDrivenFields={[{ key: "location", label: "Location" }]}
                        onConfirm={(selectedItems) => {
                            if (barcodeResolution.resolve) barcodeResolution.resolve(selectedItems);
                            setBarcodeResolution({ open: false, matches: [], resolve: null });
                        }}
                    />
                </div>
            </Modal>
            {showReports ? (
                <div className="flex flex-col h-[85vh] bg-[#f1f5f9] text-slate-800 overflow-hidden font-sans select-none border border-slate-200">
                    {/* 1. Slim Navigation Bar */}
                    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center shrink-0 z-30 justify-between shadow-sm">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-100">
                                <ScanBarcode size={20} />
                            </div>
                            <div className="flex-1 max-w-xl relative">
                                {isBarcodeLoading ? (
                                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" size={16} />
                                ) : (
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                )}
                                <input
                                    ref={scannerRef}
                                    disabled={isBarcodeLoading}
                                    placeholder={isBarcodeLoading ? "Finding item..." : "Scan or Search Product Name / Barcode [F10]"}
                                    className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm transition-all font-medium border outline-none ${isBarcodeLoading ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 placeholder:text-slate-400'}`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleScan}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-6 ml-4">
                            <button onClick={() => setShowReports(false)} className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-indigo-100 hover:scale-105 active:scale-95 transition-all outline-none">
                                <Clock size={16} /> <span className="hidden sm:inline">POS Reports</span>
                            </button>
                            <div className="hidden lg:flex flex-col items-end leading-none">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Store</span>
                                <span className="text-xs font-bold text-slate-700 mt-0.5">{retailLocation?.storeName || 'Main Terminal'}</span>
                            </div>
                            <div className="h-8 w-px bg-slate-200 mx-2" />
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-100 font-black text-xs">
                                    {/* {userId?.charAt(0).toUpperCase() || 'A'} */}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* 2. Main High-Density Workspace */}
                    <div className="flex-1 flex overflow-hidden">

                        {/* A. Dynamic Table Section (Responsive) */}
                        <main className="flex-1 min-w-0 bg-white flex flex-col relative">
                            {/* Barcode Search Loader Overlay */}
                            <AnimatePresence>
                                {isBarcodeLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
                                    >
                                        <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col items-center gap-4 scale-110 pointer-events-auto">
                                            <div className="relative">
                                                <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                                                <ScanBarcode className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
                                            </div>
                                            <div className="text-center">
                                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Checking Stock</h4>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Retrieving Barcode Data...</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="flex-1 overflow-auto bg-[#f8fafc]/30">
                                <table className="w-full text-left border-separate border-spacing-0">
                                    <thead className="sticky top-0 z-20 bg-white shadow-sm border-b border-slate-200">
                                        <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <th className="px-1.5 py-1.5 w-8 text-center border-r border-slate-200 uppercase">S No</th>
                                            <th className="px-2 py-1.5 flex-1 min-w-[100px] border-r border-slate-200">Item </th>
                                            <th className="px-2 py-1.5 w-24 text-center border-r border-slate-200">Color</th>
                                            <th className="px-2 py-1.5 w-24 text-center border-r border-slate-200">Size</th>
                                            <th className="px-2 py-1.5 w-14 text-center border-r border-slate-200">UoM</th>
                                            <th className="px-2 py-1.5 w-16 text-center border-r border-slate-200">Stock Qty</th>
                                            <th className="px-2 py-1.5 w-20 text-center border-r border-slate-200">Qty</th>
                                            <th className="px-3 py-1.5 w-28 text-center border-r border-slate-200">Salesman</th>
                                            <th className="px-2 py-1.5 w-28 text-right border-r border-slate-200 bg-slate-50/50">Price</th>
                                            <th className="px-2 py-1.5 w-20 text-center bg-slate-50/50">Total</th>
                                            <th className="px-1.5 py-1.5 w-8 text-center bg-slate-50/50"></th>
                                        </tr>


                                    </thead>
                                    <tbody>
                                        {cart.map((item, index) => {
                                            const cartKey = `${item.id}-${item.sizeId}-${item.colorId}`;
                                            const rowTotal = (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0);
                                            const isActiveRow = index === activeRowIndex;
                                            return (
                                                <tr
                                                    key={cartKey}
                                                    onClick={() => setActiveRowIndex(index)}
                                                    className={`group transition-colors border-b border-slate-50 cursor-pointer ${isActiveRow ? 'bg-indigo-50/60 ring-1 ring-inset ring-indigo-200' : (item.priceType === 'offerPrice' ? 'bg-emerald-50/40' : 'hover:bg-indigo-50/30')}`}
                                                >
                                                    <td className="px-2 py-1 text-center text-[10px] font-bold text-slate-400 border-r border-slate-200">{index + 1}</td>
                                                    <td className="px-3 py-1 border-r border-slate-200">
                                                        <div className="text-[12px] font-black text-slate-800 uppercase leading-tight truncate max-w-[280px]">{item?.Item?.name}</div>
                                                        <div className="flex flex-wrap items-center gap-1 mt-1">
                                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{item.barcode}</span>
                                                            {parseFloat(item.salesPrice) > parseFloat(item.price) && (
                                                                <span className="text-[10px] font-bold text-slate-300 line-through">₹{parseFloat(item.salesPrice).toLocaleString()}</span>
                                                            )}
                                                            {item.priceType === 'offerPrice' && (
                                                                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 animate-pulse">
                                                                    <Gift size={10} fill="currentColor" className="text-emerald-200" />
                                                                    {item.appliedOfferName || "Offer Applied"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-1 text-center text-[10px] text-slate-500 font-black border-r border-slate-200 uppercase">{item?.Color?.name || '-'}</td>
                                                    <td className="px-2 py-1 text-center text-[10px] text-slate-500 font-black border-r border-slate-200 uppercase">{item?.Size?.name || '-'}</td>
                                                    <td className="px-2 py-1 text-center text-[10px] text-slate-500 font-black border-r border-slate-200 uppercase">{item?.Item?.Uom?.name || item?.Uom?.name || item?.uom || '-'}</td>
                                                    <td className="px-2 py-1 text-center text-[10px] text-slate-500 font-black border-r border-slate-200 uppercase">{item?.stockQty || '-'}</td>
                                                    <td className="px-2 py-0.5 border-r border-slate-200">
                                                        <div className="flex items-center gap-1 justify-center">
                                                            <button onClick={() => updateQuantity(item.id, -1, item.sizeId, item.colorId)} className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-slate-600 hover:bg-slate-200 active:scale-95 transition-all">-</button>
                                                            <input
                                                                ref={ref => qtyInputRefs.current[cartKey] = ref}
                                                                type="number"
                                                                value={item.qty}
                                                                onChange={(e) => updateQuantity(item.id, e.target.value, item.sizeId, item.colorId, true)}
                                                                className="w-10 text-center bg-transparent text-[11px] font-black focus:outline-none"
                                                                onFocus={(e) => { e.target.select(); setActiveRowIndex(index); }}
                                                            />
                                                            <button onClick={() => updateQuantity(item.id, 1, item.sizeId, item.colorId)} className="w-5 h-5 flex items-center justify-center bg-slate-100 rounded text-slate-600 hover:bg-slate-200 active:scale-95 transition-all">+</button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleShowItemOffers(item); }}
                                                                title="View Item Offers"
                                                                className="p-1 text-indigo-600 bg-indigo-50 hover:text-white hover:bg-indigo-600 rounded transition-all flex items-center justify-center border border-indigo-100 hover:border-indigo-600 shrink-0"
                                                            >
                                                                <Gift size={13} fill="currentColor" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-0.5 border-r border-slate-200 text-center">
                                                        <select
                                                            value={item.salesPersonId || ""}
                                                            onChange={(e) => handleRowSalesPersonChange(index, e.target.value)}
                                                            className="w-full bg-transparent text-[10px] font-black text-slate-700 outline-none border-none focus:ring-0 cursor-pointer text-center p-0"
                                                        >
                                                            <option value="">- SELECT -</option>
                                                            {employees.map(emp => (
                                                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                            ))}
                                                        </select>
                                                        <div className="text-[8px] font-bold text-slate-400 mt-0.5">
                                                            {item.salesPersonBarcode || ""}
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-0.5 border-r border-slate-200">
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => updateRate(item.id, e.target.value, item.sizeId, item.colorId)}
                                                            className={`w-full py-0.5 text-right bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 rounded transition-all font-black text-sm outline-none ${item.priceType === 'offerPrice' ? 'text-emerald-600' : 'text-slate-800'}`}
                                                            onFocus={(e) => e.target.select()}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-1 text-right border-r border-slate-200 bg-slate-50/50 font-serif">
                                                        <span className="text-[12px] font-black text-indigo-700">₹{rowTotal.toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-2 py-1 text-center bg-slate-50/50">
                                                        <button onClick={(e) => { e.stopPropagation(); removeFromCart(cartKey); }} className="p-1.5 text-slate-300 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {[...Array(Math.max(0, 15 - cart.length))].map((_, i) => (
                                            <tr key={`empty-${i}`} className="h-8 border-b border-slate-50/30">
                                                <td className="border-r border-slate-200"></td>
                                                <td className="border-r border-slate-200"></td>
                                                <td className="border-r border-slate-200"></td>
                                                <td className="border-r border-slate-200"></td>
                                                <td className="border-r border-slate-200"></td>
                                                <td className="border-r border-slate-200"></td>
                                                <td className="border-r border-slate-200"></td>
                                                <td className="border-r border-slate-200"></td>
                                                <td className="border-r border-slate-200 border-slate-200"></td>
                                                <td className="border-r border-slate-200 bg-slate-50/50"></td>
                                                <td className="bg-slate-50/50"></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </main>

                        {/* B. Fixed Sidebar Interface (Standard Width) */}
                        <aside className="w-[340px] border-l border-slate-200 bg-white flex flex-col shadow-2xl relative z-10 overflow-hidden h-full">
                            <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
                                {/* Module 1: Direct Customer Entry */}
                                <div className="space-y-2 shrink-0 relative bg-white border border-slate-100 p-3 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <User size={12} /> Customer Identification
                                        </h3>
                                        {!isGuestCustomer && (
                                            <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">Registered</span>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-1.5 pointer-events-none group-focus-within:text-indigo-500">
                                                <span className="text-[10px] font-black uppercase">🇮🇳 +91</span>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Mobile (10 Digits)"
                                                value={guestMobile}
                                                onChange={(e) => handleCustomerMobileChange(e.target.value)}
                                                className="w-full pl-16 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:shadow-[0_0_15px_rgba(79,70,229,0.05)] transition-all font-mono"
                                            />
                                        </div>

                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500">
                                                <User size={14} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Customer Name"
                                                value={guestName}
                                                onChange={(e) => setGuestName(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:shadow-[0_0_15px_rgba(79,70,229,0.05)] transition-all uppercase placeholder:normal-case"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Module 2: Sale Summary */}
                                <div className="space-y-2 shrink-0 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <ShoppingCart size={12} /> Sale Summary
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                                            <span className="text-[11px] uppercase tracking-wider text-slate-400">Subtotal (Excl. Tax)</span>
                                            <span>₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        {totalOfferDiscount > 0 && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center text-violet-600 text-xs font-bold">
                                                    <span className="text-[11px] uppercase tracking-wider flex items-center gap-1">
                                                        <Gift size={11} className="text-violet-500" /> Offer Disc
                                                    </span>
                                                    <span>-₹{totalOfferDiscount.toLocaleString()}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {appliedOffers.map((off, idx) => (
                                                        <span key={idx} className="bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border border-violet-100/50 flex items-center gap-1">
                                                            <Zap size={8} fill="currentColor" />{off.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-emerald-500 text-xs font-bold">
                                            <span className="text-[11px] uppercase tracking-wider">Manual Disc</span>
                                            <div className="flex items-center gap-1">
                                                <span>-₹</span>
                                                <input
                                                    ref={discountRef}
                                                    type="number"
                                                    value={discount}
                                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                                    className="w-16 bg-white border border-emerald-200 rounded px-1.5 py-0.5 text-right outline-none text-emerald-600 focus:border-emerald-500 transition-colors"
                                                    onFocus={(e) => e.target.select()}
                                                />
                                            </div>
                                        </div>
                                        {(totalOfferDiscount > 0 || discount > 0) && (
                                            <div className="flex justify-between items-center text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                                <span className="text-[10px] uppercase tracking-wider text-emerald-500">You Save</span>
                                                <span className="text-emerald-600 font-black">₹{(totalOfferDiscount + discount).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                                            <span className="text-[11px] uppercase tracking-wider text-slate-400">CGST</span>
                                            <span>₹{(tax / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                                            <span className="text-[11px] uppercase tracking-wider text-slate-400">SGST</span>
                                            <span>₹{(tax / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                                            <span className="text-[11px] uppercase tracking-wider text-slate-400">Round Off</span>
                                            <span>₹{roundOff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between items-center font-black text-lg text-indigo-700 pt-2.5 border-t border-slate-200 mt-2">
                                            <span className="text-[12px] uppercase tracking-widest text-indigo-400">Net Amount</span>
                                            <span>₹{total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Footer: Action Checkout */}
                            <div className="p-3 bg-white border-t border-slate-100 space-y-2">
                                <button
                                    disabled={isProcessing || cart.length === 0}
                                    onClick={() => handlePayNow()}
                                    className={`w-full py-2 rounded-xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all shadow-xl ${cart.length === 0 || isProcessing ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-100'}`}
                                >
                                    <CreditCard size={18} />
                                    <span>Pay Now [F8]</span>
                                </button>
                                {printData && (
                                    <div className="bg-amber-50 p-2 rounded-xl border border-amber-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
                                        <span className="text-[9px] font-black text-amber-600 uppercase ml-2">Receipt Generated</span>
                                        <button onClick={() => setPrintData(null)} className="p-1 px-3 bg-white text-amber-600 border border-amber-200 rounded-lg text-[10px] font-black hover:bg-amber-600 hover:text-white transition-all">CLOSE</button>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>

                    {/* Root Table Footer */}
                    <footer className="h-14 bg-white border-t border-slate-200 px-4 flex items-center shrink-0 z-30">
                        <div className="text-[10px] font-black text-slate-400 flex gap-4 uppercase tracking-[0.2em] border-r border-slate-100 pr-6 shrink-0">
                            <span>Rows: {cart.length}</span>
                            <span>Total Pcs: {cart.reduce((s, i) => s + (Number(i.qty) || 0), 0)}</span>
                        </div>
                        <div className="flex items-center gap-3 no-scrollbar overflow-x-auto ml-4">
                            {[
                                {
                                    key: 'F2', label: 'Qty', action: () => {
                                        if (cart.length > 0) {
                                            const idx = Math.min(activeRowIndex, cart.length - 1);
                                            const item = cart[idx];
                                            const key = `${item.id}-${item.sizeId}-${item.colorId}`;
                                            qtyInputRefs.current[key]?.focus();
                                            qtyInputRefs.current[key]?.select();
                                        }
                                    }
                                },
                                {
                                    key: 'F3', label: 'Disc', action: () => {
                                        discountRef.current?.focus();
                                        discountRef.current?.select();
                                    }
                                },
                                {
                                    key: 'F4', label: 'Reports', action: () => setShowReports(prev => !prev)
                                },
                                { key: 'F6', label: 'UoM', action: null },
                                {
                                    key: 'F8', label: 'Pay', action: () => handlePayNow()
                                },
                                {
                                    key: 'F10', label: 'Scan', action: () => {
                                        scannerRef.current?.focus();
                                    }
                                },
                                // {
                                //     key: 'F12', label: 'Menu', action: () => setShowReports(prev => !prev)
                                // },
                            ].map((btn) => (
                                <button
                                    key={btn.key}
                                    onClick={btn.action || undefined}
                                    disabled={!btn.action}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white transition-all group shrink-0 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <span className="text-[10px] font-black text-indigo-600 group-hover:scale-110 transition-transform">{btn.key}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </footer>
                </div>
            ) : (
                <div className=" bg-[#F1F1F0] min-h-screen">
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-3 items-start sm:items-center  gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
                        <h1 className="text-md font-bold text-gray-800">Point Of Sale</h1>
                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-2  rounded-md flex items-center gap-2 text-sm transition-colors shadow-sm"
                            onClick={() => setShowReports(true)}
                        >
                            <Plus size={14} /> Create New
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[85vh] mt-2 border-2">
                        <PosReports recentSales={recentSales} />
                    </div>
                </div>
            )}

            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                        <Banknote size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Final Settlement</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select payment type & exact amount</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"><X size={20} /></button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Amount Summary */}
                                <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-100">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Payable</span>
                                    <span className="text-2xl font-black text-indigo-700 font-serif">₹{total.toLocaleString()}</span>
                                </div>

                                {/* Split Inputs */}
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { label: 'Cash Payment', icon: <Banknote size={14} />, value: paidCash, setter: setPaidCash, color: 'emerald' },
                                        { label: 'UPI / Online', icon: <ScanBarcode size={14} />, value: paidUPI, setter: setPaidUPI, color: 'indigo' },
                                        { label: 'Card Payment', icon: <CreditCard size={14} />, value: paidCard, setter: setPaidCard, color: 'blue' }
                                    ].map((pod) => (
                                        <div key={pod.label} className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                                <span className={`text-${pod.color}-500 opacity-60`}>{pod.icon}</span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{pod.label}</span>
                                            </div>
                                            <input
                                                type="number"
                                                className="w-full bg-white border border-slate-200 rounded-xl pl-32 pr-4 py-4 text-sm font-black text-slate-800 outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(79,70,229,0.05)] text-right transition-all"
                                                value={pod.value}
                                                onChange={(e) => pod.setter(Number(e.target.value))}
                                                onFocus={(e) => e.target.select()}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Balance Calc */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase px-2">
                                        <span>Sum Received</span>
                                        <span>₹{receivedAmount.toLocaleString()}</span>
                                    </div>
                                    <div className={`p-4 rounded-2xl flex items-center justify-between shadow-lg transition-colors ${receivedAmount >= total ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                                        <div className="flex flex-col leading-none">
                                            <span className="text-[10px] font-black uppercase opacity-60 mb-1">Balance to {receivedAmount >= total ? 'Return' : 'Collect'}</span>
                                            <span className="text-xl font-black">{receivedAmount >= total ? `₹${(receivedAmount - total).toLocaleString()}` : `₹${(total - receivedAmount).toLocaleString()}`}</span>
                                        </div>
                                        {receivedAmount >= total ? <CheckCircle2 size={24} /> : <X size={24} />}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                                <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all bg-white border border-slate-200 rounded-2xl">Cancel</button>
                                <button
                                    disabled={receivedAmount < total || isProcessing}
                                    onClick={async () => {
                                        await handleCheckout();
                                        setShowPaymentModal(false);
                                    }}
                                    className={`flex-[2] py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-widest transition-all shadow-xl ${receivedAmount < total || isProcessing ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}
                                >
                                    <CheckCircle2 size={16} />
                                    <span>Complete Sale & Print</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Receipt Modal Viewer */}
            {printData && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-lg h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Print Terminal</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{printData.docId} | {new Date().toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setPrintData(null)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"><X size={20} /></button>
                        </div>
                        <div className="flex-1 bg-slate-100 p-4 sm:p-8 flex items-center justify-center overflow-hidden">
                            <div className="w-[300px] h-full shadow-2xl rounded-sm overflow-hidden border border-slate-200">
                                <PDFViewer width="100%" height="100%" showToolbar={true} className="border-none">
                                    <PosThermalPrint {...printData} />
                                </PDFViewer>
                            </div>
                        </div>
                        <div className="p-6 bg-white border-t border-slate-100 flex items-center gap-4">
                            <button onClick={() => setPrintData(null)} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Close Viewer</button>
                            <button
                                onClick={() => {
                                    // The user can use the PDFViewer's built-in print icon or we could try to trigger it
                                    // but browser/PDF cross-origin/iframe security often blocks simple print() on the viewer.
                                    // PDFViewer's toolbar is the reliable way.
                                    Swal.fire({ title: "Info", text: "Use the Print icon inside the terminal viewer.", icon: "info", timer: 1500, showConfirmButton: false });
                                }}
                                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 block text-center"
                            >
                                Send to Thermal Printer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Modal
                isOpen={showSalesPersonModal}
                onClose={() => setShowSalesPersonModal(false)}
                widthClass="w-[400px] rounded-2xl p-0 overflow-hidden shadow-2xl"
            >
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <ScanBarcode size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Sales Person</h2>
                            <p className="text-indigo-100 text-xs font-bold mt-0.5">Please scan salesperson barcode</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-white">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            ref={salesPersonScannerRef}
                            autoFocus
                            type="text"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all text-lg font-black tracking-widest placeholder:text-slate-300 uppercase"
                            placeholder="SCAN OR TYPE ID..."
                            value={salesPersonBarcode}
                            onChange={(e) => setSalesPersonBarcode(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSalesPersonScan(e.target.value);
                                }
                            }}
                        />
                    </div>

                    {/* Employee Suggestions Selection */}
                    <AnimatePresence>
                        {salesPersonBarcode.length >= 1 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 max-h-[240px] overflow-auto border-2 border-slate-50 rounded-2xl divide-y divide-slate-50 shadow-inner bg-slate-50/30"
                            >
                                {employees
                                    .filter(emp =>
                                        emp.name?.toLowerCase().includes(salesPersonBarcode.toLowerCase()) ||
                                        emp.employeeId?.toLowerCase().includes(salesPersonBarcode.toLowerCase()) ||
                                        emp.regNo?.toLowerCase().includes(salesPersonBarcode.toLowerCase())
                                    )
                                    .slice(0, 5) // Show top 5 matches
                                    .map(emp => (
                                        <button
                                            key={emp.id}
                                            onClick={() => handleSalesPersonScan(emp.employeeId || emp.regNo)}
                                            className="w-full p-4 text-left hover:bg-white transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[10px] uppercase">
                                                    {emp.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{emp.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{emp.employeeId || emp.regNo}</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-all transform group-hover:translate-x-1" />
                                        </button>
                                    ))}
                                {employees.filter(emp =>
                                    emp.name?.toLowerCase().includes(salesPersonBarcode.toLowerCase()) ||
                                    emp.employeeId?.toLowerCase().includes(salesPersonBarcode.toLowerCase()) ||
                                    emp.regNo?.toLowerCase().includes(salesPersonBarcode.toLowerCase())
                                ).length === 0 && (
                                        <div className="p-6 text-center text-slate-400">
                                            <p className="text-[10px] font-black uppercase tracking-widest">No matching employee found</p>
                                        </div>
                                    )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-6 flex flex-col gap-3">
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
                            <Zap size={16} className="text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">
                                scanning the salesperson barcode will link this staff member to the currently scanned item for commission tracking.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowSalesPersonModal(false)}
                            className="w-full py-2.5 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default PointOfSale;
