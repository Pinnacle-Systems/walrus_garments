import { toast } from 'react-toastify';
import AccessoryPoItem from './AccessoryPoItem';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetAccessoryMasterQuery } from '../../../redux/uniformService/AccessoryMasterServices';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useEffect } from 'react';
import TransactionLineItemsSection, {
    standardTransactionPlaceholderRowCount,
    transactionTableClassName,
    transactionTableHeadClassName,
} from "../ReusableComponents/TransactionLineItemsSection";

const AccessoryInwardItems = ({ directInwardReturnItems, setDirectInwardReturnItems, readOnly, deleteRow, purchaseInwardId, params, storeId }) => {


        //  useEffect(() => {
        //     // if(id) return
        //     if (directInwardReturnItems?.length >= 1) return;
        //     setDirectInwardReturnItems((prev) => {
        //       let newArray = Array.from({ length: 1 - prev.length }, (i) => {
        //         return {
        //           yarnId: "",
        //           qty: "0.00",
        //           tax: "0",
        //           colorId: "",
        //           uomId: "",
        //           price: "0.00",
        //           discountValue: "0.00",
        //           noOfBags: "0",
        //           discountType: "",
        //           weightPerBag: "0.00",
        //         };
        //       });
        //       return [...prev, ...newArray];
        //     });
        //   }, [setDirectInwardReturnItems, directInwardReturnItems]);

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
            newBlend[index]["poNo"] = poItem?.Po?.docId
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
        if (field === "returnQty") {
            if (parseFloat(balanceQty) < parseFloat(value)) {
                toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
                return
            }
        }
        setDirectInwardReturnItems(newBlend);
    };





    return (
        <>
                  <TransactionLineItemsSection title="List Of Items">
                    <table className={transactionTableClassName}>
                                    <thead className={transactionTableHeadClassName}>
                                        <tr>
                                            <th
                                                className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                S.No
                                            </th>
                                              <th
                                                className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Po.No
                                            </th>
                                            <th
            
                                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
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
                                            {/* <th
            
                                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Lot Det.
                                            </th> */}
                                        
                                            <th
            
                                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                              Po Quantity
                                            </th>
                                           <th
            
                                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                allowed Return Qty
                                            </th>
                                              {/* <th
            
                                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Already Inward Qty
                                            </th>
            
                                            <th
            
                                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                                    Already Return Qty
                                            </th>
                                              <th
            
                                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                               weightPerBag
                                            </th>  */}
                                                  {/* <th
            
                                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                               No Of Bags
                                            </th> 
                                                <th
            
                                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                               weight Per Bag
                                            </th> */}
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
                                                 {!readOnly &&
                                             <th
            
                                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Actions
                                            </th>
                        }
                                        </tr>
                                    </thead>
                            <tbody className='overflow-y-auto  h-full w-full'>
                                            {directInwardReturnItems?.map((item, index) => <AccessoryPoItem uomList={uomList} sizeList={sizeList} accessoryList={accessoryList} colorList={colorList} 
                                            item={item} purchaseInwardId={purchaseInwardId} deleteRow={deleteRow} storeId={storeId}
                                            readOnly={readOnly} key={item.poItemsId} index={index} handleInputChange={handleInputChange} />)}
                                                {Array.from({ length: Math.max(0, standardTransactionPlaceholderRowCount - directInwardReturnItems?.length) }).map(i =>
                                                    <tr className='w-full font-bold h-8 border border-gray-400 tx-table-row'>
                                                        {Array.from({ length: 13 }).map(i =>
                                                            <td className="tx-table-cell w-14  "></td>
                                                        )}
                                                        {!readOnly &&
                                                            <td className="tx-table-cell w-14"></td>
                                                        }
                                                    </tr>)
                }       
                                        </tbody>   
                </table>
            </TransactionLineItemsSection>
        </>
    )
}
export default AccessoryInwardItems
