import React, { useEffect, useState, useRef, useCallback } from "react";
import { push } from "../../redux/features/opentabs";
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
import { TextInput, CheckBox, Modal, ToggleButton } from "../../Inputs";
import ReportTemplate from "../../Basic/components/ReportTemplate";
import FormHeader from "../../Basic/components/FormHeader";
import MastersForm from "../../Basic/components/MastersForm/MastersForm";
import Mastertable from "../../Basic/components/MasterTable/Mastertable";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { statusDropdown } from "../../Utils/DropdownData";
import setOpenPartyModal from "../../redux/features/opentabs";

const MODEL = "Socks Material";

export default function Form() {
    const [form, setForm] = useState(false);
    const [errors, setErrors] = useState({});
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [accessory, setAccessory] = useState(false)
    const [active, setActive] = useState(true);

    const openPartyModal = useSelector((state) => state.party.openPartyModal);
    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);

    const dispatch = useDispatch();
    const lastTapName = useSelector((state) => state.party.lastTab)
    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: allData, isLoading, isFetching } = useGetSocksMaterialQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetSocksMaterialByIdQuery(id, { skip: !id });


    const [addData] = useAddSocksMaterialMutation();
    const [updateData] = useUpdateSocksMaterialMutation();
    const [removeData] = useDeleteSocksMaterialMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (id) setReadOnly(true);
            setName(data?.name ? data.name : "");
            // setAccessory(data?.isAccessory ? data.isAccessory : false);
            setActive(id ? (data?.active ? data.active : false) : true);
        },
        [id]
    );

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
            toast.success(text + "Successfully");
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
                    <h5 className='my-1'>Socks Material</h5>
                    <div className='flex items-center'>
                        <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                    </div>
                </div>
                <div className='w-full flex items-start'>
                    <Mastertable
                        header={'Socks Material list'}
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
                        </Modal>}

                    </div>
                </div>


            </div>





















            {/* <div>
                <div className="flex flex-col frame w-full h-full">
                    <FormHeader
                        onNew={onNew}
                        onClose={() => {
                            setForm(false);
                            setSearchValue("");
                        }}
                        model={MODEL}
                        saveData={saveData}
                        setReadOnly={setReadOnly}
                        deleteData={deleteData}

                    />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">
                        <div className="col-span-3 grid md:grid-cols-2 border overflow-auto">
                            <div className='col-span-3 grid md:grid-cols-2 border overflow-auto'>
                                <div className='mr-1 md:ml-2'>
                                    <fieldset className='frame my-1'>
                                        <legend className='sub-heading'>ShocksMaterial Info</legend>
                                        <div className='grid grid-cols-1 my-2'>
                                            <TextInput name="ShocksMaterial" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                          
                                            <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} />
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                        <div className="frame hidden md:block overflow-x-hidden">
                            <FormReport
                                searchValue={searchValue}
                                setSearchValue={setSearchValue}
                                setId={setId}
                                tableHeaders={tableHeaders}
                                tableDataNames={tableDataNames}
                                data={allData?.data}
                                loading={
                                    isLoading || isFetching
                                }
                            />
                        </div>
                    </div>
                </div>
            </div> */}
        </>
    );
}
