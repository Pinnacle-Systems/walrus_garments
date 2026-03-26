import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetSocksMaterialQuery,
    useGetSocksMaterialByIdQuery,
    useAddSocksMaterialMutation,
    useUpdateSocksMaterialMutation,
    useDeleteSocksMaterialMutation,
} from "../../redux/uniformService/SocksMaterialMasterService";
import FormReport from "../../Basic/components/FormReportTemplate";

import { toast } from "react-toastify";

import ReportTemplate from "../../Basic/components/ReportTemplate";
import FormHeader from "../../Basic/components/FormHeader";
import { useAddSocksTypeMutation, useDeleteSocksTypeMutation, useGetSocksTypeByIdQuery, useGetSocksTypeQuery, useUpdateSocksTypeMutation } from "../../redux/uniformService/SocksTypeMasterService";
import { Check, Plus, Power } from 'lucide-react';

import { push } from "../../redux/features/opentabs";
import { TextInput, CheckBox, ToggleButton, ReusableTable } from "../../Inputs";
import MastersForm from "../../Basic/components/MastersForm/MastersForm";
import Mastertable from "../../Basic/components/MasterTable/Mastertable";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { statusDropdown } from "../../Utils/DropdownData";
import setOpenPartyModal from "../../redux/features/opentabs";
import Modal from "../../UiComponents/Modal";
import Swal from "sweetalert2";
// import Modal from "../../UiComponents/Modal";



const MODEL = "Socks Type";

export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [accessory, setAccessory] = useState(false)
    const [active, setActive] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);
    const formRef = useRef(null);


    const [errors, setErrors] = useState({});
    const openPartyModal = useSelector((state) => state.party.openPartyModal);
    const dispatch = useDispatch();
    const lastTapName = useSelector((state) => state.party.lastTab)

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: allData, isLoading, isFetching } = useGetSocksTypeQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetSocksTypeByIdQuery(id, { skip: !id });


    const [addData] = useAddSocksTypeMutation();
    const [updateData] = useUpdateSocksTypeMutation();
    const [removeData] = useDeleteSocksTypeMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            // if (id) setReadOnly(true);
            setName(data?.name ? data.name : "");
            // setAccessory(data?.isAccessory ? data.isAccessory : false);
            setActive(id ? (data?.active ? data.active : false) : true);
        },
        [id]
    );

    console.log(id, "id")

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    useEffect(() => {
        if (form && formRef.current) {
            const firstInput = formRef.current.querySelector('input');
            if (firstInput) firstInput.focus();
        }
    }, [form]);

    const data = {
        id, name,
        // accessory,
        active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
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
            setId(returnData?.data?.id)
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






    const handleNameChange = (val) => setName(val ? val.charAt(0).toUpperCase() + val.slice(1) : val);

    const saveData = (nextProcess) => {
        if (!validateData(data)) {
            Swal.fire({
                title: "Please fill all required fields...!",
                icon: "success",

            });
            return;
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
                await removeData(id)
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
            header: "Socks Type",
            accessor: (item) => item?.name,
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

    return (

        <>
            {/* <div
                onKeyDown={handleKeyDown}

            >
                <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                    <h5 className='my-1'>Socks Type</h5>
                    <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setForm(true);
                              onNew();
                            }}
                            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                          >
                            <Plus size={16} />
                            Add New Sock Type 
                          </button>
                  
                        </div>
                </div>
                <div className='w-full flex items-start'>
                    <Mastertable
                        header={'Socks Material list'}
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        onDataClick={onDataClick}
                        // setOpenTable={setOpenTable}
                        deleteData={deleteData}
                        setForm={setForm}
                        tableHeaders={tableHeaders}
                        tableDataNames={tableDataNames}
                        setReadOnly={setReadOnly}
                        data={allData?.data}
                        loading={
                            isLoading || isFetching
                        } />
                        

                    <div>





                         {form && (
                            <Modal
                                isOpen={form}
                                form={form}
                                widthClass={"w-[30%] max-w-6xl h-[50vh]"}
                                onClose={() => {
                                setForm(false);
                                setErrors({});
                                }}
                            >
                                <div className="h-full flex flex-col bg-[f1f1f0]">
                                <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
                                    <div className="flex items-center gap-2">
                                    <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                                        {id ? (!readOnly ? "Edit Sock Type " : " Sock Type Master") : "Add New Sock Type "}
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
                                                <div className="flex flex-wrap justify-between">
                                                    <div className='mb-3 w-[48%]'>
                                                        <TextInput name="Measurement" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
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
                </div>


            </div> */}
            <div onKeyDown={handleKeyDown} className="p-1">
                <div className="w-full flex bg-white p-1 justify-between  items-center">
                    <h5 className="text-2xl font-bold text-gray-800">Shocks Type Master</h5>
                    <div className="flex items-center">
                        <button
                            onClick={() => {
                                setForm(true);
                                onNew();
                            }}
                            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                        >
                            + Add New Shocks Type
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
                            widthClass={"w-[36%] h-[50%]"}
                            onClose={() => {
                                setForm(false);
                            }}
                        >
                            <div className="h-full flex flex-col bg-gray-200  ">
                                <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                                            {id
                                                ? !readOnly
                                                    ? "Edit Shocks Type "
                                                    : "Shocks Type Master"
                                                : "Add New Shocks Type"}
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
                                                    className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600
                                                                border border-green-600 flex items-center gap-1 text-xs"
                                                >
                                                    <Check size={14} />
                                                    {id ? "Update" : "Save & close"}
                                                </button>
                                            )}
                                            {(!readOnly && !id) && (
                                                <button type="button" onClick={() => saveData("new")}
                                                    className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 border border-green-600 flex items-center gap-1 text-xs">
                                                    <Check size={14} />Save & New
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
                                                        <fieldset ref={formRef} className=' rounded mt-2'>
                                                            <div className='mb-5'>
                                                                <TextInput name="Name" type="text" value={name} setValue={handleNameChange} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                            </div>



                                                            <div className='mb-5'>
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
        </>

    );
}




























