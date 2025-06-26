import { useState } from 'react';
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";


import SampleForm from './SampleForm';
import CommonTable from '../../../Shocks/CommonReport/CommonTable';
import { useDeleteOrderMutation, useGetOrderQuery } from '../../../redux/uniformService/OrderService';
import { getCommonParams } from '../../../Utils/helper';
import { toast } from 'react-toastify';
import SampleEntryUi from './sampeEntryFormUi';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import {  useGetSampleQuery } from '../../../redux/uniformService/SampleService';


const SampleEntry = () => {
    const [sampleDetails, setSampleDetails] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('this-month');
    const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showManufacturer, setShowManufacturer] = useState(false);
    const [id, setId] = useState("");
    const [orderId,setOrderId] = useState("")
    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const [readOnly, setReadOnly] = useState(false);
    const params = {
        branchId, userId, finYearId
    };
    const { data: orderData } = useGetOrderQuery({ params });
    const { data: sampleEntryData } = useGetSampleQuery({ params });

    const { data: partyData } = useGetPartyQuery({ params })
    const [removeData] = useDeleteOrderMutation();

    const columns = [
        {
            header: 'S.No',
            accessor: (item, index) => index + 1,
            cellClass: () => 'font-medium text-gray-900'
        },
        {
            header: 'Sample No.',
            accessor: (item) => item.docId,
            cellClass: () => 'font-medium text-gray-900'
        },
        {
            header: 'Sample Date',
            accessor: (item) => item.createdAt
        },
        {
            header: 'Party',
            accessor: (item) => item.Party?.name,
            cellClass: () => 'uppercase'
        },
        {
            header: 'ContactPerson',
            accessor: (item) => item.contactPersonName,
            cellClass: () => 'text-gray-800 uppercase'
        },
        {
            header: 'Contact',
            accessor: (item) => item.phone,
            cellClass: () => 'text-gray-800 uppercase'
        },
    ];



    const handleView = (id) => {

        setId(id)
        setShowManufacturer(true)
        setReadOnly(true);
    };

    const handleEdit = (id) => {
        setId(id)
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
                toast.success("Deleted Successfully");
            } catch (error) {
                toast.error("something went wrong");
            }
        }

    };
    const onNew = () => {
        setId("");
        setReadOnly(false);
        setSampleDetails([]);

    }

    return (
        <>
            {showManufacturer ? (
                <SampleEntryUi sampleDetails={sampleDetails} setSampleDetails={setSampleDetails} readOnly={readOnly} setReadOnly={setReadOnly} id={id} setId={setId} onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }}
                    partyData={partyData?.data} orderData={orderData} orderId={orderId} setOrderId={setOrderId}
                />
            ) : (
                <div className="p-2 bg-[#F1F1F0] min-h-screen">
                    <h1 className="text-2xl font-bold text-gray-800"> Sample Entry</h1>
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
                        <CommonTable
                            columns={columns}
                            data={sampleEntryData?.data || []}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            itemsPerPage={10}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default SampleEntry;