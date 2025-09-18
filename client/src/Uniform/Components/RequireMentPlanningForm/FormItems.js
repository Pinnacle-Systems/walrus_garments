import React, { useEffect, useState } from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"
import Swal from "sweetalert2";

const FormItems = ({ orderSizeDetails, orderYarnDetails, setRequirementForm, requirementForm, setOrderYarnDetails, id, readOnly, yarnTotals, setYarnTotals, setRequirementItems, requirementItems , orderItemsData }) => {

    console.log(orderSizeDetails, "orderSizeDetails");
    console.log(orderYarnDetails, "orderYarnDetails")
    console.log(requirementItems, "requirementItems");
    console.log(orderItemsData, "orderData")



    function calculateYarnTotals(yarnArr, sizeArr) {
        return yarnArr.map(yarn => {
            const total = sizeArr?.reduce((sum, size) => {
                return sum + (yarn.percentage * size.weight / 100) * size.qty;
            }, 0);

            return {
                yarnId: yarn.id,
                yarnName: yarn.name,
                totalRequired: total.toFixed(3)  // round to 3 decimals
            };
        });
    }

    console.log(calculateYarnTotals(orderYarnDetails, orderSizeDetails), "Totallll")



    function newFunction(value, yarnId) {
        console.log(value, yarnId, "yarnIddddd");
        setRequirementForm((prev) => {
            const newItems = structuredClone(prev);
            const percent = value === "" ? 0 : parseFloat(value);
            newItems.forEach((item) => {
                if (item.yarnId === yarnId) {
                    item.requireWeight = Number(((parseFloat(item.weight) * percent) / 100).toFixed(5));
                }
            });
            return newItems;
        });
    }


    function handleInputChange(value, index, yarnId) {


        const num = value === "" ? 0 : parseFloat(value);

        setOrderYarnDetails((prev) => {
            let newItems = structuredClone(prev);

            const totalWithoutCurrent = newItems?.reduce((sum, item, i) => {
                if (i === index) return sum;
                return sum + (parseFloat(item.percentage) || 0);
            }, 0);

            if (totalWithoutCurrent + num > 100) {
                Swal.fire({
                    title: "Total percentage cannot exceed 100!",
                    icon: "error",
                    draggable: true,
                    timer: 1000,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            }
            else {

                newItems[index]["percentage"] = num;
                const requirementArr = newItems?.map((yarn) => ({
                    yarn: yarn.Yarn.name,
                    percentage: yarn.percentage,
                    yarnKneedleId : yarn?.yarnKneedleId,
                    yarnId: yarn.yarnId,
                    count : yarn.yarnId,
                    colorId : yarn?.colorId ,
                    uomId: yarn?.uomId ? yarn?.uomId : 1,
                    orderId : orderItemsData?.orderId,
                    orderDetailsId : orderItemsData?.id,
                    partyId : orderItemsData?.order?.partyId,
                    requiredQty: orderSizeDetails?.reduce(
                        (sum, size) =>
                            sum + (yarn.percentage * size.weight / 100) * size.qty,
                        0
                    ).toFixed(3),
                }));

                setRequirementItems(requirementArr);

            }

            return newItems;
        });

        setRequirementForm((prev) => {
            const newItems = structuredClone(prev);
            newItems.forEach((item) => {
                if (item.yarnId === yarnId) {
                    item.requireWeight = Number(
                        ((parseFloat(item.weight) * num) / 100).toFixed(5)
                    );
                    item.percentage = value
                }
            });
            return newItems;
        });

        // const requirementArr = orderYarnDetails?.map(yarn => ({
        //     yarnId: yarn.id,
        //     yarnName: yarn.name,
        //     percentage: yarn.percentage,
        //     requiredQty: orderSizeDetails?.reduce(
        //         (sum, size) => sum + (yarn.percentage * size.weight / 100) * size.qty,
        //         0
        //     ).toFixed(3)
        // }));

        // setRequirementItems(requirementArr);

    }

    console.log(requirementItems, "requirementItems");

    useEffect(() => {
        orderYarnDetails?.forEach((yarn) => {
            newFunction(yarn?.percentage, yarn?.yarnId);
        });
    }, [orderYarnDetails]);







    useEffect(() => {
        if (!orderSizeDetails?.length || !orderYarnDetails?.length) return;

        const combined = [];

        orderSizeDetails.forEach(size => {
            orderYarnDetails.forEach(yarn => {
                combined.push({
                    sizeId: size.sizeId,
                    yarnId: yarn.yarnId,
                    colorId: yarn.colorId,
                    requireWeight: 0,
                    weight: size.weight,
                    uomId: size.uomId,
                });
            });
        });

        setRequirementForm(combined);
        orderYarnDetails?.forEach((yarn) => {
            newFunction(yarn?.percentage, yarn?.yarnId);
        });
    }, [orderSizeDetails]);

    const getQtyYarnSize = (sizeId, yarnId, colorId) => {
        // console.log(sizeId, yarnId, colorId, "sizeId, yarnId, colorId");

        const item = requirementForm?.find(
            i => i.sizeId === sizeId && i.yarnId === yarnId && i.colorId === colorId
        )?.requireWeight


        if (!item) return 0;

        return item;
    };




    const getRequireWeight = (yarnId) => {
        return requirementForm?.reduce((total, item) => {
            if (item.yarnId !== yarnId) return total;

            const sizeQty = orderSizeDetails?.find(s => s.sizeId === item.sizeId)?.qty || 0;

            return (total + (parseFloat(item.requireWeight || 0) * parseFloat(sizeQty || 0)));

        }, 0);
    };





    return (
        <>
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[380px] overflow-y-auto">
                <div className="flex justify-between items-center mb-2 overflow-y-auto">
                    <h2 className="font-medium text-slate-700">List Of Items</h2>

                    {/* <div className="flex gap-2 items-center">

                        <button
                            onClick={() => {
                                //  addNewRow()
                            }}
                            className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                        >
                            <HiPlus className="w-3 h-3 mr-1" />
                            Add Item
                        </button>
                    </div> */}


                </div>

                <div className="overflow-x-auto">
                    <table className="w-[50%] border-collapse table-fixed">
                        <thead className="bg-gray-200 text-gray-800">

                            <tr>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">S No</td>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-44">Yarn </td>

                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Percentage</td>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Size</td>

                                {orderSizeDetails?.map((item, index) => {
                                    return (
                                        <td
                                            key={index}
                                            className="border border-gray-300 px-2 py-1 text-center text-xs w-16"
                                        >
                                            {item?.size?.name}
                                        </td>
                                    )
                                })}


                            </tr>

                            <tr>
                                <td colSpan={3} className="bg-white border-l border-gray-300">
                                </td>
                                <td className="border border-gray-300 px-2 py-1 text-end text-xs">
                                    Size Weight
                                </td>
                                {orderSizeDetails?.map((item, index) => (
                                    <td key={index} className="border border-gray-300 px-2 py-1 text-center text-xs">
                                        {item?.weight}g
                                    </td>
                                ))}

                            </tr>
                            <tr>
                                <td colSpan={3} className="bg-white border-l border-gray-300" >
                                </td>
                                <td className="border border-gray-300 px-2 py-1 text-end text-xs">
                                    Order Qty
                                </td>
                                {orderSizeDetails?.map((item, index) => (
                                    <td key={index} className="border border-gray-300 px-2 py-1 text-center text-xs">
                                        {item?.qty}
                                    </td>
                                ))}

                            </tr>

                        </thead>
                        <tbody>

                            {orderYarnDetails?.map((yarn, index) => (
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">{index + 1}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-left text-xs ">{yarn?.Yarn?.name}</td>


                                    <td className="border border-gray-300 px-2 py-1 text-left text-xs">
                                        <input
                                            type="number"
                                            min={"0"}
                                            onFocus={(e) => e.target.select()}
                                            className="text-right rounded py-1 px-1 w-full table-data-input"
                                            value={yarn?.percentage ?? ""}
                                            disabled={readOnly}
                                            onChange={(e) => {
                                                handleInputChange(e.target.value, index, yarn?.yarnId)

                                            }}

                                        />
                                    </td>
                                    <td className="border-b border-gray-300 px-2 py-1 text-left text-xs ">{ }</td>


                                    {(orderSizeDetails || []).map((size) => (
                                        <>
                                            <td className="border border-gray-300 px-2 py-1 text-left text-xs ">
                                                <input
                                                    type="number"

                                                    min={"0"}
                                                    onFocus={(e) => e.target.select()}
                                                    className="text-right rounded py-1 px-1 w-full table-data-input"
                                                    value={parseFloat(getQtyYarnSize(size?.sizeId, yarn?.yarnId, yarn?.colorId,) || "")}
                                                    disabled={true}

                                                />
                                            </td>

                                        </>

                                    ))}






                                </tr>
                            ))}

                        </tbody>

                    </table>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2  mt-4">
                        <h2 className="font-medium text-slate-700">Required Qty</h2>

                    </div>
                    <div className="w-[20%] flex justify-end items-center mt-4">

                        <table className="w-full border-collapse table-fixed">
                            <thead className="bg-gray-200 text-gray-800">

                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">S No</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Yarn</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Color</td>

                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Required Qty (kgs)</td>

                                </tr>

                            </thead>
                            <tbody>

                                {orderYarnDetails?.map((yarn, index) => (
                                    <tr>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs w-9">{index + 1}</td>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">{yarn?.Yarn?.name}</td>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">{yarn?.Color?.name}</td>

                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">
                                            {getRequireWeight(yarn?.yarnId).toFixed(3)}
                                        </td>

                                    </tr>
                                ))}


                            </tbody>
                            {/* <tbody>
                                {yarnTotals?.map((y, index) => (
                                    <tr key={index}>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs w-9">
                                            {index + 1}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">
                                            {y.yarnName}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">
                                            {y.qty.toFixed(3)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody> */}
                        </table>
                    </div>
                </div>



            </div>
            <div>

            </div>
        </>
    )
}

export default FormItems;













