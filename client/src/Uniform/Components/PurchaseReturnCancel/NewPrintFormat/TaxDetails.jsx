import React from 'react'
import useTaxDetailsHook from '../../../../CustomHooks/TaxHookDetails'
import { groupBy } from 'lodash'

const TaxDetail = ({ items, taxTemplateId, discountType, discountValue, taxKey }) => {
    const { isLoading: isTaxHookDetailsLoading, ...taxDetails } =
        useTaxDetailsHook({ poItems: items, taxTypeId: taxTemplateId, discountType, discountValue })
    if (isTaxHookDetailsLoading) return null
    return (
        <>{console.log(items,"items")}
            <tr className='border border-gray-500 text-xs'>
                <td className='tx-table-cell'>
                    CGST@{parseFloat(taxKey)/2}%
                </td>
                <td className='tx-table-cell text-right'>
                    {parseFloat(taxDetails.cgstAmount).toFixed(3)}
                </td>
            </tr>
            <tr className='border border-gray-500 text-xs'>
                <td className='tx-table-cell'>
                    SGST@{parseFloat(taxKey)/2}%
                </td>
                <td className='tx-table-cell text-right'>
                    {parseFloat(taxDetails.sgstAmount).toFixed(3)}
                </td>
            </tr>
        </>
    )
}

const TaxDetails = ({ items, taxTemplateId, discountType, discountValue }) => {
    let taxGroupWise = groupBy(items, "taxPercent")
    return (
        <>{console.log(taxGroupWise,"taxGroupWise")}
            {
                Object.keys(taxGroupWise).map(taxKey =>
                    <TaxDetail taxKey={taxKey} items={taxGroupWise[taxKey]} discountType={discountType} taxTemplateId={taxTemplateId} discountValue={discountValue} />)
            }
        </>
    )
}

export default TaxDetails
