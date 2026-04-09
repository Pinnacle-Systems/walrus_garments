import React from 'react'
import { getDateFromDateTimeToDisplay, sumArray } from '../../../Utils/helper'
import { ExcelButton } from '../../../Buttons'
import { exportFileToCsv } from '../../../Utils/excelHelper'

const FabricItemCancelReport = ({ inwardItems = [], poItem, dataObj }) => {
  return (
    <div className='border bg-gray-200'>
      <table className='table-fixed text-xs border border-gray-500 '>
        <thead>
          <tr className='tx-table-row'>
            <th className='w-32 tx-table-cell'>Po. No</th>
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
            <td className='text-left px-1 tx-table-cell'>{poItem.Fabric.aliasName}</td>
            <td className='text-left px-1 tx-table-cell'>{poItem.Color.name}</td>
            <td className='text-left px-1  tx-table-cell'>{poItem.Design.name}</td>
            <td className='text-right px-1  tx-table-cell'>{poItem.Gauge.name}</td>
            <td className='text-right px-1  tx-table-cell'>{poItem.LoopLength.name}</td>
            <td className='text-left px-1  tx-table-cell'>{poItem.Gsm.name}</td>
            <td className='text-right px-1  tx-table-cell'>{poItem.KDia.name}</td>
            <td className='text-right px-1  tx-table-cell'>{poItem.FDia.name}</td>
            <td className='text-left px-1  tx-table-cell'>{poItem.Uom.name}</td>
            <td className='py-1 text-center w-8'>
              <ExcelButton onClick={() => {
                let excelData = inwardItems.map(item => {
                  let newItem = {};
                  newItem["Cancel No."] = item.PurchaseInwardOrReturn.docId;
                  newItem["Cancel Date"] = getDateFromDateTimeToDisplay(item.PurchaseInwardOrReturn.createdAt);
                  newItem["Dc. No"] = item.PurchaseInwardOrReturn.dcNo;
                  newItem["Dc. Date"] = getDateFromDateTimeToDisplay(item.PurchaseInwardOrReturn.dcDate);
                  newItem["Lot No"] = item.lotNo;
                  newItem["Qty"] = item.qty;
                  return newItem
                })
                exportFileToCsv([
                  {
                    "Po No.": dataObj.docId,
                    "Fabric": poItem.Fabric.aliasName,
                    "Color": poItem.Color.name,
                    "Design": poItem.Design.name,
                    "Gauge": poItem.Gauge.name,
                    "Loop Length": poItem.LoopLength.name,
                    "Gsm": poItem.Gsm.name,
                    "K-Dia": poItem.KDia.name,
                    "F-Dia": poItem.FDia.name,
                    "Uom": poItem.Uom.name
                  }
                  , ...excelData], `${dataObj.docId}-Cancel`)
              }} width={18} />
            </td>
          </tr>
        </tbody>
      </table>
      <table className='table-auto w-full text-xs border border-gray-500 '>
        <thead className=' border-b border-gray-500'>
          <tr className='bg-blue-200 border border-gray-500 sticky top-10 '>
            <th className="tx-table-cell  w-2 text-center">S.no</th>
            <th className="tx-table-cell  w-2 text-center">Return No.</th>
            <th className="tx-table-cell  w-20 text-center">Return Date.</th>
            <th className="tx-table-cell  w-20 text-center">DC No.</th>
            <th className="tx-table-cell  w-20 text-center">Dc Date.</th>
            <th className="tx-table-cell  w-10">Lot No.</th>
            <th className="tx-table-cell  w-10">Cancel Qty</th>
          </tr>
        </thead>
        <tbody>
          {inwardItems.map((item, index) =>
            <tr key={item.id}>

              <td className='text-center tx-table-cell'>{index + 1}</td>
              <td className='text-left  tx-table-cell'>{item.PurchaseInwardOrReturn.docId}</td>
              <td className='text-left  tx-table-cell'>{getDateFromDateTimeToDisplay(item.PurchaseInwardOrReturn.createdAt)}</td>
              <td className='text-left  tx-table-cell'>{item.PurchaseInwardOrReturn.dcNo}</td>
              <td className='text-left  tx-table-cell'>{getDateFromDateTimeToDisplay(item.PurchaseInwardOrReturn.dcDate)}</td>
              <td className='text-right  tx-table-cell'>{item.lotNo}</td>
              <td className='text-right  tx-table-cell'>{item.qty}</td>
            </tr>
          )
          }
          <tr className='tx-table-row'>
            <td colSpan={5} className='tx-table-cell'></td>
            <td>Totals</td>
            <td className='text-right  tx-table-cell'>{sumArray(inwardItems, "qty")}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default FabricItemCancelReport
