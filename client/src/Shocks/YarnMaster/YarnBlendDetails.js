import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGetYarnBlendMasterQuery } from '../../redux/uniformService/YarnBlendMasterServices';
import { Loader } from '../../Basic/components';
import { DELETE, PLUS } from '../../icons';
// import { DELETE, PLUS } from '../../../icons';
// import { useGetYarnBlendMasterQuery } from '../../../redux/ErpServices/YarnBlendMasterServices';
// import {toast} from "react-toastify"
// import { Loader } from '../../../Basic/components';
const YarnBlendDetails = ({ yarnBlend, setYarnBlend, readOnly, params, id }) => {
    const handleInputChange = (event, index, field) => {
        const value = event.target.value;
        const newBlend = structuredClone(yarnBlend);
        newBlend[index][field] = value;
        setYarnBlend(newBlend);
    };

    useEffect(() => {
        if (readOnly) return
        else {
            if (yarnBlend.length === 0) {
                setYarnBlend([{ yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }]);
            }
        }
    }, [yarnBlend, readOnly])

    const addRow = () => {
        if (yarnBlend.length >= yarnBlendList.data.length) {
            toast.error("No More Blends", { position: 'top-center' })
            return
        }
        const newRow = { yarnBlendId: "", percentage: "" };
        setYarnBlend([...yarnBlend, newRow]);
    };
    const handleDeleteRow = id => {
        setYarnBlend(yarnBlend => yarnBlend.filter((row, index) => index !== parseInt(id)));
    };
    const onKeyDown = (e) => {
        if (e.key === "Tab") {
            addRow();
        }
    };

    const { data: yarnBlendList, isLoading: isYarnBlendListLoading, isFetching: isYarnBlendListFetching } =
        useGetYarnBlendMasterQuery({ params });

    function findIdInYarnBlend(id) {
        return yarnBlend ? yarnBlend.find(blend => parseInt(blend.yarnBlendId) === parseInt(id)) : false
    }
    // if(!yarnBlend || isYarnBlendListLoading || isYarnBlendListFetching) return <Loader/>

    return (
        <>
            {
                yarnBlend.length !== 0 ?
                    <div className='w-full overflow-y-auto'>
                        <table className="w-full border border-gray-600 text-xs table-auto rounded">
                            <thead className='bg-light top-0'>
                                <tr>
                                    <th className="pl-1">Yarn Blend</th>
                                    <th className="pl-1">Percentage</th>
                                    <th>
                                        {readOnly ?
                                            "" :
                                            <div onClick={addRow}
                                                className='hover:cursor-pointer p-1 flex items-center justify-center  text-green-600 rounded'>
                                                {PLUS}
                                            </div>
                                        }
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='overflow-y-auto border border-gray-600 h-full w-full'>
                                {yarnBlend.map((row, index) => (
                                    <tr key={index} className="w-full">
                                        <td className='flex justify-center items-center'>
                                            <select disabled={readOnly} className='text-left w-full rounded border border-gray-600 h-8 py-2 focus:outline-none' value={row.yarnBlendId} onChange={(e) => handleInputChange(e, index, "yarnBlendId")}>
                                                <option hidden>
                                                    Select
                                                </option>
                                                {(id ? yarnBlendList.data : yarnBlendList.data.filter(item => item.active)).map((blend) =>
                                                    <option value={blend.id} key={blend.id} hidden={findIdInYarnBlend(blend.id)}>
                                                        {blend.name}
                                                    </option>
                                                )}
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                onKeyDown={(index === (yarnBlend.length - 1)) ? onKeyDown : () => { }}
                                                type="number"
                                                onFocus={(e) => e.target.select()}
                                                className="border border-gray-600 rounded px-4 h-8 py-2  w-full"
                                                value={parseInt(row.percentage, 10)}
                                                disabled={readOnly || !row.yarnBlendId}
                                                onChange={(event) =>
                                                    handleInputChange(event, index, "percentage")
                                                }
                                            />
                                        </td>
                                        <td className='border border-gray-600'>
                                            {readOnly
                                                ?
                                                ""
                                                :
                                                <div className='flex justify-center p-1 items-center rounded '>
                                                    <button tabIndex={-1} onClick={() => handleDeleteRow(index)}>{DELETE}</button>
                                                </div>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    :
                    <div></div>
            }
        </>
    )
}

export default YarnBlendDetails