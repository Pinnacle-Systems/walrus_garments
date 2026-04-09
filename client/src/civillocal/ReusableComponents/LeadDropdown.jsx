import React from 'react'
import { DropdownInput, MultiSelectDropdown } from '../../Inputs';
import { dropDownListObject, multiSelectOption } from '../../Utils/contructObject';
import { getCommonParams } from '../../Utils/helper';
import { useGetLeadQuery } from '../../redux/services/LeadFormService';
import { useGetQuotesQuery } from '../../redux/services/QuotesService';
import { Loader } from '../../Basic/components';

const LeadDropdown = ({ clientId, multiSelect = true, withoutLabel = true, readOnly, name, selected, setSelected, status, id, singleData }) => {
    const params = getCommonParams();
    const { data: leadList } = useGetLeadQuery({ params: { ...params } });
    const { data: quoteList } = useGetQuotesQuery({ params: { ...params, status } });

    if (!leadList) return <Loader />

    return (
        <>
            {withoutLabel ?
                <select value={selected} onChange={(e) => setSelected(e.target.value)} className='w-full tx-table-input'>
                    <option value="">Select</option>
                    {(leadList ? leadList?.data : []).map(item =>
                        <option key={item.id} value={item.id}>{item.docId}</option>
                    )}
                </select>
                :
                <>
                    {multiSelect ?
                        <MultiSelectDropdown readOnly={readOnly} name={name} selected={selected} setSelected={setSelected}
                            options={multiSelectOption(leadList ? leadList.data : [], "docId", "id")} />
                        :
                        <DropdownInput readOnly={readOnly} name={name} value={selected} setValue={setSelected}
                            options={dropDownListObject(id ? leadList?.data?.filter(val => parseInt(val.clientId) === parseInt(clientId)).filter(val => val.active) : leadList ? leadList?.data?.filter(val => parseInt(val.clientId) === parseInt(clientId)).filter(item => !(item?.Quotes)).filter(val => val.active) : [], "docId", "id")} />
                    }
                </>
            }
        </>
    )
}

export default LeadDropdown
