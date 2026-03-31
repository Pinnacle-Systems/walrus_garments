import React, { useCallback, useEffect, useRef, useState } from 'react'

import secureLocalStorage from 'react-secure-storage';
import toast from 'react-hot-toast';
import { useAddCountsMasterMutation, useDeleteCountsMasterMutation, useGetCountsMasterByIdQuery, useGetCountsMasterQuery, useUpdateCountsMasterMutation } from '../../redux/uniformService/CountsMasterServices';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import { ReusableTable, TextArea, TextInput, TextInputNew, TextInputNew1, ToggleButton } from '../../Inputs';
import { statusDropdown } from '../../Utils/DropdownData';
import { Check, Plus, Power, Trash2, Paperclip } from 'lucide-react';
import Modal from '../../UiComponents/Modal';
import Swal from 'sweetalert2';
import { useAddTermsandCondtionsMutation, useDeleteTermsandCondtionsMutation, useGetTermsandCondtionsByIdQuery, useGetTermsandCondtionsQuery, useUpdateTermsandCondtionsMutation } from '../../redux/services/Term&ConditionsMasterService';

const MODEL = "Counts Master"

export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [active, setActive] = useState(true);
    const [errors, setErrors] = useState({})
    const [termsAndCondition, setTermsAndCondition] = useState("")
    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);


    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: allData, isLoading, isFetching } = useGetTermsandCondtionsQuery({ params, searchParams: searchValue });

    console.log(allData, "data")

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetTermsandCondtionsByIdQuery(id, { skip: !id });


    const [addData] = useAddTermsandCondtionsMutation();
    const [updateData] = useUpdateTermsandCondtionsMutation();
    const [removeData] = useDeleteTermsandCondtionsMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setName("");
                setActive(id ? (data?.active) : true);
                setTermsAndCondition(data?.termsAndCondition ? data?.termsAndCondition : '')


            } else {
                // setReadOnly(true);
                setName(data?.name || "");
                setActive(id ? (data?.active ?? false) : true);
                setTermsAndCondition(data?.termsAndCondition ? data?.termsAndCondition : '')
            }
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, termsAndCondition, active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"),
        name
    }

    const validateData = (data) => {
        if (data.termsAndCondition && data.name) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            let returnData = await callback(data).unwrap();
            // toast.success(text + "Successfully");
            Swal.fire({
                title: text + "  " + "Successfully",
                icon: "success",

            });
            if (nextProcess == "new") {
                syncFormWithDb(undefined)
                onNew()
            } else {
                setForm(false)
            }
            setId("")

        } catch (error) {
            console.log("handle");
        }
    };

    const saveData = (nextProcess) => {
        if (!validateData(data)) {

            Swal.fire({
                title: "Please fill all required fields...!",
                icon: "success",

            });
            return;
        }
        let foundItem;
        if (id) {
            foundItem = allData?.data?.filter(i => i.id != id)?.some(item => item.name === name);
        } else {
            foundItem = allData?.data?.some(item => item.name === name);

        }


        if (foundItem) {
            Swal.fire({
                text: "The Terms & Condtions  already exists.",
                icon: "warning",
                showConfirmButton: false,
            });
            return false;
        }
        if (id) {
            if (!window.confirm("Are you sure update the details ...?")) {
                return;
            }
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated", nextProcess);
        } else {
            handleSubmitCustom(addData, data, "Added", nextProcess);
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
        } else {

        }
    };

    const onNew = () => {
        setId("");
        setForm(true);
        setTermsAndCondition("")
        setSearchValue("");
        syncFormWithDb(undefined)
        setReadOnly(false);
        setPendingFile(null);
        setAttachments([]);
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
            header: "Name",
            accessor: (item) => item?.name,
            //   cellClass: () => "font-medium  text-gray-900",
            className: "font-medium text-gray-900 text-left uppercase w-[200px]",
        },
        {
            header: "Terms & conditions",
            accessor: (item) => item?.termsAndCondition,
            //   cellClass: () => "font-medium  text-gray-900",
            className: "font-medium text-gray-900 text-left uppercase w-[600px]",
        },

        {
            header: "Status",
            accessor: (item) => (item.active ? ACTIVE : INACTIVE),
            //   cellClass: () => "font-medium text-gray-900",
            className: "font-medium text-gray-900 text-center uppercase w-16",
        },




    ];

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

    const firstInputFocus = useRef(null);
    const formRef = useRef(null);

    const [pendingFile, setPendingFile] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);
    const attachInputRef = useRef(null);
    const addBtnRef = useRef(null);
    const deleteBtnRefs = useRef([]);
    const saveNewBtnRef = useRef(null);
    const saveCloseBtnRef = useRef(null);

    useEffect(() => {
        if (form && firstInputFocus.current) {
            firstInputFocus.current.focus();
        }
    }, [form]);

    useEffect(() => {
        if (form && formRef.current) {
            const firstInput = formRef.current.querySelector('input');
            if (firstInput) firstInput.focus();
        }
    }, [form]);

    const handleNameChange = (val) => setName(val ? val.charAt(0).toUpperCase() + val.slice(1) : val);

    return (

        <div
            // onKeyDown={handleKeyDown}
            className="p-1 h-[90%]">
            <div className="w-full flex bg-white p-1 justify-between  items-center">
                <h5 className="text-2xl font-bold text-gray-800">Terms & Conditions Master</h5>
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            setForm(true);
                            onNew();
                        }}
                        className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                    >
                        + Add New Terms & Conditions
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
                        widthClass={"w-[40%] h-[60%]"}
                        onClose={() => {
                            setForm(false);
                            setErrors({});
                        }}
                    >
                        <div className="h-full flex flex-col bg-gray-200">
                            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                                        {id
                                            ? !readOnly
                                                ? "Edit Terms & Conditions Master"
                                                : "Terms & Conditions Master"
                                            : "Add New Terms & Conditions"}
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
                                                ref={saveCloseBtnRef}
                                                type="button"
                                                onClick={() => { saveData("close") }}
                                                className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600
                                                border border-blue-600 flex items-center gap-1 text-xs"
                                            >
                                                <Check size={14} />
                                                {id ? "Update" : "Save & close"}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {(!readOnly && !id) && (
                                            <button
                                                ref={saveNewBtnRef}
                                                type="button"
                                                onClick={() => { saveData("new") }}
                                                className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600
                                                border border-green-600 flex items-center gap-1 text-xs"
                                            >
                                                <Check size={14} />
                                                {"Save & New"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-3">
                                <div className="grid grid-cols-1   h-full">
                                    <div className="lg:col-span-1 space-y-3">
                                        <div ref={formRef} className="bg-white p-3 rounded-md border border-gray-200 h-full grid grid-cols-2">


                                            <div className="">
                                                <TextInputNew1 name="Name" type="text" value={name} setValue={handleNameChange} required={true} readOnly={readOnly} ref={firstInputFocus} />

                                            </div>
                                            <div className='  flex   col-span-2 flex-col'>
                                                <label className='block text-xs font-bold text-gray-600 mt-3 mb-2'>Terms And Condition  <span className="text-red-500">*</span></label>
                                                <textarea
                                                    className="w-96 h-28 overflow-auto p-2 text-xs border border-gray-300 rounded-lg
  focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
  transition-all duration-150 shadow-sm"

                                                    value={termsAndCondition}
                                                    disabled={readOnly}
                                                    onChange={(e) => setTermsAndCondition(e.target.value)}

                                                    onKeyDown={(e) => {
                                                        if (e.ctrlKey && e.key === "Enter") {
                                                            e.preventDefault();

                                                            const textarea = e.target;
                                                            const start = textarea.selectionStart;
                                                            const end = textarea.selectionEnd;

                                                            const newValue =
                                                                termsAndCondition.substring(0, start) +
                                                                "\n" +
                                                                termsAndCondition.substring(end);

                                                            setTermsAndCondition(newValue);

                                                            // Move cursor after new line
                                                            setTimeout(() => {
                                                                textarea.selectionStart = textarea.selectionEnd = start + 1;
                                                            }, 0);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className='mt-5'>
                                                <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                                            </div>

                                            {/* Attachments Section */}
                                            <div className="col-span-2 mt-4">
                                                <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                                                    <Paperclip size={12} /> Attachments
                                                </label>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    disabled={readOnly}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setPendingFile(file);
                                                            setTimeout(() => addBtnRef.current?.focus(), 0);
                                                        }
                                                        e.target.value = "";
                                                    }}
                                                />
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        ref={attachInputRef}
                                                        type="button"
                                                        disabled={readOnly}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                fileInputRef.current?.click();
                                                            }
                                                        }}
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className={`flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-left
                                                            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                                                            transition-all duration-150 shadow-sm
                                                            ${readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white hover:border-gray-400 cursor-pointer"}`}
                                                    >
                                                        {pendingFile ? (
                                                            <span className="text-gray-800">{pendingFile.name}</span>
                                                        ) : (
                                                            <span className="text-gray-400">Click or press Enter to browse file...</span>
                                                        )}
                                                    </button>
                                                    <button
                                                        ref={addBtnRef}
                                                        type="button"
                                                        disabled={readOnly || !pendingFile}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                if (!pendingFile) return;
                                                                const newList = [...attachments, pendingFile];
                                                                setAttachments(newList);
                                                                setPendingFile(null);
                                                                setTimeout(() => {
                                                                    const lastIdx = newList.length - 1;
                                                                    deleteBtnRefs.current[lastIdx]?.focus();
                                                                }, 0);
                                                            }
                                                        }}
                                                        onClick={() => {
                                                            if (!pendingFile) return;
                                                            const newList = [...attachments, pendingFile];
                                                            setAttachments(newList);
                                                            setPendingFile(null);
                                                            setTimeout(() => {
                                                                const lastIdx = newList.length - 1;
                                                                deleteBtnRefs.current[lastIdx]?.focus();
                                                            }, 0);
                                                        }}
                                                        className={`p-1.5 rounded-lg border text-xs flex items-center justify-center
                                                            ${readOnly || !pendingFile
                                                                ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                                                                : "border-green-500 text-green-600 hover:bg-green-600 hover:text-white cursor-pointer"}`}
                                                        title="Add attachment"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                {attachments.length > 0 && (
                                                    <ul className="mt-2 space-y-1">
                                                        {attachments.map((file, idx) => (
                                                            <li key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs">
                                                                <span className="text-gray-700 truncate flex-1">{file.name}</span>
                                                                <button
                                                                    ref={(el) => (deleteBtnRefs.current[idx] = el)}
                                                                    type="button"
                                                                    disabled={readOnly}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === "Enter") {
                                                                            e.preventDefault();
                                                                            const newList = attachments.filter((_, i) => i !== idx);
                                                                            setAttachments(newList);
                                                                            setTimeout(() => {
                                                                                if (newList.length > 0) {
                                                                                    deleteBtnRefs.current[Math.min(idx, newList.length - 1)]?.focus();
                                                                                } else {
                                                                                    (saveNewBtnRef.current || saveCloseBtnRef.current)?.focus();
                                                                                }
                                                                            }, 0);
                                                                        } else if (e.key === "Tab" && !e.shiftKey && idx === attachments.length - 1) {
                                                                            e.preventDefault();
                                                                            (saveNewBtnRef.current || saveCloseBtnRef.current)?.focus();
                                                                        }
                                                                    }}
                                                                    onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                                                                    className={`ml-2 p-0.5 rounded text-red-500 hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-400 ${readOnly ? "opacity-30 cursor-not-allowed" : ""}`}
                                                                    title="Remove"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
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

