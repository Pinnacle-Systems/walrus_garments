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



    const handleInputChange = (e, index, field) => {
        let value = e.target.value;

        setYarnBlend(prev => {
            const newBlend = [...prev];

            if (field === "percentage") {
                value = parseInt(value) || 0;

                const otherSum = newBlend.reduce(
                    (sum, row, i) => i !== index ? sum + (parseInt(row.percentage) || 0) : sum,
                    0
                );

                const maxAllowed = 100 - otherSum;
                value = Math.min(value, maxAllowed);

                newBlend[index][field] = value;
            } else if (field === "yarnBlendId") {
                newBlend[index][field] = value;
            }

            return newBlend;
        });
    };
    const isDisabled = (index) => {
        const totalPercentage = yarnBlend.reduce((sum, row) => sum + (parseInt(row.percentage) || 0), 0);

        if (yarnBlend[index].percentage) return false;

        return totalPercentage >= 100;
    };

    console.log(yarnBlend, "yarnBlend")
    useEffect(() => {
        if (readOnly) return
        else {
            if (yarnBlend.length === 0) {
                setYarnBlend([{ yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }]);
            }
        }
    }, [yarnBlend, readOnly])

    const addRow = () => {
        if (yarnBlend.length >= yarnBlendList?.data?.length) {
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
    console.log(id, "isd set")
    return (
        <>
            {
                yarnBlend.length !== 0 ?
                    <div className='w-full overflow-y-auto'>
                        <table className="w-full border border-gray-300 text-xs table-auto rounded">
                            <thead className='bg-light top-0 '>
                                <tr className=''>
                                    <th className="pl-1 w-80 border-gray-300 py-1">Yarn Blend</th>
                                    <th className="pl-1 border-gray-300 py-1">Percentage</th>
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
                            <tbody className='overflow-y-auto border border-gray-300 h-full w-full'>
                                {yarnBlend.map((row, index) => (
                                    <tr key={index} className="w-full">
                                        <td className='flex justify-center items-center'>
                                            <select
                                                disabled={readOnly || isDisabled(index)}
                                                className='text-left w-full rounded border border-gray-300 h-8 py-2 focus:outline-none'
                                                value={row.yarnBlendId}
                                                onChange={(e) => handleInputChange(e, index, "yarnBlendId")}
                                            >
                                                <option hidden>Select</option>
                                                {Array.isArray(yarnBlendList?.data) && (id ? yarnBlendList?.data : yarnBlendList?.data?.filter(item => item?.active)).map((blend) =>
                                                    <option value={blend.id} key={blend.id} hidden={findIdInYarnBlend(blend.id)}>
                                                        {blend.name}
                                                    </option>
                                                )}
                                            </select>
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                onFocus={(e) => e.target.select()}
                                                className="border border-gray-300 rounded px-4 h-8 py-2 w-full"
                                                value={parseInt(row.percentage, 10)}
                                                disabled={readOnly || isDisabled(index)}
                                                onChange={(event) => handleInputChange(event, index, "percentage")}
                                                max={100}
                                            />
                                        </td>
                                        <td className='border border-gray-300'>
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