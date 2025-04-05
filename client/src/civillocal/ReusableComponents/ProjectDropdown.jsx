import React from 'react'
import { DropdownInput, MultiSelectDropdown } from '../../Inputs';
import { dropDownListObject, multiSelectOption } from '../../Utils/contructObject';
import { getCommonParams } from '../../Utils/helper';
import { useGetProjectQuery } from '../../redux/services/ProjectService';

const ProjectDropdown = ({ multiSelect = true, withoutLabel = true, readOnly, name, selected, setSelected, clientId }) => {
    const params = getCommonParams();
    const { data: projectList } = useGetProjectQuery({ params: { ...params, clientId } });
    return (
        <>
            {withoutLabel ?
                <select value={selected} onChange={(e) => setSelected(e.target.value)} className='w-full table-data-input'>
                    <option value="">Select</option>
                    {(projectList ? projectList.data : []).map(item =>
                        <option key={item.id} value={item.id}>{item.docId}</option>
                    )}
                </select>
                :
                <>
                    {multiSelect ?
                        <MultiSelectDropdown readOnly={readOnly} name={name} selected={selected} setSelected={setSelected}
                            options={multiSelectOption(projectList ? projectList.data : [], "docId", "id")} />
                        :
                        <DropdownInput readOnly={readOnly} name={name} value={selected} setValue={setSelected}
                            options={dropDownListObject(projectList ? projectList.data : [], "docId", "id")} />
                    }
                </>
            }
        </>
    )
}

export default ProjectDropdown
