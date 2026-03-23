import { useEffect, useState } from 'react';
import { FaPlus } from "react-icons/fa";
import { useSelector, useDispatch } from 'react-redux';
import { push } from '../../../redux/features/opentabs';
import { findFromList, getCommonParams } from '../../../Utils/helper';
import { toast } from 'react-toastify';
import CommonTable from '../../../Shocks/CommonReport/CommonTable';
import { useDeleteDirectInwardOrReturnMutation, useGetDirectInwardOrReturnQuery } from '../../../redux/uniformService/DirectInwardOrReturnServices';
import moment from 'moment';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import Swal from 'sweetalert2';
import { useGetLocationMasterQuery } from '../../../redux/uniformService/LocationMasterServices';
import { useGetBranchQuery } from '../../../redux/services/BranchMasterService';
import { useGetYarnMasterQuery } from '../../../redux/uniformService/YarnMasterServices';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import SalesInvoiceForm from './SalesInvoiceForm';
import SaleInvoiceReport from './SalesInvoiceReport';
import { useDeleteSalesInvoiceMutation } from '../../../redux/uniformService/salesInvoiceServices';
import { useGetsaleOrderByIdQuery } from '../../../redux/uniformService/saleOrderServices';





const SalesInvoice = () => {

    const [showManufacturer, setShowManufacturer] = useState(false);
    const [id, setId] = useState("");
    const [poInwardOrDirectInward, setPoInwardOrDirectInward] = useState("DirectInward");


    const [docId, setDocId] = useState("New")
    const [date, setDate] = useState("")
    const [readOnly, setReadOnly] = useState('')
    const [transType, setTransType] = useState("DyedYarn");
    const [dcNo, setDcNo] = useState("")
    const [dcDate, setDcDate] = useState('')
    const [customerId, setCustomerId] = useState('')
    const [payTermId, setPayTermId] = useState("");
    const [locationId, setLocationId] = useState('');
    const [storeId, setStoreId] = useState("")
    const [inwardItemSelection, setInwardItemSelection] = useState(false)
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [partyId, setPartyId] = useState('')

    const { branchId, userId, companyId, finYearId } = getCommonParams();

    const dispatch = useDispatch();
    const openTabsState = useSelector((state) => state.openTabs);
    const currentTab = openTabsState?.tabs?.find(t => t.active && t.name === "SALES INVOICE");
    console.log(currentTab, "currentTab")
    const convertSaleOrderId = currentTab?.id;

    const { data: saleOrderToConvertData, isFetching: isSaleOrderFetching } =
        useGetsaleOrderByIdQuery(convertSaleOrderId, { skip: !convertSaleOrderId });

    useEffect(() => {
        if (saleOrderToConvertData?.data && convertSaleOrderId) {
            const orderData = saleOrderToConvertData.data;
            setId("");
            setCustomerId(orderData.customerId);
            setInvoiceItems(orderData.SaleOrderItems || []);
            setPayTermId(orderData.payTermId || "");
            setLocationId(orderData.branchId || "");
            setStoreId(orderData.storeId || "");
            setReadOnly(false);
            setShowManufacturer(true);

            // Important: Clear the conversion flag so it doesn't re-trigger
            dispatch(push({ name: "SALES INVOICE", id: null }));
        }
    }, [saleOrderToConvertData, convertSaleOrderId, dispatch]);

    const params = {
        branchId, userId, finYearId
    };

    const { data: locationData } = useGetLocationMasterQuery({ params: { branchId } });
    const { data: branchList } = useGetBranchQuery({ params: { companyId } });
    const { data: supplierList } = useGetPartyQuery({ params: { ...params } });


    const [removeData] = useDeleteSalesInvoiceMutation();


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
            } catch (error) {
                toast.error("something went wrong");
            }
        }

    };

    const handleConvertToDelivery = (dataObj) => {
        dispatch(push({ name: "SALES DELIVERY", id: dataObj.id }));
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
                <SalesInvoiceForm
                    onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }} id={id} setId={setId}
                    docId={docId} setDocId={setDocId} date={date} setDate={setDate} readOnly={readOnly} setReadOnly={setReadOnly}
                    transType={transType} setTransType={setTransType} dcNo={dcNo} setDcNo={setDcNo} dcDate={dcDate} setDcDate={setDcDate}
                    customerId={customerId} setCustomerId={setCustomerId} payTermId={payTermId} setPayTermId={setPayTermId}
                    locationId={locationId} setLocationId={setLocationId} storeId={storeId} setStoreId={setStoreId}
                    poInwardOrDirectInward={poInwardOrDirectInward} setPoInwardOrDirectInward={setPoInwardOrDirectInward}
                    inwardItemSelection={inwardItemSelection} setInwardItemSelection={setInwardItemSelection}
                    invoiceItems={invoiceItems} setInvoiceItems={setInvoiceItems}
                    partyId={partyId} setPartyId={setPartyId} onNew={onNew} locationData={locationData} branchList={branchList}
                    supplierList={supplierList} yarnList={yarnList} colorList={colorList} uomList={uomList} convertSaleOrderId={convertSaleOrderId}



                />

            ) : (
                <div className="p-2 bg-[#F1F1F0] min-h-screen">
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">

                        <h1 className="text-2xl font-bold text-gray-800">Sales Invoice</h1>

                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
                            onClick={() => { setShowManufacturer(true); onNew() }}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                        <SaleInvoiceReport
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onConvertToDelivery={handleConvertToDelivery}
                        />
                    </div>

                </div>
            )}
        </>
    );
};

export default SalesInvoice;