import moment from 'moment';
import React, { useState } from 'react'
import { DELETE, EDIT_ICON, TICK_ICON } from '../../../icons';
import { categoryList } from '../../../Utils/DropdownData';

const SubLineItems = ({ readOnly, currentIndex, lineItems, setLineItems, id, lineIndex, item, saveData }) => {

    const [subLineEditableIndex, setSubLineEditableIndex] = useState()

    function handleInputChange(value, subIndex, field) {
        setLineItems(prev => {

            const newItems = structuredClone(prev);
            newItems[lineIndex]["subLineItems"][subIndex][field] = value;

            if (field === "leadDays") {


                let startDate = new Date(newItems[lineIndex]["subLineItems"][subIndex]['planStartDate']);

                startDate.setDate(startDate.getDate() + parseInt(value))
                newItems[lineIndex]["subLineItems"][subIndex]['planEndDate'] = moment(startDate).format("YYYY-MM-DD");
            }


            return newItems;
        });
    };





    function deleteRow(index) {
        setLineItems(prev => {
            const newItems = structuredClone(prev);
            newItems[lineIndex]["subLineItems"] = newItems[lineIndex]["subLineItems"]?.filter((_, i) => i !== index)
            return newItems;
        })

    }



    function isCompletedOrNot(index) {
        let item = lineItems[lineIndex]["subLineItems"][index]["isCompleted"]
        return item
    }

    function completed(index, value) {
        setLineItems(lineItem => {

            const newItems = structuredClone(lineItem);
            newItems[lineIndex]["subLineItems"][index]["isCompleted"] = value;
            return newItems
        });
    }

    function isEditable(index) {
        setSubLineEditableIndex(index)
    }

    return (
        <>
            {(id ? item?.subLineItems : item?.subLineItems || [])?.map((val, index) =>
                <tr className='w-full border-b-2 border-gray-400'>
                    <td className="table-data w-9 text-left px-1 py-1 text-xs">
                        {index + 1}
                    </td>
                    <td className='table-data text-xs'>
                        <input
                            type="text"
                            readOnly={subLineEditableIndex !== index}
                            className="text-left rounded py-2 px-1 w-full  overflow-auto table-data-input border border-gray-400"
                            value={val.name}

                            onChange={(e) =>
                                handleInputChange(e.target.value, index, "name")
                            }
                            onBlur={(e) => {
                                handleInputChange(e.target.value, index, "name");
                            }
                            }
                        />
                    </td>
                    <td className="table-data w-9 text-left px-1 py-1 text-xs">
                        <textarea
                            readOnly={subLineEditableIndex !== index}
                            className=" w-full overflow-auto focus:outline-none border border-gray-500 rounded py-1 text-xs"
                            value={val.description}
                            onChange={(e) => handleInputChange(e.target.value, index, "description")}
                        >
                        </textarea>

                    </td>
                    <td className="table-data w-9 text-left px-1 py-1 text-xs">

                        <select
                            disabled={subLineEditableIndex !== index}
                            className='text-left w-full  rounded py-1 focus:outline-none'
                            value={val.category}

                            onChange={(e) => handleInputChange(e.target.value, index, "category")}
                        >
                            <option className='hidden'>
                                Select
                            </option>

                            {categoryList.map((value) =>
                                <option value={value.value} key={value.value} className='text-xs'>
                                    {value.show}
                                </option>
                            )}
                        </select>

                    </td>
                    <td className="table-data w-9 text-left px-1 py-1 text-xs">
                        <input
                            type="text"
                            readOnly={subLineEditableIndex !== index}
                            className="text-left rounded py-1 px-1 w-full  overflow-auto table-data-input border border-gray-400"
                            value={val.responsiblePerson}

                            onChange={(e) =>
                                handleInputChange(e.target.value, index, "responsiblePerson")
                            }
                            onBlur={(e) => {
                                handleInputChange(e.target.value, index, "responsiblePerson");
                            }
                            }
                        />
                    </td>


                    <td className='table-data text-xs'>
                        <input
                            type="date"
                            readOnly={subLineEditableIndex !== index}
                            className="text-right rounded py-1 px-1 w-full table-data-input"
                            value={val?.planStartDate ? moment(val?.planStartDate).format("YYYY-MM-DD") : 0}

                            onChange={(e) =>
                                handleInputChange(e.target.value, index, "planStartDate")
                            }
                        />
                    </td>
                    <td className='table-data text-xs'>
                        <input
                            readOnly={subLineEditableIndex !== index}
                            type="number"
                            className="text-right rounded py-1 px-1 w-full table-data-input"
                            value={val?.leadDays || ""}

                            onChange={(e) =>
                                handleInputChange(e.target.value, index, "leadDays")
                            }
                        />
                    </td>
                    <td className='table-data text-xs'>
                        <input
                            type="date"
                            readOnly={subLineEditableIndex !== index}
                            className="text-right rounded py-1 px-1 w-full table-data-input"
                            value={val?.planEndDate ? moment(val?.planEndDate).format("YYYY-MM-DD") : 0}


                            onChange={(e) =>
                                handleInputChange(e.target.value, index, "planEndDate")
                            }
                        />
                    </td>

                    <td className='table-data w-12 text-center text-xs'>
                        <input type='checkbox' checked={isCompletedOrNot(index)} readOnly={readOnly}
                            onChange={(e) => {

                                if (isCompletedOrNot(index)) {
                                    completed(index, e.target.checked)

                                } else {

                                    completed(index, e.target.checked)
                                }
                            }} />
                    </td>

                    {(!readOnly) &&
                        <td className=" text-xs text-center table-data">
                            <button
                                type='button'
                                onClick={() => {
                                    deleteRow(index)
                                }}
                                className='text-lg text-red-600 '>{DELETE}
                            </button>
                        </td>
                    }
                    {(!readOnly) &&
                        <td className=" text-xs text-center table-data">
                            <button
                                type='button'
                                onClick={() => isEditable(index)}
                                className='text-lg text-yellow-600 '>{EDIT_ICON}
                            </button>
                        </td>
                    }

                    {(!readOnly) &&
                        <td className=" text-xs text-center table-data">
                            <button

                                type='button'
                                onClick={saveData}
                                className='text-lg text-green-600 '>{TICK_ICON}
                            </button>
                        </td>
                    }

                </tr>

            )}


        </>
    )
}

export default SubLineItems
