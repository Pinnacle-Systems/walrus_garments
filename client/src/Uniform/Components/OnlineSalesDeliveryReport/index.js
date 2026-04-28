import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useLazyGetOnlineSalesDeliveryReportQuery } from '../../../redux/uniformService/SalesReportServices';
import { DateInput, DropdownInput } from '../../../Inputs';
import { getCommonParams } from '../../../Utils/helper';
import { EMPTY_ICON, REFRESH_ICON, ARROW_UP_ICON, ARROW_DOWN_ICON } from '../../../icons';

const OnlineSalesDeliveryReport = () => {
    const [fromDate, setFromDate] = useState(moment().startOf('month').format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));
    const [challanType, setChallanType] = useState("");
    const [orderBy, setOrderBy] = useState("outwardQty");
    const [sortOrder, setSortOrder] = useState("desc");

    const { branchId } = getCommonParams();

    const [fetchReport, { data: reportData, isFetching }] = useLazyGetOnlineSalesDeliveryReportQuery();

    const reportList = reportData?.data || [];

    const handleViewReport = () => {
        fetchReport({ fromDate, toDate, branchId, challanType, orderBy, sortOrder });
    };

    // Auto-fetch on parameter change (optional, but good for user experience)
    useEffect(() => {
        if (branchId) {
            handleViewReport();
        }
    }, [challanType, orderBy, sortOrder]);

    const calculateTotal = (key) => {
        return reportList.reduce((acc, curr) => acc + (parseFloat(curr[key]) || 0), 0);
    };

    const challanTypeOptions = [
        { show: "All Types", value: "" },
        { show: "Outward Only", value: "DcOutward" },
        { show: "Inward Only", value: "DcInward" }
    ];

    const sortOptions = [
        { show: "Item Name", value: "itemName" },
        { show: "Outward Qty", value: "outwardQty" },
        { show: "Inward Qty", value: "inwardQty" },
        { show: "Net Qty", value: "netQty" }
    ];

    const orderOptions = [
        { show: "Highest First", value: "desc" },
        { show: "Lowest First", value: "asc" }
    ];

    return (
        <div className='w-full h-full p-2 animate-fadeIn'>
            <div className='flex items-center justify-between bg-white py-1 mb-2 font-bold border-b'>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                    <h1 className='text-lg text-gray-800'>Online Sales Delivery Report</h1>
                </div>
                <div className="flex items-center gap-4">
                    {isFetching && (
                        <div className="flex items-center gap-2 text-purple-600 text-xs">
                            <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Updating...</span>
                        </div>
                    )}
                    <button
                        onClick={handleViewReport}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-purple-600"
                        title="Refresh Data"
                    >
                        {REFRESH_ICON}
                    </button>
                </div>
            </div>

            <div className='bg-white shadow-sm border rounded-lg mb-4 sticky top-0 z-20'>
                <div className='grid grid-cols-1 md:grid-cols-5 gap-4 p-4'>
                    <DateInput name="From Date" value={fromDate} setValue={setFromDate} />
                    <DateInput name="To Date" value={toDate} setValue={setToDate} />

                    <DropdownInput
                        name="DC Type"
                        options={challanTypeOptions}
                        value={challanType}
                        setValue={setChallanType}
                    />

                    <DropdownInput
                        name="Sort By"
                        options={sortOptions}
                        value={orderBy}
                        setValue={setOrderBy}
                    />

                    <DropdownInput
                        name="Order"
                        options={orderOptions}
                        value={sortOrder}
                        setValue={setSortOrder}
                    />

                    <div className='md:col-span-5 flex justify-end mt-2'>
                        <button
                            className={`px-8 h-[38px] rounded font-semibold transition-all shadow-md
                                ${isFetching
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700 active:scale-95 text-white'}`}
                            onClick={handleViewReport}
                            disabled={isFetching}
                        >
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-auto max-h-[calc(100vh-280px)]">
                    {reportList.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-80 text-gray-400">
                            <div className="text-6xl mb-4 opacity-10">{EMPTY_ICON}</div>
                            <p className="text-lg font-medium">No delivery data found</p>
                            <p className="text-sm opacity-60">Try changing your filters or check if platform is assigned to challans</p>
                        </div>
                    ) : (
                        <table className="min-w-full border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">
                                        Item Details {orderBy === 'itemName' && (sortOrder === 'desc' ? ARROW_DOWN_ICON : ARROW_UP_ICON)}
                                    </th>
                                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Size</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Color</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Platform</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-green-600 uppercase tracking-wider border-b">
                                        Inward Qty {orderBy === 'inwardQty' && (sortOrder === 'desc' ? ARROW_DOWN_ICON : ARROW_UP_ICON)}
                                    </th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-red-600 uppercase tracking-wider border-b">
                                        Outward Qty {orderBy === 'outwardQty' && (sortOrder === 'desc' ? ARROW_DOWN_ICON : ARROW_UP_ICON)}
                                    </th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-purple-600 uppercase tracking-wider border-b">
                                        Net Qty {orderBy === 'netQty' && (sortOrder === 'desc' ? ARROW_DOWN_ICON : ARROW_UP_ICON)}
                                    </th>
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
                                        <td className={`px-4 py-3 text-[11px] text-right font-medium ${item.inwardQty > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                            {item.inwardQty.toLocaleString()}
                                        </td>
                                        <td className={`px-4 py-3 text-[11px] text-right font-medium ${item.outwardQty > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {item.outwardQty.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-[11px] text-right font-bold text-purple-600 bg-purple-50/30 group-hover:bg-purple-100/50">
                                            {item.netQty.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-800 text-white font-bold sticky bottom-0">
                                <tr>
                                    <td colSpan={4} className="px-4 py-3 text-right text-xs uppercase tracking-widest">Grand Total</td>
                                    <td className="px-4 py-3 text-right text-[11px] text-green-400 border-l border-gray-700">{calculateTotal('inwardQty').toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-[11px] text-red-400 border-l border-gray-700">{calculateTotal('outwardQty').toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-[11px] text-purple-300 bg-purple-900/50 border-l border-gray-700">{calculateTotal('netQty').toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
            </div>

            {/* Legend / Quick Tips */}
            <div className="mt-4 flex gap-6 text-[10px] text-gray-500 bg-white p-3 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Inward: Items returned to stock</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Outward: Items shipped out</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Net Qty: Current stock movement balance</span>
                </div>
            </div>
        </div>
    );
};

export default OnlineSalesDeliveryReport;
