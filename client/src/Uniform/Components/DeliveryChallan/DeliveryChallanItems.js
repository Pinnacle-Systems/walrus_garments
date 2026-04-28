import { useEffect, useState } from "react";
import { DropdownInputNew } from "../../../Inputs";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { toast } from "react-toastify";
import { getItemVariantColorOptions, getItemVariantSizeOptions, getStockMaintenanceConfig } from "../../../Utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { setLastTab, setOpenPartyModal } from "../../../redux/features/openModel";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";
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
import {
    getCatalogColorOptions,
    getCatalogColumnVisibility,
    getCatalogSizeOptions,
    isLegacyCatalogItem,
    itemUsesColor,
    itemUsesSize,
    resolveSellablePriceRow,
} from "../../../Utils/salesCatalogRules";

const DeliveryChallanItems = ({
    id,
    transType,
    invoiceItems,
    setInvoiceItems,
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
    taxMethod,
    setTaxMethod,
    isHeaderOpen,
    itemPriceList,
    priceTemplateList,
    stockReportControlData
}) => {
    const compactHeaderCellClassName = transactionTableHeaderCellClassName;
    const compactCellClassName = transactionTableCellClassName;
    const compactFocusCellClassName = transactionTableFocusCellClassName;
    const compactSelectClassName = transactionTableSelectInputClassName;
    const compactNumberInputClassName = transactionTableNumberInputClassName;
    const compactDropdownClassName = "h-full w-full max-w-none rounded-none border-0 bg-transparent px-1 py-0 text-[10px] shadow-none outline-none focus:bg-transparent focus:outline-none";

    const stockControldata = stockReportControlData?.data?.[0]

    const getBarcodeFromList = (itemId, sizeId, colorId) => {
        if (!itemPriceList?.data || !itemId) return null;
        const itemRows = itemPriceList?.data?.filter(item => String(item.itemId) === String(itemId));
        if (!itemRows?.length) return null;

        if (!sizeId) {
            return itemRows.find(item => !item.sizeId && !item.colorId) || itemRows[0];
        }

        if (!colorId) {
            return itemRows.find(item =>
                String(item.sizeId) === String(sizeId) && !item.colorId
            ) || itemRows.find(item => String(item.sizeId) === String(sizeId));
        }

        return itemRows.find(item =>
            String(item.sizeId) === String(sizeId) && String(item.colorId) === String(colorId)
        ) || null;
    };

    const getPriceFromTemplate = (itemId, qty) => {
        if (!priceTemplateList?.data || !itemId || !qty) return null;
        const numericQty = parseFloat(qty);
        const template = priceTemplateList?.data?.find(t => String(t.itemId) === String(itemId));
        if (!template?.PriceTemplateDetails) return null;
        const detail = template.PriceTemplateDetails.find(d => {
            const min = parseFloat(d.minQty || 0);
            const maxVal = d.maxQty;
            const isInfinite = typeof maxVal === 'string' && maxVal.includes('& Above');
            if (isInfinite) return numericQty >= min;
            const max = parseFloat(maxVal || 0);
            return numericQty >= min && numericQty <= max;
        });
        return detail || null;
    };

    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(invoiceItems);
        let currentFieldVal = value;

        if (field === "itemId") {
            if (String(value).includes("-")) {
                const parts = String(value).split("-");
                const [actualItemId, actualSizeId, actualColorId] = parts;
                newBlend[index]["itemId"] = actualItemId;
                newBlend[index]["sizeId"] = actualSizeId;
                newBlend[index]["colorId"] = actualColorId;
                currentFieldVal = actualItemId;
            } else {
                newBlend[index]["itemId"] = value;
            }

            const selectedItem = catalogItems?.find(item => String(item.id) === String(newBlend[index].itemId));
            if (selectedItem) {
                newBlend[index]["sectionId"] = selectedItem.sectionId;
                newBlend[index]["hsnId"] = selectedItem.hsnId;
                if (!itemUsesSize(catalogItems, catalogPriceRows, selectedItem.id) && !selectedItem.isLegacy) {
                    newBlend[index]["sizeId"] = "";
                }
                if (!itemUsesColor(catalogItems, catalogPriceRows, selectedItem.id) && !selectedItem.isLegacy) {
                    newBlend[index]["colorId"] = "";
                }
                const selectedHsn = hsnList?.data?.find(hsn => parseInt(hsn.id) === parseInt(selectedItem.hsnId));
                newBlend[index]["taxPercent"] = selectedHsn?.tax || 0;
                newBlend[index]["taxMethod"] = newBlend[index]["taxMethod"] || "Inclusive";
            } else {
                newBlend[index]["taxMethod"] = "";
            }
        } else {
            newBlend[index][field] = value;
        }

        if (field === "itemId" || field === "sizeId" || field === "colorId" || field === "qty") {
            const currentItem = newBlend[index].itemId;
            const currentSize = newBlend[index].sizeId;
            const currentColor = newBlend[index].colorId;
            const currentQty = newBlend[index].qty;

            const isLegacySelection = isLegacyCatalogItem(catalogItems, currentItem);
            const requiresSize = itemUsesSize(catalogItems, catalogPriceRows, currentItem);
            const requiresColor = itemUsesColor(catalogItems, catalogPriceRows, currentItem);

            if (currentItem) {
                const templateDetail = getPriceFromTemplate(currentItem, currentQty);
                if (templateDetail) {
                    newBlend[index]["price"] = templateDetail.price;
                    newBlend[index]["priceType"] = "BulkOfferPrice";
                } else if (!requiresSize || currentSize || isLegacySelection) {
                    const foundPrice = resolveSellablePriceRow(
                        catalogItems,
                        catalogPriceRows,
                        currentItem,
                        currentSize,
                        requiresColor ? currentColor : ""
                    );
                    if (foundPrice) {
                        const numericQty = parseFloat(currentQty || 0);
                        if (numericQty > 6 && foundPrice.offerPrice) {
                            newBlend[index]["price"] = foundPrice.offerPrice;
                            newBlend[index]["priceType"] = "offerPrice";
                        } else {
                            newBlend[index]["price"] = foundPrice.salesPrice;
                            newBlend[index]["priceType"] = "SalesPrice";
                        }
                    } else {
                        newBlend[index]["priceType"] = null;
                    }
                } else {
                    newBlend[index]["priceType"] = null;
                }
            }
        }

        setInvoiceItems(newBlend);
    };

    useEffect(() => {
        if (id) return;
        const length = standardTransactionPlaceholderRowCount;
        if (invoiceItems?.length >= length) return;
        setInvoiceItems((prev) => {
            let newArray = Array.from({ length: length - prev.length }, () => ({
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
                taxMethod: ""
            }));
            return [...prev, ...newArray];
        });
    }, [transType, setInvoiceItems, invoiceItems, isHeaderOpen]);

    const addNewRow = () => {
        setInvoiceItems([...invoiceItems, {
            itemId: "", qty: "", tax: "0", colorId: "", uomId: "",
            price: "", discountTypes: "", discountValue: "0.00", id: '', poItemsId: "", taxMethod: ""
        }]);
    };

    const handleDeleteRow = (rowId) => {

        setInvoiceItems(rows => rows.filter((_, index) => index !== parseInt(rowId)));
    };

    const handleDeleteAllRows = () => {
        setInvoiceItems(prevRows => prevRows.length <= 1 ? prevRows : [prevRows[0]]);
    };

    const activeTab = useSelector(state => state.openTabs.tabs.find(tab => tab.active).name);

    const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
    const { data: colorList } = useGetColorMasterQuery({ params: { ...params, isGrey: greyFilter ? true : undefined } });
    const { data: hsnList } = useGetHsnMasterQuery({ params });
    const catalogItems = itemList?.data || [];
    const catalogPriceRows = itemPriceList?.data || [];
    const { showSize, showColor } = getCatalogColumnVisibility(catalogItems, catalogPriceRows);

    const getSelectableItems = () => {
        const items = [];
        const itemMap = new Map(catalogItems.map(item => [String(item.id), item]));
        const sizeMap = new Map((sizeList?.data || []).map(s => [String(s.id), s.name]));
        const colorMap = new Map((colorList?.data || []).map(c => [String(c.id), c.name]));
        const processedLegacyItems = new Set();
        catalogPriceRows.forEach(row => {
            if (!row.sku) return;
            const item = itemMap.get(String(row.itemId));
            if (!item) return;
            if (item.isLegacy) {
                if (processedLegacyItems.has(item.id)) return;
                items.push({
                    value: String(item.id),
                    show: `${item.name}${row.sku ? ` / ${row.sku}` : ""}`,
                    isLegacy: true
                });
                processedLegacyItems.add(item.id);
            } else {
                const sizeName = sizeMap.get(String(row.sizeId)) || "No Size";
                const colorName = colorMap.get(String(row.colorId)) || "No Color";
                items.push({
                    value: `${row.itemId}-${row.sizeId}-${row.colorId}`,
                    show: `${item.name} (${sizeName}) (${colorName}) (${row.sku})`,
                    isLegacy: false
                });
            }
        });
        return items;
    };
    const selectableItems = getSelectableItems();

    const isLegacyRow = (row) => isLegacyCatalogItem(catalogItems, row?.itemId);
    const rowRequiresSize = (row) => itemUsesSize(catalogItems, catalogPriceRows, row?.itemId);
    const rowRequiresColor = (row) => itemUsesColor(catalogItems, catalogPriceRows, row?.itemId);
    const isSizeReady = (row) => Boolean(row.itemId);
    const isColorReady = (row) => Boolean(row.itemId);
    const isUomReady = (row) => {
        if (rowRequiresColor(row)) return Boolean(row.colorId);
        if (rowRequiresSize(row)) return Boolean(row.sizeId);
        return Boolean(row.itemId);
    };

    const dispatch = useDispatch();
    const handleCreateNew = (masterName = "") => {
        dispatch(setOpenPartyModal(true));
        dispatch(setLastTab(activeTab));
        dispatch(push({ name: masterName }));
    };

    const getLineTotals = (line) => {
        const quantity = Math.max(0, Number(line.qty));
        const unitPrice = Math.max(0, Number(line.price));
        const taxRate = Number(line.taxPercent) || 0;
        const linetaxMethod = line.taxMethod;
        const grossAmount = quantity * unitPrice;

        let discountedAmount = grossAmount;
        if (line.discountType === "Percentage") {
            discountedAmount = grossAmount - (grossAmount * (Number(line.discountValue) || 0)) / 100;
        } else if (line.discountType === "Flat") {
            discountedAmount = grossAmount - (Number(line.discountValue) || 0);
        }
        discountedAmount = Math.max(0, discountedAmount);

        if (linetaxMethod === "Inclusive" && taxRate > 0) {
            const subTotal = discountedAmount / (1 + taxRate / 100);
            const taxTotal = discountedAmount - subTotal;
            return { subTotal, taxTotal, total: discountedAmount };
        }
        const subTotal = discountedAmount;
        const taxTotal = subTotal * (taxRate / 100);
        return { subTotal, taxTotal, total: subTotal + taxTotal };
    };

    return (
        <>
            <fieldset className="h-full min-h-0">
                <TransactionLineItemsSection
                    panelClassName="h-full min-h-0"
                    contentClassName="min-h-0 overflow-hidden rounded-md border border-slate-200 !py-0"
                >
                    <div className="h-full overflow-x-auto overflow-y-auto">
                        <table className={transactionTableClassName}>
                            <thead className={transactionTableHeadClassName}>
                                <tr>
                                    <th className={`${compactHeaderCellClassName} w-12`}>S.No</th>
                                    <th className={`${compactHeaderCellClassName} w-52`}>Item / Sku Code</th>
                                    {showSize && <th className={`${compactHeaderCellClassName} w-16`}>Size</th>}
                                    {showColor && <th className={`${compactHeaderCellClassName} w-32`}>Color</th>}
                                    <th className={`${compactHeaderCellClassName} w-20`}>Hsn</th>
                                    <th className={`${compactHeaderCellClassName} w-12`}>UOM</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Quantity</th>
                                    {/* <th className={`${compactHeaderCellClassName} w-16`}>Price</th> */}
                                    {/* <th className={`${compactHeaderCellClassName} w-16`}>Price Type</th> */}
                                    {/* <th className={`${compactHeaderCellClassName} w-16`}>Discount Type</th> */}
                                    {/* <th className={`${compactHeaderCellClassName} w-16`}>Discount</th> */}
                                    {/* <th className={`${compactHeaderCellClassName} w-20`}>Tax Type</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Tax %</th> */}
                                    <th className={`${compactHeaderCellClassName} w-7`}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(invoiceItems || []).map((row, index) => {
                                    const { subTotal, taxTotal, total } = getLineTotals(row);
                                    return (
                                        <tr
                                            key={index}
                                            className={transactionTableRowClassName}
                                            onContextMenu={(e) => {
                                                if (!readOnly) handleRightClick(e, index, "shiftTimeHrs");
                                            }}
                                        >
                                            <td className={transactionTableIndexCellClassName}>{index + 1}</td>

                                            <td className={compactFocusCellClassName}>
                                                <DropdownInputNew
                                                    searchable={true}
                                                    options={selectableItems}
                                                    value={isLegacyRow(row) ? String(row.itemId) : (row.itemId && row.sizeId && row.colorId ? `${row.itemId}-${row.sizeId}-${row.colorId}` : String(row.itemId))}
                                                    setValue={v => handleInputChange(v, index, "itemId")}
                                                    readOnly={readOnly}
                                                    className="w-full !px-1 !py-0.5 !text-[11px] !border-0 !shadow-none"
                                                    width="w-full"
                                                />
                                            </td>

                                            {/* Size */}
                                            {showSize && (
                                                <td className={compactFocusCellClassName}>
                                                    <select
                                                        onKeyDown={e => { if (e.key === "Delete") handleInputChange("", index, "sizeId"); }}
                                                        tabIndex="0"
                                                        className={compactSelectClassName}
                                                        value={row.sizeId}
                                                        onChange={e => handleInputChange(e.target.value, index, "sizeId")}
                                                        onBlur={e => handleInputChange(e.target.value, index, "sizeId")}
                                                        disabled={readOnly || !isSizeReady(row)}
                                                    >
                                                        <option></option>
                                                        {isLegacyRow(row) ? (
                                                            sizeList?.data?.map(s => (
                                                                <option value={s.id} key={s.id}>{s.name}</option>
                                                            ))
                                                        ) : (
                                                            getCatalogSizeOptions(catalogItems, catalogPriceRows, sizeList?.data, row?.itemId)?.map(blend => (
                                                                <option value={blend.id} key={blend.id}>{blend?.name}</option>
                                                            ))
                                                        )}
                                                    </select>
                                                </td>
                                            )}

                                            {/* Color */}
                                            {showColor && (
                                                <td className={compactFocusCellClassName}>
                                                    <select
                                                        onKeyDown={e => { if (e.key === "Delete") handleInputChange("", index, "colorId"); }}
                                                        className={compactSelectClassName}
                                                        value={row.colorId}
                                                        onChange={e => handleInputChange(e.target.value, index, "colorId")}
                                                        onBlur={e => handleInputChange(e.target.value, index, "colorId")}
                                                        disabled={readOnly || !isColorReady(row)}
                                                    >
                                                        <option hidden></option>
                                                        {isLegacyRow(row) ? (
                                                            colorList?.data?.map(c => (
                                                                <option value={c.id} key={c.id}>{c.name}</option>
                                                            ))
                                                        ) : (
                                                            getCatalogColorOptions(catalogItems, catalogPriceRows, colorList?.data, row?.itemId, row?.sizeId)?.map(blend => (
                                                                <option value={blend.id} key={blend.id}>{blend?.name}</option>
                                                            ))
                                                        )}
                                                    </select>
                                                </td>
                                            )}

                                            {/* HSN */}
                                            <td className={compactFocusCellClassName}>
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") handleInputChange("", index, "hsnId"); }}
                                                    className={compactSelectClassName}
                                                    value={row.hsnId}
                                                    onChange={e => handleInputChange(e.target.value, index, "hsnId")}
                                                    onBlur={e => handleInputChange(e.target.value, index, "hsnId")}
                                                    disabled={readOnly || !row.itemId}
                                                >
                                                    <option hidden></option>
                                                    {hsnList?.data?.map(blend => (
                                                        <option value={blend.id} key={blend.id}>{blend?.name}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* UOM */}
                                            <td className={`${compactFocusCellClassName} w-40`}>
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") handleInputChange("", index, "uomId"); }}
                                                    className={compactSelectClassName}
                                                    value={row.uomId}
                                                    onChange={e => handleInputChange(e.target.value, index, "uomId")}
                                                    onBlur={e => handleInputChange(e.target.value, index, "uomId")}
                                                    disabled={readOnly || !isUomReady(row)}
                                                >
                                                    <option hidden></option>
                                                    {(id ? uomList?.data : uomList?.data?.filter(item => item.active))?.map(blend => (
                                                        <option value={blend.id} key={blend.id}>{blend.name}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Qty */}
                                            <td className={`${compactFocusCellClassName} w-40 text-right`}>
                                                <input
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                                                        if (e.key === "Delete") handleInputChange("0.000", index, "qty");
                                                    }}
                                                    min="0" type="number"
                                                    className={compactNumberInputClassName}
                                                    onFocus={e => e.target.select()}
                                                    value={row?.qty}
                                                    disabled={readOnly || !row.uomId}
                                                    onChange={e => handleInputChange(e.target.value, index, "qty")}
                                                    onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty")}
                                                />
                                            </td>



                                            {/* Add Row on Enter */}
                                            <td className="w-16 px-1 py-1 text-center">
                                                <button
                                                    onClick={() => addNewRow(index)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            if (index === saleOrderItems.length - 1) {
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
                            <tfoot className="sticky bottom-0 z-20 border-t border-gray-300 font-bold">
                                <tr>
                                    <td
                                        // colSpan={
                                        //     (stockControldata?.itemWise ? 1 : 0) +
                                        //     (stockControldata?.sizeWise ? 1 : 0) +
                                        //     (stockControldata?.sizeColorWise ? 1 : 0) +
                                        //     4 +
                                        //     (stockReportControlData?.data?.reduce((acc, element) => acc + Object.keys(element)?.filter(k => k.toLowerCase().includes("field") && !!element[k]).length, 0))
                                        // }
                                        colSpan={4}
                                        className="bg-gray-300 px-1 py-1 text-right text-[12px]"
                                    >
                                    </td>
                                    <td
                                        colSpan={2}
                                        className="bg-gray-300 px-1 py-1 text-right text-[12px]"
                                    >
                                        Total:
                                    </td>
                                    <td className="bg-gray-300 px-1 py-1 text-right text-[11px]">
                                        {(invoiceItems || [])?.reduce((acc, curr) => acc + parseFloat(curr?.qty || 0), 0).toFixed(3)}
                                    </td>
                                    <td className="bg-gray-300 px-1 py-1 text-right text-[11px]"></td>
                                </tr>
                            </tfoot>
                        </table>

                        {contextMenu && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: `${contextMenu.mouseY - 220}px`,
                                    left: `${contextMenu.mouseX - 30}px`,
                                    boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                                    padding: "8px", borderRadius: "4px", zIndex: 1000,
                                }}
                                className="bg-gray-100"
                                onMouseLeave={handleCloseContextMenu}
                            >
                                <div className="flex flex-col gap-1">
                                    <button className="text-black text-[12px] text-left rounded px-1"
                                        onClick={() => { handleDeleteRow(contextMenu.rowId); handleCloseContextMenu(); }}>
                                        Delete
                                    </button>
                                    <button className="text-black text-[12px] text-left rounded px-1"
                                        onClick={() => { handleDeleteAllRows(); handleCloseContextMenu(); }}>
                                        Delete All
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </TransactionLineItemsSection>
            </fieldset>
        </>
    );
};

export default DeliveryChallanItems;
