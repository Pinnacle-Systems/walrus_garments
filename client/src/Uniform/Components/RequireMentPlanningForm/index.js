import { useState } from "react";
import { getCommonParams } from "../../../Utils/helper";
import { ReusableTable } from "../../../Inputs";
import { FaPlus } from "react-icons/fa";
import RequirmentForm from "./RequireMentFormUi";
import { useDeleteRequirementPlanningFormMutation, useGetRequirementPlanningFormQuery } from "../../../redux/uniformService/RequirementPlanningFormServices";
import { useGetSampleQuery } from "../../../redux/uniformService/SampleService";
import { useGetOrderQuery } from "../../../redux/uniformService/OrderService";
import Swal from "sweetalert2";
import moment from "moment";
import { Loader } from "../../../Basic/components";
import RequirementPlanningFormReport from "./RequirementPlanningReport";





const RequirementPlanningForm = () => {


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
    const [styleId, setstyleId] = useState("");
    const [date, setDate] = useState(moment(new Date()).format("YYYY-MM-DD"));
    const [dueDate, setDueDate] = useState();
    const [accessoryItems, setAccessoryItems] = useState([]);


    const [sampleDetails, setSampleDetails] = useState([]);
    const [orderSizeDetails, setOrderSizeDetails] = useState([])
    const [orderYarnDetails, setOrderYarnDetails] = useState([])
    const [requirementForm, setRequirementForm] = useState([])
    const [partyId, setPartyId] = useState("");
    const [childRecord, setChildrecord] = useState("")
    const [jobNumber, setJobNumber] = useState("");
    const [yarnTotals, setYarnTotals] = useState([]);


    const [tempOrderId, setTempOrderId] = useState("");
    const [tempOrderDetailsId, setTempOrderDetailsId] = useState("");


    const [requirementItems, setRequirementItems] = useState([])


    const params = {
        branchId, userId, finYearId
    };

    // const { data: allData, isLoading, isFetching } = useGetRequirementPlanningFormQuery({ params: { branchId } });
    const { data: orderData, isLoading: orderDatalDataLoading, isFetching: orderDatalDataFetching, refetch: orderReftch } = useGetOrderQuery({ params });

    const searchFields = {
        jobNumber

    };
    const { data: allData, isFetching, isLoading } = useGetRequirementPlanningFormQuery({
        params: {
            branchId,

        }
    });
    const [removeData] = useDeleteRequirementPlanningFormMutation();


    const columns = [
        {
            header: 'S.No',
            accessor: (item, index) => parseInt(index) + 1,
            className: 'font-medium text-center text-gray-900 w-[20px] '
        },

        {
            header: 'Doc No',
            accessor: (item) => item?.docId,
            className: 'font-medium text-gray-900 w-[50px] py-1 px-2'
        },

        {
            header: 'Order No',
            accessor: (item) => item?.order?.docId,
            className: 'font-medium text-gray-900 w-[50px] py-1 px-2'
        },
        {
            header: 'Style No',
            accessor: (item) => item?.OrderDetails?.style?.name,
            className: 'font-medium text-gray-900 w-[80px] py-1 px-2'
        },
        {
            header: 'Customer',
            accessor: (item) => item?.Party?.name,
            className: 'font-medium text-gray-900 w-[500px] py-1 px-2'
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

    console.log(childRecord.current, "childrecord");

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
                orderReftch()

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
        setDocId("")
        setReadOnly(false);
        setOrderId("")
        setstyleId("")
        setRequirementForm([])
        setOrderSizeDetails([])
        setOrderYarnDetails([])
        setJobNumber("")
        setPartyId("")
        setRequirementItems([])
        setAccessoryItems([])

    }
    if (isLoading || isFetching) return <Loader />

    return (
        <>
            {form ? (
                <RequirmentForm
                    setDocId={setDocId} onNew={onNew} allData={allData} orderReftch={orderReftch} setDate={setDate}

                    onClose={() => { setForm(false); setReadOnly(prev => !prev) }} id={id} setId={setId} readOnly={readOnly} setReadOnly={setReadOnly} orderData={orderData} orderId={orderId} setOrderId={setOrderId} setChildrecord={setChildrecord}

                    orderSizeDetails={orderSizeDetails} setOrderSizeDetails={setOrderSizeDetails} orderYarnDetails={orderYarnDetails} setOrderYarnDetails={setOrderYarnDetails} styleId={styleId} setstyleId={setstyleId}

                    partyId={partyId} setPartyId={setPartyId} docId={docId} active={active} setShowOrderForm={setShowOrderForm} date={date} sampleDetails={sampleDetails} requirementForm={requirementForm} setRequirementForm={setRequirementForm}

                    dueDate={dueDate} setDueDate={setDueDate} jobNumber={jobNumber} setJobNumber={setJobNumber} yarnTotals={yarnTotals} setYarnTotals={setYarnTotals} requirementItems={requirementItems} setRequirementItems={setRequirementItems}

                    tempOrderId={tempOrderId} setTempOrderId={setTempOrderId} tempOrderDetailsId={tempOrderDetailsId} setTempOrderDetailsId={setTempOrderDetailsId}
                
                    setAccessoryItems={setAccessoryItems}   accessoryItems={accessoryItems}

                    />

            ) : (
                <div className="p-1 bg-[#F1F1F0] h-[85%]">
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
                        {/* <div className="flex items-center gap-2">
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
                            
                            </div> */}
                        <h1 className="text-2xl font-bold text-gray-800">Requirement Planning Form</h1>
                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
                            onClick={() => { setForm(true); onNew() }}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {/* <ReusableTable
                            columns={columns}
                            data={allData?.data || []}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            itemsPerPage={10}
                        /> */}
                        <RequirementPlanningFormReport
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