import { toast } from 'react-toastify';
import AccessoryPoItem from './AccessoryPoItem';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetAccessoryMasterQuery } from '../../../redux/uniformService/AccessoryMasterServices';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { HiPlus } from 'react-icons/hi';
import { useEffect } from 'react';
import { standardTransactionPlaceholderRowCount } from "../ReusableComponents/TransactionLineItemsSection";

const AccessoryInwardItems = ({ inwardItems, setInwardItems, readOnly, removeItem, purchaseInwardId, params ,id}) => {



    const { data: colorList } =
        useGetColorMasterQuery({ params: { ...params } });


    const { data: uomList } =
        useGetUomQuery({ params });

    const { data: accessoryList } =
        useGetAccessoryMasterQuery({ params });

    const { data: sizeList } =
        useGetSizeMasterQuery({ params });



    const handleInputChange = (value, index, field, balanceQty, poItem = undefined) => {
        const newBlend = structuredClone(inwardItems);
        newBlend[index][field] = value;
        if (poItem) {
            newBlend[index]["poNo"] = poItem?.Po?.docId

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
        if(id) return
        if (inwardItems?.length >= standardTransactionPlaceholderRowCount) return;
        setInwardItems((prev) => {
          let newArray = Array.from({ length: standardTransactionPlaceholderRowCount - prev.length }, (i) => {
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
                                    <thead className="bg-gray-200 text-gray-800">
                                        <tr>
                                            <th
                                                className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                S.No
                                            </th>
                                              <th
                                                className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Po.No
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
                                                Cancel Qty
                                            </th>
                                             <th
            
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
                                                Balance Qty
                                            </th> 
                                                  {/* <th
            
                                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                               No Of Rolls
                                            </th>  */}
                                                  <th
            
                                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Inward Qty
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
                                    </thead>
                                        <tbody className='overflow-y-auto  h-full w-full'>
                                            {inwardItems?.map((item, index) => <AccessoryPoItem uomList={uomList} sizeList={sizeList} accessoryList={accessoryList} colorList={colorList} item={item} purchaseInwardId={purchaseInwardId} deleteRow={deleteRow} 
                                            readOnly={readOnly} key={item.poItemsId} index={index} handleInputChange={handleInputChange} />)}
                                                {Array.from({ length: Math.max(0, standardTransactionPlaceholderRowCount - inwardItems?.length) }).map(i =>
                                                    <tr className='w-full font-bold h-8 border border-gray-400 tx-table-row'>
                                                        {Array.from({ length: 15 }).map(i =>
                                                            <td className="tx-table-cell   "></td>
                                                        )}
                                                        {!readOnly &&
                                                            <td className="tx-table-cell w-14"></td>
                                                        }
                                                    </tr>)
                }       
                                        </tbody>           
                    </table>
                  </div>
                   </div>
        </>
    )
}
export default AccessoryInwardItems
