import React, { useEffect } from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"
import { toast } from "react-toastify";
import YarnDetails from "./YarnDetails";

const FormItems = ({ setIssueItems, issueItems, id, isMaterialIssue, setIsMaterialIssue }) => {







    return (
        <>
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[350px] overflow-y-auto">


                <div>

                    <div className="w-[30%] flex justify-end items-center mt-4 mb-5">

                        {/* <table className="w-full border-collapse table-fixed">
                            <thead className="bg-gray-200 text-gray-800">

                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">S No</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Yarn</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Required Qty</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Stock Qty</td>

                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">Issue Qty</td>

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

                        </table> */}
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
                                {(issueItems ? issueItems : []).map((indent, index) => {
                                    return (
                                        <React.Fragment key={index}>

                                            <tr>
                                                <td className="border border-gray-300 px-2 py-1 text-left text-xs w-9">{index + 1}</td>
                                                <td className="border border-gray-300 px-2 py-1 text-left text-xs">{indent?.OrderDetails?.style?.name}</td>

                                                <td className="border border-gray-300 px-1 py-1 text-end">
                                                    <div className="flex space-x-2 justify-end">

                                                        <button
                                                            // onClick={() => deleteRow(index)}
                                                            className="text-red-600 hover:text-red-800 bg-red-50 py-1 rounded text-xs flex items-center"
                                                        >
                                                            <HiTrash className="w-4 h-4" />
                                                        </button>
                                                        <span className="tooltip-text">Delete</span>
                                                    </div>
                                                </td>

                                            </tr>

                                                <YarnDetails  indent={indent} setIssueItems={setIssueItems} GridIndex={index} />

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
                                onClick={() => setIsMaterialIssue(true)}
                                value={isMaterialIssue}
                            />
                            <span>Issue The Material</span>
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