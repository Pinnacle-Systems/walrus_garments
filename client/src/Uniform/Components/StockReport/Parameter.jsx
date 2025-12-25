import React, { useState } from 'react'
import { poTypes } from '../../../Utils/DropdownData';
import { DateInput, DropdownInput } from '../../../Inputs';
import { useGetBranchQuery } from '../../../redux/services/BranchMasterService';
import { getCommonParams } from '../../../Utils/helper';
import { dropDownListObject } from '../../../Utils/contructObject';
import { toast } from 'react-toastify';
import { useGetLocationMasterQuery } from '../../../redux/uniformService/LocationMasterServices';

const Parameter = ({ poType, setPoType, locationId, setLocationId, storeId, setStoreId, endDate, setEndDate, onClose }) => {
    const [localEndDate, setLocalEndDate] = useState(endDate)
    const [localStoreId, setLocalStoreId] = useState(storeId);
    const [localPoType, setLocalPoType] = useState(poType);
    const [localLocationId, setLocalLocationId] = useState(locationId);

    function handleDone() {
        if (!(localPoType && localStoreId && localEndDate)) return toast.info("Choose Po Type, Store , End Date ... !", { position: "top-center" })
        setEndDate(localEndDate);
        setStoreId(localStoreId);
        setLocationId(localLocationId);
        setPoType(localPoType);
        onClose();
    }

    const { companyId, branchId } = getCommonParams()

    const { data: locationData } = useGetLocationMasterQuery({ params: { branchId } });
    const { data: branchList } = useGetBranchQuery({ params: { companyId } });

    const storeOptions = locationData ?
        locationData.data.filter(item => parseInt(item.locationId) === parseInt(localLocationId)) :
        [];
    return (
        <div className='flex justify-between text-center bg-blue-200 rounded-b-md mb-7 sticky top-0 '>
            <div className='grid grid-cols-5 gap-4'>
                <div className=' items-center justify-center md:my-1 px-1 data flex flex-col'>
                    <label className='block text-xs font-bold text-slate-700 mb-1'>Po Type</label>
                    <select id='dd' autoFocus name="name" className='w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm' value={localPoType} onChange={(e) => setLocalPoType(e.target.value)}>
                        <option value={""}>Select</option>
                        {poTypes.map((option, index) => <option key={index} value={option.value} >
                            {option.show}
                        </option>)}
                    </select>
                </div>
                <DropdownInput name="Location"
                    options={branchList ? (dropDownListObject(branchList.data, "branchName", "id")) : []}
                    value={localLocationId}
                    setValue={(value) => { setLocalLocationId(value); setLocalStoreId("") }}
                    required={true}
                />
                <DropdownInput name="Store"
                    options={dropDownListObject(storeOptions, "storeName", "id")}
                    value={localStoreId} setValue={setLocalStoreId} required={true} />
                <DateInput name={"Date"} value={localEndDate} setValue={setLocalEndDate} />
            </div>
            <div className='flex justify-end gap-4 mt-10'>
                <button onClick={handleDone} className='bg-lime-400 hover:bg-lime-600 hover:text-white p-1 px-3 text-sm rounded font-semibold transition'>
                    View Report
                </button>
                <button onClick={onClose} className='bg-red-400 hover:bg-red-600 hover:text-white p-1 text-sm rounded font-semibold transition'>
                    Cancel
                </button>
            </div>
        </div>
    )
}

export default Parameter
