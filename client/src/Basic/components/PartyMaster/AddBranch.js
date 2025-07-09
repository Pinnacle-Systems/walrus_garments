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
import { HiPlus } from 'react-icons/hi';
import { Check } from 'lucide-react';

const AddBranch = ({ partyData, partyId,
    branchType,setBranchType,branchInfo,handleInputbranch,id,setBranchInfo , deleteBranch,
    branchEmail, setBranchEmail, setBranchAddress, branchName, setBranchName, branchCode, setBranchCode, branchAddress, branchContact, setBranchContact, setBranchModelOpen, childRecord, saveExitData, setReadOnly, deleteData, readOnly,
    partyBranch, name
}) => {
    const MODEL = " Branch Info";
    const [addData] = useAddPartyMutation();
    const [updateData] = useUpdatePartyMutation();

    const data = {
        branchAddress, branchCode, branchContact, branchEmail, branchName, partyId, isForPartyBranch: true
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
                        address : "",
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
      
                {/* <div className="space-y-4 bg-[#f1f1f0] p-2">

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">


                            <div className="space-y-2">
                                <div className="rounded-xl border border-gray-100 bg-[#f1f1f0]  p-1 shadow-xs ">
                             
                                    <div className="grid grid-cols-1 gap-x-2  md:grid-cols-2 lg:grid-cols-5 mt-1">

                                       <div className='col-span-2' >
                                        <TextInput name="Party Name" type="text" value={partyId ? findFromList(partyId, partyData?.data, "name") : name } disabled={"true"} />
                                        </div> 
                             <div className='col-span-2' >

                                        <TextInput name="Branch Name" type="text" value={branchName} setValue={setBranchName} required={true} readOnly={readOnly} />
                             </div>
                            
                                            <DropdownInput
                                            name="Branch Type"
                                            //   options={dropDownListMergedObject(
                                            //     id
                                            //       ? cityList?.data
                                            //       : cityList?.data?.filter((item) => item.active),
                                            //     "name",
                                            //     "id"
                                            //   )}
                                            masterName="BRANCH MASTER"
                                            //   lastTab={activeTab}
                                            value={branchType}
                                            setValue={setBranchType}
                                            required={true}
                                            readOnly={readOnly}
                                            disabled={childRecord.current > 0}
                                            className="focus:ring-2 focus:ring-blue-100"
                                            />

                                         

                                       <div className='col-span-2 flex flex-row gap-2'>
                                        <TextInput name="Branch Code" type="text" value={branchCode} setValue={setBranchCode} required={true} readOnly={readOnly} />
                                        <TextInput name="Contact" type="text" value={branchContact} setValue={setBranchContact} required={true} readOnly={readOnly} />
                                        </div> 
                                        <div className='col-span-2'>

                                        <TextArea name="Address"
                                        inputClass='h-8'
                                        type="text" value={branchAddress} setValue={setBranchAddress} required={true} readOnly={readOnly} />
                                        </div>

                                    </div>
                                </div>
                            </div>

                     
                    </div>

                </div> */}
            
        
         {/* {form && (
        <Modal
        //   isOpen={form}
          form={form}
          widthClass={"w-[30%] max-w-6xl h-[50vh]"}
          onClose={() => {
            setForm(false);
            setErrors({});
          }}
        > */}
          <div className="h-full flex flex-col bg-[f1f1f0]">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  {id ? (!readOnly ? "Edit Branch Master" : "Branch Master") : "Add New Branch"}
                </h2>
              
              </div>
              <div className="flex gap-2">
                <div>
                  {readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        // setForm(false);
                        // setSearchValue("");
                        // setId(false);
                      }}
                      className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                  <div className="flex gap-2">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={saveData}
                      className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                  border border-blue-600 flex items-center gap-1 text-xs"
                    >
                      {/* <Check size={14} />
                      {id ? "Update" : "Save"} */}
                      View
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={saveData}
                      className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"
                    >
                      <Check size={14} />
                      {id ? "Update" : "Save"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3">
              <div className="grid grid-cols-1  gap-3  h-full">
                <div className="lg:col-span- space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                             <div className="overflow-hidden rounded-md border border-gray-200">
                              <div className="flex justify-between items-center mb-2">
                                        <h2 className="font-medium text-slate-700">Branch List</h2>
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
                                      <input
                                        type="text"
                                        className="w-28 rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                                        value={item?.branchType}
                                        disabled={readOnly}
                                        onChange={(e) => handleInputbranch(e.target.value, index, "branchType")}
                                      />
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
            </div>


          </div>

      
       
        {/* </Modal>
      )} */}

        </>
    )
}

export default AddBranch