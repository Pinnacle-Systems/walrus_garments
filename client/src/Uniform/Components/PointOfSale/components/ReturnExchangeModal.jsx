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
    setSalesNo
}) => {
    const { branchId, companyId, finYearId } = getCommonParams();
    const [selectedBill, setSelectedBill] = useState(null);
    const [selectedIndices, setSelectedIndices] = useState([]);
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

    const billOptions = (billsData?.data || []).map(b => ({
        value: String(b.id),
        label: `${b.docId}`,
        bill: b
    }));

    useEffect(() => {
        if (selectedBill) {
            setSelectedIndices(selectedBill.PosItems?.map((_, i) => i) || []);
        } else {
            setSelectedIndices([]);
        }
    }, [selectedBill]);

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
        if (!selectedBill || selectedIndices.length === 0) return;
        const filteredBill = {
            ...selectedBill,
            PosItems: selectedBill.PosItems.filter((_, i) => selectedIndices.includes(i))
        };
        onBillSelected(filteredBill);
        handleModalClose();
    };

    const handleModalClose = () => {
        setSelectedBill(null);
        setSelectedIndices([]);
        // setSalesNo('');
        onClose();
    };

    const toggleItem = (idx) => {
        setSelectedIndices(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const toggleAll = () => {
        if (selectedIndices.length === selectedBill?.PosItems?.length) {
            setSelectedIndices([]);
        } else {
            setSelectedIndices(selectedBill?.PosItems?.map((_, i) => i) || []);
        }
    };

    return (
        <Modal isOpen={isOpen} widthClass="w-[850px]" onClose={handleModalClose}>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 bg-gradient-to-br from-indigo-900 to-slate-900 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                            <RotateCcw size={20} className="text-indigo-300" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest">Return / Exchange</h2>
                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-tighter">Reference Original Bill</p>
                        </div>
                    </div>
                    <button onClick={handleModalClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Select
                                options={billOptions}
                                value={billOptions.find(opt => opt.value === salesNo)}
                                onChange={(opt) => {
                                    setSalesNo(opt.value);
                                    handleSearch(opt.value);
                                }}
                                isLoading={isBillsFetching}
                                placeholder="Search & Select Bill (Doc No / Customer)"
                                isSearchable={true}
                                className="text-xs font-bold uppercase"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderRadius: '12px',
                                        padding: '2px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: 'none',
                                        '&:hover': { border: '1px solid #6366f1' }
                                    }),
                                    placeholder: (base) => ({ ...base, color: '#94a3b8' }),
                                    option: (base, state) => ({
                                        ...base,
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#f1f5f9' : 'white',
                                        color: state.isSelected ? 'white' : '#1e293b'
                                    })
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-auto p-4 space-y-4 min-h-[400px]">
                    {selectedBill ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Bill Info Card */}
                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 mb-4 grid grid-cols-4 gap-3">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-indigo-500" />
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Date</p>
                                        <p className="text-[10px] font-bold text-slate-700">{new Date(selectedBill.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-indigo-500" />
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Customer</p>
                                        <p className="text-[10px] font-bold text-slate-700 truncate">{selectedBill.Party?.name || selectedBill.customerName || 'Walk-in'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShoppingBag size={14} className="text-indigo-500" />
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Items</p>
                                        <p className="text-[10px] font-bold text-slate-700">{selectedBill.PosItems?.length || 0}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-indigo-500 font-black text-[10px]">₹</div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Bill Amount</p>
                                        <p className="text-[10px] font-bold text-slate-700">₹{selectedBill.netAmount?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Select Stock Row</h3>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={selectedIndices.length === 0}
                                        className="px-4 py-1.5 border border-green-500 text-green-600 bg-white rounded-md text-[10px] font-bold hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                                    >
                                        Done
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#f8fafc] border-b border-slate-200">
                                            <tr>
                                                <th className="p-2 border-r border-slate-200 w-10 text-center">
                                                    <button onClick={toggleAll} className="p-0.5 hover:bg-slate-200 rounded transition-colors inline-flex items-center">
                                                        {selectedIndices.length === selectedBill.PosItems?.filter(i => !i.retunBillId).length && selectedIndices.length > 0 ?
                                                            <CheckSquare size={14} className="text-indigo-600" /> : <Square size={14} className="text-slate-400" />}
                                                    </button>
                                                </th>
                                                <th className="p-2 border-r border-slate-200 text-[9px] font-black text-slate-500 uppercase text-center w-12">S No</th>
                                                <th className="p-2 border-r border-slate-200 text-[9px] font-black text-slate-500 uppercase">Item</th>
                                                <th className="p-2 border-r border-slate-200 text-[9px] font-black text-slate-500 uppercase text-center w-16">Size</th>
                                                <th className="p-2 border-r border-slate-200 text-[9px] font-black text-slate-500 uppercase text-center w-20">Color</th>
                                                <th className="p-2 border-r border-slate-200 text-[9px] font-black text-slate-500 uppercase text-center w-24">Location</th>
                                                <th className="p-2 text-[9px] font-black text-slate-500 uppercase text-right w-32 px-4">Available Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedBill.PosItems?.filter(i => !i.retunBillId).map((item, idx) => {
                                                const isSelected = selectedIndices.includes(idx);
                                                const availableQty = parseFloat(item.qty || 0) - (item.returnedQty || 0);

                                                return (
                                                    <tr
                                                        key={idx}
                                                        onClick={() => availableQty > 0 && toggleItem(idx)}
                                                        className={`border-b border-slate-100 hover:bg-indigo-50/30 transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50/50' : ''} ${availableQty <= 0 ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
                                                    >
                                                        <td className="p-2 border-r border-slate-200 text-center">
                                                            {isSelected ? <CheckSquare size={14} className="text-indigo-600 mx-auto" /> : <Square size={14} className="text-slate-300 mx-auto" />}
                                                        </td>
                                                        <td className="p-2 border-r border-slate-200 text-[10px] font-bold text-slate-600 text-center">{idx + 1}</td>
                                                        <td className="p-2 border-r border-slate-200">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight leading-none">{item.item_name || item?.Item?.name || "Item Name"}</span>
                                                                {availableQty <= 0 && <span className="text-[7px] text-red-500 font-bold uppercase mt-1">Already Fully Returned</span>}
                                                            </div>
                                                        </td>
                                                        <td className="p-2 border-r border-slate-200 text-[10px] font-bold text-slate-500 text-center uppercase">
                                                            {item.size || item.Size?.name || '-'}
                                                        </td>
                                                        <td className="p-2 border-r border-slate-200 text-[10px] font-bold text-slate-500 text-center uppercase">
                                                            {item.color || item.Color?.name || '-'}
                                                        </td>
                                                        <td className="p-2 border-r border-slate-200 text-[10px] font-bold text-slate-500 text-center uppercase">
                                                            RETAIL
                                                        </td>
                                                        <td className="p-2 text-[10px] font-black text-slate-700 text-right px-4">
                                                            {availableQty.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}

                                            {selectedBill.PosItems?.filter(i => !i.retunBillId).length === 0 && (
                                                <tr>
                                                    <td colSpan="7" className="p-8 text-center text-[10px] font-bold text-slate-400 uppercase italic">
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
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-60 space-y-3">
                            <div className="p-5 bg-slate-50 rounded-2xl">
                                <Package size={48} className="text-slate-300" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Search for a bill</p>
                                <p className="text-[10px] font-medium text-slate-400 leading-tight">Enter a valid sales number above to load items<br />for return or exchange.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0 md:hidden">
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedBill || selectedIndices.length === 0}
                        className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${selectedBill && selectedIndices.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
                    >
                        Fill {selectedIndices.length} Item(s) <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ReturnExchangeModal;


