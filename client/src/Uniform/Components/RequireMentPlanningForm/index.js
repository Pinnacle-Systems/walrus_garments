import { useState } from "react";
import { getCommonParams } from "../../../Utils/helper";
import { ReusableTable } from "../../../Inputs";
import { FaPlus } from "react-icons/fa";
import RequirmentForm from "./RequireMentFormUi";
import { useDeleteRequirementPlanningFormMutation, useGetRequirementPlanningFormQuery } from "../../../redux/uniformService/RequirementPlanningFormServices";
import { useGetSampleQuery } from "../../../redux/uniformService/SampleService";
import { useGetOrderQuery } from "../../../redux/uniformService/OrderService";
import Swal from "sweetalert2";





const RequirementPlanningForm = () => {


    const [selectedPeriod, setSelectedPeriod] = useState('this-month');
    const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [requirementForm, setRequirementForm] = useState(false);
    const [id, setId] = useState("");
    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const [readOnly, setReadOnly] = useState(false);
    const [poInwardOrDirectInward, setPoInwardOrDirectInward] = useState("DirectInward");
    const [orderId, setOrderId] = useState('')
    const [orderDetails, setOrderDetails] = useState([])

    const params = {
        branchId, userId, finYearId
    };

    const { data: allData, isLoading, isFetching } = useGetRequirementPlanningFormQuery({ params: { branchId } });
    const { data: orderData, isLoading: sampelDataLoading, isFetching: sampelDataFetching } = useGetOrderQuery({ params });

    const [removeData] = useDeleteRequirementPlanningFormMutation();


    const columns = [
        {
            header: 'S.No',
            accessor: (item, index) => index + 1,
            className: 'font-medium item-center text-gray-900 w-[5%]'
        },

        {
            header: 'Doc No',
            accessor: (item) => item?.docId,
            className: 'font-medium text-gray-900 w-[10%]'
        },

        {
            header: 'Order No',
            accessor: (item) => item?.order?.docId,
            className: 'font-medium text-gray-900 w-[10%]'
        },

        //    {
        //         header: 'Style No',
        //         accessor: (item) => item.none,
        //         className : 'font-medium text-gray-900 w-[80%]'
        //     },
        {
            header: 'Customer',
            accessor: (item) => item?.Party?.name,
            className: 'font-medium text-gray-900 w-[50%]'
        },
        {
            header: '',
            accessor: (item) => item?.none,
            className: 'font-medium text-gray-900 w-[40%]'
        },
    ];



    const handleView = (id) => {

        setId(id)
        setRequirementForm(true)
        setReadOnly(true);
    };

    const handleEdit = (orderId) => {
        setId(orderId)
        setRequirementForm(true)
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

    }

    return (
        <>
            {requirementForm ? (
                <RequirmentForm
                    onClose={() => { setRequirementForm(false); setReadOnly(prev => !prev) }} id={id} setId={setId} readOnly={readOnly}
                    orderData={orderData} setReadOnly={setReadOnly} orderId={orderId} setOrderId={setOrderId}
                //  orderDetails={orderDetails} setOrderDetails={setOrderDetails} 
                //     partyData={partyData?.data}
                />

            ) : (
                <div className="p-1 bg-[#F1F1F0] h-[85%]">
                    <h1 className="text-2xl font-bold text-gray-800">Requirement Planning Form</h1>
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
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
                            onClick={() => { setRequirementForm(true); onNew() }}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <ReusableTable
                            columns={columns}
                            data={allData?.data || []}
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

export default RequirementPlanningForm;