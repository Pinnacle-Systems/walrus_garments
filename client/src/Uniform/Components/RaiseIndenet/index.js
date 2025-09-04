import { useState } from "react";
import { getCommonParams } from "../../../Utils/helper";
import { ReusableTable } from "../../../Inputs";
import { FaPlus } from "react-icons/fa";
import { useGetOrderQuery } from "../../../redux/uniformService/OrderService";
import Swal from "sweetalert2";
import moment from "moment";
import { useDeleteRaiseIndentMutation, useGetRaiseIndentQuery } from "../../../redux/uniformService/RaiseIndenetServices";
import { useCallback } from "react";
import { useEffect } from "react";
import IndentRaiseForm from "./IndentRaiseForm";





const RaiseIndentForm = () => {


    const [selectedPeriod, setSelectedPeriod] = useState('this-month');
    const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
    const [form, setForm] = useState(false);
    const [id, setId] = useState("");
    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const [readOnly, setReadOnly] = useState(false);
    const [orderId, setOrderId] = useState('')
    const [docId, setDocId] = useState("New")
    const [showOrderForm, setShowOrderForm] = useState(true);
    const [active, setActive] = useState(true);
    const [orderDetailsId, setOrderDetailsId] = useState("");
    const [date, setDate] = useState(moment(new Date()).format("YYYY-MM-DD"));
    const [dueDate, setDueDate] = useState("");
    const [sampleDetails, setSampleDetails] = useState([]);
    const [orderSizeDetails, setOrderSizeDetails] = useState([])
    const [orderYarnDetails, setOrderYarnDetails] = useState([])
    const [raiseIndentItems, setRaiseIndentItems] = useState([])
    const [partyId, setPartyId] = useState("");
    const [childRecord, setChildrecord] = useState("")
    const [requirementId,setrequirementId] = useState("")
    const [isRaiseRendent,setRaiseIndenet]   =  useState(false)

    const params = {
        branchId, userId, finYearId
    };

    const { data: allData, isLoading, isFetching } = useGetRaiseIndentQuery({ params: { branchId } });
    const { data: orderData, isLoading: sampelDataLoading, isFetching: sampelDataFetching } = useGetOrderQuery({ params });

    const [removeData] = useDeleteRaiseIndentMutation();

        const getNextDocId = useCallback(() => {
            //   if (id || isLoading || isFetching) return
            if (allData?.nextDocId) {
                setDocId(allData.nextDocId)
            }
        }, [allData, id])
    
        useEffect(getNextDocId, [getNextDocId])

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
        setForm(true)
        setReadOnly(true);
    };

    const handleEdit = (id) => {
        setId(id)
        setForm(true)
        setReadOnly(false);
    };


    const handleDelete = async (id) => {
        if (id) {
            if (childRecord.current > 0) {
                Swal.fire({
                    title: "Child Record Exist",
                    icon: "success",
                    timer: 1000,

                });
                return

            }
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                await removeData(id)
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
            {form ? (
                <IndentRaiseForm
                setDocId={setDocId}
                    onClose={() => { setForm(false); setReadOnly(prev => !prev) }} id={id} setId={setId} readOnly={readOnly} setReadOnly={setReadOnly} orderData={orderData} orderId={orderId} setOrderId={setOrderId} setChildrecord={setChildrecord}

                    orderSizeDetails={orderSizeDetails} setOrderSizeDetails={setOrderSizeDetails} orderYarnDetails={orderYarnDetails} setOrderYarnDetails={setOrderYarnDetails} orderDetailsId={orderDetailsId} setOrderDetailsId={setOrderDetailsId}

                    partyId={partyId} setPartyId={setPartyId} docId={docId} active={active} setShowOrderForm={setShowOrderForm} date={date} sampleDetails={sampleDetails} raiseIndentItems={raiseIndentItems} setRaiseIndentItems={setRaiseIndentItems}

                    dueDate={dueDate} setDueDate={setDueDate} requirementId={requirementId} setrequirementId={setrequirementId}  isRaiseRendent={isRaiseRendent}  setRaiseIndenet={setRaiseIndenet}
                />

            ) : (
                <div className="p-1 bg-[#F1F1F0] h-[85%]">
                    <h1 className="text-2xl font-bold text-gray-800">Raise Indent Form</h1>
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
                            onClick={() => { setForm(true); onNew() }}
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

export default RaiseIndentForm;