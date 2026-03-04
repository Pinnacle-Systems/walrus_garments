import { useCallback, useEffect, useState } from "react";
import { useAddStockReportControlMutation, useGetStockReportControlByIdQuery, useGetStockReportControlQuery, useUpdateStockReportControlMutation } from "../../../redux/uniformService/StockReportControl.Services";
import Swal from "sweetalert2";
import { useGetItemControlPanelMasterQuery } from "../../../redux/uniformService/ItemControlPanelService";
import secureLocalStorage from "react-secure-storage";
import { object } from "joi";

const StockReport = () => {

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const [id, setId] = useState("")

    const [itemWise, setItemWise] = useState(false)
    const [sizeWise, setSizeWise] = useState(false)
    const [sizeColorWise, setSizeColorWise] = useState(false)
    const [stockReports, setStockReports] = useState({});


    const { data: allData, isLoading, isFetching } = useGetStockReportControlQuery({ params });

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetStockReportControlByIdQuery(id, { skip: !id });

    useEffect(() => {
        setId(allData?.data?.[0]?.id)
    }, [allData, isLoading, isFetching])


    const [addData] = useAddStockReportControlMutation();
    const [updateData] = useUpdateStockReportControlMutation();



    const { data: itemControlData, isFetching: itemControlFetching, isLoading: itemControlLoading } = useGetItemControlPanelMasterQuery({ params });




    const syncFormWithDb = useCallback((data) => {
        if (!id) {
            setItemWise(data?.itemWise ? data?.itemWise : false)
            setSizeWise(data?.sizeWise ? data?.sizeWise : false)
            setSizeColorWise(data?.sizeColorWise ? data?.sizeColorWise : false)
            setStockReports({
                field1: data?.field1,
                field2: data?.field2,
                field3: data?.field3,
                field4: data?.field4,
                field5: data?.field5,
            })

        } else {
            setItemWise(data?.itemWise ? data?.itemWise : false)
            setSizeWise(data?.sizeWise ? data?.sizeWise : false)
            setSizeColorWise(data?.sizeColorWise ? data?.sizeColorWise : false)
            setStockReports({
                field1: data?.field1,
                field2: data?.field2,
                field3: data?.field3,
                field4: data?.field4,
                field5: data?.field5,
            })
        }
    }, [id]);





    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        itemWise, sizeWise, sizeColorWise, stockReports, id
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            // setId(returnData.data.id)
            // syncFormWithDb(undefined)
            Swal.fire({
                title: text + "  " + "Successfully",
                icon: "success",
            });
        } catch (error) {
            console.log("handle")
        }
    }
    const saveData = () => {


        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated")
        } else {
            handleSubmitCustom(addData, data, "Created")
        }
    }

    const handleCheckboxChange = (key, value) => {
        setStockReports(prev => ({
            ...prev,
            [key]: value
        }));
    };



    useEffect(() => {
        if (!itemControlData?.data?.length) return;

        const initialState = {};
        itemControlData?.data?.forEach((i) => {
            console.log(Object.keys(i)?.filter(key => key.toLowerCase().includes("field")), "keys");

            Object.keys(i)?.filter(key => key.toLowerCase().includes("field"))?.map(key => {
                initialState[key] = "";

            })
        })
        // console.log(initialState, "initialState");

        setStockReports(initialState);
    }, [itemControlData, itemControlLoading, itemControlFetching]);

    console.log(stockReports, 'stockReports')
    return (
        <>
            <div>
                <div className=' flex justify-between mb-2 items-center px-0.5 text-[14px] font-semibold'>
                  
                </div>

                <div className="flex flex-col items-start gap-6 bg-gray-50 p-6 rounded-2xl shadow-sm w-fit">
                    <div className="p-6 w-[22rem] bg-white rounded-2xl shadow-md transition-all hover:shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-800 mb-5">
                            Select Stock Maintainence Fields
                        </h2>

                        <div className="flex flex-col gap-4">

                            {/* Static Options */}

                            <label className="flex items-center gap-3 text-gray-700 font-medium cursor-pointer">
                                <input
                                    type="checkbox"
                                    value="ItemWise"
                                    checked={itemWise}
                                    onChange={(e) => setItemWise(e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 cursor-pointer"
                                />
                                <span>Item</span>
                            </label>

                            <label className="flex items-center gap-3 text-gray-700 font-medium cursor-pointer">
                                <input
                                    type="checkbox"
                                    value="SizeWise"
                                    checked={sizeWise}
                                    onChange={(e) => setSizeWise(e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 cursor-pointer"
                                />
                                <span>Size </span>
                            </label>

                            <label className="flex items-center gap-3 text-gray-700 font-medium cursor-pointer">
                                <input
                                    type="checkbox"
                                    value="ColorWise"
                                    checked={sizeColorWise}
                                    onChange={(e) => setSizeColorWise(e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 cursor-pointer"
                                />
                                <span>Color </span>
                            </label>


                            {itemControlData?.data?.map((i, index) =>
                                Object.keys(i)
                                    ?.filter((key) => key.toLowerCase().includes("field") && key !== "id" && !!i[key])
                                    ?.map((key) => {
                                        const value = i[key];
                                        console.log(value, "value")
                                        return (
                                            <label
                                                key={value}
                                                className="flex items-center gap-3 text-gray-700 font-medium cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => handleCheckboxChange(key, i[key])}
                                                    checked={stockReports?.[i[key]]}
                                                    className="h-4 w-4 text-green-600 focus:ring-green-500 cursor-pointer"
                                                />
                                                <span>{value}</span>
                                            </label>
                                        );
                                    })
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center w-full">
                        <button
                            onClick={() => saveData()}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-all duration-200"
                        >
                            Save
                        </button>
                    </div>
                </div>

            </div>
        </>
    )

}

export default StockReport