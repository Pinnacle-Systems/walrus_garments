import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import { getCommonParams } from "../../../Utils/helper";
import StockTransferForm from "./StockTransferFormUI";
import StockTransferReport from "./stockTransferReport";
import Swal from "sweetalert2";
import { useGetOrderQuery } from "../../../redux/uniformService/OrderService";
import { useDeleteStockTransferMutation } from "../../../redux/uniformService/StockTransferService";
import moment from "moment";



const StockTransfer = () => {

    const [id, setId] = useState("")
    const [form, setForm] = useState("")
    const [docId, setDocId] = useState("New")
    const [readOnly, setReadOnly] = useState(true);
    const [date, setDate] = useState(moment(new Date()).format("YYYY-MM-DD"));


    const [transferType, setTransferType] = useState("General")

    const [orderId, setOrderId] = useState("");
    const [orderItems, setOrderItems] = useState([])
    const [tempOrderItems, setTempOrderItems] = useState([])

    const [toCustomerId, setToCustomerId] = useState("");
    const [toOrderId, setToOrderId] = useState("")

    const [requirementId, setRequirementId] = useState("")

    const [fromOrderId, setFromOrderId] = useState("")
    const [showAddressPopup, setShowAddressPopup] = useState(false)
    const [fromCustomerId, setFromCustomerId] = useState("")


    const [stockItems, setStockItems] = useState([])
    const [tempStockItems, setTempStockItems] = useState([])


    const { branchId, userId, companyId, finYearId } = getCommonParams()
    const params = {
        branchId, userId, finYearId
    };

    const { data: orderData, isLoading: sampelDataLoading, isFetching: sampelDataFetching } = useGetOrderQuery({ params });



    const [removeData] = useDeleteStockTransferMutation()

    // const getNextDocId = useCallback(() => {
    //     //   if (id || isLoading || isFetching) return
    //     if (allData?.nextDocId) {
    //         setDocId(allData.nextDocId)
    //     }
    // }, [allData, id])

    // useEffect(getNextDocId, [getNextDocId])

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
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                let deldata = await removeData(id).unwrap();
                if (deldata?.statusCode == 1) {
                    Swal.fire({
                        icon: "error",
                        title: "Record Not Found",
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
                setForm(false);
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Submission error",
                    text: error.data?.message || "Something went wrong!",
                });
                setForm(false);
            }
        }
    };
    const OnNew = () => {
        setId("")
        setReadOnly(false);
        setOrderId("")
        setRequirementId("")
        setToOrderId("")
        setToCustomerId("")
        setFromOrderId("")
        setOrderItems([])
        setStockItems([])
        setTempOrderItems([])
        setTempStockItems([])
    };


    return (
        <>
            {form ? (
                <StockTransferForm
                    id={id} setId={setId}  setForm={setForm}
                    orderData={orderData} orderId={orderId} setOrderId={setOrderId} orderItems={orderItems} setOrderItems={setOrderItems} params={params}
                    toCustomerId={toCustomerId} setToCustomerId={setToCustomerId} setRequirementId={setRequirementId} requirementId={requirementId}
                    showAddressPopup={showAddressPopup} setShowAddressPopup={setShowAddressPopup} tempOrderItems={tempOrderItems} setTempOrderItems={setTempOrderItems}
                    docId={docId} setDocId={setDocId} stockItems={stockItems} setStockItems={setStockItems} tempStockItems={tempStockItems} setTempStockItems={setTempStockItems}
                    readOnly={readOnly} setReadOnly={setReadOnly} OnNew={OnNew} 
                    date={date} setDate={setDate} toOrderId={toOrderId} setToOrderId={setToOrderId}
                    setFromOrderId={setFromOrderId} fromOrderId={fromOrderId} setTransferType={setTransferType} transferType={transferType}
                    onClose={() => { setForm(false) }} fromCustomerId={fromCustomerId} setFromCustomerId={setFromCustomerId}
                />
            ) : (
                <div className="p-1 bg-[#F1F1F0] h-[85%]">
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Stock Transfer</h1>

                        </div>
                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
                            onClick={() => { setForm(true);OnNew() }}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden  ">
                  
                        <StockTransferReport
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
}

export default StockTransfer;