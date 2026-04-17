import { useCallback, useEffect, useRef, useState } from 'react'

import secureLocalStorage from 'react-secure-storage';
import {
    useAddSizeMasterMutation,
    useDeleteSizeMasterMutation,
    useGetSizeMasterByIdQuery,
    useGetSizeMasterQuery,
    useUpdateSizeMasterMutation
} from '../../../redux/uniformService/SizeMasterService';
import toast from 'react-hot-toast';
import { childRecordCountTotal, ReusableTable, TextInput, TextInputNew1, ToggleButton } from '../../../Inputs';
import { statusDropdown } from '../../../Utils/DropdownData';
import { Check, Power } from 'lucide-react';
import Modal from '../../../UiComponents/Modal';
import Swal from 'sweetalert2';
import useInvalidateTags from '../../../CustomHooks/useInvalidateTags';
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import MasterPageLayout from "../MasterPageLayout";



const MODEL = "Size Master"
export default function Form({ onSuccess, onClose, editId, deleteId, deleteLabel } = {}) {
    const [form, setForm] = useState(onSuccess ? true : false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState(editId || deleteId || "");
    const [name, setName] = useState("");
    const [accessory, setAccessory] = useState(false)
    const [active, setActive] = useState(false);
    const [errors, setErrors] = useState({});
    const [childRecord, setChildRecord] = useState(0);
    const [code, setCode] = useState("");


    // const nameRef = useRef(null);
    const formRef = useRef(null);



    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };


    const { data: allData, isLoading, isFetching } = useGetSizeMasterQuery({ params });



    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetSizeMasterByIdQuery(id, { skip: !id });


    const [addData] = useAddSizeMasterMutation();
    const [updateData] = useUpdateSizeMasterMutation();
    const [removeData] = useDeleteSizeMasterMutation();
    const [dispatchInvalidate] = useInvalidateTags();

    const { refs, handlers, focusFirstInput } = useFormKeyboardNavigation();
    const {
        firstInputRef: nameRef,
        toggleButtonRef,
        saveCloseButtonRef,
        saveNewButtonRef,
    } = refs;


    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setName("");
                setActive(true);
                setCode("");
                setChildRecord(data?._count ? childRecordCountTotal(data?._count) : 0)

            } else {
                setName(data?.name || "");
                setActive(id ? (data?.active ?? false) : true);
                setCode(data?.code ? data?.code : "");
                setChildRecord(data?._count ? childRecordCountTotal(data?._count) : 0)
            }
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, name, accessory, active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"),
        code
    }

    const validateData = (data) => {
        if (data.name && data?.code) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            let returnData = await callback(data).unwrap();
            if (onSuccess) {
                onSuccess(returnData?.data);
                return;
            }
            dispatchInvalidate();
            await Swal.fire({
                title: text + "  " + "Successfully",
                icon: "success",
            });
            if (nextProcess == "new") {
                syncFormWithDb(undefined)
                onNew()
                nameRef.current?.focus();
            } else {
                setForm(false)
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                text: error.data?.message || 'Something went wrong!',
                didClose: () => {
                    nameRef?.current?.focus();
                }
            });
        }
    };

    const saveData = (nextProcess) => {
        const upperName = name.toUpperCase();

        const finalData = {
            ...data,
            name: upperName,
        };

        if (!validateData(finalData)) {
            Swal.fire({
                title: "Please fill all required fields...!",
                icon: "error",
                didClose: () => {
                    nameRef?.current?.focus();
                }
            });
            return;
        }

        if (code.length < 2) {
            Swal.fire({
                title: "Please enter 2 digit valid code...",
                icon: "error",
                didClose: () => {
                    codeRef?.current?.focus();
                }
            });
            return;
        }
        let foundItem;
        if (id) {
            foundItem = allData?.data?.filter(i => i.id != id)?.some(item => item?.name?.trim().toUpperCase() == upperName.trim() && item?.code?.trim() == code.trim());
        } else {
            foundItem = allData?.data?.some(item => item?.name?.trim().toUpperCase() == upperName.trim() && item?.code?.trim() == code.trim());

        }
        if (foundItem) {
            Swal.fire({
                text: "The Size Name and Code already exists.",
                icon: "warning",
                didClose: () => {
                    nameRef?.current?.focus();
                }
            });
            return false;
        }



        if (id) {
            if (!window.confirm("Are you sure update the details ...?")) {
                return;
            }
        }
        if (id) {
            handleSubmitCustom(updateData, finalData, "Updated", nextProcess);
        } else {
            handleSubmitCustom(addData, finalData, "Added", nextProcess);
        }
    };

    const deleteData = async (deleteId) => {
        if (!deleteId) return;
        if (!window.confirm("Are you sure to delete...?")) return;
        try {
            let deldata = await removeData(deleteId).unwrap();
            if (deldata?.statusCode == 1) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Submission error',
                    text: deldata?.message || 'Something went wrong!',
                });
                return
            }
            setId("");
            dispatchInvalidate();
            await Swal.fire({
                title: "Deleted Successfully",
                icon: "success",
            });
            if (onSuccess) {
                onSuccess();
            } else {
                setForm(false);
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Submission error',
                text: error.data?.message || 'Something went wrong!',
            });
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
        syncFormWithDb(undefined)
        setReadOnly(false);
        setTimeout(() => {
            nameRef.current?.focus();
        }, 100);
    };

    const handleView = (id) => {
        setId(id);
        setForm(true);
        setReadOnly(true);
    };
    const handleEdit = (id) => {
        setId(id);
        setForm(true);
        setReadOnly(false);
    };

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
            header: "Size",
            accessor: (item) => item?.name,
            className: "font-medium text-gray-900 text-left uppercase w-96",
        },

        {
            header: "Status",
            accessor: (item) => (item.active ? ACTIVE : INACTIVE),
            className: "font-medium text-gray-900 text-center uppercase w-16",
        },

    ];

    const handleNameChange = (val) => setName(val ? val.charAt(0).toUpperCase() + val.slice(1) : val);

    const formBody = (
        <div className="h-full flex flex-col bg-gray-200 ">
            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                        {id
                            ? !readOnly
                                ? "Edit Size Master"
                                : "Size  Master"
                            : "Add New Size  "}
                    </h2>
                </div>
                <div className="flex gap-2">
                    <div>
                        {readOnly && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (onClose) onClose();
                                    setForm(false);
                                    // setSearchValue("");
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
                                onClick={() => {
                                    saveData("close")
                                }}
                                ref={saveCloseButtonRef}
                                tabIndex={0}
                                onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
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
                                type="button"
                                onClick={() => {
                                    saveData("new")
                                }}
                                ref={saveNewButtonRef}
                                onKeyDown={handlers.handleSaveNewKeyDown(saveData)}
                                tabIndex={0}
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

            <div className="flex-1 overflow-auto p-3 ">
                <div className="grid grid-cols-1  gap-3  h-full ">
                    <div className="lg:col-span-2 space-y-3">
                        <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                            <div className="space-y-4 ">
                                <div className="grid grid-cols-2  gap-3  h-full" ref={formRef}>
                                    <div className=''>
                                        <TextInputNew1 name="Size" type="text" value={name} setValue={handleNameChange} required={true} readOnly={readOnly} disabled={(childRecord > 0)}
                                            ref={nameRef}
                                        />
                                    </div>
                                    <div className=''>
                                        <TextInputNew1 name="Code" type="text" value={code} setValue={setCode} required={true} readOnly={readOnly} disabled={(childRecord > 0)}
                                        />
                                    </div>



                                    <div className=''>
                                        <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly}
                                            onKeyDown={handlers.handleToggleKeyDown}
                                            ref={toggleButtonRef}
                                        />
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (deleteId) {
        const handleConfirmDelete = async () => {
            await deleteData(deleteId);
        };

        return (
            <div className="h-full flex flex-col bg-gray-200">
                <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                    <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">Delete Size</h2>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-white mx-3 mt-3 rounded">
                    <p className="text-sm text-gray-700 text-center">
                        Are you sure you want to delete <span className="font-semibold">"{deleteLabel}"</span>?
                    </p>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose}
                            className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded">
                            Cancel
                        </button>
                        <button type="button" onClick={handleConfirmDelete}
                            className="px-4 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (onSuccess) {
        return (
            <div onKeyDown={handleKeyDown} className="h-full">
                {formBody}
            </div>
        );
    }

    return (
        <MasterPageLayout
            title="Size Master"
            addButtonLabel="+ Add New Size"
            onAdd={onNew}
            onKeyDown={handleKeyDown}
        >
            <ReusableTable
                columns={columns}
                data={allData?.data}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={deleteData}
                itemsPerPage={15}
            />

            {form && (
                <Modal
                    isOpen={form}
                    form={form}
                    widthClass={"w-[40%] h-[40%]"}
                    onClose={() => {
                        setForm(false);
                        setErrors({});
                    }}
                >
                    {formBody}
                </Modal>
            )}
        </MasterPageLayout>
    )
}

