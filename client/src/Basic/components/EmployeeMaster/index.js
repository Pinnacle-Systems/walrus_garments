
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
import {
  TextInput,
  DropdownInput,
  DropdownInputNew,
  TextArea,
  DateInput,
  DisabledInput,
  ToggleButton,
  ReusableTable,
  TextInputNew1,
} from "../../../Inputs";

import {
  dropDownListObject,
  dropDownListMergedObject,
} from "../../../Utils/contructObject";
import Modal from "../../../UiComponents/Modal";
import {
  statusDropdown,
  employeeType,
  genderList,
  maritalStatusList,
  bloodList,
} from "../../../Utils/DropdownData";
import moment from "moment";
import { useGetEmployeeCategoryQuery } from "../../../redux/services/EmployeeCategoryMasterService";
import { getCommonParams, viewBase64String } from "../../../Utils/helper";
import SingleImageFileUploadComponent from "../SingleImageUploadComponent";
import EmployeeLeavingForm from "./EmployeeLeavingForm";
import { useGetDepartmentQuery } from "../../../redux/services/DepartmentMasterService";
import EmployeeCategoryMaster from "../EmployeeCategoryMaster";
import DepartmentMaster from "../DepartmentMaster";
import CityMaster from "../CityMaster";
import { useDispatch } from "react-redux";
import useInvalidateTags from '../../../CustomHooks/useInvalidateTags';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Mail,
  Plus,
  Power,
  Search,
  Table,
  X,
} from "lucide-react";
import Mastertable from "../MasterTable/Mastertable";
import imageDefault from "../../../assets/default-dp.png";
import Swal from "sweetalert2";
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
  const [permPincode, setPermPincode] = useState("");
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
  const [leavingForm, setLeavingForm] = useState(false);
  const [leavingDate, setLeavingDate] = useState("");
  const [leavingReason, setLeavingReason] = useState("");
  const [canRejoin, setCanRejoin] = useState("");
  const [rejoinReason, setRejoinReason] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const nameRef = useRef(null);
  const [image, setImage] = useState(null);
  const [newForm, setNewForm] = useState(false);
  const [formHeading, setFormHeading] = "";
  const childRecord = useRef(0);
  const dispatch = useDispatch();
  const [dispatchInvalidate] = useInvalidateTags();
  const [aadharNo, setAadharNo] = useState("");


  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    finYearId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "currentFinYear"
    ),
    userId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userId"
    ),
    branchId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "currentBranchId"
    ),
  };
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  const finYearId = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'currentFinYear')

  const {
    data: cityList,
    isLoading: cityLoading,
    isFetching: cityFetching,
  } = useGetCityQuery({ params });

  const { data: employeeCategoryList } = useGetEmployeeCategoryQuery({
    params: companyId, finYearId
  });

  const { data: departmentList } = useGetDepartmentQuery({ params });
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetEmployeeQuery({ params, searchParams: searchValue });

  const isCurrentEmployeeDoctor = (employeeCategory) =>
    employeeCategoryList?.data
      ?.find((cat) => parseInt(cat.id) === parseInt(employeeCategory))
      ?.name?.toUpperCase() === "DOCTOR";
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetEmployeeByIdQuery(id, { skip: !id });

  const [addData] = useAddEmployeeMutation();
  const [updateData] = useUpdateEmployeeMutation();
  const [removeData] = useDeleteEmployeeMutation();

  const getRegNo = useCallback(() => {
    if (id || isLoading || isFetching) return;

    if (allData?.Regno) {
      setRegNo(allData?.Regno);
    }
  }, [allData, isLoading, isFetching, id]);

  useEffect(getRegNo, id[(getRegNo, id)]);
  console.log(readOnly, "readOnly")

  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        // setReadOnly(false);
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
        setActive(true);
        setLeavingDate("");
        setLeavingReason("");
        setCanRejoin(false);
        setRejoinReason("");
        setAadharNo("")
        return;
      }
      // setReadOnly(true);
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
      setJoiningDate(
        data?.joiningDate
          ? moment.utc(data?.joiningDate).format("YYYY-MM-DD")
          : ""
      );
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
      setActive(data?.active ? data?.active : true);

      // Employee Leaving Form states
      setLeavingDate(data?.leavingDate || "");
      setLeavingReason(data?.leavingReason || "");
      setCanRejoin(data?.canRejoin || false);
      setRejoinReason(data?.rejoinReason || "");
      setAadharNo(data?.aadharNo ? data?.aadharNo : "")
      secureLocalStorage.setItem(
        sessionStorage.getItem("sessionId") + "currentEmployeeSelected",
        data?.id
      );
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    branchId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "currentBranchId"
    ),
    panNo,
    name,
    fatherName,
    dob,
    chamberNo,
    localAddress,
    localCity,
    localPincode,
    mobile,
    degree,
    specialization,
    salaryPerMonth,
    commissionCharges,
    gender,
    joiningDate,
    permAddress,
    permCity,
    permPincode,
    email,
    maritalStatus,
    consultFee,
    accountNo,
    ifscNo,
    branchName,
    bloodGroup,
    ...(department && { department }),
    employeeCategoryId: employeeCategory,
    permanent,
    active,
    id,
    leavingReason,
    leavingDate,
    canRejoin,
    rejoinReason,
    regNo,
    employeeCategory, department, aadharNo
  };



  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData;
      const formData = new FormData();
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
      if (nextProcess == "new") {
        syncFormWithDb(undefined);
        onNew();
      } else {
        setForm(false);
      } dispatchInvalidate();
      await Swal.fire({
        title: text + " Successfully",
        icon: "success",
      });
      setSearchValue("");
      setStep(1);
      setNewForm(false);
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Submission error',
        text: error.data?.message || 'Something went wrong!',
      });
      nameRef.current?.focus();
    }
  };

  console.log(data, "dataaaaaaaaaaa")

  const validateData = (data) => {
    if (data.name && data.gender && data.dob && data.employeeCategory && data.department && data.joiningDate && data.mobile && data.localAddress && data.permCity && data.permPincode && data.aadharNo) {
      return true;
    }
    return false;
  }

  const saveData = (nextProcess) => {
    const upperName = name.toUpperCase();
    const finalData = {
      ...data,
      name: upperName
    };

    if (!validateData(finalData)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "error",
      });
      nameRef.current?.focus();
      return
    }

    if (id) {
      if (!window.confirm("Are you sure update the details ...?")) {
        return;
      }
    }
    if (id) {
      handleSubmitCustom(updateData, finalData, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, finalData, "Added", nextProcess);
    }
  };
  const deleteData = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        setForm(false);
        return;
      }
      try {
        await removeData(id).unwrap();
        setId("");
        dispatchInvalidate();
        await Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
        });
        setForm(false);
        setSearchValue("");
        setStep(1);
        setTimeout(() => searchRef.current?.focus(), 100);
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Submission error',
          text: error.data?.message || 'Something went wrong!',
        });
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
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };
  const onNew = () => {
    setId("");
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    syncFormWithDb(undefined)
    setTimeout(() => {
      nameRef.current?.focus();
    }, 100);
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }

  const submitLeavingForm = () => {
    console.log("sdfsdfsdfsdf");
    if (id) {
      console.log("called id");
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      console.log("called no id");
      handleSubmitCustom(addData, data, "Added");
    }
    setLeavingForm(false);
  };

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const validateStep = () => {
    let newErrors = {};
    if (step === 1) {
      if (!data.employeeCategoryId)
        newErrors.employeeCategory = "Employee Category is required";
      if (!data.name) newErrors.name = "Name is required";
      if (!data.joiningDate) newErrors.joiningDate = "Joining Date is required";
      if (!data.department) newErrors.department = "Select a department";
    } else if (step === 2) {
      if (!data.mobile) newErrors.mobile = "Mobile No is required";
    } else if (step === 3) {
      if (!data.dob) newErrors.dob = "Date of Birth is required";
      if (!data.gender) newErrors.gender = "Gender is required";
    } else if (step === 4) {
      if (!data.localAddress)
        newErrors.localAddress = "Local Address is required";
      if (!data.localPincode)
        newErrors.localPincode = "Local Pincode is required";
      if (!data.localCity) newErrors.localCity = "Local City is required";
    } else if (step === 6) {
      if (!data.active) newErrors.active = "Set Status";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
    console.log("view");
  };
  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
    console.log("Edit");
  };

  const ACTIVE = (
    <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const INACTIVE = (
    <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );


  const columns = [
    {
      header: "S.No",
      accessor: (item, index) => index + 1,
      className: "font-medium text-gray-900 w-12  text-center",
    },

    {
      header: "Employee Id",
      accessor: (item) => item?.regNo,
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-40",
    },

    {
      header: "Employee Name",
      accessor: (item) => item?.name,
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-72",
    },
    {
      header: "Employee Category",
      accessor: (item) => item?.EmployeeCategory?.name,
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-48",
    },
    {
      header: "Gender",
      accessor: (item) => item?.gender,
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-24",
    },
    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-16",
    },

  ];
  useEffect(() => {
    if (form && nameRef.current) {
      nameRef.current.focus();
    }
  }, [form]);

  return (
    <div onKeyDown={handleKeyDown} className="p-1 ">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Employee Master
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setForm(true);
              onNew();
              setNewForm(true);
            }}
            className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Employee
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${view === "table"
                ? "bg-indigo-100 text-indigo-600"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Table size={16} />
              Table
            </button>
            <button
              onClick={() => setView("card")}
              className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${view === "card"
                ? "bg-indigo-100 text-indigo-600"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <LayoutGrid size={16} />
              Cards
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-100  rounded-xl shadow overflow-hidden">
        <div className="pt-2">
          {view === "table" ? (
            // <Mastertable
            //   header={`Employees list`}
            //   searchValue={searchValue}
            //   setSearchValue={setSearchValue}
            //   onDataClick={onDataClick}
            //   tableHeaders={tableHeaders}
            //   tableDataNames={tableDataNames}
            //   data={allData?.data}
            //   setReadOnly={setReadOnly}
            //   deleteData={deleteData}
            // />
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
              <ReusableTable
                columns={columns}
                data={allData?.data}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={deleteData}
                itemsPerPage={10}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allData?.data?.map((employee, index) => (
                <div
                  key={index}
                  onClick={() => onDataClick(employee.id)}
                  className={`border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer ${employee?.active ? "border-green-200" : "border-red-200"
                    }`}
                >
                  <div
                    className={`p-4 ${employee?.active ? "bg-green-50" : "bg-red-50"
                      }`}
                  >
                    <div className="flex items-center">
                      <img
                        src={employee?.imageBase64 || imageDefault}
                        alt="Profile"
                        className={`w-12 h-12 object-cover rounded-full border-2 ${employee?.active
                          ? "border-green-500"
                          : "border-red-500"
                          }`}
                      />
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">
                          {employee?.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {employee?.regNo}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Department</p>
                        <p className="font-medium">
                          {employee?.department?.name || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p
                          className={`font-medium ${employee?.active ? "text-green-600" : "text-red-600"
                            }`}
                        >
                          {employee?.active ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Mobile</p>
                        <p className="font-medium">{employee?.mobile || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium truncate">
                          {employee?.email || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {form && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[95%] max-w-6xl h-[85vh]"}
          onClose={() => {
            setForm(false);
            setErrors({});
          }}
        >
          <div className="h-full flex flex-col bg-gray-200">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-2">
              <div className="flex items-center gap-2 ">
                <h2 className="text-lg font-semibold text-gray-800">
                  {id ? (!readOnly ? "Edit Employee" : "Employee Master") : "Add New Employee"}
                </h2>
                {regNo && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {regNo}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <div>
                  {readOnly && (
                    <button type="button"
                      onClick={() => { setForm(false); setSearchValue(""); setId(false); }}
                      className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded">
                      Cancel
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {!readOnly && (
                    <button type="button" onClick={() => saveData("close")}
                      className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 border border-blue-600 flex items-center gap-1 text-xs">
                      <Check size={14} />
                      {id ? "Update" : "Save & close"}
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {(!readOnly && !id) && (
                    <button type="button" onClick={() => saveData("new")}
                      className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 border border-green-600 flex items-center gap-1 text-xs">
                      <Check size={14} />
                      Save & New
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-3 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <SingleImageFileUploadComponent
                      setWebCam={setCameraOpen}
                      disabled={readOnly}
                      image={image}
                      setImage={setImage}
                      className="mb-3"
                    />

                    <div className="space-y-2">
                      <TextInputNew1
                        ref={nameRef}
                        name="Full Name"
                        value={name}
                        setValue={setName}
                        required={true}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                      />
                      {errors.name && <span className="text-red-500 text-xs ml-1">{errors.name}</span>}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <DropdownInput
                            ref={input2Ref}
                            name="Gender"
                            options={genderList}
                            value={gender}
                            setValue={setGender}
                            required
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                          />
                          {errors.gender && <span className="text-red-500 text-xs ml-1">{errors.gender}</span>}
                        </div>

                        <div>
                          <DropdownInput
                            name="Blood Group"
                            options={bloodList}
                            value={bloodGroup}
                            setValue={setBloodGroup}

                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                          />
                          {errors.bloodGroup && <span className="text-red-500 text-xs ml-1">{errors.bloodGroup}</span>}
                        </div>
                      </div>

                      <DateInput
                        name="Date of Birth"
                        value={dob}
                        setValue={setDob}
                        required
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                      />
                      {errors.dob && <span className="text-red-500 text-xs ml-1">{errors.dob}</span>}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[90px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Employment Status</h3>
                    <div className="space-y-2">{console.log(active, "active")}
                      <ToggleButton
                        name="Status"
                        options={statusDropdown}
                        value={active}
                        setActive={setActive}
                        required={true}
                        readOnly={readOnly}
                      />
                      {errors.active && <span className="text-red-500 text-xs ml-1">{errors.active}</span>}

                      {!active && (
                        <button
                          type="button"
                          onClick={() => setLeavingForm(true)}
                          className="text-xs text-red-600 hover:text-red-800 underline"
                        >
                          Add Leaving Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Official Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <DropdownInputNew
                          ref={input3Ref}
                          name="Employee Category"
                          options={dropDownListObject(
                            id
                              ? employeeCategoryList?.data
                              : employeeCategoryList?.data?.filter((item) => item.active),
                            "name",
                            "id"
                          )}
                          value={employeeCategory}
                          setValue={(value) => setEmployeeCategory(value)}
                          required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          addNewLabel="+ Add New Employee Category"
                          childComponent={EmployeeCategoryMaster}
                          addNewModalWidth="w-[40%] h-[40%]"
                        />
                        {errors.employeeCategory && <span className="text-red-500 text-xs ml-1">{errors.employeeCategory}</span>}
                      </div>

                      <div>
                        <DropdownInputNew
                          name="Department"
                          options={dropDownListObject(
                            id
                              ? departmentList?.data
                              : departmentList?.data?.filter((item) => item.active),
                            "name",
                            "id"
                          )}
                          value={department}
                          setValue={setDepartment}
                          readOnly={readOnly}
                          required={true}
                          disabled={childRecord.current > 0}
                          addNewLabel="+ Add New Department"
                          childComponent={DepartmentMaster}
                          addNewModalWidth="w-[40%] h-[45%]"
                        />
                        {errors.department && <span className="text-red-500 text-xs ml-1">{errors.department}</span>}
                      </div>

                      <div>
                        <TextInputNew1
                          name="Chamber no"
                          value={chamberNo}
                          setValue={setChamberNo}
                          readOnly={readOnly}
                          required={isCurrentEmployeeDoctor(employeeCategory)}
                          disabled={childRecord.current > 0}
                        />
                      </div>

                      <div className="">
                        <DateInput
                          name="Joining Date"
                          value={joiningDate}
                          setValue={setJoiningDate}
                          required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                        {errors.joiningDate && <span className="text-red-500 text-xs ml-1">{errors.joiningDate}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <TextInputNew1
                          name="Father Name"
                          value={fatherName}
                          setValue={setFatherName}
                          required
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                        {errors.fatherName && <span className="text-red-500 text-xs ml-1">{errors.fatherName}</span>}
                      </div>

                      <div>
                        <DropdownInput
                          name="Marital Status"
                          options={maritalStatusList}
                          value={maritalStatus}
                          setValue={setMaritalStatus}

                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                        {errors.maritalStatus && <span className="text-red-500 text-xs ml-1">{errors.maritalStatus}</span>}
                      </div>
                      <div>
                        <TextInputNew1
                          name="Aadhar No"
                          value={aadharNo}
                          setValue={setAadharNo}
                          type={"number"}
                          required
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                        {errors.aadharNo && <span className="text-red-500 text-xs ml-1">{errors.aadharNo}</span>}
                      </div>
                      <div>
                        <TextInputNew1
                          name="Pan No"
                          value={panNo}
                          setValue={setPanNo}
                          // required
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                        {errors.panNo && <span className="text-red-500 text-xs ml-1">{errors.panNo}</span>}
                      </div>

                      <div className="col-span-2">
                        <TextInputNew1
                          name="Degree"
                          value={degree}
                          setValue={setDegree}

                          readOnly={readOnly}
                        />
                        {errors.degree && <span className="text-red-500 text-xs ml-1">{errors.degree}</span>}
                      </div>

                      <div className="md:col-span-2">
                        <TextArea
                          rows={2}
                          name="Specialization"
                          value={specialization}
                          setValue={setSpecialization}

                          readOnly={readOnly}
                        />
                        {errors.specialization && <span className="text-red-500 text-xs ml-1">{errors.specialization}</span>}
                      </div>

                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Bank Details</h3>
                    <div className="space-y-2">
                      <TextInput
                        name="Account No"
                        type="number"
                        value={accountNo}
                        setValue={setAccountNo}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <TextInputNew1
                          name="IFSC No"
                          value={ifscNo}
                          setValue={setIfscNo}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />

                        <TextInputNew1
                          name="Branch Name"
                          value={branchName}
                          setValue={setbranchName}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-md border border-gray-200 mt-2">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex flex-wrap">
                        <div className="w-full ">
                          <TextInputNew1
                            name="Mobile No"
                            type="number"
                            value={mobile}
                            setValue={setMobile}
                            required={true}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                          />
                          {errors.mobile && <span className="text-red-500 text-xs ml-1">{errors.mobile}</span>}
                        </div>


                      </div>
                      <div className="w-full">
                        <TextInputNew1
                          name="Email Id"
                          type="email"
                          value={email}
                          setValue={setEmail}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                        {errors.email && <span className="text-red-500 text-xs ml-1">{errors.email}</span>}
                      </div>
                      <TextArea
                        name="Address"
                        rows="2"
                        value={localAddress}
                        setValue={setlocalAddress}
                        required
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                      />
                      {errors.localAddress && <span className="text-red-500 text-xs ml-1">{errors.localAddress}</span>}

                      <div className="col-span-2 flex flex-row gap-2  ">
                        <div className="w-20" >
                          <TextInput
                            name="Pincode"
                            type="number"
                            value={permPincode}
                            setValue={setPermPincode}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            required
                          />
                        </div>
                        <div className="w-64">

                          <DropdownInputNew
                            name="City/State"
                            options={dropDownListMergedObject(
                              (cityList?.data || []).filter((item) => id || item.active),
                              "name",
                              "id"
                            )}
                            value={permCity}
                            setValue={setPermCity}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            required
                            addNewLabel="+ Add New City"
                            childComponent={CityMaster}
                            addNewModalWidth="w-[40%] h-[350px]"
                          />
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>

          <Modal isOpen={cameraOpen} onClose={() => setCameraOpen(false)}>
            <LiveWebCam
              picture={image}
              setPicture={setImage}
              onClose={() => setCameraOpen(false)}
            />
          </Modal>

          <Modal isOpen={leavingForm} onClose={() => setLeavingForm(false)}>
            <EmployeeLeavingForm
              leavingReason={leavingReason}
              setLeavingReason={setLeavingReason}
              leavingDate={leavingDate}
              setLeavingDate={setLeavingDate}
              canRejoin={canRejoin}
              setCanRejoin={setCanRejoin}
              rejoinReason={rejoinReason}
              setRejoinReason={setRejoinReason}
              onSubmit={submitLeavingForm}
              onClose={() => setLeavingForm(false)}
            />
          </Modal>
        </Modal>
      )}
    </div>
  );
}
