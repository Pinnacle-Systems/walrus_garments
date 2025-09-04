import React, { useEffect } from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"
import { toast } from "react-toastify";

const FormItems = ({ setIssueItems, issueItems, id, isMaterialIssue, setIsMaterialIssue }) => {



    console.log(issueItems, "requirementForm");




    // function newFunction(value, yarnId) {
    //     console.log(value, yarnId, "yarnIddddd");
    //     setIssueItems((prev) => {
    //         const newItems = structuredClone(prev);
    //         const percent = value === "" ? 0 : parseFloat(value);
    //         newItems.forEach((item) => {
    //             if (item.yarnId === yarnId) {
    //                 item.requireWeight = Number(((parseFloat(item.weight) * percent) / 100).toFixed(5));
    //             }
    //         });
    //         return newItems;
    //     });
    // }

    function handleInputChange(value, index, field , stockQty = 0) {
        console.log(value, "value",);

        if (field === "issueQty") {
            if (parseFloat(stockQty) < parseFloat(value)) {
                toast.info("Issue Qty Can not be more than stockQty Qty", { position: 'top-center' })
                return
            }
        }
        setIssueItems((prev) => {
            const newItems = structuredClone(prev);
            newItems[index][field] = value
            return newItems;
        });
    }












    return (
        <>
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[350px] overflow-y-auto">


                <div>

                    <div className="w-[30%] flex justify-end items-center mt-4 mb-5">

                        <table className="w-full border-collapse table-fixed">
                            <thead className="bg-gray-200 text-gray-800">

                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">S No</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Yarn</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Required Qty</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Stock Qty</td>

                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">issue Qty</td>

                                </tr>

                            </thead>
                            <tbody>

                                {issueItems?.map((yarn, index) => (
                                    <tr>
                                        <td className="border border-gray-300 px-2 py-1 text-right text-xs w-9">{index + 1}</td>
                                        <td className="border border-gray-300 px-2 py-1 text-left text-xs">{yarn?.Yarn?.name}</td>

                                        <td className="border border-gray-300 px-2 py-1 text-right text-xs">
                                            {yarn?.qty}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-1 text-right text-xs">{yarn?.stockQty}</td>

                                        <td className="border border-gray-300 px-2 py-1 text-right text-xs">
                                            <input
                                         
                                                min={"0"}
                                                type="number"
                                                className="text-right rounded py-1 w-full px-1 table-data-input"
                                                onFocus={(e) => e.target.select()}
                                                value={yarn.issueQty}
                                                // disabled={readOnly}
                                                onChange={(e) =>
                                                    handleInputChange(e.target.value, index, "issueQty" ,yarn?.stockQty)
                                                }
                                                onBlur={(e) => {
                                                    handleInputChange(parseFloat(e.target.value).toFixed(2), index, "issueQty",yarn?.stockQty);

                                                }
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}

                            </tbody>

                        </table>
                    </div>
                    <div >
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                className="form-checkbox"
                                onClick={() => setIsMaterialIssue(true)}
                                value={isMaterialIssue}
                            />
                            <span>Issue The Material</span>
                        </label>
                              {/* <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                className="form-checkbox"
                                onClick={() => setIsMaterialIssue(true)}
                                value={isMaterialIssue}
                            />
                            <span></span>
                        </label> */}
                    </div>
                </div>

















            </div>
            <div>

            </div>
        </>
    )
}

export default FormItems;