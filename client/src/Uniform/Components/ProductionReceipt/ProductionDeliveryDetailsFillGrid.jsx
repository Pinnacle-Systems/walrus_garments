import React from 'react';
import { substract } from '../../../Utils/helper';

const ProductionDeliveryDetailsFillGrid = ({ isIroning, isPacking, prevProcessId, id, productionDeliveryDetailsFillData, setProductionDeliveryDetailsFillData,
  productionReceiptDetails, setProductionReceiptDetails, onDone }) => {

  const addItem = (item) => {
    setProductionReceiptDetails(prev => {
      let newInwardDetails = structuredClone(prev);
      newInwardDetails.push({
        productionDeliveryDetailsId: item?.id,
        receivedQty: parseFloat(substract(item.delQty, item?.alreadyReceivedQty ? item?.alreadyReceivedQty : 0)).toFixed(3),
        itemId: item?.itemId,
        processCost: item?.processcost,
        delQty: item?.delQty, alreadyReceivedQty: item?.alreadyReceivedQty,
        colorId: item?.colorId, sizeId: item?.sizeId, panelId: item?.panelId, panelColorId: item?.panelColorId, productionConsumptionDetails: [{
          consumption: parseFloat(substract(item.delQty, item?.alreadyReceivedQty ? item?.alreadyReceivedQty : 0)).toFixed(3), itemId: item?.itemId, productionDeliveryDetailsId: item?.id,
          colorId: item?.colorId, sizeId: item?.sizeId, panelId: item?.panelId, panelColorId: item?.panelColorId,
        }]
      })
      return newInwardDetails
    })
  }
  const deleteItem = (val) => {
    setProductionReceiptDetails(prev => {
      return prev.filter(item => parseInt(item.productionDeliveryDetailsId) !== parseInt(val?.id))
    })
  }

  const isItemSelected = (val) => {
    let foundIndex = productionReceiptDetails.findIndex(item => parseInt(item.productionDeliveryDetailsId) === parseInt(val?.id))
    return foundIndex !== -1
  }

  function handleSelectAllChange(value) {
    if (value) {
      (productionDeliveryDetailsFillData ? productionDeliveryDetailsFillData : []).forEach(item => addItem(item))
    } else {
      (productionDeliveryDetailsFillData ? productionDeliveryDetailsFillData : []).forEach(item => deleteItem(item))
    }
  }

  function getSelectAll() {
    return (productionDeliveryDetailsFillData ? productionDeliveryDetailsFillData : []).every(item => isItemSelected(item))
  }

  const handleChangeInwardProgramDetails = (item, processCost) => {
    if (isItemSelected(item)) {
      deleteItem(item)
    } else {
      addItem(item, processCost)
    }
  }



  return (
    <>
      <div className={`w-full h-[500px] overflow-auto`}>
        <div className='flex justify-between mb-2'>
          <h1 className='text-center mx-auto font-bold'>Production Delivery Details</h1>
          <button className='text-center font-bold bg-green-500 text-gray-100 p-1 rounded-lg' onClick={onDone}>DONE</button>
        </div>
        <table className=" text-xs table-fixed w-full">
          <thead className='bg-gray-300 top-0'>
            <tr>
              <th className='w-16 p-2'>
                Mark All
                <input type="checkbox" className='w-full' onChange={(e) => handleSelectAllChange(e.target.checked)}
                  checked={getSelectAll()}
                />
              </th>

              <th className="tx-table-cell w-10 text-center">S.no</th>

              <th className="tx-table-cell w-48">Item</th>
              {
                (!isIroning()) || (!isPacking()) &&
                <th className="tx-table-cell w-48">Panel</th>
              }
              <th className="tx-table-cell w-48">Colors</th>
              <th className="tx-table-cell w-32">Size</th>
              <th className="tx-table-cell w-20">Del Qty</th>
              <th className="tx-table-cell w-20">Process Cost</th>
              <th className="tx-table-cell  w-16">A. Inward Qty<span className="text-red-500">*</span></th>
              <th className="tx-table-cell  w-16">Bal. Qty<span className="text-red-500">*</span></th>
            </tr>
          </thead>
          <tbody className='overflow-y-auto  h-full w-full'>{console.log(productionDeliveryDetailsFillData, "productionDeliveryDetailsFillData")}
            {productionDeliveryDetailsFillData?.filter(row => substract(row.delQty, row?.alreadyReceivedQty ? row?.alreadyReceivedQty : 0) > 0).map((row, index) => (
              <tr key={index} className="w-full tx-table-row" onClick={() => { handleChangeInwardProgramDetails(row, row.processcost) }} >
                <td className="tx-table-cell flex justify-center ">
                  <input type='checkbox' checked={isItemSelected(row)} />
                </td>
                <td className="tx-table-cell  ">
                  {index + 1}
                </td>
                <td className='tx-table-cell'>
                  {row?.itemName}
                </td>
                {
                  (!isIroning()) || (!isPacking()) &&
                  <td className='tx-table-cell'>
                    {row?.panelName}
                  </td>
                }


                <td className='tx-table-cell'>
                  {row?.colorName}
                </td>
                <td className='tx-table-cell'>
                  {row?.sizeName}
                </td>
                {/* <td className='tx-table-cell'>
                  {row?.Uom?.name}
                </td> */}
                <td className='tx-table-cell text-right'>
                  {parseFloat(row?.delQty).toFixed(3)}
                </td>
                <td className='tx-table-cell text-right'>
                  {parseFloat(row?.processcost).toFixed(2)}
                </td>
                <td className='text-right tx-table-cell'>
                  {row?.alreadyReceivedQty || 0}
                </td>
                <td className='text-right tx-table-cell'>
                  {substract(row.delQty, row?.alreadyReceivedQty ? row?.alreadyReceivedQty : 0).toFixed(3)}
                </td>
              </tr>
            ))}
            {Array.from({ length: 5 - productionDeliveryDetailsFillData?.length }).map(i =>
              <tr className='w-full font-bold h-8 border border-gray-400 tx-table-row'>
                <td className='tx-table-cell'>
                </td>
                {(!isIroning()) || (!isPacking()) &&
                  <td className="tx-table-cell   "></td>
                }
                <td className="tx-table-cell   "></td>
                <td className="tx-table-cell   "></td>
                {
                  !isIroning &&
                  <td className="tx-table-cell   "></td>
                }
                <td className="tx-table-cell   "></td>
                <td className="tx-table-cell   "></td>
                <td className="tx-table-cell  "></td>
                <td className="tx-table-cell   "></td>
                <td className="tx-table-cell   "></td>
              </tr>)
            }
          </tbody>
        </table>
      </div>
    </>

  )
}

export default ProductionDeliveryDetailsFillGrid