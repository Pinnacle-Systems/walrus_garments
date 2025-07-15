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
import { BracesIcon, Check, LayoutGrid, Plus, Table } from "lucide-react";
import Mastertable from "../MasterTable/Mastertable";
import { useGetbranchTypeQuery } from "../../../redux/uniformService/BranchTypeMaster";
import { useGetCountriesQuery, useGetCountryByIdQuery } from "../../../redux/services/CountryMasterService";
import Swal from "sweetalert2";
import Loader from "../Loader";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { FaInfoCircle, FaPlus } from "react-icons/fa";
import AddContactPersonDetails from "./ContactPersonDetails";
import ContactPersonDetails from "./ContactPersonDetails";

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
  const [igst, setIgst] = useState(false);
  const [gstNo, setGstNo] = useState("");
  const [costCode, setCostCode] = useState("");
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
      const [contactNumber, setContactNumber] = useState("")
  const [contactPersonName, setContactPersonName] = useState("")


  const [certificate, setCertificate] = useState([])
  const [searchValue, setSearchValue] = useState("");
  const [email, setEmail] = useState("")
  const [addressOnlyRead, setAddressOnlyRead] = useState(true)
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState({});
  const [partyCode,setPartyCode] = useState("");
    const [landMark,setlandMark] = useState("");
    const [contactPerson,setContactPerson] = useState("");
    const [contact,setContact] = useState("");
    const [bankname,setBankName] = useState("");
    const [bankBranchName,setBankBranchName] = useState("");
    const [ifscCode,setIfscCode] = useState("");

  const [branchModelOpen, setBranchModelOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchContact, setBranchContact] = useState("");
    const [branchContactPerson, setBranchcontactPerson] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  const [openingHours,setopeningHours]  =  useState("")
  const [branchWebsite,setBranchWebsite]  = useState("")
  const [ branchForm,setBranchForm ]  =  useState(true)
  const [partyBranch, setPartyBranch] = useState([])
  const [rawMaterial,setRawMaterial]  = useState(false)
  const [material,setMaterial] =  useState("")
  const [materialActive,setMaterialActive]  = useState(true);
  const [materialId,setMaterialId] = useState("")
  const [branchType,setBranchType]  =  useState("");
  const [branchInfo,setBranchInfo]  = useState([]);
  const [selected, setSelected] = useState([]);
  const [materialForm,setMaterialForm] = useState(false)
  const [view, setView] = useState("Customer");
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isContactPerson,setIsContactPerson]  = useState(false)
  const [designation,setDesignation]  = useState("")
   const [department,SetDepartment ] = useState("")
  
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



  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPartyByIdQuery(id, { skip: !id });

  const [addData] = useAddPartyMutation();
  const [updateData] = useUpdatePartyMutation();
  const [removeData] = useDeletePartyMutation();
  const [removeBranchData] = useDeletePartyBranchMutation();


let filterParty ;
if(view == "Customer"){
  filterParty  =  allData?.data?.filter(item  => item.isClient)
}
if(view  ===  "Supplier"){
    filterParty  =  allData?.data?.filter(item  => item.isSupplier)
  }

  console.log(selected,"selected")

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
      setContactPersonName(data?.contactPersonName || "");
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
      // setContactPersonName
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
      // setSelected(data?.PartyMaterials ? data?.PartyMaterials  : []  )
