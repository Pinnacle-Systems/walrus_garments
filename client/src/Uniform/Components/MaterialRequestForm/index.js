import { useState } from "react";
import { getCommonParams } from "../../../Utils/helper";
import { DropdownInput, ReusableTable } from "../../../Inputs";
import { FaPlus } from "react-icons/fa";
import { useGetOrderQuery } from "../../../redux/uniformService/OrderService";
import Swal from "sweetalert2";
import moment from "moment";
import { useDeleteRaiseIndentMutation, useGetRaiseIndentQuery } from "../../../redux/uniformService/RaiseIndenetServices";
import { useCallback } from "react";
import { useEffect } from "react";
import IndentRaiseForm from "./IndentRaiseForm";
import { Production } from "../../../Utils/DropdownData";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useGetMaterialIssueQuery } from "../../../redux/uniformService/MaterialIssueServices";
import { Loader } from "../../../Basic/components";





const MaterialRequestForm = () => {


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
    const [requirementId, setRequirementId] = useState("")
    const [isRaiseRendent, setRaiseIndenet] = useState(false)
    const [isReport, setIsReport] = useState("Material Request")
    const [subGridForm ,setSubGridForm]  =   useState(false)

    const params = {
        branchId, userId, finYearId
    };

    const { data: allData, isLoading, isFetching } = useGetRaiseIndentQuery({ params: { branchId, indentRaise: true } });
    const { data: materialIssueData } = useGetMaterialIssueQuery({ params: { branchId } });

    const { data: orderData, isLoading: sampelDataLoading, isFetching: sampelDataFetching } = useGetOrderQuery({ params });

    const { data: supplierList } = useGetPartyQuery({ params: { ...params } });
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
            accessor: (item, index) => parseInt(index) + parseInt(1),
            className: 'font-medium text-center text-gray-900 w-[20px]'
        },

        {
            header: 'Doc No',
            accessor: (item) => item?.docId,
            className: 'font-medium text-center text-gray-900 w-[40px] py-1 px-2'
        },

        {
            header: 'Order No',
            accessor: (item) => item?.Order?.docId,
            className: 'font-medium text-center text-gray-900 w-[60px] py-1 px-2'
        },


        {
            header: 'Customer',
            accessor: (item) => item?.Party?.name,
            className: 'font-medium text-start text-gray-900 w-[500px] py-1 px-2'
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
        setOrderId("")
        setOrderDetailsId("")
        setRequirementId("")
        setRaiseIndentItems([])
        setOrderSizeDetails([])
        setOrderYarnDetails([])
        setRaiseIndenet(false)
        setPartyId("")

    }

        if (isLoading || isFetching) return <Loader />

    return (
        <>
            {form ? (
                <IndentRaiseForm
                    setDocId={setDocId} supplierList={supplierList}
                    onClose={() => { setForm(false); setReadOnly(prev => !prev) }} id={id} setId={setId} readOnly={readOnly} setReadOnly={setReadOnly} orderData={orderData} orderId={orderId} setOrderId={setOrderId} setChildrecord={setChildrecord}

                    orderSizeDetails={orderSizeDetails} setOrderSizeDetails={setOrderSizeDetails} orderYarnDetails={orderYarnDetails} setOrderYarnDetails={setOrderYarnDetails} orderDetailsId={orderDetailsId} setOrderDetailsId={setOrderDetailsId}

                    partyId={partyId} setPartyId={setPartyId} docId={docId} active={active} setShowOrderForm={setShowOrderForm} date={date} sampleDetails={sampleDetails} raiseIndentItems={raiseIndentItems} setRaiseIndentItems={setRaiseIndentItems}

                    dueDate={dueDate} setDueDate={setDueDate} requirementId={requirementId} setRequirementId={setRequirementId} isRaiseRendent={isRaiseRendent} setRaiseIndenet={setRaiseIndenet}   setSubGridForm={setSubGridForm}   subGridForm={subGridForm}
                />

            ) : (
                <div className="p-1 bg-[#F1F1F0] h-[85%]">
                    <h1 className="text-2xl font-bold text-gray-800">Material Request Form</h1>
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
                        <div className="flex flex-row  gap-4  ">

                            <div >
                                {/* <select
                                    value={isReport}
                                    onChange={(e) => setIsReport(e.target.value)}
                                    className="px-3 py-1 border rounded-md text-sm"
                                >
                                    <option value="Material Request">Material Request</option>
                                    <option value="Material Issue">Material Issue</option>
                                </select> */}
                                <div className="flex flex-row gap-5">
                                    {/* Material Request */}
                                    <button
                                        className={`px-4 py-1 rounded-md flex items-center gap-2 text-sm border transition-colors duration-200
                                          ${isReport === "Material Request"
                                                ? "bg-green-600 text-white border-green-600 ring-2 ring-green-300"   // ✅ Active state
                                                : "bg-white text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                                            }`}
                                        onClick={() => { onNew(); setIsReport("Material Request") }}
                                    >
                                        Material Request
                                    </button>

                                    {/* Material Issue */}
                                    <button
                                        className={`px-4 py-1 rounded-md flex items-center gap-2 text-sm border transition-colors duration-200
                             ${isReport === "Material Issue"
                                                ? "bg-amber-500 text-white border-amber-500 ring-2 ring-amber-300"  // ✅ Active state
                                                : "bg-white text-amber-600 border-amber-500 hover:bg-amber-500 hover:text-white"
                                            }`}
                                        onClick={() => { onNew(); setIsReport("Material Issue") }}
                                    >
                                        Material Issue
                                    </button>
                                </div>


                            </div>
                            <button
                                className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4  rounded-md flex items-center gap-2 text-sm"
                                onClick={() => { setForm(true); onNew() }}
                            >
                                <FaPlus /> Create New
                            </button>
                        </div>
                    </div>

                    {isReport === "Material Request" ? (

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

                    )
                        :
                        (

                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <ReusableTable
                                    columns={columns}
                                    data={materialIssueData?.data || []}
                                    onView={handleView}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    itemsPerPage={10}
                                />
                            </div>
                        )

                    }






                </div>
            )}
        </>
    );
};

export default MaterialRequestForm;