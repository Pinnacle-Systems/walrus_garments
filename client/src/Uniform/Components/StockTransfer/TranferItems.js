import Swal from "sweetalert2";
import { findFromList } from "../../../Utils/helper";
import { useGetStockQuery, useGetUnifiedStockQuery } from "../../../redux/services/StockService";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TransferItems({ item, index, handleRightClickFromOrder, readOnly, handleInputChangeFromOrder,
    itemList, sizeList, colorList, fromLocationId, id, locationData, toLocationId, stockDrivenFields = [],
    itemPriceList = [], offersData = [], collectionsData = []
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

        }, { skip: !fromLocationId || !id });

    const { data: branchStockData } = useGetUnifiedStockQuery({
        params: {
            itemId: item?.itemId,
            sizeId: item?.sizeId,
            colorId: item?.colorId,
            // No storeId to get total across all locations
        }
    }, { skip: !item?.itemId });

    const totalBranchStock = branchStockData?.data?.[0]?._sum?.qty || 0;
    const hasOtherLocationStock = parseFloat(totalBranchStock) > parseFloat(item?.stockQty || 0);

    const isDiscountSection = findFromList(toLocationId, locationData?.data, "storeName") === "DISCOUNT SECTION";
    const getOfferPrice = () => {
        if (!isDiscountSection) return null;

        const itemObj = (itemList?.data || itemList || [])?.find(i => parseInt(i.id) === parseInt(item.itemId));
        const priceObj = (itemPriceList?.data || itemPriceList || [])?.find(p =>
            parseInt(p.itemId) === parseInt(item.itemId) &&
            (itemObj?.isLegacy ? true : (
                parseInt(p.sizeId) === parseInt(item.sizeId) &&
                parseInt(p.colorId) === parseInt(item.colorId)
            ))
        );

        const salesPrice = parseFloat(priceObj?.salesPrice || 0);

        const applicableOffer = (offersData?.data || offersData || [])?.find(offer => {
            if (!offer.applyToClearance) return false;
            if (offer.scopeMode === 'Global') return true;

            return offer.OfferScope?.some(scope => {
                const type = String(scope.type).toLowerCase();
                if (type === 'item' && parseInt(scope.refId) === parseInt(item.itemId)) return true;
                if (type === 'collection') {
                    const collection = (collectionsData?.data || collectionsData || [])?.find(c => parseInt(c.id) === parseInt(scope.refId));
                    return collection?.CollectionItems?.some(ci => parseInt(ci.itemId) === parseInt(item.itemId));
                }
                return false;
            });
        });

        if (applicableOffer) {
            if (applicableOffer.discountType === 'Percentage') {
                return salesPrice * (1 - (applicableOffer.discountValue || 0) / 100);
            } else if (applicableOffer.discountType === 'Fixed') {
                return Math.max(0, salesPrice - (applicableOffer.discountValue || 0));
            } else if (['Override', 'Volume'].includes(applicableOffer.discountType)) {
                const tier = applicableOffer.OfferTier?.[0];
                if (tier) {
                    if (tier.type === 'Fixed') return tier.value;
                    return salesPrice * (1 - (tier.value || 0) / 100);
                }
            }
        }
        return salesPrice;
    };

    const resolvedOfferPrice = getOfferPrice();




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
                <td className="w-48 border border-gray-300 text-[11px] text-left px-2">
                    {(() => {
                        const isDiscountSection = findFromList(toLocationId, locationData?.data, "storeName") === "DISCOUNT SECTION";
                        const regularBarcode = item?.barcode || "";

                        if (!isDiscountSection) {
                            return regularBarcode;
                        }

                        // DISCOUNT SECTION Logic
                        const itemObj = (itemList?.data || itemList || [])?.find(i => parseInt(i.id) === parseInt(item.itemId));
                        const isLegacy = itemObj?.isLegacy;

                        const variant = (itemPriceList?.data || itemPriceList || [])?.find(p =>
                            parseInt(p.itemId) === parseInt(item.itemId) &&
                            (isLegacy ? true : (
                                parseInt(p.sizeId) === parseInt(item.sizeId) &&
                                parseInt(p.colorId) === parseInt(item.colorId)
                            ))
                        );

                        const existingClearance = variant?.ItemBarcodes?.find(b => b.barcodeType === "CLEARANCE")?.barcode;
                        const existingRegular = variant?.ItemBarcodes?.find(b => b.barcodeType === "REGULAR")?.barcode;

                        if (existingClearance) {
                            if (item.clearanceBarcode !== existingClearance) {
                                setTimeout(() => handleInputChangeFromOrder(existingClearance, index, "clearanceBarcode"), 0);
                            }
                            return existingClearance;
                        } else if (item.itemId && existingRegular) {
                            const generatedCode = `DS-${existingRegular}`;
                            if (item.clearanceBarcode !== generatedCode) {
                                setTimeout(() => handleInputChangeFromOrder(generatedCode, index, "clearanceBarcode"), 0);
                            }
                            return <span className="text-blue-600 font-medium">{generatedCode} (New)</span>;
                        }
                        return "";
                    })()}
                </td>
                {stockDrivenFields.map((field) => (
                    <td key={field.key} className="w-32 border border-gray-300 text-[11px]  px-2">
                        {item?.[field.key] || ""}
                    </td>
                ))}
                <td className="w-12 border border-gray-300 text-[11px] text-right px-2 relative group">
                    <div className="flex items-center justify-end gap-1">
                        {item?.stockQty}
                        {hasOtherLocationStock && (
                            <span
                                title={`Total ${parseFloat(totalBranchStock).toFixed(3)} available in all locations`}
                                className="cursor-help text-blue-500 hover:text-blue-700 font-bold"
                            >
                                ⓘ
                            </span>
                        )}
                    </div>
                </td>

                {isDiscountSection && (
                    <td className="w-16 border border-gray-300 text-[11px] text-right px-2">
                        {resolvedOfferPrice ? resolvedOfferPrice.toFixed(2) : "0.00"}
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



