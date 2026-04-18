import React, { useState } from 'react';

const PosReports = ({ recentSales }) => {
    const [searchDocId, setSearchDocId] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [searchCustomer, setSearchCustomer] = useState("");

    const filteredSales = recentSales.filter(sale => {
        const matchesDoc = searchDocId ? sale.docId?.toLowerCase().includes(searchDocId.toLowerCase()) : true;
        const saleDateStr = sale.date ? new Date(sale.date).toLocaleDateString() : '';
        const matchesDate = searchDate ? saleDateStr.includes(searchDate) : true;
        const customerName = sale.Party?.name || 'Walk-in';
        const matchesCustomer = searchCustomer ? customerName.toLowerCase().includes(searchCustomer.toLowerCase()) : true;
        return matchesDoc && matchesDate && matchesCustomer;
    });

    return (
        <div className="w-full h-full flex flex-col overflow-hidden bg-white">
            <div className="flex-1 overflow-auto">
                <table className=" text-left w-full border-collapse">
                    <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-1 py-1.5 font-medium text-[13px] text-gray-900 text-center w-12 border border-gray-300">S No</th>
                            <th className="px-3 font-medium text-[13px] text-gray-900 text-center w-40 border border-gray-300">Pos No</th>
                            <th className="px-3 font-medium text-[13px] text-gray-900 text-center w-40 border border-gray-300">Pos Date</th>
                            <th className="px-3 font-medium text-[13px] text-gray-900 text-center border border-gray-300">Customer</th>
                            <th className="px-3 font-medium text-[13px] text-gray-900 text-center w-32 border border-gray-300">Method</th>
                            <th className="px-3 font-medium text-[13px] text-gray-900 text-center w-20 border border-gray-300">Action</th>
                        </tr>
                        <tr>
                            <th className="px-1 font-medium text-[13px] text-center w-12 border border-gray-300 bg-gray-50"></th>
                            <th className="px-1 font-medium text-[13px] text-center w-40 border border-gray-300 bg-gray-50">
                                <input
                                    type="text"
                                    className="text-black h-5 w-full px-1 focus:outline-none border border-gray-400 rounded-md text-[11px]"
                                    placeholder="Search No"
                                    value={searchDocId}
                                    onChange={(e) => setSearchDocId(e.target.value)}
                                />
                            </th>
                            <th className="px-1 font-medium text-[13px] text-center w-40 border border-gray-300 bg-gray-50">
                                <input
                                    type="text"
                                    className="text-black h-5 w-full px-1 focus:outline-none border border-gray-400 rounded-md text-[11px]"
                                    placeholder="Search Date"
                                    value={searchDate}
                                    onChange={(e) => setSearchDate(e.target.value)}
                                />
                            </th>
                            <th className="px-1 font-medium text-[13px] text-center border border-gray-300 bg-gray-50">
                                <input
                                    type="text"
                                    className="text-black h-5 w-full px-1 focus:outline-none border border-gray-400 rounded-md text-[11px]"
                                    placeholder="Search Customer"
                                    value={searchCustomer}
                                    onChange={(e) => setSearchCustomer(e.target.value)}
                                />
                            </th>
                            <th className="px-1 font-medium text-[13px] text-center border border-gray-300 bg-gray-50"></th>
                            <th className="px-1 font-medium text-[13px] text-center border border-gray-300 bg-gray-50"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.map((sale, index) => {
                            return (
                                <tr key={sale.id || index} className={`hover:bg-blue-50 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                                    <td className="py-1.5 text-center border-x border-gray-200">{index + 1}</td>
                                    <td className="py-1.5 px-2 text-left border-r border-gray-200 font-medium text-blue-700">{sale?.docId || 'N/A'}</td>
                                    <td className="py-1.5 px-2 text-left border-r border-gray-200">{sale?.createdAt ? new Date(sale.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}</td>
                                    <td className="py-1.5 px-2 text-left uppercase border-r border-gray-200">{sale?.Party?.name || 'Walk-in'}</td>
                                    <td className="py-1.5 text-center border-r border-gray-200">
                                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-200">
                                            {sale.paymentMethod || 'PAID'}
                                        </span>
                                    </td>
                                    <td className="py-1.5 text-center border-r border-gray-200">
                                        <button
                                            onClick={() => onEdit && onEdit(sale)}
                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                            title="Edit Sale"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredSales.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-gray-500 font-medium">No records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PosReports;
