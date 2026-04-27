import { useEffect, useMemo, useState } from "react";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { setLastTab, setOpenPartyModal } from "../../../redux/features/openModel";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";
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
import { Gift } from "lucide-react";
import { calculateCartWithOffers, getPotentialOffers } from "../../../Utils/offerEngine";
import SearchableTableCellSelect from "../ReusableComponents/SearchableTableCellSelect";
import { ItemMaster } from "../../../Shocks";

const SaleOrderItems = ({
    id,
    transType,
    saleOrderItems,
    setSaleOrderItems,
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
    activeOffers = [],
    selectedOffersByRow = {},
    setSelectedOffersByRow,
    setSelectedItemForOffers,
    setShowItemOfferModal,
    handlers,
    movedToNextSaveNewRef
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

    const findSelectedItem = (itemId) => catalogItems.find((item) => String(item.id) === String(itemId));


    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(saleOrderItems);
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

        if (field === "itemId" || field === "sizeId" || field === "colorId" || field === "qty" || field === "barcodeType") {
            const currentItem = field === "itemId" ? value : newBlend[index].itemId;
            const currentSize = field === "sizeId" ? value : newBlend[index].sizeId;
            const currentColor = field === "colorId" ? value : newBlend[index].colorId;
            const currentQty = field === "qty" ? value : newBlend[index].qty;
            const currentBarcodeType = field === "barcodeType" ? value : (newBlend[index].barcodeType || "REGULAR");
            const isLegacySelection = isLegacyCatalogItem(catalogItems, currentItem);
            const requiresSize = itemUsesSize(catalogItems, catalogPriceRows, currentItem);
            const requiresColor = itemUsesColor(catalogItems, catalogPriceRows, currentItem);

            const selectedItem = catalogItems?.find((i) => i.id === currentItem);

            if (selectedItem) {
                if (selectedItem.isLegacy) {
                    newBlend[index].barcode = selectedItem.ItemPriceList?.[0]?.ItemBarcodes?.find(b => b.barcodeType === currentBarcodeType)?.barcode ||
                        selectedItem.ItemPriceList?.[0]?.barcode ||
                        selectedItem.barcode || "";
                } else {
                    const priceEntry = selectedItem.ItemPriceList?.find(
                        p => String(p.sizeId) === String(currentSize) && String(p.colorId) === String(currentColor)
                    );
                    newBlend[index].barcode = priceEntry?.ItemBarcodes?.find(b => b.barcodeType === currentBarcodeType)?.barcode || "";
                }
            } else {
                newBlend[index].barcode = "";
            }

            if (!requiresSize || currentSize || isLegacySelection) {
                const foundPrice = resolveSellablePriceRow(
                    catalogItems,
                    catalogPriceRows,
                    currentItem,
                    currentSize,
                    requiresColor ? currentColor : ""
                );

                if (foundPrice) {
                    newBlend[index]["price"] = foundPrice.salesPrice;
                    newBlend[index]["priceType"] = "SalesPrice";
                } else {
                    newBlend[index]["price"] = 0;
                    newBlend[index]["priceType"] = null;
                }
            } else {
                newBlend[index]["priceType"] = null;
            }
        }

        newBlend[index][field] = value;
        setSaleOrderItems(newBlend);
    };



    useEffect(() => {
        const length = standardTransactionPlaceholderRowCount
        const currentLength = saleOrderItems?.length || 0;
        if (currentLength >= length) return;

        setSaleOrderItems((prev) => {
            const actualPrev = prev || [];
            if (actualPrev.length >= length) return actualPrev;

            const padding = Array.from({ length: length - actualPrev.length }, () => ({
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
                taxMethod: "",
                barcode: "",
                barcodeType: "REGULAR"
            }));
            return [...actualPrev, ...padding];
        });
    }, [transType, setSaleOrderItems, saleOrderItems?.length, isHeaderOpen, id]);
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
            taxMethod: "",
            barcode: "",
            barcodeType: "REGULAR"
        };
        setSaleOrderItems([...saleOrderItems, newRow]);
    };

    const handleDeleteRow = (id) => {
        setSaleOrderItems(rows => rows.filter((_, index) => index !== parseInt(id)));
    };

    const handleDeleteAllRows = () => {
        setSaleOrderItems(prevRows => prevRows.length <= 1 ? prevRows : [prevRows[0]]);
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

    const potentialOffers = useMemo(() => getPotentialOffers(activeOffers, saleOrderItems || []), [activeOffers, saleOrderItems]);
    const { cartWithOffers: rawItemsWithOffers } = useMemo(() => calculateCartWithOffers(saleOrderItems || [], selectedOffersByRow, potentialOffers, activeOffers), [saleOrderItems, selectedOffersByRow, potentialOffers, activeOffers]);

    const saleOrderItemsWithOffers = useMemo(() => {
        let items = [...(rawItemsWithOffers || [])];
        const length = standardTransactionPlaceholderRowCount;
        if (items.length < length) {
            const padding = Array.from({ length: length - items.length }, () => ({
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
                taxMethod: "",
                barcode: "",
                barcodeType: "REGULAR"
            }));
            return [...items, ...padding];
        }
        return items;
    }, [rawItemsWithOffers]);

    console.log(saleOrderItemsWithOffers, "saleOrderItemsWithOffers")


    // useEffect(() => {

    //     if (saleOrderItemsWithOffers.length > 0) {
    //         setSaleOrderItems(saleOrderItemsWithOffers)
    //     }
    // }, [saleOrderItemsWithOffers])

    const itemOptions = (id ? itemList?.data : itemList?.data?.filter(i => i.active) || [])?.map((item) => ({
        value: item.id,
        label: item?.name || "",
    }));

    const hsnOptions = (id ? hsnList?.data : hsnList?.data?.filter(i => i.active) || [])?.map((item) => ({
        value: item.id,
        label: item?.name || "",
    }));

    const uomOptions = (id ? uomList?.data : uomList?.data?.filter(i => i.active) || [])?.map((item) => ({
        value: item.id,
        label: item?.name || "",
    }));

    const discountTypeOptions = [
        { value: "", label: "" },
        { value: "Flat", label: "Flat" },
        { value: "Percentage", label: "Percentage" },
    ];

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
                                    <th className={`${compactHeaderCellClassName} w-7`}>Offer</th>
                                    <th className={`${compactHeaderCellClassName} w-20`}>Barcode Type</th>
                                    {/* <th className={`${compactHeaderCellClassName} w-16`}>Discount Type</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Discount</th> */}
                                    <th className={`${compactHeaderCellClassName} w-20`}>Tax Type</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Tax %</th>
                                    <th className={`${compactHeaderCellClassName} w-16`}>Net Amount</th>
                                    <th className={`${compactHeaderCellClassName} w-7`}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(saleOrderItemsWithOffers || []).map((row, index) => {
                                    const { subTotal, taxTotal, total } = getLineTotals(row);
                                    const selectedItemData = itemList?.data?.find(i => i.id === row.itemId);
                                    const isLegacy = row.itemId ? selectedItemData?.isLegacy : true;
                                    const priceList = selectedItemData?.ItemPriceList || [];
                                    const currentPriceEntry = isLegacy
                                        ? priceList[0]
                                        : priceList.find(p => String(p.sizeId) === String(row.sizeId) && String(p.colorId) === String(row.colorId));

                                    const availableBarcodes = currentPriceEntry?.ItemBarcodes || [];

                                    return (
                                        <tr
                                            key={index}
                                            className={`${transactionTableRowClassName}  ${index % 2 === 0 ? "bg-white" : "bg-gray-100"} `} onContextMenu={(e) => {
                                                if (!readOnly) handleRightClick(e, index, "shiftTimeHrs");
                                            }}
                                        >
                                            <td className={transactionTableIndexCellClassName}>{index + 1}</td>

                                            <td className={compactFocusCellClassName}>
                                                <SearchableTableCellSelect
                                                    value={row.itemId}
                                                    options={itemOptions}
                                                    disabled={readOnly}
                                                    onChange={(nextValue) => handleInputChange(nextValue, index, "itemId")}
                                                    addNewModalWidth="w-[90%] h-[95%]"
                                                    childComponent={ItemMaster}
                                                    addNewLabel="+ Add New Item"
                                                // handlers={handlers}
                                                // movedToNextSaveNewRef={movedToNextSaveNewRef}
                                                />
                                            </td>

                                            {showSize && (
                                                <td className={compactFocusCellClassName}>
                                                    <SearchableTableCellSelect
                                                        value={row.sizeId}
                                                        options={
                                                            id ?
                                                                sizeList?.data?.map((item) => ({
                                                                    value: item.id,
                                                                    label: item?.name || "",
                                                                })) :
                                                                getCatalogSizeOptions(catalogItems, catalogPriceRows, sizeList?.data, row?.itemId)?.map((item) => ({
                                                                    value: item.id,
                                                                    label: item?.name || "",
                                                                }))}

                                                        disabled={readOnly || !isSizeReady(row)}
                                                        onChange={(nextValue) => handleInputChange(nextValue, index, "sizeId")}
                                                    />
                                                </td>
                                            )}

                                            {showColor && (
                                                <td className={compactFocusCellClassName}>
                                                    <SearchableTableCellSelect
                                                        value={row.colorId}
                                                        options={
                                                            id ?
                                                                colorList?.data?.map((item) => ({
                                                                    value: item.id,
                                                                    label: item?.name || "",
                                                                })) :
                                                                getCatalogColorOptions(catalogItems, catalogPriceRows, colorList?.data, row?.itemId, row?.sizeId)?.map((item) => ({
                                                                    value: item.id,
                                                                    label: item?.name || "",
                                                                }))}

                                                        disabled={readOnly || !isColorReady(row)}
                                                        onChange={(nextValue) => handleInputChange(nextValue, index, "colorId")}
                                                    />
                                                </td>
                                            )}

                                            <td className={compactFocusCellClassName}>
                                                <SearchableTableCellSelect
                                                    value={row.hsnId}
                                                    options={hsnOptions}
                                                    disabled={readOnly || !row.itemId}
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
                                                    onChange={e => handleInputChange(e.target.value, index, "price")}
                                                    onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(3), index, "price")}
                                                />
                                            </td>

                                            <td className={`${compactCellClassName} px-1 text-[10px] font-bold leading-none relative text-center`}>
                                                {!readOnly && row.itemId && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedItemForOffers(row);
                                                            setShowItemOfferModal(true);
                                                        }}
                                                        title="View Item Offers"
                                                        className="p-1 text-indigo-600 bg-indigo-50 hover:text-white hover:bg-indigo-600 rounded transition-all inline-flex items-center justify-center border border-indigo-100 hover:border-indigo-600 shrink-0 z-10"
                                                    >
                                                        <Gift size={12} fill="currentColor" />
                                                    </button>
                                                )}
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
                                                            {/* <option value="REGULAR">REGULAR</option>
                                                            <option value="CLEARANCE">CLEARANCE</option> */}
                                                        </>
                                                    )}
                                                </select>
                                            </td>

                                            {/* <td className={`${compactFocusCellClassName} w-40 text-right`}>
                                                <SearchableTableCellSelect
                                                    value={row.discountType}
                                                    options={discountTypeOptions}
                                                    disabled={readOnly}
                                                    onChange={(nextValue) => handleInputChange(nextValue, index, "discountType")}
                                                />
                                            </td>

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
                                                    disabled={readOnly || !row.qty}
                                                    onChange={e => handleInputChange(e.target.value, index, "discountValue")}
                                                    onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(3), index, "discountValue")}
                                                />
                                            </td> */}

                                            <td className={compactFocusCellClassName}>
                                                <select
                                                    className={compactDropdownClassName}
                                                    value={row.itemId ? (row.taxMethod || "Inclusive") : (row.taxMethod || "")}
                                                    onChange={e => handleInputChange(e.target.value, index, "taxMethod")}
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
                                                    onClick={() => addNewRow()}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            if (index === saleOrderItems.length - 1) {
                                                                addNewRow();
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
                                    top: `${contextMenu.mouseY - 240}px`,
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

export default SaleOrderItems;
