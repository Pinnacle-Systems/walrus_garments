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

const ContactPersonDetails = ({ partyData, partyId,
    setBranchType,contactPersonName,setContactPersonName,designation,setDesnation , department,
    setDepartment, contactNumber, setContactNumber, branchName, setBranchName
    , setBranchCode, branchAddress, branchContact, setBranchContact, setBranchModelOpen, 
    childRecord, branchContactPerson ,openingHours , branchWebsite ,setBranchWebsite, setopeningHours ,
    branchForm,setBranchForm ,                    setIsContactPerson

}) => {
    const [addData] = useAddPartyMutation();

  console.log(partyData,"partyData");
    

    const data = {
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
              header: 'contactPersonName',
              accessor: (item) => item.contactPersonName,
              className : 'font-medium text-gray-900 w-[40%]'
          },
            
        {
              header: 'Department',
              accessor: (item) => item.department,
              className : 'font-medium text-gray-900 w-[30%]'
          },
  {
              header: '',
              accessor: (item) => item.none,
              className : 'font-medium text-gray-900 w-[20%]'
          },
     
        ];



  
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
                     toast.success("Deleted Successfully");
                 } catch (error) {
                     toast.error("something went wrong");
                 }
             }
     
         };

    return (
        <>
      
{ branchForm  == true  ?   
  

(                    <div className="flex flex-col bg-[#f1f1f0] p-4 h-[90%] rounded-md">
   
     {/* Header */}
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 p-4 bg-white rounded-md shadow-md border border-gray-200">
       <div className="flex items-center gap-2">
         <h1 className="text-lg sm:text-xl font-semibold text-gray-800 tracking-tight">
           Contact  List
         </h1>
       </div>
   
       <button
         onClick={() => {
            setBranchForm(!branchForm)
          //  onNew();
         }}
         className="flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-4 py-2 rounded-md shadow-sm hover:shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400"
       >
         <FaPlus className="w-4 h-4" />
         Add  Contact
       </button>
     </div>
   
     {/* Scrollable Table Container */}
     <div className="flex-1 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm p-2">
       <ReusableTable
         columns={columns}
         data={partyData?.PartyContactDetails || []}
         onView={handleView}
         onEdit={handleEdit}
         onDelete={handleDelete}
         itemsPerPage={10}
       />
     </div>
   </div>)
  

      :
                    
          (  <div className="bg-[F1F1F0] rounded-lg shadow-xl w-full  overflow-hidden p-1">
        <div className="flex justify-between bg-white items-center my-2 rounded-md mx-3 px-3 py-1">
          <h3 className="text-gray-800 font-semibold text-sm p-1">Add Contact Information</h3>
             <button
              type="button"
                onClick={()  => setBranchForm(true)}

              className="px-4 py-2 border border-blue-300 rounded-md text-xs font-medium text-blue-700 hover:bg-gray-50"
            >
              View Contact List
            </button>
        </div>
         <div className="bg-white  rounded-md border border-gray-200">

              <div className="grid grid-cols-1 gap-3 p-3">
                    <div className="space-y-2">
                      <div className="relative">
                       <TextInput
                            name="Contact Person Name"
                            type="text"
                            value={contactPersonName}
                            setValue={setContactPersonName}
                            // readOnly={readOnly}
                            // disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100"
                          /> 
                      </div>
                    </div>
        
                    <div className="space-y-2">
                   <TextInput
                            name="Designation"
                            type="text"
                            value={designation}
                            setValue={setDesnation}
                            // readOnly={readOnly}
                            // disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100"
                          /> 
                    </div>
                    
                    <div className="space-y-2">
                   <TextInput
                            name="Department"
                            type="text"
                            value={department}
                            setValue={setDepartment}
                            // readOnly={readOnly}
                            // disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100"
                          /> 
                    </div>
                    <div className="space-y-2">
                   <TextInput
                            name="Contact Number"
                            type="text"
                            value={contactNumber}
                            setValue={setContactNumber}
                            // readOnly={readOnly}
                            // disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100"
                          /> 
                    </div>
                  </div>
         </div>
          

        
       
      


     

        

          <div className="pt-2 flex justify-end space-x-2">
         
            <button
              type="button"
              onClick={()  => onclose}
              className="px-4 py-2 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 rounded-md text-xs font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
           onClick={saveData}
           >
              Save Contact details
            </button>
          </div>
      </div>)            


    } 

        </>
    )
}

export default ContactPersonDetails