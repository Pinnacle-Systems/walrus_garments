import React, { useEffect } from 'react'
import { useGetPanelMasterQuery } from '../../../redux/uniformService/PanelMasterService';
import { useGetProcessMasterQuery } from '../../../redux/uniformService/ProcessMasterService';
import { DropdownInput } from '../../../Inputs';
import { dropDownListObject } from '../../../Utils/contructObject';
import { findFromList } from '../../../Utils/helper';
import PanelSelection from './PanelSelection';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PanelWiseProcess = ({ panelData, setPanelGridOpen, colorData, process, value, params, setItemId, itemTypeId, itemId, arrayName, readOnly, setCurrentSelectedIndex, currentIndex, setOrderDetails, index }) => {


    // function handleDone() {
    //     setItemId("")
    //     setPanelGridOpen(false);
    // }


    return (
        <>
            {

                <div className='flex justify-around max-h-[95%] overflow-auto '>
                    <table className="border border-gray-500 w-3/4">
                        <thead className="border border-gray-500">
                            <tr className="h-5">
                                <th className="border border-gray-500 text-sm p-1">S.No </th>
                                <th className="border border-gray-500 text-sm p-1">PanelProcess</th>
                                <th className="border border-gray-500 text-sm p-1">Color</th>
                                <th className="border border-gray-500 text-sm p-1 w-20" >
                                    <button type='button' className="text-green-700" onClick={() => {
                                        setOrderDetails(prev => {
                                            let newPrev = structuredClone(prev);
                                            newPrev[index]["orderDetailsSubGrid"][currentIndex][arrayName].push({
                                                panelId: "",
                                                selectedAddons: [{ processId: "" }]
                                            })
                                            return newPrev
                                        })
                                    }}
                                        disabled={readOnly}
                                    > {<FontAwesomeIcon icon={faUserPlus} />}
                                    </button>
                                </th>
                            </tr>

                        </thead>
                        <tbody>
                            {(value[arrayName] || [])?.map((panelItem, panelIndex) => (
                                <PanelSelection key={panelIndex} panelItem={panelItem} panelIndex={panelIndex}
                                    params={params} index={index} arrayName={arrayName} setOrderDetails={setOrderDetails}
                                    currentIndex={currentIndex} readOnly={readOnly} colorData={colorData} panelData={panelData} processData={process?.data}
                                />

                            ))}
                        </tbody>
                    </table>
                </div>
            }

            <div className='w-full grid justify-center mt-5'>
                <button onClick={() => {
                    setPanelGridOpen(false)
                }}
                    className=' w-24 bg-lime-400 hover:bg-lime-600 hover:text-white p-1 px-3 text-sm rounded font-semibold transition text-center '>
                    Done
                </button>
            </div >
        </>
    )
}

export default PanelWiseProcess