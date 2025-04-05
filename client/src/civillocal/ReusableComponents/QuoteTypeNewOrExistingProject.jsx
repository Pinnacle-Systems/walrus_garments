import React from 'react'
import { DropdownInput } from '../../Inputs'
import { dropDownListObject } from '../../Utils/contructObject'

const QuoteTypeNewOrExistingProject = ({ value, setValue, readOnly }) => {
    const data = [
        {
            name: "New Project",
            id: "New"
        },
        {
            name: "Existing Project",
            id: "Existing"
        }
    ]
    return (
        <DropdownInput name={"Quote For"} options={dropDownListObject(data, "name", "id")} value={value} setValue={setValue} readOnly={readOnly} />
    )
}

export default QuoteTypeNewOrExistingProject
