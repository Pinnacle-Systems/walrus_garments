import { useEffect } from "react"
import { useGetPoItemByIdQuery } from "../../../redux/uniformService/PoServices"
import { Loader } from "lucide-react"
import { findFromList } from "../../../Utils/helper"
import { DELETE } from "../../../icons"
import { HiPencil, HiTrash } from "react-icons/hi"
import { useGetAccessoryPoItemByIdQuery } from "../../../redux/uniformService/AccessoryPoServices"


const AccessoryPoItem = ({ uomList, sizeList, accessoryList, colorList, item, index, handleInputChange, readOnly, handleRightClick, purchaseInwardId  ,poInwardOrDirectInward}) => {



    // const { data, isLoading, isFetching } = useGetAccessoryPoItemByIdQuery({ id: item?.poItemsId, purchaseInwardId ,poInwardOrDirectInward }, { skip: !item?.poItemsId })


    // console.log(data, "poItemData")


    // useEffect(() => {
    //     if (purchaseInwardId) return
    //     if (isLoading || isFetching) return
    //     const poItem = data?.data

    //     if (data?.data) {
    //         handleInputChange(poItem?.accessoryId, index, "accessoryId", 0, poItem);


    //     }
    // }, [isFetching, isLoading, data])


    // if (isLoading || isFetching) return <Loader />




    function findAccessoryName(accessoryId, accessoryArray, field) {

        let accessoryObj = accessoryArray?.find(item => parseInt(item.id) == accessoryId)

        if (field == "accessoryItem") {
            return accessoryObj?.accessoryItem?.name
        }
        else if ("accessoryGroup") {
            return accessoryObj?.accessoryItem?.AccessoryGroup?.name
        }

    }


    // const poItem = data.data
    // let poQty = parseFloat(poItem.qty).toFixed(3)
    // let cancelQty = poItem.alreadyCancelData?._sum.qty ? poItem.alreadyCancelData._sum.qty : "0.000";
    // let alreadyInwardedQty = poItem.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
    // let alreadyReturnedQty = poItem.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
    // let balanceQty = substract(substract(poQty, cancelQty), substract(alreadyInwardedQty, alreadyReturnedQty)).toFixed(3)


    return (
        <tr key={item.poItemsId} className='table-row'>
            <td className='w-12 border border-gray-300 text-[11px] text-center'>{index + 1}</td>
            <td className='w-12 border border-gray-300 text-[11px]'>{item?.poNo}</td>
            <td className='w-12 border border-gray-300 text-[11px]'>{findFromList(item?.accessoryId, accessoryList?.data, "aliasName")} </td>
            {/* <td className='py-0.5 border border-gray-300 text-[11px]'>{findAccessoryName(item?.accessoryId, accessoryList?.data, "accessoryItem")}</td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{findAccessoryName(item?.accessoryId, accessoryList?.data, "accessoryGroup")}</td> */}
            <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item?.colorId, colorList?.data, "name")} </td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item?.sizeId, sizeList?.data, "name")} </td>
            <td className='py-0.5 border border-gray-300 text-[11px]'>{findFromList(item?.uomId, uomList?.data, "name")} </td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.poQty || 0}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.cancelQty || 0}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.alreadyInwardedQty || 0}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.alreadyReturnedQty || 0}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{item?.balanceQty || 0}</td>

            <td className='py-0.5 border border-gray-300 text-[11px]'>
                <input
                    onKeyDown={e => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        if (e.altKey) { e.preventDefault() }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded   w-full py-1 table-data-input"
                    autoFocus={index === 0}
                    value={item?.qty}
                    disabled={readOnly || !item?.accessoryId}
                    onFocus={(e) => e.target.select()}
                    onChange={(event) => {
                        if (event.target.value < 0) return
                        if (!event.target.value) {
                            handleInputChange(0, index, "qty");
                            return
                        }
                        handleInputChange(event.target.value, index, "qty", item?.balanceQty);
                    }}

                    onBlur={(e) => {
                        if (!e.target.value) {
                            handleInputChange(0.000, index, "qty");
                            return
                        }
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty", item?.balanceQty)
                    }}
                />
            </td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{parseFloat(item?.price).toFixed(3)}</td>
            <td className='py-0.5 border border-gray-300 text-[11px] text-right'>{!item?.qty ? "0.000" : (parseFloat(item?.price) * parseFloat(item.qty ? item?.qty : "0.000")).toFixed(3)}</td>
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
    )
}

export default AccessoryPoItem
