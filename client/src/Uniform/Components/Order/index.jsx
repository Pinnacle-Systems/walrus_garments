import { useState } from 'react';
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";


import OrderForm from './orderForm';
import CommonTable from '../../../Shocks/CommonReport/CommonTable';
import { useDeleteOrderMutation, useGetOrderQuery } from '../../../redux/uniformService/OrderService';
import { getCommonParams } from '../../../Utils/helper';
import { toast } from 'react-toastify';
import OrderFormUi from './orderFormUi';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import Swal from 'sweetalert2';
import { ReusableTable } from '../../../Inputs';


const Order = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('this-month');
    const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [id, setId] = useState("");
    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const [readOnly, setReadOnly] = useState(false);
    const params = {
        branchId, userId, finYearId
    };
    const [orderDetails, setOrderDetails] = useState([])
    const { data: orderData } = useGetOrderQuery({ params });
    const { data: partyData } = useGetPartyQuery({ params })
    const [removeData] = useDeleteOrderMutation();
    const columns = [
        {
            header: 'S.No',
            accessor: (item, index) => index + 1,
            className: 'font-medium text-gray-900 w-[3%]  text-center'

        },
        {
            header: 'Order No.',
            accessor: (item) => item.docId,
            className: 'font-medium text-gray-900 w-[10%]'
        },
        {
            header: 'Order Date',
            accessor: (item) => item.docDate,
            className: 'font-medium text-gray-900 w-[10%]'

        },
        {
            header: 'Customer',
            accessor: (item) => item.Party?.name,
            className: 'font-medium text-gray-900 w-[40%]'
        },
        // {
        //     header: 'ContactPerson',
        //     accessor: (item) => item.contactPersonName,
        //     cellClass: () => 'text-gray-800 uppercase'
        // },
        // {
        //     header: 'Contact',
        //     accessor: (item) => item.phone,
        //     cellClass: () => 'text-gray-800 uppercase'
        // },
        {
            header: '',
            accessor: (item) => item.none,
            className: 'font-medium text-gray-900 w-[40%]'
        },
    ];



    const handleView = (orderId) => {

        setId(orderId)
        setShowOrderForm(true)
        setReadOnly(true);
    };

    const handleEdit = (orderId) => {
        setId(orderId)
        setShowOrderForm(true)
        setReadOnly(false);
    };

    const handleDelete = async (orderId) => {
        let returnData;
        if (orderId) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                 await removeData(orderId)
                setId("");
                onNew();
                Swal.fire({
                    title: "Deleted Successfully",
                    icon: "success",
                    timer: 1000,

                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Submission error',
                    text: error.data?.message || 'Something went wrong!',
                });
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
            {showOrderForm ? (
                <OrderFormUi orderDetails={orderDetails} setOrderDetails={setOrderDetails} readOnly={readOnly} setReadOnly={setReadOnly} id={id} setId={setId} onClose={() => { setShowOrderForm(false); setReadOnly(prev => !prev) }}
                    partyData={partyData?.data} setShowOrderForm={setShowOrderForm}
                />
            ) : (
                <div className="p-1 bg-[#F1F1F0] h-[40%]">
                    <h1 className="text-2xl font-bold text-gray-800"> Order Information</h1>
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-3 py-1 border rounded-md text-sm"
                            >
                                <option value="this-month">This Month</option>
                                <option value="last-month">Last Month</option>
                            </select>
                            <select
                                value={selectedFinYear}
                                onChange={(e) => setSelectedFinYear(e.target.value)}
                                className="px-3 py-1 border rounded-md text-sm"
                            >
                                <option value="2023-2024">2023-2024</option>
                                <option value="2022-2023">2022-2023</option>
                            </select>

                        </div>
                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
                            onClick={() => { setShowOrderForm(true); onNew() }}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden  w-full">
                        <ReusableTable
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