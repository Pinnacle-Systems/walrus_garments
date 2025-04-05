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

} from "../../components";

// import { PatientVisitTransaction, DoctorConsultation } from "../../../pharma/components";

import { CLOSE_ICON } from "../../../icons";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import { AccessoryGroupMaster, AccessoryItemMaster, AccessoryMaster, CountsMaster, LossReasonMaster, ProcessMaster, SizeTemplateMaster, StyleMaster, YarnBlendMaster, YarnMaster, YarnTypeMaster } from "../../../Shocks";
import ContentMaster from "../../../Shocks/ContentMaster";

const ActiveTabList = () => {
  const openTabs = useSelector((state) => state.openTabs);
  const dispatch = useDispatch();

  const tabs = {
    "PAGE MASTER": <PageMaster />,
    "COUNTRY MASTER": <CountryMaster />,
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
  return (
    <div className="overflow-hidden h-[91%] mt-5 p-2 m-3">
      <div className="flex gap-2">
        {openTabs.tabs.map((tab, index) => (
          <div
            key={index}
            className={`px-2  rounded-lg text-[11px] flex content-center items-center gap-1 hover:bg-gray-500 hover:text-white transition my-1 ${tab.active ? "bg-gray-500 text-white border border-gray-500" : "text-gray-500 border border-gray-500"
              }`}
          >
            <button
              onClick={() => {
                dispatch(push({ name: tab.name }));
              }}
            >
              {tab.name}
            </button>
            <button
              onClick={() => {
                dispatch(remove({ name: tab.name }));
              }}
            >
              {CLOSE_ICON}
            </button>
          </div>
        ))}
      </div>
      {openTabs.tabs.map((tab, index) => (
        <div key={index} className={`${tab.active ? "block" : "hidden"}`}>
          {tabs[tab.name]}
        </div>
      ))}
    </div>
  );
};


export default ActiveTabList;
