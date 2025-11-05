import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useDispatch } from 'react-redux';
import secureLocalStorage from 'react-secure-storage';
import { useGetAccessoryItemMasterQuery } from '../../redux/uniformService/AccessoryItemMasterServices';
import { useGetAccessoryGroupMasterQuery } from '../../redux/uniformService/AccessoryGroupMasterServices';
import { useAddAccessoryMasterMutation, useDeleteAccessoryMasterMutation, useGetAccessoryMasterByIdQuery, useGetAccessoryMasterQuery, useUpdateAccessoryMasterMutation } from '../../redux/uniformService/AccessoryMasterServices';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import { DropdownInput, DropdownWithSearch, LongTextInput, ReusableTable, TextArea, TextInput, ToggleButton } from '../../Inputs';
import { accessoryCategoryList, statusDropdown } from '../../Utils/DropdownData';
import { dropDownListObject } from '../../Utils/contructObject';
import { Check, Plus, Power } from 'lucide-react';
import Modal from '../../UiComponents/Modal';
import { useGetHsnMasterQuery } from '../../redux/services/HsnMasterServices';
import { findFromList } from '../../Utils/helper';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useGetAccessoryCategoryMasterQuery } from '../../redux/uniformService/AccessoryCategoryMasterServices';


const MODEL = "Accessory Master"

