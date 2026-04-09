import React from 'react'
import { substract } from '../../../Utils/helper'

const FabricRawMaterialItem = ({ item }) => {
    return (
        <table className='table-auto w-full text-xs border border-gray-500'>
            <thead>
                <tr className='bg-blue-200 border border-gray-500 sticky top-10 '>
                    <th className="tx-table-cell w-28">S.no</th>
                    <th className="tx-table-cell w-28">Fabric</th>
                    <th className='w-10 tx-table-cell'>
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
                    <th className="tx-table-cell  w-14">Qty</th>
                    <th className="tx-table-cell  w-14">Already Used</th>
                    <th className="tx-table-cell  w-14">Bal. Qty</th>
                </tr>
            </thead>
            <tbody>
                {(item?.rawMaterials ? item?.rawMaterials : []).map(
                    (item, index) =>
                        <tr key={item.id} className={`tx-table-row `}>
                            <td className='text-center   tx-table-cell'>{index + 1}</td>
                            <td className='text-left px-1 tx-table-cell'>{item.Fabric.aliasName}</td>
                            <td className='text-left px-1 tx-table-cell'>{item.Color.name}</td>
                            <td className='text-left px-1  tx-table-cell'>{item.Design.name}</td>
                            <td className='text-right px-1  tx-table-cell'>{item.Gauge.name}</td>
                            <td className='text-right px-1  tx-table-cell'>{item.LoopLength.name}</td>
                            <td className='text-left px-1  tx-table-cell'>{item.Gsm.name}</td>
                            <td className='text-right px-1  tx-table-cell'>{item.KDia.name}</td>
                            <td className='text-right px-1  tx-table-cell'>{item.FDia.name}</td>
                            <td className='text-left px-1  tx-table-cell'>{item.Uom.name}</td>
                            <td className='text-left   tx-table-cell'>{parseFloat(item?.qty ? item?.qty : 0).toFixed(3)}</td>
                            <td className='text-left   tx-table-cell'>{parseFloat(item?.alreadyUsedQty ? item?.alreadyUsedQty : 0).toFixed(3)}</td>
                            <td className='text-left   tx-table-cell'>{parseFloat(substract(item?.qty ? item?.qty : 0, item?.alreadyUsedQty ? item?.alreadyUsedQty : 0)).toFixed(3)}</td>
                        </tr>
                )}
            </tbody>
        </table>
    )
}

export default FabricRawMaterialItem
