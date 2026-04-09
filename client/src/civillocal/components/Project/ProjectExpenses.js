import React, { useCallback, useEffect, useRef, useState } from 'react'
import { getDateFromDateTime } from '../../../Utils/helper';
import { DisabledInput, TextArea, TextInput, CheckBox, DateInput } from '../../../Inputs';
import { useGetPartyByIdQuery } from '../../../redux/services/PartyMasterService';
import { expenses, paymentMethods } from '../../../Utils/DropdownData';
import FormReport from '../../../Basic/components/FormReportTemplate';
import { useDispatch } from 'react-redux';
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';
import { useAddProjectPaymentMutation, useDeleteProjectPaymentMutation, useGetProjectPaymentByIdQuery, useGetProjectPaymentQuery, useUpdateProjectPaymentMutation } from '../../../redux/services/ProjectPaymentService';
import FormHeader from '../../../Basic/components/FormHeader';
import moment from 'moment';
import PartySearchOnly from './PartySearchOnly';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import LabourExpense from './LabourExpense';


const ProjectExpenses = ({ partyId, projectId, address, onClick, setIsOpenExpenses }) => {
    const today = new Date()
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("")
    const [docId, setDocId] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(getDateFromDateTime(today));
    const [validDate, setValidDate] = useState();
    const [userDate, setUserDate] = useState();
    const [bankCharges, setBankCharges] = useState();
    const [notes, setNotes] = useState();
    const [paymentMethod, setPaymentMethod] = useState("");
    const [invoiceNo, setInvoiceNo] = useState()
    const [invoiceValue, setInvoiceValue] = useState()
    const [vendorId, setVendorId] = useState()
    const [balanceAmount, setBalanceAmount] = useState();
    const [isCompany, setIsCompany] = useState(false);
    const [isPersonal, setIsPersonal] = useState(false);
    const [givenBy, setGivenBy] = useState("");
    const [collectBy, setCollectBy] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [transportCost, setTransportCost] = useState()
    const [expenseItems, setExpenseItems] = useState([]);
    const [alreadyPayment, setAlreadyPayment] = useState();
    const [expenseType, setExpenseType] = useState();
    const [foodCost, setFoodCost] = useState();
    const [formExpenseType, setFormExpenseType] = useState("ALL");

    const [otherExpenses, setOtherExpenses] = useState()

    const childRecord = useRef(0);
    const dispatch = useDispatch();

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
        companyId, branchId, projectId: parseInt(projectId), isExpenses: true
    };
    const { data: clientData } = useGetPartyByIdQuery(partyId, { skip: !partyId })
    const { data: allData, isLoading, isFetching } = useGetProjectPaymentQuery({ params, searchParams: searchValue });

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetProjectPaymentByIdQuery({ id, params }, { skip: !id, });

    const [addData] = useAddProjectPaymentMutation();
    const [updateData] = useUpdateProjectPaymentMutation();
    const [removeData] = useDeleteProjectPaymentMutation();

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
        setInvoiceNo(data?.invoiceNo ? data?.invoiceNo : "");
        setInvoiceValue(data?.invoiceValue ? data?.invoiceValue : "");
        setAmount(data?.amount ? data?.amount : "");
        setPaymentMethod(data?.paymentMethod ? data?.paymentMethod : "");
        setIsCompany(data?.isCompany ? data?.isCompany : false);
        setIsPersonal(data?.isPersonal ? data?.isPersonal : false);
        setGivenBy(data?.givenBy ? data?.givenBy : "")
        setCollectBy(data?.collectBy ? data?.collectBy : "");
        // setValidDate(data?.validDate ? moment(data?.validDate).format("YYYY-MM-DD") : "");
        setUserDate(data?.userDate ? moment(data?.userDate).format("YYYY-MM-DD") : "");
        setNotes(data?.notes ? data?.notes : "");
        setTransportCost(data?.transportCost ? data?.transportCost : "");
        // setBalanceAmount(data?.balanceAmount ? data?.balanceAmount : "");
        setExpenseItems(data?.projectExpensesItems ? data?.projectExpensesItems : []);
        setVendorId(data?.vendorId ? data?.vendorId : undefined);
        setExpenseType(data?.expenseType ? data?.expenseType : "MATERIAL");
        setFoodCost(data?.foodCost ? data?.foodCost : "");
        setOtherExpenses(data?.otherExpense ? data?.otherExpense : "")
        // setAlreadyPayment(data?.alreadyPayment ? data?.alreadyPayment : "")
        childRecord.current = data?.childRecord ? data?.childRecord : 0;

    }, [id]);

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);


    const data = {
        companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"),
        id,
        projectId,
        otherExpenses,
        //  alreadyPayment, 
        expenseType,
        foodCost,
        userDate,
        invoiceNo,
        notes,
        branchId,
        vendorId,
        invoiceValue,
        transportCost,
        // validDate,
        isExpenses: true,
        projectExpensesItems: expenseItems
    }



    const validateData = (data) => {
        if (expenseType == "LABOUR") {
            if (expenseItems?.length > 0) return true;
            return false
        }
        else if (expenseType == "OTHER") {
            console.log(data?.otherExpenses, "data?.otherExpense")
            if (!data?.otherExpenses) return false
            return true;
        }
        else {
            if (data.vendorId) {
                return true;
            }
            return false;
        }

    }

    const validateInvoiceValue = () => {
        if (expenseType === "LABOUR") return true;
        if (expenseType === "OTHER") return true;
        if (parseFloat(invoiceValue) !== parseFloat(expenseItems ? expenseItems?.reduce((a, b) => a + parseFloat(b.payment), 0) : 0)) return false

        return true
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
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
        if (!validateInvoiceValue(data)) {
            toast.info("Invoice Value not matching with Payment...!", { position: "top-center" })
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
                let returnData = await removeData(id, { params }).unwrap();
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
        syncFormWithDb(undefined);
        setInvoiceValue()
    }

    function onDataClick(id) {
        setId(id);

    }

    function removeItem(index) {
        setExpenseItems(contactDetails => {
            return contactDetails.filter((_, i) => parseInt(i) !== parseInt(index))
        });
    }


    function handleInputChange(value, index, field) {

        const newBlend = structuredClone(expenseItems);

        newBlend[index][field] = value;
        if (field === "isCompany") {

            newBlend[index][field] = value;
            newBlend[index]["isPersonal"] = !value;
        }
        if (field === "isPersonal") {

            newBlend[index][field] = value;
            newBlend[index]["isCompany"] = !value;
        }

        setExpenseItems(newBlend);
    };



    // useEffect(() => {
    //     if (id) return
    //     const projectAmount = allData?.data ? (allData?.data?.find(val => parseInt(val.vendorId) === parseInt(vendorId))?.invoiceValue) : 0

    //     setInvoiceValue(projectAmount || 0)
    // }, [vendorId])


    // useEffect(() => {
    //     let filterData = allData?.data ? (allData?.data?.filter(val => parseInt(val.vendorId) === parseInt(vendorId))) : []
    //     let expensesData = filterData?.flatMap(val => val.projectExpensesItems)
    //     if (id) {
    //         setBalanceAmount(parseFloat(invoiceValue || 0) - (parseFloat(expenseItems ? expenseItems?.reduce((a, b) => a + parseFloat(b.payment), 0) : 0) + parseFloat(alreadyPayment || 0)))

    //     }
    //     else if (expensesData?.length > 0) {


    //         setBalanceAmount(parseFloat(invoiceValue || 0) - (parseFloat(expensesData ? expensesData?.reduce((a, b) => a + parseFloat(b.payment), 0) : 0)))
    //     }
    //     else {
    //         setBalanceAmount(parseFloat(invoiceValue || 0) - (parseFloat(expenseItems ? expenseItems?.reduce((a, b) => a + parseFloat(b.payment), 0) : 0) + parseFloat(alreadyPayment || 0)))

    //     }

    // }, [invoiceValue, id, setBalanceAmount, allData, alreadyPayment, vendorId, expenseItems])



    // useEffect(() => {
    //     if (id) return
    //     if (!vendorId) return
    //     let filterData = allData?.data ? (allData?.data?.filter(val => parseInt(val.vendorId) === parseInt(vendorId))) : []
    //     let expensesData = filterData?.flatMap(val => val.projectExpensesItems)


    //     let sumAmount = expensesData ? (expensesData?.reduce((a, b, index) => a + parseFloat(b.payment), 0)) : 0
    //     setAlreadyPayment(sumAmount)

    // }, [allData, isLoading, isFetching, setAlreadyPayment, id, vendorId])


    const findTotalAmount = (expenseId) => {
        let expense = allData?.data?.find(val => parseInt(val.id) === parseInt(expenseId))
        let expenseType = expense?.expenseType
        if (expenseType == "LABOUR") {
            let labourAmount = expense?.projectExpensesItems?.reduce((a, b) => a + parseFloat(parseFloat(b.noOfShift) * parseFloat(b.rate)), 0)
            let total = parseFloat(expense?.transportCost) + parseFloat(expense?.foodCost) + parseFloat(labourAmount)
            return parseFloat(total).toFixed(2)
        }
        else if (expenseType == "OTHER") {
            return parseFloat(expense?.otherExpenses).toFixed(2)

        }
        else {
            let itemAmount = expense?.projectExpensesItems?.reduce((a, b) => a + parseFloat(b.payment), 0)
            let total = parseFloat(expense?.transportCost) + parseFloat(itemAmount)
            return parseFloat(total).toFixed(2)
        }
    }

    const findTotalExpenses = () => {
        if (formExpenseType === "LABOUR") {

            let expense = allData?.data?.filter(val => val?.expenseType == "LABOUR")
            let total = 0;
            if (expense?.length === 0) return ""
            for (let i = 0; i < expense.length; i++) {

                let labourAmount = expense[i]?.projectExpensesItems?.reduce((a, b) => a + parseFloat(parseFloat(b.noOfShift) * parseFloat(b.rate)), 0)
                total += parseFloat(expense[i]?.transportCost || 0) + parseFloat(expense[i]?.foodCost || 0) + parseFloat(labourAmount || 0)


            }

            return parseFloat(total).toFixed(2)

        }
        else if (formExpenseType === "MATERIAL") {
            let total = 0;
            let expense = allData?.data?.filter(val => val?.expenseType == "MATERIAL")
            if (expense?.length === 0) return ""
            for (let i = 0; i < expense.length; i++) {
                let itemAmount = expense[i]?.projectExpensesItems?.reduce((a, b) => a + parseFloat(b.payment || 0), 0)
                total += parseFloat(expense[i]?.transportCost || 0) + parseFloat(itemAmount)

            }
            return parseFloat(total).toFixed(2)
        }
        else if (formExpenseType === "OTHER") {
            let total = 0;
            let expense = allData?.data?.filter(val => val?.expenseType === "OTHER")
            if (expense?.length === 0) return ""


            total = expense?.reduce((a, b) => a + parseFloat(b.otherExpenses || 0), 0)
            return parseFloat(total).toFixed(2)
        }
        else {
            let total = 0;
            let expense = allData?.data

            if (expense?.length === 0) return

            for (let i = 0; i < expense.length; i++) {
                let itemAmount = expense[i]?.projectExpensesItems?.reduce((a, b) => a + parseFloat(b.payment || 0), 0)

                let labourAmount = expense[i]?.projectExpensesItems?.reduce((a, b) => a + parseFloat(b.noOfShift * parseFloat(b.rate)), 0)
                let otherAmount = parseFloat(expense[i]?.otherExpenses || 0)



                total += parseFloat(expense[i]?.transportCost || 0) + parseFloat(itemAmount || 0) + parseFloat(labourAmount || 0) + parseFloat(otherAmount) + parseFloat(expense[i]?.foodCost || 0)
                console.log(total, "tpppp")

            }
            return parseFloat(total).toFixed(2)

        }
    }

    const tableHeaders = ["Expense", "Total"]
    const tableDataNames = ['dataObj?.userDate', 'dataObj.invoiceValue']
    return (

        <div onKeyDown={handleKeyDown} className='md:items-start md:justify-items-center grid h-full bg-theme'>
            <div className='flex flex-col frame w-full h-full'>

                <div className="bg-stone-500 text-white text-center py-1">Project Expenses</div>
                <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
                    <div className='col-span-3 grid md:grid-cols-1 border overflow-auto'>
                        <div className='mr-1 md:ml-2'>
                            <fieldset className='frame my-1'>
                                <legend className='sub-heading'>Expenses</legend>


                                <div className='grid grid-cols-3 gap-y-3 mt-5'>
                                    <DisabledInput name="Doc Id." value={docId} required={true} readOnly={true} />



                                    <div className='flex gap-x-10 items-center md:my-1 md:px-1 data'>
                                        <label className={`md:text-start flex `}>Expense <span className='text-red-600'>*</span></label>
                                        <select

                                            disabled={readOnly}
                                            className='text-left w-40 ml-1.5 rounded py-1 tx-table-input border border-gray-400'
                                            value={expenseType}
                                            onChange={(e) => setExpenseType(e.target.value)}
                                        >
                                            <option className='text-gray-600' hidden>

                                            </option>
                                            {expenses.map((data) =>
                                                <option value={data.value} key={data.show}>
                                                    {data.show}
                                                </option>
                                            )}
                                        </select>
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-3 items-center md:my-1 md:px-1 data w-full '>
                                        <label className={``}>User Date</label>
                                        <input type={"date"}
                                            className={` focus:outline-none md:col-span-2 border border-gray-500 rounded w-32  p-0.5`} id='id' value={userDate} onChange={(e) => { setUserDate(e.target.value); }} readOnly={readOnly} />
                                    </div>

                                </div>{console.log(expenseType, "expensetypeee")}



                                {
                                    expenseType === "LABOUR" ?
                                        <LabourExpense setFoodCost={setFoodCost} foodCost={foodCost} transportCost={transportCost} setTransportCost={setTransportCost} readOnly={readOnly} expenseItems={expenseItems} setExpenseItems={setExpenseItems} childRecord={childRecord} />
                                        :
                                        expenseType === "MATERIAL" ?
                                            <>
                                                <div className='grid grid-cols-3 gap-y-3'>
                                                    <PartySearchOnly setPartyId={setVendorId} partyId={vendorId} name={"Vendor Name"} isVendor={true} />



                                                    <TextInput name={"InvoiceNo"} value={invoiceNo} setValue={setInvoiceNo} className={"w-full"} readOnly={readOnly} />



                                                    <TextInput name={"InvoiceValue"} value={invoiceValue} setValue={setInvoiceValue} className={"w-full"} readOnly={readOnly} />





                                                </div>

                                                <div className='flex gap-x-5 justify-start  text-xs items-center w-3/4 mt-2'>
                                                    <label className={`md:text-start flex ml-1`}>Transport.Cost</label>
                                                    <input type={"number"} className={`${"focus:outline-none md:col-span-2 border-gray-500 border rounded w-32 py-1"} `} value={transportCost} onChange={(e) => { setTransportCost(e.target.value) }} readOnly={readOnly} />
                                                </div>


                                                <div className='flex gap-x-5 justify-start  text-xs items-center w-3/4 mt-2'>
                                                    <label className='text-center w-24'>Notes :</label>
                                                    <textarea className='focus:outline-none  w-full h-20 border border-gray-500 rounded' value={notes} onChange={(e) => setNotes(e.target.value)} readOnly={readOnly}>  </textarea>
                                                </div>

                                                <div className='mt-4 w-full p-5'>
                                                    <table className="border border-gray-500 w-full">
                                                        <thead className="border border-gray-500">
                                                            <tr>
                                                                <th className="border border-gray-500 text-sm w-12 p-1">S.no</th>
                                                                <th className="border border-gray-500 text-sm w-20 p-1">Payment</th>
                                                                <th className="border border-gray-500 text-sm w-20 p-1">Pymt.Date</th>
                                                                <th className="border border-gray-500 text-sm w-28 p-1">Method</th>


                                                                <th className="border border-gray-500 text-sm w-28 p-1">CollectBy/IsCompany</th>
                                                                <th className="border border-gray-500 text-sm w-28 p-1">Given.By/IsPersonal</th>
                                                                <th className='w-12'>
                                                                    <button type='button' className="text-green-700 p-1 w-8" onClick={() => {
                                                                        let newExpenseitems = [...expenseItems];
                                                                        newExpenseitems.push({});
                                                                        setExpenseItems(newExpenseitems);
                                                                    }}> {<FontAwesomeIcon icon={faUserPlus} />}

                                                                    </button>
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {expenseItems?.map((item, index) =>
                                                                <tr className="text-center" key={index}>

                                                                    <td className="border border-gray-500 text-xs p-1">
                                                                        {index + 1}
                                                                    </td>
                                                                    <td className="border border-gray-500 text-xs">
                                                                        <input className="w-full p-1 capitalize"
                                                                            type="text" value={item.payment} onChange={(e) => {
                                                                                handleInputChange(e.target.value, index, "payment")
                                                                            }} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                                                                    </td>
                                                                    <td className="border border-gray-500 text-xs">
                                                                        <input className="w-full p-1" type="date" value={item.paymentDate ? moment(item.paymentDate).format("YYYY-MM-DD") : ""} onChange={(e) => {
                                                                            handleInputChange(e.target.value, index, "paymentDate")
                                                                        }} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                                                                    </td>
                                                                    <td className="border border-gray-500 text-xs">
                                                                        <select

                                                                            disabled={readOnly}
                                                                            className='text-left w-full  rounded py-1 tx-table-input border border-gray-400'
                                                                            value={item.paymentMethod}
                                                                            onChange={(e) => handleInputChange(e.target.value, index, "paymentMethod")}
                                                                        >
                                                                            <option className='text-gray-600' hidden>

                                                                            </option>
                                                                            {paymentMethods?.map((data) =>
                                                                                <option value={data.value} key={data.show}>
                                                                                    {data.show}
                                                                                </option>
                                                                            )}
                                                                        </select>
                                                                    </td>

                                                                    {
                                                                        (item?.paymentMethod !== "CASH" && item?.paymentMethod !== "") &&
                                                                        <>
                                                                            <td className="border border-gray-500 text-xs">
                                                                                <input type="radio" name='isAccount' className='mx-2 py-2' checked={item?.isCompany} onChange={(e) => handleInputChange(e.target.checked, index, "isCompany")} disabled={readOnly} />

                                                                                {/* <CheckBox name="Company.Ac" value={isCompany} setValue={setIsCompany} readOnly={readOnly} /> */}
                                                                            </td>
                                                                            <td className="border border-gray-500 text-xs">
                                                                                <input type="radio" name='isAccount' className='mx-2 py-2' checked={item?.isPersonal} onChange={(e) => handleInputChange(e.target.checked, index, "isPersonal")} disabled={readOnly} />

                                                                            </td>
                                                                        </>


                                                                    }

                                                                    {
                                                                        (item?.paymentMethod === "CASH") &&

                                                                        <>
                                                                            <td className="border border-gray-500 text-xs">
                                                                                <input type={"text"} className={`${" focus:outline-none md:col-span-2 border-gray-500 border rounded w-full py-1"} `} value={item?.collectBy} onChange={(e) => handleInputChange(e.target.value, index, "collectBy")} readOnly={readOnly} />



                                                                            </td>
                                                                            <td className="border border-gray-500 text-xs">
                                                                                <input type={"text"} className={`${"focus:outline-none md:col-span-2 border-gray-500 border rounded w-full py-1"} `} value={item?.givenBy} onChange={(e) => handleInputChange(e.target.value, index, "givenBy")} readOnly={readOnly} />

                                                                            </td>
                                                                        </>
                                                                    }


                                                                    <td className="border border-gray-500 p-1 text-xs ">
                                                                        <button
                                                                            type='button'
                                                                            onClick={() => removeItem(index)}
                                                                            className='text-md text-red-600 ml-1'>{<FontAwesomeIcon icon={faTrashCan} />}</button>
                                                                    </td>

                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                            :
                                            <div className='grid grid-cols-3'>
                                                <TextInput name={"OtherExpense"} value={otherExpenses} setValue={setOtherExpenses} className={"w-full"} readOnly={readOnly} />

                                            </div>


                                }

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

                            formExpenseType={formExpenseType}
                            setFormExpenseType={setFormExpenseType}
                            projectExpenses={true}
                            findTotalExpenses={findTotalExpenses}
                            findTotalAmount={findTotalAmount}
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
            </div >























            {/* <div className={`grid grid-cols-3 items-center md:my-0.5 md:px-1 data  w-full `}>
                                        <label className={` `}>Balance Amount</label>
                                        <input type={"number"} className="w-32  p-1 ml-3 focus:outline-none md:col-span-2 border border-gray-500 rounded" value={balanceAmount ? parseFloat(balanceAmount).toFixed(3) : 0} disabled />
                                    </div>

                                    <div className='grid grid-cols-1 md:grid-cols-3 items-center md:my-1 md:px-1 data w-full '>
                                        <label className={`-ml-7 `}>Valid Until</label>
                                        <input type={"date"}
                                            className={` focus:outline-none md:col-span-2 border border-gray-500 rounded w-32 -ml-8 p-0.5`} id='id' value={validDate} onChange={(e) => { setValidDate(e.target.value); }} readOnly={readOnly} />
                                    </div>
                                    <div className={`flex gap-x-9  md:my-0.5 md:px-1 data  w-1/4`}>
                                        <label className={`w-3/4 pt-1`}>Al.Payment</label>
                                        <input type={"number"} className="p-1 focus:outline-none md:col-span-2 border border-gray-500 rounded" value={alreadyPayment ? parseFloat(alreadyPayment).toFixed(3) : 0} disabled />
                                    </div> */}

            {/* <div className={`flex gap-x-5  items-center md:my-0.5 md:px-1 data  w-3/4`}>
                                        <label className={`md:text-start flex `}>Doc.Date</label>
                                        <input type={"Date"} className="input-field focus:outline-none md:col-span-2 border border-gray-500 rounded" value={date} disabled />
                                    </div> */}
        </div >

    )
}

export default ProjectExpenses