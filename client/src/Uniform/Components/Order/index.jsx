import { useEffect, useState } from 'react';
import { FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";


import CommonTable from '../../../Shocks/CommonReport/CommonTable';
import { useDeleteOrderMutation, useGetOrderQuery } from '../../../redux/uniformService/OrderService';
import { getCommonParams, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import { toast } from 'react-toastify';
import OrderFormUi from './orderFormUi';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import Swal from 'sweetalert2';
import { ReusableTable } from '../../../Inputs';
import OrderFormReport from './OrderReport';
import { useGetSocksTypeQuery } from '../../../redux/uniformService/SocksTypeMasterService';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { useGetStyleMasterQuery } from '../../../redux/uniformService/StyleMasterService';
import { useGetYarnNeedleMasterQuery } from '../../../redux/uniformService/YarnNeedleMasterservices';
import { useGetYarnMasterQuery } from '../../../redux/uniformService/YarnMasterServices';
import { useGetCountsMasterQuery } from '../../../redux/uniformService/CountsMasterServices';
import { useGetFiberContentMasterQuery } from '../../../redux/uniformService/FiberContentMasterServices';
import { useGetYarnTypeMasterQuery } from '../../../redux/uniformService/YarnTypeMasterServices';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetSocksMaterialQuery } from '../../../redux/uniformService/SocksMaterialMasterService';


const Order = () => {

    const { branchId, userId, companyId, finYearId } = getCommonParams();

    const params = { branchId, userId, finYearId, companyId };

    const { data: supplierList, isLoading: isSupplierLoading, isFetching: isSupplierFetching } =
        useGetPartyQuery({ params: { ...params } });


    //     const { data: styleList, isLoading: isStyleListLoading } = useGetStyleMasterQuery({ params: { ...params } });
    //     const { data: fiberContent } = useGetFiberContentMasterQuery({ params: { ...params } });
    // const { data: socksMaterialData } = useGetSocksMaterialQuery({ params: { ...params } });
    // const { data: socksTypeData } = useGetSocksTypeQuery({ params: { ...params } });


    const { data: sizeList, } = useGetSizeMasterQuery({ params: { ...params } });
    const { data: yarnNeedleList } = useGetYarnNeedleMasterQuery({ params: { ...params } });
    const { data: yarnList } = useGetYarnMasterQuery({ params: { ...params } });
    const { data: countsList } = useGetCountsMasterQuery({ params: { ...params } });
    const { data: yarnTypeList } = useGetYarnTypeMasterQuery({ params: { ...params } });
    const { data: colorlist, isLoading: isColorListLoading, isFetching: isColorListFetching, } = useGetColorMasterQuery({ params });





    const [showOrderForm, setShowOrderForm] = useState(false);
    const [id, setId] = useState("");
    const [readOnly, setReadOnly] = useState(false);

    const [orderDetails, setOrderDetails] = useState([])

    const [removeData] = useDeleteOrderMutation();













    useEffect(() => {
        if (orderDetails?.length >= 1) return
        setOrderDetails(prev => {
            let newArray = Array?.from({ length: 1 - prev?.length }, () => {
                return {
                    yarnNeedleId: "", machineId: "", fiberContentId: "", description: "", socksMaterialId: "",
                    measurements: "", sizeId: "", styleId: "", legcolorId: "", footcolorId: "",
                    stripecolorId: "", noOfStripes: "0", socksTypeId: "",
                    orderSizeDetails: [
                        { qty: 0.00, sizeMeasurement: "", sizeId: "" },
                        { qty: 0.00, sizeMeasurement: "", sizeId: "" },
                        { qty: 0.00, sizeMeasurement: "", sizeId: "" },
                        { qty: 0.00, sizeMeasurement: "", sizeId: "" },
                        { qty: 0.00, sizeMeasurement: "", sizeId: "" }



                    ],
                    orderYarnDetails: [{ yarnId: "" }],
                    orderAccessoryDetails: [{ accessoryId: "" }]

                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setOrderDetails, orderDetails])




    const handleView = (orderId) => {

        setId(orderId)
        setShowOrderForm(true)
        setReadOnly(true);
    };

    const handleEdit = (orderId) => {
        setId(orderId)
        setShowOrderForm(true)
        setReadOnly(false);
    };

    const handleDelete = async (id, childRecord) => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                if (childRecord) {
                    Swal.fire({
                        icon: "error",
                        title: "Child record Exists",
                    });
                    return;
                }
                let deldata = await removeData(id).unwrap();
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
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Submission error",
                    text: error.data?.message || "Something went wrong!",
                });
            }
        }
    };
    const onNew = () => {
        setId("");
        setReadOnly(false);
        setOrderDetails([]);

    }



    return (
        <>
            {showOrderForm ? (
                <OrderFormUi orderDetails={orderDetails} setOrderDetails={setOrderDetails} readOnly={readOnly} setReadOnly={setReadOnly} id={id} setId={setId} onClose={() => { setShowOrderForm(false); setReadOnly(prev => !prev) }}
                    setShowOrderForm={setShowOrderForm} supplierList={supplierList}
                    sizeList={sizeList} yarnNeedleList={yarnNeedleList}
                    yarnList={yarnList} countsList={countsList} yarnTypeList={yarnTypeList} colorlist={colorlist}

                />
            ) : (
                <div className="p-1 bg-[#F1F1F0] h-[85%]">
                    <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Order</h1>

                        </div>
                        <button
                            className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-sm"
                            onClick={() => { setShowOrderForm(true); onNew() }}
                        >
                            <FaPlus /> Create New
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden  ">

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
};

export default Order;