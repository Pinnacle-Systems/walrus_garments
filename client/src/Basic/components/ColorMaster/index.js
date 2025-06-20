import React, { useCallback, useEffect, useRef, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import toast from 'react-hot-toast';
import Mastertable from '../MasterTable/Mastertable';
import MastersForm from '../MastersForm/MastersForm';
import { CheckBox, Modal, TextInput, ToggleButton } from '../../../Inputs';
import { useAddColorMasterMutation, useDeleteColorMasterMutation, useGetColorMasterByIdQuery, useGetColorMasterQuery, useUpdateColorMasterMutation } from '../../../redux/uniformService/ColorMasterService';
import { statusDropdown } from '../../../Utils/DropdownData';



const MODEL = "Color Master";

export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [pantone, setPantone] = useState("");
    const [active, setActive] = useState(true);
    const [isGrey, setIsGrey] = useState(false);
    const [errors, setErrors] = useState({});


    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);


    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };

    console.log(params, "params")

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
            if (!id) {
                setReadOnly(false);
                setName("");
                setPantone("");
                setIsGrey(false);
                      setActive(id ? (data?.active ) : true);

            } else {
                setReadOnly(true);
                setName(data?.name || "");
                setPantone(data?.pantone || "");
                setIsGrey(data?.isGrey || false);
                setActive(id ? (data?.active ?? false) : true);
            }
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        name, active
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
                await removeData(id)
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

    const tableHeaders = [
        "Name", "Status",
    ]
    const tableDataNames = ["dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE']
    return (
        <div onKeyDown={handleKeyDown}>
            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Color Master</h5>
                <div className='flex items-center'>
                    <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                </div>
            </div>
            <div className='w-full flex items-start'>

                <Mastertable
                    header={'Color list'}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    // setOpenTable={setOpenTable}
                    tableHeaders={tableHeaders}
                    tableDataNames={tableDataNames}
                    data={allData?.data}
                    loading={
                        isLoading || isFetching
                    } />

                <div>
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
                                    <div className='flex justify-between'>
                                        <div>
                                            <div className="mb-3 w-[48%]">
                                                <TextInput name="Color" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>

                                        </div>
                                        <div className={`h-20 w-32 `} style={{ backgroundColor: pantone }}></div>
                                    </div>

                                    <div className='mb-5'>
                                        <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                                    </div>
                                </div>
                            </fieldset>
                        </MastersForm>
                    </Modal>}

                </div>
            </div>
        </div>
    )
}


