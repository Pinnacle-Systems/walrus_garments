import React from 'react'
import { TICK_ICON } from '../../icons';
// import { TICK_ICON } from '../../../icons'
const PartySupplyDetails = ({ partyDetails, partySuppliesItem, setPartySuppliesItem, readOnly }) => {
    function findPartySuppliesCurrentItem(id) {
        return partySuppliesItem.includes(id);
    }
    function handleOnClick(partyId) {
        if (readOnly) return
        let newList = structuredClone(partySuppliesItem);
        if (newList.includes(partyId)) {
            newList = newList.filter(item => parseInt(item) !== parseInt(partyId))
        } else {
            newList.push(partyId)
        }
        setPartySuppliesItem(newList);
    }

    return (
        <div className='h-[300px] overflow-y-auto border rounded-lg shadow-md w-full'>
            <table className=' text-center overflow-hidden rounded w-full'>
                <thead className='border border-gray-500'>
                    <tr className='bg-gray-200 '>
                        <th className='text-[15px] border border-gray-500 p-0.5'>
                            Party Name
                        </th>
                        <th className='text-[15px] border border-gray-500 p-0.5'>
                            Party Alias Name
                        </th>
                        <th className='text-[15px] border border-gray-500 p-0.5'>
                            Supply
                        </th>
                    </tr>
                </thead>
                <tbody className=''>
                    {partyDetails.map((party, index) =>
                        <tr key={party.id}>
                            <td className='border border-gray-500 table-data text-sm p-1'> {party.name} </td>
                            <td className='border border-gray-500 table-data text-sm'> {party.aliasName} </td>
                            <td className='border border-gray-500 table-data text-sm' onClick={() => { handleOnClick(party.id) }}> {findPartySuppliesCurrentItem(party.id) ? TICK_ICON : ""} </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default PartySupplyDetails