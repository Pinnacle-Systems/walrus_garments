import { LogOut } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import Modal from '../../../UiComponents/Modal';
import Logout from '../LogoutConfirm';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { useGetUserByIdQuery } from '../../../redux/services/UsersMasterService';
import { toast } from 'react-toastify';
import { useGetPageGroupQuery } from '../../../redux/services/PageGroupMasterServices';
import { useGetProjectQuery } from '../../../redux/services/ProjectService';
import axios from 'axios';
import { PAGES_API, ROLES_API } from '../../../Api';
import AccountDetailsDropDown from './AccountsDropDown';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";


const BASE_URL = process.env.REACT_APP_SERVER_URL;


const Profile = ({ dp, items, setProfile }) => {
    const [logout, setLogout] = useState(false);
    const navigate = useNavigate();

    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )


    const [allowedPages, setAllowedPages] = useState([]);
    const [formReport, setFormReport] = useState(false)





    const dispatch = useDispatch()

    const [hideNavBar, sethideNavBar] = useState(true);

    const navBatItemsStyle = hideNavBar ? "hidden" : "";

    const handleOutsideClick = () => {
        sethideNavBar(true);
    };

    const ref = useOutsideClick(handleOutsideClick);

    const toggleNavMenu = () => {
        sethideNavBar(!hideNavBar);
    };
    const id = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId")
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetUserByIdQuery(id);


    const retrieveAllowedPages = useCallback(() => {
        const defaultAdminRaw = secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "defaultAdmin"
        );

        let defaultAdmin = false;
        try {
            if (typeof defaultAdminRaw === "string") {
                defaultAdmin = JSON.parse(defaultAdminRaw);
            } else {
                defaultAdmin = defaultAdminRaw;
            }
        } catch (e) {
            console.error("Failed to parse defaultAdmin:", e);
            defaultAdmin = false;
        }
        if (
            defaultAdmin
        ) {
            axios({
                method: "get",
                url: BASE_URL + PAGES_API,
                params: { active: true },
            }).then(
                (result) => {
                    console.log("result", result.data.data);
                    setAllowedPages(result.data.data);
                },
                (error) => {
                    console.log(error);
                    toast.error("Server Down", { autoClose: 5000 });
                }
            );
        } else {
            axios({
                method: "get",
                url:
                    BASE_URL +
                    ROLES_API +
                    `/${secureLocalStorage.getItem(
                        sessionStorage.getItem("sessionId") + "userRoleId"
                    )}`,
            }).then(
                (result) => {
                    if (result.status === 200) {
                        if (result.data.statusCode === 0) {
                            setAllowedPages(
                                result.data.data.RoleOnPage.filter(
                                    (page) => page.page.active && page.read
                                ).map((page) => {
                                    return {
                                        name: page.page.name,
                                        type: page.page.type,
                                        link: page.page.link,
                                        id: page.page.id,
                                        pageGroupId: page.page.pageGroupId
                                    };
                                })
                            );
                        }
                    } else {
                        console.log(result);
                    }
                },
                (error) => {
                    console.log(error);
                    toast.error("Server Down", { autoClose: 5000 });
                }
            );
        }
    }, []);
    useEffect(retrieveAllowedPages, [retrieveAllowedPages]);



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
            <AccountDetailsDropDown setLogout={setLogout} setProfile={setProfile}
                items={allowedPages.filter((page) => page.type === "AdminAccess")}
            />
            <div className="flex text-[12px] items-center mt-3 pt-3 border-t mx-2" style={{ borderTopWidth: '0.5px', borderColor: '#dce1e9' }}>
                <span onClick={() => setLogout(true)} className="flex items-center cursor-pointer">
                    <LogOut className="mr-2" size={20} />
                    Log Out
                </span>
            </div>
        </div>
       
    )
}

export default Profile
