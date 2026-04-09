import React, { useEffect, useState } from 'react'
import { COPY_ICON, TICK_ICON, VIEW } from '../../../icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import secureLocalStorage from 'react-secure-storage'
import { useGetClassMasterQuery } from "../../../redux/uniformService/ClassMasterService"
import { useGetStyleTypeMasterQuery } from '../../../redux/uniformService/StyleTypeMasterService'
import { useGetStyleMasterQuery } from '../../../redux/uniformService/StyleMasterService'
import { multiSelectOption } from '../../../Utils/contructObject'
import { MultiSelect } from 'react-multi-select-component'
import { MultiSelectDropdown, DropdownInput } from '../../../Inputs'
import { useGetItemTypeMasterQuery } from '../../../redux/uniformService/ItemTypeMasterService'
import { useGetItemMasterByIdQuery, useGetItemMasterQuery } from '../../../redux/uniformService/ItemMasterService'
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService'
import Select from "react-select";
import { uniformTypes } from '../../../Utils/DropdownData'
import { findFromList } from '../../../Utils/helper'
import { toast } from 'react-toastify'
import PanelWiseProcess from './PanelWiseProcess'
import Modal from '../../../UiComponents/Modal';
import { useGetPanelMasterQuery } from '../../../redux/uniformService/PanelMasterService'
import { useGetProcessMasterQuery } from '../../../redux/uniformService/ProcessMasterService'


