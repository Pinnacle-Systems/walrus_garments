import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { MultiSelectDropdownNew } from "../../../Inputs";
import { MultiSelect } from "react-multi-select-component";
import { multiSelectOption } from "../../../Utils/contructObject";
import { findFromList } from "../../../Utils/helper";

const ProductionEntryItems = ({
    accessoryList,
    accessoryGroupList,
    accessoryItemList,
    colorList,
    uomList,
    sizeList,
    id,

    readOnly,
    params,
    isSupplierOutside,
    taxTypeId,
    supplierId,
    setTableDataView,
    accessoryCategoryList,
    productionItems,
    setProductionItems,
    machineList,
    orderData


}) => {


    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("");

    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(productionItems);


        newBlend[index][field] = value;

        if (field === "accessoryId") {
            newBlend[index]["taxPercent"] = findYarnTax(value);
        }
        // if (field == "qty") {
        //   if (parseFloat(value) > parseFloat(allowedQty)) {
        //     Swal.fire({
        //       title: `Allowed Qty is ${allowedQty}`,
        //       icon: "warning",
        //       timer: 1500,
        //       showConfirmButton: false,
        //       didOpen: () => {
        //         Swal.showLoading();
        //       }
        //     });
        //   }
        // }

        setProductionItems(newBlend);
    };





    useEffect(() => {
        if (id) return;
        if (productionItems.length >= 1) return;
        setProductionItems((prev) => {
            let newArray = Array.from({ length: 1 - prev.length }, (i) => {
                return {
                    accessoryItemId: "",
                    accessoryGroupId: "",
                    accessoryId: "",
                    qty: "",
                    colorId: "",
                    taxPercent: "0.000",
                    sizeId: "",
                    uomId: "",

                    price: "",
                    discountType: "Percentage",
                    discountValue: 0,
                    noOfBags: 0.00,
                    weightPerBag: 0.00,

                };
            });
            return [...prev, ...newArray];
        });
    }, [setProductionItems, productionItems]);





    // const { data: accessoryGroupList } = useGetAccessoryGroupMasterQuery({
    //   params,
    // });

    // const { data: accessoryItemList } = useGetAccessoryItemMasterQuery({
    //   params,
    // });

    // const { data: accessoryList } = useGetAccessoryMasterQuery({ params });

    // const { data: colorList } = useGetColorMasterQuery({ params });

    // const { data: uomList } = useGetUomQuery({ params });

    // const { data: sizeList } = useGetSizeMasterQuery({ params });

    function findAccessoryItemName(id) {
        if (!accessoryList) return 0;
        let acc = accessoryList.data.find(
            (item) => parseInt(item.id) === parseInt(id)
        );
        return acc ? acc.accessoryItem.name : null;
    }

    const addNewRow = () => {
        const newRow = {
            yarnId: "",
            qty: "",
            tax: "0",
            colorId: "",
            uomId: "",
            price: "",
            discountTypes: "",
            discountValue: "0.00",
            noOfBags: "0.00"
        };
        setProductionItems([...productionItems, newRow]);
    };
    function findAccessoryGroupName(id) {
        if (!accessoryList) return 0;
        let acc = accessoryList.data.find(
            (item) => parseInt(item.id) === parseInt(id)
        );
        return acc ? acc.accessoryItem.AccessoryGroup.name : null;
    }

    function findYarnTax(id) {
        if (!accessoryList) return 0;
        let yarnItem = accessoryList.data.find(
            (item) => parseInt(item.id) === parseInt(id)
        );
        return yarnItem?.taxPercent ? yarnItem.taxPercent : 0;
    }

    function getTotals(field) {
        const total = productionItems.reduce((accumulator, current) => {
            return accumulator + parseFloat(current[field] ? current[field] : 0);
        }, 0);
        return parseFloat(total);
    }

    function getGross(field1, field2) {
        const total = productionItems.reduce((accumulator, current) => {
            return (
                accumulator +
                parseFloat(
                    current[field1] && current[field2]
                        ? current[field1] * current[field2]
                        : 0
                )
            );
        }, 0);
        return parseFloat(total);
    }

    const getTotalAmount = (
        qtyKey,
        priceKey,
        taxKey,
        discountTypeKey,
        discountAmountKey
    ) => {
        const total = productionItems.reduce((acc, item) => {
            const qty = parseFloat(item[qtyKey]) || 0;
            const price = parseFloat(item[priceKey]) || 0;
            const tax = parseFloat(item[taxKey]) || 0;
            const discountType = item[discountTypeKey] || "";
            const discountAmount = parseFloat(item[discountAmountKey]) || 0;

            const amount = calculateRowTotal(
                qty,
                price,
                tax,
                discountType,
                discountAmount
            );

            return acc + (Number.isFinite(amount) ? amount : 0);
        }, 0);

        return Number.isFinite(total) ? total : 0;
    };

    const calculateRowTotal = (
        qty,
        price,
        taxPercent,
        discountType,
        discountValue
    ) => {
        // Core calculations
        const gross = qty * price;
        const tax = gross * (taxPercent / 100);
        let discount = 0;

        switch (discountType) {
            case "Flat":
                discount = Math.min(discountValue, gross + tax);
                break;
            case "Percentage":
                discount = (gross + tax) * (discountValue / 100);
                break;
        }

        return gross + tax - discount;
    };

    const findAmount = (row) => {
        const qty = row.qty;
        const price = row.price;
        const tax = row.tax;
        const discountType = row.discountType;
        const disAmount = row.discountAmount;

        let grossAmount = parseFloat(qty || 0) * parseFloat(price || 0) || 0;
        let taxAmount = 0;
        let discountValue = 0;

        if (tax) {
            taxAmount = grossAmount * (parseFloat(tax) / 100);
        }

        if (discountType === "Flat") {
            discountValue = parseFloat(disAmount) || 0;
        } else if (discountType === "Percentage") {
            discountValue =
                (grossAmount + taxAmount) * (parseFloat(disAmount) / 100) || 0;
        }

        const finalAmount = (grossAmount + taxAmount - discountValue).toFixed(2);
        return finalAmount;
    };
    const dispatch = useDispatch();


    // if (!accessoryList || !colorList || !uomList || !sizeList) return <Loader />;
    console.log(accessoryGroupList?.data || [], "accessoryGroupList");

    const deleteRow = (id) => {
        setProductionItems((yarnBlend) =>
            yarnBlend.filter((row, index) => index !== parseInt(id))
        );
    };
    return (
        <>

            <div className={` relative w-full overflow-y-auto p-3  overflow-auto h-[400px]`}>
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-slate-700">List Of Items</h2>



                </div>
                <table className="w-full border-collapse table-fixed ">
                    <thead className="bg-gray-200 text-gray-800">
                        <tr>
                            <th
                                className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                S.No
                            </th>
                            <th

                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Machine No
                            </th>
                            <th

                                className={`w-44 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Order No
                            </th>
                            <th

                                className={`w-80 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Style No
                            </th>

                            <th

                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Color
                            </th>
                            <th

                                className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Size
                            </th>
                            <th

                                className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Balance
                            </th>
                            <th

                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Production
                            </th>
                            <th

                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Balance
                            </th>
                            <th

                                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Production
                            </th>


                        </tr>
                    </thead>
                    <tbody>

                        {productionItems?.map((row, index) => (
                            <tr key={index} className="border border-blue-gray-200 cursor-pointer">
                                <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                                    {index + 1}
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    {/* <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryGroupId") } }}
                                        className='text-left w-full rounded py-1 table-data-input' value={row.accessoryGroupId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "accessoryGroupId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "accessoryGroupId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? (machineList?.data || []) : machineList?.data.filter(item => item.active) || []).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select> */}
                                    <MultiSelect
                                        className={`text-left w-full rounded `}
                                        options={multiSelectOption((machineList?.data || []), 'name', 'id')}
                                        value={(row?.classIds || [])?.map((val) => ({ value: val?.classId, label: findFromList(val.classId, (machineList?.data || []), "name") }))}
                                        // onChange={(value) => { handleInputChangeOrderDetails(value.map(i => ({ classId: i.value })), index, valueIndex, "classIds") }}
                                        labelledBy="Select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: "42px",   
                                                height: "42px",
                                            }),
                                            valueContainer: (base) => ({
                                                ...base,
                                                maxHeight: "42px",
                                                overflowY: "auto",
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                maxHeight: "100px",  
                                            }),
                                            menuList: (base) => ({
                                                ...base,
                                                maxHeight: "100px",
                                            }),
                                        }}
                                    />
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryCategoryId") } }}
                                        className='text-left w-full rounded py-1 table-data-input' value={row.accessoryCategoryId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "accessoryCategoryId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "accessoryCategoryId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(orderData?.data?.filter(item => item.active) || []).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.docId}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryId") } }}
                                        className='text-left w-full rounded py-1 table-data-input' value={row.accessoryId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "accessoryId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "accessoryId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? (accessoryList?.data || []) : accessoryList?.data?.filter(item => item.active && item?.accessoryCategoryId == row?.accessoryCategoryId && item?.accessoryGroupId == row?.accessoryGroupId) || [])?.map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.aliasName}
                                            </option>
                                        )}
                                    </select>
                                </td>

                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                        disabled={true} className='text-left w-full rounded py-1 table-data-input' value={row.colorId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "colorId")

                                        }
                                        }
                                    >
                                        <option hidden>   </option>
                                        {(id ? colorList?.data : colorList?.data?.filter(item => item.active))?.map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "sizeId") } }}
                                        disabled={true} className='text-left w-20 rounded py-1 table-data-input' value={row.sizeId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "sizeId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "sizeId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? sizeList?.data : sizeList?.data?.filter(item => item.active))?.map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                        disabled={true} className='text-left w-20 rounded py-1 table-data-input' value={row.uomId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "uomId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? uomList?.data : uomList?.data.filter(item => item.active))?.map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <input
                                        onKeyDown={e => {
                                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                            if (e.key === "Delete") { handleInputChange("0.000", index, "requiredQty") }
                                        }}
                                        min={"0"}
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 px-1 w-full table-data-input"
                                        value={(!row.requiredQty) ? 0 : row.requiredQty}
                                        disabled={true}
                                        onChange={(e) =>
                                            handleInputChange(parseFloat(e.target.value), index, "requiredQty")
                                        }
                                        onBlur={(e) => {
                                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "requiredQty");

                                        }
                                        }

                                    />

                                </td>
                                <td className='py-0.5 border border-gray-300 text-[11px]'>
                                    <input
                                        onKeyDown={e => {
                                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                            if (e.key === "Delete") { handleInputChange("0.000", index, "alreadyPurchasedQty") }
                                        }}
                                        min={"0"}
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 px-1 w-full table-data-input"
                                        value={(!row.alreadyPurchasedQty) ? 0 : row.alreadyPurchasedQty}
                                        disabled={true}
                                        onChange={(e) =>
                                            handleInputChange(parseFloat(e.target.value), index, "alreadyPurchasedQty")
                                        }
                                        onBlur={(e) => {
                                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "alreadyPurchasedQty");

                                        }
                                        }

                                    />

                                </td>









                                <td className="w-40 py-0.5 border border-gray-300 text-[11px] text-right">
                                    <input
                                        readOnly
                                        className="w-full bg-transparent focus:outline-none focus:border-transparent text-right pr-2"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addNewRow();
                                            }
                                        }}
                                        onContextMenu={(e) => {
                                            if (!readOnly) {
                                                // handleRightClick(e, index, "shiftTimeHrs");
                                            }
                                        }}
                                    />
                                </td>



                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ProductionEntryItems;
