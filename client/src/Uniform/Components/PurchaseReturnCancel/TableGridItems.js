import React from 'react'
import { TextArea, TextInput } from '../../../Inputs'
import { findFromList } from '../../../Utils/helper'



export default function TableGridItems({ removeLotNo, addNewLotNo, handleInputChangeLotNo, styleList, id, gridEditableIndex, readOnly, handleInputChange, index, Yarnlist, machineList, socksMaterialData, colorlist, socksTypeData, orderDetails }) {
    const item = orderDetails[index]
    return (

        <>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">

                <div className="space-y-1 bg-[#f1f1f0]">

                    <div className="space-y-2">
                        <div className="rounded-xl border border-gray-100 bg-[#f1f1f0]  p-1 shadow-xs ">
                            <h3 className="mb-2 mt-2 text-sm font-semibold text-gray-900">
                                {findFromList(item["styleId"], styleList, "name")}
                            </h3>
                            <div className="grid grid-cols-1 gap-x-2  md:grid-cols-2 lg:grid-cols-3 mt-1">

                                <TextInput name="Yarn" type="text" value={item["yarnNeedleId"]} />
                                <TextInput name="Machine" type="text" value={item["machineId"]} required={true} readOnly={readOnly} />
                                <TextInput name="Description" type="text" value={item["description"]} required={true} readOnly={readOnly} />
                                <TextInput name=" Leg.Color" type="text" value={item["legcolorId"]} required={true} readOnly={readOnly} />
                                <TextInput name="Foot.Color" type="text" value={item["footcolorId"]} required={true} readOnly={readOnly} />
                                <TextInput name=" Stripes.Color" type="text" value={item["stripecolorId"]} required={true} readOnly={readOnly} />
                                <TextInput name=" No.Of.Stripes" type="text" value={item["noOfStripes"]} required={true} readOnly={readOnly} />

                            </div>
                        </div>
                    </div>

                </div>
            </div>






        </>
    )
}

