import React from 'react'
import { DropdownInput, MultiSelectDropdown } from '../../Inputs';
import { dropDownListObject, multiSelectOption } from '../../Utils/contructObject';
import { getCommonParams } from '../../Utils/helper';
import { useGetLeadQuery } from '../../redux/services/LeadFormService';
import { useGetQuotesQuery } from '../../redux/services/QuotesService';
import { Loader } from '../../Basic/components';

const DropDownWithLabel = ({ alldata , clientId, multiSelect = false, withoutLabel = true, readOnly, name, selected, setSelected, status, id, singleData }) => {
    const params = getCommonParams();
  

    if (!alldata) return <Loader />

    return (
        <>
            {withoutLabel ?
                <select value={selected} onChange={(e) => setSelected(e.target.value)} className='w-full table-data-input'>
                    <option value="">Select</option>
                    {(alldata ? alldata?.data : []).map(item =>
                        <option key={item.id} value={item.id}>{item.docId}</option>
                    )}
                </select>
                :
                <>
                    {multiSelect ?
                        <MultiSelectDropdown readOnly={readOnly} name={name} selected={selected} setSelected={setSelected}
                            options={multiSelectOption(alldata ? alldata?.data : [], "docId", "id")} />
                        :
                        <DropdownInput readOnly={readOnly} name={name} value={selected} setValue={setSelected}
                            options={dropDownListObject(id ? alldata?.data?.filter(val => parseInt(val.clientId) === parseInt(clientId)).filter(val => val.active) : alldata ? alldata?.data?.filter(val => parseInt(val.clientId) === parseInt(clientId)).filter(item => !(item?.Quotes)).filter(val => val.active) : [], "docId", "id")} />
                    }
                </>
            }
        </>
    )
}

export default DropDownWithLabel
