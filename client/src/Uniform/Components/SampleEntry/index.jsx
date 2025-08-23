import { useState } from 'react';
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";


import SampleForm from './SampleForm';
import CommonTable from '../../../Shocks/CommonReport/CommonTable';
import {  useGetOrderByIdQuery, useGetOrderQuery } from '../../../redux/uniformService/OrderService';
import { getCommonParams } from '../../../Utils/helper';
import { toast } from 'react-toastify';
import SampleEntryUi from './sampeEntryFormUi';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import {  useDeleteSampleMutation, useGetSampleByIdQuery, useGetSampleQuery } from '../../../redux/uniformService/SampleService';
import { ReusableTable } from '../../../Inputs';
import moment from 'moment';
import Swal from 'sweetalert2';


const SampleEntry = () => {
    const [sampleDetails, setSampleDetails] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('this-month');
    const [selectedFinYear, setSelectedFinYear] = useState('2023-2024');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showSampleForm, setShowSampleForm] = useState(false);
    const [id, setId] = useState("");
    const [orderId,setOrderId] = useState("")
    const { branchId, userId, companyId, finYearId } = getCommonParams();
    const [readOnly, setReadOnly] = useState(false);
    const params = {
        branchId, userId, finYearId
    };

    const { data: orderData } = useGetOrderQuery({ params });
    const { data: allData  , isLoading  , isFetching } = useGetSampleQuery({ params });
    
        const {
            data: singleOrderData,
            isFetching: isSingleOrderFetching,
            isLoading: isSingleOrderLoading,
        } = useGetOrderByIdQuery(orderId, { skip: !orderId });

    const { data: partyData } = useGetPartyQuery({ params })
    const [removeData] = useDeleteSampleMutation();

    const columns = [
        {
            header: 'S.No',
            accessor: (item, index) => index + 1,
          className : 'font-medium text-gray-900 w-[5%] text-center'
        },
        {
            header: 'Sample No',
            accessor: (item) => item.docId,
          className :'font-medium text-gray-900 w-[10%]'
        },
        {
            header: 'Sample Date',
            accessor: (item) => moment.utc(item.createdAt).format("YYYY-MM-DD") ,
             className :'font-medium text-gray-900 w-[10%]'
        },
        {
            header: 'Customer',
            accessor: (item) => item.Party?.name,
            className :'font-medium text-gray-900 w-[20%]'      
          },
        {
            header: 'Contact Person',
            accessor: (item) => item.Party?.contactPersonEmail,
             className :'font-medium text-gray-900 uppercase  w-[15%]'      
              },
 

              {
            header: '',
            accessor: (item) => item.none,
            className :'font-medium text-gray-900  w-[60%]'      
          },
          
    ];



    const handleView = (id) => {
        console.log(id,"idddddd")
        setId(id)
        setShowSampleForm(true)
        setReadOnly(true);
    };

    const handleEdit = (id) => {
        setId(id)
        setShowSampleForm(true)
        setReadOnly(false);
    };

    const handleDelete = async (id) => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                await removeData(id)
                setId("");
                onNew();
                
                                Swal.fire({
                                    title:  "Deleted Successfully",
                                    icon: "success",
                                    draggable: true,
                                    timer: 1000, 
                                    showConfirmButton: false, 
                                    didOpen: () => {
                                        Swal.showLoading(); 
                                    }
                                });
            } catch (error) {
                  Swal.fire({
                                    title:  error,
                                    icon: "error",
                                    draggable: true,
                                    timer: 1000, 
                                    showConfirmButton: false, 
                                    didOpen: () => {
                                        Swal.showLoading(); 
                                    }
                                });
            }
        }

    };
    const onNew = () => {
        setId("");
        setReadOnly(false);

        console.log(sampleDetails,"sampleDetailsssss" )
    }


    return (
        <>
            {showSampleForm ? (
                <SampleEntryUi sampleDetails={sampleDetails} setSampleDetails={setSampleDetails} readOnly={readOnly} setReadOnly={setReadOnly} id={id} setId={setId} onClose={() => { setShowSampleForm(false); setReadOnly(prev => !prev) }}
                    partyData={partyData?.data} orderData={orderData} orderId={orderId} setOrderId={setOrderId}  allData={allData?.data}  
                      isLoading = {isLoading}   isFetching ={isFetching} setShowSampleForm={setShowSampleForm}
                      singleOrderData={singleOrderData} isSingleOrderFetching ={isSingleOrderFetching}  isSingleOrderLoading ={isSingleOrderLoading}
                />
            ) : (
                <div className="p-2 bg-[#F1F1F0] min-h-screen">
                    <h1 className="text-2xl font-bold text-gray-800"> Sample Entry</h1>
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
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
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1.5 rounded-md flex items-center gap-2 text-sm"
                            onClick={() => { 
                                setShowSampleForm(true)
                                onNew()
                            }}
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

export default SampleEntry;