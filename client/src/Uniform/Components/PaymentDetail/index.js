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
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";

const MODEL = "Payments";

export default function Form() {
  const today = new Date().toISOString().split('T')[0];


  const [form, setForm] = useState(true);
  const [date, setDate] = useState(getDateFromDateTime(today));
  const [docId, setDocId] = useState("New");
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
  const [totalBillAmount, setTotalBillAmount] = useState(0);
  const [billAmount, setBillAmount] = useState('');
  const [totalPayAmount, setTotalPayAmount] = useState('')
  const [purchaseOrderForm, setPurchaseOrderForm] = useState("")
  const [searchValue, setSearchValue] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const [transactionType, setTransactionType] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [formReadOnly, setFormReadOnly] = useState(false);
  const [paymentFlow, setPaymentFlow] = useState("");
  const [lockPrefilledTransactionFields, setLockPrefilledTransactionFields] = useState(false);
  const [linkedPaymentOverrideEnabled, setLinkedPaymentOverrideEnabled] = useState(false);
  const [refId, setRefId] = useState("");
  const [refDocId, setRefDocId] = useState("");
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const childRecord = useRef(0);
  const [paymentHistory, setPaymentHistory] = useState([])
  const [outstandingAmount, setOutStandingAmount] = useState(0)




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

  const [removeData] = useDeletePaymentMutation();

  const [invalidateTagsDispatch] = useInvalidateTags();


  // const {
  //   data: PartyData,
  //   isFetching: isSingleFetching,
  //   isLoading: isSingleLoading,
  // } = useGetPartyByIdQuery(supplierId, { skip: !supplierId });





  const onNew = () => {
    setId("");
    setReadOnly(false);
    setForm(true);
    setSearchValue("")
    setDocId("New");
    setCvv(moment.utc(new Date()).format("YYYY-MM-DD"));
    setPaymentMode('');
    setPaymentRefNo('');
    setPartyId("");
    setPaidAmount('');
    setDiscount('');
    setBalanceAmount('');
    setTotalPayAmount('');
    setSupplierId("");
    setLockPrefilledTransactionFields(false);
    setLinkedPaymentOverrideEnabled(false);
    setPaymentType("INVOICE");
    setPaymentFlow("Receipt");
    setTransactionType("");
    setTransactionId("");
    setRefDocId("");
    setRefId("");
    setTotalBillAmount("");
    setBillAmount("");
    setPaymentHistory([])
    setOutStandingAmount(0)
  }









  const handleView = (id) => {

    setId(id)
    setPurchaseOrderForm(true)
    setReadOnly(true);
    setFormReadOnly(true);
  };

  const handleEdit = (id) => {
    setReadOnly(false);
    setFormReadOnly(false);
    setId(id)
    setPurchaseOrderForm(true)
  };



  const handleDelete = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        let deldata = await removeData(id).unwrap();
        invalidateTagsDispatch()

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
          initialReadOnly={formReadOnly}
          initialTransactionType={currentTab?.transactionType}
          initialTransactionId={currentTab?.id}
          transactionId={transactionId}
          transactionType={transactionType}
          setTransactionId={setTransactionId}
          setTransactionType={setTransactionType}
          docId={docId}
          setDocId={setDocId}
          cvv={cvv}
          setCvv={setCvv}
          paymentMode={paymentMode}
          setPaymentMode={setPaymentMode}
          paymentRefNo={paymentRefNo}
          setPaymentRefNo={setPaymentRefNo}
          partyId={partyId}
          setPartyId={setPartyId}
          paymentType={paymentType}
          setPaymentType={setPaymentType}
          paidAmount={paidAmount}
          setPaidAmount={setPaidAmount}
          discount={discount}
          setDiscount={setDiscount}
          balanceAmount={balanceAmount}
          setBalanceAmount={setBalanceAmount}
          totalBillAmount={totalBillAmount}
          setTotalBillAmount={setTotalBillAmount}
          billAmount={billAmount}
          setBillAmount={setBillAmount}
          totalPayAmount={totalPayAmount}
          setTotalPayAmount={setTotalPayAmount}
          supplierId={supplierId}
          setSupplierId={setSupplierId}
          paymentFlow={paymentFlow}
          setPaymentFlow={setPaymentFlow}
          lockPrefilledTransactionFields={lockPrefilledTransactionFields}
          setLockPrefilledTransactionFields={setLockPrefilledTransactionFields}
          linkedPaymentOverrideEnabled={linkedPaymentOverrideEnabled}
          setLinkedPaymentOverrideEnabled={setLinkedPaymentOverrideEnabled}
          refId={refId}
          setRefId={setRefId}
          refDocId={refDocId}
          setRefDocId={setRefDocId}
          currentHistoryPage={currentHistoryPage}
          setCurrentHistoryPage={setCurrentHistoryPage}
          readOnly={readOnly}
          setReadOnly={setReadOnly}
          childRecord={childRecord}
          setPaymentHistory={setPaymentHistory}
          paymentHistory={paymentHistory}
          invalidateTagsDispatch={invalidateTagsDispatch}
          outstandingAmount={outstandingAmount}
          setOutStandingAmount={setOutStandingAmount}
        />
      ) : (
        <div className="bg-[#F1F1F0]">
          <div className="mb-2 flex shrink-0 flex-col items-start justify-between gap-x-4 rounded-tl-lg rounded-tr-lg border border-gray-200 bg-white px-1 py-0.5 shadow-sm sm:flex-row sm:items-center">

            <h1 className="text-lg font-bold text-gray-800">Payment </h1>

            <button
              className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-2 py-1 rounded-md flex items-center gap-2 text-xs"
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
