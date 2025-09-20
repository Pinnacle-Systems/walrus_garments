import React, { useEffect, useState } from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"
import Swal from "sweetalert2";
import Modal from "../../../UiComponents/Modal";
import SubGrid from "./SubGrid";
import { Common } from "../../../Utils/DropdownData";

const FormItems = ({ orderSizeDetails, orderYarnDetails, setRequirementForm, requirementForm, setOrderYarnDetails, id, readOnly, processList, setYarnTotals, setRequirementItems, requirementItems, orderItemsData }) => {

    console.log(orderSizeDetails, "orderSizeDetails");
    console.log(orderYarnDetails, "orderYarnDetails")
    console.log(requirementItems, "requirementItems");
    console.log(orderItemsData, "orderData")

    const [tableDataView, setTableDataView] = useState(false)

    function calculateYarnTotals(yarnArr, sizeArr) {
        return yarnArr.map(yarn => {
            const total = sizeArr?.reduce((sum, size) => {
                return sum + (yarn.percentage * size.weight / 100) * size.qty;
            }, 0);

            return {
                yarnId: yarn.id,
                yarnName: yarn.name,
                totalRequired: total.toFixed(3)  // round to 3 decimals
            };
        });
    }

    console.log(calculateYarnTotals(orderYarnDetails, orderSizeDetails), "Totallll")



    function newFunction(value, yarnId) {
        setRequirementForm((prev) => {
            const newItems = structuredClone(prev);
            const percent = value === "" ? 0 : parseFloat(value);
            newItems.forEach((item) => {
                if (item.yarnId === yarnId) {
                    item.requireWeight = Number(((parseFloat(item.weight) * percent) / 100).toFixed(5));
                }
            });
            return newItems;
        });
    }


    function handleInputChange(value, index, yarnId, field) {
        console.log(field === "percentage", "field")

        const num = value === "" ? 0 : parseFloat(value);

        setOrderYarnDetails((prev) => {
            let newItems = structuredClone(prev);

            const totalWithoutCurrent = newItems?.reduce((sum, item, i) => {
                if (i === index) return sum;
                return sum + (parseFloat(item.percentage) || 0);
            }, 0);
            const lossPercentagetotal = newItems?.reduce((sum, item, i) => {
                if (i === index) return sum;
                return sum + (parseFloat(item.lossPercentage) || 0);
            }, 0);


            if (field === "percentage") {
                if (totalWithoutCurrent + num > 100) {
                    Swal.fire({
                        title: "Total percentage cannot exceed 100!",
                        icon: "error",
                        draggable: true,
                        timer: 1000,
                        showConfirmButton: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });
                }
                else {

                    newItems[index]["percentage"] = num;
                    const requirementArr = newItems?.map((yarn) => ({
                        yarn: yarn.Yarn.name,
                        percentage: yarn.percentage,
                        yarnKneedleId: yarn?.yarnKneedleId,
                        yarnId: yarn.yarnId,
                        count: yarn.yarnId,
                        colorId: yarn?.colorId,
                        uomId: yarn?.uomId ? yarn?.uomId : 1,
                        orderId: orderItemsData?.orderId,
                        orderDetailsId: orderItemsData?.id,
                        partyId: orderItemsData?.order?.partyId,
                        isProcess: yarn?.isProcess,
                        lossPercentage: yarn?.lossPercentage,
                        processId: yarn?.processId,

                        // requiredQty: orderSizeDetails?.reduce(
                        //     (sum, size) =>
                        //         sum + (yarn.percentage * size.weight / 100) * size.qty,

                        //     0
                        // ).toFixed(3),
                        requiredQty: orderSizeDetails?.reduce((sum, size) => {
                            const base = (yarn.percentage * size.weight / 100) * size.qty;
                            const withLoss = base * ((parseFloat(yarn.lossPercentage) || 0) + 100) / 100;
                            return sum + withLoss;
                        }, 0).toFixed(3),
                    }));

                    setRequirementItems((prev) => {
                        console.log("prev snapshot:", JSON.parse(JSON.stringify(prev)));

                        const map = new Map();

                        prev.forEach((item) => {
                            map.set(`${item.yarnId}-${item.colorId}`, { ...item });
                        });
                        console.log("map", map);

                        requirementArr.forEach((item) => {
                            const key = `${item.yarnId}-${item.colorId}`;
                            const existing = map.get(key) || {};

                            map.set(key, {
                                ...existing,
                                ...item,
                            });
                        });

                        return Array.from(map.values());
                    });




                }
            }
            else if (field === "isProcess") {
                newItems[index].processId = "";
                newItems[index].lossPercentage = "";
                newItems[index][field] = value;

            }
            else {
                newItems[index][field] = value;
                console.log(lossPercentagetotal, "lossPercentagetotal");

                const requirementArr = newItems?.map((yarn) => ({
                    yarn: yarn.Yarn.name,
                    percentage: yarn.percentage,
                    yarnKneedleId: yarn?.yarnKneedleId,
                    yarnId: yarn.yarnId,
                    count: yarn.yarnId,
                    colorId: yarn?.colorId,
                    uomId: yarn?.uomId ? yarn?.uomId : 1,
                    orderId: orderItemsData?.orderId,
                    orderDetailsId: orderItemsData?.id,
                    partyId: orderItemsData?.order?.partyId,
                    isProcess: yarn?.isProcess,
                    lossPercentage: yarn?.lossPercentage,
                    processId: yarn?.processId,

                    // requiredQty: orderSizeDetails?.reduce(
                    //     (sum, size) =>
                    //         sum + (yarn.percentage * size.weight / 100) * size.qty,

                    //     0
                    // ).toFixed(3),
                    requiredQty: orderSizeDetails?.reduce((sum, size) => {
                        const base = (yarn.percentage * size.weight / 100) * size.qty;
                        const withLoss = base * ((parseFloat(yarn.lossPercentage) || 0) + 100) / 100;
                        return sum + withLoss;
                    }, 0).toFixed(3),
                }));

                setRequirementItems((prev) => {
                    console.log("prev snapshot:", JSON.parse(JSON.stringify(prev)));

                    const map = new Map();

                    // Start with prev
                    prev.forEach((item) => {
                        map.set(`${item.yarnId}-${item.colorId}`, { ...item });
                    });

                    // Merge requirementArr on top
                    requirementArr.forEach((item) => {
                        const key = `${item.yarnId}-${item.colorId}`;
                        const existing = map.get(key) || {};

                        map.set(key, {
                            ...existing,
                            ...item,    
                        });
                    });

                    return Array.from(map.values());
                });
            }


            return newItems;
        });

        setRequirementForm((prev) => {
            const newItems = structuredClone(prev);
            newItems.forEach((item) => {
                if (item.yarnId === yarnId) {
                    item.requireWeight = Number(
                        ((parseFloat(item.weight) * num) / 100).toFixed(5)
                    );
                    item[field] = value
                }
            });
            return newItems;
        });


    }

    // console.log(requirementForm, "requirementForm");

    useEffect(() => {
        orderYarnDetails?.forEach((yarn) => {
            newFunction(yarn?.percentage, yarn?.yarnId);
        });
    }, [orderYarnDetails]);







    useEffect(() => {
        if (!orderSizeDetails?.length || !orderYarnDetails?.length) return;

        const combined = [];

        orderSizeDetails.forEach(size => {
            orderYarnDetails.forEach(yarn => {
                combined.push({
                    sizeId: size.sizeId,
                    yarnId: yarn.yarnId,
                    colorId: yarn.colorId,
                    requireWeight: 0,
                    weight: size.weight,
                    uomId: size.uomId,
                });
            });
        });

        setRequirementForm(combined);
        orderYarnDetails?.forEach((yarn) => {
            newFunction(yarn?.percentage, yarn?.yarnId);
        });
    }, [orderSizeDetails]);

    const getQtyYarnSize = (sizeId, yarnId, colorId) => {
        // console.log(sizeId, yarnId, colorId, "sizeId, yarnId, colorId");

        const item = requirementForm?.find(
            i => i.sizeId === sizeId && i.yarnId === yarnId && i.colorId === colorId
        )?.requireWeight


        if (!item) return 0;

        return item;
    };


    const getRequireWeight = (yarnId) => {
        return requirementForm?.reduce((total, item) => {
            if (item.yarnId !== yarnId) return total;

            const sizeQty = orderSizeDetails?.find(s => s.sizeId === item.sizeId)?.qty || 0;

            const base = parseFloat(item?.requireWeight || 0) * parseFloat(sizeQty || 0);
            const withLoss = base * ((parseFloat(item?.lossPercentage) || 0) + 100) / 100;

            return total + withLoss;
        }, 0).toFixed(3);
    };






    return (
        <>
            <Modal
                isOpen={tableDataView}
                onClose={() => setTableDataView(false)}
                widthClass="  h-[50%] w-[60%]"
            >
                <SubGrid
                    onClose={() => setTableDataView(false)}
                    orderYarnDetails={orderYarnDetails}
                    getRequireWeight={getRequireWeight}
                />
            </Modal>
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm h-[350px] overflow-y-auto">
                <div className="flex justify-between items-center mb-2 overflow-y-auto">
                    <h2 className="font-medium text-slate-700">List Of Items</h2>




                </div>

                <div className="overflow-x-auto mt-8 w-full">
                    <table className="min-w-[1200px] border-collapse table-fixed">
                        <thead className="bg-gray-200 text-gray-800">

                            <tr>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">S No</td>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-96">Yarn </td>

                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-44">Color </td>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-20">Process(Y/N) </td>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-32">Process</td>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-20">loss %</td>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-20">Percentage</td>
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-32">Size</td>






                                {orderSizeDetails?.map((item, index) => {
                                    return (
                                        <td
                                            key={index}
                                            className="border border-gray-300 px-2 py-1 text-center text-xs w-20"
                                        >
                                            {item?.size?.name}
                                        </td>
                                    )
                                })}
                                <td className="border border-gray-300 px-2 py-1 text-center text-xs w-32">RequiredQty (kgs)</td>


                            </tr>

                            <tr className="bg-white">
                                <td colSpan={7} className="bg-white border-l border-gray-300">
                                </td>
                                <td className="border border-gray-300 px-2 py-1 text-end text-xs">
                                    Size Weight (grams)
                                </td>
                                {orderSizeDetails?.map((item, index) => (
                                    <td key={index} className="border border-gray-300 px-2 py-1 text-center text-xs">
                                        {item?.weight}
                                    </td>
                                ))}
                                <td className="border border-gray-300 px-2 py-1 text-left text-[11px] "></td>

                            </tr>
                            <tr className="bg-white">
                                <td colSpan={7} className="bg-white border-l border-gray-300" >
                                </td>
                                <td className="border border-gray-300 px-2 py-1 text-end text-xs">
                                    Order Qty (kgs)
                                </td>
                                {orderSizeDetails?.map((item, index) => (
                                    <td key={index} className="border border-gray-300 px-2 py-1 text-center text-xs">
                                        {item?.qty}
                                    </td>
                                ))}
                                <td className="border border-gray-300 px-2 py-1 text-left text-[11px] "></td>

                            </tr>

                        </thead>
                        <tbody>

                            {orderYarnDetails?.map((yarn, index) => (
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-[11px] w-10">{index + 1}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-left text-[11px] ">{yarn?.Yarn?.name}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-left text-[11px] ">{yarn?.Color?.name}</td>




                                    <td className="py-0.5 border border-gray-300 text-[11px]">
                                        <select
                                            onKeyDown={e => {
                                                if (e.key === "Delete") {
                                                    handleInputChange("", index, yarn?.yarnId, "isProcess");
                                                }
                                            }}
                                            disabled={readOnly}
                                            className="text-left w-full rounded h-full py-1"
                                            value={yarn?.isProcess}   // 👈 default "No"
                                            onChange={(e) => handleInputChange(e.target.value, index, yarn?.yarnId, "isProcess")}
                                            onBlur={(e) => handleInputChange(e.target.value, index, yarn?.yarnId, "isProcess")}
                                        >
                                            {Common?.map(size => (
                                                <option value={size.value} key={size.id}>
                                                    {size?.show}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="py-0.5 border border-gray-300 text-[11px]">
                                        <select
                                            onKeyDown={e => {
                                                if (e.key === "Delete") {
                                                    handleInputChange("", index, "processId");
                                                }
                                            }}
                                            disabled={readOnly || yarn?.isProcess !== "Yes"} // disable if "No"
                                            className="text-left w-full rounded h-full py-1"
                                            value={yarn?.processId || ""}   // default empty
                                            onChange={(e) => handleInputChange(e.target.value, index, yarn?.yarnId, "processId")}
                                            onBlur={(e) => handleInputChange(e.target.value, index, yarn?.yarnId, "processId")}
                                        >
                                            <option value="">select</option>
                                            {processList?.map(size => (
                                                <option value={size.id || ""} key={size.id}>
                                                    {size?.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>


                                    <td className=" border border-gray-300 text-right text-[11px] py-1.5 px-2 text-xs">
                                        <input
                                            className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={yarn?.lossPercentage || ""}



                                            onFocus={e => e.target.select()}

                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                            }}
                                            onChange={(e) => {
                                                const val = e.target.value;

                                                handleInputChange(val, index, yarn?.yarnId, "lossPercentage");
                                            }}
                                            placeHolder="0.00"

                                            disabled={readOnly || yarn?.isProcess !== "Yes" || !yarn?.processId}
                                            onBlur={(e) => {
                                                const formatted =
                                                    e.target.value === "" ? "" : Number(e.target.value).toFixed(2);
                                                e.target.value = formatted;
                                                handleInputChange(formatted, index, yarn?.yarnId, "lossPercentage");
                                            }}

                                        />
                                    </td>
                                    <td className=" border border-gray-300 text-right text-[11px] py-1.5 px-2 text-xs">
                                        <input
                                            className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={yarn?.percentage || ""}
                                            onFocus={e => e.target.select()}




                                            disabled={readOnly}
                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                            }}
                                            onChange={(e) => {
                                                const val = e.target.value;

                                                handleInputChange(val, index, yarn?.yarnId, "percentage");


                                            }}
                                            onBlur={(e) => {
                                                const formatted =
                                                    e.target.value === "" ? "" : Number(e.target.value).toFixed(2);
                                                e.target.value = formatted;
                                                handleInputChange(formatted, index, yarn?.yarnId, "percentage");
                                            }}
                                            placeHolder="0.00"
                                        />
                                    </td>
                                    <td className="border-b border-gray-300 px-2 py-1 text-left text-[11px] "></td>


                                    {(orderSizeDetails || []).map((size) => (
                                        <>
                                            <td className="border border-gray-300 px-1 py-1  text-[11px] ">
                                                <input
                                                    type="number"

                                                    min={"0"}
                                                    onFocus={(e) => e.target.select()}
                                                    className=" rounded  w-full text-right"
                                                    value={parseFloat(getQtyYarnSize(size?.sizeId, yarn?.yarnId, yarn?.colorId,) || "")}
                                                    disabled={true}

                                                />
                                            </td>

                                        </>

                                    ))}


                                    <td className="border border-gray-300 px-2 py-1 text-right text-[12px] font-bold"> {getRequireWeight(yarn?.yarnId)}</td>




                                </tr>
                            ))}

                        </tbody>

                    </table>
                </div>

                {/* <div className="flex item-center  py-1 mt-5">
                    <button
                        onClick={() => setTableDataView(true)}
                        className="flex items-center gap-1 rounded-md border px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                    >
                        <span className="text-xs">👁</span>
                        View Required Qty
                    </button>
                </div> */}




            </div>
            <div>

            </div>
        </>
    )
}

export default FormItems;













