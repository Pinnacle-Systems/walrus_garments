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
    const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'discount'
    const { branchId, userId, companyId, finYearId } = getCommonParams();

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
                        <button
                            onClick={() => setActiveTab('stock')}
                            className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'stock' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Low Stock ({allData?.data?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('discount')}
                            className={`text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'discount' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Discount Requests ({posData?.data?.length || 0})
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
                                                OPEN POS
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!posData?.data || posData.data.length === 0) && (
                                    <tr>
                                        <td colSpan="5" className="px-3 py-8 text-center text-gray-500 italic">No pending discount requests</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPopup;

