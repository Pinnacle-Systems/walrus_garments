import React, { useState, useEffect } from 'react';
import { Search, X, Package, RotateCcw, ShoppingBag, Calendar, User, ArrowRight, Loader2, CheckSquare, Square } from 'lucide-react';
import Modal from '../../../../UiComponents/Modal';
import Select from 'react-select';
import { useLazyGetPointOfSalesByIdQuery, useLazyGetPointOfSalesQuery } from '../../../../redux/uniformService/PointOfSalesService';
import { getCommonParams } from '../../../../Utils/helper';

const ReturnExchangeModal = ({
    isOpen,
    onClose,
    onBillSelected,
    Swal,
    salesNo,
    setSalesNo,
    setShowReturnExchnageModal,
    setTransactionType,
    cart
}) => {
    const { branchId, companyId, finYearId } = getCommonParams();
    const [selectedBill, setSelectedBill] = useState(null);
    const [selectedItemIds, setSelectedItemIds] = useState([]);
    const [selectInput, setSelectInput] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [searchItem, setSearchItem] = useState('');
    const [searchBarcode, setSearchBarcode] = useState('');
    const [searchSize, setSearchSize] = useState('');
    const [searchColor, setSearchColor] = useState('');
    const [searchUom, setSearchUom] = useState('');
    const [fetchBillById, {
        isFetching: isSingleFetching,
    }] = useLazyGetPointOfSalesByIdQuery();

    const [fetchBills, { data: billsData, isFetching: isBillsFetching }] = useLazyGetPointOfSalesQuery();

    useEffect(() => {
        if (isOpen) {
            fetchBills({
                params: {
                    branchId,
                    companyId,
                    finYearId,
                }
            });
        }
    }, [isOpen, branchId, companyId, finYearId, fetchBills]);

    useEffect(() => {
        if (isOpen && salesNo && !selectedBill) {
            handleSearch(salesNo);
        }
    }, [isOpen, salesNo]);

    const billOptions = (billsData?.data || [])
        ?.filter(item =>
            !item.isReturn &&
            item?.bilStatus === "PAID")?.map(b => ({
                value: String(b.id),
                label: `${b.docId}`,
                bill: b
            }));

    useEffect(() => {
        if (selectedBill) {
            const itemsInCart = cart?.filter(item => item.isReturn && item.retunBillId === selectedBill.id) || [];
            if (itemsInCart.length > 0) {
                setSelectedItemIds(itemsInCart.map(item => item.originalItemId));
            } else {
                setSelectedItemIds([]);
            }
        } else {
            setSelectedItemIds([]);
        }
    }, [selectedBill, cart]);

    const handleSearch = async (id = salesNo) => {
        const searchId = id?.trim();
        if (!searchId) return;
        try {
            const res = await fetchBillById(searchId).unwrap();

            if (res.data) {
                setSelectedBill(res.data);
                setSalesNo(String(res.data.id));
            } else {
                Swal.fire({ title: 'Not Found', text: 'No bill found.', icon: 'warning', timer: 1500, showConfirmButton: false });
                setSelectedBill(null);
            }
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'Failed to fetch bill details.', icon: 'error' });
        }
    };

    const handleConfirm = () => {
        if (!selectedBill || selectedItemIds.length === 0) return;
        const filteredBill = {
            ...selectedBill,
            PosItems: selectedBill.PosItems.filter((item) => selectedItemIds.includes(item.id))
        };
        /* console.log removed */
        onBillSelected(filteredBill);
        setSelectedBill(null);
        setSelectedItemIds([]);
        setShowReturnExchnageModal(false);

    };

    const handleModalClose = () => {
        setSelectedBill(null);
        setSelectedItemIds([]);
        setShowReturnExchnageModal(false);

        // Only reset to SALE if no return items are in the cart
        const hasReturnItems = cart?.some(item => item.isReturn);
        if (!hasReturnItems) {
            setTransactionType("SALE")
            setSalesNo(null);
        }
    };

    const toggleItem = (id) => {
        setSelectedItemIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const returnableItems = selectedBill?.PosItems?.filter(item => {
        if (item.retunBillId) return false;
        const availableQty = parseFloat(item.qty || 0) - parseFloat(item.returnedQty || 0);
        return availableQty > 0;
    }) || [];

    const hasAnyReturnableItems = returnableItems.length > 0;

    const toggleAll = () => {
        if (selectedItemIds.length === returnableItems.length) {
            setSelectedItemIds([]);
        } else {
            setSelectedItemIds(returnableItems.map(item => item.id));
        }
    };

    return (
        <Modal isOpen={isOpen} widthClass="w-[95%] h-[90%]" onClose={handleModalClose}>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-1 bg-gradient-to-br from-indigo-900 to-slate-900 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                            <RotateCcw size={20} className="text-indigo-300" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest">Return / Exchange</h2>
                        </div>
                    </div>

                </div>

                <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                    <div className="grid grid-cols-12 gap-2 items-center">
                        {/* Date Filter */}
                        <div className="col-span-2">
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="w-full text-[10px] font-bold uppercase text-slate-900 bg-white border border-slate-200 rounded-xl px-2 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        {/* Bill Search */}
                        <div className="col-span-4 relative">
                            <Select
                                options={billOptions}
                                value={billOptions.find(opt => opt.value === salesNo) || null}
                                inputValue={selectInput}
                                onInputChange={(newValue, actionMeta) => {
                                    if (actionMeta.action === 'input-change') {
                                        setSelectInput(newValue);
                                        if (newValue === '') {
                                            setSalesNo('');
                                            setSelectedBill(null);
                                        }
                                    } else if (actionMeta.action === 'input-blur' || actionMeta.action === 'menu-close') {
                                        setSelectInput('');
                                    }
                                }}
                                onFocus={(e) => {
                                    const selectedOpt = billOptions.find(opt => opt.value === salesNo);
                                    if (selectedOpt) {
                                        setSelectInput(selectedOpt.label);
                                        const length = selectedOpt.label.length;
                                        setTimeout(() => {
                                            const input = e.target;
                                            if (input && typeof input.setSelectionRange === 'function') {
                                                input.setSelectionRange(length, length);
                                            }
                                        }, 50);
                                    }
                                }}
                                onChange={(opt) => {
                                    if (opt) {
                                        setSalesNo(opt.value);
                                        handleSearch(opt.value);
                                        setSelectInput(opt.label);
                                    } else {
                                        setSalesNo('');
                                        setSelectedBill(null);
                                        setSelectInput('');
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if ((e.key === 'Backspace' || e.key === 'Delete') && salesNo && !e.target.value) {
                                        setSalesNo('');
                                        setSelectedBill(null);
                                        setSelectInput('');
                                    }
                                }}
                                isLoading={isBillsFetching}
                                placeholder="Search Bill (Doc / Cust)"
                                isSearchable={true}
                                isClearable={true}
                                className="text-xs font-bold uppercase"
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderRadius: '12px',
                                        padding: '2px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: 'none',
                                        '&:hover': { border: '1px solid #6366f1' }
                                    }),
                                    placeholder: (base) => ({ ...base, color: '#475569' }),
                                    singleValue: (base) => ({ ...base, color: '#0f172a' }),
                                    option: (base, state) => ({
                                        ...base,
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#f1f5f9' : 'white',
                                        color: state.isSelected ? 'white' : '#1e293b'
                                    }),
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                            />
                        </div>

                        {/* Bill Details */}
                        <div className="col-span-6 flex items-center justify-between px-3 bg-white border border-slate-200 rounded-xl p-1.5 h-[42px]">
                            <div className="flex items-center gap-2 border-r border-slate-100 pr-3 w-1/3">
                                <User size={14} className="text-indigo-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none truncate">Customer</p>
                                    <p className="text-[10px] font-bold text-slate-900 truncate">
                                        {selectedBill ? (selectedBill.Party?.name || selectedBill.customerName || 'Walk-in') : '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 border-r border-slate-100 pl-1 pr-3 w-1/3">
                                <ShoppingBag size={14} className="text-indigo-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none truncate">Items</p>
                                    <p className="text-[10px] font-bold text-slate-900 truncate">
                                        {selectedBill ? (selectedBill.PosItems?.length || 0) : '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pl-1 w-1/3">
                                <div className="text-indigo-500 font-black text-[10px] shrink-0">₹</div>
                                <div className="min-w-0">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none truncate">Amount</p>
                                    <p className="text-[10px] font-bold text-slate-900 truncate">
                                        {selectedBill ? `₹${selectedBill.netAmount?.toLocaleString()}` : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-auto p-4 space-y-4 min-h-[400px]">
                    {selectedBill ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

                            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Select Return Items</h3>

                                </div>

                                <div className="overflow-auto max-h-[350px] relative">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#f8fafc] border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="p-2 border-r border-slate-200 w-10 text-center" rowSpan="2">
                                                    <button
                                                        onClick={toggleAll}
                                                        disabled={!hasAnyReturnableItems}
                                                        className={`p-0.5 hover:bg-slate-200 rounded transition-colors inline-flex items-center ${!hasAnyReturnableItems ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                                        {selectedItemIds.length === returnableItems.length && selectedItemIds.length > 0 ?
                                                            <CheckSquare size={14} className="text-indigo-600" /> : <Square size={14} className="text-slate-600" />}
                                                    </button>
                                                </th>
                                                <th className="p-2 border-r border-slate-200 text-[9px] font-black text-slate-800 uppercase text-center w-12" rowSpan="2">S No</th>
                                                <th className="p-2 border-r border-slate-200 text-[9px] font-black text-slate-800 uppercase w-[30%]">Item</th>
                                                <th className="p-2 border-r border-slate-200 text-[9px] font-black text-slate-800 uppercase text-center w-32">Barcode</th>
                                                <th className="p-2 border-r border-slate-200 text-[9px] font-black text-slate-800 uppercase text-center w-20">Size</th>
                                                <th className="p-2 border-r border-slate-200 text-[9px] font-black text-slate-800 uppercase text-center w-24">Color</th>
                                                <th className="p-2 border-r border-slate-200 text-[9px] font-black text-slate-800 uppercase text-center w-20">UOM</th>
                                                <th className="p-2 border-r border-slate-200 text-[9px] font-black text-slate-800 uppercase text-center w-16" rowSpan="2">Qty</th>
                                                <th className="p-2 border-r border-slate-200 text-[9px] font-black text-slate-800 uppercase text-center w-24" rowSpan="2">Balance Qty</th>
                                            </tr>
                                            <tr>
                                                <th className="p-1 border-r border-slate-200 bg-white">
                                                    <input type="text" placeholder="Search Item..." value={searchItem} onChange={(e) => setSearchItem(e.target.value)} className="w-full text-[9px] p-1 border border-slate-200 rounded outline-none focus:border-indigo-500 font-semibold text-slate-800 normal-case" />
                                                </th>
                                                <th className="p-1 border-r border-slate-200 bg-white">
                                                    <input type="text" placeholder="Barcode..." value={searchBarcode} onChange={(e) => setSearchBarcode(e.target.value)} className="w-full text-[9px] p-1 border border-slate-200 rounded outline-none focus:border-indigo-500 font-semibold text-slate-800 normal-case" />
                                                </th>
                                                <th className="p-1 border-r border-slate-200 bg-white">
                                                    <input type="text" placeholder="Size..." value={searchSize} onChange={(e) => setSearchSize(e.target.value)} className="w-full text-[9px] p-1 border border-slate-200 rounded outline-none focus:border-indigo-500 font-semibold text-slate-800 normal-case" />
                                                </th>
                                                <th className="p-1 border-r border-slate-200 bg-white">
                                                    <input type="text" placeholder="Color..." value={searchColor} onChange={(e) => setSearchColor(e.target.value)} className="w-full text-[9px] p-1 border border-slate-200 rounded outline-none focus:border-indigo-500 font-semibold text-slate-800 normal-case" />
                                                </th>
                                                <th className="p-1 border-r border-slate-200 bg-white">
                                                    <input type="text" placeholder="UOM..." value={searchUom} onChange={(e) => setSearchUom(e.target.value)} className="w-full text-[9px] p-1 border border-slate-200 rounded outline-none focus:border-indigo-500 font-semibold text-slate-800 normal-case" />
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedBill.PosItems?.filter(item => {
                                                if (item.retunBillId) return false;
                                                const itemNameStr = (item.item_name || item?.Item?.name || "").toLowerCase();
                                                const barcodeStr = (item.barcode || "").toLowerCase();
                                                const sizeStr = (item.size || item.Size?.name || "").toLowerCase();
                                                const colorStr = (item.color || item.Color?.name || "").toLowerCase();
                                                const uomStr = (item.Uom?.name || "").toLowerCase();

                                                return itemNameStr.includes(searchItem.toLowerCase()) &&
                                                    barcodeStr.includes(searchBarcode.toLowerCase()) &&
                                                    sizeStr.includes(searchSize.toLowerCase()) &&
                                                    colorStr.includes(searchColor.toLowerCase()) &&
                                                    uomStr.includes(searchUom.toLowerCase());
                                            }).map((item, idx) => {
                                                const isSelected = selectedItemIds.includes(item.id);
                                                const availableQty = parseFloat(item.qty || 0) - parseFloat(item.returnedQty || 0);

                                                return (
                                                    <tr
                                                        key={item.id}
                                                        onClick={() => availableQty > 0 && toggleItem(item.id)}
                                                        className={`border-b border-slate-100 hover:bg-indigo-50/30 transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50/50' : ''} ${availableQty <= 0 ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
                                                    >
                                                        <td className="p-2 border-r border-slate-200 text-center">
                                                            {isSelected ? <CheckSquare size={14} className="text-indigo-600 mx-auto" /> : <Square size={14} className="text-slate-500 mx-auto" />}
                                                        </td>
                                                        <td className="p-2 border-r border-slate-200 text-[10px] font-bold text-slate-800 text-center">{idx + 1}</td>
                                                        <td className="p-2 border-r border-slate-200">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none">{item.item_name || item?.Item?.name || "Item Name"}</span>
                                                                {availableQty <= 0 && <span className="text-[7px] text-red-500 font-bold uppercase mt-1">Already Fully Returned</span>}
                                                            </div>
                                                        </td>
                                                        <td className="p-2 border-r border-slate-200 text-[10px] font-bold text-slate-800 text-center uppercase">
                                                            {item.barcode || '-'}
                                                        </td>
                                                        <td className="p-2 border-r border-slate-200 text-[10px] font-bold text-slate-800 text-center uppercase">
                                                            {item.size || item.Size?.name || '-'}
                                                        </td>
                                                        <td className="p-2 border-r border-slate-200 text-[10px] font-bold text-slate-800 text-center uppercase">
                                                            {item.color || item.Color?.name || '-'}
                                                        </td>
                                                        <td className="p-2 border-r border-slate-200 text-[10px] font-bold text-slate-800 text-center uppercase">
                                                            {item.Uom?.name || '-'}
                                                        </td>
                                                        <td className="p-2 border-r border-slate-200 text-[10px] font-bold text-slate-800 text-center uppercase">
                                                            {item.qty}
                                                        </td>
                                                        <td className="p-2 border-r border-slate-200 text-[10px] font-bold text-slate-800 text-center uppercase">
                                                            {availableQty}
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {selectedBill.PosItems?.filter(i => !i.retunBillId).length === 0 && (
                                                <tr>
                                                    <td colSpan="9" className="p-8 text-center text-[10px] font-bold text-slate-600 uppercase italic">
                                                        No returnable items found in this bill
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-85 space-y-3">
                            <div className="p-5 bg-slate-50 rounded-2xl">
                                <Package size={48} className="text-slate-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-700">Search for a bill</p>
                                <p className="text-[10px] font-medium text-slate-600 leading-tight">Enter a valid sales number above to load items<br />for return or exchange.</p>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleConfirm}
                    disabled={!selectedBill || selectedItemIds.length === 0}
                    className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${selectedBill && selectedItemIds.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
                >
                    Fill {selectedItemIds.length} Item(s) <ArrowRight size={16} />
                </button>
            </div>
        </Modal>
    );
};

export default ReturnExchangeModal;


