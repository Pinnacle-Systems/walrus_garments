import React from 'react'
import { discountTypes } from '../../../Utils/DropdownData';
import { Loader } from '../../../Basic/components';
import useTaxDetailsHook from '../../../CustomHooks/TaxHookDetails';
const numberToText = require('number-to-text')


const PoSummary = ({ poItems, readOnly, taxTypeId, isSupplierOutside, discountType, setDiscountType, discountValue, setDiscountValue, remarks, setRemarks, totals }) => {



    console.log(poItems, "poItems", discountType, discountValue);


    function calculateTaxWithHSNBreakupAndInsertIntoPoItems(poItems, {
        isSupplierOutside = false,

        roundTo = 2
    } = {}) {

        const result = {
            gross: 0,
            itemDiscount: 0,
            overallDiscount: 0,
            taxable: 0,
            roundOff: 0,
            net: 0,
            slabBreakup: [],
            hsnBreakup: {}
        };

        const slabMap = {};
        const hsnMap = {};

        // ---- Step 1: Base item calc ----
        poItems.forEach(item => {
            const qty = Number(item.qty) || 0;
            const price = Number(item.price) || 0;
            const taxPct = Number(item.taxPercent) || 0;
            const discountVal = Number(item.discountValue) || 0;
            const dType = item.discountType || "Flat";
            const hsn = item.hsn || "NA";

            const gross = qty * price;

            const itemDiscount =
                dType === "Flat"
                    ? discountVal
                    : (gross * discountVal) / 100;

            const taxableBeforeOverall = gross - itemDiscount;

            // 👉 Attach base values directly into poItems
            item._gross = gross;
            item._itemDiscount = itemDiscount;
            item._taxableBeforeOverall = taxableBeforeOverall;
            item._hsn = hsn;
            item._taxPct = taxPct;
        });

        const totalTaxableBeforeOverall = poItems.reduce(
            (s, i) => s + i._taxableBeforeOverall,
            0
        );

        // ---- Step 2: Overall discount ----
        let overallDiscount = 0;
        if (discountType == "Flat") {
            overallDiscount = discountValue;
        } else {
            overallDiscount = (totalTaxableBeforeOverall * discountValue) / 100;
        }

        // ---- Step 3: Apply overall + GST per item ----
        poItems.forEach(item => {
            const ratio =
                totalTaxableBeforeOverall === 0
                    ? 0
                    : item._taxableBeforeOverall / totalTaxableBeforeOverall;
                    

            const overallShare = overallDiscount * ratio;
            const finalTaxable = item._taxableBeforeOverall - overallShare;


                                console.log(totalTaxableBeforeOverall,'totalTaxableBeforeOverall',overallShare,'overallShare')


            let cgst = 0, sgst = 0, igst = 0;
            const taxType = item.taxType || (isSupplierOutside ? "IGST" : "CGST_SGST");

            if (taxType === "IGST") {
                igst = (finalTaxable * item._taxPct) / 100;
            } else {
                const half = item._taxPct / 2;
                cgst = (finalTaxable * half) / 100;
                sgst = (finalTaxable * half) / 100;
            }

            const net = finalTaxable + cgst + sgst + igst;

            // 👉 INSERT totals INTO poItems
            item.totals = {
                gross: +item._gross.toFixed(roundTo),
                itemDiscount: +item._itemDiscount.toFixed(roundTo),
                overallDiscountShare: +overallShare.toFixed(roundTo),
                taxable: +finalTaxable.toFixed(roundTo),
                cgst: +cgst.toFixed(roundTo),
                sgst: +sgst.toFixed(roundTo),
                igst: +igst.toFixed(roundTo),
                net: +net.toFixed(roundTo)
            };

            // ---- Global + slab + hsn ----
            result.gross += item._gross;
            result.itemDiscount += item._itemDiscount;
            result.overallDiscount += overallShare;
            result.taxable += finalTaxable;

            if (taxType === "IGST") {
                const key = `IGST_${item._taxPct}`;
                slabMap[key] = (slabMap[key] || 0) + igst;

                hsnMap[item._hsn] = hsnMap[item._hsn] || {};
                hsnMap[item._hsn][key] = (hsnMap[item._hsn][key] || 0) + igst;
            } else {
                const half = item._taxPct / 2;
                const cgstKey = `CGST_${half}`;
                const sgstKey = `SGST_${half}`;

                slabMap[cgstKey] = (slabMap[cgstKey] || 0) + cgst;
                slabMap[sgstKey] = (slabMap[sgstKey] || 0) + sgst;

                hsnMap[item._hsn] = hsnMap[item._hsn] || {};
                hsnMap[item._hsn][cgstKey] = (hsnMap[item._hsn][cgstKey] || 0) + cgst;
                hsnMap[item._hsn][sgstKey] = (hsnMap[item._hsn][sgstKey] || 0) + sgst;
            }
        });

        // ---- Step 4: Build breakups ----
        result.slabBreakup = Object.entries(slabMap).map(([key, amt]) => {
            const [type, pct] = key.split("_");
            return { tax: `${type} ${pct}%`, amount: +amt.toFixed(roundTo) };
        });

        Object.keys(hsnMap).forEach(hsn => {
            result.hsnBreakup[hsn] = Object.entries(hsnMap[hsn]).map(([key, amt]) => {
                const [type, pct] = key.split("_");
                return { tax: `${type} ${pct}%`, amount: +amt.toFixed(roundTo) };
            });
        });

        const totalTax = result.slabBreakup.reduce((s, b) => s + b.amount, 0);
        const totalBeforeRound = result.taxable + totalTax;

        const roundedNet = Math.round(totalBeforeRound);
        result.roundOff = +(roundedNet - totalBeforeRound).toFixed(roundTo);
        result.net = roundedNet;

        ["gross", "itemDiscount", "overallDiscount", "taxable"].forEach(k => {
            result[k] = +result[k].toFixed(roundTo);
        });

        return result;
    }



    // const totals  = calculateTaxWithHSNBreakupAndInsertIntoPoItems(poItems?.filter(i => i.id), { isSupplierOutside: false });



    console.log(totals, "totals")


    return (
        <div className={`bg-gray-200 rounded z-50 w-[700px] `}>
            <table className="border border-gray-500 w-full text-xs text-start">
                <thead className="border border-gray-500">
                    <tr>
                        <th className="w-36 border border-gray-500">Tax Name</th>
                        <th className="w-28 border border-gray-500">Value</th>
                        <th className="w-28 border border-gray-500">Amount</th>
                    </tr>
                </thead>
                <tbody>

                    <tr>
                        <td className="border border-gray-500 py-1.5">Gross Amount</td>
                        <td className="border border-gray-500 text-right" colSpan={2}
                        >
                            {(totals?.gross).toFixed(2)}
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-500">Discount Type</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <select autoFocus name='type' disabled={readOnly} className='text-left w-full rounded h-8'
                                value={discountType}
                                onChange={(e) => { setDiscountType(e.target.value) }}
                            >
                                <option value={""}>
                                    Select
                                </option>
                                {discountTypes.map((option, index) => <option key={index} value={option.value} >
                                    {option.show}
                                </option>)}
                            </select>
                        </td>
                    </tr>

                    <tr className='h-7'>
                        <td className="border border-gray-500">Discount</td>
                        <td className="border border-gray-500"
                        >
                            <input type="text" name='value' disabled={readOnly || !discountType} className='h-7 w-full' value={discountValue}
                                onKeyDown={e => {
                                    if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                    if (e.key === "Delete") { setDiscountValue(0) }
                                }}
                                min={"0"}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => { setDiscountValue(e.target.value) }}
                            />
                        </td>
                        <td className="border border-gray-500"
                        >
                            <input disabled type="text" name='value' className='h-7 w-full text-right'
                            //  value={}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-500 py-1.5">Taxable Amount</td>
                        <td className="border border-gray-500 text-right" colSpan={2}
                        >
                            {(totals?.taxable).toFixed(2)}
                        </td>
                    </tr>
                    {totals?.slabBreakup?.map(i => (

                        <tr className='h-7'>

                            <td className="border border-gray-500">{i.tax} </td>
                            <td className="border border-gray-500" colSpan={2}
                            >
                                <input disabled type="text" name='value' className='h-7 w-full text-right'
                                    value={(i.amount).toFixed(2)}
                                />
                            </td>
                        </tr>


                    ))}
                    <tr className='h-7'>
                        <td className="border border-gray-500">IGST Amount</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <input disabled type="text" name='value' className='h-7 w-full text-right'
                            value={
                                0
                            }
                            />
                        </td>
                    </tr>
                    <tr className='h-7'>
                        <td className="border border-gray-500">Net Amount</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <input disabled type="text" name='value' className='h-7 w-full text-right'
                                value={
                                    (totals?.net).toFixed(2)
                                }
                            />
                        </td>
                    </tr>
                    <tr className='h-7'>
                        <td className="border border-gray-500">Round Off</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <input disabled type="text" name='value' className='h-7 w-full text-right'
                                value={
                                    parseFloat(totals?.roundOff).toFixed(2)
                                }
                            />
                        </td>
                    </tr>
                    <tr className='h-7'>
                        <td className="border border-gray-500">Amount in Words</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <input disabled type="text" name='value' className='h-7 w-full text-right'
                                value={
                                    numberToText?.convertToText(totals?.net, { language: "en-in" }) + " Only"
                                }
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default PoSummary;



// import React, { useEffect } from "react";
// import { discountTypes } from "../../../Utils/DropdownData";
// import { numberToWords } from "number-to-words";
// import { groupBy } from "lodash";
// const PoSummary = ({
//   poItems = [],
//   readOnly,
//   discountType,
//   setDiscountType,
//   discountValue,
//   setDiscountValue,
//   isNewVersion,
//   quoteVersion,
// }) => {
//   const visibleItems = poItems.filter((row) =>
//     isNewVersion
//       ? row.quoteVersion === "New"
//       : parseInt(row.quoteVersion) === parseInt(quoteVersion),
//   );

//   const totalAmount = visibleItems.reduce(
//     (sum, row) => sum + (Number(row.taxable) || 0),
//     0,
//   );

//   // 2️⃣ DISCOUNT
//   const discountValueNum = Number(discountValue) || 0;

//   let discountAmount = 0;
//   if (discountType === "Flat") {
//     discountAmount = discountValueNum;
//   } else if (discountType === "Percentage") {
//     discountAmount = (totalAmount * discountValueNum) / 100;
//   }

//   // 3️⃣ NET & ROUNDING

//   const taxGroupWise = groupBy(visibleItems, "taxPercent");
//   const displayTaxRows = Object.entries(taxGroupWise)
//     .filter(([taxPercent]) => Number(taxPercent) > 0) // ignore null / 0
//     .map(([taxPercent, items]) => {
//       const taxable = items.reduce((sum, item) => sum + item.taxable, 0);

//       const taxRate = Number(taxPercent);
//       const halfTax = taxRate / 2;

//       return {
//         taxPercent: taxRate,
//         halfTax,
//         taxable,
//         sgstAmount: (taxable * halfTax) / 100,
//         cgstAmount: (taxable * halfTax) / 100,
//       };
//     });

//   const totalTaxAmount = displayTaxRows.reduce(
//     (sum, tax) => sum + tax.sgstAmount + tax.cgstAmount,
//     0,
//   );
//   const grossAmount = totalAmount - discountAmount;

//   const netValue = grossAmount + totalTaxAmount;

//   const netAmount = Math.round(netValue);
//   const roundoff = netAmount - netValue;

//   // =================== UI ===================
//   return (
//     <div className="bg-gray-200 rounded w-[500px]">
//       <table className="border border-gray-500 w-full text-xs table-fixed">
//         <thead>
//           <tr className="bg-gray-300">
//             <th className="border border-gray-500 p-1">Description</th>
//             <th className="border border-gray-500 p-1">Value</th>
//             <th className="border border-gray-500 p-1">Amount</th>
//           </tr>
//         </thead>

//         <tbody>
//           {/* DISCOUNT TYPE */}
//           <tr>
//             <td className="border border-gray-500">Discount Type</td>
//             <td colSpan={2} className="border border-gray-500">
//               <select
//                 disabled={readOnly}
//                 value={discountType}
//                 className="w-full h-8"
//                 onChange={(e) => setDiscountType(e.target.value)}
//                 autoFocus={true}
//               >
//                 {discountTypes.map((d, i) => (
//                   <option key={i} value={d.value}>
//                     {d.show}
//                   </option>
//                 ))}
//               </select>
//             </td>
//           </tr>

//           {/* DISCOUNT VALUE */}
//           <tr>
//             <td className="border border-gray-500">Discount</td>
//             <td colSpan={2} className="border border-gray-500">
//               <input
//                 type="number"
//                 disabled={readOnly}
//                 className="w-full h-7 text-right"
//                 value={discountValue}
//                 onChange={(e) => setDiscountValue(e.target.value)}
//               />
//             </td>
//           </tr>

//           {/* GROSS */}
//           <tr>
//             <td className="border border-gray-500 font-semibold">Total</td>
//             <td />
//             <td className="border border-gray-500 text-right">
//               {totalAmount.toFixed(2)}
//             </td>
//           </tr>
//           <tr>
//             <td className="border border-gray-500 font-semibold">
//               Discount Amount
//             </td>
//             <td />
//             <td className="border border-gray-500 text-right">
//               {discountAmount.toFixed(2)}
//             </td>
//           </tr>
//           <tr>
//             <td className="border border-gray-500 font-semibold">Gross</td>
//             <td />
//             <td className="border border-gray-500 text-right">
//               {grossAmount.toFixed(2)}
//             </td>
//           </tr>

//           {/* DISPLAY ONLY – NO CALC IMPACT */}
//           {displayTaxRows.map((tax, index) => (
//             <React.Fragment key={index}>
//               <tr>
//                 <td className="border border-gray-500 font-semibold">SGST</td>
//                 <td className="border border-gray-500 text-right">
//                   {tax.halfTax}
//                 </td>
//                 <td className="border border-gray-500 text-right">
//                   {tax.sgstAmount.toFixed(2)}
//                 </td>
//               </tr>

//               <tr>
//                 <td className="border border-gray-500 font-semibold">CGST</td>
//                 <td className="border border-gray-500 text-right">
//                   {tax.halfTax}
//                 </td>
//                 <td className="border border-gray-500 text-right">
//                   {tax.cgstAmount.toFixed(2)}
//                 </td>
//               </tr>
//             </React.Fragment>
//           ))}

//           {/* DISCOUNT AMOUNT */}

//           {/* NET */}
//           <tr>
//             <td className="border border-gray-500 font-semibold">Net</td>
//             <td />
//             <td className="border border-gray-500 text-right">
//               {netAmount.toFixed(2)}
//             </td>
//           </tr>

//           {/* ROUNDOFF */}
//           <tr>
//             <td className="border border-gray-500 font-semibold">Roundoff</td>
//             <td />
//             <td className="border border-gray-500 text-right">
//               {roundoff.toFixed(2)}
//             </td>
//           </tr>

//           {/* AMOUNT IN WORDS */}
//           <tr>
//             <td className="border border-gray-500 font-semibold">
//               Amount in Words
//             </td>
//             <td colSpan={2} className="border border-gray-500 text-right">
//               {numberToWords.toWords(netAmount)} Only
//             </td>
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default PoSummary;