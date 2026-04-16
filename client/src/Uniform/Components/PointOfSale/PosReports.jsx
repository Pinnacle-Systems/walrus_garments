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
                <table className=" text-left">
                    <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-1 py-1.5 font-medium text-[13px] text-gray-900 text-center w-12">S No</th>
                            <th className="px-3 font-medium text-[13px] text-gray-900 text-center w-40">Pos No</th>
                            <th className="px-3 font-medium text-[13px] text-gray-900 text-center w-40">Pos Date</th>
                            <th className="w-64 px-3 font-medium text-[13px] text-gray-900 text-center">Customer</th>

                            <th className="w-32 px-3 font-medium text-[13px] text-gray-900 text-center">Payment Method</th>
                        </tr>
                        <tr>
                            <th className="px-1 font-medium text-[13px] text-center w-12 border-b border-gray-300">
                                <div className="h-3"></div>
                            </th>
                            <th className="px-1 font-medium text-[13px] text-center w-40 border-b border-gray-300">
                                <input
                                    type="text"
                                    className="text-black h-5 w-full px-1 focus:outline-none border border-gray-400 rounded-md"
                                    placeholder="Search"
                                    value={searchDocId}
                                    onChange={(e) => setSearchDocId(e.target.value)}
                                />
                            </th>
                            <th className="px-1 font-medium text-[13px] text-center w-40 border-b border-gray-300">
                                <input
                                    type="text"
                                    className="text-black h-5 w-full px-1 focus:outline-none border border-gray-400 rounded-md"
                                    placeholder="Search"
                                    value={searchDate}
                                    onChange={(e) => setSearchDate(e.target.value)}
                                />
                            </th>
                            <th className="px-1 font-medium text-[13px] text-center border-b border-gray-300">
                                <input
                                    type="text"
                                    className="text-black h-5 w-full px-1 focus:outline-none border border-gray-400 rounded-md"
                                    placeholder="Search"
                                    value={searchCustomer}
                                    onChange={(e) => setSearchCustomer(e.target.value)}
                                />
                            </th>

                            <th className="px-1 font-medium text-[13px] text-center border-b border-gray-300"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.map((sale, index) => {
                            const totalAmnt = (sale.PosItems || []).reduce((acc, item) => acc + (parseFloat(item.price || 0) * parseFloat(item.qty || 0)), 0);
                            return (
                                <tr key={sale.id || index} className={`hover:bg-gray-50 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"}`}>
                                    <td className="py-1.5 text-center">{index + 1}</td>
                                    <td className="py-1.5 text-left ">{sale?.docId || 'N/A'}</td>
                                    <td className="py-1.5 text-left">{sale?.createdAt ? new Date(sale.createdAt).toLocaleString() : 'N/A'}</td>
                                    <td className="py-1.5 text-left uppercase">{sale?.Party?.name || 'Walk-in'}</td>

                                    <td className="py-1.5 text-center">
                                        <span className="bg-green-100 text-green-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-green-200">
                                            {sale.paymentMethod || 'Paid'}
                                        </span>
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
