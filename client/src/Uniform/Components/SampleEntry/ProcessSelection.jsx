import { faTrashCan, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'

const ProcessSelection = ({ processData, process, processIndex, panelIndex, params, index, arrayName, setOrderDetails, currentIndex, readOnly }) => {

    const handleProcessIdChange = (value, processIndex, field) => {
        setOrderDetails((prev) => {
            const updatedPanelData = [...prev];

            updatedPanelData[index]["orderDetailsSubGrid"][currentIndex][arrayName][panelIndex]["selectedAddons"][processIndex][field] = value
            return updatedPanelData;
        });
    };



    return (
        <>
            <tr className="items-center" >
                <td className="border border-gray-500 text-xs text-center">{processIndex + 1}</td>


                <td className=" text-xs text-center border border-gray-500">

                    <select
                        className='text-left w-full rounded h-8 py-2 focus:outline-none'
                        value={process.processId}
                        onBlur={(e) => {
                            handleProcessIdChange(e.target.value, processIndex, "processId")
                        }
                        }
                        onChange={(e) => handleProcessIdChange(e.target.value, processIndex, "processId")}
                        disabled={readOnly}
                    >
                        <option>
                            Select
                        </option>

                        {(processData?.filter(item => item.active) || [])?.map((value) =>
                            <option value={value.id} key={value.id} >
                                {value.name}
                            </option>
                        )}
                    </select>

                </td>
                <td className="text-center border border-gray-500 text-xs ">
                    {/* <div className='flex gap-x-2 justify-between  px-2'> */}
                    {/* <button type='button'
                            disabled={readOnly}
                            className="text-green-700  border-gray-500" onClick={() => {
                                setOrderDetails(prev => {
                                    let newPrev = structuredClone(prev);

                                    newPrev[index]["orderDetailsSubGrid"][currentIndex][arrayName][panelIndex]["selectedAddons"].push({
                                        processId: "",

                                    })
                                    return newPrev
                                })

                            }}> {<FontAwesomeIcon icon={faUserPlus} />}
                        </button> */}

                    <button
                        type='button'
                        disabled={readOnly}
                        onClick={() => {

                            setOrderDetails(prev => {
                                let newPrev = structuredClone(prev);
                                newPrev[index]["orderDetailsSubGrid"][currentIndex][arrayName][panelIndex]["selectedAddons"] = newPrev[index]["orderDetailsSubGrid"][currentIndex][arrayName][panelIndex]["selectedAddons"].filter((_, i) => i !== processIndex)
                                return newPrev
                            })
                        }}
                        className='text-md text-red-600 ml-1'>{<FontAwesomeIcon icon={faTrashCan} />}</button>
                    {/* </div> */}

                </td>

            </tr>


        </>
    )
}

export default ProcessSelection;