import React from 'react'

import { getDateFromDateTime } from '../../../Utils/helper';


export default function Form({ poBillItems, innerRef, date, name, contactMobile, data, docId }) {
  const currTime = new Date().toLocaleTimeString();

  console.log(poBillItems, 'printitems');
  function getTotal(field1, field2) {
    const total = poBillItems.reduce((accumulator, current) => {

      return accumulator + parseFloat(current[field1] && current[field2] ? current[field1] * current[field2] : 0)
    }, 0)
    return parseFloat(total)
  }

  return (
    <div className=" w-[350px] flex flex-col justify-between small-print" id='poPrint' ref={innerRef}>
      <h1 className='text-center text-xl font-semibold'>CASH BILL</h1>

      <hr className="border-t-2 border-dashed border-gray-600 w-full " />

      <div className=' text-center   text-xs flex mt-1 pl-2  grid grid-cols-2 w-45'>
        <div className=' text-start py-2'>
          <span className="font-bold col-span-1">Bill.No</span>
          <span>:</span>
          <span className='col-span-2'> {docId} </span>
        </div>
        <div className=' text-start py-2'>
          <span className="font-bold col-span-1">Bill.Date</span>
          <span>:</span>
          <span className='col-span-2'>{getDateFromDateTime(date)}</span>
        </div>
        <div className=' text-start py-2'>
          <span className="font-bold col-span-1">Time</span>
          <span>:</span>
          <span className='col-span-2'>{currTime}</span>
        </div>
      </div>
      <div class="flex items-center">
        <hr className="border-t-2 border-dashed border-gray-600 w-full " />

      </div>
      <div className='w-full  grid justify-center p-1'>
        <table className="print  text-xs table-auto  w-full ">
          <thead className='bg-blue-200 top-0'>
            <tr className='border-none bor'>
              <th className=" table-data  w-2 text-center p-0.5">S.no</th>



              <th className=" table-data w-full text-left p-2">Product Name<span className="text-red-500 ">*</span></th>


              <th className="table-data  w-20 p-2">Qty<span className="text-red-500 p-0.5">*</span></th>

              <th className="table-data  w-16 p-2">Rate<span className="text-red-500 p-0.5">*</span></th>



              <th className="table-data  w-16 p-0.5">Amount</th>



            </tr>
          </thead>
          <tr className="border-b-2 border-dashed border-gray-600 p-3"></tr>
          <tbody className='overflow-y-auto h-full w-full '>


            {(poBillItems ? poBillItems.filter(item => item?.Product?.name) : []).map((item, index) =>
              <tr key={index} className="w-full table-row bor ">
                <td className="table-data w-2 text-left px-1 py-3">
                  {index + 1}
                </td>
                <td className="table-data  text-left px-1 p-2">
                  {item?.Product?.name}
                </td>
                <td className="table-data  text-left px-1 p-2">
                  {item.qty}
                </td>
                <td className="table-data  text-left px-1 p-2">
                  {item.salePrice}
                </td>
                <td className="table-data  text-left px-1 p-2">
                  {item.salePrice * item.qty}
                </td>
              </tr>
            )}

            <tr className="border-b-2 border-dashed border-gray-600 "></tr>
            <tr className='bg-blue-200   font-bold bor '>
              <td className="table-data text-center w-10 font-bold p-3" colSpan={4}>Total</td>
              <td className="table-data   text-right pr-1">{getTotal("qty", "salePrice").toFixed(2)}</td>
            </tr>

          </tbody>
        </table>
      </div>

    </div >
  )
}

