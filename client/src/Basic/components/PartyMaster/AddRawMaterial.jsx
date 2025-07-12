import { ReusableTable, TextInput, ToggleButton } from "../../../Inputs"
import MastersForm from "../MastersForm/MastersForm";
import { statusDropdown } from "../../../Utils/DropdownData";
import { Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CommonTable from "../../../Shocks/CommonReport/CommonTable";
import { toast } from "react-toastify";
import { useDeletePartyMaterialMutation, useGetPartyByIdQuery, useGetPartyMaterialByIdQuery } from "../../../redux/services/PartyMasterService";
import { FaPlus } from "react-icons/fa";
import { findFromList } from "../../../Utils/helper";

const RawMaterial  = ( {material ,setMaterial, id , readOnly , setRawMaterial , SaveBranch  , materialActive , setMaterialActive 
    ,form ,allData , setMaterialForm , materialForm ,setMaterialId ,materialId } ) => {

    const onNew = () => {
        setMaterial("");
        setMaterialId('')
    }
 const syncFormWithDb = useCallback(
    (data) => {
      console.log(materialId,data,"data")
     setMaterial(findFromList(materialId,data,"name"))
    },

    [id]
  );

    const {
      data: singleData,
      isFetching: isSingleFetching,
      isLoading: isSingleLoading,
    } = useGetPartyMaterialByIdQuery(materialId, { skip: !materialId });

    const [removeData] = useDeletePartyMaterialMutation()
  useEffect(() => {
    syncFormWithDb(allData?.materialData);
  }, [materialId,setMaterialId]);


    const columns = [
          {
              header: 'S.No',
              accessor: (item, index) => index + 1,
              cellClass: () => 'font-medium text-gray-900'
          },
          
          {
              header: 'Name.',
              accessor: (item) => item.name,
              cellClass: () => 'font-medium text-gray-900'
          },
            
     
             {
              header: '',
              accessor: (item) =>  item.ff,
              cellClass: () => 'uppercase'
          },
        {
              header: '',
              accessor: (item) =>  item.ff,
              cellClass: () => 'uppercase'
          },   {
              header: '',
              accessor: (item) =>  item.ff,
              cellClass: () => 'uppercase'
          },   {
              header: '',
              accessor: (item) => item.ff,
              cellClass: () => 'uppercase'
          },   {
              header: '',
              accessor: (item) =>  item.ff,
              cellClass: () => 'uppercase'
          },   {
              header: '',
              accessor: (item) =>  item.ff,
              cellClass: () => 'uppercase'
          },
     
        ];

               const handleView = (id) => {
           
                   setMaterialId(id)
                   setMaterialForm(true)
                //    setReadOnly(true);
               };
           
               const handleEdit = (id) => {
                     setMaterialId(id)
                     setMaterialForm(true)
                //    setReadOnly(false);
               };
           
               const handleDelete = async (id) => {
                console.log(id,"id")
                   if (id) {
                       if (!window.confirm("Are you sure to delete...?")) {
                           return;
                       }
                       try {
                              let deldata = await removeData(id).unwrap();
                              if (deldata?.statusCode == 1) {
                                toast.error(deldata?.message)
                                return
                              }
                              toast.success("Deleted Successfully");
                            } catch (error) {
                              toast.error("something went wrong")
                            }
                   }
           
               };
    return (
        <>
          
           
                {/* <div className="space-y-4 bg-[#f1f1f0] p-2">

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">

                        <div className="grid grid-cols-4 gap-4 bg-[#f1f1f0]">

                            <div className="">
                               <TextInput name="Meterial Name" type="text" value={material} setValue={setMaterial} required={true} readOnly={readOnly} /> 
                              
                            </div>
                            
                            <div className="flex items-center">
                                <ToggleButton
                                name="Status"
                                options={statusDropdown}
                                value={materialActive}
                                setActive={setMaterialActive}
                                required={true}
                                readOnly={readOnly}
                                className="bg-gray-100 p-1 rounded-lg"
                                activeClass="bg-[#f1f1f0]  shadow-sm text-blue-600 "
                                inactiveClass="text-gray-500"
                                />
                             </div>

                        </div>
                    </div>

                </div> */}

               {materialForm   ?   
            
               <>
            <div className="h-full flex flex-col bg-[f1f1f0]">           
                      <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
                              <div className="flex items-center gap-2">
                                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                                  {id ? (!readOnly ? "Edit Material Master" : "Material Master") : "Add New Material"}
                                </h2>
                              
                              </div>
                              <div className="flex gap-2">
                                <div>
                                  {readOnly && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRawMaterial(false);
                     
                                      }}
                                      className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                 
                                    <button
                                      type="button"
                                      onClick={()  =>  {setMaterialForm(false)}}
                                      className="px-3 py-1 hover:bg-red-600 hover:text-white rounded text-red-600 
                                  border border-red-600 flex items-center gap-1 text-xs"
                                    >
                                      {/* <Check size={14} /> */}
                                      Back
                                    </button>
                                
                                  {!readOnly && (
                                    <button
                                      type="button"
                                      onClick={SaveBranch}
                                      className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                  border border-green-600 flex items-center gap-1 text-xs"
                                    >
                                      <Check size={14} />
                                      {materialId ? "Update" : "Save"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3">
                                          <div className="grid grid-cols-1  gap-3 ">
                                            <div className="lg:col-span- space-y-3">
                                              <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                                                    <div className="space-y-2 w-[50%]">
                                                    
                                                        <div className="">
                                                        <TextInput name="Meterial Name" type="text" value={material} setValue={setMaterial} required={true} readOnly={readOnly} /> 
                                                        </div>
                                                                
                                                        <div className="flex items-center">
                                                            <ToggleButton
                                                            name="Status"
                                                            options={statusDropdown}
                                                            value={materialActive}
                                                            setActive={setMaterialActive}
                                                            required={true}
                                                            readOnly={readOnly}
                                                            className="bg-gray-100 p-1 rounded-lg"
                                                            activeClass="bg-[#f1f1f0]  shadow-sm text-blue-600 "
                                                            inactiveClass="text-gray-500"
                                                            />
                                                        </div>
                                                </div>
                                               
                            
                                            
                                         
                                                    
                                              </div>
                            
                                            
                                            </div>
                                          </div>
                                </div>

                          </div>      
               </>
              : 
               <div className=" flex flex-col bg-[f1f1f0] p-3 h-[90%] ">
                                 
                                       <div className="flex flex-col sm:flex-row justify-between bg-white py-1.5 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
                                           <div className="flex items-center gap-2">
                                        
                           <h1 className="text-xl font-bold text-gray-800">Materials List</h1>
                   
                                           </div>
                                           <button
                                               className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1.5 rounded-md flex items-center gap-2 text-sm"
                                               onClick={() => {
                                                 setMaterialForm(true)
                                                 onNew() }}
                                           >
                                               <FaPlus /> Create New
                                           </button>
                                       </div>
                                <>
                                <div className=" h-[80%] overflow-y-auto">

                                <ReusableTable
                                    columns={columns}
                                    data={allData?.materialData || []}
                                    onView={handleView}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    itemsPerPage={10}
                                />
                                </div>
                                </>
                         
                               
                  </div>
            }
                
        </>
    )
}
                     
                        
                            
                           

export default  RawMaterial;
                            
                                                  
                            
                            
                                                 
                            
                                                 
                            
                            