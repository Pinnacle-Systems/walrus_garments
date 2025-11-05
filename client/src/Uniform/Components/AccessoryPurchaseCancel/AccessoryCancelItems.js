import { toast } from "react-toastify";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetAccessoryMasterQuery } from "../../../redux/uniformService/AccessoryMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useEffect } from "react";
import { HiPlus } from "react-icons/hi";
import AccessoryPoItem from "./AccessoryPoItem";
import Swal from "sweetalert2";


const AccessoryCancelItems = ({ inwardItems, setInwardItems, readOnly, setInwardItemSelection, id, params, supplierId, contextMenu, handleCloseContextMenu, poInwardOrDirectInward, handleRightClick
}) => {


    const { data: colorList } =
        useGetColorMasterQuery({ params: { ...params } });
    const { data: accessoryList } =
        useGetAccessoryMasterQuery({ params });

    const { data: sizeList } =
        useGetSizeMasterQuery({ params });
    const { data: uomList } =
        useGetUomQuery({ params });



    const handleInputChange = (value, index, field, balanceQty, poItem = undefined) => {
        setInwardItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            console.log(newBlend, "newBlend",index)

            newBlend[index][field] = value
            if (poItem) {
                newBlend[index]["poNo"] = poItem?.AccessoryPo?.docId
                newBlend[index]["accessoryGroupId"] = poItem?.accessoryGroupId
                newBlend[index]["accessoryItemId"] = poItem?.accessoryItemId
                newBlend[index]["colorId"] = poItem?.colorId
                newBlend[index]["sizeId"] = poItem?.sizeId
                newBlend[index]["discountAmount"] = poItem?.discountAmount
                newBlend[index]["discountType"] = poItem?.discountType
                newBlend[index]["poId"] = poItem?.accessoryPoId
                newBlend[index]["poItemsId"] = poItem?.id

                newBlend[index]["price"] = poItem?.price
                newBlend[index]["taxPercent"] = poItem?.taxPercent
                newBlend[index]["uomId"] = poItem?.uomId
                newBlend[index]["poQty"] = poItem?.qty
                newBlend[index]["cancelQty"] = poItem?.alreadyCancelData?._sum?.qty ? parseFloat(poItem.alreadyCancelData?._sum?.qty).toFixed(3) : "0";
                newBlend[index]["alreadyInwardedQty"] = poItem?.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0";
                newBlend[index]["alreadyInwardedRolls"] = poItem?.alreadyInwardedData?._sum?.noOfRolls ? parseInt(poItem.alreadyInwardedData._sum.noOfRolls) : "0";
                newBlend[index]["alreadyReturnedQty"] = poItem?.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0";
                newBlend[index]["alreadyReturnedRolls"] = poItem?.alreadyReturnedData?._sum?.noOfRolls ? parseInt(poItem.alreadyReturnedData._sum.noOfRolls) : "0";
                newBlend[index]["balanceQty"] = poItem?.balanceQty ? parseFloat(poItem.balanceQty).toFixed(3) : "0.000";

                newBlend[index]["stockQty"] = parseFloat(poItem?.stockQty).toFixed(3)
                newBlend[index]["stockRolls"] = parseInt(poItem?.stockRolls)
                newBlend[index]["allowedReturnRolls"] = poItem?.allowedReturnRolls
                newBlend[index]["allowedReturnQty"] = parseFloat(poItem?.allowedReturnQty).toFixed(3)
            }




            if (field === "qty") {
                if (parseFloat(balanceQty) < parseFloat(value)) {
                    // toast.info("Cancel Qty Can not be more than balance Qty", { position: 'top-center' })
                    Swal.fire({
                        icon: 'success',
                        title: "Cancel Qty Can not be more than balance Qty",
                        showConfirmButton: false,
                        timer: 2000
                    });
                    return inwardItems
                }
            }
            return newBlend
        });
    };





    const deleteRow = (id) => {
        setInwardItems((yarnBlend) =>
            yarnBlend.filter((row, index) => index !== parseInt(id))
        );
    };
    const handleDeleteAllRows = () => {
        setInwardItems([]);
    };
    return (
        <>
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-slate-700">List Of Items</h2>
                    <div className="flex gap-2 items-center">


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

                </div>
                <div className={` relative w-full overflow-y-auto py-1`}>
                    <table className="w-full border-collapse ">
                        <thead className="bg-gray-200 text-gray-900 overflow-x-auto ">
                            <tr>
                                <th
                                    className={`w-3 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    S.No
                                </th>
                                <th
                                    className={`w-28 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Po.No
                                </th>
                                <th

                                    className={`w-96 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Accessory Name
                                </th>
                                {/* <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Accessory Items
                                </th>
                                <th

                                    className={`w-40 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Accessory Group
                                </th> */}


                                <th

                                    className={`w-28 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Color
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Size
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    UOM
                                </th>
                                <th

                                    className={`w-24 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Po qty
                                </th>


                                <th

                                    className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Balance Qty
                                </th>


                                <th

                                    className={`w-24 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Cancel Qty
                                </th>
                                <th

                                    className={`w-32 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Cancel Type
                                </th>
                                <th

                                    className={`w-24 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Price
                                </th>
                                <th

                                    className={`w-24 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Gross
                                </th>
                                <th

                                    className={`w-5 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className='overflow-y-auto  h-full w-full'>{console.log(inwardItems, "inwardItems")}
                            {inwardItems.map((item, index) => <AccessoryPoItem sizeList={sizeList} accessoryList={accessoryList}
                                uomList={uomList}
                                colorList={colorList} item={item} purchaseInwardId={id} deleteRow={deleteRow} readOnly={readOnly} key={item.poItemsId} qty={item.qty} poItemId={item.poItemsId} index={index} handleInputChange={handleInputChange} handleRightClick={handleRightClick} poInwardOrDirectInward={poInwardOrDirectInward} />)}
                            {Array.from({ length: 1 - inwardItems.length }).map(i =>
                                <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                                    {Array.from({ length: 16 }).map(i =>
                                        <td className="table-data   "></td>
                                    )}
                                    {!readOnly &&
                                        <td className="table-data w-10"></td>
                                    }
                                </tr>)
                            }
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
                                    deleteRow(contextMenu.rowId);
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
export default AccessoryCancelItems
