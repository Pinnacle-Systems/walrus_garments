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

const YarnDirectItem = ({ yarnList, uomList,
    colorList, gaugeList, designList, gsmList,
    loopLengthList, storeId,
    diaList, index, handleInputChange, readOnly, deleteRow, item, purchaseInwardId, handleInputChangeLotNo, addNewLotNo, removeLotNo }) => {
    const [lotGrid, setLotGrid] = useState(false)

    console.log(item, "item")

    const { data, isLoading, isFetching } = useGetDirectItemByIdQuery({ id: item.poItemsId, purchaseInwardId, storeId: storeId }, { skip: !item.poItemsId })



    useEffect(() => {
        if (purchaseInwardId) return
        if (isLoading || isFetching) return
        const poItem = data?.data

        if (data?.data) {

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
            <tr key={item.poItemId} className='border border-blue-gray-200 cursor-pointer '>
                <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{index + 1}</td>
                <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{item?.poNo}</td>
                <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{findFromList(item.yarnId, yarnList?.data, "aliasName")} </td>
                <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{findFromList(item.colorId, colorList?.data, "name")} </td>
                {/* <td className='text-left px-1 table-data'>{findFromList(item.designId, designList?.data, "name")} </td>
                <td className='text-left px-1 table-data'>{findFromList(item.gaugeId, gaugeList?.data, "name")} </td>
                <td className='text-left px-1 table-data'>{findFromList(item.loopLengthId, loopLengthList?.data, "name")} </td>
                <td className='text-left px-1 table-data'>{findFromList(item.gsmId, gsmList?.data, "name")} </td>
                <td className='text-left px-1 table-data'>{findFromList(item.kDiaId, diaList?.data?.filter(val => val.kDia), "name")} </td>
                <td className='text-left px-1 table-data'>{findFromList(item.fDiaId, diaList?.data?.filter(val => val.fDia), "name")} </td> */}
                <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{findFromList(item.uomId, uomList?.data, "name")} </td>
                <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{item?.stockQty || 0}</td>
                <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{item?.allowedReturnQty || 0}</td>

                <td className='py-0.5 border border-gray-300 text-[11px] text-right'>
                    <input
                        type="number"
                        className="text-right rounded py-1  px-1 w-full table-data-input"
                        // value={sumArray(item?.lotDetails ? item?.lotDetails : [], "noOfRolls")}
                        value={item?.noOfBags ? item?.noOfBags : 0}
                        // disabled={true}
                        onChange={(event) => {
                            if (event.target.value < 0) return
                            if (!event.target.value) {
                                handleInputChange(0, index, "noOfBags");
                                return
                            }
                            handleInputChange(event.target.value, index, "noOfBags", item?.balanceQty);
                        }}
                        onKeyDown={e => {
                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                            if (e.key === "Delete") { handleInputChange("0", index, "noOfBags") }
                        }}
                        min={"0"}
                        onBlur={(e) => {
                            if (!e.target.value) {
                                handleInputChange(0.000, index, "noOfBags", item?.balanceQty);
                                return
                            }
                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "noOfBags", item?.balanceQty)
                        }}
                    />
                </td>
                <td className='py-0.5 border border-gray-300 text-[11px] text-right'>
                    <input
                        type="number"
                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.000", index, "weightPerBag") } }}
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded py-1 w-full px-1 table-data-input"
                        value={(!item.weightPerBag) ? 0 : item.weightPerBag}
                        disabled={readOnly}
                        inputMode='decimal'
                        onChange={(e) => {
                            if (!e.target.value) {
                                handleInputChange(0, index, "weightPerBag");
                                return
                            }
                            let tempReturnQty = parseFloat(item?.noOfBags ? item.noOfBags : 0) * parseFloat(e.target.value)
                            if (isBetweenRange(0, getAllowableReturnQty(item.alreadyInwardedQty, item.alreadyReturnedQty, item.stockQty), tempReturnQty)) {
                                handleInputChange(e.target.value.replace(/^0+/, ''), index, "weightPerBag")
                            } else {
                                toast.info("Return Qty Cannot be more than allowable Qty", { position: 'top-center' })
                            }
                        }
                        }
                        onBlur={(e) =>
                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "weightPerBag")
                        }
                    />
                </td>
                <td className='py-0.5 border border-gray-300 text-[11px]'>
                    <input
                        type="number"
                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.000", index, "returnQty") } }}
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded py-1 w-full px-1 table-data-input"
                        value={(!item.returnQty) ? 0 : item.returnQty}
                        disabled={readOnly}
                        onChange={(event) => {
                            if (!event.target.value) {
                                handleInputChange(0, index, "returnQty");
                                return
                            }
                            if (isBetweenRange(0, getAllowableReturnQty(item.alreadyInwardedQty, item.alreadyReturnedQty, item.stockQty), event.target.value)) {
                                handleInputChange(event.target.value.replace(/^0+/, ''), index, "returnQty")
                            } else {
                                toast.info("Return Qty Cannot be more than allowable Qty", { position: 'top-center' })
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
                {/* <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{item?.alreadyReturnedRolls || 0}</td> */}
                <td className='py-0.5 border border-gray-300 text-[11px] text-right' >
                    {parseFloat(item.price).toFixed(2)}
                </td>

                <td className='py-0.5 border border-gray-300 text-[11px] text-right'>
                    <input
                        type="number"
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded py-1 px-1 w-16 table-data-input"
                        value={(item.price * item.returnQty).toFixed(2)}
                        disabled={true}
                    />
                </td>



                <td className="py-0.5 border border-gray-300 text-[11px]">
                    <div className="flex space-x-2  justify-center">

                        <button
                            // onClick={() => handleView(index)}
                            // onMouseEnter={() => setTooltipVisible(true)}
                            // onMouseLeave={() => setTooltipVisible(false)}
                            className="text-blue-800 flex items-center  bg-blue-50 rounded"
                        >
                            👁 <span className="text-xs"></span>
                        </button>
                        <span className="tooltip-text">View</span>
                        <button
                            // onClick={() => handleEdit(index)}
                            className="text-green-600 hover:text-green-800 bg-green-50 py-1 rounded text-xs flex items-center"
                        >
                            <HiPencil className="w-4 h-4" />

                        </button>
                        <span className="tooltip-text">Edit</span>
                        <button
                            onClick={() => deleteRow(index)}
                            className="text-red-600 hover:text-red-800 bg-red-50  py-1 rounded text-xs flex items-center"
                        >
                            <HiTrash className="w-4 h-4" />

                        </button>
                        <span className="tooltip-text">Delete</span>

                        {/* {tooltipVisible && (
                                                                        <div className="absolute  z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
                                                                            <div className="flex items-start">
                                                                                <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                                                                                <span>View</span>
                                                                            </div>
                                                                            <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
                                                                        </div>
                                                                    )} */}
                    </div>
                </td>

            </tr>
        </>
    )
}

export default YarnDirectItem
