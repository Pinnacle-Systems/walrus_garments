import React, { useEffect, useState } from 'react'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { Loader } from '../../../Basic/components'
import { DELETE, VIEW } from '../../../icons'
import { findFromList, getAllowableReturnQty, isBetweenRange, substract, sumArray } from '../../../Utils/helper'
import Modal from '../../../UiComponents/Modal'
import { FabricLotGrid, YarnLotGrid } from './LotGrid'
import { toast } from 'react-toastify'
import { useGetDirectItemByIdQuery } from '../../../redux/uniformService/DirectInwardOrReturnServices'
import { HiPencil, HiTrash } from 'react-icons/hi'
import Swal from 'sweetalert2'

const YarnDirectItem = ({ itemList, uomList,
    colorList, sizeList, designList, gsmList,
    loopLengthList, storeId,
    diaList, index, handleInputChange, readOnly, handleRightClick, item, purchaseInwardId, handleInputChangeLotNo, addNewLotNo, removeLotNo, stockControlData }) => {
    const [lotGrid, setLotGrid] = useState(false)


    const { data, isLoading, isFetching } = useGetDirectItemByIdQuery({ id: item.poItemsId, purchaseInwardId, storeId: storeId }, { skip: !item.poItemsId })



    useEffect(() => {
        if (purchaseInwardId) return
        if (isLoading || isFetching) return
        const poItem = data?.data

        if (!data?.data) return
        console.log(data?.data, "data?.data")
        if (poItem) {
            handleInputChange(poItem?.alreadyInwardLotWiseData, index, "returnLotDetails", 0, poItem);

        }


    }, [isFetching, isLoading, data, purchaseInwardId])

    if (isLoading || isFetching) return <Loader />

    let lotNoArr = item?.returnLotDetails ? item.returnLotDetails.map(item => item.lotNo) : []
    let isLotNoUnique = new Set(lotNoArr).size === lotNoArr.length
    function onClose() {
        if (!isLotNoUnique) {
            toast.info("Lot No Should be Unique", { position: "top-center" })
            return
        }
        setLotGrid(false)
    }


    return (
        <>
            <Modal widthClass={"max-h-[600px] overflow-auto"} onClose={onClose} isOpen={lotGrid}>
                <YarnLotGrid value={item}
                    readOnly={readOnly}
                    onClose={onClose}
                    addNewLotNo={addNewLotNo}
                    removeLotNo={removeLotNo}
                    handleInputChangeLotNo={handleInputChangeLotNo}
                    index={index} returnLotDetails={item?.returnLotDetails ? item?.returnLotDetails : []} balanceQty={item?.balanceQty} />
            </Modal>
            <tr key={item.poItemId} className='border border-blue-gray-200 cursor-pointer '
                onContextMenu={(e) => {
                    if (!readOnly) {
                        handleRightClick(e, index, "shiftTimeHrs");
                    }
                }}
            >
                <td className='py-0.5 border border-gray-300 text-[11px] text-center'>{index + 1}</td>
                {/* <td className='w-12 border border-gray-300 text-[11px]  text-left p-0.5'>{item?.poNo}</td> */}
                <td className='w-12 border border-gray-300 text-[11px]  text-left p-0.5'>{findFromList(item.itemId, itemList?.data, "name")} </td>
                <td className='w-12 border border-gray-300 text-[11px]  text-left p-0.5'>{findFromList(item.sizeId, sizeList?.data, "name")} </td>

                <td className='w-12 border border-gray-300 text-[11px]  text-left p-0.5'>{findFromList(item.colorId, colorList?.data, "name")} </td>

                <td className='w-12 border border-gray-300 text-[11px]  text-left p-0.5'>{findFromList(item.uomId, uomList?.data, "name")} </td>
                {stockControlData?.data?.map(element => (
                    // console.log(Object.keys(element)?.filter(key => key.toLowerCase().includes("field") && !!element[key]), "element")
                    Object.keys(element)?.filter(key => key.toLowerCase().includes("field") && !!element[key])?.map(i => (
                        <>
                            <td className="w-40  border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                                <input
                                    onKeyDown={e => {
                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                        if (e.key === "Delete") { handleInputChange("0.000", index, element?.[i]) }
                                    }}

                                    className="text-right rounded py-1 px-1 w-full table-data-input"
                                    onFocus={(e) => e.target.select()}
                                    // value={sumArray(row?.lotDetails ? row?.lotDetails : [], "qty")}
                                    value={item[i]}
                                    disabled={true}
                                    onChange={(e) =>
                                        handleInputChange(e.target.value, index, i)
                                    }
                                    onBlur={(e) => {
                                        handleInputChange(e.target.value.toFixed(3), index, i);
                                    }
                                    }
                                />
                            </td>
                     
                        </>
                    ))
                ))}
                <td className='w-12 border border-gray-300 text-[11px]  text-right p-0.5'>{item?.stockQty || ''}</td>
                <td className='w-12 border border-gray-300 text-[11px]  text-right p-0.5'>{item?.allowedReturnQty || ""}</td>



                <td className='py-0.5 border border-gray-300 text-[11px] text-right' >
                    {item.price ? (parseFloat(item.price).toFixed(2)) : ""}
                </td>
                <td className='py-0.5 border border-gray-300 text-[11px]'>
                    <input
                        type="number"
                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.000", index, "qty") } }}
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded py-1 w-full px-1 table-data-input"
                        value={(!item.qty) ? "" : item.qty}
                        disabled={readOnly}
                        onChange={(event) => {
                            if (!event.target.value) {
                                handleInputChange(0, index, "qty");
                                return
                            }
                            if (isBetweenRange(0, getAllowableReturnQty(item.alreadyInwardedQty, item.alreadyReturnedQty, item.stockQty), event.target.value)) {
                                handleInputChange(event.target.value.replace(/^0+/, ''), index, "qty")
                            } else {
                                // toast.info("Return Qty Cannot be more than allowable Qty", { position: 'top-center' })
                                Swal.fire({
                                    title: "Return Qty Cannot be more than allowable Qty",
                                    icon: "error",
                                });

                            }
                        }}
                        onBlur={(e) => {
                            if (!e.target.value) {
                                handleInputChange(0.000, index, "returnQty");
                                return
                            }
                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "returnQty")
                        }

                        }
                    />
                    <div className='text-center'>
                    </div>
                </td>
                <td className='py-0.5 border border-gray-300 text-[11px] text-right'>
                    {item.price * item.returnQty ? parseFloat(item.price * item.returnQty || 0).toFixed(2) : ""}

                </td>
                {/* 
                <td className="w-16 px-1 py-1 text-center  border border-gray-300">
                    <input
                        readOnly
                        className="w-full bg-transparent focus:outline-none focus:border-transparent text-right pr-2"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addNewRow();
                            }
                        }}

                    />
                </td> */}




            </tr>
        </>
    )
}

export default YarnDirectItem
