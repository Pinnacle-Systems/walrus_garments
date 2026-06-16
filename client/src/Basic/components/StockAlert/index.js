import { useGetMinStockAlertReportQuery } from "../../../redux/services/StockService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { findFromList, getCommonParams, getDateFromDateTimeToDisplay } from "../../../Utils/helper";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";


const NotificationPopup = ({
    onClose,
    allData,
    posData
}) => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('discount');
    const { branchId, userId, companyId, finYearId, userRole } = getCommonParams();

    const isAdmin = userRole?.toUpperCase() === "ADMIN" || userRole?.toUpperCase() === "SUPER_ADMIN" || userRole?.toUpperCase() === "SUPER ADMIN";

    const params = {
        branchId, userId, finYearId
    };
    const { data: itemList } = useGetItemMasterQuery({ params });
    const { data: sizeList } = useGetSizeMasterQuery({ params });
    const { data: colorList } =
        useGetColorMasterQuery({ params: { ...params } });

    const { data: locationData } =
        useGetLocationMasterQuery({ params });

    const handleOpenPos = (posId) => {
        dispatch(push({ name: "POINT OF SALES", projectId: posId }));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <div className="flex gap-4">
                        {/* <button
                            onClick={() => setActiveTab('stock')}
                            className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'stock' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Low Stock ({allData?.data?.length || 0})
                        </button> */}
                        <button
                            onClick={() => setActiveTab('discount')}
                            className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'discount' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {isAdmin ? "Discount Requests" : "Pending Bills"} ({posData?.data?.length || 0})
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {activeTab === 'stock' ? (
                        <table className="min-w-full divide-y divide-gray-200 text-[11px]">
                            <thead className="bg-gray-50 text-black sticky top-0">
                                <tr>
                                    <th className="px-3 py-2 text-left uppercase font-medium tracking-wider w-5">S.No</th>
                                    <th className="px-3 py-2 text-left uppercase font-medium tracking-wider">Item</th>
                                    <th className="px-3 py-2 text-left uppercase font-medium tracking-wider">Size</th>
                                    <th className="px-3 py-2 text-left uppercase font-medium tracking-wider">Location</th>
                                    <th className="px-3 py-2 text-left uppercase font-medium tracking-wider">Min Qty</th>
                                    <th className="px-3 py-2 text-left uppercase font-medium tracking-wider">Current Qty</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {allData?.data?.map((task, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors odd:bg-gray-50">
                                        <td className="px-3 py-2">{index + 1}</td>
                                        <td className="px-3 py-2 uppercase">{findFromList(task.itemId, itemList?.data, "name")}</td>
                                        <td className="px-3 py-2 uppercase">{task?.minQtyForallSizes ? "All" : findFromList(task.sizeId, sizeList?.data, "name")}</td>
                                        <td className="px-3 py-2 uppercase">{findFromList(task.locationId, locationData?.data, "storeName")}</td>
                                        <td className="px-3 py-2">{task?.minQtyForallSizes ? task?.minQtyForallSizes : task?.minQtyForThatItem}</td>
                                        <td className="px-3 py-2 font-bold text-red-600">{task?.availableQty ? task?.availableQty : 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {/* Desktop View: Table Layout */}
                            <div className="hidden md:block">
                                <table className="min-w-full divide-y divide-gray-200 text-[11px]">
                                    <thead className="bg-gray-50 text-black sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 text-left uppercase font-medium tracking-wider w-5">S.No</th>
                                            <th className="px-3 py-2 text-left uppercase font-medium tracking-wider">Date</th>
                                            <th className="px-3 py-2 text-left uppercase font-medium tracking-wider">Customer</th>
                                            <th className="px-3 py-2 text-left uppercase font-medium tracking-wider">Net Amount</th>
                                            <th className="px-3 py-2 text-left uppercase font-medium tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {posData?.data?.map((req, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors odd:bg-gray-50">
                                                <td className="px-3 py-2">{index + 1}</td>
                                                <td className="px-3 py-2">{getDateFromDateTimeToDisplay(req.createdAt)}</td>
                                                <td className="px-3 py-2 uppercase font-medium">{req.Party?.name || "Walk-in"}</td>
                                                <td className="px-3 py-2 font-bold">₹{parseFloat(req.netAmount).toLocaleString()}</td>
                                                <td className="px-3 py-2">
                                                    <button
                                                        onClick={() => handleOpenPos(req.id)}
                                                        className="bg-indigo-600 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-indigo-700"
                                                    >
                                                        {isAdmin ? "OPEN POS" : "CHECKOUT"}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile View: Premium Card Layout */}
                            <div className="block md:hidden space-y-3">
                                {posData?.data?.map((req, index) => (
                                    <div 
                                        key={index} 
                                        className="bg-white rounded-xl border border-gray-150 p-4 shadow-sm hover:shadow transition-all duration-200 flex flex-col gap-3"
                                    >
                                        {/* Top Row: Serial Badge and Date */}
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                                Request #{index + 1}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {getDateFromDateTimeToDisplay(req.createdAt)}
                                            </span>
                                        </div>

                                        {/* Middle Row: Customer Info */}
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Customer</span>
                                            <span className="text-xs uppercase font-semibold text-gray-800">
                                                {req.Party?.name || "Walk-in"}
                                            </span>
                                        </div>

                                        {/* Bottom Row: Amount and Action */}
                                        <div className="flex justify-between items-center pt-2.5 border-t border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Net Amount</span>
                                                <span className="text-xs font-extrabold text-indigo-950">
                                                    ₹{parseFloat(req.netAmount).toLocaleString()}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handleOpenPos(req.id)}
                                                className="bg-indigo-600 active:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm shadow-indigo-100 hover:shadow-md active:scale-95"
                                            >
                                                {isAdmin ? "OPEN POS" : "CHECKOUT"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Empty State Handler */}
                            {(!posData?.data || posData.data.length === 0) && (
                                <div className="py-10 text-center text-gray-400 italic text-xs">
                                    {isAdmin ? "No pending discount requests" : "No approved bills ready for payment"}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPopup;

