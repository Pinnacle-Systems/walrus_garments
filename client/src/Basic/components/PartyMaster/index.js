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
import { findFromList, renameFile } from "../../../Utils/helper";
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
  TextInputNew1,
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
import { FaInfoCircle, FaPlus, FaQuestionCircle, FaUpload } from "react-icons/fa";
import AddContactPersonDetails from "./PartyContactDetails";
import ContactPersonDetails from "./PartyContactDetails";
import ArtDesignReport from "./ArtDesign/ArtDesignReport";
import { useGetMaterialMasterQuery } from "../../../redux/uniformService/MaterialMasterServices";
import { getImageUrlPath } from "../../../Constants";

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
  const [currency, setCurrency] = useState("");
  const [active, setActive] = useState(true);
  const [isSupplier, setSupplier] = useState(false);
  const [isClient, setClient] = useState();
  const [itemsPopup, setItemsPopup] = useState(false);
  const [backUpItemsList, setBackUpItemsList] = useState([]);
  const [shippingAddress, setShippingAddress] = useState([]);
  const [contactDetails, setContactDetails] = useState([]);
  const [contactNumber, setContactNumber] = useState("")
  const [alterContactNumber, setAlterContactNumber] = useState("")
  const [parentId, setParentId] = useState("")
  const [isBranch, setIsBranch] = useState(false);
  const [branchTypeId, setBranchTypeId] = useState("");
  const [branchId,setBranchId] = useState("")










  const [msmeNo, setMsmeNo] = useState('')

  const [formReport, setFormReport] = useState(false);
  const [attachments, setAttachments] = useState([]);


  const [contactPersonName, setContactPersonName] = useState("")


  const [certificate, setCertificate] = useState([])
  const [searchValue, setSearchValue] = useState("");
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState({});
  const [partyCode, setPartyCode] = useState("");
  const [landMark, setlandMark] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [contact, setContact] = useState("");
  const [bankname, setBankName] = useState("");
  const [bankBranchName, setBankBranchName] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const [branchModelOpen, setBranchModelOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchContact, setBranchContact] = useState("");
  const [branchContactPerson, setBranchcontactPerson] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  const [openingHours, setopeningHours] = useState("")
  const [branchWebsite, setBranchWebsite] = useState("")
  const [branchAliasName, setBranchAliasName] = useState('');
  const [branchActive, setBranchActive] = useState(true);
  const [branchCity, setBranchCity] = useState('');
  const [branchLandMark, setBranchLandMark] = useState('');
  const [branchPincode, setBranchPincode] = useState('');
  const [branchContactDesignation, setBranchcontactDesignation] = useState('');
  const [branchContactDepartment, setBranchcontactDepartment] = useState('');
  const [branchContactPersonContact, setBranchContactPersonContact] = useState('');
  const [branchContactPersonAlterContact, setBranchContactPersonAlterContact] = useState('');
  const [branchBankname, setBranchBankName] = useState('');
  const [branchBankBranchName, setBranchBankBranchName] = useState('');
  const [branchAccountNumber, setBranchAccountNumber] = useState('');
  const [branchIfscCode, setBranchIfscCode] = useState('');
  const [branchForm, setBranchForm] = useState(true)
  const [partyBranch, setPartyBranch] = useState([])
  const [rawMaterial, setRawMaterial] = useState(false)
  const [material, setMaterial] = useState("")
  const [materialActive, setMaterialActive] = useState(true);
  const [materialId, setMaterialId] = useState("")
  const [branchType, setBranchType] = useState("");
  const [branchInfo, setBranchInfo] = useState([]);
  const [partyMaterials, setPartyMaterials] = useState([]);
  const [materialForm, setMaterialForm] = useState(false)
  const [view, setView] = useState("all");
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isContactPerson, setIsContactPerson] = useState(false)
  const [designation, setDesignation] = useState("")
  const [department, setDepartment] = useState("")
  const [contactId, setContactId] = useState("")
  const [contactPersonEmail, setContactPersonEmail] = useState("")
  const [tooltipVisibleForMaterial, setTooltipVisibleForMaterial] = useState("")
  const [branchAlterContact, setBranchAlterContact] = useState("")
  const [branchContactPersonEmail, setBranchContactPersonEmail] = useState("")

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  // const [readOnly, setReadOnly] = useState(false)
  // const [id, setId] = useState("");
  const [showImageTooltip, setShowImageTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
    branchContactPersonContact,
    setBranchContactPersonContact,
    branchContactPersonAlterContact,
    setBranchContactPersonAlterContact,

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
    branchType,
    setBranchType
  };


  console.log(branchState, "branchState")


  const childRecord = useRef(0);
  const dispatch = useDispatch();
  const [country, setCountry] = useState("")

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

  const { data: currencyList } = useGetCurrencyMasterQuery({ params });


  const { data: branchTypeData } = useGetbranchTypeQuery({ params, searchParams: searchValue });

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


  const { data: materialList, refetch: materialRefetch } = useGetMaterialMasterQuery({ params });

  useEffect(() => {
    if (openPartyModal) {
      setId("");
      setForm(true);
    }
  }, [openPartyModal]);


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


  let filterParty;



  if (view == "Customer") {
    filterParty = allData?.data?.filter(item => item.isClient)
  }
  if (view === "Supplier") {
    filterParty = allData?.data?.filter(item => item.isSupplier)
  }
  if (view == "all") {
    filterParty = allData?.data
  }


  console.log(partyMaterials, "partyMaterials")

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
      console.log(contactDetails, "contactDetails")
      if (materialId) {
        setMaterial()
      }
      setPanNo(data?.panNo || "");
      setName(data?.name || "");
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
      setContactPersonName(contactdetails?.contactPersonName ? contactdetails?.contactPersonName : undefined)
      setContactPersonEmail(contactdetails?.email ? contactdetails?.email : undefined)
      setContactNumber(contactdetails?.mobileNo ? contactdetails?.mobileNo : undefined)
      setAlterContactNumber(contactdetails?.alterContactNumber ? contactdetails?.alterContactNumber : undefined)
      setContactId(contactdetails?.id ? contactdetails?.id : undefined)
      setDesignation(contactdetails?.Designation ? contactdetails?.Designation : undefined)
      setDepartment(contactdetails?.department ? contactdetails?.department : undefined)
      setSupplier(data?.isSupplier || false);
      setClient(data?.isClient || false);
      setBranchAddress(data?.branchAddress ? data?.branchAddress : "")
      setBranchEmail(data?.branchEmail ? data?.branchEmail : "")
      setBranchContact(data?.branchContact ? data?.branchContact : "")
      setBranchName(data?.branchName ? data?.branchName : "")
      setBranchCode(data?.branchCode ? data?.branchCode : "");
      setBranchInfo(data?.partyBranch ? data?.partyBranch : [])
      setBankName(data?.bankName ? data?.bankName : "")
      setBankBranchName(data?.branchName ? data?.branchName : "")
      setAccountNumber(data?.accountNumber ? data?.accountNumber : "")
      setIfscCode(data?.ifscCode ? data?.ifscCode : "")
      setlandMark(data?.landMark ? data?.landMark : "")
      setPartyCode(data?.code ? data?.code : "")
      setMsmeNo(data?.msmeNo ? data?.msmeNo : "")
      setContact(data?.contact ? data?.contact : "")
      setAlterContactNumber(data?.alterContactNumber ? data?.alterContactNumber : "")
      setCurrency(data?.currencyId ? data?.currencyId : "");
      setPayTermDay(data?.payTermDay ? data?.payTermDay : "0");
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
      setPartyMaterials(
        data?.PartyMaterials
          ? data.PartyMaterials.map((item) => ({
            label: item.name,
            value: item.value,
            id: item.id,
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

    isClient, isSupplier, name, aliasName, partyCode, active, displayName,

    address, landMark, cityId: city, pincode, email, contact,


    contactPersonName, designation, department, contactPersonEmail, contactNumber, alterContactNumber, website, contactId,

    currencyId: currency, payTermDay, panNo, gstNo,

    bankname, bankBranchName, accountNumber, ifscCode, msmeNo, cinNo,


    tinNo,
    certificate,
    cstNo,
    cstDate,
    faxNo,
    igst,
    costCode,
    accessoryGroup,
    companyId,
    shippingAddress,
    contactDetails,
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
    attachments,






    partyMaterials, material, materialActive, rawMaterial,

    branchStateValues: {


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
      branchContactPersonEmail,
      branchContactPersonContact
    },


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

      const formData = new FormData();

      for (let key in data) {
        console.log("KEY:", key);
        console.log("VALUE:", data[key]);
        console.log("TYPE:", typeof data[key]);
        if (key == 'attachments') {
          formData.append(
            key,
            JSON.stringify(
              data[key].map(i => ({
                ...i,
                filePath: (i.filePath instanceof File) ? i.filePath.name : i.filePath
              }))
            )
          );

          data[key].forEach(option => {


            if (option?.filePath instanceof File) {
              formData.append('image', option.filePath);
            }
          });
        }



        // 🔥 FIX HERE: If value is an array or object, convert to JSON
        else if (typeof data[key] == "object") {
          formData.append(key, JSON.stringify(data[key]));
        }

        // Normal case
        else {
          formData.append(key, data[key]);
        }
      }


      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
      } else {
        try {

          returnData = await callback(data).unwrap();
          Swal.fire({
            icon: 'success',
            title: `${text || 'Saved'} Successfully`,
            showConfirmButton: false,
            timer: 2000
          });
        }
        catch (error) {
          console.error("Submission error:", error);
          Swal.fire({
            icon: 'error',
            title: 'Submission error',
            text: error.data?.message || 'Something went wrong!',
          });
        }
      }

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

  const SaveBranch = () => {
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
      // setRawMaterial(false)
    } else {
      handleSubmitCustom(addData, data, "Added");
      // setRawMaterial(false)

    }
  }

  const saveData = () => {

    // if (isSupplier) {
    //   console.log(partyMaterials.length <= 0, "condiion")
    //   if (partyMaterials.length <= 0) {
    //     Swal.fire({
    //       icon: 'error',
    //       title: `Select One Material...!`,
    //       showConfirmButton: false,
    //       timer: 3000
    //     });
    //     return false
    //   }
    // }
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

  const deleteData = async (id) => {
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
      console.log(!window.confirm("Are you sure to delete...?"), "window")
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
    console.log(value, "value")
    const newBlend = structuredClone(branchInfo);
    if (field === "branchType") {
      let condition = branchInfo?.map(item => item.branchType !== "1")
      console.log(condition, "condition", branchInfo)
      if (condition) {
        newBlend[index][field] = value

      }

    }
    else {

      newBlend[index][field] = value;
    }
    setBranchInfo(newBlend);
  }



  function deleteBranch(index, id) {
    if (readOnly) return toast.info("Turn on Edit Mode...!!!")
    if (id) {
      setBranchInfo((prev) => prev?.filter((v, i) => parseInt(v?.id) !== parseInt(id)));
      deletePartyBranchData(id)
    }
    else {

      setBranchInfo(prev => prev.filter((_, i) => i !== index))
    }
  }



  const today = new Date();



  function addNewComments() {
    setAttachments((prev) => [...prev, { log: "", date: today, filePath: "" }]);
    // setDueDate(moment.utc(today).format("YYYY-MM-DD"));
  }

  console.log(attachments, "attachments")


  function handleInputChange(value, index, field) {
    console.log(value, 'value', index, "index", field, "field")

    const newBlend = structuredClone(attachments);
    newBlend[index][field] = value;
    setAttachments(newBlend);
    // setDueDate(moment.utc(today).format("YYYY-MM-DD"));
  };

  function deleteRow(index) {
    console.log(index, "index");

    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  function openPreview(filePath) {
    window.open(filePath instanceof File ? URL.createObjectURL(filePath) : getImageUrlPath(filePath))

  }

  useEffect(() => {
    if (attachments?.length >= 1) return
    setAttachments(prev => {
      let newArray = Array.from({ length: 1 - prev?.length }, () => {
        return { date: today, filePath: "", log: "" }
      })
      return [...prev, ...newArray]
    }
    )
  }, [setAttachments, attachments])

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
      className: 'text-gray-800 uppercase w-96'

    },
    {
      header: 'Address',
      accessor: (item) => item.address,
      cellClass: () => 'font-medium text-gray-900',
      className: 'text-gray-800 uppercase w-96'

    },


  ];

  const handleChange = (type) => {

    setSupplier(type == 'supplier');
    setClient(type == 'client');



  };
  const handleFun = () => {
    console.log("Hit")
    console.log(branchForm, "bg")

    setBranchForm(false)
    console.log(branchForm, "branch")

  };

  const countryNameRef = useRef(null);

  useEffect(() => {
    if (form && countryNameRef.current) {
      countryNameRef.current.focus();
    }
  }, [form]);
  if (isLoading || isFetching) return <Loader />

  console.log(singleData, "singleData")



  if (partyId) {
    return (
      <>








        <div className="h-full flex flex-col bg-gray-200 ">
          <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3 ">
            <div className="flex items-center gap-2">
              <h2 className="text-md font-semibold text-gray-800">
                {id ? (!readOnly ? "Edit Customer/Supplier" : "Customer/Supplier Master") : "Add New Customer/Supplier"}
              </h2>

            </div>


            <div className="flex gap-2">

              <div className="flex gap-2">
                {/* <div className="  ">
                                    <button
                                        onClick={() => {
                                            if (id) {
                                                setBranchModelOpen(true)
                                                setBranchForm(false)
                                            }

                                            else {
                                                Swal.fire({
                                                    icon: 'warning',
                                                    title: `Save the ${isSupplier ? "Supplier Details" : "Customer Details"} `,
                                                    showConfirmButton: false,
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
                                </div> */}
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
                      onClick={() => {
                        saveData("close");
                      }}
                      className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                                                    border border-blue-600 flex items-center gap-1 text-xs"
                    >
                      <Check size={14} />
                      {id ? "Update" : "Save & close"}
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {!readOnly && !id && (
                    <button
                      type="button"
                      onClick={() => {
                        saveData("new");
                      }}
                      className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                                    border border-green-600 flex items-center gap-1 text-xs"
                    >
                      <Check size={14} />
                      {"Save & New"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">



              <div className="lg:col-span-4 space-y-3 ">
                <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px] overflow-y-auto">
                  <h3 className="font-medium text-gray-800 mb-2 text-sm">Basic Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-row items-center gap-4 col-span-2 mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isClient}
                          onChange={(e) => setClient(e.target.checked)}
                          disabled={readOnly}
                        />
                        <label className="block text-xs font-bold text-gray-600">
                          Customer
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSupplier}
                          onChange={(e) => setSupplier(e.target.checked)}
                          disabled={readOnly}
                        />
                        <label className="block text-xs font-bold text-gray-600">
                          Supplier
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isBranch}
                          onChange={(e) => {
                            if (parentId || branchTypeId) {
                              setParentId("")
                              setBranchTypeId("")
                            }
                            setIsBranch(e.target.checked)
                          }}
                          disabled={readOnly}
                        />
                        <label className="block text-xs font-bold text-gray-600">
                          Is Branch
                        </label>
                      </div>
                    </div>



                    <div className="col-span-2">
                      <DropdownInput
                        name="Customer/supplier"
                        options={dropDownListObject(
                          id
                            ? allData?.data?.filter(i => i.id != id && !i.parentId)
                            : allData?.data?.filter(
                              (item) => item.active && item.id != id && !item.parentId
                            ),
                          "name",
                          "id" || []
                        )}
                        value={parentId}
                        setValue={(value) => {
                          console.log(value, "value")
                          setParentId(value)
                          setName(findFromList(value, allData?.data, "name"))

                        }}
                        // setValue={setParentId}
                        readOnly={readOnly}
                        required={true}
                        disabled={childRecord.current > 0 || !isBranch}
                      />




                    </div>
                    <div className="col-span-2">
                      <DropdownInput
                        name="Branch Type"
                        options={dropDownListObject(
                          id
                            ? branchTypeData?.data
                            : branchTypeData?.data?.filter(
                              (item) => item.active
                            ),
                          "name",
                          "id" || []
                        )}
                        value={branchTypeId}
                        openOnFocus={true}
                        setValue={(value) => {
                          setBranchTypeId(value)

                        }}
                        required={true}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0 || !isBranch || !parentId}
                      />
                    </div>
                    {!isBranch && (

                      <div className="col-span-2">
                        <TextInput
                          name={"name"}
                          type="text"
                          value={name}
                          inputClass="h-8"
                          ref={countryNameRef}
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
                    )}

                    {isBranch && (
                      <div className="col-span-2">

                        <TextArea name="Branch Name"
                          inputClass="h-10" value={name}
                          setValue={setName} required={true}
                          readOnly={readOnly}
                          disabled={(childRecord.current > 0)} />
                      </div>
                    )}
                    {/* <div className="col-span-2">
                                                    <TextInputNew1
                                                        name="Alias Name"
                                                        type="text"
                                                        inputClass="h-8"
                                                        value={aliasName}
                                                        setValue={setAliasName}
                                                        readOnly={readOnly}
                                                        disabled={childRecord.current > 0}
                                                        className="focus:ring-2 focus:ring-blue-100"
                                                    />
                                                </div> */}
                    <div className="col-span-1">
                      <TextInput
                        name="Code"
                        type="text"
                        value={partyCode}

                        setValue={setPartyCode}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                    </div>

                    <div className=" ml-2">
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
              <div className="lg:col-span-4 space-y-3 ">
                <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px] overflow-y-auto">
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
                      <div className="col-span-2">
                        <div className="grid grid-cols-5 gap-2">
                          <div className="col-span-5">
                            <TextInput
                              name="Land Mark"
                              type="text"
                              value={landMark}

                              setValue={setlandMark}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100 w-10"
                            />
                          </div>


                        </div>

                      </div>
                      <div className="col-span-2">

                        <div className=" grid grid-cols-5 gap-3">
                          <div className="col-span-4">
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
                              // lastTab={activeTab}
                              value={city}
                              setValue={setCity}
                              required={true}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100"
                            />
                          </div>
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

                      {/* <div className="">
                                                        <TextInputNew
                                                            name={"Contact Number"}
                                                            value={contact}

                                                            setValue={setContact}
                                                            readOnly={readOnly}
                                                            disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                        />
                                                    </div>
                                                    <div className="">
                                                        <TextInputNew1
                                                            name={"Email"}
                                                            type="text"
                                                            value={email}

                                                            setValue={setEmail}
                                                            readOnly={readOnly}
                                                            disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                        />

                                                    </div> */}




                    </div>
                  </div>
                </div>


              </div>
              <div className="lg:col-span-4 space-y-3">
                <div className="bg-white p-3 rounded-md border border-gray-200  h-[330px]">
                  <h3 className="font-medium text-gray-800 mb-2 text-sm">Contact  Details</h3>
                  <div className="space-y-2">



                    <div className="grid grid-cols-2 gap-2">
                      <div className="">

                        <TextInput
                          name="Contact Person Name"
                          type="text"
                          value={contactPersonName}

                          setValue={setContactPersonName}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                      </div>

                      <TextInput
                        name="Designation"
                        type="text"
                        value={designation}

                        setValue={setDesignation}
                        readOnly={readOnly}
                        // disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                      <TextInput
                        name="Department"
                        type="text"
                        value={department}

                        setValue={setDepartment}
                        readOnly={readOnly}
                        // disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                      <div className='col-span-1'>


                        <TextInput
                          name="Email"
                          type="text"
                          value={contactPersonEmail}

                          setValue={setContactPersonEmail}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                      </div>
                      <div className='col-span-2'>

                        <TextInput
                          name="Contact Number"
                          value={contactNumber}
                          setValue={setContactNumber}

                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                      </div>
                      {/* <div className='col-span-1'>
                                                        <TextInputNew
                                                            name="Alternative Contact Number"
                                                            type="number"
                                                            value={alterContactNumber}
                                                            setValue={setAlterContactNumber}

                                                            // readOnly={readOnly}
                                                            // disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                        />
                                                    </div> */}







                    </div>
                  </div>
                </div>


              </div>



              <div className="lg:col-span-4 space-y-3">
                <div className="bg-white p-3 rounded-md border border-gray-200 h-[240px]">
                  <h3 className="font-medium text-gray-800 mb-2 text-sm">Business Details</h3>
                  <div className="space-y-2">

                    <div className="grid grid-cols-2 gap-2">


                      {/* <DropdownInput
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
                                                    // lastTab={activeTab}
                                                    masterName="CURRENCY MASTER"
                                                    value={currency}
                                                    setValue={setCurrency}
                                                    readOnly={readOnly}
                                                    disabled={childRecord.current > 0}
                                                    className="focus:ring-2 focus:ring-blue-100"
                                                /> */}

                      {/* <DropdownInput
                                                    name="PayTerm"
                                                    options={dropDownListObject(
                                                        id
                                                            ? payTermList?.data
                                                            : payTermList?.data?.filter((item) => item.active),
                                                        "name",
                                                        "id"
                                                    )}
                                                    value={payTermDay}
                                                    setValue={setPayTermDay}
                                                    // required={true}
                                                    readOnly={readOnly}
                                                    disabled={childRecord.current > 0}
                                                    className="focus:ring-2 focus:ring-blue-100"
                                                /> */}
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
                        required={true}
                        disabled={parentId || isBranch}

                        className="focus:ring-2 focus:ring-blue-100"
                      />
                      <TextInput
                        name="MSME CERTFICATE  No"
                        type="text"
                        value={msmeNo}
                        setValue={setMsmeNo}
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
                      <div className="col-span-2">
                        <TextInput
                          name="Branch Name"
                          type="text"
                          value={bankBranchName}

                          setValue={setBankBranchName}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                      </div>

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
                  <h3 className="font-medium text-gray-800 mb-2 text-sm">Attachments</h3>



                  <div className="max-h-[200px] overflow-auto">
                    <div className="grid grid-cols-1 gap-3  border-collapse bg-[#F1F1F0]   shadow-sm overflow-auto">
                      <table className="bg-gray-200 text-gray-800 text-sm table-auto w-full">
                        <thead className=" py-2  font-medium  top-o sticky">
                          <tr>
                            <th className="py-2  text-xs  w-10 text-center border-r border-white/50">S.No</th>
                            {/* <th className="py-2  font-medium  w-24 text-center border-r border-white/50">Date</th> */}
                            {/* <th className="py-1 px-3 w-32 text-left border border-gray-400">User</th> */}
                            <th className="py-2  text-xs w-60 center border-white/50"> Name</th>
                            <th className="py-2  text-xs center w-60 border-r border-white/50">File</th>
                            <th className="py-2  text-xs  w-10 text-center">
                              Actions
                            </th>

                          </tr>
                        </thead>


                        <tbody>
                          {attachments?.map((item, index) => (
                            <tr
                              key={index}
                              className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                }`}
                            >
                              <td className="border-r border-white/50 center h-8 text-center "
                              >
                                {index + 1}
                              </td>


                              <td className=" border-r border-white/50' h-8 ">
                                <input
                                  type="text"
                                  className="text-left rounded py-1 px-2 w-full  focus:outline-none focus:ring focus:border-blue-300"
                                  value={item?.name}
                                  onChange={(e) =>
                                    handleInputChange(e.target.value, index, "name")
                                  }

                                />
                              </td>
                              <td className="border-r border-white/50 h-8">
                                <div className="flex items-center gap-2">

                                  {/* Hidden File Input */}
                                  {!readOnly && !item.filePath && (
                                    <>
                                      <input
                                        type="file"
                                        id={`file-upload-${index}`}
                                        className="hidden"
                                        onChange={(e) => {
                                          if (e.target.files[0]) {
                                            handleInputChange(
                                              renameFile(e.target.files[0]),
                                              index,
                                              "filePath"
                                            );
                                          }
                                        }}
                                      />

                                      {/* Attach Icon */}
                                      <label
                                        htmlFor={`file-upload-${index}`}
                                        className="cursor-pointer flex items-center justify-center p-1 bg-gray-100 rounded hover:bg-gray-200"
                                        title="Attach file"
                                      >
                                        📎
                                      </label>
                                    </>
                                  )}

                                  {/* Show File + Actions */}
                                  {item.filePath && (
                                    <>
                                      <span className="truncate max-w-[120px]">
                                        {item.filePath?.name ?? item.filePath}
                                      </span>

                                      <button
                                        onClick={() => openPreview(item.filePath)}
                                        className="text-blue-600 text-xs hover:underline"
                                      >
                                        View
                                      </button>

                                      {!readOnly && (
                                        <button
                                          onClick={() => handleInputChange('', index, "filePath")}
                                          className="text-red-600 text-xs"
                                          title="Remove file"
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>


                              <td className="w-[30px] border-gray-200 h-8">
                                <div className="flex items-center justify-center gap-1">
                                  {/* Add Button */}
                                  <button
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addNewComments();
                                      }
                                    }}
                                    onClick={addNewComments}
                                    className="flex items-center px-1 bg-blue-50 rounded"
                                  >
                                    <Plus size={18} className="text-blue-800" />
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    className="flex items-center px-1 bg-red-50 rounded"
                                    onClick={() => deleteRow(index)}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 text-red-800"
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
                                </div>
                              </td>




                            </tr>
                          ))}


                        </tbody>
                      </table>


                    </div>
                  </div>



                </div>


              </div>

            </div>
          </div>


        </div>

        <Modal
          isOpen={branchModelOpen}
          form={form}
          widthClass={"w-[90%] h-[89%]"}
          setBranchModelOpen={setBranchModelOpen}
          onClose={() => {
            setBranchModelOpen(false)
          }}
        >



          <AddBranch
            cityList={cityList}
            setReadOnly={setReadOnly} partyId={partyId}
            branchForm={branchForm} setBranchForm={setBranchForm} branchTypeData={branchTypeData}
            companyId={companyId} readOnly={readOnly} isCustomer={isClient} isSupplier={isSupplier}
            branchId={branchId} setBranchId={setBranchId}

          />



        </Modal>
      </>

    )
  }


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
                // syncFormWithDb(undefined)
                // syncFormWithDbNew(undefined)
                setParentId("")
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
                onClick={() => { setView("Customer/Supplier Name") }}
                className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${view === "all"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Table size={16} />
                All
              </button>
              <button
                onClick={() => { setView("Customer"); }}
                className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${view === "Customer"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Table size={16} />
                Customer
              </button>
              <button
                onClick={() => { setView("Supplier"); }}
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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3 w-">
        <ReusableTable
          columns={columns}
          data={filterParty || []}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteData}
          itemsPerPage={15}
        />
      </div>









      {form === true && (


        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[90%] h-[99%]"}
          onClose={() => {
            setForm(false);
            // syncFormWithDb(undefined)
            // syncFormWithDbNew(undefined)
          }}
        >






          <div className="h-full flex flex-col bg-gray-200 ">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3 ">
              <div className="flex items-center gap-2">
                <h2 className="text-md font-semibold text-gray-800">
                  {id ? (!readOnly ? "Edit Customer/Supplier" : "Customer/Supplier Master") : "Add New Customer/Supplier"}
                </h2>

              </div>


              <div className="flex gap-2">
                {/* <div className="  ">
                                        <button
                                            onClick={() => {
                                                if (id) {
                                                    setBranchModelOpen(true)
                                                    setBranchForm(false)
                                                }

                                                else {
                                                    Swal.fire({
                                                        icon: 'warning',
                                                        title: `Save the ${isSupplier ? "Supplier Details" : "Customer Details"} `,
                                                        showConfirmButton: false,
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
                                    </div> */}
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
                        onClick={() => {
                          saveData("close");
                        }}
                        className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                                                    border border-blue-600 flex items-center gap-1 text-xs"
                      >
                        <Check size={14} />
                        {id ? "Update" : "Save & close"}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!readOnly && !id && (
                      <button
                        type="button"
                        onClick={() => {
                          saveData("new");
                        }}
                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                                    border border-green-600 flex items-center gap-1 text-xs"
                      >
                        <Check size={14} />
                        {"Save & New"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">




                <div className="lg:col-span-4 space-y-3 ">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px] overflow-y-auto">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Basic Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-row items-center gap-4 col-span-2 mb-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isClient}
                            onChange={(e) => setClient(e.target.checked)}
                            disabled={readOnly}
                          />
                          <label className="block text-xs font-bold text-gray-600">
                            Customer
                          </label>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSupplier}
                            onChange={(e) => setSupplier(e.target.checked)}
                            disabled={readOnly}
                          />
                          <label className="block text-xs font-bold text-gray-600">
                            Supplier
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isBranch}
                            onChange={(e) => {
                              if (parentId || branchTypeId) {
                                setParentId("")
                                setBranchTypeId("")
                                setName("")
                              }
                              setIsBranch(e.target.checked)
                            }}
                            disabled={readOnly}
                          />
                          <label className="block text-xs font-bold text-gray-600">
                            Add Branch
                          </label>
                        </div>
                      </div>



                      <div className="col-span-2">
                        <DropdownInput
                          name="Customer/supplier"
                          options={dropDownListObject(
                            id
                              ? allData?.data?.filter(i => i.id != id && !i.parentId)
                              : allData?.data?.filter(
                                (item) => item.active && item.id != id && !item.parentId
                              ),
                            "name",
                            "id"
                          )}
                          value={parentId}
                          setValue={(value) => {
                            console.log(value, "value")
                            setParentId(value)
                            setName(findFromList(value, allData?.data, "name"))

                          }}
                          // setValue={setParentId}
                          readOnly={readOnly}
                          required={true}
                          disabled={childRecord.current > 0 || !isBranch}
                        />




                      </div>
                      <div className="col-span-2">
                        <DropdownInput
                          name="Branch Type"
                          options={dropDownListObject(
                            id
                              ? branchTypeData?.data
                              : branchTypeData?.data?.filter(
                                (item) => item.active
                              ),
                            "name",
                            "id" || []
                          )}
                          value={branchTypeId}
                          openOnFocus={true}
                          setValue={(value) => {
                            setBranchTypeId(value)

                          }}
                          required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0 || !isBranch || !parentId}
                        />
                      </div>
                      {!isBranch && (

                        <div className="col-span-2">
                          <TextInputNew1
                            name={`${isSupplier ? "Supplier Name" : "Customer Name"}`}
                            type="text"
                            value={name}
                            inputClass="h-8"
                            ref={countryNameRef}
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
                      )}

                      {isBranch && (
                        <div className="col-span-2">

                          <TextInputNew1 name="Branch Name"
                            inputClass="h-10" value={name}
                            setValue={setName} required={true}
                            readOnly={readOnly}
                            disabled={(childRecord.current > 0)} />
                        </div>
                      )}

                      <div className="col-span-1">
                        <TextInputNew1
                          name="Code"
                          type="text"
                          value={partyCode}

                          setValue={setPartyCode}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                      </div>

                      <div className=" ml-2">
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
                <div className="lg:col-span-4 space-y-3 ">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px] overflow-y-auto">
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
                        <div className="col-span-2">
                          <div className="grid grid-cols-5 gap-2">
                            <div className="col-span-5">
                              <TextInputNew1
                                name="Land Mark"
                                type="text"
                                value={landMark}

                                setValue={setlandMark}
                                readOnly={readOnly}
                                // disabled={childRecord.current > 0}
                                className="focus:ring-2 focus:ring-blue-100 w-10"
                              />
                            </div>


                          </div>

                        </div>
                        <div className="col-span-2">

                          <div className=" grid grid-cols-5 gap-3">
                            <div className="col-span-4">
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
                                // lastTab={activeTab}
                                value={city}
                                setValue={setCity}
                                required={true}
                                readOnly={readOnly}
                                // disabled={childRecord.current > 0}
                                className="focus:ring-2 focus:ring-blue-100"
                              />
                            </div>
                            <TextInput
                              name="Pincode"
                              type="number"
                              value={pincode}
                              required={true}

                              setValue={setPincode}
                              readOnly={readOnly}
                              // disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100 w-10"
                            />


                          </div>

                        </div>

                        {/* <div className="">
                                                        <TextInputNew
                                                            name={"Contact Number"}
                                                            value={contact}

                                                            setValue={setContact}
                                                            readOnly={readOnly}
                                                            disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                        />
                                                    </div>
                                                    <div className="">
                                                        <TextInputNew1
                                                            name={"Email"}
                                                            type="text"
                                                            value={email}

                                                            setValue={setEmail}
                                                            readOnly={readOnly}
                                                            disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                        />

                                                    </div> */}




                      </div>
                    </div>
                  </div>


                </div>
                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200  h-[330px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Contact  Details</h3>
                    <div className="space-y-2">



                      <div className="grid grid-cols-2 gap-2">
                        <div className="">

                          <TextInputNew1
                            name="Contact Person Name"
                            type="text"
                            value={contactPersonName}

                            setValue={setContactPersonName}
                            readOnly={readOnly}
                            // disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                        </div>

                        <TextInputNew1
                          name="Designation"
                          type="text"
                          value={designation}

                          setValue={setDesignation}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                        <TextInputNew1
                          name="Department"
                          type="text"
                          value={department}

                          setValue={setDepartment}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                        <div className='col-span-1'>


                          <TextInputNew1
                            name="Email"
                            type="text"
                            value={contactPersonEmail}

                            setValue={setContactPersonEmail}
                            readOnly={readOnly}
                            // disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                        </div>
                        <div className='col-span-2'>

                          <TextInput
                            name="Contact Number"
                            value={contactNumber}
                            setValue={setContactNumber}

                            readOnly={readOnly}
                            // disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                        </div>
                        {/* <div className='col-span-1'>
                                                        <TextInputNew
                                                            name="Alternative Contact Number"
                                                            type="number"
                                                            value={alterContactNumber}
                                                            setValue={setAlterContactNumber}

                                                            // readOnly={readOnly}
                                                            // disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                        />
                                                    </div> */}







                      </div>
                    </div>
                  </div>


                </div>



                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[240px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Business Details</h3>
                    <div className="space-y-2">

                      <div className="grid grid-cols-2 gap-2">


                        {/* <DropdownInput
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
                                                    // lastTab={activeTab}
                                                    masterName="CURRENCY MASTER"
                                                    value={currency}
                                                    setValue={setCurrency}
                                                    readOnly={readOnly}
                                                    disabled={childRecord.current > 0}
                                                    className="focus:ring-2 focus:ring-blue-100"
                                                /> */}

                        {/* <DropdownInput
                                                    name="PayTerm"
                                                    options={dropDownListObject(
                                                        id
                                                            ? payTermList?.data
                                                            : payTermList?.data?.filter((item) => item.active),
                                                        "name",
                                                        "id"
                                                    )}
                                                    value={payTermDay}
                                                    setValue={setPayTermDay}
                                                    // required={true}
                                                    readOnly={readOnly}
                                                    disabled={childRecord.current > 0}
                                                    className="focus:ring-2 focus:ring-blue-100"
                                                /> */}
                        <TextInput
                          name="Pan No"
                          type="pan_no"
                          value={panNo}
                          setValue={setPanNo}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100"
                        />
                        <TextInput
                          name="GST No"
                          type="text"
                          value={gstNo}
                          setValue={setGstNo}
                          readOnly={readOnly || parentId || isBranch}
                          required={true}
                          disabled={parentId || isBranch}

                          className="focus:ring-2 focus:ring-blue-100"
                        />
                        <TextInput
                          name="MSME CERTFICATE  No"
                          type="text"
                          value={msmeNo}
                          setValue={setMsmeNo}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100"
                        />
                        <TextInput
                          name="CIN No"
                          type="text"
                          value={cinNo}
                          setValue={setCinNo}
                          readOnly={readOnly}
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


                      <TextInputNew1
                        name="Bank Name"
                        type="text"
                        value={bankname}

                        setValue={setBankName}
                        readOnly={readOnly}
                        // disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <TextInputNew1
                            name="Branch Name"
                            type="text"
                            value={bankBranchName}

                            setValue={setBankBranchName}
                            readOnly={readOnly}
                            // disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                        </div>

                        <TextInput
                          name="Account Number"
                          type="text"
                          value={accountNumber}

                          setValue={setAccountNumber}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                        <TextInput
                          name="IFSC CODE"
                          type="text"
                          value={ifscCode}

                          setValue={setIfscCode}
                          readOnly={readOnly}
                          // disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />



                      </div>
                    </div>
                  </div>


                </div>
                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200  h-[240px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Attachments</h3>



                    <div className="max-h-[200px] overflow-auto">
                      <div className="grid grid-cols-1 gap-3  border-collapse bg-[#F1F1F0]   shadow-sm overflow-auto">
                        <table className="bg-gray-200 text-gray-800 text-sm table-auto w-full">
                          <thead className=" py-2  font-medium  top-o sticky">
                            <tr>
                              <th className="py-2  text-xs  w-10 text-center border-r border-white/50">S.No</th>
                              {/* <th className="py-2  font-medium  w-24 text-center border-r border-white/50">Date</th> */}
                              {/* <th className="py-1 px-3 w-32 text-left border border-gray-400">User</th> */}
                              <th className="py-2  text-xs w-60 center border-white/50"> Name</th>
                              <th className="py-2  text-xs center w-60 border-r border-white/50">File</th>
                              <th className="py-2  text-xs  w-10 text-center">
                                Actions
                              </th>

                            </tr>
                          </thead>


                          <tbody>
                            {attachments?.map((item, index) => (
                              <tr
                                key={index}
                                className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                  }`}
                              >
                                <td className="border-r border-white/50 center h-8 text-center "
                                >
                                  {index + 1}
                                </td>


                                <td className=" border-r border-white/50' h-8 ">
                                  <input
                                    type="text"
                                    className="text-left rounded py-1 px-2 w-full  focus:outline-none focus:ring focus:border-blue-300"
                                    value={item?.name}
                                    onChange={(e) =>
                                      handleInputChange(e.target.value, index, "name")
                                    }

                                  />
                                </td>
                                <td className="border-r border-white/50 h-8">
                                  <div className="flex items-center gap-2">

                                    {/* Hidden File Input */}
                                    {!readOnly && !item.filePath && (
                                      <>
                                        <input
                                          type="file"
                                          id={`file-upload-${index}`}
                                          className="hidden"
                                          onChange={(e) => {
                                            if (e.target.files[0]) {
                                              handleInputChange(
                                                renameFile(e.target.files[0]),
                                                index,
                                                "filePath"
                                              );
                                            }
                                          }}
                                        />

                                        {/* Attach Icon */}
                                        <label
                                          htmlFor={`file-upload-${index}`}
                                          className="cursor-pointer flex items-center justify-center p-1 bg-gray-100 rounded hover:bg-gray-200"
                                          title="Attach file"
                                        >
                                          📎
                                        </label>
                                      </>
                                    )}

                                    {/* Show File + Actions */}
                                    {item.filePath && (
                                      <>
                                        <span className="truncate max-w-[120px]">
                                          {item.filePath?.name ?? item.filePath}
                                        </span>

                                        <button
                                          onClick={() => openPreview(item.filePath)}
                                          className="text-blue-600 text-xs hover:underline"
                                        >
                                          View
                                        </button>

                                        {!readOnly && (
                                          <button
                                            onClick={() => handleInputChange('', index, "filePath")}
                                            className="text-red-600 text-xs"
                                            title="Remove file"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </td>


                                <td className="w-[30px] border-gray-200 h-8">
                                  <div className="flex items-center justify-center gap-1">
                                    {/* Add Button */}
                                    <button
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          addNewComments();
                                        }
                                      }}
                                      onClick={addNewComments}
                                      className="flex items-center px-1 bg-blue-50 rounded"
                                    >
                                      <Plus size={18} className="text-blue-800" />
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      className="flex items-center px-1 bg-red-50 rounded"
                                      onClick={() => deleteRow(index)}
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-red-800"
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
                                  </div>
                                </td>




                              </tr>
                            ))}


                          </tbody>
                        </table>


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














