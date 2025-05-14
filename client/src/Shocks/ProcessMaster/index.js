import React, { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import secureLocalStorage from 'react-secure-storage';
import { CheckBox, DropdownInput, Modal, TextInput, ToggleButton } from '../../Inputs';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import { useAddProcessMasterMutation, useDeleteProcessMasterMutation, useGetProcessMasterByIdQuery, useGetProcessMasterQuery, useUpdateProcessMasterMutation } from '../../redux/uniformService/ProcessMasterService';
import { ProcessIOOptions, statusDropdown } from '../../Utils/DropdownData';



const MODEL = "Process Master"

export default function Form() {
    const [form, setForm] = useState(false);

    // const [openTable, setOpenTable] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [io, setIo] = useState("");
    const [active, setActive] = useState(true);
    const [isCutting, setIsCutting] = useState(false);
    const [isPacking, setIsPacking] = useState(false);
    const [isPcsStage, setIsPcsStage] = useState(false);
    const [isIroning, setIsIroning] = useState(false)
    const [isPrintingJobWork, setIsPrintingJobWork] = useState(false);
    const [code, setCode] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);
    const [errors, setErrors] = useState({});

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: allData, isLoading, isFetching } = useGetProcessMasterQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetProcessMasterByIdQuery(id, { skip: !id });


    const [addData] = useAddProcessMasterMutation();
    const [updateData] = useUpdateProcessMasterMutation();
    const [removeData] = useDeleteProcessMasterMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setReadOnly(false);
                setName("");
                setCode("");
                setIo("");
                setIsCutting(false);
                setIsPacking(false);
                setIsPcsStage(false);
                setIsPrintingJobWork(false);
                setIsIroning(false);
                      setActive(id ? (data?.active ) : true);

            } else {
                setReadOnly(true);
                setName(data?.name || "");
                setCode(data?.code || "");
                setIo(data?.io || "");
                setIsCutting(data?.isCutting || false);
                setIsPacking(data?.isPacking || false);
                setIsPcsStage(data?.isPcsStage || false);
                setIsPrintingJobWork(data?.isPrintingJobWork || false);
                setIsIroning(data?.isIroning || false);
                setActive(id ? (data?.active ?? false) : true);
            }

        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, name, io, code, active, isCutting, isPacking, isPcsStage, isIroning, isPrintingJobWork, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    }

    const validateData = (data) => {
        return data.name && data.code && (data.isCutting || data.isPacking || data.isPcsStage ? true : data.io)
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
        setReadOnly(false);
        setForm(true);
        syncFormWithDb(undefined)
        setSearchValue("");
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }

    const tableHeaders = [
        "S.NO", "Name", "IO", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "
    ]
    const tableDataNames = ["index+1", "dataObj.name", "dataObj.io", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]


    useEffect(() => {
        if (isCutting || isPacking) {
            setIsPcsStage(true)
        }
    }, [isCutting, isPacking, setIsPcsStage])

    useEffect(() => {
        if (!isPcsStage) {
            setIsCutting(false);
            setIsPacking(false);
        }
    }, [isPcsStage, setIsCutting, setIsPacking])
    return (
        <div onKeyDown={handleKeyDown}>
            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Process Master</h5>
                <div className='flex items-center'>
                    <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                </div>
            </div>
            <div className='w-full flex items-start'>
                <Mastertable
                    header={'Process Master list'}
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
            </div>
            {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%]"} onClose={() => { setForm(false); setErrors({}); }}>
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





                            {/* <CheckBox name="PcsStage" readOnly={readOnly} value={isPcsStage} setValue={setIsPcsStage} />
                            <CheckBox name="Cutting" readOnly={readOnly} value={isCutting} setValue={setIsCutting} />
                            <CheckBox name="Packing" readOnly={readOnly} value={isPacking} setValue={setIsPacking} />
                            <CheckBox name="Printing Job Work" readOnly={readOnly} value={isPrintingJobWork} setValue={setIsPrintingJobWork} />
                            <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} /> */}




                            <div className='flex flex-wrap'>
                                <div className='mb-3 w-[48%]'>
                                    <TextInput name="Process name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>
                                <div className='mb-3 ml-6 w-[20%]'>
                                    <TextInput name="Code" type="text" value={code} setValue={setCode} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>
                            </div>
                            <div className='mb-3 w-[48%]'>
                                <DropdownInput name="IO" options={ProcessIOOptions} value={io} setValue={setIo} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                            </div>
                            <div className='mb-3 w-[100%] flex flex-wrap justify-between'>
                                {/* <CheckBox name="PcsStage" readOnly={readOnly} value={isPcsStage} setValue={setIsPcsStage} />
                                <CheckBox name="Cutting" readOnly={readOnly} value={isCutting} setValue={setIsCutting} /> */}
                                <CheckBox name="Ironing" readOnly={readOnly} value={isIroning} setValue={setIsIroning} />
                                <CheckBox name="Packing" readOnly={readOnly} value={isPacking} setValue={setIsPacking} />
                                <CheckBox name="Printing Job Work" readOnly={readOnly} value={isPrintingJobWork} setValue={setIsPrintingJobWork} />

                            </div>
                            <div className='mb-5'>
                                <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                            </div>

                        </div>
                    </fieldset>
                </MastersForm>
            </Modal>}

        </div>
    )
}


