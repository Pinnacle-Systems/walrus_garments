import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react'
import {
    useGetStyleTypeMasterQuery,

} from "../../../redux/uniformService/StyleTypeMasterService";
import SubGrid from './SubGrid';
import secureLocalStorage from 'react-secure-storage';
import { useGetItemTypeMasterQuery } from '../../../redux/uniformService/ItemTypeMasterService';

const StyleTypeHeading = ({ noOfSet, index, item, handleInputChange, readOnly, childRecord, setOrderDetails, id, handleInputChangeOrderDetails, orderDetails }) => {
    const [selectValues, setSelectValues] = useState([]);
    const [selectedMaleColors, setSelectedMaleColors] = useState([]);
    const [selectedFemaleColors, setSelectedFemaleColors] = useState([]);

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )

    const params = {
        companyId
    };

    const { data: styleTypeList } =
        useGetStyleTypeMasterQuery({ params });
    const { data: itemTypeList } =
        useGetItemTypeMasterQuery({ params });

    return (
        <>
            <tr className="items-center" key={index}>
                <td className="border border-gray-500 text-xs text-center w-12">{index + 1}</td>
                <td className=" text-xs bg-gray-400" colSpan={4}>
                    <select
                        readOnly={readOnly}
                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "itemTypeId") } }}
                        className='text-left w-full rounded py-1 tx-table-input border border-gray-400'
                        value={item.itemTypeId}
                        onChange={(e) => handleInputChange(e.target.value, index, "itemTypeId")}
                    >
                        <option className='text-gray-600'>Select
                        </option>
                        {(itemTypeList?.data ? itemTypeList?.data : []).map((uom) =>
                            <option value={uom.id} key={uom.id}>
                                {uom.name}
                            </option>
                        )}
                    </select>

                </td>
                <td className="border border-gray-500 p-1 text-xs text-center" >
                    <button
                        type='button'
                        disabled={readOnly}
                        onClick={() => {

                            setOrderDetails(prev => {
                                let newPrev = structuredClone(prev);
                                newPrev = newPrev.filter((_, i) => i !== index)
                                return newPrev
                            })
                        }}
                        className='text-md text-red-600 ml-1'>{<FontAwesomeIcon icon={faTrashCan} />}</button>
                </td>

            </tr>

            {item?.orderDetailsSubGrid?.map((value, valueIndex) =>

                <SubGrid orderDetails={orderDetails} params={params} itemTypeId={item.itemTypeId} selectedMaleColors={selectedMaleColors} setSelectedMaleColors={setSelectedMaleColors} selectedFemaleColors={selectedFemaleColors}
                    setSelectedFemaleColors={setSelectedFemaleColors} noOfSet={noOfSet} item={item} selectValues={selectValues}
                    setSelectValues={setSelectValues} key={valueIndex} handleInputChangeOrderDetails={handleInputChangeOrderDetails}
                    valueIndex={valueIndex} value={value} index={index} id={id} readOnly={readOnly}
                    childRecord={childRecord} setOrderDetails={setOrderDetails}

                />
            )}

        </>
    )
}

export default StyleTypeHeading