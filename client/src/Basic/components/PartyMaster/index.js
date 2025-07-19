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
import { BracesIcon, Check, LayoutGrid, Paperclip, Plus, Table } from "lucide-react";
import Mastertable from "../MasterTable/Mastertable";
import { useGetbranchTypeQuery } from "../../../redux/uniformService/BranchTypeMaster";
import { useGetCountriesQuery, useGetCountryByIdQuery } from "../../../redux/services/CountryMasterService";
import Swal from "sweetalert2";
import Loader from "../Loader";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { FaInfoCircle, FaPlus } from "react-icons/fa";
import AddContactPersonDetails from "./PartyContactDetails";
import ContactPersonDetails from "./PartyContactDetails";
import ArtDesignReport from "./ArtDesign/ArtDesignReport";

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
  const [alterContactNumber, setAlterContactNumber] = useState("")

    const [formReport, setFormReport] = useState(false);
  const [attachments, setAttachments] = useState([]);


  const [contactPersonName, setContactPersonName] = useState("")


  const [certificate, setCertificate] = useState([])
  const [searchValue, setSearchValue] = useState("");
  const [email, setEmail] = useState("")
  const [addressOnlyRead, setAddressOnlyRead] = useState(true)
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState({});
  const [partyCode,setPartyCode] = useState("");
    const [landMark,setlandMark] = useState("");
    const [accountNumber,setAccountNumber] = useState("");
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
  const [branchAliasName, setBranchAliasName] = useState('');
const [branchActive, setBranchActive] = useState(true); 
const [branchCity, setBranchCity] = useState('');
const [branchLandMark, setBranchLandMark] = useState('');
const [branchPincode, setBranchPincode] = useState('');
const [branchContactDesignation, setBranchcontactDesignation] = useState('');
const [branchContactDepartment, setBranchcontactDepartment] = useState('');
const [branchBankname, setBranchBankName] = useState('');
const [branchBankBranchName, setBranchBankBranchName] = useState('');
const [branchAccountNumber, setBranchAccountNumber] = useState('');
const [branchIfscCode, setBranchIfscCode] = useState('');
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
  const [view, setView] = useState("all");
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isContactPerson,setIsContactPerson]  = useState(false)
  const [designation,setDesignation]  = useState("")
   const [department,setDepartment ] = useState("")
const [contactPersonEmail,setContactPersonEmail]  = useState("")
const[tooltipVisibleForMaterial,setTooltipVisibleForMaterial] =  useState("")
const [branchAlterContact ,setBranchAlterContact] =  useState("")
const [ branchContactPersonEmail , setBranchContactPersonEmail ] = useState("")

   const branchState = {
      branchModelOpen,
  setBranchModelOpen,
  branchName,
  setBranchName,

  branchAddress,
  setBranchAddress,
  branchContact,
  setBranchContact,
  branchContactPerson,
  setBranchcontactPerson,
  branchEmail,
  setBranchEmail,
  openingHours,
  setopeningHours,
  branchWebsite,
  setBranchWebsite,
branchAlterContact,
setBranchAlterContact,
branchContactPersonEmail,
setBranchContactPersonEmail,

  branchAliasName,
  setBranchAliasName,
  branchCode,
  setBranchCode,
  branchActive,
  setBranchActive,
  branchCity,
  setBranchCity,
  branchLandMark,
  setBranchLandMark,
  branchPincode,
  setBranchPincode,
  branchContactDesignation,
  setBranchcontactDesignation,
  branchContactDepartment,
  setBranchcontactDepartment,
  branchBankname,
  setBranchBankName,
  branchBankBranchName,
  setBranchBankBranchName,
  branchAccountNumber,
  setBranchAccountNumber,
  branchIfscCode,
  setBranchIfscCode,
  branchType,setBranchType
};


  
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


  useEffect(() => {
    if (openPartyModal) {
      setId("");
      setForm(true);
    }
  }, [openPartyModal]);


