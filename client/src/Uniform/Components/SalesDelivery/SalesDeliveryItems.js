import { useEffect, useState } from "react";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { useDispatch, useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { setLastTab, setOpenPartyModal } from "../../../redux/features/openModel";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
import { useGetUnifiedStockQuery } from "../../../redux/services/StockService";
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
import Swal from "sweetalert2";

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
    movedToNextSaveNewRef,
    handlers,
    convertSaleOrderId,
    storeId,
    branchId
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
    const catalogShowConfig = getCatalogColumnVisibility(catalogItems, catalogPriceRows);

    const { data: storeStockData } = useGetUnifiedStockQuery(
        // Query with storeId when available (scopes to that store);
        // falls back to all branch stock when storeId is not yet selected.
        { params: { storeId: storeId || undefined, branchId } },
        { skip: !branchId }
    );

    // Build size options directly from the stock table for the selected item.
    // This supports items whose stock was recorded with size granularity
    // even though the item master itself may not define size variants.
    const getStockSizeOptions = (itemId) => {
        if (!itemId || !storeStockData?.data) return [];
        const sizeIds = [...new Set(
            storeStockData.data
                .filter(s => String(s.itemId) === String(itemId) && s.sizeId)
                .map(s => String(s.sizeId))
        )];
        return (sizeList?.data || []).filter(sz => sizeIds.includes(String(sz.id)));
    };

    // Whether the item has any stock without a size (the "no size" bucket).
    const itemHasNoSizeStock = (itemId) => {
        if (!itemId || !storeStockData?.data) return false;
        return storeStockData.data.some(
            s => String(s.itemId) === String(itemId) && !s.sizeId
        );
    };

    const getStockColorOptions = (itemId, sizeId) => {
        if (!itemId || !storeStockData?.data) return [];
        // sizeId="none" = user explicitly chose no-size stock
        // sizeId="" or null = no size chosen yet (show nothing to avoid ambiguity)
        // sizeId=<id>  = user chose a specific size
        const noSizeExplicit = sizeId === "none";
        const realSizeId = !noSizeExplicit && sizeId;
        const colorIds = [...new Set(
            storeStockData.data
                .filter(s =>
                    String(s.itemId) === String(itemId) &&
                    s.colorId &&
                    (noSizeExplicit
                        ? !s.sizeId                           // only no-size stock colors
                        : realSizeId
                            ? String(s.sizeId) === String(realSizeId)  // specific size colors
                            : false)                          // nothing selected → no colors
                )
                .map(s => String(s.colorId))
        )];
        return (colorList?.data || []).filter(c => colorIds.includes(String(c.id)));
    };

    // Whether the item has any stock without a color (for the current size context).
    const itemHasNoColorStock = (itemId, sizeId) => {
        if (!itemId || !storeStockData?.data) return false;
        const noSizeExplicit = sizeId === "none";
        const realSizeId = !noSizeExplicit && sizeId;
        return storeStockData.data.some(
            s => String(s.itemId) === String(itemId) &&
                 (noSizeExplicit
                     ? !s.sizeId
                     : realSizeId
                         ? String(s.sizeId) === String(realSizeId)
                         : false) &&
                 !s.colorId
        );
    };

    // Column visibility: show size/color columns if either the item catalog
    // or any stock entry in this store has size/color values.
    const stockHasAnySize = Boolean(storeStockData?.data?.some(s => s.sizeId));
    const stockHasAnyColor = Boolean(storeStockData?.data?.some(s => s.colorId));
    const showSize = catalogShowConfig.showSize || stockHasAnySize;
    const showColor = catalogShowConfig.showColor || stockHasAnyColor;

    // Whether stock for this item has any size granularity (determines if size
    // must be selected before color/UOM becomes available)
    const stockHasSizesForItem = (itemId) => getStockSizeOptions(itemId).length > 0;
    const stockHasColorsForItem = (itemId, sizeId) => getStockColorOptions(itemId, sizeId).length > 0;

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

    const handleInputChange = (value, index, field, item) => {
        const newBlend = structuredClone(deliveryItems);

        if (field === "itemId") {
            const selectedItem = catalogItems?.find(item => String(item.id) === String(value));
            newBlend[index]["sizeId"] = "";
            newBlend[index]["colorId"] = "";
            if (selectedItem) {
                newBlend[index]["sectionId"] = selectedItem.sectionId;
                newBlend[index]["hsnId"] = selectedItem.hsnId;
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

        if (field === "sizeId") {
            // Reset color whenever size changes so it re-filters for the new size
            newBlend[index]["colorId"] = "";
        }

        if (field === "deliveryQty") {
            if (parseFloat(item.balanceQty || 0) < parseFloat(value || 0)) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Delivery Quantity cannot be greater than balance quantity",
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
            let newArray = Array.from({ length: length - prev.length }, () => ({
                itemId: "",
                deliveryQty: "0.00",
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
                taxMethod: "",
                hsnId: ""
            }));
            return [...prev, ...newArray];
        });
    }, [transType, setDeliveryItems, deliveryItems, isHeaderOpen,]);

    const addNewRow = () => {
        if (restrictSourceLineEdits) return;
        setDeliveryItems([...deliveryItems, {
            itemId: "", deliveryQty: "", tax: "0", colorId: "", uomId: "",
            price: "", discountTypes: "", discountValue: "0.00", id: '', poItemsId: "", taxMethod: "",
            hsnId: ""
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
    // For delivery: size/color readiness is driven by stock availability, not just item-master config.
    // Size is ready to select if an item is chosen.
    const isSizeReady = (row) => Boolean(row.itemId);
    // Color is ready after size is selected (if this item has size-granular stock) or just after item.
    const isColorReady = (row) => {
        if (!row.itemId) return false;
        return !stockHasSizesForItem(row.itemId) || Boolean(row.sizeId);
    };
    // UOM is ready after color (if stock has color), after size (if stock has size), or just after item.
    const isUomReady = (row) => {
        if (!row.itemId) return false;
        if (stockHasColorsForItem(row.itemId, row.sizeId)) return Boolean(row.colorId);
        if (stockHasSizesForItem(row.itemId)) return Boolean(row.sizeId);
        return true;
    };

    const dispatch = useDispatch();
    const handleCreateNew = (masterName = "") => {
        dispatch(setOpenPartyModal(true));
        dispatch(setLastTab(activeTab));
        dispatch(push({ name: masterName }));
    };

    const getLineTotals = (line) => {
        const quantity = Math.max(0, Number(line.deliveryQty));
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
        const subTotal = discountedAmount || 0;
        const taxTotal = subTotal * (taxRate / 100 || 0);
        return { subTotal, taxTotal, total: subTotal + taxTotal };
    };

    const itemOptions = (id ? itemList?.data : itemList?.data?.filter(i => i.active) || [])?.map((item) => ({
        value: item.id,
        label: item?.name || "",
    }));



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
                                    <th className={`${compactHeaderCellClassName} w-16`}>Balance Qty</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}><span className="text-red-500">*</span>Delivery Qty</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Price</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Barcode Type</th>

                                    {/*  */}
                                    {/* <th className={`${compactHeaderCellClassName} w-16`}>Discount Type</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Discount</th> */}
                                    <th className={`${compactHeaderCellClassName} w-20`}>Tax Type</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Tax %</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Net Amount</th>
                                    <th className={`${compactHeaderCellClassName} w-7`}></th>
                                </tr>
                            </thead>
                            <tbody>{console.log("deliveryItems", deliveryItems)}
                                {(deliveryItems || []).map((row, index) => {
                                    const { subTotal, taxTotal, total } = getLineTotals(row);
                                    const selectedItemData = itemList?.data?.find(i => i.id === row.itemId);
                                    const isLegacy = row.itemId ? selectedItemData?.isLegacy : true;
                                    const priceList = selectedItemData?.ItemPriceList || [];
                                    const currentPriceEntry = isLegacy
                                        ? priceList[0]
                                        : priceList.find(p => String(p.sizeId) === String(row.sizeId) && String(p.colorId) === String(row.colorId));

                                    const availableBarcodes = currentPriceEntry?.ItemBarcodes || []; return (
                                        <tr
                                            key={index}
                                            className={`${transactionTableRowClassName} ${contextMenu && contextMenu.rowId === index ? "!bg-blue-200" : (index % 2 === 0 ? "bg-white" : "bg-gray-100")} `} onContextMenu={(e) => {
                                                if (!readOnly) handleRightClick(e, index, "shiftTimeHrs");
                                            }}
                                        >
                                            <td className={transactionTableIndexCellClassName}>{index + 1}</td>

                                            {/* Item */}
                                            <td className={compactFocusCellClassName}>

                                                <SearchableTableCellSelect
                                                    value={row.itemId}
                                                    options={itemOptions}
                                                    disabled={readOnly}
                                                    onChange={(nextValue) => handleInputChange(nextValue, index, "itemId")}
                                                    addNewModalWidth="w-[90%] h-[95%]"
                                                    childComponent={ItemMaster}
                                                    addNewLabel="+ Add New Item"

                                                />
                                            </td>

                                            {/* Size */}
                                            {showSize && (
                                                <td className={compactFocusCellClassName}>
                                                    <select
                                                        onKeyDown={e => { if (e.key === "Delete") handleInputChange("", index, "sizeId"); }}
                                                        tabIndex="0"
                                                        className={compactSelectClassName}
                                                        value={row.sizeId || ""}
                                                        onChange={e => handleInputChange(e.target.value, index, "sizeId")}
                                                        onBlur={e => handleInputChange(e.target.value, index, "sizeId")}
                                                        disabled={readOnly || restrictSourceLineEdits || !isSizeReady(row)}
                                                    >
                                                        {/* "No Size" option — represents stock recorded without a size.
                                                            Uses value="none" so state can distinguish "explicitly chosen
                                                            no-size" (truthy) from "nothing selected yet" (falsy ""). */}
                                                        {itemHasNoSizeStock(row.itemId) && (
                                                            <option value="none">— No Size —</option>
                                                        )}
                                                        {getStockSizeOptions(row.itemId)?.map(blend => (
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
                                                        value={row.colorId || ""}
                                                        onChange={e => handleInputChange(e.target.value, index, "colorId")}
                                                        onBlur={e => handleInputChange(e.target.value, index, "colorId")}
                                                        disabled={readOnly || restrictSourceLineEdits || !isColorReady(row)}
                                                    >
                                                        {/* "No Color" option — represents stock recorded without a color.
                                                            Uses value="none" so state can distinguish "explicitly chosen
                                                            no-color" from "nothing selected yet". */}
                                                        {itemHasNoColorStock(row.itemId, row.sizeId) && (
                                                            <option value="none">— No Color —</option>
                                                        )}
                                                        {getStockColorOptions(row.itemId, row.sizeId)?.map(blend => (
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
                                            <td className={`${compactFocusCellClassName} w-40 text-right`}>
                                                {parseFloat(row?.balanceQty || 0).toFixed(2)}

                                            </td>
                                            <td className={`${compactFocusCellClassName} w-40 text-right`}>
                                                <input
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                                                        if (e.key === "Delete") handleInputChange("0.000", index, "deliveryQty");
                                                    }}
                                                    min="0" type="number"
                                                    className={compactNumberInputClassName}
                                                    onFocus={e => e.target.select()}
                                                    value={row?.deliveryQty}
                                                    disabled={readOnly || !row.uomId}
                                                    onChange={e => handleInputChange(e.target.value, index, "deliveryQty", row)}
                                                    onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(2), index, "deliveryQty", row)}
                                                />
                                            </td>

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
                                                    onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(2), index, "price")}
                                                />
                                            </td>
                                            <td className={`${compactCellClassName} px-1 text-[10px]`}>
                                                <select
                                                    className="h-full w-full rounded-none border-0 bg-transparent px-1 py-0 shadow-none outline-none focus:bg-transparent focus:outline-none"
                                                    value={row.barcodeType || "REGULAR"}
                                                    onChange={(e) => handleInputChange(e.target.value, index, "barcodeType")}
                                                >
                                                    {availableBarcodes.length > 0 ? (
                                                        availableBarcodes.map((b) => (
                                                            <option key={b.barcodeType} value={b.barcodeType}>
                                                                {b.barcodeType}
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <>

                                                        </>
                                                    )}
                                                </select>
                                            </td>


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

                                            <td className={`${compactCellClassName} w-40 text-right`}>
                                                {total.toFixed(2)}
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

export default SalesDeliveryItems;
