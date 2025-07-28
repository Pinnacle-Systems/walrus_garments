import { toast } from 'react-toastify';
import AccessoryPoItem from './AccessoryPoItem';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetAccessoryMasterQuery } from '../../../redux/uniformService/AccessoryMasterServices';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { HiPlus } from 'react-icons/hi';
import { useEffect } from 'react';

const AccessoryCancelItems = ({ inwardItems, setInwardItems, readOnly, removeItem, purchaseInwardId, params }) => {


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
            newBlend[index][field] = value
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
                    toast.info("Cancel Qty Can not be more than balance Qty", { position: 'top-center' })
                    return inwardItems
                }
            }
            return newBlend
        });
    };

    
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
          noOfBags : "0.00"
        };
        setInwardItems([...inwardItems, newRow]);
      };

          useEffect(() => {
              // if(id) return
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
                    noOfBags: 0.00,
                    discountType: "",
                    weightPerBag: 0.00,
                  };
                });
                return [...prev, ...newArray];
              });
            }, [ setInwardItems, inwardItems]);

                  const deleteRow = (id) => {
        setInwardItems((yarnBlend) =>
          yarnBlend.filter((row, index) => index !== parseInt(id))
        );
      };
    return (
        <>
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
                                    <div className="flex justify-between items-center mb-2">
                                        <h2 className="font-bold text-slate-700">List Of Items</h2>
                                        <div className="flex gap-2 items-center">
                    
                                            <button
                                                onClick={() => {
                                                    addNewRow()
                                                }}
                                                className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                                            >
                                                <HiPlus className="w-3 h-3 mr-1" />
                                                Add Item
                                            </button>
                                        </div>
                    
                                    </div>
                                     <div className={` relative w-full overflow-y-auto py-1`}>
                    <table className="w-full border-collapse table-fixed">
                                    <thead className="bg-gray-200 text-gray-900">
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
                                               Acc. Name
                                            </th>
                                            <th
            
                                                className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                               Acc. Items
                                            </th>
                                            <th
            
                                                className={`w-40 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                               Acc. Group
                                            </th>
                                            {/* <th
            
                                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Lot Det.
                                            </th> */}
                                      
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
                                                UOM
                                            </th>
            
                                            <th
            
                                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Price
                                            </th>
                                                     <th
            
                                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Po qty
                                            </th>
                                             <th
            
                                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Cancel Qty
                                            </th>
                                             <th
            
                                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Actions
                                            </th>
                                            {/* ))} */}
                                        </tr>
                                    </thead>
                                               <tbody className='overflow-y-auto  h-full w-full'>{console.log(inwardItems, "inwardItems")}
                        {inwardItems.map((item, index) => <AccessoryPoItem sizeList={sizeList} accessoryList={accessoryList}
                            uomList={uomList}
                            colorList={colorList} item={item} purchaseInwardId={purchaseInwardId} deleteRow={deleteRow} readOnly={readOnly} key={item.poItemsId} qty={item.qty} poItemId={item.poItemsId} index={index} handleInputChange={handleInputChange} />)}
                        {Array.from({ length: 1 - inwardItems.length }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                                {Array.from({ length: 15 }).map(i =>
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
                                                                        </div>

            {/* <div className={`relative w-full overflow-auto py-1`}>
                <table className="border border-gray-500 text-xs table-auto w-full  ">
                    <thead className='bg-blue-200 border border-gray-500 top-0'>
                        <tr className='h-8 '>
                            <th className="table-data   text-center">S.no</th>
                            <th className="table-data    text-center">Po.no</th>
                            <th className="table-data  ">Acc. Name</th>
                            <th className="table-data  ">Acc. Items</th>
                            <th className="table-data  ">Acc. Group</th>
                            <th className="table-data  ">Colors</th>
                            <th className="table-data  ">Size</th>
                            <th className="table-data   ">UOM</th>
                            <th className="table-data   ">Po Qty</th>
                            <th className="table-data   ">A.Can Qty</th>
                            <th className="table-data   ">A.In. Qty</th>
                            <th className="table-data   ">A.Rtn. Qty</th>
                            <th className="table-data   ">Bal.Qty</th>
                            <th className="table-data   ">Can. Qty<span className="text-red-500">*</span></th>
                            <th className="table-data   ">Price</th>
                            {!readOnly &&
                                <th className='table-data border  w-12'>Del</th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto  h-full w-full'>{console.log(inwardItems, "inwardItems")}
                        {inwardItems.map((item, index) => <AccessoryPoItem sizeList={sizeList} accessoryList={accessoryList}
                            uomList={uomList}
                            colorList={colorList} item={item} purchaseInwardId={purchaseInwardId} removeItem={removeItem} readOnly={readOnly} key={item.poItemsId} qty={item.qty} poItemId={item.poItemsId} index={index} handleInputChange={handleInputChange} />)}
                        {Array.from({ length: 1 - inwardItems.length }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                                {Array.from({ length: 15 }).map(i =>
                                    <td className="table-data   "></td>
                                )}
                                {!readOnly &&
                                    <td className="table-data w-10"></td>
                                }
                            </tr>)
                        }
                    </tbody>
                </table>
            </div> */}
        </>
    )
}
export default AccessoryCancelItems
