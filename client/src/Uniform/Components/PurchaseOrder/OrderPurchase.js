import { useEffect } from "react";
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { params } from "../../../Utils/helper";

const OrderPurchase = ({ orderYarnDetails, orderSizeDetails, poItems, setPoItems, readOnly, id }) => {

    console.log(orderYarnDetails, "orderYarnDetails");
    console.log(orderSizeDetails, "orderSizeDetails");
    const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });


    const getRequireWeight = (yarnId) => {
        if (id) {
            return poItems?.reduce((total, item) => {
                if (item.yarnId !== yarnId) return total;

                // find qty for this size
                const sizeQty = orderSizeDetails?.find(s => s.sizeId === item.sizeId)?.qty || 0;

                console.log(item, "item");
                return (total + (parseFloat(item.requiredQty || 0) * parseFloat(item.qty || 0)) / 1000);

            }, 0);
        }
        else {
            return poItems?.reduce((total, item) => {
                if (item.yarnId !== yarnId) return total;

                const sizeQty = orderSizeDetails?.find(s => s.sizeId === item.sizeId)?.qty || 0;

                console.log(item, "item");
                return (total + (parseFloat(item.requiredQty || 0) * parseFloat(sizeQty || 0)) / 1000);

            }, 0);
        }

    };

    // useEffect(() => {
    //     if (!orderSizeDetails?.length || !orderYarnDetails?.length) return;

    //     const combined = [];

    //     if(id){
    //         return
    //     }
    //     else{
    //         orderSizeDetails?.forEach(size => {
    //             orderYarnDetails?.forEach(yarn => {
    //                 combined?.push({
    //                     sizeId: size.sizeId,
    //                     yarnId: yarn.yarnId,
    //                     Yarn: {
    //                         name: yarn?.Yarn?.name,
    //                     },
    //                     percentage: yarn?.percentage,
    //                     colorId: yarn.colorId,
    //                     requiredQty: Number(((parseFloat(size.weight) * yarn?.percentage) / 100)),
    //                     weight: size.weight,
    //                     uomId: size.uomId,
    
    //                 });
    //             });
    //         });
    //         setPoItems(combined);
    //     }


   
    // }, [orderSizeDetails, orderYarnDetails]);

//     useEffect(() => {
//   if (!orderSizeDetails?.length || !orderYarnDetails?.length) return;
//   if (id) return; 

//   const groupedMap = {};

//   orderSizeDetails.forEach(size => {
//     orderYarnDetails.forEach(yarn => {
//       const key = `${yarn.yarnId}-${yarn.colorId}`;

//       const qty = Number(((parseFloat(size.weight || 0) * (yarn.percentage || 0)) / 100).toFixed(3));

//       if (!groupedMap[key]) {
//         groupedMap[key] = {
//           yarnId: yarn.yarnId,
//           Yarn: { name: yarn?.Yarn?.name },
//           percentage: yarn.percentage,
//           colorId: yarn.colorId,
//           qty: 0,
//           uomId: size.uomId,
//         };
//       }

//       // accumulate qty across sizes
//       groupedMap[key].qty += qty;
//     });
//   });

