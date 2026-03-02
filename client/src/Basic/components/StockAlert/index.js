import { useGetMinStockAlertReportQuery } from "../../../redux/services/StockService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { findFromList, getCommonParams } from "../../../Utils/helper";


const NotificationPopup = ({
    onClose,
    allData
}) => {

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




    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-9xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {'Low stock'}
                        </h2>

                    </div>

                    <div className="flex items-center gap-2">

                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>


                </div>
                <table className="min-w-full divide-y divide-gray-200 text-[11px]">
                    <thead className="bg-gray-50 text-black">
                        <tr>
                            <th className="px-3 py-2 text-left text-[11px] uppercase font-medium tracking-wider w-5">S.No</th>
                            <th className="px-3 py-2 text-left text-[11px] uppercase font-medium tracking-wider w-80">Item</th>
                            <th className="px-3 py-2 text-left text-[11px] uppercase font-medium tracking-wider w-44">Size</th>
                            <th className="px-3 py-2 text-left text-[11px] uppercase font-medium tracking-wider w-20">Location</th>
                            <th className="px-3 py-2 text-left text-[11px] uppercase font-medium tracking-wider w-20">Minimun Stock Qty</th>
                            <th className="px-3 py-2 text-left text-[11px] uppercase font-medium tracking-wider w-20">currect Stock Qty</th>

                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {allData?.data?.map((task, index) => {




                            return (
                                <tr
                                    key={`single-${task.category}-${index}`}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors odd:bg-gray-100 even:bg-white hover:bg-gray-100
"
                                >
                                    <td className="px-3 whitespace-nowrap text-gray-700 text-[11px] font-medium py-2">
                                        {index + 1}
                                    </td>

                                    <td className="px-3">
                                        <div className="text-[11px] uppercase text-gray-900" >
                                            {findFromList(task.itemId, itemList?.data, "name")}
                                        </div>
                                    </td>
                                    <td className="px-3">
                                        <div className="text-[11px] uppercase text-gray-900 truncate max-w-xs" >
                                            {task?.minQtyForallSizes ? "All" : findFromList(task.sizeId, sizeList?.data, "name")}
                                        </div>
                                    </td>


                                    <td className="px-3">
                                        <div className="text-[11px] uppercase font-medium text-gray-800 max-w-xs truncate">
                                            {findFromList(task.locationId, locationData?.data, "storeName")}
                                        </div>
                                    </td>
                                    <td className="px-3 whitespace-nowrap">
                                        <div className="text-[11px] uppercase text-gray-900">
                                            {task?.minQtyForallSizes ? task?.minQtyForallSizes : task?.minQtyForThatItem}
                                        </div>
                                    </td>
                                    <td className="px-3 whitespace-nowrap">
                                        <div className="text-[11px] uppercase text-gray-900">
                                            {task?.availableQty ? task?.availableQty : 0}

                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

            </div>
        </div>
    );
};

export default NotificationPopup;