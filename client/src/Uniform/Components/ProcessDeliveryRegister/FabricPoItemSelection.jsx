import React from 'react'
import FabricPoItem from './FabricProgramItem';
import { useGetProcessDeliveryByIdQuery } from '../../../redux/ErpServices/ProcessDeliveryServices';

const FabricPoItemSelection = ({ id, rawMaterialType, dataObj }) => {
    const {
        data: singleData,
    } = useGetProcessDeliveryByIdQuery({ id }, { skip: !id });
    let processDeliveryProgramDetails = singleData?.data?.ProcessDeliveryProgramDetails ? singleData?.data?.ProcessDeliveryProgramDetails : []

    return (
        <div className='border bg-gray-200'>
            <table className='table-auto w-full text-xs border border-gray-500 '>
                <thead className=' border-b border-gray-500'>
                    <tr className='bg-blue-200 border border-gray-500 sticky top-10 '>
                        <th className="tx-table-cell  w-2 text-center">S.no</th>
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
                        <th className="tx-table-cell w-10">Prog. Qty</th>
                        <th className="tx-table-cell  w-10"> In Qty</th>
                        <th className="tx-table-cell  w-10">Bal. Qty</th>
                        <th className="tx-table-cell  w-10">Bill Qty</th>
                        <th className="tx-table-cell  w-10">Bal Bill Qty</th>
                        <th className="tx-table-cell  w-10">Raw Materials</th>
                    </tr>
                </thead>
                <tbody>
                    {processDeliveryProgramDetails.map((item, index) =>
                        <FabricPoItem dataObj={dataObj} delivery={singleData?.data} key={item.id} id={item.id} index={index} item={item} rawMaterialType={rawMaterialType} />
                    )
                    }
                </tbody>
            </table>
        </div>
    )
}

export default FabricPoItemSelection