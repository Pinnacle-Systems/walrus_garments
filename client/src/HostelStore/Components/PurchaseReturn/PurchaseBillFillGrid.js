import React, { useEffect } from 'react';
import { useGetProductQuery } from '../../../redux/services/ProductMasterService';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import { useGetPurchaseBillByIdQuery } from '../../../redux/services/PurchaseBillService';
import { findFromList } from '../../../Utils/helper';

const PurchaseBillFillGrid = ({ poReturnItems, setPoReturnItems, setPurchaseBillItems, purchaseBillItems, setPurchaseBillFillGrid, id, onDone }) => {
    const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
    const { data: productList } = useGetProductQuery({ params });
    function getProductUomPriceDetails(productId) {
        const items = findFromList(productId, productList?.data ? productList?.data : [], "ProductUomPriceDetails")
        return items ? items : []
    }
    const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetPurchaseBillByIdQuery(id, { skip: !id });
    useEffect(() => {
        setPurchaseBillItems(prev => {

            let newItem = structuredClone(prev)
            newItem = singleData?.data?.PoBillItems
            return newItem
        })
    }, [singleData, setPurchaseBillItems, isSingleFetching, isSingleLoading, id])



    function addItem(id) {
        singleData?.data?.PoBillItems.forEach(element => {
            if (parseInt(id) === parseInt(element.id)) {
                setPoReturnItems(prev => {
                    let newItem = structuredClone(prev)
                    newItem.push({
                        purchaseBillItemsId: id,
                        productId: element.productId,
                        uomId: element.uomId,
                        Product: {
                            name: element.Product.name,
                            ProductBrand: {
                                name: element.ProductBrand.name
                            },
                            ProductCategory: {
                                name: element.ProductCategory.name,
                            },
                        },
                        poQty: element.qty,
                        alreadyReturnQty: element.alreadyReturnQty
                    })
                    return newItem
                        ;
                })
            }
        });

    }
    console.log(singleData, 'singleData')
    function deleteItem(id) {
        setPoReturnItems(prev => {
            return prev.filter(item => parseInt(item.purchaseBillItemsId) !== parseInt(id))
        })
    }


    const isItemSelected = (id) => {
        let foundIndex = poReturnItems.findIndex(item => parseInt(item.purchaseBillItemsId) === parseInt(id))

        return foundIndex !== -1
    }

    const handleChange = (id) => {
        if (isItemSelected(id)) {
            deleteItem(id)
        } else {
            addItem(id)
        }
    }


    if (!singleData || isSingleFetching || isSingleLoading) return <Loader />

    return (
        <>

            <div className={` relative w-full overflow-y-auto py-1`}>
                <div className='flex justify-between mb-2'>
                    <h1 className='text-center mx-auto font-bold'>Purchase Bill Items</h1>
                    <button className='text-center font-bold bg-green-400 text-gray-100 p-1 rounded-lg' onClick={onDone}>DONE</button>
                </div>
                <table className=" border border-gray-500 text-xs table-auto  w-full">
                    <thead className='bg-green-300 top-0 border-b border-gray-500'>
                        <tr className=''>
                            <th className="table-data w-10"></th>
                            <th className="table-data  w-2 text-center p-0.5">S.no</th>
                            <th className="table-data ">Product Brand<span className="text-red-500 p-0.5">*</span></th>
                            <th className="table-data ">Product Category<span className="text-red-500 p-0.5">*</span></th>


                            <th className="table-data ">Product Name<span className="text-red-500 p-5">*</span></th>
                            <th className="table-data ">Uom type<span className="text-red-500 p-5">*</span></th>
                            <th className="table-data  w-20">Qty<span className="text-red-500 p-0.5">*</span></th>
                            <th className="table-data  w-16">Price<span className="text-red-500 p-0.5">*</span></th>
                            <th className="table-data  w-16 p-0.5">Amount</th>


                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto h-full w-full'>


                        {(purchaseBillItems ? purchaseBillItems : []).map((item, index) =>

                            <tr key={index} className="w-full table-row" onClick={() => { handleChange(item.id) }}>{console.log(purchaseBillItems, 'pbi')}
                                <td className="table-data flex justify-items-center items-center ">
                                    <input type='checkbox' checked={isItemSelected(item.id)} />
                                </td>
                                <td className="table-data w-2 text-left px-1 py-1">
                                    {index + 1}
                                </td>

                                <td className='table-data'>

                                    {item?.ProductBrand?.name}

                                </td>
                                <td className='table-data'>
                                    {item?.ProductCategory?.name}

                                </td>
                                <td className='table-data'>
                                    {item?.Product?.name}

                                </td>

                                <td>{getProductUomPriceDetails(item.productId).map((uom) => uom.Uom.name)}</td>

                                <td className='table-data text-right pr-1'>
                                    {item?.qty}

                                </td>
                                <td className='table-data text-right pr-1'>
                                    {item?.price ? item.price : 0.000}

                                </td>



                                <td className='table-data text-right pr-1'>
                                    {(!item.qty || !item.price) ? 0 : (parseFloat(item.qty) * parseFloat(item.price)).toFixed(2)}

                                </td>

                            </tr>
                        )}


                    </tbody>
                </table>
            </div>
        </>
    )
}

export default PurchaseBillFillGrid