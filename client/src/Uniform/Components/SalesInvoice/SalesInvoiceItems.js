import { useEffect, useState } from "react";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { toast } from "react-toastify";
import { getUniqueArrayByColor, getUniqueArrayBySize } from "../../../Utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { setLastTab, setOpenPartyModal } from "../../../redux/features/openModel";
import { useGetHsnMasterQuery } from "../../../redux/services/HsnMasterServices";

const SalesInvoiceItems = ({
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
    priceTemplateList
}) => {

    const [currentSelectedLotGrid, setCurrentSelectedLotGrid] = useState(false);

    const getBarcodeFromList = (itemId, sizeId, colorId) => {
        if (!itemPriceList?.data || !itemId || !sizeId) return null;
        return itemPriceList?.data?.find(item =>
            String(item.itemId) === String(itemId) &&
            String(item.sizeId) === String(sizeId) &&
            (colorId ? String(item.colorId) === String(colorId) : !item.colorId)
        );
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
        if (field === "itemId") {
            const selectedItem = itemList?.data?.find(item => parseInt(item.id) === parseInt(value));
            if (selectedItem) {
                newBlend[index]["sectionId"] = selectedItem.sectionId;
                newBlend[index]["hsnId"] = selectedItem.hsnId;
                const selectedHsn = hsnList?.data?.find(hsn => parseInt(hsn.id) === parseInt(selectedItem.hsnId));
                newBlend[index]["taxPercent"] = selectedHsn?.tax || 0;
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

            if (currentItem) {
                const templateDetail = getPriceFromTemplate(currentItem, currentQty);
                if (templateDetail) {
                    newBlend[index]["price"] = templateDetail.price;
                    newBlend[index]["priceType"] = "BulkOfferPrice";
                } else if (currentSize) {
                    const foundPrice = getBarcodeFromList(currentItem, currentSize, currentColor);
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
        setInvoiceItems(newBlend);
    };

    useEffect(() => {
        if (id) return;
        const length = isHeaderOpen ? 9 : 12;
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
                taxMethod: "Inclusive"
            }));
            return [...prev, ...newArray];
        });
    }, [transType, setInvoiceItems, invoiceItems, isHeaderOpen]);

    const addNewRow = () => {
        setInvoiceItems([...invoiceItems, {
            itemId: "", qty: "", tax: "0", colorId: "", uomId: "",
            price: "", discountTypes: "", discountValue: "0.00", id: '', poItemsId: ""
        }]);
    };

    const handleDeleteRow = (id) => {
        setInvoiceItems(rows => rows.filter((_, index) => index !== parseInt(id)));
    };

    const handleDeleteAllRows = () => {
        setInvoiceItems(prevRows => prevRows.length <= 1 ? prevRows : [prevRows[0]]);
    };

    const activeTab = useSelector(state => state.openTabs.tabs.find(tab => tab.active).name);

    const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
    const { data: colorList } = useGetColorMasterQuery({ params: { ...params, isGrey: greyFilter ? true : undefined } });
    const { data: hsnList } = useGetHsnMasterQuery({ params });

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
            <fieldset>
                <div className={`border border-slate-200 p-2 bg-white rounded-md shadow-sm ${isHeaderOpen ? "max-h-[330px]" : "max-h-[550px]"}`}>
                    <div className={`relative w-full ${isHeaderOpen ? "h-[250px]" : "h-[350px]"} overflow-y-auto py-1`}>
                        <table className="w-full border-collapse table-fixed">
                            <thead className="bg-gray-200 text-gray-800 top-0 sticky">
                                <tr>
                                    <th className="w-12 px-4 py-2 text-center font-medium text-[13px]">S.No</th>
                                    <th className="w-52 px-4 py-2 text-center font-medium text-[13px]">Item</th>
                                    <th className="w-16 px-4 py-2 text-center font-medium text-[13px]">Size</th>
                                    <th className="w-32 px-4 py-2 text-center font-medium text-[13px]">Color</th>
                                    <th className="w-20 px-4 py-2 text-center font-medium text-[13px]">Hsn</th>
                                    <th className="w-12 px-4 py-2 text-center font-medium text-[13px]">UOM</th>
                                    <th className="w-16 px-4 py-2 text-center font-medium text-[13px]">Quantity</th>
                                    <th className="w-16 px-4 py-2 text-center font-medium text-[13px]">Price</th>
                                    <th className="w-16 px-4 py-2 text-center font-medium text-[13px]">Price Type</th>
                                    <th className="w-16 px-4 py-2 text-center font-medium text-[13px]">Discount Type</th>
                                    <th className="w-16 px-4 py-2 text-center font-medium text-[13px]">Discount</th>
                                    <th className="w-20 px-3 py-2 text-center font-medium text-[13px]">Tax Type</th>
                                    <th className="w-16 px-3 py-2 text-center font-medium text-[13px]">Tax %</th>
                                    <th className="w-16 px-3 py-2 text-center font-medium text-[13px]">Net Amount</th>
                                    <th className="w-7 px-3 py-2 text-center font-medium text-[13px]"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(invoiceItems || []).map((row, index) => {
                                    const { subTotal, taxTotal, total } = getLineTotals(row);
                                    return (
                                        <tr
                                            key={index}
                                            className="border border-blue-gray-200 cursor-pointer"
                                            onContextMenu={(e) => {
                                                if (!readOnly) handleRightClick(e, index, "shiftTimeHrs");
                                            }}
                                        >
                                            <td className="w-12 border border-gray-300 text-[11px] text-center p-0.5">{index + 1}</td>

                                            {/* Item */}
                                            <td className="py-0.5 border border-gray-300 text-[11px]">
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") handleInputChange("", index, "itemId"); }}
                                                    tabIndex="0" disabled={readOnly}
                                                    className="text-left w-full rounded py-1 table-data-input"
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
                                            <td className="py-0.5 border border-gray-300 text-[11px]">
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") handleInputChange("", index, "sizeId"); }}
                                                    tabIndex="0"
                                                    className="text-left w-full rounded py-1 table-data-input"
                                                    value={row.sizeId}
                                                    onChange={e => handleInputChange(e.target.value, index, "sizeId")}
                                                    onBlur={e => handleInputChange(e.target.value, index, "sizeId")}
                                                    disabled={readOnly || !row.itemId}
                                                >
                                                    <option></option>
                                                    {(id ? sizeList?.data : getUniqueArrayBySize(itemList?.data, sizeList?.data, "sizeId", row?.itemId))?.map(blend => (
                                                        <option value={blend.id} key={blend.id}>{blend?.name}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Color */}
                                            <td className="py-0.5 border border-gray-300 text-[11px]">
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") handleInputChange("", index, "colorId"); }}
                                                    className="text-left w-full rounded py-1 table-data-input"
                                                    value={row.colorId}
                                                    onChange={e => handleInputChange(e.target.value, index, "colorId")}
                                                    onBlur={e => handleInputChange(e.target.value, index, "colorId")}
                                                    disabled={readOnly || !row.sizeId}
                                                >
                                                    <option hidden></option>
                                                    {(id ? colorList?.data : getUniqueArrayByColor(itemList?.data, colorList?.data, "colorId", row?.itemId))?.map(blend => (
                                                        <option value={blend.id} key={blend.id}>{blend?.name}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* HSN */}
                                            <td className="py-0.5 border border-gray-300 text-[11px]">
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") handleInputChange("", index, "hsnId"); }}
                                                    className="text-left w-full rounded py-1 table-data-input"
                                                    value={row.hsnId}
                                                    onChange={e => handleInputChange(e.target.value, index, "hsnId")}
                                                    onBlur={e => handleInputChange(e.target.value, index, "hsnId")}
                                                    disabled={readOnly || !row.sizeId}
                                                >
                                                    <option hidden></option>
                                                    {hsnList?.data?.map(blend => (
                                                        <option value={blend.id} key={blend.id}>{blend?.name}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* UOM */}
                                            <td className="w-40 border border-gray-300 text-[11px] py-0.5">
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") handleInputChange("", index, "uomId"); }}
                                                    className="text-left w-full rounded py-1 table-data-input"
                                                    value={row.uomId}
                                                    onChange={e => handleInputChange(e.target.value, index, "uomId")}
                                                    onBlur={e => handleInputChange(e.target.value, index, "uomId")}
                                                    disabled={readOnly || !row.colorId}
                                                >
                                                    <option hidden></option>
                                                    {(id ? uomList?.data : uomList?.data?.filter(item => item.active))?.map(blend => (
                                                        <option value={blend.id} key={blend.id}>{blend.name}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Qty */}
                                            <td className="w-40 border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                                                <input
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                                                        if (e.key === "Delete") handleInputChange("0.000", index, "qty");
                                                    }}
                                                    min="0" type="number"
                                                    className="text-right rounded py-1 px-1 w-full table-data-input"
                                                    onFocus={e => e.target.select()}
                                                    value={row?.qty}
                                                    disabled={readOnly || !row.uomId}
                                                    onChange={e => handleInputChange(e.target.value, index, "qty")}
                                                    onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty")}
                                                />
                                            </td>

                                            {/* Price */}
                                            <td className="w-40 py-0.5 border border-gray-300 text-[11px] text-right relative">
                                                <input
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                                                        if (e.key === "Delete") handleInputChange("0.00", index, "price");
                                                    }}
                                                    min="0" type="number"
                                                    className="text-right rounded py-1 w-full px-1 table-data-input"
                                                    onFocus={e => e.target.select()}
                                                    value={(!row.price) ? 0 : row.price}
                                                    disabled={readOnly || !row.qty}
                                                    onChange={e => handleInputChange(e.target.value, index, "price")}
                                                    onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(3), index, "price")}
                                                />
                                            </td>

                                            {/* Price Type Badge */}
                                            <td className={`text-[10px] px-1 rounded-sm font-bold shadow-xs leading-none py-0.5 ${row.priceType === "BulkOfferPrice" ? "bg-green-100 text-green-800 border border-green-200" :
                                                row.priceType === "offerPrice" ? "bg-indigo-100 text-indigo-800 border border-indigo-200" :
                                                    row.priceType === "SalesPrice" ? "bg-blue-100 text-blue-800 border border-blue-200" : ""}`}>
                                                {row.priceType}
                                            </td>

                                            {/* Discount Type */}
                                            <td className="w-40 py-0.5 border border-gray-300 text-[11px] text-right">
                                                <select
                                                    className="w-full text-[10px] bg-white border border-slate-200 rounded px-1 py-1 outline-none focus:ring-1 cursor-pointer shadow-sm mx-auto max-w-[120px]"
                                                    value={row.discountType}
                                                    onChange={e => handleInputChange(e.target.value, index, "discountType")}
                                                >
                                                    <option value=""></option>
                                                    <option value="Flat">Flat</option>
                                                    <option value="Percentage">Percentage</option>
                                                </select>
                                            </td>

                                            {/* Discount Value */}
                                            <td className="w-40 py-0.5 border border-gray-300 text-[11px] text-right">
                                                <input
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                                                        if (e.key === "Delete") handleInputChange("0.00", index, "discountValue");
                                                    }}
                                                    min="0" type="number"
                                                    className="text-right rounded py-1 w-full px-1 table-data-input"
                                                    onFocus={e => e.target.select()}
                                                    value={(!row.discountValue) ? 0 : row.discountValue}
                                                    disabled={readOnly || !row.qty}
                                                    onChange={e => handleInputChange(e.target.value, index, "discountValue")}
                                                    onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(3), index, "discountValue")}
                                                />
                                            </td>

                                            {/* Tax Method */}
                                            <td className="py-0.5 border border-gray-300 text-[11px]">
                                                <select
                                                    className="w-full text-[10px] bg-white border border-slate-200 rounded px-1 py-1 outline-none focus:ring-1 cursor-pointer shadow-sm"
                                                    value={row.taxMethod}
                                                    onChange={e => handleInputChange(e.target.value, index, "taxMethod")}
                                                >
                                                    <option value="Inclusive">Inclusive</option>
                                                    <option value="Exclusive">Exclusive</option>
                                                </select>
                                            </td>

                                            {/* Tax % */}
                                            <td className="w-40 py-0.5 border border-gray-300 text-[11px] text-right">
                                                <input
                                                    min="0" type="number"
                                                    className="text-right rounded py-1 w-full px-1 table-data-input"
                                                    onFocus={e => e.target.select()}
                                                    value={(!row.taxPercent) ? 0 : row.taxPercent}
                                                    disabled={true}
                                                    onChange={e => handleInputChange(e.target.value, index, "taxPercent")}
                                                    onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(3), index, "taxPercent")}
                                                />
                                            </td>

                                            {/* Net Amount */}
                                            <td className="w-40 py-0.5 border border-gray-300 text-[11px] text-right">
                                                {total.toFixed(2)}
                                            </td>

                                            {/* Add Row on Enter */}
                                            <td className="w-16 px-1 py-1 text-center">
                                                <input readOnly
                                                    className="w-full bg-transparent focus:outline-none focus:border-transparent text-right pr-2"
                                                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addNewRow(); } }}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

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
            </fieldset>
        </>
    );
};

export default SalesInvoiceItems;
