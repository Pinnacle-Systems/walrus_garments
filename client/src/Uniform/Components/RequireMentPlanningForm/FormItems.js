import React, { useEffect, useState } from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"
import Swal from "sweetalert2";
import Modal from "../../../UiComponents/Modal";
import SubGrid from "./SubGrid";
import { Common } from "../../../Utils/DropdownData";
import AccessoryRequirementPlannig from "./AccesssoryPlanningItems";

const FormItems = ({ orderSizeDetails, orderYarnDetails, setRequirementForm, requirementForm, setOrderYarnDetails, id, readOnly, processList, setYarnTotals, setRequirementItems, requirementItems, orderItemsData, tempOrderId, setTempOrderId, tempOrderDetailsId,
    setAccessoryItems, accessoryItems, accessoryGroupList, accessoryCategoryList, accessoryList, 
    colorList, uomList, sizeList, orderId, stock, setStock

}) => {

    console.log(orderSizeDetails, "orderSizeDetails");
    console.log(orderYarnDetails, "orderYarnDetails")
    console.log(requirementItems, "requirementItems");
    console.log(requirementForm, "requirementForm")
    console.log(processList, "processList")
    // console.log(orderYarnDetails, "orderYarnDetails")

    const [tableDataView, setTableDataView] = useState(false)
    const [processView, setProcessView] = useState(false)
    const [type, setType] = useState("yarn");
    const [selectedIndex, setSelectedIndex] = useState("")
    const [selectedItem, setSelectedItem] = useState("")






    function handleInputChange(value, index, yarnId, field, subIndex) {

        console.log("field", field);

        const num = value === "" ? 0 : parseFloat(value);
        console.log("num", num);

        setOrderYarnDetails((prev) => {
            let newItems = structuredClone(prev);

            const totalWithoutCurrent = newItems?.reduce((sum, item, i) => {
                if (i === index) return sum;
                return sum + (parseFloat(item.percentage) || 0);
            }, 0);

            const requirementArr = newItems?.map((yarn) => ({
                yarn: yarn.Yarn.name,
                percentage: yarn.percentage,
                yarnKneedleId: yarn?.yarnKneedleId,
                yarnId: yarn.yarnId,
                count: yarn.count,
                colorId: yarn?.colorId,
                uomId: yarn?.uomId ? yarn?.uomId : 1,
                // orderId: orderItemsData?.orderId,
                // orderDetailsId: orderItemsData?.id,
                orderId: tempOrderId,
                orderDetailsId: tempOrderDetailsId,
                partyId: orderItemsData?.order?.partyId,
                isProcess: yarn?.isProcess,
                lossPercentage: yarn?.lossPercentage,
                processId: yarn?.processId,
                wastagePercentage: yarn?.wastagePercentage,
                yarnType: 'DyedYarn',
                // RequirementYarnProcessList: yarn?.RequirementYarnProcessList,

                // requiredQty: orderSizeDetails?.reduce(
                //     (sum, size) =>
                //         sum + (yarn.percentage * size.weight / 100) * size.qty,

                //     0
                // ).toFixed(3),
                requiredQty: orderSizeDetails?.reduce((sum, size) => {
                    const base = (yarn.percentage * size.weight / 100) * size.qty;
                    const totalLossPercentage = (yarn?.RequirementYarnProcessList || []).reduce(
                        (acc, process) => acc + (parseFloat(process.lossPercentage) || 0),
                        0
                    );
                    console.log(totalLossPercentage, "totalLossPercentage");
                    const withLoss = base * (((parseFloat(totalLossPercentage) || 0) + (parseFloat(yarn?.wastagePercentage) || 0) + 100)) / 100;
                    return sum + withLoss;
                }, 0).toFixed(3),
            }));

            setRequirementItems((prev) => {

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


            if (field === "percentage") {
                if (totalWithoutCurrent + num > 100) {
                    Swal.fire({
                        title: "Total percentage cannot exceed 100!",
                        icon: "error",

                    });
                }
                else {

                    newItems[index][field] = num;
                    console.log(newItems, "newItems");

                    // const requirementArr = newItems?.map((yarn) => ({
                    //     yarn: yarn.Yarn.name,
                    //     percentage: yarn.percentage,
                    //     yarnKneedleId: yarn?.yarnKneedleId,
                    //     yarnId: yarn.yarnId,
                    //     count: yarn.count,
                    //     colorId: yarn?.colorId,
                    //     uomId: yarn?.uomId ? yarn?.uomId : 1,
                    //     // orderId: orderItemsData?.orderId,
                    //     // orderDetailsId: orderItemsData?.id,
                    //     orderId: tempOrderId,
                    //     orderDetailsId: tempOrderDetailsId,
                    //     partyId: orderItemsData?.order?.partyId,
                    //     isProcess: yarn?.isProcess,
                    //     lossPercentage: yarn?.lossPercentage,
                    //     processId: yarn?.processId,
                    //     wastagePercentage: yarn?.wastagePercentage,
                    //     yarnType: 'DyedYarn',
                    //     // RequirementYarnProcessList: yarn?.RequirementYarnProcessList,

                    //     // requiredQty: orderSizeDetails?.reduce(
                    //     //     (sum, size) =>
                    //     //         sum + (yarn.percentage * size.weight / 100) * size.qty,

                    //     //     0
                    //     // ).toFixed(3),
                    //     requiredQty: orderSizeDetails?.reduce((sum, size) => {
                    //         const base = (yarn.percentage * size.weight / 100) * size.qty;
                    //         const totalLossPercentage = (yarn?.RequirementYarnProcessList || []).reduce(
                    //             (acc, process) => acc + (parseFloat(process.lossPercentage) || 0),
                    //             0
                    //         );
                    //         console.log(totalLossPercentage, "totalLossPercentage");
                    //         const withLoss = base * (((parseFloat(totalLossPercentage) || 0) + (parseFloat(yarn?.wastagePercentage) || 0) + 100)) / 100;
                    //         return sum + withLoss;
                    //     }, 0).toFixed(3),
                    // }));

                    // setRequirementItems((prev) => {

                    //     const map = new Map();

                    //     prev.forEach((item) => {
                    //         map.set(`${item.yarnId}-${item.colorId}`, { ...item });
                    //     });
                    //     console.log("map", map);

                    //     requirementArr.forEach((item) => {
                    //         const key = `${item.yarnId}-${item.colorId}`;
                    //         const existing = map.get(key) || {};

                    //         map.set(key, {
                    //             ...existing,
                    //             ...item,
                    //         });
                    //     });

                    //     return Array.from(map.values());
                    // });




                }
            }
            else if (field === "isProcess") {



                setRequirementItems((prev) => {
                    let reruirement = structuredClone(prev);
                    console.log(prev, "prev")


                    if (value == "Yes") {

                        reruirement[index]["yarnType"] = "GreyYarn";
                        reruirement[index][field] = value;

                    } else {
                        console.log(reruirement, "reruirement")
                        reruirement[index]["yarnType"] = "DyedYarn";
                        reruirement[index][field] = value;
                        newItems[index].RequirementYarnProcessList = []

                    }
                    return reruirement

                })


                newItems[index][field] = value;



            }
            else if (field === "lossPercentage" || field === "processId") {
                newItems[index].RequirementYarnProcessList[subIndex][field] = value;


            }
            else {


                newItems[index][field] = value;

                console.log(field, "field", value, "value", newItems, "newItems");

                const requirementArr = newItems?.map((yarn) => ({
                    yarn: yarn.Yarn.name,
                    percentage: yarn.percentage,
                    yarnKneedleId: yarn?.yarnKneedleId,
                    yarnId: yarn.yarnId,
                    count: yarn.count,
                    colorId: yarn?.colorId,
                    uomId: yarn?.uomId ? yarn?.uomId : 1,
                    orderId: tempOrderId,
                    orderDetailsId: tempOrderDetailsId,
                    partyId: orderItemsData?.order?.partyId,
                    isProcess: yarn?.isProcess,
                    lossPercentage: yarn?.lossPercentage,
                    processId: yarn?.processId,
                    wastagePercentage: yarn?.wastagePercentage,
                    RequirementYarnProcessList: yarn?.RequirementYarnProcessList,
                    yarnType: yarn?.isProcess == "Yes" ? 'GreyYarn' : 'DyedYarn',
                    requiredQty: orderSizeDetails?.reduce((sum, size) => {
                        const base = (yarn.percentage * size.weight / 100) * size.qty;
                        const totalLossPercentage = (yarn?.RequirementYarnProcessList || []).reduce(
                            (acc, process) => acc + (parseFloat(process.lossPercentage) || 0),
                            0
                        );
                        const withLoss = base * (((parseFloat(totalLossPercentage) || 0) + (parseFloat(yarn?.wastagePercentage) || 0) + 100)) / 100;
                        return sum + withLoss;
                    }, 0).toFixed(3),



                }));


                setRequirementItems((prev) => {

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




    function newFunction(value, yarnId) {
        setRequirementForm((prev) => {
            const newItems = structuredClone(prev);
            const percent = value === "" ? 0 : parseFloat(value);
            newItems.forEach((item) => {
                if (item.yarnId === yarnId) {
                    item.requireWeight = parseFloat(((parseFloat(item.weight) * percent) / 100).toFixed(5));
                }
            });
            return newItems;
        });
    }











    useEffect(() => {
        if (!orderSizeDetails?.length || !orderYarnDetails?.length) return;

        const combined = [];

        orderSizeDetails?.forEach(size => {
            orderYarnDetails?.forEach(yarn => {
                combined.push({
                    sizeId: size.sizeId,
                    yarnId: yarn.yarnId,
                    colorId: yarn.colorId,
                    requireWeight: 0,
                    weight: size.weight,
                    uomId: size.uomId,
                    wastagePercentage: yarn?.wastagePercentage,
                    RequirementYarnProcessList: yarn?.RequirementYarnProcessList,
                    isProcess: yarn?.isProcess,
                });
            });
        });

        setRequirementForm(combined);
        orderYarnDetails?.forEach((yarn) => {
            newFunction(yarn?.percentage, yarn?.yarnId);
        });
    }, [orderSizeDetails, orderYarnDetails]);




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

            const totalLossPercentage = (item?.RequirementYarnProcessList || []).reduce(
                (acc, process) => acc + (parseFloat(process?.lossPercentage) || 0),
                0
            );
            const withLoss = base * ((parseFloat(totalLossPercentage) || 0) + (parseFloat(item?.wastagePercentage) || 0) + 100) / 100;

            return total + withLoss;
        }, 0).toFixed(3);
    };

    useEffect(() => {
        orderYarnDetails?.forEach((yarn) => {
            newFunction(yarn?.percentage, yarn?.yarnId);
        });
    }, [orderYarnDetails]);



    function addItem(id, checked) {
        setOrderYarnDetails(prev =>
            prev.map(item => {
                if (item.id === id) {
                    if (checked) {
                        return { ...item, isNotPurchase: true };
                    } else {
                        const { isPurchase, ...rest } = item;
                        return rest;
                    }
                }
                return item;
            })
        );
    }


    function removeItem(id) {
        setOrderYarnDetails(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems = newItems?.filter(item => parseInt(item.id) !== parseInt(id))
            return newItems
        });
    }

    function handleChange(id, checked, index) {
        if (checked) {
            addItem(id, true);
            handleInputChange(checked, index, null, "isNotPurchase");
        } else {
            addItem(id, false); // removes isPurchase
            handleInputChange(checked, index, null, "isNotPurchase");

        }
    }




    function handleSelectAllChange(checked, invoiceItems) {

        setOrderYarnDetails(prev =>
            prev.map(item => {
                const isInInvoice = invoiceItems?.some(
                    inv => parseInt(inv.id) === parseInt(item.id)
                );

                if (!isInInvoice) return item;

                if (checked) {
                    return { ...item, isNotPurchase: true };
                } else {
                    const { isNotPurchase, ...rest } = item;
                    return rest;
                }
            })
        );

        setRequirementItems(prev =>
            prev.map((item, index) => {

                return {
                    ...item,
                    isNotPurchase: checked
                };
            })
        );
    }


    function getSelectAll(items) {
        if (!items || items.length === 0) return false;

        return items.every(item => item.isNotPurchase == true);
    }



    return (
        <>
            {/* <Modal
                isOpen={tableDataView}
                onClose={() => setTableDataView(false)}
                widthClass="  h-[50%] w-[60%]"
            >
                <SubGrid
                    onClose={() => setTableDataView(false)}
                    orderYarnDetails={orderYarnDetails}
                    getRequireWeight={getRequireWeight}
                />
            </Modal> */}
            <Modal
                isOpen={processView}
                onClose={() => setProcessView(false)}
                widthClass="  h-[50%] w-[60%]"
            >
                <SubGrid
                    onClose={() => setProcessView(false)}
                    orderYarnDetails={orderYarnDetails}
                    getRequireWeight={getRequireWeight}
                    processList={processList}
                    selectedIndex={selectedIndex}
                    selectedItem={selectedItem}
                    setSelectedItem={setSelectedItem}
                    handleInputChange={handleInputChange}
                    setOrderYarnDetails={setOrderYarnDetails}
                />
            </Modal>
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm h-[350px] overflow-y-auto">
                <div className="flex flex-row  justify-between gap-7 items-center mb-2 overflow-y-auto">
                    <h2 className="font-bold text-gray-800">{type == "yarn" ? " Yarn Requirement Details" : " Accessory Requirement Details"}</h2>

                    <div className="flex bg-gray-200 rounded-full p-0.5  w-fit shadow-sm">
                        <button
                            onClick={() => setType("yarn")}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${type === "yarn"
                                ? "bg-blue-600 text-white shadow"
                                : "bg-transparent text-gray-700 hover:text-blue-600"
                                }`}
                        >
                            Yarn
                        </button>

                        <button
                            onClick={() => setType("accessory")}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${type === "accessory"
                                ? "bg-blue-600 text-white shadow"
                                : "bg-transparent text-gray-700 hover:text-blue-600"
                                }`}
                        >
                            Accessory
                        </button>
                    </div>
                </div>


                {type == "accessory" && (

                    <AccessoryRequirementPlannig accessoryItems={accessoryItems} setAccessoryItems={setAccessoryItems}
                        accessoryGroupList={accessoryGroupList} accessoryCategoryList={accessoryCategoryList} accessoryList={accessoryList} colorList={colorList} uomList={uomList} sizeList={sizeList} orderId={orderId}
                        requirementItems={requirementItems} orderSizeDetails={orderSizeDetails} tempOrderId={tempOrderId} setTempOrderId={setTempOrderId} tempOrderDetailsId={tempOrderDetailsId}
                        
                    />

                )}


                {type == "yarn" && (




                    <div className="overflow-x-auto mt-8 w-full">
                        <table className="min-w-[1250px] border-collapse table-fixed">
                            <thead className="bg-gray-200 text-gray-800">

                                <tr>
                                    <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">
                                        <input type="checkbox" onChange={(e) => handleSelectAllChange(e.target.checked, orderYarnDetails ? orderYarnDetails : [])}
                                            checked={getSelectAll(orderYarnDetails ? orderYarnDetails : [])}
                                        />
                                    </th>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-10">S No</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-96">Yarn </td>

                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-44">Color </td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-20">Process(Y/N) </td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-12  ">Process</td>
                                    {/* <td className="border border-gray-300 px-2 py-1 text-center text-xs w-16">loss %</td> */}
                                    <td className="border border-gray-300  py-1 text-center text-xs w-20">Required %</td>
                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-28">Waste %</td>

                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-28">Size</td>






                                    {orderSizeDetails?.map((item, index) => {
                                        return (
                                            <td
                                                key={index}
                                                className="border border-gray-300 px-2 py-1 text-center text-[11px] text-xs w-20"
                                            >
                                                {item?.size?.name}
                                            </td>
                                        )
                                    })}

                                    <td className="border border-gray-300 px-2 py-1 text-center text-xs w-32">RequiredQty (kgs)</td>


                                </tr>

                                <tr className="bg-white">
                                    <td colSpan={7} rowSpan={2} className="bg-white border-l border-gray-300 text-end justify-end px-4 font-bold" >



                                    </td>
                                    <td className="border border-gray-300 px-2 py-1 text-left text-xs  w-28">
                                        Size Weight (grams)
                                    </td>
                                    {orderSizeDetails?.map((item, index) => (
                                        <td key={index} className="border border-gray-300 px-2 py-1 text-[11px] text-right text-xs w-28">
                                            {item?.weight?.toFixed(3)}
                                        </td>
                                    ))}
                                    <td className="border border-gray-300 px-2 py-1 text-left text-[11px] "></td>

                                </tr>
                                <tr className="bg-white">

                                    <td className="border border-gray-300 px-2 py-1 text-left  text-xs  w-28">
                                        Order Qty (kgs)
                                    </td>
                                    {orderSizeDetails?.map((item, index) => (
                                        <td key={index} className="border border-gray-300 px-2 py-1 text-[11px] text-right text-xs">
                                            {item?.qty?.toFixed(3)}
                                        </td>
                                    ))}
                                    <td className="border border-gray-300 px-2 py-1 text-left text-[11px] "></td>

                                </tr>

                            </thead>
                            <tbody>

                                {orderYarnDetails?.map((yarn, index) => (
                                    <tr

                                    >
                                        <td className='py-1 text-center border border-gray-300'>
                                            <input type="checkbox" name="" id=""
                                                checked={yarn.isNotPurchase || false}
                                                onChange={(e) => handleChange(yarn.id, e.target.checked, index)} />
                                        </td>
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

                                        <td className="py-0.5 border border-gray-300 text-[11px]  flex justify-center items-center">

                                            <button
                                                onClick={() => {
                                                    setProcessView(true)
                                                    setSelectedItem(yarn)
                                                    setSelectedIndex(index)
                                                }}
                                                disabled={readOnly || yarn?.isProcess === "No"}
                                                className="text-blue-800 flex items-center  py-1.5 bg-blue-50 rounded"
                                            >
                                                👁 <span className="text-xs"></span>
                                            </button>

                                        </td>


                                        <td className=" border border-gray-300 text-right text-[11px] py-1.5 px-2 text-xs">
                                            <input
                                                className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                onFocus={e => e.target.select()}
                                                value={yarn?.percentage}




                                                disabled={readOnly}
                                                onKeyDown={(e) => {
                                                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                }}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value).toFixed(3);

                                                    handleInputChange(val, index, yarn?.yarnId, "percentage");


                                                }}
                                                onBlur={(e) => {
                                                    const formatted =
                                                        e.target.value === "" ? "" : parseFloat(e.target.value).toFixed(3);
                                                    e.target.value = formatted;
                                                    handleInputChange(formatted, index, yarn?.yarnId, "percentage");
                                                }}
                                                placeHolder="0.000"
                                            />
                                        </td>
                                        <td className="border border-gray-300 px-2 py-1 text-right text-[12px] ">
                                            <input
                                                className=" rounded px-1 ml-2 w-full py-0.5 text-xs focus:outline-none text-right"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={(yarn?.wastagePercentage ?? 10?.toFixed(3))}
                                                onFocus={e => e.target.select()}
                                                onKeyDown={(e) => {
                                                    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                                                }}

                                                onChange={(e) => {
                                                    const val = e.target.value;

                                                    handleInputChange(val, index, yarn?.yarnId, "wastagePercentage");
                                                }}
                                                placeHolder="0.00"

                                                disabled={readOnly || !yarn?.percentage}
                                                onBlur={(e) => {
                                                    const formatted =
                                                        e.target.value === "" ? "" : parseFloat(e.target.value).toFixed(3);
                                                    e.target.value = formatted;
                                                    handleInputChange(formatted, index, yarn?.yarnId, "wastagePercentage");
                                                }}




                                            />
                                        </td>
                                        <td className="border-b border-gray-300 px-2 py-1 text-left text-[12px]">

                                        </td>


                                        {(orderSizeDetails || []).map((size) => (
                                            <>
                                                <td className="border border-gray-300 px-1 py-1  text-[12px] ">
                                                    <input
                                                        type="number"

                                                        min={"0"}
                                                        onFocus={(e) => e.target.select()}
                                                        className=" rounded text-[11.5px] w-full text-right bg-transparent"
                                                        value={parseFloat(getQtyYarnSize(size?.sizeId, yarn?.yarnId, yarn?.colorId) || "").toFixed(3)}
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


                )}



            </div>
            <div>

            </div>
        </>
    )
}

export default FormItems;













