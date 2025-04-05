import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetEmployeeQuery,
    useGetEmployeeByIdQuery,
    useAddEmployeeMutation,
    useUpdateEmployeeMutation,
    useDeleteEmployeeMutation,
} from "../../../redux/services/EmployeeMasterService";
import { useGetCountriesQuery } from "../../../redux/services/CountryMasterService";
import { useGetCityQuery } from "../../../redux/services/CityMasterService";
import LiveWebCam from "../LiveWebCam";
import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, DropdownInput, TextArea, CurrencyInput, DateInput, DisabledInput, ToggleButton } from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";
import { dropDownListObject, dropDownListMergedObject } from '../../../Utils/contructObject';
import Modal from "../../../UiComponents/Modal";
import { statusDropdown, employeeType, genderList, maritalStatusList, bloodList } from "../../../Utils/DropdownData";
import moment from "moment";
import { useGetEmployeeCategoryQuery } from "../../../redux/services/EmployeeCategoryMasterService";
import { viewBase64String } from '../../../Utils/helper';
import SingleImageFileUploadComponent from "../SingleImageUploadComponent";
import EmployeeLeavingForm from "./EmployeeLeavingForm";
import { useGetDepartmentQuery } from "../../../redux/services/DepartmentMasterService";
import EmployeeReport from "./Report";
import { useDispatch } from "react-redux";
import Loader from "../Loader";
import { ChevronLeft, ChevronRight, LayoutGrid, Table } from "lucide-react";
import Mastertable from "../MasterTable/Mastertable";
import MastersForm from '../MastersForm/MastersForm';

import imageDefault from "../../../assets/default-dp.png"

const MODEL = "Employee Master";


