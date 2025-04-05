import React, { useEffect, useState } from 'react';
import { useGetStockByIdQuery } from '../../../redux/services/StockService';
import { toast } from 'react-toastify';

const SalesPrice = ({ productId, uomId, id, date, poBillItems, setPoBillItems, index, qty, readOnly }) => {
    const { data: singleProduct } = useGetStockByIdQuery({
        params: {
            productId,
            uomId,
            createdAt: id ? date : undefined,
        }
    }, { skip: !productId, uomId });

    const [salePrice, setSalePrice] = useState([]);
    useEffect(() => {
        if (singleProduct && singleProduct.data) {
            const salesPrices = singleProduct.data
            setSalePrice(salesPrices);
        }
    }, [singleProduct]);

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
    let stockQty = salePrice.find(i => i.salePrice == poBillItems[index]?.salePrice)?.stockQty
    stockQty = stockQty ? stockQty : 0
    let isShow = poBillItems[index]?.productId && poBillItems[index]?.uomId

    console.log(isShow,"isShow",poBillItems,"poBillItems")

    return (
        <>
            <td className='table-data'>
                {isShow &&
                    <div>
                        <select
                            className='text-left w-full rounded  table-data-input'
                            value={poBillItems[index].salePrice}
                            onChange={(e) => handleInputChange(e.target.value, index, "salePrice")}
                            onBlur={(e) => handleInputChange(e.target.value, index, "salePrice")}
                        >
                            {salePrice.map((price, id) => (
                                <option value={price?.salePrice} key={id}>
                                    {price.salePrice}
                                </option>
                            ))}
                        </select>
                    </div>
                }
            </td>
            <td className='table-data'>
                {(isShow && poBillItems[index]?.salePrice) &&
                    <>
                        {stockQty}
                    </>
                }
            </td >
            <td className='table-data'>
                <input
                    type="number"
                    className="text-right rounded py-1 px-1 w-16 table-data-input"

                    value={qty == 0 ? '' : qty}
                    disabled={readOnly}
                    onChange={(e) =>
                        handleInputChange(e.target.value, index, "qty", stockQty)
                    }
                    onBlur={(e) => {

                        handleInputChange(parseFloat(e.target.value).toFixed(2), index, "qty", stockQty);

                    }
                    }
                />
            </td>
            <td className='table-data'>
                <input
                    type="number"
                    className="text-right rounded py-1 px-1 w-16 table-data-input"
                    value={(!qty || !salePrice) ? 0 : (parseFloat(qty) * parseFloat(poBillItems[index].salePrice)).toFixed(2)}
                    disabled={readOnly}
                />
            </td>
        </>
    );
}

export default SalesPrice;
