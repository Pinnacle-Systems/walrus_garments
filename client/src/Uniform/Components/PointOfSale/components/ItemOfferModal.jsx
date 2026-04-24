import React from 'react';
import { Gift, X, Zap, Package } from 'lucide-react';
import Modal from '../../../../UiComponents/Modal';

const ItemOfferModal = ({
    isOpen,
    onClose,
    selectedItemForOffers,
    getItemApplicableOffers,
    selectedOffersByRow,
    setSelectedOffersByRow,
    Swal
}) => {

    console.log(selectedItemForOffers, "selectedItemForOffers")

    return (
        <Modal isOpen={isOpen} widthClass="w-[90vw] max-w-[1100px]" onClose={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-900 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <Gift size={20} className="text-yellow-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-wider">{selectedItemForOffers?.Item?.name}</h2>
                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest leading-none">Applicable Promotions & Offers</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-transform hover:rotate-90">
                        <X size={20} />
                    </button>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto bg-white p-4">
                    {getItemApplicableOffers(selectedItemForOffers).length > 0 ? (
                        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 sticky top-0 z-20">
                                    <tr>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200 w-[25%]">Offer Name</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200 w-[20%]">Discount Type</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200 w-[25%]">Currently Matched Condition</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200 w-[20%]">Benefit / Reward</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200 text-center w-[10%]">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {getItemApplicableOffers(selectedItemForOffers).map((off, idx) => {
                                        const activeItemKey = selectedItemForOffers ? `${selectedItemForOffers.id || selectedItemForOffers.itemId}-${selectedItemForOffers.sizeId}-${selectedItemForOffers.colorId}-${selectedItemForOffers.barcodeType}` : null;
                                        const isOfferSelected = activeItemKey && selectedOffersByRow[activeItemKey] === off.id;

                                        return (
                                            <tr key={idx} className={`group hover:bg-indigo-50/30 transition-colors ${isOfferSelected ? 'bg-indigo-50/50' : ''}`}>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-1.5 rounded-lg shrink-0 ${isOfferSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                                            <Zap size={14} fill={isOfferSelected ? 'currentColor' : 'none'} />
                                                        </div>
                                                        <span className="text-[11px] font-black text-slate-800 uppercase leading-none">{off.name}</span>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter border border-slate-200">
                                                        {off.discountType}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="text-[10px] font-medium text-slate-600">
                                                        {off.OfferRule?.[0]?.conditions?.rules?.[0] ? (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="italic opacity-70">
                                                                    {off.OfferRule[0].conditions.rules[0].field} {off.OfferRule[0].conditions.rules[0].operator} {off.OfferRule[0].conditions.rules[0].value}
                                                                </span>
                                                                {off._metrics && (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                                                        <span className="text-indigo-600 font-black not-italic text-[10px]">
                                                                            {off.OfferRule[0].conditions.rules[0].field === 'Minimum Quantity' ? `${off._metrics.scopeQty} Qty matched` : `₹${off._metrics.scopeValue.toLocaleString()} matched`}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 italic">No specific condition</span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg border border-emerald-100 w-fit">
                                                        <p className="text-[10px] font-black uppercase leading-tight">
                                                            {(() => {
                                                                if (off.discountType === 'Percentage') return `${off.discountValue}% DISCOUNT`;
                                                                if (off.discountType === 'Fixed') return `FLAT ₹${off.discountValue} OFF`;
                                                                
                                                                // For Volume / Override, check the matched tier if metrics available
                                                                const tier = off.OfferTier ? [...off.OfferTier].sort((a, b) => b.minQty - a.minQty)
                                                                    .find(t => (off._metrics?.scopeQty || 0) >= t.minQty) : null;
                                                                
                                                                const displayTier = tier || off.OfferTier?.[0];

                                                                if (off.discountType === 'Override') {
                                                                    return displayTier ? `PRICE OVERRIDE: ₹${displayTier.value}` : 'PRICE OVERRIDE';
                                                                }
                                                                if (off.discountType === 'Volume') {
                                                                    return displayTier ? `VOLUME: ${displayTier.type === 'Percentage' ? `${displayTier.value}%` : `₹${displayTier.value}`} OFF` : 'VOLUME DISCOUNT';
                                                                }
                                                                return off.discountType;
                                                            })()}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOffersByRow(prev => ({
                                                                ...prev,
                                                                [activeItemKey]: isOfferSelected ? null : off.id
                                                            }));
                                                            onClose();
                                                            Swal.fire({
                                                                title: isOfferSelected ? 'Removed' : 'Applied',
                                                                icon: 'success',
                                                                text: isOfferSelected ? "Offer deselected." : `"${off.name}" Applied!`,
                                                                timer: 1500,
                                                                showConfirmButton: false,
                                                                toast: true,
                                                                position: 'top-end'
                                                            });
                                                        }}
                                                        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isOfferSelected
                                                            ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 hover:border-red-600'
                                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'
                                                            }`}
                                                    >
                                                        {isOfferSelected ? 'Deselect' : 'Select'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="text-slate-200" size={32} />
                            </div>
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">No Offers Available</h3>
                            <p className="text-[10px] font-medium text-slate-400">There are no active promotions for this item at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Walrus System Engine v3.1</span>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Pricing validation secured</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ItemOfferModal;
