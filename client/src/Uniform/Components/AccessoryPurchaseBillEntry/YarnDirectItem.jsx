import React, { useEffect } from 'react'
import { Loader } from '../../../Basic/components'
import { DELETE } from '../../../icons'
import { substract } from '../../../Utils/helper'
import { discountTypes } from '../../../Utils/DropdownData';
import { toast } from 'react-toastify';
import { useGetDirectItemByIdQuery } from '../../../redux/uniformService/DirectInwardOrReturnServices';

const YarnDirectItem = ({ item, index, handleInputChange, readOnly, removeItem, billEntryId }) => {


    const { data, isLoading, isFetching } = useGetDirectItemByIdQuery({ id: item.directItemsId, billEntryId }, { skip: !(item?.directItemsId) })
   
    useEffect(() => {
        if (!data?.data) return
        handleInputChange(data.data.price, index, "price");
        handleInputChange(data.data.taxPercent, index, "taxPercent");
    }, [data, isLoading, isFetching])   
    if (isLoading || isFetching || !(data?.data)) return <Loader />
    const directItem = data.data
    let grnQty = parseFloat(directItem.qty).toFixed(3)
    let alreadyBilledQty = directItem?.alreadyBillData?._sum?.qty ? directItem?.alreadyBillData?._sum?.qty : "0.000"
    let balanceQty = substract(grnQty, alreadyBilledQty)
    let billAmount = (parseFloat(directItem.price) * parseFloat(item.qty)).toFixed(2)
    let discountAmount = (item.discountType === "Percentage") ? (billAmount) / 100 * parseInt(item.discountValue) : item.discountValue
    let amount = substract(billAmount, discountAmount).toFixed(2)
    return (
        <tr key={index} className='table-row'>
            <td className='text-center   table-data'>{index + 1}</td>
            <td className='text-left  table-data'>{directItem.DirectInwardOrReturn.docId}</td>
            <td className='text-left  table-data'> <pre className='font-sans' > {directItem.Yarn.aliasName} </pre> </td>
            <td className='text-left   table-data'>{directItem.Color.name}</td>
            <td className='text-left   table-data'>{directItem.Uom.name}</td>
            <td className='text-right  table-data'>{ }</td>
            <td className='text-right  table-data'>{grnQty}</td> 
            <td className='text-right  table-data'>{ }</td>
            <td className='text-right  table-data'>{ }</td>
            <td className='text-right  table-data'>{parseFloat(directItem.price).toFixed(2)}</td>
            <td className='text-right  table-data'>{alreadyBilledQty}</td>
            <td className='text-right  table-data'>{parseFloat(balanceQty).toFixed(3)}</td>
            <td className='table-data text-right'>
                <input
                    onKeyDown={e => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        if (e.altKey) { e.preventDefault() }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded   w-full py-1 table-data-input"
                    autoFocus={index === 0}
                    value={item.qty}
                    disabled={readOnly}
                    onChange={(event) => {
                        if (event.target.value < 0) return
                        if (!event.target.value) {
                            handleInputChange(0, index, "qty");
                            return
                        }
                        if(event.target.value > balanceQty){
                            toast.info("Bill Qty  Cannot be more than Balance Qty", {position:"top-center"});
                            return
                        }
                        handleInputChange(event.target.value, index, "qty");
                    }}

                    onBlur={(e) => {
                        if (!e.target.value) {
                            handleInputChange(0.000, index, "qty");
                            return
                        }
                        handleInputChange(parseFloat(e.target.value).toFixed(2), index, "qty")
                    }}
                />
            </td>
            <td className='   table-data text-right'>
                {parseFloat(directItem.price).toFixed(2)}
            </td>
            <td className='text-right  table-data'>{billAmount}</td>
            <td className='   table-data text-right'>
                <select name='type' disabled={readOnly} className='text-center rounded   w-full py-1 table-data-input'
                    value={item.discountType}
                    onChange={(event) => {
                        if (event.target.value < 0) return
                        if (!event.target.value) {
                            handleInputChange(0, index, "discountType");
                            return
                        }
                        handleInputChange(event.target.value, index, "discountType");
                    }}
                >
                    <option hidden>
                    </option>
                    {discountTypes.map((option, index) => <option key={index} value={option.value} >
                        {option.show}
                    </option>)}
                </select>
            </td>
            <td className='table-data text-right'>
                <input
                    onKeyDown={e => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        if (e.altKey) { e.preventDefault() }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded   w-full py-1 table-data-input"
                    value={item.discountValue}
                    disabled={readOnly}
                    onChange={(event) => {
                        if (event.target.value < 0) return
                        if (!event.target.value) {
                            handleInputChange(0, index, "discountValue");
                            return
                        }
                        handleInputChange(event.target.value, index, "discountValue");
                    }}

                    onBlur={(e) => {
                        if (!e.target.value) {
                            handleInputChange(0.000, index, "discountValue");
                            return
                        }
                        handleInputChange(parseFloat(e.target.value), index, "discountValue")
                    }}
                />
            </td>
            <td className='text-right  table-data'>{amount}</td>
            <td className='text-right  table-data'>{directItem.taxPercent}</td>
            <td className='text-right  table-data'>
                <input
                    type="text"
                    className="text-right rounded   w-full py-1 table-data-input"
                    value={item.notes}
                    disabled={readOnly}
                    onChange={(event) => {
                        handleInputChange(event.target.value, index, "notes");
                    }}
                />
            </td>
            {!readOnly &&
                <td className='table-data w-12'>
                    <div tabIndex={-1} onClick={() => removeItem(item.isPoItem ? item.poItemsId : item.directItemsId, item?.isPoItem ? true : false)} className='flex justify-center px-2 py-1.5 items-center cursor-pointer bg-gray-300'>
                        {DELETE}
                    </div>
                </td>
            }
        </tr>
    )
}

export default YarnDirectItem
