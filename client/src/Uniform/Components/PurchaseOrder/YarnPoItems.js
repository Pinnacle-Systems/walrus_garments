import React, { useEffect, useState } from "react";
import { DELETE, PLUS } from "../../../icons";
import { useGetYarnMasterQuery } from "../../../redux/uniformService/YarnMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import { toast } from "react-toastify";
import { VIEW } from "../../../icons";
import TaxDetailsFullTemplate from "../TaxDetailsCompleteTemplate";
import Modal from "../../../UiComponents/Modal";
import { priceWithTax } from "../../../Utils/helper";
import { discountTypes } from "../../../Utils/DropdownData";

const YarnPoItems = ({
  id,
  transType,
  poItems,
  setPoItems,
  readOnly,
  params,
  isSupplierOutside,
  taxTypeId,
  greyFilter,
}) => {
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState("");

  const handleInputChange = (value, index, field) => {
    const newBlend = structuredClone(poItems);
    newBlend[index][field] = value;
    if (field === "yarnId") {
      newBlend[index]["taxPercent"] = findYarnTax(value);
    }
    if (field !== "qty") {
      newBlend[index]["qty"] = (
        parseFloat(newBlend[index]["noOfBags"]) *
        parseFloat(newBlend[index]["weightPerBag"])
      ).toFixed(3);
    }
    setPoItems(newBlend);
  };
  console.log(poItems, "poItems");
  useEffect(() => {
    if(id) return
    if (poItems.length >= 9) return;
    setPoItems((prev) => {
      let newArray = Array.from({ length: 9 - prev.length }, (i) => {
        return {
          yarnId: "",
          qty: "0.000",
          tax: "0",
          colorId: "",
          uomId: "",
          price: "0.00",
          discountValue: "0.00",
          noOfBags: "0",
          discountType: "",
          weightPerBag: "0.000",
        };
      });
      return [...prev, ...newArray];
    });
  }, [transType, setPoItems, poItems]);

  const addRow = () => {
    const newRow = {
      yarnId: "",
      qty: "",
      tax: "0",
      colorId: "",
      uomId: "",
      price: "",
      discountTypes: "",
      discountValue: "0.00",
    };
    setPoItems([...poItems, newRow]);
  };
  const handleDeleteRow = (id) => {
    setPoItems((yarnBlend) =>
      yarnBlend.filter((row, index) => index !== parseInt(id))
    );
  };

  const { data: yarnList } = useGetYarnMasterQuery({ params });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
  const {
    data: colorList,
    isLoading: isColorLoading,
    isFetching: isColorFetching,
  } = useGetColorMasterQuery({
    params: { ...params, isGrey: greyFilter ? true : undefined },
  });
  function findYarnTax(id) {
    if (!yarnList) return 0;
    let yarnItem = yarnList.data.find(
      (item) => parseInt(item.id) === parseInt(id)
    );
    return yarnItem ? yarnItem.taxPercent : 0;
  }

  function getTotals(field) {
    const total = poItems.reduce((accumulator, current) => {
      return accumulator + parseFloat(current[field] ? current[field] : 0);
    }, 0);
    return parseFloat(total);
  }

  const TotalAmount = (price, tax, qty) => {
    const p = parseFloat(price) || 0;
    const t = parseFloat(tax) || 0;
    const q = parseFloat(qty) || 0;

    const priceWithTax = p + (p * t) / 100;
    return priceWithTax * q;
  };

  const getDiscountAmount = (row) => {
    if (!row) return 0;
    const price = parseFloat(row.price) || 0;
    const tax = parseFloat(row.tax) || 0;
    const qty = parseFloat(row.qty) || 0;
    const discountValue = parseFloat(row.discountValue) || 0;
    const discountType = (row.discountType || "").toLowerCase();
    const total = TotalAmount(price, tax, qty);

    if (discountType === "flat") {
      return total - discountValue;
    } else if (discountType === "percentage") {
      const discount = (total * discountValue) / 100;
      return total - discount;
    } else {
      return total;
    }
  };
  const getFinalAmountAfterDiscount = () => {
    return poItems.reduce((acc, row) => {
      const price = parseFloat(row.price) || 0;
      const tax = parseFloat(row.tax) || 0;
      const qty = parseFloat(row.qty) || 0;
      const discountValue = parseFloat(row.discountValue) || 0;
      const discountType = (row.discountType || "").toLowerCase();

      const total = TotalAmount(price, tax, qty);

      let finalAmount = total;

      if (discountType === "flat") {
        finalAmount = total - discountValue;
      } else if (discountType === "percentage") {
        const discount = (total * discountValue) / 100;
        finalAmount = total - discount;
      }

      return acc + finalAmount;
    }, 0);
  };

  return (
    <>
      <Modal
        isOpen={Number.isInteger(currentSelectedIndex)}
        onClose={() => setCurrentSelectedIndex("")}
      >
        <TaxDetailsFullTemplate
          readOnly={readOnly}
          setCurrentSelectedIndex={setCurrentSelectedIndex}
          taxTypeId={taxTypeId}
          currentIndex={currentSelectedIndex}
          poItems={poItems}
          handleInputChange={handleInputChange}
          isSupplierOutside={isSupplierOutside}
        />
      </Modal>
      <div className={` relative w-full overflow-y-auto py-1`}>
        <table className=" border border-gray-500 text-xs table-auto  w-full">
          <thead className="bg-gray-200 top-0 border-b text-gray-800 border-gray-500">
            <tr>
              <th className="table-data  w-2 text-center">S.no</th>

              <th className="table-data ">
                Items<span className="text-red-500">*</span>
              </th>
              <th className="table-data ">
                Color<span className="text-red-500">*</span>
              </th>

              <th className="table-data  w-20">
                UOM<span className="text-red-500">*</span>
              </th>
              <th className="table-data  w-16">
                No. of Bags<span className="text-red-500">*</span>
              </th>
              <th className="table-data  w-16">
                Weight Per Bag<span className="text-red-500">*</span>
              </th>
              <th className="table-data  w-16">
                Quantity<span className="text-red-500">*</span>
              </th>
              <th className="table-data  w-16">
                Price<span className="text-red-500">*</span>
              </th>
              <th className="table-data  w-16">
                tax<span className="text-red-500"></span>
              </th>
              <th className="table-data  w-16 hidden">
                Price with Tax <span className="text-red-500">*</span>
              </th>
              <th className="table-data  w-16">
                Total Amount <span className="text-red-500">*</span>
              </th>
              <th className="table-data  w-16">
                Discount Type<span className="text-red-500"></span>
              </th>
              <th className="table-data  w-16">Discount Value</th>
              <th className="table-data  w-16">Discount Amount</th>

              {readOnly ? (
                ""
              ) : (
                <th className="w-20  bg-gary-100 text-white table-data ">
                  <div
                    onClick={addRow}
                    className="hover:cursor-pointer text-green-800 w-full h-full flex items-center justify-center"
                  >
                    {PLUS}
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="overflow-y-auto h-full w-full">
            {poItems.map((row, index) => (
              <tr key={index} className="w-full table-row">
                <td className="table-data w-2 text-left px-1 py-1">
                  {index + 1}
                </td>

                <td className="table-data ">
                  <select
                    onKeyDown={(e) => {
                      if (e.key === "Delete") {
                        handleInputChange("", index, "yarnId");
                      }
                    }}
                    tabIndex={"0"}
                    disabled={
                      readOnly ||
                      Boolean(row?.alreadyInwardedData?._sum?.qty) ||
                      Boolean(row?.alreadyCancelData?._sum?.qty)
                    }
                    className="text-left w-full rounded py-1 table-data-input"
                    value={row.yarnId}
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "yarnId")
                    }
                    onBlur={(e) =>
                      handleInputChange(e.target.value, index, "yarnId")
                    }
                  >
                    <option hidden />
                    {(id
                      ? yarnList?.data
                      : yarnList?.data?.filter((item) => item.active) || []
                    ).map((blend) => (
                      <option value={blend.id} key={blend.id}>
                        {blend.aliasName}
                      </option>
                    ))}
                  </select>
                </td>
                {transType.toLowerCase().includes("dyedyarn") ? (
                  <td className="table-data">
                    <select
                      className="w-full rounded py-1 table-data-input text-left"
                      value={row.colorId}
                      disabled={
                        readOnly ||
                        Boolean(row?.alreadyInwardedData?._sum?.qty) ||
                        Boolean(row?.alreadyCancelData?._sum?.qty)
                      }
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "colorId")
                      }
                      onBlur={(e) =>
                        handleInputChange(e.target.value, index, "colorId")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "colorId");
                        }
                      }}
                    >
                      <option hidden value=""></option>
                      {(id
                        ? colorList?.data
                        : colorList?.data?.filter((item) => item.active)
                      )?.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </td>
                ) : (
                  (() => {
                    const grayColor = colorList?.data?.find(
                      (color) => color.name?.toLowerCase() === "gray"
                    );
                    // If Gray exists, update colorId if needed
                    if (grayColor && row.colorId !== grayColor.id) {
                      setTimeout(() => {
                        handleInputChange(grayColor.id, index, "colorId");
                      }, 0);
                    }
                    return (
                      <td className="table-data text-right px-1">
                        {grayColor?.name ?? "-"}
                      </td>
                    );
                  })()
                )}

                <td className="table-data">
                  <select
                    onKeyDown={(e) => {
                      if (e.key === "Delete") {
                        handleInputChange("", index, "uomId");
                      }
                    }}
                    disabled={
                      readOnly ||
                      Boolean(row?.alreadyInwardedData?._sum?.qty) ||
                      Boolean(row?.alreadyCancelData?._sum?.qty)
                    }
                    className="text-left w-20 rounded py-1 table-data-input"
                    value={row.uomId}
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "uomId")
                    }
                    onBlur={(e) =>
                      handleInputChange(e.target.value, index, "uomId")
                    }
                  >
                    <option hidden></option>
                    {uomList?.data &&
                      (id
                        ? uomList.data
                        : uomList.data.filter((item) => item.active)
                      ).map((blend) => (
                        <option value={blend.id} key={blend.id}>
                          {blend.name}
                        </option>
                      ))}
                  </select>
                </td>

                <td className="table-data">
                  <input
                    onKeyDown={(e) => {
                      if (e.code === "Minus" || e.code === "NumpadSubtract")
                        e.preventDefault();
                      if (e.key === "Delete") {
                        handleInputChange("0", index, "noOfBags");
                      }
                    }}
                    min={"0"}
                    type="number"
                    onFocus={(e) => e.target.select()}
                    className="text-right rounded py-1 w-16 px-1 table-data-input"
                    value={!row.noOfBags ? 0 : row.noOfBags}
                    disabled={
                      readOnly ||
                      Boolean(row?.alreadyInwardedData?._sum?.qty) ||
                      Boolean(row?.alreadyCancelData?._sum?.qty)
                    }
                    inputMode="decimal"
                    onChange={(e) => {
                      handleInputChange(e.target.value, index, "noOfBags");
                    }}
                    onBlur={(e) => {
                      handleInputChange(
                        parseFloat(e.target.value),
                        index,
                        "noOfBags"
                      );
                    }}
                  />
                </td>
                <td className="table-data">
                  <input
                    onKeyDown={(e) => {
                      if (e.code === "Minus" || e.code === "NumpadSubtract")
                        e.preventDefault();
                      if (e.key === "Delete") {
                        handleInputChange("0", index, "weightPerBag");
                      }
                    }}
                    min={"0"}
                    type="number"
                    onFocus={(e) => e.target.select()}
                    className="text-right rounded py-1 w-16 px-1 table-data-input"
                    value={!row.weightPerBag ? 0 : row.weightPerBag}
                    disabled={
                      readOnly ||
                      Boolean(row?.alreadyInwardedData?._sum?.qty) ||
                      Boolean(row?.alreadyCancelData?._sum?.qty)
                    }
                    inputMode="decimal"
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "weightPerBag")
                    }
                    onBlur={(e) => {
                      handleInputChange(
                        parseFloat(e.target.value).toFixed(3),
                        index,
                        "weightPerBag"
                      );
                    }}
                  />
                </td>
                <td className="table-data">
                  <input
                    onKeyDown={(e) => {
                      if (e.code === "Minus" || e.code === "NumpadSubtract")
                        e.preventDefault();
                      if (e.key === "Delete") {
                        handleInputChange("0.000", index, "qty");
                      }
                    }}
                    min="0"
                    type="number"
                    className="text-right rounded py-1 px-1 w-16 table-data-input"
                    onFocus={(e) => e.target.select()}
                    value={!row.qty ? 0 : row.qty}
                    readOnly={readOnly} // Use readOnly instead of disabled
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "qty")
                    }
                    onBlur={(e) => {
                      handleInputChange(
                        parseFloat(e.target.value).toFixed(3),
                        index,
                        "qty"
                      );
                    }}
                  />
                </td>

                <td className="table-data">
                  <input
                    onKeyDown={(e) => {
                      if (e.code === "Minus" || e.code === "NumpadSubtract")
                        e.preventDefault();
                      if (e.key === "Delete") {
                        handleInputChange("0.00", index, "price");
                      }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded py-1 w-16 px-1 table-data-input"
                    onFocus={(e) => e.target.select()}
                    value={!row.price ? 0 : row.price}
                    disabled={
                      readOnly ||
                      Boolean(row?.alreadyInwardedData?._sum?.qty) ||
                      Boolean(row?.alreadyCancelData?._sum?.qty) ||
                      Boolean(row?.alreadyCancelData?._sum?.qty)
                    }
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "price")
                    }
                    onBlur={(e) => {
                      handleInputChange(
                        parseFloat(e.target.value).toFixed(2),
                        index,
                        "price"
                      );
                    }}
                  />
                </td>
                <td className="table-data">
                  <input
                    onKeyDown={(e) => {
                      if (e.code === "Minus" || e.code === "NumpadSubtract")
                        e.preventDefault();
                      if (e.key === "Delete") {
                        handleInputChange("0.00", index, "price");
                      }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded py-1 w-16 px-1 table-data-input"
                    onFocus={(e) => e.target.select()}
                    value={!row.tax ? 0 : row.tax}
                    disabled={
                      readOnly ||
                      Boolean(row?.alreadyInwardedData?._sum?.qty) ||
                      Boolean(row?.alreadyCancelData?._sum?.qty) ||
                      Boolean(row?.alreadyCancelData?._sum?.qty)
                    }
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "tax")
                    }
                    onBlur={(e) => {
                      handleInputChange(
                        parseFloat(e.target.value).toFixed(2),
                        index,
                        "tax"
                      );
                    }}
                  />
                </td>
                <td className="table-data text-right px-1 hidden">
                  {priceWithTax(row.price, row.tax).toFixed(2)}
                </td>
                <td className="table-data text-right px-1">
                  {TotalAmount(row.price, row.tax, row.qty).toFixed(2)}
                </td>
                <td className="table-data text-right px-1">
                  <select
                    className="border rounded px-1 py-0.5 text-xs"
                    value={poItems[index]?.discountType || ""}
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "discountType")
                    }
                  >
                    <option value="">Select</option>
                    {discountTypes.map((item, i) => (
                      <option key={i} value={item.value}>
                        {item.value}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="table-data">
                  <input
                    onKeyDown={(e) => {
                      if (e.code === "Minus" || e.code === "NumpadSubtract")
                        e.preventDefault();
                      if (e.key === "Delete") {
                        handleInputChange("0.00", index, "discountValue");
                      }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded py-1 w-16 px-1 table-data-input"
                    onFocus={(e) => e.target.select()}
                    value={!row.discountValue ? 0 : row.discountValue}
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "discountValue")
                    }
                    onBlur={(e) => {
                      handleInputChange(
                        parseFloat(e.target.value).toFixed(2),
                        index,
                        "discountValue"
                      );
                    }}
                  />
                </td>
                <td className="table-data text-right px-1">
                  {getDiscountAmount(row).toFixed(2)}
                </td>

                {readOnly ? (
                  ""
                ) : (
                  <td className="table-data w-20">
                    {row?.alreadyInwardedData?._sum?.qty ? (
                      ""
                    ) : (
                      <div
                        tabIndex={-1}
                        onClick={() => handleDeleteRow(index)}
                        className="flex justify-center px-2 py-1.5 items-center cursor-pointer"
                      >
                        {DELETE}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
            <tr className="bg-gray-200 w-full border border-gray-400 h-7 font-bold">
              <td className="table-data text-center w-10 font-bold" colSpan={4}>
                Total
              </td>
              <td className="table-data text-right px-1 w-10">
                {getTotals("noOfBags")}
              </td>
              <td className="table-data  w-10"></td>
              <td className="table-data text-right px-1 w-10">
                {getTotals("qty").toFixed(3)}
              </td>
              <td className="table-data  w-10"></td>
              <td className="table-data  w-10"></td>
              <td className="table-data  w-10"></td>
              <td className="table-data  w-10"></td>
              <td className="table-data  w-10"></td>
              <td className="table-data text-right px-1  w-10">
                {getFinalAmountAfterDiscount().toFixed(2)}
              </td>
              <td className="table-data   w-10"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default YarnPoItems;
