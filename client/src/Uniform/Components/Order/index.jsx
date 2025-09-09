import { useEffect, useState } from 'react';
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";


import OrderForm from './orderForm';
import CommonTable from '../../../Shocks/CommonReport/CommonTable';
import { useDeleteOrderMutation, useGetOrderQuery } from '../../../redux/uniformService/OrderService';
import { getCommonParams, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import { toast } from 'react-toastify';
import OrderFormUi from './orderFormUi';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import Swal from 'sweetalert2';
import { ReusableTable } from '../../../Inputs';
import { Loader } from '../../../Basic/components';


const Order = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('this-month');
    const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [id, setId] = useState("");
    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const [readOnly, setReadOnly] = useState(false);
    const params = {
        branchId, userId, finYearId
    };
    const [orderDetails, setOrderDetails] = useState([])

    const { data: partyData } = useGetPartyQuery({ params })
    const [removeData] = useDeleteOrderMutation();

    const [serachDocNo, setSearchDocNo] = useState("")
    const [serachDate, setSearchDate] = useState("")
    const [searchCustomer, setSearchCustomer] = useState("")
  const [dataPerPage, setDataPerPage] = useState("10");

    const searchFields = {
        serachDocNo,
        serachDate,
        searchCustomer,
    };
    useEffect(() => {
        setCurrentPageNumber(1);
    }, [
        serachDocNo,
        serachDate,
        searchCustomer,
    ]);

    useEffect(() => {
        if (orderDetails?.length >= 1) return
        setOrderDetails(prev => {
            let newArray = Array?.from({ length: 1 - prev?.length }, () => {
                return {
                    yarnNeedleId: "", machineId: "", fiberContentId: "", description: "", socksMaterialId: "",
                    measurements: "", sizeId: "", styleId: "", legcolorId: "", footcolorId: "",
                    stripecolorId: "", noOfStripes: "0", socksTypeId: "",
                    orderSizeDetails: [{
                        qty: 0.00, sizeMeasurement: "", sizeId: ""

                    }],
                    orderYarnDetails: [{ yarnId: "" }]

                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setOrderDetails, orderDetails])

    const columns = [
        {
            header: 'S.No',
            accessor: (item, index) => parseInt(index) + parseInt(1),
            className: 'font-medium text-gray-900 text-center w-[10px] py-1',
            search: ""
        },
        {
            header: 'Order No',
            accessor: (item) => item.docId,
            className: 'font-medium text-gray-900  text-center  w-[120px]  py-1  px-2',
            search: "Order No",
            value: serachDocNo,
            setValue: setSearchDocNo,

        },
        {
            header: 'Order Date',
            accessor: (item) => item.docDate,
            className: 'font-medium text-gray-900 text-center w-[130px]  py-1  px-2',
            search: "Order Date",
            value: serachDate,
            setValue: setSearchDate,

        },
        {
            header: 'Customer',
            accessor: (item) => item.Party?.name,
            className: 'font-medium text-gray-900 w-[500px]  py-1  px-2',
            search: "Customer",
            value: searchCustomer,
            setValue: setSearchCustomer,
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

    const handleDelete = async (id) => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                let deldata = await removeData(id).unwrap();
                if (deldata?.statusCode == 1) {
                    Swal.fire({
                        icon: "error",
                        title: "Child record Exists",
                        text: deldata.data?.message || "Data cannot be deleted!",
                    });
                    return;
                }
                setId("");
                Swal.fire({
                    title: "Deleted Successfully",
                    icon: "success",
                    timer: 1000,
                });
                setShowOrderForm(false);
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Submission error",
                    text: error.data?.message || "Something went wrong!",
                });
                setShowOrderForm(false);
            }
        }
    };
    const onNew = () => {
        setId("");
        setReadOnly(false);
        setOrderDetails([]);

    }

    const [currentPageNumber, setCurrentPageNumber] = useState(1);

    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    };
    const { data: orderData, isFetching, isLoading } = useGetOrderQuery({
        params: {
            branchId,
            ...searchFields,
            pagination: true,
            dataPerPage,
            pageNumber: currentPageNumber,
        }
    });
    if (isLoading || isFetching) return <Loader />
    return (
        <>
            {showOrderForm ? (
                <OrderFormUi orderDetails={orderDetails} setOrderDetails={setOrderDetails} readOnly={readOnly} setReadOnly={setReadOnly} id={id} setId={setId} onClose={() => { setShowOrderForm(false); setReadOnly(prev => !prev) }}
                    partyData={partyData?.data} setShowOrderForm={setShowOrderForm}
                />
            ) : (
                <div className="p-1 bg-[#F1F1F0] h-[85%]">
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800"> Order Report</h1>

                        </div>
                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
                            onClick={() => { setShowOrderForm(true); onNew() }}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden  ">
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