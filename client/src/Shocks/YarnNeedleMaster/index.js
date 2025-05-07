import React, { useCallback, useEffect, useRef, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import toast from 'react-hot-toast';
import MastersForm from '../../Basic/components/MastersForm/MastersForm';
import Mastertable from '../../Basic/components/MasterTable/Mastertable';
import { DropdownInput, Modal, TextInput, ToggleButton } from '../../Inputs';
import { useAddMachineMutation, useDeleteMachineMutation, useGetMachineByIdQuery, useGetMachineQuery, useUpdateMachineMutation } from '../../redux/services/MachineMasterService';
import { statusDropdown } from '../../Utils/DropdownData';
import { dropDownListObject } from '../../Utils/contructObject';
import { useAddYarnNeedleMasterMutation, useDeleteYarnNeedleMasterMutation, useGetYarnNeedleMasterByIdQuery, useGetYarnNeedleMasterQuery, useUpdateYarnNeedleMasterMutation } from '../../redux/uniformService/YarnNeedleMasterservices';



const MODEL = "Yarn Needle Master";

export default function Form() {
    const [form, setForm] = useState(false);

    // const [openTable, setOpenTable] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("")
    const [name, setName] = useState("");
    const [machineId, setMachineId] = useState("");
    const [code, setCode] = useState("");
    const [active, setActive] = useState(false);
    const [errors, setErrors] = useState({});
    const [aliasName, setAliasName] = useState("")
    const [searchValue, setSearchValue] = useState("");

    const childRecord = useRef(0);

    const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
    const { data: MachineList, isLoading, isFetching } = useGetMachineQuery({ params, searchParams: searchValue });

    const { data: allData } = useGetYarnNeedleMasterQuery({ params, searchParams: searchValue });

    const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetYarnNeedleMasterByIdQuery(id, { skip: !id });

    const [addData] = useAddYarnNeedleMasterMutation();
    const [updateData] = useUpdateYarnNeedleMasterMutation();
    const [removeData] = useDeleteYarnNeedleMasterMutation();


    const syncFormWithDb = useCallback((data) => {

        if (!id) {
            setReadOnly(false);

            setName("");
            setAliasName("");
            setActive("");
            setMachineId("");

            return;
        } else {
            setReadOnly(true)
            setName(data?.name || "");
            setAliasName(data?.aliasName || "");
            setActive(id ? (data?.active ?? false) : true);
            setMachineId(data?.machineId)
            childRecord.current = data?.childRecord ? data?.childRecord : 0;
        }

        // childRecord.current = data?.childRecord ? data?.childRecord : 0;
        // if (data?.childRecord !== 0) {
        //     setReadOnly(true)
        // } else {
        //     setReadOnly(false)
        // }
    }, [id])


    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])

    console.log(secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), "companyId")

    const data = {
        name, machineId, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), active, id, aliasName
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
            console.log("handle")
        }
    }

    const saveData = () => {
        if (!validateData(data)) {
            toast.error("Please fill all required fields...!", { position: "top-center" })
            return
        }
        // if (!window.confirm("Are you sure save the details ...?")) {
        //     return
        // }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated")
        } else {
            handleSubmitCustom(addData, data, "Added");
        }
    }

    const deleteData = async () => {
        if (id) {
            // if (!window.confirm("Are you sure to delete...?")) {
            //     return
            // }
            try {
                let deldata = await removeData(id).unwrap();
                if (deldata?.statusCode == 1) {
                    toast.error(deldata?.message)
                    return
                }
                setId("");
                toast.success("Deleted Successfully");
                setForm(false);
            } catch (error) {
                toast.error("something went wrong")
                setForm(false);
            }
            ;
        }
    }

    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === 's') {
            event.preventDefault();
            saveData();
        }
    }

    const onNew = () => {
        setId("");
        setReadOnly(false);
        setForm(true);
        setSearchValue("");
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }
    const tableHeaders = [
        "S.NO", "Name", "AliasName", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "
    ]
    const tableDataNames = ["index+1", "dataObj.name", "dataObj.aliasName", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]


    return (
        <div onKeyDown={handleKeyDown} className='px-5'>
            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1 text-xl'>Yarn Needle Master</h5>
                <div className='flex items-center'>
                    <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                </div>
            </div>
            <div className='w-full flex items-start'>

                <Mastertable
                    header={'Machine Details'}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    // setOpenTable={setOpenTable}
                    tableHeaders={tableHeaders}
                    tableDataNames={tableDataNames}
                    data={allData?.data}
                // loading={
                //   isLoading || isFetching
                // }
                />

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

                            <fieldset className=' rounded '>

                                <div className='p-2'>
                                    <div className='flex'>
                                        <div className='mb-3 w-[20%]'>
                                            <TextInput name="Yarn Needle Name" type="text" value={name} setValue={setName}
                                                required={true}
                                                readOnly={readOnly}
                                                disabled={(childRecord.current > 0)}
                                                onBlur={(e) => {
                                                    if (aliasName) return;
                                                    setAliasName(e.target.value);
                                                }}
                                            />

                                        </div>

                                        <div className='mb-3 ml-5 w-[40%]'>
                                            <DropdownInput
                                                setAliasName={setAliasName}
                                                name={"Machine"}
                                                options={
                                                    Array.isArray(MachineList?.data)
                                                        ? dropDownListObject(
                                                            id ? MachineList.data : MachineList.data.filter(item => item?.active),
                                                            "name",
                                                            "id"
                                                        )
                                                        : []
                                                }

                                                type="text" value={machineId} setValue={setMachineId} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)}
                                                onBlur={(e) => {
                                                    if (aliasName) return;
                                                    setAliasName();
                                                }}
                                            />
                                        </div>
                                        <div className='mb-3 w-[20%]'>
                                            <TextInput name="Alias Name" type="text" value={aliasName} setValue={setAliasName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                                        </div>

                                    </div>
                                    <div className='mt-2'>
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


