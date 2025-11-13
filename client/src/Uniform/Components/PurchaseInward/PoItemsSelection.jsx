import React, { useState } from 'react';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from "react-secure-storage";
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { findFromList } from '../../../Utils/helper';

import FabricPoItemSelection from './FabricPoItemSelection';
import AccessoryPoItemSelection from './AccessoryPoItemSelection';
import YarnPoItemSelection from './YarnPoItemSelection';

const PoItemsSelection = ({ transtype, supplierId, setInwardItems, inwardItems, setInwardItemSelection, poInwardOrDirectInward }) => {





    console.log(inwardItems, "inwardItems")
    const [localInwardItems, setLocalInwardItems] = useState(inwardItems.filter(i => i.poItemsId).map(i => i.poItemsId));    // const [localInwardItems, setLocalInwardItems] = useState(

    console.log(localInwardItems, "localInwardItems")


    // const [localInwardItems, setLocalInwardItems] = useState([]);




    function addItem(id, obj) {

        setLocalInwardItems(prevItems => {
            let newItems = structuredClone(prevItems);
            console.log(newItems, "newItemsnewItems")

            const index = newItems?.findIndex(v => v?.yarnId === "");


            if (index !== -1) {
                newItems[index] = obj;
            } else {
                newItems.push(obj);
            }

            return newItems;
        });
    }

    function removeItem(id) {
        // console.log(localInwardItems?.filter(item => item?.id), "localInwardItemsremove")


        // setLocalInwardItems(localInwardItems => {
        //     let newItems = structuredClone(localInwardItems.filter(item => item?.id));
        //     newItems = newItems?.filter(item => parseInt(item.id) !== parseInt(id))
        //     return newItems
        // });
        setLocalInwardItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems = newItems?.filter(item => parseInt(item) !== parseInt(id))
            return newItems
        });
    }

    function isItemAdded(id) {
        console.log(localInwardItems, "localInwardItemsremove")

        return localInwardItems?.findIndex(item => parseInt(item.id || item.poItemsId || item) === parseInt(id)) !== -1;

    }

    function handleChange(id, obj) {
        console.log("Hit", id, obj)
        console.log(isItemAdded(id, obj), "isItemAdded")

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
            console.log(localInwardItems, "localInwardItemsssssss")
            console.log(prevInwardItems, "prevInwardItems")

            let newInwardItems = localInwardItems?.filter(item => {
                return prevInwardItems?.findIndex(prevItem => parseInt(prevItem?.poItemsId) === parseInt(item.id)) === -1
            })
            console.log([...oldInwardItems, ...newInwardItems], "...oldInwardItems, ...newInwardItems")
            return [...oldInwardItems, ...newInwardItems?.map(poItem => {
                return {

                    poItemsId: poItem?.id,
                    orderId: poItem?.orderId,
                    poNo: poItem?.Po?.docId,
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
            
                <div className='h-[560px] overflow-auto'>
                    {
                        <>


                            {transtype.includes("Yarn") ?

                                <YarnPoItemSelection getSelectAll={getSelectAll} handleSelectAllChange={handleSelectAllChange} poType={transtype} isItemAdded={isItemAdded} handleChange={handleChange} supplierId={supplierId}
                                    handleDone={handleDone} handleCancel={handleCancel} poInwardOrDirectInward={poInwardOrDirectInward}
                                />
                                :
                                <AccessoryPoItemSelection getSelectAll={getSelectAll} handleSelectAllChange={handleSelectAllChange} poType={transtype} isItemAdded={isItemAdded} handleChange={handleChange} supplierId={supplierId}
                                    handleDone={handleDone} handleCancel={handleCancel} poInwardOrDirectInward={poInwardOrDirectInward}

                                />
                            }
                        </>
                    }


                </div>
            </div>
  
        </>
    )
}

export default PoItemsSelection