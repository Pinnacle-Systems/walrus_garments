import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetgsmQuery,
    useGetgsmByIdQuery,
    useAddgsmMutation,
    useUpdategsmMutation,
    useDeletegsmMutation,
} from "../../../redux/uniformService/GsmMasterServices";
import { toast } from "react-toastify";
import { TextInput, CheckBox, ReusableTable, ToggleButton } from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";
import { Check, Power } from "lucide-react";
import Modal from "../../../UiComponents/Modal";
import Swal from "sweetalert2";
import MasterPageLayout from "../../../Basic/components/MasterPageLayout";

const MODEL = "Gsm Master";

export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [active, setActive] = useState(true);

    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: allData, isLoading, isFetching } = useGetgsmQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetgsmByIdQuery(id, { skip: !id });

    const [addData] = useAddgsmMutation();
    const [updateData] = useUpdategsmMutation();
    const [removeData] = useDeletegsmMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (id) setReadOnly(true);
            setName(data?.name ? data.name : "");
            setActive(id ? (data?.active ? data.active : false) : true);
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, name, active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    }

    const validateData = (data) => {
        if (data.name) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            let returnData = await callback(data).unwrap();
            Swal.fire({
                title: text + "  " + "Successfully",
                icon: "success",
            });
            if (nextProcess === "new") {
                syncFormWithDb(undefined);
                onNew();
            } else {
                setForm(false);
            }
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
                text: "The Gsm Name already exists.",
                icon: "warning",
                showConfirmButton: false,
            });
            return false;
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return;
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
                await removeData(id);
                setId("");
                Swal.fire({
                    title: "Deleted" + "  " + "Successfully",
                    icon: "success",
                });
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
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }

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

    const handleNameChange = (val) => setName(val ? val.charAt(0).toUpperCase() + val.slice(1) : val);

    const formRef = useRef(null);

    useEffect(() => {
        if (form && formRef.current) {
            const firstInput = formRef.current.querySelector('input');
            if (firstInput) firstInput.focus();
        }
    }, [form]);

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
            header: "Gsm",
            accessor: (item) => item?.name,
            className: "font-medium text-gray-900 text-left uppercase w-48",
        },
        {
            header: "Status",
            accessor: (item) => (item.active ? ACTIVE : INACTIVE),
            className: "font-medium text-gray-900 text-center uppercase w-16",
        },
    ];

    return (
        <MasterPageLayout
            title="Gsm Master"
            addButtonLabel="+ Add New Gsm"
            onAdd={() => {
                setForm(true);
                onNew();
            }}
            onKeyDown={handleKeyDown}
        >
                <ReusableTable
                    columns={columns}
                    data={allData?.data}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={deleteData}
                    itemsPerPage={10}
                />

            <div>
                {form === true && (
                    <Modal
                        isOpen={form}
                        form={form}
                        widthClass={"w-[40%] h-[40%]"}
                        onClose={() => {
                            setForm(false);
                        }}
                    >
                        <div className="h-full flex flex-col bg-gray-200">
                            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                                        {id
                                            ? !readOnly
                                                ? "Edit Gsm Master"
                                                : "Gsm Master"
                                            : "Add New Gsm"}
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
                                                onClick={() => saveData("close")}
                                                className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 border border-blue-600 flex items-center gap-1 text-xs"
                                            >
                                                <Check size={14} />
                                                {id ? "Update" : "Save & close"}
                                            </button>
                                        )}
                                    </div>
                                    {(!readOnly && !id) && (
                                        <button
                                            type="button"
                                            onClick={() => saveData("new")}
                                            className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 border border-green-600 flex items-center gap-1 text-xs"
                                        >
                                            <Check size={14} />Save & New
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-3">
                                <div className="grid grid-cols-1 gap-3 h-full">
                                    <div className="lg:col-span-2 space-y-3">
                                        <div className="bg-white p-3 rounded-md border border-gray-200 h-full" ref={formRef}>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-3 h-full">
                                                    <fieldset className="">
                                                        <div className="mb-5">
                                                            <TextInput name="Gsm" type="text" value={name} setValue={handleNameChange} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                        </div>
                                                        <div>
                                                            <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} disabled={childRecord.current > 0} />
                                                        </div>
                                                    </fieldset>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </MasterPageLayout>
    );
}
