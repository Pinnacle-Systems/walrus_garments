import React, { useEffect } from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"

const FormItems = ({ orderSizeDetails, orderYarnDetails, setRequirementForm, requirementForm, setOrderYarnDetails, id }) => {

    console.log(orderSizeDetails, "orderSizeDetails", id);
    console.log(orderYarnDetails, "orderYarnDetails");

    console.log(requirementForm, "requirementForm");


    

    function newFunction(value, yarnId) {
        console.log(value, yarnId,"yarnIddddd");
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
        console.log(value,  "value" , yarnId, "yarncategoryId");

        setOrderYarnDetails((prev) => {
            let newItems = structuredClone(prev);
            newItems[index]['percentage'] = value;
            return newItems;
        });


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
                    uomId : size.uomId,
                });
            });
        });

        setRequirementForm(combined);
        orderYarnDetails?.forEach((yarn) => {
        newFunction(yarn?.percentage, yarn?.yarnId);
    });
    }, [orderSizeDetails]);

    const getQtyYarnSize = (sizeId, yarnId, colorId) => {
        console.log(sizeId, yarnId, colorId, "sizeId, yarnId, colorId");

        const item = requirementForm?.find(
            i => i.sizeId === sizeId && i.yarnId === yarnId && i.colorId === colorId
        )?.requireWeight


        if (!item) return 0;

        return item;
    };




    const getRequireWeight = (yarnId) => {
        return requirementForm?.reduce((total, item) => {
            if (item.yarnId !== yarnId) return total;

            // find qty for this size
            const sizeQty = orderSizeDetails?.find(s => s.sizeId === item.sizeId)?.qty || 0;

            console.log(item, "item");
            return (total + (parseFloat(item.requireWeight || 0) * parseFloat(sizeQty || 0)) /  1000 );

        }, 0);
    };


    return (
        <>
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[350px] overflow-y-auto">
                <div className="flex justify-between items-center mb-2 overflow-y-auto">
                    <h2 className="font-medium text-slate-700">List Of Items</h2>

                    <div className="flex gap-2 items-center">

                        <button
                            onClick={() => {
                                //  addNewRow()
                            }}
                            className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                        >
                            <HiPlus className="w-3 h-3 mr-1" />
                            Add Item
                        </button>
                    </div>


                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse table-fixed">
                        <thead className="bg-gray-200 text-gray-800">

                            <tr>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">S No</td>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Size</td>

                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Percentage</td>

                                {orderSizeDetails?.map((item, index) => {
                                    return (
                                        <td
                                            key={index}
                                            className="border border-gray-300 px-2 py-1 text-center text-xs w-24"
                                        >
                                            {item?.size?.name}
                                        </td>
                                    )
                                })}


                            </tr>

                            <tr>
                                <td colSpan={3} className="border border-gray-300 px-2 py-1 text-center text-xs">
                                    Weight
                                </td>
                                {orderSizeDetails?.map((item, index) => (
                                    <td key={index} className="border border-gray-300 px-2 py-1 text-center text-xs">
                                        {item?.weight}
                                    </td>
                                ))}

                            </tr>
                            <tr>
                                <td colSpan={3} className="border border-gray-300 px-2 py-1 text-center text-xs">
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
                                    <td className="border border-gray-300 px-2 py-1 text-left text-xs">{index + 1}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-left text-xs">{yarn?.Yarn?.name}</td>


                                    <td className="border border-gray-300 px-2 py-1 text-left text-xs">{ }
                                        <input
                                            type="number"
                                            min={"0"}
                                            onFocus={(e) => e.target.select()}
                                            className="text-right rounded py-1 px-1 w-full table-data-input"
                                            value={yarn?.percentage ?? ""}
                                            
                                            onChange={(e) => {
                                                handleInputChange(e.target.value, index, yarn?.yarnId)
                                             
                                            }}

                                        />
                                    </td>


                                    {(orderSizeDetails || []).map((size) => (
                                        <>
                                            <td className="border border-gray-300 px-2 py-1 text-left text-xs ">
                                                <input
                                                    type="number"

                                                    min={"0"}
                                                    onFocus={(e) => e.target.select()}
                                                    className="text-right rounded py-1 px-1 w-full table-data-input"
                                                    value={parseFloat(getQtyYarnSize(size?.sizeId, yarn?.yarnId, yarn?.colorId,) || "")}
                                                // disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.qty)}
                                                // onChange={(e) => handleInputChange(e.target.value, index, yarn?.sizeId, yarn?.yarnId, yarn?.colorId)}
                                                // onBlur={(e) => handleInputChange(e.target.value, index, yarn?.sizeId, yarn?.yarnId, yarn?.colorId)}

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
                        <h2 className="font-medium text-slate-700">Require Qty</h2>

                    </div>
                    <div className="w-[30%] flex justify-end items-center mt-4">

                        <table className="w-full border-collapse table-fixed">
                            <thead className="bg-gray-200 text-gray-800">

                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">S No</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Yarn</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Required Qty</td>
                                  
                                </tr>

                            </thead>
                            <tbody>

                                {orderYarnDetails?.map((yarn, index) => (
                                    <tr>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs w-9">{index + 1}</td>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">{yarn?.Yarn?.name}</td>

                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">
                                            {getRequireWeight(yarn?.yarnId).toFixed(3)}
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

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