import { useEffect, useState } from "react";
import { useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { toast } from "react-toastify";
import { findFromList, sumArray } from "../../../Utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { setLastTab, setOpenPartyModal } from "../../../redux/features/openModel";
import Swal from "sweetalert2";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";
import { useGetItemPriceListQuery } from "../../../redux/uniformService/ItemMasterService";
import {
    getCatalogColorOptions,
    getCatalogColumnVisibility,
    getCatalogSizeOptions,
    isLegacyCatalogItem,
    itemUsesColor,
    itemUsesSize,
    resolveSellablePriceRow,
} from "../../../Utils/salesCatalogRules";
import TransactionLineItemsSection, {
    standardTransactionPlaceholderRowCount,
    transactionTableClassName,
    transactionTableCellClassName,
    transactionTableFocusCellClassName,
    transactionTableHeadClassName,
    transactionTableHeaderCellClassName,
    transactionTableIndexCellClassName,
    transactionTableNumberInputClassName,
    transactionTableRowClassName,
    transactionTableSelectInputClassName,
} from "../ReusableComponents/TransactionLineItemsSection";
import SearchableTableCellSelect from "../ReusableComponents/SearchableTableCellSelect";
import { ItemMaster } from "../../../Shocks";

const SalesReturnItems = ({
    id,
    transType,
    deliveryItems,
    setDeliveryItems,
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
    title = "",
    type = "Return",
    handlers,
    movedToNextSaveNewRef
}) => {
    const compactHeaderCellClassName = transactionTableHeaderCellClassName;
    const compactCellClassName = transactionTableCellClassName;
    const compactFocusCellClassName = transactionTableFocusCellClassName;
    const compactSelectClassName = transactionTableSelectInputClassName;
    const compactNumberInputClassName = transactionTableNumberInputClassName;

    const { data: itemPriceList } = useGetItemPriceListQuery({ params });
    const catalogItems = itemList?.data || [];
    const catalogPriceRows = itemPriceList?.data || [];
    const { showSize, showColor } = getCatalogColumnVisibility(catalogItems, catalogPriceRows);

    const findSelectedItem = (itemId) => catalogItems.find((item) => String(item.id) === String(itemId));
    const isLegacyRow = (row) => isLegacyCatalogItem(catalogItems, row?.itemId);
    const rowRequiresSize = (row) => itemUsesSize(catalogItems, catalogPriceRows, row?.itemId);
    const rowRequiresColor = (row) => itemUsesColor(catalogItems, catalogPriceRows, row?.itemId);
    const isSizeReady = (row) => !rowRequiresSize(row) || Boolean(row.itemId);
    const isColorReady = (row) => !rowRequiresColor(row) || Boolean(rowRequiresSize(row) ? row.sizeId : row.itemId);
    const isUomReady = (row) => {
        if (rowRequiresColor(row)) return Boolean(row.colorId);
        if (rowRequiresSize(row)) return Boolean(row.sizeId);
        return Boolean(row.itemId);
    };

    const getLineTotals = (line) => {
        const quantity = Math.max(0, Number(line.qty));
        const unitPrice = Math.max(0, Number(line.price));
        const taxRate = Number(line.tax) || 0;
        const taxMethod = line.taxMethod || "Inclusive";

        const grossAmount = quantity * unitPrice;
        let discountedAmount = grossAmount;

        if (taxMethod === "Inclusive" && taxRate > 0) {
            const subTotal = discountedAmount / (1 + taxRate / 100);
            const taxTotal = discountedAmount - subTotal;
            return { subTotal, taxTotal, total: discountedAmount };
        }

        const subTotal = discountedAmount;
        const taxTotal = subTotal * (taxRate / 100);
        return { subTotal, taxTotal, total: subTotal + taxTotal };
    };

    const handleInputChange = (value, index, field, item) => {
        const newBlend = structuredClone(deliveryItems);
        if (field === "itemId") {
            const selectedItem = findSelectedItem(value);
            if (selectedItem) {
                newBlend[index]["sectionId"] = selectedItem.sectionId;
                newBlend[index]["hsnId"] = selectedItem.hsnId;
                if (!itemUsesSize(catalogItems, catalogPriceRows, selectedItem.id)) {
                    newBlend[index]["sizeId"] = "";
                }
                if (!itemUsesColor(catalogItems, catalogPriceRows, selectedItem.id)) {
                    newBlend[index]["colorId"] = "";
                }
                const selectedHsn = hsnList?.data?.find(hsn => parseInt(hsn.id) === parseInt(selectedItem.hsnId));
                newBlend[index]["tax"] = selectedHsn?.tax || 0;
                newBlend[index]["taxMethod"] = "Inclusive";
                newBlend[index]["barcodeType"] = "REGULAR";
            }
        }

        if (field === "hsnId") {
            const selectedHsn = hsnList?.data?.find(hsn => parseInt(hsn.id) === parseInt(value));
            newBlend[index]["tax"] = selectedHsn?.tax || 0;
        }

        if (field === "itemId" || field === "sizeId" || field === "colorId") {
            const currentItem = field === "itemId" ? value : newBlend[index].itemId;
            const currentSize = field === "sizeId" ? value : newBlend[index].sizeId;
            const currentColor = field === "colorId" ? value : newBlend[index].colorId;
            const requiresSize = itemUsesSize(catalogItems, catalogPriceRows, currentItem);
            const requiresColor = itemUsesColor(catalogItems, catalogPriceRows, currentItem);

            if (!requiresSize || currentSize || isLegacyCatalogItem(catalogItems, currentItem)) {
                const foundPrice = resolveSellablePriceRow(
                    catalogItems,
                    catalogPriceRows,
                    currentItem,
                    currentSize,
                    requiresColor ? currentColor : ""
                );

                if (foundPrice) {
                    newBlend[index]["price"] = foundPrice.salesPrice;
                } else if (field === "itemId") {
                    newBlend[index]["price"] = 0;
                }
            }
        }

        if (field === "qty") {
            if (parseFloat(item?.balanceQty || 0) < parseFloat(value || 0)) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Return Quantity cannot be greater than Balance Quantity",
                });
                return
            }
        }

        newBlend[index][field] = value;
        setDeliveryItems(newBlend);
    };

    useEffect(() => {
        const length = standardTransactionPlaceholderRowCount;
        if (deliveryItems?.length >= length) return;
        setDeliveryItems((prev) => {
            let newArray = Array.from({ length: length - prev.length }, (i) => {
                return {
                    itemId: "",
                    qty: "0.00",
                    tax: "0",
                    colorId: "",
                    uomId: "",
                    price: "0.00",
                    discountValue: "0.00",
                    discountType: "",
                    noOfBags: "0",
                    weightPerBag: "0.00",
                    id: '',
                    poItemsId: "",
                    taxMethod: "Inclusive",
                    barcodeType: "REGULAR"
                };
            });
            return [...prev, ...newArray];
        });
    }, [transType, setDeliveryItems, deliveryItems]);

    const addNewRow = () => {
        const newRow = {
            itemId: "",
            qty: "",
            tax: "0",
            colorId: "",
            uomId: "",
            price: "",
            discountTypes: "",
            discountValue: "0.00",
            id: '',
            poItemsId: "",
            taxMethod: "Inclusive",
            barcodeType: "REGULAR"
        };
        setDeliveryItems([...deliveryItems, newRow]);
    };

    const handleDeleteRow = (id) => {
        setDeliveryItems((prev) =>
            prev.filter((row, index) => index !== parseInt(id))
        );
    };

    const handleDeleteAllRows = () => {
        setDeliveryItems([]);
    };

    const { data: yarnList } = useGetYarnMasterQuery({ params });
    const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
    const { data: colorList } = useGetColorMasterQuery({ params: { ...params, isGrey: greyFilter ? true : undefined }, });
    const { data: hsnList } = useGetHsnMasterQuery({ params });

    const itemOptions = catalogItems?.filter(i => i.active)?.map((item) => ({
        value: item.id,
        label: item?.name || "",
    })) || [];

    const hsnOptions = hsnList?.data?.filter(i => i.active)?.map((item) => ({
        value: item.id,
        label: item?.name || "",
    })) || [];

    const uomOptions = uomList?.data?.filter(item => item.active)?.map((item) => ({
        value: item.id,
        label: item.name || "",
    })) || [];

    const taxMethodOptions = [
        { value: "Inclusive", label: "Inclusive" },
        { value: "Exclusive", label: "Exclusive" },
    ];

    const dispatch = useDispatch();

    return (
        <>
            <TransactionLineItemsSection
                title={title}
                panelClassName="h-full min-h-0"
                contentClassName="min-h-0 overflow-hidden rounded-md border border-slate-200 !py-0"
            >
                <div className="h-full overflow-x-auto overflow-y-auto">
                    <table className={transactionTableClassName}>
                        <thead className={transactionTableHeadClassName}>
                            <tr>
                                <th className={`${compactHeaderCellClassName} w-12`}>S.No</th>
                                <th className={`${compactHeaderCellClassName} w-52`}>Item</th>
                                {showSize && (
                                    <th className={`${compactHeaderCellClassName} w-16`}>Size</th>
                                )}
                                {showColor && (
                                    <th className={`${compactHeaderCellClassName} w-32`}>Color</th>
                                )}
                                <th className={`${compactHeaderCellClassName} w-20`}>Hsn</th>
                                <th className={`${compactHeaderCellClassName} w-12`}>UOM</th>
                                <th className={`${compactHeaderCellClassName} w-16`}>Balance Qty</th>
                                <th className={`${compactHeaderCellClassName} w-16`}>Return Qty</th>
                                <th className={`${compactHeaderCellClassName} w-16`}>Price</th>
                                <th className={`${compactHeaderCellClassName} w-24`}>Barcode Type</th>
                                <th className={`${compactHeaderCellClassName} w-20`}>Tax Type</th>
                                <th className={`${compactHeaderCellClassName} w-10`}>Tax (%)</th>
                                <th className={`${compactHeaderCellClassName} w-16`}>Net Amount</th>
                                <th className={`${compactHeaderCellClassName} w-7`}></th>
                            </tr>
                        </thead>

                        <tbody>
                            {(deliveryItems ? deliveryItems : [])?.map((row, index) => {
                                const { total } = getLineTotals(row);
                                const selectedItemData = catalogItems.find(i => i.id === row.itemId);
                                const isLegacy = selectedItemData?.isLegacy;
                                const priceList = selectedItemData?.ItemPriceList || [];
                                const currentPriceEntry = isLegacy
                                    ? priceList[0]
                                    : priceList.find(p => String(p.sizeId) === String(row.sizeId) && String(p.colorId) === String(row.colorId));
                                const availableBarcodes = currentPriceEntry?.ItemBarcodes || [];

                                return (
                                    <tr
                                        key={index}
                                        className={`${transactionTableRowClassName} ${contextMenu && contextMenu.rowId === index ? "!bg-blue-200" : (index % 2 === 0 ? "bg-white" : "bg-gray-100")} `} onContextMenu={(e) => {
                                            if (!readOnly) {
                                                handleRightClick(e, index, type);
                                            }
                                        }}
                                    >
                                        <td className={transactionTableIndexCellClassName}>{index + 1}</td>
                                        <td className={compactFocusCellClassName}>
                                            <SearchableTableCellSelect
                                                value={row.itemId}
                                                options={itemOptions}
                                                disabled={readOnly || true}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "itemId")}
                                                addNewModalWidth="w-[90%] h-[95%]"
                                                childComponent={ItemMaster}
                                                addNewLabel="+ Add New Item"
                                                handlers={handlers}
                                                movedToNextSaveNewRef={movedToNextSaveNewRef}
                                            />
                                        </td>

                                        {showSize && (
                                            <td className={compactFocusCellClassName}>
                                                <SearchableTableCellSelect
                                                    value={row.sizeId}
                                                    options={getCatalogSizeOptions(catalogItems, catalogPriceRows, sizeList?.data, row?.itemId)?.map((item) => ({
                                                        value: item.id,
                                                        label: item?.name || "",
                                                    })) || []}
                                                    disabled={readOnly || !isSizeReady(row) || true}
                                                    onChange={(nextValue) => handleInputChange(nextValue, index, "sizeId")}
                                                />
                                            </td>
                                        )}

                                        {showColor && (
                                            <td className={compactFocusCellClassName}>
                                                <SearchableTableCellSelect
                                                    value={row.colorId}
                                                    options={getCatalogColorOptions(catalogItems, catalogPriceRows, colorList?.data, row?.itemId, row?.sizeId)?.map((item) => ({
                                                        value: item.id,
                                                        label: item?.name || "",
                                                    })) || []}
                                                    disabled={readOnly || !isColorReady(row) || true}
                                                    onChange={(nextValue) => handleInputChange(nextValue, index, "colorId")}
                                                />
                                            </td>
                                        )}

                                        <td className={compactFocusCellClassName}>
                                            <SearchableTableCellSelect
                                                value={row.hsnId}
                                                options={hsnOptions}
                                                disabled={readOnly || !row.itemId || true}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "hsnId")}
                                            />
                                        </td>

                                        <td className={`${compactFocusCellClassName} w-40`}>
                                            <SearchableTableCellSelect
                                                value={row.uomId}
                                                options={uomOptions}
                                                disabled={readOnly || !isUomReady(row)}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "uomId")}
                                            />
                                        </td>

                                        <td className={`${compactFocusCellClassName} w-40 text-right`}>
                                            {parseFloat(row?.balanceQty || 0).toFixed(2)}
                                        </td>

                                        <td className={`${compactFocusCellClassName} w-40 text-right`}>
                                            <input
                                                onKeyDown={e => {
                                                    if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                    if (e.key === "Delete") { handleInputChange("0.000", index, "qty", row) }
                                                }}
                                                min={"0"}
                                                type="number"
                                                className={compactNumberInputClassName}
                                                onFocus={(e) => e.target.select()}
                                                value={row?.qty}
                                                disabled={readOnly || !row.uomId}
                                                onChange={(e) =>
                                                    handleInputChange(e.target.value, index, "qty", row)
                                                }
                                                onBlur={(e) => {
                                                    handleInputChange(parseFloat(e.target.value).toFixed(2), index, "qty", row);
                                                }
                                                }
                                            />
                                        </td>

                                        <td className={`${compactFocusCellClassName} w-40 text-right`}>
                                            <input
                                                onKeyDown={e => {
                                                    if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                    if (e.key === "Delete") { handleInputChange("0.00", index, "price") }
                                                }}
                                                min={"0"}
                                                type="number"
                                                className={compactNumberInputClassName}
                                                onFocus={(e) => e.target.select()}
                                                value={(!row.price) ? 0 : row.price}
                                                disabled={readOnly || !row.qty || true}
                                                onChange={(e) =>
                                                    handleInputChange(e.target.value, index, "price")
                                                }
                                                onBlur={(e) => {
                                                    handleInputChange(parseFloat(e.target.value).toFixed(2), index, "price");
                                                }
                                                }
                                            />
                                        </td>

                                        <td className={`${compactCellClassName} px-1 text-[10px]`}>
                                            <select
                                                className="h-full w-full rounded-none border-0 bg-transparent px-1 py-0 shadow-none outline-none focus:bg-transparent focus:outline-none"
                                                value={row.barcodeType || "REGULAR"}
                                                onChange={(e) => handleInputChange(e.target.value, index, "barcodeType")}
                                                disabled={readOnly || true}
                                            >
                                                {availableBarcodes.length > 0 ? (
                                                    availableBarcodes.map((b) => (
                                                        <option key={b.barcodeType} value={b.barcodeType}>
                                                            {b.barcodeType}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="REGULAR">REGULAR</option>
                                                )}
                                            </select>
                                        </td>

                                        <td className={compactFocusCellClassName}>
                                            <SearchableTableCellSelect
                                                value={row.taxMethod}
                                                options={taxMethodOptions}
                                                disabled={readOnly || true}
                                                onChange={(nextValue) => handleInputChange(nextValue, index, "taxMethod")}
                                            />
                                        </td>
                                        <td className={`${compactCellClassName} w-40 text-right`}>
                                            <input
                                                min="0" type="number"
                                                className={compactNumberInputClassName}
                                                onFocus={e => e.target.select()}
                                                value={(!row.taxPercent) ? 0 : row.taxPercent}
                                                disabled={true}
                                                onChange={e => handleInputChange(e.target.value, index, "taxPercent")}
                                                onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(3), index, "taxPercent")}
                                            />
                                        </td>

                                        <td className={`${compactCellClassName} w-40 text-right px-2`}>
                                            {(total).toFixed(2)}
                                        </td>

                                        <td className="w-16 px-1 py-1 text-center">
                                            <button
                                                onClick={() => addNewRow(index)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        if (index === deliveryItems.length - 1) {
                                                            addNewRow(index);
                                                        }
                                                    }
                                                }}
                                                className="h-full w-full rounded-none bg-blue-50 py-0"
                                            >
                                                +
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {contextMenu && contextMenu.type === type && (
                        <div
                            style={{
                                position: "absolute",
                                top: `${contextMenu.mouseY - 220}px`,
                                left: `${contextMenu.mouseX - 30}px`,
                                boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                                padding: "8px",
                                borderRadius: "4px",
                                zIndex: 1000,
                            }}
                            className="bg-gray-100"
                            onMouseLeave={handleCloseContextMenu}
                        >
                            <div className="flex flex-col gap-1">
                                <button
                                    className=" text-black text-[12px] text-left rounded px-1"
                                    onClick={() => {
                                        handleDeleteRow(contextMenu.rowId);
                                        handleCloseContextMenu();
                                    }}
                                >
                                    Delete
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
                </div>
            </TransactionLineItemsSection>
        </>
    );
};

export default SalesReturnItems;
