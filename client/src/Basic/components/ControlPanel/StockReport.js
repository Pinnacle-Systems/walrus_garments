import { useCallback, useEffect, useState } from "react";
import { useAddStockReportControlMutation, useGetStockReportControlByIdQuery, useGetStockReportControlQuery, useUpdateStockReportControlMutation } from "../../../redux/uniformService/StockReportControl.Services";
import Swal from "sweetalert2";
import { useGetItemControlPanelMasterQuery } from "../../../redux/uniformService/ItemControlPanelService";
import secureLocalStorage from "react-secure-storage";
import Loader from "../Loader";
import { uppercase } from "../../../Utils/helper";

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
    const [sectionWise, setSectionWise] = useState(false)

    const [stockReports, setStockReports] = useState({});

    const [field6, setField6] = useState("")
    const [field7, setField7] = useState("")
    const [field8, setField8] = useState("")
    const [field9, setField9] = useState("")
    const [field10, setField10] = useState("")


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

    const itemControllAccess = itemControlData?.data?.[0]



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
            setField6(data?.field6 ? data?.field6 : "")
            setField7(data?.field7 ? data?.field7 : "")
            setField8(data?.field8 ? data?.field8 : "")
            setField9(data?.field9 ? data?.field9 : "")
            setField10(data?.field10 ? data?.field10 : "")

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
            setField6(data?.field6 ? data?.field6 : "")
            setField7(data?.field7 ? data?.field7 : "")
            setField8(data?.field8 ? data?.field8 : "")
            setField9(data?.field9 ? data?.field9 : "")
            setField10(data?.field10 ? data?.field10 : "")
        }
    }, [id]);


    console.log(itemControlData, "itemControlData")



    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        itemWise, sizeWise, sizeColorWise, stockReports, id,
        field6,
        field7,
        field8,
        field9,
        field10
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

    const hasDuplicateFields = () => {
        const values = [field6, field7, field8, field9, field10]
            .map(v => v.trim().toLowerCase())
            .filter(v => v !== "");

        return new Set(values).size !== values.length;
    };

    const saveData = () => {

        if (hasDuplicateFields()) {
            Swal.fire({
                title: "Duplicate field names are not allowed",
                icon: "warning",
            });
            return;
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated")
        } else {
            handleSubmitCustom(addData, data, "Created")
        }
    }

    const handleCheckboxChange = (key, value, condtion) => {
        console.log(condtion, "condtion")
        if (condtion) {
            setStockReports(prev => ({
                ...prev,
                [key]: value
            }));
        } else {
            setStockReports(prev => ({
                ...prev,
                [key]: ""
            }));
        }

    };





    useEffect(() => {
        if (!itemControlData?.data?.length || id) return;

        const initialState = {};
        itemControlData?.data?.forEach((i) => {
            console.log(Object.keys(i)?.filter(key => key.toLowerCase().includes("field")), "keys");

            Object.keys(i)?.filter(key => key.toLowerCase().includes("field") && !!i[key])?.map(key => {
                initialState[key] = "";

            })
        })
        console.log(initialState, "initialState");

        setStockReports(initialState);
    }, [itemControlData, itemControlLoading, itemControlFetching]);

    console.log(stockReports, 'stockReports')

    if (isLoading || isFetching || isSingleLoading || isSingleFetching) return <Loader />

    return (
        <>
            <div>
                <div className='grid grid-cols-12 mb-2   px-0.5 text-[14px] font-semibold'>
                    <div className="col-span-4 items-start space-y- bg-gray-50 p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800 mb-5">
                            Select Stock Maintainence Fields
                        </h2>

                        <div className="flex flex-col gap-7">


                            <label className="flex items-center gap-3 text-gray-700 font-medium cursor-pointer">
                                <input
                                    type="checkbox"
                                    value="ItemWise"
                                    checked={itemWise}
                                    onChange={(e) => setItemWise(e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 cursor-pointer"
                                />
                                <span>ITEM</span>
                            </label>

                            <label className="flex items-center gap-3 text-gray-700 font-medium cursor-pointer">
                                <input
                                    type="checkbox"
                                    value="SizeWise"
                                    checked={sizeWise}
                                    onChange={(e) => setSizeWise(e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 cursor-pointer"
                                />
                                <span>SIZE </span>
                            </label>

                            <label className="flex items-center gap-3 text-gray-700 font-medium cursor-pointer">
                                <input
                                    type="checkbox"
                                    value="ColorWise"
                                    checked={sizeColorWise}
                                    onChange={(e) => setSizeColorWise(e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 cursor-pointer"
                                />
                                <span>COLOR</span>
                            </label>
                            {itemControllAccess?.sectionType && (
                                <>
                                    <label className="flex items-center gap-3 text-gray-700 font-medium cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value="ColorWise"
                                            checked={sectionWise}
                                            onChange={(e) => setSectionWise(e.target.checked)}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 cursor-pointer"
                                        />
                                        <span>SECTION</span>
                                    </label>

                                </>
                            )}

                            {itemControlData?.data?.map((i, index) =>
                                Object.keys(i)
                                    ?.filter((key) => key.toLowerCase().includes("field") && key !== "id" && !!i[key])
                                    ?.map((key) => {
                                        const value = i[key];
                                        console.log(key, "value", i)
                                        return (
                                            <label
                                                key={value}
                                                className="flex items-center gap-3 text-gray-700 font-medium cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => handleCheckboxChange(key, i[key], e.target.checked)}
                                                    checked={stockReports?.[key]}
                                                    className="h-4 w-4 text-green-600 focus:ring-green-500 cursor-pointer"
                                                />
                                                <span>{uppercase(value)}</span>
                                            </label>
                                        );
                                    })
                            )}
                        </div>




                    </div>
                    <div className="col-span-4 bg-gray-50 p-5 space-y-5 w-full ">
                        <h1 className="border-b border-gray-400 p-2">Stock Custom Fields </h1>
                        <div className="flex flex-row gap-5 ">
                            <span className="font-bold mt-2">Field 1</span>
                            <input
                                className="border border-gray-500 py-1 px-1"
                                onChange={(e) => setField6(uppercase(e.target.value))}
                                value={field6}
                            />
                        </div>
                        <div className="flex flex-row gap-5">
                            <span className="font-bold mt-2">Field 2</span>
                            <input
                                className="border border-gray-500 py-1 px-1"
                                onChange={(e) => setField7(uppercase(e.target.value))}
                                value={field7}

                            />
                        </div>
                        <div className="flex flex-row gap-5">
                            <span className="font-bold mt-2">Field 3</span>
                            <input
                                className="border border-gray-500 py-1 px-1"
                                onChange={(e) => setField8(uppercase(e.target.value))}
                                value={field8}


                            />
                        </div>
                        <div className="flex flex-row gap-5">
                            <span className="font-bold mt-2">Field 4</span>
                            <input
                                className="border border-gray-500 py-1 px-1"
                                onChange={(e) => setField9(uppercase(e.target.value))}
                                value={field9}

                            />
                        </div>
                        <div className="flex flex-row gap-5">
                            <span className="font-bold mt-2">Field 5</span>
                            <input
                                className="border border-gray-500 py-1 px-1"
                                onChange={(e) => setField10(uppercase(e.target.value))}
                                value={field10}

                            />
                        </div>
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
        </>
    )

}

export default StockReport