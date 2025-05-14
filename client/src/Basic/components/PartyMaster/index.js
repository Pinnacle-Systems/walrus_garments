import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { useGetCityQuery } from "../../../redux/services/CityMasterService";
import {
  useAddPartyMutation,
  useDeletePartyMutation,
  useGetPartyByIdQuery,
  useGetPartyQuery,
  useUpdatePartyMutation,
} from "../../../redux/services/PartyMasterService";
import moment from "moment";
import { findFromList } from "../../../Utils/helper";
import Loader from "../../components/Loader";
import {
  dropDownListMergedObject,
  dropDownListObject,
  multiSelectOption,
} from "../../../Utils/contructObject";
import PartyOnItems from "./PartyOnItems";
import { ChevronLeft, ChevronRight, Delete, Plus } from "lucide-react";
import { statusDropdown } from "../../../Utils/DropdownData";
import BrowseSingleImage from "../../components/BrowseSingleImage";
import MastersForm from "../MastersForm/MastersForm";
import {
  Modal,
  ToggleButton,
  DateInput,
  DropdownInput,
  TextInput,
  FancyCheckBox,
} from "../../../Inputs";
import Mastertable from "../MasterTable/Mastertable";
import { useGetProcessMasterQuery } from "../../../redux/uniformService/ProcessMasterService";
import { useGetCurrencyMasterQuery } from "../../../redux/services/CurrencyMasterServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { DELETE, PLUS } from "../../../icons";
import { toast } from "react-toastify";
import { exist } from "joi";
import { setOpenPartyModal } from "../../../redux/features/openModel";
import { push } from "../../../redux/features/opentabs";
import { useSendKycEmailMutation } from "../../../redux/services/emailApi";

const MODEL = "Party Master";

