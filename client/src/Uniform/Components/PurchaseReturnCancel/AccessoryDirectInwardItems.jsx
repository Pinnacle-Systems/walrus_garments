import { toast } from 'react-toastify';
import AccessoryPoItem from './AccessoryPoItem';
import AccessoryDirectItem from './AccessoryDirectItem';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetAccessoryMasterQuery } from '../../../redux/uniformService/AccessoryMasterServices';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { useEffect } from 'react';

const AccessoryDirectInwardItems = ({ storeId, directInwardReturnItems, setDirectInwardReturnItems, readOnly, deleteRow, purchaseInwardId, params }) => {


        // useEffect(() => {
        //     if (directInwardReturnItems?.length >= 1) return
        //     setDirectInwardReturnItems(prev => {
        //         let newArray = Array.from({ length: 1 - prev.length }, () => {
        //             return {
        //                 yarnNeedleId: "", machineId: "", fiberContentId: "", description: "", socksMaterialId: "",
        //                 measurements: "", sizeId: "", styleId: "", legcolorId: "", footcolorId: "",
        //                 stripecolorId: "", noOfStripes: "0", qty: "0", socksTypeId: "",
        //             }
        //         })
        //         return [...prev, ...newArray]
        //     }
        //     )
        // }, [setDirectInwardReturnItems, directInwardReturnItems])
    

    const { data: colorList } =
        useGetColorMasterQuery({ params: { ...params } });
    const { data: accessoryList } =
        useGetAccessoryMasterQuery({ params });

    const { data: sizeList } =
        useGetSizeMasterQuery({ params });
    const { data: uomList } =
        useGetUomQuery({ params });

    const handleInputChange = (value, index, field, balanceQty, poItem = undefined) => {
        const newBlend = structuredClone(directInwardReturnItems);
        newBlend[index][field] = value;

        if (poItem) {
            newBlend[index]["poNo"] = poItem?.DirectInwardOrReturn?.docId
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

            newBlend[index]["alreadyInwardedQty"] = poItem?.alreadyInwardedQty ? parseFloat(poItem.alreadyInwardedQty).toFixed(3) : "0.000";
            newBlend[index]["alreadyInwardedRolls"] = poItem?.alreadyInwardedRolls ? parseInt(poItem.alreadyInwardedRolls) : "0";
            newBlend[index]["alreadyReturnedQty"] = poItem?.alreadyReturnedQty ? parseFloat(poItem.alreadyReturnedQty).toFixed(3) : "0.000";
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
            <div className={` bg-white rounded-md shadow-sm max-h-[250px] overflow-auto`}>
                <table className="w-full border-collapse table-fixed">
                    <thead className='bg-gray-200 text-gray-800'>
                        <tr className='h-8 '>
                            <th className="w-12 px-4 py-2 text-center font-medium text-[13px]">S.no</th>
                            <th className="w-32 px-4 py-2 text-center font-medium text-[13px]">Doc.no</th>
                            <th className="w-32 px-4 py-2 text-center font-medium text-[13px] ">Accessory Name</th>
                            <th className="w-32 px-4 py-2 text-center font-medium text-[13px] ">Accessory Items</th>
                            <th className="w-32 px-4 py-2 text-center font-medium text-[13px] ">Accessory Group</th>
                            <th className="w-12 px-4 py-2 text-center font-medium text-[13px] ">Colors</th>
                            <th className="w-12 px-4 py-2 text-center font-medium text-[13px] ">Size</th>
                            <th className="w-12 px-4 py-2 text-center font-medium text-[13px]  ">UOM</th>
                            {/* <th className="w-16 px-4 py-2 text-center font-medium text-[13px] ">Stock Qty</th> */}
                            {/* <th className="w-32 px-4 py-2 text-center font-medium text-[13px] "> Alr.In Qty</th>
                            <th className="w-32 px-4 py-2 text-center font-medium text-[13px] "> Alr.Rtn.Qty</th> */}
                            <th className="w-12 px-4 py-2 text-center font-medium text-[13px] "> Allowed Return Qty</th>
                            <th className="w-12 px-4 py-2 text-center font-medium text-[13px] ">Return Qty</th>
                            <th className="w-12 px-4 py-2 text-center font-medium text-[13px] ">Price</th>
                            <th className="w-12 px-4 py-2 text-center font-medium text-[13px] ">Gross</th>
                            {!readOnly &&                             
                            
                            <th className='w-12 px-4 py-2 text-center font-medium text-[13px]'>Actions</th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto  h-full w-full'>
                        {directInwardReturnItems?.map((item, index) => <AccessoryDirectItem sizeList={sizeList} accessoryList={accessoryList}
                            uomList={uomList}
                            colorList={colorList}
                            item={item} purchaseInwardId={purchaseInwardId} deleteRow={deleteRow} readOnly={readOnly} key={item.poItemsId} index={index} handleInputChange={handleInputChange} />)}
                        {Array.from({ length: 1 - directInwardReturnItems.length }).map(i =>
                            <tr className=' text-gray-800 h-8 border border-gray-600'>
                                {Array.from({ length: 12 }).map(i =>
                                    <td className="table-data   "></td>
                                )}
                                {!readOnly &&
                                    <td className="table-data w-14"></td>
                                }
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}
export default AccessoryDirectInwardItems
