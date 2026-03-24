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
import SaleOrderForm from './SaleOrderForm';
import moment from 'moment';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import Swal from 'sweetalert2';
import SaleOrderReport from './SaleOrderReport';
import { useGetLocationMasterQuery } from '../../../redux/uniformService/LocationMasterServices';
import { useGetBranchQuery } from '../../../redux/services/BranchMasterService';
import { useGetYarnMasterQuery } from '../../../redux/uniformService/YarnMasterServices';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useDeletesaleOrderMutation } from '../../../redux/uniformService/saleOrderServices';
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";





const SaleOrder = () => {

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

    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const dispatch = useDispatch();
    const openTabsState = useSelector((state) => state.openTabs);
    const currentTab = openTabsState?.tabs?.find(t => t.active && t.name === "SALE ORDER");
    const convertQuotationId = currentTab?.projectId;


    const { data: quotationToConvertData, isFetching: isQuotationFetching } =
        useGetQuotationByIdQuery(convertQuotationId, { skip: !convertQuotationId });




    useEffect(() => {
        if (quotationToConvertData?.data && convertQuotationId) {
            const quoteData = quotationToConvertData.data;
            setId("");
            setCustomerId(quoteData.customerId);
            setSaleOrderItems(quoteData.QuotationItems || []);
            setPayTermId(quoteData.payTermId || "");
            setLocationId(quoteData.branchId || "");
            setStoreId(quoteData.storeId || "");
            setReadOnly(false);
            setShowManufacturer(true);

            // Important: Clear the conversion flag so it doesn't re-trigger
            // dispatch(push({ name: "SALE ORDER", id: null }));
        }
    }, [quotationToConvertData, convertQuotationId, dispatch]);

    console.log(convertQuotationId, "convertQuotationId")

    const params = {
        branchId, userId, finYearId
    };

    const { data: locationData } = useGetLocationMasterQuery({ params: { branchId } });
    const { data: branchList } = useGetBranchQuery({ params: { companyId } });
    const { data: supplierList } = useGetPartyQuery({ params: { ...params } });


    const [removeData] = useDeletesaleOrderMutation();
    const [invalidateTagsDispatch] = useInvalidateTags();


    const { data: yarnList } =
        useGetYarnMasterQuery({ params });

    const { data: colorList } =
        useGetColorMasterQuery({ params: { ...params } });


    const { data: uomList } =
        useGetUomQuery({ params });



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

    const handleConvertToInvoice = (dataObj) => {
        dispatch(push({ name: "SALES INVOICE", projectId: dataObj.id }));
    };

    const handleDelete = async (id, childRecord) => {


        // if (childRecordCount(childRecord)) {
        //     Swal.fire({
        //         icon: 'error',
        //         text: 'Child Record Exists',
        //     });
        //     return
        // }

        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                await removeData(id)
                setId("");
                onNew();
                // toast.success("Deleted Successfully");
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
        setReadOnly(false);
        setCustomerId("")
        setPartyId('')
    }

    return (
        <>
            {showManufacturer ? (
                <SaleOrderForm
                    onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }} id={id} setId={setId}
                    docId={docId} setDocId={setDocId} date={date} setDate={setDate} readOnly={readOnly} setReadOnly={setReadOnly}
                    transType={transType} setTransType={setTransType} dcNo={dcNo} setDcNo={setDcNo} dcDate={dcDate} setDcDate={setDcDate}
                    customerId={customerId} setCustomerId={setCustomerId} payTermId={payTermId} setPayTermId={setPayTermId}
                    locationId={locationId} setLocationId={setLocationId} storeId={storeId} setStoreId={setStoreId}
                    poInwardOrDirectInward={poInwardOrDirectInward} setPoInwardOrDirectInward={setPoInwardOrDirectInward}
                    inwardItemSelection={inwardItemSelection} setInwardItemSelection={setInwardItemSelection}
                    saleOrderItems={saleOrderItems} setSaleOrderItems={setSaleOrderItems}
                    partyId={partyId} setPartyId={setPartyId} onNew={onNew} locationData={locationData} branchList={branchList}
                    supplierList={supplierList} yarnList={yarnList} colorList={colorList} uomList={uomList} quoteId={convertQuotationId}
                    invalidateTagsDispatch={invalidateTagsDispatch} dispatch={dispatch}



                />

            ) : (
                <div className="p-2 bg-[#F1F1F0] min-h-screen">
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">

                        <h1 className="text-2xl font-bold text-gray-800">Sale Order</h1>

                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
                            onClick={() => { setShowManufacturer(true); onNew() }}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                        <SaleOrderReport
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onConvertToInvoice={handleConvertToInvoice}
                        />
                    </div>

                </div>
            )}
        </>
    );
};

export default SaleOrder;