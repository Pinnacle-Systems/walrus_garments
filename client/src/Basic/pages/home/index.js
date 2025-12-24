import React, { useEffect, useState } from "react";
import { AppHeader, AppFooter, Sidebar, Dashboard, Header } from "../../components";
import Modal from "../../../UiComponents/Modal";
import { BranchAndFinyearForm, LogoutConfirm } from "../../components";
import ActiveTabList from "../../components/ActiveTabList";
import secureLocalStorage from "react-secure-storage";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useIdleLogout } from "../../../Utils/helper";

const Home = () => {
  const [isGlobalOpen, setIsGlobalOpen] = useState(false);
  const [logout, setLogout] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false);
  const [profile, setProfile] = useState(false);
  const isSuperAdmin = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "superAdmin"
  );
  const navigate = useNavigate();
  const openTabs = useSelector((state) => state.openTabs);


      const [isLoggedIn, setIsLoggedIn] = useState(false);
    
      
      const handleLogout = () => {
        secureLocalStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
    
      };
    
      console.log('isLoggedIn status:', isLoggedIn);  
    
      useEffect(() => {
        setIsLoggedIn(!!sessionStorage.getItem("sessionId"));
      }, []); 
      
      useIdleLogout(handleLogout, isLoggedIn);
  return (
    <>
      <Modal
        isOpen={isGlobalOpen}
        onClose={() => {
          setIsGlobalOpen(false);
        }}
        widthClass={""}
      >
        <BranchAndFinyearForm setIsGlobalOpen={setIsGlobalOpen} />
      </Modal>
      <Modal
        isOpen={logout}
        onClose={() => {
          setLogout(false);
        }}
        widthClass={""}
      >
        <LogoutConfirm setLogout={setLogout} />
      </Modal>
      <div className="h-screen overflow-hidden">
        {isSuperAdmin ? (
          <>
            <SuperAdminHeader
              setIsGlobalOpen={setIsGlobalOpen}
              setLogout={setLogout}
            />
            <div className="">
              <ActiveTabList isSuperAdmin={isSuperAdmin} />

            </div>

          </>
        ) : (
          <div >
            <Header profile={profile} setProfile={setProfile} />

            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} isMainDropdownOpen={isMainDropdownOpen} setIsMainDropdownOpen={setIsMainDropdownOpen} />
            <div className="mt-[30px]  p-5 bg-gray-100  :tab">
              <ActiveTabList  isSuperAdmin={isSuperAdmin} />
              {openTabs.tabs.length === 0 ? <Dashboard   /> : ''}
            </div>


          </div>
        )}

        {/* <AppFooter /> */}

        {/* 
        <div className="flex-1">
          <ActiveTabList />
        </div> */}
      </div>
    </>
  );
};
export default Home;
