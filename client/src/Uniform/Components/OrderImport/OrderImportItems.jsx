import React from 'react'
import { convertSpaceToUnderScore } from '../../../Utils/helper'

const OrderImportItems = ({ orderImportItems }) => {

    const header = [
        "student name",
        "class",
        "gender",
        "color",
        "bottomColor",
        "size",
        "bottomsize"
    ]
    return (
        <div className="w-full">{console.log(orderImportItems, "orderImportItems", header, "header")}
            <div className="w-full flex flex-col gap-5">
                <div className="mt-3 flex flex-col justify-start items-start gap-10">

                    <table className="w-full">
                        <thead className='bg-sky-400'>
                            <tr>
                                <th className="border border-gray-400 text-sm py-1 w-12 ">S.No</th>
                                {header.map((columnName, index) => (
                                    <th className="border border-gray-400 text-sm py-1 capitalize" key={index}>{convertSpaceToUnderScore(columnName)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orderImportItems?.map(j => { return { ...j, bottomcolor: j.bottomColor } }).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td className="border border-gray-400 text-sm py-1 text-center">{rowIndex + 1}</td>
                                    {header.map((columnName, columnIndex) => (
                                        <td className="border border-gray-400 text-xs py-1 px-1" key={columnIndex}>{row[convertSpaceToUnderScore(columnName)] === "undefined" ?
                                            '' : row[convertSpaceToUnderScore(columnName)]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default OrderImportItems