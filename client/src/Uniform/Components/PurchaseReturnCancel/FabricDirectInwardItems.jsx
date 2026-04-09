import React from 'react';
import FabricPoItem from './FabricPoItem';
import { toast } from 'react-toastify';
import { sumArray } from '../../../Utils/helper';
import { useGetFabricMasterQuery } from '../../../redux/uniformService/FabricMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetGaugeQuery } from '../../../redux/services/GaugeMasterServices';
import { useGetdesignQuery } from '../../../redux/uniformService/DesignMasterServices';
import { useGetgsmQuery } from '../../../redux/uniformService/GsmMasterServices';
import { useGetDiaQuery } from '../../../redux/uniformService/DiaMasterServices';
import { useGetLoopLengthQuery } from '../../../redux/uniformService/LoopLengthMasterServices';
import FabricDirectItem from './FabricDirectItem';
import { standardTransactionPlaceholderRowCount } from "../ReusableComponents/TransactionLineItemsSection";


const FabricDirectInwardItems = ({ handleInputChangeLotNo, handleInputChange, removeLotNo, addNewLotNo, inwardItems, setInwardItems, readOnly, removeItem, purchaseInwardId, params, storeId }) => {


    const { data: fabricList } =
        useGetFabricMasterQuery({ params });

    const { data: colorList } =
        useGetColorMasterQuery({ params: { ...params } });
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

    function findStockQty(stockDatas) {
        let qty = stockDatas.reduce((total, current) => {
            return total + parseFloat(current?._sum?.qty)
        }, 0)
        return qty || 0
    }
    function findStockRolls(stockDatas) {
        let noOfRolls = stockDatas.reduce((total, current) => {
            return total + parseInt(current?._sum?.noOfRolls)
        }, 0)
        return noOfRolls || 0
    }

    return (
        <>
            <div className={`relative w-full overflow-y-auto py-1`}>
                <table className="tx-table-cell text-xs table-auto border border-gray-500  w-full">
                    <thead className='bg-blue-200 border border-gray-500 top-0'>
                        <tr className='h-8'>
                            <th className='text-center w-8 tx-table-cell '>
                                S.no
                            </th>
                            <th className='text-center w-24 tx-table-cell'>
                                DI.no
                            </th>
                            <th className='w-24 tx-table-cell'>
                                Fabric Name
                            </th>
                            <th className='w-16 tx-table-cell'>
                                Color
                            </th>
                            <th className='w-16 tx-table-cell'>
                                Design
                            </th>
                            <th className='w-12 tx-table-cell'>
                                Gauge
                            </th>
                            <th className='w-12 tx-table-cell'>
                                LL
                            </th>
                            <th className='w-12 tx-table-cell'>
                                Gsm
                            </th>
                            <th className='w-12 tx-table-cell'>
                                K-Dia
                            </th>
                            <th className='w-12 tx-table-cell'>
                                F-Dia
                            </th>
                            <th className='w-12 tx-table-cell'>
                                Uom
                            </th>

                            <th className='w-12 tx-table-cell'>
                                Stock qty
                            </th>
                            <th className='tx-table-cell'>
                                A. Inwarded Rolls
                            </th>
                            <th className='tx-table-cell'>
                                A. Inwarded qty
                            </th>
                            <th className="tx-table-cell w-14">
                                A. Return Rolls
                            </th>
                            <th className="tx-table-cell w-14">
                                A. Return Qty
                            </th>

                            <th className='tx-table-cell'>
                                Allowed Return Qty
                            </th>
                            <th className="tx-table-cell  w-10">Lot Det.<span className="text-red-500">*</span></th>
                            <th className="tx-table-cell  w-16">No. of Rolls<span className="text-red-500">*</span></th>
                            <th className='tx-table-cell w-16'>
                                Return Qty
                            </th>
                            <th className='w-12 tx-table-cell'>
                                Price
                            </th>
                            <th className='w-16 tx-table-cell'>
                                Gross
                            </th>
                            {!readOnly &&
                                <th className='tx-table-cell tx-table-cell w-12'>Delete</th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto  h-full w-full'>
                        {inwardItems.map((item, index) => <FabricDirectItem
                            fabricList={fabricList} uomList={uomList} storeId={storeId}
                            colorList={colorList} gaugeList={gaugeList} designList={designList} gsmList={gsmList}
                            loopLengthList={loopLengthList}
                            diaList={diaList}
                            item={item} handleInputChangeLotNo={handleInputChangeLotNo} stockId={item.stockId} noOfRolls={item.noOfRolls} removeItem={removeItem} key={item.poItemsId}
                            qty={item.qty} poItemId={item.poItemsId} index={index} handleInputChange={handleInputChange} purchaseInwardId={purchaseInwardId} readOnly={readOnly} />)}
                        {Array.from({ length: Math.max(0, standardTransactionPlaceholderRowCount - inwardItems.length) }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 tx-table-row'>
                                <td className='tx-table-cell'>
                                </td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell    "></td>
                                <td className="tx-table-cell    "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                <td className="tx-table-cell   "></td>
                                {!readOnly &&
                                    <td className="tx-table-cell w-10"></td>
                                }
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default FabricDirectInwardItems
