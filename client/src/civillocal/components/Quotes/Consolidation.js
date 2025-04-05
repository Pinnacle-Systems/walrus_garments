import React from 'react'
import { DisabledInput, TextArea, TextInput } from '../../../Inputs'

const Consolidation = ({ totalQty, totalDiscount, setTotalDiscount, transportCost, setTransportCost, findTotalAmount, readOnly, isTotalDiscount, setTransportTax, transportTax, setTermsAndCondition, termsAndCondition }) => {
    return (
        <div className='fixed bottom-5 overflow-auto w-full text-xs bg-gray-50'>
            <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border border-gray-600 p-1 overflow-auto '>
                <legend className='sub-heading'>Consolidation</legend>
                <div className='grid grid-cols-4'>


                    <TextInput name={"Total Discount"} value={totalDiscount} setValue={setTotalDiscount} readOnly={((readOnly) || (!isTotalDiscount)) ? true : false} />
                    <TextInput name={"Transport.Cost"} value={transportCost} setValue={setTransportCost} readOnly={readOnly} />
                    <TextInput name={"Transport.Tax"} value={transportTax} setValue={setTransportTax} readOnly={readOnly} />


                    <DisabledInput name={"Total Amount"} value={parseFloat(findTotalAmount()).toFixed(2)} type={"number"} textClassName='text-right px-2' />
                </div>
                <div className='mt-3 w-2/4 flex gap-x-9 justify-center items-center'>
                    <label className='text-center'>Terms And Condition :</label>
                    <textarea className=" w-3/4 h-24 overflow-auto focus:outline-none border border-gray-500 rounded p-2 text-xs"
                        value={termsAndCondition}
                        disabled={readOnly}
                        onChange={(e) => setTermsAndCondition(e.target.value)}
                    >
                    </textarea>
                </div>

            </fieldset>
        </div>
    )
}

export default Consolidation