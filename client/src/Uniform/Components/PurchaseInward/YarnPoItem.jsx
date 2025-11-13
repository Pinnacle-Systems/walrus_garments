import React, { useEffect, useState } from 'react'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { Loader } from '../../../Basic/components'
import { DELETE, VIEW } from '../../../icons'
import { findFromList, substract, sumArray } from '../../../Utils/helper'
import Modal from '../../../UiComponents/Modal'
import { FabricLotGrid } from './LotGrid'
import { toast } from 'react-toastify'
import { HiPencil, HiTrash } from 'react-icons/hi'

const PurchaseYarnPoItems = ({ yarnList, uomList,
    colorList, gaugeList, designList, poList,
    index, handleInputChange, readOnly, id, item, purchaseInwardId, handleInputChangeLotNo, addNewLotNo, removeLotNo,
    handleRightClick
}) => {




    const [lotGrid, setLotGrid] = useState(false)
    const { data, isLoading, isFetching } = useGetPoItemByIdQuery({ id: item.poItemsId, purchaseInwardId }, { skip: !item.poItemsId })

    console.log(item, "itemmmmmmmmmmmm")

    useEffect(() => {
        if (purchaseInwardId) return
        if (isLoading || isFetching) return
        const poItem = data?.data

        if (data?.data) {
            handleInputChange([{ lotNo: "", qty: "0.000", noOfBags: 0 }], index, "inwardLotDetails", 0, poItem);


        }
    }, [isFetching, isLoading, data, purchaseInwardId])
    if (isLoading || isFetching) return <Loader />

    let lotNoArr = item?.inwardLotDetails ? item.inwardLotDetails.map(item => item.lotNo) : []
    let isLotNoUnique = new Set(lotNoArr).size === lotNoArr.length


    function findBalanceQty(balanceQty) {

        let balanceNos = parseFloat(balanceQty) * parseFloat(0.10)
        balanceNos = Math.round(balanceNos)
        return parseInt(parseInt(balanceNos) + parseInt(balanceQty))
    }

    function onClose(balanceQty, totalQty) {


        let allowedBalance = findBalanceQty(balanceQty)

        if (!isLotNoUnique) {
            toast.info("Lot No Should be Unique", { position: "top-center" })
            return
        }

        if (parseFloat(allowedBalance) < parseFloat(totalQty)) {
            toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
            allowedBalance = 0
            return
        }
        setLotGrid(false)
    }
    return (
        <>
            <Modal widthClass={"max-h-[600px] overflow-auto"} isOpen={lotGrid}>
                <FabricLotGrid
                    readOnly={readOnly}
                    onClose={onClose}
                    addNewLotNo={addNewLotNo}
                    removeLotNo={removeLotNo}
                    handleInputChangeLotNo={handleInputChangeLotNo}
                    index={index}
                    inwardLotDetails={item?.inwardLotDetails ? item?.inwardLotDetails : []} balanceQty={item?.balanceQty} />
            </Modal>
            <tr key={item.poItemId} className='border border-blue-gray-200 cursor-pointer '>{console.log(item, "item")}

                <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{index + 1}</td>
                <td className='w-12 border border-gray-300 text-[11px] px-1.5  text-left p-0.5'> { id ? item?.poNo : findFromList(item.poId, poList?.data, "docId")}</td>
                <td className='py-0.5 border border-gray-300 px-1.5 text-[11px]'>{findFromList(item.yarnId, yarnList?.data, "name")} </td>
                <td className='py-0.5 border border-gray-300  px-1.5 text-[11px]'>{findFromList(item.colorId, colorList?.data, "name")} </td>
                <td className='py-0.5 border border-gray-300 px-1.5 text-[11px]'>{findFromList(item.uomId, uomList?.data, "name")} </td>








                <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.poQty} </td>
                <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.cancelQty} </td>
                <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.alreadyInwardedQty} </td>
                <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.alreadyReturnedQty}</td>
                <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.balanceQty} </td>



                <td className='py-0.5 border border-gray-300 text-[11px] text-right' >
                    <input
                        type="number"
                        className="text-right rounded py-1  px-1 w-full table-data-input"
                        // value={sumArray(item?.lotDetails ? item?.lotDetails : [], "qty")}
                        value={item?.qty ? item?.qty : 0}
                        // disabled={true}
                        onChange={(event) => {
                            if (event.target.value < 0) return
                            if (!event.target.value) {
                                handleInputChange(0, index, "qty");
                                return
                            }
                            handleInputChange(event.target.value, index, "qty", item?.balanceQty);
                        }}
                        onFocus={e => e.target.select()}

                        onKeyDown={e => {
                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        }}
                        min={"0"}
                        onBlur={(e) => {
                            if (!e.target.value) {
                                handleInputChange(0.000, index, "qty", item?.balanceQty);
                                return
                            }
                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty", item?.balanceQty)
                        }}
                    />
                </td>


                <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{parseFloat(item?.price).toFixed(2)}</td>
                <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                    {Number.isFinite(parseFloat(item?.price)) && Number.isFinite(parseFloat(item?.qty))
                        ? (parseFloat(item.price) * parseFloat(item.qty)).toFixed(4)
                        : "0.0000"}
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

export default PurchaseYarnPoItems;
