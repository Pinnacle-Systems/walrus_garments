import { LogOut } from 'lucide-react'
import React, { useState } from 'react'
import Modal from '../../../UiComponents/Modal';
import Logout from '../LogoutConfirm';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { useGetUserByIdQuery } from '../../../redux/services/UsersMasterService';

const Profile = ({ dp, setProfile }) => {
    const [logout, setLogout] = useState(false);
    const navigate = useNavigate();

    const id = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId")
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetUserByIdQuery(id);
    return (
        <div className="absolute rounded-lg right-0 top-10 bg-white p-3 shadow w-[300px] z-10">
            <Modal
                isOpen={logout}
                onClose={() => {
                    setLogout(false);
                }}
                widthClass={""}
            >
                <Logout setLogout={setLogout} />
            </Modal>
            <div className="font-semibold">Profile</div>
            <div className="bg-beige flex p-2 items-center rounded-lg">
                <div className="mr-2 w-12">
                    <img className="rounded-full" width={'30px'} height={'30px'} src={dp} alt="image" />
                </div>
                <div>
                    <div className="text-sm text-black my-0 py-0">
                        {secureLocalStorage.getItem(
                            sessionStorage.getItem("sessionId") + "username"
                        )}
                    </div>
                    <div className="text-[11px] p-0 text-gray-400 -mt-1 ">{singleData?.data?.email}</div>
                    {/* <button onClick={() => { navigate("/dashboard/accountsettings"); setProfile(false) }} className="button border border-black  rounded hover:bg-stone-900 hover:text-white mt-2">Edit Profile</button> */}
                </div>
            </div>
            <div>
                <div className="flex text-[12px] items-center mt-3 pt-3 border-t mx-2" style={{ borderTopWidth: '0.5px', borderColor: '#dce1e9' }}>
                    <span onClick={() => setLogout(true)} className="flex items-center cursor-pointer">
                        <LogOut className="mr-2" size={20} />
                        Sign Out
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Profile
