import { useEffect } from "react";
import { useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { toast } from "react-toastify";
import { capitalizeFirstLetter, findFromList, getItemVariantColorOptions, getItemVariantSizeOptions, getStockMaintenanceConfig, resolveBarcodeGenerationMethod, sumArray } from "../../../Utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { setLastTab, setOpenPartyModal } from "../../../redux/features/openModel";
import Swal from "sweetalert2";
import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";
import { useGetItemControlPanelMasterQuery } from "../../../redux/uniformService/ItemControlPanelService";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import SearchableTableCellSelect from "../ReusableComponents/SearchableTableCellSelect";
import TransactionLineItemsSection, {
    standardTransactionPlaceholderRowCount,
    transactionTableClassName,
    transactionTableHeadClassName,
} from "../ReusableComponents/TransactionLineItemsSection";
import { ItemMaster } from "../../../Shocks";
import { ColorMaster, SizeMaster, UomMaster } from "../../../Basic/components";

const YarnPoItems = ({
    id,
    transType,
    poItems,
    setPoItems,
    readOnly,
    params,
    isSupplierOutside,
    taxTypeId,
    greyFilter,
    contextMenu,
    handleCloseContextMenu,
    handleRightClick,
    setInwardItemSelection,
    supplierId,
    itemList,
    sizeList,
    headerOpen,
    itemPriceList,
    movedToNextSaveNewRef,
    saveNewButtonRef,
    handlers
}) => {
    const formatThreeDecimals = (value) => {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed.toFixed(3) : "0.000";
    };

    const formatTwoDecimals = (value) => {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00";
    };


    const { data: allData, isLoading, isFetching } = useGetStockReportControlQuery({ params });
    const { data: itemControlData } = useGetItemControlPanelMasterQuery({ params });
    const barcodeGenerationMethod = resolveBarcodeGenerationMethod(itemControlData?.data?.[0]);
    const stockMaintenance = getStockMaintenanceConfig(allData?.data?.[0]);
    const showSize = stockMaintenance.trackSize;
    const showColor = stockMaintenance.trackColor;
    const isUomReady = (row) => {
        if (showColor) return Boolean(row.colorId);
        if (showSize) return Boolean(row.sizeId);
        return Boolean(row.itemId);
    };


    const stockControldata = allData?.data?.[0]

    console.log(stockControldata, "stockControldata")


    const getBarcodeFromList = (itemId, sizeId, colorId) => {
        if (!itemPriceList?.data || !itemId) return null;
        const itemRows = itemPriceList.data.filter(item => String(item.itemId) === String(itemId));
        if (!itemRows.length) return null;
        if (!sizeId) {
            return itemRows.find(item => !item.sizeId && !item.colorId) || itemRows[0];
        }
        if (!colorId) {
            return itemRows.find(item => String(item.sizeId) === String(sizeId) && !item.colorId) ||
                itemRows.find(item => String(item.sizeId) === String(sizeId));
        }
        return itemRows.find(item =>
            String(item.itemId) === String(itemId) &&
            String(item.sizeId) === String(sizeId) &&
            String(item.colorId) === String(colorId)
        ) || null;
    };




    const handleInputChange = (value, index, field) => {
        console.log(value, "value", index, "index", field, "field")
        const newBlend = structuredClone(poItems);
        const currentItemId = field === "itemId" ? value : newBlend[index].itemId;
        const selectedItem = itemList?.data?.find(item => String(item.id) === String(currentItemId));
        const isStandardPriceItem = barcodeGenerationMethod === "STANDARD";

        if (field === "itemId") {
            newBlend[index]["sizeId"] = "";
            newBlend[index]["colorId"] = "";
            newBlend[index]["barcode"] = "";

            const standardPrice = barcodeGenerationMethod === "STANDARD"
                ? selectedItem?.ItemPriceList?.[0]
                : null;

            if (standardPrice?.barcode) {
                newBlend[index]["barcode"] = standardPrice.barcode;
                if (!newBlend[index]["price"] || newBlend[index]["price"] === "0.00") {
                    newBlend[index]["price"] = standardPrice.salesPrice || "0.00";
                }
            }
        }

        if (field === "sizeId") {
            newBlend[index]["colorId"] = "";
            if (!isStandardPriceItem) {
                newBlend[index]["barcode"] = "";
            }
        }

        if (field === "colorId" && !isStandardPriceItem) {
            newBlend[index]["barcode"] = "";
        }

        if (field === "barcode") {
            const foundPrice = itemPriceList?.data?.find(item => item.barcode === value);
            if (foundPrice) {
                newBlend[index]["itemId"] = foundPrice.itemId;
                newBlend[index]["sizeId"] = foundPrice.sizeId;
                newBlend[index]["colorId"] = foundPrice.colorId;
                newBlend[index]["price"] = foundPrice.salesPrice;
                const sectionId = findFromList(foundPrice.itemId, itemList?.data, "sectionId")
                newBlend[index]["sectionId"] = sectionId;
            }
        }

        if (field === "itemId" || field === "sizeId" || field === "colorId") {
            const currentItem = field === "itemId" ? value : newBlend[index].itemId;
            const currentSize = field === "sizeId" ? value : newBlend[index].sizeId;
            const currentColor = field === "colorId" ? value : newBlend[index].colorId;

            if (currentItem && (!showSize || currentSize)) {
                const foundPrice = getBarcodeFromList(currentItem, currentSize, currentColor);

                if (foundPrice) {
                    newBlend[index]["barcode"] = foundPrice.barcode;
                    if (!newBlend[index]["price"] || newBlend[index]["price"] === "0.00") {
                        newBlend[index]["price"] = foundPrice.salesPrice;
                    }
                }
            }
        }

        if (field == "itemId") {
            const sectionId = findFromList(value, itemList?.data, "sectionId")
            newBlend[index]["sectionId"] = sectionId;
        }


        newBlend[index][field] = value;

        setPoItems(newBlend);
    };


    useEffect(() => {
        if (poItems?.length >= standardTransactionPlaceholderRowCount) return;

        setPoItems((prev) => {
            const newArray = Array.from({ length: standardTransactionPlaceholderRowCount - prev.length }, () => ({
                itemId: "",
                barcode: "",
                qty: "0.00",
                tax: "0",
                colorId: "",
                uomId: "",
                price: "0.00",
                discountValue: "0.00",
                noOfBags: "0",
                discountType: "",
                weightPerBag: "0.00",
                id: "",
                poItemsId: "",
            }));
            return [...prev, ...newArray];
        });
    }, [transType, setPoItems, poItems, headerOpen]);


    const addNewRow = () => {
        const newRow = {
            itemId: "",
            barcode: "",
            qty: "",
            tax: "0",
            colorId: "",
            uomId: "",
            price: "",
            discountTypes: "",
            discountValue: "0.00",
            id: '',
            poItemsId: ""
        };
        setPoItems([...poItems, newRow]);
    };
    const handleDeleteRow = (id) => {
        setPoItems((yarnBlend) =>
            yarnBlend.filter((row, index) => index !== parseInt(id))
        );
    };


    const handleDeleteAllRows = () => {
        setPoItems((prevRows) => {
            if (prevRows.length <= 1) return prevRows;
            return [prevRows[0]];
        });
    };


    const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
    const { data: colorList, isLoading: isColorLoading, isFetching: isColorFetching, } = useGetColorMasterQuery({ params: { ...params, isGrey: greyFilter ? true : undefined }, });

    const itemOptions = (id ? itemList?.data : itemList?.data?.filter(i => i.active) || [])?.map((item) => ({
        value: item.id,
        label: item?.name || "",
    }));

    const getSizeOptions = (row) => {
        const availableSizeIds = [...new Set(
            (itemPriceList?.data || [])
                .filter((item) => String(item.itemId) === String(row?.itemId) && item?.sizeId)
                .map((item) => String(item.sizeId))
        )];

        const source =
            availableSizeIds.length > 0
                ? (sizeList?.data || []).filter((item) => availableSizeIds.includes(String(item.id)))
                : (id
                    ? sizeList?.data
                    : getItemVariantSizeOptions(itemList?.data, sizeList?.data, "sizeId", row?.itemId));

        return (source || []).map((item) => ({
            value: item.id,
            label: item?.name || "",
        }));
    };

    const getColorOptions = (row) => {
        const availableColorIds = [...new Set(
            (itemPriceList?.data || [])
                .filter((item) =>
                    String(item.itemId) === String(row?.itemId) &&
                    String(item.sizeId) === String(row?.sizeId) &&
                    item?.colorId
                )
                .map((item) => String(item.colorId))
        )];

        const source =
            availableColorIds.length > 0
                ? (colorList?.data || []).filter((item) => availableColorIds.includes(String(item.id)))
                : (id
                    ? colorList?.data
                    : getItemVariantColorOptions(itemList?.data, colorList?.data, "colorId", row?.itemId, row?.sizeId));

        return (source || []).map((item) => ({
            value: item.id,
            label: item?.name || "",
        }));
    };

    const uomOptions = ((id ? uomList?.data : uomList?.data?.filter(item => item.active)) || []).map((item) => ({
        value: item.id,
        label: item?.name || "",
    }));














    return (
        <>

            <TransactionLineItemsSection
                panelClassName="h-full"
                contentClassName="overflow-hidden rounded-md border border-slate-200 !py-0"
            >
                <div className="h-full overflow-x-auto overflow-y-auto ">
                    <table className={transactionTableClassName}>
                        <thead className={`${transactionTableHeadClassName} shadow-sm`}>
                            <tr className="py-2">
                                <th
                                    className={`w-12 bg-gray-200 px-1 py-1 text-center font-medium text-[12px] `}
                                >
                                    S.No
                                </th>
                                {stockControldata?.itemWise && (

                                    <th

                                        className={`w-52 bg-gray-200 px-1 py-1 text-center font-medium text-[12px] `}
                                    >
                                        Item  <span className="text-red-500">*</span>
                                    </th>
                                )}
                                {stockControldata?.sizeWise && (
                                    <th

                                        className={`w-16 bg-gray-200 px-1 py-1 text-center font-medium text-[12px] `}
                                    >
                                        Size  <span className="text-red-500">*</span>
                                    </th>
                                )}
                                {stockControldata?.sizeColorWise && (
                                    <th

                                        className={`w-32 bg-gray-200 px-1 py-1 text-center font-medium text-[12px] `}
                                    >
                                        Color  <span className="text-red-500">*</span>
                                    </th>
                                )}

                                <th

                                    className={`w-12 bg-gray-200 px-1 py-1 text-center font-medium text-[12px] `}
                                >
                                    UOM  <span className="text-red-500">*</span>
                                </th>
                                <th

                                    className={`w-20 bg-gray-200 px-1 py-1 text-center font-medium text-[12px] `}
                                >
                                    Barcode  <span className="text-red-500">*</span>
                                </th>
                                {allData?.data?.map(element => (
                                    // console.log(Object.keys(element)?.filter(key => key.toLowerCase().includes("field") && !!element[key]), "element")
                                    Object.keys(element)?.filter(key => key.toLowerCase().includes("field") && !!element[key])?.map(i => (
                                        <>
                                            <th
                                                key={i}
                                                className={`w-20 bg-gray-200 px-1 py-1 text-center font-medium text-[12px] `}
                                            >
                                                {capitalizeFirstLetter(element?.[i])}  <span className="text-red-500">*</span>
                                            </th>

                                        </>
                                    ))
                                ))}
                                {id && (
                                    <th

                                        className={`w-16 bg-gray-200 px-1 py-1 text-center font-medium text-[12px] `}
                                    >
                                        Stock  Quantity  <span className="text-red-500">*</span>
                                    </th>
                                )}

                                <th

                                    className={`w-16 bg-gray-200 px-1 py-1 text-center font-medium text-[12px] `}
                                >
                                    Quantity  <span className="text-red-500">*</span>
                                </th>
                                <th

                                    className={`w-16 bg-gray-200 px-1 py-1 text-center font-medium text-[12px] `}
                                >
                                    Price  <span className="text-red-500">*</span>
                                </th>


                                <th

                                    className={`w-16 bg-gray-200 px-1 py-1 text-center font-medium text-[12px] `}
                                >
                                    Gross
                                </th>


                                <th

                                    className={`w-7 bg-gray-200 px-0 py-1 text-center font-medium text-[12px] `}
                                >

                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white">

                            {(poItems ? poItems : [])?.map((row, index) =>
                                <tr key={index} className="border border-blue-gray-200 cursor-pointer "
                                    onContextMenu={(e) => {
                                        if (!readOnly && !(parseFloat(row.stockQty) < parseFloat(row?.qty))) {
                                            handleRightClick(e, index, "shiftTimeHrs");
                                        }
                                    }}
                                >
                                    <td className="w-12 border border-gray-300 text-[11px] text-center p-0">{index + 1}</td>

                                    {stockControldata?.itemWise && (
                                        <td className="border border-gray-300 bg-white p-0 text-[11px] focus-within:border-amber-700 focus-within:bg-amber-100">
                                            <SearchableTableCellSelect
                                                value={row.itemId}
                                                options={itemOptions}
                                                disabled={readOnly || id ? row.stockQty < row?.qty : false}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "itemId")}
                                                addNewModalWidth="w-[90%] h-[95%]"
                                                childComponent={ItemMaster}
                                                addNewLabel="+ Add New Item"
                                                handlers={handlers}
                                                movedToNextSaveNewRef={movedToNextSaveNewRef}
                                            />
                                        </td>
                                    )}
                                    {showSize && (
                                        <td className="border border-gray-300 bg-white p-0 py-1.5 text-[11px] focus-within:border-amber-700 focus-within:bg-amber-100">
                                            <SearchableTableCellSelect
                                                value={row.sizeId}
                                                options={getSizeOptions(row)}
                                                disabled={readOnly || !row.itemId || (id ? row.stockQty < row?.qty : false)}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "sizeId")}
                                                addNewModalWidth="w-[40%] h-[45%]"
                                                childComponent={SizeMaster}
                                                addNewLabel="+ Add New Size"
                                            />
                                        </td>
                                    )}
                                    {showColor && (
                                        <td className="border border-gray-300 bg-white p-0 text-[11px] focus-within:border-amber-700 focus-within:bg-amber-100">
                                            <SearchableTableCellSelect
                                                value={row.colorId}
                                                options={getColorOptions(row)}
                                                disabled={readOnly || !(showSize ? row.sizeId : row.itemId) || (id ? row.stockQty < row?.qty : false)}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "colorId")}
                                                addNewModalWidth="w-[40%] h-[45%]"
                                                childComponent={ColorMaster}
                                                addNewLabel="+ Add New Color"
                                            />
                                        </td>
                                    )}




                                    <td className="w-40 border border-gray-300 bg-white p-0 text-[11px] focus-within:border-amber-700 focus-within:bg-amber-100">
                                        <SearchableTableCellSelect
                                            value={row.uomId}
                                            options={uomOptions}
                                            disabled={readOnly || !isUomReady(row) || (id ? row.stockQty < row?.qty : false)}
                                            onChange={(nextValue) => handleInputChange(nextValue, index, "uomId")}
                                            addNewModalWidth="w-[40%] h-[45%]"
                                            childComponent={UomMaster}
                                            addNewLabel="+ Add New Uom"
                                        />
                                    </td>
                                    <td className="w-40 border border-gray-300 bg-white p-0 text-[11px] text-right">
                                        <div className="flex h-full min-h-[22px] items-center justify-end px-1">
                                            {row.barcode || ""}
                                        </div>
                                    </td>

                                    {allData?.data?.map(element => (
                                        // console.log(Object.keys(element)?.filter(key => key.toLowerCase().includes("field") && !!element[key]), "element")
                                        Object.keys(element)?.filter(key => key.toLowerCase().includes("field") && !!element[key])?.map(i => (
                                            <>
                                                <td className="w-40 border border-gray-300 bg-white p-0 text-[11px] text-right focus-within:border-amber-600 focus-within:bg-amber-100">
                                                    <input
                                                        onKeyDown={e => {
                                                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                            if (e.key === "Delete") { handleInputChange("0.000", index, element?.[i]) }
                                                        }}

                                                        className="h-full w-full rounded-none border-0 bg-transparent px-1 py-0 text-right shadow-none outline-none focus:bg-transparent focus:outline-none table-data-input"
                                                        onFocus={(e) => e.target.select()}
                                                        // value={sumArray(row?.lotDetails ? row?.lotDetails : [], "qty")}
                                                        value={row[i]}
                                                        disabled={readOnly || !row.uomId || id ? row.stockQty < row?.qty : false}
                                                        onChange={(e) =>
                                                            handleInputChange(e.target.value, index, i)
                                                        }
                                                        onBlur={(e) => {
                                                            handleInputChange(e.target.value, index, i);
                                                        }
                                                        }
                                                    />
                                                </td>

                                            </>
                                        ))
                                    ))}

                                    {id && (
                                        <td className="border border-gray-300 p-0 text-[11px] text-right">
                                            {formatThreeDecimals(row?.stockQty)}
                                        </td>
                                    )}

                                    <td className="w-40 border border-gray-300 bg-white p-0 text-[11px] text-right focus-within:border-amber-600 focus-within:bg-amber-100">
                                        <input
                                            onKeyDown={e => {
                                                if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                if (e.key === "Delete") { handleInputChange("0.000", index, "qty") }
                                            }}
                                            min={"0"}
                                            type="number"
                                            className="h-full w-full rounded-none border-0 bg-transparent px-1 py-0 text-right shadow-none outline-none focus:bg-transparent focus:outline-none table-data-input"
                                            onFocus={(e) => e.target.select()}
                                            // value={sumArray(row?.lotDetails ? row?.lotDetails : [], "qty")}
                                            value={(row?.qty)}
                                            disabled={readOnly || !row.uomId || id ? row.stockQty < row?.qty : false}
                                            onChange={(e) => {

                                                handleInputChange(e.target.value, index, "qty")
                                                // if (id) {
                                                //     if (parseFloat(item?.stockQty) < parseFloat(e.target.value)) {
                                                //         Swal.fire({
                                                //             title: "cannot enter below the Stock Qty",
                                                //             icon: "warning",
                                                //         });
                                                //         return
                                                //     }
                                                //     else {
                                                //         handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty");
                                                //     }
                                                // } else {
                                                //     handleInputChange(e.target.value, index, "qty");

                                                // }



                                            }}
                                            onBlur={(e) => {
                                                handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty");
                                            }
                                            }
                                        />
                                    </td>

                                    <td className="w-40 border border-gray-300 bg-white p-0 text-[11px] text-right focus-within:border-amber-600 focus-within:bg-amber-100 ">
                                        <input
                                            onKeyDown={e => {
                                                if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                if (e.key === "Delete") { handleInputChange("0.00", index, "price") }
                                            }}
                                            min={"0"}
                                            type="number"
                                            className="h-full w-full rounded-none border-0 bg-transparent px-1 py-0 text-right shadow-none outline-none focus:bg-transparent focus:outline-none table-data-input"
                                            onFocus={(e) => e.target.select()}
                                            value={(row?.price)}
                                            disabled={readOnly || !row.qty || id ? row.stockQty < row?.qty : false}
                                            onChange={(e) =>
                                                handleInputChange(e.target.value, index, "price")
                                            }
                                            onBlur={(e) => {
                                                handleInputChange(parseFloat(e.target.value).toFixed(2), index, "price");

                                            }
                                            }

                                        />

                                    </td>



                                    <td className='border border-gray-300 p-0 text-[11px] text-right'>
                                        {formatTwoDecimals(row?.price && row?.qty ? parseFloat(row?.price) * parseFloat(row?.qty) : 0)}</td>




                                    <td className="w-16 border border-gray-300 p-0 text-center">
                                        <button
                                            onClick={() => addNewRow(index)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addNewRow(index);
                                                }
                                            }}
                                            className="h-full w-full rounded-none bg-blue-50 py-0"
                                        >
                                            +
                                        </button>
                                    </td>



                                </tr>
                            )}
                        </tbody>
                        {/* <tfoot className="sticky bottom-0 z-20 border-t-2 border-gray-300  font-bold shadow-[0_-1px_0_0_rgba(203,213,225,1)]">
                            <tr>
                                <td
                                    colSpan={6 + (id ? 1 : 0) + (allData?.data?.reduce((acc, element) => acc + Object.keys(element)?.filter(k => k.toLowerCase().includes("field") && !!element[k]).length, 0))}
                                    className="bg-gray-300 px-1 py-1 text-right text-[12px]"
                                >
                                    Total:
                                </td>
                                <td className="bg-gray-300 px-1 py-1 text-right text-[11px]">
                                    {(poItems || [])?.reduce((acc, curr) => acc + parseFloat(curr?.qty || 0), 0).toFixed(3)}
                                </td>
                                <td className="bg-gray-300 px-1 py-1 text-right text-[11px]"></td>
                                <td className="bg-gray-300 px-1 py-1 text-right text-[11px]">
                                    {formatTwoDecimals((poItems || [])?.reduce((acc, curr) => acc + (parseFloat(curr?.qty || 0) * parseFloat(curr?.price || 0)), 0))}
                                </td>
                                <td className="px-1 py-1 bg-gray-100"></td>
                            </tr>
                        </tfoot> */}
                    </table>
                </div>
                {contextMenu && (
                    <div
                        style={{
                            position: "absolute",
                            top: `${contextMenu.mouseY - 355}px`,
                            left: `${contextMenu.mouseX - 40}px`,

                            // background: "gray",
                            boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                            padding: "8px",
                            borderRadius: "4px",
                            zIndex: 1000,
                        }}
                        className="bg-gray-100"
                        onMouseLeave={handleCloseContextMenu} // Close when the mouse leaves
                    >
                        <div className="flex flex-col gap-1">
                            <button
                                className=" text-black text-[12px] text-left rounded px-1"
                                onClick={() => {
                                    handleDeleteRow(contextMenu.rowId);
                                    handleCloseContextMenu();
                                }}
                            >
                                Delete{" "}
                            </button>
                            <button
                                className=" text-black text-[12px] text-left rounded px-1"
                                onClick={() => {
                                    handleDeleteAllRows();
                                    handleCloseContextMenu();
                                }}
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                )}
            </TransactionLineItemsSection>
        </>
    );
};

export default YarnPoItems;
