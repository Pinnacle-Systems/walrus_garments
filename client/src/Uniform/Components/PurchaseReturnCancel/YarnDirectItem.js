import React, { useEffect, useState } from 'react'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { Loader } from '../../../Basic/components'
import { DELETE, VIEW } from '../../../icons'
import { findFromList, getAllowableReturnQty, isBetweenRange, substract, sumArray } from '../../../Utils/helper'
import Modal from '../../../UiComponents/Modal'
import { FabricLotGrid, YarnLotGrid } from './LotGrid'
import { toast } from 'react-toastify'
import { useGetDirectItemByIdQuery } from '../../../redux/uniformService/DirectInwardOrReturnServices'
import { FaPlus, FaTrashAlt } from 'react-icons/fa'
import Swal from 'sweetalert2'
import e from 'cors'

const YarnDirectItem = ({ itemList, uomList,
    colorList, sizeList, designList, gsmList,
    loopLengthList, storeId,
    diaList, index, handleInputChange, readOnly, handleRightClick, item, purchaseInwardId, handleInputChangeLotNo, addNewLotNo, removeLotNo, stockControlData, movedToNextSaveNewRef, handlers }) => {
    const [lotGrid, setLotGrid] = useState(false)


    const { data, isLoading, isFetching } = useGetDirectItemByIdQuery({ id: item.poItemsId, purchaseInwardId, storeId: storeId }, { skip: !item.poItemsId })
    useEffect(() => {
        if (!readOnly && item?.itemId && index === 0 && !isLoading && !isFetching && movedToNextSaveNewRef?.current) {
            movedToNextSaveNewRef.current.focus();
        }
    }, [item?.itemId, index, isLoading, isFetching, readOnly]);



    useEffect(() => {
        if (purchaseInwardId) return
        if (isLoading || isFetching) return
        const poItem = data?.data

        if (!data?.data) return
        console.log(data?.data, "data?.data")
        if (poItem) {
            handleInputChange(poItem?.alreadyInwardLotWiseData, index, "returnLotDetails", 0, poItem);

        }

        console.log(readOnly, "readOnly for return Items")

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
    const gross = ((item.price ?? 0) * (item.qty ?? 0)).toFixed(2);



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
            <tr key={item.poItemId} className={`border border-blue-gray-200 cursor-pointer ${index % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
                onContextMenu={(e) => {
                    if (!readOnly) {
                        handleRightClick(e, index, "shiftTimeHrs");
                    }
                }}
            >
                <td className='border border-gray-300 py-0.5 text-[11px] text-center'>{index + 1}</td>
                {stockControlData?.data?.[0]?.itemWise && (
                    <td className='w-12 border border-gray-300 p-0.5 text-[11px] text-left'>{findFromList(item.itemId, itemList?.data, "name")} </td>
                )}
                {stockControlData?.data?.[0]?.sizeWise && (
                    <td className='w-12 border border-gray-300 p-0.5 text-[11px] text-left'>{findFromList(item.sizeId, sizeList?.data, "name")} </td>
                )}
                {stockControlData?.data?.[0]?.sizeColorWise && (
                    <td className='w-12 border border-gray-300 p-0.5 text-[11px] text-left'>{findFromList(item.colorId, colorList?.data, "name")} </td>
                )}
                <td className='w-12 border border-gray-300 p-0.5 text-[11px] text-left'>{findFromList(item.uomId, uomList?.data, "name")} </td>
                <td className='w-12 border border-gray-300 p-0.5 text-[11px] text-left'>{item?.barcode} </td>
                {stockControlData?.data?.map(element => (
                    Object.keys(element)?.filter(key => key.toLowerCase().includes("field") && !!element[key])?.map(i => (
                        <>
                            <td className="w-40 border border-gray-300 py-0.5 text-[11px] text-right">
                                <input
                                    onKeyDown={e => {
                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                        if (e.key === "Delete") { handleInputChange("0.000", index, element?.[i]) }
                                    }}

                                    className="text-right rounded py-1 px-1 w-full tx-table-input"
                                    onFocus={(e) => e.target.select()}
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
                <td className='w-12 border border-gray-300 p-0.5 text-[11px] text-right'>{item?.inwardQty}</td>

                <td className='w-12 border border-gray-300 p-0.5 text-[11px] text-right'>{item?.alreadyReturnedQty}</td>
                <td className='w-12 border border-gray-300 p-0.5 text-[11px] text-right'>{item?.stockQty}</td>

                <td className='w-12 border border-gray-300 p-0.5 text-[11px] text-right'>{item?.allowedReturnQty}</td>


                <td className='border border-gray-300 py-0.5 text-[11px] text-right' >
                    {item.price ? (parseFloat(item.price).toFixed(2)) : ""}
                </td>
                <td className='border border-gray-300 py-0.5 text-[11px]'>
                    <input
                        type="number"
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded py-1 w-full px-1 tx-table-input"
                        value={(!item.qty) ? "" : item.qty}
                        ref={index === 0 ? movedToNextSaveNewRef : null}
                        disabled={readOnly || !item.itemId}
                        onKeyDown={(e) => {
                            if (e.key == "Tab") {
                                handlers.handleTabKeyDown(e)
                            }
                            if (e.key === "Delete") { handleInputChange("0.000", index, "qty") }

                        }}

                        onChange={(event) => {
                            if (!event.target.value) {
                                handleInputChange(0, index, "qty");
                                return
                            }


                            const value = parseFloat(event.target.value)
                            const stock = parseFloat(item?.stockQty)
                            const returnQty = parseFloat(item?.allowedReturnQty)

                            console.log(value, "valuevalue")

                            if (value > stock) {
                                Swal.fire({
                                    title: "Return Qty Cannot be more than Stock Qty",
                                    icon: "error",
                                });
                                return false
                            }

                            if (value > returnQty) {
                                Swal.fire({
                                    title: "Return Qty Cannot be more than Allowed Return Qty",
                                    icon: "error",
                                });
                                return

                            }
                            handleInputChange((value), index, "qty")

                        }}




                    />
                    <div className='text-center'>
                    </div>
                </td>
                {/* <td className='border border-gray-300 py-0.5 px-1 text-[11px] text-right'>
                    {item?.itemId ? gross : ""}

                </td> */}





            </tr>
        </>
    )
}

export default YarnDirectItem