export default function Form() {
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [panNo, setPanNo] = useState("");
  const [name, setName] = useState("");
  const [aliasName, setAliasName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tinNo, setTinNo] = useState("");
  const [cstNo, setCstNo] = useState("");
  const [cinNo, setCinNo] = useState("");
  const [faxNo, setFaxNo] = useState("");
  const [website, setWebsite] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [contactPersonName, setContactPersionName] = useState("");
  const [igst, setIgst] = useState(false);
  const [gstNo, setGstNo] = useState("");
  const [costCode, setCostCode] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [isGy, setIsGy] = useState(false);
  const [isDy, setIsDy] = useState(false);
  const [isAcc, setIsAcc] = useState(false);
  const [payTermDay, setPayTermDay] = useState("0");
  const [processDetails, setProcessDetails] = useState([]);

  const [cstDate, setCstDate] = useState("");
  const [email, setEmail] = useState("");
  const [kycEmail, setKycEmail] = useState("");

  const [accessoryItemList, setAccessoryItemList] = useState([]);

  const [accessoryGroup, setAccessoryGroup] = useState(false);
  const [accessoryGroupPrev, setAccessoryGroupPrev] = useState(false);
  const [priceTemplateId, setPriceTemplateId] = useState("");

  const [currency, setCurrency] = useState("INR");
  const [active, setActive] = useState(true);
  const [isSupplier, setSupplier] = useState(true);
  const [isClient, setClient] = useState(true);
  const [itemsPopup, setItemsPopup] = useState(false);
  const [backUpItemsList, setBackUpItemsList] = useState([]);
  const [shippingAddress, setShippingAddress] = useState([]);
  const [contactDetails, setContactDetails] = useState([]);

  const [searchValue, setSearchValue] = useState("");

  const [errors, setErrors] = useState({});
  const [image, setImage] = useState({});
  console.log(typeof image, "image", image);

  const childRecord = useRef(0);
  const dispatch = useDispatch();

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  // const { data: accessoryItemsMasterList, isLoading: isItemsLoading, isFetching: isItemsFetching } = useGetAccessoryItemMasterQuery({ companyId })
  let accessoryItemsMasterList;

  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId"
  );
  const params = {
    companyId,
  };
  const { data: cityList } = useGetCityQuery({ params });
  console.log(cityList, "cityList");

  const { data: currencyList } = useGetCurrencyMasterQuery({ params });

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetPartyQuery({ params, searchParams: searchValue });
  const openPartyModal = useSelector((state) => state.party.openPartyModal);
  const lastTapName = useSelector((state) => state.party.lastTab);

  const activeTab = useSelector(
    (state) => state.openTabs.tabs.find((tab) => tab.active).name
  );
  console.log(activeTab, "activeTab");
  useEffect(() => {
    if (openPartyModal) {
      setId("");
      setForm(true);
    }
  }, [openPartyModal]);

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPartyByIdQuery(id, { skip: !id });

  const [addData] = useAddPartyMutation();
  const [updateData] = useUpdatePartyMutation();
  const [removeData] = useDeletePartyMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        setReadOnly(false);
        setPanNo("");
        setName("");
        setImage("");
        setAliasName("");
        setDisplayName("");
        setAddress("");
        setTinNo("");
        setCstNo("");
        setCinNo("");
        setFaxNo("");
        setCinNo("");
        setContactPersionName("");
        setGstNo("");
        setCostCode("");
        setPayTermDay("0");
        setCstDate("");
        setCode("");
        setPincode("");
        setWebsite("");
        setEmail("");
        setCity("");
        setCurrency("");
        setActive(id ? data?.active : true);
        setSupplier(false);
        setClient(false);
        setContactMobile("");
        setAccessoryGroup(false);
        setAccessoryItemList([]);
        setPriceTemplateId("");
        setProcessDetails([]);
      } else {
        setReadOnly(true);
        setPanNo(data?.panNo || "");
        setName(data?.name || "");

        setAliasName(data?.aliasName || "");
        setImage(data?.image || "");
        setDisplayName(data?.displayName || "");
        setAddress(data?.address || "");
        setTinNo(data?.tinNo || "");
        setCstNo(data?.cstNo || "");
        console.log(data?.isGy, "isGy");
        setIsGy(data?.isGy || false);
        setIsDy(data?.isDy || false);
        setIsAcc(data?.isAcc || false);
        setCinNo(data?.cinNo || "");
        setFaxNo(data?.faxNo || "");
        setCinNo(data?.cinNo || "");
        setContactPersionName(data?.contactPersionName || "");
        setGstNo(data?.gstNo || "");
        setCostCode(data?.costCode || "");
        setCstDate(
          data?.cstDate ? moment.utc(data?.cstDate).format("YYYY-MM-DD") : ""
        );
        setPayTermDay(data?.payTermDay);
        setCode(data?.code || "");
        setPincode(data?.pincode || "");
        setWebsite(data?.website || "");
        setEmail(data?.email || "");
        setCity(data?.cityId || "");
        setCurrency(data?.currencyId || "");
        setActive(id ? data?.active ?? false : true);
        setSupplier(data?.yarn || false);
        setClient(data?.fabric || false);
        setAccessoryGroup(data?.accessoryGroup || false);
        setAccessoryItemList(
          data?.PartyOnAccessoryItems
            ? data.PartyOnAccessoryItems.map((item) =>
                parseInt(item.accessoryItemId)
              )
            : []
        );
        setPriceTemplateId(data?.priceTemplateId || "");
        setShippingAddress(data?.ShippingAddress ? data?.ShippingAddress : []);
        setContactDetails(data?.ContactDetails ? data.ContactDetails : "");
        setSupplier(data?.isSupplier || false);
        setClient(data?.isClient || false);
        setProcessDetails(
          data?.PartyOnProcess
            ? data.PartyOnProcess.map((item) => {
                return {
                  value: parseInt(item.processId),
                  label: findFromList(item.processId, processList.data, "name"),
                };
              })
            : []
        );
      }
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    name,
    code,
    aliasName,
    displayName,
    address,
    cityId: city,
    pincode,
    panNo,
    tinNo,
    cstNo,
    cstDate,
    cinNo,
    faxNo,
    email,
    website,
    contactPersonName,
    igst,
    currencyId: currency,
    costCode,
    contactMobile,
    gstNo,
    active,
    isSupplier,
    isClient,
    accessoryGroup,
    companyId,
    shippingAddress,
    contactDetails,
    payTermDay,
    accessoryItemList,
    processDetails: processDetails
      ? processDetails.map((item) => item.value)
      : undefined,
    id,
    userId,
    priceTemplateId,
    image,
    isAcc,
    isGy,
    isDy,
  };
  console.log(isAcc, isGy, isDy);
  const [sendKycEmail, { isLoadingMail }] = useSendKycEmailMutation();
  const {
    data: processList,
    isLoading: isProcessLoading,
    isFetching: isProcessFetching,
  } = useGetProcessMasterQuery({ params });
  console.log(payTermDay, "payTermDay");
  const validateData = (data) => {
    if (data.name) {
      return true;
      // && data.joiningDate && data.fatherName && data.dob && data.gender && data.maritalStatus && data.bloodGroup &&
      //     data.panNo && data.email && data.mobile && data.degree && data.specialization &&
      //     data.localAddress && data.localCity && data.localPincode && data.partyCategoryId && data.currencyId
    }
    return false;
  };
  const handleSubmitCustom = async (callback, data, text, exit = false) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: data }).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      toast.success(text + "Successfully");
      dispatch({
        type: `accessoryItemMaster/invalidateTags`,
        payload: ["AccessoryItemMaster"],
      });
      dispatch({
        type: `CityMaster/invalidateTags`,
        payload: ["City/State Name"],
      });
      dispatch({
        type: `CurrencyMaster/invalidateTags`,
        payload: ["Currency"],
      });

      setId(returnData.data.id);
      onNew();
      setStep(1);
      if (exit) {
        setForm(false);
      }
      if (exit) {
        if (openPartyModal === true && lastTapName) {
          dispatch(push({ name: lastTapName }));
        }

        dispatch(setOpenPartyModal(false));
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong during submission");
    }
  };

  const handleSendEmail = async () => {
    if (!kycEmail) {
      alert("Please enter an email address.");
      return;
    }

    try {
      const response = await sendKycEmail({ to: kycEmail });

      if (response?.data) {
        alert("Email sent successfully!");
        setKycEmail("");
      } else {
        alert("Failed to send email. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while sending the email.");
    }
  };

  useEffect(() => {
    if (itemsPopup) {
      setBackUpItemsList(accessoryItemList);
    }
  }, [itemsPopup]);
  useEffect(() => {
    if (accessoryGroup) {
      if (accessoryItemsMasterList) {
        setAccessoryItemList(
          accessoryItemsMasterList.data.map((item) => parseInt(item.id))
        );
      }
    }
  }, [
    accessoryGroup,
    //  isItemsFetching, isItemsLoading,
    accessoryItemsMasterList,
  ]);

  const saveData = () => {
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
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        let deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          toast.error(deldata?.message);
          return;
        }
        dispatch({
          type: `accessoryItemMaster/invalidateTags`,
          payload: ["AccessoryItemMaster"],
        });
        setId("");
        dispatch({
          type: `CityMaster/invalidateTags`,
          payload: ["City/State Name"],
        });
        dispatch({
          type: `CurrencyMaster/invalidateTags`,
          payload: ["Currency"],
        });
        syncFormWithDb(undefined);
        toast.success("Deleted Successfully");
        setForm(false);
      } catch (error) {
        toast.error("something went wrong");
      }
    }
  };

  // Handle next step
  const handleNext = () => {
    // if (validateStep()) {
    setStep(step + 1);
    // }
  };

  // Handle previous step
  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const onNew = () => {
    console.log("onNewCalled");
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    setId("");
    syncFormWithDb(undefined);
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
  function handleInputAddress(value, index, field) {
    const newBlend = structuredClone(shippingAddress);
    newBlend[index][field] = value;
    setShippingAddress(newBlend);
  }

  function deleteAddress(index) {
    setShippingAddress((prev) => prev.filter((_, i) => i !== index));
  }
  function addNewAddress() {
    setShippingAddress((prev) => [...prev, { address: "" }]);
  }

  function removeItem(index) {
    setContactDetails((contactDetails) => {
      return contactDetails.filter((_, i) => parseInt(i) !== parseInt(index));
    });
  }
  console.log(igst, "igst");

  const tableHeaders = [
    "S.NO",
    "Name",
    "Alias Name",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
  ];
  const tableDataNames = [
    "index+1",
    "dataObj.name",
    "dataObj.aliasName",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
  ];

  //step
  const [step, setStep] = useState(1);
  // const [errors, setErrors] = useState({});

  // if (isItemsFetching || isItemsLoading || isProcessLoading || isProcessFetching) {
  //     return <Loader />
  // }
  console.log(isGy, "isGy");
  const openKYCInNewTab = () => {
    window.open("/kyc-form", "_blank");
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="w-full flex justify-between mb-2 items-center px-0.5">
        <h5 className="my-1">Party Master</h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-green-500 text-white px-3 py-1 button rounded shadow-md"
          >
            + New
          </button>
        </div>
      </div>
      <div className="w-full flex items-start">
        <Mastertable
          header={"Party List"}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onDataClick={onDataClick}
          // setOpenTable={setOpenTable}
          tableHeaders={tableHeaders}
          tableDataNames={tableDataNames}
          data={allData?.data}
          loading={isLoading || isFetching}
        />
      </div>
      {form === true && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[40%] h-[80%]"}
          onClose={() => {
            setForm(false);
            setErrors({});
            setStep(1);
            if (openPartyModal === true) {
              dispatch(push({ name: lastTapName }));
            }
            dispatch(setOpenPartyModal(false));
          }}
        >
          <Modal
            isOpen={itemsPopup}
            onClose={() => {
              setAccessoryGroup(accessoryGroupPrev);
              setAccessoryItemList(structuredClone(backUpItemsList));
              setItemsPopup(false);
            }}
            widthClass={
              "w-[600px] h-[600px] overflow-auto flex justify-start item-center bg-blue-100 p-10"
            }
          >
            <PartyOnItems
              readOnly={readOnly}
              setItemsPopup={setItemsPopup}
              accessoryItemsMasterList={accessoryItemsMasterList}
              accessoryItemList={accessoryItemList}
              setAccessoryItemList={setAccessoryItemList}
            />
          </Modal>
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
  saveExitData={saveExitData}
  setReadOnly={setReadOnly}
  deleteData={deleteData}
  readOnly={readOnly}
  emptyErrors={() => setErrors({})}
>
  <div className="space-y-8">
    {step === 1 && (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto]">
        {/* Left Section: Options */}
        <div className="space-y-6">
          {/* Party Type Card */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xs">
            <h3 className="mb-5 text-lg font-semibold text-gray-900">
              Party Type
            </h3>
            <div className={`space-y-5 ${readOnly ? "opacity-80" : ""}`}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FancyCheckBox
                  label="Is Supplier"
                  value={isSupplier}
                  onChange={setSupplier}
                  readOnly={readOnly}
                  className="hover:bg-gray-50 p-3 rounded-lg transition-colors"
                />
                <FancyCheckBox
                  label="Is Client"
                  value={isClient}
                  onChange={setClient}
                  readOnly={readOnly}
                  className="hover:bg-gray-50 p-3 rounded-lg transition-colors"
                />

                {isSupplier && (
                  <div className="col-span-full space-y-1 rounded-lg bg-gray-50">
                  
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FancyCheckBox
                        label="Grey Yarn"
                        value={isGy}
                        onChange={setIsGy}
                        readOnly={readOnly}
                        className="hover:bg-gray-100 p-3 rounded-lg"
                      />
                      <FancyCheckBox
                        label="Dyed Yarn"
                        value={isDy}
                        onChange={setIsDy}
                        readOnly={readOnly}
                        className="hover:bg-gray-100 p-3 rounded-lg"
                      />
                      <FancyCheckBox
                        label="Accessories"
                        value={isAcc}
                        onChange={setIsAcc}
                        readOnly={readOnly}
                        className="hover:bg-gray-100 p-3 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KYC Actions */}
          <div className="rounded-xl border border-gray-100 bg-white p-1 shadow-xs">
            <h4 className="mb-4 text-base font-medium text-gray-700">
              KYC Update Notification
            </h4>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
               
                <input
                  type="email"
                  value={kycEmail}
                  onChange={(e) => setKycEmail(e.target.value)}
                  placeholder="Enter recipient email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSendEmail}
                  disabled={isLoading}
                  className={`flex h-[42px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Image Upload */}
        <div className="flex flex-col items-center lg:items-end">
          <div className="w-full max-w-xs rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
            <h3 className="mb-4 text-center text-base font-medium text-gray-700">
              Party Logo/Image
            </h3>
            <BrowseSingleImage
              picture={image}
              setPicture={setImage}
              readOnly={readOnly}
              className="h-52 w-52 rounded-xl border-2 border-dashed border-gray-200 p-2 hover:border-blue-300 transition-colors"
            />
            {!readOnly && (
              <p className="mt-3 text-center text-xs text-gray-500">
                Click to upload or drag and drop
              </p>
            )}
          </div>
        </div>
      </div>
    )}

    {step === 2 && (
      <div className="space-y-6">
        {/* Basic Information Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xs">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">
                Status:
              </span>
              <ToggleButton
                name="Status"
                options={statusDropdown}
                value={active}
                setActive={setActive}
                required={true}
                readOnly={readOnly}
                className="bg-gray-100 p-1 rounded-lg"
                activeClass="bg-white shadow-sm text-blue-600 font-medium"
                inactiveClass="text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <TextInput
              name="Party Name"
              type="text"
              value={name}
              setValue={setName}
              required={true}
              readOnly={readOnly}
              disabled={childRecord.current > 0}
              onBlur={(e) => {
                if (aliasName) return;
                setAliasName(e.target.value);
              }}
              className="focus:ring-2 focus:ring-blue-100"
            />

            <TextInput
              name="Alias Name"
              type="text"
              value={aliasName}
              setValue={setAliasName}
              required={true}
              readOnly={readOnly}
              disabled={childRecord.current > 0}
              className="focus:ring-2 focus:ring-blue-100"
            />

            <TextInput
              name="Pan No"
              type="pan_no"
              value={panNo}
              setValue={setPanNo}
              readOnly={readOnly}
              disabled={childRecord.current > 0}
              className="focus:ring-2 focus:ring-blue-100"
            />

            <TextInput
              name="GST No"
              type="text"
              value={gstNo}
              setValue={setGstNo}
              readOnly={readOnly}
              className="focus:ring-2 focus:ring-blue-100"
            />

            <TextInput
              name="Pincode"
              type="number"
              value={pincode}
              setValue={setPincode}
              readOnly={readOnly}
              disabled={childRecord.current > 0}
              className="focus:ring-2 focus:ring-blue-100"
            />

            <TextInput
              name="Cost Code"
              type="text"
              value={costCode}
              setValue={setCostCode}
              readOnly={readOnly}
              disabled={childRecord.current > 0}
              className="focus:ring-2 focus:ring-blue-100"
            />

            <TextInput
              name="CST No"
              type="text"
              value={cstNo}
              setValue={setCstNo}
              readOnly={readOnly}
              disabled={childRecord.current > 0}
              className="focus:ring-2 focus:ring-blue-100"
            />

            <TextInput
              name="Tin No"
              type="text"
              value={tinNo}
              setValue={setTinNo}
              readOnly={readOnly}
              disabled={childRecord.current > 0}
              className="focus:ring-2 focus:ring-blue-100"
            />

            <DateInput
              name="CST Date"
              value={cstDate}
              setValue={setCstDate}
              readOnly={readOnly}
              disabled={childRecord.current > 0}
              className="focus:ring-2 focus:ring-blue-100"
            />

            <TextInput
              name="Cin No"
              type="text"
              value={cinNo}
              setValue={setCinNo}
              readOnly={readOnly}
              disabled={childRecord.current > 0}
              className="focus:ring-2 focus:ring-blue-100"
            />

            <TextInput
              name="Fax No"
              type="text"
              value={faxNo}
              setValue={setFaxNo}
              readOnly={readOnly}
              disabled={childRecord.current > 0}
              className="focus:ring-2 focus:ring-blue-100"
            />

            <DropdownInput
              name="Currency"
              options={dropDownListObject(
                id
                  ? currencyList?.data ?? []
                  : currencyList?.data?.filter(
                      (item) => item.active
                    ) ?? [],
                "name",
                "id"
              )}
              lastTab={activeTab}
              masterName="CURRENCY MASTER"
              value={currency}
              setValue={setCurrency}
              readOnly={readOnly}
              disabled={childRecord.current > 0}
              className="focus:ring-2 focus:ring-blue-100"
            />

            <DropdownInput
              name="City/State Name"
              options={dropDownListMergedObject(
                id
                  ? cityList?.data
                  : cityList?.data?.filter((item) => item.active),
                "name",
                "id"
              )}
              masterName="CITY MASTER"
              lastTab={activeTab}
              value={city}
              setValue={setCity}
              required={true}
              readOnly={readOnly}
              disabled={childRecord.current > 0}
              className="focus:ring-2 focus:ring-blue-100"
            />

            <TextInput
              name="PayTerm Days"
              type="name"
              value={payTermDay}
              setValue={setPayTermDay}
              readOnly={readOnly}
              disabled={childRecord.current > 0}
              className="focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>
    )}

    {step === 3 && (
      <div className="space-y-8">
        {/* Shipping Address Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xs">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Shipping Addresses
            </h3>
            <button
              onClick={addNewAddress}
              disabled={readOnly}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:shadow-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Address
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    S.No
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Address
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {(shippingAddress || []).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-50"
                        value={item?.address || ""}
                        disabled={readOnly}
                        onChange={(e) =>
                          handleInputAddress(
                            e.target.value,
                            index,
                            "address"
                          )
                        }
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => deleteAddress(index)}
                        disabled={readOnly}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:text-gray-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {(!shippingAddress || shippingAddress.length === 0) && (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <p>No shipping addresses added yet</p>
                        <button
                          onClick={addNewAddress}
                          disabled={readOnly}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                        >
                          + Add your first address
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact Details Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xs">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Contact Details
            </h3>
            <button
              type="button"
              onClick={() => setContactDetails([...contactDetails, {}])}
              disabled={readOnly || childRecord.current > 0}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:shadow-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Add Contact
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    S.No
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Contact Person
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Mobile No
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {(contactDetails || []).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm capitalize focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-50"
                        value={item.contactPersonName || ""}
                        onChange={(e) => {
                          const updated = [...contactDetails];
                          updated[index].contactPersonName =
                            e.target.value;
                          setContactDetails(updated);
                        }}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        required
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-50"
                        value={item.mobileNo || ""}
                        onChange={(e) => {
                          const updated = [...contactDetails];
                          updated[index].mobileNo = e.target.value;
                          setContactDetails(updated);
                        }}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        required
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-gray-50"
                        value={item.email || ""}
                        onChange={(e) => {
                          const updated = [...contactDetails];
                          updated[index].email = e.target.value;
                          setContactDetails(updated);
                        }}
                        readOnly={readOnly}
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={readOnly || childRecord.current > 0}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:text-gray-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {(!contactDetails || contactDetails.length === 0) && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <p>No contact details added yet</p>
                        <button
                          onClick={() => setContactDetails([...contactDetails, {}])}
                          disabled={readOnly || childRecord.current > 0}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                        >
                          + Add your first contact
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </div>
</MastersForm>
          <div className="absolute bottom-12 right-0 left-0 flex justify-between items-center px-5">
            {/* Previous Icon Button */}
            <button
              type="button"
              onClick={handlePrevious}
              className={`w-10 h-10 flex items-center justify-center rounded-full bg-gray-600 text-white shadow hover:bg-gray-700 transition duration-200 ${
                step > 1 ? "block" : "hidden"
              }`}
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Next Icon Button */}
            <button
              type="button"
              onClick={handleNext}
              className={`w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white shadow hover:bg-blue-700 transition duration-200 ${
                step < 3 ? "block" : "hidden"
              }`}
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
