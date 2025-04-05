import React, { useEffect, useState, Fragment } from 'react'
import { findFromList, substract } from '../../../Utils/helper';
import { DELETE, EDIT_ICON, TICK_ICON, VIEW } from '../../../icons';
import { useGetQuotesByIdQuery, useGetQuotesQuery, useUpdateQuotesMutation } from '../../../redux/services/QuotesService';
import moment from 'moment';

import secureLocalStorage from 'react-secure-storage';
import { useGetProjectByIdQuery } from '../../../redux/services/ProjectService';
import { toast } from 'react-toastify';
import { DropdownWithSearch } from '../../../Inputs';
import { useGetProductQuery } from '../../../redux/services/ProductMasterService';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import SubLineItems from './SubLineItems';
import Modal from "../../../UiComponents/Modal";


const LineItems = ({ lineEditableIndex, setLineEditableIndex, readOnly, lineItems, setLineItems, quoteId, id, saveData, projectName, clientId }) => {

    const [isOpenSubLineItems, setIsOpenSubLineItems] = useState(false);
    const [currentIndex, setCurrentIndex] = useState("");
    const [currentOpenNumber, setCurrentOpenNumber] = useState("");




    // const { data: singleQuoteData, isFetching: isSingleQuoteFetching, isLoading: isSingleQuoteLoading } = useGetQuotesByIdQuery(quoteId, { skip: !quoteId });
    const { data: singleProjectData, isFetching: isSingleProjectFetching, isLoading: isSingleProjectLoading } = useGetProjectByIdQuery(id, { skip: !id });


    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )
    const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
    const { data: partyList } = useGetPartyQuery({ params })
    const { data: uomList } = useGetUomQuery({ params })
    const { data: productList } = useGetProductQuery({ params })
    const { data: quotesData, isLoading, isFetching } = useGetQuotesQuery({ params: { branchId } });

    // useEffect(() => {
    //     if (id) return
    //     if (!quoteId) return

    //     if (lineItems?.length > 0) {
    //         setLineItems([])
    //     }


    //     let currentVersion = singleQuoteData?.data?.quoteVersion
    //     let currentVersionData = singleQuoteData?.data?.QuotesItems?.filter(item => parseInt(item.quoteVersion) === parseInt(currentVersion))

    //     setLineItems(prev => {
    //         let newLineItems = [];
    //         currentVersionData?.forEach((data, index) => {
    //             newLineItems.push({
    //                 productId: data?.productId,
    //                 description: data?.Product?.description,
    //                 hsnCode: data?.Product?.hsnCode,
    //                 uomId: data?.uomId,
    //                 qty: data?.qty,
    //                 planEndDate: "",
    //                 planStartDate: "",
    //                 leadDays: "",
    //                 isQuote: true,
    //                 subLineItems: [
    //                     {
    //                         name: "",
    //                         responsiblePerson: "",
    //                         isCompleted: false,
    //                         description: "",
    //                         category: "",
    //                         planEndDate: "",
    //                         planStartDate: "",
    //                         leadDays: "",

    //                     }
    //                 ]

    //             })


    //         })
    //         return newLineItems
    //     }
    //     )
    // }, [singleQuoteData, isSingleQuoteFetching, isSingleQuoteLoading, quoteId, setLineItems, id])


    useEffect(() => {

        if (id) return
        if (lineItems?.length > 0) {

            setLineItems([])
        }
        if (!projectName || !clientId) return
        let filterQuotes = quotesData?.data?.filter(val => val.projectName == projectName.toString())
        filterQuotes.forEach((item, itemIndex) => {
            let currentVersion = item?.quoteVersion
            let currentVersionData = item?.QuotesItems?.filter(item => parseInt(item.quoteVersion) === parseInt(currentVersion))


            setLineItems(prev => {
                let obj = structuredClone(prev)
                if (!currentVersionData) return prev
                let newLineItems = [...obj];
                currentVersionData?.forEach((data, index) => {
                    newLineItems.push({
                        quoteId: item?.id,
                        productId: data?.productId,
                        description: data?.description,
                        hsnCode: data?.hsnCode,
                        uomId: data?.uomId,
                        qty: data?.qty,
                        planEndDate: "",
                        planStartDate: "",
                        leadDays: "",
                        isQuote: true,
                        subLineItems: [
                            //     {
                            //         name: "",
                            //         responsiblePerson: "",
                            //         isCompleted: false,
                            //         description: "",
                            //         category: "",
                            //         planEndDate: "",
                            //         planStartDate: "",
                            //         leadDays: "",

                            //     }
                        ]

                    })


                })
                return newLineItems
            })

        })


    }, [quotesData, setLineItems, projectName, clientId])



    function addNewRow() {
        setLineItems(prev => [
            ...prev,
            {
                quoteId: "",
                productId: "",
                description: "",
                hsnCode: "",
                uomId: "0",
                qty: "0",
                planEndDate: "",
                planStartDate: "",
                leadDays: "",
                subLineItems: [
                    //     {
                    //         name: "",
                    //         responsiblePerson: "",
                    //         isCompleted: false,
                    //         description: "",
                    //         category: "",
                    //         planEndDate: "",
                    //         planStartDate: "",
                    //         leadDays: "",

                    //     }
                ]

            }
        ]);
    }



    function deleteRow(index) {
        setLineItems(prev => prev.filter((_, i) => i !== index))
    }


    function addSubLineNewRow(lineIndex) {
        setLineItems(prev => {
            const newItems = structuredClone(prev);
            newItems[lineIndex]["subLineItems"] = [...newItems[lineIndex]["subLineItems"], {
                name: "",
                responsiblePerson: "",
                isCompleted: false,
                description: "",
                category: "",
                planEndDate: "",
                planStartDate: "",
                leadDays: "",
            }];

            return newItems;
        });
    }

    function handleInputChange(value, index, field) {
        setLineItems(prev => {
            const newItems = structuredClone(prev);
            const currentProductData = productList?.data ? productList?.data.find(item => parseInt(item.id) === parseInt(value)) : []

            newItems[index][field] = value;
            if (field == "productId") {
                newItems[index]["description"] = currentProductData?.description || ""
                newItems[index]["hsnCode"] = currentProductData?.hsnCode || 0
                newItems[index]["uomId"] = currentProductData?.uomId || 0

            }
            if (field === "leadDays") {


                let startDate = new Date(newItems[index]['planStartDate']);

                startDate.setDate(startDate.getDate() + parseInt(value))
                newItems[index]['planEndDate'] = moment(startDate).format("YYYY-MM-DD");
            }
            return newItems;
        });
    };

    function isEditable(index) {
        setLineEditableIndex(index)
    }



    return (
        <fieldset
            className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 w-full border border-gray-400 md:pb-5 flex flex-1 overflow-auto'>
            {/* <Modal

                isOpen={isOpenSubLineItems}
                onClose={() => setIsOpenSubLineItems(false)}
                widthClass={"px-2 h-[90%] w-[90%]"}

            >
                <SubLineItems readOnly={readOnly} lineItems={lineItems} setLineItems={setLineItems} currentIndex={currentIndex} id={id} onClick={() => { setIsOpenSubLineItems(false) }} />
            </Modal> */}

            <legend className='sub-heading'>Line Items</legend>
            <div className={`w-full overflow-auto py-1`}>
                <table className="table-fixed text-center w-full">
                    <thead className="border-2 table-header">
                        <tr className=''>
                            <th className="table-data  w-12 text-center p-0.5 text-xs">S.no</th>
                            <th className="table-data w-44 text-xs">Product Name</th>
                            <th className="table-data w-64 text-xs">Description</th>
                            <th className="table-data w-20 text-xs">Hsn</th>

                            <th className="table-data w-20 text-xs">Uom</th>
                            <th className="table-data  w-24 text-xs">Qty</th>

                            <th className="table-data  w-24 text-xs">Plan Start Date</th>
                            <th className="table-data  w-24 text-xs">Lead Days</th>
                            <th className="table-data  w-24 text-xs">Plan End Date</th>
                            {(!readOnly) &&
                                <th className="table-data  w-12 p-0.5 text-xs" onClick={addNewRow} >  <span className='text-2xl' >+</span></th>
                            }
                            {(!readOnly) &&
                                <th className="table-data  w-12 p-0.5 text-xs"  >  <span className='text-2xl' ></span>Edit</th>
                            }
                            {(!readOnly) &&
                                <th className="table-data  w-12 p-0.5 text-xs"  >  <span className='text-2xl' ></span>Save</th>
                            }
                            {(!readOnly) &&
                                <th className="table-data  w-12 p-0.5 text-xs"  >  <span className='text-2xl' ></span>Add.Sub</th>
                            }

                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto h-full w-full'>
                        {(lineItems || []).map((item, index) => (
                            <Fragment key={index}  >
                                <tr key={index} className={`w-full bg-gray-300 text-xs`}>
                                    <td className="table-data w-9 text-left px-1 py-1 text-xs">
                                        {index + 1}
                                    </td>
                                    <td className='table-data text-xs'>
                                        <DropdownWithSearch value={item.productId}

                                            readOnly={(id ? lineEditableIndex !== index : item?.isQuote)}
                                            setValue={(value) => handleInputChange(value, index, "productId")}
                                            options={productList?.data?.filter(item => item?.active)} />



                                    </td>
                                    <td className="table-data w-9 text-left px-1 py-1 text-xs">
                                        <textarea readOnly={id ? lineEditableIndex !== index : item?.isQuote} className=" w-full overflow-auto focus:outline-none border border-gray-500 rounded py-1 text-xs"
                                            value={item.description}
                                            onChange={(e) => handleInputChange(e.target.value, index, "description")}

                                        >
                                        </textarea>

                                    </td>
                                    <td className="table-data w-9 text-left px-1 py-1 text-xs">
                                        {item?.id ? (item?.Product?.hsnCode) : item.hsnCode}
                                    </td>

                                    <td className="table-data w-9 text-left px-1 py-1 text-xs">
                                        {item?.id ? (item?.Uom?.name || findFromList(item.uomId, uomList?.data, "name")) : findFromList(item.uomId, uomList?.data, "name")}


                                    </td>
                                    <td className='table-data text-xs'>

                                        <input
                                            type="number"
                                            readOnly={lineEditableIndex !== index}
                                            className="text-right rounded py-1 px-1 w-full h-10  table-data-input "
                                            value={item.qty == 0 ? '' : item.qty}
                                            // disabled={lineEditableIndex !== index}
                                            onChange={(e) =>
                                                handleInputChange(e.target.value, index, "qty")
                                            }
                                            onBlur={(e) => {
                                                handleInputChange(e.target.value, index, "qty");
                                            }
                                            }
                                        />
                                    </td>
                                    <td className='table-data text-xs'>
                                        <input
                                            type="date"
                                            readOnly={lineEditableIndex !== index}
                                            className="text-right rounded py-1 px-1 w-full table-data-input"
                                            value={item?.planStartDate ? moment(item?.planStartDate).format("YYYY-MM-DD") : 0}
                                            // disabled={lineEditableIndex !== index || readOnly ? false : true}

                                            onChange={(e) =>
                                                handleInputChange(e.target.value, index, "planStartDate")
                                            }
                                        />
                                    </td>
                                    <td className='table-data text-xs'>
                                        <input
                                            type="number"
                                            className="text-right rounded py-1 px-1 w-full h-10 table-data-input"
                                            value={item?.leadDays || ""}
                                            readOnly={lineEditableIndex !== index}
                                            onChange={(e) =>
                                                handleInputChange(e.target.value, index, "leadDays")
                                            }
                                        />
                                    </td>
                                    <td className='table-data text-xs'>
                                        <input
                                            type="date"
                                            className="text-right rounded py-1 px-1 w-full table-data-input"
                                            value={item?.planEndDate ? moment(item?.planEndDate).format("YYYY-MM-DD") : 0}

                                            readOnly={lineEditableIndex !== index}
                                            onChange={(e) =>
                                                handleInputChange(e.target.value, index, "planEndDate")
                                            }
                                        />
                                    </td>

                                    {(!readOnly) &&
                                        <td className=" text-xs text-center table-data">
                                            <button
                                                type='button'
                                                onClick={() => {
                                                    deleteRow(index)
                                                }}
                                                className='text-lg text-red-600 '>{DELETE}
                                            </button>
                                        </td>
                                    }

                                    {(!readOnly) &&
                                        <td className=" text-xs text-center table-data">
                                            <button
                                                type='button'
                                                onClick={() => isEditable(index)}
                                                className='text-lg text-yellow-600 '>{EDIT_ICON}
                                            </button>
                                        </td>
                                    }

                                    {(!readOnly) &&
                                        <td className=" text-xs text-center table-data">
                                            <button

                                                type='button'
                                                onClick={saveData}
                                                className='text-lg text-green-600 '>{TICK_ICON}
                                            </button>
                                        </td>
                                    }

                                    {(!readOnly) &&
                                        <td className=" text-xs text-center table-data">
                                            <button

                                                type='button'
                                                onClick={() => addSubLineNewRow(index)}
                                                className='text-lg text-blue-600 w-full'>+
                                            </button>
                                        </td>
                                    }


                                </tr>
                                {
                                    item?.subLineItems?.length > 0 ?
                                        <tr className='bg-green-200  '>
                                            <th className="table-data  w-12 text-center p-0.5 text-xs ">S.no</th>
                                            <th className="table-data w-44 text-xs">Name</th>
                                            <th className="table-data w-64 text-xs">Description</th>
                                            <th className="table-data w-20 text-xs">Category</th>
                                            <th className="table-data w-20 text-xs">Res.Person</th>


                                            <th className="table-data  w-24 text-xs">Plan Start Date</th>
                                            <th className="table-data  w-24 text-xs">Lead Days</th>
                                            <th className="table-data  w-24 text-xs">Plan End Date</th>
                                            <th className="table-data  w-24 text-xs">IsCompleted</th>
                                            {(!readOnly) &&
                                                <th className="table-data  w-12 text-xs" onClick={() => addSubLineNewRow(index)} >  <span className='text-2xl' >+</span></th>
                                            }
                                            {(!readOnly) &&
                                                <th className="table-data  w-12 p-0.5 text-xs" onClick={addNewRow} >  <span className='text-2xl' ></span>Edit</th>
                                            }
                                            {(!readOnly) &&
                                                <th className="table-data  w-12 p-0.5 text-xs" onClick={addNewRow} >  <span className='text-2xl' ></span>Save</th>
                                            }
                                        </tr>
                                        :
                                        <></>
                                }





                                <SubLineItems readOnly={readOnly} lineItems={lineItems} setLineItems={setLineItems} currentIndex={currentIndex} lineIndex={index} item={item} id={id} onClick={() => { setIsOpenSubLineItems(false) }} saveData={saveData} />



                            </Fragment>

                        ))}
                        <tr className='bg-blue-200 w-full border border-gray-400 h-7 font-bold'>
                            <td className="table-data  w-10 text-right pr-1"></td>
                            <td className="table-data text-center w-10 font-bold" colSpan={readOnly ? 7 : 10}>Total</td>
                            <td className="table-data  w-10 text-right pr-1" ></td>

                        </tr>
                    </tbody>
                </table>

            </div>
        </fieldset>
    )
}

export default LineItems
