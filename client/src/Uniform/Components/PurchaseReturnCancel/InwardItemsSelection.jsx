import React, { useState } from 'react';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from "react-secure-storage";
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { findFromList } from '../../../Utils/helper';

import FabricPoItemSelection from './FabricPoItemSelection';
import AccessoryPoItemSelection from './AccessoryPoItemSelection';
import YarnInwardItemSelection from './YarnInwardItemSelection';
import AccessoryInwardItemSelection from './AccessoryInwardItemSelection';

const InwardItemsSelection = ({ transtype, supplierId, setInwardItems, inwardItems, setInwardItemSelection, storeId }) => {



    // const [localInwardItems, setLocalInwardItems] = useState(inwardItems);
    const [localInwardItems, setLocalInwardItems] = useState(inwardItems.filter(i => i.poItemsId).map(i => i.poItemsId));    // const [localInwardItems, setLocalInwardItems] = useState(

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )



    // if (supplierFetching || supplierLoading) return <Loader />

    function addItem(id) {
        console.log(id, "id")
        setLocalInwardItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems.push(id);
            return newItems
        });
    }
    function removeItem(id) {
        setLocalInwardItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems = newItems.filter(item => parseInt(item) !== parseInt(id))
            return newItems
        });
    }


    function handleChange(id) {
        if (isItemAdded(id)) {
            removeItem(id)
        } else {
            addItem(id)
        }
    }
    function isItemAdded(id) {
        return localInwardItems.findIndex(item => parseInt(item) === parseInt(id)) !== -1
    }

    function handleSelectAllChange(value, poItems) {
        if (value) {
            poItems.forEach(item => addItem(item.id))
        } else {
            poItems.forEach(item => removeItem(item.id))
        }
    }

    function getSelectAll(poItems) {
        return poItems.every(item => isItemAdded(item.id))
    }

    function handleDone() {
        setInwardItems(prevInwardItems => {
            let oldInwardItems = prevInwardItems.filter(item => isItemAdded(item.poItemsId))
            console.log(oldInwardItems, "oldInwardItems")
            let newInwardItems = localInwardItems.filter(item => {
                return prevInwardItems.findIndex(prevItem => parseInt(prevItem.poItemsId) === parseInt(item)) === -1
            })
            console.log(localInwardItems, "localInwardItems")
            console.log([...oldInwardItems, ...newInwardItems], "inwardIOtems")

            return [...oldInwardItems, ...newInwardItems.map(i => { return { poItemsId: i } })]
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


                <YarnInwardItemSelection getSelectAll={getSelectAll} handleSelectAllChange={handleSelectAllChange} poType={transtype} isItemAdded={isItemAdded} handleChange={handleChange} supplierId={supplierId} storeId={storeId} handleDone={handleDone} />


            </div>

        </>
    )
}

export default InwardItemsSelection