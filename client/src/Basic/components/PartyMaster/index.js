import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { useGetCityQuery } from "../../../redux/services/CityMasterService";
// import { useGetCurrencyMasterQuery } from '../../../redux/ErpServices/CurrencyMasterServices';
import {
  useAddPartyMutation,
  useDeletePartyMutation,
  useGetPartyByIdQuery,
  useGetPartyQuery,
  useUpdatePartyMutation,
} from "../../../redux/services/PartyMasterService";
import moment from "moment";
import { findFromList } from "../../../Utils/helper";
// import { useGetProcessQuery } from '../../../redux/services/procss';
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
  const [payTermDay,setPayTermDay] = useState('0')
  const [processDetails, setProcessDetails] = useState([]);

  const [cstDate, setCstDate] = useState("");
  const [email, setEmail] = useState("");
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
;
  const { data: cityList } = useGetCityQuery({ params });
  console.log(cityList, "cityList");

  const { data: currencyList } = useGetCurrencyMasterQuery({ params });

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetPartyQuery({ params, searchParams: searchValue });
  const openPartyModal = useSelector((state) => state.party.openPartyModal);
  const lastTapName =  useSelector((state)=>state.party.lastTab)

  console.log(lastTapName,"lastTapName")
const activeTab = useSelector((state) =>
    state.openTabs.tabs.find((tab) => tab.active).name
  );
  console.log(activeTab, "activeTab")
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
        setPayTermDay("0")
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
        setPayTermDay(data?.payTermDay)
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
  const {
    data: processList,
    isLoading: isProcessLoading,
    isFetching: isProcessFetching,
  } = useGetProcessMasterQuery({ params });
