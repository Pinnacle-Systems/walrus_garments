import React, { useEffect, useState } from "react";
import { CLOSE_ICON, DELETE, PLUS } from "../../../icons";
import { useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { toast } from "react-toastify";
import { VIEW } from "../../../icons";
import TaxDetailsFullTemplate from "../TaxDetailsCompleteTemplate";
import Modal from "../../../UiComponents/Modal";
import { priceWithTax, sumArray } from "../../../Utils/helper";
import { discountTypes } from "../../../Utils/DropdownData";
import { useDispatch, useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { setLastTab, setOpenPartyModal } from "../../../redux/features/openModel";
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi";
import { YarnLotGrid } from "./LotGrid";
import Swal from "sweetalert2";

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
    supplierId
}) => {
    const [currentSelectedLotGrid, setCurrentSelectedLotGrid] = useState(false)
    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("")

    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(poItems);
        newBlend[index][field] = value;
        if (field === "yarnId") {
            newBlend[index]["taxPercent"] = findYarnTax(value);
        }
        // if (field !== "qty") {
        //   newBlend[index]["qty"] = (
        //     parseFloat(newBlend[index]["noOfBags"]) *
        //     parseFloat(newBlend[index]["weightPerBag"])
        //   ).toFixed(3);
        // }
        setPoItems(newBlend);
    };

    useEffect(() => {
        if (id) return
        if (poItems?.length >= 1) return;
        setPoItems((prev) => {
            let newArray = Array.from({ length: 1 - prev.length }, (i) => {
                return {
                    yarnId: "",
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
    }, [transType, setPoItems, poItems]);

    const addNewRow = () => {
        const newRow = {
            yarnId: "",
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
    const activeTab = useSelector((state) =>
        state.openTabs.tabs.find((tab) => tab.active).name
    );

    const { data: yarnList } = useGetYarnMasterQuery({ params });
    const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
    const { data: colorList, isLoading: isColorLoading, isFetching: isColorFetching, } = useGetColorMasterQuery({ params: { ...params, isGrey: greyFilter ? true : undefined }, });


    function findYarnTax(id) {
        if (!yarnList) return 0;
        let yarnItem = yarnList.data.find(
            (item) => parseInt(item.id) === parseInt(id)
        );
        return yarnItem ? yarnItem.taxPercent : 0;
    }

    function getTotals(field) {
        const total = poItems.reduce((accumulator, current) => {
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
        return poItems.reduce((acc, row) => {
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
        setPoItems(poItems => {
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
        setPoItems(poItems => {
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
        setPoItems(poItems => {
            const newBlend = structuredClone(poItems);
            if (!newBlend[index]["lotDetails"]) return poItems
            newBlend[index]["lotDetails"] = newBlend[index]["lotDetails"].filter((_, index) => index != lotIndex)
            return newBlend
        })
    }
    let selectedRow = Number.isInteger(currentSelectedLotGrid) ? poItems[currentSelectedLotGrid] : ""
    let taxItems = poItems?.map(item => {
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
            {/* <Modal widthClass={"max-h-[600px] overflow-auto"} onClose={onClose} isOpen={Number.isInteger(currentSelectedLotGrid)}>
                <YarnLotGrid
                    isDirect
                    readOnly={readOnly}
                    onClose={onClose}
                    addNewLotNo={addNewLotNo}
                    removeLotNo={removeLotNo}
                    handleInputChangeLotNo={handleInputChangeLotNo}
                    index={currentSelectedLotGrid}
                    lotDetails={selectedRow?.lotDetails ? selectedRow?.lotDetails : []}
                    inwardLotDetails={selectedRow?.inwardLotDetails ? selectedRow?.inwardLotDetails : []} />
            </Modal> */}


            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-medium text-slate-700">List Of Items</h2>
                    <button className="font-bold text-slate-700 bord"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                setInwardItemSelection(true)

                            }
                        }}
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
                        Fill Po Items
                    </button>

                </div>
                <div className={` relative w-full overflow-y-auto py-1`}>
                    <table className="w-full border-collapse table-fixed">
                        <thead className="bg-gray-200 text-gray-800">
                            <tr>
                                <th
                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    S.No
                                </th>
                                <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Items
                                </th>
                                <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Colors
                                </th>
                                <th

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    UOM
                                </th>
                                {/* <th

                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Lot Det.
                                </th> */}
                                {/* <th

                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    No. of Bags
                                </th> */}
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Quantity
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Price
                                </th>
                                {/* <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Price(with Tax)
                                </th> */}

                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Gross
                                </th>
                                {/* <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    View Tax
                                </th> */}
                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {(poItems ? poItems : [])?.map((row, index) =>
                                <tr className="border border-blue-gray-200 cursor-pointer " >
                                    <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5 ">{index + 1}</td>
                                    <td className="py-0.5 border border-gray-300 text-[11px] ">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "yarnId") } }}
                                            tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 table-data-input'
                                            value={row.yarnId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "yarnId")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "yarnId")
                                            }
                                            }
                                        >
                                            <option >
                                            </option>
                                            {(id ? yarnList?.data : yarnList?.data?.filter(item => item.active))?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend?.name}
                                                </option>)}
                                        </select>
                                    </td>



                                    <td className="py-0.5 border border-gray-300 text-[11px]">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                            disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.colorId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "colorId")
                                            }
                                            }
                                        >
                                            <option hidden>
                                            </option>
                                            {(id ? colorList?.data : colorList?.data.filter(item => item.active))?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend?.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>




                                    <td className="w-40 border border-gray-300 text-[11px] py-0.5">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                            disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.uomId} onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "uomId")
                                            }
                                            }
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


                                    <td className="w-40  border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                                        <input
                                            onKeyDown={e => {
                                                if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                if (e.key === "Delete") { handleInputChange("0.000", index, "qty") }
                                            }}
                                            min={"0"}
                                            type="number"
                                            className="text-right rounded py-1 px-1 w-full table-data-input"
                                            onFocus={(e) => e.target.select()}
                                            // value={sumArray(row?.lotDetails ? row?.lotDetails : [], "qty")}
                                            value={row?.qty}
                                            // disabled={true}
                                            onChange={(e) =>
                                                handleInputChange(e.target.value, index, "qty")
                                            }
                                            onBlur={(e) => {
                                                handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty");
                                            }
                                            }
                                        />
                                    </td>

                                    <td className="w-40 py-0.5 border border-gray-300 text-[11px] text-right">
                                        <input
                                            onKeyDown={e => {
                                                if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                if (e.key === "Delete") { handleInputChange("0.00", index, "price") }
                                            }}
                                            min={"0"}
                                            type="number"
                                            className="text-right rounded py-1 w-full px-1 table-data-input"
                                            onFocus={(e) => e.target.select()}
                                            value={(!row.price) ? 0 : row.price}
                                            disabled={readOnly}
                                            onChange={(e) =>
                                                handleInputChange(e.target.value, index, "price")
                                            }
                                            onBlur={(e) => {
                                                handleInputChange(parseFloat(e.target.value).toFixed(3), index, "price");

                                            }
                                            }
                                        />

                                    </td>



                                    <td className='py-0.5 border border-gray-300 text-[11px] text-right'>
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
                                            onContextMenu={(e) => {
                                                if (!readOnly) {
                                                    handleRightClick(e, index, "shiftTimeHrs");
                                                }
                                            }}
                                        />
                                    </td>



                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
        </>
    );
};

export default YarnPoItems;
