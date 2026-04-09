import { useEffect, useState } from "react";
import { useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { toast } from "react-toastify";
import { capitalizeFirstLetter, findFromList, sumArray } from "../../../Utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { setLastTab, setOpenPartyModal } from "../../../redux/features/openModel";
import Swal from "sweetalert2";
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
import SearchableTableCellSelect from "../ReusableComponents/SearchableTableCellSelect";
import { ItemMaster } from "../../../Shocks";

const QuotationItems = ({
    id,
    transType,
    quoteItems,
    setQuoteItems,
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
    itemControlPanel,
    handlers,
    movedToNextSaveNewRef
}) => {
    const compactHeaderCellClassName = transactionTableHeaderCellClassName;
    const compactCellClassName = transactionTableCellClassName;
    const compactFocusCellClassName = transactionTableFocusCellClassName;
    const compactSelectClassName = transactionTableSelectInputClassName;
    const compactNumberInputClassName = transactionTableNumberInputClassName;
    const compactDropdownClassName = "h-full w-full max-w-none rounded-none border-0 bg-transparent px-1 py-0 text-[10px] shadow-none outline-none focus:bg-transparent focus:outline-none";

    const [currentSelectedLotGrid, setCurrentSelectedLotGrid] = useState(false)
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

    const getPriceFromTemplate = (itemId, qty) => {
        if (!priceTemplateList?.data || !itemId || !qty) return null;
        const numericQty = parseFloat(qty);

        // Find template for this item
        const template = priceTemplateList?.data?.find(t => String(t.itemId) === String(itemId));
        if (!template?.PriceTemplateDetails) return null;

        // Find match in details
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
        const newBlend = structuredClone(quoteItems);
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
                // Auto-fill tax based on the new HSN ID
                const selectedHsn = hsnList?.data?.find(hsn => parseInt(hsn.id) === parseInt(selectedItem.hsnId));
                newBlend[index]["taxPercent"] = selectedHsn?.tax || 0;
                newBlend[index]["taxMethod"] = newBlend[index]["taxMethod"] || "Inclusive";
            } else {
                newBlend[index]["taxMethod"] = "";
            }
        }

        if (field === "hsnId") {
            // Auto-fill tax based on manually changed HSN ID
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
                // 1. Check for Bulk Tier Offer
                const templateDetail = getPriceFromTemplate(currentItem, currentQty);
                if (templateDetail) {
                    newBlend[index]["price"] = templateDetail.price;
                    newBlend[index]["priceType"] = "BulkOfferPrice";
                } else if (!requiresSize || currentSize || isLegacySelection) {
                    // 2. Standard Price Master Logic
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
                            // 2a. Qty > 6 applies standard Offer Price
                            newBlend[index]["price"] = foundPrice.offerPrice;
                            newBlend[index]["priceType"] = "offerPrice";
                        } else {
                            // 3. Default Sales Price
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

        // if (field === "price") {
        //     newBlend[index]["priceSource"] = "MANUAL";
        // }

        newBlend[index][field] = value;
        setQuoteItems(newBlend);
    };

    console.log(quoteItems, "poItems",);


    useEffect(() => {
        if (id) return
        const length = standardTransactionPlaceholderRowCount
        if (quoteItems?.length >= length) return;
        setQuoteItems((prev) => {
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
                    taxMethod: ""
                };
            });
            return [...prev, ...newArray];
        });
    }, [transType, setQuoteItems, quoteItems, isHeaderOpen]);

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
            taxMethod: ""
        };
        setQuoteItems([...quoteItems, newRow]);
    };
    const handleDeleteRow = (id) => {
        setQuoteItems((yarnBlend) =>
            yarnBlend.filter((row, index) => index !== parseInt(id))
        );
    };
    const handleDeleteAllRows = () => {
        setQuoteItems((prevRows) => {
            if (prevRows.length <= 1) return prevRows;
            return [prevRows[0]];
        });
    };
    const activeTab = useSelector((state) =>
        state.openTabs.tabs.find((tab) => tab.active).name
    );

    const { data: yarnList } = useGetYarnMasterQuery({ params });
    const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
    const { data: colorList, isLoading: isColorLoading, isFetching: isColorFetching, } = useGetColorMasterQuery({ params: { ...params, isGrey: greyFilter ? true : undefined }, });
    const { data: hsnList } = useGetHsnMasterQuery({ params });


    function findYarnTax(id) {
        if (!yarnList) return 0;
        let yarnItem = yarnList.data.find(
            (item) => parseInt(item.id) === parseInt(id)
        );
        return yarnItem ? yarnItem.taxPercent : 0;
    }

    function getTotals(field) {
        const total = quoteItems.reduce((accumulator, current) => {
            return accumulator + parseFloat(current[field] ? current[field] : 0);
        }, 0);
        return parseFloat(total);
    }

    const TotalAmount = (price, tax, qty) => {
        const p = parseFloat(price) || 0;
        const t = parseFloat(tax) || 0;
        const q = parseFloat(qty) || 0;

        if (taxMethod === "WithTax") {
            return p * q;
        } else {
            const priceWithTax = p + (p * t) / 100;
            return priceWithTax * q;
        }
    };

    const getDiscountAmount = (row) => {
        if (!row) return 0;
        const price = parseFloat(row.price) || 0;
        const tax = parseFloat(row.tax) || 0;
        const qty = parseFloat(row.qty) || 0;
        const discountValue = parseFloat(row.discountValue) || 0;
        const discountType = (row.discountType || "").toLowerCase();
        const total = TotalAmount(price, tax, qty);

        if (discountType === "flat") {
            return total - discountValue;
        } else if (discountType === "percentage") {
            const discount = (total * discountValue) / 100;
            return total - discount;
        } else {
            return total;
        }
    };

    const dispatch = useDispatch();
    const handleCreateNew = (masterName = "") => {
        dispatch(setOpenPartyModal(true));
        dispatch(setLastTab(activeTab));
        dispatch(push({ name: masterName }));
    }


    let selectedRow = Number.isInteger(currentSelectedLotGrid) ? quoteItems[currentSelectedLotGrid] : ""
    let taxItems = quoteItems?.map(item => {
        let newItem = structuredClone(item)
        newItem["qty"] = sumArray(newItem.lotDetails, "qty")
        return newItem
    })
    let lotNoArr = selectedRow?.lotDetails ? selectedRow.lotDetails.map(item => item.lotNo) : []
    let isLotNoUnique = new Set(lotNoArr).size == lotNoArr.length
    function onClose() {
        if (!isLotNoUnique) {
            toast.info("Lot No Should be Unique", { position: "top-center" })
            return
        }
        setCurrentSelectedLotGrid(false)
    }

    const getLineTotals = (line) => {
        const quantity = Math.max(0, Number(line.qty));
        const unitPrice = Math.max(0, Number(line.price));
        const taxRate = Number(line.taxPercent) || 0;
        const taxMethod = line.taxMethod; // ✅ from line

        const grossAmount = quantity * unitPrice;

        // 👉 Step 1: Apply Discount FIRST
        let discountedAmount = grossAmount;

        if (line.discountType === "Percentage") {
            discountedAmount =
                grossAmount - (grossAmount * (Number(line.discountValue) || 0)) / 100;
        } else if (line.discountType === "Flat") {
            discountedAmount =
                grossAmount - (Number(line.discountValue) || 0);
        }

        // Prevent negative
        discountedAmount = Math.max(0, discountedAmount);

        // 👉 Step 2: Tax Calculation (based on line)
        if (taxMethod === "Inclusive" && taxRate > 0) {
            const subTotal = discountedAmount / (1 + taxRate / 100);
            const taxTotal = discountedAmount - subTotal;

            return {
                subTotal,
                taxTotal,
                total: discountedAmount,
            };
        }

        // Exclusive Tax
        const subTotal = discountedAmount;
        const taxTotal = subTotal * (taxRate / 100);

        return {
            subTotal,
            taxTotal,
            total: subTotal + taxTotal,
        };
    };


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

    const taxMethodOptions = [
        { value: "", label: "   " },
        { value: "Inclusive", label: "Inclusive" },
        { value: "Exclusive", label: "Exclusive" },
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
                                    <th
                                        className={`${compactHeaderCellClassName} w-12`}
                                    >
                                        S.No
                                    </th>
                                    <th

                                        className={`${compactHeaderCellClassName} w-52`}
                                    >
                                        Item
                                    </th>
                                    {showSize && (
                                        <th
                                            className={`${compactHeaderCellClassName} w-16`}
                                        >
                                            Size
                                        </th>
                                    )}
                                    {showColor && (
                                        <th
                                            className={`${compactHeaderCellClassName} w-32`}
                                        >
                                            Color
                                        </th>
                                    )}
                                    <th

                                        className={`${compactHeaderCellClassName} w-20`}
                                    >
                                        Hsn
                                    </th>
                                    <th

                                        className={`${compactHeaderCellClassName} w-12`}
                                    >
                                        UOM
                                    </th>


                                    <th

                                        className={`${compactHeaderCellClassName} w-16`}
                                    >
                                        Quantity
                                    </th>
                                    <th

                                        className={`${compactHeaderCellClassName} w-16`}
                                    >
                                        {/* <div className="flex flex-col items-center gap-1.5 py-1 leading-none">
                                            <span className="uppercase ">Price</span>
                                            <select
                                                className="w-full text-[10px] bg-white border border-slate-200 rounded px-1 py-1 outline-none focus:ring-1 focus:ring-indigo-400 font-bold text-indigo-700 cursor-pointer shadow-sm mx-auto max-w-[120px]"
                                                value={taxMethod}
                                                onChange={(e) => setTaxMethod(e.target.value)}
                                            // disabled={readOnly}
                                            >
                                                <option value="WithoutTax">Without Tax</option>
                                                <option value="WithTax">With Tax</option>
                                            </select>
                                        </div> */}
                                        Price
                                    </th>
                                    <th

                                        className={`${compactHeaderCellClassName} w-16`}
                                    >
                                        Price Type
                                    </th>
                                    <th

                                        className={`${compactHeaderCellClassName} w-16`}
                                    >
                                        Discount Type
                                    </th>
                                    <th

                                        className={`${compactHeaderCellClassName} w-16`}
                                    >
                                        Discount
                                    </th>
                                    <th

                                        className={`${compactHeaderCellClassName} w-20`}
                                    >
                                        Tax Type
                                    </th>
                                    <th

                                        className={`${compactHeaderCellClassName} w-16`}
                                    >
                                        Tax
                                    </th>
                                    {/* <th

                                        className={`${compactHeaderCellClassName} w-16`}
                                    >
                                        Tax Total
                                    </th> */}
                                    <th

                                        className={`${compactHeaderCellClassName} w-16`}
                                    >
                                        Net Amount
                                    </th>
                                    <th

                                        className={`${compactHeaderCellClassName} w-7`}
                                    >

                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {(quoteItems ? quoteItems : [])?.map((row, index) => {

                                    const { subTotal, taxTotal, total } = getLineTotals(row, taxMethod);


                                    if (row?.itemId) {
                                        console.log(row, "row", taxMethod)
                                        console.log(subTotal, taxTotal, total, "subTotal, taxTotal, total");


                                    }


                                    return (



                                        <tr className={`${transactionTableRowClassName}  ${index % 2 === 0 ? "bg-white" : "bg-gray-100"} `}
                                            onContextMenu={(e) => {
                                                if (!readOnly) {
                                                    handleRightClick(e, index, "shiftTimeHrs");
                                                }
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
                                                    // ref={secondInputRef}
                                                    handlers={handlers}
                                                    movedToNextSaveNewRef={movedToNextSaveNewRef}
                                                />
                                            </td>

                                            {showSize && (
                                                <td className={compactFocusCellClassName}>
                                                    {/* <select
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "sizeId") } }}
                                                    tabIndex={"0"} className={compactSelectClassName}
                                                    value={row.sizeId}
                                                    onChange={(e) => handleInputChange(e.target.value, index, "sizeId")}
                                                    onBlur={(e) => {
                                                        handleInputChange((e.target.value), index, "sizeId")
                                                    }
                                                    }
                                                    disabled={readOnly || !isSizeReady(row) || isLegacyRow(row)}
                                                >
                                                    <option >
                                                    </option>
                                                    {getCatalogSizeOptions(catalogItems, catalogPriceRows, sizeList?.data, row?.itemId)?.map((blend) =>
                                                        <option value={blend.id} key={blend.id}>
                                                            {blend?.name}
                                                        </option>)}
                                                </select> */}
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
                                                        addNewModalWidth="w-[90%] h-[95%]"

                                                    />
                                                </td>
                                            )}

                                            {showColor && (
                                                <td className={compactFocusCellClassName}>
                                                    {/* <select
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                                    className={compactSelectClassName} value={row.colorId}
                                                    onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                                                    onBlur={(e) => {
                                                        handleInputChange((e.target.value), index, "colorId")
                                                    }
                                                    }
                                                    disabled={readOnly || !isColorReady(row) || isLegacyRow(row)}

                                                >
                                                    <option hidden>
                                                    </option>
                                                    {getCatalogColorOptions(catalogItems, catalogPriceRows, colorList?.data, row?.itemId, row?.sizeId)?.map((blend) =>
                                                        <option value={blend.id} key={blend.id}>
                                                            {blend?.name}
                                                        </option>
                                                    )}
                                                </select> */}

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
                                                        addNewModalWidth="w-[90%] h-[95%]"

                                                    />
                                                </td>
                                            )}


                                            <td className={compactFocusCellClassName}>
                                                <SearchableTableCellSelect
                                                    value={row.hsnId}
                                                    options={hsnOptions}
                                                    disabled={readOnly || !row.itemId}
                                                    onChange={(nextValue) => handleInputChange(nextValue, index, "hsnId")}
                                                    addNewModalWidth="w-[90%] h-[95%]"

                                                />
                                            </td>


                                            <td className={`${compactFocusCellClassName} w-40`}>
                                                {/* <select
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                                    className={compactSelectClassName} value={row.uomId} onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                                                    onBlur={(e) => {
                                                        handleInputChange((e.target.value), index, "uomId")
                                                    }
                                                    }
                                                    disabled={readOnly || !isUomReady(row)}

                                                >

                                                    <option hidden>
                                                    </option>
                                                    {(id ? uomList?.data : uomList?.data?.filter(item => item.active))?.map((blend) =>
                                                        <option value={blend.id} key={blend.id}>
                                                            {blend.name}
                                                        </option>
                                                    )}
                                                </select> */}
                                                <SearchableTableCellSelect
                                                    value={row.uomId}
                                                    options={uomOptions}
                                                    disabled={readOnly || !isUomReady(row)}
                                                    onChange={(nextValue) => handleInputChange(nextValue, index, "uomId")}
                                                    addNewModalWidth="w-[90%] h-[95%]"

                                                />
                                            </td>


                                            <td className={`${compactFocusCellClassName} w-40 text-right`}>
                                                <input
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                        if (e.key === "Delete") { handleInputChange("0.000", index, "qty") }
                                                    }}
                                                    min={"0"}
                                                    type="number"
                                                    className={compactNumberInputClassName}
                                                    onFocus={(e) => e.target.select()}
                                                    // value={sumArray(row?.lotDetails ? row?.lotDetails : [], "qty")}
                                                    value={row?.qty}
                                                    disabled={readOnly || !row.uomId}
                                                    onChange={(e) =>
                                                        handleInputChange(e.target.value, index, "qty")
                                                    }
                                                    onBlur={(e) => {
                                                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty");
                                                    }
                                                    }
                                                />
                                            </td>

                                            <td className={`${compactFocusCellClassName} w-40 text-right relative`}>
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
                                                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "price");

                                                    }
                                                    }

                                                />


                                            </td>
                                            <td className={`${compactCellClassName} px-1 text-[10px] font-bold leading-none ${row.priceType === "BulkOfferPrice" ? "bg-green-100 text-green-800 border border-green-200" :
                                                row.priceType === "offerPrice" ? "bg-indigo-100 text-indigo-800 border border-indigo-200" : row.priceType === "SalesPrice" ? "bg-blue-100 text-blue-800 border border-blue-200"
                                                    : ""
                                                }`}>
                                                {row.priceType}

                                            </td>

                                            <td className={`${compactFocusCellClassName} w-40 text-right`}>
                                                {/* <select
                                                    className={compactDropdownClassName}
                                                    value={row.discountType}
                                                    onChange={(e) => handleInputChange(e.target.value, index, "discountType")}
                                                // disabled={readOnly}
                                                >
                                                    <option value=""></option>
                                                    <option value="Flat">Flat</option>
                                                    <option value="Percentage">Percentage</option>
                                                </select> */}
                                                <SearchableTableCellSelect
                                                    value={row.discountType}
                                                    options={discountTypeOptions}
                                                    disabled={readOnly}
                                                    onChange={(nextValue) => handleInputChange(nextValue, index, "discountType")}
                                                    addNewModalWidth="w-[90%] h-[95%]"

                                                />

                                            </td>
                                            <td className={`${compactFocusCellClassName} w-40 text-right`}>
                                                <input
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                        if (e.key === "Delete") { handleInputChange("0.00", index, "discount") }
                                                    }}
                                                    min={"0"}
                                                    type="number"
                                                    className={compactNumberInputClassName}
                                                    onFocus={(e) => e.target.select()}
                                                    value={(!row.discountValue) ? 0 : row.discountValue}
                                                    disabled={readOnly || !row.qty}
                                                    onChange={(e) =>
                                                        handleInputChange(e.target.value, index, "discountValue")
                                                    }
                                                    onBlur={(e) => {
                                                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "discountValue");

                                                    }
                                                    }

                                                />

                                            </td>

                                            {/* 
                                            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>
                                                {(subTotal).toFixed(2)}

                                            </td> */}
                                            <td className={compactFocusCellClassName}>
                                                {/* <select
                                                    className={compactDropdownClassName}
                                                    value={row.itemId ? (row.taxMethod || "Inclusive") : (row.taxMethod || "")}
                                                    onChange={(e) => handleInputChange(e.target.value, index, "taxMethod")}
                                                >
                                                    <option value=""></option>
                                                    <option value="Inclusive">Inclusive</option>
                                                    <option value="Exclusive">Exclusive</option>
                                                </select> */}
                                                <SearchableTableCellSelect
                                                    value={row.taxMethod}
                                                    options={taxMethodOptions}
                                                    disabled={readOnly}
                                                    onChange={(nextValue) => handleInputChange(nextValue, index, "taxMethod")}
                                                    addNewModalWidth="w-[90%] h-[95%]"

                                                />
                                            </td>

                                            <td className={`${compactCellClassName} w-40 text-right`}>
                                                <input
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                        if (e.key === "Delete") { handleInputChange("0.00", index, "taxPercent") }
                                                    }}
                                                    min={"0"}
                                                    type="number"
                                                    className={compactNumberInputClassName}
                                                    onFocus={(e) => e.target.select()}
                                                    value={(!row.taxPercent) ? 0 : row.taxPercent}
                                                    disabled={true}
                                                    onChange={(e) =>
                                                        handleInputChange(e.target.value, index, "taxPercent")
                                                    }
                                                    onBlur={(e) => {
                                                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "taxPercent");

                                                    }
                                                    }

                                                />

                                            </td>
                                            {/* <td className='py-0.5 border border-gray-300 text-[11px] text-right'>
                                                {(taxTotal).toFixed(2)}

                                            </td> */}
                                            <td className={`${compactCellClassName} w-40 text-right px-2`}>
                                                {(total).toFixed(2)}
                                            </td>



                                            <td className="w-16 px-1 py-1 text-center">
                                                <button
                                                    onClick={() => addNewRow(index)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            if (index === quotationItems.length - 1) {
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
                                    )

                                }




                                )}
                            </tbody>
                        </table>
                        {contextMenu && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: `${contextMenu.mouseY - 180}px`,
                                    left: `${contextMenu.mouseX - 38}px`,

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
                    </div>
                </TransactionLineItemsSection>
            </fieldset>

        </>
    );
};

export default QuotationItems;
