import Swal from "sweetalert2";
import { findFromList } from "../../../Utils/helper";
import { useGetStockQuery } from "../../../redux/services/StockService";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TransferItems({ item, index, handleRightClickFromOrder, readOnly, handleInputChangeFromOrder,
    itemList, sizeList, colorList, fromLocationId, id, locationData, toLocationId, stockDrivenFields = []
}) {


    const searchParams = {
        storeId: fromLocationId,
        searchItem: item?.itemId,
        searchColor: item?.colorId,
        searchSize: item?.sizeId

    };

    if (item?.itemId) searchParams.searchItem = item.itemId;
    if (item?.colorId) searchParams.searchColor = item.colorId;
    if (item?.sizeId) searchParams.searchSize = item.sizeId;

    console.log(item, "itemitem", searchParams)

    const { data: allStockData, isLoading, isFetching } = useGetStockQuery(
        {
            searchParams

        }, { skip: !fromLocationId || !id }
    );

    console.log(allStockData, "allStockData", item?.itemId)

    const currentStockQty = allStockData?.data?.[0]?._sum?.qty

    console.log(readOnly, id, "check condtion")




    return (

        <>
            <tr
                key={index}
                className={`hover:bg-gray-50  transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    }`}
                onContextMenu={(e) => {
                    if (!readOnly && !id) {
                        handleRightClickFromOrder(e, index, "notes");
                    }
                }}
            >
                <td className="w-5 border border-gray-300 text-center text-xs px-2 py-1">
                    {index + 1}
                </td>

                <td className="w-72 border border-gray-300 text-left text-xs px-2">
                    {findFromList(item?.itemId, itemList, "name")}
                </td>
                <td className="w-48 border border-gray-300 text-[11px]  px-2">
                    {findFromList(item?.sizeId, sizeList, "name")}

                </td>
                <td className="w-48 border border-gray-300 text-[11px]  px-2">
                    {findFromList(item?.colorId, colorList, "name")}
                </td>
                <td className="w-48 border border-gray-300 text-[11px]  text-left px-2">
                    {item?.barcode ? item?.barcode : ""}
                </td>
                {stockDrivenFields.map((field) => (
                    <td key={field.key} className="w-32 border border-gray-300 text-[11px]  px-2">
                        {item?.[field.key] || ""}
                    </td>
                ))}
                <td className="w-12 border border-gray-300 text-[11px] text-right   px-2">
                    {item?.stockQty}
                </td>

                {findFromList(toLocationId, locationData?.data, "storeName") == "DISCOUNT SECTION" && (
                    <td className="w-48 border border-gray-300 text-[11px]  px-2">
                        <input
                            className=" h-full w-full rounded-none border-0 bg-transparent px-1 py-0 text-right shadow-none outline-none focus:bg-transparent focus:outline-none table-data-input"
                            type="number"
                            step="0.01"
                            min="0"
                            value={parseFloat(item?.discountPrice || "")}




                            onKeyDown={(e) => {
                                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                            }}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (!val) {
                                    handleInputChangeFromOrder(0, index, "discountPrice");
                                    return
                                }
                                handleInputChangeFromOrder(val, index, "discountPrice", item);


                            }}


                            placeHolder="0.000"
                        />
                    </td>
                )}



                <td className="w-40 border border-gray-300 p-0 text-[11px] text-right focus-within:border-amber-600 focus-within:bg-amber-100 px-2">
                    <input
                        className=" h-full w-full rounded-none border-0 bg-transparent px-1 py-0 text-right shadow-none outline-none focus:bg-transparent focus:outline-none table-data-input"
                        type="number"
                        step="0.01"
                        min="0"
                        value={parseFloat(item?.transferQty || "")}
                        disabled={id}



                        onKeyDown={(e) => {
                            if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                        }}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (!val) {
                                handleInputChangeFromOrder(0, index, "transferQty");
                                return
                            }
                            if (parseFloat(val) <= parseFloat(item?.stockQty).toFixed(3)) {

                                handleInputChangeFromOrder(val, index, "transferQty", item);
                            } else {
                                Swal.fire({
                                    title: "Transfer Qty cannot be more than Stock Qty",
                                    icon: "warning",
                                });
                            }
                        }}


                    // placeHolder="0.000"
                    />
                </td>

            </tr>


        </>
    )
}



