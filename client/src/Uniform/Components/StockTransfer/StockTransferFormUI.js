import { FaFileAlt } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { useState } from "react";
import { getCommonParams } from "../../../Utils/helper";
import { DateInputNew, DropdownInput, ReusableSearchableInput, TextInput } from "../../../Inputs";
import { HiPlus, HiX } from "react-icons/hi";
import { stockTransferType } from "../../../Utils/DropdownData";

const StockTransferForm = ({


    showAddressPopup, setShowAddressPopup,
    docId,
    address,
    date,
    setOpenModelForAddress,
    setFromOrderNo,
    fromOrderNo, onClose, setTransfetType, transferType

}) => {



    return (
        <>
            <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-2xl font-bold text-gray-800">Stock Transfer</h1>
                    <div className="gpa-4">
                        {/* <button
                                        onClick={onClose}
                                        className="text-indigo-600 hover:text-indigo-700"
                                        title="Open Report"
                                    >
                                        <HiOutlineDocumentText className="w-7 h-6" />
                                    </button> */}
                        <button
                            onClick={onClose}
                            className="text-indigo-600 hover:text-indigo-700"
                            title="Open Report"
                        >
                            <FaFileAlt className="w-5 h-5" />
                        </button>
                    </div>

                </div>

                <div className="space-y-3 h-full ">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">


                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Basic Details
                            </h2>
                            <div className="grid grid-cols-2 gap-1">
                                <ReusableInput label="Doc Id" readOnly value={docId} />
                                <ReusableInput label="Doc Date" value={date} type={"date"} required={true} readOnly={true} disabled />
                                <DropdownInput name="Stock Transfer Type"
                                    options={stockTransferType}
                                    value={transferType}
                                    setValue={setTransfetType}
                                    required={true}
                                // readOnly={readOnly}
                                />

                            </div>
                        </div>



                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                            <h2 className="font-medium text-slate-700 mb-2">Customer Details</h2>

                            <div className="grid grid-cols-1">
                                <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                                    {transferType == "Order" && (
                                        <>

                                            <TextInput name="From Order No" value={fromOrderNo} setValue={setFromOrderNo} required={true} readOnly={true} />
                                            <TextInput name="From Customer" value={fromOrderNo} setValue={setFromOrderNo} required={true} readOnly={true} />
                                        </>
                                    )}
                                    <TextInput name="To Order No" value={fromOrderNo} setValue={setFromOrderNo} required={true} readOnly={true} />
                                    <TextInput name="To Customer" value={fromOrderNo} setValue={setFromOrderNo} required={true} readOnly={true} />






                                </div>
                            </div>
                        </div>




                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-medium text-slate-700 mb-2">
                            </h2>

                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default StockTransferForm;