import secureLocalStorage from "react-secure-storage";
import { useGetStateQuery } from "../../../redux/services/StateMasterService";
import { useAddItemControlPanelMasterMutation, useDeleteItemControlPanelMasterMutation, useGetItemControlPanelMasterByIdQuery, useGetItemControlPanelMasterQuery, useUpdateItemControlPanelMasterMutation } from "../../../redux/uniformService/ItemControlPanelService";
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import Loader from "../Loader";
import { uppercase } from "../../../Utils/helper";

const ItemSettings = () => {

    const [id, setId] = useState("")
    const [sectionType, setSectionType] = useState(false)
    const [sizeWise, setSizeWise] = useState(false)
    const [sizeColor, setSizeColor] = useState(false)
    const [field1, setField1] = useState("")
    const [field2, setField2] = useState("")
    const [field3, setField3] = useState("")
    const [field4, setField4] = useState("")
    const [field5, setField5] = useState("")


    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };

    const { data: allData, isLoading, isFetching } = useGetItemControlPanelMasterQuery({ params });
    const [invalidateTagsDispatch] = useInvalidateTags();


    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetItemControlPanelMasterByIdQuery(id, { skip: !id });


    const [addData] = useAddItemControlPanelMasterMutation();
    const [updateData] = useUpdateItemControlPanelMasterMutation();
    const [removeData] = useDeleteItemControlPanelMasterMutation();



    useEffect(() => {
        setId(allData?.data?.[0]?.id)
    }, [allData, isLoading, isFetching])

    const syncFormWithDb = useCallback((data) => {
        if (!id) {
            setSectionType(data?.sectionType ? data?.sectionType : false)
            setSizeWise(data?.sizeWise ? data?.sizeWise : false)
            setSizeColor(data?.size_color_wise ? data?.size_color_wise : false)
            setField1(data?.field1 ? data?.field1 : "")
            setField2(data?.field2 ? data?.field2 : "")
            setField3(data?.field3 ? data?.field3 : "")
            setField4(data?.field4 ? data?.field4 : "")
            setField5(data?.field5 ? data?.field5 : "")

        } else {
            setSectionType(data?.sectionType ? data?.sectionType : false)
            setSizeWise(data?.sizeWise ? data?.sizeWise : false)
            setSizeColor(data?.size_color_wise ? data?.size_color_wise : false)
            setField1(data?.field1 ? data?.field1 : "")
            setField2(data?.field2 ? data?.field2 : "")
            setField3(data?.field3 ? data?.field3 : "")
            setField4(data?.field4 ? data?.field4 : "")
            setField5(data?.field5 ? data?.field5 : "")
        }
    }, [id]);

    console.log(field1, "field1")


    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);


    const data = {
        id, field1, field2, field3, field4, field5,
        sectionType, sizeWise, sizeColor
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();

            Swal.fire({
                title: text + " " + "Successfully",
                icon: "success",
            });
            invalidateTagsDispatch()

        } catch (error) {
            console.log("handle")
        }
    }

    const hasDuplicateFields = () => {
        const values = [field1, field2, field3, field4, field5]
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

    if (isLoading || isFetching || isSingleLoading || isSingleFetching ) return <Loader />


    return (
        <>
            <div className="bg-white">
                <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 p-5 space-y-9 w-full  ">
                        <h1 className="border-b border-gray-400 p-2">Item Settings </h1>
                        <div className="flex flex-row gap-5 ">
                            <input
                                className="border border-gray-500 py-1 px-1"
                                type="checkbox"
                                onChange={(e) => setSectionType(e.target.checked)}
                                checked={sectionType}
                            />
                            <span className="font-bold ">Section Type</span>

                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-5  ">
                                Price Method
                            </p>

                            <div className="space-y-3">
                                <div className="flex flex-row gap-5 ">
                                    <input
                                        className="border border-gray-500 py-1 px-1"
                                        type="checkbox"
                                        onChange={(e) => setSizeWise(e.target.checked)}
                                        checked={sizeWise}
                                    />
                                    <span className="font-bold ">Size Wise</span>

                                </div>

                                <div className="flex flex-row gap-5 ">
                                    <input
                                        className="border border-gray-500 py-1 px-1"
                                        type="checkbox"
                                        onChange={(e) => setSizeColor(e.target.checked)}
                                        checked={sizeColor}
                                    />
                                    <span className="font-bold ">Size & color Wise</span>

                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="col-span-4 p-5 space-y-9 w-full ">
                        <h1 className="border-b border-gray-400 p-2">Item Custom Fields </h1>
                        <div className="flex flex-row gap-5 ">
                            <span className="font-bold mt-2">Field 1</span>
                            <input
                                className="border border-gray-500 py-1 px-1"
                                onChange={(e) => setField1(uppercase(e.target.value))}
                                value={field1}
                            />
                        </div>
                        <div className="flex flex-row gap-5">
                            <span className="font-bold mt-2">Field 2</span>
                            <input
                                className="border border-gray-500 py-1 px-1"
                                onChange={(e) => setField2(uppercase(e.target.value))}
                                value={field2}

                            />
                        </div>
                        <div className="flex flex-row gap-5">
                            <span className="font-bold mt-2">Field 3</span>
                            <input
                                className="border border-gray-500 py-1 px-1"
                                onChange={(e) => setField3(uppercase(e.target.value))}
                                value={field3}


                            />
                        </div>
                        <div className="flex flex-row gap-5">
                            <span className="font-bold mt-2">Field 4</span>
                            <input
                                className="border border-gray-500 py-1 px-1"
                                onChange={(e) => setField4(uppercase(e.target.value))}
                                value={field4}

                            />
                        </div>
                        <div className="flex flex-row gap-5">
                            <span className="font-bold mt-2">Field 5</span>
                            <input
                                className="border border-gray-500 py-1 px-1"
                                onChange={(e) => setField5(uppercase(e.target.value))}
                                value={field5}

                            />
                        </div>
                    </div>

                </div>
            </div>


            <div className="flex  w-full justify-center p-2  ">
                <button
                    onClick={() => saveData()}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-all duration-200"
                >
                    Save
                </button>
            </div>
        </>
    )
}

export default ItemSettings;