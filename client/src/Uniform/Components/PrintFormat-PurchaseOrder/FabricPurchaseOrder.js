import React from 'react'

const FabricPurchaseOrder = ({ poItems = [], taxDetails }) => {
  return (
    <div>
      <table border="1px" className=" text-xs table-auto w-full" >
        <thead className=' border border-gray-500 top-0  bg-green-200'>
          <tr className='h-8'>
            <th className="tx-table-cell text-center w-16">S.no</th>
            <th className="tx-table-cell ">Description</th>
            <th className="tx-table-cell ">Color</th>
            <th className="tx-table-cell  ">UOM</th>
            <th className=' tx-table-cell'>
              Design
            </th>
            <th className=' tx-table-cell'>
              Gauge
            </th>
            <th className=' tx-table-cell'>
              LL
            </th>
            <th className=' tx-table-cell'>
              Gsm
            </th>
            <th className=' tx-table-cell'>
              K-Dia
            </th>
            <th className=' tx-table-cell'>
              F-Dia
            </th>
            <th className="tx-table-cell  ">No. Of Rolls</th>
            <th className="tx-table-cell  "> Qty</th>
            <th className="tx-table-cell  ">Rate</th>
            <th className="tx-table-cell  w-16">Tax</th>
            <th className="tx-table-cell  w-16">Amount</th>

          </tr>
        </thead>
        <tbody>
          {poItems.map((value, index) => (
            <tr className='border  border-gray-500 w-full' key={index}>
              <td className='tx-table-cell text-center '>{index + 1} </td>

              <td className='tx-table-cell   '>
                {value.Fabric?.aliasName}
              </td>
              <td className='tx-table-cell text-center  px-1 '>
                {value.Color?.name}
              </td>
              <td className='tx-table-cell text-center px-1 '>
                {value.Uom?.name}
              </td>
              <td className='text-center px-1  tx-table-cell '>
                {value.Design?.name}
              </td>
              <td className='text-center px-1  tx-table-cell '>
                {value.Gauge?.name}
              </td>
              <td className='text-center px-1  tx-table-cell '>
                {value.LoopLength?.name}
              </td>
              <td className='text-center px-1  tx-table-cell '>
                {value.Gsm?.name}
              </td>
              <td className='text-center px-1  tx-table-cell '>
                {value.KDia?.name}
              </td>
              <td className='text-center px-1  tx-table-cell '>
                {value.FDia?.name}
              </td>
              <td className='tx-table-cell text-center px-1 '>{value.noOfRolls}</td>
              <td className='tx-table-cell text-center text-right px-1 '>{parseFloat(value.qty).toFixed(3)}</td>
              <td className='tx-table-cell text-center text-right px-1 '>{parseFloat(value.price).toFixed(2)} </td>
              <td className='tx-table-cell text-center px-1 '>{value.taxPercent} </td>
              <td className='tx-table-cell text-right px-1 '>{parseFloat(parseFloat(value.qty) * parseFloat(value.price)).toFixed(2)}</td>
            </tr>
          ))}
          <tr className='border  border-gray-500'>
            <th className='tx-table-cell text-center px-1 h-8 font-bold text-xs' colSpan={14}>TOTAL</th>
            <td className='px-1 h-8  text-right'>{parseFloat(taxDetails.taxableAmount).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default FabricPurchaseOrder