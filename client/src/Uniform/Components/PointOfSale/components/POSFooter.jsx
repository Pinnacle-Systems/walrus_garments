import React from 'react';

const POSFooter = ({
    cart,
    activeRowIndex,
    qtyInputRefs,
    discountRef,
    setShowReports,
    handlePayNow,
    scannerRef
}) => {
    const shortcuts = [
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
    ];

    return (
        <footer className="h-14 bg-white border-t border-slate-200 px-4 flex items-center shrink-0 z-30">
            <div className="text-[10px] font-black text-slate-400 flex gap-4 uppercase tracking-[0.2em] border-r border-slate-100 pr-6 shrink-0">
                <span>Rows: {cart.length}</span>
                <span>Total Pcs: {cart.reduce((s, i) => s + (Number(i.qty) || 0), 0)}</span>
            </div>
            <div className="flex items-center gap-3 no-scrollbar overflow-x-auto ml-4">
                {shortcuts.map((btn) => (
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
    );
};

export default POSFooter;
