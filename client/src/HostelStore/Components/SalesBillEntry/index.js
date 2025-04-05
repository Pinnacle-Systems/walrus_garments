import React, { useEffect, useState, useRef, useCallback } from 'react';
import secureLocalStorage from 'react-secure-storage';

import FormHeader from '../../../Basic/components/FormHeader';
import { toast } from "react-toastify"
import { TextInput, CheckBox, DropdownInput, DisabledInput, LongDisabledInput, DateInput } from "../../../Inputs"
import ReportTemplate from '../../../Basic/components/ReportTemplate';
import { RetailPrintFormatFinishedGoodsSales } from "..";
import {
  useGetSalesBillQuery,
  useGetSalesBillByIdQuery,
  useAddSalesBillMutation,
  useUpdateSalesBillMutation,
  useDeleteSalesBillMutation,
} from '../../../redux/services/SalesBillService'

import { getDateFromDateTime, isGridDatasValid } from '../../../Utils/helper';
import { useGetPartyByIdQuery, useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import PoBillItems from './PoBillItems';
import Modal from "../../../UiComponents/Modal";
import PurchaseBillFormReport from './PurchaseBillFormReport';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { useReactToPrint } from '@etsoo/reactprint';
const MODEL = "Sales Bill Entry";

export default function Form() {
  const today = new Date()
  const [form, setForm] = useState(true);
  const [date, setDate] = useState(getDateFromDateTime(today));
  const [docId, setDocId] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [place, setPlace] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [formReport, setFormReport] = useState(false)

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");

  const [active, setActive] = useState(false);
  const [fillGrid, setFillGrid] = useState(false);

  const [text, setText] = useState('')
  const [searchValue, setSearchValue] = useState("");
  const [poBillItems, setPoBillItems] = useState([])
  const [purchaseMaterials, setPurchaseMaterials] = useState([])
  const childRecord = useRef(0);


  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: docId,
    pageStyle: ``
  })



  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )

  const dispatch = useDispatch()

  const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }

  const { data: allData, isLoading, isFetching } = useGetSalesBillQuery({ params: { branchId }, searchParams: searchValue });
  const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetSalesBillByIdQuery(id, { skip: !id });

        console.log(singleData,"sigledataa")

  const [addData] = useAddSalesBillMutation();
  const [updateData] = useUpdateSalesBillMutation();
  const [removeData] = useDeleteSalesBillMutation();
  const componentRef = useRef();


  const { data: supplierList } =
    useGetPartyQuery({ params });


  const getNextDocId = useCallback(() => {

    if (id) return
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
  }, [allData, isLoading, isFetching, id])

  useEffect(getNextDocId, [getNextDocId])

  const syncFormWithDb = useCallback(
    (data) => {

      if (id) setReadOnly(true);
      if (data?.docId) {
        setDocId(data.docId);
      }
      if (data?.createdAt) setDate(moment.utc(data?.createdAt).format("YYYY-MM-DD"));
      setActive(data?.active ? data.active : false);
      // setSupplierId(data?.supplierId ? data?.supplierId : "");
      setContactMobile(data?.contactMobile ? data.contactMobile : "")
      setPlace(data?.place ? data.place : "")
      setPoBillItems(data?.SalesBillItems ? data.SalesBillItems : []);
      setDueDate(data?.dueDate ? moment.utc(data?.dueDate).format("YYYY-MM-DD") : "");
      setName(data?.name ? data.name : '')
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    }, [id])

   

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


  //  useEffect(()=>{
  //        setContactMobile(singleSupplier?.data ? singleSupplier.data.contactMobile :"");
  //        setPlace(singleSupplier?.data ? singleSupplier.data?.City?.name :"") 
  //  },[singleSupplier,isSingleSupplierFetching,isSingleSupplierLoading,supplierId])

  const data = {
    branchId,
    name,
    dueDate,
    contactMobile,
    place,
    salesBillItems: poBillItems.filter(item => item.qty != 0 && item.salePrice != 0),
    companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), active, id
  }
  

  
  const validateData = (data) => {


    return true;
  }

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      if (returnData.statusCode === 0) {
        setId("")
        syncFormWithDb(undefined)
        toast.success(text + "Successfully");
      } else {
        toast.error(returnData?.message)
      }
      dispatch({
        type: `stock/invalidateTags`,
        payload: ['Stock'],
      });
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
        await removeData(id).unwrap();
        setId("");
        toast.success("Deleted Successfully");
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
    setId("");
    getNextDocId();
    setReadOnly(false);
    setForm(true);
    setSearchValue("")
    syncFormWithDb(undefined);

  }

  function onDataClick(id) {
    setId(id);
    onNew();
    setForm(true);
  }
  const tableHeaders = [
    "Code", "Name", "Status"
  ]
  const tableDataNames = ["dataObj.code", "dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE']

  if (!form)
    return <ReportTemplate
      heading={MODEL}
      tableHeaders={tableHeaders}
      tableDataNames={tableDataNames}
      loading={
        isLoading || isFetching
      }
      setForm={setForm}
      data={allData?.data ? allData?.data : []}
      onClick={onDataClick}
      onNew={onNew}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
    />

  const supplierData = supplierList?.data ? supplierList.data : []


  return (


    <div onKeyDown={handleKeyDown} className='md:items-start md:justify-items-center grid h-full bg-theme'>
      <Modal

        isOpen={formReport}
        onClose={() => setFormReport(false)}
        widthClass={"px-2 h-[90%] w-[90%]"}

      >{console.log(id,"iddd")}
        <PurchaseBillFormReport onClick={(id) => {setId(id); setFormReport(false) }} />
      </Modal>

      <div className='flex flex-col frame w-full h-full'>

        <FormHeader
          onNew={onNew}
          model={MODEL}
          openReport={() => setFormReport(true)}
          saveData={saveData}
          setReadOnly={setReadOnly}
          deleteData={deleteData}
          onPrint={id ? handlePrint : null}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
          <div className='col-span-4 grid md:grid-cols-1 border overflow-auto'>
            <div className='mr-1 md:ml-2'>
              <fieldset className='frame my-1'>
                <legend className='sub-heading'>Product Info</legend>
                <div className='grid grid-cols-3 my-2'>

                  <DisabledInput name="Bill.No" value={docId} required={true} readOnly={readOnly} />
                  <DisabledInput name="Bill. 
                           Date" value={date} type={"Date"} required={true} readOnly={readOnly} />

                  <TextInput name="Ph No" type={'number'} value={contactMobile} setValue={setContactMobile} readOnly={readOnly} />
                  <TextInput name="Name" value={name} setValue={setName} readOnly={readOnly} required />
                  {/* <DropdownInput name="Customer" options={dropDownListObject(id ? supplierData : supplierData.filter(value => value.isCustomer).filter(item => item.active), "name", "id")} value={supplierId} setValue={setSupplierId} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} /> */}
                  {/* <TextInput name={"NetBillValue"} value={netBillValue} setValue={setNetBillValue} readOnly={readOnly} required /> */}
                  <CheckBox name="Discount" value={active} setValue={setActive} readOnly={readOnly} />
                </div>
              </fieldset>
              <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 w-full border border-gray-400 md:pb-5 flex flex-1 overflow-auto'>
                <legend className='sub-heading'>Sales-Bill-Details</legend>
                <PoBillItems date={singleData?.data?.createdAt} id={id} readOnly={readOnly} poBillItems={poBillItems} setPoBillItems={setPoBillItems} />
              </fieldset>
              <div className="hidden">
                <RetailPrintFormatFinishedGoodsSales
                  innerRef={componentRef} contactMobile={contactMobile} name={name} date={singleData?.data?.createdAt} id={id} poBillItems={poBillItems} readOnly={readOnly} docId={docId ? docId : ''} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
