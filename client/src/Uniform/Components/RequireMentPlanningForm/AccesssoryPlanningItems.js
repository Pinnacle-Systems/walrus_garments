import { Plus } from "lucide-react"
import { useState } from "react"
import { useEffect } from "react"
import Swal from "sweetalert2"

const AccessoryRequirementPlannig = ({ setAccessoryItems, readOnly, accessoryGroupList, id, accessoryCategoryList, accessoryList, accessoryItems, uomList, colorList, sizeList, requirementItems, orderSizeDetails, tempOrderDetailsId, tempOrderId }) => {


    useEffect(() => {
        if (accessoryItems?.length >= 6) return
        setAccessoryItems(prev => {
            let newArray = Array?.from({ length: 6 - prev?.length }, () => {
                return {
                    accessoryId: "",
                    poqty: orderQty
                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setAccessoryItems, accessoryItems])


    console.log(accessoryItems, "accessoryItems")


    const orderQty = orderSizeDetails?.reduce?.((sum, item) => {
        return sum + item.qty
    }, 0)

    console.log(orderQty, "orderQty")
    const [contextMenu, setContextMenu] = useState(null);

    const handleRightClick = (event, rowIndex, type) => {

        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            rowId: rowIndex,
            type,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    function addNewRow() {
        if (readOnly) {

            Swal.fire({
                title: "Turn On Edit Mode",
                icon: "warning",
                draggable: true,
                timer: 1000,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            return
        }
        setAccessoryItems(prev => [
            ...prev,
            {
                qty: "", sizeMeasurement: "", sizeId: ""

            }
        ]);
    }


    const handleDeleteRow = (id) => {
        console.log(id, "idddddddddddddddd");

        setAccessoryItems((prevOrderDetails) => {
            console.log(prevOrderDetails, "prevOrderDetails");
            return prevOrderDetails?.filter((_, index) => index !== id);
        });
    };




    const handleDeleteAllRows = () => {
        setAccessoryItems((prevRows) => {
            if (prevRows.length <= 1) return prevRows;
            return [prevRows[0]];
        });
    };


    function handleInputChange(value, index, field) {

        setAccessoryItems(accessoryItems => {
            const newBlend = structuredClone(accessoryItems);
            newBlend[index][field] = value
            newBlend[index]["orderId"] = tempOrderId
            newBlend[index]["orderDetailsId"] = tempOrderDetailsId

            return newBlend
        });
    };

    return (
        <>
            <div className=" p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
                {/* <div className="flex justify-between items-center mb-2">
                        PoQty {orderQty}
                </div> */}

                <div className={` relative w-[95%] overflow-y-auto py-1`}>
                    <table className="w-full border-collapse table-fixed">
                        <thead className="bg-gray-200 text-gray-900">
                            <tr>
                                <th
                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    S.No
                                </th>
                                <th

                                    className={`w-48 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Accessory Group
                                </th>
                                <th

                                    className={`w-44 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Accessory Category
                                </th>
                                <th

                                    className={`w-80 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Accessory Name
                                </th>

                                <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Color
                                </th>

                                <th

                                    className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Size
                                </th>
                                <th

                                    className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    UOM
                                </th>
                                <th

                                    className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    PoQty
                                </th>


                                <th

                                    className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Qty
                                </th>



                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            {accessoryItems?.map((row, index) => (
                                <tr key={index} className="border border-blue-gray-200 cursor-pointer"

                                    onContextMenu={(e) => {
                                        if (!readOnly) {
                                            handleRightClick(e, index, "notes");
                                        }
                                    }}
                                >
                                    <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                                        {index + 1}
                                    </td>
                                    <td className='py-0.5 border border-gray-300 text-[11px]'>
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryGroupId") } }}
                                            disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.accessoryGroupId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "accessoryGroupId")}
                                            onBlur={(e) => {

                                                handleInputChange(e.target.value, index, "accessoryGroupId")

                                            }
                                            }
                                        >
                                            <option hidden>
                                            </option>
                                            {(id ? (accessoryGroupList?.data || []) : accessoryGroupList?.data.filter(item => item.active) || []).map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>
                                    <td className='py-0.5 border border-gray-300 text-[11px]'>
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryCategoryId") } }}
                                            disabled={readOnly || !row.accessoryGroupId} className='text-left w-full rounded py-1 table-data-input' value={row.accessoryCategoryId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "accessoryCategoryId")}
                                            onBlur={(e) => {

                                                handleInputChange(e.target.value, index, "accessoryCategoryId")

                                            }
                                            }
                                        >
                                            <option hidden>
                                            </option>
                                            {(id ? (accessoryCategoryList?.data || []) : accessoryCategoryList?.data?.filter(item => item.active) || []).map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>
                                    <td className='py-0.5 border border-gray-300 text-[11px]'>
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryId") } }}
                                            disabled={readOnly || !row.accessoryCategoryId} className='text-left w-full rounded py-1 table-data-input' value={row.accessoryId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "accessoryId")}
                                            onBlur={(e) => {

                                                handleInputChange(e.target.value, index, "accessoryId")

                                            }
                                            }
                                        >
                                            <option hidden>
                                            </option>
                                            {(id ? (accessoryList?.data || []) : accessoryList?.data?.filter(item => item.active && item?.accessoryCategoryId == row?.accessoryCategoryId && item?.accessoryGroupId == row?.accessoryGroupId) || [])?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend.aliasName}
                                                </option>
                                            )}
                                        </select>
                                    </td>
                                    <td className='py-0.5 border border-gray-300 text-[11px]'>
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                            disabled={readOnly || !row.accessoryId} className='text-left w-full rounded py-1 table-data-input' value={row.colorId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                                            onBlur={(e) => {

                                                handleInputChange(e.target.value, index, "colorId")

                                            }
                                            }
                                        >
                                            <option hidden>
                                            </option>
                                            {(id ? colorList?.data : colorList?.data?.filter(item => item.active))?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>
                                    <td className='py-0.5 border border-gray-300 text-[11px]'>
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "sizeId") } }}
                                            disabled={readOnly || !row.accessoryId} className='text-left w-20 rounded py-1 table-data-input' value={row.sizeId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "sizeId")}
                                            onBlur={(e) => {

                                                handleInputChange(e.target.value, index, "sizeId")

                                            }
                                            }
                                        >
                                            <option hidden>
                                            </option>
                                            {(id ? sizeList?.data : sizeList?.data?.filter(item => item.active))?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>
                                    <td className='py-0.5 border border-gray-300 text-[11px]'>
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                            disabled={readOnly || !row.accessoryId} className='text-left w-20 rounded py-1 table-data-input' value={row.uomId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                                            onBlur={(e) => {

                                                handleInputChange(e.target.value, index, "uomId")

                                            }
                                            }
                                        >
                                            <option hidden>
                                            </option>
                                            {(id ? uomList?.data : uomList?.data.filter(item => item.active))?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>
                                    <td className='py-0.5 border border-gray-300 text-[11px] text-right'>
                                        {row?.uomId ? parseFloat(orderQty).toFixed(3) : ""}
                                    </td>
                                    <td className='py-0.5 border border-gray-300 text-[11px]'>
                                        <input
                                            onKeyDown={e => {
                                                if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                if (e.key === "Delete") { handleInputChange("0.000", index, "qty") }
                                            }}
                                            min={"0"}
                                            type="number"
                                            onFocus={(e) => e.target.select()}
                                            className="text-right rounded py-1 px-1 w-full table-data-input"
                                            value={(!row.requiredQty) ? 0 : row.requiredQty}
                                            disabled={readOnly || !row.accessoryId}
                                            onChange={(e) =>
                                                handleInputChange(parseFloat(e.target.value), index, "requiredQty")
                                            }
                                            onBlur={(e) => {
                                                handleInputChange(parseFloat(e.target.value).toFixed(3), index, "requiredQty");

                                            }
                                            }

                                        />

                                    </td>

                                    <td
                                        className="w-10 border border-gray-300"

                                    >
                                        <button
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addNewRow();
                                                }
                                            }}
                                            className="flex items-center justify-center w-full py-1"
                                        >
                                            <Plus size={18} className="text-red-800" />
                                        </button>
                                    </td>


                                </tr>
                            ))}
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
    )
}

export default AccessoryRequirementPlannig;