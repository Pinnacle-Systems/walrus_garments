import React, { useEffect } from 'react';
import { useGetProductQuery } from '../../../redux/services/ProductMasterService';
import { useGetProductCategoryQuery } from '../../../redux/services/ProductCategoryServices';
import { useGetProductBrandQuery } from '../../../redux/services/ProductBrandService';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import { findFromList } from '../../../Utils/helper';
import { DELETE } from '../../../icons';
import { PLUS } from '../../../icons';
import Select from "react-dropdown-select";
import { DropdownWithSearch } from '../../../Inputs';

const PoBillItems = ({ id, readOnly, setPoBillItems, poBillItems }) => {
    const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
    const { data: productBrandList } =
        useGetProductBrandQuery({ params });

    const { data: productCategoryList } =
        useGetProductCategoryQuery({ params });

    const { data: productList } = useGetProductQuery({ params });

    function handleInputChange(value, index, field) {
        const newBlend = structuredClone(poBillItems);
        newBlend[index][field] = value;
        if (field === "uomId") {
            const productId = newBlend[index]["productId"];
            let price = getProductUomPriceDetails(productId).find(i => parseInt(i.uomId) === parseInt(value))
            newBlend[index]["price"] = price?.price ? price?.price : 0
        }
        setPoBillItems(newBlend);
    };

    function deleteRow(index) {
        setPoBillItems(prev => prev.filter((_, i) => i !== index))
    }
    function addNewRow() {
        setPoBillItems(prev => [
            ...prev,
            { productCategoryId: "", productBrandId: "", productId: "", stockQty: "0", qty: "0", price: "0.00", amount: "0.000", salePrice: '0.00' }
        ]);
    }
    useEffect(() => {
        if (poBillItems.length >= 10) return
        setPoBillItems(prev => {
            let newArray = Array.from({ length: 10 - prev.length }, i => {
                return { productCategoryId: "", productBrandId: "", productId: "", qty: "0", price: "0.00", salePrice: "0.00", amount: "0.000" }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setPoBillItems, poBillItems])

    function getTotal(field1, field2) {
        const total = poBillItems?.reduce((accumulator, current) => {

            return accumulator + parseFloat(current[field1] && current[field2] ? current[field1] * current[field2] : 0)
        }, 0)
        return parseFloat(total)
    }
    function getProductUomPriceDetails(productId) {
        const items = findFromList(productId, productList?.data ? productList?.data : [], "ProductUomPriceDetails")
        return items ? items : []
    }

    if (!productBrandList || !productCategoryList || !productList) return <Loader />

    return (
        <>

            <div className={` relative w-full overflow-y-auto py-1`}>
                <table className=" border border-gray-500 text-xs table-auto  w-full">
                    <thead className='bg-blue-200 top-0 border-b border-gray-500'>
                        <tr className=''>
                            <th className="tx-table-cell  w-2 text-center p-0.5">S.no</th>
                            <th className="tx-table-cell ">Product Brand<span className="text-red-500 p-0.5">*</span></th>
                            <th className="tx-table-cell ">Product Category<span className="text-red-500 p-0.5">*</span></th>
                            <th className="tx-table-cell ">Product Name<span className="text-red-500 p-5">*</span></th>
                            <th className="tx-table-cell ">Uom<span className="text-red-500 p-5">*</span></th>
                            <th className="tx-table-cell  w-20">Qty<span className="text-red-500 p-0.5">*</span></th>
                            <th className="tx-table-cell  w-16">Price<span className="text-red-500 p-0.5">*</span></th>
                            <th className="tx-table-cell  w-16">Sale Price<span className="text-red-500 p-0.5">*</span></th>
                            <th className="tx-table-cell  w-16 p-0.5">Amount</th>
                            {!readOnly &&
                                <th className="tx-table-cell  w-10 p-0.5">  <button onClick={addNewRow}>{PLUS}</button></th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto h-full w-full'>


                        {(poBillItems ? poBillItems : []).map((item, index) =>

                            <tr key={index} className="w-full tx-table-row">
                                <td className="tx-table-cell w-2 text-left px-1 py-1">
                                    {index + 1}
                                </td>
                                <td className='tx-table-cell '>
                                    <DropdownWithSearch value={item?.productBrandId}
                                        className="bg-blue-500"
                                        readOnly={readOnly}
                                        setValue={(value) => handleInputChange(value, index, "productBrandId")}
                                        options={productBrandList?.data ? (
                                            (id ? productBrandList?.data : productBrandList?.data.filter(i => i?.active))
                                        ) : []} />
                                </td>
                                <td className='tx-table-cell'>
                                    <DropdownWithSearch value={item?.productCategoryId}
                                        readOnly={readOnly}

                                        setValue={(value) => handleInputChange(value, index, "productCategoryId")} options={(productCategoryList?.data ? (id ? productCategoryList?.data : productCategoryList?.data.filter(i => i?.active)) : [])} />
                                </td>
                                <td className='tx-table-cell'>
                                    <DropdownWithSearch value={item?.productId}
                                        readOnly={readOnly}

                                        setValue={(value) => handleInputChange(value, index, "productId")}
                                        options={productList?.data?.filter(value => parseInt(value?.productBrandId) === parseInt(item?.productBrandId) && parseInt(value?.productCategoryId) === parseInt(item?.productCategoryId)).filter(item => item?.active)} />
                                </td>
                                <td className='tx-table-cell'>
                                    <select
                                        disabled={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                        className='text-left w-full rounded py-1 tx-table-input'
                                        value={item?.uomId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                                        onBlur={(e) => {
                                            handleInputChange((e.target.value), index, "uomId")
                                        }
                                        }
                                    >
                                        <option>
                                        </option>
                                        {getProductUomPriceDetails(item?.productId).map((uom) =>
                                            <option value={uom.uomId} key={uom.uomId}>
                                                {uom?.Uom?.name}
                                            </option>)}
                                    </select>
                                </td>
                                <td className='tx-table-cell'>
                                    <input
                                        type="number"
                                        className="text-right rounded py-1 px-1 w-16 tx-table-input"

                                        value={(!item.qty) ? " " : item.qty}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            handleInputChange(e.target.value, index, "qty")
                                        }
                                        onBlur={(e) => {

                                            handleInputChange(parseFloat(e.target.value).toFixed(2), index, "qty");

                                        }
                                        }
                                    />
                                </td>
                                <td className='tx-table-cell'>
                                    <input
                                        type="number"
                                        className="text-right rounded py-1 px-1 w-16 tx-table-input"

                                        value={(!item?.price) ? 0.000 : item?.price}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            handleInputChange(e.target.value, index, "price")
                                        }
                                        onBlur={(e) => {

                                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "price");

                                        }
                                        }
                                    />
                                </td>
                                <td className='tx-table-cell'>
                                    <input
                                        type="number"
                                        className="text-right rounded py-1 px-1 w-16 tx-table-input"

                                        value={(!item?.salePrice) ? 0 : item?.salePrice}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            handleInputChange(e.target.value, index, "salePrice")
                                        }
                                        onBlur={(e) => {

                                            handleInputChange(parseFloat(e.target.value).toFixed(2), index, "salePrice");

                                        }
                                        }
                                    />
                                </td>


                                <td className='tx-table-cell'>
                                    <input
                                        type="number"
                                        className="text-right rounded py-1 px-1 w-16 tx-table-input"

                                        value={(!item?.qty || !item?.price) ? 0 : (parseFloat(item?.qty) * parseFloat(item?.price)).toFixed(2)}
                                        disabled={readOnly}

                                    />
                                </td>
                                {!readOnly &&
                                    <td className="border border-gray-500 text-xs text-center">
                                        <button
                                            type='button'
                                            onClick={() => {
                                                deleteRow(index)
                                            }}
                                            className='text-xs text-red-600 '>{DELETE}
                                        </button>
                                    </td>
                                }
                            </tr>
                        )}
                        <tr className='bg-blue-200 w-full border border-gray-400 h-7 font-bold'>
                            <td className="tx-table-cell text-center w-10 font-bold" colSpan={8}>Total</td>
                            <td className="tx-table-cell text-right pr-1 w-10">{getTotal("qty", "price").toFixed(2)} </td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </>
    )
}

export default PoBillItems