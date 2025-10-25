// import { useEffect } from "react"
// import { useGetPoItemByIdQuery } from "../../../redux/uniformService/PoServices"
// import { Loader } from "lucide-react"
// import { findFromList } from "../../../Utils/helper"
// import { DELETE } from "../../../icons"
// import { HiPencil, HiTrash } from "react-icons/hi"
// import { useGetAccessoryPoItemByIdQuery } from "../../../redux/uniformService/AccessoryPoServices"


// const DirectInwardItems = ({ uomList, sizeList, accessoryList, colorList, item, index, handleInputChange, readOnly, handleRightClick, purchaseInwardId }) => {



//     const { data, isLoading, isFetching } = useGetAccessoryPoItemByIdQuery({ id: item?.poItemsId, purchaseInwardId }, { skip: !item?.poItemsId })


//     // useEffect(() => {
//     //     if (purchaseInwardId) return
//     //     if (isLoading || isFetching) return
//     //     const poItem = data?.data

//     //     if (data?.data) {
//     //         handleInputChange(poItem?.accessoryId, index, "accessoryId", 0, poItem);


//     //     }
//     // }, [isFetching, isLoading, data, purchaseInwardId])
//     if (isLoading || isFetching) return <Loader />




//     function findAccessoryName(accessoryId, accessoryArray, field) {

//         let accessoryObj = accessoryArray?.find(item => parseInt(item.id) == accessoryId)

//         if (field == "accessoryItem") {
//             return accessoryObj?.accessoryItem?.name
//         }
//         else if ("accessoryGroup") {
//             return accessoryObj?.accessoryItem?.AccessoryGroup?.name
//         }

//     }


//     // const poItem = data.data
//     // let poQty = parseFloat(poItem.qty).toFixed(3)
//     // let cancelQty = poItem.alreadyCancelData?._sum.qty ? poItem.alreadyCancelData._sum.qty : "0.000";
//     // let alreadyInwardedQty = poItem.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
//     // let alreadyReturnedQty = poItem.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
//     // let balanceQty = substract(substract(poQty, cancelQty), substract(alreadyInwardedQty, alreadyReturnedQty)).toFixed(3)


//     return (
  
//     )
// }

// export default DirectInwardItems
