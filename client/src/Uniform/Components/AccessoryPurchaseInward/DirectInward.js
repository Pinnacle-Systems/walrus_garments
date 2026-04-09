import { toast } from 'react-toastify';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetAccessoryMasterQuery } from '../../../redux/uniformService/AccessoryMasterServices';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { HiPlus } from 'react-icons/hi';
import { useEffect } from 'react';
import AccessoryPoItem from './AccessoryPoItem';
import Swal from 'sweetalert2';
import DirectInwardItems from './DirectInwardItems';

const DirectInward = ({ inwardItems, setInwardItems, readOnly, setInwardItemSelection, purchaseInwardId, params, id, supplierId,
    contextMenu, handleCloseContextMenu, handleRightClick, accessoryList,
    accessoryGroupList,
    accessoryItemList,
    colorList,
    uomList,
    sizeList,
}) => {

    console.log(inwardItems, "inwardItems")

    // const { data: colorList } =
    //     useGetColorMasterQuery({ params: { ...params } });


    // const { data: uomList } =
    //     useGetUomQuery({ params });

    // const { data: accessoryList } =
    //     useGetAccessoryMasterQuery({ params });

    // const { data: sizeList } =
    //     useGetSizeMasterQuery({ params });



    const handleInputChange = (value, index, field, balanceQty, poItem = undefined) => {
        console.log(poItem, "poItem")
        const newBlend = structuredClone(inwardItems);
        console.log(inwardItems, "inwardItems")

        newBlend[index][field] = value;


        if (poItem) {

            newBlend[index]["poNo"] = poItem?.AccessoryPo?.docId
            newBlend[index]["poItemsId"] = poItem?.AccessoryPo?.id

            newBlend[index]["colorId"] = poItem?.colorId
            newBlend[index]["accessoryGroupId"] = poItem?.accessoryGroupId
            newBlend[index]["accessoryItemId"] = poItem?.accessoryItemId
            newBlend[index]["sizeId"] = poItem?.sizeId
            newBlend[index]["discountAmount"] = poItem?.discountAmount
            newBlend[index]["discountType"] = poItem?.discountType
            newBlend[index]["poId"] = poItem?.poId
            newBlend[index]["price"] = poItem?.price
            newBlend[index]["taxPercent"] = poItem?.tax
            newBlend[index]["uomId"] = poItem?.uomId
            newBlend[index]["poQty"] = poItem?.qty
            newBlend[index]["cancelQty"] = poItem?.alreadyCancelData?._sum?.qty ? parseFloat(poItem.alreadyCancelData?._sum?.qty).toFixed(3) : "0.000";
            newBlend[index]["alreadyInwardedQty"] = poItem?.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
            newBlend[index]["alreadyReturnedQty"] = poItem?.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
            newBlend[index]["balanceQty"] = poItem?.balanceQty ? parseFloat(poItem.balanceQty).toFixed(3) : "0.000";
        }
        if (field === "qty") {
            if (parseFloat(balanceQty) < parseFloat(value)) {
                toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
                return
            }
        }
        setInwardItems(newBlend);
    };



    useEffect(() => {
        if (id) return
        if (inwardItems?.length >= 1) return;
        setInwardItems((prev) => {
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
                };
            });
            return [...prev, ...newArray];
        });
    }, [setInwardItems, inwardItems]);
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
        };
        setInwardItems([...inwardItems, newRow]);
    };
    const deleteRow = (id) => {
        setInwardItems((yarnBlend) =>
            yarnBlend.filter((row, index) => index !== parseInt(id))
        );
    };
    return (
        <>
            {/* <div className={`relative w-full overflow-auto py-1`}>
                <table className="border border-gray-500 text-xs table-auto w-full  ">
                    <thead className='bg-gray-300 border border-gray-500 top-0'>
                        <tr className='h-8 '>
                            <th className="tx-table-cell w-5  text-center">S.no</th>
                            <th className="tx-table-cell  w-16 text-center">Po.no</th>
                            <th className="tx-table-cell  ">Accessory Name</th>
                            <th className="tx-table-cell  ">Accessory Items</th>
                            <th className="tx-table-cell  ">Accessory Group</th>
                            <th className="tx-table-cell  ">Colors</th>
                            <th className="tx-table-cell  ">Size</th>
                            <th className="tx-table-cell   ">UOM</th>
                            <th className="tx-table-cell  w-14">Po. Qty</th>
                            <th className="tx-table-cell  w-14"> Can. Qty</th>
                            <th className="tx-table-cell  w-14"> A. In Qty</th>
                            <th className="tx-table-cell  w-14"> A. Return Qty</th>
                            <th className="tx-table-cell  w-14">Bal. Qty</th>
                            <th className="tx-table-cell  w-14">In. Qty</th>
                            <th className="tx-table-cell  w-14">Po Price</th>
                            <th className="tx-table-cell  w-14">Gross</th>
                            {!readOnly &&
                                <th className='tx-table-cell border  w-12'>Delete</th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto  h-full w-full'>{console.log(inwardItems,"InwardItems")}
                        {inwardItems?.map((item, index) => <AccessoryPoItem uomList={uomList} sizeList={sizeList} accessoryList={accessoryList} colorList={colorList} item={item} purchaseInwardId={purchaseInwardId} removeItem={removeItem} readOnly={readOnly} key={item.poItemsId} index={index} handleInputChange={handleInputChange} />)}
                        {Array.from({ length: 1 - inwardItems?.length }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 tx-table-row'>
                                {Array.from({ length: 16 }).map(i =>
                                    <td className="tx-table-cell   "></td>
                                )}
                                {!readOnly &&
                                    <td className="tx-table-cell w-14"></td>
                                }
                            </tr>)
                        }
                    </tbody>
                </table>
            </div> */}
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-medium text-slate-700">List Of Items</h2>
                    {/* <div className="flex gap-2 items-center">

                        <button
                            onClick={() => {
                                addNewRow()
                            }}
                            className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                        >
                            <HiPlus className="w-3 h-3 mr-1" />
                            Add Item
                        </button>
                    </div> */}
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
                            Fill Accessory Po Items
                        </button>
                    </div>
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
                                    Accessory Name
                                </th>
                                <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Accessory Items
                                </th>
                                <th

                                    className={`w-40 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Accessory Group
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Colors
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

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Inward Qty
                                </th>
                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Price
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
                        </thead>
                        <tbody className='overflow-y-auto  h-full w-full'>
                            {inwardItems?.map((row, index) => (
                                <tr key={index} className="border border-blue-gray-200 cursor-pointer">
                                    <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                                        {index + 1}
                                    </td>
                                    <td className='py-0.5 border border-gray-300 text-[11px]'>
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryGroupId") } }}
                                            disabled={readOnly} className='text-left w-full rounded py-1 tx-table-input' value={row.accessoryGroupId}
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
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryItemId") } }}
                                            disabled={readOnly} className='text-left w-full rounded py-1 tx-table-input' value={row.accessoryItemId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "accessoryItemId")}
                                            onBlur={(e) => {

                                                handleInputChange(e.target.value, index, "accessoryItemId")

                                            }
                                            }
                                        >
                                            <option hidden>
                                            </option>
                                            {(id ? (accessoryItemList?.data || []) : accessoryItemList?.data?.filter(item => item.active && item?.accessoryGroupId == row?.accessoryGroupId) || []).map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>
                                    <td className='py-0.5 border border-gray-300 text-[11px]'>
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryId") } }}
                                            disabled={readOnly} className='text-left w-full rounded py-1 tx-table-input' value={row.accessoryId}
                                            onChange={(e) => handleInputChange(e.target.value, index, "accessoryId")}
                                            onBlur={(e) => {

                                                handleInputChange(e.target.value, index, "accessoryId")

                                            }
                                            }
                                        >
                                            <option hidden>
                                            </option>
                                            {(id ? (accessoryList?.data || []) : accessoryList?.data?.filter(item => item.active && item?.accessoryItemId == row?.accessoryItemId) || [])?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend.aliasName}
                                                </option>
                                            )}
                                        </select>
                                    </td>

                                    <td className='py-0.5 border border-gray-300 text-[11px]'>
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                            disabled={readOnly} className='text-left w-full rounded py-1 tx-table-input' value={row.colorId}
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
                                            disabled={readOnly} className='text-left w-20 rounded py-1 tx-table-input' value={row.sizeId}
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
                                            disabled={readOnly} className='text-left w-20 rounded py-1 tx-table-input' value={row.uomId}
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
                                    <td className='py-0.5 border border-gray-300 text-[11px]'>
                                        <input
                                            onKeyDown={e => {
                                                if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                if (e.key === "Delete") { handleInputChange("0.000", index, "qty") }
                                            }}
                                            min={"0"}
                                            type="number"
                                            onFocus={(e) => e.target.select()}
                                            className="text-right rounded py-1 px-1 w-full tx-table-input"
                                            value={(!row.qty) ? 0 : row.qty}
                                            disabled={readOnly}
                                            onChange={(e) =>
                                                handleInputChange(parseFloat(e.target.value), index, "qty")
                                            }
                                            onBlur={(e) => {
                                                handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty");

                                            }
                                            }

                                        />

                                    </td>
                                    <td className='py-0.5 border border-gray-300 text-[11px]'>
                                        <input
                                            onKeyDown={e => {
                                                if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                if (e.key === "Delete") { handleInputChange("0.00", index, "price") }
                                            }}
                                            min={"0"}
                                            type="number"
                                            onFocus={(e) => e.target.select()}
                                            className="text-right rounded py-1 px-1 w-full tx-table-input"
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

                                    <td className='py-0.5 border border-gray-300 text-[11px]'>
                                        <input
                                            type="number"
                                            onFocus={(e) => e.target.select()}
                                            className="text-right rounded py-1 px-1 w-full"
                                            value={(!row.qty || !row.price) ? 0 : (parseFloat(row.qty || 0) * parseFloat(row.price || 0)).toFixed(3)}
                                            disabled={true}
                                        />
                                    </td>

                          
                                    <td className="w-16 px-1 py-1 border border-gray-300 text-center">
                                        <input
                                            readOnly
                                            className="w-full bg-transparent  text-right pr-2"
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
            </div>
        </>
    )
}
export default DirectInward
