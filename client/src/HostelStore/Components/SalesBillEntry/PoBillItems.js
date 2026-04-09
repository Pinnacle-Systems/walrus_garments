import React, { useEffect, useState } from 'react';
import { DELETE, PLUS } from '../../../icons';
import { useGetProductQuery } from '../../../redux/services/ProductMasterService';
import { useGetProductCategoryQuery } from '../../../redux/services/ProductCategoryServices';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { useGetProductBrandQuery } from '../../../redux/services/ProductBrandService';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import StockItem from './StockItem';
import { toast } from 'react-toastify';

import { findFromList } from '../../../Utils/helper';
import SalesPrice from './SalesPrice';
import { DropdownWithSearch } from '../../../Inputs';


const PoBillItems = ({ id, readOnly, setPoBillItems, poBillItems, date, readonly }) => {
    const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
    const { data: productBrandList } =
        useGetProductBrandQuery({ params });
    const [salePrice, setSalePrice] = useState("");

    const { data: supplierList } =
        useGetPartyQuery({ params });

    const { data: productCategoryList } =
        useGetProductCategoryQuery({ params });

    const { data: productList } = useGetProductQuery({ params });

    function handleInputChange(value, index, field, stockQty) {


        const newBlend = structuredClone(poBillItems);
        newBlend[index][field] = value;
        if (field === "qty") {

            if (parseFloat(stockQty) < parseFloat(value)) {
                toast.info("Sales Qty Can not be more than Stock Qty", { position: 'top-center' })
                return
            }
        }
        setPoBillItems(newBlend);
    };

    useEffect(() => {
        if (poBillItems.length >= 10) return
        setPoBillItems(prev => {
            let newArray = Array.from({ length: 10 - prev.length }, i => {
                return { productCategoryId: "", productBrandId: "", productId: "", stockQty: "0", qty: "0", price: "0.00", amount: "0.000" }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setPoBillItems, poBillItems])

    function getTotal(field1, field2) {
        const total = poBillItems.reduce((accumulator, current) => {

            return accumulator + parseFloat(current[field1] && current[field2] ? current[field1] * current[field2] : 0)
        }, 0)
        return parseFloat(total)
    }

    if (!productBrandList || !productCategoryList || !productList) return <Loader />
    function getProductUomPriceDetails(productId) {
        const items = findFromList(productId, productList?.data ? productList?.data : [], "ProductUomPriceDetails")
        return items ? items : []
    }

    console.log(productList, "productList")


    const handleSalePriceChange = (value) => {
        setSalePrice(value);
    };

    function deleteRow(index) {
        setPoBillItems(prev => prev.filter((_, i) => i !== index))
    }
    function addNewRow() {
        setPoBillItems(prev => [
            ...prev,
            { productCategoryId: "", productBrandId: "", productId: "", stockQty: "0", qty: "0", price: "0.00", amount: "0.000" }
        ]);
    }
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


                            <th className="tx-table-cell ">UOM type<span className="text-red-500 p-5">*</span></th>
                            <th className="tx-table-cell  w-16">SalesPrice<span className="text-red-500 p-0.5">*</span></th>
                            <th className="tx-table-cell  w-20">Stock.Qty</th>

                            <th className="tx-table-cell  w-20">Qty<span className="text-red-500 p-0.5">*</span></th>

                            <th className="tx-table-cell  w-16 p-0.5">Amount</th>
                            {!readOnly &&
                                <th className="tx-table-cell  w-16 p-0.5" >  <button className='text-2xl' onClick={addNewRow}>+</button></th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto h-full w-full'>


                        {(poBillItems ? poBillItems : []).map((item, index) =>

                            <tr key={index} className="w-full tx-table-row">
                                <td className="tx-table-cell w-2 text-left px-1 py-1">
                                    {index + 1}
                                </td>
                                <td className='tx-table-cell'>
                                    <DropdownWithSearch value={item.productBrandId}
                                        readOnly={readOnly}
                                        setValue={(value) => handleInputChange(value, index, "productBrandId")}
                                        options={productBrandList?.data ? (
                                            (id ? productBrandList?.data : productBrandList?.data.filter(i => i?.active))
                                        ) : []} />
                                </td>
                                <td className='tx-table-cell'>
                                    <DropdownWithSearch value={item.productCategoryId}
                                        readOnly={readOnly}

                                        setValue={(value) => handleInputChange(value, index, "productCategoryId")} options={(productCategoryList?.data ? (id ? productCategoryList?.data : productCategoryList?.data.filter(i => i?.active)) : [])} />
                                </td>
                                <td className='tx-table-cell'>
                                    <DropdownWithSearch value={item.productId}
                                        readOnly={readOnly}

                                        setValue={(value) => handleInputChange(value, index, "productId")}
                                        options={productList.data.filter(value => parseInt(value.productBrandId) === parseInt(item.productBrandId) && parseInt(value.productCategoryId) === parseInt(item.productCategoryId)).filter(item => item?.active)} />
                                </td>
                                <td className='tx-table-cell'>
                                    <select
                                        disabled={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                        className='text-left w-full rounded py-1 tx-table-input'
                                        value={item.uomId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                                        onBlur={(e) => {
                                            handleInputChange(e.target.value, index, "uomId")
                                        }
                                        }
                                    >
                                        <option className='text-gray-600'>
                                        </option>
                                        {getProductUomPriceDetails(item.productId).map((uom) =>
                                            <option value={uom.uomId} key={uom.uomId}>
                                                {uom.Uom.name}
                                            </option>
                                        )}
                                    </select>
                                </td>{console.log(getProductUomPriceDetails(item.productId), "getProductUomPriceDetails(item.productId)")}
                                <SalesPrice
                                    handleSalePriceChange={handleSalePriceChange}
                                    id={id}
                                    date={date}
                                    item={item}
                                    readOnly={readOnly}
                                    productId={item.productId}
                                    index={index}
                                    setPoBillItems={setPoBillItems}
                                    poBillItems={poBillItems}
                                    uomId={item.uomId}
                                    qty={item.qty}
                                />
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
                            <td className="tx-table-cell  w-10 text-right pr-1">{getTotal("qty", "salePrice").toFixed(2)}</td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </>
    )
}

export default PoBillItems