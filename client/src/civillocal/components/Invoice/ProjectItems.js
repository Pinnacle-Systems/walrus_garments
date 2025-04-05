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

const ProjectItems = ({ setLineItems, lineItems, quotesItems, setQuotesItems, clientId, readOnly, projectId, id }) => {
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )



    const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
    const { data: partyList } = useGetPartyQuery({ params })
    const { data: uomList } = useGetUomQuery({ params })
    const { data: singleProjectData, isFetching: isSingleProjectFetching, isLoading: isSingleProjectLoading } = useGetProjectByIdQuery(projectId, { skip: !projectId });



    const {
        data: singlePartyList,
        isSinglePartyFetching: isSinglePartyFetching,
        isSinglePartyLoading: isSinglePartyLoading,
    } = useGetPartyByIdQuery(clientId, { skip: !clientId });




    useEffect(() => {
        if (!projectId) return
        if (!singleProjectData?.data) return
        if (quotesItems?.length > 0) {
            setQuotesItems([])
        }


        singleProjectData?.data?.Quotes?.forEach(item => {
            let currentVersion = item?.quoteVersion

            let currentData = item?.QuotesItems?.filter(val => parseInt(val.quoteVersion) === parseInt(currentVersion))


            setQuotesItems((prev) => {

                let newArray = structuredClone(prev)
                newArray = currentData
                return [...prev, ...newArray];
            })

        })

    }, [singleProjectData, setQuotesItems, projectId]);





    const calculateGst = (index) => {

        return quotesItems[index]["taxPercent"]?.replace("%", "")

    }

    function addItem(lineId) {
        setLineItems(lineItem => {
            if (id) return lineItem
            let newItems = structuredClone(lineItem);
            let newItem = lineId
            newItems.push(newItem);
            return newItems
        });
    }

    function removeItem(lineId) {
        setLineItems(lineItem => {
            let newItems = structuredClone(lineItem);
            newItems = newItems.filter(item => !((parseInt(item.id) === parseInt(lineId))))
            return newItems
        });
    }

    function isQuotesAdd(lineId) {
        let item = lineItems.find(item => ((parseInt(item.id) === parseInt(lineId))))

        if (!item) return false
        return true
    }




    function handleSelectAllChange(value) {
        if (value) {
            quotesItems.forEach(item => addItem(item))
        } else {
            quotesItems.forEach(item => removeItem(item.id))
        }
    }

    function getSelectAll() {
        return quotesItems.every(item => isQuotesAdd(item.id))
    }

    if (!partyList) return <Loader />

    return (
        <>
            <table className=" border border-gray-500 text-xs table-auto w-full">
                <thead className='bg-blue-200 top-0 border-b border-gray-500'>
                    <tr className=''>
                        <th className='flex flex-col w-20'>
                            <label>Select all</label>
                            <input type='checkbox' className='ml-1' onChange={(e) => handleSelectAllChange(!getSelectAll())}
                                checked={getSelectAll()}
                                disabled={readOnly}
                            />
                        </th>
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


                    </tr>
                </thead>
                <tbody className='overflow-y-auto h-full w-full'>
                    {(quotesItems || []).map((item, index) =>

                        <tr key={index} className={`w-full table-row`}>
                            <td className='border border-black w-12 text-center'>
                                <input type='checkbox' checked={isQuotesAdd(item.id)}
                                    onChange={() => {

                                        if (isQuotesAdd(item.id)) {
                                            removeItem(item.id)

                                        } else {

                                            addItem(item)
                                        }
                                    }} />
                            </td>
                            <td className="table-data w-7 text-left px-1 py-1">
                                {index + 1}
                            </td>
                            <td className='table-data w-32'>
                                {item?.Product?.name}


                            </td>
                            <td className="table-data w-48 overflow-auto text-left px-1 py-1">{item?.Product?.description}

                            </td>

                            <td className='table-data w-16 text-right px-1'>

                                {item?.Product?.hsnCode}


                            </td>
                            <td className='table-data w-16'>
                                {item?.Uom?.name}

                            </td>

                            <td className='table-data text-right px-1'>{item?.qty}

                            </td>





                            <td className='table-data text-right px-1'>
                                {parseFloat(item?.price).toFixed(2) || 0}
                            </td>

                            <td className='table-data text-right px-1'>{(!item.qty || !item.price) ? 0 : (parseFloat(parseFloat(item.qty) * parseFloat(item.price)).toFixed(2) || 0)}

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





                            <td className='table-data text-right px-1'>{item?.discount}

                            </td>

                            <td className='table-data text-right px-1'>{(!item.qty || !item.price) ? 0 : parseFloat(substract(parseFloat(item.qty) * parseFloat(item.price), parseFloat(item?.discount || 0)) + ((parseFloat(item.qty) * parseFloat(item.price)) * (calculateGst(index) / 100))).toFixed(2) || 0}

                            </td>





                        </tr>

                    )}

                </tbody>
            </table>
        </>
    )
}

export default ProjectItems