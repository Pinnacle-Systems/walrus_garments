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
    return (
        <Modal isOpen={isOpen} widthClass="w-[450px]" onClose={onClose}>
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
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Offer List */}
                <div className="p-3 bg-slate-50 space-y-2 max-h-[400px] overflow-auto">
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
                                            onClose();
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
    );
};

export default ItemOfferModal;
