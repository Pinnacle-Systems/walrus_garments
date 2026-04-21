import React, { useState } from 'react';
import moment from 'moment';
import { useLazyGetSalesReportQuery } from '../../../redux/uniformService/SalesReportServices';
import { DateInput, DropdownInput } from '../../../Inputs';
import { getCommonParams } from '../../../Utils/helper';
import { EMPTY_ICON } from '../../../icons';

const SalesReport = () => {
    const [fromDate, setFromDate] = useState(moment().startOf('month').format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));
    const [saleType, setSaleType] = useState("ALL");

    const { branchId } = getCommonParams();

    const [fetchReport, { data: reportData, isFetching }] = useLazyGetSalesReportQuery();

    const salesList = reportData?.data || [];

    const handleViewReport = () => {
        fetchReport({ fromDate, toDate, branchId, saleType });
    };

    const saleTypeOptions = [
        { show: "All", value: "ALL" },
        { show: "POS Sales", value: "POS" },
        { show: "Bulk Sales", value: "BULK" }
    ];

    const calculateTotal = (key) => {
        return salesList.reduce((acc, curr) => acc + (parseFloat(curr[key]) || 0), 0);
    };

    return (
        <div className='w-full h-full p-2'>
            <div className='flex items-center justify-between bg-white py-1 mb-2 font-bold'>
                <h1 className='text-lg'>Sales Report</h1>
            </div>

            <div className='bg-gray-200 rounded-md mb-3 sticky top-0 z-20'>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 p-4'>
                    <DateInput name="From Date" value={fromDate} setValue={setFromDate} />
                    <DateInput name="To Date" value={toDate} setValue={setToDate} />
                    <DropdownInput
                        name="Sale Type"
                        options={saleTypeOptions}
                        value={saleType}
                        setValue={setSaleType}
                    />
                    <div className='flex items-end'>
                        <button
                            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition w-full h-[38px]'
                            onClick={handleViewReport}
                            disabled={isFetching}
                        >
                            {isFetching ? "Loading..." : "View Report"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-auto border border-gray-300 rounded-md max-h-[calc(100vh-250px)] shadow-inner">
                {salesList.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-64 text-gray-500 bg-white">
                        <div className="text-4xl mb-2 opacity-20">{EMPTY_ICON}</div>
                        <p className="text-sm font-medium">No sales records found for the selected range.</p>
                        <p className="text-xs text-gray-400 mt-1">Select a date range and click "View Report"</p>
                    </div>
                ) : (
                    <table className="min-w-full border-collapse bg-white">
                        <thead className="bg-gray-100 sticky top-0 z-10 border-b border-gray-300 shadow-sm">
                            <tr>
                                <th className="border border-gray-300 px-3 py-2 text-[11px] font-bold text-left uppercase tracking-wider text-gray-600">Date</th>
                                <th className="border border-gray-300 px-3 py-2 text-[11px] font-bold text-left uppercase tracking-wider text-gray-600">Doc ID</th>
                                <th className="border border-gray-300 px-3 py-2 text-[11px] font-bold text-left uppercase tracking-wider text-gray-600">Customer</th>
                                <th className="border border-gray-300 px-3 py-2 text-[11px] font-bold text-center uppercase tracking-wider text-gray-600">Type</th>
                                <th className="border border-gray-300 px-3 py-2 text-[11px] font-bold text-right uppercase tracking-wider text-gray-600">Cash</th>
                                <th className="border border-gray-300 px-3 py-2 text-[11px] font-bold text-right uppercase tracking-wider text-gray-600">UPI</th>
                                <th className="border border-gray-300 px-3 py-2 text-[11px] font-bold text-right uppercase tracking-wider text-gray-600">Card</th>
                                <th className="border border-gray-300 px-3 py-2 text-[11px] font-bold text-right uppercase tracking-wider text-gray-600">Online</th>
                                <th className="border border-gray-300 px-3 py-2 text-[11px] font-bold text-right uppercase tracking-wider text-gray-600">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesList.map((sale, index) => (
                                <tr key={sale.id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                                    <td className="px-3 py-2 text-[11px] whitespace-nowrap text-gray-600">{moment(sale.date).format("DD-MM-YYYY")}</td>
                                    <td className="px-3 py-2 text-[11px] font-semibold text-blue-700 whitespace-nowrap">{sale.docId}</td>
                                    <td className="px-3 py-2 text-[11px] text-gray-700 truncate max-w-xs" title={sale.customerName}>{sale.customerName}</td>
                                    <td className="px-3 py-2 text-[11px] text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${sale.type === 'POS' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                            {sale.type}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-[11px] text-right text-gray-500">{sale.cash > 0 ? sale.cash.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "-"}</td>
                                    <td className="px-3 py-2 text-[11px] text-right text-gray-500">{sale.upi > 0 ? sale.upi.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "-"}</td>
                                    <td className="px-3 py-2 text-[11px] text-right text-gray-500">{sale.card > 0 ? sale.card.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "-"}</td>
                                    <td className="px-3 py-2 text-[11px] text-right text-gray-500">{sale.online > 0 ? sale.online.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "-"}</td>
                                    <td className="px-3 py-2 text-[11px] text-right font-bold text-gray-800">{sale.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 sticky bottom-0 z-10 font-bold border-t-2 border-gray-300 divide-x divide-gray-200 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
                            <tr>
                                <td colSpan={4} className="px-3 py-2 text-right text-xs font-bold text-gray-700 bg-gray-100">TOTAL</td>
                                <td className="px-3 py-2 text-right text-[11px] text-gray-700">{calculateTotal('cash').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className="px-3 py-2 text-right text-[11px] text-gray-700">{calculateTotal('upi').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className="px-3 py-2 text-[11px] text-right text-gray-700">{calculateTotal('card').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className="px-3 py-2 text-[11px] text-right text-gray-700">{calculateTotal('online').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className="px-3 py-2 text-right text-xs text-blue-800 bg-blue-50 border-l border-blue-200">{calculateTotal('totalAmount').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        </tfoot>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SalesReport;