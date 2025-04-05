import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DateInput, DisabledInput, DropdownInput, TextArea, TextInput, CheckBox, DropdownWithSearch } from '../../../Inputs'
import ReportTemplate from '../../../Basic/components/ReportTemplate';
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";


import { getDateFromDateTime } from '../../../Utils/helper'
import FormHeader from '../../../Basic/components/FormHeader';
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';
import { useAddLeadMutation, useDeleteLeadMutation, useGetLeadByIdQuery, useGetLeadQuery, useUpdateLeadMutation } from '../../../redux/services/LeadFormService';
import { useGetPartyByIdQuery, useGetPartyQuery, useUpdatePartyMutation } from '../../../redux/services/PartyMasterService';
import { dropDownListObject } from '../../../Utils/contructObject';
import Modal from "../../../UiComponents/Modal";

import PartyForm from './PartyForm';
import Party from '../../../HostelStore/Components/PartyMaster';
import PartySearchComponent from './PartySearchComponent';
import moment from 'moment';
import ContactPersonSearch from './ContactPersonSearch';
import { leadCancelReason, reference } from '../../../Utils/DropdownData';
const MODEL = "Lead Form";

const LeadPageForm = ({ setSearchValue, id, setId, setLeadPageOpen, onClick, searchValue, setReadOnly, readOnly, getNextDocId, docId, setDocId }) => {
    const [form, setForm] = useState(true);

    const today = new Date()

    const [name, setName] = useState("")
    const [dueDate, setDueDate] = useState()
    const [contact, setContact] = useState()
    const [contactPersonName, setContactPersonName] = useState("")
    const [date, setDate] = useState(getDateFromDateTime(moment(today).format("YYYY-MM-DD")));
    const [active, setActive] = useState(true);
    const childRecord = useRef(0);
    const [workDescription, setWorkDescription] = useState("");
    const [comment, setComment] = useState("")
    const [clientId, setClientId] = useState("");
    const dispatch = useDispatch();
    const [referenceName, setReferenceName] = useState("CLIENT.REF");
    const [reason, setReason] = useState("")
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState()

    const companyId = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    const params = { companyId }
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )


    const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetLeadByIdQuery(id, { skip: !id });
    const [addData] = useAddLeadMutation();
    const [updateData] = useUpdateLeadMutation();
    const [removeData] = useDeleteLeadMutation();

    const {
        data: singlePartyData,
        isFetching: isSinglepartyFetching,
        isLoading: isSinglePartyLoading,
    } = useGetPartyByIdQuery(clientId, { skip: !clientId });

    // const getNextDocId = useCallback(() => {
    //     if (id || isLoading || isFetching) return
    //     if (allData?.nextDocId) {
    //         setDocId(allData.nextDocId)
    //     }
    // }, [allData, isLoading, isFetching, id])

    // useEffect(getNextDocId, [getNextDocId])


    const syncFormWithDb = useCallback(
        (data) => {
            if (id) setReadOnly(true);
            if (data?.docId) {
                setDocId(data?.docId)
            }
            setName(data?.name ? data.name : "");
            setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
            setLocation(data?.location ? data.location : "");
            setContact(data?.contact ? data.contact : "");
            setContactPersonName(data?.contactPersonName ? data?.contactPersonName : "")
            setActive(id ? (data?.active ? data.active : false) : true);
            setClientId(data?.clientId ? data?.clientId : "")
            setDueDate(id ? (data?.dueDate ? moment.utc(data?.dueDate).format("YYYY-MM-DD") : "") : getDateFromDateTime(moment(today).format("YYYY-MM-DD")));
            setComment(data?.comment ? data?.comment : "")
            setWorkDescription(data?.workDescription ? data.workDescription : "");
            setReferenceName(data?.referenceName ? data?.referenceName : "CLIENT.REF");
            setReason(data?.reason ? data?.reason : "")

            childRecord.current = data?.childRecord ? data?.childRecord : 0;
        }, [id])

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


    const data = {
        name, active, location, branchId, clientId, isClient: true, referenceName, reason,
        companyId, id, workDescription, comment, dueDate, contactPersonName, contact
    }

    const validateData = (data) => {
        if (data.workDescription && data?.clientId) {
            return true;
        }
        return false;
    }



    const onNew = () => {
        getNextDocId()
        setId("");
        syncFormWithDb(undefined)
        setReadOnly(false);
        setSearchValue("");
        setContact("")

    }



    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            if (returnData.statusCode === 0) {
                // setId("")
                // syncFormWithDb(undefined)
                toast.success(text + "Successfully", {
                    position: toast.POSITION.TOP_CENTER
                });

            } else {
                toast.error(returnData?.message)
            }
        } catch (error) {
            console.log("handle")
        }
    }



    const saveData = () => {
        if (!validateData(data)) {
            toast.info("Please fill all required fields...!", { position: "top-center" })
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
                await removeData(id).unwrap();
                setId("");
                toast.success("Deleted Successfully");
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

    useEffect(() => {
        if (!clientId) return

        if (id) return

        if (singlePartyData?.data?.contactPersonName && singlePartyData?.data?.contactMobile) {

            setContact(singlePartyData?.data?.contactMobile);
            setContactPersonName(singlePartyData?.data?.contactPersonName)
            setLocation(singlePartyData?.data?.address)
        }


        else {
            setContactPersonName(singlePartyData?.data?.contactPersonName)
            setLocation(singlePartyData?.data?.address)
            setContact(singlePartyData?.data?.contactDetails?.find(val => val.contactPersonName === contactPersonName)?.mobileNo || singlePartyData?.data?.contactMobile)
        }



    }, [setContact, clientId, singlePartyData, setLocation])


    useEffect(() => {
        if (id && readOnly) return

        setContact(singlePartyData?.data?.contactDetails?.find(val => val.contactPersonName === contactPersonName)?.mobileNo)

    }, [contactPersonName, setContact])


    useEffect(() => {
        if (id) return
        let validDate = new Date();
        validDate.setDate(validDate.getDate() + 0)
        setDueDate(moment(validDate).format("YYYY-MM-DD"))
    }, [setDueDate, id])

    return (
        <div className='md:items-start md:justify-items-center grid h-full bg-theme'>
            <div className='flex flex-col frame w-full h-full'>
                <FormHeader
                    onNew={onNew}
                    model={MODEL}

                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                />



                <div className='grid grid-cols-2 gap-y-1 mt-2 w-full px-5'>
                    <DisabledInput name="LeadNo" value={docId} required={true} readOnly={readOnly} />
                    <DisabledInput name="Lead. 
                           Date" value={date} type={"Date"} required={true} readOnly={readOnly} />


                    <PartySearchComponent setPartyId={setClientId} partyId={clientId} name={"Client"} readOnly={readOnly} id={id} />
                    <ContactPersonSearch setContactPersonName={setContactPersonName} contactPersonName={contactPersonName} name={"ContactPersonName"} clientId={clientId} setContact={setContact} search={search} setSearch={setSearch} readOnly={readOnly} />
                    <TextInput name="Phone" type="number" value={contact} setValue={setContact} readOnly={readOnly} />

                    <TextInput name="Address" type="text" value={location} setValue={setLocation} readOnly={readOnly} disabled={(childRecord.current > 0)} />





                </div>


                <div className='grid grid-cols-2 mt-4 w-full px-5'>

                    <div className='grid grid-cols-1 md:grid-cols-3  md:my-0.5 md:px-1 data '>
                        <label className={`mt-2`}>Reference</label>
                        <select
                            disabled={readOnly}
                            className='w-52 border border-gray-500  rounded h-8 '
                            value={referenceName} onChange={(e) => { setReferenceName(e.target.value); }} >

                            {reference.map((option, index) => <option key={index} value={option.value} >
                                {option.show}
                            </option>)}
                        </select>
                    </div>

                    <div className='flex gap-x-2 w-full mt-5'>
                        <div className=' w-32 text-xs underline -mt-3 ml-1'>Comment :</div>
                        <div className=' w-3/4 -mt-6 ml-1'>

                            <textarea readOnly={readOnly} className=" w-[204px] h-16 overflow-auto focus:outline-none border border-gray-500 rounded p-2 text-xs"
                                value={comment} onChange={(e) => { setComment(e.target.value) }} ></textarea>

                        </div>

                    </div>
                </div>


                <div className=" w-full grid grid-cols-2">

                    <div className=' ml-5'>
                        <DateInput name="FollowUp.Date" value={dueDate} setValue={setDueDate} required={true} readOnly={readOnly} />

                    </div>




                </div>

                <div className="w-full grid grid-cols-1 ml-6 mt-3">
                    <div className='flex gap-x-2 w-full'>
                        <div className='mt-2 w-32 text-sm underline'>Description :<span className='text-red-600 text-xs'>*</span></div>
                        <div className='w-full'>

                            <textarea readOnly={readOnly} className=" w-3/4 h-28 ml-1 overflow-auto focus:outline-none border border-gray-500 rounded p-2 text-xs"
                                value={workDescription} onChange={(e) => { setWorkDescription(e.target.value) }} ></textarea>



                        </div>

                    </div>
                </div>

                <div className=" w-full flex gap-x-20 mt-3">
                    <div className='ml-4'>
                        <CheckBox name="Active" value={active} setValue={setActive} readOnly={readOnly} />

                    </div>

                    <div>
                        {
                            !active &&

                            <DropdownInput name="Reason" options={leadCancelReason} value={reason} setValue={setReason} readOnly={readOnly} disabled={(childRecord.current > 0)} />




                        }
                    </div>


                </div>



            </div>
            <div className='flex gap-x-10 pt-2'>
                <button className="bg-green-600 text-white rounded-md p-1 w-32 h-10 mt-2 text-md "



                    onClick={saveData}
                >Save</button>
                <button className="bg-red-600 text-white rounded-md p-1 w-32 h-10 mt-2 text-md "



                    onClick={onClick}
                >Close</button>
            </div>

        </div>






    )
}

export default LeadPageForm