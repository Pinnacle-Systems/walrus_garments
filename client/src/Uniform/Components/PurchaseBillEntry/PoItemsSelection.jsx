import { useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { findFromList } from "../../../Utils/helper";
import YarnPoItemSelection from "./YarnPoItemSelection";


const PoItemsSelection = ({ transtype, supplierId, setInwardItems, inwardItems, setInwardItemSelection ,supplierList  , handleRightClick }) => {


    const [localInwardItems, setLocalInwardItems] = useState(inwardItems.map(prevItem => { return { id: prevItem.isPoItem ? prevItem.poItemsId : prevItem.directItemsId, isPoItem: prevItem.isPoItem } }));

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )



    function addItem(id, isPoItem) {
        setLocalInwardItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems.push({ id, isPoItem });
            return newItems
        });
    }
    function removeItem(id, isPoItem) {
        setLocalInwardItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems = newItems.filter(item => !((parseInt(item.id) === parseInt(id)) && (item.isPoItem === isPoItem)))
            return newItems
        });
    }


    function handleChange(id, isPoItem) {
        if (isItemAdded(id, isPoItem)) {
            removeItem(id, isPoItem)
        } else {
            addItem(id, isPoItem)
        }
    }
    function isItemAdded(id, isPoItem) {
        return localInwardItems.findIndex(item => parseInt(item.id) === parseInt(id) && (item.isPoItem === isPoItem)) !== -1
    }

    function handleSelectAllChange(value, poItems) {
        if (value) {
            poItems.forEach(item => addItem(item.id, item?.poId ? true : false))
        } else {
            poItems.forEach(item => removeItem(item.id, item?.poId ? true : false))
        }
    }

    function getSelectAll(poItems) {
        return poItems.every(item => isItemAdded(item.id, item?.poId ? true : false))
    }

    function handleDone() {
        setInwardItems(prevInwardItems => {
            let oldInwardItems = prevInwardItems.filter(item => isItemAdded(item.isPoItem ? item.poItemsId : item.directItemsId, item?.isPoItem ? true : false))
            let newInwardItems = localInwardItems.filter(item => {
                return prevInwardItems.findIndex(prevItem => (parseInt(prevItem.isPoItem ? prevItem.poItemsId : prevItem.directItemsId) === parseInt(item.id) && (prevItem.isPoItem === (item?.isPoItem ? true : false)))) === -1
            })
            return [...oldInwardItems, ...newInwardItems.map(i => { return { poItemsId: i?.isPoItem ? i.id : "", directItemsId: i?.isPoItem ? "" : i.id, isPoItem: i.isPoItem, discountType: "Percentage", discountValue: "0", qty: "0.000", } })]
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
                <div className='flex justify-between text-center bg-blue-200 rounded-b-md sticky top-0'>
                    <div className='p-2 rounded-lg flex items-center gap-5'>
                        <label className='text-xs font-semibold'>TransType</label>
                        <input className='text-xs h-6 rounded border border-gray-500 bg-white' value={transtype} disabled={true} />
                    </div>
                    <div className='p-2 rounded-lg flex items-center gap-5'>
                        <label className='text-xs font-semibold'>Supplier</label>
                        <input className='text-xs h-6 rounded border border-gray-500 bg-white' value={findFromList(supplierId, supplierList.data, "aliasName")} disabled={true} />
                    </div>
                </div>
                <div className='overflow-auto h-[400px]'>


                    <YarnPoItemSelection getSelectAll={getSelectAll} handleSelectAllChange={handleSelectAllChange} poType={transtype} handleChange={handleChange} supplierId={supplierId} isItemAdded={isItemAdded}   handleRightClick = {handleRightClick} />







                </div>
            </div>
            <div className='flex justify-end gap-4 mt-3'>
                <button onClick={handleDone} className='bg-lime-400 hover:bg-lime-600 hover:text-white p-1 px-3 text-sm rounded font-semibold transition'>
                    Done
                </button>
                <button onClick={handleCancel} className='bg-red-400 hover:bg-red-600 hover:text-white p-1 text-sm rounded font-semibold transition'>
                    Cancel
                </button>
            </div>
        </>
    )
}

export default PoItemsSelection