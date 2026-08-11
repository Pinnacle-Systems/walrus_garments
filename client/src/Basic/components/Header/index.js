
import "./Header.css"
import dp from "../../../assets/default-dp.png"
import { AlertTriangle, Bell, CheckCircle2, Loader2, Printer, RefreshCw, Search } from "lucide-react"
import Profile from "./Profile";
import logo from "../../../../src/assets/walrusNew.png"
// import { useState } from "react"
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
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { push } from "../../../redux/features/opentabs";
import Swal from "sweetalert2";
import NotificationBell from "../Notification";
import PageSearch from "./PageSearch";
import { GLOBE_ICON } from "../../../icons";
import useLocalPrintAgentStatus from "../../../hooks/useLocalPrintAgentStatus";
import { openLocalPrintAgentSetup } from "../../../Utils/localPrintAgent";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const Header = ({ profile, setIsGlobalOpen }) => {



    const [logout, setLogout] = useState(false);
    const [hideNavBar, sethideNavBar] = useState(true);



    const navBatItemsStyle = hideNavBar ? "hidden" : "";

    const [allowedPages, setAllowedPages] = useState([]);
    const [showStockAlertPopup, setStockAlertPopup] = useState(false);





    const dispatch = useDispatch()



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


    const printAgentContainerRef = React.useRef(null);
    const [showPrintAgentDetails, setShowPrintAgentDetails] = React.useState(false);

    const { connected: printAgentConnected, loading: printAgentLoading, health: printAgentHealth, retry: retryPrintAgent } = useLocalPrintAgentStatus();

    function getRoleStatusLabel(connected, health, roleKey) {
        if (!connected) return 'Not Configured';
        const role = health?.roles?.[roleKey];
        if (!role || !role.configured) return 'Not Configured';
        if (role.configured && role.printerFound === false) return 'Printer Missing';
        return 'Ready';
    }

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
                    // toast.error("Server Down", { autoClose: 5000 });
                    Swal.fire({
                        title: "Server Down",
                        icon: "error",

                    });

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
                    // toast.error("Server Down", { autoClose: 5000 });
                    Swal.fire({
                        title: "Server Down",
                        icon: "error",

                    });


                }
            );
        }
    }, []);
    useEffect(retrieveAllowedPages, [retrieveAllowedPages]);



    return (

        <div className='fixed inset-x-0 top-0 z-50 flex h-10 w-full items-center justify-between bg-white px-2 sm:px-4 shadow-sm'>
            <Modal
                isOpen={logout}
                onClose={() => {
                    setLogout(false);
                }}
                widthClass={""}
            >
                <Logout setLogout={setLogout} />
            </Modal>
            <div className="flex shrink-0 items-center">
                <img className="h-5"
                    src={logo}
                    alt="" />
            </div>
            <div className="mr-1 md:mr-9 flex items-center gap-1.5 sm:gap-3">
                {/* <div className='flex items-center text-[12px] border rounded-full relative mr-3'>
                    <input className=' px-2 py-1 w-60 text-[12px] rounded-full' placeholder='search' type='text' name='password' id='password' />
                    <div className='absolute right-2  text-neutral-500'>
                        <Search size={15} />
                    </div>
                </div> */}
                <div ref={printAgentContainerRef} className="relative">
                    <button
                        onClick={() => setShowPrintAgentDetails((v) => !v)}
                        title="Local Print Agent Status"
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm transition-all ${printAgentConnected
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                    >
                        {printAgentLoading ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : printAgentConnected ? (
                            <CheckCircle2 size={12} />
                        ) : (
                            <AlertTriangle size={12} />
                        )}
                        Print Agent: {printAgentConnected ? 'Connected' : 'Not Connected'}
                    </button>

                    {showPrintAgentDetails && (
                        <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-3 text-left">
                            {!printAgentConnected ? (
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs font-bold text-rose-600">Local Print Agent is not running on this machine.</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={retryPrintAgent}
                                            className="flex items-center gap-1 text-[11px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-md hover:bg-indigo-100"
                                        >
                                            <RefreshCw size={12} /> Retry
                                        </button>
                                        <button
                                            onClick={openLocalPrintAgentSetup}
                                            className="flex items-center gap-1 text-[11px] font-black uppercase text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-100"
                                        >
                                            <Printer size={12} /> Open Local Printer Setup
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {printAgentHealth?.printerName && (
                                        <p className="text-[10px] text-slate-400">Printer (support info): {printAgentHealth.printerName}</p>
                                    )}
                                    {PRINT_ROLES.map((role) => {
                                        const statusLabel = getRoleStatusLabel(printAgentConnected, printAgentHealth, role.key);
                                        const isReady = statusLabel === 'Ready';
                                        return (
                                            <div key={role.key} className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-slate-600">{role.label}:</span>
                                                <span className={`font-black ${isReady ? 'text-emerald-600' : 'text-amber-600'}`}>{statusLabel}</span>
                                            </div>
                                        );
                                    })}
                                    {PRINT_ROLES.some((role) => getRoleStatusLabel(printAgentConnected, printAgentHealth, role.key) !== 'Ready') && (
                                        <div className="flex flex-col gap-1 pt-1 border-t border-slate-100">
                                            <p className="text-[10px] text-slate-500">
                                                {PRINT_ROLES.find((role) => getRoleStatusLabel(printAgentConnected, printAgentHealth, role.key) === 'Not Configured')?.label || 'A'} printer is not configured for this counter.
                                            </p>
                                            <button
                                                onClick={popenLocalPrintAgentSetup}
                                                className="flex items-center gap-1 text-[11px] font-black uppercase text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-100 w-fit"
                                            >
                                                <Printer size={12} /> Open Local Printer Setup
                                            </button>
                                        </div>
                                    )}
                                </div>
                                // <></>
                            )}
                        </div>
                    )}
                </div>
                <PageSearch pageList={allowedPages} />
                <div
                    className="text-lg cursor-pointer"
                    onClick={() => { setIsGlobalOpen(true) }}>
                    {GLOBE_ICON}
                </div>
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-beige">
                    <NotificationBell />
                </div>

                <div className="relative text-left">
                    <button
                        ref={ref}
                        onClick={toggleNavMenu}
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-2xl"
                        id="menu-button"
                        aria-expanded="true"
                        aria-haspopup="true"
                    >
                        <img className="rounded-full cursor-pointer" width={'25px'}
                            src={dp}
                            alt="image" />

                    </button>
                    <div
                        className={`right-0 absolute mt-2 w-52 origin-top-right rounded-md z-50 shadow-lg border border-gray-100 ${navBatItemsStyle}`}
                    >
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
                            </div>
                        </div>
                        <button className="nav-dropdown-bg z-99 p-2 w-full" onClick={() => { dispatch(push({ id: 1000000, name: "ACCOUNT SETTINGS" })) }}>
                            <pre>ACCOUNT SETTINGS</pre>
                        </button>
                        {allowedPages.filter((page) => page.type === "AdminAccess")?.map((item, index) => (
                            <button
                                key={index}
                                type="link"
                                className="nav-dropdown-bg z-99 p-2 text-start block w-full"
                                onClick={(e) => {
                                    dispatch(push({ id: item.id, name: item.name }))
                                    secureLocalStorage.setItem(
                                        sessionStorage.getItem("sessionId") + "currentPage",
                                        item.id
                                    );
                                }}
                            >
                                <pre>{item.name}</pre>
                            </button>
                        ))}

                        <button className="nav-dropdown-bg z-50 p-2 w-full" onClick={() => setLogout(true)}>
                            <pre>LOG OUT</pre>

                        </button>

                    </div>
                </div>
            </div>

        </div>
    )
}

export default Header
