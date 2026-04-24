import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { showEntries } from '../../../Utils/DropdownData';

const PosReports = ({
    recentSales,
    totalCount,
    currentPageNumber,
    setCurrentPageNumber,
    dataPerPage,
    setDataPerPage,
    serachDocNo,
    setSerachDocNo,
    searchDate,
    setSearchDate,
    searchCustomerName,
    setSearchCustomerName,
    onEdit,
    isLoading
}) => {

    const totalPages = Math.ceil(totalCount / parseInt(dataPerPage));
    const indexOfLastItem = currentPageNumber * parseInt(dataPerPage);
    const indexOfFirstItem = indexOfLastItem - parseInt(dataPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPageNumber(newPage);
        }
    };

    const Pagination = () => {
        if (totalPages <= 1 && totalCount <= parseInt(dataPerPage)) return null;

        return (
            <div className="h-10 w-full flex flex-col sm:flex-row justify-between items-center px-4 py-2 bg-white border-t border-gray-200 shrink-0">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalCount)} of {totalCount} entries
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handlePageChange(currentPageNumber - 1)}
                        disabled={currentPageNumber === 1}
                        className={`p-1.5 rounded-md transition-all ${currentPageNumber === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50 active:scale-90'}`}
                    >
                        <FaChevronLeft size={12} />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPageNumber <= 3) pageNum = i + 1;
                        else if (currentPageNumber >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPageNumber - 2 + i;

                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-6 h-6 flex items-center justify-center rounded-md text-[11px] font-black transition-all ${currentPageNumber === pageNum ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    {totalPages > 5 && currentPageNumber < totalPages - 2 && <span className="text-gray-400 px-1 text-[10px]">...</span>}

                    <button
                        onClick={() => handlePageChange(currentPageNumber + 1)}
                        disabled={currentPageNumber === totalPages}
                        className={`p-1.5 rounded-md transition-all ${currentPageNumber === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50 active:scale-90'}`}
                    >
                        <FaChevronRight size={12} />
                    </button>

                    <select
                        value={dataPerPage}
                        onChange={(e) => setDataPerPage(e.target.value)}
                        className="ml-2 py-0.5 px-1 border border-slate-200 rounded text-[10px] font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                        {showEntries.map(entry => (
                            <option key={entry.value} value={entry.value}>{entry.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col overflow-hidden bg-white">
            <div className="flex-1 overflow-auto bg-slate-50/30">
                <table className="text-left w-full border-separate border-spacing-0">
                    <thead className="bg-white sticky top-0 z-20 shadow-sm border-b border-slate-200">
                        <tr className="bg-slate-50/50">
                            <th className="px-2 py-2 font-black text-[10px] text-slate-500 uppercase tracking-widest text-center w-12 border-b border-r border-slate-200">S No</th>
                            <th className="px-3 py-2 font-black text-[10px] text-slate-500 uppercase tracking-widest text-center w-48 border-b border-r border-slate-200">Pos No</th>
                            <th className="px-3 py-2 font-black text-[10px] text-slate-500 uppercase tracking-widest text-center w-48 border-b border-r border-slate-200">Pos Date</th>
                            <th className="px-3 py-2 font-black text-[10px] text-slate-500 uppercase tracking-widest text-center border-b border-r border-slate-200">Customer</th>
                            <th className="px-3 py-2 font-black text-[10px] text-slate-500 uppercase tracking-widest text-center w-32 border-b border-r border-slate-200">Method</th>
                            <th className="px-3 py-2 font-black text-[10px] text-slate-500 uppercase tracking-widest text-center w-20 border-b border-slate-200">Action</th>
                        </tr>
                        <tr className="bg-white">
                            <td className="px-1 border-b border-r border-slate-100"></td>
                            <td className="px-2 py-1.5 border-b border-r border-slate-100">
                                <input
                                    type="text"
                                    className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300"
                                    placeholder="Search Bill No..."
                                    value={serachDocNo}
                                    onChange={(e) => setSerachDocNo(e.target.value)}
                                />
                            </td>
                            <td className="px-2 py-1.5 border-b border-r border-slate-100">
                                <input
                                    type="date"
                                    className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    value={searchDate}
                                    onChange={(e) => setSearchDate(e.target.value)}
                                />
                            </td>
                            <td className="px-2 py-1.5 border-b border-r border-slate-100">
                                <input
                                    type="text"
                                    className="w-full h-7 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300"
                                    placeholder="Search Customer..."
                                    value={searchCustomerName}
                                    onChange={(e) => setSearchCustomerName(e.target.value)}
                                />
                            </td>
                            <td className="border-b border-r border-slate-100"></td>
                            <td className="border-b border-slate-100"></td>
                        </tr>
                    </thead>
                    <tbody className="relative">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="py-20">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-indigo-50 border-t-indigo-500 rounded-full animate-spin"></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Reports...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : recentSales.map((sale, index) => {
                            return (
                                <tr
                                    key={sale.id || index}
                                    className={`group hover:bg-indigo-50/50 cursor-pointer transition-all border-b border-slate-100 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
                                    onClick={() => onEdit && onEdit(sale)}
                                >
                                    <td className="py-2.5 text-center border-r border-slate-100 font-bold text-slate-400">{indexOfFirstItem + index + 1}</td>
                                    <td className="py-2.5 px-3 border-r border-slate-100">
                                        <div className="font-black text-indigo-600 group-hover:underline underline-offset-4 decoration-2">{sale?.docId || 'N/A'}</div>
                                        <div className="text-[10px] font-bold text-slate-300 mt-0.5">Ref: #{sale.id}</div>
                                    </td>
                                    <td className="py-2.5 px-3 border-r border-slate-100 font-bold text-slate-600">
                                        {sale?.createdAt ? new Date(sale.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                                    </td>
                                    <td className="py-2.5 px-3 border-r border-slate-100">
                                        <div className="font-black text-slate-700 uppercase">{sale?.Party?.name || 'Walk-in'}</div>
                                        {sale?.Party?.contact && <div className="text-[10px] font-bold text-slate-400 mt-0.5">+91 {sale.Party.contact}</div>}
                                    </td>
                                    <td className="py-2.5 text-center border-r border-slate-100">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border shadow-sm uppercase tracking-tighter ${sale.paymentMethod === 'Cash' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                                                {sale.paymentMethod || 'PAID'}
                                            </span>
                                            {sale.paymentMethod === 'Split' && sale.PosPayments && (
                                                <div className="flex flex-wrap justify-center gap-0.5 max-w-[80px]">
                                                    {sale.PosPayments.map((p, i) => (
                                                        <span key={i} className="text-[7px] font-black text-slate-400 uppercase bg-slate-100 px-1 rounded leading-tight">
                                                            {p.paymentMode || p.mode}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-2.5 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit && onEdit(sale);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all active:scale-90"
                                                title="Edit/View Bill"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {!isLoading && recentSales.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="bg-slate-50 p-4 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                        </div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No matching bills found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination />
        </div>
    );
};

export default PosReports;
