import React, { useEffect, useState, useRef, useCallback } from 'react';

import FormHeader from '../../../Basic/components/FormHeader';
import { toast } from "react-toastify"
import { DisabledInput, DropdownInput, TextInput } from "../../../Inputs"
import { PaymentType } from '../../../Utils/DropdownData';
import {
  useGetPaymentQuery,
  useGetPaymentByIdQuery,
  useAddPaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
} from '../../../redux/services/PaymentService.js';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { useGetPartyByIdQuery } from '../../../redux/services/PartyMasterService';

import { getCommonParams, getDateFromDateTime } from '../../../Utils/helper';
import Modal from "../../../UiComponents/Modal";
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { push } from '../../../redux/features/opentabs';

import e from 'cors';
import { FaPlus } from 'react-icons/fa';
// import PaymentFormReport from './PurchaseBillFormReport';
import PaymentForm from './PayementForm.js';
import Swal from 'sweetalert2';
import PaymentFormReport from './PaymentDetailsReport.js';

const MODEL = "Payments";

export default function Form() {
  const today = new Date().toISOString().split('T')[0];

  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const [form, setForm] = useState(true);
  const [date, setDate] = useState(getDateFromDateTime(today));
  const [docId, setDocId] = useState("");
  const [formReport, setFormReport] = useState(false)
  const [id, setId] = useState("");
  const [readOnly, setReadOnly] = useState(false);
  const [cvv, setCvv] = useState(today);
  const [paymentMode, setPaymentMode] = useState('');
  const [paymentRefNo, setPaymentRefNo] = useState('');
  const [partyId, setPartyId] = useState("");
  const [paymentType, setPaymentType] = useState(PaymentType[0].value);
  const [paidAmount, setPaidAmount] = useState('');
  const [discount, setDiscount] = useState('')
  const [balanceAmount, setBalanceAmount] = useState('');
  const [totalBillAmount, setTotalBillAmount] = useState('');
  const [totalPayAmount, setTotalPayAmount] = useState('')
  const [purchaseOrderForm, setPurchaseOrderForm] = useState("")
  const [searchValue, setSearchValue] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const [transactionType, setTransactionType] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const childRecord = useRef(0);


  const dispatch = useDispatch()
  const openTabsState = useSelector((state) => state.openTabs);
  const currentTab = openTabsState?.tabs?.find(t => t.active && t.name === "PAYMENTS");

  console.log(currentTab, "currentTab")

  useEffect(() => {
    // Auto-open form and prepopulate when pushed from another module
    if (currentTab?.transactionType && currentTab?.id) {
      setPurchaseOrderForm(true);
      setTransactionType(currentTab?.transactionType)
      setTransactionId(currentTab?.id)
    }
  }, [currentTab]);

  console.log(transactionId, transactionType, "transactionId")
  console.log(currentTab, "currentTab")



  const { data: allData, isLoading, isFetching } = useGetPaymentQuery({ params: { branchId, finYearId }, searchParams: searchValue });
  const { data: singleData } = useGetPaymentByIdQuery(id, { skip: !id });
  const {
    data: PartyData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPartyByIdQuery(supplierId, { skip: !supplierId });

  console.log(PartyData, "partyData")

  const syncFormWithDb = useCallback(
    (data) => {
      if (id) setReadOnly(true);
      else setReadOnly(false);
      if (data?.docId) {
        setDocId(data.docId);
      }
      if (data?.createdAt) setDate(moment.utc(data?.createdAt).format("YYYY-MM-DD"));
      setPaidAmount(data?.paidAmount || '');
      setDiscount(data?.discount || 0)
      setSupplierId(data?.partyId || '')
      setPaymentMode(data?.paymentMode || '');
      setPaymentType(data?.paymentType || '')
      setPaymentRefNo(data?.paymentRefNo || '');
      setTotalPayAmount(PartyData?.data?.soa ? data?.totalPaymentPurchaseBill : data?.totalPaymentSalesBill)
      setPartyId(data?.partyId || '');
      setTotalBillAmount(data?.totalBillAmount || '')
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    }, [id])


  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [syncFormWithDb, singleData])


  const [addData] = useAddPaymentMutation();
  const [updateData] = useUpdatePaymentMutation();
  const [removeData] = useDeletePaymentMutation();
  const getNextDocId = useCallback(() => {

    if (id || isLoading || isFetching) return
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
  }, [allData, isLoading, isFetching, id])

  useEffect(getNextDocId, [getNextDocId])



  const data = {
    id,
    branchId,
    paymentMode,
    cvv,
    paidAmount,
    paymentRefNo,
    discount,
    supplierId,
    paymentType,
    finYearId,
    userId,
    totalBillAmount
  }
  const validateData = (data) => {
    return data?.supplierId && data?.paidAmount
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
        type: `partyMaster/invalidateTags`,
        payload: ['Party'],
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
    if (data?.amount < 0) {
      toast.info("Amount Cannot be Negative...!!!", { position: "top-center" })
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
        dispatch({
          type: `partyMaster/invalidateTags`,
          payload: ['Party'],
        });
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
  const { data: supplierList } = useGetPartyQuery({ params: { branchId, finYearId } });

  const supplierData = supplierList?.data ? supplierList.data : [];
  const handleChange = (e) => {
    const value = e.target.value;
    // Only accept numeric values
    if (/^\d*$/.test(value)) {
      setPaidAmount(value);
    }
  };
  const handleChange1 = (e) => {
    const value = e.target.value;
    setDiscount(value)

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
  console.log(paymentType, "paymenttype")


  // useEffect(() => {
  //   if (!id) {
  //     const newAmount = paymentType === 'PURCHASEBILL' 
  //       ? (PartyData?.data?.soa + PartyData?.data?.totalPurchaseNetBillValue - PartyData?.data?.totalPaymentPurchaseBill) 
  //       : (PartyData?.data?.coa + PartyData?.data?.totalSalesNetBillValue - PartyData?.data?.totalPaymentSalesBill);

  //     setTotalBillAmount(newAmount);
  //   }
  // }, [paymentType, PartyData]);



  useEffect(() => {
    if (!id) {


      setTotalBillAmount(PartyData?.data?.coa + PartyData?.data?.totaloutstanding - PartyData?.data?.totalPaymentAgainstInvoice);
    }
  }, [paymentType, PartyData]);

  console.log(totalBillAmount, "totalBillAmount")

  const handleView = (id) => {

    setId(id)
    setPurchaseOrderForm(true)
    setReadOnly(true);
  };

  const handleEdit = (id) => {
    setReadOnly(false);
    setId(id)
    setPurchaseOrderForm(true)
  };

  console.log(childRecord?.current, "childrecord");


  const handleDelete = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        let deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          Swal.fire({
            icon: "error",
            title: "Child record Exists",
            text: deldata.data?.message || "Data cannot be deleted!",
          });
          return;
        }
        setId("");
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
      }
    }
  };
  return (



    <>
      {purchaseOrderForm ? (
        <PaymentForm
          id={id}
          setId={setId}
          onClose={() => setPurchaseOrderForm(false)}
          initialTransactionType={currentTab?.transactionType}
          initialTransactionId={currentTab?.id}
          transactionId={transactionId}
          transactionType={transactionType}
          setTransactionId={setTransactionId}
          setTransactionType={setTransactionType}
        />
      ) : (
        <div className="p-2 bg-[#F1F1F0]">
          <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">

            <h1 className="text-2xl font-bold text-gray-800  shadow-2xl">Payment</h1>
            <button
              className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
              onClick={() => { setPurchaseOrderForm(true); onNew() }}
            >
              <FaPlus /> Create New
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <PaymentFormReport
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              itemsPerPage={10}
            />
          </div>

        </div>
      )}
    </>


  )
}
