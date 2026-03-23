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
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useGetItemMasterQuery } from '../../../redux/uniformService/ItemMasterService';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { useAddSalesInvoiceMutation } from '../../../redux/uniformService/salesInvoiceServices';
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
    const [addSalesInvoice] = useAddSalesInvoiceMutation();

    const items = itemsData?.data || [];
    const customers = customerData?.data || [];
    const categories = ['All', ...new Set(items.map(item => item.itemCategoryName || 'General'))];

    // Filter items
    const filteredItems = items.filter(item => {
        const matchesSearch = (item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.itemCode?.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || item.itemCategoryName === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Handle Quick Scan
    const handleScan = (e) => {
        if (e.key === 'Enter') {
            const item = items.find(i => i.itemCode === searchQuery || i.barcode === searchQuery);
            if (item) {
                addToCart(item);
                setSearchQuery('');
            } else {
                toast.warning("Product not found");
            }
        }
    };

    // Cart actions
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1, rate: product.rate || 0 }];
        });
        toast.success(`${product.itemName} added`, { autoClose: 800, hideProgressBar: true, position: 'bottom-right' });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.rate || 0) * item.quantity, 0);
    const taxRate = 0.18; // 18% GST mock
    const tax = (subtotal - discount) * taxRate;
    const total = subtotal - discount + tax;

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error("Cart is empty");
            return;
        }
        if (!selectedCustomer) {
            toast.error("Please select a customer");
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
                const invoicePayload = {
                    date: new Date().toISOString().split('T')[0],
                    customerId: selectedCustomer.id,
                    supplierId: selectedCustomer.id,
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

    return (
        <div className="flex flex-col h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200">
                        <ScanBarcode size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-800">WALRUS <span className="text-indigo-600">POS</span></h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Terminal</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 max-w-xl mx-12 hidden lg:block">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            ref={scannerRef}
                            type="text"
                            placeholder="Scan Barcode or Search (Ctrl + F)..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-100 border-2 border-transparent rounded-2xl focus:border-indigo-500/30 focus:bg-white transition-all text-sm outline-none font-medium shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleScan}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                        <Clock size={16} />
                        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors relative md:hidden" onClick={() => setShowCartMobile(!showCartMobile)}>
                        <ShoppingCart size={22} className="text-slate-600" />
                        {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                                {cart.length}
                            </span>
                        )}
                    </button>
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
                        AD
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden">

                {/* Left Side: Product Selection */}
                <section className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">

                    {/* Category Tabs */}
                    <div className="px-6 py-4 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${selectedCategory === cat
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50'
                                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        {itemsLoading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-slate-100"></div>
                                ))}
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    layout
                                    className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
                                >
                                    {filteredItems.map(item => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            whileHover={{ y: -4 }}
                                            onClick={() => addToCart(item)}
                                            className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
                                        >
                                            <div className="aspect-square bg-slate-50 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                                                <Package size={40} className="text-slate-300 group-hover:text-indigo-300 transition-colors" />
                                                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors"></div>
                                            </div>
                                            <h3 className="font-bold text-sm text-slate-800 line-clamp-2 leading-snug mb-1">{item.itemName}</h3>
                                            <div className="flex items-center justify-between mt-auto">
                                                <span className="text-indigo-600 font-bold">₹{item.rate?.toLocaleString() || '0'}</span>
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold uppercase">{item.uomName}</span>
                                            </div>

                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg">
                                                    <Plus size={16} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        )}

                        {!itemsLoading && filteredItems.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <Search size={64} strokeWidth={1} className="mb-4" />
                                <p className="text-lg font-medium">No products found</p>
                                <p className="text-sm">Try adjusting your search or category</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Right Side: Cart & Checkout (Sidebar) */}
                <aside className={`
                    w-[400px] bg-white border-l border-slate-200 flex flex-col shrink-0 transition-transform duration-300
                    md:translate-x-0 fixed inset-y-0 right-0 z-50 md:relative shadow-2xl md:shadow-none
                    ${showCartMobile ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                `}>
                    {/* Cart Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold">Current Order</h2>
                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">{cart.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors" onClick={() => {
                                if (cart.length > 0) {
                                    Swal.fire({
                                        title: 'Clear Cart?',
                                        text: "This will remove all items from the current order.",
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: '#ef4444',
                                        confirmButtonText: 'Yes, clear it'
                                    }).then((result) => { if (result.isConfirmed) setCart([]) });
                                }
                            }}>
                                <Trash2 size={20} />
                            </button>
                            <button className="md:hidden p-2 hover:bg-slate-100 rounded-xl" onClick={() => setShowCartMobile(false)}>
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Customer Selection */}
                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none cursor-pointer"
                                value={selectedCustomer?.id || ''}
                                onChange={(e) => {
                                    const cust = customers.find(c => c.id == e.target.value);
                                    setSelectedCustomer(cust);
                                }}
                            >
                                <option value="">Select Customer / Guest</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <AnimatePresence initial={false}>
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-3">
                                    <ShoppingCart size={48} strokeWidth={1.5} />
                                    <p className="text-sm font-medium">Cart is waiting for something tasty...</p>
                                </div>
                            ) : cart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex gap-3 group"
                                >
                                    <div className="w-16 h-16 bg-slate-100 rounded-xl shrink-0 flex items-center justify-center overflow-hidden border border-slate-100">
                                        <Package size={24} className="text-slate-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-slate-800 truncate mb-1">{item.itemName}</h4>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="p-1 hover:bg-white hover:text-indigo-600 rounded-md transition-all shadow-sm"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="p-1 hover:bg-white hover:text-indigo-600 rounded-md transition-all shadow-sm"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <span className="font-bold text-slate-700">₹{(item.rate * item.quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all self-start"
                                    >
                                        <X size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Summary & Checkout */}
                    <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-slate-500 text-sm">
                                <span>Subtotal</span>
                                <span className="font-semibold text-slate-700">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500 text-sm">
                                <span>Discount</span>
                                <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                    <input
                                        type="number"
                                        className="w-24 pl-5 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-right text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                                        value={discount}
                                        onChange={(e) => setDiscount(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between text-slate-500 text-sm">
                                <span>Tax (GST 18%)</span>
                                <span className="font-semibold text-slate-700">₹{tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-800 font-black text-2xl pt-2 border-t border-slate-200 mt-2">
                                <span>Total</span>
                                <span className="text-indigo-600">₹{total.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Payment Options */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {[
                                { id: 'Cash', icon: <Banknote size={16} />, label: 'Cash' },
                                { id: 'Card', icon: <CreditCard size={16} />, label: 'Card' }
                            ].map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${paymentMethod === method.id
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {method.icon}
                                    {method.label}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={isProcessing || cart.length === 0}
                            onClick={handleCheckout}
                            className={`
                                w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-2xl transition-all
                                ${cart.length === 0 || isProcessing
                                    ? 'bg-slate-300 text-slate-100 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-200'}
                            `}
                        >
                            {isProcessing ? (
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <CheckCircle2 size={24} />
                                    <span>Place Order</span>
                                </>
                            )}
                        </button>
                    </div>
                </aside>
            </main>

            {/* Floating Action Button (Mobile Only) */}
            <div className="fixed bottom-6 right-6 md:hidden z-10">
                <button
                    disabled={cart.length === 0}
                    className="bg-indigo-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center disabled:bg-slate-400"
                    onClick={() => setShowCartMobile(true)}
                >
                    <ShoppingCart size={24} />
                </button>
            </div>
        </div>
    );
};

export default PointOfSale;
