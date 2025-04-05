import React, { useEffect } from 'react'
import { toast } from 'react-toastify';
import BrowseSingleLogo from './BrowseSingleLogo';
import { useUploadMutation } from '../../../redux/services/PartyMasterService';

const PartyLogoUpload = ({ logo, setLogo, id, setIsPartyLogoOpen }) => {

    console.log(id, "idddparty")
    const [upload] = useUploadMutation();
    const handleUpload = async (text = "uploaded") => {
        try {
            const formData = new FormData()
            formData.append("isDelete", Boolean(!logo))

            if (logo instanceof File) {
                formData.append("image", logo);
            } else if (!logo) {
                formData.append("isDeleteImage", true);

            }
            let returnData = await upload({ id: id, body: formData }).unwrap();
            toast.success(text + " " + "Successfully");
        } catch (error) {
            console.log("handle");
        }
        setIsPartyLogoOpen(false)
    };

    return (
        <div className='grid'>
            <BrowseSingleLogo picture={logo} setPicture={setLogo} />
            <button className='w-full bg-green-400 text-gray-100 rounded-md' onClick={() => handleUpload()}>Upload</button>
        </div>
    )
}

export default PartyLogoUpload