console.log(payTermDay,"payTermDay")
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
      if(exit){
        setForm(false)
      }
      if(exit){
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
      handleSubmitCustom(addData, data, "Added",true);
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
     console.log("onNewCalled")
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
            saveExitData = {saveExitData}
            setReadOnly={setReadOnly}
            deleteData={deleteData}
            readOnly={readOnly}
            emptyErrors={() => setErrors({})}
          >
            <fieldset className=" rounded ">
              <div className="">
                {step === 1 && (
                  <div className="flex flex-wrap gap-8">
                    <div className="w-full md:w-2/3">
                      <fieldset className="border border-gray-300 rounded-xl p-6 shadow-sm bg-white">
                        <legend className="text-lg font-semibold text-gray-700 px-2">
                          Options
                        </legend>
                        <div
                          className={`space-y-6 ${
                            readOnly ? "pointer-events-none" : ""
                          }`}
                        >
                          <div className="grid grid-cols-2 md:grid-cols-2 gap-4" style={{fontSize:12}}>
                            <FancyCheckBox
                              label="Is Supplier"
                              value={isSupplier}
                              onChange={setSupplier}
                              readOnly={readOnly}
                            />
                            <FancyCheckBox
                              label="Is Client"
                              value={isClient}
                              onChange={setClient}
                              readOnly={readOnly}
                            />
                         
                            {isSupplier && (
                              <>
                                <FancyCheckBox
                                  label="Grey Yarn"
                                  value={isGy}
                                  onChange={setIsGy}
                                  readOnly={readOnly}
                                />
                                <FancyCheckBox
                                  label="Dyed Yarn"
                                  value={isDy}
                                  onChange={setIsDy}
                                  readOnly={readOnly}
                                />
                                <FancyCheckBox
                                  label="Accessories"
                                  value={isAcc}
                                  onChange={setIsAcc}
                                  readOnly={readOnly}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </fieldset>
                    </div>

                    {/* Right Section: Image Upload */}
                    <div className="w-full md:w-1/4 flex justify-center items-center">
                      <div className="p-2 rounded-lg w-full max-w-xs bg-gray-50">
                        <BrowseSingleImage
                          picture={image}
                          setPicture={setImage}
                          readOnly={readOnly}
                        />
                      </div>
                    </div>
                  </div>
                )}

{step === 2 && (
  <fieldset>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
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
      />

      <TextInput
        name="Alias Name"
        type="text"
        value={aliasName}
        setValue={setAliasName}
        required={true}
        readOnly={readOnly}
        disabled={childRecord.current > 0}
      />

    
      <TextInput
        name="Pan No"
        type="pan_no"
        value={panNo}
        setValue={setPanNo}
        readOnly={readOnly}
        disabled={childRecord.current > 0}
      />

      <TextInput
        name="GST No"
        type="text"
        value={gstNo}
        setValue={setGstNo}
        readOnly={readOnly}
      />

      <TextInput
        name="Pincode"
        type="number"
        value={pincode}
        setValue={setPincode}
        readOnly={readOnly}
        disabled={childRecord.current > 0}
      />

      <TextInput
        name="Cost Code"
        type="text"
        value={costCode}
        setValue={setCostCode}
        readOnly={readOnly}
        disabled={childRecord.current > 0}
      />

      <TextInput
        name="CST No"
        type="text"
        value={cstNo}
        setValue={setCstNo}
        readOnly={readOnly}
        disabled={childRecord.current > 0}
      />

      <TextInput
        name="Tin No"
        type="text"
        value={tinNo}
        setValue={setTinNo}
        readOnly={readOnly}
        disabled={childRecord.current > 0}
      />

      <DateInput
        name="CST Date"
        value={cstDate}
        setValue={setCstDate}
        readOnly={readOnly}
        disabled={childRecord.current > 0}
      />

      <TextInput
        name="Cin No"
        type="text"
        value={cinNo}
        setValue={setCinNo}
        readOnly={readOnly}
        disabled={childRecord.current > 0}
      />

      <TextInput
        name="Fax No"
        type="text"
        value={faxNo}
        setValue={setFaxNo}
        readOnly={readOnly}
        disabled={childRecord.current > 0}
      />
        <DropdownInput
        name="Currency"
        options={dropDownListObject(
          id
            ? currencyList?.data ?? []
            : currencyList?.data?.filter((item) => item.active) ?? [],
          "name",
          "id"
        )}
        lastTab = {activeTab}
        masterName="CURRENCY MASTER"
        value={currency}
        setValue={setCurrency}
        readOnly={readOnly}
        disabled={childRecord.current > 0}
      />

      <DropdownInput
        name="City/State Name"
        options={dropDownListMergedObject(
          id ? cityList?.data : cityList?.data?.filter((item) => item.active),
          "name",
          "id"
        )}
        masterName= "CITY MASTER"
        lastTab = {activeTab}
        value={city}
        setValue={setCity}
        required={true}
        readOnly={readOnly}
        disabled={childRecord.current > 0}
       
      />
   <TextInput
        name="PayTerm Days"
        type="name"
        value={payTermDay}
        setValue={setPayTermDay}
        readOnly={readOnly}
        disabled={childRecord.current > 0}
      />

      <div className="col-span-1 md:col-span-2 mt-5 lg:col-span-3">
        <ToggleButton
          name="Status"
          options={statusDropdown}
          value={active}
          setActive={setActive}
          required={true}
          readOnly={readOnly}
        />
      </div>
      
    </div>
  </fieldset>
)}

{step === 3 && (
  <>
    {/* Shipping Address */}
    <fieldset className="bg-white p-4 rounded-lg shadow-sm border border-gray-300 mb-4 text-[12px]">
      <legend className="text-[11px] font-semibold text-gray-700 mb-2 px-2">Shipping Address</legend>
      <div className="overflow-x-auto">
        <table className="min-w-full text-gray-700 border border-gray-300 text-[12px]">
          <thead className="bg-blue-100 text-left">
            <tr className="h-6">
              <th className="px-1 py-1 w-10 border-r">S.No</th>
              <th className="px-1 py-1 border-r">Address</th>
              <th className="px-1 py-1 w-10 text-center">
                <button
                  onClick={addNewAddress}
                  className="text-green-600 hover:text-green-800"
                >
                  {PLUS}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {(shippingAddress || []).map((item, index) => (
              <tr key={index} className="border-t border-gray-300 h-7">
                <td className="px-1 py-1 text-center">{index + 1}</td>
                <td className="px-1 py-1">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-1 py-[2px] focus:outline-none focus:ring-1 focus:ring-blue-400 text-[12px]"
                    value={item?.address || ""}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputAddress(e.target.value, index, "address")
                    }
                  />
                </td>
                <td className="px-1 py-1 text-center">
                  <button
                    type="button"
                    onClick={() => deleteAddress(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    {DELETE}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </fieldset>

    {/* Contact Details */}
    <fieldset className="bg-white p-4 rounded-lg shadow-sm border border-gray-300 text-[12px]">
      <legend className="text-[11px] font-semibold text-gray-700 mb-2 px-2">Contact Details</legend>
      <div className="overflow-x-auto">
        <table className="min-w-full text-gray-700 border border-gray-300 text-[12px]">
          <thead className="bg-blue-100 text-left">
            <tr className="h-6">
              <th className="px-1 py-1 w-10 border-r">S.No</th>
              <th className="px-1 py-1 border-r">Contact Person Name</th>
              <th className="px-1 py-1 border-r">Mobile No</th>
              <th className="px-1 py-1 border-r">Email</th>
              <th className="px-1 py-1 w-10 text-center">
                <button
                  type="button"
                  onClick={() => setContactDetails([...contactDetails, {}])}
                  className="text-green-600 hover:text-green-800"
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {(contactDetails || []).map((item, index) => (
              <tr key={index} className="border-t border-gray-300 h-7">
                <td className="px-1 py-1 text-center">{index + 1}</td>
                <td className="px-1 py-1">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-1 py-[2px] capitalize focus:outline-none focus:ring-1 focus:ring-blue-400 text-[12px]"
                    value={item.contactPersonName}
                    onChange={(e) => {
                      const updated = [...contactDetails];
                      updated[index].contactPersonName = e.target.value;
                      setContactDetails(updated);
                    }}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    required
                  />
                </td>
                <td className="px-1 py-1">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-1 py-[2px] focus:outline-none focus:ring-1 focus:ring-blue-400 text-[12px]"
                    value={item.mobileNo}
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
                <td className="px-1 py-1">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-1 py-[2px] focus:outline-none focus:ring-1 focus:ring-blue-400 text-[12px]"
                    value={item.email}
                    onChange={(e) => {
                      const updated = [...contactDetails];
                      updated[index].email = e.target.value;
                      setContactDetails(updated);
                    }}
                    readOnly={readOnly}
                  />
                </td>
                <td className="px-1 py-1 text-center">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FontAwesomeIcon icon={faTrashCan} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </fieldset>
  </>
)}

              </div>
            </fieldset>
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
