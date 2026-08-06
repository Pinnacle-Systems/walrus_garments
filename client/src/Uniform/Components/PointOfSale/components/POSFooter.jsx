import React from 'react';

const POSFooter = ({
    cart,
    activeRowIndex,
    qtyInputRefs,
    discountRef,
    setShowReports,
    handlePayNow,
    handleSaveUnpaid,
    scannerRef,
    isAdmin,
    approvalStatus,
    setSearchMode
}) => {
    const isPendingApproval = isAdmin && approvalStatus === 'PENDING';

    const shortcuts = isPendingApproval ? [
        {
            key: 'F8', label: 'Approve', action: () => handlePayNow()
        }
    ] : [
        {
            key: 'F2', label: 'Barcode', action: () => {
                setSearchMode('BARCODE');
                scannerRef.current?.focus();
            }
        },
        {
            key: 'F3', label: 'Name', action: () => {
                setSearchMode('NAME');
                scannerRef.current?.focus();
            }
        },
        {
            key: 'F4', label: 'Reports', action: () => setShowReports(prev => !prev)
        },
        {
            key: 'F8', label: 'Pay', action: () => handlePayNow()
        },
        {
            key: 'F9', label: 'Save', action: () => handleSaveUnpaid()
        },
        {
            key: 'F10', label: 'Scan', action: () => {
                scannerRef.current?.focus();
            }
        },
    ];

    return (
        <footer className="hidden md:flex h-12 bg-white border-t border-slate-200 px-4 items-center shrink-0 z-30 gap-20">

            <div className="flex items-center gap-3 no-scrollbar overflow-x-auto ml-4">
                {shortcuts.map((btn) => (
                    <button
                        key={btn.key}
                        onClick={btn.action || undefined}
                        disabled={!btn.action}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:bg-white transition-all group shrink-0 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <span className="text-xs font-black text-indigo-700 group-hover:scale-110 transition-transform">{btn.key}</span>
                        <span className="text-[10px] font-black text-slate-700 uppercase">{btn.label}</span>
                    </button>
                ))}
            </div>
            <div className="text-xs font-black text-slate-700 flex items-center gap-3 uppercase tracking-[0.15em] pr-4 shrink-0">
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-bold flex items-center">
                    Rows: <strong className="font-black text-slate-900 text-sm ml-1.5">{cart.length}</strong>
                </span>
                <span className="bg-indigo-50 text-indigo-950 px-3 py-1 rounded-lg border border-indigo-200 font-bold flex items-center shadow-xs">
                    Total Qty: <strong className="text-indigo-700 text-base font-extrabold ml-1.5">{cart?.filter((i) => !(i.isReturn))?.reduce((s, i) => s + (Number(i.qty) || 0), 0)}</strong>
                </span>
            </div>
        </footer>
    );
};

export default POSFooter;
