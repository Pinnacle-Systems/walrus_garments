import React, { useEffect, useState } from 'react'
import { Loader } from '../../../Basic/components'
import { DELETE, VIEW } from '../../../icons'
import Modal from '../../../UiComponents/Modal'
import { FabricLotGrid } from './LotGrid'
import { toast } from 'react-toastify'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { findFromList, getAllowableReturnQty, isBetweenRange, sumArray } from '../../../Utils/helper'
import { HiPencil, HiTrash } from 'react-icons/hi'

const YarnPoItem = ({ yarnList, uomList,
    colorList, gaugeList, designList, deleteRow,
    loopLengthList, setInwardItems, storeId,
    diaList, index, handleInputChange, readOnly, removeItem, item, purchaseInwardId, handleInputChangeLotNo, addNewLotNo, removeLotNo ,
    handleRightClick

}) =>{



    const [lotGrid, setLotGrid] = useState(false)
    const { data, isLoading, isFetching } = useGetPoItemByIdQuery({ id: item?.poItemsId, purchaseInwardId, storeId: storeId, poType: "DyedFabric" }, { skip: !item.poItemsId })

    console.log(data, "data")


    useEffect(() => {
        if (purchaseInwardId) return
        if (isLoading || isFetching) return
        const poItem = data?.data

        if (data?.data) {
            // handleInputChange([{ lotNo: "", qty: "0.000", noOfRolls: 0 }], index, "returnLotDetails", 0, poItem);
            handleInputChange(poItem?.alreadyInwardLotWiseData, index, "returnLotDetails", 0, poItem);


        }
    }, [isFetching, isLoading, data, purchaseInwardId])

    // if (isLoading || isFetching) return <Loader />

    // const poItem = data?.data
    // let poQty = parseFloat(poItem?.qty || 0).toFixed(3)
    // let cancelQty = poItem?.alreadyCancelData?._sum.qty ? parseFloat(poItem.alreadyCancelData?._sum.qty).toFixed(3) : "0.000";
    // let alreadyInwardedQty = poItem?.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
    // let alreadyReturnedQty = poItem?.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
    // let balanceQty = substract(substract(poQty, cancelQty), substract(alreadyInwardedQty, alreadyReturnedQty)).toFixed(3)
    let lotNoArr = item?.returnLotDetails ? item.returnLotDetails.map(item => item.lotNo) : []
    let isLotNoUnique = new Set(lotNoArr).size === lotNoArr.length
    function onClose() {
        // if (!isLotNoUnique) {
        //     toast.info("Lot No Should be Unique", { position: "top-center" })
        //     return
        // }
        let filteLotArray = item?.returnLotDetails ? item.returnLotDetails.filter(item => parseFloat(item.qty) !== 0) : []
        // setInwardItems(inwardItems => {
        //     const newBlend = structuredClone(inwardItems);

        //     newBlend[index]["returnLotDetails"] = filteLotArray
        //     return newBlend
        // })
        setLotGrid(false)
    }
    return (
        <>
            <Modal widthClass={"max-h-[600px] overflow-auto"} onClose={onClose} isOpen={lotGrid}>
                <FabricLotGrid
                    value={item}
                    readOnly={readOnly}
                    onClose={onClose}
                    addNewLotNo={addNewLotNo}
                    removeLotNo={removeLotNo}
                    handleInputChangeLotNo={handleInputChangeLotNo}
                    index={index} returnLotDetails={item?.returnLotDetails ? item?.returnLotDetails : []} balanceQty={item?.balanceQty} />
            </Modal>
            <tr key={item.poItemId} className='border border-blue-gray-200 cursor-pointer '>
                <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{index + 1}</td>
                <td className='py-0.5 border border-gray-300 text-[11px]'>{item?.poNo}</td>
                <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item.yarnId, yarnList?.data, "name")} </td>
                <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item.colorId, colorList?.data, "name")} </td>
                <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item.uomId, uomList?.data, "name")}</td>


                <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.stockQty} </td>
                <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{getAllowableReturnQty(item.alreadyInwardedQty, item.alreadyReturnedQty, item.stockQty).toFixed(3) || 0}</td>







                <td className='py-0.5 border border-gray-300 text-[11px]'>
                    <input
                        type="number"
                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.000", index, "qty") } }}
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded py-1 w-full px-1 table-data-input"
                        value={(!item.qty) ? 0 : item.qty}
                        disabled={readOnly}
                        onChange={(event) => {
                            if (!event.target.value) {
                                handleInputChange(0, index, "qty");
                                return
                            }
                            if (isBetweenRange(0, getAllowableReturnQty(item.alreadyInwardedQty, item.alreadyReturnedQty, item.stockQty), event.target.value)) {
                                handleInputChange(event.target.value.replace(/^0+/, ''), index, "qty")
                            } else {
                                toast.info("Return Qty Cannot be more than allowable Qty", { position: 'top-center' })
                            }
                        }}
                        onBlur={(e) => {
                            if (!e.target.value) {
                                handleInputChange(0.000, index, "qty");
                                return
                            }
                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty")
                        }

                        }
                    />
                    <div className='text-center'>
                    </div>
                </td>
                <td className='py-0.5 border border-gray-300 text-[11px] text-right' >
                    {parseFloat(item.price).toFixed(2)}
                </td>

                <td className='py-0.5 border border-gray-300 text-[11px] text-right'>
                    <input
                        type="number"
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded py-1 px-1 w-16 table-data-input"
                        value={(item.price * item.qty).toFixed(2)}
                        disabled={true}
                    />
                </td>
                <td className="py-0.5 border border-gray-300 text-[11px]">
                    <input
                        readOnly
                        className="w-full bg-transparent focus:outline-none focus:border-transparent text-right pr-2"
                        // onKeyDown={(e) => {
                        //     if (e.key === "Enter") {
                        //         e.preventDefault();
                        //         addNewRow();
                        //     }
                        // }}
                        onContextMenu={(e) => {
                            if (!readOnly) {
                                handleRightClick(e, index, "shiftTimeHrs");
                            }
                        }}
                    />

                </td>

            </tr>
        </>
    )
}

export default YarnPoItem
