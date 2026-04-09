import { useEffect, useState } from "react";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { useDispatch, useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { setLastTab, setOpenPartyModal } from "../../../redux/features/openModel";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
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

const SalesDeliveryItems = ({
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
    taxMethod,
    setTaxMethod,
    isHeaderOpen,
    itemPriceList,
    priceTemplateList,
    restrictSourceLineEdits = false,
}) => {
    const compactHeaderCellClassName = transactionTableHeaderCellClassName;
    const compactCellClassName = transactionTableCellClassName;
    const compactFocusCellClassName = transactionTableFocusCellClassName;
    const compactSelectClassName = transactionTableSelectInputClassName;
    const compactNumberInputClassName = transactionTableNumberInputClassName;
    const compactDropdownClassName = "h-full w-full max-w-none rounded-none border-0 bg-transparent px-1 py-0 text-[10px] shadow-none outline-none focus:bg-transparent focus:outline-none";

    const [currentSelectedLotGrid, setCurrentSelectedLotGrid] = useState(false);
    const catalogItems = itemList?.data || [];
    const catalogPriceRows = itemPriceList?.data || [];
    const { showSize, showColor } = getCatalogColumnVisibility(catalogItems, catalogPriceRows);

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
        const newBlend = structuredClone(deliveryItems);
        if (field === "itemId") {
            const selectedItem = catalogItems?.find(item => String(item.id) === String(value));
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
                newBlend[index]["taxPercent"] = selectedHsn?.tax || 0;
                newBlend[index]["taxMethod"] = newBlend[index]["taxMethod"] || "Inclusive";
            } else {
                newBlend[index]["taxMethod"] = "";
            }
        }

        if (field === "hsnId") {
            const selectedHsn = hsnList?.data?.find(hsn => parseInt(hsn.id) === parseInt(value));
            newBlend[index]["taxPercent"] = selectedHsn?.tax || 0;
        }

        if (field === "itemId" || field === "sizeId" || field === "colorId" || field === "qty") {
            const currentItem = field === "itemId" ? value : newBlend[index].itemId;
            const currentSize = field === "sizeId" ? value : newBlend[index].sizeId;
            const currentColor = field === "colorId" ? value : newBlend[index].colorId;
            const currentQty = field === "qty" ? value : newBlend[index].qty;
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

        newBlend[index][field] = value;
        setDeliveryItems(newBlend);
    };

    useEffect(() => {
        if (id) return;
        if (restrictSourceLineEdits) return;
        const length = standardTransactionPlaceholderRowCount;
        if (deliveryItems?.length >= length) return;
        setDeliveryItems((prev) => {
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
    }, [transType, setDeliveryItems, deliveryItems, isHeaderOpen, id, restrictSourceLineEdits]);

    const addNewRow = () => {
        if (restrictSourceLineEdits) return;
        setDeliveryItems([...deliveryItems, {
            itemId: "", qty: "", tax: "0", colorId: "", uomId: "",
            price: "", discountTypes: "", discountValue: "0.00", id: '', poItemsId: "", taxMethod: ""
        }]);
    };

    const handleDeleteRow = (id) => {
        setDeliveryItems(rows => rows.filter((_, index) => index !== parseInt(id)));
    };

    const handleDeleteAllRows = () => {
        setDeliveryItems(prevRows => prevRows.length <= 1 ? prevRows : [prevRows[0]]);
    };

    const activeTab = useSelector(state => state.openTabs.tabs.find(tab => tab.active).name);

    const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
    const { data: colorList } = useGetColorMasterQuery({ params: { ...params, isGrey: greyFilter ? true : undefined } });
    const { data: hsnList } = useGetHsnMasterQuery({ params });
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
                                    <th className={`${compactHeaderCellClassName} w-52`}>Item</th>
                                    {showSize && <th className={`${compactHeaderCellClassName} w-16`}>Size</th>}
                                    {showColor && <th className={`${compactHeaderCellClassName} w-32`}>Color</th>}
                                    <th className={`${compactHeaderCellClassName} w-20`}>Hsn</th>
                                    <th className={`${compactHeaderCellClassName} w-12`}>UOM</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Quantity</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Price</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Price Type</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Discount Type</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Discount</th>
                                    <th className={`${compactHeaderCellClassName} w-20`}>Tax Type</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Tax %</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Net Amount</th>
                                    <th className={`${compactHeaderCellClassName} w-7`}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(deliveryItems || []).map((row, index) => {
                                    const { subTotal, taxTotal, total } = getLineTotals(row);
                                    return (
                                        <tr
                                            key={index}
                                            className={`${transactionTableRowClassName}  ${index % 2 === 0 ? "bg-white" : "bg-gray-100"} `} onContextMenu={(e) => {
                                                if (!readOnly) handleRightClick(e, index, "shiftTimeHrs");
                                            }}
                                        >
                                            <td className={transactionTableIndexCellClassName}>{index + 1}</td>

                                            {/* Item */}
                                            <td className={compactFocusCellClassName}>
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") handleInputChange("", index, "itemId"); }}
                                                    tabIndex="0" disabled={readOnly || restrictSourceLineEdits}
                                                    className={compactSelectClassName}
                                                    value={row.itemId}
                                                    onChange={e => handleInputChange(e.target.value, index, "itemId")}
                                                    onBlur={e => handleInputChange(e.target.value, index, "itemId")}
                                                >
                                                    <option></option>
                                                    {itemList?.data?.map(blend => (
                                                        <option value={blend.id} key={blend.id}>{blend?.name}</option>
                                                    ))}
                                                </select>
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
                                                        disabled={readOnly || restrictSourceLineEdits || !isSizeReady(row) || isLegacyRow(row)}
                                                    >
                                                        <option></option>
                                                        {(isLegacyRow(row) ? [] : getCatalogSizeOptions(catalogItems, catalogPriceRows, sizeList?.data, row?.itemId))?.map(blend => (
                                                            <option value={blend.id} key={blend.id}>{blend?.name}</option>
                                                        ))}
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
                                                        disabled={readOnly || restrictSourceLineEdits || !isColorReady(row) || isLegacyRow(row)}
                                                    >
                                                        <option hidden></option>
                                                        {(isLegacyRow(row) ? [] : getCatalogColorOptions(catalogItems, catalogPriceRows, colorList?.data, row?.itemId, row?.sizeId))?.map(blend => (
                                                            <option value={blend.id} key={blend.id}>{blend?.name}</option>
                                                        ))}
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
                                                    disabled={readOnly || restrictSourceLineEdits || !row.itemId}
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
                                                    disabled={readOnly || restrictSourceLineEdits || !isUomReady(row)}
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

                                            {/* Price */}
                                            <td className={`${compactFocusCellClassName} w-40 text-right relative`}>
                                                <input
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                                                        if (e.key === "Delete") handleInputChange("0.00", index, "price");
                                                    }}
                                                    min="0" type="number"
                                                    className={compactNumberInputClassName}
                                                    onFocus={e => e.target.select()}
                                                    value={(!row.price) ? 0 : row.price}
                                                    disabled={readOnly || restrictSourceLineEdits || !row.qty}
                                                    onChange={e => handleInputChange(e.target.value, index, "price")}
                                                    onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(3), index, "price")}
                                                />
                                            </td>

                                            {/* Price Type Badge */}
                                            <td className={`${compactCellClassName} px-1 text-[10px] font-bold leading-none ${row.priceType === "BulkOfferPrice" ? "bg-green-100 text-green-800 border border-green-200" :
                                                row.priceType === "offerPrice" ? "bg-indigo-100 text-indigo-800 border border-indigo-200" :
                                                    row.priceType === "SalesPrice" ? "bg-blue-100 text-blue-800 border border-blue-200" : ""}`}>
                                                {row.priceType}
                                            </td>

                                            {/* Discount Type */}
                                            <td className={`${compactFocusCellClassName} w-40 text-right`}>
                                                <select
                                                    className={compactDropdownClassName}
                                                    value={row.discountType}
                                                    onChange={e => handleInputChange(e.target.value, index, "discountType")}
                                                    disabled={readOnly || restrictSourceLineEdits}
                                                >
                                                    <option value=""></option>
                                                    <option value="Flat">Flat</option>
                                                    <option value="Percentage">Percentage</option>
                                                </select>
                                            </td>

                                            {/* Discount Value */}
                                            <td className={`${compactFocusCellClassName} w-40 text-right`}>
                                                <input
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                                                        if (e.key === "Delete") handleInputChange("0.00", index, "discountValue");
                                                    }}
                                                    min="0" type="number"
                                                    className={compactNumberInputClassName}
                                                    onFocus={e => e.target.select()}
                                                    value={(!row.discountValue) ? 0 : row.discountValue}
                                                    disabled={readOnly || restrictSourceLineEdits || !row.qty}
                                                    onChange={e => handleInputChange(e.target.value, index, "discountValue")}
                                                    onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(3), index, "discountValue")}
                                                />
                                            </td>

                                            {/* Tax Method */}
                                            <td className={compactFocusCellClassName}>
                                                <select
                                                    className={compactDropdownClassName}
                                                    value={row.itemId ? (row.taxMethod || "Inclusive") : (row.taxMethod || "")}
                                                    onChange={e => handleInputChange(e.target.value, index, "taxMethod")}
                                                    disabled={readOnly || restrictSourceLineEdits}
                                                >
                                                    <option value=""></option>
                                                    <option value="Inclusive">Inclusive</option>
                                                    <option value="Exclusive">Exclusive</option>
                                                </select>
                                            </td>

                                            {/* Tax % */}
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

                                            {/* Net Amount */}
                                            <td className={`${compactCellClassName} w-40 text-right`}>
                                                {total.toFixed(2)}
                                            </td>

                                            {/* Add Row on Enter */}
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

                        {contextMenu && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: `${contextMenu.mouseY - 50}px`,
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

export default SalesDeliveryItems;
