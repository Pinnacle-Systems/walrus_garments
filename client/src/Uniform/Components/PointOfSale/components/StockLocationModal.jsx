import React, { useState, useEffect } from 'react';
import Modal from '../../../../UiComponents/Modal';

const StockLocationModal = ({ isOpen, onClose, item, onSave }) => {
    const [fulfillments, setFulfillments] = useState([]);

    useEffect(() => {
        if (item) {
            // Ensure fulfillments has entry for all stockDetails stores
            const initialFulfillments = item.stockDetails?.map(store => {
                const existing = item.fulfillments?.find(f => f.storeId === store.storeId);
                return {
                    storeId: store.storeId,
                    storeName: store.storeName,
                    qty: existing ? existing.qty : 0
                };
            }) || [];
            setFulfillments(initialFulfillments);
        }
    }, [item, isOpen]);

    const handleQtyChange = (storeId, newQty) => {
        const val = parseFloat(newQty) || 0;
        const store = item.stockDetails?.find(s => s.storeId === storeId);
        
        if (val > (store?.stockQty || 0)) {
            // Optional: Show toast or warning
            return;
        }

        setFulfillments(prev => prev.map(f => f.storeId === storeId ? { ...f, qty: val } : f));
    };

    const totalFulfilled = fulfillments.reduce((sum, f) => sum + f.qty, 0);

    return (
        <Modal isOpen={isOpen} widthClass="w-[90vw] max-w-2xl" onClose={onClose}>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col p-6 font-sans">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Stock Allocation</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{item?.Item?.name} / {item?.Size?.name} / {item?.Color?.name}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Required</div>
                        <div className="text-2xl font-black text-indigo-600">{item?.qty || 0}</div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto max-h-[50vh]">
                    <div className="rounded-xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <th className="px-6 py-4">Store Name</th>
                                    <th className="px-6 py-4 text-center">Available Stock</th>
                                    <th className="px-6 py-4 text-center">Allocated Qty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {item?.stockDetails?.map(store => {
                                    const currentFulfillment = fulfillments.find(f => f.storeId === store.storeId)?.qty || 0;
                                    return (
                                        <tr key={store.storeId} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-bold text-slate-700">{store.storeName}</div>
                                                <div className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Location ID: {store.storeId}</div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-black">
                                                    {store.stockQty}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <input
                                                    type="number"
                                                    value={currentFulfillment}
                                                    onChange={(e) => handleQtyChange(store.storeId, e.target.value)}
                                                    className="w-24 mx-auto block text-center py-2 bg-white border-2 border-slate-100 rounded-xl text-sm font-black focus:border-indigo-500 outline-none transition-all group-hover:border-slate-200"
                                                    onFocus={(e) => e.target.select()}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t flex items-center justify-between bg-slate-50/50 -mx-6 -mb-6 px-6 py-6 mt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${totalFulfilled === (item?.qty || 0) ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <span className={`text-lg font-black ${totalFulfilled === (item?.qty || 0) ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {totalFulfilled} / {item?.qty || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={onClose} 
                            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(fulfillments)}
                            disabled={totalFulfilled !== (item?.qty || 0)}
                            className={`px-8 py-3 rounded-xl text-sm font-black text-white transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${totalFulfilled === (item?.qty || 0) ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 border-b-4 border-indigo-800' : 'bg-slate-300 cursor-not-allowed shadow-none'}`}
                        >
                            Confirm Allocation
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default StockLocationModal;
