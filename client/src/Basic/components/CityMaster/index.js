import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetCityQuery,
    useGetCityByIdQuery,
    useAddCityMutation,
    useUpdateCityMutation,
    useDeleteCityMutation,
} from "../../../redux/services/CityMasterService";
import { useGetStateQuery } from "../../../redux/services/StateMasterService";

import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, CheckBox, DropdownInput, DisabledInput, Modal, ToggleButton } from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";
import { dropDownListObject } from '../../../Utils/contructObject';
import Loader from "../Loader";
import { useDispatch } from "react-redux";
import Mastertable from "../MasterTable/Mastertable";
import MastersForm from '../MastersForm/MastersForm';
import { statusDropdown } from "../../../Utils/DropdownData";
import { useSelector } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { setOpenPartyModal } from "../../../redux/features/openModel";
const MODEL = "City Master";

export default function Form() {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [active, setActive] = useState(true);
    const [state, setState] = useState("")

    const [searchValue, setSearchValue] = useState("");
    const [errors, setErrors] = useState({});

    const childRecord = useRef(0);
    const dispatch = useDispatch();

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: stateList, isLoading: isStateLoading, isFetching: isStateFetching } = useGetStateQuery({ params });
    const { data: allData, isLoading, isFetching } = useGetCityQuery({ params, searchParams: searchValue });
    const lastTapName = useSelector((state) => state.party.lastTab)

    const openPartyModal = useSelector((state) => state.party.openPartyModal);

    useEffect(() => {
        if (openPartyModal) {
            setForm(true);
            setId('')
        }
    }, [openPartyModal]);
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetCityByIdQuery(id, { skip: !id });


    const [addData] = useAddCityMutation();
    const [updateData] = useUpdateCityMutation();
    const [removeData] = useDeleteCityMutation();

    const syncFormWithDb = useCallback((data) => {
        if (!id) {
            setReadOnly(false);
            setName("");
            setCode("");
            setActive(true);
            setState("");
        } else {
            setReadOnly(true);
            setName(data?.name || "");
            setCode(data?.code || "");
            setActive(data?.active ? data?.active : true);
            setState(data?.stateId || "");
            childRecord.current = data?.childRecord ? data.childRecord : 0;
        }
    }, [id]);


    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        name, code, active, state, id
    };

    const validateData = (data) => {
        if (data.name && data.code) {
            return true;
        }
        return false;
    };
    const onNew = () => {
        setId("");
        setReadOnly(false);
        setForm(true);
        setSearchValue("");
    };

    const handleSubmitCustom = async (callback, data, text, exit = false) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id)
            toast.success(text + "Successfully");
            onNew()
            setId('')
            if (exit) {
                setForm(false)
            }
            if (exit) {
                if (openPartyModal === true) {
                    dispatch(push({ name: lastTapName }));
                }
                dispatch(setOpenPartyModal(false));
            }
            dispatch({
                type: `StateMaster/invalidateTags`,
                payload: ['State'],
            });

        } catch (error) {
            console.log("handle");
        }
    };


    const saveData = () => {
        if(readOnly) return toast.info("Turn On Edit Mode !..")

        if (!validateData(data)) {
            toast.error("Please fill all required fields...!", {
                position: "top-center",
            });
            return;
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated");
        } else {
            console.log("hit");
            handleSubmitCustom(addData, data, "Added");
        }
    };
    const saveExitData = () => {
        if(readOnly) return toast.info("Turn On Edit Mode !..")

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

    const deleteData = async () => {
        if(readOnly) return toast.info("Turn On Edit Mode !..")

        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                const deldata = await removeData(id).unwrap();
                if (deldata?.statusCode == 1) {
                    toast.error(deldata?.message)
                    setForm(false)
                    return
                }
                setId("");
                dispatch({
                    type: `StateMaster/invalidateTags`,
                    payload: ['State'],
                });
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



    function onDataClick(id) {
        setId(id);
        setForm(true);
    }
    const tableHeaders = ["S.NO", "City Name", "Code", "State", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    const tableDataNames = ["index+1", "dataObj.code", "dataObj.name", "dataObj.state.name", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    function countryFromState() {
        return state ? stateList.data.find(item => item.id === parseInt(state)).country?.name : ""
    }

    return (
        <>
            <div
                onKeyDown={handleKeyDown}

            >
                <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                    <h5 className='my-1'>City Master</h5>
                    <div className='flex items-center'>
                        <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                    </div>
                </div>
                <div className='w-full flex items-start'>
                    <Mastertable
                        header={'City list'}
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





                        {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%] h-[50%]"} onClose={() => {
                            setForm(false); if (openPartyModal === true) {
                                console.log("isCalled")
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
                                                <TextInput name="City Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>
                                            <div className="mb-3 w-[20%] ml-6">
                                                <TextInput name="Code" width={"w-[70px]"} type="text" value={code} setValue={setCode} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap w-full justify-between">
                                            <div className="mb-3 w-[48%]">
                                                <DropdownInput name="State"
                                                    options={
                                                        Array.isArray(stateList?.data)
                                                            ? dropDownListObject(
                                                                id ? stateList.data : stateList.data.filter(item => item?.active),
                                                                "name",
                                                                "id"
                                                            )
                                                            : []
                                                    }
                                                    value={state} setValue={setState} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>
                                            <div className="mb-3 w-[48%]">
                                                <DisabledInput name="Country" width={"w-[150px]"} type="text" value={countryFromState()} disabled={(childRecord.current > 0)} />
                                            </div>
                                        </div>

                                        <div >
                                            <div className="mb-3">
                                                <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                                            </div>
                                            {/* <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} /> */}
                                        </div>
                                    </div>
                                </fieldset>
                            </MastersForm>
                        </Modal>}

                    </div>
                </div>


            </div>
        </>
    );
}
