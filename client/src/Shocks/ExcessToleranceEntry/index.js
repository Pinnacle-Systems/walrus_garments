import React, { useCallback, useEffect, useRef, useState } from 'react'

import secureLocalStorage from 'react-secure-storage';
import toast from 'react-hot-toast';
import { useAddCountsMasterMutation, useDeleteCountsMasterMutation, useGetCountsMasterByIdQuery, useGetCountsMasterQuery, useUpdateCountsMasterMutation } from '../../redux/uniformService/CountsMasterServices';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import { DropdownInput, ReusableTable, TextInput, ToggleButton } from '../../Inputs';
import { ExcessToleranceType, statusDropdown } from '../../Utils/DropdownData';
import { Check, Plus, Power } from 'lucide-react';
import Modal from '../../UiComponents/Modal';
import Swal from 'sweetalert2';
import { useAddExcessToleranceMutation, useDeleteExcessToleranceMutation, useGetExcessToleranceByIdQuery, useGetExcessToleranceQuery, useUpdateExcessToleranceMutation } from '../../redux/services/ExcessToleranceServices';


export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [transaction, setTransaction] = useState("");
    const [active, setActive] = useState(true);
    const [errors, setErrors] = useState({})
    const [excessType, setExcessType] = useState("")
    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);
    const [toleranceItems, setToleranceItems] = useState([])

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: allData, isLoading, isFetching } = useGetExcessToleranceQuery({ params, searchParams: searchValue });

    useEffect(() => {
        if (toleranceItems?.length >= 1) return
        setToleranceItems(prev => {
            let newArray = Array?.from({ length: 1 - prev?.length }, () => {
                return {

                    fromTolerance: "",
                    toTolerance: "0",

                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setToleranceItems, toleranceItems])



    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetExcessToleranceByIdQuery(id, { skip: !id });


    const [addData] = useAddExcessToleranceMutation();
    const [updateData] = useUpdateExcessToleranceMutation();
    const [removeData] = useDeleteExcessToleranceMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setReadOnly(false);
                setTransaction("");
                setActive(id ? (data?.active) : true);


            } else {
                setTransaction(data?.transaction ?  data?.transaction :  "");
                setExcessType(data?.excessType  ?  data?.excessType  : "")
                setToleranceItems(data?.ExcessToleranceItems  ? data?.ExcessToleranceItems  : [])
            }
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, transaction, excessType, toleranceItems,active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    }

    const validateData = (data) => {
        if (data.transaction && data?.excessType) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id)
            // toast.success(text + "Successfully");
            Swal.fire({
                title: text + "  " + "Successfully",
                icon: "success",
                draggable: true,
                timer: 1000,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            setForm(false);

        } catch (error) {
            console.log("handle");
        }
    };

    const saveData = () => {
        if (!validateData(data)) {
            // toast.error("Please fill all required fields...!", {
            //     position: "top-center",
            // });
            Swal.fire({
                title:  "Please fill all required fields...!",
                icon: "success",
                draggable: true,
                timer: 1000,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            return;
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return;
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated");
        } else {
            handleSubmitCustom(addData, data, "Added");
        }
    };

    const deleteData = async (id) => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                let deldata = await removeData(id).unwrap();
                if (deldata?.statusCode == 1) {
                    toast.error(deldata?.message)
                    return
                }
                setId("");
                // toast.success("Deleted Successfully");
                Swal.fire({
                    title: "Deleted" + "  " + "Successfully",
                    icon: "success",
                    draggable: true,
                    timer: 1000,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                setForm(false)
            } catch (error) {
                toast.error("something went wrong");
            }
        }
    };

    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === "s") {
            event.preventDefault();
            saveData();
        }
    };

    const onNew = () => {
        setId("");
        setForm(true);
        setSearchValue("");
        syncFormWithDb(undefined);
        setReadOnly(false);
        setTransaction("")
        setExcessType("")
        setToleranceItems([])

    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }

    const ACTIVE = (
        <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
            <Power size={10} />
        </div>
    );
    const INACTIVE = (
        <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
            <Power size={10} />
        </div>
    );

    const columns = [
        {
            header: "S.No",
            accessor: (item, index) => index + 1,
            className: "font-medium text-gray-900 w-12  text-center",
        },

        {
            header: "Transaction",
            accessor: (item) => item?.transaction,
            //   cellClass: () => "font-medium  text-gray-900",
            className: "font-medium text-gray-900 text-center uppercase w-72",
        },
        {
            header: "Type",
            accessor: (item) => item?.excessType,
            //   cellClass: () => "font-medium  text-gray-900",
            className: "font-medium text-gray-900 text-center uppercase w-72",
        },
        {
            header: "active",
            accessor: (item) => (item.active ? ACTIVE : INACTIVE),
            //   cellClass: () => "font-medium text-gray-900",
            className: "font-medium text-gray-900 text-center uppercase w-16",
        },




    ];
    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(toleranceItems);
        newBlend[index][field] = value;
        setToleranceItems(newBlend);
    };



    const handleView = (id) => {
        setId(id);
        setForm(true);
        setReadOnly(true);
        console.log("view");
    };
    const handleEdit = (id) => {
        setId(id);
        setForm(true);
        setReadOnly(false);
        console.log("Edit");
    };
    return (

        <div onKeyDown={handleKeyDown} className="p-1 h-[90%]">
            <div className="w-full flex bg-white p-1 justify-between  items-center">
                <h5 className="text-2xl font-bold text-gray-800">Excess Tolerance Master</h5>
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            setForm(true);
                            onNew();
                        }}
                        className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                    >
                        + Add New Excess Tolerance
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3 ">
                <ReusableTable
                    columns={columns}
                    data={allData?.data}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={deleteData}
                    itemsPerPage={15}
                />
            </div>

            <div>
                {form === true && (
                    <Modal
                        isOpen={form}
                        form={form}
                        widthClass={"w-[70%] h-[90%]"}
                        onClose={() => {
                            setForm(false);
                            setErrors({});
                        }}
                    >
                        <div className="h-full flex flex-col bg-[f1f1f0]">
                            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                                        {id
                                            ? !readOnly
                                                ? "Edit Excess Tolerance "
                                                : "Counts Excess Tolerance "
                                            : "Add New Excess Tolerance"}
                                    </h2>
                                </div>
                                <div className="flex gap-2">
                                    <div>
                                        {readOnly && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setForm(false);
                                                    setSearchValue("");
                                                    setId(false);
                                                }}
                                                className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {!readOnly && (
                                            <button
                                                type="button"
                                                onClick={saveData}
                                                className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                  border border-green-600 flex items-center gap-1 text-xs"
                                            >
                                                <Check size={14} />
                                                {id ? "Update" : "Save"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* <div className="flex-1 overflow-auto p-3">
                                <div className="grid grid-cols-1  gap-3  h-full">
                                    <div className="lg:col-span-2 space-y-3">
                                        <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                                            <div className="space-y-4 ">
                                                <fieldset className=' rounded mt-2'>
                                                    <div className=''>
                                                        <div className='mb-3 w-[48%]'>
                                                            <TextInput name="Transaction" type="text" value={transaction} setValue={setTransaction} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                        </div>
                                                        <div className='mb-3 w-[48%]'>
                                                            <DropdownInput name="Type" options={ExcessToleranceType}  value={transaction} setValue={setTransaction} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                        </div>
                                                        <div className='mb-5'>
                                                            <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                                                        </div>
                                                    </div>
                                                </fieldset>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                            <div className='flex-1 overflow-auto p-3 space-y-3'>
                                <div className='grid grid-cols-4  gap-5'>
                                    <div className='mb-3'>
                                        <TextInput name="Transaction" type="text" value={transaction} setValue={setTransaction} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                    </div>
                                    <div className=' '>
                                        <DropdownInput name="Type" options={ExcessToleranceType} value={excessType} setValue={setExcessType} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                    </div>
                                    <div className='mt-5'>
                                        <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                                    </div>
                                </div>
                                <div>
                                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
                                        <div className="flex justify-between items-center mb-2">
                                            <h2 className="font-bold text-slate-700">List Of Items</h2>


                                        </div>
                                        <div className={` relative w-[70%] overflow-y-auto py-1`}>
                                            <table className="w-full border-collapse table-fixed">
                                                <thead className="bg-gray-200 text-gray-900">
                                                    <tr>
                                                        <th
                                                            className={`w-2 px-4 py-2 text-center font-medium text-[13px] `}
                                                        >
                                                            S.No
                                                        </th>
                                                        <th

                                                            className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                                        >
                                                            From Tolerance
                                                        </th>


                                                        <th

                                                            className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                                        >
                                                            To Tolerance
                                                        </th>
                                                        <th

                                                            className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                                        >
                                                            Qty
                                                        </th>
                                                        <th

                                                            className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                                        >
                                                            Notes
                                                        </th>








                                                    </tr>
                                                </thead>

                                                <tbody>

                                                    {(toleranceItems ? toleranceItems : [])?.map((row, index) =>
                                                        <tr className="border border-blue-gray-200 cursor-pointer " >
                                                            <td className=" border border-gray-300 text-[11px]  text-center p-0.5 ">{index + 1}</td>
                                                            <td className=" border border-gray-300 text-[11px]  text-center p-0.5 ">
                                                                <input
                                                                    className=" rounded px-4 ml-2 w-full py-0.5 text-xs focus:outline-none text-right table-data-input"

                                                                    value={row?.fromTolerance}
                                                                    onFocus={e => e.target.select()}
                                                                    disabled={readOnly}
                                                                    onChange={(e) => {
                                                                        handleInputChange(e.target.value, index, "fromTolerance")
                                                                    }}
                                                                    onBlur={(e) => {

                                                                        handleInputChange(e.target.value, index, "fromTolerance");
                                                                    }}
                                                                />

                                                            </td>
                                                            <td className=" border border-gray-300 text-[11px]  text-center p-0.5 ">
                                                                <input
                                                                    className=" rounded px-4 ml-2 w-full py-0.5 text-xs focus:outline-none text-right table-data-input"

                                                                    value={row?.toTolerance}
                                                                    onFocus={e => e.target.select()}
                                                                    disabled={readOnly}
                                                                    onChange={(e) => {
                                                                        handleInputChange(e.target.value, index, "toTolerance")
                                                                    }}
                                                                    onBlur={(e) => {

                                                                        handleInputChange(e.target.value, index, "toTolerance");
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className=" border border-gray-300 text-[11px]  text-center p-0.5 ">
                                                                <input
                                                                    className=" rounded px-4 ml-2 w-full py-0.5 text-xs focus:outline-none text-right table-data-input"

                                                                    value={row?.qty}
                                                                    onFocus={e => e.target.select()}
                                                                    disabled={readOnly}
                                                                    onChange={(e) => {
                                                                        handleInputChange(e.target.value, index, "qty")
                                                                    }}
                                                                    onBlur={(e) => {

                                                                        handleInputChange(e.target.value, index, "qty");
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className=" border border-gray-300 text-[11px]  text-center p-0.5 ">
                                                                <input
                                                                    className="rounded px-4 ml-2 w-full py-0.5 text-xs focus:outline-none text-right table-data-input"

                                                                    value={row?.notes}
                                                                    onFocus={e => e.target.select()}
                                                                    disabled={readOnly}
                                                                    onChange={(e) => {
                                                                        handleInputChange(e.target.value, index, "notes")
                                                                    }}
                                                                    onBlur={(e) => {

                                                                        handleInputChange(e.target.value, index, "notes");
                                                                    }}
                                                                />
                                                            </td>

                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    )
}























