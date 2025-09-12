import { FaFileAlt, FaPlus } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { useState } from "react";
import { getCommonParams } from "../../../Utils/helper";
import { DateInputNew, ReusableSearchableInput, TextInput } from "../../../Inputs";
import StockTransferForm from "./StockTransferFormUI";
import OrderFormReport from "./OrderReport";
import Swal from "sweetalert2";
import { useGetOrderQuery } from "../../../redux/uniformService/OrderService";



const StockTransfer = () => {

    const [id, setId] = useState("")
    const [form, setForm] = useState("")
    const [docId, setDocId] = useState("New")
    const [readOnly, setReadOnly] = useState(true);
    const [date, setDate] = useState("");
   
    
    const [transferType,setTransfetType]  = useState("")
    
    const [orderId, setOrderId] = useState("");
    const [orderItems,setOrderItems]  =  useState([])
    const [partyId, setPartyId] = useState("");

    const [requirementId,setRequirementId]   = useState("")
    
    const [fromOrderNo, setFromOrderNo] = useState("")
    const [showAddressPopup, setShowAddressPopup] = useState(false)
    
    const { branchId, userId, companyId, finYearId } = getCommonParams()
    const params = {
        branchId, userId, finYearId
    };

        const { data: orderData, isLoading: sampelDataLoading, isFetching: sampelDataFetching } = useGetOrderQuery({ params });
    

    const handleView = (orderId) => {

        setId(orderId)
        setForm(true)
        setReadOnly(true);
    };

    const handleEdit = (orderId) => {
        setId(orderId)
        setForm(true)
        setReadOnly(false);
    };

    const handleDelete = async (id) => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                // let deldata = await removeData(id).unwrap();
                // if (deldata?.statusCode == 1) {
                //     Swal.fire({
                //         icon: "error",
                //         title: "Child record Exists",
                //         text: deldata.data?.message || "Data cannot be deleted!",
                //     });
                //     return;
                // }
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


    return (
        <>
            {form ? (
                <StockTransferForm
                    orderData={orderData}  orderId={orderId} setOrderId = {setOrderId}  orderItems={orderItems} setOrderItems={setOrderItems} params={params}
                    partyId={partyId} setPartyId={setPartyId}  setRequirementId={setRequirementId} requirementId={requirementId}
                    showAddressPopup={showAddressPopup} setShowAddressPopup={setShowAddressPopup}
                    docId={docId} setDocId={setDocId}
                    readOnly={readOnly} setReadOnly={setReadOnly}
                    date={date} setDate={setDate}
                    setFromOrderNo={setFromOrderNo} fromOrderNo={fromOrderNo}  setTransfetType={setTransfetType} transferType={transferType}
                    onClose = {()  =>  {
                        setForm(false)
                    }}
                />
            ) : (
                <div className="p-1 bg-[#F1F1F0] h-[85%]">
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Stock Transfer</h1>

                        </div>
                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
                            onClick={() => { setForm(true) }}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden  ">
                        {/* <ReusableTable
                            columns={columns}
                            data={orderData?.data || []}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            itemsPerPage={10}
                        
                        /> */}
                        <OrderFormReport
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