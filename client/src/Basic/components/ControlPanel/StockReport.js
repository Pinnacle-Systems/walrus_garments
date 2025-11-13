import { useState } from "react";
import { useAddStockReportControlMutation, useUpdateStockReportControlMutation } from "../../../redux/uniformService/StockReportControl.Services";
import Swal from "sweetalert2";

const StockReport = () => {

    const [isStockReport, setIsStockReport] = useState("");
    const [id, setId] = useState("")
    const [addData] = useAddStockReportControlMutation();
    const [updateData] = useUpdateStockReportControlMutation();


    const data = {
        isStockReport
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            // setId(returnData.data.id)
            // syncFormWithDb(undefined)
            Swal.fire({
                title: text + "  " + "Successfully",
                icon: "success",
            });
        } catch (error) {
            console.log("handle")
        }
    }
    const saveData = () => {
        

        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated")
        } else {
            handleSubmitCustom(addData, data, "Created")
        }
    }
    return (
        <>
            <div>
                <div className=' flex justify-between mb-2 items-center px-0.5 text-[14px] font-semibold'>
                    {/* <h5 className='my-1 bg-gray-300 px-1 rounded'>Select Approver</h5> */}
                    {/* <div className='flex items-center'>
                        <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                    </div> */}
                </div>

                <div className="flex flex-col items-start gap-6 bg-gray-50 p-6 rounded-2xl shadow-sm w-fit">
                    <div className="p-6 w-[22rem] bg-white rounded-2xl shadow-md transition-all hover:shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-800 mb-5">Select Report Type</h2>

                        <div className="flex flex-col gap-4">
                            <label className="flex items-center gap-3 text-gray-700 font-medium cursor-pointer">
                                <input
                                    type="radio"
                                    name="report"
                                    value="ItemWise"
                                    checked={isStockReport === "ItemWise"}
                                    onChange={(e) => setIsStockReport(e.target.value)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 cursor-pointer"
                                />
                                <span>Item Wise Stock</span>
                            </label>

                            <label className="flex items-center gap-3 text-gray-700 font-medium cursor-pointer">
                                <input
                                    type="radio"
                                    name="report"
                                    value="SupplierWise"
                                    checked={isStockReport === "SupplierWise"}
                                    onChange={(e) => setIsStockReport(e.target.value)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 cursor-pointer"
                                />
                                <span>Supplier Wise Stock</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-center w-full">
                        <button
                            onClick={() => saveData()}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-all duration-200"
                        >
                            Save
                        </button>
                    </div>
                </div>

            </div>
        </>
    )

}

export default StockReport