console.log(id,"id")
  const {
    data: singleData,
    refetch,

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
if(view  ==  "all"){
   filterParty  =  allData?.data
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
      let contactdetails = data?.PartyContactDetails?.[0]
      console.log(contactDetails,"contactDetails")
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
      setCity(data?.City?.id || "");
      setCurrency(data?.Currency?.name || "");
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
      setContactPersonName(contactdetails?.contactPersonName  ? contactdetails?.contactPersonName : undefined )
      setContact(contactdetails?.mobileNo  ?  contactdetails?.mobileNo  : undefined )
      setDesignation(contactdetails?.Designation  ?  contactdetails?.Designation  : undefined)
      setDepartment(contactdetails?.department   ?  contactdetails?.department   : undefined  )
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
    contactNumber,
    alterContactNumber,
  
    
    
    
    branchInfo : branchInfo?.filter(item  => item.branchName !== "") , mail,
    partyMaterials : selected,   material,  materialActive, rawMaterial,
 branchStateValues : {
  branchModelOpen,
            branchName,
            branchAddress,
            branchContact,
            branchContactPerson,
            branchEmail,
            openingHours,
            branchWebsite,

            branchAliasName,
            branchCode,
            branchActive,
            branchCity,
            branchLandMark,
            branchPincode,
            branchContactDesignation,
            branchContactDepartment,
            branchBankname,
            branchBankBranchName,
            branchAccountNumber,
            branchIfscCode,
},

    contact,department,designation,contactPersonName,contactPersonEmail

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

      console.log(attachments,"attachments")

  const handleSubmitCustom = async (callback, data, text, exit = false) => {
    try {
         const formData = new FormData();
      for (let key in data) {
        if (key === 'attachments') {
          formData.append(key, JSON.stringify(data[key].map(i => ({ ...i, filePath: (i.filePath instanceof File) ? (console.log(i.filePath.name,"filepath")) : i.filePath }))));
          data[key].forEach(option => {
           
            if (option?.filePath instanceof File) {
              formData.append('file', option.filePath);
            }
          });
        } 
      }
      console.log(formData,"formData")
       data.attachmentsFormData = formData;
      
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

      setId(returnData?.data?.id);
      onNew();
      setForm(false)
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
                 Swal.fire({
        icon: 'error',
        title: `Select One Material...!`,
        showConfirmButton: false,
        timer: 3000
      });
          return false
        }
    }
      if (!validateData(data)) {
 
         Swal.fire({
        icon: 'warning',
        title: `Please fill all required fields...!`,
        showConfirmButton: false,
        timer: 3000
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
         Swal.fire({
                             icon: 'success',
                             title: `Deleted Successfully`,
                             showConfirmButton: false,
                             timer: 2000
                           });
        setForm(false);
      } catch (error) {
              Swal.fire({
                            icon: 'error',
                            title: 'Submission error',
                            text: error.data?.message || 'Something went wrong!',
                          });
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
                     Swal.fire({
                             icon: 'success',
                             title: `Deleted Successfully`,
                             showConfirmButton: false,
                             timer: 2000
                           });
               } catch (error) {
                   Swal.fire({
                            icon: 'error',
                            title: 'Submission error',
                            text: error.data?.message || 'Something went wrong!',
                          });
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
      header: 'Address',
      accessor: (item) => item.address    ,
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
           widthClass={`${"w-[85%] "} ${isAddressExpanded ? "h-[95%]" : "h-[97%]"}`}
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
                widthClass={`${"w-[90%] h-[90%]"}`}
                setBranchModelOpen={setBranchModelOpen}
                onClose={() => {
                  setBranchModelOpen(false)
                }}
              >



                <AddBranch 
                                singleData={singleData} partyId={id}  branchEmail={branchEmail} setBranchEmail={setBranchEmail} setBranchAddress={setBranchAddress}
                  branchName={branchName} setBranchName={setBranchName} branchCode={branchCode} setBranchCode={setBranchCode}
                  branchAddress={branchAddress} branchContact={branchContact} setBranchContact={setBranchContact} 
                  branchContactPerson={branchContactPerson} setBranchcontactPerson={setBranchcontactPerson}  branchWebsite={branchWebsite}
                  setBranchWebsite={setBranchWebsite}  openingHours={openingHours}   setopeningHours={setopeningHours}
                  onNew={onNew}  branchType={branchType} handleFun={handleFun}
                  setPartyId={setId} childRecord={childRecord} saveData={saveData} saveExitData={saveExitData} setReadOnly={setReadOnly}
                  deleteData={deleteData} readOnly={readOnly} onCloseForm={onCloseForm}
                  handleChange={handleChange} contactDetails={contactDetails} setContactDetails={setContactDetails}
                  shippingAddress={shippingAddress} setForm={setForm}   onClose={() => {
                  setBranchModelOpen(false) 
                }}    branchForm={branchForm}  setBranchForm={setBranchForm}
                   removeItem={removeItem} setBranchInfo={setBranchInfo} branchInfo={branchInfo}  
                  partyBranch={partyBranch} setPartyBranch={setPartyBranch} setBranchModelOpen={setBranchModelOpen} name={name}
                   setBranchType ={setBranchType} handleInputbranch={handleInputbranch} deleteBranch={deleteBranch}
                 cityList={cityList}  branchState={branchState} refetch={refetch} 
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
                <h2 className="text-md font-semibold text-gray-800">
                  {id ? (!readOnly ? "Edit Customer/Supplier" : "Customer/Supplier Master") : "Add New Customer/Supplier"}
                </h2>
             
              </div>


              <div className="flex gap-2">
                 <div className="  ">
    <button
      onClick={() => {
        if(name ){

          setBranchModelOpen(true)
          setBranchForm(false)
        }
        else{
 Swal.fire({
                             icon: 'warning',
                             title: `Enter ${isSupplier ? "Supplier Details" : "Customer Details"} `,
                             showConfirmButton: false,
                             timer: 2000
                           });
        }

      }}
      readOnly={readOnly}
            className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
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
      Add Branch
    </button>
  </div>
                <div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(false);
                        setSearchValue("");
                        setId(false);
                      }}
                      className="px-2 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
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
                      className="px-2 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
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
              

               

                <div className="lg:col-span-4 space-y-3 ">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Basic Details</h3>
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
                            <div className="w-48">

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
  <div className="mt-3 px-3 relative inline-block">
    {/* Button */}
    <button
      className="w-7 h-6 border border-green-500 rounded-md mt-2
                hover:bg-green-500 text-green-600 hover:text-white
                transition-colors flex items-center justify-center"
      onClick={() => setRawMaterial(true)}
      onMouseEnter={() => setTooltipVisibleForMaterial(true)}
      onMouseLeave={() => setTooltipVisibleForMaterial(false)}
    >
      <FaPlus className="text-sm w-3 h-4" />
    </button>

    {/* Tooltip (shown below and right-aligned to button) */}
    {tooltipVisibleForMaterial && (
      <div className="absolute left-full top-0 ml-2 mt-1 w-56 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg z-10">
        <div className="flex items-start">
          <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
          <span>Click to add a new Material</span>
        </div>
        {/* Tooltip arrow */}
        <div className="absolute top-2 -left-1 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
      </div>
    )}
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
                       <div className="col-span-1">
                          <TextInput
                                name="Party Code"
                                type="text"
                                value={partyCode}
        
                                setValue={setPartyCode}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                                className="focus:ring-2 focus:ring-blue-100 w-10"
                              />
                      </div>
                          {/* <div className="col-span-1">
                          <DateInput
                                name="Date of Registration"
                                
                                value={partyCode}
        
                                setValue={setPartyCode}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                                className="focus:ring-2 focus:ring-blue-100 w-10"
                              />
                      </div> */}
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
                   <div className="lg:col-span-4 space-y-3 ">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Address  Details</h3>
                 <div className="space-y-2">
                 

                      <div className="grid grid-cols-2 gap-2">
         
                              <div className="col-span-2">
                                
                                <TextArea name="Address"
                                  inputClass="h-10" value={address} 
                                  setValue={setAddress} required={true}
                                    readOnly={readOnly} d
                                    isabled={(childRecord.current > 0)} />
                              </div>
                                        <TextInput
                                                            name="Land Mark"
                                                            type="text"
                                                            value={landMark}
                                    
                                                            setValue={setlandMark}
                                                            readOnly={readOnly}
                                                            disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
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
                                                      
                                    <div className="col-span-2 flex flex-row gap-3">                        
                                      <div className="w-24">

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
                                      <div className="w-64"> 
                                            <TextInput
                                        name={"Email"}
                                        type="text"
                                        value={email}
                
                                        setValue={setEmail}
                                        readOnly={readOnly}
                                        disabled={childRecord.current > 0}
                                        className="focus:ring-2 focus:ring-blue-100 w-10"
                                      />
                                      <div>
                                       

                                      </div>

                                      </div>
                                    </div> 
                                     <div>
                                                       <TextInput
                                        name={"Contact Number"}
                                        type="text"
                                        value={email}
                
                                        setValue={setEmail}
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
                  <div className="bg-white p-3 rounded-md border border-gray-200  h-[330px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Contact  Details</h3>
                 <div className="space-y-2">
                 

                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 flex flex-row gap-4 mt-2">
                           <div className="w-96">
                                                  
                              <TextInput
                                            name="Contact Person Name"
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
                                    setBranchForm(false)
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
                      
                                              setValue={setDepartment} 
                                              readOnly={readOnly}
                                              disabled={childRecord.current > 0}
                                              className="focus:ring-2 focus:ring-blue-100 w-10"
                                            />
                                                <div className='col-span-2'>
                                  
                                                                        <TextInput
                                                                            name="Email"
                                                                            type="text"
                                                                            value={branchEmail}
                                                    
                                                                            setValue={setBranchEmail}
                                                                            readOnly={readOnly}
                                                                            disabled={childRecord.current > 0}
                                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                          />
                                                                        </div>
                                                                                    <div className='col-span-1'>
                                
                                                              <TextInput
                                                                name="Contact Number"
                                                                type="number"
                                                                value={contactNumber} 
                                                                setValue={setContactNumber}
                                        
                                                                readOnly={readOnly}
                                                                disabled={childRecord.current > 0}
                                                                className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                          />
                                                                          </div>  
                                                              <div className='col-span-1'>
                                                                        <TextInput
                                                                                      name="Alternative Contact Number"
                                                                                      type="number"
                                                                                        value={alterContactNumber}
                                                                                    setValue={setAlterContactNumber}
                                                              
                                                                                      // readOnly={readOnly}
                                                                                      // disabled={childRecord.current > 0}
                                                                                      className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                                    />
                                                                         </div>
                            
                                            

                                                                       
                                                                       {/* <div className='col-span-2 flex flex-row gap-3' >
                                                                     
                                                                    
                                                             </div> */}
                                                              
                                                                              {/* <TextInput
                                                                    name="Fax"
                                                                    type="number"
                                                                    // value={contact}
                                            
                                                                    // setValue={setContact}
                                                                    readOnly={readOnly}
                                                                    disabled={childRecord.current > 0}
                                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                  />     */}
                                                                          {/* <TextInput
                                                                    name="Website"
                                                                    type="text"
                                                                    value={website}
                                            
                                                                    setValue={setWebsite}
                                                                    readOnly={readOnly}
                                                                    disabled={childRecord.current > 0}
                                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                  /> */}
                                                                    
                                                                                    
                      </div>
                    </div> 
                  </div>

     
                </div>
               
              

                    <div className="lg:col-span-4 space-y-3">
                      <div className="bg-white p-3 rounded-md border border-gray-200 h-[240px]">
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
                                                    name="MSME CERTFICATE  No"
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
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[240px]">
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
                                              value={accountNumber}
                      
                                              setValue={setAccountNumber}
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
                               <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Attchments</h3>
                 <div className="space-y-2">
                                        <div className="flex pt-4">
            <button
              className="relative  h-6 px-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white
              rounded shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out overflow-hidden"
              onClick={() => setFormReport(true)}
            >
              <span className="absolute  bg-white opacity-10 "></span>
              <span className="relative z-10 text-[12px]"> Attach Documents</span>
            </button>
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
        
            <div className="w-full  mx-auto rounded-md shadow-lg px-2 py-1 overflow-y-auto mt-1">

          <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                    <h1 className="text-xl font-bold text-gray-800">Customer/Supplier Master </h1>
                      <div className="flex items-center gap-4 text-md">
                          <button
                            onClick={() => {
                              setForm(true);
                              onNew();
                            }}
            className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                          >
                            <Plus size={12} />
                          <span className=" ">
                            Add New Customer/Supplier
                            </span>   
                          </button>
                  <div className="flex items-center gap-2">
                     <button
                                onClick={() => setView("all")}
                                className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${view === "all"
                                    ? "bg-indigo-100 text-indigo-600"
                                    : "text-gray-600 hover:bg-gray-100"
                                  }`}
                              >
                                <Table size={16} />
                                All
                              </button>
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
                  refetch()
                }}
              >



                <AddBranch 
                  
                singleData={singleData} partyId={id}  branchEmail={branchEmail} setBranchEmail={setBranchEmail} setBranchAddress={setBranchAddress}
                  branchName={branchName} setBranchName={setBranchName} branchCode={branchCode} setBranchCode={setBranchCode}
                  branchAddress={branchAddress} branchContact={branchContact} setBranchContact={setBranchContact} 
                  branchContactPerson={branchContactPerson} setBranchcontactPerson={setBranchcontactPerson}  branchWebsite={branchWebsite}
                  setBranchWebsite={setBranchWebsite}  openingHours={openingHours}   setopeningHours={setopeningHours}
                  onNew={onNew}  branchType={branchType} handleFun={handleFun}
                  setPartyId={setId} childRecord={childRecord} saveData={saveData} saveExitData={saveExitData} setReadOnly={setReadOnly}
                  deleteData={deleteData} readOnly={readOnly} onCloseForm={onCloseForm}
                  handleChange={handleChange} contactDetails={contactDetails} setContactDetails={setContactDetails}
                  shippingAddress={shippingAddress} setForm={setForm}   onClose={() => {
                  setBranchModelOpen(false) 
                }}    branchForm={branchForm}  setBranchForm={setBranchForm}
                   removeItem={removeItem} setBranchInfo={setBranchInfo} branchInfo={branchInfo}  
                  partyBranch={partyBranch} setPartyBranch={setPartyBranch} setBranchModelOpen={setBranchModelOpen} name={name}
                   setBranchType ={setBranchType} handleInputbranch={handleInputbranch} deleteBranch={deleteBranch}
                 cityList={cityList}  branchState={branchState} refetch={refetch} 
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
                      addData={addData} 
                      updateData={updateData}
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
                    widthClass={`${ branchForm ?   "w-[33%] h-[71%]"  : "w-[60%] h-[68%]"  }`}
                    setIsContactPerson={setIsContactPerson}
                    onClose={() => {
                      setIsContactPerson(false)
                      // setMaterialForm(false)
                      }}
                      allData ={allData}
             
              >
                  <ContactPersonDetails    
                     partyData={singleData?.data}   partyId={id} contactNumber={contactNumber} setContactNumber={setContactNumber} 
                     contactPersonName={contactPersonName}  setContactPersonName={setContactPersonName}  designation={designation}
                     setDesignation={setDesignation} setDepartment={setDepartment}   department={department}
                      setIsContactPerson={setIsContactPerson}  setContactPersonEmail={setContactPersonEmail}  contactPersonEmail={contactPersonEmail}
                       branchForm={branchForm}   refetch={refetch} syncFormWithDb ={syncFormWithDb} alterContactNumber={alterContactNumber}
                      setAlterContactNumber={setAlterContactNumber}
                       setBranchForm={setBranchForm}
                        onClose={() => {
                        setIsContactPerson(false) 
                      }}

                  />
              </Modal>
                    <Modal isOpen={formReport}
        onClose={() => setFormReport(false)} widthClass={"p-3 h-[70%] w-[70%]"}
      >
        <ArtDesignReport
          // userRole={userRole}
          setFormReport={setFormReport}
          tableWidth="100%"
          formReport={formReport}
          setAttachments={setAttachments}
          attachments={attachments}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </Modal>
         
       <div className="h-full flex flex-col bg-[f1f1f0] ">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3 ">
              <div className="flex items-center gap-2">
                <h2 className="text-md font-semibold text-gray-800">
                  {id ? (!readOnly ? "Edit Customer/Supplier" : "Customer/Supplier Master") : "Add New Customer/Supplier"}
                </h2>
             
              </div>


              <div className="flex gap-2">
                 <div className="  ">
    <button
      onClick={() => {
        if(name ){

          setBranchModelOpen(true)
          setBranchForm(false)
        }
        else{
 Swal.fire({
                             icon: 'warning',
                             title: `Enter ${isSupplier ? "Supplier Details" : "Customer Details"} `,
                             showConfirmButton: false,
                             timer: 2000
                           });
        }

      }}
      readOnly={readOnly}
            className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
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
      Add Branch
    </button>
  </div>
                <div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(false);
                        setSearchValue("");
                        setId(false);
                      }}
                      className="px-2 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
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
                      className="px-2 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
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
              

               

                <div className="lg:col-span-4 space-y-3 ">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Basic Details</h3>
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
                            <div className="w-48">

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
  <div className="mt-3 px-3 relative inline-block">
    {/* Button */}
    <button
      className="w-7 h-6 border border-green-500 rounded-md mt-2
                hover:bg-green-500 text-green-600 hover:text-white
                transition-colors flex items-center justify-center"
      onClick={() => setRawMaterial(true)}
      onMouseEnter={() => setTooltipVisibleForMaterial(true)}
      onMouseLeave={() => setTooltipVisibleForMaterial(false)}
    >
      <FaPlus className="text-sm w-3 h-4" />
    </button>

    {/* Tooltip (shown below and right-aligned to button) */}
    {tooltipVisibleForMaterial && (
      <div className="absolute left-full top-0 ml-2 mt-1 w-56 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg z-10">
        <div className="flex items-start">
          <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
          <span>Click to add a new Material</span>
        </div>
        {/* Tooltip arrow */}
        <div className="absolute top-2 -left-1 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
      </div>
    )}
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
                       <div className="col-span-1">
                          <TextInput
                                name="Party Code"
                                type="text"
                                value={partyCode}
        
                                setValue={setPartyCode}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                                className="focus:ring-2 focus:ring-blue-100 w-10"
                              />
                      </div>
                          {/* <div className="col-span-1">
                          <DateInput
                                name="Date of Registration"
                                
                                value={partyCode}
        
                                setValue={setPartyCode}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                                className="focus:ring-2 focus:ring-blue-100 w-10"
                              />
                      </div> */}
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
                   <div className="lg:col-span-4 space-y-3 ">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Address  Details</h3>
                 <div className="space-y-2">
                 

                      <div className="grid grid-cols-2 gap-2">
         
                              <div className="col-span-2">
                                
                                <TextArea name="Address"
                                  inputClass="h-10" value={address} 
                                  setValue={setAddress} required={true}
                                    readOnly={readOnly} d
                                    isabled={(childRecord.current > 0)} />
                              </div>
                                        <TextInput
                                                            name="Land Mark"
                                                            type="text"
                                                            value={landMark}
                                    
                                                            setValue={setlandMark}
                                                            readOnly={readOnly}
                                                            disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
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
                                                      
                                    <div className="col-span-2 flex flex-row gap-3">                        
                                      <div className="w-24">

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
                                      <div className="w-64"> 
                                            <TextInput
                                        name={"Email"}
                                        type="text"
                                        value={email}
                
                                        setValue={setEmail}
                                        readOnly={readOnly}
                                        disabled={childRecord.current > 0}
                                        className="focus:ring-2 focus:ring-blue-100 w-10"
                                      />
                                      <div>
                                       

                                      </div>

                                      </div>
                                    </div> 
                                     <div>
                                                       <TextInput
                                        name={"Contact Number"}
                                        type="text"
                                        value={email}
                
                                        setValue={setEmail}
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
                  <div className="bg-white p-3 rounded-md border border-gray-200  h-[330px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Contact  Details</h3>
                 <div className="space-y-2">
                 

                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 flex flex-row gap-4 mt-2">
                           <div className="w-96">
                                                  
                              <TextInput
                                            name="Contact Person Name"
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
                                    setBranchForm(false)
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
                      
                                              setValue={setDepartment} 
                                              readOnly={readOnly}
                                              disabled={childRecord.current > 0}
                                              className="focus:ring-2 focus:ring-blue-100 w-10"
                                            />
                                                <div className='col-span-2'>
                                  
                                                                        <TextInput
                                                                            name="Email"
                                                                            type="text"
                                                                            value={branchEmail}
                                                    
                                                                            setValue={setBranchEmail}
                                                                            readOnly={readOnly}
                                                                            disabled={childRecord.current > 0}
                                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                          />
                                                                        </div>
                                                                                    <div className='col-span-1'>
                                
                                                              <TextInput
                                                                name="Contact Number"
                                                                type="number"
                                                                value={contactNumber} 
                                                                setValue={setContactNumber}
                                        
                                                                readOnly={readOnly}
                                                                disabled={childRecord.current > 0}
                                                                className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                          />
                                                                          </div>  
                                                              <div className='col-span-1'>
                                                                        <TextInput
                                                                                      name="Alternative Contact Number"
                                                                                      type="number"
                                                                                        value={alterContactNumber}
                                                                                    setValue={setAlterContactNumber}
                                                              
                                                                                      // readOnly={readOnly}
                                                                                      // disabled={childRecord.current > 0}
                                                                                      className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                                    />
                                                                         </div>
                            
                                            

                                                                       
                                                                       {/* <div className='col-span-2 flex flex-row gap-3' >
                                                                     
                                                                    
                                                             </div> */}
                                                              
                                                                              {/* <TextInput
                                                                    name="Fax"
                                                                    type="number"
                                                                    // value={contact}
                                            
                                                                    // setValue={setContact}
                                                                    readOnly={readOnly}
                                                                    disabled={childRecord.current > 0}
                                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                  />     */}
                                                                          {/* <TextInput
                                                                    name="Website"
                                                                    type="text"
                                                                    value={website}
                                            
                                                                    setValue={setWebsite}
                                                                    readOnly={readOnly}
                                                                    disabled={childRecord.current > 0}
                                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                  /> */}
                                                                    
                                                                                    
                      </div>
                    </div> 
                  </div>

     
                </div>
               
              

                    <div className="lg:col-span-4 space-y-3">
                      <div className="bg-white p-3 rounded-md border border-gray-200 h-[240px]">
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
                                                    name="MSME CERTFICATE  No"
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
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[240px]">
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
                                              value={accountNumber}
                      
                                              setValue={setAccountNumber}
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
              <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200  h-[240px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Attchments</h3>
                 <div className="space-y-2">
       <div className="flex pt-4">
      <button
        className="relative w-20 h-7 bg-gray-800    text-white rounded-md shadow-md hover:shadow-xl hover:scale-105 
        transform transition-all duration-300 ease-in-out overflow-hidden flex items-center justify-center"
        onClick={() => setFormReport(true)}
      >
        <span className="absolute inset-0 bg-white opacity-10 rounded-md"></span>
        <Paperclip className="relative z-10 w-5 h-5" />
      </button>
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


                      


                     

                     




