import React, { useEffect } from 'react';
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
import YarnDirectItem from './YarnDirectItem';


const YarnDirectInwardItems = ({ handleInputChangeLotNo, handleInputChange, removeLotNo, addNewLotNo, directInwardReturnItems, setDirectInwardReturnItems, readOnly, removeItem, purchaseInwardId, params, storeId }) => {



    // useEffect(() => {
    //     if (directInwardReturnItems?.length >= 1) return
    //     setDirectInwardReturnItems(prev => {
    //         let newArray = Array.from({ length: 1 - prev.length }, () => {
    //             return {
    //                 yarnNeedleId: "", machineId: "", fiberContentId: "", description: "", socksMaterialId: "",
    //                 measurements: "", sizeId: "", styleId: "", legcolorId: "", footcolorId: "",
    //                 stripecolorId: "", noOfStripes: "0", qty: "0", socksTypeId: "",
    //             }
    //         })
    //         return [...prev, ...newArray]
    //     }
    //     )
    // }, [setDirectInwardReturnItems, directInwardReturnItems])

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
                <table className="table-data text-xs table-auto border border-gray-500  w-full">
                    <thead className='bg-gray-300 border border-gray-500 top-0'>
                        <tr className='h-8'>
                            <th className="table-data  w-9 text-center">S.no</th>
                            <th className="table-data  w-20 text-center">Doc.no</th>
                            <th className="table-data w-20">Items</th>
                            <th className="table-data w-20">Colors</th>
                            <th className="table-data  w-16">UOM</th>
                            <th className="table-data  w-14">Stock.Qty</th>
                            <th className="table-data  w-12">Already Inwarded Qty</th>
                            <th className="table-data  w-14"> Alr.Rtn.Qty</th>
                            <th className="table-data  w-14"> Allo.Rtn.Qty</th>

                            <th className="table-data  w-12">No. of Bags<span className="text-red-500">*</span></th>
                            <th className="table-data  w-12">Weight Per Bag<span className="text-red-500">*</span></th>
                            <th className="table-data  w-12">Inward Qty</th>
                            <th className="table-data  w-12">Price</th>
                            <th className="table-data  w-12">Gross</th>
                            <th

                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto  h-full w-full'>
                        {directInwardReturnItems.map((item, index) => <YarnDirectItem
                            fabricList={fabricList} uomList={uomList} storeId={storeId}
                            colorList={colorList} gaugeList={gaugeList} designList={designList} gsmList={gsmList}
                            loopLengthList={loopLengthList}
                            diaList={diaList}
                            item={item} handleInputChangeLotNo={handleInputChangeLotNo} stockId={item.stockId} noOfRolls={item.noOfRolls} removeItem={removeItem} key={item.poItemsId}
                            qty={item.qty} poItemId={item.poItemsId} index={index} handleInputChange={handleInputChange} purchaseInwardId={purchaseInwardId} readOnly={readOnly} />)}
                        {Array.from({ length: 3 - directInwardReturnItems.length }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                                {Array.from({ length: 14 }).map(i =>
                                    <td className="table-data   "></td>
                                )}
                                {!readOnly &&
                                    <td className="table-data w-14"></td>
                                }
                            </tr>)
                        }

                    </tbody>
                </table>
            </div>
        </>
    )
}

export default YarnDirectInwardItems