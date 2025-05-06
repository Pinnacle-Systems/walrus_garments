import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGetYarnBlendMasterQuery } from '../../redux/uniformService/YarnBlendMasterServices';
import { Loader } from '../../Basic/components';
import { DELETE, PLUS } from '../../icons';
import { useGetFabricMasterQuery } from '../../redux/uniformService/FabricMasterService';

const YarnBlendDetails = ({ fiberBlend, setFiberBlend, readOnly, params, id }) => {
    const handleInputChange = (event, index, field) => {
        const value = event.target.value;
        const newBlend = structuredClone(fiberBlend);
        newBlend[index][field] = value;
        setFiberBlend(newBlend);
    };

    useEffect(() => {
        if (readOnly) return
        else {
            if (fiberBlend.length === 0) {
                setFiberBlend([{ fabricId: "", percentage: "" }, { fabricId: "", percentage: "" }, { fabricId: "", percentage: "" }, { fabricId: "", percentage: "" }]);
            }
        }
    }, [fiberBlend, readOnly])

    const addRow = () => {

        const newRow = { fabricId: "", percentage: "" };
        setFiberBlend([...fiberBlend, newRow]);
    };
    const handleDeleteRow = id => {
        setFiberBlend(fiberBlend => fiberBlend.filter((row, index) => index !== parseInt(id)));
    };
    const onKeyDown = (e) => {
        if (e.key === "Tab") {
            addRow();
        }
    };

    const { data: fabricList } =
        useGetFabricMasterQuery({ params });

    function findIdInYarnBlend(id) {
        return fiberBlend ? fiberBlend.find(blend => parseInt(blend.fabricId) === parseInt(id)) : false
    }

    return (
        <>
            {
                fiberBlend.length !== 0 ?
                    <div className='w-full overflow-y-auto'>
                        <table className="w-full border border-gray-600 text-xs table-auto rounded">
                            <thead className='bg-light top-0'>
                                <tr>
                                    <th className="pl-1">Fiber Blend</th>
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
                                {fiberBlend.map((row, index) => (
                                    <tr key={index} className="w-full">
                                        <td className='flex justify-center items-center'>
                                            <select disabled={readOnly} className='text-left w-full rounded border border-gray-600 h-8 py-2 focus:outline-none' value={row.fabricId} onChange={(e) => handleInputChange(e, index, "fabricId")}>
                                                <option hidden>
                                                    Select
                                                </option>
                                                {(id ? fabricList.data : fabricList.data.filter(item => item.active)).map((blend) =>
                                                    <option value={blend.id} key={blend.id} hidden={findIdInYarnBlend(blend.id)}>
                                                        {blend.aliasName}
                                                    </option>
                                                )}
                                            </select>
                                        </td>
                                        <td>
                                            <input

                                                type="number"
                                                onFocus={(e) => e.target.select()}
                                                className="border border-gray-600 rounded px-4 h-8 py-2  w-full"
                                                value={row.percentage}
                                                disabled={readOnly}
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