import React, { useEffect } from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"
import YarnDetails from "./YarnDetails";
import { toast } from "react-toastify";

const FormItems = ({ orderSizeDetails, orderYarnDetails, setRaiseIndentItems, raiseIndentItems, readOnly, id, isRaiseRendent, setRaiseIndenet }) => {

    console.log(orderSizeDetails, "orderSizeDetails", id);
    console.log(orderYarnDetails, "orderYarnDetails");

    console.log(raiseIndentItems, "raiseIndentItems");




    function newFunction(value, yarnId) {
        setRaiseIndentItems((prev) => {
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

        if (id) return;

        const groupedMap = {};

        orderSizeDetails.forEach(size => {
            orderYarnDetails.forEach(yarn => {
                const key = `${yarn.yarnId}-${yarn.colorId}`;

                const qty = Number(((parseFloat(size.weight) * yarn.percentage) / 100).toFixed(3));

                if (!groupedMap[key]) {
                    groupedMap[key] = {
                        yarnId: yarn.yarnId,
                        Yarn: { name: yarn?.Yarn?.name },
                        percentage: yarn.percentage,
                        colorId: yarn.colorId,
                        qty: 0,
                        uomId: size.uomId,
                    };
                }

                // accumulate qty across sizes
                groupedMap[key].qty += qty;
            });
        });

        setRaiseIndentItems(Object.values(groupedMap));
    }, [orderSizeDetails, orderYarnDetails, id]);


    function deleteRow(index) {
        console.log(index, "index")
        if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        setRaiseIndentItems(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <>
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[400px] overflow-y-auto">


                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-medium text-slate-700">Required Qty</h2>

                    </div>
                    <div className="w-[30%] flex justify-end items-center mt-4 mb-5">

                        <table className="w-full border-collapse table-fixed">
                            <thead className="bg-gray-200 text-gray-800">

                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">S No</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Style Name </td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Actions</td>

                                </tr>
                            </thead>
                            <tbody>
                                {/* {raiseIndentItems?.map((indent, index) => (
                                    <React.Fragment key={index}>
                                        <tr>
                                            <td className="border border-gray-300 px-2 py-1 text-left text-xs w-9">{index + 1}</td>
                                            <td className="border border-gray-300 px-2 py-1 text-left text-xs">{indent?.OrderDetails?.style?.name}</td>



                                        </tr>
                                        <YarnDetails indentItems={indent} index={index} />

                                    </React.Fragment>

                                ))} */}
                                {(raiseIndentItems ? raiseIndentItems : []).map((indent, index) => {
                                    return (
                                        <React.Fragment key={index}>

                                            <tr>
                                                <td className="border border-gray-300 px-2 py-1 text-left text-xs w-9">{index + 1}</td>
                                                <td className="border border-gray-300 px-2 py-1 text-left text-xs">{indent?.OrderDetails?.style?.name}</td>

                                                <td className="border border-gray-300 px-1 py-1 text-end">
                                                    <div className="flex space-x-2 justify-end">

                                                        <button
                                                            onClick={() => deleteRow(index)}
                                                            className="text-red-600 hover:text-red-800 bg-red-50 py-1 rounded text-xs flex items-center"
                                                        >
                                                            <HiTrash className="w-4 h-4" />
                                                        </button>
                                                        <span className="tooltip-text">Delete</span>
                                                    </div>
                                                </td>

                                            </tr>

                                            <YarnDetails indentItems={indent} index={index} />


                                        </React.Fragment>
                                    );


                                })}


                            </tbody>

                        </table>
                    </div>
                    <div >
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                className="form-checkbox"
                                onClick={() => setRaiseIndenet(!isRaiseRendent)}
                                checked={isRaiseRendent}
                            />
                            <span>Raise Indent to Store</span>
                        </label>
                    </div>
                </div>

            </div>
            <div>

            </div>
        </>
    )
}

export default FormItems;















