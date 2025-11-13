import { useCallback, useEffect, useState } from "react";
import { getCommonParams } from "../../../Utils/helper";
import { ReusableTable } from "../../../Inputs";
import { FaPlus } from "react-icons/fa";
import RequirmentForm from "./MateriaIssueForm";
import { useDeleteRequirementPlanningFormMutation, useGetRequirementPlanningFormQuery } from "../../../redux/uniformService/RequirementPlanningFormServices";
import { useGetSampleQuery } from "../../../redux/uniformService/SampleService";
import { useGetOrderQuery } from "../../../redux/uniformService/OrderService";
import Swal from "sweetalert2";
import moment from "moment";
import MaterialIssueForm from "./MateriaIssueForm";
import { useDeleteMaterialIssueMutation, useGetMaterialIssueQuery } from "../../../redux/uniformService/MaterialIssueServices";
import { useGetRaiseIndentQuery } from "../../../redux/uniformService/RaiseIndenetServices";
import { Loader } from "../../../Basic/components";
import MaterialRequestFormReport from "./MaterialRequestFormReport";
import MaterialIssueFormReport from "./MaterialIssueFormReport";





const MaterialIssue = () => {


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
    const [issueItems, setIssueItems] = useState([])
    const [partyId, setPartyId] = useState("");
    const [childRecord, setChildrecord] = useState("")
    const [isMaterialIssue, setIsMaterialIssue] = useState(false)
    const [isReport, setIsReport] = useState("Material Issue")
    const [materialRequstId, setMaterialRequstId] = useState("")
    const [requirementId, setRequirementId] = useState("")

    const params = {
        branchId, userId, finYearId
    };

    const { data: allData, isLoading, isFetching } = useGetMaterialIssueQuery({ params: { branchId } });
    const [removeData] = useDeleteMaterialIssueMutation();

    const { data: orderData, isLoading: sampelDataLoading, isFetching: sampelDataFetching } = useGetOrderQuery({ params });



    const getNextDocId = useCallback(() => {
        if (allData?.nextDocId) {
            setDocId(allData.nextDocId)
        }
    }, [allData, id])

    useEffect(getNextDocId, [getNextDocId])


    const columnsIssued = [
        {
            header: 'S.No',
            accessor: (item, index) => index + 1,
            className: 'font-medium text-center text-gray-900 w-[5%]'
        },

        {
            header: 'Doc No',
            accessor: (item) => item?.docId,
            className: 'font-medium text-gray-900 w-[40px] py-1 px-2'
        },

        {
            header: 'Order No',
            accessor: (item) => item?.Order?.docId,
            className: 'font-medium text-gray-900 w-[40px] py-1 px-2'
        },


        {
            header: 'Customer Name',
            accessor: (item) => item?.Party?.name,
            className: 'font-medium text-gray-900 w-[500px]  py-1 px-2'
        },

    ];

    const columnsInendentRaise = [
        {
            header: 'S.No',
            accessor: (item, index) => index + 1,
            className: 'font-medium text-center text-gray-900 w-[5%]'
        },

        {
            header: 'Doc No',
            accessor: (item) => item?.docId,
            className: 'font-medium text-gray-900 w-[40px] py-1 px-2'
        },

        {
            header: 'Order No',
            accessor: (item) => item?.Order?.docId,
            className: 'font-medium text-gray-900 w-[40px] py-1 px-2'
        },

        // {
        //     header: 'Style No',
        //     accessor: (item) => item?.OrderDetails?.style?.name,
        //     className: 'font-medium text-gray-900 w-[70px] py-1 px-2'
        // },
        //   {
        //     header: 'Requirement No',
        //     accessor: (item) => item?.RequirementPlanningForm?.docId,
        //     className: 'font-medium text-gray-900 w-[40px]  py-1 px-2'
        // },
        {
            header: 'Customer Name',
            accessor: (item) => item?.Party?.name,
            className: 'font-medium text-gray-900 w-[500px]  py-1 px-2'
        },

    ];

    const handleIssuedView = (id) => {

        setId(id)
        setForm(true)
        setReadOnly(true);
    };

    const handleIssuedEdit = (id) => {
        setId(id)
        setForm(true)
        setReadOnly(false);
    };


    const handleIssuedDelete = async (id) => {
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


    const handleIendentRaiseView = (id) => {

        // setMaterialRequstId(id)
        setOrderId(id)
        setForm(true)
        setReadOnly(true);
    };

 




    const onNew = () => {
        setId("");
        setReadOnly(false);
        setOrderId('')
        setOrderDetailsId("")
        setIssueItems([])
    }

    if (isLoading || isFetching) return <Loader />

    return (
        <>
            {form ? (

                <MaterialIssueForm
                    onClose={() => { setForm(false); setReadOnly(prev => !prev) }} id={id} setId={setId} readOnly={readOnly} setReadOnly={setReadOnly} orderData={orderData} orderId={orderId} setOrderId={setOrderId} setChildrecord={setChildrecord}
                    orderSizeDetails={orderSizeDetails} setOrderSizeDetails={setOrderSizeDetails} orderYarnDetails={orderYarnDetails} setOrderYarnDetails={setOrderYarnDetails} orderDetailsId={orderDetailsId} setOrderDetailsId={setOrderDetailsId}
                    partyId={partyId} setPartyId={setPartyId} docId={docId} active={active} setShowOrderForm={setShowOrderForm} date={date} sampleDetails={sampleDetails} issueItems={issueItems} setIssueItems={setIssueItems}
                    dueDate={dueDate} setDueDate={setDueDate} isMaterialIssue={isMaterialIssue} setIsMaterialIssue={setIsMaterialIssue} setMaterialRequstId={setMaterialRequstId} materialRequstId={materialRequstId}
                    requirementId={requirementId} setRequirementId={setRequirementId}
                />




            ) : (
                <div className="p-1 bg-[#F1F1F0] h-[85%]">
                    <h1 className="text-2xl font-bold text-gray-800">Material Issue Form</h1>
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
                        <div >
                            <div className="flex w-fit bg-gray-100 rounded-xl p-1 shadow-sm">
                                {["All", "Material Request", "Material Issue"].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => { onNew(); setIsReport(option) }}
                                        className={`px-4 py-1 text-sm font-medium rounded-lg transition-all duration-200
                                  ${isReport === option
                                                ? "bg-blue-600 text-white shadow"
                                                : "text-gray-600 hover:text-blue-600 hover:bg-white"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>

                        </div>



                    </div>
                    {isReport == "Material Issue" ?
                        <>
                            {/* <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <ReusableTable
                                    columns={columnsInendentRaise}
                                    data={indenetRaiseData?.data || []}

                                    onView={handleIendentRaiseView}
                                    onEdit={handleIendentRaiseEdit}
                                    itemsPerPage={10}
                                />
                            </div> */}
                            <MaterialIssueFormReport
                                onView={handleIendentRaiseView}

                            />

                        </>

                        :
                        <>
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                {/* <ReusableTable
                                    columns={columnsIssued}
                                    data={allData?.data || []}
                                    onView={handleIssuedView}
                                    onEdit={handleIssuedEdit}
                                    onDelete={handleIssuedDelete}
                                    itemsPerPage={10}
                                /> */}
                                <MaterialRequestFormReport
                                    onView={handleIendentRaiseView}

                                />
                            </div>
                        </>
                    }

                </div>
            )}
        </>
    );
};

export default MaterialIssue;