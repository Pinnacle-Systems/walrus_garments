import { useEffect, useState } from 'react';
import { FaPlus } from "react-icons/fa";
import { useSelector, useDispatch } from 'react-redux';
import { getCommonParams, getDateFromDateTime } from '../../../Utils/helper';
import { toast } from 'react-toastify';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import Swal from 'sweetalert2';
import { useGetLocationMasterQuery } from '../../../redux/uniformService/LocationMasterServices';
import { useGetBranchQuery } from '../../../redux/services/BranchMasterService';
import { useGetYarnMasterQuery } from '../../../redux/uniformService/YarnMasterServices';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import SalesDeliveryReport from './SalesDeliveryReport';
import { useDeleteSalesDeliveryMutation } from '../../../redux/uniformService/salesDeliveryServices';
import SalesDeliveryForm from './SalesDeliveryForm';
import { useGetHsnMasterQuery } from '../../../redux/services/HsnMasterServices';
import { useGetsaleOrderByIdQuery } from '../../../redux/uniformService/saleOrderServices';
import useInvalidateTags from '../../../CustomHooks/useInvalidateTags';
import { useGetTermsandCondtionsQuery } from '../../../redux/services/Term&ConditionsMasterService';





const SalesDelivery = () => {

    const [showManufacturer, setShowManufacturer] = useState(false);
    const [id, setId] = useState("");
    const [poInwardOrDirectInward, setPoInwardOrDirectInward] = useState("DirectInward");


    const [docId, setDocId] = useState("New")
    const today = new Date()
    const [date, setDate] = useState(getDateFromDateTime(today)); const [readOnly, setReadOnly] = useState('')
    const [transType, setTransType] = useState("DyedYarn");
    const [dcNo, setDcNo] = useState("")
    const [dcDate, setDcDate] = useState('')
    const [customerId, setCustomerId] = useState('')
    const [payTermId, setPayTermId] = useState("");
    const [locationId, setLocationId] = useState('');
    const [storeId, setStoreId] = useState("")
    const [inwardItemSelection, setInwardItemSelection] = useState(false)
    const [deliveryItems, setDeliveryItems] = useState([]);
    const [partyId, setPartyId] = useState('')

    const { branchId, userId, companyId, finYearId } = getCommonParams();

    const dispatch = useDispatch();
    const openTabsState = useSelector((state) => state.openTabs);
    const currentTab = openTabsState?.tabs?.find(t => t.active && t.name === "SALES DELIVERY");
    const convertSaleOrderId = currentTab?.projectId;

    const { data: saleOrderToConvertData } =
        useGetsaleOrderByIdQuery(convertSaleOrderId, { skip: !convertSaleOrderId });

    useEffect(() => {
        if (saleOrderToConvertData?.data && convertSaleOrderId) {
            const saleOrderData = saleOrderToConvertData?.data;
            setId("");
            setCustomerId(saleOrderData.customerId);
            setDeliveryItems(saleOrderData.remainingSaleOrderItems || []);
            setPayTermId(saleOrderData.payTermId || "");
            setLocationId(saleOrderData.branchId || "");
            setStoreId(saleOrderData.storeId || "");
            setReadOnly(false);
            setShowManufacturer(true);
        }
    }, [saleOrderToConvertData, convertSaleOrderId]);

    const params = {
        branchId, userId, finYearId
    };

    const { data: locationData } = useGetLocationMasterQuery({ params: { branchId } });
    const { data: branchList } = useGetBranchQuery({ params: { companyId } });
    const { data: supplierList } = useGetPartyQuery({ params: { ...params } });


    const [removeData] = useDeleteSalesDeliveryMutation();
    const [invalidateTagsDispatch] = useInvalidateTags();


    const { data: yarnList } =
        useGetYarnMasterQuery({ params });

    const { data: colorList } =
        useGetColorMasterQuery({ params: { ...params } });


    const { data: uomList } =
        useGetUomQuery({ params });
    const { data: hsnList } =
        useGetHsnMasterQuery({ params });
    const { data: termsData } =
        useGetTermsandCondtionsQuery({ params: { ...params } });


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

    const handleDelete = async (id, childRecord) => {
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
                <div className="h-[calc(100vh-6rem)] min-h-0 overflow-hidden">
                    <SalesDeliveryForm
                        onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }} id={id} setId={setId}
                        docId={docId} setDocId={setDocId} date={date} setDate={setDate} readOnly={readOnly} setReadOnly={setReadOnly}
                        transType={transType} setTransType={setTransType} dcNo={dcNo} setDcNo={setDcNo} dcDate={dcDate} setDcDate={setDcDate}
                        customerId={customerId} setCustomerId={setCustomerId} payTermId={payTermId} setPayTermId={setPayTermId}
                        locationId={locationId} setLocationId={setLocationId} storeId={storeId} setStoreId={setStoreId}
                        poInwardOrDirectInward={poInwardOrDirectInward} setPoInwardOrDirectInward={setPoInwardOrDirectInward}
                        inwardItemSelection={inwardItemSelection} setInwardItemSelection={setInwardItemSelection}
                        deliveryItems={deliveryItems} setDeliveryItems={setDeliveryItems}
                        partyId={partyId} setPartyId={setPartyId} onNew={onNew} locationData={locationData} branchList={branchList}
                        supplierList={supplierList} yarnList={yarnList} colorList={colorList} uomList={uomList} hsnList={hsnList}
                        invalidateTagsDispatch={invalidateTagsDispatch} dispatch={dispatch} convertSaleOrderId={convertSaleOrderId}
                        linkedSaleOrder={saleOrderToConvertData?.data}
                        totalReceivedAmount={saleOrderToConvertData?.data?.totalReceivedAmount || 0}
                        remainingPaymentCapacity={saleOrderToConvertData?.data?.remainingPaymentCapacity || 0}
                        termsData={termsData}
                    />
                </div>

            ) : (
                <div className="p-2 bg-[#F1F1F0] min-h-screen">
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">

                        <h1 className="text-2xl font-bold text-gray-800">Sales Delivery</h1>

                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
                            onClick={() => { setShowManufacturer(true); onNew() }}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                        <SalesDeliveryReport
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

export default SalesDelivery;
