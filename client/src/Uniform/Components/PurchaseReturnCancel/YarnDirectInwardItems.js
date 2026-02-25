import { useEffect } from 'react';
import YarnDirectItem from './YarnDirectItem';


const YarnDirectInwardItems = ({ deleteRow, handleInputChange, directInwardReturnItems,
     setDirectInwardReturnItems, readOnly,  sizeList, itemList, colorList, uomList ,supplierId }) => {




   useEffect(() => {
        if (directInwardReturnItems?.length >= 9  ) return
        setDirectInwardReturnItems(prev => {
            let newArray = Array?.from({ length: 9 - prev?.length }, () => {
                return {
                    itemId: "",
                    colorId: "",
                    uomId: "",
                    discountValue: "0.00",


                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setDirectInwardReturnItems, directInwardReturnItems])


    return (
        <>
            <div className=" rounded-md shadow-sm h-full">

                <div className={` w-full h-[310px]  overflow-auto py-1`}>
                    <table className="w-full border-collapse table-fixed ">
                        <thead className="bg-gray-200 text-gray-800 top-0 sticky" >
                            <tr>
                                <th
                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    S.No
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Inward No
                                </th>
                                <th

                                    className={`w-60 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Item
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Size
                                </th>
                                <th

                                    className={`w-36 px-4 py-2 text-center font-medium text-[13px] `}
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

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Price
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}

                                >
                                    Return Qty
                                </th>


                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Gross
                                </th>

                            </tr>
                        </thead>

                        <tbody className='w-full'>
                            {(directInwardReturnItems || [])?.map((item, index) => <YarnDirectItem itemList={itemList} uomList={uomList}
                                colorList={colorList} deleteRow={deleteRow}
                                sizeList={sizeList}
                                key={item.poItemsId}
                                item={item} index={index} handleInputChange={handleInputChange}
                                readOnly={readOnly} />)}
                            {Array.from({ length: 1 - directInwardReturnItems?.length }).map(i =>
                                <tr className='w-12 border border-gray-300 text-[11px]  h-8 text-center p-0.5'>
                                    {Array.from({ length: 11 }).map(i =>
                                        <td className=" table-data "></td>
                                    )}

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