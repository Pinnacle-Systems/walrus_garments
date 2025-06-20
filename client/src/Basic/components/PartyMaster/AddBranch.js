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

const AddBranch = ({ partyData, partyId, branchEmail, setBranchEmail, setBranchAddress, branchName, setBranchName, branchCode, setBranchCode, branchAddress, branchContact, setBranchContact, setBranchModelOpen, childRecord, saveExitData, setReadOnly, deleteData, readOnly,
    partyBranch, setPartyBranch
}) => {
    const MODEL = " Branch Info";
    const [addData] = useAddPartyMutation();
    const [updateData] = useUpdatePartyMutation();

    const data = {
        branchAddress, branchCode, branchContact, branchEmail, branchName, partyId, isForPartyBranch: true
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


    const validateData = (data) => {

        console.log(data, "datata")
        if (data.branchAddress && data?.branchCode && data?.branchContact && data?.branchEmail && data?.branchName) {


            return true

        }
        return false
    };

    const saveData = () => {

        if (!validateData(data)) {
            toast.error("Please fill all required fields...!", {
                position: "top-center",
            });
            return;
        }
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

    console.log(partyBranch, "partybranchhhh")




    return (
        <>
            <MastersForm
                masterClass={"pb-2"}
                onNew={onNew}
                onClose={() => {
                    console.log("kiiii")
                    setBranchModelOpen(false);
                }}
                model={MODEL}

                saveData={() => { saveData() }}
                saveExitData={saveExitData}
                setReadOnly={setReadOnly}
                deleteData={deleteData}
                readOnly={readOnly}

            >
                <div className="space-y-4 bg-[#f1f1f0] p-2">

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">

                        <div className="space-y-2 bg-[#f1f1f0]">

                            <div className="space-y-2">
                                <div className="rounded-xl border border-gray-100 bg-[#f1f1f0]  p-1 shadow-xs ">
                                    {/* <h3 className="mb-2 text-sm font-semibold text-gray-900">
                                        Branch Info
                                    </h3> */}
                                    <div className="grid grid-cols-1 gap-x-2  md:grid-cols-2 lg:grid-cols-3 mt-1">

                                        <TextInput name="Party Name" type="text" value={partyId ? findFromList(partyId, partyData?.data, "name") : ""} disabled={"true"} />
                                        <TextInput name="Branch Name" type="text" value={branchName} setValue={setBranchName} required={true} readOnly={readOnly} />
                                        <TextInput name="Branch Code" type="text" value={branchCode} setValue={setBranchCode} required={true} readOnly={readOnly} />
                                        <TextInput name="Branch Email" type="text" value={branchEmail} setValue={setBranchEmail} required={true} readOnly={readOnly} />
                                        <TextInput name="Contact" type="text" value={branchContact} setValue={setBranchContact} required={true} readOnly={readOnly} />
                                        <TextArea name="Address" type="text" value={branchAddress} setValue={setBranchAddress} required={true} readOnly={readOnly} />

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </MastersForm>

        </>
    )
}

export default AddBranch