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
  ReusableTable,
  DropdownWithSearch,
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
import RawMaterial from "./AddRawMaterial";
import { Check, Plus } from "lucide-react";
import Mastertable from "../MasterTable/Mastertable";
import { useGetbranchTypeQuery } from "../../../redux/uniformService/BranchTypeMaster";
import { useGetCountriesQuery, useGetCountryByIdQuery } from "../../../redux/services/CountryMasterService";

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
  const [isSupplier, setSupplier] = useState(false);
  const [isClient, setClient] = useState();
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
  const [rawMaterial,setRawMaterial]  = useState(false)
  const [material,setMaterial] =  useState("")
  const [materialActive,setMaterialActive]  = useState(true);
  const [materialId,setMaterialId] = useState("")
  const [branchType,setBranchType]  =  useState("");
  const [branchInfo,setBranchInfo]  = useState([]);
  const [selected, setSelected] = useState([]);
  const [materialForm,setMaterialForm] = useState(false)
  const childRecord = useRef(0);
  const dispatch = useDispatch();
  const [country,setCountry]  = useState("")

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
  const { data: countrytList } = useGetCountriesQuery({ params });

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

          const { data: branchTypeData } = useGetbranchTypeQuery({ });

  useEffect(() => {
    if (openPartyModal) {
      setId("");
      setForm(true);
    }
  }, [openPartyModal]);

        console.log( useSelector((state) => state),"conditipon")


  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPartyByIdQuery(id, { skip: !id });

  const [addData] = useAddPartyMutation();
  const [updateData] = useUpdatePartyMutation();
  const [removeData] = useDeletePartyMutation();
  const [removeBranchData] = useDeletePartyBranchMutation();


  console.log(id || partyId, "condition")

  const syncFormWithDb = useCallback(
    (data) => {
      // if (id || partyId) {
      //   if (openModelForAddress || partyId) {
      //     setReadOnly(  );
      //   }
      //   else {
      //     setReadOnly(true);
      //   }
      // } else {
      //   setReadOnly(false);
      // }]
      if(materialId){
        setMaterial()
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
      setBranchInfo(data?.partyBranch ? data?.partyBranch : [])
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
    branchInfo : branchInfo?.filter(item  => item.branchName !== "") , mail,
    isGy,
    isDy,
    partyBranch,
    rawMaterial,
    material,
    materialActive,
    isForPartyBranch: true
  };

  const [sendKycEmail, { isLoadingMail }] = useSendKycEmailMutation();
  const {
    data: processList,
    isLoading: isProcessLoading,
    isFetching: isProcessFetching,
  } = useGetProcessMasterQuery({ params });

  const   validateData = (data) => {
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
        // setForm(false);
      }
      if (exit) {
        if (openPartyModal === true && lastTapName) {
          dispatch(push({ name: lastTapName }));
        }

        dispatch(setOpenPartyModal(false));
      }
          //  setForm(false);
          //  setRawMaterial(false)

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

  console.log(id,"id")
const SaveBranch  = (   )  => {
 if (id) {
      handleSubmitCustom(updateData, data, "Updated");
      setRawMaterial(false)
    } else {
      handleSubmitCustom(addData, data, "Added");
            setRawMaterial(false)

    }
}

  const saveData = (   ) => {

       if(isSupplier){
        console.log(selected.length  <= 0 ,"condiion")
        if(selected.length   <= 0  ){
          toast.info("Choose One Raw Material")
          return false
        }
    }
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
      console.log(!window.confirm("Are you sure to delete...?"),"window")
    // if (window.confirm("Are you sure to delete...?")) {
    //       try {
    //       let deldata = await removeBranchData(partyBranchId).unwrap();
    //       if (deldata?.statusCode == 1) {
    //         toast.error(deldata?.message);
    //         return;
    //       }
    //       toast.success("Deleted Successfully");
    //     } catch (error) {
    //       toast.error("something went wrong");
    //     }
    // }
        
 


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
  function handleInputbranch(value, index, field) {
    console.log(value,"value")
    const newBlend = structuredClone(branchInfo);
    if(field === "branchType"){
      let condition =   branchInfo?.map(item  =>  item.branchType  !== "1")   
      console.log(condition,"condition",branchInfo)
      if(condition){
        newBlend[index][field] = value    

      } 

    } 
    else{

      newBlend[index][field] = value;
    }
    setBranchInfo(newBlend);
  }

  // function deleteBranch(id) {
    // setBranchInfo((prev) => prev?.filter((v, i) => parseInt(v?.id) !== parseInt(id)));
    // // deletePartyBranchData(id)
  // }

      function deleteBranch(index , id) {
        if (readOnly) return toast.info("Turn on Edit Mode...!!!")
        if(id) {
              setBranchInfo((prev) => prev?.filter((v, i) => parseInt(v?.id) !== parseInt(id)));
               deletePartyBranchData(id)
        }
        else{

          setBranchInfo(prev => prev.filter((_, i) => i !== index))
        }
      }
  


  function addNewBranch() {
    setPartyBranch((prev) => [...prev, { branchName: "", branchCode: "", branchEmail: "", branchContact: "", branchAddress: "" }]);
  }

  function removeItem(index) {
    setContactDetails((contactDetails) => {
      return contactDetails.filter((_, i) => parseInt(i) !== parseInt(index));
    });
  }




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





       const handleView = (id) => {
   
           setId(id)
           setForm(true)
           setReadOnly(true);
       };
   
       const handleEdit = (orderId) => {
           setId(orderId)
           setForm(true)
           setReadOnly(false);
       };
   
       const handleDelete = async (orderId) => {
           if (orderId) {
               if (!window.confirm("Are you sure to delete...?")) {
                   return;
               }
               try {
                   // await removeData(orderId)
                   setId("");
                   onNew();
                   toast.success("Deleted Successfully");
               } catch (error) {
                   toast.error("something went wrong");
               }
           }
   
       };


  const columns = [
  {
            header: 'S.No',
            accessor: (item, index) => index + 1,
            className: 'font-medium text-gray-900 w-12  text-center'
        },
        
    {
      header: 'Name',
      accessor: (item) => item.name,
      cellClass: () => 'font-medium text-gray-900',
      className:  'text-gray-800 uppercase w-72'

    },
    {
      header: 'Alias Name',
      accessor: (item) => item.aliasName    ,
        cellClass: () => 'font-medium text-gray-900',
      className:  'text-gray-800 uppercase w-72'

    },
      

  ];

  const handleChange = (type) => {
    console.log(type,"type");
    
    setSupplier(type == 'supplier');
    setClient(type == 'client');

    
    
  };
  console.log(country,"country")
    const options = allData?.materialData

    const handleCheckboxChange = (value) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };


  if (partyId) {
    return (
      <>
         <Modal
          isOpen={form}
          form={form}
           widthClass={`${"w-[75%] "} ${isAddressExpanded ? "h-[95%]" : "h-[60%]"}`}
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
                widthClass={`${"w-[95%] h-[70%]"}`}
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
                  shippingAddress={shippingAddress} setForm={setForm} 
                   removeItem={removeItem} setBranchInfo={setBranchInfo} branchInfo={branchInfo}  id={id}
                  partyBranch={partyBranch} setPartyBranch={setPartyBranch} setBranchModelOpen={setBranchModelOpen} name={name}
                  branchType={branchType} setBranchType ={setBranchType} handleInputbranch={handleInputbranch} deleteBranch={deleteBranch}
                />



              </Modal>
    
              <Modal
                    isOpen={rawMaterial}
                    widthClass={`${"w-[50%] h-[70%]"}`}
                    setRawmeterial={setRawMaterial}
                    onClose={() => {
                      setRawMaterial(false)
                      setMaterialForm(false)
                      }}
                      allData ={allData}
             
              >
                  <RawMaterial    
                      SaveBranch={SaveBranch}
                      material={material}
                      setMaterial={setMaterial}
                      setMaterialActive={setMaterialActive}
                      materialActive = {materialActive}  
                      allData={allData}
                      setMaterialForm={setMaterialForm}
                      materialForm={materialForm}
                      setMaterialId={setMaterialId}
                      materialId={materialId}

                  />
              </Modal>
          <div className="h-full flex flex-col bg-[f1f1f0]">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  {id ? (!readOnly ? "Edit Party Master" : "Party Master") : "Add New Party"}
                </h2>
              
              </div>
              <div className="flex gap-2">
                <div>
                  {readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(false);
                        setSearchValue("");
                        setId(false);
                      }}
                      className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                      
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={saveData}
                      className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"
                    >
                      <Check size={14} />
                      {id ? "Update" : "Save"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3 bg-[#f1f1f0] h-full">
              <div className="grid grid-cols-1  gap-3  h-full">
                <div className="lg:col-span- space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                   

                   <div className="space-y-2 h-full bg-[#f1f1f0] p-2">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">

                    <div className="space-y-2 h-full bg-[#f1f1f0]">

                      <div className="rounded-xl border border-gray-100 bg-[#f1f1f0]  shadow-xs">
                        <h3 className="mb-1 text-sm font-semibold text-gray-900">
                          Party Type
                        </h3>
                        <div className={`space-y-2 ${readOnly ? "opacity-80" : ""}`}>
                         <div className="grid grid-cols-1 gap-2 sm:grid-cols-6">
                        <div className="col-span-1 flex items-center gap-4 ml-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="radio"
                              name="type"
                              checked={isSupplier}
                              onChange={() => handleChange('supplier')}
                            />
                            <label className="text-xs">Supplier</label>
                          </div>
                            </div>
                          <div className="col-span-1 flex items-center gap-4 ml-2">

                          <div className="flex items-center gap-1">
                            <input
                              type="radio"
                              name="type"
                              checked={isClient}
                              onChange={() => handleChange('client')}
                            />
                            <label className="text-xs">Client</label>
                          </div>
                        </div>
                     {isSupplier && (
                        <div className="col-span-1">
                      <button  className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                  border border-blue-600 flex items-center gap-1 text-xs" onClick={() => setRawMaterial(true)}>
                                    Add Material
                                  </button>
                        </div>
                         )}  

                      <div className="col-span-2 flex items-center">
                        <ToggleButton
                          name="Status"
                          options={statusDropdown}
                          value={active}
                          setActive={setActive}
                          required={true}
                          readOnly={readOnly}
                          className="bg-gray-100 p-1 rounded-lg"
                          activeClass="bg-[#f1f1f0] shadow-sm text-blue-600"
                          inactiveClass="text-gray-500"
                        />
                      </div>

  {/* Checkboxes: Only shown if Supplier is selected */}
  {isSupplier && (
    <div className="col-span-6 grid grid-cols-1 sm:grid-cols-6 gap-2 mt-2">
      {options?.map((item, index) => (
        <label key={index} className="flex items-center gap-2 py-1 text-sm">
          <input
            type="checkbox"
            checked={selected.includes(item)}
            onChange={() => handleCheckboxChange(item)}
          />
          <span>{item.name}</span>
        </label>
      ))}
    </div>
  )}
</div>

                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="rounded-xl border border-gray-100 bg-[#f1f1f0]  p-1 shadow-xs ">
                          <div className="grid grid-cols-1 gap-x-2  md:grid-cols-2 lg:grid-cols-5 ">
                            <div className="col-span-2">

                            <TextArea
                              name={isSupplier ? "Supplier Name" : "Customer Name"}
                              type="text"
                              value={name}
                              inputClass="h-8" 
  
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
                            </div>
       
                  <div className="col-span-2">
                            <TextArea
                              name="Alias Name"
                              type="text"
                              inputClass="h-8" 
                              value={aliasName}
                              setValue={setAliasName}
                              required={true}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100"
                            />
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
                      


                  <div className="col-span-2 flex flex-row gap-2">
                        <div className="w-28">
                              <TextInput
                                      name="Pan No"
                                      type="pan_no"
                                      value={panNo}
                                      setValue={setPanNo}
                                      readOnly={readOnly}
                                      disabled={childRecord.current > 0}
                                      className="focus:ring-2 focus:ring-blue-100"
                                    />                           
                        </div>

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
                     
                   </div>
                         




  <div className="flex flxe-row gap-2 col-span-3">
            <div className="w-20">
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
              </div>
                    

                <div className="w-20">

                      <DropdownInput
                        name="PayTerm"
                        options={dropDownListObject(
                          id
                            ? payTermList?.data
                            : payTermList?.data?.filter((item) => item.active),
                          "aliasName",
                          "id"
                        )}
                        value={payTermDay}
                        setValue={setPayTermDay}
                        // required={true}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                <div className="w-20">
                  
                      <TextInput
                        name="Pincode"
                        type="number"
                        value={pincode}
                         required={true}

                        setValue={setPincode}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                </div>
                     <div className="w-96">

                                 <TextArea name="Address"
                                  inputClass="h-10" value={address} 
                                  setValue={setAddress} required={true}
                                   readOnly={readOnly} d
                                   isabled={(childRecord.current > 0)} />
                            </div>   
                  
                         
  </div>
                                  



                            <button
                              onClick={() => {  
                                setBranchModelOpen(true)
                                // if(id){
                                //   setId("")
                                // }
                                } }
                              readOnly={readOnly}
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
     
                </div>
                  </div>

                
                </div>


                      


                     

                     


              </div>
            </div>


          </div>

      
       
        </Modal>
      </>

    );
  }
  else {


    return (
      <div onKeyDown={handleKeyDown}>
        

          <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                <h5 className='my-1'>Party Master</h5>
               <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setForm(true);
                              onNew();
                            }}
                            className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                          >
                            <Plus size={16} />
                            Add New Master
                          </button>
                  
                        </div>
            </div>
                {/* <Mastertable
                    // header={'Party list'}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    tableHeaders={tableHeaders}
                    tableDataNames={tableDataNames}
                    data={allData?.data}
                    loading={
                        isLoading || isFetching
                    }
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                /> */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <ReusableTable
                            columns={columns}
                            data={allData?.data || []}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            itemsPerPage={10}
                        />
                    </div>

   

     
        
 
    
            
        
    {form  === true  &&  (

    
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[70%] max-w-6xl h-[68%]"}
          onClose={() => {
            setForm(false);
            setErrors({});
          }}
        >
              <Modal
                isOpen={branchModelOpen}
                form={form}
                widthClass={`${"w-[95%] h-[80%]"}`}
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
                  shippingAddress={shippingAddress} setForm={setForm} 
                   removeItem={removeItem} setBranchInfo={setBranchInfo} branchInfo={branchInfo}  id={id}
                  partyBranch={partyBranch} setPartyBranch={setPartyBranch} setBranchModelOpen={setBranchModelOpen} name={name}
                  branchType={branchType} setBranchType ={setBranchType} handleInputbranch={handleInputbranch} deleteBranch={deleteBranch}
                  branchTypeData = {branchTypeData}
                />



              </Modal>
    
              <Modal
                    isOpen={rawMaterial}
                    widthClass={`${"w-[50%] h-[70%]"}`}
                    setRawmeterial={setRawMaterial}
                    onClose={() => {
                      setRawMaterial(false)
                      setMaterialForm(false)
                      }}
                      allData ={allData}
             
              >
                  <RawMaterial    
                      SaveBranch={SaveBranch}
                      material={material}
                      setMaterial={setMaterial}
                      setMaterialActive={setMaterialActive}
                      materialActive = {materialActive}  
                      allData={allData}
                      setMaterialForm={setMaterialForm}
                      materialForm={materialForm}
                      setMaterialId={setMaterialId}
                      materialId={materialId}

                  />
              </Modal>
          <div className="h-full flex flex-col bg-[f1f1f0]">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  {id ? (!readOnly ? "Edit Party Master" : "Party Master") : "Add New Party"}
                </h2>
              
              </div>
              <div className="flex gap-2">
                <div>
                  {readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(false);
                        setSearchValue("");
                        setId(false);
                      }}
                      className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                      
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={saveData}
                      className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"
                    >
                      <Check size={14} />
                      {id ? "Update" : "Save"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3 bg-[#f1f1f0] h-full">
              <div className="grid grid-cols-1  gap-3  h-full">
                <div className="lg:col-span- space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                   

                   <div className="space-y-2 h-full bg-[#f1f1f0] p-2">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">

                    <div className="space-y-2 h-full bg-[#f1f1f0]">

                      <div className="rounded-xl border border-gray-100 bg-[#f1f1f0]  shadow-xs">
                        {/* <h3 className="mb-1 text-sm font-semibold text-gray-900">
                          Party Type
                        </h3> */}
                        <div className={`space-y-2 ${readOnly ? "opacity-80" : ""}`}>
                         <div className="grid grid-cols-1 gap-2 sm:grid-cols-6">
                        <div className="col-span-1 flex items-center gap-4 ml-2">
                          <div className="col-span-1 flex items-center gap-4 ml-2">

                              <div className="flex items-center gap-2 mt-2">
                                <input
                                  type="radio"
                                  name="type"
                                  checked={isClient}
                                  onChange={() => handleChange('client')}
                                />
                                <label className="block text-xs font-bold text-gray-600 mt-1">Client</label>
                              </div>
                            <div className="flex items-center gap-2 mt-2">
                            <input
                              type="radio"
                              name="type"
                              checked={isSupplier}
                              onChange={() => handleChange('supplier')}
                            />
                            <label className="block text-xs font-bold text-gray-600 mt-1">Supplier</label>
                          </div>
                         </div>
                  
                            </div>
                     
                        <div className="col-span-4 flex flex-row">
                         
                        {isSupplier && (
                            <div className="w-80">

                                  <MultiSelectDropdown 
                                    options={multiSelectOption(allData ? allData?.materialData : [], "name", "id")}
                                    labelName="name"
                                    setSelected={setSelected}
                                    selected={selected}
                                    />
                            </div>
                                                  )}
                                
                     {isSupplier && (
                        <div className="mt-3 px-3">
                      <button  className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                  border border-blue-600 flex items-center gap-1 text-xs" onClick={() => setRawMaterial(true)}>
                                    Add Material
                                  </button>
                        </div>
                         )} 

                        </div>     
                         <div>
                          
                      <div className="col-span-1 flex items-center mt-2 justify-end" >
                        <ToggleButton
                          name="Status"
                          options={statusDropdown}
                          value={active}
                          setActive={setActive}
                          required={true}
                          readOnly={readOnly}
                          className="bg-gray-100 p-1 rounded-lg"
                          activeClass="bg-[#f1f1f0] shadow-sm text-blue-600"
                          inactiveClass="text-gray-500"
                        />
                      </div>
                         </div>


</div>

                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="rounded-xl border border-gray-100 bg-[#f1f1f0]  p-1 shadow-xs ">
                          <div className="grid grid-cols-1 gap-x-2  md:grid-cols-2 lg:grid-cols-5 ">
                            <div className="col-span-2">

                            <TextArea
                              name={isSupplier ? "Supplier Name" : "Customer Name"}
                              type="text"
                              value={name}
                              inputClass="h-8" 
  
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
                            </div>
       
                  <div className="col-span-2">
                            <TextArea
                              name="Alias Name"
                              type="text"
                              inputClass="h-8" 
                              value={aliasName}
                              setValue={setAliasName}
                              required={true}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100"
                            />
                  </div>
                   <div className="">
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
              </div>
                    
                  <div className="col-span-3 flex flex-row gap-2">

                <div className="w-36">

                      <DropdownInput
                        name="PayTerm"
                        options={dropDownListObject(
                          id
                            ? payTermList?.data
                            : payTermList?.data?.filter((item) => item.active),
                          "aliasName",
                          "id"
                        )}
                        value={payTermDay}
                        setValue={setPayTermDay}
                        // required={true}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                          


                        <div className="w-28">
                              <TextInput
                                      name="Pan No"
                                      type="pan_no"
                                      value={panNo}
                                      setValue={setPanNo}
                                      readOnly={readOnly}
                                      disabled={childRecord.current > 0}
                                      className="focus:ring-2 focus:ring-blue-100"
                                    />                           
                        </div>

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
                     
                   </div>
                         


  <div className="flex flxe-row gap-2 col-span-2">
    {/* <div>
                      <DropdownInput name="Country"
                            options={
                                Array.isArray(countrytList?.data)
                                    ? dropDownListObject(
                                        id ? countrytList?.data : countrytList?.data?.filter(item => item?.active),
                                        "name",
                                        "id"
                                    )
                                    : []
                            }
                      value={country} setValue={setCountry} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

    </div> */}
                  <DropdownInput
                              name="City/State Name"
                              options={dropDownListMergedObject(
                                id
                                  ? cityList?.data
                                  : cityList?.data?.filter((item) => item.active),
                                "name",
                                "id"
                              )}
                              country={country}
                              masterName="CITY MASTER"
                              lastTab={activeTab}
                              value={city}
                              setValue={setCity}
                              required={true}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100"
                            />
                {/* <div className="w-20">
                  
                      <TextInput
                        name="Pincode"
                        type="number"
                        value={pincode}
                         required={true}

                        setValue={setPincode}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                </div> */}
                       
  </div>


             
                  <div className="flex flxe-row gap-2 col-span-2">
  
                                 <div className="w-96">

                                 <TextArea name="Address"
                                  inputClass="h-10" value={address} 
                                  setValue={setAddress} required={true}
                                   readOnly={readOnly} d
                                   isabled={(childRecord.current > 0)} />
                            </div>   
                       </div>
                                  
  <div className="flex flxe-row gap-2 col-span-2">

                <div className="w-20">
                  
                      <TextInput
                        name="Pincode"
                        type="number"
                        value={pincode}
                         required={true}

                        setValue={setPincode}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                </div>
                       
  </div>

                          <div className="mt-2">
                            <button
                              onClick={() => {  
                                setBranchModelOpen(true)
                                // if(id){
                                //   setId("")
                                // }
                                } }
                              readOnly={readOnly}
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
                            </div>      

                       

                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
     
                </div>
                  </div>

                
                </div>


                      


                     

                     


              </div>
            </div>


          </div>

      
       
        </Modal>
        )}   
        </div>
    );
  }

}


