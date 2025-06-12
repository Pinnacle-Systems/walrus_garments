import { useState } from 'react';
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";


import OrderForm from './orderForm';
import CommonTable from '../../../Shocks/CommonReport/CommonTable';
import { useDeleteOrderMutation, useGetOrderQuery } from '../../../redux/uniformService/OrderService';
import { getCommonParams } from '../../../Utils/helper';
import { toast } from 'react-toastify';
import OrderFormUi from './orderFormUi';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';


const Order = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('this-month');
    const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showManufacturer, setShowManufacturer] = useState(false);
    const [id, setId] = useState("");
    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const [readOnly, setReadOnly] = useState(false);
    const params = {
        branchId, userId, finYearId
    };
    const [orderDetails, setOrderDetails] = useState([])

    const { data: orderData } = useGetOrderQuery({ params });
    const { data: partyData } = useGetPartyQuery({ params })

    console.log(orderData, "orderDataorderData", partyData, "prtyyy")

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






    // const sampleData = [
    //     {
    //         id: 1,
    //         supplier: 'Anugraha Fashion',
    //         contact: 'manoj - manojpinnaclesystems.co.in',
    //         orderNo: 'PO-2023-001',
    //         orderDate: '2023-07-15',
    //         taxable: '₹45,000',
    //         amount: '₹53,100',
    //         status: 'pending'
    //     },
    //     {
    //         id: 2,
    //         supplier: 'Jiwin Supplier',
    //         contact: 'tamil - tamilpinnaclesystems.co.in',
    //         orderNo: 'PO-2023-002',
    //         orderDate: '2023-07-18',
    //         taxable: '₹12,500',
    //         amount: '₹14,750',
    //         status: 'processed'
    //     },
    //     ...Array.from({ length: 15 }, (_, i) => ({
    //         id: i + 3,
    //         supplier: `Supplier ${i + 3}`,
    //         contact: `contact-${i + 3}@example.com`,
    //         orderNo: `PO-2023-${String(i + 3).padStart(3, '0')}`,
    //         orderDate: `2023-07-${String(20 + i).padStart(2, '0')}`,
    //         taxable: `₹${(Math.random() * 50000).toFixed(2)}`,
    //         amount: `₹${(Math.random() * 60000).toFixed(2)}`,
    //         status: Math.random() > 0.5 ? 'pending' : 'processed'
    //     }))
    // ];

    const handleView = (orderId) => {

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
        setOrderDetails([]);

    }

    return (
        <>
            {showManufacturer ? (
                <OrderFormUi orderDetails={orderDetails} setOrderDetails={setOrderDetails} readOnly={readOnly} setReadOnly={setReadOnly} id={id} setId={setId} onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }}
                    partyData={partyData?.data}
                />
            ) : (
                <div className="p-2 bg-[#F1F1F0] min-h-screen">
                    <h1 className="text-2xl font-bold text-gray-800"> Order</h1>
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
                            {/* <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-3 py-1.5 border rounded-md text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processed">Processed</option>
                            </select> */}
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
                            data={orderData?.data || []}
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

export default Order;