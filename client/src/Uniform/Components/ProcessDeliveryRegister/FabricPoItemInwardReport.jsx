import React from 'react'
import { getDateFromDateTimeToDisplay, sumArray } from '../../../Utils/helper'
import { ExcelButton } from '../../../Buttons'
import { exportFileToCsv } from '../../../Utils/excelHelper'

const FabricItemInwardReport = ({ inwardItems = [], item, dataObj }) => {
  const inwardItemsWithLot = [];
  inwardItems.forEach(i => {
    i.lotDetails.forEach(j => {
      inwardItemsWithLot.push({ docId: i?.ProcessInward?.docId, dcNo: i?.ProcessInward?.dcNo, dcDate: i?.ProcessInward?.dcDate, lotNo: j.lotNo, inwardBags: j.inwardBags, inwardQty: j.inwardQty });
    })
  })
  return (
    <div className='border bg-gray-200'>
      <div className='flex text-lg justify-between'>
        <div className=''>Inward Report</div>
        <div>{dataObj.docId}</div>
      </div>
      <table className='table-fixed text-xs border border-gray-500 '>
        <thead>
          <tr className='tx-table-row'>
            <th>Fabric</th>
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
          </tr>
        </thead>
        <tbody>
          <tr className='tx-table-row'>
            <td className='tx-table-cell'>
              {dataObj.docId}
            </td>
            <td className='text-left px-1 tx-table-cell'>{item?.Fabric?.aliasName}</td>
            <td className='text-left px-1 tx-table-cell'>{item?.Color?.name}</td>
            <td className='text-left px-1  tx-table-cell'>{item?.Design?.name}</td>
            <td className='text-right px-1  tx-table-cell'>{item?.Gauge?.name}</td>
            <td className='text-right px-1  tx-table-cell'>{item?.LoopLength?.name}</td>
            <td className='text-left px-1  tx-table-cell'>{item?.Gsm?.name}</td>
            <td className='text-right px-1  tx-table-cell'>{item?.KDia?.name}</td>
            <td className='text-right px-1  tx-table-cell'>{item?.FDia?.name}</td>
            <td className='text-left px-1  tx-table-cell'>{item?.Uom?.name}</td>
            <td className='py-1 text-center w-8'>
              <ExcelButton onClick={() => {

                exportFileToCsv([
                  {
                    "Po No.": dataObj.docId,
                    "Fabric": item.Fabric.aliasName,
                    "Color": item.Color.name,
                    "Design": item.Design.name,
                    "Gauge": item.Gauge.name,
                    "Loop Length": item.LoopLength.name,
                    "Gsm": item.Gsm.name,
                    "K-Dia": item.KDia.name,
                    "F-Dia": item.FDia.name,
                    "Uom": item.Uom.name
                  }
                  , ...inwardItemsWithLot], `${dataObj.docId}-Inward`)
              }} width={18} />
            </td>
          </tr>
        </tbody>
      </table>
      <table className='table-auto w-full text-xs border border-gray-500 '>
        <thead className=' border-b border-gray-500'>
          <tr className='bg-blue-200 border border-gray-500 sticky top-10 '>
            <th className="tx-table-cell  w-2 text-center">S.no</th>
            <th className="tx-table-cell  w-2 text-center">Inward No.</th>
            <th className="tx-table-cell  w-20 text-center">Inward Date.</th>
            <th className="tx-table-cell  w-20 text-center">DC No.</th>
            <th className="tx-table-cell  w-20 text-center">Dc Date.</th>
            <th className="tx-table-cell  w-10">Lot No.</th>
            <th className="tx-table-cell  w-10">Inward Rolls</th>
            <th className="tx-table-cell  w-10">Inward Qty</th>
          </tr>
        </thead>
        <tbody>
          {inwardItemsWithLot.map((item, index) =>
            <tr key={item.id}>
              <td className='text-center   tx-table-cell'>{index + 1}</td>
              <td className='text-left  tx-table-cell'>{item?.docId}</td>
              <td className='text-left  tx-table-cell'>{getDateFromDateTimeToDisplay(item?.createdAt)}</td>
              <td className='text-left  tx-table-cell'>{item?.dcNo}</td>
              <td className='text-left  tx-table-cell'>{getDateFromDateTimeToDisplay(item?.dcDate)}</td>
              <td className='text-right  tx-table-cell'>{item?.lotNo}</td>
              <td className='text-right  tx-table-cell'>{item?.inwardRolls}</td>
              <td className='text-right  tx-table-cell'>{item?.inwardQty}</td>
            </tr>
          )
          }
          <tr className='tx-table-row'>
            <td colSpan={5} className='tx-table-cell'></td>
            <td>Totals</td>
            <td className='text-right  tx-table-cell'>{sumArray(inwardItemsWithLot.filter(item => item.inwardRolls), "inwardRolls")}</td>
            <td className='text-right  tx-table-cell'>{sumArray(inwardItemsWithLot, "inwardQty")}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default FabricItemInwardReport
