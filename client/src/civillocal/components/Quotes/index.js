import React, { useEffect, useState, useRef, useCallback } from 'react';
import secureLocalStorage from 'react-secure-storage';
import Modal from "../../../UiComponents/Modal";
import { PDFViewer } from '@react-pdf/renderer';
import FormHeader from '../../../Basic/components/FormHeader';
import { toast } from "react-toastify"
import { CheckBox, DropdownInput, TextArea, DisabledInput, DateInput, DropdownWithSearch, TextInput } from "../../../Inputs"
import PrintFormat from "./PrintFormat";
import axios from "axios";
import { push } from "../../../redux/features/opentabs";




import {
  useGetProductQuery,

} from '../../../redux/services/ProductMasterService'

import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { dropDownListObject } from '../../../Utils/contructObject';
import { findFromList, getDateFromDateTime, getPriceColumnFromPriceRange, priceWithTax, substract } from '../../../Utils/helper';
import { useGetPartyByIdQuery, useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { Loader } from '../../../Basic/components';
import { useGetStateQuery } from '../../../redux/services/StateMasterService';
import { useAddQuotesMutation, useDeleteQuotesMutation, useGetQuotesByIdQuery, useGetQuotesQuery, useUpdateQuotesMutation } from '../../../redux/services/QuotesService';
import { BELL_ICON, DELETE } from '../../../icons';
import QuotesBillForm from './QuotesBillForm';
import { salePriceRange } from '../../../Utils/DropdownData';
import QuoteTypeNewOrExistingProject from '../../ReusableComponents/QuoteTypeNewOrExistingProject';
import LeadDropdown from '../../ReusableComponents/LeadDropdown';
import ProjectDropdown from '../../ReusableComponents/ProjectDropdown';
import moment from 'moment';
import tw from "../../../Utils/tailwind-react-pdf";
import { useGetLeadQuery } from '../../../redux/services/LeadFormService';
import Consolidation from './Consolidation';
import { parse } from '@fortawesome/fontawesome-svg-core';
import PartySearchComponent from '../Leads/PartySearchComponent';
import ShippingAddressComponent from './ShippingAddressComponenet';
import { useDispatch } from 'react-redux';
import { ROLES_API, PAGES_API } from "../../../Api";
import { useGetPageGroupQuery } from '../../../redux/services/PageGroupMasterServices';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';



const BASE_URL = process.env.REACT_APP_SERVER_URL;
const MODEL = "Quotes";

export default function Form() {
  const today = new Date()
  const [transaction, setTransaction] = useState()
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("")
  const [active, setActive] = useState(true);
  const [quotesItems, setQuotesItems] = useState([])
  const [date, setDate] = useState(getDateFromDateTime(today));
  const [gstNo, setGstNo] = useState("");
  const [docId, setDocId] = useState("");
  const [formReport, setFormReport] = useState(false)
  const [priceRange, setPriceRange] = useState("")
  const [print, setPrint] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [validDate, setValidDate] = useState()
  const [clientId, setClientId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [termsAndCondition, setTermsAndCondition] = useState("")
  const [billingAddress, setBillingAddress] = useState("");
  const [isDifferAddress, setIsDifferAddress] = useState(false);
  const [billingId, setBillingId] = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [placeOfSupplyId, setPlaceOfSupplyId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [leadId, setLeadId] = useState("");
  const childRecord = useRef(0);
  const [shippingAddressId, setShippingAddressId] = useState("")
  const [addressData, setAddressData] = useState([])
  const [isTotalDiscount, setIsTotalDiscount] = useState(false)

  const [quoteVersion, setQuoteVersion] = useState("1");
  const [quoteType, setQuoteType] = useState("New");

  const [isNewVersion, setIsNewVersion] = useState(false);
  const [isIgst, setIsIgst] = useState(false)
  const [transportCost, setTransportCost] = useState("");
  const [transportTax, setTransportTax] = useState("");
  const [totalDiscount, setTotalDiscount] = useState("");
  const [navigateProjectId, setNavigateProjectId] = useState();
  const [allowedPages, setAllowedPages] = useState([]);
  const [projectCount, setProjectCount] = useState(0)
  const openTabs = useSelector((state) => state.openTabs);



  const dispatch = useDispatch()

  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )


  const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
  const { data: allData, isLoading, isFetching } = useGetQuotesQuery({ params: { branchId }, searchParams: searchValue });


  const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetQuotesByIdQuery(id, { skip: !id });

  const [addData] = useAddQuotesMutation();
  const [updateData] = useUpdateQuotesMutation();
  const [removeData] = useDeleteQuotesMutation();
  const { data: partyList } = useGetPartyQuery({ params })
  const { data: stateList } = useGetStateQuery({ params })
  const { data: productList } = useGetProductQuery({ params })

  const {
    data: singlePartyList,
    isSinglePartyFetching: isSinglePartyFetching,
    isSinglePartyLoading: isSinglePartyLoading,
  } = useGetPartyByIdQuery(clientId, { skip: !clientId });
  const { data: uomList } = useGetUomQuery({ params })
  const { data: pageGroup } = useGetPageGroupQuery({})



  function getNextDocId() {

    if (id || isLoading || isFetching) return
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
  }



  // const getNextDocId = useCallback(() => {
  //   if (id || isLoading || isFetching) return
  //   if (allData?.nextDocId) {
  //     setDocId(allData.nextDocId)
  //   }
  // }, [allData, isLoading, isFetching, id])

  // useEffect(getNextDocId, [getNextDocId])

  const syncFormWithDb = useCallback(
    (data) => {

      if (id) setReadOnly(true);
      if (data?.docId) {
        setDocId(data?.docId)
      }
      setActive(id ? (data?.active ? data.active : false) : true);
      setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
      setProjectName(data?.projectName ? data?.projectName : "")
      setClientId(data?.clientId ? data?.clientId : "");
      setBillingId(data?.billingId ? data?.billingId : "");
      setBillingAddress(data?.billingAddress ? data?.billingAddress : "")
      setPlaceOfSupplyId(data?.placeOfSupplyId ? data?.placeOfSupplyId : "")
      setValidDate(data?.validDate ? moment(data?.validDate).format("YYYY-MM-DD") : "")
      setIsTotalDiscount(id ? (data?.isTotalDiscount ? data?.isTotalDiscount : false) : false)
      setShippingAddress(data?.shippingAddress ? data?.shippingAddress : "");
      setQuotesItems(data?.QuotesItems ? data?.QuotesItems : []);
      setIsNewVersion(false);
      setQuoteVersion(data?.quoteVersion || 1);
      setPriceRange(data?.quoteVersion ? data?.QuoteVersion.find(i => parseInt(i.quoteVersion) === parseInt(data?.quoteVersion))?.priceRange : "STANDARD")
      setLeadId(data?.leadId ? data?.leadId : "");
      setQuoteType(data?.projectId ? "Existing" : "New");
      setProjectId(data?.projectId || "");
      setIsIgst(data?.isIgst ? data?.isIgst : false);
      setTransportCost(data?.transportCost ? data?.transportCost : "");
      setTransportTax(data?.transportTax ? data?.transportTax : "");
      setTotalDiscount(data?.totalDiscount ? data?.totalDiscount : "")
      setIsDifferAddress(id ? (data?.isDifferAddress ? data?.isDifferAddress : false) : false);
      setTermsAndCondition(data?.termsAndCondition ? data?.termsAndCondition : "")
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    }, [id])



  useEffect(() => {
    let data = singleData?.data
    setPriceRange(quoteVersion ? data?.QuoteVersion.find(i => parseInt(i.quoteVersion) === parseInt(quoteVersion))?.priceRange : "")
  }, [quoteVersion, singleData])

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])



  const data = {
    validDate, branchId, clientId, priceRange, isIgst, isDifferAddress, billingId, isTotalDiscount, projectName, termsAndCondition,
    placeOfSupplyId, billingAddress,
    isNewVersion,
    quotesItems: quotesItems.filter(item => item?.productId),
    companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), active, id,
    leadId, projectId,
    quoteType,
    quoteVersion, shippingAddress, totalDiscount, transportCost, transportTax
  }


  const validateData = (data) => {

    if (!data.clientId || !data.shippingAddress || !data?.placeOfSupplyId || !projectName) return false;
    if (quoteType === "New") {
      if (!data?.leadId) return false;
      else {
        return true;
      }
    }

    if (data.quotesItems.filter(i => data?.isNewVersion ? (i.quoteVersion === "New") : (i.quoteVersion === data.quoteVersion || i.quoteVersion === "New")).length === 0) return false;
    return true;
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
        let returnData = await removeData(id).unwrap();
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


  useEffect(() => {
    if (id) return
    let termsConditionData = allData?.data?.find(item => item.termsAndCondition != "")?.termsAndCondition
    setTermsAndCondition(termsConditionData)
  }, [allData, isFetching, isLoading])

  useEffect(() => {
    if (id) return

    setQuotesItems(prev => {
      if (prev.length >= 5) return prev
      let newArray = Array.from({ length: 5 - prev.length }, i => {
        return { productId: "", uomId: "", qty: "0", price: "0.00", discount: "0", amount: "0.000", quoteVersion: "New", description: "", hsnCode: "0", taxPercent: "0" }
      })
      return [...prev, ...newArray]
    }
    )
  }, [setQuotesItems, id, quotesItems])

  const onNew = () => {

    syncFormWithDb(undefined);
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
    setId("");
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    setBillingAddress("")
    setClientId("")
    let validDate = new Date();
    validDate.setDate(validDate.getDate() + 15)
    setValidDate(moment(validDate).format("YYYY-MM-DD"))

  }


  function handleProjectOpen() {
    dispatch(push(
      {
        active: true,
        id: 65,
        name: "PROJECT",
        projectId: projectCount,
        projectForm: true,
      }

    ));
  }

  useEffect(() => {
    if (projectCount == 0) return
    handleProjectOpen();
  }, [projectCount]);

  const projectOpen = () => {

    setProjectCount(singleData?.data?.projectId)

  }


  useEffect(() => {
    if (id) return
    let validDate = new Date();
    validDate.setDate(validDate.getDate() + 15)
    setValidDate(moment(validDate).format("YYYY-MM-DD"))
  }, [setValidDate, id])


  useEffect(() => {

    let isIgst = singlePartyList?.data?.gstNo ? singlePartyList?.data?.gstNo.slice(0, 2) : ""
    if (isIgst !== "33" && isIgst !== "") {
      setIsIgst(true)
    }
    else if (isIgst === "33") {
      setIsIgst(false)
    }
    else {
      setIsIgst(false)
    }

    setGstNo(singlePartyList?.data?.gstNo ? singlePartyList?.data?.gstNo : "")

  }, [singlePartyList, setGstNo])


  function addNewRow() {
    setQuotesItems(prev => [
      ...prev,
      { productId: "", uomId: "", qty: "0", price: "0.00", discount: "0", amount: "0.000", quoteVersion: "New", description: "", hsnCode: "0", taxPercent: "0" }
    ]);
  }

  function deleteRow(index) {
    setQuotesItems(prev => prev.filter((_, i) => i !== index))
  }

  function handleInputChange(value, index, field) {
    const newBlend = structuredClone(quotesItems);
    const currentProductData = productList?.data ? productList?.data.find(item => parseInt(item.id) === parseInt(value)) : []
    if (field == "productId") {
      newBlend[index][field] = value;
      newBlend[index]["price"] = currentProductData?.price || 0
      newBlend[index]["description"] = currentProductData?.description || ""
      newBlend[index]["hsnCode"] = currentProductData?.hsnCode || ""
      newBlend[index]["uomId"] = currentProductData?.uomId || 0
      newBlend[index]["taxPercent"] = currentProductData?.taxPercent || ""
    }
    newBlend[index][field] = value;

    setQuotesItems(newBlend);
  };

  useEffect(() => {
    if (!isNewVersion) return
    setQuotesItems(prev => {
      let newPrev = structuredClone(prev);
      return [...newPrev.filter(i => i.quoteVersion !== "New"), ...newPrev.filter(i => parseInt(i.quoteVersion) === parseInt(quoteVersion)).map(i => ({ ...i, quoteVersion: "New" }))]
    })
  }, [isNewVersion, quoteVersion])

  useEffect(() => {
    const products = productList?.data || [];
    setQuotesItems(prev => {
      if (id) {
        return prev.map(i => {
          if ((i.quoteVersion === "New")) {
            let product = products.find(p => parseInt(p.id) === parseInt(i.productId))
            let productPurchasePrice = (product?.price || 0);
            let pricePercent = (product?.[getPriceColumnFromPriceRange(priceRange)] || 0);
            const productPrice = priceWithTax(pricePercent, productPurchasePrice);
            return { ...i, price: productPrice }
          }
          return i;
        })
      } else {
        return prev.map(i => {
          let product = products.find(p => parseInt(p.id) === parseInt(i.productId))
          let productPurchasePrice = (product?.price || 0);
          let pricePercent = (product?.[getPriceColumnFromPriceRange(priceRange)] || 0);
          const productPrice = priceWithTax(pricePercent, productPurchasePrice);
          return { ...i, price: productPrice }
        })
      }
    })
  }, [quoteVersion, productList, priceRange, id])

  useEffect(() => {
    if (!clientId) return
    if (isDifferAddress) {
      let Data = partyList?.data?.find(val => parseInt(val.id) === parseInt(billingId))?.ShippingAddress
      setAddressData(Data)
    }
    else {
      let Data = partyList?.data?.find(val => parseInt(val.id) === parseInt(clientId))?.ShippingAddress
      setAddressData(Data)
    }
  }, [clientId, partyList, setAddressData, billingId, isDifferAddress])


  useEffect(() => {
    if (!clientId) return
    if (id) return
    let address = singleData?.data ? singleData?.data.billingAddress : partyList?.data?.find(item => parseInt(item.id) === parseInt(clientId))?.address
    let shippingAdd = singleData?.data ? singleData?.data.shippingAddressId : partyList?.data?.find(item => parseInt(item.id) === parseInt(clientId))?.address || ""
    setBillingAddress(address)
    if (isDifferAddress && (!id)) {
      setBillingId()
      setShippingAddress("");

    }
    else {

      setBillingId(clientId)
      setShippingAddress(shippingAdd)


    }
  }, [partyList, singleData, isDifferAddress, setBillingId, setShippingAddress, setBillingAddress, clientId])


  useEffect(() => {
    if (!billingId) return
    let shippingAdd = singleData?.data ? singleData?.data.shippingAddress : partyList?.data?.find(item => parseInt(item.id) === parseInt(billingId))?.ShippingAddress[0]?.address || []
    if (isDifferAddress) {
      setShippingAddress(shippingAdd)
    }
    return

  }, [billingId])


  useEffect(() => {
    let PercentageAmount
    let findTotalPrice
    let totDis = totalDiscount.includes("%")
    if (id) {
      findTotalPrice = quotesItems?.filter(item => isNewVersion ? (item.quoteVersion === "New") : (item.quoteVersion == quoteVersion))?.reduce((a, b) => a + (parseFloat(b.qty) * parseFloat(b.price)) + ((parseFloat(b.qty) * parseFloat(b.price)) * (calGst(b.id) / 100)), 0)

    }
    else {
      findTotalPrice = quotesItems?.filter(item => item.quoteVersion === "New")?.reduce((a, b) => a + (parseFloat(b.qty) * parseFloat(b.price)) + ((parseFloat(b.qty) * parseFloat(b.price)) * ((b.taxPercent ? b.taxPercent.replace("%", "") : 0) / 100)), 0)

    }
    if (totDis) {
      PercentageAmount = totalDiscount?.replace("%", "")
    }

    if ((totalDiscount && !totDis)) {
      PercentageAmount = findPercent(findTotalPrice, totalDiscount)
      PercentageAmount = parseFloat(PercentageAmount)
    }



    setQuotesItems(prev => {
      let newObj = structuredClone(prev)

      if (id) {
        newObj = newObj?.filter(item => isNewVersion ? (item.quoteVersion === "New") : (item.quoteVersion == quoteVersion))
        let oldObj = prev?.filter(item => isNewVersion ? (item.quoteVersion !== "New") : (item.quoteVersion != quoteVersion))
        for (let index = 0; index < newObj.length; index++) {
          let item = newObj[index]
          let amount = (parseFloat(item["qty"]) * parseFloat(item["price"])) + (parseFloat(item["qty"]) * parseFloat(item["price"])) * (calGst(item["id"]) / 100)
          newObj[index]["discount"] = parseFloat(amount * ((PercentageAmount || 0) / 100)).toFixed(2)

        }
        return [...newObj, ...oldObj]

      }
      else if (!id) {
        let array = newObj?.filter(item => item.quoteVersion === "New")

        for (let index = 0; index < array.length; index++) {
          let item = array[index]
          let amount = (parseFloat(item["qty"]) * parseFloat(item["price"])) + ((parseFloat(item["qty"]) * parseFloat(item["price"])) * (calcGst(index, array) / 100))

          array[index]["discount"] = parseFloat(amount * ((PercentageAmount || 0) / 100)).toFixed(2)

        }
        return newObj = array
      }

    })
  }, [setTotalDiscount, totalDiscount])

  function onDataClick(id) {
    // setId(id);
    onNew();
    setForm(true);
  }

  function findPercent(totalAmount, totalDiscount) {
    let Percentage = ((totalDiscount) / (totalAmount)) * 100
    Percentage = parseFloat(Percentage)
    return parseFloat(Percentage)
  }


  const calculateGst = (index) => {
    return quotesItems[index]["taxPercent"] ? quotesItems[index]["taxPercent"]?.replace("%", "") : 0
  }

  const calGst = (id) => {
    let taxPercent = quotesItems?.find(val => parseInt(val.id) === parseInt(id))?.taxPercent
    return taxPercent ? taxPercent.replace("%", "") : 0;
  }
  const calcGst = (index, array) => {

    return array[index]["taxPercent"] ? array[index]["taxPercent"]?.replace("%", "") : 0
  }

  function findTotalAmount() {
    let totalCost;
    let transportTaxValue;
    if (id) {
      totalCost = quotesItems?.filter(item => isNewVersion ? (item.quoteVersion === "New") : (item.quoteVersion == quoteVersion))
    }
    else {

      totalCost = quotesItems?.filter(item => (item.quoteVersion === "New" && item?.qty && item?.price))
    }

    totalCost = totalCost?.reduce((a, b, index) => a + ((substract(parseFloat(b.qty) * parseFloat(b.price), parseFloat(b?.discount || 0))) + ((parseFloat(b.qty) * parseFloat(b.price)) * ((b.taxPercent ? b.taxPercent.replace("%", "") : 0) / 100))), 0)



    if (transportTax?.includes("%")) {
      transportTaxValue = transportCost * (transportTax.replace("%", "") / 100)

    }
    else {
      transportTaxValue = transportCost * (transportTax / 100)
    }

    totalCost = totalCost + parseInt(transportCost || 0) + parseInt(transportTaxValue || 0)

    return totalCost
  }

  const isLoadingIndicator = (!productList || !partyList || !uomList)

  if (!form)
    return (
      <QuotesBillForm

        onClick={(id) => { setId(id); setForm(true) }}
        onNew={onNew}

        onNewButton={true}

      />

    );


  let count = 1;
  return (
    <>
      <div onKeyDown={handleKeyDown} className='md:items-start md:justify-items-center grid h-full bg-theme'>

        <Modal

          isOpen={formReport}
          onClose={() => setFormReport(false)}
          widthClass={"px-2 h-[90%] w-[90%]"}

        >
          <QuotesBillForm onClick={(id) => { setId(id); setFormReport(false) }} onNewButton={false} />
        </Modal>
        <Modal isOpen={print} onClose={() => { setPrint(false) }} widthClass={"w-[90%] h-[90%]"} >
          <PDFViewer style={tw("w-full h-full")}>
            <PrintFormat data={singleData?.data} isIgst={singlePartyList?.data?.isIgst} stateList={stateList || []} quoteVersion={quoteVersion} />
          </PDFViewer>
        </Modal>
        <div className='flex flex-col frame w-full h-full'>
          <FormHeader
            setNavigateProjectId={setNavigateProjectId}
            quotesData={singleData?.data}
            projectOpen={projectOpen}
            onNew={onNew}
            model={MODEL}
            onClose={() => {
              setForm(false);
              setSearchValue("");


            }}
            onClick={onDataClick}
            openReport={() => setFormReport(true)}
            saveData={saveData}
            setReadOnly={setReadOnly}
            deleteData={deleteData}
            onPrint={id ? () => setPrint(true) : null}
          />
          <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
            <div className='col-span-4 grid md:grid-cols-1 border overflow-auto'>
              <div className='mr-1 md:ml-2'>
                <fieldset className='frame my-1'>
                  <legend className='sub-heading'>Product Info</legend>
                  <div className='grid grid-cols-3 my-2'>
                    <DisabledInput name="Quote No." value={docId} required={true} readOnly={readOnly} />
                    <DisabledInput name="Quote 
                           Date" value={date} type={"Date"} required={true} readOnly={readOnly} />
                    <PartySearchComponent setPartyId={setClientId} partyId={clientId} name={"Client Name"} />
                    <TextInput name={"Project.Name"} value={projectName} setValue={setProjectName} className={"w-full"} readOnly={readOnly} />

                    <DisabledInput name="GST.NO" value={gstNo} required={true} readOnly={false} />


                    {/* <DropdownInput name="Client" options={dropDownListObject(id ? partyList?.data?.filter(item => item.isClient) : partyList?.data.filter(item => item.active && item.isClient), "name", "id")} value={clientId} setValue={setClientId} required={true} readOnly={readOnly} /> */}
                    <QuoteTypeNewOrExistingProject value={quoteType} setValue={setQuoteType} readOnly={readOnly} />
                    {quoteType === "New"
                      ?
                      <LeadDropdown clientId={clientId} readOnly={readOnly} status="Leads" multiSelect={false} withoutLabel={false} name={"Lead"} selected={leadId} setSelected={setLeadId} id={id} singleData={singleData} />
                      :
                      <>
                        <LeadDropdown clientId={clientId} readOnly={readOnly} status="Leads" multiSelect={false} withoutLabel={false} name={"Lead"} selected={leadId} setSelected={setLeadId} id={id} singleData={singleData} />
                        <ProjectDropdown readOnly={readOnly} clientId={clientId} multiSelect={false} withoutLabel={false} name={"Project"} selected={projectId} setSelected={setProjectId} />

                      </>
                    }
                    <DateInput name="Valid Until" value={validDate} setValue={setValidDate} readOnly={readOnly} />
                    <DropdownInput name="Place Of Supply" options={dropDownListObject(id ? stateList?.data : stateList?.data?.filter(item => item.active), "name", "id" || [])} value={placeOfSupplyId} setValue={setPlaceOfSupplyId} required={true} readOnly={readOnly} />
                    <DropdownInput name="Price Range" options={salePriceRange} value={priceRange} setValue={setPriceRange} required={true} readOnly={id ? !isNewVersion : readOnly} disabled={(childRecord.current > 0)} />
                    {id &&
                      <>
                        <DropdownInput readOnly={readOnly} name="Current Version" value={quoteVersion} setValue={(value) => setQuoteVersion(value)} clear={false}
                          options={[...new Set(quotesItems.filter(i => i?.quoteVersion !== "New").map(i => i.quoteVersion))].map(i => ({ show: i, value: i }))} />
                        {!readOnly
                          &&
                          <CheckBox name="New Version" value={isNewVersion} setValue={setIsNewVersion} readOnly={readOnly} />
                        }
                      </>
                    }
                    {
                      isDifferAddress &&
                      <PartySearchComponent setPartyId={setBillingId} partyId={billingId} name={"Shipping.Cl.Name"} />

                    }

                    {/* <DropdownInput name="ShippingAddress" options={dropDownListObject(addressData ? addressData : [], "address", "address")} value={shippingAddressId} setValue={setShippingAddressId} readOnly={readOnly} />{console.log(shippingAddressId, "shippingAddressId")} */}




                    <TextArea autoFocus name={"Billing Address"} value={billingAddress} setValue={setBillingAddress} className={""} />
                    <ShippingAddressComponent shippingAddress={shippingAddress} setShippingAddress={setShippingAddress} name={"Shipping Address"} clientId={clientId} isDifferAddress={isDifferAddress} billingId={billingId} />

                    <CheckBox name="is Total Discount" value={isTotalDiscount} setValue={setIsTotalDiscount} readOnly={readOnly} />
                    <CheckBox name="Billing & Shipping Are Differ" value={isDifferAddress} setValue={setIsDifferAddress} readOnly={readOnly} />

                  </div>
                </fieldset>
                <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 w-full border border-gray-400 md:pb-5 flex flex-1 overflow-auto h-full'>
                  <legend className='sub-heading'>Quote Details</legend>
                  <div className={` relative w-full overflow-y-auto py-1 h-full`}>
                    <table className=" border border-gray-500 text-xs table-auto w-full">
                      <thead className='bg-blue-200 top-0 border-b border-gray-500'>
                        <tr className=''>
                          <th className="table-data  w-12 text-center p-0.5">S.no</th>
                          <th className="table-data">Product Name<span className="text-red-500 p-5">*</span></th>
                          <th className="table-data">Description</th>
                          <th className="table-data">Hsn</th>

                          <th className="table-data w-16">Uom</th>
                          <th className="table-data  w-16">Qty</th>
                          <th className="table-data  w-20">Price</th>

                          <th className="table-data  w-16 p-0.5">Taxable.Amount</th>
                          <th className="table-data  w-16 p-0.5">Tax Percent %</th>

                          {
                            isIgst ?

                              <th className="table-data  w-20">IGST</th>
                              :
                              <>
                                <th className="table-data  w-20">CGST</th>
                                <th className="table-data  w-20">SGST</th>
                              </>
                          }
                          <th className="table-data  w-20">Discount</th>


                          <th className="table-data  w-20">Amount</th>

                          {!(id ? !(isNewVersion) : readOnly) &&
                            <th className="table-data  w-16 p-0.5" onClick={addNewRow} >  <span className='text-2xl' >+</span></th>
                          }
                        </tr>
                      </thead>

                      <tbody className='overflow-y-auto h-full w-full'>
                        {(quotesItems || []).map((item, index) =>
                          (id ? (isNewVersion ? (item.quoteVersion === "New") : (parseInt(item.quoteVersion) === parseInt(quoteVersion))) : (true)) ?
                            <tr key={index} className={`w-full table-row`}>
                              <td className="table-data w-7 text-left px-1 py-1">
                                {count++}
                              </td>
                              <td className='table-data w-32'>
                                <DropdownWithSearch value={item.productId}
                                  readOnly={id ? !(isNewVersion) : readOnly}
                                  setValue={(value) => handleInputChange(value, index, "productId")}
                                  options={productList?.data?.filter(item => item?.active)} />


                              </td>
                              <td className="table-data w-48 overflow-auto text-left px-1 py-1">
                                <textarea className=" w-full h-24 overflow-auto focus:outline-none border border-gray-500 rounded p-2 text-xs"
                                  value={item.description}
                                  disabled={id ? !(isNewVersion) : readOnly}
                                  onChange={(e) => handleInputChange(e.target.value, index, "description")}
                                >
                                </textarea>
                              </td>

                              <td className='table-data w-16 text-right px-1'>
                                <input
                                  type="number"
                                  className="text-right rounded py-1 px-1 w-full  table-data-input border border-gray-400"
                                  value={item?.hsnCode == "0" ? '' : item?.hsnCode}
                                  disabled={id ? !(isNewVersion) : readOnly}
                                  onChange={(e) =>
                                    handleInputChange(e.target.value, index, "hsnCode")
                                  }
                                  onBlur={(e) => {
                                    handleInputChange(e.target.value, index, "hsnCode");
                                  }
                                  }
                                />


                              </td>
                              <td className='table-data w-16'>

                                <select
                                  disabled={id ? !(isNewVersion) : readOnly}
                                  onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                  className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                                  value={item.uomId}
                                  onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                                >
                                  <option className='text-gray-600'>
                                  </option>
                                  {(uomList?.data ? uomList?.data : []).map((uom) =>
                                    <option value={uom.id} key={uom.id}>
                                      {uom.name}
                                    </option>
                                  )}
                                </select>
                              </td>

                              <td className='table-data'>
                                <input
                                  type="number"
                                  className="text-right rounded py-1 px-1 w-full  table-data-input border border-gray-400"
                                  value={item.qty == 0 ? '' : item.qty}
                                  disabled={id ? !(isNewVersion) : readOnly}
                                  onChange={(e) =>
                                    handleInputChange(e.target.value, index, "qty")
                                  }

                                />
                              </td>

                              <td className='table-data text-right px-1'>

                                <input
                                  type="number"
                                  className="text-right rounded py-1 px-1 w-full  table-data-input border border-gray-400"
                                  value={item?.price == 0 ? '' : item?.price}
                                  disabled={id ? !(isNewVersion) : readOnly}
                                  onChange={(e) =>
                                    handleInputChange(e.target.value, index, "price")
                                  }
                                  onBlur={(e) => {
                                    handleInputChange(parseFloat(e.target.value).toFixed(2), index, "price");
                                  }
                                  }
                                />
                              </td>

                              <td className='table-data'>
                                <input
                                  type="number"
                                  className="text-right rounded py-1 px-1 w-full table-data-input"
                                  value={(!item.qty || !item.price) ? 0 : (parseFloat(parseFloat(item.qty) * parseFloat(item.price)).toFixed(2) || 0)}
                                  disabled
                                />
                              </td>
                              <td className='table-data'>
                                <input
                                  type="number"
                                  disabled={id ? !(isNewVersion) : readOnly}
                                  className="text-right rounded py-1 px-1 w-full table-data-input"
                                  value={item.taxPercent ? item.taxPercent.replace("%", "") : ""}
                                  onChange={(e) =>
                                    handleInputChange(e.target.value, index, "taxPercent")
                                  }
                                  onBlur={(e) => {
                                    handleInputChange(e.target.value, index, "taxPercent");
                                  }
                                  }
                                />
                              </td>


                              {
                                isIgst ?


                                  <td className='table-data text-right px-1'>
                                    {(!item.qty || !item.price) ? 0 : (parseFloat((parseFloat(item.qty) * parseFloat(item.price)) * (calculateGst(index) / 100)).toFixed(2) || 0)}
                                  </td>

                                  :
                                  <>
                                    <td className='table-data text-right px-1'>
                                      {(!item.qty || !item.price) ? 0 : (parseFloat((parseFloat(item.qty) * parseFloat(item.price)) * ((calculateGst(index) / 2) / 100)).toFixed(2) || 0)}
                                    </td>

                                    <td className='table-data text-right px-1'>
                                      {(!item.qty || !item.price) ? 0 : (parseFloat((parseFloat(item.qty) * parseFloat(item.price)) * ((calculateGst(index) / 2) / 100)).toFixed(2) || 0)}
                                    </td>

                                  </>
                              }

                              <td className='table-data'>
                                <input
                                  type="number"
                                  className="text-right rounded py-1 px-1 w-full table-data-input border border-gray-400"
                                  value={item.discount == 0 ? '' : item.discount}
                                  disabled={id ? (isNewVersion && !isTotalDiscount) ? false : true : (!readOnly && !isTotalDiscount) ? false : true}
                                  onChange={(e) =>
                                    handleInputChange(e.target.value, index, "discount")
                                  }
                                  onBlur={(e) => {

                                    handleInputChange(e.target.value, index, "discount");

                                  }
                                  }
                                />
                              </td>

                              <td className='table-data'>
                                <input
                                  type="number"
                                  className="text-right rounded py-1 px-1 w-full table-data-input"
                                  value={(!item.qty || !item.price) ? 0 : parseFloat(substract(parseFloat(item.qty) * parseFloat(item.price), parseFloat(item?.discount || 0)) + ((parseFloat(item.qty) * parseFloat(item.price)) * (calculateGst(index) / 100))).toFixed(2) || 0}
                                  disabled
                                />
                              </td>


                              {!(id ? !(isNewVersion) : readOnly) &&
                                <td className="border border-gray-500 text-xs text-center">
                                  <button
                                    type='button'
                                    onClick={() => {
                                      deleteRow(index)
                                    }}
                                    className='text-xs text-red-600 '>{DELETE}
                                  </button>
                                </td>
                              }
                            </tr>
                            : <></>
                        )}

                      </tbody>

                    </table>
                  </div>

                </fieldset>

              </div>

            </div>
          </div>
        </div>

      </div>
      <div className='mt-24'>
        <Consolidation transportCost={transportCost} setTransportCost={setTransportCost} setTotalDiscount={setTotalDiscount} totalDiscount={totalDiscount} findTotalAmount={findTotalAmount} readOnly={readOnly} isTotalDiscount={isTotalDiscount} setTransportTax={setTransportTax} transportTax={transportTax} termsAndCondition={termsAndCondition} setTermsAndCondition={setTermsAndCondition} />

      </div>
    </>
  )
}
