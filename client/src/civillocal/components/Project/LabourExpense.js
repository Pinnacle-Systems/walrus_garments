import { faTrashCan, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { paymentMethods } from '../../../Utils/DropdownData';

const LabourExpense = ({ setFoodCost, foodCost, transportCost, setTransportCost, readOnly, expenseItems, setExpenseItems, childRecord }) => {


    function handleInputChange(value, index, field) {

        const newBlend = structuredClone(expenseItems);

        newBlend[index][field] = value;
        if (field === "isCompany") {

            newBlend[index][field] = value;
            newBlend[index]["isPersonal"] = !value;
        }
        if (field === "isPersonal") {

            newBlend[index][field] = value;
            newBlend[index]["isCompany"] = !value;
        }

        setExpenseItems(newBlend);
    };

    function removeItem(index) {
        setExpenseItems(labourExpense => {
            return labourExpense.filter((_, i) => parseInt(i) !== parseInt(index))
        });
    }


    return (
        <>
            <div className='grid grid-cols-3 gap-y-3 '>
                <div className='flex gap-x-5 justify-start  text-xs items-center w-3/4 mt-2'>
                    <label className={`md:text-start flex `}>Transport.Cost</label>
                    <input type={"number"} className={`${"focus:outline-none md:col-span-2 border-gray-500 border rounded w-32 py-1"} `} value={transportCost} onChange={(e) => { setTransportCost(e.target.value) }} readOnly={readOnly} />
                </div>
                <div className='flex gap-x-11 justify-start  text-xs items-center w-3/4 mt-2'>
                    <label className={`md:text-start flex ml-1`}>Food.Cost</label>
                    <input type={"number"} className={`${"focus:outline-none md:col-span-2 border-gray-500 border rounded w-32 py-1"} `} value={foodCost} onChange={(e) => { setFoodCost(e.target.value) }} readOnly={readOnly} />
                </div>


            </div>






            <div className='mt-4 w-full p-5'>
                <table className="border border-gray-500 w-full">
                    <thead className="border border-gray-500">
                        <tr>
                            <th className="border border-gray-500 text-sm w-12 p-1">S.no</th>
                            <th className="border border-gray-500 text-sm w-20 p-1">L.Count</th>
                            <th className="border border-gray-500 text-sm w-20 p-1">No.Of.Shift/Sq.Ft</th>
                            <th className="border border-gray-500 text-sm w-28 p-1">Rate</th>
                            <th className="border border-gray-500 text-sm w-28 p-1">Method</th>


                            <th className="border border-gray-500 text-sm w-28 p-1">CollectBy/IsCompany</th>
                            <th className="border border-gray-500 text-sm w-28 p-1">Given.By/IsPersonal</th>

                            <th className="border border-gray-500 text-sm w-28 p-1">Total</th>







                            <th className='w-12'>
                                <button type='button' className="text-green-700 p-1 w-8" onClick={() => {
                                    let newExpenseitems = [...expenseItems];
                                    newExpenseitems.push({});
                                    setExpenseItems(newExpenseitems);
                                }}> {<FontAwesomeIcon icon={faUserPlus} />}

                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>{console.log(expenseItems, "expenseItems")}
                        {(expenseItems || [])?.map((item, index) =>
                            <tr className="text-center" key={index}>

                                <td className="border border-gray-500 text-xs p-1">
                                    {index + 1}
                                </td>
                                <td className="border border-gray-500 text-xs">
                                    <input className="w-full p-1 capitalize"
                                        type="text" value={item.count} onChange={(e) => {
                                            handleInputChange(e.target.value, index, "count")
                                        }} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                                </td>
                                <td className="border border-gray-500 text-xs">
                                    <input className="w-full p-1 capitalize"
                                        type="text" value={item.noOfShift} onChange={(e) => {
                                            handleInputChange(e.target.value, index, "noOfShift")
                                        }} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                                </td>
                                <td className="border border-gray-500 text-xs">
                                    <input className="w-full p-1 capitalize"
                                        type="number" value={item.rate} onChange={(e) => {
                                            handleInputChange(e.target.value, index, "rate")
                                        }} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </td>

                                <td className="border border-gray-500 text-xs">
                                    <select

                                        disabled={readOnly}
                                        className='text-left w-full  rounded py-1 tx-table-input border border-gray-400'
                                        value={item.paymentMethod}
                                        onChange={(e) => handleInputChange(e.target.value, index, "paymentMethod")}
                                    >
                                        <option className='text-gray-600' hidden>

                                        </option>
                                        {paymentMethods?.map((data) =>
                                            <option value={data.value} key={data.show}>
                                                {data.show}
                                            </option>
                                        )}
                                    </select>
                                </td>

                                {
                                    (item?.paymentMethod !== "CASH" && item?.paymentMethod !== "") &&
                                    <>
                                        <td className="border border-gray-500 text-xs">
                                            <input type="radio" name='isAccount' className='mx-2 py-2' checked={item?.isCompany} onChange={(e) => handleInputChange(e.target.checked, index, "isCompany")} disabled={readOnly} />

                                            {/* <CheckBox name="Company.Ac" value={isCompany} setValue={setIsCompany} readOnly={readOnly} /> */}
                                        </td>
                                        <td className="border border-gray-500 text-xs">
                                            <input type="radio" name='isAccount' className='mx-2 py-2' checked={item?.isPersonal} onChange={(e) => handleInputChange(e.target.checked, index, "isPersonal")} disabled={readOnly} />

                                        </td>
                                    </>


                                }

                                {
                                    (item?.paymentMethod === "CASH") &&

                                    <>
                                        <td className="border border-gray-500 text-xs">
                                            <input type={"text"} className={`${" focus:outline-none md:col-span-2 border-gray-500 border rounded w-full py-1"} `} value={item?.collectBy} onChange={(e) => handleInputChange(e.target.value, index, "collectBy")} readOnly={readOnly} />



                                        </td>
                                        <td className="border border-gray-500 text-xs">
                                            <input type={"text"} className={`${"focus:outline-none md:col-span-2 border-gray-500 border rounded w-full py-1"} `} value={item?.givenBy} onChange={(e) => handleInputChange(e.target.value, index, "givenBy")} readOnly={readOnly} />



                                        </td>
                                    </>


                                }

                                <td className="border border-gray-500 text-xs">
                                    {parseFloat(parseFloat(item.noOfShift) * parseFloat(item.rate)).toFixed(3) || 0}
                                </td>

                                <td className="border border-gray-500 p-1 text-xs ">
                                    <button
                                        type='button'
                                        onClick={() => removeItem(index)}
                                        className='text-md text-red-600 ml-1'>{<FontAwesomeIcon icon={faTrashCan} />}</button>
                                </td>

                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default LabourExpense