import React, { useEffect, useState, useRef, useCallback } from 'react';
import secureLocalStorage from 'react-secure-storage';
import {
    useGetFinYearQuery,
    useGetFinYearByIdQuery,
    useAddFinYearMutation,
    useUpdateFinYearMutation,
    useDeleteFinYearMutation
} from '../../../redux/services/FinYearMasterService';
import FormHeader from '../FormHeader';
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify"
import { DateInput, CheckBox, DisabledInput, Modal, ToggleButton } from "../../../Inputs"
import ReportTemplate from '../ReportTemplate';
import { getYearShortCode } from '../../../Utils/helper';

import Mastertable from '../MasterTable/Mastertable';
import MastersForm from '../MastersForm/MastersForm';
import { statusDropdown } from '../../../Utils/DropdownData';
import moment from 'moment';



const MODEL = "Fin Year Master";

export default function Form() {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("")
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [active, setActive] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [code, setCode] = useState();
    const childRecord = useRef(0);
    const [errors, setErrors] = useState({});

    console.log(from)

    const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
    const { data: allData, isLoading, isFetching } = useGetFinYearQuery({ params, searchParams: searchValue });
    const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetFinYearByIdQuery(id, { skip: !id });

    const [addData] = useAddFinYearMutation();
    const [updateData] = useUpdateFinYearMutation();
    const [removeData] = useDeleteFinYearMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (!id) {
                setReadOnly(false);
                setTo(data?.to || "");
                setFrom(data?.from || "");
                      setActive(id ? (data?.active ) : true);

                setCode("")
            } else {
                setReadOnly(true);
                setTo(data?.to ? moment?.utc(data.to).format('YYYY-MM-DD') : "");
                setFrom(data?.from ? moment?.utc(data.from).format('YYYY-MM-DD') : "");
                setActive(id ? (data?.active ?? false) : true);
                setCode((data?.from) && (data?.to) ? getYearShortCode(data?.from, data?.to) : "")
            }
        }, [id])


    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


    const data = {
        from, to, active,
        companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), id
    }

    const validateData = (data) => {
        if (data.from && data.to) {
            return true;
        }
        return false;
    }

    const validateOneActiveFinYear = (active) => {
        if (Boolean(active)) {
            return !allData.data.some((finYear) => id === finYear.id ? false : Boolean(finYear.active))
        }
        return true
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id)
            syncFormWithDb(undefined)
            toast.success(text + "Successfully");

        } catch (error) {
            console.log("handle")
        }
    }

    const saveData = () => {
        if (!validateOneActiveFinYear(data.active)) {
            toast.error("Only one Fin year can be active...!", { position: "top-center" })
            return
        }
        if (!validateData(data)) {
            toast.error("Please fill all required fields...!", { position: "top-center" })
            return
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated")
        } else {
            handleSubmitCustom(addData, data, "Added")
        }
    }

    const deleteData = async () => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return
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
                toast.error("something went wrong")
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

    const onNew = () => { setId(""); setReadOnly(false); setForm(true); setSearchValue("") }

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }
    const tableHeaders = ["S.NO", "from", "to", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    const tableDataNames = ["index+1", "moment.utc(dataObj.from).format('DD-MM-YYYY')",
        "moment.utc(dataObj.to).format('DD-MM-YYYY')", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    return (
        <div onKeyDown={handleKeyDown}>
            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Fin Year Master</h5>
                <div className='flex items-center'>
                    <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                </div>
            </div>
            <div className='w-full flex items-start'>
                <Mastertable
                    header={'Fin Year list'}
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
                            <div className="flex flex-wrap justify-between">
                                <div className='mb-3 w-[48%]'>
                                    <DateInput name="From" value={from} setValue={setFrom} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>
                                <div className='mb-3 w-[48%]'>
                                    <DateInput name="To" value={to} setValue={setTo} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>
                            </div>
                            <div className='mb-3 w-[48%]'>
                                <DisabledInput name="Short Code" value={code} disabled={(childRecord.current > 0)} />
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
