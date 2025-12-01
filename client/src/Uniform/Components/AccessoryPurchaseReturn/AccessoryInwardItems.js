import { toast } from 'react-toastify';
import AccessoryPoItem from './AccessoryPoItem';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetAccessoryMasterQuery } from '../../../redux/uniformService/AccessoryMasterServices';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useEffect } from 'react';

const AccessoryInwardItems = ({ directInwardReturnItems, setDirectInwardReturnItems, readOnly, deleteRow, purchaseInwardId, params, storeId, contextMenu, handleCloseContextMenu, handleRightClick, poInwardOrDirectInward, colorList, uomList, accessoryList, sizeList }) => {





    const handleInputChange = (value, index, field, balanceQty, poItem = undefined) => {
        const newBlend = structuredClone(directInwardReturnItems);
        newBlend[index][field] = value;

        if (poItem) {
            newBlend[index]["orderId"] = poItem?.orderId
            newBlend[index]["orderDetailsId"] = poItem?.orderDetailsId
            newBlend[index]["accessoryRequirementPlanningId"] = poItem?.accessoryRequirementPlanningId

            newBlend[index]["poNo"] = poItem?.AccessoryPo?.docId
            newBlend[index]["accessoryGroupId"] = poItem?.accessoryGroupId
            newBlend[index]["accessoryItemId"] = poItem?.accessoryItemId
            newBlend[index]["colorId"] = poItem?.colorId
            newBlend[index]["sizeId"] = poItem?.sizeId
            newBlend[index]["discountAmount"] = poItem?.discountAmount
            newBlend[index]["discountType"] = poItem?.discountType
            newBlend[index]["poId"] = poItem?.poId
            newBlend[index]["price"] = poItem?.price
            newBlend[index]["taxPercent"] = poItem?.taxPercent
            newBlend[index]["uomId"] = poItem?.uomId
            newBlend[index]["poQty"] = poItem?.qty
            newBlend[index]["cancelQty"] = poItem?.alreadyCancelData?._sum?.qty ? parseFloat(poItem.alreadyCancelData?._sum?.qty).toFixed(3) : "0.000";
            newBlend[index]["alreadyInwardedQty"] = poItem?.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
            newBlend[index]["alreadyInwardedRolls"] = poItem?.alreadyInwardedData?._sum?.noOfRolls ? parseInt(poItem.alreadyInwardedData._sum.noOfRolls) : "0";
            newBlend[index]["alreadyReturnedQty"] = poItem?.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
            newBlend[index]["alreadyReturnedRolls"] = poItem?.alreadyReturnedData?._sum?.noOfRolls ? parseInt(poItem.alreadyReturnedData._sum.noOfRolls) : "0";
            newBlend[index]["balanceQty"] = poItem?.balanceQty ? parseFloat(poItem.balanceQty).toFixed(3) : "0.000";

            newBlend[index]["stockQty"] = parseFloat(poItem?.stockQty).toFixed(3)
            newBlend[index]["stockRolls"] = parseInt(poItem?.stockRolls)
            newBlend[index]["allowedReturnRolls"] = poItem?.allowedReturnRolls
            newBlend[index]["allowedReturnQty"] = parseFloat(poItem?.allowedReturnQty).toFixed(3)
        }
        if (field === "qty") {
            if (parseFloat(balanceQty) < parseFloat(value)) {
                toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
                return
            }
        }
        setDirectInwardReturnItems(newBlend);
    };





    return (
        <>
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
                                className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Po.No
                            </th>
                            <th

                                className={`w-72 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Accessory Name
                            </th>
                            {/* <th

                                className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Accessory Item
                            </th>
                            <th

                                className={`w-40 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Accessory Group
                            </th> */}
                            <th

                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
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
                                Uom
                            </th>


                            <th

                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Po Quantity
                            </th>
                            <th

                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                BalanceQty
                            </th>


                            <th

                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                            >
                                Return Qty
                            </th>
                            <th

                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                            >
                                Po Price
                            </th>
                            <th

                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                            >
                                Gross
                            </th>
                            <th

                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>{console.log(directInwardReturnItems, "directInwardReturnItemsBefore")}
                    <tbody className='overflow-y-auto  h-full w-full'>
                        {directInwardReturnItems?.map((item, index) => <AccessoryPoItem uomList={uomList} sizeList={sizeList} accessoryList={accessoryList} colorList={colorList}
                            item={item} purchaseInwardId={purchaseInwardId} deleteRow={deleteRow} storeId={storeId}
                            readOnly={readOnly} key={item.accessoryPoItemsId} index={index} handleInputChange={handleInputChange}
                            handleRightClick={handleRightClick} poInwardOrDirectInward={poInwardOrDirectInward}
                        />)}
                        {Array.from({ length: 1 - directInwardReturnItems?.length }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                                {Array.from({ length: 11 }).map(i =>
                                    <td className="table-data w-14  "></td>
                                )}
                                {!readOnly &&
                                    <td className="table-data w-14"></td>
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
                                // handleDeleteAllRows();
                                handleCloseContextMenu();
                            }}
                        >
                            Delete All
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
export default AccessoryInwardItems
