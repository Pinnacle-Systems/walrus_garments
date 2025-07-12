import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { useGetCityQuery } from "../../../redux/services/CityMasterService";
import {
  useAddPartyMutation,
  useDeletePartyBranchMutation,
  useDeletePartyMutation,
  useGetPartyByIdQuery,
  useGetPartyQuery,
  useUpdatePartyMutation,
} from "../../../redux/services/PartyMasterService";
import { useGetCertificateQuery } from "../../../redux/services/CertificateMasterService";
import moment from "moment";
import { findFromList } from "../../../Utils/helper";
import {
  dropDownListMergedObject,
  dropDownListObject,
  multiSelectOption,
} from "../../../Utils/contructObject";
import { statusDropdown } from "../../../Utils/DropdownData";
import MastersForm from "../MastersForm/MastersForm";
import {

  ToggleButton,
  DateInput,
  DropdownInput,
  TextInput,
  FancyCheckBox,
  MultiSelectDropdown,
  CheckBox,
  RadioButton,
  TextArea,
} from "../../../Inputs";
import { useGetProcessMasterQuery } from "../../../redux/uniformService/ProcessMasterService";
import { useGetCurrencyMasterQuery } from "../../../redux/services/CurrencyMasterServices";
import { toast } from "react-toastify";
import { setOpenPartyModal } from "../../../redux/features/openModel";
import { push } from "../../../redux/features/opentabs";
import { useSendKycEmailMutation } from "../../../redux/services/emailApi";
import CommonTable from "../../../Shocks/CommonReport/CommonTable";
import { FaChevronRight } from "react-icons/fa6";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
import AddBranch from "./AddBranch";
import Modal from "../../../UiComponents/Modal";

const MODEL = "Party Master";

