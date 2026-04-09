import React from 'react';
import { sumArray } from '../../../Utils/helper';

const ProductionDeliveryDetails = ({ readOnly, productionDeliveryDetails }) => {

  return (
    <fieldset disabled={readOnly} className=''>
      <div className={`relative w-full overflow-y-auto p-1`}>
        <table className="tx-table-cell border border-gray-500 text-xs table-auto w-full">
          <thead className='border border-gray-500 top-0'>
            <tr className='border border-gray-500'>
              <th className="tx-table-cell w-2 text-center">S.no</th>
              <th className="tx-table-cell w-48">Colors</th>
              <th className="tx-table-cell w-32">Size</th>
              <th className="tx-table-cell w-20">Uom</th>
              <th className="tx-table-cell w-20">Del. Qty</th>
              <th className="tx-table-cell w-20">Process Cost</th>
              <th className="tx-table-cell w-20">Amount</th>
            </tr>
          </thead>
          <tbody className='overflow-y-auto tx-table-cell h-full w-full'>
            {productionDeliveryDetails.map((row, index) => (
              <tr key={index} className="w-full">
                <td className='tx-table-cell'>{index + 1}</td>
                <td className='tx-table-cell '>
                  {row.Color.name}
                </td>
                <td className='tx-table-cell'>
                  {row.Size.name}
                </td>
                <td className='tx-table-cell'>
                  {row.Uom.name}
                </td>
                <td className='tx-table-cell text-right'>
                  {parseFloat((!row.delQty) ? 0 : row.delQty).toFixed(3)}
                </td>
                <td className='tx-table-cell'>
                  {(!row.processCost) ? 0 : row.processCost}
                </td>
                <td className='tx-table-cell text-right'>
                  {(!row.delQty || !row.processCost) ? 0 : (parseFloat(row.delQty) * parseFloat(row.processCost)).toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className='border  border-gray-500'>
              <th className='tx-table-cell text-center px-1  font-bold text-xs' colSpan={4}>TOTAL</th>
              <td className='px-1 h-8  text-right'>{parseFloat(sumArray(productionDeliveryDetails, "delQty")).toFixed(3)}</td>
              <th className='tx-table-cell text-center px-1  font-bold text-xs' ></th>
              <td className='px-1 h-8  text-right'>{parseFloat(productionDeliveryDetails.reduce((a, c) => a + (parseFloat(c.processCost) * parseFloat(c.delQty)), 0)).toFixed(3)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </fieldset>
  )
}

export default ProductionDeliveryDetails