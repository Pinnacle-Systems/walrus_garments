import React, { useState } from 'react';
import secureLocalStorage from "react-secure-storage";

import moment from 'moment';
import Modal from '../../../UiComponents/Modal';
// import Parameter from './Parameter';
import { useGetStockReportQuery, useLazyGetStockReportQuery } from '../../../redux/services/StockService';
import { EMPTY_ICON, REFRESH_ICON } from '../../../icons';
import ParameterButton from '../../ResuableComponent/ParameterButton';
import Parameter from './Parameter';
import { getCommonParams } from '../../../Utils/helper';
import { useGetLocationMasterQuery } from '../../../redux/uniformService/LocationMasterServices';
import { useGetBranchQuery } from '../../../redux/services/BranchMasterService';
import { toast } from 'react-toastify';
import { PoTypes, poTypes } from '../../../Utils/DropdownData';
import { DateInput, DropdownInput, DropdownWithSearch } from '../../../Inputs';
import { dropDownListObject } from '../../../Utils/contructObject';
import { useGetOrderQuery } from '../../../redux/uniformService/OrderService';
import Swal from 'sweetalert2';

const StockReport = () => {
    const [poType, setPoType] = useState("")
    const [storeId, setStoreId] = useState("")
    const [locationId, setLocationId] = useState('');
    const [endDate, setEndDate] = useState(moment(new Date()).format("YYYY-MM-DD"));
    const [parameter, setParameter] = useState(false);
    const [localEndDate, setLocalEndDate] = useState(endDate)
    const [localStoreId, setLocalStoreId] = useState(storeId);
    const [localPoType, setLocalPoType] = useState(poType);
    const [itemType, setItemType] = useState(poType);
    const [orderId, setOrderId] = useState("");

    const [localLocationId, setLocalLocationId] = useState(locationId);


    const { companyId, branchId } = getCommonParams()
    const { data: locationData } = useGetLocationMasterQuery({ params: { branchId } });
    const { data: branchList } = useGetBranchQuery({ params: { companyId } });

    const storeOptions = locationData ?
        locationData.data.filter(item => parseInt(item.locationId) === parseInt(localLocationId)) :
        [];
    const [fetchData, { data: stockData, refetch }] = useLazyGetStockReportQuery();


    const { data: orderData, isLoading: orderDatalDataLoading, isFetching: orderDatalDataFetching, refetch: orderReftch } = useGetOrderQuery({ branchId });

    let stockList = stockData ? stockData.data : []


    const nemericFields = ["Opening_Stock", "In_Qty", "Out_Qty", "Closing_Stock", "No_Of_Rolls", "Qty", "No_Of_Bags"];


    function handleDone() {
        if (!(localPoType && localStoreId && localEndDate)) return toast.info("Choose Po Type, Store , End Date ... !", { position: "top-center" })
        setEndDate(localEndDate);
        setStoreId(localStoreId);
        setLocationId(localLocationId);
        setPoType(localPoType);
    }



    return (
        <>
            <Modal isOpen={parameter} onClose={() => {

                setParameter(false)
            }
            } >
                <Parameter
                    poType={poType} setPoType={setPoType} locationId={locationId} setLocationId={setLocationId}
                    storeId={storeId} setStoreId={setStoreId} endDate={endDate} setEndDate={setEndDate} onClose={() => setParameter(false)}
                />
            </Modal>

            <div className=''>
                <div className='w-full h-full  p-2'>
                    <div className='flex items-center justify-between page-heading p-2 font-bold'>
                        <h1 className=''>Stock Report as On Date</h1>
                        {/* <div className='flex gap-5'>
                            <ParameterButton onClick={() => setParameter(true)} />
                            <button onClick={refetch}>
                                Refresh {REFRESH_ICON}
                            </button>
                        </div> */}
                    </div>
                    <div className='flex justify-center  flex-col text-center bg-gray-200 rounded-b-md mb-7 sticky top-0 '>
                        <div className='grid grid-cols-6 gap-4 p-2'>

                            <div className=' items-center justify-center md:my-1 px-1 data flex flex-col'>
                                <label className='block text-xs font-bold text-slate-700 mb-1'>Po Type</label>
                                <select id='dd' autoFocus name="name" className='w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                      transition-all duration-150 shadow-sm' value={localPoType} onChange={(e) => {
                                        if (e.target.value != "Order Purchase") {
                                            setOrderId("")
                                        }
                                        setLocalPoType(e.target.value)
                                    }}>
                                    <option value={""}>Select</option>
                                    {PoTypes.map((option, index) => <option key={index} value={option.value} >
                                        {option.show}
                                    </option>)}
                                </select>
                            </div>
                            {localPoType == "Order Purchase" && (
                                <DropdownWithSearch
                                    options={orderData?.data}
                                    value={orderId}
                                    setValue={setOrderId}
                                    // readOnly={readOnly}
                                    labelField={"docId"}
                                    label={"Order No"}
                                    required={true}
                                />
                            )}
                            <div className=' items-center justify-center md:my-1 px-1 data flex flex-col'>
                                <label className='block text-xs font-bold text-slate-700 mb-1'>Po Type</label>
                                <select id='dd' autoFocus name="name" className='w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                      transition-all duration-150 shadow-sm' value={itemType} onChange={(e) => setItemType(e.target.value)}>
                                    <option value={""}>Select</option>
                                    {poTypes.map((option, index) => <option key={index} value={option.value} >
                                        {option.show}
                                    </option>)}
                                </select>
                            </div>
                            <DropdownInput name="Location"
                                options={branchList ? (dropDownListObject(branchList.data, "branchName", "id")) : []}
                                value={localLocationId}
                                setValue={(value) => { setLocalLocationId(value); setLocalStoreId("") }}
                                required={true}
                            />
                            <DropdownInput name="Store"
                                options={dropDownListObject(storeOptions, "storeName", "id")}
                                value={localStoreId} setValue={setLocalStoreId} required={true} />
                            <DateInput name={"Date"} value={localEndDate} setValue={setLocalEndDate} />
                        </div>
                        <div className='py-1.5 mt-2'>
                            <button
                                className='bg-red-400 hover:bg-red-600 hover:text-white p-1 text-sm rounded font-semibold transition'
                                onClick={() => {

                                    if (!(localPoType && localStoreId && localEndDate)) {
                                        Swal.fire({
                                            icon: "warning",
                                            title: "Choose Po Type, Store , End Date ... ",
                                        });
                                        return
                                    }
                                    fetchData(
                                        {
                                            params:

                                            {
                                                branchId,
                                                stockReport: true,
                                                storeId,
                                                itemType,
                                                toDate: endDate,
                                                orderId,
                                                poType
                                            }
                                        },
                                    )


                                }

                                }
                            >
                                View Report
                            </button>
                        </div>
                    </div>


                    <div>
                        {
                            stockList.length == 0 ?
                                <div className="flex justify-center items-center text-blue-900  text-3xl sm:mt-52">
                                    <p>{EMPTY_ICON} No Stock...! </p>
                                </div>
                                :

                                (poType == "Accessory" && stockList.length !== 0) ?
                                    <table className='w-full border border-gray-500 text-xs'>
                                        <thead>
                                            <tr className='bg-blue-200 border border-gray-500 sticky top-10 py-1'>
                                                <td>S.No</td>
                                                <td>AccessoryGroup</td>
                                                <td>accessoryCategory</td>
                                                <td>Accessory</td>
                                                <td>Size</td>
                                                <td>Qty</td>

                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stockList.map((item, index) => (
                                                <tr key={index} className="text-center border border-gray-500 even:bg-gray-100">
                                                    <td className='p-1'>{index + 1}</td>
                                                    <td className='p-1'>{item.yarn}</td>
                                                    <td className='p-1'>{item.color}</td>
                                                    <td className='p-1'>{item.total_qty}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    :
                                    <table className="min-w-[1250px] border-collapse table-fixed">
                                        <thead className="bg-gray-200 text-gray-800">

                                            <tr>

                                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">S No</td>
                                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-96">Yarn </td>
                                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-44">Color </td>
                                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-44">Total Qty </td>



                                            </tr>




                                        </thead>
                                        <tbody>

                                            {stockList?.map((yarn, index) => (
                                                <tr

                                                >

                                                    <td className="border border-gray-300 px-2 py-1 text-center text-[11px] w-10">{index + 1}</td>
                                                    <td className="border border-gray-300 px-2 py-1 text-left text-[11px] ">{yarn?.yarn}</td>
                                                    <td className="border border-gray-300 px-2 py-1 text-left text-[11px] ">{yarn?.color}</td>
                                                    <td className="border border-gray-300 px-2 py-1 text-right text-[11px] ">{parseFloat(yarn?.total_qty).toFixed(3)}</td>













                                                </tr>
                                            ))}

                                        </tbody>

                                    </table>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default StockReport