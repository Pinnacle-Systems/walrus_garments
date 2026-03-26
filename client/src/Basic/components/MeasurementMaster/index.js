import React, { useCallback, useEffect, useRef, useState } from 'react';

import secureLocalStorage from 'react-secure-storage';
import {
    useAddSizeMasterMutation,
    useDeleteSizeMasterMutation,
    useGetSizeMasterByIdQuery,
    useGetSizeMasterQuery,
    useUpdateSizeMasterMutation
} from '../../../redux/uniformService/SizeMasterService';
import toast from 'react-hot-toast';
import MastersForm from '../MastersForm/MastersForm';
import { ReusableTable, TextArea, TextInput, ToggleButton } from '../../../Inputs';
import Mastertable from '../MasterTable/Mastertable';
import { statusDropdown } from '../../../Utils/DropdownData';
import { useAddMeasurementMasterMutation, useDeleteMeasurementMasterMutation, useGetMeasurementMasterByIdQuery, useGetMeasurementMasterQuery, useUpdateMeasurementMasterMutation } from '../../../redux/uniformService/MeasurementMasterService';
import { Check, Plus, Power } from 'lucide-react';
import Modal from '../../../UiComponents/Modal';
import Swal from 'sweetalert2';

const MODEL = "Measurement Master"
export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [accessory, setAccessory] = useState(false)
    const [active, setActive] = useState(false);
    const [errors, setErrors] = useState({});


    const [searchValue, setSearchValue] = useState("");
    const nameRef = useRef(null);
    const childRecord = useRef(0);



    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };

    console.log(params, "params")

    const { data: allData, isLoading, isFetching } = useGetMeasurementMasterQuery({ params, searchParams: searchValue });

    console.log(allData, "datatat")

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetMeasurementMasterByIdQuery(id, { skip: !id });


    const [addData] = useAddMeasurementMasterMutation();
    const [updateData] = useUpdateMeasurementMasterMutation();
    const [removeData] = useDeleteMeasurementMasterMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setReadOnly(false);
                setName("");
                // setAccessory(data?.isAccessory || false);
                setActive(true);
                childRecord.current = 0;

            } else {
                // setReadOnly(true);
                setName(data?.name || "");
                // setAccessory(data?.isAccessory || false);
                setActive(id ? (data?.active ?? false) : true);
                childRecord.current = data?.childRecord ? data?.childRecord : 0;
            }
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
            setId(returnData.data.id)
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

        const finalData = {
            ...data,
            name: upperName,
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
            foundItem = allData?.data?.filter(i => i.id != id)?.some(item => item.name.toUpperCase() === upperName.trim());
        } else {
            foundItem = allData?.data?.some(item => item.name.toUpperCase() === upperName.trim());

        }
        if (foundItem) {
            Swal.fire({
                text: "The Measurement Name already exists.",
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

    const tableHeaders = [
        "S.NO", "Name", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "
    ]
    const tableDataNames = ["index+1", "dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]

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
    useEffect(() => {
        if (form && nameRef.current) {
            nameRef.current.focus();
        }
    }, [form]);

    const handleNameChange = (val) => setName(val ? val.charAt(0).toUpperCase() + val.slice(1) : val);

    const columns = [
        {
            header: "S.No",
            accessor: (item, index) => index + 1,
            className: "font-medium text-gray-900 w-12  text-center",
        },

        {
            header: "Measurement",
            accessor: (item) => item?.name,
            //   cellClass: () => "font-medium  text-gray-900",
            className: "font-medium text-gray-900 text-left pl-2 uppercase w-96",
        },

        {
            header: "Status",
            accessor: (item) => (item.active ? ACTIVE : INACTIVE),
            //   cellClass: () => "font-medium text-gray-900",
            className: "font-medium text-gray-900 text-center uppercase w-16",
        },

    ];


    return (
        //         <div onKeyDown={handleKeyDown}>
        //             <div className='w-full flex justify-between mb-2 items-center px-0.5'>
        //                 <h5 className='my-1'>Measurement Master</h5>
        //                 <div className="flex items-center gap-4">
        //                           <button
        //                             onClick={() => {
        //                               setForm(true);
        //                               onNew();
        //                             }}
        //                             className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
        //                           >
        //                             <Plus size={16} />
        //                             Add New Measurement 
        //                           </button>

        //                         </div>
        //             </div>
        //             <div className='w-full flex items-start'>
        //                 <Mastertable
        //                     header={'Measurement list'}
        //                     searchValue={searchValue}
        //                     setSearchValue={setSearchValue}
        //                     onDataClick={onDataClick}
        //                     // setOpenTable={setOpenTable}
        //                     tableHeaders={tableHeaders}
        //                     tableDataNames={tableDataNames}
        //                     deleteData={deleteData}
        //                     setReadOnly={setReadOnly}
        //                     data={allData?.data}
        //                     loading={
        //                         isLoading || isFetching
        //                     } />
        //             </div>
        //             {/* {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%] h-[40%]"} onClose={() => { setForm(false); setErrors({}); }}>
        //                 <MastersForm
        //                     onNew={onNew}
        //                     onClose={() => {
        //                         setForm(false);
        //                         setSearchValue("");
        //                         setId(false);
        //                     }}
        //                     model={MODEL}
        //                     childRecord={childRecord.current}
        //                     saveData={saveData}
        //                     setReadOnly={setReadOnly}
        //                     deleteData={deleteData}
        //                     readOnly={readOnly}
        //                     emptyErrors={() => setErrors({})}
        //                 >
        // <fieldset className=' rounded mt-2'>
        //     <div className=''>
        //         <div className="flex flex-wrap justify-between">
        //             <div className='mb-3 w-[48%]'>
        //                 <TextInput name="Measurement" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
        //             </div>

        //         </div>


        //         <div className='mb-5'>
        //             <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
        //         </div>

        //     </div>
        // </fieldset>
        //                 </MastersForm>
        //             </Modal>} */}
        //  {form && (
        //         <Modal
        //           isOpen={form}
        //           form={form}
        //           widthClass={"w-[30%] max-w-6xl h-[50vh]"}
        //           onClose={() => {
        //             setForm(false);
        //             setErrors({});
        //           }}
        //         >
        //           <div className="h-full flex flex-col bg-[f1f1f0]">
        //             <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
        //               <div className="flex items-center gap-2">
        //                 <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
        //                   {id ? (!readOnly ? "Edit Measurement Master" : "Employee Measurement Master") : "Add New Measurement Master"}
        //                 </h2>

        //               </div>
        //               <div className="flex gap-2">
        //                 <div>
        //                   {readOnly && (
        //                     <button
        //                       type="button"
        //                       onClick={() => {
        //                         setForm(false);
        //                         setSearchValue("");
        //                         setId(false);
        //                       }}
        //                       className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
        //                     >
        //                       Cancel
        //                     </button>
        //                   )}
        //                 </div>
        //                 <div className="flex gap-2">
        //                   {!readOnly && (
        //                     <button
        //                       type="button"
        //                       onClick={saveData}
        //                       className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
        //                   border border-green-600 flex items-center gap-1 text-xs"
        //                     >
        //                       <Check size={14} />
        //                       {id ? "Update" : "Save"}
        //                     </button>
        //                   )}
        //                 </div>
        //               </div>
        //             </div>

        //             <div className="flex-1 overflow-auto p-3">
        //               <div className="grid grid-cols-1  gap-3  h-full">
        //                 <div className="lg:col-span- space-y-3">
        //                   <div className="bg-white p-3 rounded-md border border-gray-200 h-full">

        //                     <fieldset className=' rounded mt-2'>
        //                         <div className=''>
        //                             <div className="flex flex-wrap justify-between">
        //                                 <div className='mb-3 w-[48%]'>
        //                                     <TextInput name="Measurement" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
        //                                 </div>

        //                             </div>


        //                             <div className='mb-5'>
        //                                 <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
        //                             </div>

        //                         </div>
        //                     </fieldset>

        //                   </div>


        //                 </div>










        //               </div>
        //             </div>


        //           </div>



        //         </Modal>
        //       )}
        //         </div>
        <div onKeyDown={handleKeyDown} className="p-1">
            <div className="w-full flex bg-white p-1 justify-between  items-center">
                <h5 className="text-2xl font-bold text-gray-800">Measurement  Master</h5>
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            setForm(true);
                            onNew();
                        }}
                        className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                    >
                        + Add New Measurement
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
                        <div className="h-full flex flex-col bg-gray-200">
                            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                                        {id
                                            ? !readOnly
                                                ? "Edit Measurement  Master"
                                                : "Measurement  Master"
                                            : "Add New Measurement "}
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

                            <div className="flex-1 overflow-auto p-3 ">
                                <div className="grid grid-cols-1  gap-3  h-full ">
                                    <div className="lg:col-span-2 space-y-3">
                                        <div className="bg-white p-3 rounded-md border border-gray-200 h-full" ref={formRef}>
                                            <div className="space-y-4 ">
                                                <div className="grid grid-cols-2  gap-3  h-full">

                                                    <fieldset className=' rounded mt-2'>
                                                        <div className='mb-3 '>
                                                            <TextArea
                                                                name="Measurement"
                                                                type="text"
                                                                value={name}
                                                                setValue={setName}
                                                                required={true}
                                                                readOnly={readOnly}
                                                                disabled={(childRecord.current > 0)}
                                                                ref={nameRef}
                                                            />
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
    )
}
