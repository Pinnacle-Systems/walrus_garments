import React, { useEffect, useState, useRef, useCallback } from 'react';
import secureLocalStorage from 'react-secure-storage';
import Modal from "../../../UiComponents/Modal";
import { PDFViewer } from '@react-pdf/renderer';
import FormHeader from '../../../Basic/components/FormHeader';
import { toast } from "react-toastify"
import { CheckBox, DropdownInput, TextArea, DisabledInput, DateInput, DropdownWithSearch, TextInput } from "../../../Inputs"
import PrintFormat from "./PrintFormat";
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { dropDownListObject } from '../../../Utils/contructObject';
import { findFromList, getDateFromDateTime, getPriceColumnFromPriceRange, priceWithTax, substract } from '../../../Utils/helper';
import { useGetPartyByIdQuery, useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { Loader } from '../../../Basic/components';
import { useGetStateQuery } from '../../../redux/services/StateMasterService';
import QuotesBillForm from './QuotesBillForm';
import tw from "../../../Utils/tailwind-react-pdf";
import { useGetProjectByIdQuery, useGetProjectQuery } from '../../../redux/services/ProjectService';
import LineItems from './LineItems';
import ProjectItems from './ProjectItems';
import { useAddInvoiceMutation, useDeleteInvoiceMutation, useGetInvoiceByIdQuery, useGetInvoiceQuery, useUpdateInvoiceMutation } from '../../../redux/services/InvoiceService';
import InvoiceBillForm from './InvoiceBillForm';
import ProformaInvoice from './ProformaInvoice';
import PartySearchOnly from '../Project/PartySearchOnly';




const MODEL = "Invoice";

export default function Form() {
  const today = new Date()

  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("")
  const [active, setActive] = useState(true);
  const [quotesItems, setQuotesItems] = useState([])
  const [lineItems, setLineItems] = useState([])
  const [date, setDate] = useState(getDateFromDateTime(today));
  const [docId, setDocId] = useState("");
  const [formReport, setFormReport] = useState(false);
  const [profomaInvoice, setProfomaInvoice] = useState(false)

  const [print, setPrint] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [clientId, setClientId] = useState("");

  const [projectId, setProjectId] = useState("");

  const [isOpenProjectItems, setIsOpenProjectItems] = useState(false)
  const childRecord = useRef(0);
  const [ewayBillNo, setEwayBillNo] = useState("")



  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )


  const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
  const { data: allData, isLoading, isFetching } = useGetInvoiceQuery({ params: { branchId }, searchParams: searchValue });


  const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetInvoiceByIdQuery(id, { skip: !id });

  const [addData] = useAddInvoiceMutation();
  const [updateData] = useUpdateInvoiceMutation();
  const [removeData] = useDeleteInvoiceMutation();

  const { data: partyList } = useGetPartyQuery({ params })
  const { data: stateList } = useGetStateQuery({ params })

  const { data: uomList } = useGetUomQuery({ params })

  const { data: projectData } = useGetProjectQuery({ params: { branchId } });

  const {
    data: singlePartyList,
    isSinglePartyFetching: isSinglePartyFetching,
    isSinglePartyLoading: isSinglePartyLoading,
  } = useGetPartyByIdQuery(clientId, { skip: !clientId });

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
      setClientId(data?.clientId ? data?.clientId : "");
      setLineItems(data?.InvoiceItems ? data.InvoiceItems : []);
      setProjectId(data?.projectId || "");
      setEwayBillNo(data?.ewayBillNo || "");
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    }, [id])

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


  const data = {
    branchId, clientId,
    invoiceItems: lineItems,
    companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), active,
    projectId, id,
    ewayBillNo
  }




  const validateData = (data) => {
    if (!data.clientId && !data?.projectId) return false;
    if (lineItems?.length === 0) return false;
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

  const onNew = () => {
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
    setId("");
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    setProjectId("");
    setClientId("");
    setLineItems([]);
    syncFormWithDb(undefined)
  }

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }


  // useEffect(() => {
  //   if (!projectId) return
  //   let clientId = projectData?.data.find(val => parseInt(val.id) === parseInt(projectId))?.Client?.id

  //   setClientId(clientId)
  // }, [setClientId, projectData, projectId])







  // useEffect(() => {
  //   if (id) return
  //   setQuotesItems(prev => {
  //     if (prev.length >= 5) return prev
  //     let newArray = Array.from({ length: 5 - prev.length }, i => {
  //       return { productId: "", uomId: "", qty: "0", price: "0.00", discount: "0", amount: "0.000", quoteVersion: "New", description: "", hsnCode: "0", taxPercent: "0" }
  //     })
  //     return [...prev, ...newArray]
  //   }
  //   )
  // }, [setQuotesItems, id])

  // useEffect(() => {
  //   if (!isNewVersion) return
  //   setQuotesItems(prev => {
  //     let newPrev = structuredClone(prev);
  //     return [...newPrev.filter(i => i.quoteVersion !== "New"), ...newPrev.filter(i => parseInt(i.quoteVersion) === parseInt(quoteVersion)).map(i => ({ ...i, quoteVersion: "New" }))]
  //   })
  // }, [isNewVersion, quoteVersion])

  // useEffect(() => {
  //   const products = productList?.data || [];
  //   setQuotesItems(prev => {
  //     if (id) {
  //       return prev.map(i => {
  //         if ((i.quoteVersion === "New")) {
  //           let product = products.find(p => parseInt(p.id) === parseInt(i.productId))
  //           let productPurchasePrice = (product?.price || 0);
  //           let pricePercent = (product?.[getPriceColumnFromPriceRange(priceRange)] || 0);
  //           const productPrice = priceWithTax(pricePercent, productPurchasePrice);
  //           return { ...i, price: productPrice }
  //         }
  //         return i;
  //       })
  //     } else {
  //       return prev.map(i => {
  //         let product = products.find(p => parseInt(p.id) === parseInt(i.productId))
  //         let productPurchasePrice = (product?.price || 0);
  //         let pricePercent = (product?.[getPriceColumnFromPriceRange(priceRange)] || 0);
  //         const productPrice = priceWithTax(pricePercent, productPurchasePrice);
  //         return { ...i, price: productPrice }
  //       })
  //     }
  //   })
  // }, [quoteVersion, productList, priceRange, id])


  if (!partyList || !uomList || !stateList) return <Loader />




  let count = 1;
  return (
    <div onKeyDown={handleKeyDown} className='md:items-start md:justify-items-center grid h-full bg-theme'>

      <Modal

        isOpen={formReport}
        onClose={() => setFormReport(false)}
        widthClass={"px-2 h-[90%] w-[90%]"}

      >
        <InvoiceBillForm onClick={(id) => { setId(id); setFormReport(false) }} />
      </Modal>


      <Modal

        isOpen={isOpenProjectItems}
        onClose={() => setIsOpenProjectItems(false)}
        widthClass={"px-2 h-[90%] w-[90%]"}

      >
        <ProjectItems lineItems={lineItems} setLineItems={setLineItems} quotesItems={quotesItems} setQuotesItems={setQuotesItems} clientId={clientId} readOnly={readOnly} projectId={projectId} onClick={(id) => { setIsOpenProjectItems(false) }} id={id} />
      </Modal>

      <Modal isOpen={print} onClose={() => { setPrint(false) }} widthClass={"w-[90%] h-[90%]"} >
        <PDFViewer style={tw("w-full h-full")}>
          <PrintFormat data={singleData?.data} isIgst={singlePartyList?.data?.isIgst} stateList={stateList} />
        </PDFViewer>
      </Modal>
      {
        id &&
        <Modal isOpen={profomaInvoice} onClose={() => { setProfomaInvoice(false) }} widthClass={"w-[90%] h-[90%]"} >
          <PDFViewer style={tw("w-full h-full")}>
            <ProformaInvoice data={singleData?.data} isIgst={singlePartyList?.data?.isIgst} stateList={stateList} />
          </PDFViewer>
        </Modal>
      }


      <div className='flex flex-col frame w-full h-full'>
        <FormHeader
          onNew={onNew}
          model={MODEL}
          openReport={() => setFormReport(true)}
          saveData={saveData} setReadOnly={setReadOnly}
          deleteData={deleteData}
          onPrint={id ? () => setPrint(true) : null}
        />
        <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
          <div className='col-span-4 grid md:grid-cols-1 border overflow-auto'>
            <div className='mr-1 md:ml-2'>
              <fieldset className='frame my-1'>
                <legend className='sub-heading'>Product Info</legend>
                <div className='grid grid-cols-3 my-2'>
                  <DisabledInput name="Invoice No." value={docId} required={true} readOnly={readOnly} />
                  <DisabledInput name="Invoice 
                           Date" value={date} type={"Date"} required={true} readOnly={readOnly} />
                  <TextInput name="E-Way Bill No" value={ewayBillNo} setValue={setEwayBillNo} readOnly={readOnly} />
                </div>
                <div className='grid grid-cols-3 my-2 '>
                  <div>
                    <PartySearchOnly setPartyId={setClientId} partyId={clientId} name={"Client Name"} />

                  </div>

                  {/* <DropdownInput name="Client" options={dropDownListObject(id ? partyList?.data?.filter(item => item.isClient) : partyList?.data.filter(item => item.active && item.isClient), "name", "id")} value={clientId} setValue={setClientId} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} /> */}
                  <div>
                    <DropdownInput name="Project" options={dropDownListObject(projectData?.data ? projectData?.data?.filter(val => parseInt(val.clientId) === parseInt(clientId)) : [], "docId", "id")} value={projectId} setValue={setProjectId} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                  </div>



                  <div className="">
                    <button
                      type='button' className={`text-white bg-blue-600 rounded-md p-1 w-24 mr-5 mb-5`}
                      onClick={() => {
                        setIsOpenProjectItems(true)

                      }}

                    > Select
                    </button>

                    <button className="bg-green-600 text-white rounded-md p-1 w-32 text-xs"
                      onClick={() => {
                        setProfomaInvoice(true)
                      }}
                    >Profoma Invoice</button>
                  </div>
                </div>
              </fieldset>
              <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 w-full border border-gray-400 md:pb-5 flex flex-1 overflow-auto'>
                <legend className='sub-heading'>LineItems Details</legend>
                <div className={` relative w-full overflow-y-auto py-1`}>
                  <LineItems lineItems={lineItems} setLineItems={setLineItems} clientId={clientId} readOnly={readOnly} projectId={projectId} />
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
