import { useGetFabricMasterQuery } from '../../../../redux/uniformService/FabricMasterService';
import { useGetColorMasterQuery } from '../../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../../redux/services/UomMasterService';
import { useGetGaugeQuery } from '../../../../redux/services/GaugeMasterServices';
import { useGetdesignQuery } from '../../../../redux/uniformService/DesignMasterServices';
import { useGetgsmQuery } from '../../../../redux/uniformService/GsmMasterServices';
import { useGetDiaQuery } from '../../../../redux/uniformService/DiaMasterServices';

import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import { findFromList, isBetweenRange, substract } from '../../../Utils/helper';
import { DELETE, PLUS } from '../../../icons';
import { toast } from 'react-toastify';
import { useGetProcessQuery } from '../../../redux/uniformService/processMasterServices';


const Fabric = ({ rawMaterials, setRawMaterials, readOnly, getIssuedProperty, setFillGrid, removeItem }) => {
    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };

    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(rawMaterials);
        newBlend[index][field] = value;
        setRawMaterials(newBlend);
    };

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )

    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )

    const { data: fabricList } =
        useGetFabricMasterQuery({ params: { companyId } });

    const { data: colorList } =
        useGetColorMasterQuery({ params: { companyId } });

    const { data: designList } =
        useGetdesignQuery({ params: { companyId } });

    const { data: gaugeList } =
        useGetGaugeQuery({ params: { companyId } });

    const { data: loopLengthList } =
        useGetLoopLengthQuery({ params: { companyId } });

    const { data: gsmList } =
        useGetgsmQuery({ params: { companyId } });

    const { data: diaList } =
        useGetDiaQuery({ params: { companyId } });

    const { data: uomList } =
        useGetUomQuery({ params: { companyId } });
    const { data: processList, isLoading: isProcessLoading, isFetching: isProcessFetching } = useGetProcessQuery({ params });

    function getTotals(field) {
        const total = rawMaterials.reduce((accumulator, current) => {
            return accumulator + parseFloat(current[field] ? current[field] : 0)
        }, 0)
        return parseFloat(total)
    }

    if (!fabricList || !colorList || !uomList || !gaugeList || !designList || !gsmList || !loopLengthList || !diaList
        || isProcessFetching || isProcessLoading) return <Loader />
    return (
        <>
            <div className={`relative w-full overflow-y-auto py-1`}>
                <table className="border border-gray-500 text-xs table-auto w-full">
                    <thead className='bg-blue-200 top-0'>
                        <tr className='h-8'>
                            <th className=' tx-table-cell '>
                                S.no
                            </th>
                            <th className='tx-table-cell'>
                                Fabric Name
                            </th>
                            <th className=' tx-table-cell'>
                                Color
                            </th>
                            <th className='tx-table-cell'>
                                Design
                            </th>
                            <th className='tx-table-cell'>
                                Gauge
                            </th>
                            <th className='tx-table-cell'>
                                LL
                            </th>
                            <th className='tx-table-cell'>
                                Gsm
                            </th>
                            <th className='tx-table-cell'>
                                K-Dia
                            </th>
                            <th className='tx-table-cell'>
                                F-Dia
                            </th>
                            <th className='tx-table-cell'>
                                Uom
                            </th>
                            <th className='tx-table-cell  w-16'>
                                Lot No.
                            </th>
                            <th className='tx-table-cell '>
                                Prev. Process
                            </th>
                            <th className='tx-table-cell'>
                                Stock Rolls
                            </th>
                            <th className='tx-table-cell'>
                                Stock qty
                            </th>
                            <th className="tx-table-cell ">
                                No. of Rolls.
                            </th>
                            <th className="tx-table-cell">
                                Issue qty
                            </th>
                            {!readOnly &&
                                <th className='tx-table-cell'>
                                    <div onClick={() => setFillGrid(true)}
                                        className='hover:cursor-pointer py-2 flex items-center justify-center bg-green-600 text-white'>
                                        {PLUS}
                                    </div>
                                </th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto border border-gray-600 h-full w-full'>
                        {rawMaterials.map((item, index) => (
                            <tr key={index} className="w-full tx-table-row">
                                <td className='text-left px-1 tx-table-cell shadow-xl '>
                                    {index + 1}
                                </td>
                                <td className='text-left px-1 tx-table-cell shadow-xl'>
                                    {findFromList(item.fabricId, fabricList.data, "aliasName")}
                                </td>
                                <td className='text-left  tx-table-cell shadow-xl'>
                                    {findFromList(item.colorId, colorList.data, "name")}
                                </td>
                                <td className='text-left px-1 tx-table-cell shadow-xl'>
                                    {findFromList(item.designId, designList.data, "name")}
                                </td>
                                <td className='text-right px-1 tx-table-cell shadow-xl'>
                                    {findFromList(item.gaugeId, gaugeList.data, "name")}
                                </td>
                                <td className='text-right px-1 tx-table-cell shadow-xl'>
                                    {findFromList(item.loopLengthId, loopLengthList.data, "name")}
                                </td>
                                <td className='text-right px-1 tx-table-cell shadow-xl'>
                                    {findFromList(item.gsmId, gsmList.data, "name")}
                                </td>
                                <td className='text-right px-1  tx-table-cell shadow-xl'>
                                    {findFromList(item.kDiaId, diaList.data, "name")}
                                </td>
                                <td className='text-right px-1 tx-table-cell shadow-xl'>
                                    {findFromList(item.fDiaId, diaList.data, "name")}
                                </td>
                                <td className='text-right px-1 tx-table-cell shadow-xl'>
                                    {findFromList(item.uomId, uomList.data, "name")}
                                </td>
                                <td className='tx-table-cell'>
                                    {item.lotNo}
                                </td>
                                <td className=' px-1 tx-table-cell shadow-xl '>
                                    {findFromList(item.processId, processList.data, "name")}
                                </td>
                                <td className='shadow-xl text-right tx-table-cell '>
                                    {item.stockRolls}
                                </td>
                                <td className='shadow-xl text-right tx-table-cell '>
                                    {parseFloat(item.stockQty).toFixed(3)}
                                </td>
                                <td className='tx-table-cell'>
                                    <input
                                        min={"0"}
                                        type="number"
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0", index, "noOfRolls") } }}
                                        className="text-right rounded py-1 px-1 w-full tx-table-input"
                                        value={(!item.noOfRolls) ? 0 : item.noOfRolls}
                                        disabled={readOnly}
                                        onChange={(e) => {
                                            if (parseInt(e.target.value) > parseInt(item.stockRolls)) {
                                                toast.info("Issue Rolls Cannot be more than Stock Rolls", { position: 'top-center' })
                                                return
                                            }
                                            handleInputChange(e.target.value, index, "noOfRolls")
                                        }
                                        }
                                    />
                                </td>
                                <td className='tx-table-cell'>
                                    <input
                                        min={"0"}
                                        type="number"
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.000", index, "qty") } }}
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 px-1 w-full tx-table-input"
                                        value={(!item.qty) ? 0 : item.qty}
                                        disabled={readOnly}
                                        onChange={(e) => {
                                            if (isBetweenRange(0, substract(item._sum.qty, substract(getIssuedProperty(item), item?.qty ? item?.qty : 0)), e.target.value)) {
                                                handleInputChange(e.target.value, index, "qty")
                                            } else {
                                                toast.info("Issue Qty Cannot be more than Stock Qty", { position: 'top-center' })
                                            }
                                        }
                                        }
                                        onBlur={(e) =>
                                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty")
                                        }
                                    />
                                </td>
                                {!readOnly &&
                                    <td className='tx-table-cell w-12'>
                                        <div tabIndex={-1} onClick={() => removeItem(item)} className='flex justify-center px-2 py-1.5 items-center cursor-pointer bg-gray-300'>
                                            {DELETE}
                                        </div>
                                    </td>
                                }
                            </tr>
                        ))}
                        {Array.from({ length: 2 - rawMaterials.length }).map(i =>
                            <tr className='w-full font-bold h-6 border-gray-400 border'>
                                <td className='tx-table-cell'>
                                </td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell    "></td>
                                <td className="tx-table-cell    "></td>
                                <td className="tx-table-cell    "></td>
                                <td className="tx-table-cell    "></td>
                                <td className="tx-table-cell    "></td>
                                <td className="tx-table-cell    "></td>
                                <td className="tx-table-cell    "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                {!readOnly &&
                                    <td className="tx-table-cell   "></td>
                                }
                            </tr>)
                        }
                        <tr className='bg-blue-200 w-full font-bold'>
                            <td className="tx-table-cell  font-bold text-center" colSpan={14}>Total</td>
                            <td className="tx-table-cell    text-right">{getTotals("noOfRolls")}</td>
                            <td className="tx-table-cell    text-right">{getTotals("qty").toFixed(3)}</td>
                            {!readOnly &&
                                <td className="tx-table-cell   "></td>
                            }
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Fabric