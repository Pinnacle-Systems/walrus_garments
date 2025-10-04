import React, { useState } from 'react';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from "react-secure-storage";
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { findFromList } from '../../../Utils/helper';
import AccessoryPoItemSelection from './AccessoryPoItemSelection';


const PoItemsSelection = ({ transtype, supplierId, setInwardItems, inwardItems, setInwardItemSelection , poInwardOrDirectInward }) => {


    const [localInwardItems, setLocalInwardItems] = useState(inwardItems?.filter(i => i.poItemsId !== ""));
    // const [localInwardItems, setLocalInwardItems] = useState(
    //     inwardItems
    //         ?.filter(i => i.poItemsId !== "")
    //         .map(i => ({ id: i.poItemsId }))
    // );


    console.log(localInwardItems, "localInwardItems")






    function addItem(id, obj) {
        // setInwardItems([])
        setLocalInwardItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);

            newItems.push(obj);
            return newItems
        });
    }

    function removeItem(id) {
        console.log(id, "removeid")
        console.log(localInwardItems?.filter(item => item?.id), "localInwardItemsremove")

        setLocalInwardItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems.filter(item => item?.id));
            newItems = newItems?.filter(item => parseInt(item.id) !== parseInt(id))
            return newItems
        });
    }

    // console.log(localInwardItems, "isChecked", localInwardItems?.findIndex(item => parseInt(item?.id) === parseInt(id)) !== -1)
    function isItemAdded(id) {
        return localInwardItems?.findIndex(item => parseInt(item.id || item.poItemsId) === parseInt(id)) !== -1;
    }

    function handleChange(id, obj) {
        if (isItemAdded(id, obj)) {
            removeItem(id)
        } else {
            addItem(id, obj)
        }
    }


    function handleSelectAllChange(value, poItems) {
        if (value) {
            poItems?.forEach(item => addItem(item.id, item))
        } else {
            poItems?.forEach(item => removeItem(item.id))
        }
    }

    function getSelectAll(poItems) {
        return poItems?.every(item => isItemAdded(item.id))
    }

    function handleDone() {
        setInwardItemSelection([])
        setInwardItems(prevInwardItems => {
            let oldInwardItems = prevInwardItems?.filter(item => isItemAdded(item.poItemsId))
            let newInwardItems = localInwardItems?.filter(item => {
                return prevInwardItems?.findIndex(prevItem => parseInt(prevItem?.poItemsId) === parseInt(item)) === -1
            })
            console.log([...oldInwardItems, ...newInwardItems], "...oldInwardItems, ...newInwardItems")
            return [...oldInwardItems, ...newInwardItems?.map(poItem => {
                return {

                    poItemsId: poItem?.id,
                    orderId: poItem?.AccessoryPo?.orderId,
                    poNo: poItem?.AccessoryPo?.docId,
                    fabricId: poItem?.fabricId,
                    colorId: poItem?.colorId,
                    gaugeId: poItem?.gaugeId,
                    gsmId: poItem?.gsmId,
                    fDiaId: poItem?.fDiaId,
                    designId: poItem?.designId,
                    discountAmount: poItem?.discountAmount,
                    discountType: poItem?.discountType,
                    kDiaId: poItem?.kDiaId,
                    loopLengthId: poItem?.loopLengthId,
                    poId: poItem?.poId,
                    price: poItem?.price,
                    taxPercent: poItem?.tax,
                    uomId: poItem?.uomId,
                    poQty: poItem?.poQty,
                    yarnId: poItem?.yarnId,
                    cancelQty: poItem?.alreadyCancelData?._sum?.qty ? parseFloat(poItem.alreadyCancelData?._sum?.qty).toFixed(3) : "0.000",
                    alreadyInwardedQty: poItem?.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000",
                    alreadyReturnedQty: poItem?.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000",
                    balanceQty: poItem?.balanceQty ? parseFloat(poItem.balanceQty).toFixed(3) : "0.000"
                }
            })]
        });
        setInwardItemSelection(false);
    }

    function handleCancel() {
        setLocalInwardItems([]);
        setInwardItemSelection(false);
    }

    return (
        <>
            <div className='h-full w-full flex flex-col'>
                {/* <div className='flex justify-between text-center bg-gray-300 rounded-b-md sticky top-0'>
                    <div className='p-2 rounded-lg flex items-center gap-5'>
                        <label className='text-xs font-semibold'>TransType</label>
                        <input className='text-xs h-6 rounded border border-gray-500 bg-white' value={transtype} disabled={true} />
                    </div>
                    <div className='p-2 rounded-lg flex items-center gap-5'>
                        <label className='text-xs font-semibold'>Supplier</label>
                        <input className='text-xs h-6 rounded border border-gray-500 bg-white' value={findFromList(supplierId, supplierList?.data, "name")} disabled={true} />
                    </div>
                </div> */}
                <div className='h-[560px] overflow-auto'>
                    {
                        <>


                            {transtype.includes("Yarn") ?

                                // <YarnPoItemSelection getSelectAll={getSelectAll} handleSelectAllChange={handleSelectAllChange} poType={transtype} isItemAdded={isItemAdded} handleChange={handleChange} supplierId={supplierId}
                                //     handleDone={handleDone} handleCancel={handleCancel} poInwardOrDirectInward={poInwardOrDirectInward}
                                // />
                                <></>
                                :
                                <AccessoryPoItemSelection getSelectAll={getSelectAll} handleSelectAllChange={handleSelectAllChange} poType={transtype} isItemAdded={isItemAdded} handleChange={handleChange} supplierId={supplierId}
                                    handleDone={handleDone} handleCancel={handleCancel}  poInwardOrDirectInward={poInwardOrDirectInward}

                                />
                            }
                        </>
                    }


                </div>
            </div>
            {/* <div className='flex justify-end gap-4 mt-3'>
                <button onClick={handleDone} className='bg-lime-400 hover:bg-lime-600 hover:text-white p-1 px-3 text-sm rounded font-semibold transition'>
                    Done
                </button>
                <button onClick={handleCancel} className='bg-red-400 hover:bg-red-600 hover:text-white p-1 text-sm rounded font-semibold transition'>
                    Cancel
                </button>
            </div> */}
        </>
    )
}

export default PoItemsSelection