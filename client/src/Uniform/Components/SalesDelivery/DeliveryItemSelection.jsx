import React, { useState, useEffect } from 'react';
import { useGetsaleOrderByIdQuery } from '../../../redux/uniformService/saleOrderServices';
import Swal from 'sweetalert2';

const DeliveryItemsSelection = ({ linkedSaleOrderId, setDeliveryItems, deliveryItems, setDeliveryItemSelection, onClose,
    setReceivedAmount, setPackingChargeEnabled, setPackingCharge, setShippingChargeEnabled, setShippingCharge, setCourierChargeEnabled, setCourierCharge
}) => {
    const [selectedIndices, setSelectedIndices] = useState([]);
    const [saleOrderItems, setSaleOrderItems] = useState([]);

    const {
        data: saleorderData,
        isFetching,
        isLoading,
    } = useGetsaleOrderByIdQuery(linkedSaleOrderId, { skip: !linkedSaleOrderId });

    const parseChargeAmount = (value) => {
        const parsedValue = parseFloat(value);
        return Number.isFinite(parsedValue) ? parsedValue : 0;
    };
    const formatChargeValue = (value) => {
        if (value === "" || value === null || value === undefined) {
            return "";
        }
        return parseChargeAmount(value).toFixed(2);
    };

    useEffect(() => {
        if (saleorderData?.data?.remaingSaleOrderItems) {
            setSaleOrderItems(saleorderData.data.remaingSaleOrderItems);
        }
        if (saleorderData?.data?.totalReceivedAmount) {
            setReceivedAmount(saleorderData.data.totalReceivedAmount)
        }
        setPackingChargeEnabled(Boolean(saleorderData?.data?.packingChargeEnabled) || parseChargeAmount(saleorderData?.data?.packingCharge) > 0);
        setPackingCharge(saleorderData?.data?.packingChargeEnabled ? formatChargeValue(saleorderData?.data?.packingCharge) : "");
        setShippingChargeEnabled(Boolean(saleorderData?.data?.shippingChargeEnabled) || parseChargeAmount(saleorderData?.data?.shippingCharge) > 0);
        setShippingCharge(saleorderData?.data?.shippingChargeEnabled ? formatChargeValue(saleorderData?.data?.shippingCharge) : "");
        setCourierChargeEnabled(Boolean(saleorderData?.data?.courierChargeEnabled) || parseChargeAmount(saleorderData?.data?.courierCharge) > 0);
        setCourierCharge(saleorderData?.data?.courierChargeEnabled ? formatChargeValue(saleorderData?.data?.courierCharge) : "");
    }, [saleorderData]);






    function handleDone() {


        onClose()
    }

    function removeItem(id) {
        setDeliveryItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems = newItems?.filter(item => parseInt(item.id) !== parseInt(id))
            return newItems
        });

    }

    function addItem(id, obj) {
        console.log(obj, "obj")

        setDeliveryItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);


            const isAlreadyAdded = newItems.some(v => v?.id == id);
            if (isAlreadyAdded) {
                return newItems;
            }

            const emptyIndex = newItems.findIndex(v => v?.id === "");

            if (emptyIndex !== -1) {
                newItems[emptyIndex] = obj;
            } else {
                newItems.push(obj);
            }

            return newItems
        });

    }

    function isItemAdded(id) {
        return deliveryItems?.findIndex(item => parseInt(item?.id) === parseInt(id)) !== -1
    }

    function handleChange(id, obj) {

        console.log(id, "id", obj)

        if (isItemAdded(id)) {
            removeItem(id)
        } else {
            addItem(id, obj)
        }
    }

    function handleSelectAllChange(value, poItems) {
        if (value) {
            poItems?.forEach(item => addItem(item.id, item))
        } else {
            poItems?.forEach(item => removeItem(item.id))
        }
    }

    function getSelectAll(poItems) {
        return poItems?.every(item => isItemAdded(item.id))
    }


    if (isLoading || isFetching) {
        return <div className="p-10 text-center">Loading items...</div>;
    }

    console.log(deliveryItems, "deliveryItems")
    return (
        <div className='border border-gray-200 shadow-sm bg-[#f1f1f0] h-full flex flex-col'>
            <div className="flex-grow overflow-hidden flex flex-col">
                <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-2 mb-2 rounded-t-lg">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                            Select Items from Sale Order
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setDeliveryItemSelection(false)}
                            className="px-3 py-1 hover:bg-gray-200 rounded text-gray-600 border border-gray-300 text-xs font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDone}
                            className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                     border border-green-600 flex items-center gap-1 text-xs font-medium transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>

                <div className="flex-grow overflow-auto mx-3 bg-white mb-3 shadow-sm border border-gray-200 rounded-b-lg">
                    <table className="border-collapse w-full table-fixed">
                        <thead className="bg-gray-200 text-gray-800 sticky top-0 z-20">
                            <tr>
                                <th className="border border-gray-300 px-2 py-1 text-center text-xs w-10">
                                    <input type="checkbox" onChange={(e) => handleSelectAllChange(e.target.checked, saleOrderItems ? saleOrderItems : [])}
                                        checked={getSelectAll(saleOrderItems ? saleOrderItems : [])}
                                    />
                                </th>
                                <th className="border border-gray-300 px-2 py-1 text-center text-xs w-12">S No</th>
                                <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-64">Item</th>
                                <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-20">Size</th>
                                <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-32">Color</th>
                                <th className="px-1 py-1.5 border border-gray-300 text-xs w-24 text-center">Price</th>
                                <th className="px-1 py-1.5 border border-gray-300 text-xs w-24 text-center">Qty</th>
                                <th className="px-1 py-1.5 border border-gray-300 text-xs w-24 text-center">Already Delivered Qty</th>
                                <th className="px-1 py-1.5 border border-gray-300 text-xs w-24 text-center">Balance Qty</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {saleOrderItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        No items found in this Sale Order
                                    </td>
                                </tr>
                            ) : (
                                saleOrderItems.map((item, index) => (
                                    <tr
                                        key={index}
                                        className={`hover:bg-gray-50 py-1 transition-colors border-b border-gray-200 text-[12px] cursor-pointer ${index % 2 === 0 ? "bg-white" : "bg-gray-100"} ${isItemAdded(item?.id, item) ? "bg-blue-50" : ""}`}
                                        onClick={() => handleChange(item.id, item)}
                                    >
                                        <td className='py-1 text-center' onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isItemAdded(item?.id, item)}
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-2 py-1 text-center text-xs font-medium text-gray-600">
                                            {index + 1}
                                        </td>
                                        <td className="border border-gray-300 text-[11px] py-1.5 px-3 font-semibold text-gray-800">
                                            {item?.Item?.name}
                                        </td>
                                        <td className="border border-gray-300 text-[11px] py-1.5 px-2 text-left text-gray-700">
                                            {item?.Size?.name}
                                        </td>
                                        <td className="border border-gray-300 text-[11px] py-1.5 px-2 text-left text-gray-700 font-medium ">
                                            {item?.Color?.name || item.color}
                                        </td>
                                        <td className="border border-gray-300 text-[11px] text-right py-1.5 px-3 text-gray-900">
                                            {parseFloat(item.price || 0).toFixed(2)}
                                        </td>
                                        <td className="border border-gray-300 text-[11px] text-right py-1.5 px-3 font-bold text-gray-900">
                                            {parseFloat(item.qty || 0).toFixed(3)}
                                        </td>    <td className="border border-gray-300 text-[11px] text-right py-1.5 px-3 font-bold text-gray-900">
                                            {parseFloat(item.deliveredQty || 0).toFixed(3)}
                                        </td>
                                        <td className="border border-gray-300 text-[11px] text-right py-1.5 px-3 font-bold text-gray-900">
                                            {parseFloat(item.balanceQty || 0).toFixed(3)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default DeliveryItemsSelection;

