import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetColorMasterQuery,
    useGetColorMasterByIdQuery,
    useAddColorMasterMutation,
    useUpdateColorMasterMutation,
    useDeleteColorMasterMutation,
} from "../../../redux/uniformService/ColorMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, CheckBox, ReusableTable } from "../../../Inputs";
import ReportTemplate from '../../../Basic/components/ReportTemplate'
import { Check, Power } from "lucide-react";
import Modal from "../../../UiComponents/Modal";

const MODEL = "Color Master";

export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [pantone, setPantone] = useState("");
    const [active, setActive] = useState(true);
    const [isGrey, setIsGrey] = useState(false);


    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);


    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: allData, isLoading, isFetching } = useGetColorMasterQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetColorMasterByIdQuery(id, { skip: !id });


    const [addData] = useAddColorMasterMutation();
    const [updateData] = useUpdateColorMasterMutation();
    const [removeData] = useDeleteColorMasterMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (id) setReadOnly(true);
            setName(data?.name ? data.name : "");
            // setPantone(data?.pantone ? data.pantone : "");
            // setIsGrey(data?.isGrey ? data.isGrey : false);
            setActive(id ? (data?.active ? data.active : false) : true);
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, name,
        //  pantone,
        active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"),
        // isGrey
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
            toast.success(text + "Successfully");
        } catch (error) {
            console.log("handle");
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

    const deleteData = async () => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                await removeData(id)
                setId("");
                toast.success("Deleted Successfully");
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
            header: "Color",
            accessor: (item) => item?.name,
            //   cellClass: () => "font-medium  text-gray-900",
            className: "font-medium text-gray-900 text-center uppercase w-96",
        },

        {
            header: "Status",
            accessor: (item) => (item.active ? ACTIVE : INACTIVE),
            //   cellClass: () => "font-medium text-gray-900",
            className: "font-medium text-gray-900 text-center uppercase w-16",
        },

    ];


    return (
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
        //             childRecord={0}
        //         />
        //         <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">
        //             <div className="col-span-3 grid md:grid-cols-2 border overflow-auto">
        //                 <div className='col-span-3 grid md:grid-cols-2 border overflow-auto'>
        //                     <div className='mr-1 md:ml-2'>
        // <fieldset className='frame my-1'>
        //     <legend className='sub-heading'>Color Info</legend>
        //     <div className='grid grid-cols-1 my-2'>
        //         <div className="grid">
        //             <TextInput name="Color" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
        //         </div>
        //         {/* <div className="grid grid-cols-2">
        //             <TextInput name="Pantone" type="text" value={pantone} setValue={setPantone} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
        //             <div className={`h-20 w-32`} style={{ backgroundColor: pantone }}></div>
        //         </div> */}
        //         {/* <CheckBox name="Grey" readOnly={readOnly} value={isGrey} setValue={setIsGrey} /> */}
        //         <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} />
        //     </div>
        // </fieldset>
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
        <div onKeyDown={handleKeyDown} className="p-1">
            <div className="w-full flex bg-white p-1 justify-between  items-center">
                <h5 className="text-2xl font-bold text-gray-800">Color Master</h5>
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            setForm(true);
                            onNew();
                        }}
                        className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                    >
                        + Add New Color
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
                        widthClass={"w-[60%] h-[90%]"}
                        onClose={() => {
                            setForm(false);
                            // setErrors({});
                        }}
                    >
                        <div className="h-full flex flex-col bg-[f1f1f0] ">
                            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                                        {id
                                            ? !readOnly
                                                ? "Edit Color  Master"
                                                : "Color  Master"
                                            : "Add New Color"}
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

                            <div className="flex-1 overflow-auto p-3 ">
                                <div className="grid grid-cols-1  gap-3  h-full ">
                                    <div className="lg:col-span-2 space-y-3">
                                        <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                                            <div className="space-y-4 ">
                                                <div className="grid grid-cols-2  gap-3  h-full">

                                                    <fieldset className='frame my-1'>
                                                        <legend className='sub-heading'>Color Info</legend>
                                                        <div className='grid grid-cols-1 my-2'>
                                                            <div className="grid">
                                                                <TextInput name="Color" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                            </div>
                                                            {/* <div className="grid grid-cols-2">
                                            <TextInput name="Pantone" type="text" value={pantone} setValue={setPantone} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            <div className={`h-20 w-32`} style={{ backgroundColor: pantone }}></div>
                                        </div> */}
                                                            {/* <CheckBox name="Grey" readOnly={readOnly} value={isGrey} setValue={setIsGrey} /> */}
                                                            <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} />
                                                        </div>
                                                    </fieldset>
                                                    <div>

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
    );
}
