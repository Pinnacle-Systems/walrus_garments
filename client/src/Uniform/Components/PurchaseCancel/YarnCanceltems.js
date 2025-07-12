import React from 'react';
import YarnPoItem from './YarnPoItem';
import { toast } from 'react-toastify';
import { HiPlus } from 'react-icons/hi';


const YarnCancelItems = ({ inwardItems, setInwardItems, readOnly, removeItem, purchaseInwardId }) => {

    const handleInputChange = (value, index, field, balanceQty) => {
        setInwardItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            newBlend[index][field] = value;
            // if (field !== "qty" && newBlend[index]["noOfBags"] && newBlend[index]["weightPerBag"]) {
            //     let tempInwardQty = (parseFloat(newBlend[index]["noOfBags"]) * parseFloat(newBlend[index]["weightPerBag"])).toFixed(3)
            //     if (parseFloat(balanceQty) < parseFloat(tempInwardQty)) {
            //         toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
            //         return inwardItems
            //     }
            //     newBlend[index]["qty"] = tempInwardQty
            // }
            // if (field === "qty") {
            //     if (parseFloat(balanceQty) < parseFloat(value)) {
            //         toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
            //         return inwardItems
            //     }
            //     let qty = parseInt(newBlend[index]["noOfBags"]) * parseFloat(newBlend[index]["weightPerBag"])
            //     let excessQty = parseInt(newBlend[index]["noOfBags"]) * 2
            //     if ((qty + excessQty) < parseFloat(value)) {
            //         toast.info("Excess Qty Cannot be More than 2kg Per Bag", { position: 'top-center' })
            //         return inwardItems
            //     }
            // }
            return newBlend
        });
    };

    return (
        <>
        
            {/* <div className={`w-full overflow-y-auto py-1`}>
                <table className=" text-xs border border-gray-500 table-auto w-full">
                    <thead className='bg-blue-200 border border-gray-500 top-0'>
                        <tr className='h-8'>
                            <th className="table-data text-center">S.no</th>
                            <th className="table-data   text-center">P.no</th>
                            <th className="table-data ">Items</th>
                            <th className="table-data">Colors</th>
                            <th className="table-data">UOM</th>
                            <th className="table-data">Po.Qty</th>
                       

                            <th className="table-data ">Already Return Qty</th>

                            <th className="table-data  "> Balance  Qty</th>  
                                
                     
                            <th className="table-data  ">Cancel Qty</th>
                           

                            {!readOnly &&
                                <th className='table-data'>Del</th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto  h-full w-full'>
                        
                        {inwardItems.map((item, index) => <YarnPoItem readOnly={readOnly} noOfBags={item.noOfBags} weightPerBag={item.weightPerBag} purchaseInwardId={purchaseInwardId} removeItem={removeItem} key={item.poItemsId} qty={item.qty} poItemId={item.poItemsId} index={index} handleInputChange={handleInputChange} />)}
                        {Array.from({ length: 1 - inwardItems.length }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 table-row' key={i}>
                            {Array.from({ length: 9}).map(i =>
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
            
                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="font-bold text-slate-700">List Of Items</h2>
                                <div className="flex gap-2 items-center">
            
                                    <button
                                        onClick={() => {
                                            // addNewRow()
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
                                                doc Id
                                            </th>
                                            <th
            
                                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Items
                                            </th>
                                            <th
            
                                                className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Colors
                                            </th>
                                            <th
            
                                                className={`w-40 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                UOM
                                            </th>
                                            {/* <th
            
                                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Lot Det.
                                            </th> */}
                                      
                                            <th
            
                                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Quantity
                                            </th>
                                            <th
            
                                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                               Already Return Qty
                                            </th>
                                            <th
            
                                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Balance  Qty
                                            </th>
            
                                            {/* <th
            
                                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Gross
                                            </th> */}
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
                                         <tbody className='overflow-y-auto  h-full w-full'>
                        
                        {inwardItems.map((item, index) => <YarnPoItem readOnly={readOnly} noOfBags={item.noOfBags} weightPerBag={item.weightPerBag} purchaseInwardId={purchaseInwardId} removeItem={removeItem} key={item.poItemsId} qty={item.qty} poItemId={item.poItemsId} index={index} handleInputChange={handleInputChange} />)}
                        {Array.from({ length: 1 - inwardItems?.length }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 table-row' key={i}>
                            {Array.from({ length: 8}).map(i =>
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
        </>
    )
}

export default YarnCancelItems