setSelected(
  data?.PartyMaterials
    ? data.PartyMaterials.map((item) => ({
        label: item.name,
        value: item.value,
        id:item.id,
      }))
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
    igst,
    currencyId: currency,
    costCode,
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
    partyBranch,
    
    
    
    branchInfo : branchInfo?.filter(item  => item.branchName !== "") , mail,
    partyMaterials : selected,   material,  materialActive, rawMaterial,
     branchAddress,branchContact,branchContactPerson,branchEmail,branchName,branchType,branchWebsite,openingHours,
    contact,department,designation,
    contactPersonName,

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
          Swal.fire({
        icon: 'success',
        title: `${text || 'Saved'} Successfully`,
        showConfirmButton: false,
        timer: 2000
      });
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
            Swal.fire({
        icon: 'error',
        title: 'Submission error',
        text: error.data?.message || 'Something went wrong!',
      });
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

const SaveBranch  = (   )  => {
 if (id) {
      handleSubmitCustom(updateData, data, "Updated");
      // setRawMaterial(false)
    } else {
      handleSubmitCustom(addData, data, "Added");
            // setRawMaterial(false)

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
                   await removeData(orderId)
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
          {
      header: '',
      accessor: (item) => item.nonme    ,
        cellClass: () => 'font-medium text-gray-900',
      className:  'text-gray-800 uppercase w-[60%]'

    },

  ];

  const handleChange = (type) => {
    
    setSupplier(type == 'supplier');
    setClient(type == 'client');

    
    
  };
    const handleFun = () => {
           console.log("Hit")
        console.log(branchForm,"bg")

      setBranchForm(false)
    console.log(branchForm,"branch")
    
  };
    const options = allData?.materialData

    const handleCheckboxChange = (value) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

       if(isLoading  ||  isFetching ) return <Loader/>
console.log(singleData,"singleData")

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



                <AddBranch singleData={singleData} partyId={id} branchEmail={branchEmail} setBranchEmail={setBranchEmail} setBranchAddress={setBranchAddress}
                  branchName={branchName} setBranchName={setBranchName} branchCode={branchCode} setBranchCode={setBranchCode}
                  branchAddress={branchAddress} branchContact={branchContact} setBranchContact={setBranchContact} onNew={onNew}
                  setId={setId} childRecord={childRecord} saveData={saveData} saveExitData={saveExitData} setReadOnly={setReadOnly}
                  deleteData={deleteData} readOnly={readOnly} onCloseForm={onCloseForm}
                  handleChange={handleChange} contactDetails={contactDetails} setContactDetails={setContactDetails}
                  shippingAddress={shippingAddress} setForm={setForm} branchForm={branchForm}  setBranchForm={setBranchForm}
                   removeItem={removeItem} setBranchInfo={setBranchInfo} branchInfo={branchInfo}  id={id} handleFun={handleFun}
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
                
       <div className="h-full flex flex-col bg-[f1f1f0] ">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3 ">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {id ? (!readOnly ? "Edit Customer/supplier" : "Customer/supplier Master") : "Add New Customer/supplier Master"}
                </h2>
             
              </div>
              <div className="flex gap-2">
                <div>
                  {!readOnly && (
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

            <div className="flex-1 overflow-auto p-3">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              

               

                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Basic Details</h3>
                    {/* <div className="space-y-2"> */}
                          <div className="grid grid-cols-2">     
                      <div className="flex flex-row items-center gap-2 mt-2 mb-2">
                           <div className="flex items-center gap-2 ">
                                                   <input
                                                     type="radio"
                                                     name="type"
                                                     checked={isClient}
                                                     onChange={() => handleChange('client')}
                                                   />
                                                   <label className="block text-xs font-bold text-gray-600 mt-1">Client</label>
                                                 </div>
                                                         <div className="flex flex-row gap-2">

                                                    <input
                                                      type="radio"
                                                      name="type"
                                                      checked={isSupplier}
                                                      onChange={() => handleChange('supplier')}
                                                    />
                                                    <label className="block text-xs font-bold text-gray-600 mt-1">Supplier</label>
                                                      </div>
                      </div>
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
                       <div>
                          <TextInput
                                name="Party Code"
                                type="number"
                                // value={contact}
        
                                // setValue={setContact}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                                className="focus:ring-2 focus:ring-blue-100 w-10"
                              />
                      </div>
                      <div className="mt-5 ml-3">
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
                         
     <div className="mt-5 ml-3">
                       
                      </div>
                                              
                                                    
                                                       
                                                  </div>
                
                      <div className="grid grid-cols-2 gap-2">
                         

              
                      </div>
                    {/* </div> */}
                  </div>

        
                </div>
                   <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Contact  Details</h3>
                 <div className="space-y-2">
                 

                        <TextInput
                                  name="Party Email"
                                  type="number"
                                  value={email}
          
                                  setValue={setEmail}
                                  readOnly={readOnly}
                                  disabled={childRecord.current > 0}
                                  className="focus:ring-2 focus:ring-blue-100 w-10"
                                />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 flex flex-row gap-4 mt-2">
                           <div className="w-72">
                                                  
                              <TextInput
                                            name="Contact Person"
                                            type="text"
                                            // value={contact}
                    
                                            // setValue={setContact}
                                            readOnly={readOnly}
                                            disabled={childRecord.current > 0}
                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                          />
                                           </div>
                    <div className="relative inline-block">
                                <button
                                  className="w-9 h-9 border border-green-500 rounded-md mt-3
                                            hover:bg-green-500 text-green-600 hover:text-white
                                            transition-colors flex items-center justify-center"
                                  disabled={readOnly}
                                  onClick={() => {
                                    // openAddModal();
                                    // setIsDropdownOpen(false);
                                    // setEditingItem("new");
                                    // setOpenModel(true);
                                    setIsContactPerson(true)
                                  }}
                                  onMouseEnter={() => setTooltipVisible(true)}
                                  onMouseLeave={() => setTooltipVisible(false)}
                                  aria-label="Add supplier"
                                >
                                  <FaPlus className="text-sm" />
                                </button>

                                    {tooltipVisible && (
                                      <div className="absolute z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
                                        <div className="flex items-start">
                                          <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                                          <span>Click to add a new Contact Person</span>
                                        </div>
                                        <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
                                      </div>
                                    )}
                      </div>
                       
  </div> 
                                       <TextInput
                                              name="Designation"
                                              type="text"
                                              // value={contact}
                      
                                              // setValue={setContact}
                                              readOnly={readOnly}
                                              disabled={childRecord.current > 0}
                                              className="focus:ring-2 focus:ring-blue-100 w-10"
                                            />
                                             <TextInput
                                              name="Department"
                                              type="text"
                                              // value={contact}
                      
                                              // setValue={setContact}
                                              readOnly={readOnly}
                                              disabled={childRecord.current > 0}
                                              className="focus:ring-2 focus:ring-blue-100 w-10"
                                            />
                                                  <TextInput
                                                                    name="Contact Number"
                                                                    type="number"
                                                                    // value={contact}
                                            
                                                                    // setValue={setContact}
                                                                    readOnly={readOnly}
                                                                    disabled={childRecord.current > 0}
                                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                  />
                                                                              {/* <TextInput
                                                                    name="Fax"
                                                                    type="number"
                                                                    // value={contact}
                                            
                                                                    // setValue={setContact}
                                                                    readOnly={readOnly}
                                                                    disabled={childRecord.current > 0}
                                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                  />     */}
                                                                          <TextInput
                                                                    name="Website"
                                                                    type="number"
                                                                    // value={contact}
                                            
                                                                    // setValue={setContact}
                                                                    readOnly={readOnly}
                                                                    disabled={childRecord.current > 0}
                                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                  />
                                                                    
                                                                                    
                      </div>
                    </div> 
                  </div>

     
                </div>
                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Address  Details</h3>
                 <div className="space-y-2">
                 

                      <div className="grid grid-cols-2 gap-2">
                   
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
                                                               <TextInput
                                                            name="Land Mark"
                                                            type="number"
                                                            // value={pincode}
                                                            required={true}
                                    
                                                            // setValue={setPincode}
                                                            readOnly={readOnly}
                                                            disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                          /> 
                                                          <div className="col-span-2">

                                                          <TextArea name="Address"
                                                          inputClass="h-10" value={address} 
                                                          setValue={setAddress} required={true}
                                                            readOnly={readOnly} d
                                                            isabled={(childRecord.current > 0)} />
                                                          </div>

                                                     
                                                      <div className="mb-11">

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
                    </div> 
                  </div>


                </div>
              

                    <div className="lg:col-span-4 space-y-3">
                      <div className="bg-white p-3 rounded-md border border-gray-200">
                        <h3 className="font-medium text-gray-800 mb-2 text-sm">Business Details</h3>
                        <div className="space-y-2">

                          <div className="grid grid-cols-2 gap-2">
                              

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
                                                    name="CIN No"
                                                    type="text"
                                                    value={cstNo}
                                                    setValue={setCstNo}
                                                    readOnly={readOnly}
                                                    disabled={childRecord.current > 0}
                                                    className="focus:ring-2 focus:ring-blue-100"
                                                  />
                                                  
                          </div>
                        </div>
                      </div>

                      
                    </div>
                    <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Bank  Details</h3>
                 <div className="space-y-2">
                 

                        <TextInput
                                  name="Bank Name"
                                  type="number"
                                  // value={contact}
          
                                  // setValue={setContact}
                                  readOnly={readOnly}
                                  disabled={childRecord.current > 0}
                                  className="focus:ring-2 focus:ring-blue-100 w-10"
                                />
                      <div className="grid grid-cols-2 gap-2">
                              <TextInput
                                            name="Branch Name"
                                            type="text"
                                            // value={contact}
                    
                                            // setValue={setContact}
                                            readOnly={readOnly}
                                            disabled={childRecord.current > 0}
                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                          />
                                       <TextInput
                                              name="Account Number"
                                              type="text"
                                              // value={contact}
                      
                                              // setValue={setContact}
                                              readOnly={readOnly}
                                              disabled={childRecord.current > 0}
                                              className="focus:ring-2 focus:ring-blue-100 w-10"
                                            />
                                                  <TextInput
                                                        name="IFSC CODE"
                                                        type="number"
                                                        // value={contact}
                                
                                                        // setValue={setContact}
                                                        readOnly={readOnly}
                                                        disabled={childRecord.current > 0}
                                                        className="focus:ring-2 focus:ring-blue-100 w-10"
                                                      />
                                                                
                                                                    
                                                                                    
                      </div>
                    </div> 
                  </div>

     
                   </div>
                                                     
<div className="relative h-40 w-full justify-end mt-16"> {/* Set desired height */}
  <div className="absolute bottom-0 right-0  ">
    <button
      onClick={() => setBranchModelOpen(true)}
      readOnly={readOnly}
      className="flex items-center pl-3 h-7 w-24 rounded-md bg-blue-600 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-2 w-3"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
          clipRule="evenodd"
        />
      </svg>
      Add Branch
    </button>
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
        
            <div className="w-full  mx-auto rounded-md shadow-lg px-2 py-1 overflow-y-auto mt-1">

          <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                    <h1 className="text-2xl font-bold text-gray-800">Customer/Supplier Master </h1>
               <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setForm(true);
                              onNew();
                            }}
                            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                          >
                            <Plus size={16} />
                            Add New Customer/Supplier
                          </button>
                  <div className="flex items-center gap-2">
                              <button
                                onClick={() => setView("Customer")}
                                className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${view === "Customer"
                                    ? "bg-indigo-100 text-indigo-600"
                                    : "text-gray-600 hover:bg-gray-100"
                                  }`}
                              >
                                <Table size={16} />
                                Customer
                              </button>
                              <button
                                onClick={() => setView("Supplier")}
                                className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${view === "Supplier"
                                    ? "bg-indigo-100 text-indigo-600"
                                    : "text-gray-600 hover:bg-gray-100"
                                  }`}
                              >
                                <LayoutGrid size={16} />
                                Supplier
                              </button>
                              
                            </div>
                        </div>
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
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
                        <ReusableTable
                            columns={columns}
                            data={filterParty || []}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={deleteData}
                            itemsPerPage={10}
                        />
                    </div>

   

     
        
 
    
            
        
    {form  === true  &&  (

    
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[90%] h-[95%]"}
          onClose={() => {
            setForm(false);
            setErrors({});
          }}
        >
              <Modal
                isOpen={branchModelOpen}
                form={form}
                widthClass={` ${branchForm  ?  "w-[60%] h-[80%]" : "w-[90%] h-[90%]" } `}
                setBranchModelOpen={setBranchModelOpen}
                onClose={() => {
                  setBranchModelOpen(false)
                }}
              >



                <AddBranch 
                  
                singleData={singleData} partyId={id} branchEmail={branchEmail} setBranchEmail={setBranchEmail} setBranchAddress={setBranchAddress}
                  branchName={branchName} setBranchName={setBranchName} branchCode={branchCode} setBranchCode={setBranchCode}
                  branchAddress={branchAddress} branchContact={branchContact} setBranchContact={setBranchContact} 
                  branchContactPerson={branchContactPerson} setBranchcontactPerson={setBranchcontactPerson}  branchWebsite={branchWebsite}
                  setBranchWebsite={setBranchWebsite}  openingHours={openingHours}   setopeningHours={setopeningHours}
                  onNew={onNew}  branchType={branchType} handleFun={handleFun}
                  setId={setId} childRecord={childRecord} saveData={saveData} saveExitData={saveExitData} setReadOnly={setReadOnly}
                  deleteData={deleteData} readOnly={readOnly} onCloseForm={onCloseForm}
                  handleChange={handleChange} contactDetails={contactDetails} setContactDetails={setContactDetails}
                  shippingAddress={shippingAddress} setForm={setForm}   onClose={() => {
                  setBranchModelOpen(false) 
                }}    branchForm={branchForm}  setBranchForm={setBranchForm}
                   removeItem={removeItem} setBranchInfo={setBranchInfo} branchInfo={branchInfo}  id={id}
                  partyBranch={partyBranch} setPartyBranch={setPartyBranch} setBranchModelOpen={setBranchModelOpen} name={name}
                   setBranchType ={setBranchType} handleInputbranch={handleInputbranch} deleteBranch={deleteBranch}
                  branchTypeData = {branchTypeData} cityList={cityList}
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
                  addData={addData}  updateData={updateData}
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
                     <Modal
                    isOpen={isContactPerson}
                    widthClass={`${"w-[30%] h-[80%]"}`}
                    setIsContactPerson={setIsContactPerson}
                    onClose={() => {
                      setIsContactPerson(false)
                      // setMaterialForm(false)
                      }}
                      allData ={allData}
             
              >
                  <ContactPersonDetails    
                     partyData={singleData?.data}   contactNumber={contactNumber} setContactNumber={setContactNumber} 
                     contactPersonName={contactPersonName}  setContactPersonName={setContactPersonName}  designation={designation}
                     setDesignation={setDesignation} department={SetDepartment}  
                      setIsContactPerson={setIsContactPerson}
                       branchForm={branchForm}  
                       setBranchForm={setBranchForm}
                        onClose={() => {
                        setIsContactPerson(false) 
                      }}

                  />
              </Modal>
         
       <div className="h-full flex flex-col bg-[f1f1f0] ">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3 ">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {id ? (!readOnly ? "Edit Customer/supplier" : "Customer/supplier Master") : "Add New Customer/supplier"}
                </h2>
             
              </div>
              <div className="flex gap-2">
                <div>
                  {!readOnly && (
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

            <div className="flex-1 overflow-auto p-3">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              

               

                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Basic Details</h3>
                    {/* <div className="space-y-2"> */}
                    <div className="grid grid-cols-2">     
                      <div className="flex flex-row items-center gap-2 mt-2 mb-2">
                           <div className="flex items-center gap-2 ">
                                                   <input
                                                     type="radio"
                                                     name="type"
                                                     checked={isClient}
                                                     onChange={() => handleChange('client')}
                                                   />
                                                   <label className="block text-xs font-bold text-gray-600 mt-1">Client</label>
                                        </div>
                             <div className="flex flex-row gap-2">

                                  <input
                                    type="radio"
                                    name="type"
                                    checked={isSupplier}
                                    onChange={() => handleChange('supplier')}
                                  />
                                  <label className="block text-xs font-bold text-gray-600 mt-1">Supplier</label>
                                </div>
                                  <div className="col-span-4 flex flex-row">
                         
                        {isSupplier && (
                            <div className="w-60">

                                  <MultiSelectDropdown 
                                  // name={"Material List"}
                                    options={multiSelectOption(allData ? allData?.materialData : [], "name", "id")}
                                    labelName="name"
                                    setSelected={setSelected}
                                    selected={selected}
                                    />
                            </div>
                                                  )}
                                
                     {isSupplier && (
                        <div className="mt-3 px-3">
                      <button  className="w-7 h-6 border border-green-500 rounded-md mt-2
                                            hover:bg-green-500 text-green-600 hover:text-white
                                            transition-colors flex items-center justify-center" onClick={() => setRawMaterial(true)}>
                                   <FaPlus className="text-sm w-3 h-4 " />
                                  </button>
                        </div>
                         )} 

                        </div>     
                      </div>
                    

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
                       <div>
                          <TextInput
                                name="Party Code"
                                type="number"
                                value={partyCode}
        
                                setValue={setPartyCode}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                                className="focus:ring-2 focus:ring-blue-100 w-10"
                              />
                      </div>
                      <div className="mt-5 ml-3">
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
                         
     <div className="mt-5 ml-3">
                       
                      </div>
                                              
                                                    
                                                       
                                                  </div>
                
                  
                  </div>

        
                  </div>
                   <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Address  Details</h3>
                 <div className="space-y-2">
                 

                      <div className="grid grid-cols-2 gap-2">
                   
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
                                                               <TextInput
                                                            name="Land Mark"
                                                            type="text"
                                                            value={landMark}
                                                            required={true}
                                    
                                                            setValue={setlandMark}
                                                            readOnly={readOnly}
                                                            disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                          /> 
                                                          <div className="col-span-2">

                                                          <TextArea name="Address"
                                                          inputClass="h-10" value={address} 
                                                          setValue={setAddress} required={true}
                                                            readOnly={readOnly} d
                                                            isabled={(childRecord.current > 0)} />
                                                          </div>

                                                     
                                                      <div className="mb-11">

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
                    </div> 
                  </div>


                </div>
                   <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Contact  Details</h3>
                 <div className="space-y-2">
                 

                        <TextInput
                                  name="Party Email"
                                  type="text"
                                  value={email}
          
                                  setValue={setEmail}
                                  readOnly={readOnly}
                                  disabled={childRecord.current > 0}
                                  className="focus:ring-2 focus:ring-blue-100 w-10"
                                />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 flex flex-row gap-4 mt-2">
                           <div className="w-72">
                                                  
                              <TextInput
                                            name="Contact Person"
                                            type="text"
                                            value={contactPersonName}
                    
                                            setValue={setContactPersonName}
                                            readOnly={readOnly}
                                            disabled={childRecord.current > 0}
                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                          />
                                           </div>
                    <div className="relative inline-block">
                                <button
                                  className="w-7 h-6 border border-green-500 rounded-md mt-6
                                            hover:bg-green-500 text-green-600 hover:text-white
                                            transition-colors flex items-center justify-center"
                                  disabled={readOnly}
                                  onClick={() => {
                                    // openAddModal();
                                    // setIsDropdownOpen(false);
                                    // setEditingItem("new");
                                    // setOpenModel(true);
                                    setIsContactPerson(true)
                                  }}
                                  onMouseEnter={() => setTooltipVisible(true)}
                                  onMouseLeave={() => setTooltipVisible(false)}
                                  aria-label="Add supplier"
                                >
                                  <FaPlus className="text-sm" />
                                </button>

                                    {tooltipVisible && (
                                      <div className="absolute z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
                                        <div className="flex items-start">
                                          <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                                          <span>Click to add a new Contact Person</span>
                                        </div>
                                        <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
                                      </div>
                                    )}
                      </div>
                       
  </div> 
                                       <TextInput
                                              name="Designation"
                                              type="text"
                                              value={designation}  
                      
                                              setValue={setDesignation}
                                              readOnly={readOnly}
                                              disabled={childRecord.current > 0}
                                              className="focus:ring-2 focus:ring-blue-100 w-10"
                                            />
                                             <TextInput
                                              name="Department"
                                              type="text"
                                              value={department}
                      
                                              setValue={SetDepartment} 
                                              readOnly={readOnly}
                                              disabled={childRecord.current > 0}
                                              className="focus:ring-2 focus:ring-blue-100 w-10"
                                            />
                                                  <TextInput
                                                                    name="Contact Number"
                                                                    type="number"
                                                                    value={contact} 
                                            
                                                                    setValue={setContact}
                                                                    readOnly={readOnly}
                                                                    disabled={childRecord.current > 0}
                                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                  />
                                                                              {/* <TextInput
                                                                    name="Fax"
                                                                    type="number"
                                                                    // value={contact}
                                            
                                                                    // setValue={setContact}
                                                                    readOnly={readOnly}
                                                                    disabled={childRecord.current > 0}
                                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                  />     */}
                                                                          <TextInput
                                                                    name="Website"
                                                                    type="text"
                                                                    value={website}
                                            
                                                                    setValue={setWebsite}
                                                                    readOnly={readOnly}
                                                                    disabled={childRecord.current > 0}
                                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                  />
                                                                    
                                                                                    
                      </div>
                    </div> 
                  </div>

     
                </div>
               
              

                    <div className="lg:col-span-4 space-y-3">
                      <div className="bg-white p-3 rounded-md border border-gray-200">
                        <h3 className="font-medium text-gray-800 mb-2 text-sm">Business Details</h3>
                        <div className="space-y-2">

                          <div className="grid grid-cols-2 gap-2">
                              

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
                                                    name="CIN No"
                                                    type="text"
                                                    value={cinNo}
                                                    setValue={setCinNo}
                                                    readOnly={readOnly}
                                                    disabled={childRecord.current > 0}
                                                    className="focus:ring-2 focus:ring-blue-100"
                                                  />
                                                  
                          </div>
                        </div>
                      </div>

                      
                    </div>
                    <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Bank  Details</h3>
                 <div className="space-y-2">
                 

                        <TextInput
                                  name="Bank Name"
                                  type="text"
                                  value={bankname}
          
                                  setValue={setBankName}
                                  readOnly={readOnly}
                                  disabled={childRecord.current > 0}
                                  className="focus:ring-2 focus:ring-blue-100 w-10"
                                />
                      <div className="grid grid-cols-2 gap-2">
                              <TextInput
                                            name="Branch Name"
                                            type="text"
                                            value={bankBranchName}
                    
                                            setValue={setBankBranchName}
                                            readOnly={readOnly}
                                            disabled={childRecord.current > 0}
                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                          />
                                       <TextInput
                                              name="Account Number"
                                              type="text"
                                              // value={contact}
                      
                                              // setValue={setContact}
                                              readOnly={readOnly}
                                              disabled={childRecord.current > 0}
                                              className="focus:ring-2 focus:ring-blue-100 w-10"
                                            />
                                                  <TextInput
                                                        name="IFSC CODE"
                                                        type="text"
                                                        value={ifscCode}
                                
                                                        setValue={setIfscCode}
                                                        readOnly={readOnly}
                                                        disabled={childRecord.current > 0}
                                                        className="focus:ring-2 focus:ring-blue-100 w-10"
                                                      />
                                                                
                                                                    
                                                                                    
                      </div>
                    </div> 
                  </div>

     
                   </div>
                                                     
<div className="relative h-40 w-full justify-end mt-16"> {/* Set desired height */}
  <div className="absolute bottom-0 right-0  ">
    <button
      onClick={() => setBranchModelOpen(true)}
      readOnly={readOnly}
      className="flex items-center pl-3 h-7 w-24 rounded-md bg-blue-600 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-2 w-3"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
          clipRule="evenodd"
        />
      </svg>
      Add Branch
    </button>
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


                      


                     

                     




