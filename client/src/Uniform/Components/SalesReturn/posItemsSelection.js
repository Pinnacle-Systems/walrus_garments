import React, { useState } from 'react';
import Swal from 'sweetalert2';

const PosItemsSelection = ({
    returnType,
    singlePosData,
    singleSalesDeliveryData,
    handleFillItems,
    setInwardItemSelection,
    itemList,
    colorList,
    sizeList,
    findFromList
}) => {
    // Current items from the selected bill
    const billItems = returnType === "Pos"
        ? (singlePosData?.data?.PosItems || [])
        : (singleSalesDeliveryData?.data?.SalesDeliveryItems || []);

    const [localSelectedItems, setLocalSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Filtered items based on search (simple search for now as per image style)
    const filteredItems = billItems.filter(item => {
        const itemName = item.itemName || item.name || findFromList(item.itemId, itemList?.data, "name") || "";
        return itemName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const toggleItem = (item) => {
        const itemKey = `${item.itemId}-${item.sizeId}-${item.colorId}`;
        setLocalSelectedItems(prev => {
            const isAdded = prev.some(i => `${i.itemId}-${i.sizeId}-${i.colorId}` === itemKey);
            if (isAdded) {
                return prev.filter(i => `${i.itemId}-${i.sizeId}-${i.colorId}` !== itemKey);
            } else {
                return [...prev, item];
            }
        });
    };

    const isItemAdded = (item) => {
        const itemKey = `${item.itemId}-${item.sizeId}-${item.colorId}`;
        return localSelectedItems.some(i => `${i.itemId}-${i.sizeId}-${i.colorId}` === itemKey);
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setLocalSelectedItems([...billItems]);
        } else {
            setLocalSelectedItems([]);
        }
    };

    const isAllSelected = billItems.length > 0 && localSelectedItems.length === billItems.length;

    const onDone = () => {
        if (localSelectedItems.length === 0) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Please select at least one item",
            });
            return;
        }
        handleFillItems(localSelectedItems);
    };

    return (
        <div className="flex flex-col h-full bg-[#f1f1f0] overflow-hidden">
            {/* White Header Bar (Matched to Image) */}
            <div className="bg-white border-b py-2 px-4 shadow-sm flex justify-between items-center sticky top-0 z-20 mx-3 mt-3 rounded-md">
                <h2 className="text-lg font-bold text-gray-800">
                    Inward Items
                </h2>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onDone}
                        className="px-4 py-1 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded text-xs font-semibold transition-colors"
                    >
                        Done
                    </button>
                    {/* <button
                        type="button"
                        onClick={() => setInwardItemSelection(false)}
                        className="px-4 py-1 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded text-xs font-semibold transition-colors"
                    >
                        Cancel
                    </button> */}
                </div>
            </div>

            {/* Table Area (Matched to Image) */}
            <div className="flex-1 overflow-auto p-3">
                <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
                    <table className="w-full border-collapse table-fixed">
                        <thead className="bg-[#e5e7eb] text-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="border border-gray-300 p-1 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="accent-indigo-600"
                                    />
                                </th>
                                <th className="border border-gray-300 p-1 w-12 text-xs font-bold text-center">S No</th>
                                <th className="border border-gray-300 p-1 w-24 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold">{returnType === "Pos" ? "POS Bill No" : "Sale Bill No"}</span>
                                        <input type="text" className="w-full h-5 text-[10px] border border-gray-300 rounded px-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" placeholder="Search" />
                                    </div>
                                </th>
                                <th className="border border-gray-300 p-1 w-24 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold">Bill Date</span>
                                        <input type="text" className="w-full h-5 text-[10px] border border-gray-300 rounded px-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" placeholder="Search" />
                                    </div>
                                </th>
                                <th className="border border-gray-300 p-1 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold">Item</span>
                                        <input
                                            type="text"
                                            className="w-full h-5 text-[10px] border border-gray-300 rounded px-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                            placeholder="Search"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </th>
                                <th className="border border-gray-300 p-1 w-16 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold">Size</span>
                                        <input type="text" className="w-full h-5 text-[10px] border border-gray-300 rounded px-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" placeholder="Search" />
                                    </div>
                                </th>
                                <th className="border border-gray-300 p-1 w-24 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold">Color</span>
                                        <input type="text" className="w-full h-5 text-[10px] border border-gray-300 rounded px-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" placeholder="Search" />
                                    </div>
                                </th>
                                <th className="border border-gray-300 p-1 w-16 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold">Uom</span>
                                        <input type="text" className="w-full h-5 text-[10px] border border-gray-300 rounded px-1 focus:outline-none focus:ring-1 focus:ring-indigo-400" placeholder="Search" />
                                    </div>
                                </th>
                                <th className="border border-gray-300 p-1 w-20 text-xs font-bold text-center">Price</th>
                                <th className="border border-gray-300 p-1 w-20 text-xs font-bold text-center">Return Qty</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {filteredItems.length > 0 ? filteredItems.map((item, idx) => (
                                <tr
                                    key={idx}
                                    className={`hover:bg-gray-100 transition-colors cursor-pointer border-b border-gray-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                                    onClick={() => toggleItem(item)}
                                >
                                    <td className="border border-gray-300 p-1 text-center">
                                        <input
                                            type="checkbox"
                                            checked={isItemAdded(item)}
                                            readOnly
                                            className="accent-indigo-600"
                                        />
                                    </td>
                                    <td className="border border-gray-300 p-1 text-xs text-center">{idx + 1}</td>
                                    <td className="border border-gray-300 p-1 text-[11px] text-center">
                                        {returnType === "Pos" ? String(singlePosData?.data?.docId || "") : String(singleSalesDeliveryData?.data?.docId || "")}
                                    </td>
                                    <td className="border border-gray-300 p-1 text-[11px] text-center">
                                        {returnType === "Pos" ? (singlePosData?.data?.date || "") : (singleSalesDeliveryData?.data?.date || "")}
                                    </td>
                                    <td className="border border-gray-300 p-1 text-[11px] leading-tight px-2">
                                        {item.itemName || item.name || findFromList(item.itemId, itemList?.data, "name")}
                                    </td>
                                    <td className="border border-gray-300 p-1 text-[11px] text-center">
                                        {item.sizeName || findFromList(item.sizeId, sizeList?.data, "name") || "-"}
                                    </td>
                                    <td className="border border-gray-300 p-1 text-[11px] text-center">
                                        {item.colorName || findFromList(item.colorId, colorList?.data, "name") || "-"}
                                    </td>
                                    <td className="border border-gray-300 p-1 text-[11px] text-center">
                                        {item.uomName || findFromList(item.uomId, itemList?.data, "uomName") || "-"}
                                    </td>
                                    <td className="border border-gray-300 p-1 text-[11px] text-right px-2 font-mono">
                                        {parseFloat(item.price || item.salesPrice || 0).toFixed(3)}
                                    </td>
                                    <td className="border border-gray-300 p-1 text-[11px] text-right px-2 font-bold text-indigo-600">
                                        {parseFloat(item.qty).toFixed(3)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={10} className="p-10 text-center text-gray-400 italic bg-white">
                                        No data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination UI (Matched to Image) */}
            <div className="flex justify-center items-center gap-2 py-4">
                <button className="w-8 h-8 rounded border border-gray-300 bg-white flex items-center justify-center text-sm hover:bg-gray-50 transition-colors">{"<"}</button>
                <button className="w-8 h-8 rounded border border-gray-300 bg-white flex items-center justify-center text-sm hover:bg-gray-50 transition-colors">{">"}</button>
            </div>
        </div>
    );
};

export default PosItemsSelection;