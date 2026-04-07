import { useState } from 'react';
import { FaPlus } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { push } from '../../../redux/features/opentabs';
import { findFromList, getCommonParams } from '../../../Utils/helper';
import { toast } from 'react-toastify';
import CommonTable from '../../../Shocks/CommonReport/CommonTable';
import { useGetOrderQuery } from '../../../redux/uniformService/OrderService';
import { useAddDirectInwardOrReturnMutation, useDeleteDirectInwardOrReturnMutation, useGetDirectInwardOrReturnQuery } from '../../../redux/uniformService/DirectInwardOrReturnServices';
import PurchaseInwardForm from './PurchaseInwardFormUi';
import moment from 'moment';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import Swal from 'sweetalert2';
import PurchaseInwardFormReport from './PurchaseinwardFormReport';
import { useGetLocationMasterQuery } from '../../../redux/uniformService/LocationMasterServices';
import { useGetBranchQuery } from '../../../redux/services/BranchMasterService';
import { useGetYarnMasterQuery } from '../../../redux/uniformService/YarnMasterServices';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { childRecordCount } from '../../../Inputs';
import { usePermissionForUsers } from '../../../Basic/components/HasPermission';
import useInvalidateTags from '../../../CustomHooks/useInvalidateTags';





const PurchaseInward = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('this-month');
    const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showManufacturer, setShowManufacturer] = useState(false);
    const [id, setId] = useState("");
    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const [poInwardOrDirectInward, setPoInwardOrDirectInward] = useState("DirectInward");


    const [docId, setDocId] = useState("New")
    const [date, setDate] = useState("")
    const [readOnly, setReadOnly] = useState('')
    const [transType, setTransType] = useState("DyedYarn");
    const [dcNo, setDcNo] = useState("")
    const [dcDate, setDcDate] = useState('')
    const [supplierId, setSupplierId] = useState('')
    const [payTermId, setPayTermId] = useState("");
    const [locationId, setLocationId] = useState('');
    const [storeId, setStoreId] = useState("")
    const [inwardItemSelection, setInwardItemSelection] = useState(false)
    const [directInwardReturnItems, setDirectInwardReturnItems] = useState([]);
    const [partyId, setPartyId] = useState('')

    const { hasPermission } = usePermissionForUsers()

    // const Iscreate = hasPermission(null, "create", null, true)

    // console.log(Iscreate, "Iscreate")

    const params = {
        branchId, userId, finYearId
    };

    const { data: locationData } = useGetLocationMasterQuery({ params: { branchId } });
    const { data: branchList } = useGetBranchQuery({ params: { companyId } });
    const { data: supplierList } = useGetPartyQuery({ params: { ...params } });

    const { data: allData, isLoading, isFetching } = useGetDirectInwardOrReturnQuery({ params: { branchId, poInwardOrDirectInward } });
    const [addData] = useAddDirectInwardOrReturnMutation();

    const [removeData] = useDeleteDirectInwardOrReturnMutation();
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

    const dispatch = useDispatch();

    const handleConvertToReturn = (dataObj) => {
        dispatch(push({ name: "PURCHASE RETURN", projectId: dataObj.id }));
    };

    const handleDelete = async (id, childRecord) => {


        if (childRecordCount(childRecord)) {
            Swal.fire({
                icon: 'error',
                text: 'Child Record Exists',
            });
            return
        }

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
        setSupplierId("")
        setPartyId('')
    }


    function handleCreatefunction() {
        setShowManufacturer(true)
        onNew()
    }

    return (
        <>
            {showManufacturer ? (
                <div className="h-[calc(100vh-6rem)] min-h-0 overflow-hidden">
                    <PurchaseInwardForm
                        onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }} id={id} setId={setId}
                        docId={docId} setDocId={setDocId} date={date} setDate={setDate} readOnly={readOnly} setReadOnly={setReadOnly}
                        transType={transType} setTransType={setTransType} dcNo={dcNo} setDcNo={setDcNo} dcDate={dcDate} setDcDate={setDcDate}
                        supplierId={supplierId} setSupplierId={setSupplierId} payTermId={payTermId} setPayTermId={setPayTermId}
                        locationId={locationId} setLocationId={setLocationId} storeId={storeId} setStoreId={setStoreId}
                        poInwardOrDirectInward={poInwardOrDirectInward} setPoInwardOrDirectInward={setPoInwardOrDirectInward}
                        inwardItemSelection={inwardItemSelection} setInwardItemSelection={setInwardItemSelection}
                        directInwardReturnItems={directInwardReturnItems} setDirectInwardReturnItems={setDirectInwardReturnItems}
                        partyId={partyId} setPartyId={setPartyId} onNew={onNew} locationData={locationData} branchList={branchList}
                        supplierList={supplierList} yarnList={yarnList} colorList={colorList} uomList={uomList} hasPermission={hasPermission} addData={addData} invalidateTagsDispatch={invalidateTagsDispatch}
                    />
                </div>

            ) : (
                <div className="p-2 bg-[#F1F1F0] min-h-screen">
                    <div className="flex flex-col sm:flex-row justify-between bg-white px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">

                        <h1 className="text-2xl font-bold text-gray-800">Purchase Inward</h1>

                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-2 py-1 rounded-md flex items-center gap-2 text-xs"
                            onClick={() => hasPermission(handleCreatefunction, "create")}

                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                        <PurchaseInwardFormReport
                            hasPermission={hasPermission}
                            data={allData?.data || []}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onConvertToReturn={handleConvertToReturn}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default PurchaseInward;
