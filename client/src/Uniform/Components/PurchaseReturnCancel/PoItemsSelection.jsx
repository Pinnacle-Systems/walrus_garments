import React, { useState } from 'react';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from "react-secure-storage";
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { findFromList } from '../../../Utils/helper';

import FabricPoItemSelection from './FabricPoItemSelection';
import AccessoryPoItemSelection from './AccessoryPoItemSelection';
import YarnPoItemSelection from './YarnPoItemSelection';

const PoItemsSelection = ({ transtype, supplierId, setInwardItems, inwardItems, setInwardItemSelection, poInwardOrDirectInward, readOnly }) => {
    const [localInwardItems, setLocalInwardItems] = useState(inwardItems?.map(i => i?.poItemsId));
    // const [localInwardItems, setLocalInwardItems] = useState(inwardItems);

    console.log(localInwardItems, "localInwardItems")
    // console.log(inwardItems,"inwardItems")

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )



    // if (supplierFetching || supplierLoading) return <Loader />

    // function addItem(id) {
    //     setLocalInwardItems(localInwardItems => {
    //         let newItems = structuredClone(localInwardItems);
    //         newItems.push(id);
    //         return newItems
    //     });
    // }
    function addItem(id) {
        setLocalInwardItems(prevItems => {
            // if ID already exists → return same array (ignore)
            if (prevItems.includes(id)) {
                return prevItems;
            }

            // otherwise push the new id
            const newItems = [...prevItems, id];
            return newItems;
        });
    }

    function removeItem(id) {
        setLocalInwardItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            console.log(localInwardItems, "localInwardItems")
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
        console.log(localInwardItems, "localInwardItemslocalInwardItems", id)
        return localInwardItems?.findIndex(item => parseInt(item) === parseInt(id)) !== -1
    }

    function handleSelectAllChange(value, poItems) {
        console.log(value, "value")
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

            let oldInwardItems = prevInwardItems?.filter(item => isItemAdded(item?.poItemsId))
            let newInwardItems = localInwardItems?.filter(item => {
                return prevInwardItems?.findIndex(prevItem => parseInt(prevItem?.poItemsId) === parseInt(item)) === -1
            })
            console.log(...oldInwardItems, "...oldInwardItems")
            console.log(...newInwardItems, " ...newInwardItems");

            return [...oldInwardItems, ...newInwardItems?.map(i => { return { poItemsId: i } })]
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

                <div className='h-[500px] overflow-auto'>
                    {
                        <>

                            {transtype.toLowerCase().includes("yarn") ?

                                <YarnPoItemSelection getSelectAll={getSelectAll} handleSelectAllChange={handleSelectAllChange} poType={transtype} isItemAdded={isItemAdded} handleChange={handleChange} supplierId={supplierId} poInwardOrDirectInward={poInwardOrDirectInward} handleDone={handleDone} readOnly={readOnly} />
                                :
                                <AccessoryPoItemSelection getSelectAll={getSelectAll} handleSelectAllChange={handleSelectAllChange} poType={transtype} isItemAdded={isItemAdded} handleChange={handleChange} supplierId={supplierId} poInwardOrDirectInward={poInwardOrDirectInward} handleDone={handleDone} readOnly={readOnly} />
                            }
                        </>
                    }


                </div>
            </div>

        </>
    )
}

export default PoItemsSelection