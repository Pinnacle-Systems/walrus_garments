import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from '../../../redux/features/opentabs';
import { FaPlus } from "react-icons/fa";
import { findFromList, getCommonParams, getDateFromDateTime } from '../../../Utils/helper';
import { toast } from 'react-toastify';
import CommonTable from '../../../Shocks/CommonReport/CommonTable';
import { useGetOrderQuery } from '../../../redux/uniformService/OrderService';
import { useDeleteDirectInwardOrReturnMutation, useGetDirectInwardOrReturnQuery } from '../../../redux/uniformService/DirectInwardOrReturnServices';
import { useGetQuotationByIdQuery, useGetQuotationMasterByIdQuery } from '../../../redux/uniformService/quotationServices';
import moment from 'moment';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import Swal from 'sweetalert2';
import { useGetLocationMasterQuery } from '../../../redux/uniformService/LocationMasterServices';
import { useGetBranchQuery } from '../../../redux/services/BranchMasterService';
import { useGetYarnMasterQuery } from '../../../redux/uniformService/YarnMasterServices';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useDeletesaleOrderMutation } from '../../../redux/uniformService/saleOrderServices';
import { useGetTermsandCondtionsQuery } from '../../../redux/services/Term&ConditionsMasterService';
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import ExpenseEntryForm from './ExpenseEntryForm';
import ExpenseEntryReport from './ExpenseEntryReport';
import { useDeleteExpenseEntryMutation } from '../../../redux/uniformService/ExpenseEntryServices';





const ExpenseEntry = () => {

    const [showManufacturer, setShowManufacturer] = useState(false);
    const [id, setId] = useState("");
    const [poInwardOrDirectInward, setPoInwardOrDirectInward] = useState("DirectInward");


    const [docId, setDocId] = useState("New")
    const today = new Date()
    const [date, setDate] = useState(getDateFromDateTime(today));
    const [readOnly, setReadOnly] = useState('')
    const [transType, setTransType] = useState("DyedYarn");
    const [dcNo, setDcNo] = useState("")
    const [dcDate, setDcDate] = useState('')
    const [customerId, setCustomerId] = useState('')
    const [payTermId, setPayTermId] = useState("");
    const [locationId, setLocationId] = useState('');
    const [storeId, setStoreId] = useState("")
    const [inwardItemSelection, setInwardItemSelection] = useState(false)
    const [saleOrderItems, setSaleOrderItems] = useState([]);
    const [partyId, setPartyId] = useState('')
    const [expenseItems, setExpenseItems] = useState([]);

    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const dispatch = useDispatch();
    const openTabsState = useSelector((state) => state.openTabs);
    const currentTab = openTabsState?.tabs?.find(t => t.active && t.name === "SALE ORDER");
    const convertQuotationId = currentTab?.projectId;


    const { data: quotationToConvertData, isFetching: isQuotationFetching } =
        useGetQuotationByIdQuery(convertQuotationId, { skip: !convertQuotationId });






    const params = {
        branchId, userId, finYearId
    };



    const [removeData] = useDeleteExpenseEntryMutation();
    const [invalidateTagsDispatch] = useInvalidateTags();




    const handleView = (id) => {

        setId(id)
        setShowManufacturer(true)
        setReadOnly(true);
    };

    const handleEdit = (orderId) => {
        setId(orderId)
        setShowManufacturer(true)
        setReadOnly(false);
    };

    const handleDelete = async (id) => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                await removeData(id)
                setId("");
                onNew();
                Swal.fire({
                    title: "Deleted Successfully",
                    icon: "success",
                    draggable: true,
                    timer: 1000,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                invalidateTagsDispatch()
            } catch (error) {
                toast.error("something went wrong");
            }
        }

    };
    const onNew = () => {
        setId("");
        setExpenseItems([])

    }

    return (
        <>
            {showManufacturer ? (
                <div className="h-[calc(100vh-5rem)] min-h-0 overflow-hidden">
                    <ExpenseEntryForm
                        onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }} id={id} setId={setId}
                        docId={docId} setDocId={setDocId} date={date} setDate={setDate} readOnly={readOnly} setReadOnly={setReadOnly}
                        transType={transType} setTransType={setTransType} dcNo={dcNo} setDcNo={setDcNo} dcDate={dcDate} setDcDate={setDcDate}
                        expenseItems={expenseItems} setExpenseItems={setExpenseItems}

                    />
                </div>

            ) : (
                <div className="flex h-[calc(100vh-5rem)] min-h-0 flex-col bg-[#F1F1F0]">
                    <div className="mb-2 flex shrink-0 flex-col items-start justify-between gap-x-4 rounded-tl-lg rounded-tr-lg border border-gray-200 bg-white px-1 py-0.5 shadow-sm sm:flex-row sm:items-center">

                        <h1 className="text-lg font-bold text-gray-800">Expense Entry</h1>

                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-2 py-1 rounded-md flex items-center gap-2 text-xs"
                            onClick={() => { setShowManufacturer(true); onNew() }}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-white shadow-sm">

                        <ExpenseEntryReport
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>

                </div>
            )}
        </>
    );
};

export default ExpenseEntry;
