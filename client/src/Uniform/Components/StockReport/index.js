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
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";

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
    const [sizeId, setSizeId] = useState("");
    const [colorId, setColorId] = useState("")
    const [itemId, setItemId] = useState("")
    const [localLocationId, setLocalLocationId] = useState(locationId);



    const { companyId, branchId } = getCommonParams()

    const params = {
        branchId, companyId
    };

    const { data: locationData } = useGetLocationMasterQuery({ params: { branchId } });
    const { data: branchList } = useGetBranchQuery({ params: { companyId } });

    const storeOptions = locationData ?
        locationData.data.filter(item => parseInt(item.locationId) === parseInt(localLocationId)) :
        [];


    const { data: itemList } = useGetItemMasterQuery({ params: { companyId } });
    const { data: sizeList } = useGetSizeMasterQuery({ params });
    const { data: colorList, isLoading: isColorLoading, isFetching: isColorFetching, } = useGetColorMasterQuery({ params: { ...params }, });



    const [fetchData, { data: stockData, refetch }] = useLazyGetStockReportQuery();



    let stockList = stockData ? stockData.data : []





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
                                <label className='block text-xs font-bold text-slate-700 mb-1'>Item</label>
                                <select id='dd' autoFocus name="name" className='w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                      transition-all duration-150 shadow-sm' value={itemId} onChange={(e) => {

                                        setItemId(e.target.value)
                                    }}>
                                    <option value={""}>Select</option>
                                    {(itemList?.data)?.map((blend) =>
                                        <option value={blend.id} key={blend.id}>
                                            {blend?.name}
                                        </option>)}
                                </select>
                            </div>

                            <DropdownInput name="Size"
                                options={dropDownListObject(sizeList?.data, "name", "id")}
                                value={sizeId} setValue={setSizeId} required={true} clear={true} />
                            <DropdownInput name="Color"
                                options={dropDownListObject(colorList?.data, "name", "id")}
                                value={colorId} setValue={setColorId} required={true} clear={true} />
                            {/* <DropdownInput name="Location"
                                options={branchList ? (dropDownListObject(branchList.data, "branchName", "id")) : []}
                                value={localLocationId}
                                setValue={(value) => { setLocalLocationId(value); setLocalStoreId("") }}
                                required={true}
                            /> */}
                            <DropdownInput name="Location"
                                options={dropDownListObject(locationData?.data, "storeName", "id")}
                                value={storeId} setValue={setStoreId} required={true} clear={true} />


                            <DateInput name={"Date"} value={localEndDate} setValue={setLocalEndDate} />
                        </div>
                        <div className='py-1.5 mt-2'>
                            <button
                                className='bg-red-400 hover:bg-red-600 hover:text-white p-1 text-sm rounded font-semibold transition'
                                onClick={() => {

                                    // if (!(localStoreId && localEndDate)) {
                                    //     Swal.fire({
                                    //         icon: "warning",
                                    //         title: "Choose Item,  , End Date ... ",
                                    //     });
                                    //     return
                                    // }
                                    fetchData(
                                        {
                                            params:

                                            {
                                                branchId,
                                                stockReport: true,
                                                storeId,
                                                toDate: localEndDate,
                                                itemId,
                                                sizeId,
                                                colorId


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


                                <table className="min-w-[1250px] border-collapse table-fixed">
                                    <thead className="bg-gray-200 text-gray-800">

                                        <tr>

                                            <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">S No</td>
                                            <td className="border border-gray-300 px-2 py-1 text-center text-xs w-96">Item </td>
                                            <td className="border border-gray-300 px-2 py-1 text-center text-xs w-44">Size </td>
                                            <td className="border border-gray-300 px-2 py-1 text-center text-xs w-44">Color </td>

                                            <td className="border border-gray-300 px-2 py-1 text-center text-xs w-44">Total Qty </td>



                                        </tr>




                                    </thead>
                                    <tbody>

                                        {stockList?.map((yarn, index) => (
                                            <tr

                                            >

                                                <td className="border border-gray-300 px-2 py-1 text-center text-[11px] w-10">{index + 1}</td>
                                                <td className="border border-gray-300 px-2 py-1 text-left text-[11px] ">{yarn?.Item}</td>
                                                <td className="border border-gray-300 px-2 py-1 text-left text-[11px] ">{yarn?.Size}</td>
                                                <td className="border border-gray-300 px-2 py-1 text-left text-[11px] ">{yarn?.Color}</td>

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