import { useState } from 'react';
import { FaPlus } from "react-icons/fa";
import CommonTable from '../../../Shocks/CommonReport/CommonTable';
import { useDeleteOrderMutation } from '../../../redux/uniformService/OrderService';
import { getCommonParams } from '../../../Utils/helper';
import { toast } from 'react-toastify';
import OrderFormUi from './orderFormUi';
import {
    useGetSampleQuery,
} from "../../../redux/uniformService/SampleService";
import {

    useGetPartyQuery,
} from "../../../redux/services/PartyMasterService";





const SampleEntry = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('this-month');
    const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');

    const [showManufacturer, setShowManufacturer] = useState(false);
    const [id, setId] = useState("");
    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const [readOnly, setReadOnly] = useState(false);
    const [sampleDetails, setSampleDetails] = useState([]);
    const params = {
        branchId,
    };




    const { data: sampleData } = useGetSampleQuery({ params });
    const { data: partyData } = useGetPartyQuery({ params })
    const [removeData] = useDeleteOrderMutation();
    const columns = [

        {
            header: 'Order No.',
            accessor: (item) => item.docId,
            cellClass: () => 'font-medium text-gray-900'
        },
        {
            header: 'Order Date',
            accessor: (item) => item.docDate
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

        // {
        //     header: 'Taxable (₹)',
        //     accessor: (item) => item.taxable
        // },
        // {
        //     header: 'Amount (₹)',
        //     accessor: (item) => item.amount,
        //     cellClass: () => 'font-semibold'
        // },
        // {
        //     header: 'Status',
        //     accessor: (item) => (
        //         <div className="flex items-center">
        //             <span className={`w-2 h-2 rounded-full mr-1 ${item.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
        //             <span className={`capitalize ${item.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>
        //                 {item.status}
        //             </span>
        //         </div>
        //     )
        // }
    ];



    const handleView = (orderId) => {
        if (!orderId) return
        setId(orderId)
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
                await removeData(orderId)
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
                <OrderFormUi sampleDetails={sampleDetails} setSampleDetails={setSampleDetails} readOnly={readOnly} setReadOnly={setReadOnly} id={id} setId={setId} onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }}
                    partyData={partyData?.data}
                />
            ) : (
                <div className="p-2 bg-[#F1F1F0] min-h-screen">
                    <h1 className="text-2xl font-bold text-gray-800">Sample Entry</h1>
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
                            data={sampleData?.data || []}
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