export default function Form() {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [name, setName] = useState("")

    const [id, setId] = useState("");
    const [aliasName, setAliasName] = useState("");
    const [yarnBlendDetails, setYarnBlendDetails] = useState("");
    const [accessoryItemId, setAccessoryItemId] = useState("");
    const [hsn, setHsn] = useState("");
    const [taxPercent, setTaxPercent] = useState("");

    const [accessoryGroupId, setAccessoryGroupId] = useState("");
    const [accessoryCategoryId, setAccessoryCategoryId] = useState();
    const [active, setActive] = useState(true);
    const [errors, setErrors] = useState({});


    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);
    const dispatch = useDispatch();



    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )
    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    )
    const params = {
        companyId
    };
    const { data: hsnData } =
        useGetHsnMasterQuery({ params });

    const { data: accessorycategoryList } =
        useGetAccessoryCategoryMasterQuery({ params });

    const { data: accessoryGroupList } =
        useGetAccessoryGroupMasterQuery({ params });


    const { data: allData, isLoading, isFetching } = useGetAccessoryMasterQuery({ params, searchParams: searchValue });


    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetAccessoryMasterByIdQuery(id, { skip: !id });

    const [addData] = useAddAccessoryMasterMutation();
    const [updateData] = useUpdateAccessoryMasterMutation();
    const [removeData] = useDeleteAccessoryMasterMutation();

    const syncFormWithDb = useCallback((data) => {
        if (!id) {
            setReadOnly(false);
            setAliasName("");
            setAccessoryItemId("");
            setHsn("");
            setAccessoryGroupId("");
            setActive(id ? (data?.active) : true);
            setTaxPercent("")

        } else {
            setReadOnly(true);
            setAliasName(data?.aliasName || "");
            setAccessoryItemId(data?.accessoryItemId || "");
            setHsn(data?.hsnId ? data?.hsnId : "");
            setAccessoryGroupId(data?.accessoryGroupId ? data?.accessoryGroupId : "");
            setAccessoryCategoryId(data?.accessoryCategoryId ? data?.accessoryCategoryId : "")
            setActive(id ? (data?.active ?? false) : true);
            setTaxPercent(data?.taxPercent ? data?.taxPercent : "")

        }
    }, [id]);

    useEffect(() => {
        if (id) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        aliasName, accessoryCategoryId,
        accessoryItemId, hsn, accessoryGroupId, active, companyId, id, userId, taxPercent
    }

    const validatePercentage = () => {
        const yarnBlendPercentage = yarnBlendDetails.filter(blend => blend.yarnBlendId).reduce((accumulator, currentValue) => {
            return accumulator + parseInt(currentValue.percentage)
        }, 0);
        return yarnBlendPercentage === 100
    }

    function findName(arr, id) {
        if (!arr) return ""
        let data = arr.find(item => parseInt(item.id) === parseInt(id))
        return data ? data.name : ""
    }

    const calculateYarnName = () => {
        let group = findName(accessoryGroupList?.data, accessoryGroupId)
        // let category = accessoryCategoryList?.find(item => item.value === accessoryCategory)?.show
        let category = findName(accessorycategoryList?.data, accessoryCategoryId)



        // let yarnBlend = yarnBlendDetails ?
        //     yarnBlendDetails?.filter(blend => blend.yarnBlendId && blend.percentage).map(blend => `${parseInt(blend.percentage)}%${findName(YarnBlendList?.data, blend.yarnBlendId)}`).join(' ') : "";

        if (!group || !category) return ""
        return `${category} / ${group}`
    }

    console.log(calculateYarnName(), "obj")

    // const calculateYarnName = () => {
    //     const group = findName(accessoryGroupList?.data, accessoryGroupId);
    //     const category = accessoryCategoryList?.find(
    //         item => item.value === accessoryCategory
    //     )?.show;
    //     const item = findName(accessoryItemList?.data, accessoryItemId);

    //     if (!group || !category || !item) return "";

    //     const fullName = `${category} / ${group} / ${item}`;
    //     setName(fullName);
    //     return fullName;
    // };

    useEffect(() => {
        if (id) return
        setAliasName(calculateYarnName())
    }, [calculateYarnName()])


    const validateData = (data) => {
        return data.aliasName && data.accessoryCategoryId && data.accessoryGroupId &&
            data.hsn
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {

            let returnData;
            if (text === "Updated") {
                returnData = await callback({ id, body: data }).unwrap();
            } else {
                returnData = await callback(data).unwrap();
            }
            setId(returnData.data.id)
            // toast.success(text + "Successfully");
            Swal.fire({
                title: text + "Successfully",
                icon: "success",

            });
            dispatch({
                type: `AccessoryGroupMaster/invalidateTags`,
                payload: ['Accessory Group'],
            });
        } catch (error) {
            Swal.fire({
                title: error,
                icon: "error",

            });
            console.log("handle");
        }
    };


    const saveData = () => {
        // if (!validatePercentage()) {
        //     toast.error("Yarn Blend equal to 100...!", { position: "top-center" })
        //     return
        // }
        if (!validateData(data)) {
            Swal.fire({
                title: "Please fill all required fields...!",
                icon: "success",

            });
            return
        }
        let foundItem;
        if (id) {
            foundItem = allData?.data?.filter(i => i.id != id)?.some(item => item.aliasName === aliasName);
        } else {
            foundItem = allData?.data?.some(item => item.aliasName === aliasName);

        }


        if (foundItem) {
            Swal.fire({
                text: "The Yarn Blend Name already exists.",
                icon: "warning",
                timer: 1500,
                showConfirmButton: false,
            });
            return false;
        }

        if (id) {
            handleSubmitCustom(updateData, data, "Updated");
        } else {
            handleSubmitCustom(addData, data, "Added");
        }
    }

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
                dispatch({
                    type: `AccessoryGroupMaster/invalidateTags`,
                    payload: ['Accessory Group'],
                });
                onNew();
                toast.success("Deleted Successfully");
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
        setReadOnly(false);
        syncFormWithDb(undefined)

    };
    const tax = (hsn, data) => {
        console.log(hsn,"datadata")
        setTaxPercent(findFromList(hsn, data, "tax"));
    };


    // useEffect(() => {
    //     if (hsn && !id) {
    //         setTaxPercent(findFromList(hsn, hsnData?.data, "tax"));
    //     }
    // }, [hsn, hsnData]);
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
            className: "font-medium text-gray-900 w-10  text-center",
        },

        {
            header: "Accessory Name",
            accessor: (item) => item?.aliasName,
            //   cellClass: () => "font-medium  text-gray-900",
            className: "font-medium text-gray-900 text-left uppercase w-[500px]",
        },

        {
            header: "Status",
            accessor: (item) => (item.active ? ACTIVE : INACTIVE),
            //   cellClass: () => "font-medium text-gray-900",
            className: "font-medium text-gray-900 text-center uppercase w-16",
        },

    ];

    return (
        // <div onKeyDown={handleKeyDown}>
        //     <div className='w-full flex justify-between mb-2 items-center px-0.5'>
        //         <h5 className='my-1'>Accessory Master</h5>
        //         <div className="flex items-center gap-4">
        //             <button
        //                 onClick={() => {
        //                     setForm(true);
        //                     onNew();
        //                 }}
        //                 className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
        //             >
        //                 <Plus size={16} />
        //                 Add Accessory
        //             </button>

        //         </div>
        //     </div>
        //     <div className='w-full flex items-start'>
        //         <Mastertable
        //             header={'Accessory list'}
        //             searchValue={searchValue}
        //             setSearchValue={setSearchValue}
        //             onDataClick={onDataClick}
        //             // setOpenTable={setOpenTable}
        //             tableHeaders={tableHeaders}
        //             tableDataNames={tableDataNames}
        //             data={allData?.data}
        //             loading={
        //                 isLoading || isFetching
        //             } 
        //             setReadOnly={setReadOnly}
        //             />
        //     </div>

        //     {form && (
        //         <Modal
        //             isOpen={form}
        //             form={form}
        //             widthClass={"w-[40%] max-w-6xl h-[60vh]"}
        //             onClose={() => {
        //                 setForm(false);
        //                 setErrors({});
        //             }}
        //         >
        //             <div className="h-full flex flex-col bg-[f1f1f0] ">
        //                 <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3">
        //                     <div className="flex items-center gap-2">
        //                         <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
        //                             {id ? (!readOnly ? "Edit Accessory  " : "Accessory  Master") : "Add New Accessory "}
        //                         </h2>

        //                     </div>
        //                     <div className="flex gap-2">
        //                         <div>
        //                             {readOnly && (
        //                                 <button
        //                                     type="button"
        //                                     onClick={() => {
        //                                         setForm(false);
        //                                         setSearchValue("");
        //                                         setId(false);
        //                                     }}
        //                                     className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
        //                                 >
        //                                     Cancel
        //                                 </button>
        //                             )}
        //                         </div>
        //                         <div className="flex gap-2">
        //                             {(
        //                                 <button
        //                                     type="button"
        //                                     onClick={saveData}
        //                                     className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
        //                                 border border-green-600 flex items-center gap-1 text-xs"
        //                                 >
        //                                     <Check size={14} />
        //                                     {id ? "Update" : "Save"}
        //                                 </button>
        //                             )}
        //                         </div>
        //                     </div>
        //                 </div>

        // <div className="flex-1 overflow-auto p-3">
        //     <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

        //         <div className="col-span-4  gap-8  h-full">
        //             <div className='flex flex-col'>
        //                 <div className="">
        //                     <DropdownInput
        //                         name="Accessory Category"
        //                         options={accessoryCategoryList}
        //                         value={accessoryCategory}
        //                         setValue={setAccessoryCategory}
        //                         required={true}
        //                         readOnly={readOnly}
        //                         disabled={(childRecord.current > 0)}
        //                     />
        //                 </div>
        //                 <div className="">
        //                     <DropdownInput name="Accessory Group" options={dropDownListObject(id ? accessoryGroupList?.data : accessoryGroupList?.data?.filter(item => item.active), "name", "id")} value={accessoryGroupId} setValue={(value) => { setAccessoryGroupId(value); }} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
        //                 </div>

        //                 <div className="">
        //                     <DropdownInput name="Accessory Item" options={dropDownListObject(id ? accessoryItemList?.data?.filter(item => parseInt(accessoryGroupId) === parseInt(item.accessoryGroupId)) : accessoryItemList?.data?.filter(item => parseInt(accessoryGroupId) === parseInt(item.accessoryGroupId)).filter(item => item.active), "name", "id")} value={accessoryItemId} setValue={(value) => { setAccessoryItemId(value) }} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
        //                 </div>
        //             </div>
        //             <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />



        //         </div>
        //                         <div className="col-span-4  gap-8  h-full">

        // <fieldset className=''>
        //     <div className=''>
        //         <TextArea readOnly name="Accessory Name" className={'focus:outline-none cursor-not-allowed md:col-span-2 h-6 mb-1 rounded'} type="text" value={calculateYarnName()} disabled={(childRecord.current > 0)} />
        //         <div className="">
        //             <TextArea name="Alias Name" className={'focus:outline-none md:col-span-2 h-6 mb-1 border border-gray-500 rounded w-[75%]'} type="text" value={aliasName} setValue={setAliasName} readOnly={readOnly} required={true}  />

        //             <DropdownWithSearch
        //                 options={hsnData?.data}
        //                 value={hsn}
        //                 setValue={setHsn}
        //                 labelField={"name"}
        //                 label={"Hsn"}
        //                 required={true}
        //             />
        //             <TextInput name="Tax" type="text" value={findFromList(hsn, hsnData?.data, "tax")} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
        //         </div>

        //     </div>
        // </fieldset>
        //                         </div>
        //                     </div>
        //                 </div>
        //             </div>
        //         </Modal>
        //     )}
        // </div>
        <div onKeyDown={handleKeyDown} className="p-1">
            <div className="w-full flex bg-white p-1 justify-between  items-center">
                <h5 className="text-2xl font-bold text-gray-800">Accessory  Master</h5>
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            setForm(true);
                            onNew();
                        }}
                        className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                    >
                        + Add New Accessory
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
                        widthClass={"w-[50%] h-[70%]"}
                        onClose={() => {
                            setForm(false);
                            setErrors({});
                        }}
                    >
                        <div className="h-full flex flex-col bg-[f1f1f0] ">
                            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                                        {id
                                            ? !readOnly
                                                ? "Edit Accessory  Master"
                                                : "Accessory  Master"
                                            : "Add New Accessory  "}
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
                                                <div className="grid grid-cols-2  gap-8  h-full">

                                                    <div>
                                                        {/* <DropdownInput
                                                            name="Accessory Category"
                                                            options={accessoryCategoryList}
                                                            value={accessoryCategory}
                                                            setValue={setAccessoryCategory}
                                                            required={true}
                                                            readOnly={readOnly}
                                                            disabled={(childRecord.current > 0)}
                                                        /> */}
                                                        <DropdownWithSearch
                                                            label="Accessory Group"
                                                            options={accessoryGroupList?.data}
                                                            value={accessoryGroupId}
                                                            setValue={setAccessoryGroupId}
                                                            required={true}
                                                            readOnly={readOnly}
                                                            disabled={(childRecord.current > 0)}
                                                            labelField={"name"}
                                                        />
                                                        <DropdownWithSearch
                                                            label="Accessory Category"
                                                            options={accessorycategoryList?.data}
                                                            value={accessoryCategoryId}
                                                            setValue={setAccessoryCategoryId}
                                                            required={true}
                                                            readOnly={readOnly}
                                                            disabled={(childRecord.current > 0)}
                                                            labelField={"name"}
                                                        />

                                                        {/* <DropdownInput name="Accessory Group" options={dropDownListObject(id ? accessoryGroupList?.data : accessoryGroupList?.data?.filter(item => item.active), "name", "id")} value={accessoryGroupId} setValue={(value) => { setAccessoryGroupId(value); }} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} /> */}

                                                        {/* <DropdownInput name="Accessory Item" options={dropDownListObject(id ? accessorycategoryList?.data?.filter(item => parseInt(accessoryGroupId) === parseInt(item.accessoryGroupId)) : accessorycategoryList?.data?.filter(item => parseInt(accessoryGroupId) === parseInt(item.accessoryGroupId)).filter(item => item.active), "name", "id")} value={accessoryItemId} setValue={(value) => { setAccessoryItemId(value) }} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} /> */}




                                                    </div>
                                                    <div>
                                                        <TextArea readOnly name="Accessory Name" className={'focus:outline-none cursor-not-allowed md:col-span-2 h-10 mb-1 rounded'} type="text"
                                                            value={calculateYarnName()}
                                                            disabled={(childRecord.current > 0)} />
                                                        <TextArea name="Alias Name" className={'focus:outline-none md:col-span-2 h-6 mb-1 border border-gray-500 rounded w-[75%]'} type="text" value={aliasName} setValue={setAliasName} readOnly={readOnly} required={true} />
                                                        <DropdownWithSearch
                                                            options={hsnData?.data}
                                                            value={hsn}
                                                            setValue={(value) => {
                                                                setHsn(value)
                                                                // setTaxPercent(findFromList(hsn, hsnData?.data, "tax"))
                                                                tax(value, hsnData?.data, "tax")

                                                            }}
                                                            labelField={"name"}
                                                            label={"Hsn"}
                                                            required={true}
                                                        />
                                                        <TextInput name="Tax" type="text" value={taxPercent} readOnly={readOnly} setValue={setTaxPercent} />
                                                    </div>

                                                </div>

                                                <div>
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

