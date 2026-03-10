import { useEffect, useState } from "react";
import { useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { toast } from "react-toastify";
import { capitalizeFirstLetter, findFromList, getUniqueArrayByColor, getUniqueArrayBySize, sumArray } from "../../../Utils/helper";
import { useDispatch, useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { setLastTab, setOpenPartyModal } from "../../../redux/features/openModel";
import Swal from "sweetalert2";
import { useGetStockReportControlQuery } from "../../../redux/uniformService/StockReportControl.Services";

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
    headerOpen
}) => {


    const { data: allData, isLoading, isFetching } = useGetStockReportControlQuery({ params });

    console.log(allData?.data, "allData")



    const handleInputChange = (value, index, field) => {
        console.log(value, "value", index, "index", field, "field")
        const newBlend = structuredClone(poItems);
        if (field == "itemId") {
            const sectionId = findFromList(value, itemList?.data, "sectionId")
            newBlend[index]["sectionId"] = sectionId;
        }


        newBlend[index][field] = value;

        setPoItems(newBlend);
    };

    console.log(headerOpen, "headerOpen",);

useEffect(() => {
  if (id) return;

  const targetRows = headerOpen ? 9 : 15;

  if (poItems?.length >= targetRows) return;

  setPoItems((prev) => {
    const newArray = Array.from({ length: targetRows - prev.length }, () => ({
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
      id: "",
      poItemsId: "",
    }));
    return [...prev, ...newArray];
  });
}, [transType, setPoItems, poItems, headerOpen]);


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














    return (
        <>



            <div className={`border border-slate-200 p-2 bg-white rounded-md shadow-sm ${headerOpen ? " max-h-[330px]" : " max-h-[550px]"}`}>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-slate-700">List Of Inward Items</h2>
                    {/* <button className="font-bold text-slate-700 "
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
                        Fill Inward Items
                    </button> */}

                </div>
                <div className={` relative w-full ${headerOpen ? " h-[250px]" : " h-[500px]"} overflow-y-auto py-1`}>
                    <table className="w-full border-collapse table-fixed">
                        <thead className="bg-gray-200 text-gray-800 top-0 sticky">
                            <tr className="py-2">
                                <th
                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    S.No
                                </th>
                                <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Item
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Size
                                </th>
                                <th

                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Color
                                </th>
                                <th

                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    UOM
                                </th>
                                {allData?.data?.map(element => (
                                    // console.log(Object.keys(element)?.filter(key => key.toLowerCase().includes("field") && !!element[key]), "element")
                                    Object.keys(element)?.filter(key => key.toLowerCase().includes("field") && !!element[key])?.map(i => (
                                        <>
                                            <th
                                                key={i}
                                                className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                {capitalizeFirstLetter(element?.[i])}
                                            </th>

                                        </>
                                    ))
                                ))}

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


                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Gross
                                </th>


                                <th

                                    className={`w-7 px-3 py-2 text-center font-medium text-[13px] `}
                                >

                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {(poItems ? poItems : [])?.map((row, index) =>
                                <tr className="border border-blue-gray-200 cursor-pointer "
                                    onContextMenu={(e) => {
                                        if (!readOnly) {
                                            handleRightClick(e, index, "shiftTimeHrs");
                                        }
                                    }}
                                >
                                    <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5 ">{index + 1}</td>
                                    <td className="py-0.5 border border-gray-300 text-[11px] ">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "itemId") } }}
                                            tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 table-data-input'
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

                                    <td className=" border border-gray-300 text-[11px] py-0.5">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "sizeId") } }}
                                            tabIndex={"0"} className='text-left w-full rounded py-1 table-data-input'
                                            value={row.sizeId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "sizeId")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "sizeId")
                                            }
                                            }
                                            disabled={readOnly || !row.itemId}
                                        >
                                            <option >
                                            </option>
                                            {(id ? sizeList?.data : getUniqueArrayBySize(itemList?.data, sizeList?.data, "sizeId", row?.itemId))?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend?.name}
                                                </option>)}
                                        </select>
                                    </td>

                                    <td className="py-0.5 border border-gray-300 text-[11px]">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                            className='text-left w-full rounded py-1 table-data-input' value={row.colorId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "colorId")
                                            }
                                            }
                                            disabled={readOnly || !row.sizeId}

                                        >
                                            <option hidden>
                                            </option>
                                            {(id ? colorList?.data : (getUniqueArrayByColor(itemList?.data, colorList?.data, "colorId", row?.itemId)))?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend?.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>




                                    <td className="w-40 border border-gray-300 text-[11px] py-0.5">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                            className='text-left w-full rounded py-1 table-data-input' value={row.uomId} onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "uomId")
                                            }
                                            }
                                            disabled={readOnly}

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
                                    {allData?.data?.map(element => (
                                        // console.log(Object.keys(element)?.filter(key => key.toLowerCase().includes("field") && !!element[key]), "element")
                                        Object.keys(element)?.filter(key => key.toLowerCase().includes("field") && !!element[key])?.map(i => (
                                            <>
                                                <td className="w-40  border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                                                    <input
                                                        onKeyDown={e => {
                                                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                            if (e.key === "Delete") { handleInputChange("0.000", index, element?.[i]) }
                                                        }}

                                                        className="text-right rounded py-1 px-1 w-full table-data-input"
                                                        onFocus={(e) => e.target.select()}
                                                        // value={sumArray(row?.lotDetails ? row?.lotDetails : [], "qty")}
                                                        value={row[i]}
                                                        // disabled={readOnly || !row.uomId}
                                                        onChange={(e) =>
                                                            handleInputChange(e.target.value, index, i)
                                                        }
                                                        onBlur={(e) => {
                                                            handleInputChange(e.target.value.toFixed(3), index, i);
                                                        }
                                                        }
                                                    />
                                                </td>
                                                {console.log(element?.[i], 'element')}
                                                {console.log(i, 'iiiiiiiiiiii')}
                                            </>
                                        ))
                                    ))}

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
                            top: `${contextMenu.mouseY - 55}px`,
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
            </div>
        </>
    );
};

export default YarnPoItems;
