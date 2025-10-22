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
import { useGetYarnMasterQuery } from '../../../redux/uniformService/YarnMasterServices';


const YarnDirectInwardItems = ({ deleteRow, handleInputChange,  directInwardReturnItems, setDirectInwardReturnItems, readOnly, params, storeId }) => {

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
    //     console.log(directInwardReturnItems,"Initail Render")
    // }, [setDirectInwardReturnItems, directInwardReturnItems])



    // const { data: yarnList } =
    //     useGetFabricMasterQuery({ params });

    const { data: colorList } =
        useGetColorMasterQuery({ params: { ...params } });
    const { data: uomList } =
        useGetUomQuery({ params });

    const { data: yarnList } =
        useGetYarnMasterQuery({ params });








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
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
                       
                  <div className={` relative w-full overflow-y-auto py-1`}>
                    <table className="w-full border-collapse table-fixed">
                                    <thead className="bg-gray-200 text-gray-800">
                                        <tr>
                                            <th
                                                className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                S.No
                                            </th>
   <th
            
                                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Po No
                                            </th>
                                            <th
            
                                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Yarn
                                            </th>
                                            <th
            
                                                className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Color
                                            </th>
                                            <th
            
                                                className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                UOM
                                            </th>
                                            <th
            
                                                className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Stock Qty
                                            </th>
                                            <th
            
                                                className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Allowed Return Qty
                                            </th>
                                                         <th
    
                                            className={`w-12 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                            No. of Bags
                                            </th>
                                            <th
            
                                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                               Weight Per Bag
                                            </th>
                                            <th
            
                                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                               
                                            >
                                                Return Qty
                                            </th>
                                            <th
            
                                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Price
                                            </th>
            
                                            <th
            
                                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Gross
                                            </th>
                                             <th
            
                                                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                  
                       <tbody className='overflow-y-auto  h-full w-full'>
                                {(directInwardReturnItems || [])?.map((item, index) => <YarnDirectItem yarnList={yarnList} uomList={uomList}
                                    colorList={colorList} deleteRow={deleteRow}
                                    // poList={poList}
                                    //  handleInputChangeLotNo={handleInputChangeLotNo}
                                    key={item.poItemsId}
                                    item={item} index={index} handleInputChange={handleInputChange}
                                    // purchaseInwardId={purchaseInwardId}
                                     readOnly={readOnly} />)}
                                {Array.from({ length: 1 - directInwardReturnItems?.length }).map(i =>
                                    <tr className='w-12 border border-gray-300 text-[11px]  h-8 text-center p-0.5'>
                                        {Array.from({ length: 12 }).map(i =>
                                            <td className=" table-data "></td>
                                        )}
                                        {!readOnly &&
                                            <td className="table-data w-10"></td>
                                        }
                                    </tr>)
                                }
                            </tbody>
                </table>
            </div>
            </div>
        </>
    )
}

export default YarnDirectInwardItems