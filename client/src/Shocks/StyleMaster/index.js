import React, { useCallback, useEffect, useRef, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
// import { dropDownListObject, multiSelectOption } from '../../../Utils/contructObject';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import { childRecordCount, ReusableTable, TextInput, TextInputNew1, ToggleButton } from '../../Inputs';
import BrowseSingleImage from '../../Basic/components/BrowseSingleImage';
import { useAddStyleMasterMutation, useDeleteStyleMasterMutation, useGetStyleMasterByIdQuery, useGetStyleMasterQuery, useUpdateStyleMasterMutation } from '../../redux/uniformService/StyleMasterService';
import { useGetFabricMasterQuery } from '../../redux/uniformService/FabricMasterService';
import { viewBase64String } from '../../Utils/helper';
import { useGetSizeTemplateQuery } from '../../redux/uniformService/SizeTemplateMasterServices';
import { useGetColorMasterQuery } from '../../redux/uniformService/ColorMasterService';
import { statusDropdown } from '../../Utils/DropdownData';
import { Check, Plus, Power } from 'lucide-react';
import Modal from '../../UiComponents/Modal';
import Swal from 'sweetalert2';
;

const MODEL = "Style Master"

const StyleMaster = () => {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [aliasName, setAliasName] = useState("");
    const [sku, setSku] = useState("");

    const [active, setActive] = useState(true);



    const [searchValue, setSearchValue] = useState("");

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };

    const { data: fabricList } =
        useGetFabricMasterQuery({ params: { ...params, active: true } });

    const { data: allData, isLoading, isFetching } = useGetStyleMasterQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetStyleMasterByIdQuery(id, { skip: !id });

    const [addData] = useAddStyleMasterMutation();
    const [updateData] = useUpdateStyleMasterMutation();
    const [removeData] = useDeleteStyleMasterMutation();



    const syncFormWithDb = useCallback(
        (data) => {
            // if (id) setReadOnly(true);
            setName(data?.name ? data.name : "");

            setAliasName(data?.sku ? data?.sku : "");
            setActive(id ? (data?.active ? data.active : false) : true);
        },
        [id]
    );


    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);


    useEffect(() => {
        setAliasName(name)
    }, [name, setName]);

    const data = {
        id, aliasName, active, sku,
        //  productType, 
        name,
        // seoTitle, sleeve, fabricId, sizeTemplateId,
        // pattern, occassion, material, active, washCare, hsn,
        companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    }

    const validateData = (data) => {
        if (data.name) {
            return true;
        }
        return false;
    }


    const handleNameChange = (val) => setName(val ? val.charAt(0).toUpperCase() + val.slice(1) : val);

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            let returnData;
            if (text === "Updated") {
                returnData = await callback({ id, body: data }).unwrap();
            } else {
                returnData = await callback(data).unwrap();
            }
            Swal.fire({
                title: text + "  " + "Successfully",
                icon: "success",

            });
            if (nextProcess === "new") {
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
                timer: 1000,

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
                text: "The Style Name already exists.",
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

    const deleteData = async (id, childRecord) => {

        if (childRecordCount(childRecord)) {
            Swal.fire({
                icon: 'error',
                // title: 'Submission error',
                text: 'Child Record Exists',
            });
            return
        }

        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                let deldata = await removeData(id).unwrap();
                if (deldata?.statusCode == 1) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Submission error',
                        text: deldata.data?.message || 'Something went wrong!',
                    });
                    return;
                }
                setId("");
                Swal.fire({
                    title: "Deleted Successfully",
                    icon: "success",

                });
                setForm(false);
            } catch (error) {
                Swal.fire({
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
            header: "Style",
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

    const firstInputFocus = useRef(null);

    useEffect(() => {
        if (form && firstInputFocus.current) {
            firstInputFocus.current.focus();
        }
    }, [form]);

    return (

        <div onKeyDown={handleKeyDown} className="p-1">
            <div className="w-full flex bg-white p-1 justify-between  items-center">
                <h5 className="text-2xl font-bold text-gray-800">Style Master</h5>
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            setForm(true);
                            onNew();
                        }}
                        className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                    >
                        + Add New Style
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
                        widthClass={"w-[36%] h-[45%]"}
                        onClose={() => {
                            setForm(false);
                            // setErrors({});
                        }}
                    >
                        <div className="h-full flex flex-col bg-gray-200 ">
                            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                                        {id
                                            ? !readOnly
                                                ? "Edit Style Master"
                                                : "Style Master"
                                            : "Add New Style  "}
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
                                        <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                                            <div className="grid grid-cols-3  gap-3">

                                                <div className=" col-span-3">
                                                    <TextInputNew1 name="Style Name" type="text" value={name} setValue={handleNameChange} required={true} readOnly={readOnly} ref={firstInputFocus} />

                                                </div>
                                                <div className="mb-3 col-span-1"  >
                                                    <TextInputNew1 name="Code" type="text" value={sku} setValue={setSku} readOnly={readOnly} />
                                                </div>
                                                <div className="col-span-1 mt-5">
                                                    <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />

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

export default StyleMaster










