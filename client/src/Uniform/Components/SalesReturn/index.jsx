import { useState } from 'react';
import { FaPlus } from "react-icons/fa";
import { findFromList, getCommonParams } from '../../../Utils/helper';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import Swal from 'sweetalert2';
import { useGetLocationMasterQuery } from '../../../redux/uniformService/LocationMasterServices';
import { useGetBranchQuery } from '../../../redux/services/BranchMasterService';
import { useGetYarnMasterQuery } from '../../../redux/uniformService/YarnMasterServices';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useDeleteSalesDeliveryMutation } from '../../../redux/uniformService/salesDeliveryServices';
import { useGetHsnMasterQuery } from '../../../redux/services/HsnMasterServices';
import SalesReturnReport from './SalesReturnReport';
import SalesReturnForm from './SalesReturnForm';
import { useDeleteSalesReturnMutation } from '../../../redux/uniformService/salesReturnServices';
import { useGetTermsandCondtionsQuery } from '../../../redux/services/Term&ConditionsMasterService';





const SalesDelivery = () => {

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
    const [deliveryItems, setDeliveryItems] = useState([]);
    const [partyId, setPartyId] = useState('')
    const [salesDeliveryId, setSalesDeliveryId] = useState('')
    const [exchangeItems, setExchangeItems] = useState([]);
    const [returnType, setReturnType] = useState("Bulk Sales");
    const [posId, setPosId] = useState('')
    const { branchId, userId, companyId, finYearId } = getCommonParams();

    const params = {
        branchId, userId, finYearId
    };

    const { data: locationData } = useGetLocationMasterQuery({ params: { branchId } });
    const { data: branchList } = useGetBranchQuery({ params: { companyId } });
    const { data: supplierList } = useGetPartyQuery({ params: { ...params } });


    const [removeData] = useDeleteSalesReturnMutation();


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
    const onNew = () => {
        setId("");
        setReadOnly(false);
        setCustomerId("")
        setPartyId('')
        setPosId('')
        setSalesDeliveryId('')
    }

    return (
        <>
            {showManufacturer ? (
                <div className="h-[calc(100vh-5rem)] min-h-0 overflow-hidden">
                    <SalesReturnForm
                        onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }} id={id} setId={setId}
                        docId={docId} setDocId={setDocId} date={date} setDate={setDate} readOnly={readOnly} setReadOnly={setReadOnly}
                        transType={transType} setTransType={setTransType} dcNo={dcNo} setDcNo={setDcNo} dcDate={dcDate} setDcDate={setDcDate}
                        customerId={customerId} setCustomerId={setCustomerId} payTermId={payTermId} setPayTermId={setPayTermId}
                        locationId={locationId} setLocationId={setLocationId} storeId={storeId} setStoreId={setStoreId}
                        poInwardOrDirectInward={poInwardOrDirectInward} setPoInwardOrDirectInward={setPoInwardOrDirectInward}
                        inwardItemSelection={inwardItemSelection} setInwardItemSelection={setInwardItemSelection}
                        deliveryItems={deliveryItems} setDeliveryItems={setDeliveryItems}
                        partyId={partyId} setPartyId={setPartyId} onNew={onNew} locationData={locationData} branchList={branchList}
                        supplierList={supplierList} yarnList={yarnList} colorList={colorList} uomList={uomList} hsnList={hsnList} salesDeliveryId={salesDeliveryId} setSalesDeliveryId={setSalesDeliveryId} setPosId={setPosId} posId={posId} returnType={returnType} setReturnType={setReturnType}
                        exchangeItems={exchangeItems} setExchangeItems={setExchangeItems}
                        termsData={termsData}
                    />
                </div>

            ) : (
                <div className="flex h-[calc(100vh-5rem)] min-h-0 flex-col bg-[#F1F1F0]">
                    <div className="mb-2 flex shrink-0 flex-col items-start justify-between gap-x-4 rounded-tl-lg rounded-tr-lg border border-gray-200 bg-white px-1 py-0.5 shadow-sm sm:flex-row sm:items-center">

                        <h1 className="text-lg font-bold text-gray-800">Sales Return</h1>

                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-2 py-1 rounded-md flex items-center gap-2 text-xs"
                            onClick={() => { setShowManufacturer(true); onNew() }}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-white shadow-sm">

                        <SalesReturnReport
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
