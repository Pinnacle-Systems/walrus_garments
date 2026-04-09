import Sangeethatex from "../../../../../src/assets/Sangeethatex.png";
import useTaxDetailsHook from "../../../../CustomHooks/TaxHookDetails";
import { useGetBranchByIdQuery } from "../../../../redux/services/BranchMasterService";
import { useGetPartyByIdQuery, useGetPartyQuery } from "../../../../redux/services/PartyMasterService";
import { useGetPaytermMasterQuery } from "../../../../redux/services/PayTermMasterServices";
import { useGetTermsAndConditionsQuery } from "../../../../redux/services/TermsAndConditionsService";
import { findFromList, getCommonParams, getDateFromDateTimeToDisplay } from "../../../../Utils/helper";
import QRCode from "react-qr-code";
import Address from "./Address";
import TaxDetails from "./TaxDetails";
import numberToText from "number-to-text";
import React, { forwardRef, useEffect, useRef } from "react";





const Form = forwardRef(({
  poType,
  poItems,
  supplierDetails,
  singleData,
  poNumber,
  poDate,
  dueDate,
  payTermId,
  deliveryType,
  deliveryToId,
  remarks,
  taxTemplateId,
  discountType,
  discountValue,
  yarnList ,
  uomList ,colorList
} ,ref) => {


  console.log(ref?.
current
, "ref")

  const { branchId, companyId } = getCommonParams()

  const { data } = useGetBranchByIdQuery(branchId)

  const branchData = data?.data ? data.data : {};

  const { data: deliveryToBranch } = useGetBranchByIdQuery(deliveryToId, { skip: deliveryType === "ToParty" })
  const { data: deliveryToSupplier } = useGetPartyByIdQuery(deliveryToId, { skip: deliveryType === "ToSelf" })

  let deliveryTo = deliveryType === "ToParty" ? deliveryToSupplier?.data : deliveryToBranch?.data;

  const params = {
    branchId, companyId
  };
  const { data: payTermList } =
    useGetPaytermMasterQuery({ params: { ...params } });
  const { data: supplierList } =
    useGetPartyQuery({ params: { ...params } });

  const { data: termsAndCondition } = useGetTermsAndConditionsQuery({ params: { poType, companyId } })


  const { isLoading: isTaxHookDetailsLoading, ...taxDetails } = useTaxDetailsHook({ poItems, taxTypeId: taxTemplateId, discountType, discountValue })


  const onPrint = () => {
    window.print();
  }


  if (!supplierDetails || !singleData || !supplierList || isTaxHookDetailsLoading || !termsAndCondition) return null


  // if (!ref.current) {
  //   return (
  //     <div className="h-[90%] w-full flex flex-col justify-between border-2 m-0 border-black" >

  //       <div className="h-[90%] overflow-y-auto">
  //         <div className='font-bold text-green-700 text-md text-center'>{branchData.branchName}</div>
  //         <div className='flex'>
  //           <div className='w-1/4 flex items-center justify-center'>
  //             <img src={Sangeethatex} alt='logo' className="h-16" />
  //           </div>
  //           <div className='text-start p-2 w-full'>
  //             <div className=' w-full p-1 '>
  //               <div className='grid text-xs'>
  //                 <h1 className='w-[350px]'>{branchData.address}</h1>
  //                 <h1 className=''>{branchData.mobile}</h1>
  //                 <h1 className=''>PANNO: {branchData.panNo} </h1>
  //                 <h1 className=''>GSTNO: {branchData.gstNo}</h1>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //         <div className='text-center p-1 text-md flex items-center justify-center font-bold text-green-700 w-full border-t border-gray-500'> PURCHASE ORDER</div>
  //         <div className='flex justify-between text-sm border  border-gray-600' >
  //           <div className='grid grid-cols-2 w-full py-2'>
  //             <div className='flex ml-1'><span className="font-bold">PO No :</span> {poNumber}</div>
  //             <div className='flex ml-1'><span className="font-bold">PO Date :</span> {getDateFromDateTimeToDisplay(poDate)}</div>
  //             <div className='flex ml-1'><span className="font-bold">Due Date :</span> {getDateFromDateTimeToDisplay(dueDate)}</div>
  //             <div className='flex ml-1'><span className="font-bold">Payment Terms :</span> {findFromList(payTermId, payTermList?.data, "name")}</div>
  //           </div>
  //           <div className='mr-2 p-1'>
  //             <QRCode value={poNumber} size={80} />
  //           </div>
  //         </div>
  //         <Address deliveryTo={deliveryTo} deliveryType={deliveryType} supplierDetails={supplierDetails} />
  //         <div >
  //           <table className=" text-xs border  border-gray-500 table-auto w-full ">
  //             <thead className=' border border-gray-500 top-0 bg-green-200'>
  //               <tr className='h-8'>
  //                 <th className="tx-table-cell text-center w-16">S.no</th>
  //                 <th className="tx-table-cell ">Description</th>
  //                 <th className="tx-table-cell ">Color</th>
  //                 <th className="tx-table-cell  ">UOM</th>
  //                 <th className="tx-table-cell  ">No. Of Bags</th>
  //                 <th className="tx-table-cell  "> Qty</th>
  //                 <th className="tx-table-cell  ">Rate</th>
  //                 <th className="tx-table-cell  w-16">Tax</th>
  //                 <th className="tx-table-cell  w-16">Amount</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {poItems.map((value, index) => (
  //                 <tr className='border  border-gray-500 w-full' key={index}>
  //                   <td className='tx-table-cell text-center px-1'>{index + 1} </td>

  //                   <td className='tx-table-cell  px-1 '>
  //                     {value.Yarn?.aliasName}
  //                   </td>
  //                   <td className='tx-table-cell text-center px-1 '>
  //                     {value.Color?.name}
  //                   </td>
  //                   <td className='tx-table-cell text-center px-1  '>
  //                     {value.Uom?.name}
  //                   </td>
  //                   <td className='tx-table-cell text-center px-1 '>{value.noOfBags}</td>
  //                   <td className='tx-table-cell text-right px-1 '>{parseFloat(value.qty).toFixed(3)}</td>
  //                   <td className='tx-table-cell text-right px-1 '>{parseFloat(value.price).toFixed(2)}</td>
  //                   <td className='tx-table-cell text-center px-1 '>{value.taxPercent}%</td>
  //                   <td className='tx-table-cell text-right px-1  '>{parseFloat(parseFloat(value.qty) * parseFloat(value.price)).toFixed(2)}</td>
  //                 </tr>
  //               ))}
  //               <tr className='border  border-gray-500'>
  //                 <th className='tx-table-cell text-center px-1  font-bold text-xs' colSpan={8}>TOTAL</th>
  //                 <td className='px-1 h-8  text-right'>{parseFloat(taxDetails.taxableAmount).toFixed(2)}</td>
  //               </tr>
  //             </tbody>
  //           </table>
  //         </div>
  //         <div className='flex justify-end'>
  //           <table className='border border-gray-500 text-center'>
  //             <tbody>
  //               <tr className='border border-gray-500 '><th className='p-2 bg-green-200 text-xs' colSpan={2}>Tax Details</th></tr>
  //               <TaxDetails items={poItems} taxTemplateId={taxTemplateId} discountType={discountType} discountValue={discountValue} />
  //               <tr className='border border-gray-500 text-xs '>
  //                 <td className='tx-table-cell p-1'>
  //                   ROUNDOFF
  //                 </td>
  //                 <td className='tx-table-cell text-right p-1'>
  //                   {parseFloat(taxDetails?.roundOffAmount).toFixed(2)}
  //                 </td>
  //               </tr>
  //               <tr className='border border-gray-500 text-xs'>
  //                 <td className='tx-table-cell p-1 bg-green-200 text-xs'>
  //                   NET AMOUNT
  //                 </td>
  //                 <td className='tx-table-cell p-1 text-xs'>
  //                   {parseFloat(taxDetails?.netAmount).toFixed(2)}
  //                 </td>
  //               </tr>
  //             </tbody>
  //           </table>
  //         </div>
  //         <div className=' w-full'>
  //           <div className='w-full '>
  //             <div className='w-full border border-gray-600 flex items-center'>
  //               <h1 className='font-bold text-sm'>Amount in words    :
  //               </h1>
  //               <span className='text-xs'>
  //                 Rs.{numberToText.convertToText(taxDetails?.netAmount, { language: "en-in", separator: "" })} Only
  //               </span>
  //             </div>
  //             <div className='w-full border border-gray-600 flex items-center'><h1 className='font-bold text-sm'>Remarks : </h1>
  //               <span className='text-xs'>
  //                 {remarks}
  //               </span>
  //             </div>
  //             <div className='w-full '>
  //               <h1 className='text-sm w-full font-bold'>Terms and Condition :
  //               </h1>
  //               <h1 className='text-[10px] w-full border-b border-gray-600'>
  //                 {(((termsAndCondition.data)
  //                   &&
  //                   (termsAndCondition.data)).filter(item => item.isPurchaseOrder).map((value) =>
  //                     <pre key={value.id} className='font-sans'>{value.description}</pre>
  //                   ))}
  //               </h1>
  //             </div>
  //           </div>
  //           <div className='mt-3'>
  //             <div className='text-sm text-right px-2 font-bold italic'>
  //               For {branchData?.branchName}
  //             </div>
  //             <div className='grid grid-rows-1 grid-flow-col p-2 font-bold text-xs mt-8 justify-around'>
  //               <h1>Prepared By</h1>
  //               <h1>Verified By</h1>
  //               <h1>Received By</h1>
  //               <h1>Approved By</h1>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //     </div>
  //   );
  // }
  // else {


    return (


      <>
        <div className="h-[950px] w-full flex flex-col justify-between border-2 m-0 border-black" id='poPrint' ref={ref}>
      <div className="flex justify-end mb-2  bg-white p-2 print:hidden z-10 border-b border-gray-300">
           <button
            onClick={onPrint}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded shadow"
            title="Print Purchase Order"
          >
            🖨️ Print
          </button>
        </div>

          <div>
            <div className='font-bold text-green-700 text-md text-center'>{branchData.branchName}</div>
            <div className='flex'>
              <div className='w-1/4 flex items-center justify-center'>
                <img src={Sangeethatex} alt='logo' className="h-16" />
              </div>
              <div className='text-start p-2 w-full'>
                <div className=' w-full p-1 '>
                  <div className='grid text-xs'>
                    <h1 className='w-[350px]'>{branchData.address}</h1>
                    <h1 className=''>{branchData.mobile}</h1>
                    <h1 className=''>PANNO: {branchData.panNo} </h1>
                    <h1 className=''>GSTNO: {branchData.gstNo}</h1>
                  </div>
                </div>
              </div>
            </div>
            <div className='text-center p-1 text-md flex items-center justify-center font-bold text-green-700 w-full border-t border-gray-500'>YARN PURCHASE ORDER</div>
            <div className='flex justify-between text-sm border  border-gray-600' >
              <div className='grid grid-cols-2 w-full py-2'>
                <div className='flex ml-1'><span className="font-bold">PO No :</span> {poNumber}</div>
                <div className='flex ml-1'><span className="font-bold">PO Date :</span> {getDateFromDateTimeToDisplay(poDate)}</div>
                <div className='flex ml-1'><span className="font-bold">Due Date :</span> {getDateFromDateTimeToDisplay(dueDate)}</div>
                <div className='flex ml-1'><span className="font-bold">Payment Terms :</span> {findFromList(payTermId, payTermList?.data, "name")}</div>
              </div>
              <div className='mr-2 p-1'>
                <QRCode value={poNumber} size={80} />
              </div>
            </div>
            <Address deliveryTo={deliveryTo} deliveryType={deliveryType} supplierDetails={supplierDetails} />
            <div >
              <table className=" text-xs border  border-gray-500 table-auto w-full ">
                <thead className=' border border-gray-500 top-0 bg-green-200'>
                  <tr className='h-8'>
                    <th className="tx-table-cell text-center w-16">S.no</th>
                    <th className="tx-table-cell ">Item</th>
                    <th className="tx-table-cell ">Color</th>
                    <th className="tx-table-cell  ">UOM</th>
                    <th className="tx-table-cell  ">No. Of Bags</th>
                    <th className="tx-table-cell  "> Qty</th>
                    <th className="tx-table-cell  ">Rate</th>
                    <th className="tx-table-cell  w-16">Tax(%)</th>
                    <th className="tx-table-cell  w-16">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {poItems.map((value, index) => (
                    <tr className='border  border-gray-500 w-full' key={index}>
                      <td className='tx-table-cell text-center px-1'>{index + 1} </td>

                      <td className='tx-table-cell  px-1 '>
                        {findFromList(value.yarnId,yarnList?.data,"name" )}
                      </td>
                      <td className='tx-table-cell text-center px-1 '>
                        {findFromList(value.colorId,colorList?.data,"name" )}
                      </td>
                      <td className='tx-table-cell text-center px-1  '>
                        {findFromList(value.uomId,uomList?.data,"name" )}
                      </td>
                      <td className='tx-table-cell text-right px-1 '>{parseFloat(value.noOfBags).toFixed(3)}</td>
                      <td className='tx-table-cell text-right px-1 '>{parseFloat(value.qty).toFixed(3)}</td>
                      <td className='tx-table-cell text-right px-1 '>{parseFloat(value.price).toFixed(3)}</td>
                      <td className='tx-table-cell text-right px-1 '>{parseFloat(value.taxPercent).toFixed(3)}</td>
                      <td className='tx-table-cell text-right px-1  '>{parseFloat(parseFloat(value.qty) * parseFloat(value.price)).toFixed(3)}</td>
                    </tr>
                  ))}
                  <tr className='border  border-gray-500'>
                    <th className='tx-table-cell text-center px-1  font-bold text-xs' colSpan={8}>TOTAL</th>
                    <td className='px-1 h-8  text-right'>{parseFloat(taxDetails.taxableAmount).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className='flex justify-end'>
              <table className='border border-gray-500 text-center'>
                <tbody>
                  <tr className='border border-gray-500 '><th className='p-2 bg-green-200 text-xs' colSpan={2}>Tax Details</th></tr>
                  <TaxDetails items={poItems} taxTemplateId={taxTemplateId} discountType={discountType} discountValue={discountValue} />
                  <tr className='border border-gray-500 text-xs '>
                    <td className='tx-table-cell p-1'>
                      ROUNDOFF
                    </td>
                    <td className='tx-table-cell text-right p-1'>
                      {parseFloat(taxDetails?.roundOffAmount).toFixed(3)}
                    </td>
                  </tr>
                  <tr className='border border-gray-500 text-xs'>
                    <td className='tx-table-cell p-1 bg-green-200 text-xs'>
                      NET AMOUNT
                    </td>
                    <td className='tx-table-cell p-1 text-xs text-right' >
                      {parseFloat(taxDetails?.netAmount).toFixed(3)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className=' w-full'>
            <div className='w-full '>
              <div className='w-full border border-gray-600 flex items-center'>
                <h1 className='font-bold text-sm'>Amount in words    :
                </h1>
                {/* <span className='text-xs'>
                  Rs.{numberToText?.convertToText(taxDetails?.netAmount, { language: "en-in", separator: "" })} Only
                </span> */}
              </div>
              <div className='w-full border border-gray-600 flex items-center'><h1 className='font-bold text-sm'>Remarks : </h1>
                <span className='text-xs'>
                  {remarks}
                </span>
              </div>
              <div className='w-full '>
                <h1 className='text-sm w-full font-bold'>Terms and Condition :
                </h1>
                <h1 className='text-[10px] w-full border-b border-gray-600'>
                  {(((termsAndCondition.data)
                    &&
                    (termsAndCondition.data)).filter(item => item.isPurchaseOrder).map((value) =>
                      <pre key={value.id} className='font-sans'>{value.description}</pre>
                    ))}
                </h1>
              </div>
            </div>
            <div className='mt-3'>
              <div className='text-sm text-right px-2 font-bold italic'>
                For {branchData?.branchName}
              </div>
              <div className='grid grid-rows-1 grid-flow-col p-2 font-bold text-xs mt-8 justify-around'>
                <h1>Prepared By</h1>
                <h1>Verified By</h1>
                <h1>Received By</h1>
                <h1>Approved By</h1>
              </div>
            </div>
          </div>
        </div>
      </>


    )
  // }


})

// export default Form;





// const Form = ({
//   remarks,
//   discountType,
//   discountValue,
//   poType,
//   poItems,
//   supplierDetails,
//   singleData,
//   poNumber,
//   poDate,
//   dueDate,
//   payTermId,
//   deliveryType,
//   deliveryToId,
//   taxTemplateId,
//   yarnList,
//   uomList,
//   colorList,
//   onPrintComplete, // optional callback to close modal
// }) => {
//   const { branchId, companyId } = getCommonParams();

//   const { data } = useGetBranchByIdQuery(branchId);
//   const branchData = data?.data || {};

//   const { data: deliveryToBranch } = useGetBranchByIdQuery(deliveryToId, {
//     skip: deliveryType === "ToParty",
//   });
//   const { data: deliveryToSupplier } = useGetPartyByIdQuery(deliveryToId, {
//     skip: deliveryType === "ToSelf",
//   });
//   const deliveryTo =
//     deliveryType === "ToParty"
//       ? deliveryToSupplier?.data
//       : deliveryToBranch?.data;

//   const params = { branchId, companyId };

//   const { data: payTermList } = useGetPaytermMasterQuery({ params });
//   const { data: supplierList } = useGetPartyQuery({ params });
//   const { data: termsAndCondition } = useGetTermsAndConditionsQuery({
//     params: { poType, companyId },
//   });

//   const { isLoading, ...taxDetails } = useTaxDetailsHook({
//     poItems,
//     taxTypeId: taxTemplateId,
//     discountType,
//     discountValue,
//   });



//   const onPrint = () => {
//     window.print();
//     if (onPrintComplete) onPrintComplete();
//   }

//   if (
//     !supplierDetails ||
//     !singleData ||
//     !supplierList ||
//     isLoading ||
//     !termsAndCondition
//   )
//     return null;

//   return (
//     <div
//       className="max-h-[70vh] overflow-auto bg-gray-50 print:bg-white print:overflow-visible print:h-auto p-4 rounded-lg"
//     >

//       <div
//         className="w-[210mm] min-h-[297mm] bg-white text-black border border-gray-700 mx-auto relative"
//         style={{ fontFamily: "Arial, sans-serif" }}
//       >
//         <div className="flex justify-end mb-2  bg-white p-2 print:hidden z-10 border-b border-gray-300">
//           <button
//             onClick={onPrint}
//             className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded shadow"
//             title="Print Purchase Order"
//           >
//             🖨️ Print
//           </button>
//         </div>

//         {/* Header */}
//         <div className="text-center font-bold text-green-700 text-lg mb-1">
//           {branchData.branchName}
//         </div>

//         <div className="flex mb-2">
//           <div className="w-1/4 flex items-center justify-center">
//             <img src={Sangeethatex} alt="logo" className="h-16" />
//           </div>
//           <div className="text-xs w-full">
//             <p>{branchData.address}</p>
//             <p>Mobile: {branchData.mobile}</p>
//             <p>PAN: {branchData.panNo}</p>
//             <p>GST: {branchData.gstNo}</p>
//           </div>
//         </div>

//         <div className="text-center text-md font-bold text-green-700 border-t border-b border-gray-500 py-1 my-2">
//           YARN PURCHASE RETURN
//         </div>

//         {/* PO Info */}
//         <div className="flex justify-between text-sm border border-gray-600 p-2 mb-2">
//           <div>
//             <div><b>Return No:</b> {poNumber}</div>
//             <div><b>Date:</b> {getDateFromDateTimeToDisplay(poDate)}</div>
//             <div><b>Payment Terms:</b> {findFromList(payTermId, payTermList?.data, "name")}</div>
//           </div>
//           <QRCode value={poNumber} size={60} />
//         </div>

//         {/* Address */}
//         <Address
//           deliveryTo={deliveryTo}
//           deliveryType={deliveryType}
//           supplierDetails={supplierDetails}
//         />

//         {/* Table */}
//         <table className="w-full border border-gray-500 text-xs mt-2">
//           <thead className="bg-green-200 border border-gray-500">
//             <tr className="h-7">
//               <th>S.No</th>
//               <th>Item</th>
//               <th>Color</th>
//               <th>UOM</th>
//               <th>No. of Bags</th>
//               <th>Return Qty</th>
//               <th>Rate</th>
//               <th>Tax(%)</th>
//               <th>Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {poItems.map((value, index) => (
//               <tr key={index} className="border border-gray-400 text-center">
//                 <td>{index + 1}</td>
//                 <td>{findFromList(value.yarnId, yarnList?.data, "name")}</td>
//                 <td>{findFromList(value.colorId, colorList?.data, "name")}</td>
//                 <td>{findFromList(value.uomId, uomList?.data, "name")}</td>
//                 <td>{value.noOfBags}</td>
//                 <td>{parseFloat(value.qty).toFixed(3)}</td>
//                 <td>{parseFloat(value.price).toFixed(2)}</td>
//                 <td>{parseFloat(value.taxPercent).toFixed(2)}</td>
//                 <td>{parseFloat(value.qty * value.price).toFixed(2)}</td>
//               </tr>
//             ))}
//             <tr className="border border-gray-500 font-bold">
//               <td colSpan={8} className="text-right pr-2">TOTAL</td>
//               <td className="text-right pr-2">
//                 {parseFloat(taxDetails.taxableAmount).toFixed(2)}
//               </td>
//             </tr>
//           </tbody>
//         </table>

//         {/* Tax Details */}
//         <div className="flex justify-end mt-2">
//           <table className="border border-gray-500 text-center text-xs">
//             <tbody>
//               <tr>
//                 <th colSpan={2} className="bg-green-200">Tax Details</th>
//               </tr>
//               <TaxDetails
//                 items={poItems}
//                 taxTemplateId={taxTemplateId}
//                 discountType={discountType}
//                 discountValue={discountValue}
//               />
//               <tr>
//                 <td className="p-1">ROUNDOFF</td>
//                 <td className="p-1 text-right">
//                   {parseFloat(taxDetails.roundOffAmount).toFixed(2)}
//                 </td>
//               </tr>
//               <tr>
//                 <td className="bg-green-200 p-1 font-bold">NET AMOUNT</td>
//                 <td className="p-1 text-right font-bold">
//                   {parseFloat(taxDetails.netAmount).toFixed(2)}
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* Remarks + Terms */}
//         <div className="border border-gray-600 p-2 text-xs">
//           <b>Remarks:</b> {remarks}
//         </div>

//         <div className="border border-gray-600 p-2 text-[10px]">
//           <b>Terms and Conditions:</b>
//           {termsAndCondition.data
//             ?.filter((t) => t.isPurchaseOrder)
//             .map((t) => (
//               <pre key={t.id}>{t.description}</pre>
//             ))}
//         </div>

//         {/* Footer */}
//         <div className="mt-6 text-xs text-right font-bold italic">
//           For {branchData.branchName}
//         </div>
//         <div className="grid grid-cols-4 text-center text-xs font-bold mt-10">
//           <div>Prepared By</div>
//           <div>Verified By</div>
//           <div>Received By</div>
//           <div>Approved By</div>
//         </div>
//       </div>
//     </div>

//   );
// };



export default Form;
