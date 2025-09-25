import { useState } from 'react';
import { FaPlus } from "react-icons/fa";
import { findFromList, getCommonParams } from '../../../Utils/helper';
import { toast } from 'react-toastify';
import CommonTable from '../../../Shocks/CommonReport/CommonTable';
import { useGetOrderQuery } from '../../../redux/uniformService/OrderService';
import { useGetDirectInwardOrReturnQuery } from '../../../redux/uniformService/DirectInwardOrReturnServices';
import PurchaseInwardForm from './PurchaseInwardFormUi';
import moment from 'moment';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import PurchaseInwardFormReport from './PurchaseinwardFormReport';





const PurchaseInward = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('this-month');
    const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showManufacturer, setShowManufacturer] = useState(false);
    const [id, setId] = useState("");
    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const [readOnly, setReadOnly] = useState(false);
    const [poInwardOrDirectInward, setPoInwardOrDirectInward] = useState("DirectInward");

    const params = {
        branchId, userId, finYearId
    };
    const [orderDetails, setOrderDetails] = useState([])
    const { data: allData, isLoading, isFetching } = useGetDirectInwardOrReturnQuery({ params: { branchId, poInwardOrDirectInward } });
    const { data: partyData } = useGetPartyQuery({ params })
    // const [removeData] = useDeleteOrderMutation();
    const columns = [
        {
            header: 'S.No',
            accessor: (item, index) => index + 1,
            cellClass: () => 'font-medium text-gray-900'
        },

        {
            header: 'Inward No.',
            accessor: (item) => item.docId,
            cellClass: () => 'font-medium text-gray-900'
        },
        {
            header: 'InwardType',
            accessor: (item) => item.poInwardOrDirectInward,
            cellClass: () => 'text-gray-800 uppercase'
        },
        {
            header: 'Inward Date',
            accessor: (item) => moment.utc(item.createdAt).format("YYYY-MM-DD")
        },
        {
            header: 'Supplier',
            accessor: (item) => findFromList(item.supplierId, partyData?.data, "name"),
            cellClass: () => 'uppercase'
        },
        {
            header: 'Po Type',
            accessor: (item) => item.poType,
            cellClass: () => 'text-gray-800 uppercase'
        },

    ];



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

    const handleDelete = async (orderId) => {
        if (orderId) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                // await removeData(orderId)
                setId("");
                onNew();
                toast.success("Deleted Successfully");
            } catch (error) {
                toast.error("something went wrong");
            }
        }

    };
    const onNew = () => {
        setId("");
        setReadOnly(false);
        setOrderDetails([]);

    }

    return (
        <>
            {showManufacturer ? (
                <PurchaseInwardForm
                    onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }} id={id} setId={setId}
                //  orderDetails={orderDetails} setOrderDetails={setOrderDetails} readOnly={readOnly} setReadOnly={setReadOnly} id={id} setId={setId} onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }}
                //     partyData={partyData?.data}
                />

            ) : (
                <div className="p-2 bg-[#F1F1F0] min-h-screen">
                    <h1 className="text-2xl font-bold text-gray-800">Purchase Inward</h1>
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-3 py-1.5 border rounded-md text-sm"
                            >
                                <option value="this-month">This Month</option>
                                <option value="last-month">Last Month</option>
                            </select>
                            <select
                                value={selectedFinYear}
                                onChange={(e) => setSelectedFinYear(e.target.value)}
                                className="px-3 py-1.5 border rounded-md text-sm"
                            >
                                <option value="2023-2024">2023-2024</option>
                                <option value="2022-2023">2022-2023</option>
                            </select>

                        </div>
                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1.5 rounded-md flex items-center gap-2 text-sm"
                            onClick={() => { setShowManufacturer(true); onNew() }}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {/* <CommonTable
                            columns={columns}
                            data={allData?.data || []}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            itemsPerPage={10}
                        /> */}
                        <PurchaseInwardFormReport
                            columns={columns}
                            data={allData?.data || []}
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

export default PurchaseInward;