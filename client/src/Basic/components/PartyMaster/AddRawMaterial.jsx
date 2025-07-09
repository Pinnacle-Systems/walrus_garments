import { TextInput, ToggleButton } from "../../../Inputs"
import MastersForm from "../MastersForm/MastersForm";
import { statusDropdown } from "../../../Utils/DropdownData";

const RawMaterial  = ( {material , setMaterial , readOnly , setRawMaterial , saveData  , materialActive , setMaterialActive } ) => {

    const onNew = (setMaterial) => {
        setMaterial("")
    }

    return (
        <>
          
            <MastersForm
                masterClass={"pb-2"}
                onNew={onNew}
                onClose={() => {
                    setRawMaterial(false);
                }}
                // model={MODEL}

                saveData={saveData}
                // saveExitData={saveExitData}
                // setReadOnly={setReadOnly}
                // deleteData={deleteData}
                readOnly={readOnly}

            >
                <div className="space-y-4 bg-[#f1f1f0] p-2">

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">

                        <div className="space-y-2 bg-[#f1f1f0]">

                            <div className="">
                               <TextInput name="Meterial Name" type="text" value={material} setValue={setMaterial} required={true} readOnly={readOnly} /> 
                              
                            </div>
                                <div className="flex items-center gap-x-2">
                            
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
            </MastersForm>
            
        </>
    )
}

export default  RawMaterial