import React from "react"
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi"

const FormItems = ( {sampleDetails ,handleInputChange  , readOnly } ) =>  {
    return (
        <>
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[290px] overflow-auto">
                         <div className="flex justify-between items-center mb-2">
                             <h2 className="font-medium text-slate-700">List Of Items</h2>
                             {/* {newSampleEntry  && */}
                             
                                <div className="flex gap-2 items-center">
         
                                 <button
                                     onClick={() => {
                                        //  addNewRow()
                                     }}
                                     className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                                 >
                                     <HiPlus className="w-3 h-3 mr-1" />
                                     Add Item
                                 </button>
                             </div>
                             {/* } */}
                          
         
                         </div>
         
                         <div className="overflow-x-auto">
         
                             <table className="w-full border-collapse table-fixed">
                                 <thead className="bg-gray-200 text-gray-800">
                                     <tr>
                                         <th
                                             className={`w-8 px-4 py-2 text-center font-medium text-[13px] `}
                                         >
                                             S.No
                                         </th>
                                         <th
         
                                             className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                         >
                                             Style
                                         </th>
                                         <th
         
                                             className={`w-48 px-4 py-2 text-center font-medium text-[13px] `}
                                         >
                                             Image
                                         </th>
                                         {/* <th
         
                                             className={`w-40 px-4 py-2 text-center font-medium text-[13px] `}
                                         >
                                             Fab.Content
                                         </th> */}
                                         <th
         
                                             className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                         >
                                             Socks Material
                                         </th>
                                         <th
         
                                             className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                         >
                                             Socks Type
                                         </th>
                                         {/* <th
         
                                             className={`w-14 px-4 py-2 text-center font-medium text-[13px] `}
                                         >
                                             Size
                                         </th> */}
                                         {/* <th
         
                                             className={`w-28 px-4 py-2 text-center font-medium text-[13px] `}
                                         >
                                             Size Measurement
                                         </th> */}
                                         {/* <th
         
                                             className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                         >
                                             Order Qty
                                         </th> */}
                                          {/* <th
         
                                             className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                         >
                                             Sample Qty
                                         </th>
                                             <th
         
                                             className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                                         >
                                             Sample Weight
                                         </th> */}
                                         <th
         
                                             className={`w-8  text-center font-medium text-[13px] `}
                                         >
                                             Actions
                                         </th>
                                         {/* ))} */}
                                     </tr>
                                 </thead>
                                 <tbody>
         
                                     {(sampleDetails ? sampleDetails : [])?.map((item, index) =>  {
                                     return (
                                         <React.Fragment>
                                                        <tr className="border border-blue-gray-200 cursor-pointer " >
                                             <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5 ">{index + 1}</td>
                                             <td className="py-0.5 border border-gray-300 text-[11px] ">
                                                 <select
                                                     // disabled={true}
                                                     onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "styleId") } }}
                                                     className='text-left rounded  h-full w-full'
                                                     value={item?.styleId}
         
                                                     // disabled={(id ? gridEditableIndex !== index : false)}
                                                     onChange={(e) => handleInputChange(e.target.value, index, "styleId")}
                                                     onBlur={(e) => {
                                                         handleInputChange((e.target.value), index, "styleId")
                                                     }}
                                                 >
         
                                                     <option value={""} key={""} >
                                                         select
                                                     </option>
                                                     {/* {styleList?.data?.map(size =>
                                                         <option value={size.id || ""} key={size.id}   >
                                                             {size?.name}
                                                         </option>)} */}
         
                                                 </select>
                                             </td>
         
         
         
                                             <td className=" py-0.5 px-3 border border-gray-300 overflow-x-auto">
                                                 <div className='flex gap-2'>
                                                     {(!readOnly && !item?.filePath) &&
                                                         <input
                                                             title=" "
                                                             type="file"
                                                             // disabled={(id ? gridEditableIndex !== index : false)}
                                                         //   disabled={true}
         
                                                             className='text-left w-full rounded h-full text-xs'
                                                            //  onChange={(e) =>
                                                            //      e.target.files[0] ? handleInputChange(renameFile(e.target.files[0]), index, "filePath") : () => { }
                                                            //  }
                                                         />
         
                                                     }
                                                     {item?.filePath &&
                                                         <>
                                                             <span className="text-xs">{item?.filePath?.name || item?.filePath}</span>
                                                             {/* <button className="text-xs" onClick={() => { openPreview(item?.filePath) }}>
                                                                 {VIEW}
                                                             </button> */}
                                                             {/* {!readOnly &&
                                                                 <button className="text-xs"  onClick={() => { handleInputChange('', index, "filePath") }}>{CLOSE_ICON}</button>
                                                             } */}
                                                         </>
                                                     }
                                                 </div>
                                             </td>
         
                         
         
                                             {/* <td className="w-40 border border-gray-300 text-[11px] py-0.5">
                                                 <select
                                                     // disabled={true}
                                                     onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "comments") } }}
                                                     className='text-left w-full rounded  h-full'
                                                     value={item?.comments}
         
                                                     onChange={(e) => handleInputChange(e.target.value, index, "comments")}
                                                     onBlur={(e) => {
                                                         handleInputChange((e.target.value), index, "comments")
                                                     }}
                                                 >
         
                                                     <option>
                                                         select
                                                     </option>
                                                     {fiberContent?.data?.map(size =>
                                                         <option value={size.id || ""} key={size.id}   >
                                                             {size?.fabricName}
                                                         </option>)}
         
                                                 </select>
                                             </td> */}
         
         
         
                                    
                                             <td className="w-40 border border-gray-300 text-[11px] py-0.5">
                                                 <select
                                                     //  disabled={true}
                                                     onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "socksMaterialId") } }}
                                                     className='text-left w-full rounded  h-full'
                                                     value={item?.socksMaterialId}
         
                                                     onChange={(e) => handleInputChange(e.target.value, index, "socksMaterialId")}
                                                     onBlur={(e) => {
                                                         handleInputChange((e.target.value), index, "socksMaterialId")
                                                     }}
                                                 >
         
                                                     <option>
                                                         select
                                                     </option>
                                                     {/* {socksMaterialData?.data?.map(size =>
                                                         <option value={size.id || ""} key={size.id}   >
                                                             {size?.name}
                                                         </option>)} */}
         
                                                 </select>
                                             </td>
                                             <td className=" w-40  border border-gray-300 text-[11px] py-0.5">
                                                 <select
                                                     // disabled={true}
                                                     onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "socksTypeId") } }}
                                                     className='text-left w-full rounded h-full'
                                                     value={item?.socksTypeId}
         
                                                     onChange={(e) => handleInputChange(e.target.value, index, "socksTypeId")}
                                                     onBlur={(e) => {
                                                         handleInputChange((e.target.value), index, "socksTypeId")
                                                     }}
                                                 >
         
                                                     <option>
                                                         select
                                                     </option>
                                                     {/* {socksTypeData?.data?.map(size =>
                                                         <option value={size.id || ""} key={size.id}   >
                                                             {size?.name}
                                                         </option>)} */}
         
                                                 </select>
                                             </td>
                          
         
         
         {/* 
         
                                             <td className="w-40  border-blue-gray-200 text-[11px] border border-gray-300 py-0.5">
                                                 <select
                                                     // disabled={true}
                                                     onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "sizeId") } }}
                                                     className='text-left w-full rounded h-full'
                                                     value={item?.sizeId}
         
                                                     onChange={(e) => handleInputChange(e.target.value, index, "sizeId")}
                                                     onBlur={(e) => {
                                                         handleInputChange((e.target.value), index, "sizeId")
                                                     }}
                                                 >
         
                                                     <option>
                                                         select
                                                     </option>
                                                     {sizeList?.data?.map(size =>
                                                         <option value={size.id || ""} key={size.id}   >
                                                             {size?.name}
                                                         </option>)}
         
                                                 </select>
                                             </td> */}
                                             {/* <td className="w-40 py-0.5 border border-gray-300 text-[11px] ">
                                                 <input className='text-right w-full h-full py-1.5'
                                                     type="text"
                                                     // disabled={true}
                                                     value={item?.sizeMeasurement}
                                                     onChange={(e) => { handleInputChange(e.target.value, index, "sizeMeasurement") }}
                                                     onFocus={(e) => { e.target.select() }} min={0}
                                                 />
         
                                             </td> */}
         {/* 
         
                                             <td className="w-40  py-0.5 border-blue-gray-200 text-[11px] text-right border border-gray-300">
                                                 <input className='text-right w-full h-full py-1.5'
                                                     type="number"
                                                     // disabled={true}
                                                     value={item?.qty}
                                                     onChange={(e) => { handleInputChange(e.target.value, index, "qty") }} onFocus={(e) => { e.target.select() }} min={0}
                                                 />
         
                                             </td> */}
         
                                   {/* <td className="w-40  py-0.5 border-blue-gray-200 text-[11px] text-right border border-gray-300">
                                                 <input className='text-right w-full h-full py-1.5'
                                                     type="number"
                                                     disabled={readOnly}
                                                     value={item?.sampleQty}
                                                     onChange={(e) => { handleInputChange(e.target.value, index, "sampleQty") }} onFocus={(e) => { e.target.select() }} min={0}
                                                 />
         
                                             </td> */}
                                          {/* <td className="w-40  py-0.5 border-blue-gray-200 text-[11px] text-right border border-gray-300">
                                                 <input className='text-right w-full h-full py-1.5'
                                                     type="number"
                                                     disabled={readOnly}
                                                     value={item?.sampleWeight}
                                                     onChange={(e) => { handleInputChange(e.target.value, index, "sampleWeight") }} onFocus={(e) => { e.target.select() }} min={0}
                                                 />
         
                                             </td> */}
         
         
                                             <td className="w-8  py-1 text-center">
                                                 <div className="flex space-x-2  justify-end">
         
                                                     <button
                                                        //  onClick={() => handleView(index)}
                                                        //  onMouseEnter={() => setTooltipVisible(true)}
                                                        //  onMouseLeave={() => setTooltipVisible(false)}
                                                         className="text-blue-800 flex items-center  bg-blue-50 rounded"
                                                     >
                                                         👁 <span className="text-xs"></span>
                                                     </button>
                                                     <span className="tooltip-text">View</span>
                                                        <>
                                                 
                                                     <button
                                                        //  onClick={() => handleEdit(index)}
                                                         className="text-green-600 hover:text-green-800 bg-green-50 py-1 rounded text-xs flex items-center"
                                                     >
                                                         <HiPencil className="w-4 h-4" />
         
                                                     </button>
                                                     <span className="tooltip-text">Edit</span>
                                                     <button
                                                        //  onClick={() => deleteRow(index)}
                                                         className="text-red-600 hover:text-red-800 bg-red-50  py-1 rounded text-xs flex items-center"
                                                     >
                                                         <HiTrash className="w-4 h-4" />
         
                                                     </button>
                                                     <span className="tooltip-text">Delete</span>
                                                            </>
                                                        
         
                                                     {/* {tooltipVisible && (
                                                         <div className="absolute  z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
                                                             <div className="flex items-start">
                                                                 <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                                                                 <span>View</span>
                                                             </div>
                                                             <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
                                                         </div>
                                                     )} */}
                                                 </div>
                                             </td>
                                         </tr>
                                               {/* <SizeDetailsSubGrid
                                               gridIndex={index}
                                               id={id}
                                               item={item}
                                               orderId={orderId}
                                               sampleDetails={sampleDetails} 
                                               setSampleDetails={setSampleDetails}
                                               readOnly={readOnly}
                                             //   styleData={styleData?.data || []}
                                               sizeList={sizeList}
                                               handleAdd={handleAdd}
                                             //   singleStyleData={singleStyleData}
                                               handleInputChange={handleInputChange}
                                               index={index}
                                 
                                             /> */}
                                         </React.Fragment>
                              
                                
                                     
                                
                                          )
                                     })}
                                    
                                 </tbody>
                             </table>
         
         
                         </div>
                     </div>
        </>
    )
}

export default FormItems;