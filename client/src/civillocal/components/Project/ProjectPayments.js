import React, { useCallback, useEffect, useRef, useState } from 'react'
import { getDateFromDateTime, substract } from '../../../Utils/helper';
import { DisabledInput, TextArea, TextInput, CheckBox } from '../../../Inputs';
import { useGetPartyByIdQuery } from '../../../redux/services/PartyMasterService';
import { paymentMethods } from '../../../Utils/DropdownData';
import FormReport from '../../../Basic/components/FormReportTemplate';
import { useDispatch } from 'react-redux';
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';
import { useAddProjectPaymentMutation, useDeleteProjectPaymentMutation, useGetProjectPaymentByIdQuery, useGetProjectPaymentQuery, useUpdateProjectPaymentMutation } from '../../../redux/services/ProjectPaymentService';
import FormHeader from '../../../Basic/components/FormHeader';
import moment from 'moment';
import { useGetQuotesQuery } from '../../../redux/services/QuotesService';


const ProjectPayments = ({ partyId, projectId, address, onClick, setIsOpenPayments }) => {
    const today = new Date()


    const [userDate, setUserDate] = useState();

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("")
    const [docId, setDocId] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(getDateFromDateTime(today));
    const [bankCharges, setBankCharges] = useState();
    const [notes, setNotes] = useState();
    const [paymentMethod, setPaymentMethod] = useState("");
    const [projectAmount, setProjectAmount] = useState();
    const [alreadyPayment, setAlreadyPayment] = useState();

    const [balanceAmount, setBalanceAmount] = useState();
    const [isCompany, setIsCompany] = useState(false);
    const [isPersonal, setIsPersonal] = useState(false);
    const [handoverTo, setHandoverTo] = useState("");
    const [collectBy, setCollectBy] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);
    const dispatch = useDispatch()
    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )
    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    )
    const params = {
        companyId, branchId, projectId: parseInt(projectId)
    };
    const { data: clientData } = useGetPartyByIdQuery(partyId, { skip: !partyId })
    const { data: allData, isLoading, isFetching } = useGetProjectPaymentQuery({ params, searchParams: searchValue });

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetProjectPaymentByIdQuery({ id }, { skip: !id });

    const [addData] = useAddProjectPaymentMutation();
    const [updateData] = useUpdateProjectPaymentMutation();
    const [removeData] = useDeleteProjectPaymentMutation();

    const { data: quotesData } = useGetQuotesQuery({ params });






    function getNextDocId() {
        if (id || isLoading || isFetching) return
        if (allData?.nextDocId) {
            setDocId(allData.nextDocId)
        }
    }


    // const getNextDocId = useCallback(() => {
    //     if (id || isLoading || isFetching) return
    //     if (allData?.nextDocId) {
    //         setDocId(allData.nextDocId)
    //     }
    // }, [allData, isLoading, isFetching, id])

    // useEffect(getNextDocId, [getNextDocId])

    const syncFormWithDb = useCallback((data) => {
        if (id) {
            setReadOnly(true);
        } else {
            setReadOnly(false);
        }
        if (data?.docId) {
            setDocId(data?.docId)
        }
        setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
        // setProjectAmount(data?.projectAmount ? data?.projectAmount : "");
        setAmount(data?.amount ? data?.amount : "");
        setPaymentMethod(data?.paymentMethod ? data?.paymentMethod : "");
        setIsCompany(data?.isCompany ? data?.isCompany : false);
        setIsPersonal(data?.isPersonal ? data?.isPersonal : false);
        setHandoverTo(data?.handoverTo ? data?.handoverTo : "")
        setCollectBy(data?.collectBy ? data?.collectBy : "")
        setNotes(data?.notes ? data?.notes : "");
        setAlreadyPayment(data?.alreadyPayment ? data?.alreadyPayment : "");
        setUserDate(data?.userDate ? moment(data?.userDate).format("YYYY-MM-DD") : "");
        childRecord.current = data?.childRecord ? data?.childRecord : 0;

    }, [id]);

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);


    const data = {
        companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), id, projectId, userDate,
        projectAmount, amount, paymentMethod, isCompany, isPersonal, collectBy, handoverTo, notes, branchId, partyId, alreadyPayment
    }



    const validateData = (data) => {
        if (data.projectAmount && data.amount && data.paymentMethod) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            console.log(returnData, "returnpay")
            if (returnData.statusCode === 0) {
                setId(returnData?.data?.id)
                // syncFormWithDb(undefined)
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
                let returnData = await removeData(id).unwrap();
                if (returnData.statusCode === 0) {
                    setId("")
                    syncFormWithDb(undefined)
                    toast.success("Deleted Successfully");
                } else {
                    toast.error(returnData?.message)
                }
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
        if (allData?.nextDocId) {
            setDocId(allData.nextDocId)
        }
        setId("");
        setReadOnly(false);
        setSearchValue("");
        setNotes("")
        syncFormWithDb(undefined)
        // let projectAmount = allData?.data ? (allData?.data?.find(val => parseInt(val.projectId) === parseInt(projectId))?.projectAmount) : 0
        // setProjectAmount(projectAmount)
        const sumAmount = allData?.data ? allData?.data?.reduce((a, b) => a + parseFloat(b.amount), 0) : 0

        setAlreadyPayment(parseFloat(sumAmount).toFixed(3))


    }



    function onDataClick(id) {
        setId(id);

    }

    const tableHeaders = ["Date", "Amount"]
    const tableDataNames = ['dataObj?.userDate', 'dataObj.amount']

    // useEffect(() => {
    //     let projectAmount = allData?.data ? (allData?.data?.find(val => parseInt(val.projectId) === parseInt(projectId))?.projectAmount) : 0
    //     setProjectAmount(projectAmount)
    // }, [allData, isLoading, isFetching])


    useEffect(() => {
        let quotesItems = quotesData?.data?.find(val => parseInt(val.projectId) === parseInt(projectId))
        let currentVersion = quotesItems?.quoteVersion
        let totalCost;
        let transportTaxValue;

        totalCost = (quotesItems?.QuotesItems?.filter(item => item.quoteVersion == currentVersion) || [])



        totalCost = totalCost?.reduce((a, b, index) => a + ((substract(parseFloat(b.qty) * parseFloat(b.price), parseFloat(b?.discount || 0))) + ((parseFloat(b.qty) * parseFloat(b.price)) * ((b.taxPercent ? b.taxPercent.replace("%", "") : 0) / 100))), 0)



        if (quotesItems?.transportTax?.includes("%")) {
            transportTaxValue = quotesItems?.transportCost * (quotesItems?.transportTax.replace("%", "") / 100)

        }
        else {
            transportTaxValue = quotesItems?.transportCost * (quotesItems?.transportTax / 100)
        }

        totalCost = totalCost + parseInt(quotesItems?.transportCost || 0) + parseInt(transportTaxValue || 0)

        setProjectAmount(totalCost)
    }, [projectId, quotesData])

    useEffect(() => {

        setBalanceAmount(parseFloat(projectAmount || 0) - (parseFloat(amount || 0) + parseFloat(alreadyPayment || 0)))
    }, [amount, projectAmount, id, setBalanceAmount, singleData, isSingleFetching, isSingleLoading, alreadyPayment])

    useEffect(() => {
        if (id) return

        let sumAmount = allData?.data ? (allData?.data?.reduce((a, b, index) => a + parseFloat(b.amount), 0)) : 0
        setAlreadyPayment(sumAmount)

    }, [allData, isLoading, isFetching, setAlreadyPayment, id])



    return (

        <div onKeyDown={handleKeyDown} className='md:items-start md:justify-items-center grid h-full bg-theme'>{console.log(projectAmount, "proj")}
            <div className='flex flex-col frame w-full h-full'>

                <div className="bg-stone-500 text-white text-center py-1">Project Payments </div>
                <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
                    <div className='col-span-3 grid md:grid-cols-1 border overflow-auto'>
                        <div className='mr-1 md:ml-2'>
                            <fieldset className='frame my-1'>
                                <legend className='sub-heading'>Payments</legend>


                                <div className='grid grid-cols-3 gap-y-3 mt-5'>
                                    <DisabledInput name="Doc Id." value={docId} required={true} readOnly={true} />

                                    <div className='grid grid-cols-1 md:grid-cols-3 items-center md:my-1 md:px-1 data w-full '>
                                        <label className={` `}>User Date</label>
                                        <input type={"date"}
                                            className={` focus:outline-none md:col-span-2 border border-gray-500 rounded w-32  p-0.5`} id='id' value={userDate} onChange={(e) => { setUserDate(e.target.value); }} readOnly={readOnly} />
                                    </div>

                                    {/* <div className={`flex gap-x-5  items-center md:my-0.5 md:px-1 data  w-3/4`}>
                                        <label className={`md:text-start flex `}>Doc.Date</label>
                                        <input type={"Date"} className="input-field focus:outline-none md:col-span-2 border border-gray-500 rounded" value={date} disabled />
                                    </div> */}


                                    <div className={`grid grid-cols-3 items-center md:my-0.5 md:px-1 data  w-full -ml-9`}>
                                        <label className={` `}>Client Name</label>
                                        <input type={"text"} className="input-field w-3/4 px-1 focus:outline-none md:col-span-2 border border-gray-500 rounded" value={clientData?.data?.name} disabled />
                                    </div>

                                    <TextInput name={"ProjectAmount"} value={projectAmount ? parseFloat(projectAmount).toFixed(2) : 0} setValue={setProjectAmount} className={"w-full"} required={true} readOnly={readOnly} />

                                    <div className={`flex gap-x-12  items-center md:my-0.5 md:px-1 data  w-3/4`}>
                                        <label className={`md:text-start flex`} >Amount <span className='text-red-600'>*</span></label>
                                        <input type={"number"} className='w-full p-1 focus:outline-none md:col-span-2 border-gray-500 border rounded ' value={amount} onChange={(e) => { setAmount(e.target.value) }} readOnly={readOnly} />
                                    </div>

                                    <div className={`grid grid-cols-3 items-center md:my-0.5 md:px-1 data  w-full -ml-9`}>
                                        <label className={` `}>Balance Amount</label>
                                        <input type={"number"} className="w-2/4 p-1 px-1 focus:outline-none md:col-span-2 border border-gray-500 rounded" value={balanceAmount ? parseFloat(balanceAmount).toFixed(2) : 0} disabled />
                                    </div>

                                </div>
                                <div className='flex gap-x-10 mt-3'>
                                    <div className='flex gap-x-10 items-center md:my-1 md:px-1 data'>
                                        <label className={`md:text-start flex `}>Methods <span className='text-red-600'>*</span></label>
                                        <select

                                            disabled={readOnly}
                                            className='text-left w-40 ml-0.5 rounded py-1 table-data-input border border-gray-400'
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        >
                                            <option className='text-gray-600' hidden>

                                            </option>
                                            {paymentMethods?.map((data) =>
                                                <option value={data.value} key={data.show}>
                                                    {data.show}
                                                </option>
                                            )}
                                        </select>
                                    </div>

                                    {
                                        (paymentMethod !== "CASH" && paymentMethod !== "") &&
                                        <div className='flex gap-x-9 -ml-4'>
                                            <CheckBox name="Company.Ac" value={isCompany} setValue={setIsCompany} readOnly={readOnly} />
                                            <CheckBox name="Personal.Ac" value={isPersonal} setValue={setIsPersonal} readOnly={readOnly} />

                                        </div>

                                    }







                                    {
                                        (paymentMethod === "CASH") &&

                                        <div className='flex gap-x-5 -ml-3 w-full'>
                                            <TextInput type={"text"} required={true} name={"Collected.By"} value={collectBy} setValue={setCollectBy} className={"w-full"} inputClass={"ml-1 p-1 w-full"} readOnly={readOnly} />
                                            <TextInput type={"text"} required={true} name={"Handover.To"} value={handoverTo} setValue={setHandoverTo} className={"w-full"} inputClass={"ml-5 p-1 w-full"} readOnly={readOnly} />


                                        </div>
                                    }


                                </div>

                                <div className={`flex gap-x-9  md:my-0.5 md:px-1 data  w-1/4 pt-4`}>
                                    <label className={`w-3/4 pt-1`}>Al.Payment</label>
                                    <input type={"number"} className="p-1 focus:outline-none md:col-span-2 border border-gray-500 rounded" value={alreadyPayment ? parseFloat(alreadyPayment).toFixed(3) : 0} disabled />
                                </div>



                                <div className='flex gap-x-5 justify-start text-xs items-center w-3/4 mt-5'>
                                    <label className='text-center w-24'>Notes :</label>
                                    <textarea className='focus:outline-none  w-full h-20 border border-gray-500 rounded' value={notes} onChange={(e) => setNotes(e.target.value)} readOnly={readOnly}>  </textarea>
                                </div>
                                <div className='flex gap-x-10 pb-5 pt-9 justify-center'>
                                    <button className="bg-blue-600 text-white rounded-md p-1 w-32 h-10 mt-2 text-md "



                                        onClick={onNew}
                                    >New</button>
                                    <button className="bg-yellow-600 text-white rounded-md p-1 w-32 h-10 mt-2 text-md "



                                        onClick={() => setReadOnly(false)}
                                    >Edit</button>
                                    <button className="bg-green-600 text-white rounded-md p-1 w-32 h-10 mt-2 text-md "



                                        onClick={saveData}
                                    >Save</button>
                                    <button className="bg-red-600 text-white rounded-md p-1 w-32 h-10 mt-2 text-md "



                                        onClick={onClick}
                                    >Close</button>

                                </div>


                            </fieldset>
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
        </div>

    )
}

export default ProjectPayments