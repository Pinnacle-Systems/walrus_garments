import { useEffect, useState } from "react";
import { useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { toast } from "react-toastify";
import { findFromList, getItemVariantColorOptions, getItemVariantSizeOptions, getStockMaintenanceConfig, sumArray } from "../../../Utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { setLastTab, setOpenPartyModal } from "../../../redux/features/openModel";
import Swal from "sweetalert2";
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
    sizeList
}) => {
    const compactHeaderCellClassName = transactionTableHeaderCellClassName;
    const compactCellClassName = transactionTableCellClassName;
    const compactFocusCellClassName = transactionTableFocusCellClassName;
    const compactSelectClassName = transactionTableSelectInputClassName;
    const compactNumberInputClassName = transactionTableNumberInputClassName;
    const { data: stockReportControlData } = useGetStockReportControlQuery({ params });
    const stockMaintenance = getStockMaintenanceConfig(stockReportControlData?.data?.[0]);
    const showSize = stockMaintenance.trackSize;
    const showColor = stockMaintenance.trackColor;
    const isSizeReady = (row) => !showSize || Boolean(row.itemId);
    const isColorReady = (row) => !showColor || Boolean(showSize ? row.sizeId : row.itemId);
    const isUomReady = (row) => {
        if (showColor) return Boolean(row.colorId);
        if (showSize) return Boolean(row.sizeId);
        return Boolean(row.itemId);
    };





    const [currentSelectedLotGrid, setCurrentSelectedLotGrid] = useState(false)

    const handleInputChange = (value, index, field) => {
        console.log(value, "value", index, "index", field, "field")
        const newBlend = structuredClone(deliveryItems);
        if (field == "itemId") {
            const sectionId = findFromList(value, itemList?.data, "sectionId")
            newBlend[index]["sectionId"] = sectionId;
        }


        newBlend[index][field] = value;

        setDeliveryItems(newBlend);
    };

    console.log(deliveryItems, "poItems",);


    useEffect(() => {
        if (id) return
        if (deliveryItems?.length >= standardTransactionPlaceholderRowCount) return;
        setDeliveryItems((prev) => {
            let newArray = Array.from({ length: standardTransactionPlaceholderRowCount - prev.length }, (i) => {
                return {
                    itemId: "",
                    qty: "0.00",
                    tax: "0",
                    colorId: "",
                    uomId: "",
                    price: "0.00",
                    discountValue: "0.00",
                    noOfBags: "0",
                    discountType: "",
                    weightPerBag: "0.00",
                    id: '',
                    poItemsId: ""
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
            poItemsId: ""
        };
        setDeliveryItems([...deliveryItems, newRow]);
    };
    const handleDeleteRow = (id) => {
        setDeliveryItems((yarnBlend) =>
            yarnBlend.filter((row, index) => index !== parseInt(id))
        );
    };
    const handleDeleteAllRows = () => {
        setDeliveryItems((prevRows) => {
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
        const total = deliveryItems.reduce((accumulator, current) => {
            return accumulator + parseFloat(current[field] ? current[field] : 0);
        }, 0);
        return parseFloat(total);
    }

    const TotalAmount = (price, tax, qty) => {
        const p = parseFloat(price) || 0;
        const t = parseFloat(tax) || 0;
        const q = parseFloat(qty) || 0;

        const priceWithTax = p + (p * t) / 100;
        return priceWithTax * q;
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
    const getFinalAmountAfterDiscount = () => {
        return deliveryItems.reduce((acc, row) => {
            const price = parseFloat(row.price) || 0;
            const tax = parseFloat(row.tax) || 0;
            const qty = parseFloat(row.qty) || 0;
            const discountValue = parseFloat(row.discountValue) || 0;
            const discountType = (row.discountType || "").toLowerCase();

            const total = TotalAmount(price, tax, qty);

            let finalAmount = total;

            if (discountType === "flat") {
                finalAmount = total - discountValue;
            } else if (discountType === "percentage") {
                const discount = (total * discountValue) / 100;
                finalAmount = total - discount;
            }

            return acc + finalAmount;
        }, 0);
    };
    const dispatch = useDispatch();
    const handleCreateNew = (masterName = "") => {
        dispatch(setOpenPartyModal(true));
        dispatch(setLastTab(activeTab));
        dispatch(push({ name: masterName }));
    }
    function handleInputChangeLotNo(value, index, lotIndex, field, balanceQty) {
        setDeliveryItems(poItems => {
            const newBlend = structuredClone(poItems);
            if (!newBlend[index]["lotDetails"]) return poItems
            newBlend[index]["lotDetails"][lotIndex][field] = value;
            let totalQtyExcludeCurrentIndex = sumArray(newBlend[index]["lotDetails"].filter((_, index) => index != lotIndex), "qty")
            if ((field === "weightPerBag" || field === "noOfBags") && newBlend[index]["lotDetails"][lotIndex]["noOfBags"] && newBlend[index]["lotDetails"][lotIndex]["weightPerBag"]) {
                let tempInwardQty = (parseFloat(newBlend[index]["lotDetails"][lotIndex]["noOfBags"]) * parseFloat(newBlend[index]["lotDetails"][lotIndex]["weightPerBag"])).toFixed(3)
                let currentOverAllQty = parseFloat(tempInwardQty) + parseFloat(totalQtyExcludeCurrentIndex)
                // if (parseFloat(balanceQty) < parseFloat(currentOverAllQty)) {
                //     toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
                //     return poItems
                // }
                newBlend[index]["lotDetails"][lotIndex]["qty"] = tempInwardQty
            }
            if (field === "qty") {
                // let currentOverAllQty = parseFloat(value) + parseFloat(totalQtyExcludeCurrentIndex)
                // if (parseFloat(balanceQty) < parseFloat(currentOverAllQty)) {
                //     toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
                //     return poItems
                // }
                let qty = parseInt(newBlend[index]["lotDetails"][lotIndex]["noOfBags"]) * parseFloat(newBlend[index]["lotDetails"][lotIndex]["weightPerBag"])
                let excessQty = parseInt(newBlend[index]["lotDetails"][lotIndex]["noOfBags"]) * 2
                if ((qty + excessQty) < parseFloat(value)) {
                    toast.info("Excess Qty Cannot be More than 2kg Per Bag", { position: 'top-center' })
                    return poItems
                }
            }
            return newBlend
        });
    }
    function addNewLotNo(index, weightPerBag) {
        setDeliveryItems(poItems => {
            const newBlend = structuredClone(poItems);
            if (!newBlend[index]) return poItems
            if (newBlend[index]["lotDetails"]) {
                newBlend[index]["lotDetails"] = [
                    ...newBlend[index]["lotDetails"],
                    { lotNo: "", qty: "0.000", noOfBags: 0, weightPerBag }]
            } else {
                newBlend[index]["lotDetails"] = [{ lotNo: "", qty: "0.000", noOfBags: 0, weightPerBag }]
            }
            return newBlend
        })
    }
    function removeLotNo(index, lotIndex) {
        setDeliveryItems(poItems => {
            const newBlend = structuredClone(poItems);
            if (!newBlend[index]["lotDetails"]) return poItems
            newBlend[index]["lotDetails"] = newBlend[index]["lotDetails"].filter((_, index) => index != lotIndex)
            return newBlend
        })
    }
    let selectedRow = Number.isInteger(currentSelectedLotGrid) ? deliveryItems[currentSelectedLotGrid] : ""
    let taxItems = deliveryItems?.map(item => {
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


    return (
        <>



            <TransactionLineItemsSection
                panelClassName="h-full min-h-0"
                contentClassName="min-h-0 overflow-hidden rounded-md border border-slate-200 !py-0"
                actions={
                    <button className="font-bold text-slate-700 bord"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                setInwardItemSelection(true)

                            }
                        }}
                        disabled={true}
                        onClick={() => {
                            if (!supplierId) {
                                Swal.fire({
                                    icon: 'success',
                                    title: ` Choose Supplier`,
                                    showConfirmButton: false,
                                    timer: 2000
                                });
                            }
                            else {

                                setInwardItemSelection(true)
                            }
                        }}
                    >
                        {/* Fill  Items */}
                    </button>
                }
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
                                    Price
                                </th>


                                <th

                                    className={`${compactHeaderCellClassName} w-16`}
                                >
                                    Gross
                                </th>


                                <th

                                    className={`${compactHeaderCellClassName} w-7`}
                                >

                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {(deliveryItems ? deliveryItems : [])?.map((row, index) =>
                                <tr className={transactionTableRowClassName}
                                    onContextMenu={(e) => {
                                        if (!readOnly) {
                                            handleRightClick(e, index, "shiftTimeHrs");
                                        }
                                    }}
                                >
                                    <td className={transactionTableIndexCellClassName}>{index + 1}</td>
                                    <td className={compactFocusCellClassName}>
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "itemId") } }}
                                            tabIndex={"0"} disabled={readOnly} className={compactSelectClassName}
                                            value={row.itemId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "itemId")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "itemId")
                                            }
                                            }
                                        >
                                            <option >
                                            </option>
                                            {(id ? itemList?.data : itemList?.data)?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend?.name}
                                                </option>)}
                                        </select>
                                    </td>
                                    {/* {console.log(row,"row")} */}

                                    {showSize && (
                                    <td className={compactFocusCellClassName}>
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "sizeId") } }}
                                            tabIndex={"0"} className={compactSelectClassName}
                                            value={row.sizeId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "sizeId")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "sizeId")
                                            }
                                            }
                                            disabled={readOnly || !isSizeReady(row)}
                                        >
                                            <option >
                                            </option>
                                            {(id ? sizeList?.data : getItemVariantSizeOptions(itemList?.data, sizeList?.data, "sizeId", row?.itemId))?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend?.name}
                                                </option>)}
                                        </select>
                                    </td>
                                    )}

                                    {showColor && (
                                    <td className={compactFocusCellClassName}>
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                            className={compactSelectClassName} value={row.colorId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "colorId")
                                            }
                                            }
                                            disabled={readOnly || !isColorReady(row)}

                                        >
                                            <option hidden>
                                            </option>
                                            {(id ? colorList?.data : (getItemVariantColorOptions(itemList?.data, colorList?.data, "colorId", row?.itemId, row?.sizeId)))?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend?.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>
                                    )}


                                    <td className={compactFocusCellClassName}>
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "hsnId") } }}
                                            className={compactSelectClassName} value={row.hsnId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "hsnId")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "hsnId")
                                            }
                                            }
                                            disabled={readOnly || !row.itemId}

                                        >
                                            <option hidden>
                                            </option>
                                            {(id ? hsnList?.data : hsnList?.data)?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend?.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>


                                    <td className={`${compactFocusCellClassName} w-40`}>
                                        <select
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
                                        </select>
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
                                            disabled={readOnly || !row.qty}
                                            onChange={(e) =>
                                                handleInputChange(e.target.value, index, "price")
                                            }
                                            onBlur={(e) => {
                                                handleInputChange(parseFloat(e.target.value).toFixed(3), index, "price");

                                            }
                                            }

                                        />

                                    </td>



                                    <td className={`${compactCellClassName} text-right`}>
                                        {(parseFloat(row?.price) * parseFloat(row?.qty)).toFixed(3) || 0}</td>




                                    <td className="w-16 px-1 py-1 text-center">
                                        <input
                                            readOnly
                                            className="w-full bg-transparent focus:outline-none focus:border-transparent text-right pr-2"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addNewRow();
                                                }
                                            }}

                                        />
                                    </td>



                                </tr>
                            )}
                        </tbody>
                    </table>
                {contextMenu && (
                    <div
                        style={{
                            position: "absolute",
                            top: `${contextMenu.mouseY - 50}px`,
                            left: `${contextMenu.mouseX - 30}px`,

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
        </>
    );
};

export default SalesReturnItems;
