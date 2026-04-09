import React from 'react'
import { toast } from 'react-toastify';
import { DELETE, VIEW } from '../../../icons';
import secureLocalStorage from 'react-secure-storage';
import { useGetLoopLengthQuery } from '../../../redux/uniformService/LoopLengthMasterServices';
import { useGetItemMasterQuery } from '../../../redux/uniformService/ItemMasterService';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { useGetItemTypeMasterQuery } from '../../../redux/uniformService/ItemTypeMasterService';
import { useGetFabricMasterQuery } from '../../../redux/uniformService/FabricMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetGaugeQuery } from '../../../redux/services/GaugeMasterServices';
import { useGetdesignQuery } from '../../../redux/uniformService/DesignMasterServices';
import { useGetgsmQuery } from '../../../redux/uniformService/GsmMasterServices';
import { useGetDiaQuery } from '../../../redux/uniformService/DiaMasterServices';
import { findFromList } from '../../../Utils/helper';
const FabricConsumptionItem = ({ item, id, cuttingOrderId, index, handleInputChange, readOnly, setCuttingReceiptFabricConsumptionDetails, setCurrentSelectedIndex,
    cuttingReceiptFabricConsumptionFillData }) => {

    let cuttingDeliveryItem = cuttingReceiptFabricConsumptionFillData.find(i => parseInt(i.id) === parseInt(item.cuttingDeliveryDetailsId))

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };

    const { data: fabricList } =
        useGetFabricMasterQuery({ params });



    const { data: colorList } =
        useGetColorMasterQuery({ params });

    const { data: itemTypeList } =
        useGetItemTypeMasterQuery({ params });
    const { data: itemList } =
        useGetItemMasterQuery({ params });

    const { data: sizeList } =
        useGetSizeMasterQuery({ params });

    const { data: uomList } =
        useGetUomQuery({ params });

    const { data: gaugeList } =
        useGetGaugeQuery({ params });

    const { data: designList } =
        useGetdesignQuery({ params });

    const { data: gsmList } =
        useGetgsmQuery({ params });

    const { data: loopLengthList } =
        useGetLoopLengthQuery({ params });

    const { data: diaList } =
        useGetDiaQuery({ params });

    const delQty = item?.delQty ? item?.delQty : 0
    const alreadyConsumedQty = item?.alreadyUsedQty ? item?.alreadyUsedQty : 0
    const alreadyReturnExcessQty = item?.alreadyReturnExcessQty ? item?.alreadyReturnExcessQty : 0
    const docId = item?.CuttingDeliveryDetails?.CuttingDelivery?.docId

    const balanceQty = delQty - alreadyConsumedQty - alreadyReturnExcessQty;
    const totalLossQty = (item?.lossDetails ? item?.lossDetails : []).reduce((a, c) => a + parseFloat(c.lossQty), 0)

    const deleteItem = () => {
        setCuttingReceiptFabricConsumptionDetails(prev => {
            return prev.filter(i => parseInt(i.cuttingDeliveryDetailsId) !== parseInt(item.cuttingDeliveryDetailsId))
        })
    }

    return (
        <tr key={index} className="w-full tx-table-row">
            <td className='text-left px-1 tx-table-cell shadow-xl '>
                {index + 1}
            </td>
            <td className='text-left px-1 tx-table-cell shadow-xl '>
                {item?.docId || docId}
            </td>
            <td className='text-left px-1 tx-table-cell shadow-xl'>
                {findFromList(item?.fabricId, fabricList?.data, "name")}
            </td>
            <td className='text-left  tx-table-cell shadow-xl'>
                {findFromList(item?.colorId, colorList?.data, "name")}
            </td>
            <td className='text-left px-1 tx-table-cell shadow-xl'>
                {findFromList(item?.designId, designList?.data, "name")}
            </td>
            <td className='text-right px-1 tx-table-cell shadow-xl'>
                {findFromList(item?.gaugeId, gaugeList?.data, "name")}
            </td>
            <td className='text-right px-1 tx-table-cell shadow-xl'>
                {findFromList(item?.loopLengthId, loopLengthList?.data, "name")}
            </td>
            <td className='text-right px-1 tx-table-cell shadow-xl'>
                {findFromList(item?.gsmId, gsmList?.data, "name")}
            </td>
            <td className='text-right px-1 tx-table-cell shadow-xl'>
                {findFromList(item?.kDiaId, diaList?.data, "name")}
            </td>
            <td className='text-right px-1 tx-table-cell shadow-xl'>
                {findFromList(item?.fDiaId, diaList?.data, "name")}
            </td>
            <td className='text-right px-1 tx-table-cell shadow-xl'>
                {findFromList(item?.uomId, uomList?.data, "name")}
            </td>
            <td className='text-right px-1  tx-table-cell shadow-xl '>
                {item?.delQty}
            </td>
            <td className=' tx-table-cell text-right px-1 '>
                {alreadyConsumedQty}
            </td>
            {/* <td className=' tx-table-cell text-right px-1 '>
                {alreadyReturnExcessQty}
            </td> */}
            <td className='  tx-table-cell text-right px-1 '>
                {balanceQty}
            </td>
            <td className=' tx-table-cell text-right px-1 '>
                <input
                    type="number"
                    onFocus={(e) => e.target.select()}
                    className="text-right rounded py-1 px-1 w-full tx-table-input"
                    value={(!item.consumption) ? 0 : item.consumption}
                    readOnly={readOnly}
                    onChange={(e) => {
                        if ((parseFloat(e.target.value) + parseFloat(totalLossQty || 0)) > balanceQty) {
                            toast.info("Cons. Qty Cannot be more than Bal. Qty ", { position: 'top-center' });
                            return
                        }
                        handleInputChange(e.target.value, index, "consumption")
                    }
                    }
                    onBlur={(e) =>
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "consumption")
                    }
                />
            </td>
            <td className='  tx-table-cell text-right'>
                {totalLossQty?.toFixed(3) | 0}
            </td>
            <td className='tx-table-cell'>
                <button
                    className="text-center rounded py-1 w-16"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            setCurrentSelectedIndex(index);
                        }
                    }}
                    onClick={() => {
                        setCurrentSelectedIndex(index)
                    }}>
                    {VIEW}
                </button>
            </td>
            {!readOnly &&
                <td className='tx-table-cell '>
                    <button className='w-full' onClick={deleteItem}>
                        {DELETE}
                    </button>
                </td>
            }
        </tr>
    )
}

export default FabricConsumptionItem