//   setPoItems(Object.values(groupedMap));
// }, [orderSizeDetails, orderYarnDetails, id]);
useEffect(() => {
    if (!orderSizeDetails?.length || !orderYarnDetails?.length) return;

    if (id) return;

    const combined = [];

    orderSizeDetails.forEach(size => {
        orderYarnDetails.forEach(yarn => {
            const key = `${size.sizeId}-${yarn.yarnId}-${yarn.colorId}`;
            
            // Check if this combination already exists
            if (!combined.some(item =>
                item.sizeId === size.sizeId &&
                item.yarnId === yarn.yarnId &&
                item.colorId === yarn.colorId
            )) {
                combined.push({
                    sizeId: size.sizeId,
                    yarnId: yarn.yarnId,
                    Yarn: { name: yarn?.Yarn?.name },
                    percentage: yarn?.percentage,
                    colorId: yarn.colorId,
                    requiredQty: Number(((parseFloat(size.weight) * yarn?.percentage) / 100)),
                    weight: size.weight,
                    uomId: size.uomId,
                });
            }
        });
    });

    setPoItems(combined);

}, [orderSizeDetails, orderYarnDetails, id]);


    console.log(poItems, "poItems");
    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(poItems);
        newBlend[index][field] = value;

        setPoItems(newBlend);
    };
    const addNewRow = () => {
        const newRow = {
            yarnId: "",
            qty: "",
            tax: "0",
            colorId: "",
            uomId: "",
            price: "",
            discountValue: "0.00",
            noOfBags: 0,
            weightPerBag: 0,
        };
        setPoItems([...poItems, newRow]);
    };
    const deleteRow = (id) => {
        setPoItems((yarnBlend) =>
            yarnBlend?.filter((row, index) => index !== parseInt(id))
        );
    };
    return (
        <>
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-slate-700">List Of Items</h2>
                    <div className="flex gap-2 items-center">

                        <button
                            onClick={() => {
                                addNewRow()
                            }}
                            className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                        >
                            <HiPlus className="w-3 h-3 mr-1" />
                            Add Item
                        </button>
                    </div>

                </div>
                <div className={` relative w-full overflow-y-auto py-1`}>
                    <table className="w-full border-collapse table-fixed">
                        <thead className="bg-gray-200 text-gray-900">
                            <tr>
                                <th
                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    S.No
                                </th>
                                <th

                                    className={`w-40 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Yarn Name
                                </th>

                                <th

                                    className={`w-40 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Yarn Percentage
                                </th>

                                <th

                                    className={`w-40 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Required Qty
                                </th>
                                <th

                                    className={`w-40 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Uom
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                      Qty
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Price
                                </th>

                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Gross
                                </th>

                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>

                            {poItems?.map((row, index) => (
                                <tr>
                                    <td className="border border-gray-300 px-2 py-1 text-left text-xs">{index + 1}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-left text-xs">{row?.Yarn?.name}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-right text-xs">{row?.percentage}</td>


                                    <td className="border border-gray-300 px-2 py-1 text-right text-xs">
                                        {id ? row?.requiredQty : getRequireWeight(row?.yarnId).toFixed(3)}
                                    </td>
                                    <td className="w-40 border border-gray-300 text-[11px] py-0.5">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                            disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.uomId} onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                                            onBlur={(e) => {
                                                handleInputChange((e.target.value), index, "uomId")
                                            }
                                            }
                                        >

                                            <option hidden>
                                            </option>
                                            {(id ? uomList?.data : uomList?.data?.filter(item => item.active))?.map((blend) =>
                                                <option value={blend.id} key={blend.id}>
                                                    {blend.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1 text-right text-xs">
                                        <input
                                            // onKeyDown={e => {
                                            //     if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                            //     if (e.key === "Delete") { handleInputChange("0.000", index, "qty") }
                                            // }}
                                            min={"0"}
                                            type="number"
                                            className="text-right rounded py-1 px-1 w-full table-data-input"
                                            onFocus={(e) => e.target.select()}
                                            // value={sumArray(row?.lotDetails ? row?.lotDetails : [], "qty")}
                                            value={row?.qty || 0.00}
                                            // disabled={true}
                                            onChange={(e) =>
                                                handleInputChange(e.target.value, index, "qty")
                                            }
                                            onBlur={(e) => {
                                                handleInputChange(parseFloat(e.target.value), index, "qty");
                                            }
                                            }
                                        />
                                    </td>

                                    <td className="border border-gray-300 px-2 py-1 text-right text-xs">
                                        <input
                                            // onKeyDown={e => {
                                            //     if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                            //     if (e.key === "Delete") { handleInputChange("0.000", index, "qty") }
                                            // }}
                                            min={"0"}
                                            type="number"
                                            className="text-right rounded py-1 px-1 w-full table-data-input"
                                            onFocus={(e) => e.target.select()}
                                            // value={sumArray(row?.lotDetails ? row?.lotDetails : [], "qty")}
                                            value={row?.price || 0}
                                            // disabled={true}
                                            onChange={(e) =>
                                                handleInputChange(e.target.value, index, "price")
                                            }
                                            onBlur={(e) => {
                                                handleInputChange(parseFloat(e.target.value).toFixed(2), index, "price");
                                            }
                                            }
                                        />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1 text-right text-xs">     <input
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 w-16 px-1 table-data-input"
                                        value={(!row.qty || !row.price) ? 0 : (parseFloat(row.qty) * parseFloat(row.price)).toFixed(2)}
                                        disabled={true}
                                    /></td>
                                    <td className="w-40 py-0.5 border border-gray-300 text-[11px] text-right">
                                        <div className="flex space-x-2  justify-center">

                                            <button
                                                // onClick={() => handleView(index)}
                                                // onMouseEnter={() => setTooltipVisible(true)}
                                                // onMouseLeave={() => setTooltipVisible(false)}
                                                className="text-blue-800 flex items-center  bg-blue-50 rounded"
                                            >
                                                👁 <span className="text-xs"></span>
                                            </button>
                                            <span className="tooltip-text">View</span>
                                            <button
                                                // onClick={() => handleEdit(index)}
                                                className="text-green-600 hover:text-green-800 bg-green-50 py-1 rounded text-xs flex items-center"
                                            >
                                                <HiPencil className="w-4 h-4" />

                                            </button>
                                            <span className="tooltip-text">Edit</span>
                                            <button
                                                onClick={() => deleteRow(index)}
                                                className="text-red-600 hover:text-red-800 bg-red-50  py-1 rounded text-xs flex items-center"
                                            >
                                                <HiTrash className="w-4 h-4" />

                                            </button>
                                            <span className="tooltip-text">Delete</span>


                                        </div>
                                    </td>






                                </tr>
                            ))}

                        </tbody>
                    </table>

                </div>
            </div>
        </>
    )
}

export default OrderPurchase