export default function Form({ partyId, onCloseForm, openModelForAddress }) {

  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
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
  const [mail, setMail] = useState("");
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
  const [certificate, setCertificate] = useState([])
  const [searchValue, setSearchValue] = useState("");
  const [email, setEmail] = useState("")
  const [addressOnlyRead, setAddressOnlyRead] = useState(true)
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState({});
  const [branchModelOpen, setBranchModelOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchContact, setBranchContact] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  const [partyBranch, setPartyBranch] = useState([])

  const childRecord = useRef(0);
  const dispatch = useDispatch();

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );

  let accessoryItemsMasterList;

  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId"
  );
  const params = {
    companyId,
  };
  const { data: cityList } = useGetCityQuery({ params });
  const { data: payTermList } = useGetPaytermMasterQuery({ params });

  const cerdificateDetail = useGetCertificateQuery({ params })
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
  const [removeBranchData] = useDeletePartyBranchMutation();

  const syncFormWithDb = useCallback(
    (data) => {

      if (id || partyId) {
        if (openModelForAddress || partyId) {
          setReadOnly(false);

        }
        else {
          setReadOnly(true);
        }

      } else {
        setReadOnly(false);
      }
      setPanNo(data?.panNo || "");
      setName(data?.name || "");
      setMail(data?.mailId || "")
      setAliasName(data?.aliasName || "");
      setImage(data?.image || "");
      setDisplayName(data?.displayName || "");
      setAddress(data?.address || "");
      setTinNo(data?.tinNo || "");
      setCstNo(data?.cstNo || "");
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
      setPayTermDay(data?.payTermDay || "");
      setCode(data?.code || "");
      setPincode(data?.pincode || "");
      setWebsite(data?.website || "");
      setEmail(data?.email || "");
      setCity(data?.cityId || "");
      setCurrency(data?.currencyId || "");
      setActive(id ? data?.active : true);
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
      setBranchAddress(data?.branchAddress ? data?.branchAddress : "")
      setBranchEmail(data?.branchEmail ? data?.branchEmail : "")
      setBranchContact(data?.branchContact ? data?.branchContact : "")
      setBranchName(data?.branchName ? data?.branchName : "")
      setBranchCode(data?.branchCode ? data?.branchCode : "");
      setPartyBranch(data?.partyBranch ? data?.partyBranch : [])
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
    certificate,
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
    certificate, mail,
    isGy,
    isDy,
    partyBranch
  };

  const [sendKycEmail, { isLoadingMail }] = useSendKycEmailMutation();
  const {
    data: processList,
    isLoading: isProcessLoading,
    isFetching: isProcessFetching,
  } = useGetProcessMasterQuery({ params });

  const validateData = (data) => {
    if (data.name) {
      return true;

    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text, exit = false) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: data }).unwrap();
      } else {
        console.log("add")
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

      handleSubmitCustom(addData, data, "Added", true);
    }
  };

  const deleteData = async ( id ) => {
    console.log(id)
    
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
    
  };


  const deletePartyBranchData = async (partyBranchId) => {
    if (partyBranchId) {


      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }


      try {
        let deldata = await removeBranchData(partyBranchId).unwrap();
        if (deldata?.statusCode == 1) {
          toast.error(deldata?.message);
          return;
        }
        toast.success("Deleted Successfully");
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

  const onNew = () => {
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

  function deleteAddress(id) {
    setPartyBranch((prev) => prev.filter((v, i) => parseInt(v?.id) !== parseInt(id)));
    deletePartyBranchData(id)
  }
  function addNewAddress() {

    setShippingAddress((prev) => [...prev, { address: "" }]);
  }

  function addNewBranch() {
    setPartyBranch((prev) => [...prev, { branchName: "", branchCode: "", branchEmail: "", branchContact: "", branchAddress: "" }]);
  }

  function removeItem(index) {
    setContactDetails((contactDetails) => {
      return contactDetails.filter((_, i) => parseInt(i) !== parseInt(index));
    });
  }


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


  const [step, setStep] = useState(1);


  const openKYCInNewTab = () => {
    window.open("/kyc-form", "_blank");
  };


  useEffect(() => {
    if (!partyId) return
    if (partyId == "new") {
      onNew()
    }
    else {
      setId(partyId);
    }
    setForm(true);
    if (openModelForAddress) {
      setIsAddressExpanded(true);
    }
  }, [partyId, openModelForAddress]);




  const handleEdit = (orderId) => {
    setId(orderId)
    setForm(true);
    setReadOnly(false);
  };


  const columns = [

    {
      header: 'Name.',
      accessor: (item) => item.name,
      cellClass: () => 'font-medium text-gray-900'
    },
    {
      header: 'Alias Name',
      accessor: (item) => item.aliasName
    },

  ];

  const handleChange = (type) => {
    setSupplier(type === 'supplier');
    setClient(type === 'client');
  };

  if (partyId) {
    return (
      <>
        <Modal
          isOpen={form}
          form={form}
          widthClass={`${"w-[75%] "} ${isAddressExpanded ? "h-[95%]" : "h-[95%]"}`}
          onClose={() => {
            setForm(false);
            onCloseForm();
            setErrors({});
            setStep(1);
            if (openPartyModal === true) {
              dispatch(push({ name: lastTapName }));
            }
            dispatch(setOpenPartyModal(false));

          }}
        >

          <Modal
            isOpen={branchModelOpen}
            form={form}
            widthClass={`${"w-[55%] h-[50%]"}`}
            setBranchModelOpen={setBranchModelOpen}
            onClose={() => {
              setBranchModelOpen(false)
            }}
          >



            <AddBranch partyData={allData} partyId={id} branchEmail={branchEmail} setBranchEmail={setBranchEmail} setBranchAddress={setBranchAddress}
              branchName={branchName} setBranchName={setBranchName} branchCode={branchCode} setBranchCode={setBranchCode}
              branchAddress={branchAddress} branchContact={branchContact} setBranchContact={setBranchContact} onNew={onNew}
              setId={setId} childRecord={childRecord} saveData={saveData} saveExitData={saveExitData} setReadOnly={setReadOnly}
              deleteData={deleteData} readOnly={readOnly} onCloseForm={onCloseForm}
              handleChange={handleChange} contactDetails={contactDetails} setContactDetails={setContactDetails}
              shippingAddress={shippingAddress} setForm={setForm} addNewAddress={addNewAddress}
              handleInputAddress={handleInputAddress} deleteAddress={deleteAddress} removeItem={removeItem}
              partyBranch={partyBranch} setPartyBranch={setPartyBranch} setBranchModelOpen={setBranchModelOpen}
            />



          </Modal>

          <MastersForm
            masterClass={"pb-2"}
            onNew={onNew}
            onClose={() => {
              setForm(false);
              setSearchValue("");
              setId(false);
              onCloseForm();
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
            <div className="space-y-4 bg-[#f1f1f0] p-2">
              {/* {step === 1 && ( */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">

                <div className="space-y-2 bg-[#f1f1f0]">

                  <div className="rounded-xl border border-gray-100 bg-[#f1f1f0]  shadow-xs">
                    <h3 className="mb-1 text-sm font-semibold text-gray-900">
                      Party Type
                    </h3>
                    <div className={`space-y-2 ${readOnly ? "opacity-80" : ""}`}>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-6">
                        <div className="grid grid-cols-2 ml-2  items-center gap-1">
                          <input
                            type="radio"
                            name="type"
                            checked={isSupplier}
                            onChange={() => handleChange('supplier')}
                          />

                          <label className="text-xs">Supplier</label>
                        </div>
                        <div className="grid grid-cols-2 ml-2  items-center gap-1">
                          <input
                            type="radio"
                            name="type"
                            checked={isClient}
                            onChange={() => handleChange('client')}
                            readOnly
                          />

                          <label className="text-xs">Client</label>
                        </div>

                        {/* <CheckBox
                              name="Is Supplier"
                              value={isSupplier}
                              setValue={setSupplier}
                              readOnly={readOnly}
                              className="hover:bg-gray-50 p-3 rounded-lg transition-colors"
                            />
                            <CheckBox
                              name="Is Client"
                              value={isClient}
                              setValue={setClient}
                              readOnly={readOnly}
                              className="hover:bg-gray-50 p-3 rounded-lg transition-colors"
                            /> */}



                        {isSupplier && (
                          <>
                            <CheckBox
                              name="Grey Yarn"
                              value={isGy}
                              setValue={setIsGy}
                              readOnly={readOnly}
                              className="hover:bg-gray-100 p-3 rounded-lg"
                            />
                            <CheckBox
                              name="Dyed Yarn"
                              value={isDy}
                              setValue={setIsDy}
                              readOnly={readOnly}
                              className="hover:bg-gray-100 p-3 rounded-lg"
                            />
                            <CheckBox
                              name="Accessories"
                              value={isAcc}
                              setValue={setIsAcc}
                              readOnly={readOnly}
                              className="hover:bg-gray-100 p-3 rounded-lg"
                            />
                          </>
                        )}

                        <div className="flex items-center gap-x-2">

                          <ToggleButton
                            name="Status"
                            options={statusDropdown}
                            value={active}
                            setActive={setActive}
                            required={true}
                            readOnly={readOnly}
                            className="bg-gray-100 p-1 rounded-lg"
                            activeClass="bg-[#f1f1f0]  shadow-sm text-blue-600 "
                            inactiveClass="text-gray-500"
                          />
                        </div>


                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-xl border border-gray-100 bg-[#f1f1f0]  p-1 shadow-xs ">
                      <div className="grid grid-cols-1 gap-x-2  md:grid-cols-2 lg:grid-cols-5 ">
                        <TextInput
                          name={isSupplier ? "Supplier Name" : "Customer Name"}
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

                        {/* <TextInput
                              name="Pincode"
                              type="number"
                              value={pincode}
                              setValue={setPincode}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100"
                            /> */}
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

                        <div className="col-span-2">

                          <TextArea name="Address" inputClass="h-8" value={address} setValue={setAddress} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                        </div>

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
                          name="Pincode"
                          type="number"
                          value={pincode}
                          setValue={setPincode}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100"
                        />


                        <DropdownInput
                          name="PayTerm Days"
                          options={dropDownListObject(
                            id
                              ? payTermList?.data
                              : payTermList?.data?.filter((item) => item.active),
                            "aliasName",
                            "id"
                          )}
                          value={payTermDay}
                          setValue={setPayTermDay}
                          required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100"
                        />



                        <button
                          onClick={() => { setBranchModelOpen(true) }}
                          disabled={readOnly}
                          className="mt-4 flex items-center pl-3 h-9 w-24 rounded-md bg-blue-600  text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Add Branch
                        </button>




                        {/* <TextInput
                              name="PayTerm Days"
                              type="name"
                              value={payTermDay}
                              setValue={setPayTermDay}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100"
                            /> */}

                      </div>
                    </div>
                  </div>

                </div>
              </div>



              <div className="">
                <div
                  className="flex justify-between items-center mb-3 cursor-pointer"
                  onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                >
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center">
                    <FaChevronRight
                      className={`mr-2 text-xs transition-transform ${isAddressExpanded ? 'rotate-90' : ''}`}
                    />
                    Other Details
                  </h3>
                </div>

                {isAddressExpanded && (
                  <>
                    <div className="space-y-2">







                      <div className="mb-4 flex items-center justify-between">
                        <h3 className=" text-sm font-semibold text-gray-900">Contact Details</h3>
                        <button
                          onClick={() => setContactDetails([...contactDetails, {}])}
                          disabled={readOnly || childRecord.current > 0}
                          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                          </svg>
                          Add Contact
                        </button>
                      </div>

                      <div className="overflow-hidden rounded-md border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">S.no</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Mobile</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-[#f1f1f0] ">
                            {(contactDetails || []).map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-600">{index + 1}</td>
                                <td className="px-3 py-1.5">
                                  <input
                                    type="text"
                                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                    value={item.contactPersonName || ""}
                                    onChange={(e) => {
                                      const updated = [...contactDetails];
                                      updated[index].contactPersonName = e.target.value;
                                      setContactDetails(updated);
                                    }}
                                    disabled={readOnly || childRecord.current > 0}
                                  />
                                </td>
                                <td className="px-3 py-1.5">
                                  <input
                                    type="text"
                                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                    value={item.mobileNo || ""}
                                    onChange={(e) => {
                                      const updated = [...contactDetails];
                                      updated[index].mobileNo = e.target.value;
                                      setContactDetails(updated);
                                    }}
                                    disabled={readOnly || childRecord.current > 0}
                                  />
                                </td>
                                <td className="px-3 py-1.5">
                                  <input
                                    type="email"
                                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                    value={item.email || ""}
                                    onChange={(e) => {
                                      const updated = [...contactDetails];
                                      updated[index].email = e.target.value;
                                      setContactDetails(updated);
                                    }}
                                    disabled={readOnly}
                                  />
                                </td>
                                <td className="whitespace-nowrap px-3 py-1.5 text-right">
                                  <button
                                    onClick={() => removeItem(index)}
                                    disabled={readOnly || childRecord.current > 0}
                                    className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {(!contactDetails || contactDetails.length === 0) && (
                              <tr>
                                <td colSpan="5" className="px-3 py-3 text-center">
                                  <div className="flex flex-col items-center justify-center space-y-1 text-gray-400">

                                    <p className="text-xs">No contacts found</p>

                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>









                      <div className="mb-1 flex items-center justify-between">
                        <h3 className=" text-sm font-semibold text-gray-900">
                          Branch Addresses
                        </h3>
                        {/* <button
                          onClick={addNewAddress}
                          disabled={readOnly}
                          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Add Address
                        </button> */}
                      </div>

                      <div className="overflow-hidden rounded-md border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">S.no</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Address</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Contact</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>

                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-[#f1f1f0] ">
                            {(partyBranch || []).map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-3 py-1.5 text-xs text-gray-600">{index + 1}</td>

                                <td className="px-3 py-1.5">
                                  <input
                                    type="text"
                                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                    value={item?.branchName || ""}
                                    disabled={true}
                                  // onChange={(e) => handleInputAddress(e.target.value, index, "aliasName")}
                                  />
                                </td>
                                <td className="px-3 py-1.5">
                                  <input
                                    type="text"
                                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                    value={item?.branchAddress || ""}
                                    disabled={true}
                                  // onChange={(e) => handleInputAddress(e.target.value, index, "address")}
                                  />
                                </td>
                                <td className="px-3 py-1.5">
                                  <input
                                    type="text"
                                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                    value={item?.branchContact || ""}
                                    disabled={true}
                                  // onChange={(e) => handleInputAddress(e.target.value, index, "aliasName")}
                                  />
                                </td>
                                <td className="px-3 py-1.5">
                                  <input
                                    type="text"
                                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                    value={item?.branchEmail || ""}
                                    disabled={true}
                                  // onChange={(e) => handleInputAddress(e.target.value, index, "aliasName")}
                                  />
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-right">
                                  <button
                                    onClick={() => deleteAddress(item?.id)}
                                    disabled={readOnly}
                                    className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {(!partyBranch || partyBranch.length === 0) && (
                              <tr>
                                <td colSpan="3" className="px-3 py-3 text-center">
                                  <div className="flex flex-col items-center justify-center space-y-1 text-gray-400">

                                    <p className="text-xs">No addresses found</p>

                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>


                  </>
                )}

              </div>
            </div>
          </MastersForm>
        </Modal>
      </>

    );
  }
  else {

    return (
      <div onKeyDown={handleKeyDown} >
        <>

          <div className="w-full flex justify-between mb-2 items-center px-0.5 p-2">
            <h1 className="text-2xl font-bold text-gray-800"> Party Master</h1>
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

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <CommonTable
              columns={columns}
              data={allData?.data || []}
              onView={onDataClick}
              onEdit={handleEdit}
              onDelete={deleteData}
              itemsPerPage={10}
            />
          </div>


        </>

        {form === true &&
          (
            <Modal
              isOpen={form}
              form={form}
              widthClass={`${"w-[75%] "} ${isAddressExpanded ? "h-[95%]" : "h-[65%]"}`}
              onClose={() => {
                setForm(false);
                onCloseForm();
                setErrors({});
                setStep(1);
                if (openPartyModal === true) {
                  dispatch(push({ name: lastTapName }));
                }
                dispatch(setOpenPartyModal(false));

              }}
            >

              <Modal
                isOpen={branchModelOpen}
                form={form}
                widthClass={`${"w-[55%] h-[50%]"}`}
                setBranchModelOpen={setBranchModelOpen}
                onClose={() => {
                  setBranchModelOpen(false)
                }}
              >



                <AddBranch partyData={allData} partyId={id} branchEmail={branchEmail} setBranchEmail={setBranchEmail} setBranchAddress={setBranchAddress}
                  branchName={branchName} setBranchName={setBranchName} branchCode={branchCode} setBranchCode={setBranchCode}
                  branchAddress={branchAddress} branchContact={branchContact} setBranchContact={setBranchContact} onNew={onNew}
                  setId={setId} childRecord={childRecord} saveData={saveData} saveExitData={saveExitData} setReadOnly={setReadOnly}
                  deleteData={deleteData} readOnly={readOnly} onCloseForm={onCloseForm}
                  handleChange={handleChange} contactDetails={contactDetails} setContactDetails={setContactDetails}
                  shippingAddress={shippingAddress} setForm={setForm} addNewAddress={addNewAddress}
                  handleInputAddress={handleInputAddress} deleteAddress={deleteAddress} removeItem={removeItem}
                  partyBranch={partyBranch} setPartyBranch={setPartyBranch} setBranchModelOpen={setBranchModelOpen}
                />



              </Modal>

              <MastersForm

                masterClass={"pb-2"}
                onNew={onNew}
                onClose={() => {
                  setForm(false);
                  setSearchValue("");
                  setId(false);
                  onCloseForm();
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
                <div className="space-y-4 bg-[#f1f1f0] p-2">
                  {/* {step === 1 && ( */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">

                    <div className="space-y-2 bg-[#f1f1f0]">

                      <div className="rounded-xl border border-gray-100 bg-[#f1f1f0]  shadow-xs">
                        <h3 className="mb-1 text-sm font-semibold text-gray-900">
                          Party Type
                        </h3>
                        <div className={`space-y-2 ${readOnly ? "opacity-80" : ""}`}>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-6">


                            <div className="grid grid-cols-2 ml-2  items-center gap-1">

                              <input
                                type="radio"
                                name="type"
                                checked={isSupplier}
                                onChange={() => handleChange('supplier')}
                              />

                              <label className="text-xs">Supplier</label>
                            </div>
                            <div className="grid grid-cols-2 ml-2  items-center gap-1">
                              <input
                                type="radio"
                                name="type"
                                checked={isClient}
                                onChange={() => handleChange('client')}
                              />

                              <label className="text-xs">Client</label>
                            </div>

                            {/* <CheckBox
                              name="Is Supplier"
                              value={isSupplier}
                              setValue={setSupplier}
                              readOnly={readOnly}
                              className="hover:bg-gray-50 p-3 rounded-lg transition-colors"
                            />
                            <CheckBox
                              name="Is Client"
                              value={isClient}
                              setValue={setClient}
                              readOnly={readOnly}
                              className="hover:bg-gray-50 p-3 rounded-lg transition-colors"
                            /> */}



                            {isSupplier && (
                              <>
                                <CheckBox
                                  name="Grey Yarn"
                                  value={isGy}
                                  setValue={setIsGy}
                                  readOnly={readOnly}
                                  className="hover:bg-gray-100 p-3 rounded-lg"
                                />
                                <CheckBox
                                  name="Dyed Yarn"
                                  value={isDy}
                                  setValue={setIsDy}
                                  readOnly={readOnly}
                                  className="hover:bg-gray-100 p-3 rounded-lg"
                                />
                                <CheckBox
                                  name="Accessories"
                                  value={isAcc}
                                  setValue={setIsAcc}
                                  readOnly={readOnly}
                                  className="hover:bg-gray-100 p-3 rounded-lg"
                                />
                              </>
                            )}

                            <div className="flex items-center gap-x-2">

                              <ToggleButton
                                name="Status"
                                options={statusDropdown}
                                value={active}
                                setActive={setActive}
                                required={true}
                                readOnly={readOnly}
                                className="bg-gray-100 p-1 rounded-lg"
                                activeClass="bg-[#f1f1f0]  shadow-sm text-blue-600 "
                                inactiveClass="text-gray-500"
                              />
                            </div>


                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="rounded-xl border border-gray-100 bg-[#f1f1f0]  p-1 shadow-xs ">
                          <div className="grid grid-cols-1 gap-x-2  md:grid-cols-2 lg:grid-cols-5 ">
                            <TextInput
                              name={isSupplier ? "Supplier Name" : "Customer Name"}
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
                              name="CST No"
                              type="text"
                              value={cstNo}
                              setValue={setCstNo}
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

                            <div className="col-span-2">

                              <TextArea name="Address" inputClass="h-8" value={address} setValue={setAddress} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                            </div>

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
                              name="Pincode"
                              type="number"
                              value={pincode}
                              setValue={setPincode}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100"
                            />


                            <DropdownInput
                              name="PayTerm Days"
                              options={dropDownListObject(
                                id
                                  ? payTermList?.data
                                  : payTermList?.data?.filter((item) => item.active),
                                "aliasName",
                                "id"
                              )}
                              value={payTermDay}
                              setValue={setPayTermDay}
                              required={true}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100"
                            />



                            <button
                              onClick={() => setBranchModelOpen(true)}
                              disabled={readOnly}
                              className="mt-4 flex items-center pl-3 h-9 w-24 rounded-md bg-blue-600  text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              Add Branch
                            </button>

                            {/* <TextInput
                              name="PayTerm Days"
                              type="name"
                              value={payTermDay}
                              setValue={setPayTermDay}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100"
                            /> */}

                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                  <div className="">
                    <div
                      className="flex justify-between items-center mb-3 cursor-pointer"
                      onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                    >
                      <h3 className="text-sm font-semibold text-slate-700 flex items-center">
                        <FaChevronRight
                          className={`mr-2 text-xs transition-transform ${isAddressExpanded ? 'rotate-90' : ''}`}
                        />
                        Other Details
                      </h3>
                    </div>

                    {isAddressExpanded && (
                      <>
                        <div className="space-y-2">


                          {/* <div className="mb-1 flex items-center justify-between">
                            <h3 className=" text-sm font-semibold text-gray-900">
                              Shipping Addresses
                            </h3>
                            <button
                              onClick={addNewAddress}
                              disabled={readOnly}
                              className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              Add Address
                            </button>
                          </div> */}

                          {/* <div className="overflow-hidden rounded-md border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">S.no</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Address</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">AliasName</th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-[#f1f1f0] ">
                                {(shippingAddress || []).map((item, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-3 py-1.5 text-xs text-gray-600">{index + 1}</td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.address || ""}
                                        disabled={readOnly}
                                        onChange={(e) => handleInputAddress(e.target.value, index, "address")}
                                      />
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.aliasName || ""}
                                        disabled={readOnly}
                                        onChange={(e) => handleInputAddress(e.target.value, index, "aliasName")}
                                      />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-right">
                                      <button
                                        onClick={() => deleteAddress(index)}
                                        disabled={readOnly}
                                        className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400"
                                      >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {(!shippingAddress || shippingAddress.length === 0) && (
                                  <tr>
                                    <td colSpan="3" className="px-3 py-3 text-center">
                                      <div className="flex flex-col items-center justify-center space-y-1 text-gray-400">

                                        <p className="text-xs">No addresses found</p>

                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div> */}






                          <div className="mb-4 flex items-center justify-between">
                            <h3 className=" text-sm font-semibold text-gray-900">Contact Details</h3>
                            <button
                              onClick={() => setContactDetails([...contactDetails, {}])}
                              disabled={readOnly || childRecord.current > 0}
                              className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                              </svg>
                              Add Contact
                            </button>
                          </div>

                          <div className="overflow-hidden rounded-md border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">S.no</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Mobile</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-[#f1f1f0] ">
                                {(contactDetails || []).map((item, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-600">{index + 1}</td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item.contactPersonName || ""}
                                        onChange={(e) => {
                                          const updated = [...contactDetails];
                                          updated[index].contactPersonName = e.target.value;
                                          setContactDetails(updated);
                                        }}
                                        disabled={readOnly || childRecord.current > 0}
                                      />
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item.mobileNo || ""}
                                        onChange={(e) => {
                                          const updated = [...contactDetails];
                                          updated[index].mobileNo = e.target.value;
                                          setContactDetails(updated);
                                        }}
                                        disabled={readOnly || childRecord.current > 0}
                                      />
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="email"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item.email || ""}
                                        onChange={(e) => {
                                          const updated = [...contactDetails];
                                          updated[index].email = e.target.value;
                                          setContactDetails(updated);
                                        }}
                                        disabled={readOnly}
                                      />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-1.5 text-right">
                                      <button
                                        onClick={() => removeItem(index)}
                                        disabled={readOnly || childRecord.current > 0}
                                        className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400"
                                      >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {(!contactDetails || contactDetails.length === 0) && (
                                  <tr>
                                    <td colSpan="5" className="px-3 py-3 text-center">
                                      <div className="flex flex-col items-center justify-center space-y-1 text-gray-400">

                                        <p className="text-xs">No contacts found</p>

                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>










                          <div className="mb-1 flex items-center justify-between">
                            <h3 className=" text-sm font-semibold text-gray-900">
                              Branch Addresses
                            </h3>

                          </div>

                          <div className="overflow-hidden rounded-md border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">S.no</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Address</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Contact</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>

                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-[#f1f1f0] ">
                                {(partyBranch || []).map((item, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-3 py-1.5 text-xs text-gray-600">{index + 1}</td>

                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.branchName || ""}
                                        disabled={true}
                                      // onChange={(e) => handleInputAddress(e.target.value, index, "aliasName")}
                                      />
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.branchAddress || ""}
                                        disabled={true}
                                      // onChange={(e) => handleInputAddress(e.target.value, index, "address")}
                                      />
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.branchContact || ""}
                                        disabled={true}
                                      // onChange={(e) => handleInputAddress(e.target.value, index, "aliasName")}
                                      />
                                    </td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.branchEmail || ""}
                                        disabled={true}
                                      // onChange={(e) => handleInputAddress(e.target.value, index, "aliasName")}
                                      />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-right">
                                      <button
                                        onClick={() => deleteAddress(item?.id)}
                                        disabled={readOnly}
                                        className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400"
                                      >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {(!partyBranch || partyBranch.length === 0) && (
                                  <tr>
                                    <td colSpan="3" className="px-3 py-3 text-center">
                                      <div className="flex flex-col items-center justify-center space-y-1 text-gray-400">

                                        <p className="text-xs">No addresses found</p>

                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>


                      </>
                    )}

                  </div>
                </div>
              </MastersForm>
            </Modal>
          )}
      </div>
    );
  }

}