import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../Order/CommonInput";
import { DropdownWithSearch } from "../../../Inputs";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import { useState } from "react";
import moment from "moment";
import FormItems from "./FormItems";

const RequirmentForm =  ({onClose , readOnly ,setReadOnly , sampleData , sampleId , setSampleId }) =>  {


    
        const [docId, setDocId] = useState("New")
        const [active, setActive] = useState(true);
        const [validDate, setValidDate] = useState();
            const [date, setDate] = useState(moment(new Date()).format("YYYY-MM-DD"));

            const [sampledetails, setSampleDetails] = useState([]);
        


    return (
        <>
             <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
                            <div className="flex justify-between items-center mb-1">
                                <h1 className="text-xl font-bold text-gray-800">Requirement Planning Form</h1>
                                <button
                                    onClick={onClose}
                                    className="text-indigo-600 hover:text-indigo-700"
                                    title="Open Report"
                                >
                                    <FaFileAlt className="w-5 h-5" />
                                </button>
                            </div>
            
                            <div className="space-y-3 h-full ">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            
            
                                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                                        <h2 className="font-medium text-slate-700 mb-2">
                                            Basic Details
                                        </h2>
                                        <div className="grid grid-cols-2 gap-1">
                                            <ReusableInput label="Doc.Id" readOnly value={docId} />
            
                                            <ReusableInput label="Date" value={date} type={"date"} required={true} readOnly={true} disabled />
                                            {/* <ReusableInput label="Due Date" type="date" value={validDate} setValue={setValidDate} readOnly={readOnly} /> */}
                                          <DropdownWithSearch
                                                        name="Sample orders"
                                                        options={sampleData?.data}
                                                        value={sampleId}
                                                        setValue={setSampleId}
                                                        // disabled={newSampleEntry ? false : true} 
                                                        labelField={"docId"}
                                                        label={"Sample Orders"} 
                                                        
                                                    />
                                        </div>
                                
                                    </div>
                                    
            
            
         
            
            
                                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                                        {/* <h2 className="font-medium text-slate-700 mb-2">
                                            Contact Details
                                        </h2>
                                        <div className="grid grid-cols-2 gap-x-3">
                               
                                            <DropdownWithSearch
                                                // options={partyId  ?  options  :  []}
                                                // labelField={"contactPersonName"}
                                                // label={"Contact Person Name"}
                                                // value={contactPersonName}
                                                // setValue={setContactPersonName}
                                            
                                            />
                                         
                                             <DropdownWithSearch
                                                // options={partyId  ?  options  :  []}
                                                // labelField={"mobileNo"}
                                                // label={"Contact Person Name"}
                                                // value={contactPersonName}
                                                // setValue={setContactPersonName}
                                            
                                            />
            
                                        </div> */}
                                    </div>

                                           <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                                        {/* <h2 className="font-medium text-slate-700 mb-2">
                                            Contact Details
                                        </h2>
                                        <div className="grid grid-cols-2 gap-x-3">
                               
                                            <DropdownWithSearch
                                                // options={partyId  ?  options  :  []}
                                                // labelField={"contactPersonName"}
                                                // label={"Contact Person Name"}
                                                // value={contactPersonName}
                                                // setValue={setContactPersonName}
                                            
                                            />
                                         
                                             <DropdownWithSearch
                                                // options={partyId  ?  options  :  []}
                                                // labelField={"mobileNo"}
                                                // label={"Contact Person Name"}
                                                // value={contactPersonName}
                                                // setValue={setContactPersonName}
                                            
                                            />
            
                                        </div> */}
                                    </div>
                                </div>
                                         <fieldset className=''>                      
            
                                            <FormItems  sampleDetails={sampledetails}    />
                                
                                   </fieldset>
                           
                               
            
                                <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
                                    <div className="flex gap-2 flex-wrap">
                                        <button  className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                            <FiSave className="w-4 h-4 mr-2" />
                                            Save & New
                                        </button>
                                        <button  className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                            <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                            Save & Close
                                        </button>
                                        <button  className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                            <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                            Draft Save
                                        </button>
                                    </div>
            
                                    <div className="flex gap-2 flex-wrap">
                
                                        <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                                            // onClick={() => setReadOnly(false)}
                                        >
                                            <FiEdit2 className="w-4 h-4 mr-2" />
                                            Edit
                                        </button>
                                        <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                                            <FaWhatsapp className="w-4 h-4 mr-2" />
                                            WhatsApp
                                        </button>
                                        <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm">
                                            <FiPrinter className="w-4 h-4 mr-2" />
                                            Print
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
        </>
    )
}

export default   RequirmentForm;