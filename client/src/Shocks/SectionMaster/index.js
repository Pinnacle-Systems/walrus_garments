import { useCallback, useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { useAddSectionMasterMutation, useDeleteSectionMasterMutation, useGetSectionMasterByIdQuery, useGetSectionMasterQuery, useUpdateSectionMasterMutation } from "../../redux/uniformService/SectionMasterService";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Check, Power } from "lucide-react";
import { ReusableTable, TextInputNew1, ToggleButton } from "../../Inputs";
import Modal from "../../UiComponents/Modal";
import { statusDropdown } from "../../Utils/DropdownData";


const MODEL = "Size Master"
export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [accessory, setAccessory] = useState(false)
    const [active, setActive] = useState(false);
    const [errors, setErrors] = useState({});


    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);



    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };

    console.log(params, "params")

    const { data: allData, isLoading, isFetching } = useGetSectionMasterQuery({ params, searchParams: searchValue });

    console.log(allData, "datatat")

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetSectionMasterByIdQuery(id, { skip: !id });


    const [addData] = useAddSectionMasterMutation();
    const [updateData] = useUpdateSectionMasterMutation();
    const [removeData] = useDeleteSectionMasterMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setName("");
                // setAccessory(data?.isAccessory || false);
                setActive(id ? (data?.active) : true);

            } else {
                // setReadOnly(true);
                setName(data?.name || "");
                // setAccessory(data?.isAccessory || false);
                setActive(id ? (data?.active ?? false) : true);
            }
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, name, accessory, active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
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
            foundItem = allData?.data?.filter(i => i.id != id)?.some(item => item?.name?.trim() == name?.trim());
        } else {
            foundItem = allData?.data?.some(item => item?.name?.trim() == name?.trim());

        }
        if (foundItem) {
            Swal.fire({
                text: "The Sections name is already exists.",
                icon: "warning",
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
        }
    };

    const onNew = () => {
        setId("");
        setForm(true);
        setSearchValue("");
        syncFormWithDb(undefined)
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
        console.log("view");
    };
    const handleEdit = (id) => {
        setId(id);
        setForm(true);
        setReadOnly(false);
        console.log("Edit");
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
            header: "Section Name",
            accessor: (item) => item?.name,
            //   cellClass: () => "font-medium  text-gray-900",
            className: "font-medium text-gray-900 text-left uppercase w-72",
        },

        {
            header: "Status",
            accessor: (item) => (item.active ? ACTIVE : INACTIVE),
            //   cellClass: () => "font-medium text-gray-900",
            className: "font-medium text-gray-900 text-center uppercase w-16",
        },

    ];


    const firstInputFocus = useRef(null);

    useEffect(() => {
        if (form && firstInputFocus.current) {
            firstInputFocus.current.focus();
        }
    }, [form]);


    return (

        <div onKeyDown={handleKeyDown} className="p-1">
            <div className="w-full flex bg-white p-1 justify-between  items-center">
                <h5 className="text-2xl font-bold text-gray-800">Section Master</h5>
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            setForm(true);
                            onNew();
                        }}
                        className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                    >
                        + Add New Section
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
                <ReusableTable
                    columns={columns}
                    data={allData?.data}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={deleteData}
                    itemsPerPage={10}
                />
            </div>

            <div>
                {form === true && (
                    <Modal
                        isOpen={form}
                        form={form}
                        widthClass={"w-[40%] h-[40%]"}
                        onClose={() => {
                            setForm(false);
                            setErrors({});
                        }}
                    >
                        <div className="h-full flex flex-col bg-gray-200 ">
                            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                                        {id
                                            ? !readOnly
                                                ? "Edit Section Master"
                                                : "Section  Master"
                                            : "Add New Section  "}
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
                                                onClick={() => {
                                                    saveData("close")
                                                }}
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
                                                <div className="grid grid-cols-2  gap-3  h-full">
                                                    <fieldset className=' rounded mt-2'>
                                                        <div className='mb-3'>
                                                            <TextInputNew1 name="Section Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)}
                                                                ref={firstInputFocus}
                                                            />
                                                        </div>



                                                        <div className='mt-5'>
                                                            <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
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
            </div >
        </div >
    )
}

