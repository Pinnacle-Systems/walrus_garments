import React from 'react'
import isEmpty from 'lodash/isEmpty'
;
import CuttingDeliveryItem from './CuttingDeliveryItem';
import { PLUS } from '../../../icons';

const CuttingDeliveryDetails = ({ readOnly, id, openStockGrid, setCuttingDeliveryDetails, cuttingDeliveryDetails, storeId }) => {

  const handleInputChange = (value, index, field) => {
    const newBlend = structuredClone(cuttingDeliveryDetails);
    newBlend[index][field] = value;
    setCuttingDeliveryDetails(newBlend);
  };
  function removeItem(removeItem) {
    setCuttingDeliveryDetails(cuttingDeliveryDetails => {
      let newItems = structuredClone(cuttingDeliveryDetails);
   
      return newItems
    });
  }


  return (
    <fieldset
      disabled={readOnly}
      className="frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border
      border-gray-600 overflow-auto min-h-[220px]  overflow-auto"
    >
      <legend className="sub-heading">Cutting Fabric Delivery Details</legend>
      <div className={`relative w-full overflow-y-auto p-1 h-[220px] overflow-aoto`}>
        <table className="tx-table-cell border border-gray-500 text-xs table-auto w-full  overflow-auto">
          <thead className="bg-blue-200 border border-gray-500 top-0">
            <tr className="border border-gray-500">
              <th className="tx-table-cell w-2 text-center">S.no</th>

              <th className="tx-table-cell w-40">Fabric</th>
              <th className="tx-table-cell w-28">Color</th>
              <th className="tx-table-cell w-20"> Design</th>
              <th className="tx-table-cell w-20">Gsm</th>
              <th className="tx-table-cell w-20">GG</th>
              <th className="tx-table-cell w-20">LL</th>
              <th className="tx-table-cell w-20">K.Dia</th>
              <th className="tx-table-cell w-20">F.Dia</th>
              <th className="tx-table-cell w-20">Uom</th>
              <th className="tx-table-cell w-20">Lot. No</th>
              <th className="tx-table-cell w-20">No Of Rolls</th>
              <th className="tx-table-cell w-20">Stock Qty</th>
              <th className="tx-table-cell w-20">Issue Roll</th>
              <th className="tx-table-cell w-20">Issue Qty</th>
              {readOnly ?
                "" :
                <th className='w-20  bg-green-600 text-white'>
                  <div onClick={openStockGrid}
                    className='hover:cursor-pointer w-full h-full flex items-center justify-center'>
                    {PLUS}
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody className="overflow-y-auto tx-table-cell h-full w-full">{console.log(cuttingDeliveryDetails, "cuttingDeliveryDetails")}
            {cuttingDeliveryDetails.map((item, index) =>
              <CuttingDeliveryItem storeId={storeId} item={item} handleInputChange={handleInputChange} removeItem={removeItem} index={index} id={id} readOnly={readOnly} />
            )
            }
            {Array.from({ length: 14 - cuttingDeliveryDetails.length }).map(i =>
              <tr key={i} className='w-full font-bold h-6 border-gray-400 border tx-table-row '>
                <td className='tx-table-cell'>
                </td>
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
                <td className="tx-table-cell   "></td>
                <td className="tx-table-cell   "></td>
                {!readOnly
                  &&
                  <td className="tx-table-cell   "></td>
                }
              </tr>)
            }
          </tbody>
        </table>
      </div>
    </fieldset>
  );
};

export default CuttingDeliveryDetails;
