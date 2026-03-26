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
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useGetItemMasterQuery } from '../../../redux/uniformService/ItemMasterService';
import { useGetPartyQuery, useAddPartyMutation } from '../../../redux/services/PartyMasterService';
import { useAddSalesInvoiceMutation } from '../../../redux/uniformService/salesInvoiceServices';
import { useGetLocationMasterQuery } from '../../../redux/uniformService/LocationMasterServices';
import { useLazyGetUnifiedStockWithLegacyByBarcodeQuery } from '../../../redux/services/StockService';
import { getCommonParams } from '../../../Utils/helper';
import Swal from 'sweetalert2';
import { useGetPointOfSalesQuery, useAddPointOfSalesMutation } from '../../../redux/uniformService/PointOfSalesService';
import PosReports from './PosReports';
import { useEffect, useRef, useState } from 'react';

// Child components can be defined in separate files later or kept here for now for speed
// I'll define them in-line for now since I'm building the "Page" as requested.

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
    const [printData, setPrintData] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [docId, setDocId] = useState("")

    // Auto-focus scanner input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                scannerRef.current?.focus();
            }
            if (e.key === 'F8') {
                e.preventDefault();
                if (cart.length > 0 && !isProcessing) {
                    setShowPaymentModal(true);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cart.length, isProcessing]);

    // Queries
    const { data: itemsData, isLoading: itemsLoading } = useGetItemMasterQuery({
        params: { branchId, userId, finYearId }
    });
    const { data: customerData } = useGetPartyQuery({
        params: { branchId, userId, finYearId }
    });
    const { data: locationsData } = useGetLocationMasterQuery({
        params: { branchId, companyId }
    });
    const [addPointOfSales] = useAddPointOfSalesMutation();
    const [getStockByBarcode, { isLoading: isBarcodeLoading }] = useLazyGetUnifiedStockWithLegacyByBarcodeQuery();
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
        const matchesSearch = (
            item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.itemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return matchesSearch;
    });

    // Handle Quick Scan
    const handleScan = async (e) => {
        if (e.key === 'Enter') {
            const barcode = searchQuery.trim();
            if (!barcode) return;

            // Prioritize API search for real-time stock/details
            try {
                const response = await getStockByBarcode({
                    params: {
                        barcode,
                        storeId: retailStoreId,
                        branchId
                    }
                }).unwrap();

                if (response.statusCode === 0 && response.data) {
                    const stockData = response?.data;
                    // Simply pass stockData; addToCart handles normalization of qty, price, and itemId
                    addToCart({ ...stockData });
                    setSearchQuery('');
                    return;
                }
            } catch (error) {
                console.error("Barcode API search failed:", error);
            }

            // Fallback to local items if API fails or not found
            const localItem = items.find(i =>
                i.barcode === barcode || i.itemCode === barcode
            );

            if (localItem) {
                addToCart(localItem);
                setSearchQuery('');
            } else {
                toast.warning("Barcode not found in stock or local database");
            }
        }
    };

    // Cart actions
    const addToCart = (product) => {
        // Guard: Initial Stock Check
        const stockLimit = parseFloat(product.stockQty) || 0;
        if (stockLimit <= 0) {
            toast.error("Out of stock!");
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

                return prev.map(item =>
                    (item.id === prodId &&
                        item.sizeId === product.sizeId &&
                        item.colorId === product.colorId)
                        ? { ...item, qty: currentQty + 1 } : item
                );
            }
            // Populate all data from product (stockData) + UI fields
            return [...prev, {
                ...product,
                qty: 1,
                taxPercent: product?.Item?.Hsn?.tax || 5
            }];
        });
        toast.success(`${product.itemName || product.item_name} Added`, {
            autoClose: 800,
            hideProgressBar: true,
            position: 'bottom-right',
            icon: <CheckCircle2 className="text-green-500" size={18} />
        });
    };

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
                    toast.warning(`Restricted to stock quantity: ${stockLimit}`);
                    newQty = stockLimit;
                }

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

    const totalBeforeDiscount = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0), 0);
    const total = Math.max(0, totalBeforeDiscount - discount);

    const tax = Math.round(cart.reduce((sum, item) => {
        const itemTaxPercent = parseFloat(item.taxPercent || item.Hsn?.tax || item.tax || 0);
        const itemTotal = (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0);
        const itemDiscount = totalBeforeDiscount > 0 ? (itemTotal / totalBeforeDiscount) * discount : 0;
        const netItemTotal = itemTotal - itemDiscount;
        // Inclusive Tax Formula: Tax = Amount - (Amount / (1 + TaxRate/100))
        const itemTax = netItemTotal - (netItemTotal / (1 + (itemTaxPercent / 100)));
        return sum + itemTax;
    }, 0));

    const subtotal = total - tax; // subtotal is the taxable amount in this context

    const handleCheckout = async () => {
        // 1. Initial Guards
        if (cart.length === 0) { toast.error("Cart is empty"); return; }
        if (cart.some(item => (parseFloat(item.qty) || 0) <= 0)) {
            toast.error("One or more items have zero quantity!");
            return;
        }

        // 2. Customer & Phone Validation
        if (isGuestCustomer && !guestName.trim()) {
            toast.error("Customer name is required!");
            return;
        }

        const currentPhone = selectedCustomer ? selectedCustomer.contact : guestMobile;
        const phoneRegex = /^[0-9]{10}$/;
        const cleanPhone = currentPhone?.toString().replace(/\D/g, '') || '';

        if (!phoneRegex.test(cleanPhone)) {
            toast.error("A valid 10-digit mobile number is required!");
            return;
        }

        // 3. Payment Validation
        if (receivedAmount < total) {
            toast.error(`Incomplete payment! Missing: ₹${(total - receivedAmount).toLocaleString()}`);
            return;
        }

        // 4. Confirm Dialog (Await the result!)
        const result = await Swal.fire({
            title: 'Confirm Sale',
            html: `
            <div class="text-left space-y-2 p-4 bg-slate-50 rounded-xl">
                <div class="flex justify-between"><span>Subtotal:</span> <b>₹${subtotal.toLocaleString()}</b></div>
                <div class="flex justify-between"><span>Discount:</span> <b class="text-red-500">-₹${discount.toLocaleString()}</b></div>
                <div class="flex justify-between"><span>Tax (18%):</span> <b>₹${tax.toLocaleString()}</b></div>
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
                        gstNo: 'N/A'
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

            // 6. Save Invoice
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
                posItems: cart
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
                summary: { subtotal, tax, discount, total, received: receivedAmount, balance: balanceReturn },
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
            toast.error(error.message || "Failed to save invoice.");
            console.error("Checkout Error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrintPreview = () => {
        if (cart.length === 0) {
            toast.error("Add items first to see preview");
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
                toast.info(`Welcome back, ${hit.name}`, { position: 'bottom-right', autoClose: 1500 });
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
                                            <th className="px-4 py-4 w-12 text-center border-r border-slate-200 uppercase">#</th>
                                            <th className="px-4 py-4 min-w-[250px] border-r border-slate-200">Item Detail</th>
                                            <th className="px-4 py-4 w-24 text-center border-r border-slate-200">Color</th>
                                            <th className="px-4 py-4 w-24 text-center border-r border-slate-200">Size</th>
                                            <th className="px-2 py-4 w-20 text-center border-r border-slate-200">Stock Qty</th>
                                            <th className="px-2 py-4 w-20 text-center border-r border-slate-200">Qty</th>
                                            <th className="px-4 py-4 w-32 text-right border-r border-slate-200">Rate (₹)</th>
                                            <th className="px-4 py-4 w-24 text-center border-r border-slate-200">Tax (%)</th>
                                            <th className="px-4 py-4 w-32 text-right border-r border-slate-200 bg-slate-50/50">Total (₹)</th>
                                            <th className="px-3 py-4 w-12 text-center bg-slate-50/50"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map((item, index) => {
                                            const itemTaxPercent = parseFloat(item.taxPercent || item.Hsn?.tax || item.tax || 0);
                                            const rowTotal = (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 0);
                                            const taxableValue = rowTotal / (1 + (itemTaxPercent / 100));
                                            const itemTax = Math.round(rowTotal - taxableValue);
                                            return (
                                                <tr key={`${item.id}-${item.sizeId}-${item.colorId}`} className="group hover:bg-indigo-50/30 transition-colors border-b border-slate-50">
                                                    <td className="px-4 py-3 text-center text-[10px] font-bold text-slate-400 border-r border-slate-200">{index + 1}</td>
                                                    <td className="px-4 py-3 border-r border-slate-200">
                                                        <div className="text-[13px] font-black text-slate-800 uppercase leading-none truncate max-w-[300px]">{item?.Item?.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold mt-1.5 flex items-center gap-2">
                                                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">{item.barcode}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-[10px] text-slate-500 font-black border-r border-slate-200 uppercase">{item?.Color?.name || '-'}</td>
                                                    <td className="px-4 py-3 text-center text-[10px] text-slate-500 font-black border-r border-slate-200 uppercase">{item?.Size?.name || '-'}</td>
                                                    <td className="px-4 py-3 text-center text-[10px] text-slate-500 font-black border-r border-slate-200 uppercase">{item?.stockQty || '-'}</td>
                                                    <td className="px-2 py-1.5 border-r border-slate-200">
                                                        <input
                                                            type="number"
                                                            value={item.qty}
                                                            onChange={(e) => updateQuantity(item.id, e.target.value, item.sizeId, item.colorId, true)}
                                                            className="w-full py-1.5 text-center bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 rounded transition-all font-black text-sm outline-none"
                                                            onFocus={(e) => e.target.select()}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-1.5 border-r border-slate-200">
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => updateRate(item.id, e.target.value, item.sizeId, item.colorId)}
                                                            className="w-full py-1.5 text-right bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 rounded transition-all font-black text-sm outline-none"
                                                            onFocus={(e) => e.target.select()}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-[11px] text-slate-400 font-bold border-r border-slate-200">{itemTaxPercent}%</td>
                                                    <td className="px-4 py-3 text-right border-r border-slate-200 bg-slate-50/50 font-serif">
                                                        <span className="text-[14px] font-black text-indigo-700">₹{rowTotal.toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-3 py-3 text-center bg-slate-50/50">
                                                        <button onClick={() => removeFromCart(`${item.id}-${item.sizeId}-${item.colorId}`)} className="p-1.5 text-slate-300 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {[...Array(Math.max(0, 15 - cart.length))].map((_, i) => (
                                            <tr key={`empty-${i}`} className="h-14 border-b border-slate-50/30">
                                                <td className="border-r border-slate-200"></td>
                                                <td className="border-r border-slate-200"></td>
                                                <td className="border-r border-slate-200"></td>
                                                <td className="border-r border-slate-200"></td>
                                                <td className="border-r border-slate-200"></td>
                                                <td className="border-r border-slate-200"></td>
                                                <td className="border-r border-slate-200"></td>
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
                                <div className="space-y-3 shrink-0 relative bg-white border border-slate-100 p-4 rounded-2xl shadow-sm overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <User size={12} /> Customer Identification
                                        </h3>
                                        {!isGuestCustomer && (
                                            <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">Registered</span>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-1.5 pointer-events-none group-focus-within:text-indigo-500">
                                                <span className="text-[10px] font-black uppercase">🇮🇳 +91</span>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Mobile (10 Digits)"
                                                value={guestMobile}
                                                onChange={(e) => handleCustomerMobileChange(e.target.value)}
                                                className="w-full pl-16 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:shadow-[0_0_15px_rgba(79,70,229,0.05)] transition-all font-mono"
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
                                                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:shadow-[0_0_15px_rgba(79,70,229,0.05)] transition-all uppercase placeholder:normal-case"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Module 2: Sale Summary */}
                                <div className="space-y-3 shrink-0 bg-white border border-slate-100 p-3 rounded-2xl shadow-sm">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <ShoppingCart size={12} /> Sale Summary
                                    </h3>
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                                            <span className="text-[11px] uppercase tracking-wider text-slate-400">Subtotal</span>
                                            <span>₹{subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-emerald-500 text-xs font-bold">
                                            <span className="text-[11px] uppercase tracking-wider">Discount</span>
                                            <div className="flex items-center gap-1">
                                                <span>-₹</span>
                                                <input
                                                    type="number"
                                                    value={discount}
                                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                                    className="w-16 bg-white border border-emerald-200 rounded px-1.5 py-0.5 text-right outline-none text-emerald-600 focus:border-emerald-500 transition-colors"
                                                    onFocus={(e) => e.target.select()}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                                            <span className="text-[11px] uppercase tracking-wider text-slate-400">Tax</span>
                                            <span>₹{tax.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center font-black text-lg text-indigo-700 pt-2.5 border-t border-slate-200 mt-2">
                                            <span className="text-[12px] uppercase tracking-widest text-indigo-400">Total</span>
                                            <span>₹{total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Module 3 has been moved to Modal */}
                            </div>

                            {/* Footer: Action Checkout */}
                            <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                                <button
                                    disabled={isProcessing || cart.length === 0}
                                    onClick={() => setShowPaymentModal(true)}
                                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all shadow-xl ${cart.length === 0 || isProcessing ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-100'}`}
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
                                { key: 'F2', label: 'Qty' },
                                { key: 'F3', label: 'Disc' },
                                { key: 'F4', label: 'Void' },
                                { key: 'F6', label: 'UoM' },
                                { key: 'F8', label: 'Pay' },
                                { key: 'F10', label: 'Scan' },
                                { key: 'F12', label: 'Menu' },
                            ].map((btn) => (
                                <button key={btn.key} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white transiton-all group shrink-0 outline-none">
                                    <span className="text-[10px] font-black text-indigo-600 group-hover:scale-110 transition-transform">{btn.key}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </footer>
                </div>
            ) : (
                <div className="p-2 bg-[#F1F1F0] min-h-screen">
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-3 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-800">Point Of Sale</h1>
                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm transition-colors shadow-sm"
                            onClick={() => setShowReports(true)}
                        >
                            <Plus size={14} /> Create New Sale
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[85vh] border-2">
                        <PosReports recentSales={recentSales} />
                    </div>
                </div>
            )}

            {/* Payment Settlement Modal */}
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
                                    toast.info("Use the Print icon inside the terminal viewer.");
                                }}
                                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 block text-center"
                            >
                                Send to Thermal Printer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PointOfSale;
