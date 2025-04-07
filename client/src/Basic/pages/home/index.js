import React, { useState } from "react";
import { AppHeader, AppFooter, Sidebar, Dashboard, Header } from "../../components";
import Modal from "../../../UiComponents/Modal";
import { BranchAndFinyearForm, LogoutConfirm } from "../../components";
import ActiveTabList from "../../components/ActiveTabList";
import secureLocalStorage from "react-secure-storage";
import SuperAdminHeader from "../../components/SuperAdminHeader";

const Home = () => {
  const [isGlobalOpen, setIsGlobalOpen] = useState(false);
  const [logout, setLogout] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false);
  const isSuperAdmin = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "superAdmin"
  );
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
          <SuperAdminHeader
            setIsGlobalOpen={setIsGlobalOpen}
            setLogout={setLogout}
          />
        ) : (
          <div >
            <Header />
            {/* <Dashboard /> */}
            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} isMainDropdownOpen={isMainDropdownOpen} setIsMainDropdownOpen={setIsMainDropdownOpen} />

            {/* <ActiveTabList /> */}


          </div>
        )}

        {/* <AppFooter /> */}


        <div className="flex-1">
          <ActiveTabList />
        </div>
      </div>
    </>
  );
};
export default Home;
