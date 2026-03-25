import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useGetItemMasterQuery } from '../../../redux/uniformService/ItemMasterService';
import { useGetPartyQuery, useAddPartyMutation } from '../../../redux/services/PartyMasterService';
import { useAddSalesInvoiceMutation } from '../../../redux/uniformService/salesInvoiceServices';
import { useGetLocationMasterQuery } from '../../../redux/uniformService/LocationMasterServices';
import { useLazyGetUnifiedStockByBarcodeQuery } from '../../../redux/services/StockService';
import { getCommonParams } from '../../../Utils/helper';
import Swal from 'sweetalert2';

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
    const [guestName, setGuestName] = useState('Walk-in Customer');
    const [guestMobile, setGuestMobile] = useState('');
    const [addParty] = useAddPartyMutation();
    const scannerRef = useRef(null);

    // Auto-focus scanner input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                scannerRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
    const [addSalesInvoice] = useAddSalesInvoiceMutation();
    const [getStockByBarcode] = useLazyGetUnifiedStockByBarcodeQuery();

    const items = itemsData?.data || [];
    const customers = customerData?.data || [];
    const locations = locationsData?.data || [];

    // Identify Retail Location
    const retailLocation = locations.find(l =>
        l.storeName?.toLowerCase().includes('retail') ||
        l.name?.toLowerCase().includes('retail')
    );
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
                    const stockData = response.data;
                    const stockItem = {
                        id: stockData.itemId,
                        itemName: stockData.item_name,
                        rate: stockData.price || 0,
                        uomName: stockData.uom,
                        uomId: stockData.uomId,
                        colorId: stockData.colorId,
                        sizeId: stockData.sizeId,
                        colorName: stockData.color,
                        sizeName: stockData.size,
                        stockQty: stockData.stockQty,
                        barcode: stockData.barcode
                    };
                    addToCart(stockItem);
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
        setCart(prev => {
            // Check for uniqueness based on Item + Size + Color
            const existing = prev.find(item =>
                item.id === product.id &&
                item.sizeId === product.sizeId &&
                item.colorId === product.colorId
            );

            if (existing) {
                return prev.map(item =>
                    (item.id === product.id &&
                        item.sizeId === product.sizeId &&
                        item.colorId === product.colorId)
                        ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1, rate: product.rate || 0 }];
        });
        toast.success(`${product.itemName} Added`, {
            autoClose: 800,
            hideProgressBar: true,
            position: 'bottom-right',
            icon: <CheckCircle2 className="text-green-500" size={18} />
        });
    };

    const removeFromCart = (cartKey) => {
        setCart(prev => prev.filter(item => `${item.id}-${item.sizeId}-${item.colorId}` !== cartKey));
    };

    const updateQuantity = (productId, value, sizeId, colorId, isDirect = false) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId && item.sizeId === sizeId && item.colorId === colorId) {
                let newQty;
                if (isDirect) {
                    newQty = Math.max(0, parseFloat(value) || 0);
                    // Standard quantity format for ERP is often 3 decimal places
                    if (newQty % 1 !== 0) newQty = parseFloat(newQty.toFixed(3));
                } else {
                    newQty = Math.max(1, item.quantity + (parseFloat(value) || 0));
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const updateRate = (productId, value, sizeId, colorId) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId && item.sizeId === sizeId && item.colorId === colorId) {
                return { ...item, rate: parseFloat(value) || 0 };
            }
            return item;
        }));
    };

    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.rate) || 0) * (parseFloat(item.quantity) || 0), 0);
    const taxRate = 0.18; // 18% GST mock
    const tax = Math.round((subtotal - discount) * taxRate);
    const total = subtotal - discount + tax;

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error("Cart is empty");
            return;
        }
        if (cart.some(item => (parseFloat(item.quantity) || 0) <= 0)) {
            toast.error("All items must have a quantity greater than 0");
            return;
        }
        if (!selectedCustomer && !isGuestCustomer) {
            toast.error("Please select a customer or mark as Guest");
            return;
        }
        if (isGuestCustomer && !guestMobile) {
            toast.error("Please enter guest mobile number");
            return;
        }

        const result = await Swal.fire({
            title: 'Confirm Sale',
            html: `
                <div class="text-left space-y-2 p-4 bg-slate-50 rounded-xl">
                    <div class="flex justify-between"><span>Subtotal:</span> <b>₹${subtotal.toLocaleString()}</b></div>
                    <div class="flex justify-between"><span>Discount:</span> <b class="text-red-500">-₹${discount.toLocaleString()}</b></div>
                    <div class="flex justify-between"><span>Tax (18%):</span> <b>₹${tax.toLocaleString()}</b></div>
                    <div class="flex justify-between text-lg border-t pt-2 mt-2"><span>Total:</span> <b class="text-indigo-600 font-black">₹${total.toLocaleString()}</b></div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Process Payment'
        });

        if (result.isConfirmed) {
            setIsProcessing(true);
            try {
                let customerId = selectedCustomer?.id;

                if (isGuestCustomer) {
                    try {
                        const guestPayload = {
                            name: guestName || 'Walk-in Customer',
                            contact: guestMobile,
                            isClient: true,
                            isB2C: true,
                            companyId,
                            userId,
                            partyCode: 'WALK-' + guestMobile.slice(-4) + '-' + Math.floor(Math.random() * 1000),
                            active: true,
                            address: 'Walk-in Store',
                            cityId: customers.length > 0 ? (customers[0].City?.id || customers[0].cityId || 1) : 1,
                            pincode: '000000',
                            gstNo: 'N/A'
                        };
                        const res = await addParty(guestPayload).unwrap();
                        customerId = res.data.id;
                    } catch (e) {
                        console.error("Guest creation failed, trying to find existing", e);
                        // Maybe it already exists?
                        const existing = customers.find(c => c.contact === guestMobile);
                        if (existing) customerId = existing.id;
                        else throw new Error("Could not handle guest customer");
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
                    poType: "General",
                    poInwardOrDirectInward: "DirectInward",
                    netAmount: total,
                    taxAmount: tax,
                    discountValue: discount,
                    discountType: "Flat",
                    invoiceItems: cart.map(item => ({
                        itemId: item.id,
                        qty: item.quantity,
                        rate: item.rate,
                        amount: item.rate * item.quantity,
                        uomId: item.uomId,
                        colorId: item.colorId,
                        sizeId: item.sizeId
                    }))
                };

                await addSalesInvoice(invoicePayload).unwrap();

                Swal.fire({
                    title: 'Payment Successful!',
                    text: 'Invoice #INV-' + Math.floor(Math.random() * 10000) + ' generated.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });

                setCart([]);
                setDiscount(0);
                setSelectedCustomer(null);
            } catch (error) {
                toast.error("Failed to save invoice.");
                console.error(error);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // Customer Add/Search Logic
    const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);

    const handleCustomerSelect = (value) => {
        setCustomerQuery(value);
        const searchVal = value.toLowerCase();
        const found = customers.find(c =>
            c.contact === value ||
            c.contactPersonNumber === value ||
            c.name?.toLowerCase().includes(searchVal)
        );

        if (found) {
            setSelectedCustomer(found);
            setIsAddingNewCustomer(false);
            setIsGuestCustomer(false);
        } else {
            setSelectedCustomer(null);
            // If it's a 10-digit number, suggest adding
            if (value.length >= 10 && /^\d+$/.test(value)) {
                setIsAddingNewCustomer(true);
                setGuestMobile(value);
                setGuestName(''); // Clear for manual entry
            } else {
                setIsAddingNewCustomer(false);
            }
        }
    }

    const [amountReceived, setAmountReceived] = useState(0);
    const changeToReturn = Math.max(0, amountReceived - total);

    return (
        <div className="flex flex-col h-screen bg-[#f1f5f9] text-slate-800 overflow-hidden font-sans select-none">
            {/* 1. Slim Navigation Bar */}
            <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center shrink-0 z-30 justify-between shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-100">
                        <ScanBarcode size={20} />
                    </div>
                    <div className="flex-1 max-w-xl relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            ref={scannerRef}
                            type="text"
                            placeholder="Scan or Search Product Name / Barcode [F10]"
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleScan}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-6 ml-4">
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
                    <div className="flex-1 overflow-auto bg-[#f8fafc]/30">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="sticky top-0 z-20 bg-white">
                                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <th className="px-4 py-4 w-12 text-center border-b border-slate-100 uppercase">#</th>
                                    <th className="px-4 py-4 min-w-[250px] border-b border-slate-100">Item Detail</th>
                                    <th className="px-2 py-4 w-20 text-center border-b border-slate-100">Qty</th>
                                    <th className="px-4 py-4 w-32 text-right border-b border-slate-100">Rate (₹)</th>
                                    <th className="px-4 py-4 w-24 text-right border-b border-slate-100">Tax</th>
                                    <th className="px-4 py-4 w-24 text-center border-b border-slate-100">Size</th>
                                    <th className="px-4 py-4 w-36 text-right border-b border-slate-100 bg-slate-50/50">Total (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item, index) => {
                                    const itemTax = Math.round((item.rate * item.quantity) * 0.18);
                                    const rowTotal = (item.rate * item.quantity) + itemTax;
                                    return (
                                        <tr key={`${item.id}-${item.sizeId}-${item.colorId}`} className="group hover:bg-indigo-50/30 transition-colors border-b border-slate-50">
                                            <td className="px-4 py-3 text-center text-[10px] font-bold text-slate-300 border-b border-slate-50/50">{index + 1}</td>
                                            <td className="px-4 py-3 border-b border-slate-50/50">
                                                <div className="text-[13px] font-black text-slate-800 uppercase leading-none truncate max-w-[300px]">{item.itemName}</div>
                                                <div className="text-[10px] text-slate-400 font-bold mt-1.5 flex items-center gap-2">
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">{item.barcode || item.itemCode}</span>
                                                    <span className="h-1 w-1 bg-slate-300 rounded-full" />
                                                    <span className="uppercase text-slate-500">{item.colorName || 'No Color'}</span>
                                                </div>
                                            </td>
                                            <td className="px-2 py-1.5 border-b border-slate-50/50">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, e.target.value, item.sizeId, item.colorId, true)}
                                                    className="w-full py-1.5 text-center bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 rounded transition-all font-black text-sm outline-none"
                                                    onFocus={(e) => e.target.select()}
                                                />
                                            </td>
                                            <td className="px-4 py-1.5 border-b border-slate-50/50">
                                                <input
                                                    type="number"
                                                    value={item.rate}
                                                    onChange={(e) => updateRate(item.id, e.target.value, item.sizeId, item.colorId)}
                                                    className="w-full py-1.5 text-right bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-indigo-400 rounded transition-all font-black text-sm outline-none"
                                                    onFocus={(e) => e.target.select()}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right text-[11px] text-slate-400 font-bold border-b border-slate-50/50">{itemTax.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-center text-[10px] text-slate-500 font-black border-b border-slate-50/50 uppercase">{item.sizeName || '-'}</td>
                                            <td className="px-4 py-3 text-right border-b border-slate-50/50 bg-slate-50/50 relative font-serif">
                                                <span className="text-[14px] font-black text-indigo-700">₹{rowTotal.toLocaleString()}</span>
                                                <button onClick={() => removeFromCart(`${item.id}-${item.sizeId}-${item.colorId}`)} className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-red-200 hover:text-red-500 transition-all"><Trash2 size={13} /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {[...Array(Math.max(0, 15 - cart.length))].map((_, i) => (
                                    <tr key={`empty-${i}`} className="h-14 border-b border-slate-50/30">
                                        <td colSpan={7} className="border-b border-slate-50/10"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>

                {/* B. Fixed Sidebar Interface (Standard Width) */}
                <aside className="w-[360px] border-l border-slate-200 bg-white flex flex-col shadow-2xl relative z-10 overflow-x-hidden">
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">

                        {/* Summary: Total Banner */}
                        <div className="bg-slate-900 rounded-2xl p-6 text-white text-center shadow-indigo-200/50 shadow-2xl mb-2 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform"><ShoppingCart size={64} /></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] relative z-10">Grand Total Amount</span>
                            <div className="text-[44px] font-black tracking-tighter mt-1 relative z-10 leading-none">
                                <span className="text-xl mr-1 font-serif opacity-40">₹</span>{total.toLocaleString()}
                            </div>
                        </div>

                        {/* Module 1: Customer (Dual Logic) */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={12} /> Profile Management
                            </h3>
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Enter Phone or Name [F11]"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
                                    value={customerQuery}
                                    onChange={(e) => handleCustomerSelect(e.target.value)}
                                />
                            </div>

                            {/* Dual Save Option UI */}
                            {isAddingNewCustomer && (
                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase ml-1">Member Name</label>
                                            <input
                                                type="text"
                                                placeholder="Enter Full Name"
                                                className="w-full px-3 py-2 text-xs font-bold bg-white border border-indigo-200 rounded-lg outline-none focus:border-indigo-500 shadow-sm"
                                                value={guestName}
                                                onChange={(e) => setGuestName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase ml-1">Member Mobile</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 text-xs font-bold bg-white/50 border border-indigo-100 rounded-lg text-indigo-700 font-mono"
                                                value={guestMobile}
                                                onChange={(e) => setGuestMobile(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const newParty = { name: guestName || 'Register User', contact: guestMobile, partyType: 'Customer', branchId, companyId };
                                            try { await addParty(newParty).unwrap(); toast.success('Customer Registered!'); setIsAddingNewCustomer(false); } catch (e) { toast.error('Check fields'); }
                                        }}
                                        className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-black shadow-lg shadow-indigo-200 uppercase tracking-widest hover:bg-indigo-700 active:scale-[0.98] transition-all"
                                    >
                                        Register & Save Member
                                    </button>
                                </div>
                            )}

                            {selectedCustomer && (
                                <div className="flex items-center p-3 bg-emerald-50 border border-emerald-100 rounded-2xl gap-3 group">
                                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-100">
                                        <Package size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[12px] font-black text-slate-800 uppercase leading-none truncate">{selectedCustomer.name}</div>
                                        <div className="text-[10px] text-emerald-600 font-black mt-1.5 font-mono tracking-tighter">{selectedCustomer.contact}</div>
                                    </div>
                                    <button onClick={() => { setSelectedCustomer(null); setCustomerQuery(''); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors bg-white rounded-lg shadow-sm group-hover:bg-red-50"><Trash2 size={14} /></button>
                                </div>
                            )}
                        </div>

                        {/* Module 2: Settlement */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Banknote size={12} /> Payment Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Method</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-[11px] font-black outline-none focus:border-indigo-400 shadow-sm"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <option value="Cash">Cash Handover</option>
                                        <option value="UPI">UPI / QR Scan</option>
                                        <option value="Card">Bank Card</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Received (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm font-black text-slate-800 outline-none focus:border-indigo-400 text-right shadow-sm"
                                        value={amountReceived}
                                        onChange={(e) => setAmountReceived(Number(e.target.value))}
                                        onFocus={(e) => e.target.select()}
                                    />
                                </div>
                            </div>
                            <div className="bg-indigo-600 rounded-2xl p-4 flex items-center justify-between text-white shadow-xl shadow-indigo-100">
                                <span className="text-[10px] font-black uppercase opacity-60">Balance Change</span>
                                <span className="text-xl font-black">₹{changeToReturn.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Action Checkout */}
                    <div className="p-5 bg-[#f8fafc] border-t border-slate-200 space-y-3">
                        <button
                            disabled={isProcessing || cart.length === 0}
                            onClick={handleCheckout}
                            className={`
                                w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all shadow-xl
                                ${cart.length === 0 || isProcessing
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-200'}
                            `}
                        >
                            <CheckCircle2 size={20} />
                            <span>Save & Print Invoice [F8]</span>
                        </button>
                    </div>
                </aside>
            </div>

            {/* 3. Shortcuts Bar (Compact Fixed) */}
            <footer className="h-14 bg-white border-t border-slate-200 px-4 flex items-center gap-6 shrink-0 z-30">
                <div className="text-[10px] font-black text-slate-400 flex gap-4 uppercase tracking-[0.2em] border-r border-slate-100 pr-6 shrink-0">
                    <span>Rows: {cart.length}</span>
                    <span>Total Pcs: {cart.reduce((s, i) => s + (Number(i.quantity) || 0), 0)}</span>
                </div>
                <div className="flex items-center gap-3 no-scrollbar overflow-x-auto">
                    {[
                        { key: 'F2', label: 'Qty' },
                        { key: 'F3', label: 'Disc' },
                        { key: 'F4', label: 'Void' },
                        { key: 'F6', label: 'UoM' },
                        { key: 'F8', label: 'Pay' },
                        { key: 'F10', label: 'Scan' },
                        { key: 'F12', label: 'Menu' },
                    ].map((btn) => (
                        <button key={btn.key} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white transiton-all group shrink-0">
                            <span className="text-[10px] font-black text-indigo-600 group-hover:scale-110 transition-transform">{btn.key}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{btn.label}</span>
                        </button>
                    ))}
                </div>
            </footer>
        </div>
    );
};

export default PointOfSale;
