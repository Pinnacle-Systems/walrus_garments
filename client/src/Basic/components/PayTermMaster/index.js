import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetPaytermMasterQuery,
    useGetPaytermMasterByIdQuery,
    useAddPaytermMasterMutation,
    useUpdatePaytermMasterMutation,
    useDeletePaytermMasterMutation,
} from "../../../redux/services/PayTermMasterServices";

import { toast } from "react-toastify";
import { TextInput,  ToggleButton } from "../../../Inputs";
import MastersForm from "../MastersForm/MastersForm";
import Mastertable from "../MasterTable/Mastertable";
import { statusDropdown } from "../../../Utils/DropdownData";
import Swal from "sweetalert2";
import "../../../../src/swapStyle.css";
import { Check, Plus } from "lucide-react";
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
                setReadOnly(false);
                setName("");
                setdays("");
                setActive(id ? (data?.active) : true);

                return
            } else {
                // setReadOnly(true);
                setName(data?.name ? data.name : "");
                setdays(data?.days ? data.days : "");
                setActive(id ? (data?.active ?? false) : true);
                setAliasName(data?.aliasName ? data?.aliasName : "")
            }
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, aliasName, name, days, active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    }

    const validateData = (data) => {
        if (data.name && data.days) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData?.data?.id)
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
            // toast.success(text + "Successfully");

        } catch (error) {
            console.log("handle");
        }
    };

    const saveData = () => {
        if (!validateData(data)) {
            toast.error("Please fill all required fields...!", {
                position: "top-center",
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

    const deleteData = async () => {
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
                setForm(false);
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


    useEffect(() => {
        if (id) return

        setAliasName(` ${days} ${" "} ${name} `);
    }, [name, days])


    const tableHeaders = [
        "S.NO", "Days", "Name", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "
    ]
    const tableDataNames = ["index+1", "dataObj.days", "dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    return (
        <div onKeyDown={handleKeyDown}>
            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Pay Term Master</h5>
                  <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setForm(true);
                              onNew();
                            }}
                            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                          >
                            <Plus size={16} />
                            Add Pay Term 
                          </button>
                  
                        </div>
            </div>
            <div className='w-full flex items-start'>
                <Mastertable
                    header={'Pay Term list'}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    // setOpenTable={setOpenTable}
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                    tableHeaders={tableHeaders}
                    tableDataNames={tableDataNames}
                    data={allData?.data}
                    loading={
                        isLoading || isFetching
                    } />
            </div>
            {/* {form === true && <Modal isOpen={form} form={form} widthClass={"w-[50%] h-[40%]"} onClose={() => { setForm(false); setErrors({}); }}>
                <MastersForm
                    onNew={onNew}
                    onClose={() => {
                        setForm(false);
                        setSearchValue("");
                        setId(false);
                    }}
                    model={MODEL}
                    childRecord={childRecord.current}
                    saveData={saveData}
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                    readOnly={readOnly}
                    emptyErrors={() => setErrors({})}
                >
                    <fieldset className=' rounded mt-2'>
                        <div className=''>
                            <div className="grid grid-cols-3 gap-x-5 ">
                                <div className='mb-3'>
                                    <TextInput name="Days" width={'w-[200px]'} type="number" value={days} setValue={setdays} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>
                                <div className='mb-3 '>
                                    <TextInput name="Pay Term" width={'w-[200px]'} type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>

                                <div className='mb-3 '>
                                    <TextInput name="AliasName" width={'w-[200px]'} type="text" value={aliasName} setValue={setAliasName} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>{console.log(aliasName, "aliasnameee")}

                            </div>

                            <div className='mb-5'>
                                <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                            </div>

                        </div>
                    </fieldset>
                </MastersForm>
            </Modal>} */}
   {form && (
                            <Modal
                                isOpen={form}
                                form={form}
                                widthClass={"w-[50%] max-w-6xl h-[60vh]"}
                                onClose={() => {
                                setForm(false);
                                setErrors({});
                                }}
                            >
                                <div className="h-full flex flex-col bg-[f1f1f0]">
                                <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
                                    <div className="flex items-center gap-2">
                                    <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                                        {id ? (!readOnly ? "Edit Pay Term  " : "Pay Term Master") : "Add New  Pay Term "}
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

                                <div className="flex-1 overflow-auto p-3">
                                    <div className="grid grid-cols-1  gap-3  h-full">
                                    <div className="lg:col-span- space-y-3">
                                        <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                                        
                                        <fieldset className=' rounded mt-2'>
                                                     <div className=''>
                            <div className="grid grid-cols-3 gap-x-5 ">
                                <div className='mb-3'>
                                    <TextInput name="Days" width={'w-[200px]'} type="number" value={days} setValue={setdays} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>
                                <div className='mb-3 '>
                                    <TextInput name="Pay Term" width={'w-[200px]'} type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>

                                <div className='mb-3 '>
                                    <TextInput name="AliasName" width={'w-[200px]'} type="text" value={aliasName} setValue={setAliasName} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>

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


                                </div>



                            </Modal>
                            )}
        </div>
    )
}

