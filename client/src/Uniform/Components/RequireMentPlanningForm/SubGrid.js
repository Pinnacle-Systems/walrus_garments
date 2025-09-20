import React, { useEffect } from 'react'
import { TextArea, TextInput } from '../../../Inputs'
import { findFromList, params } from '../../../Utils/helper'
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi'
import { useGetYarnCountsQuery } from '../../../redux/uniformService/YarnMasterServices'



export default function SubGrid({ orderYarnDetails,getRequireWeight , setPoItems, poItems, onClose, tempStockItems, stockItems, setStockItems, yarnList, colorList

}) {





    return (

        <>








            <div className="flex-1 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm ">
                <div className="h-full flex flex-col bg-[#f1f1f0] px-1 w-full">
                    <div className="flex flex-row w-full">
                        <div className="flex flex-col w-full">
                                <div>
                                    <div className="flex justify-center items-center ">
                                        <h2 className="text-xl font-bold text-gray-800 py-1">Required Qty</h2>

                                    </div>
                                    <div className=" flex justify-end items-center mt-4">

                                        <table className="w-full border-collapse table-fixed">
                                            <thead className="bg-gray-200 text-gray-800">

                                                <tr>
                                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">S No</td>
                                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-72">Yarn</td>
                                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-48">Color</td>

                                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Required Qty (kgs)</td>

                                                </tr>

                                            </thead>
                                            <tbody>

                                                {orderYarnDetails?.map((yarn, index) => (
                                                    <tr>
                                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs w-9">{index + 1}</td>
                                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">{yarn?.Yarn?.name}</td>
                                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">{yarn?.Color?.name}</td>

                                                        <td className="border border-gray-300 px-2 py-1 text-right text-xs">
                                                            {getRequireWeight(yarn?.yarnId)}                                                       </td>

                                                    </tr>
                                                ))}


                                            </tbody>
                                            {/* <tbody>
                                {yarnTotals?.map((y, index) => (
                                    <tr key={index}>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs w-9">
                                            {index + 1}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">
                                            {y.yarnName}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">
                                            {y.qty.toFixed(3)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody> */}
                                        </table>
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}










