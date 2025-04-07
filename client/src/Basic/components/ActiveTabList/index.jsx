import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { push, remove } from "../../../redux/features/opentabs";
import {
  CountryMaster, PageMaster, StateMaster, CityMaster,
  DepartmentMaster, EmployeeCategoryMaster, FinYearMaster, UserAndRolesMaster,
  AccountSettings, ControlPanel, EmployeeMaster,
  PartyMaster,
  PartyCategorymaster,
  CurrencyMaster,
  ColorMaster,
  PayTermMaster,
  SizeMaster,
  LocationMaster,
  MachineMaster,

} from "../../components";

// import { PatientVisitTransaction, DoctorConsultation } from "../../../pharma/components";

import { CLOSE_ICON, DOUBLE_NEXT_ICON } from "../../../icons";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import { AccessoryGroupMaster, AccessoryItemMaster, AccessoryMaster, CountsMaster, LossReasonMaster, ProcessMaster, SizeTemplateMaster, StyleMaster, YarnBlendMaster, YarnMaster, YarnTypeMaster } from "../../../Shocks";
import ContentMaster from "../../../Shocks/ContentMaster";
import secureLocalStorage from "react-secure-storage";

const ActiveTabList = () => {
  const openTabs = useSelector((state) => state.openTabs);


  const dispatch = useDispatch();
  const [showHidden, setShowHidden] = useState(false);
  const [isAllowableUser, setIsAllowableUser] = useState(false)

  const ref = useOutsideClick(() => { setShowHidden(false) })

  const tabs = {
    "PAGE MASTER": <PageMaster />,
    // "COMPANY MASTER": <CompanyMaster />,
    // "PAGE GROUP MASTER": <PageGroupMaster />,
    "COUNTRY MASTER": <CountryMaster />,
    "MACHINE MASTER": <MachineMaster />,
    "STATE MASTER": <StateMaster />,
    "CITY MASTER": <CityMaster />,
    "DEPARTMENT MASTER": <DepartmentMaster />,
    "EMPLOYEE CATEGORY MASTER": <EmployeeCategoryMaster />,
    "FIN YEAR MASTER": <FinYearMaster />,
    "USERS & ROLES": <UserAndRolesMaster />,
    "ACCOUNT SETTINGS": <AccountSettings />,
    "CONTROL PANEL": <ControlPanel />,
    "EMPLOYEE MASTER": <EmployeeMaster />,
    "PARTY MASTER": <PartyMaster />,
    "PARTY CATEGORY MASTER": <PartyCategorymaster />,
    "CURRENCY MASTER": <CurrencyMaster />,
    "COLOR MASTER": <ColorMaster />,
    "PAY TERM MASTER": <PayTermMaster />,
    "SIZE MASTER": <SizeMaster />,
    "LOCATION MASTER": <LocationMaster />,
    "STYLE MASTER": <StyleMaster />,
    "PROCESS MASTER": <ProcessMaster />,
    "SIZE TEMPLATE MASTER": <SizeTemplateMaster />,
    "LOSS REASON MASTER": <LossReasonMaster />,
    "CONTENT MASTER": <ContentMaster />,
    "YARN TYPE MASTER": <YarnTypeMaster />,
    "YARN BLEND MASTER": <YarnBlendMaster />,
    "YARN MASTER": <YarnMaster />,
    "COUNTS MASTER": <CountsMaster />,
    "ACCESSORY GROUP MASTER": <AccessoryGroupMaster />,
    "ACCESSORY ITEM MASTER": <AccessoryItemMaster />,
    "ACCESSORY MASTER": <AccessoryMaster />,

  };
  const innerWidth = window.innerWidth;
  const itemsToShow = innerWidth / 130;

  let currentShowingTabs = openTabs.tabs.slice(0, parseInt(itemsToShow));

  const hiddenTabs = openTabs.tabs.slice(parseInt(itemsToShow));
  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId"
  )
  return (
    <div className="relative">
      <div className="flex justify-between">
        <div className="flex gap-2">
          {(currentShowingTabs)?.map((tab, index) => (
            <div
              key={index}
              className={`p-1 rounded-t-md text-[10px] flex justify-center gap-1 ${tab.active ? "bg-red-300" : "bg-white"
                }`}
            >
              <button
                onClick={() => {
                  dispatch(push({ name: tab.name }));
                  // dispatch(push({ id: tab.id }));
                }}
              >
                {tab.name}
              </button>
              <button className="px-1 rounded-xs transition"
                onClick={() => {
                  dispatch(remove({ name: tab.name }));
                  // dispatch(remove({ id: tab.id }));
                }}
              >
                {CLOSE_ICON}
              </button>
            </div>
          ))}
        </div>
        <div>
          {(hiddenTabs.length !== 0) &&
            <button onClick={() => setShowHidden(true)}>
              {DOUBLE_NEXT_ICON}
            </button>
          }
        </div>
        {showHidden &&
          <ul ref={ref} className="absolute right-0 top-5 bg-gray-200 z-50 text-xs p-1">
            {hiddenTabs.map(tab =>
              <li key={tab.name} className={`flex justify-between  ${tab.active ? "bg-green-300" : "bg-gray-300"
                } `}>
                <button
                  onClick={() => {
                    dispatch(push({ name: tab.name }));
                    // dispatch(push({ id: tab.id }));
                  }}
                >
                  {tab.name}
                </button>
                <button className="hover:bg-red-400 px-1 rounded-xs transition"
                  onClick={() => {
                    dispatch(remove({ name: tab.name }));
                    // dispatch(remove({ id: tab.id }));
                  }}
                >
                  {CLOSE_ICON}
                </button>
              </li>
            )}
          </ul>
        }
      </div>
      {/* <MonthlySales /> */}
      {(openTabs?.tabs)?.map((tab, index) => (
        <div key={index} className={`${tab.active ? "block" : "hidden"}`}>
          {tabs[tab.name]}
        </div>
      ))}
    </div>
  );
};


export default ActiveTabList;
