import React, { useEffect, useState } from 'react'
import {
    Modal,
    ToggleButton,
    DateInput,
    DropdownInput,
    TextInput,
    FancyCheckBox,
    MultiSelectDropdown,
    CheckBox,
    RadioButton,
    TextArea,
    DisabledInput,
} from "../../../Inputs";
import MastersForm from '../MastersForm/MastersForm';
import { findFromList } from '../../../Utils/helper';
import { useAddPartyMutation, useUpdatePartyMutation } from '../../../redux/services/PartyMasterService';
import { toast } from "react-toastify";
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi';
import { Check } from 'lucide-react';
import { useGetbranchTypeQuery } from '../../../redux/uniformService/BranchTypeMaster';

const AddBranch = ({ partyData, partyId,
    branchType,setBranchType,branchInfo,handleInputbranch,id,setBranchInfo , deleteBranch,
    branchEmail, setBranchEmail, setBranchAddress, branchName, setBranchName
    , setBranchCode, branchAddress, branchContact, setBranchContact, setBranchModelOpen, 
    childRecord, saveExitData, setReadOnly, branchTypeData, readOnly,
    partyBranch, name
}) => {
    const MODEL = " Branch Info";
    const [addData] = useAddPartyMutation();
    const [updateData] = useUpdatePartyMutation();

    

    const data = {
        branchInfo, partyId, isForPartyBranch: true
    };

    console.log(branchInfo,"branchInfo")

    // console.log(partyData,"partyId",partyId)

    const onNew = () => {
        setBranchAddress();
        setBranchCode("");
        setBranchContact("")
        setBranchEmail("");
        setBranchName("");
        setBranchModelOpen(false)
    };

    const handleSubmitCustom = async (callback, data, text, exit = false) => {
        try {
            let returnData;
            if (text === "Updated") {
                returnData = await callback({ id: partyId, body: data }).unwrap();
            } else {
                returnData = await callback(data).unwrap();
            }
            toast.success(text + "Successfully");

            onNew();

        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Something went wrong during submission");
        }
    };


    const validateData = (data) => {

        console.log(data, "datata")
        if (data.branchAddress && data?.branchCode && data?.branchContact  && data?.branchName) {


            return true

        }
        return false
    };

    const saveData = () => {

            // if (!validateData(data)) {
            //     toast.error("Please fill all required fields...!", {
            //         position: "top-center",
            //     });
            //     return;
            // }
        if (partyId) {
            handleSubmitCustom(updateData, data, "Updated");
        } else {

            handleSubmitCustom(addData, data, "Added");
        }
    };

    const pushPartyBranch = () => {
        // const newBranch = {
        //     branchName: branchName,
        //     branchCode: branchCode,
        //     branchEmail: branchEmail,
        //     branchContact: branchContact,
        //     branchAddress: branchAddress
        // };

        // setPartyBranch(prev => {
        //     const newBlend = structuredClone(prev);
        //     newBlend[0]["branchName"] = branchName;
        //     newBlend[0]["branchCode"] = branchCode;
        //     newBlend[0]["branchEmail"] = branchEmail;
        //     newBlend[0]["branchContact"] = branchContact;
        //     newBlend[0]["branchAddress"] = branchAddress;
        //     return newBlend
        // }
        // );
        // setPartyBranch(prev => [...prev, newBranch])

    }


    useEffect(() => {
        if (branchInfo?.length >= 1) return
        setBranchInfo(prev => {
            let newArray = Array.from({ length: 1 - prev.length }, () => {
                return {
                        address : "" , branchName : ''
                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setBranchInfo, branchInfo])

  function addNewRow() {

    setBranchInfo((prev) => [...prev, { address: "" }]);
  }
 

    return (
        <>
      
           
          <div className="h-full flex flex-col bg-[f1f1f0]">
            {/* <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white"> */}
              {/* <div className="flex items-center gap-2">
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  {id ? (!readOnly ? "Edit Branch Master" : "Branch Master") : "Add New Branch"}
                </h2>
              </div> */}
                
              
              <div className="flex gap-2">
                {/* <div>
                  {readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                    
                      }}
                      className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                    >
                      Cancel
                    </button>
                  )}
                </div> */}
{/*                 
                <div className="flex gap-2">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => setBranchModelOpen(false)}
                      className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"
                    >
             
                      Done
                    </button>
                  )}
                </div> */}
              </div>
            {/* </div> */}

            {/* <div className="flex-1 overflow-auto p-3">
              <div className="grid grid-cols-1  gap-3  h-full">
                <div className="lg:col-span- space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                             <div className="overflow-hidden rounded-md ">
                              <div className="flex justify-between items-center mb-2">
                                        <div className="flex gap-2 items-center">
                    
                                            <button
                                                onClick={() => {
                                                    addNewRow()
                                                }}
                                                className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                                            >
                                                <HiPlus className="w-3 h-3 mr-1" />
                                                Add Item
                                            </button>
                                        </div>
                    
                                    </div>
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 ">S.no</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-56">BranchName</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">BranchType</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">BranchCode</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">branchAddress</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">branchContact</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                                </tr>

                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-[#f1f1f0] ">
                                {(branchInfo || []).map((item, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-3 py-1.5 text-xs text-gray-600">{index + 1}</td>
                                    <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className=" w-72 rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.branchName}
                                        disabled={readOnly}
                                        onChange={(e) => handleInputbranch(e.target.value, index, "branchName")}
                                      />
                                    </td>
                                    <td className="px-3 py-1.5">
                                        <select
                                            onKeyDown={e => { if (e.key === "Delete") { handleInputbranch("", index, "branchType") } }}
                                        className=" rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                            value={item?.branchType}

                                            onChange={(e) => handleInputbranch(e.target.value, index, "branchType")}
                                            onBlur={(e) => {
                                                handleInputbranch((e.target.value), index, "branchType")
                                            }}
                                        >

                                            <option>
                                                select
                                            </option>
                                            {branchTypeData?.data?.map(size =>
                                                <option value={size.id || ""} key={size.id}   >
                                                    {size?.name}
                                                </option>)}

                                        </select>
                                    </td>
                                       <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className=" rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.branchCode}
                                        disabled={readOnly}
                                        onChange={(e) => handleInputbranch(e.target.value, index, "branchCode")}
                                      />
                                    </td>   <td className="px-3 py-1.5">
                                    

                                      <textarea className='w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
                                                    focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                                                    transition-all duration-150 shadow-sm resize-none' 
                                                    type="text"
                                        value={item?.branchAddress}
                                        disabled={readOnly}
                                        onChange={(e) => handleInputbranch(e.target.value, index, "branchAddress")}
          >
                                        
                                      </textarea>
                                    </td> 
                                      <td className="px-3 py-1.5">
                                      <input
                                        type="text"
                                        className="w-24 rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.branchContact }
                                        disabled={readOnly}
                                        onChange={(e) => handleInputbranch(e.target.value, index, "branchContact")}
                                      />
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-center">
                                      <button
                                        onClick={() => deleteBranch(index , item?.id )}
                                        disabled={readOnly}
                                        className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400"
                                      >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {(!branchInfo || branchInfo.length === 0) && (
                                  <tr>
                                    <td colSpan="3" className="px-3 py-3 text-center">
                                      <div className="flex flex-col items-center justify-center space-y-1 text-gray-400">

                                        <p className="text-xs">No addresses found</p>

                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                   
                  </div>

                
                </div>


                      


                     

                     


              </div>
            </div> */}
     <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[470px] overflow-auto">
                <div className="flex justify-between items-center mb-2">
                   <h2 className="font-bold text-xs text-slate-700"> <span className="font-bold text-lg text-slate-700">  Party : </span>   {name}</h2>
                    <div className="flex gap-2 items-center">

                        <button
                            onClick={() => {
                                addNewRow()
                            }}
                            className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                        >
                            <HiPlus className="w-3 h-3 mr-1" />
                            Add Item
                        </button>
                    </div>

                </div>
  <div className="overflow-x-auto">

                    <table className="w-full border-collapse table-fixed">
                        <thead className="bg-gray-200 text-gray-800">
                            <tr>
                                <th
                                    className={`w-9 px-2 py-2 text-left font-medium text-[13px] `}
                                >
                                    S.No
                                </th>
                                <th

                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    BranchName
                                </th>
                                <th

                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    BranchType
                                </th>
                                <th

                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    BranchEmail
                                </th>
                                <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    BranchAddress
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                     Person Name
                                </th>
                                <th

                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Designation
                                </th>
                               
                                <th

                                    className={`w-14 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Contact Number
                                </th>

                                <th

                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                >
                                    Actions
                                </th>

                            </tr>
                        </thead>
                            <tbody>
                        
                                                    {(branchInfo ? branchInfo : []).map((item, index) =>
                                                          <tr className="border border-blue-gray-200 cursor-pointer p-3" >
                                                                     <td className="w-3  text-center border border-gray-300 text-[11px] px-2">
                                                                      {parseInt(index)  +  1 }
                                                      
                                                            </td>         
                                                            <td className="w-40  py-0.5 border-blue-gray-200 text-[13px] text-right border border-gray-300">
                                                              <textarea className='text-left rounded py-1 w-full h-full px-1 table-data-input  text-xs  
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm resize-none '                                                                   
                                                                    value={item?.branchName}
                                                                       type="text"
                                                                    onChange={(e) => { handleInputbranch(e.target.value, index, "branchName") }} onFocus={(e) => { e.target.select() }} min={0}
                                                                />
                        
                                                            </td>       
                                                              <td className="w-40  py-0.5 border-blue-gray-200 text-[11px] text-right border border-gray-300">
                                                                        <select
                                                                      onKeyDown={e => { if (e.key === "Delete") { handleInputbranch("", index, "branchType") } }}
                                                                      disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={item.branchType} onChange={(e) => handleInputbranch(e.target.value, index, "branchType")}
                                                                      onBlur={(e) => {
                                                                          handleInputbranch((e.target.value), index, "branchType")
                                                                      }
                                                                      }
                                                      >

                                                                    <option hidden>
                                                                    </option>
                                                                    {(id ? branchTypeData?.data : branchTypeData?.data?.filter(item => item.active))?.map((blend) =>
                                                                        <option value={blend.id} key={blend.id}>
                                                                            {blend.name}
                                                                        </option>
                                                                    )}
                                                       </select>
                                                            </td>         <td className="w-40  py-0.5 border-blue-gray-200 text-[11px] text-right border border-gray-300">
                                                                  <textarea className='text-left rounded py-1 w-full h-full px-1 table-data-input text-xs  
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm resize-none '
                                                                    type="text"
                                                                    value={item?.branchAddress}
                                                                    onChange={(e) => { handleInputbranch(e.target.value, index, "branchAddress") }} onFocus={(e) => { e.target.select() }} min={0}
                                                                />
                        
                                                            </td>         <td className="w-40  py-0.5 border-blue-gray-200 text-[11px] text-right border border-gray-300">
                                                                  <textarea className='text-left rounded py-1 w-full h-full px-1 table-data-input text-xs  
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm resize-none '
                                                                    type="text"
                                                                    value={item?.contactPersonName}
                                                                    onChange={(e) => { handleInputbranch(e.target.value, index, "contactPersonName") }} onFocus={(e) => { e.target.select() }} min={0}
                                                                />
                        
                                                            </td>     
                                                                <td className="w-40  py-0.5 border-blue-gray-200 text-[11px] text-right border border-gray-300">
                                                                  <textarea className='text-left rounded py-1 w-full h-full px-1 table-data-input text-xs  
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm resize-none '
                                                                    type="text"
                                                                    value={item?.qty}
                                                                    onChange={(e) => { handleInputbranch(e.target.value, index, "qty") }} onFocus={(e) => { e.target.select() }} min={0}
                                                                />
                        
                                                            </td>
                                                                            <td className="w-40  py-0.5 border-blue-gray-200 text-[11px] text-right border border-gray-300">
                                                                  <textarea className='text-left rounded py-1 w-full h-full px-1 table-data-input text-xs  
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm resize-none '
                                                                    type="text"
                                                                    value={item?.Designation	}
                                                                    onChange={(e) => { handleInputbranch(e.target.value, index, "Designation	") }} onFocus={(e) => { e.target.select() }} min={0}
                                                                />
                        
                                                            </td>
                                                                <td className="w-40  py-0.5 border-blue-gray-200 text-[11px] text-right border border-gray-300">
                                                                  <textarea className='text-left rounded py-1 w-full h-full px-1 table-data-input text-xs  
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm resize-none '
                                                                    type="text"
                                                                    value={item?.ContactNumber}
                                                                    onChange={(e) => { handleInputbranch(e.target.value, index, "ContactNumber") }} onFocus={(e) => { e.target.select() }} min={0}
                                                                />
                        
                                                            </td>
                                                     
                                                               <td className="w-16 px-1 py-1 text-center">
                                        <div className="flex space-x-2  justify-center">

                                            {/* <button
                                                // onClick={() => handleView(index)}
                                                // onMouseEnter={() => setTooltipVisible(true)}
                                                // onMouseLeave={() => setTooltipVisible(false)}
                                                className="text-blue-800 flex items-center  bg-blue-50 rounded"
                                            >
                                                👁 <span className="text-xs"></span>
                                            </button>
                                            <span className="tooltip-text">View</span>
                                            <button
                                                // onClick={() => handleEdit(index)}
                                                className="text-green-600 hover:text-green-800 bg-green-50 py-1 rounded text-xs flex items-center"
                                            >
                                                <HiPencil className="w-4 h-4" />

                                            </button> */}
                                            <span className="tooltip-text">Edit</span>
                                            <button
                                                onClick={() => deleteBranch(index)}
                                                className="text-red-600 hover:text-red-800 bg-red-50  py-1 rounded text-xs flex items-center"
                                            >
                                                <HiTrash className="w-4 h-4" />

                                            </button>
                                            <span className="tooltip-text">Delete</span>
                                        </div>
                                    </td>
                                                          </tr>
                                                    )}
                                                </tbody>
                    </table>


                </div>
          </div>

          </div>
      
       
        {/* </Modal>
      )} */}

        </>
    )
}

export default AddBranch