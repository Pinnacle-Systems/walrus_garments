import { useState } from "react";
import { toast } from "react-toastify";

const YarnDetails = ({ indent, GridIndex, setIssueItems }) => {

    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("");
    const [panelGridOpen, setPanelGridOpen] = useState(false)
    const [arrayName, setArrayName] = useState("");







    function handleInputChange(value, index, field, stockQty = 0) {
        console.log(value, "value");

        if (field === "issueQty") {
            if (parseFloat(stockQty) < parseFloat(value)) {
                toast.info("Issue Qty cannot be more than Stock Qty", { position: 'top-center' });
                return; // ⬅ stop execution here, no state update
            }
        }

        setIssueItems((prev) => {
            let RaiseIndenetYarnItems = 'RaiseIndenetYarnItems';
            const newItems = structuredClone(prev);
            newItems[GridIndex][RaiseIndenetYarnItems][index][field] = value;
            return newItems;
        });
    }





    return (
        <>




            <tr>
                <td colSpan={3} className="p-0">
                    <div className="flex justify-end w-full">
                        <table className="w-auto border border-gray-300">
                            <thead className="bg-gray-200 text-gray-800">
                                <tr>
                                    <th className="w-8 px-4 py-1.5 text-center font-medium text-[13px]">S.No</th>
                                    <th className="w-8 px-4 py-1.5 text-center font-medium text-[13px]">Yarn</th>
                                    <th className="w-8 px-4 py-1.5 text-center font-medium text-[13px]">Color</th>
                                    <th className="w-8 px-4 py-1.5 text-center font-medium text-[13px]">Required Qty</th>
                                    <th className="w-8 px-4 py-1.5 text-center font-medium text-[13px]">Stock Qty</th>
                                    <th className="w-8 px-4 py-1.5 text-center font-medium text-[13px]">Issue Qty</th>


                                </tr>


                            </thead>
                            <tbody>
                                {indent?.RaiseIndenetYarnItems?.map((yarn, index) => (
                                    <tr key={index} className="border border-blue-gray-200 cursor-pointer">
                                        <td className="py-0.5 border border-gray-300 text-[11px] text-center">
                                            {index + 1}
                                        </td>
                                        <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                            {yarn?.Yarn?.name}
                                        </td>
                                        <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                                            {yarn?.Color?.name}
                                        </td>
                                        <td className=" border border-gray-300 text-right text-[11px] py-1.5 px-2">
                                            {yarn.qty} Kg
                                        </td>
                                        <td className=" border border-gray-300 text-right text-[11px] py-1.5 px-2">
                                            {yarn.stockQty} Kg
                                        </td>
                                        <td className=" border border-gray-300 text-right text-[11px] py-1.5 px-2">
                                            <input
                                                type="number"
                                                onKeyDown={e => {
                                                    if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                                                    if (e.key === "Delete") handleInputChange("0.000", index, "discountAmount");
                                                }}
                                                min="0"
                                                onFocus={e => e.target.select()}
                                                className="text-right rounded w-full py-1 text-xs table-data-input"
                                                value={yarn?.issueQty}
                                                // disabled={readOnly }
                                                onChange={e => handleInputChange(e.target.value, index, "issueQty",yarn.stockQty)}
                                                onBlur={e => handleInputChange(e.target.value, index, "issueQty",yarn.stockQty)}
                                            />
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </td>
            </tr>




        </>
    )
}

export default YarnDetails