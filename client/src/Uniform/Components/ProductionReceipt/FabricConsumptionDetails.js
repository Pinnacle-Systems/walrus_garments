import React, { useState } from 'react'

import ProductionReceiptDetailItem from './ProductionReceiptDetailItem';
import { PLUS } from '../../../icons';
import Modal from '../../../UiComponents/Modal';
import LossReasonBreakup from './LossReasonBreakup';

const FabricConsumptionDetails = ({ id, readOnly,
    productionDeliveryId, productionReceiptDetails, setProductionReceiptDetails, setFillGrid, productionDeliveryDetailsFillData,
    isPacking, setProductionDeliveryDetailsFillGridByStitching, isStitching }) => {
    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("")

    return (
        <>
            <Modal isOpen={Number.isInteger(currentSelectedIndex)} onClose={() => setCurrentSelectedIndex("")}>
                <LossReasonBreakup setCurrentSelectedIndex={setCurrentSelectedIndex} currentIndex={currentSelectedIndex} readOnly={readOnly}
                    productionReceiptDetails={productionReceiptDetails}
                    productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
                    setProductionReceiptDetails={setProductionReceiptDetails} />
            </Modal>

            <div className={`relative w-full overflow-y-auto p-1`}>
                <table className="tx-table-cell border border-gray-500 text-xs table-auto w-full">
                    <thead className="bg-gray-300 border border-gray-500 top-0">
                        <tr className="border border-gray-500">
                            <th className="tx-table-cell w-2 text-center">S.no</th>

                            <th className="tx-table-cell w-24">Item</th>
                            <th className="tx-table-cell w-24">Panel</th>

                            <th className="tx-table-cell w-24">Color</th>
                            <th className="tx-table-cell w-20">Size</th>
                            {/* <th className="tx-table-cell w-20"> Uom</th> */}
                            <th className="tx-table-cell w-20">Process Cost</th>
                            <th className="tx-table-cell w-20">Del. Qty</th>
                            <th className="tx-table-cell w-20">Already Received Qty</th>
                            <th className="tx-table-cell w-20">Bal To Rec Qty</th>
                            <th className="tx-table-cell w-20">Received Qty</th>
                            <th className="tx-table-cell w-12">Loss</th>
                            <th className="tx-table-cell w-24">
                                Loss Qty
                            </th>
                            {!readOnly &&
                                <th className="tx-table-cell  w-5 text-green-600" onClick={() => {
                                    if (isStitching()) {
                                        setProductionDeliveryDetailsFillGridByStitching(true)
                                    }
                                    else {
                                        setFillGrid(true)
                                    }
                                }}> {PLUS} </th>
                            }
                        </tr>
                    </thead>
                    <tbody className="overflow-y-auto tx-table-cell h-full w-full">
                        {productionReceiptDetails.map((item, index) =>
                            <ProductionReceiptDetailItem isPacking={isPacking} setCurrentSelectedIndex={setCurrentSelectedIndex} readOnly={readOnly} productionDeliveryDetailsFillData={productionDeliveryDetailsFillData} item={item} index={index} cuttingOrderId={productionDeliveryId} productionReceiptDetails={productionReceiptDetails} setProductionReceiptDetails={setProductionReceiptDetails} />
                        )
                        }
                        {Array.from({ length: 5 - productionReceiptDetails.length }).map(i =>
                            <tr key={i} className='w-full font-bold h-6 border-gray-400 border tx-table-row'>
                                <td className='tx-table-cell'> </td>
                                {!isPacking &&
                                    <td className="tx-table-cell   "></td>
                                }
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
                                {!readOnly &&
                                    <td className="tx-table-cell   "></td>
                                }
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>

        </>
    );
};

export default FabricConsumptionDetails;
