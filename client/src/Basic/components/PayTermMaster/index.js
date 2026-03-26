import { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetPaytermMasterQuery,
    useGetPaytermMasterByIdQuery,
    useAddPaytermMasterMutation,
    useUpdatePaytermMasterMutation,
    useDeletePaytermMasterMutation,
} from "../../../redux/services/PayTermMasterServices";

import { toast } from "react-toastify";
import { ReusableTable, TextInput, TextInputNew1, ToggleButton } from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";
import Swal from "sweetalert2";
import "../../../../src/swapStyle.css";
import { Check, Power } from "lucide-react";
import Modal from "../../../UiComponents/Modal";
const MODEL = "Pay Term Master";

export default function Form() {
    const [form, setForm] = useState(false);

    // const [openTable, setOpenTable] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [days, setdays] = useState("");
    const [active, setActive] = useState(true);
    const [errors, setErrors] = useState({});
    const [aliasName, setAliasName] = useState("")

    const [searchValue, setSearchValue] = useState("");
    const nameRef = useRef(null);
    const formRef = useRef(null);
    const childRecord = useRef(0);


    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: allData, isLoading, isFetching } = useGetPaytermMasterQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetPaytermMasterByIdQuery(id, { skip: !id });


    const [addData] = useAddPaytermMasterMutation();
    const [updateData] = useUpdatePaytermMasterMutation();
    const [removeData] = useDeletePaytermMasterMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setName("");
                setdays("");
                setActive(true);
                childRecord.current = 0;

                return
            } else {
                // setReadOnly(true);
                setName(data?.name ? data.name : "");
                setdays(data?.days ? data.days : "");
                setActive(id ? (data?.active ?? false) : true);
                setAliasName(data?.aliasName ? data?.aliasName : "")
                childRecord.current = data?.childRecord ? data?.childRecord : 0;
            }
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, aliasName: aliasName.trim(), name, days, active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    }

    const validateData = (data) => {
        if (data.name && data.days) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData?.data?.id)
            await Swal.fire({
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
            await Swal.fire({
                icon: 'error',
                title: 'Submission error',
                text: error.data?.message || 'Something went wrong!',
            });
            nameRef.current?.focus();
        }
    };

    const saveData = (nextProcess) => {
        const upperName = name.toUpperCase();
        const upperAlias = aliasName.toUpperCase();

        const finalData = {
            ...data,
            name: upperName,
            aliasName: upperAlias
        };

        if (!validateData(finalData)) {
            Swal.fire({
                title: "Please fill all required fields...!",
                icon: "error",
            });
            nameRef.current?.focus();
            return;
        }
        let foundItem;
        if (id) {
            foundItem = allData?.data?.filter(i => i.id != id)?.some(item => item?.aliasName?.trim().toUpperCase() == upperAlias.trim());
        } else {
            foundItem = allData?.data?.some(item => item?.aliasName?.trim().toUpperCase() == upperAlias.trim());

        }
        if (foundItem) {
            Swal.fire({
                text: "The PayTerm already exists.",
                icon: "warning",
            });
            nameRef.current?.focus();
            return false;
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return;
        }
        if (id) {
            handleSubmitCustom(updateData, finalData, "Updated", nextProcess);
        } else {
            handleSubmitCustom(addData, finalData, "Added", nextProcess);
        }
    };

    console.log(allData?.data, "alldata")

    const deleteData = async (id) => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                let deldata = await removeData(id).unwrap();

                if (deldata?.statusCode == 1) {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Submission error',
                        text: deldata?.message || 'Something went wrong!',
                    });
                    return
                }
                setId("");
                await Swal.fire({
                    title: "Deleted Successfully",
                    icon: "success",
                });
                setForm(false);
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Submission error',
                    text: error.data?.message || 'Something went wrong!',
                });
                setForm(false);
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
        setTimeout(() => {
            nameRef.current?.focus();
        }, 100);
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }


    useEffect(() => {
        // if (id) return

        setAliasName(` ${days}${" "}${name}`);
    }, [name, days])


    const tableHeaders = [
        "S.NO", "Days", "Name", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "
    ]
    const tableDataNames = ["index+1", "dataObj.days", "dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]

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
            header: "Pay Term",
            accessor: (item) => item?.aliasName,
            //   cellClass: () => "font-medium  text-gray-900",
            className: "font-medium text-gray-900 text-left uppercase w-96",
        },

        {
            header: "Status",
            accessor: (item) => (item.active ? ACTIVE : INACTIVE),
            //   cellClass: () => "font-medium text-gray-900",
            className: "font-medium text-gray-900 text-center uppercase w-16",
        },

    ];


    useEffect(() => {
        if (form && nameRef.current) {
            nameRef.current.focus();
        }
    }, [form]);


    return (

        <div onKeyDown={handleKeyDown} className="p-1">
            <div className="w-full flex bg-white p-1 justify-between  items-center">
                <h5 className="text-2xl font-bold text-gray-800">Pay Term  Master</h5>
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            setForm(true);
                            onNew();
                        }}
                        className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-3 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                    >
                        + Add New Pay Term
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
                        widthClass={"w-[40%] h-[45%]"}
                        onClose={() => {
                            setForm(false);
                            setErrors({});
                        }}
                    >
                        <div className="h-full flex flex-col bg-gray-200 ">
                            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg  font-semibold  text-gray-800">
                                        {id
                                            ? !readOnly
                                                ? "Edit Pay Term  Master"
                                                : "Pay Term  Master"
                                            : "Add New Pay Term "}
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
                                    <div className="lg:col-span-2 ">
                                        <div className="bg-white p-3 rounded-md border border-gray-200 h-full" ref={formRef}>
                                            <div className="">
                                                <div className="grid grid-cols-2  gap-3 ">

                                                    <div className='mb-3'>
                                                        <TextInputNew1 name="Days" type="number" required={true} value={days} setValue={setdays} readOnly={readOnly} disabled={(childRecord.current > 0)}
                                                            ref={nameRef}
                                                        />
                                                    </div>
                                                    <div className='mb-3 '>
                                                        <TextInputNew1 name="Pay Term" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                    </div>

                                                    <div className='mb-3 '>
                                                        <TextInput name="AliasName" type="text" value={aliasName} setValue={setAliasName} readOnly={readOnly} disabled={(childRecord.current > 0) || true} />
                                                    </div>


                                                    <div className='mb-5'>
                                                        <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                                                    </div>

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

