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
import IndentRaiseForm from "./MaterialRequsetForm";
import { Production } from "../../../Utils/DropdownData";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useGetMaterialIssueQuery } from "../../../redux/uniformService/MaterialIssueServices";
import { Loader } from "../../../Basic/components";
import MaterialRequestFormReport from "./MaterialRequstFormReport";





const MaterialRequestForm = () => {


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
    const [partyId, setPartyId] = useState("");
    const [childRecord, setChildrecord] = useState("")
    const [requirementId, setRequirementId] = useState("")
    const [isMaterialRequset, setIsMaterialRequset] = useState(false)
    const [isReport, setIsReport] = useState("")
    const [subGridForm, setSubGridForm] = useState(false)
    const [type, setType] = useState("All");
    const [materialTypeList, setMaterialTypeList] = useState([])
    const [raiseIndentItems, setRaiseIndentItems] = useState([])
    const [accessoryRaiseIndentItems, setAccessoryRaiseIndentItems] = useState([])

    const params = {
        branchId, userId, finYearId
    };

    const { data: allData, isLoading, isFetching } = useGetRaiseIndentQuery({ params: { branchId } });
    const { data: materialIssueData } = useGetMaterialIssueQuery({ params: { branchId } });

    const { data: orderData, isLoading: sampelDataLoading, isFetching: sampelDataFetching, refetch: orderAllDataRefetch } = useGetOrderQuery({ params });

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



    const handleDelete = async (id ,RaiseIndenetYarnItems , RaiseIndenetAccessoryItems) => {
        let deleteItems = {
            RaiseIndenetYarnItems, RaiseIndenetAccessoryItems
        }
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
                await removeData({ id, body: deleteItems })
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
        setAccessoryRaiseIndentItems([])
        setMaterialTypeList([])
        setIsMaterialRequset(false)
        setDocId("New")
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

                    dueDate={dueDate} setDueDate={setDueDate} requirementId={requirementId} setRequirementId={setRequirementId} isMaterialRequset={isMaterialRequset} setIsMaterialRequset={setIsMaterialRequset} setSubGridForm={setSubGridForm} subGridForm={subGridForm}

                    orderAllDataRefetch={orderAllDataRefetch} onNew={onNew} materialTypeList={materialTypeList} setMaterialTypeList={setMaterialTypeList}

                    isReport={isReport} setIsReport={setIsReport} accessoryRaiseIndentItems={accessoryRaiseIndentItems} setAccessoryRaiseIndentItems={setAccessoryRaiseIndentItems}

                />

            ) : (
                <div className="p-1 bg-[#F1F1F0] h-[85%]">
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-sm shadow-sm border border-gray-200">

                        <h1 className="text-2xl font-bold text-gray-800">Material Request</h1>
                        {/* <div className="flex bg-gray-200 rounded-full p-0.5  w-fit shadow-sm">
                            <button
                                onClick={() => setType("All")}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${type === "All"
                                    ? "bg-blue-600 text-white shadow"
                                    : "bg-transparent text-gray-700 hover:text-blue-600"
                                    }`}
                            >
                                All
                            </button>

                            <button
                                onClick={() => setType("Partially")}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 
                                    ${type === "Partially"
                                    ? "bg-blue-600 text-white shadow"
                                    : "bg-transparent text-gray-700 hover:text-blue-600"
                                    }`}
                            >
                                Partially Received
                            </button>
                        </div> */}

                        <div className="flex flex-row  gap-4  ">


                            <button
                                className="py-1.5  hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4  rounded-md flex items-center gap-2 text-sm"
                                onClick={() => { setForm(true); onNew() }}
                            >
                                <FaPlus /> Create New
                            </button>
                        </div>
                    </div>

                    {/* {isReport === "Material Request" || isReport === "All" ? ( */}


                    <MaterialRequestFormReport
                        isReport={isReport}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        type={type}
                    />
                    {/* 
                        )
                        :
                        ( */}

                    {/* <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <ReusableTable
                                    columns={columns}
                                    data={materialIssueData?.data || []}
                                    onView={handleView}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    itemsPerPage={10}
                                />
                            </div> */}
                    {/* ) */}

                    {/* } */}






                </div>
            )}
        </>
    );
};

export default MaterialRequestForm;