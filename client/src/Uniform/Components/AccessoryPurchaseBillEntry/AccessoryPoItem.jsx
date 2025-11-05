import React, { useEffect, useState } from 'react'
import { Loader } from '../../../Basic/components'
import { DELETE, VIEW } from '../../../icons'
import { substract } from '../../../Utils/helper'
import { discountTypes } from '../../../Utils/DropdownData';
import { toast } from 'react-toastify'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices';
import Swal from 'sweetalert2';
import { useGetAccessoryPoItemByIdQuery } from '../../../redux/uniformService/AccessoryPoServices';

const YarnPoItem = ({ item, index, handleInputChange, readOnly, removeItem, billEntryId, handleRightClick, taxTemplateId,
    setCurrentSelectedIndex }) => {

    const { data, isLoading, isFetching } = useGetAccessoryPoItemByIdQuery({ id: item.accessoryPoItemsId, billEntryId }, { skip: !(item?.accessoryPoItemsId) })

    const poItem = data?.data
    console.log(poItem, "poItem", billEntryId)

    console.log(item,"item")


    useEffect(() => {
        if (!data?.data) return
        handleInputChange(data.data.price, index, "price", 0, true, poItem);
        handleInputChange(data.data.taxPercent, index, "taxPercent", 0, true);

    }, [data, isLoading, isFetching])


    if (isLoading || isFetching) return <Loader />

    console.log(poItem, 'poItempoItem')



    let poQty;
    let cancelQty
    let alreadyInwardedQty
    let alreadyReturnedQty
    let alreadyBilledQty
    let balanceQty
    let billAmount
    let discountAmount
    let amount


    if(poItem){

        poQty = parseFloat(poItem?.qty).toFixed(3)
        cancelQty = poItem?.alreadyCancelData?._sum.qty ? poItem.alreadyCancelData._sum.qty : "0.000";
        alreadyInwardedQty = poItem?.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
        alreadyReturnedQty = poItem.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
        alreadyBilledQty = poItem?.alreadyBillData?._sum?.qty ? parseFloat(poItem.alreadyBillData._sum.qty).toFixed(3) : "0.000";
        balanceQty = substract(substract(alreadyInwardedQty, alreadyReturnedQty), alreadyBilledQty).toFixed(3)
        billAmount = (parseFloat(poItem?.price) * parseFloat(item.qty)).toFixed(2)
        discountAmount = (item.discountType === "Percentage") ? (billAmount) / 100 * parseInt(item.discountValue) : item.discountValue
        amount = substract(billAmount, discountAmount).toFixed(2)
    }


    function calculateNetAmount(item) {
        const price = parseFloat(item.price) || 0;
        const qty = parseFloat(item.qty) || 0;
        const taxPercent = parseFloat(item.taxPercent) || 0;
        const discountValue = parseFloat(item.discountValue) || 0;
        const discountType = item.discountType || "Percentage";

        const gross = price * qty;

        let discount = 0;
        if (discountType === "Percentage") {
            discount = gross * (discountValue / 100);
        } else if (discountType === "Amount") {
            discount = discountValue;
        }

        const taxable = gross - discount;

        const taxAmount = taxable * (taxPercent / 100);

        const netAmount = Math.round((taxable + taxAmount) * 100) / 100;

        return {
            gross,
            discount,
            taxable,
            taxAmount,
            netAmount
        };
    }



    return (



        <tr className="border border-blue-gray-200 cursor-pointer h-8" >
            <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5 ">{index + 1}</td>
            <td className="py-0.5 border border-gray-300 text-[11px] ">
                {poItem?.AccessoryPo?.docId}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px]">
                {poItem?.Accessory?.aliasName}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px]">
                {poItem?.Color?.name}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px]">
                {poItem?.Uom?.name}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {parseFloat(poQty || "0.000").toFixed(3)}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {parseFloat(cancelQty || "0.000").toFixed(3)}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {parseFloat(alreadyInwardedQty || "0.000").toFixed(3)}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {parseFloat(alreadyReturnedQty || "0.000").toFixed(4)}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {parseFloat(alreadyBilledQty || "0.000").toFixed(3)}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {parseFloat(balanceQty || "0.000").toFixed(3)}
            </td>

            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>
                <input
                    onKeyDown={e => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        if (e.altKey) { e.preventDefault() }
                    }}
                    // min={"0"}
                    type="number"
                    className="text-right rounded   w-full py-1"
                    // autoFocus={index === 0}
                    value={item.qty}
                    // disabled={readOnly}
                    onFocus={(e) => e.target.select()}
                    onChange={(event) => {
                        if (event.target.value < 0) return
                        console.log(event.target.value, balanceQty, "balance")
                        if (parseFloat(event.target.value) > parseFloat(balanceQty)) {
                            Swal.fire({
                                title: "Bill Qty  Cannot be more than Balance Qty",
                                icon: "error",
                                timer: 1500,
                                showConfirmButton: false,
                            });
                            return
                        } else {
                            handleInputChange(event.target.value, index, "qty");
                        }

                        // if (!event.target.value) {
                        //     handleInputChange(0, index, "qty");
                        //     return
                        // }

                    }}

                    onBlur={(e) => {
                        const val = e.target.value;
                        const formatted = e.target.value === "" ? "" : parseFloat(e.target.value).toFixed(3);
                        e.target.value = formatted;
                        if (parseFloat(val) > parseFloat(balanceQty)) {
                            return
                        } else {
                            handleInputChange(val === "" ? 0 : formatted, index, "qty");
                        }

                    }}
                />
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {parseFloat(poItem?.price || "0.000").toFixed(3)}
            </td>
            <td className="py-0.5 border border-gray-300 text-[11px] text-right">
                {(parseFloat(billAmount || "0.000")).toFixed(3)}
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
                            handleRightClick(e, index, item.isPoItem ? item.poItemsId : item.directItemsId, item?.isPoItem ? true : false);
                        }
                    }}
                />
            </td>












        </tr>
    )
}

export default YarnPoItem
