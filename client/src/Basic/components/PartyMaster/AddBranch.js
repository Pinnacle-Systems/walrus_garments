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
    DropdownWithSearch,
    ReusableTable,
} from "../../../Inputs";
import MastersForm from '../MastersForm/MastersForm';
import { findFromList } from '../../../Utils/helper';
import { useAddPartyMutation, useUpdatePartyMutation } from '../../../redux/services/PartyMasterService';
import { toast } from "react-toastify";
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi';
import { Check } from 'lucide-react';
import { useGetbranchTypeQuery } from '../../../redux/uniformService/BranchTypeMaster';
import { XMarkIcon, MapPinIcon, BuildingStorefrontIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { FaPlus } from 'react-icons/fa';
import { dropDownListMergedObject } from '../../../Utils/contructObject';
import { statusDropdown } from '../../../Utils/DropdownData';

const AddBranch = ({ singleData, partyId,
    branchType,cityList,branchInfo,name,id,setBranchInfo , handleFun,
    branchEmail, setBranchEmail, setBranchAddress, branchName, setBranchName
    , setBranchCode, branchAddress, branchContact, setBranchContact, setBranchModelOpen, 
    childRecord, branchContactPerson, setBranchcontactPerson, readOnly,managerName ,openingHours , branchWebsite ,setBranchWebsite, setopeningHours ,
    branchForm,setBranchForm
}) => {
    const MODEL = " Branch Info";
    const [addData] = useAddPartyMutation();
    const [updateData] = useUpdatePartyMutation();

  console.log(branchForm,"branchForm");
    
          const { data: branchTypeData } = useGetbranchTypeQuery({ });

    const data = {
        branchAddress,branchContact,branchContactPerson,branchEmail,branchName,branchType,branchWebsite,openingHours , isBranch : true ,id
    }; 


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

        console.log(branchForm, "branchForm")

    const validateData = (data) => {

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
        // if (partyId) {
        //     handleSubmitCustom(updateData, data, "Updated");
        // } else {

            handleSubmitCustom(addData, data, "Added");
        // }
    };

 const columns = [
          {
              header: 'S.No',
              accessor: (item, index) => index + 1,
              className : 'font-medium text-gray-900 w-[5%] text-center'
          },
          
          {
              header: 'BranchName',
              accessor: (item) => item.branchName,
              className : 'font-medium text-gray-900 w-[40%]'
          },
            
        {
              header: 'BranchAddress',
              accessor: (item) => item.branchAddress,
              className : 'font-medium text-gray-900 w-[30%]'
          },
  {
              header: '',
              accessor: (item) => item.none,
              className : 'font-medium text-gray-900 w-[20%]'
          },
     
        ];


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
  
         const handleView = (id) => {
     
            //  setId(id)
            //  setForm(true)
            //  setReadOnly(true);
         };
     
         const handleEdit = (id) => {
            //  setId(id)
             setBranchForm(false)
            //  setReadOnly(false);
         };
     
         const handleDelete = async (orderId) => {
             if (orderId) {
                 if (!window.confirm("Are you sure to delete...?")) {
                     return;
                 }
                 try {
                    //  await removeData(orderId)
                    //  setId("");
                     onNew();
                     toast.success("Deleted Successfully");
                 } catch (error) {
                     toast.error("something went wrong");
                 }
             }
     
         };

    return (
        <>
      
{ branchForm  == true  ?   
  

(                 
     <div className="flex flex-col bg-[#f1f1f0] p-4 h-[96%] rounded-md">
   
     {/* Header */}
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 p-2 bg-white rounded-md shadow-md border border-gray-200">
       <div className="flex items-center gap-2">
         <h1 className="text-lg font-semibold text-gray-800 tracking-tight p-2" >
           Branch List
         </h1>
       </div>
   
       <button
         onClick={() => {
            setBranchForm(!branchForm)
          //  onNew();
         }}
         className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs">
         <FaPlus className="w-4 h-4" />
         Add  Branch
       </button>
     </div>
   
     {/* Scrollable Table Container */}
     <div className="flex-1 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm p-2">
       <ReusableTable
         columns={columns}
         data={singleData?.data?.partyBranch || []}
         onView={handleView}
         onEdit={handleEdit}
         onDelete={handleDelete}
         itemsPerPage={10}
       />
     </div>
   </div>)
  

      :
                    
          (  <div className="bg-[F1F1F0]  shadow-xl w-full  overflow-hidden p-2 h-[98%]">
        <div className="flex justify-between bg-white items-center my-2 rounded-md  ">
           <h2 className="text-lg font-semibold text-gray-800 p-3">Add New Branch</h2>
                      <h2 className="text-lg font-semibold text-gray-800 p-3">{name}</h2>

           <div className='flex flex-row gap-3'>

             <button
              type="button"
                onClick={()  => setBranchForm(true)}

              className="px-3 py-1 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-600 text-xs rounded"
            >
              View
            </button>  
                <button
                      type="button"
                      onClick={() => 
                       onclose}
                      className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                    >
                      Cancel
                </button> 
                      <button
              type="submit"
        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"           onClick={saveData}
           >
                <Check size={14} />
              Save 
            </button>
           </div>
        </div>
 
           <div className="flex-1 overflow-auto p-3">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                      
        
                       
        
                        <div className="lg:col-span-4 space-y-3">
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <h3 className="font-medium text-gray-800 mb-2 text-sm">Basic Details</h3>
                            {/* <div className="space-y-2"> */}
                            <div className="grid grid-cols-2 mb-11">     
                          
                            
        
                              <div className="col-span-2">
                                      <TextArea
                                        name="Branch Name"
                                        type="text"
                                        value={branchName}
                                        setValue={setBranchName}
                                        inputClass="h-8" 

                                        // readOnly={readOnly}
                                        required
                                        disabled={childRecord.current > 0}
                                        className="focus:ring-2 focus:ring-blue-100"
                                      /> 
                              </div>
                               <div className="col-span-2">
                                    <TextArea
                                        name="Alias Name"
                                        type="text"
                                        inputClass="h-8" 
                                        // value={aliasName}
                                        // setValue={setAliasName}
                                        required={true}
                                        readOnly={readOnly}
                                        disabled={childRecord.current > 0}
                                        className="focus:ring-2 focus:ring-blue-100"
                                      />
                              </div>
                               <div>
                                  <TextInput
                                        name="Branch Code"
                                        type="number"
                                        // value={contact}
                
                                        // setValue={setContact}
                                        readOnly={readOnly}
                                        disabled={childRecord.current > 0}
                                        className="focus:ring-2 focus:ring-blue-100 w-10"
                                      />
                              </div>
                              <div className="mt-5 ml-3">
                                      <ToggleButton
                                  name="Status"
                                  options={statusDropdown}
                                  // value={active}
                                  // setActive={setActive}
                                  required={true}
                                  readOnly={readOnly}
                                  className="bg-gray-100 p-1 rounded-lg"
                                  activeClass="bg-[#f1f1f0] shadow-sm text-blue-600"
                                  inactiveClass="text-gray-500"
                                />
                              </div>
                                 
             <div className="mt-5 ml-3">
                               
                              </div>
                                                      
                                                            
                                                               
                                                          </div>
                        
                          
                          </div>
        
                
                          </div>
                           <div className="lg:col-span-4 space-y-3 ">
                          <div className="bg-white p-3 rounded-md border border-gray-200 ">
                            <h3 className="font-medium text-gray-800 mb-2 text-sm">Address  Details</h3>
                         <div className="space-y-2">
                         
        
                              <div className="grid grid-cols-2 gap-2 mb-11">
                                  <DropdownInput
                                                                                 name="City/State Name"
                                                                                 options={dropDownListMergedObject(
                                                                                   id
                                                                                     ? cityList?.data
                                                                                     : cityList?.data?.filter((item) => item.active),
                                                                                   "name",
                                                                                   "id"
                                                                                 )}
                                                                                //  country={country}
                                                                                 masterName="CITY MASTER"
                                                                                //  lastTab={activeTab}
                                                                                //  value={city}
                                                                                //  setValue={setCity}
                                                                                 required={true}
                                                                                 readOnly={readOnly}
                                                                                 disabled={childRecord.current > 0}
                                                                                 className="focus:ring-2 focus:ring-blue-100"
                                                                               />
                                                                       <TextInput
                                                                    name="Land Mark"
                                                                    type="number"
                                                                    // value={pincode}
                                                                    required={true}
                                            
                                                                    // setValue={setPincode}
                                                                    readOnly={readOnly}
                                                                    disabled={childRecord.current > 0}
                                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                  /> 
                                                                  <div className="col-span-2">
        
                                                                  <TextArea name="Address"
                                                                  inputClass="h-10" 
                                                                  // value={address} 
                                                                  // setValue={setAddress}
                                                                   required={true}
                                                                    readOnly={readOnly} d
                                                                    isabled={(childRecord.current > 0)} />
                                                                  </div>
        
                                                             
                                                              <div className="">
        
                                                             <TextInput
                                                                    name="Pincode"
                                                                    type="number"
                                                                    // value={pincode}
                                                                    required={true}
                                            
                                                                    // setValue={setPincode}
                                                                    readOnly={readOnly}
                                                                    disabled={childRecord.current > 0}
                                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                  />         
                                                              </div>
                                                                                                   
                              </div>
                            </div> 
                          </div>
        
        
                        </div>
                           <div className="lg:col-span-4 space-y-3">
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <h3 className="font-medium text-gray-800 mb-2 text-sm">Contact  Details</h3>
                         <div className="space-y-2">
                         
        
                                <TextInput
                                          name="Branch Email"
                                          type="number"
                                          // value={email}
                  
                                          // setValue={setEmail}
                                          readOnly={readOnly}
                                          disabled={childRecord.current > 0}
                                          className="focus:ring-2 focus:ring-blue-100 w-10"
                                        />
                              <div className="grid grid-cols-2 gap-2">
                                <div className="col-span-2 flex flex-row gap-4 mt-2">
                                   <div className="w-72">
                                                          
                                      <TextInput
                                                    name="Contact Person Name"
                                                    type="text"
                                                    // value={contact}
                            
                                                    // setValue={setContact}
                                                    readOnly={readOnly}
                                                    disabled={childRecord.current > 0}
                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                  />
                                                   </div>
                            <div className="relative inline-block">
                                        <button
                                          className="w-7 h-6 border border-green-500 rounded-md mt-6
                                                    hover:bg-green-500 text-green-600 hover:text-white
                                                    transition-colors flex items-center justify-center"
                                          disabled={readOnly}
                                          onClick={() => {
                                            // openAddModal();
                                            // setIsDropdownOpen(false);
                                            // setEditingItem("new");
                                            // setOpenModel(true);
                                            // setIsContactPerson(true)
                                          }}
                                          // onMouseEnter={() => setTooltipVisible(true)}
                                          // onMouseLeave={() => setTooltipVisible(false)}
                                          aria-label="Add supplier"
                                        >
                                          <FaPlus className="text-sm" />
                                        </button>
{/*         
                                            {tooltipVisible && (
                                              <div className="absolute z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
                                                <div className="flex items-start">
                                                  <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                                                  <span>Click to add a new Contact Person</span>
                                                </div>
                                                <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
                                              </div>
                                            )} */}
                              </div>
                               
          </div> 
                                               <TextInput
                                                      name="Designation"
                                                      type="text"
                                                      // value={Designation}  
                              
                                                      // setValue={setDesignation}
                                                      readOnly={readOnly}
                                                      disabled={childRecord.current > 0}
                                                      className="focus:ring-2 focus:ring-blue-100 w-10"
                                                    />
                                                     <TextInput
                                                      name="Department"
                                                      type="text"
                                                      // value={department}
                              
                                                      // setValue={SetDepartment} 
                                                      readOnly={readOnly}
                                                      disabled={childRecord.current > 0}
                                                      className="focus:ring-2 focus:ring-blue-100 w-10"
                                                    />
                                                          <TextInput
                                                                            name="Contact Number"
                                                                            type="number"
                                                                            // value={contact} 
                                                    
                                                                            // setValue={setContact}
                                                                            readOnly={readOnly}
                                                                            disabled={childRecord.current > 0}
                                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                          />
                                                                                      {/* <TextInput
                                                                            name="Fax"
                                                                            type="number"
                                                                            // value={contact}
                                                    
                                                                            // setValue={setContact}
                                                                            readOnly={readOnly}
                                                                            disabled={childRecord.current > 0}
                                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                          />     */}
                                                                                  <TextInput
                                                                            name="Website"
                                                                            type="number"
                                                                            // value={contact}
                                                    
                                                                            // setValue={setContact}
                                                                            readOnly={readOnly}
                                                                            disabled={childRecord.current > 0}
                                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                          />
                                                                            
                                                                                            
                              </div>
                            </div> 
                          </div>
        
             
                        </div>
                       
                      
        
                            {/* <div className="lg:col-span-4 space-y-3">
                              <div className="bg-white p-3 rounded-md border border-gray-200">
                                <h3 className="font-medium text-gray-800 mb-2 text-sm">Business Details</h3>
                                <div className="space-y-2">
        
                                  <div className="grid grid-cols-2 gap-2">
                                      
        
                                <DropdownInput
                                      name="Currency"
                                      options={dropDownListObject(
                                        id
                                          ? currencyList?.data ?? []
                                          : currencyList?.data?.filter(
                                            (item) => item.active
                                          ) ?? [],
                                        "name",
                                        "id"
                                      )}
                                      lastTab={activeTab}
                                      masterName="CURRENCY MASTER"
                                      value={currency}
                                      setValue={setCurrency}
                                      readOnly={readOnly}
                                      disabled={childRecord.current > 0}
                                      className="focus:ring-2 focus:ring-blue-100"
                                    />
                                                    
                                          <DropdownInput
                                            name="PayTerm"
                                            options={dropDownListObject(
                                              id
                                                ? payTermList?.data
                                                : payTermList?.data?.filter((item) => item.active),
                                              "aliasName",
                                              "id"
                                            )}
                                            value={payTermDay}
                                            setValue={setPayTermDay}
                                            // required={true}
                                            readOnly={readOnly}
                                            disabled={childRecord.current > 0}
                                            className="focus:ring-2 focus:ring-blue-100"
                                          />
                                                                              <TextInput
                                                                  name="Pan No"
                                                                  type="pan_no"
                                                                  value={panNo}
                                                                  setValue={setPanNo}
                                                                  readOnly={readOnly}
                                                                  disabled={childRecord.current > 0}
                                                                  className="focus:ring-2 focus:ring-blue-100"
                                                          /> 
                                                                <TextInput
                                                                                        name="GST No"
                                                                                        type="text"
                                                                                        value={gstNo}
                                                                                        setValue={setGstNo}
                                                                                        readOnly={readOnly}
                                                                                        className="focus:ring-2 focus:ring-blue-100"
                                                                                      />
                                          <TextInput
                                                            name="CST No"
                                                            type="text"
                                                            value={cstNo}
                                                            setValue={setCstNo}
                                                            readOnly={readOnly}
                                                            disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100"
                                                          />
                                                            <TextInput
                                                            name="CIN No"
                                                            type="text"
                                                            value={cstNo}
                                                            setValue={setCstNo}
                                                            readOnly={readOnly}
                                                            disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100"
                                                          />
                                                          
                                  </div>
                                </div>
                              </div>
        
                              
                            </div> */}
                            <div className="lg:col-span-6 space-y-3">
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <h3 className="font-medium text-gray-800 mb-2 text-sm">Bank  Details</h3>
                         <div className="space-y-2">
                         
        
                              
                              <div className="grid grid-cols-2 gap-2">
                                {/* <div className='col-span-2'> */}

                                  <TextInput
                                          name="Bank Name"
                                          type="number"
                                          // value={contact}
                  
                                          // setValue={setContact}
                                          readOnly={readOnly}
                                          disabled={childRecord.current > 0}
                                          className="focus:ring-2 focus:ring-blue-100 w-10"
                                        />
                                {/* </div> */}
                                      <TextInput
                                                    name="Branch Name"
                                                    type="text"
                                                    // value={contact}
                            
                                                    // setValue={setContact}
                                                    readOnly={readOnly}
                                                    disabled={childRecord.current > 0}
                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                  />
                                               <TextInput
                                                      name="Account Number"
                                                      type="text"
                                                      // value={contact}
                              
                                                      // setValue={setContact}
                                                      readOnly={readOnly}
                                                      disabled={childRecord.current > 0}
                                                      className="focus:ring-2 focus:ring-blue-100 w-10"
                                                    />
                                                          <TextInput
                                                                name="IFSC CODE"
                                                                type="number"
                                                                // value={contact}
                                        
                                                                // setValue={setContact}
                                                                readOnly={readOnly}
                                                                disabled={childRecord.current > 0}
                                                                className="focus:ring-2 focus:ring-blue-100 w-10"
                                                              />
                                                                        
                                                                            
                                                                                            
                              </div>
                            </div> 
                          </div>
        
             
                           </div>
                                                             
        <div className="relative h-40 w-full justify-end mt-16"> {/* Set desired height */}
          <div className="absolute bottom-0 right-0  ">
            <button
              onClick={() => setBranchModelOpen(true)}
              readOnly={readOnly}
              className="flex items-center pl-3 h-7 w-24 rounded-md bg-blue-600 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-2 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Branch
            </button>
          </div>
        </div>
        
                      </div>
                    </div>


     

        

      </div>
      
    
    )            


    } 

        </>
    )
}

export default AddBranch