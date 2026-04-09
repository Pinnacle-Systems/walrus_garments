import { faTrashCan, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react'
import ProcessSelection from './ProcessSelection';
import { useGetPanelMasterQuery } from '../../../redux/uniformService/PanelMasterService';
import { useGetProcessMasterQuery } from '../../../redux/uniformService/ProcessMasterService';
import { dropDownListObject } from '../../../Utils/contructObject';

const PanelSelection = ({ processData, panelItem, colorData, panelIndex, params, index, arrayName, setOrderDetails, currentIndex, readOnly, panelData }) => {


    const handlePanelIdChange = (value, panelIndex, field) => {

        setOrderDetails((prev) => {
            const updatedPanelData = [...prev];
            updatedPanelData[index]["orderDetailsSubGrid"][currentIndex][arrayName][panelIndex] = {
                panelId: value, selectedAddons: [{ processId: "" }]
            }
            return updatedPanelData;
        });
    };

    const handlePanelColorChange = (value, panelIndex, field) => {
        setOrderDetails((prev) => {
            let updatedPanelData = structuredClone(prev);
            updatedPanelData[index]["orderDetailsSubGrid"][currentIndex][arrayName] = updatedPanelData[index]["orderDetailsSubGrid"][currentIndex][arrayName].map((val, valIndex) =>

                valIndex == panelIndex ? { ...val, [field]: value } : val

            )
            return updatedPanelData;
        });
    }



    return (
        <>
            <tr className="items-center" key={panelIndex}>
                <td className="border border-gray-500 text-xs text-center w-12">{panelIndex + 1}</td>
                <td className=" text-xs bg-gray-400" >
                    <select
                        readOnly={readOnly}
                        onKeyDown={e => { if (e.key === "Delete") { handlePanelIdChange("", panelIndex, "panelId") } }}
                        className='text-left w-full rounded py-1 tx-table-input border border-gray-400'
                        value={panelItem.panelId}
                        onChange={(e) => handlePanelIdChange(e.target.value, panelIndex, "panelId")}
                    >
                        <option className='text-gray-600'>Select
                        </option>
                        {(panelData?.data ? panelData?.data : [])?.filter(i => i.active)?.map((uom) =>
                            <option value={uom.id} key={uom.id}>
                                {uom.name}
                            </option>
                        )}

                    </select>

                </td>
                <td className=" text-xs bg-gray-400" >
                    <select
                        readOnly={readOnly}
                        onKeyDown={e => { if (e.key === "Delete") { handlePanelColorChange("", panelIndex, "colorId") } }}
                        className='text-left w-full rounded py-1 tx-table-input border border-gray-400'
                        value={panelItem.colorId}
                        onChange={(e) => handlePanelColorChange(e.target.value, panelIndex, "colorId")}
                    >
                        <option className='text-gray-600'>Select
                        </option>
                        {(colorData?.data ? colorData?.data : [])?.filter(i => i.active)?.map((uom) =>
                            <option value={uom.id} key={uom.id}>
                                {uom.name}
                            </option>
                        )}

                    </select>
                </td>
                <td className="border border-gray-500 p-1 text-xs text-center" >
                    <div className='flex justify-around  w-full px-1'>
                        <button type='button'
                            disabled={readOnly}
                            className="text-green-700  border-gray-500" onClick={() => {
                                setOrderDetails(prev => {
                                    let newPrev = structuredClone(prev);

                                    newPrev[index]["orderDetailsSubGrid"][currentIndex][arrayName][panelIndex]["selectedAddons"].push({
                                        processId: "",

                                    })
                                    return newPrev
                                })

                            }}>
                            {<FontAwesomeIcon icon={faUserPlus} />}
                            {/* Add Process */}
                        </button>


                        <button
                            type='button'
                            disabled={readOnly}
                            onClick={() => {

                                setOrderDetails(prev => {
                                    let newPrev = structuredClone(prev);
                                    newPrev[index]["orderDetailsSubGrid"][currentIndex][arrayName] = newPrev[index]["orderDetailsSubGrid"][currentIndex][arrayName].filter((_, i) => i !== panelIndex)
                                    return newPrev
                                })
                            }}
                            className='text-md text-red-600 ml-1'>{<FontAwesomeIcon icon={faTrashCan} />}</button>

                    </div>

                </td>

            </tr>

            {panelItem?.selectedAddons?.map((process, processIndex) => (

                <ProcessSelection key={processIndex} processData={processData} process={process} processIndex={processIndex}
                    panelIndex={panelIndex} params={params} index={index} arrayName={arrayName}
                    setOrderDetails={setOrderDetails} currentIndex={currentIndex}
                    readOnly={readOnly}
                />
            ))}
        </>
    )
}

export default PanelSelection