const SubGrid = ({ orderDetails, itemTypeId, selectedMaleColors, setSelectedMaleColors, selectedFemaleColors, setSelectedFemaleColors, noOfSet, item, setSelectValues, selectValues, valueIndex, value, index, id, readOnly, childRecord, setOrderDetails, onKeyDown, handleInputChangeOrderDetails }) => {

    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("");
    const [panelGridOpen, setPanelGridOpen] = useState(false)
    const [arrayName, setArrayName] = useState("");

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )

    const params = {
        companyId
    };

    const { data: panelData } = useGetPanelMasterQuery({ params });
    const { data: colorData } = useGetColorMasterQuery({ params });

    const { data: process } = useGetProcessMasterQuery({ params });

    // const {
    //     data: itemData,

    // } = useGetItemMasterByIdQuery(itemId, { skip: !itemId });




    // useEffect(() => {

    //     let newArray = value?.classIds?.map(val => {
    //         return {
    //             ...val, label: val.Class?.name ? val.Class?.name : val.label, value: val.classId ? val.classId : val.value
    //         }
    //     })
    //     setSelectValues(newArray || [])

    // }, [item, value, valueIndex]);

    // useEffect(() => {
    //     let newArray = value?.maleColorIds?.map(val => {
    //         return {
    //             ...val, label: val.Color?.name ? val.Color?.name : val.label, value: val.maleColorId ? val.maleColorId : val.value
    //         }
    //     })
    //     setSelectedMaleColors(newArray || [])
    // }, [valueIndex, item, value]);
    // useEffect(() => {
    //     let newArray = value?.femaleColorsIds?.map(val => {
    //         return {
    //             ...val, label: val.Color?.name ? val.Color?.name : val.label, value: val.femaleColorId ? val.femaleColorId : val.value
    //         }
    //     })
    //     setSelectedFemaleColors(newArray || [])
    // }, [valueIndex, item, value]);






    // useEffect(() => {
    //     if (id) return
    //     if (!itemId) return

    //     if (value?.[arrayName]?.length > 0) return
    //     itemData?.data?.ItemPanel?.forEach((panel, panelIndex) => {
    //         setOrderDetails((prev) => {
    //             const updatedPanelData = [...prev];
    //             updatedPanelData[index]["orderDetailsSubGrid"]?.[currentSelectedIndex]?.[arrayName]?.push({
    //                 panelId: panel.panelId,
    //                 selectedAddons: []
    //             })
    //             return updatedPanelData;
    //         });
    //     })

    // }, [arrayName, itemTypeId, itemId, itemData])

    const { data: classList } =
        useGetClassMasterQuery({});

    const { data: itemList } =
        useGetItemMasterQuery({ params });
    const { data: colorList } =
        useGetColorMasterQuery({ params });

    return (
        <>
            <Modal isOpen={panelGridOpen} onClose={() => setPanelGridOpen(false)} widthClass={"px-2 h-[80%] w-[50%]"}>
                <PanelWiseProcess params={params}
                    arrayName={arrayName}
                    setPanelGridOpen={setPanelGridOpen}
                    readOnly={readOnly}
                    itemTypeId={itemTypeId}
                    setCurrentSelectedIndex={setCurrentSelectedIndex}
                    currentIndex={currentSelectedIndex}
                    setOrderDetails={setOrderDetails}
                    index={index}
                    // itemId={itemId} setItemId={setItemId}
                    value={value}
                    panelData={panelData}
                    colorData={colorData}
                    process={process}
                />
            </Modal>

            <tr className="items-center" >
                <td className="border border-gray-500 text-xs text-center">{valueIndex + 1}</td>
                <td className=" text-xs text-center border border-gray-500">
                    <select
                        required={true} className='text-left w-full rounded h-8 py-2 focus:outline-none border-r-2'
                        value={value.uniformType} onChange={(e) => { handleInputChangeOrderDetails(e.target.value, index, valueIndex, "uniformType") }} disabled={readOnly}>
                        <option value="" hidden={true}>Select</option>
                        {uniformTypes.map((option, index) => <option key={index} value={option.value} >
                            {option.show}
                        </option>)}
                    </select>
                </td>
                <td className=" text-xs text-center border border-gray-500 break-words whitespace-normal max-w-xs">

                    <MultiSelect
                        className={`text-left w-full rounded  tx-table-input`}
                        options={multiSelectOption((classList?.data || []), 'name', 'id')}
                        value={(value?.classIds || [])?.map((val) => ({ value: val?.classId, label: findFromList(val.classId, (classList?.data || []), "name") }))}
                        onChange={(value) => { handleInputChangeOrderDetails(value.map(i => ({ classId: i.value })), index, valueIndex, "classIds") }}
                        labelledBy="Select"
                    />
                </td>


                <td className=" text-xs text-center border border-gray-500">
                    <div className="grid grid-cols-5 w-full">

                        <div className='flex gap-x-2  col-span-2  border-r-2'>
                            <select
                                className='text-left w-full rounded h-8 py-2 focus:outline-none'
                                value={value.isMaleItemId}
                                onBlur={(e) => {
                                    handleInputChangeOrderDetails(e.target.value, index, valueIndex, "isMaleItemId")
                                }
                                }
                                onChange={(e) => handleInputChangeOrderDetails(e.target.value, index, valueIndex, "isMaleItemId")}
                                disabled={readOnly}
                            >
                                <option>
                                    Select
                                </option>

                                {(itemList?.data?.filter(item => item.active) || [])?.filter(j => parseInt(j.itemTypeId) == parseInt(item.itemTypeId)).map((value) =>
                                    <option value={value.id} key={value.id} >
                                        {value.name}
                                    </option>
                                )}
                            </select>


                            <button
                                className="text-left rounded px-1 "
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setCurrentSelectedIndex(valueIndex);
                                    }
                                }}
                                onClick={() => {
                                    if (!value.isMaleItemId) return toast.info("Please select Item", { position: "top-center" });
                                    setCurrentSelectedIndex(valueIndex);
                                    setArrayName("malePanelProcess");
                                    setPanelGridOpen(true)
                                    // setItemId(value?.isMaleItemId)
                                }
                                }
                            >
                                {VIEW}
                            </button>
                        </div>

                        {
                            value.uniformType == "NORMAL" ?
                                <select
                                    className='text-left w-full rounded h-8 py-2 focus:outline-none border-r-2 col-span-2'
                                    value={value.isMaleColorId}
                                    onBlur={(e) => {
                                        handleInputChangeOrderDetails(e.target.value, index, valueIndex, "isMaleColorId")
                                    }
                                    }
                                    onChange={(e) => handleInputChangeOrderDetails(e.target.value, index, valueIndex, "isMaleColorId")}
                                    disabled={readOnly}
                                >
                                    <option>
                                        Select
                                    </option>

                                    {(colorList?.data?.filter(item => item.active) || [])?.map((value) =>
                                        <option value={value.id} key={value.id} >
                                            {value.name}
                                        </option>
                                    )}
                                </select>

                                :
                                value.uniformType == "HOUSE" ?
                                    <MultiSelect
                                        className='text-left w-full rounded  focus:outline-none border-r-2 col-span-2'
                                        options={multiSelectOption((colorList?.data || []), 'name', 'id')}
                                        value={(value?.maleColorIds || [])?.map((val) => ({ value: val?.maleColorId, label: findFromList(val.maleColorId, (colorList?.data || []), "name") }))}
                                        onChange={(value) => { handleInputChangeOrderDetails(value.map(i => ({ maleColorId: i.value })), index, valueIndex, "maleColorIds") }}
                                        labelledBy="Select"
                                    />


                                    :
                                    <select
                                        className='text-left w-full rounded h-8 py-2 focus:outline-none border-r-2 col-span-2'
                                        value={value.isMaleColorId}
                                        onBlur={(e) => {
                                            handleInputChangeOrderDetails(e.target.value, index, valueIndex, "isMaleColorId")
                                        }
                                        }
                                        onChange={(e) => handleInputChangeOrderDetails(e.target.value, index, valueIndex, "isMaleColorId")}
                                        disabled={readOnly}
                                    >
                                        <option>
                                            Select
                                        </option>

                                        {(colorList?.data?.filter(item => item.active) || [])?.map((value) =>
                                            <option value={value.id} key={value.id} >
                                                {value.name}
                                            </option>
                                        )}
                                    </select>

                        }
                        <input className="text-left w-full rounded h-8 py-2 focus:outline-none px-2" type="text"
                            value={value.noOfSetMale}
                            onChange={(e) =>
                                handleInputChangeOrderDetails(e.target.value, index, valueIndex, "noOfSetMale")
                            }
                            onBlur={(e) => {

                                handleInputChangeOrderDetails(e.target.value, index, valueIndex, "noOfSetMale")


                            }
                            }
                            readOnly={readOnly} disabled={readOnly}
                        />
                    </div>

                </td>
                <td className=" text-xs text-center border border-gray-500">
                    <div className="grid grid-cols-5 w-full">

                        <div className='flex gap-x-2  col-span-2 border-r-2'>
                            <select
                                className='text-left w-full rounded h-8 py-2 focus:outline-none  '
                                value={value.isFemaleItemId}
                                onBlur={(e) => {
                                    handleInputChangeOrderDetails(e.target.value, index, valueIndex, "isFemaleItemId")
                                }
                                }
                                onChange={(e) => handleInputChangeOrderDetails(e.target.value, index, valueIndex, "isFemaleItemId")}
                                disabled={readOnly}
                            >
                                <option>
                                    Select
                                </option>

                                {(itemList?.data?.filter(item => item.active) || [])?.filter(j => parseInt(j.itemTypeId) == parseInt(item.itemTypeId))?.map((value) =>
                                    <option value={value.id} key={value.id} >
                                        {value.name}
                                    </option>
                                )}
                            </select>
                            <button
                                className="text-center rounded px-1"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setCurrentSelectedIndex(valueIndex);
                                    }
                                }}
                                onClick={() => {
                                    if (!value.isFemaleItemId) return toast.info("Please select Item", { position: "top-center" });
                                    setCurrentSelectedIndex(valueIndex);
                                    setArrayName("feMalePanelProcess");
                                    setPanelGridOpen(true)
                                    // setItemId(value?.isFemaleItemId)
                                }
                                }
                            >
                                {VIEW}
                            </button>


                        </div>

                        {
                            value.uniformType == "NORMAL" ?
                                <select
                                    className='text-left w-full rounded h-8 py-2 focus:outline-none border-r-2 col-span-2'
                                    value={value.isFemaleColorId}
                                    onBlur={(e) => {
                                        handleInputChangeOrderDetails(e.target.value, index, valueIndex, "isFemaleColorId")
                                    }
                                    }
                                    onChange={(e) => handleInputChangeOrderDetails(e.target.value, index, valueIndex, "isFemaleColorId")}
                                    disabled={readOnly}
                                >
                                    <option>
                                        Select
                                    </option>

                                    {(colorList?.data?.filter(item => item.active) || [])?.map((value) =>
                                        <option value={value.id} key={value.id} >
                                            {value.name}
                                        </option>
                                    )}
                                </select>

                                :
                                value.uniformType == "HOUSE" ?
                                    // <Select
                                    //     className="col-span-3"
                                    //     isMulti
                                    //     options={multiSelectOption((colorList?.data || []), 'name', 'id')}
                                    //     value={selectedFemaleColors}
                                    //     onChange={handleChangeFemaleColors}
                                    //     closeMenuOnSelect={false}
                                    //     placeholder="Select options..."
                                    //     isClearable
                                    // />


                                    <MultiSelect
                                        className='text-left w-full rounded  focus:outline-none border-r-2 col-span-2'
                                        options={multiSelectOption((colorList?.data || []), 'name', 'id')}
                                        value={(value?.femaleColorsIds || [])?.map((val) => ({ value: val?.femaleColorId, label: findFromList(val.femaleColorId, (colorList?.data || []), "name") }))}
                                        onChange={(value) => { handleInputChangeOrderDetails(value.map(i => ({ femaleColorId: i.value })), index, valueIndex, "femaleColorsIds") }}
                                        labelledBy="Select"
                                    />

                                    :
                                    <select
                                        className='text-left w-full rounded h-8 py-2 focus:outline-none border-r-2 col-span-2'
                                        value={value.isFemaleColorId}
                                        onBlur={(e) => {
                                            handleInputChangeOrderDetails(e.target.value, index, valueIndex, "isFemaleColorId")
                                        }
                                        }
                                        onChange={(e) => handleInputChangeOrderDetails(e.target.value, index, valueIndex, "isFemaleColorId")}
                                        disabled={readOnly}
                                    >
                                        <option>
                                            Select
                                        </option>

                                        {(colorList?.data?.filter(item => item.active) || [])?.map((value) =>
                                            <option value={value.id} key={value.id} >
                                                {value.name}
                                            </option>
                                        )}
                                    </select>

                        }

                        <input className="text-left w-full rounded h-8 py-2 px-2 focus:outline-none " type="text"
                            value={value.noOfSetFemale}
                            onChange={(e) =>
                                handleInputChangeOrderDetails(e.target.value, index, valueIndex, "noOfSetFemale")
                            }
                            onBlur={(e) => {

                                handleInputChangeOrderDetails(e.target.value, index, valueIndex, "noOfSetFemale")


                            }
                            }
                            readOnly={readOnly} disabled={readOnly}
                        />
                    </div>
                </td>




                <td className="border border-gray-500 p-1 text-xs text-center" >
                    <button
                        type='button' tabIndex={-1}
                        disabled={readOnly}
                        onClick={() => {
                            setOrderDetails(prev => {
                                let newPrev = structuredClone(prev);
                                newPrev[index]["orderDetailsSubGrid"] = newPrev[index]["orderDetailsSubGrid"].filter((_, i) => i !== valueIndex)

                                return newPrev
                            })
                        }}
                        className='text-md text-red-600 ml-1'>{<FontAwesomeIcon icon={faTrashCan} />}</button>
                </td>
                <td className="text-center border border-gray-500 text-xs p-1">
                    <button type='button'
                        disabled={readOnly}
                        className="text-green-700" onClick={() => {
                            setOrderDetails(prev => {
                                let newPrev = structuredClone(prev);
                                newPrev[index]["orderDetailsSubGrid"] = [...newPrev[index]["orderDetailsSubGrid"],
                                {

                                    uniformType: "NORMAL",
                                    classIds: [],
                                    femaleColorsIds: [],
                                    maleColorIds: [],
                                    malePanelProcess: [],
                                    feMalePanelProcess: [],
                                    isMaleItemId: "",
                                    noOfSetMale: noOfSet,
                                    noOfSetFemale: noOfSet,
                                    isFemaleItemId: "",
                                    isMaleColorId: "",
                                    isFemaleColorId: "",
                                    qty: ""
                                }]
                                return newPrev
                            })

                        }}> {<FontAwesomeIcon icon={faUserPlus} />}
                    </button>
                </td>

            </tr>
        </>
    )
}

export default SubGrid
