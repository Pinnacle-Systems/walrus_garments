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
    colorList, gaugeList, designList, gsmList,
    index, handleInputChange, readOnly, deleteRow, item, purchaseInwardId, handleInputChangeLotNo, addNewLotNo, removeLotNo }) => {
    const [lotGrid, setLotGrid] = useState(false)
    const { data, isLoading, isFetching } = useGetPoItemByIdQuery({ id: item.poItemsId, purchaseInwardId }, { skip: !item.poItemsId })

  

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
            <tr key={item.poItemId} className='border border-blue-gray-200 cursor-pointer '>{console.log(gsmList, "gsmList")}
                <td className='w-12 border border-gray-300 text-[11px]  text-center p-0.5'>{index + 1}</td>
                <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item.yarnId, yarnList?.data, "aliasName")} </td>
                <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item.colorId, colorList?.data, "name")} </td>
                <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item.uomId, uomList?.data, "name")} </td>

        




                <td className='py-0.5 border border-gray-300 text-[11px]'>
                    <button onClick={() => setLotGrid(true)} className='w-full'>
                        {VIEW}
                    </button>
                </td>
                <td className='py-0.5 border border-gray-300 text-[11px]'>
                    <input
                        type="number"
                        className="text-right rounded py-1  px-1 w-full table-data-input"
                        // value={sumArray(item?.lotDetails ? item?.lotDetails : [], "qty")}
                        value={item?.qty ? item?.qty : 0}
                        disabled={true}
                        onChange={(event) => {
                            if (event.target.value < 0) return
                            if (!event.target.value) {
                                handleInputChange(0, index, "qty");
                                return
                            }
                            handleInputChange(event.target.value, index, "qty", item?.balanceQty);
                        }}
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
                <td className='py-0.5 border border-gray-300 text-[11px]'>
                    <input
                        type="number"
                        className="text-right rounded py-1  px-1 w-full table-data-input"
                        // value={sumArray(item?.lotDetails ? item?.lotDetails : [], "noOfRolls")}
                        value={item?.noOfBags ? item?.noOfBags : 0}
                        disabled={true}
                        onChange={(event) => {
                            if (event.target.value < 0) return
                            if (!event.target.value) {
                                handleInputChange(0, index, "noOfbags");
                                return
                            }
                            handleInputChange(event.target.value, index, "noOfbags", item?.balanceQty);
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
            {/* <td className='text-left px-1  table-data'>
                    <input
                        type="number"
                        className="text-right rounded py-1  px-1 w-full table-data-input"
                        // value={sumArray(item?.lotDetails ? item?.lotDetails : [], "qty")}
                        value={item?.qty ? item?.qty : 0}
                        disabled={true}
                        onChange={(event) => {
                            if (event.target.value < 0) return
                            if (!event.target.value) {
                                handleInputChange(0, index, "qty");
                                return
                            }
                            handleInputChange(event.target.value, index, "qty", item?.balanceQty);
                        }}
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
                </td> */}
                {/* <td className='text-right px-1  table-data'>{parseFloat(item?.price).toFixed(2)}</td>
                <td className='text-right   table-data'>{(parseFloat(item?.price) * parseFloat(sumArray(item?.inwardLotDetails ? item?.inwardLotDetails : [], "qty"))).toFixed(2)}</td> */}
                {/* {!readOnly &&
                 <div tabIndex={-1} onClick={() => removeItem(item?.poItemsId)} className='flex justify-center px-2 py-1.5 items-center cursor-pointer bg-gray-300'>
                            {DELETE}
                        </div>
                        } */}
                        
                 
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

export default PurchaseYarnPoItems;
