import React, { useState } from 'react';
import moment from 'moment';
import { useLazyGetOnlineSalesDeliveryReportQuery } from '../../../redux/uniformService/SalesReportServices';
import { DateInput } from '../../../Inputs';
import { getCommonParams } from '../../../Utils/helper';
import { EMPTY_ICON, REFRESH_ICON } from '../../../icons';

const OnlineSalesDeliveryReport = () => {
    const [fromDate, setFromDate] = useState(moment().startOf('month').format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));

    const { branchId } = getCommonParams();

    const [fetchReport, { data: reportData, isFetching }] = useLazyGetOnlineSalesDeliveryReportQuery();

    const reportList = reportData?.data || [];

    const handleViewReport = () => {
        fetchReport({ fromDate, toDate, branchId });
    };

    const calculateTotal = (key) => {
        return reportList.reduce((acc, curr) => acc + (parseFloat(curr[key]) || 0), 0);
    };

    return (
        <div className='w-full h-full p-2 animate-fadeIn'>
            <div className='flex items-center justify-between bg-white py-1 mb-2 font-bold border-b'>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                    <h1 className='text-lg text-gray-800'>Online Sales Delivery Report</h1>
                </div>
                <button
                    onClick={handleViewReport}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-purple-600"
                    title="Refresh Data"
                >
                    {REFRESH_ICON}
                </button>
            </div>

            <div className='bg-white shadow-sm border rounded-lg mb-4 sticky top-0 z-20'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-4'>
                    <DateInput name="From Date" value={fromDate} setValue={setFromDate} />
                    <DateInput name="To Date" value={toDate} setValue={setToDate} />
                    <div className='flex items-end'>
                        <button
                            className={`w-full h-[38px] rounded font-semibold transition-all shadow-md
                                ${isFetching
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700 active:scale-95 text-white'}`}
                            onClick={handleViewReport}
                            disabled={isFetching}
                        >
                            {isFetching ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : "Generate Report"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-auto max-h-[calc(100vh-250px)]">
                    {reportList.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-80 text-gray-400">
                            <div className="text-6xl mb-4 opacity-10">{EMPTY_ICON}</div>
                            <p className="text-lg font-medium">No delivery data found</p>
                            <p className="text-sm opacity-60">Adjust your date filters and ensure platform is set for challans</p>
                        </div>
                    ) : (
                        <table className="min-w-full border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Item Details</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Size</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Color</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Platform</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-green-600 uppercase tracking-wider border-b">Inward Qty</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-red-600 uppercase tracking-wider border-b">Outward Qty</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-purple-600 uppercase tracking-wider border-b">Net Qty</th>
                                    {/* <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Net Value</th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reportList.map((item, index) => (
                                    <tr key={item.key} className="hover:bg-purple-50/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <span className="text-[11px] font-semibold text-gray-700">{item.itemName}</span>
                                        </td>
                                        <td className="px-4 py-3 text-[11px] text-center text-gray-500">{item.sizeName}</td>
                                        <td className="px-4 py-3 text-[11px] text-center text-gray-500">{item.colorName}</td>
                                        <td className="px-4 py-3 text-[11px] text-center">
                                            <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-bold text-[9px] uppercase">
                                                {item.platform}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[11px] text-right text-green-600 font-medium">{item.inwardQty.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-[11px] text-right text-red-500">{item.outwardQty.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-[11px] text-right font-bold text-purple-600 bg-purple-50/30 group-hover:bg-purple-100/50">
                                            {item.netQty.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-[11px] text-right text-gray-800 font-bold">
                                            ₹{item.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-800 text-white font-bold sticky bottom-0">
                                <tr>
                                    <td colSpan={4} className="px-4 py-3 text-right text-xs uppercase">Grand Total</td>
                                    <td className="px-4 py-3 text-right text-[11px] text-green-400">{calculateTotal('inwardQty').toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-[11px] text-red-400">{calculateTotal('outwardQty').toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-[11px] text-purple-300 bg-purple-900/50">{calculateTotal('netQty').toLocaleString()}</td>
                                    {/* <td className="px-4 py-3 text-right text-[11px] bg-purple-700">₹{calculateTotal('netAmount').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td> */}
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnlineSalesDeliveryReport;
