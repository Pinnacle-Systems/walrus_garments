import React, { useCallback, useEffect, useRef, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import toast from 'react-hot-toast';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import { MultiSelectDropdown, TextInput, ToggleButton } from '../../Inputs';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import { statusDropdown } from '../../Utils/DropdownData';
import { useGetSizeMasterQuery } from '../../redux/uniformService/SizeMasterService';
import { useAddSizeTemplateMutation, useDeleteSizeTemplateMutation, useGetSizeTemplateByIdQuery, useGetSizeTemplateQuery, useUpdateSizeTemplateMutation } from '../../redux/uniformService/SizeTemplateMasterServices';
import { Loader } from '../../Basic/components';
import { multiSelectOption } from '../../Utils/contructObject';
import { findFromList } from '../../Utils/helper';
import Modal from '../../UiComponents/Modal';
import { Check } from 'lucide-react';
import Swal from 'sweetalert2';



const MODEL = "Size Template Master"
export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [selectedSizeList, setSelectedSizeList] = useState([]);
    const [active, setActive] = useState(true);

    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);
    const [errors, setErrors] = useState({});
    const formRef = useRef(null);

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: sizeList, isLoading: isSizeLoading, isFetching: isSizeFetching } = useGetSizeMasterQuery({ params, searchParams: searchValue });

    const { data: allData, isLoading, isFetching } = useGetSizeTemplateQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetSizeTemplateByIdQuery(id, { skip: !id });


    const [addData] = useAddSizeTemplateMutation();
    const [updateData] = useUpdateSizeTemplateMutation();
    const [removeData] = useDeleteSizeTemplateMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setReadOnly(false);
                setName("");
                setSelectedSizeList([])
                      setActive(id ? (data?.active ) : true);

            } else {
                setReadOnly(true);
                setName(data?.name || "");
                setSelectedSizeList(data?.SizeTemplateOnSize ? data.SizeTemplateOnSize.map(item => {
                    return { label: findFromList(item.sizeId, sizeList ? sizeList.data : [], "name"), value: item.sizeId }
                }
                ) : [])
                setActive(id ? (data?.active ?? false) : true);
            }
        },
        [id]
    );

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
        id, name, active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"),
        selectedSizeList: selectedSizeList.map(item => item.value)
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
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id);
            Swal.fire({ title: text + "  Successfully", icon: "success" });
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
            toast.error("Please fill all required fields...!", {
                position: "top-center",
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
            saveData("close");
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
    };
    const handleEdit = (id) => {
        setId(id);
        setForm(true);
        setReadOnly(false);
    };

    // if (!sizeList || !allData || isLoading || isFetching) return <Loader />
    const sizeOptions = sizeList ? multiSelectOption(sizeList.data.filter(item => !(item.isAccessory)), "name", "id") : []

    const tableHeaders = [
        "S.NO", "Name", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "
    ]
    const tableDataNames = ["index+1", "dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    return (
        <div onKeyDown={handleKeyDown}>
            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Size Template Master</h5>
                <div className='flex items-center'>
                    <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                </div>
            </div>
            <div className='w-full flex items-start'>
                <Mastertable
                    header={'Size Template list'}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    // setOpenTable={setOpenTable}
                    tableHeaders={tableHeaders}
                    tableDataNames={tableDataNames}
                    data={allData?.data}
                // loading={
                //     isLoading || isFetching
                // }
                />
            </div>
            {form === true && (
                <Modal isOpen={form} form={form} widthClass={"w-[40%] h-[40%]"} onClose={() => { setForm(false); setErrors({}); }}>
                    <div className="h-full flex flex-col bg-gray-200">
                        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                                    {id
                                        ? !readOnly
                                            ? "Edit Size Template"
                                            : "Size Template Master"
                                        : "Add New Size Template"}
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
                                            className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 border border-green-600 flex items-center gap-1 text-xs"
                                        >
                                            <Check size={14} />
                                            {id ? "Update" : "Save & close"}
                                        </button>
                                    )}
                                    {(!readOnly && !id) && (
                                        <button
                                            type="button"
                                            onClick={() => saveData("new")}
                                            className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 border border-green-600 flex items-center gap-1 text-xs"
                                        >
                                            <Check size={14} />
                                            Save & New
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-3">
                            <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                                <fieldset className=' rounded mt-2' ref={formRef}>
                                    <div className=''>
                                        <div className="flex flex-wrap justify-between">
                                            <div className='mb-3 w-[48%]'>
                                                <TextInput name="Size" type="text" value={name} setValue={handleNameChange} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>

                                        </div>
                                        <div className='mb-3 w-[48%]'>
                                            <MultiSelectDropdown name={"Size"} selected={selectedSizeList} setSelected={setSelectedSizeList}
                                                options={sizeOptions} readOnly={readOnly} />
                                        </div>
                                        <div className='mb-5'>
                                            {/* <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} /> */}
                                            <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                                        </div>

                                    </div>
                                </fieldset>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    )
}


