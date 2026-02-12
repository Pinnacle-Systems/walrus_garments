import React, { useCallback, useEffect, useRef, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import toast from 'react-hot-toast';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import {  MultiSelectDropdown, TextInput, ToggleButton } from '../../Inputs';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import { statusDropdown } from '../../Utils/DropdownData';
import { useGetSizeMasterQuery } from '../../redux/uniformService/SizeMasterService';
import { useAddSizeTemplateMutation, useDeleteSizeTemplateMutation, useGetSizeTemplateByIdQuery, useGetSizeTemplateQuery, useUpdateSizeTemplateMutation } from '../../redux/uniformService/SizeTemplateMasterServices';
import { Loader } from '../../Basic/components';
import { multiSelectOption } from '../../Utils/contructObject';
import { findFromList } from '../../Utils/helper';
import Modal from '../../UiComponents/Modal';



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

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id)
            toast.success(text + "Successfully");
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
        syncFormWithDb(undefined)
        setReadOnly(false);
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }

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
            {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%] h-[40%]"} onClose={() => { setForm(false); setErrors({}); }}>
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
                            <div className="flex flex-wrap justify-between">
                                <div className='mb-3 w-[48%]'>
                                    <TextInput name="Size" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
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
                </MastersForm>
            </Modal>}

        </div>
    )
}


