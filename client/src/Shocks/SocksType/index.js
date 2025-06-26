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
import {  Check, Plus } from 'lucide-react';

import { push } from "../../redux/features/opentabs";
import { TextInput, CheckBox,  ToggleButton } from "../../Inputs";
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

    console.log(id,"id")

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

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

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            setId("")
            syncFormWithDb(undefined)
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
        } catch (error) {
            console.log("handle");
        }
    };



    const saveExitData = () => {
        if (!validateData(data)) {
            toast.error("Please fill all required fields...!", {
                position: "top-center",
            });
            return;
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated", true);
        } else {
            console.log("hit");
            handleSubmitCustom(addData, data, "Added", true);
        }
    };


    const saveData = () => {
        if (!validateData(data)) {
            toast.info("Please fill all required fields...!", {
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

    const deleteData = async ( id ) => {
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
        syncFormWithDb(undefined)
        setReadOnly(false);
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }

    const tableHeaders = [
        "Name", "Status"
    ]
    const tableDataNames = ["dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE']

    // if (!form)
    //     return (
    //         <ReportTemplate
    //             heading={MODEL}
    //             tableHeaders={tableHeaders}
    //             tableDataNames={tableDataNames}
    //             loading={
    //                 isLoading || isFetching
    //             }
    //             setForm={setForm}
    //             data={allData?.data}
    //             onClick={onDataClick}
    //             onNew={onNew}
    //             searchValue={searchValue}
    //             setSearchValue={setSearchValue}
    //         />
    //     );

    return (

        <>
            <div
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




{/* 
                        {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%] h-[40%]"} onClose={() => {
                            setForm(false); if (openPartyModal === true) {
                                dispatch(push({ name: lastTapName }));
                            }; dispatch(setOpenPartyModal(false)); setErrors({});
                        }}>

                            <MastersForm
                                onNew={onNew}
                                onClose={() => {
                                    setForm(false);
                                    setSearchValue("");
                                    if (openPartyModal === true) {
                                        dispatch(push({ name: lastTapName }));
                                    }
                                    setId(false);
                                }}
                                model={MODEL}
                                childRecord={childRecord.current}
                                saveData={saveData}
                                saveExitData={saveExitData}
                                setReadOnly={setReadOnly}
                                deleteData={deleteData}
                                readOnly={readOnly}
                                emptyErrors={() => setErrors({})}
                            >

                                <fieldset className=' rounded mt-2'>

                                    <div className=''>
                                        <div className="flex flex-wrap w-full ">
                                            <div className="mb-3 w-[48%]">
                                                <TextInput name="ShocksMaterial" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>
                                        </div>
                                        <div >
                                            <div className="mb-3">
                                                <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                                            </div>

                                        </div>

                                    </div>
                                </fieldset>
                            </MastersForm>
                        </Modal>} */}
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


            </div>
        </>




























        // <div
        //     onKeyDown={handleKeyDown}
        //     className="md:items-start md:justify-items-center grid h-full bg-theme"
        // >
        //     <div className="flex flex-col frame w-full h-full">
        //         <FormHeader
        //             onNew={onNew}
        //             onClose={() => {
        //                 setForm(false);
        //                 setSearchValue("");
        //             }}
        //             model={MODEL}
        //             saveData={saveData}
        //             setReadOnly={setReadOnly}
        //             deleteData={deleteData}

        //         />
        //         <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">
        //             <div className="col-span-3 grid md:grid-cols-2 border overflow-auto">
        //                 <div className='col-span-3 grid md:grid-cols-2 border overflow-auto'>
        //                     <div className='mr-1 md:ml-2'>
        //                         <fieldset className='frame my-1'>
        //                             <legend className='sub-heading'>ShocksType Info</legend>
        //                             <div className='grid grid-cols-1 my-2'>
        //                                 <TextInput name="ShocksType" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
        //                                 {/* <CheckBox name="Accessory" readOnly={readOnly} value={accessory} setValue={setAccessory} disabled={(childRecord.current > 0)} /> */}
        //                                 <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} />
        //                             </div>
        //                         </fieldset>
        //                     </div>
        //                 </div>
        //             </div>
        //             <div className="frame hidden md:block overflow-x-hidden">
        //                 <FormReport
        //                     searchValue={searchValue}
        //                     setSearchValue={setSearchValue}
        //                     setId={setId}
        //                     tableHeaders={tableHeaders}
        //                     tableDataNames={tableDataNames}
        //                     data={allData?.data}
        //                     loading={
        //                         isLoading || isFetching
        //                     }
        //                 />
        //             </div>
        //         </div>
        //     </div>
        // </div>
    );
}
