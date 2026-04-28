import React, { useState } from 'react';
import moment from 'moment';
import { useLazyGetSalesmanSummaryReportQuery } from '../../../redux/uniformService/SalesReportServices';
import { useGetEmployeeQuery } from '../../../redux/services/EmployeeMasterService';
import { DateInput, DropdownInput, DropdownInputSearch } from '../../../Inputs';
import { getCommonParams } from '../../../Utils/helper';
import { EMPTY_ICON, REFRESH_ICON } from '../../../icons';

const SalesmanSummaryReport = () => {
    const [fromDate, setFromDate] = useState(moment().startOf('month').format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));
    const [salesPersonId, setSalesPersonId] = useState("");
    const [performanceFilter, setPerformanceFilter] = useState("");

    const { branchId } = getCommonParams();

    const { data: employeeData } = useGetEmployeeQuery({ params: { branchId } });
    const employees = employeeData?.data || [];
    const employeeOptions = employees.map(emp => ({ value: emp.id, show: emp.name }));

    const performanceOptions = [
        { value: "HIGHEST", show: "Highest Sales First" },
        { value: "LOWEST", show: "Lowest Sales First" }
    ];

    const [fetchReport, { data: reportData, isFetching }] = useLazyGetSalesmanSummaryReportQuery();

    const salesmanList = reportData?.data || [];

    const handleViewReport = () => {
        fetchReport({ fromDate, toDate, branchId, salesPersonId, performanceFilter });
    };

    const calculateTotal = (key) => {
        return salesmanList.reduce((acc, curr) => acc + (parseFloat(curr[key]) || 0), 0);
    };

    return (
        <div className='w-full h-full p-2 animate-fadeIn'>
            <div className='flex items-center justify-between bg-white py-1 mb-2 font-bold border-b'>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h1 className='text-lg text-gray-800'>Salesman Summary Report</h1>
                </div>
                <button
                    onClick={handleViewReport}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-blue-600"
                    title="Refresh Data"
                >
                    {REFRESH_ICON}
                </button>
            </div>

            <div className='bg-white shadow-sm border rounded-lg mb-4 sticky top-0 z-20'>
                <div className='grid grid-cols-1 md:grid-cols-5 gap-4 p-4'>
                    <DateInput name="From Date" value={fromDate} setValue={setFromDate} />
                    <DateInput name="To Date" value={toDate} setValue={setToDate} />
                    <DropdownInputSearch
                        name="Salesman"
                        options={employeeOptions}
                        value={salesPersonId}
                        setValue={setSalesPersonId}
                        placeholder="All Salesmen"
                    />
                    <DropdownInput
                        name="Performance"
                        options={performanceOptions}
                        value={performanceFilter}
                        setValue={setPerformanceFilter}
                        clear
                    />
                    <div className='flex items-end'>
                        <button
                            className={`w-full h-[38px] rounded font-semibold transition-all shadow-md
                                ${isFetching
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white'}`}
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
                    {salesmanList.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-80 text-gray-400">
                            <div className="text-6xl mb-4 opacity-10">{EMPTY_ICON}</div>
                            <p className="text-lg font-medium">No sales data found</p>
                            <p className="text-sm opacity-60">Adjust your date filters and try again</p>
                        </div>
                    ) : (
                        <table className="min-w-full border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Salesman Name</th>
                                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Code</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Total Bills</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Sold Qty</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Return Qty</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Net Qty</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Gross Value</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Return Value</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b">Net Sales Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {salesmanList?.map((salesman, index) => (
                                    <tr key={salesman.id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">

                                                <span className="text-[11px] font-semibold text-gray-700">{salesman.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[11px] text-center text-gray-500 font-mono">{salesman.code}</td>
                                        <td className="px-4 py-3 text-[11px] text-right text-gray-700 font-medium">{salesman.totalBills}</td>
                                        <td className="px-4 py-3 text-[11px] text-right text-gray-600">{salesman.totalQty.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-[11px] text-right text-red-500">{salesman.returnQty > 0 ? `(${salesman.returnQty.toLocaleString()})` : "-"}</td>
                                        <td className="px-4 py-3 text-[11px] text-right font-bold text-blue-600">{salesman.netQty.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-[11px] text-right text-gray-600 font-medium">₹{salesman.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-3 text-[11px] text-right text-red-500">₹{salesman.returnAmount > 0 ? `(${salesman.returnAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})` : "0.00"}</td>
                                        <td className="px-4 py-3 text-[11px] text-right font-bold text-gray-800 bg-gray-50/50 group-hover:bg-blue-100/50 transition-colors">
                                            ₹{salesman.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-800 text-white font-bold sticky bottom-0">
                                <tr>
                                    <td colSpan={2} className="px-4 py-3 text-right text-xs uppercase">Grand Total</td>
                                    <td className="px-4 py-3 text-right text-[11px]">{calculateTotal('totalBills')}</td>
                                    <td className="px-4 py-3 text-right text-[11px]">{calculateTotal('totalQty').toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-[11px]">{calculateTotal('returnQty').toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-[11px]">{calculateTotal('netQty').toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right text-[11px]">₹{calculateTotal('totalAmount').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-3 text-right text-[11px]">₹{calculateTotal('returnAmount').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-3 text-right text-[11px] bg-blue-600">₹{calculateTotal('netAmount').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesmanSummaryReport;