export default function Form() {
    const [view, setView] = useState("table");
    const [form, setForm] = useState(false);
    const [cameraOpen, setCameraOpen] = useState(false);

    const [openTable, setOpenTable] = useState(false);

    const [readOnly, setReadOnly] = useState(false);

    const [id, setId] = useState("");
    const [panNo, setPanNo] = useState("");
    const [name, setName] = useState("");
    const [fatherName, setFatherName] = useState("");
    const [dob, setDob] = useState("");
    const [chamberNo, setChamberNo] = useState("");
    const [localAddress, setlocalAddress] = useState("");
    const [localCity, setLocalCity] = useState("");
    const [localPincode, setLocalPincode] = useState("");
    const [mobile, setMobile] = useState("");
    const [degree, setDegree] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [salaryPerMonth, setSalaryPerMonth] = useState("");
    const [commissionCharges, setCommissionCharges] = useState("");
    const [gender, setGender] = useState("");
    const [regNo, setRegNo] = useState("");
    const [joiningDate, setJoiningDate] = useState("");
    const [permAddress, setPermAddress] = useState("");
    const [permCity, setPermCity] = useState("");
    const [permPincode, setPermPincode] = useState("")
    const [email, setEmail] = useState("");
    const [maritalStatus, setMaritalStatus] = useState("");
    const [consultFee, setConsultFee] = useState("");
    const [accountNo, setAccountNo] = useState("");
    const [ifscNo, setIfscNo] = useState("");
    const [branchName, setbranchName] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [department, setDepartment] = useState("");
    const [employeeCategory, setEmployeeCategory] = useState("");
    const [permanent, setPermanent] = useState("");
    const [active, setActive] = useState(true);

    const [branchPrefixCategory, setBranchPrefixCategory] = useState("");
    // Employee Leaving form fields
    const [leavingForm, setLeavingForm] = useState(false);

    const [leavingDate, setLeavingDate] = useState("");
    const [leavingReason, setLeavingReason] = useState("");
    const [canRejoin, setCanRejoin] = useState("");
    const [rejoinReason, setRejoinReason] = useState("");

    const [searchValue, setSearchValue] = useState("");
    const [image, setImage] = useState(null);

    const [newForm, setNewForm] = useState(false);


    const [formHeading, setFormHeading] = ("");



    const childRecord = useRef(0);
    const dispatch = useDispatch();

    // console.log(form)

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: countriesList, isLoading: isCountryLoading, isFetching: isCountryFetching } =
        useGetCountriesQuery({ params });

    const { data: cityList, isLoading: cityLoading, isFetching: cityFetching } =
        useGetCityQuery({ params });

    const { data: employeeCategoryList } =
        useGetEmployeeCategoryQuery({ params });

    const { data: departmentList } =
        useGetDepartmentQuery({ params });
    const { data: allData, isLoading, isFetching } = useGetEmployeeQuery({ params, searchParams: searchValue });



    const isCurrentEmployeeDoctor = (employeeCategory) => employeeCategoryList.data.find((cat) => parseInt(cat.id) === parseInt(employeeCategory))?.name?.toUpperCase() === "DOCTOR";
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetEmployeeByIdQuery(id, { skip: !id });



    const [addData] = useAddEmployeeMutation();
    const [updateData] = useUpdateEmployeeMutation();
    const [removeData] = useDeleteEmployeeMutation();

    const syncFormWithDb = useCallback((data) => {
        if (!id) {
            // If `id` is empty, reset all states
            setReadOnly(false);
            setPanNo("");
            setName("");
            setFatherName("");
            setDob("");
            setChamberNo("");
            setlocalAddress("");
            setLocalCity("");
            setLocalPincode("");
            setMobile("");
            setDegree("");
            setSpecialization("");
            setSalaryPerMonth("");
            setCommissionCharges("");
            setGender("");
            setRegNo("");
            setJoiningDate("");
            setPermAddress("");
            setPermCity("");
            setPermPincode("");
            setEmail("");
            setMaritalStatus("");
            setConsultFee("");
            setAccountNo("");
            setIfscNo("");
            setbranchName("");
            setBloodGroup("");
            setDepartment("");
            setImage(null);
            setEmployeeCategory("");
            setPermanent("");
            setActive("");

            // Employee Leaving Form states
            setLeavingDate("");
            setLeavingReason("");
            setCanRejoin(false);
            setRejoinReason("");
            return; // Exit early to avoid setting values from `data`
        }

        // If `id` is present, set states based on data
        setReadOnly(true);
        setPanNo(data?.panNo || "");
        setName(data?.name || "");
        setFatherName(data?.fatherName || "");
        setDob(data?.dob ? moment.utc(data?.dob).format("YYYY-MM-DD") : "");
        setChamberNo(data?.chamberNo || "");
        setlocalAddress(data?.localAddress || "");
        setLocalCity(data?.localCity?.id || "");
        setLocalPincode(data?.localPincode || "");
        setMobile(data?.mobile || "");
        setDegree(data?.degree || "");
        setSpecialization(data?.specialization || "");
        setSalaryPerMonth(data?.salaryPerMonth || "");
        setCommissionCharges(data?.commissionCharges || "");
        setGender(data?.gender || "");
        setRegNo(data?.regNo || "");
        setJoiningDate(data?.joiningDate ? moment.utc(data?.joiningDate).format("YYYY-MM-DD") : "");
        setPermAddress(data?.permAddress || "");
        setPermCity(data?.permCity?.id || "");
        setPermPincode(data?.permPincode || "");
        setEmail(data?.email || "");
        setMaritalStatus(data?.maritalStatus || "");
        setConsultFee(data?.consultFee || "");
        setAccountNo(data?.accountNo || "");
        setIfscNo(data?.ifscNo || "");
        setbranchName(data?.branchName || "");
        setBloodGroup(data?.bloodGroup || "");
        setDepartment(data?.department?.id || "");
        setImage(data?.imageBase64 ? viewBase64String(data?.imageBase64) : null);
        setEmployeeCategory(data?.employeeCategoryId || "");
        setPermanent(data?.permanent || "");
        setActive(data?.active || "");

        // Employee Leaving Form states
        setLeavingDate(data?.leavingDate || "");
        setLeavingReason(data?.leavingReason || "");
        setCanRejoin(data?.canRejoin || false);
        setRejoinReason(data?.rejoinReason || "");

        secureLocalStorage.setItem(sessionStorage.getItem("sessionId") + "currentEmployeeSelected", data?.id);
    }, [id]);



    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        branchId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "currentBranchId"), panNo, name, fatherName, dob, chamberNo, localAddress, localCity, localPincode, mobile, degree, specialization, salaryPerMonth,
        commissionCharges, gender, joiningDate, permAddress, permCity, permPincode, email, maritalStatus, consultFee, accountNo,
        ifscNo, branchName, bloodGroup, ...department && { department }, employeeCategoryId: employeeCategory, permanent, active,
        id, leavingReason, leavingDate, canRejoin, rejoinReason
    }

    const validateData = (data) => {
        return data.name && data.joiningDate && data.fatherName && data.dob && data.gender && data.maritalStatus && data.bloodGroup &&
            data.panNo && data.email && data.mobile && data.degree && data.specialization &&
            data.localAddress && data.localCity && data.localPincode && data.employeeCategoryId && (isCurrentEmployeeDoctor(employeeCategory) ? data.department && data.chamberNo : true)

    }



    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData;
            const formData = new FormData()
            for (let key in data) {
                formData.append(key, data[key]);
            }
            if (image instanceof File) {
                formData.append("image", image);
            } else if (!image) {
                formData.append("isDeleteImage", true);
            }
            if (text === "Updated") {
                returnData = await callback({ id, body: formData }).unwrap();
            } else {
                returnData = await callback(formData).unwrap();
            }
            setId(returnData.data.id)
            toast.success(text + "Successfully");
            setSearchValue("");
            setStep(1);
            dispatch({
                type: `EmployeeCategoryMaster/invalidateTags`,
                payload: ['Employee Category'],
            });
            dispatch({
                type: `DepartmentMaster/invalidateTags`,
                payload: ['Department'],
            });
            dispatch({
                type: `CityMaster/invalidateTags`,
                payload: ['City/State Name'],
            });

        } catch (error) {
            console.log("handle");
        }
    };

    const saveData = () => {
        if (!validateData(data)) {
            toast.error("Please fill all required fields...!", { position: "top-center" })
            return
        }
        // if (!validateEmail(data.email)) {
        //     toast.error("Please enter proper email id!", { position: "top-center" })
        //     return
        // }
        // if (!validateMobile(data.mobile)) {
        //     toast.error("Please enter proper mobile number...!", { position: "top-center" })
        //     return
        // }
        // if (!validatePan(data.panNo)) {
        //     toast.error("Please enter proper pan number...!", { position: "top-center" })
        //     return
        // }
        // if (!validatePincode(data.localPincode)) {
        //     toast.error("Please enter proper local Pincode...!", { position: "top-center" })
        //     return
        // }
        // if (data.permPincode && !validatePincode(data.permPincode)) {
        //     toast.error("Please enter proper perm. Pincode...!", { position: "top-center" })
        //     return
        // }
        if (!JSON.parse(active)) {
            setLeavingForm(true);
        } else {
            if (id) {
                handleSubmitCustom(updateData, data, "Updated");
            } else {
                handleSubmitCustom(addData, data, "Added");
            }
        }
    }


    const deleteData = async () => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                await removeData(id)
                setId("");
                dispatch({
                    type: `EmployeeCategoryMaster/invalidateTags`,
                    payload: ['Employee Category'],
                });
                dispatch({
                    type: `DepartmentMaster/invalidateTags`,
                    payload: ['Department'],
                });
                dispatch({
                    type: `cityMaster/invalidateTags`,
                    payload: ['City/State Name'],
                });
                toast.success("Deleted Successfully");
                setForm(false);
                setSearchValue("");
                setStep(1);
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

    const input1Ref = useRef(null);
    const input2Ref = useRef(null);
    const input3Ref = useRef(null);

    const handleKeyNext = (e, nextRef) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextRef?.current?.focus();
        }
    };

    const onNew = () => {
        setId("");
        setReadOnly(false);
        setForm(true);
        setSearchValue("");
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    };

    const tableHeaders = ["S.NO", "Employee Id", "Employee name", "Employee Category", "Gender", "Contact", "Email", "Employee status"]
    const tableDataNames = ["index+1", "dataObj.regNo", "dataObj.name", 'dataObj?.EmployeeCategory?.name', "dataObj?.gender", "dataObj?.mobile", "dataObj?.email", "dataObj.active ? ACTIVE : INACTIVE"]
    const submitLeavingForm = () => {
        console.log("sdfsdfsdfsdf")
        if (id) {
            console.log("called id")
            handleSubmitCustom(updateData, data, "Updated");
        } else {
            console.log("called no id")
            handleSubmitCustom(addData, data, "Added");
        }
        setLeavingForm(false);
    }

    //step
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const validateStep = () => {
        let newErrors = {};
        if (step === 1) {
            if (!data.employeeCategoryId) newErrors.employeeCategory = 'Employee Category is required';
            if (!data.name) newErrors.name = 'Name is required';
            if (!data.joiningDate) newErrors.joiningDate = 'Joining Date is required';
            if (!data.department) newErrors.department = 'Select a department';
        } else if (step === 2) {
            if (!data.email) newErrors.email = 'Email is required';
            if (!data.mobile) newErrors.mobile = 'Mobile No is required';
        } else if (step === 3) {
            if (!data.fatherName) newErrors.fatherName = 'Father Name is required';
            if (!data.panNo) newErrors.panNo = 'Pan number is required';
            if (!data.dob) newErrors.dob = 'Date of Birth is required';
            if (!data.gender) newErrors.gender = 'Gender is required';
            if (!data.maritalStatus) newErrors.maritalStatus = 'Marital Status is required';
            if (!data.bloodGroup) newErrors.bloodGroup = 'Blood Group is required';
            if (!data.degree) newErrors.degree = 'Degree is required';
            if (!data.specialization) newErrors.specialization = 'Specialization is required';
        } else if (step === 4) {
            if (!data.localAddress) newErrors.localAddress = 'Local Address is required';
            if (!data.localPincode) newErrors.localPincode = 'Local Pincode is required';
            if (!data.localCity) newErrors.localCity = 'Local City is required';
        } else if (step === 5) {
            // if (!data.accountNo) newErrors.accountNo = 'Account No is required';
            // if (!data.ifscNo) newErrors.ifscNo = 'IFSC No is required';
            // if (!data.active) newErrors.active = 'Employee Status is required';
        } else if (step === 6) {
            if (!data.active) newErrors.active = 'Set Status';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle next step
    const handleNext = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    // Handle previous step
    const handlePrevious = () => {
        setStep(step - 1);
    };

    // Handle tab click
    const handleTabClick = (tabNumber) => {
        if (tabNumber < step || validateStep()) {
            setStep(tabNumber);
        }
    };
    //step


    // if (!form)
    //     return (
    //         <EmployeeReport
    //             loading={
    //                 isLoading || isFetching
    //             }
    //             setForm={setForm}
    //             employees={allData?.data}
    //             onClick={onDataClick}
    //             onNew={onNew}
    //             searchValue={searchValue}
    //             setSearchValue={setSearchValue}
    //         />
    //     );
    if (!countriesList?.data || !employeeCategoryList?.data || !cityList?.data) return <Loader />

    return (
        <div onKeyDown={handleKeyDown}>
            <div className='w-full flex justify-between  mb-2 items-center px-0.5'>
                <h5 className='my-1'>Employee Master</h5>
                <div className='flex items-center'>

                    {/* Toggle button */}
                    <div className="flex flex-col items-center gap-4 mr-2">
                        {/* Toggle Switch */}
                        <div
                            className="relative flex items-center w-28 h-7 bg-gray-200 rounded-full p-1 cursor-pointer"
                            onClick={() => setView(view === "table" ? "card" : "table")}
                        >
                            {/* Sliding Indicator */}
                            <div
                                className={`absolute top-1 left-1 w-[47%] h-5 bg-gray-500 rounded-full transition-all duration-300 ${view === "card" ? "translate-x-[100%]" : "translate-x-0"
                                    }`}
                            ></div>

                            {/* Table View Option */}
                            <div className="flex-1 flex items-center justify-center relative ">
                                <Table size={14} className={view === "table" ? "text-white " : "text-gray-600"} />
                            </div>

                            {/* Card View Option */}
                            <div className="flex-1 flex items-center justify-center relative ">
                                <LayoutGrid size={14} className={view === "card" ? "text-white" : "text-gray-600"} />
                            </div>
                        </div>


                    </div>


                    <button onClick={() => { setForm(true); onNew(); setNewForm(true) }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                </div>
            </div>

            {/* Display Active Mode */}
            <div>


                {view === "table" ? <Mastertable
                    header={`Employees list`}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    // setOpenTable={setOpenTable}
                    tableHeaders={tableHeaders}
                    tableDataNames={tableDataNames}

                    data={allData?.data}
                    loading={
                        isLoading || isFetching
                    } /> :
                    <div>
                        <div className='flex items-center mx-2'>
                            <span className='flex items-center mr-3 button'><div className='bg-green-200 rounded-full w-2 h-2 mr-1' />Active</span>
                            <span className='flex items-center button'><div className='bg-red-200 rounded-full w-2 h-2 mr-1' />Inactive</span>
                        </div>
                        <div className='w-full flex mt-2'>

                            {allData ? <>
                                {allData.data.map((ele, index) => {
                                    return (<div
                                        key={index}
                                        onClick={() => onDataClick(ele.id)}
                                        className={`relative text-xs flex flex-wrap items-center shadow-md rounded-full p-1 w-[18%] mx-1 transition-all duration-300 cursor-pointer
                      ${ele?.active
                                                ? "bg-green-200 hover:scale-105" // Subtle Green for Active
                                                : "bg-red-200" // Red for Inactive
                                            }`}
                                    >
                                        {/* Profile Image */}
                                        <div className="relative">
                                            <img
                                                src={`${ele?.imageBase64 ? (ele?.imageBase64) : (imageDefault)}`}
                                                alt={imageDefault}
                                                className={`w-[40px] h-[40px] object-cover rounded-full border-4 border-white shadow-md
                          ${ele?.active ? "hover:scale-110" : "opacity-70 border-red-500"}
                        `}
                                            />
                                        </div>

                                        {/* Employee Details */}
                                        <div className={`ml-5 ${ele?.active ? "text-gray-900" : "text-red-900"}`}>
                                            <p className=" my-0 text-[10px]">{ele?.regNo}</p>
                                            <p className=" font-semibold my-0">
                                                {ele?.name}
                                            </p>
                                            <p className="opacity-90 my-0 text-[10px]">{ele?.department?.name}</p>


                                        </div>
                                    </div>
                                    )
                                })
                                }</> : ""}
                        </div>
                    </div>
                }
            </div>

            {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%] h-[85%]"} onClose={() => { setForm(false); setErrors({}); setStep(1) }}><div className="  mt-1 h-full">

                <MastersForm
                    onNew={onNew}
                    onClose={() => {
                        setForm(false);
                        setSearchValue("");
                        setId(false);
                        setStep(1);
                    }}
                    onSearch={() => setOpenTable(true)}
                    model={MODEL}
                    saveData={saveData}
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                    readOnly={readOnly}
                    newForm={newForm}
                    emptyErrors={() => setErrors({})}
                >
                    <Modal isOpen={cameraOpen} onClose={() => setCameraOpen(false)}>
                        <LiveWebCam picture={image} setPicture={setImage} onClose={() => setCameraOpen(false)} />
                    </Modal>
                    <Modal isOpen={leavingForm} onClose={() => setLeavingForm(false)}>
                        <EmployeeLeavingForm leavingReason={leavingReason} setLeavingReason={setLeavingReason}
                            leavingDate={leavingDate} setLeavingDate={setLeavingDate}
                            canRejoin={canRejoin} setCanRejoin={setCanRejoin}
                            rejoinReason={rejoinReason} setRejoinReason={setRejoinReason}
                            onSubmit={submitLeavingForm} onClose={() => { setLeavingForm(false) }} />
                    </Modal>
                    <div className="gap-x-1 mb-2">
                        {[1, 2, 3, 4, 5, 6].map((tabNumber) => (
                            <button
                                key={tabNumber}
                                onClick={() => handleTabClick(tabNumber)}
                                className={` ${step === tabNumber
                                    ? 'text-green-500  '
                                    : ' text-secondary'
                                    } px-2 py-1 tabs rounded-t-md rounded-top `}
                                style={(step === tabNumber) ? { borderLeft: "1px solid #D3D3D3", borderTop: "1px solid #D3D3D3", borderRight: "1px solid #D3D3D3" } : { borderBottom: "1px solid #D3D3D3", borderLeft: "1px solid transparent", borderTop: "1px solid transparent", borderRight: "1px solid transparent" }}
                            >
                                {tabNumber === 1 && "Official"}
                                {tabNumber === 2 && "Contact"}
                                {tabNumber === 3 && "Personal"}
                                {tabNumber === 4 && "Address"}
                                {tabNumber === 5 && "Bank Details"}
                                {tabNumber === 6 && "Employee status"}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-between h-[100%] w-full relative text-xs">
                        {step === 1 && (
                            <div className='mr-1 w-[100%]'>
                                <fieldset className='rounded  mb-1'>
                                    <div className=' mb-1 text-sm font-semibold'>Official Details</div>

                                    <div className='w-100 flex justify-between'>
                                        <div className=''>
                                            <div className='flex'>

                                                <div className="w-[100%]">
                                                    {/* <div className={`text-xs font-semibold my-2 ${active === true ? "text-green-500" : "text-red-500"}`}>
                                                        {regNo} */}
                                                    {/* {id ? <DisabledInput name="Employee Id" type={"text"} value={regNo} /> : <DisabledInput visibility={''} name="Employee Id" type={"text"} value={regNo} />} */}
                                                    {/* </div> */}
                                                    <div className="w-[100%] mb-3">
                                                        <TextInput ref={input1Ref} name="Name" width={"md:w-[100%]"} type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} onKeyDown={(e) => handleKeyNext(e, input2Ref)} />
                                                        {errors.name && <span className="text-red-500 text-[10px]">{errors.name}</span>}
                                                    </div>
                                                    <div className='w-[100%]  mb-3'>
                                                        <DropdownInput ref={input2Ref} name="Employee Category" width={""} options={dropDownListObject(id ? employeeCategoryList.data : employeeCategoryList.data.filter(item => item.active), "name", "id")} value={employeeCategory} setValue={(value) => { setEmployeeCategory(value); if (!isCurrentEmployeeDoctor(value)) { setDepartment("") }; setChamberNo(""); }} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} onKeyDown={(e) => handleKeyNext(e, input3Ref)} />
                                                        {(branchPrefixCategory === "Specific")
                                                            ?
                                                            <DropdownInput name="Employee Type" options={employeeType} value={permanent} setValue={setPermanent} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                            :
                                                            ""
                                                        }
                                                        {errors.employeeCategory && <span className="text-red-500 text-[10px] ">{errors.employeeCategory}</span>}
                                                    </div>
                                                </div>

                                            </div>
                                            <div className='flex justify-between w-full'>

                                                <div className="w-[100%] mb-3">
                                                    <TextInput ref={input3Ref} name="Chamber no" type="text" value={chamberNo} setValue={setChamberNo} readOnly={readOnly} required={isCurrentEmployeeDoctor(employeeCategory)} disabled={(childRecord.current > 0)} onKeyDown={(e) => handleKeyNext(e, null)} />
                                                </div>

                                            </div>

                                            <div className="w-[100%] mb-3">
                                                <DropdownInput name="Department" options={dropDownListObject(id ? departmentList.data : departmentList.data.filter(item => item.active), "name", "id")} value={department} setValue={setDepartment} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                                {errors.department && <span className="text-red-500 text-[10px]">{errors.department}</span>}
                                            </div>
                                            <div className="w-[100%] mb-3">
                                                <DateInput name="Joining Date" width={"md:w-[150px]"} value={joiningDate} setValue={setJoiningDate} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                {errors.joiningDate && <span className="text-red-500 text-[10px]">{errors.joiningDate}</span>}
                                            </div>
                                        </div>
                                        <div className='p-2 flex flex-col items-end'>
                                            <div className={`text-lg font-semibold my-2 ${active === true ? "text-green-500" : "text-red-500"}`}>
                                                {regNo}
                                            </div>
                                            <SingleImageFileUploadComponent setWebCam={setCameraOpen} disabled={readOnly} image={image} setImage={setImage} />

                                        </div>
                                    </div>


                                </fieldset>
                            </div>

                        )}
                        {step === 2 && (
                            <div className='mr-1'>
                                {/* <fieldset className='border border-gray-300 p-2  bg-white rounded-lg shadow-lg mb-1'>
                                        <div className='ms-0.5 mb-1 font-semibold'>Payment</div>
                                        <div className='grid grid-cols-1 my-2'>
                                            <CurrencyInput name="Consult Fee" value={consultFee} setValue={setConsultFee} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            <CurrencyInput name="Salary/Month" value={salaryPerMonth} setValue={setSalaryPerMonth} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            <CurrencyInput name="Commission charges" value={commissionCharges} setValue={setCommissionCharges} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        </div>
                                    </fieldset>  */}
                                <fieldset className='rounded  mb-1'>
                                    <div className='ms-0.5 mb-2 text-sm  font-semibold'>Contact Details</div>
                                    <div className='w-[100%] '>
                                        <div className="w-[100%] mb-3">
                                            <TextInput name="Email Id" width={"w-full md:w-full"} type="email" value={email} setValue={setEmail} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            {errors.email && <span className="text-red-500 text-[10px]">{errors.email}</span>}
                                        </div>
                                        <div className="w-[100%] mb-3">
                                            <TextInput name="Mobile No" width={"w-full md:w-full"} type="number" value={mobile} setValue={setMobile} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            {errors.mobile && <span className="text-red-500 text-[10px]">{errors.mobile}</span>}
                                        </div>

                                    </div>
                                </fieldset>
                            </div>
                        )}

                        {step === 3 && (
                            <div className='mr-1'>
                                <fieldset className='rounded  mb-1'>
                                    <div className='ms-0.5 mb-2 text-sm  font-semibold'>Personal Details</div>
                                    <div className='w-[100%]'>
                                        <div className="w-[48%] mb-3">
                                            <TextInput name="Father Name" type="text" width={"md:w-[220px]"} value={fatherName} setValue={setFatherName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            {errors.fatherName && <span className="text-red-500 text-[10px]">{errors.fatherName}</span>}
                                        </div>

                                        <div className="flex justify-between">
                                            <div className="w-[48%] mb-3">
                                                <TextInput name="Pan No" width={"md:w-[100%]"} type="pan_no" value={panNo} setValue={setPanNo} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                {errors.panNo && <span className="text-red-500 text-[10px]">{errors.panNo}</span>}
                                            </div>

                                            <div className="w-[48%] mb-3">
                                                <DateInput name="Date Of Birth" width={"md:w-[100%]"} value={dob} setValue={setDob} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                {errors.dob && <span className="text-red-500 text-[10px]">{errors.dob}</span>}
                                            </div>
                                        </div>
                                        <div className="flex  flex-wrap justify-between">
                                            <div className="w-[30%] mb-3">
                                                <DropdownInput name="Gender" options={genderList} value={gender} setValue={setGender} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                {errors.gender && <span className="text-red-500 text-[10px]">{errors.gender}</span>}
                                            </div>
                                            <div className="w-[30%] mb-3">
                                                <DropdownInput name="Marital Status" options={maritalStatusList} value={maritalStatus} setValue={setMaritalStatus} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                {errors.maritalStatus && <span className="text-red-500 text-[10px]">{errors.maritalStatus}</span>}
                                            </div>
                                            <div className="w-[30%] mb-3">
                                                <DropdownInput name="Blood Group" options={bloodList} value={bloodGroup} setValue={setBloodGroup} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                {errors.bloodGroup && <span className="text-red-500 text-[10px]">{errors.bloodGroup}</span>}
                                            </div>

                                        </div>
                                        <div className="w-[100%] mt-1 flex justify-between">
                                            <div className="w-[20%] mb-3">
                                                <TextInput name="Degree" type="text" value={degree} setValue={setDegree} readOnly={readOnly} required={true} />
                                                {errors.degree && <span className="text-red-500 text-[10px]">{errors.degree}</span>}
                                            </div>
                                            <div className="w-[75%] mb-3">
                                                <TextInput name="Specialization" width={"w-[100%]]"} type="text" value={specialization} setValue={setSpecialization} readOnly={readOnly} required={true} />
                                                {errors.specialization && <span className="text-red-500 text-[10px]">{errors.specialization}</span>}
                                            </div>

                                        </div>
                                    </div>
                                </fieldset>
                            </div>)}
                        {step === 4 && (
                            <div className='mr-1'>

                                <fieldset className=' rounded  mb-1'>
                                    <div className='ms-0.5 mb-0.4 text-sm  font-semibold'>Address</div>
                                    <div className='w-[100%] '>
                                        <div className="mb-3">
                                            <TextArea name="Permanent Address" rows={'2'} value={permAddress} setValue={setPermAddress} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        </div>
                                        <div className="mb-1 flex flex-wrap w-full">
                                            <div className={`w-[30%] mb-3`} >
                                                <TextInput name="Pincode"
                                                    type="number" value={permPincode} setValue={setPermPincode} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>
                                            <div className={`w-[48%] ms-4 mb-3`}>
                                                <DropdownInput name="City/State Name" options={dropDownListMergedObject(id ? cityList.data : cityList.data.filter(item => item.active), "name", "id")} value={permCity} setValue={setPermCity} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            </div>

                                        </div>

                                    </div>
                                </fieldset>
                                <fieldset className='pt-0 rounded  mb-1'>
                                    <div className='ms-0.5 mb-1 text-sm  font-semibold'>Local Address</div>
                                    <div className='w-[100%]'>
                                        <div className="mb-3">
                                            <TextArea name="Local Address" value={localAddress} rows={'2'} setValue={setlocalAddress} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            {errors.localAddress && <span className="text-red-500 text-[10px]">{errors.localAddress}</span>}
                                        </div>
                                        <div className="mb-1 flex flex-wrap w-full">
                                            <div className={`w-[30%] mb-3`}>
                                                <TextInput name="Pincode" type="number" value={localPincode} setValue={setLocalPincode} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                {errors.localPincode && <span className="text-red-500 text-[10px]">{errors.localPincode}</span>}
                                            </div>
                                            <div className={`w-[48%] ms-4 mb-3`}>
                                                <DropdownInput name="City/State Name" options={dropDownListMergedObject(id ? cityList.data : cityList.data.filter(item => item.active), "name", "id")} value={localCity} setValue={setLocalCity} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                                {errors.localCity && <span className="text-red-500 text-[10px]">{errors.localCity}</span>}
                                            </div>
                                        </div>

                                    </div>
                                </fieldset>
                            </div>)}
                        {step === 5 && (
                            <div className='mr-1 '>
                                <fieldset className='rounded  mb-1'>
                                    <div className='ms-0.5 mb-2 text-sm  font-semibold'>Bank Details</div>
                                    <div className='w-[100%] flex '>
                                        <div className="w-[48%] mr-4 mb-3">
                                            <TextInput name="Account No" type="number" value={accountNo} setValue={setAccountNo} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        </div>
                                        <div className="w-[40%] mb-3">
                                            <TextInput name="IFSC No" type="text" value={ifscNo} setValue={setIfscNo} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        </div>
                                    </div>
                                    <div className="w-[92%] mb-3">
                                        <TextInput name="Branch Name" type="text" value={branchName} setValue={setbranchName} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                    </div>
                                </fieldset>
                            </div>
                        )}
                        {step === 6 && (
                            <div className='mr-1 '>
                                <fieldset className='rounded  mb-1'>
                                    <div className='ms-0.5 mb-1 text-sm  font-semibold'>Employee Status<span className="text-red-500 text-normal">*</span></div>
                                    <div className='grid grid-cols-1 my-2'>
                                        <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                                        {errors.active && <span className="text-red-500 text-[10px]">{errors.active}</span>}
                                        {/* <DropdownInput name="Status" options={statusDropdown} value={active} setValue={setActive} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} /> */}
                                    </div>
                                </fieldset>
                            </div>
                        )}



                    </div>
                    {/* Navigation Buttons */}

                </MastersForm>
                <div className="absolute top-[80%] -right-5 flex justify-between mt-auto w-[110%] px-10">

                    <button
                        type="button"
                        onClick={handlePrevious}
                        className={`  text-gray-900 field-text rounded-pill flex items-center pr-2 ${(step > 1) ? "visible" : "invisible"}`}
                    >
                        <ChevronLeft
                            size={24}
                            className=" transition-colors duration-200 "
                        />
                        {/* Prev */}
                    </button>


                    <button
                        type="button"
                        onClick={handleNext}
                        className={` text-gray-900 field-text rounded-pill flex items-center pl-2 ${(step < 6) ? "visible" : "invisible"}`}

                    >
                        {/* Next */}
                        <ChevronRight
                            size={24}
                            className=" transition-colors duration-200"
                        />
                    </button>

                </div>
            </div></Modal>}

        </div>
    )
}



