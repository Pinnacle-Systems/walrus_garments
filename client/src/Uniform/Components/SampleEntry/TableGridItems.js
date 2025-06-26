import React from 'react'
import { TextArea, TextInput } from '../../../Inputs'
import { findFromList } from '../../../Utils/helper'



export default function TableGridItems({ styleList, id, gridEditableIndex, readOnly, handleInputChange, index, Yarnlist, machineList, socksMaterialData, colorlist, socksTypeData, orderDetails }) {
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

                                <TextInput name="Yarn" type="text" value={item["yarnNeedleId"]} disabled={true} />
                                <TextInput name="Machine" type="text" value={item["machineId"]} required={true} readOnly={readOnly} disabled={true} />
                                <TextInput name="Description" type="text" value={item["description"]} required={true} readOnly={readOnly}  disabled={true}/>
                                <TextInput name=" Leg.Color" type="text" value={item["legcolorId"]} required={true} readOnly={readOnly}  disabled={true}/>
                                <TextInput name="Foot.Color" type="text" value={item["footcolorId"]} required={true} readOnly={readOnly} disabled={true}/>
                                <TextInput name=" Stripes.Color" type="text" value={item["stripecolorId"]} required={true} readOnly={readOnly}  disabled={true}/>
                                <TextInput name=" No.Of.Stripes" type="text" value={item["noOfStripes"]} required={true} readOnly={readOnly}  disabled={true}/>

                            </div>
                        </div>
                    </div>

                </div>
            </div>





            {/* <div className="overflow-x-auto">

                <table className="w-full border-collapse table-fixed">
                    <thead className="bg-gray-200 text-gray-800">
                        <tr>
                            <th

                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Yarn
                            </th>
                            <th

                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Machine
                            </th>
                            <th

                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Description
                            </th>

                            <th

                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Leg.Color
                            </th>
                            <th

                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Foot.Color
                            </th>
                            <th

                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                Stripes.Color
                            </th>

                            <th

                                className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                                No.Of.Stripes
                            </th>

                        </tr>
                    </thead>
                    <tbody>


                        <tr className="border border-blue-gray-200 cursor-pointer " >
                            <td className="border border-gray-300 text-[11px] ">
                                <select
                                    disabled={(id ? gridEditableIndex !== index : false)}
                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "yarnNeedleId") } }}
                                    className='text-left w-full rounded py-1 h-full'
                                    value={item["yarnNeedleId"]}

                                    onChange={(e) => handleInputChange(e.target.value, index, "yarnNeedleId")}
                                    onBlur={(e) => {
                                        handleInputChange((e.target.value), index, "yarnNeedleId")
                                    }}
                                >

                                    <option>
                                        select
                                    </option>
                                    {Yarnlist?.data?.map(size =>
                                        <option value={size.id || ""} key={size.id}   >
                                            {size?.name}
                                        </option>)}

                                </select>
                            </td>

                            <td className=" border border-gray-300 text-[11px] ">
                                <select
                                    disabled={(id ? gridEditableIndex !== index : false)}
                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "machineId") } }}
                                    className='text-left w-full rounded py-1 h-full'
                                    // value={item?.machineId}
                                    value={item["machineId"]}
                                    onChange={(e) => handleInputChange(e.target.value, index, "machineId")}
                                    onBlur={(e) => {
                                        handleInputChange((e.target.value), index, "machineId")
                                    }}
                                >

                                    <option>
                                        select
                                    </option>
                                    {machineList?.data?.map(size =>
                                        <option value={size.id || ""} key={size.id}   >
                                            {size?.name}
                                        </option>)}

                                </select>
                            </td>



                            <td className="table-data w-40 text-left px-1 py-1 text-xs border border-gray-300">
                                <textarea className=" w-full overflow-auto focus:outline-none  rounded text-xs"
                                    // value={item.description}
                                    value={item["description"]}
                                    onChange={(e) => handleInputChange(e.target.value, index, "description")}
                                    readOnly={(id ? gridEditableIndex !== index : false)}
                                >
                                </textarea>

                            </td>
                            
                            <td className="w-40  border border-gray-300 text-[11px] ">
                                <select
                                    disabled={(id ? gridEditableIndex !== index : false)}
                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "legcolorId") } }}
                                    className='text-left w-full rounded py-1 h-full'
                                   
                                    value={item["legcolorId"]}
                                    onChange={(e) => handleInputChange(e.target.value, index, "legcolorId")}
                                    onBlur={(e) => {
                                        handleInputChange((e.target.value), index, "legcolorId")
                                    }}
                                >

                                    <option>
                                        select
                                    </option>
                                    {colorlist?.data?.map(color =>
                                        <option value={color.id || ""} key={color.id}   >
                                            {color?.name}
                                        </option>)}
                                </select>
                            </td>
                            <td className="w-40  border border-gray-300 text-[11px] ">
                                <select
                                    disabled={(id ? gridEditableIndex !== index : false)}
                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "footcolorId") } }}
                                    className='text-left w-full rounded py-1 h-full'
                              
                                    value={item["footcolorId"]}
                                    onChange={(e) => handleInputChange(e.target.value, index, "footcolorId")}
                                    onBlur={(e) => {
                                        handleInputChange((e.target.value), index, "footcolorId")
                                    }}
                                >

                                    <option>
                                        select
                                    </option>
                                    {colorlist?.data?.map(color =>
                                        <option value={color.id || ""} key={color.id}   >
                                            {color?.name}
                                        </option>)}
                                </select>
                            </td>
                            <td className=" w-40 border border-gray-300 text-[11px] ">
                                <select
                                    disabled={(id ? gridEditableIndex !== index : false)}
                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "stripecolorId") } }}
                                    className='text-left w-full rounded py-1 h-full'
                               
                                    value={item["stripecolorId"]}
                                    onChange={(e) => handleInputChange(e.target.value, index, "stripecolorId")}
                                    onBlur={(e) => {
                                        handleInputChange((e.target.value), index, "stripecolorId")
                                    }}
                                >

                                    <option>
                                        select
                                    </option>
                                    {colorlist?.data?.map(color =>
                                        <option value={color.id || ""} key={color.id}   >
                                            {color?.name}
                                        </option>)}
                                </select>
                            </td>
                            <td className="w-40  border border-gray-300 text-[11px] ">
                                <input className='text-right w-full h-full p-1.5 border-gray-200 '
                                    type="number"
                                    readOnly={(id ? gridEditableIndex !== index : false)}
                                  
                                    value={item["noOfStripes"]}
                                    onChange={(e) => { handleInputChange(e.target.value, index, "noOfStripes") }} onFocus={(e) => { e.target.select() }} min={0}
                                />

                            </td>

                        </tr>

                    </tbody>
                </table>


            </div> */}
        </>
    )
}

