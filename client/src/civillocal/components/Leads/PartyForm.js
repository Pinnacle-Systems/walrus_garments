import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DateInput, DisabledInput, DropdownInput, TextArea, TextInput, CheckBox } from '../../../Inputs'
import ReportTemplate from '../../../Basic/components/ReportTemplate';



import FormHeader from '../../../Basic/components/FormHeader';
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';

import { useAddPartyMutation, useDeletePartyMutation, useGetPartyByIdQuery, useGetPartyQuery, useUpdatePartyMutation } from '../../../redux/services/PartyMasterService';

import Modal from "../../../UiComponents/Modal";


const MODEL = "Party Form";

const PartyForm = ({ id, setId }) => {

    const today = new Date()
    const [name, setName] = useState("")
    const [active, setActive] = useState(true);
    const childRecord = useRef(0);
    const [readOnly, setReadOnly] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const companyId = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    const params = { companyId }
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )

    const { data: allData, isLoading, isFetching } = useGetPartyQuery({ params, searchParams: searchValue });

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetPartyByIdQuery(id, { skip: !id });

    const [addData] = useAddPartyMutation();
    const [updateData] = useUpdatePartyMutation();
    const [removeData] = useDeletePartyMutation();



    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    )


    const syncFormWithDb = useCallback(
        (data) => {
            if (id) setReadOnly(true);
            setName(data?.name ? data.name : "");
            setActive(id ? (data?.active ? data.active : false) : true);
            childRecord.current = data?.childRecord ? data?.childRecord : 0;
        }, [id])

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


    const data = {
        name,
        active, companyId,
        id, userId, isLeadForm: true
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
            if (returnData.statusCode === 0) {
                setId("")
                syncFormWithDb(undefined)
                toast.success(text + "Successfully");
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

    const onNew = () => {
        setId("");
        setReadOnly(false);

        setSearchValue("")
    }

    function onDataClick(id) {
        setId(id);

    }



    return (
        <div className='md:items-start md:justify-items-center grid h-full bg-theme'>


            <div className='flex flex-col frame w-full h-full'>

                <FormHeader
                    onNew={onNew}

                    model={MODEL}
                    saveData={saveData}
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                />



                <div className='grid grid-cols-1 my-5 gap-y-5 w-3/4 px-5'>

                    <TextInput name="Name" type="text" value={name} setValue={setName} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                    <CheckBox name="Active" value={active} setValue={setActive} readOnly={readOnly} />

                </div>


            </div>
        </div>






    )
}

export default PartyForm