import { useState } from "react";
import { getCommonParams } from "../../../Utils/helper";
import { FaPlus } from "react-icons/fa";
import PurchaseInwardForm from "./PurchaseInwardFormUi";


export default function Form() {


    const [selectedPeriod, setSelectedPeriod] = useState('this-month');
    const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
    const [showManufacturer, setShowManufacturer] = useState(false);
    const [id, setId] = useState("");
    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const [poInwardOrDirectInward, setPoInwardOrDirectInward] = useState("General Inward");


    const [docId, setDocId] = useState("New")
    const [date, setDate] = useState("")
    const [readOnly, setReadOnly] = useState('')
    const [transType, setTransType] = useState("Accessory");
    const [dcNo, setDcNo] = useState("")
    const [dcDate, setDcDate] = useState('')
    const [supplierId, setSupplierId] = useState('')
    const [payTermId, setPayTermId] = useState("");
    const [locationId, setLocationId] = useState('');
    const [storeId, setStoreId] = useState("")
    const [inwardItemSelection, setInwardItemSelection] = useState(false)
    const [directInwardReturnItems, setDirectInwardReturnItems] = useState([]);
    const [partyId, setPartyId] = useState('')


    const params = {
        branchId, userId, finYearId
    };


    // const { data: allData, isLoading, isFetching } = useGetAccessoryPurchaseInwardQuery({ params: { branchId, poInwardOrDirectInward } });
    // const [removeData] = useDeleteAccessoryPurchaseInwardMutation();





    const handleView = (id) => {

        setId(id)
        setShowManufacturer(true)
        setReadOnly(true);
    };

    const handleEdit = (orderId) => {
        setId(orderId)
        setShowManufacturer(true)
        setReadOnly(false);
    };

    // const handleDelete = async (id) => {
    //     if (id) {
    //         if (!window.confirm("Are you sure to delete...?")) {
    //             return;
    //         }
    //         try {
    //             await removeData(id)
    //             setId("");
    //             onNew();
    //             // toast.success("Deleted Successfully");
    //             Swal.fire({
    //                 title: "Deleted Successfully",
    //                 icon: "success",
    //                 draggable: true,
    //                 timer: 1000,
    //                 showConfirmButton: false,
    //                 didOpen: () => {
    //                     Swal.showLoading();
    //                 }
    //             });
    //         } catch (error) {
    //             toast.error("something went wrong");
    //         }
    //     }

    // };
    // const onNew = () => {
    //     setId("");
    //     setReadOnly(false);
    //     setSupplierId("")
    //     setPartyId('')    
    // }

    return (
        <>
            {showManufacturer ? (
                <PurchaseInwardForm
                    onClose={() => { setShowManufacturer(false); setReadOnly(prev => !prev) }} id={id} setId={setId}
                    docId={docId} setDocId={setDocId} date={date} setDate={setDate} readOnly={readOnly} setReadOnly={setReadOnly}
                    transType={transType} setTransType={setTransType} dcNo={dcNo} setDcNo={setDcNo} dcDate={dcDate} setDcDate={setDcDate}
                    supplierId={supplierId} setSupplierId={setSupplierId} payTermId={payTermId} setPayTermId={setPayTermId}
                    locationId={locationId} setLocationId={setLocationId} storeId={storeId} setStoreId={setStoreId}
                    poInwardOrDirectInward={poInwardOrDirectInward} setPoInwardOrDirectInward={setPoInwardOrDirectInward}
                    inwardItemSelection={inwardItemSelection} setInwardItemSelection={setInwardItemSelection}
                    directInwardReturnItems={directInwardReturnItems} setDirectInwardReturnItems={setDirectInwardReturnItems}
                    partyId={partyId} setPartyId={setPartyId} 
                    // onNew={onNew}
 



                />

            ) : (
                <div className="p-2 bg-[#F1F1F0] min-h-screen">
                    <h1 className="text-2xl font-bold text-gray-800">Accessory Purchase Inward</h1>
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="px-3 py-1.5 border rounded-md text-sm"
                            >
                                <option value="this-month">This Month</option>
                                <option value="last-month">Last Month</option>
                            </select>
                            <select
                                value={selectedFinYear}
                                onChange={(e) => setSelectedFinYear(e.target.value)}
                                className="px-3 py-1.5 border rounded-md text-sm"
                            >
                                <option value="2023-2024">2023-2024</option>
                                <option value="2022-2023">2022-2023</option>
                            </select>

                        </div>
                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
                            onClick={() => { setShowManufacturer(true);  }}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {/* <CommonTable
                            columns={columns}
                            data={allData?.data || []}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            itemsPerPage={10}
                        /> */}
                        {/* <PurchaseInwardFormReport

                            data={allData?.data || []}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        /> */}
                    </div>
                </div>
            )}
        </>
    );
};

