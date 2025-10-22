import React, { useEffect, useState } from 'react'
import { Loader } from '../../../Basic/components'
import { DELETE, VIEW } from '../../../icons'
import { substract } from '../../../Utils/helper'
import { discountTypes } from '../../../Utils/DropdownData';
import { toast } from 'react-toastify'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices';

const YarnPoItem = ({ item, index, handleInputChange, readOnly, removeItem, billEntryId, handleRightClick, taxTemplateId, setCurrentSelectedIndex }) => {

    const { data, isLoading, isFetching } = useGetPoItemByIdQuery({ id: item.poItemsId, billEntryId }, { skip: !(item?.poItemsId) })

    const poItem = data?.data
    console.log(poItem, "poItem",billEntryId)


    useEffect(() => {
        if (!data?.data) return
        handleInputChange(data.data.price, index, "price", 0, true, poItem);
        handleInputChange(data.data.taxPercent, index, "taxPercent", 0, true);
        // handleInputChange(data.data.qty, index, "qty", 0, true);

    }, [data, isLoading, isFetching])

    if (isLoading || isFetching) return <Loader />


    let poQty = parseFloat(poItem.qty).toFixed(3)
    let cancelQty = poItem.alreadyCancelData?._sum.qty ? poItem.alreadyCancelData._sum.qty : "0.000";
    let alreadyInwardedQty = poItem.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
    let alreadyReturnedQty = poItem.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
    let alreadyBilledQty = poItem.alreadyBillData?._sum?.qty ? parseFloat(poItem.alreadyBillData._sum.qty).toFixed(3) : "0.000";
    let balanceQty = substract(substract(alreadyInwardedQty, alreadyReturnedQty), alreadyBilledQty).toFixed(3)
    let billAmount = (parseFloat(poItem.price) * parseFloat(item.qty)).toFixed(2)
    let discountAmount = (item.discountType === "Percentage") ? (billAmount) / 100 * parseInt(item.discountValue) : item.discountValue
    let amount = substract(billAmount, discountAmount).toFixed(2)


    function calculateNetAmount(item) {
        const price = parseFloat(item.price) || 0;
        const qty = parseFloat(item.qty) || 0;
        const taxPercent = parseFloat(item.taxPercent) || 0;
        const discountValue = parseFloat(item.discountValue) || 0;
        const discountType = item.discountType || "Percentage";

        // 1️⃣ Gross
        const gross = price * qty;

        // 2️⃣ Discount
        let discount = 0;
        if (discountType === "Percentage") {
            discount = gross * (discountValue / 100);
        } else if (discountType === "Amount") {
            discount = discountValue;
        }

        // 3️⃣ Taxable
        const taxable = gross - discount;

        // 4️⃣ Tax
        const taxAmount = taxable * (taxPercent / 100);

        // 5️⃣ Net (apply round-off only here)
        const netAmount = Math.round((taxable + taxAmount) * 100) / 100;

        return {
            gross,
            discount,
            taxable,
            taxAmount,
            netAmount
        };
    }


    console.log(calculateNetAmount(item), "Iteeeeeeem")

    return (




        <tr className="border border-blue-gray-200 cursor-pointer h-8" >
            <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5 ">{index + 1}</td>
            <td className="py-0.5 border border-gray-300 text-[11px] ">
                {poItem?.Po?.docId}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px]">
                {poItem?.Yarn?.name}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px]">
                {poItem?.Color?.name}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px]">
                {poItem?.Uom?.name}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {parseFloat(poQty).toFixed(3)}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {parseFloat(cancelQty).toFixed(3)}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {parseFloat(alreadyInwardedQty).toFixed(3)}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {parseFloat(alreadyReturnedQty).toFixed(4)}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {parseFloat(alreadyBilledQty).toFixed(3)}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {parseFloat(balanceQty).toFixed(3)}
            </td>

            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>
                <input
                    onKeyDown={e => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        if (e.altKey) { e.preventDefault() }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded   w-full py-1"
                    autoFocus={index === 0}
                    value={item.qty}
                    disabled={readOnly}
                    onFocus={(e) => e.target.select()}
                    onChange={(event) => {
                        if (event.target.value < 0) return
                        console.log(event.target.value, balanceQty, "balance")
                        if (parseFloat(event.target.value) > parseFloat(balanceQty)) {
                            toast.info("Bill Qty  Cannot be more than Balance Qty", { position: "top-center" });
                            return
                        }
                        if (!event.target.value) {
                            handleInputChange(0, index, "qty");
                            return
                        }
                        handleInputChange(event.target.value, index, "qty");
                    }}

                    onBlur={(e) => {
                        if (!e.target.value) {
                            handleInputChange(0.000, index, "qty");
                            return
                        }
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty")
                    }}
                />
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {parseFloat(poItem.price).toFixed(3)}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {(parseFloat(billAmount)).toFixed(3)}
            </td>


            <td className='w-40 py-0.5 border border-gray-300 text-[11px] text-right'>
                <button
                    className="text-center rounded py-1 w-20"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            setCurrentSelectedIndex(index);
                        }
                    }}
                    disabled={readOnly}
                    onClick={() => {
                        if (!taxTemplateId) return toast.info("Please select Tax Type", { position: "top-center" });
                        setCurrentSelectedIndex(index)
                    }}

                >
                    {VIEW}
                </button>
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {parseFloat(calculateNetAmount(item)?.netAmount).toFixed(3)}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px]">
                <input
                    readOnly
                    className="w-full bg-transparent focus:outline-none focus:border-transparent text-right pr-2"

                    onContextMenu={(e) => {
                        if (!readOnly) {
                            handleRightClick(e, index, "shiftTimeHrs");
                        }
                    }}
                />
            </td>












        </tr>
    )
}

export default YarnPoItem
