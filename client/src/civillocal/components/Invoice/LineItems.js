import React, { useEffect } from 'react'
import { DropdownWithSearch } from '../../../Inputs';
import { useGetProductQuery } from '../../../redux/services/ProductMasterService';
import secureLocalStorage from 'react-secure-storage';
import { useGetPartyByIdQuery, useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { Loader } from '../../../Basic/components';
import { findFromList, substract } from '../../../Utils/helper';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetProjectByIdQuery } from '../../../redux/services/ProjectService';
import { DELETE } from '../../../icons';

const LineItems = ({ lineItems, setLineItems, clientId, readOnly, projectId }) => {
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )


    const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
    const { data: partyList } = useGetPartyQuery({ params })
    const { data: uomList } = useGetUomQuery({ params })




    const {
        data: singlePartyList,
        isSinglePartyFetching: isSinglePartyFetching,
        isSinglePartyLoading: isSinglePartyLoading,
    } = useGetPartyByIdQuery(clientId, { skip: !clientId });
    const { data: productList } = useGetProductQuery({ params })

    function handleInputChange(value, index, field) {
        const newBlend = structuredClone(lineItems);

        const currentProductData = productList?.data ? productList?.data.find(item => parseInt(item.id) === parseInt(value)) : []

        if (field == "productId") {
            newBlend[index][field] = value;
            newBlend[index]["price"] = currentProductData?.price || 0
            newBlend[index]["description"] = currentProductData?.description || ""
            newBlend[index]["hsnCode"] = currentProductData?.hsnCode || 0
            newBlend[index]["uomId"] = currentProductData?.uomId || 0
            newBlend[index]["taxPercent"] = currentProductData?.taxPercent || ""
        }
        newBlend[index][field] = value;


        setLineItems(newBlend);
    };

    // useEffect(() => {
    //     if (!projectId) return
    //     if (!singleProjectData?.data) return
    //     if (lineItems?.length > 0) {
    //         setLineItems([])
    //     }


    //     singleProjectData?.data?.Quotes?.forEach(item => {
    //         let currentVersion = item?.quoteVersion

    //         let currentData = item?.QuotesItems?.filter(val => parseInt(val.quoteVersion) === parseInt(currentVersion))


    //         setLineItems((prev) => {

    //             let newArray = structuredClone(prev)
    //             newArray = currentData
    //             return [...prev, ...newArray];
    //         })

    //     })

    // }, [singleProjectData, setLineItems, projectId]);



    function addNewRow() {
        setLineItems(prev => [
            ...prev,
            { productId: "", description: "", uomId: "0", qty: "0", price: "0.00", discount: "0", amount: "0.000", }
        ]);
    }

    function deleteRow(index) {
        setLineItems(prev => prev.filter((_, i) => i !== index))
    }
    const calculateGst = (index) => {

        return lineItems[index]["taxPercent"]?.replace("%", "")

    }

    const calGst = (id) => {
        let taxPercent = (lineItems?.find(val => parseInt(val.id) === parseInt(id))?.taxPercent)

        return taxPercent ? taxPercent.replace("%", "") : 0

    }
    function findTotalAmount() {
        return lineItems?.reduce((a, b) => a + (substract(parseFloat(b.qty) * parseFloat(b.price), parseFloat(b?.discount || 0)) + ((parseFloat(b.qty) * parseFloat(b.price)) * (calGst(b.id) / 100))), 0)

    }


    if (!partyList) return <Loader />

    return (
        <>
            <table className=" border border-gray-500 text-xs table-auto w-full">
                <thead className='bg-blue-200 top-0 border-b border-gray-500'>
                    <tr className=''>

                        <th className="table-data  w-12 text-center p-0.5">S.no</th>
                        <th className="table-data">Product Name<span className="text-red-500 p-5">*</span></th>
                        <th className="table-data">Description</th>
                        <th className="table-data">Hsn</th>

                        <th className="table-data w-16">Uom</th>
                        <th className="table-data  w-16">Qty</th>
                        <th className="table-data  w-20">Price</th>

                        <th className="table-data  w-16 p-0.5">Taxable.Amount</th>

                        {
                            singlePartyList?.data?.isIgst ?

                                <th className="table-data  w-20">IGST</th>
                                :
                                <>
                                    <th className="table-data  w-20">CGST</th>
                                    <th className="table-data  w-20">SGST</th>
                                </>
                        }
                        <th className="table-data  w-20">Discount</th>


                        <th className="table-data  w-20">Amount</th>

                        {/* {!(id ? !(isNewVersion) : readOnly) && */}
                        <th className="table-data  w-16 p-0.5" onClick={addNewRow} >  <span className='text-2xl' >+</span></th>
                        {/* } */}
                    </tr>
                </thead>
                <tbody className='overflow-y-auto h-full w-full'>{console.log(lineItems, "lineItemslineItemslineItems")}
                    {(lineItems || []).map((item, index) =>

                        <tr key={index} className={`w-full table-row`}>

                            <td className="table-data w-7 text-left px-1 py-1">
                                {index + 1}
                            </td>
                            <td className='table-data w-32'>
                                <DropdownWithSearch value={item.productId}
                                    readOnly={readOnly}
                                    setValue={(value) => handleInputChange(value, index, "productId")}
                                    options={productList?.data?.filter(item => item?.active)} />


                            </td>
                            <td className="table-data w-48 overflow-auto text-left px-1 py-1">
                                <textarea readOnly={readOnly} className=" w-full h-24 overflow-auto focus:outline-none border border-gray-500 rounded p-2 text-xs"
                                    value={item?.id ? item?.Product?.description : item.description}

                                >
                                </textarea>
                            </td>

                            <td className='table-data w-16 text-right px-1'>

                                {item?.id ? item?.Product?.hsnCode : item.hsnCode}


                            </td>
                            <td className='table-data w-16'>
                                {item?.id ? (item?.Uom?.name || findFromList(item.uomId, uomList?.data, "name")) : findFromList(item.uomId, uomList?.data, "name")}

                            </td>

                            <td className='table-data'>
                                <input
                                    type="number"
                                    className="text-right rounded py-1 px-1 w-full  table-data-input border border-gray-400"
                                    value={item.qty == 0 ? '' : item.qty}
                                    disabled={readOnly}
                                    onChange={(e) =>
                                        handleInputChange(e.target.value, index, "qty")
                                    }
                                    onBlur={(e) => {
                                        handleInputChange(e.target.value, index, "qty");
                                    }
                                    }
                                />
                            </td>





                            <td className='table-data text-right px-1'>
                                {parseFloat(item?.price).toFixed(2) || 0}
                            </td>

                            <td className='table-data'>
                                <input
                                    type="number"
                                    className="text-right rounded py-1 px-1 w-full table-data-input"
                                    value={(!item.qty || !item.price) ? 0 : (parseFloat(parseFloat(item.qty) * parseFloat(item.price)).toFixed(2) || 0)}

                                    disabled
                                />
                            </td>



                            {
                                singlePartyList?.data?.isIgst ?


                                    <td className='table-data text-right px-1'>
                                        {(!item.qty || !item.price) ? 0 : (parseFloat((parseFloat(item.qty) * parseFloat(item.price)) * (calculateGst(index) / 100)).toFixed(2) || 0)}

                                    </td>

                                    :
                                    <>
                                        <td className='table-data text-right px-1'>
                                            {(!item.qty || !item.price) ? 0 : (parseFloat((parseFloat(item.qty) * parseFloat(item.price)) * ((calculateGst(index) / 2) / 100)).toFixed(2) || 0)}

                                        </td>

                                        <td className='table-data text-right px-1'>
                                            {(!item.qty || !item.price) ? 0 : (parseFloat((parseFloat(item.qty) * parseFloat(item.price)) * ((calculateGst(index) / 2) / 100)).toFixed(2) || 0)}

                                        </td>

                                    </>
                            }





                            <td className='table-data'>
                                <input
                                    type="number"
                                    className="text-right rounded py-1 px-1 w-full table-data-input border border-gray-400"
                                    value={item.discount == 0 ? '' : item.discount}
                                    disabled={readOnly}
                                    onChange={(e) =>
                                        handleInputChange(e.target.value, index, "discount")
                                    }
                                    onBlur={(e) => {

                                        handleInputChange(e.target.value, index, "discount");

                                    }
                                    }
                                />
                            </td>

                            <td className='table-data'>
                                <input
                                    type="number"
                                    className="text-right rounded py-1 px-1 w-full table-data-input"
                                    value={(!item.qty || !item.price) ? 0 : parseFloat(substract(parseFloat(item.qty) * parseFloat(item.price), parseFloat(item?.discount || 0)) + ((parseFloat(item.qty) * parseFloat(item.price)) * (calculateGst(index) / 100))).toFixed(2) || 0}

                                    disabled
                                />
                            </td>



                            <td className="border border-gray-500 text-xs text-center">
                                <button
                                    type='button'
                                    onClick={() => {
                                        deleteRow(index)
                                    }}
                                    className='text-xs text-red-600 '>{DELETE}
                                </button>
                            </td>

                        </tr>

                    )}
                    <tr className='bg-blue-200 w-full border border-gray-400 h-7 font-bold'>
                        <td className="table-data text-center w-10 font-bold" colSpan={10}>Total</td>
                        <td className="table-data  w-10 text-right pr-1">{parseFloat(findTotalAmount()).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

export default LineItems