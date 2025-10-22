import React, { useState, Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { push, remove } from "../../../redux/features/opentabs";
import { CLOSE_ICON, DOUBLE_NEXT_ICON } from "../../../icons";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import secureLocalStorage from "react-secure-storage";
import { ExcessToleranceQty, FiberContent, MaterialMaster, TermsandCondition, YarnNeedle } from "../../../Shocks";
import { AccessoryPurchasecancel, AccessoryPurchaseInward, AccessoryPurchaseOrder, BranchType, GsmMaster, OpeningStock, PurchaseBillEntry, PurchaseCancel, PurchaseInward, RequirementPlanningForm, StockTransfer } from "../../../Uniform/Components";
import MaterialIssue from "../../../Uniform/Components/MaterialIssue";
import MaterialRequestForm from "../../../Uniform/Components/MaterialRequestForm";

// Lazy-loaded components
const CountryMaster = lazy(() => import("../../components/CountryMaster"));
const CertificateMaster = lazy(() => import("../../components/CertificateMaster"));

const PageMaster = lazy(() => import("../../components/PageMaster"));
const StateMaster = lazy(() => import("../../components/StateMaster"));
const CityMaster = lazy(() => import("../../components/CityMaster"));
const DepartmentMaster = lazy(() => import("../../components/DepartmentMaster"));
const EmployeeCategoryMaster = lazy(() => import("../../components/EmployeeCategoryMaster"));
const FinYearMaster = lazy(() => import("../../components/FinYearMaster"));
const UserAndRolesMaster = lazy(() => import("../../components/UserAndRolesMaster"));
const AccountSettings = lazy(() => import("../../components/AccountSettings"));
const ControlPanel = lazy(() => import("../../components/ControlPanel"));
const EmployeeMaster = lazy(() => import("../../components/EmployeeMaster"));
const PartyMaster = lazy(() => import("../../components/PartyMaster"));
const PartyCategorymaster = lazy(() => import("../../components/PartyCategoryMaster"));
const CurrencyMaster = lazy(() => import("../../components/CurrencyMaster"));
const TaxTermMaster = lazy(() => import("../../components/TaxTermMaster"));
const TaxTemplate = lazy(() => import("../../components/TaxTemplate"));
const ColorMaster = lazy(() => import("../../components/ColorMaster"));
const PayTermMaster = lazy(() => import("../../components/PayTermMaster"));
const SizeMaster = lazy(() => import("../../components/SizeMaster"));
const LocationMaster = lazy(() => import("../../components/LocationMaster"));
const MachineMaster = lazy(() => import("../../components/MachineMaster"));
const PageGroupMaster = lazy(() => import("../../components/PageGroupMaster"));
const CompanyMaster = lazy(() => import("../../components/CompanyMaster"));
const Dashboard = lazy(() => import("../../components/Dashboard"));
const PurchaseOrder = lazy(() => import("../../../Uniform/Components/PurchaseOrder"));
const PurchaseReturn = lazy(() => import("../../../Uniform/Components/PurchaseReturnCancel"));
const UomMaster = lazy(() => import("../../components/Uommaster"));
const MeasurementMaster = lazy(() => import("../../components/MeasurementMaster"));
const AccessoryGroupMaster = lazy(() => import("../../../Shocks/AccessoryGroupMaster"));
const AccessoryItemMaster = lazy(() => import("../../../Shocks/AccessoryItemMaster"));
const AccessoryMaster = lazy(() => import("../../../Shocks/AccessoryMaster"));
const CountsMaster = lazy(() => import("../../../Shocks/CountsMaster"));
const LossReasonMaster = lazy(() => import("../../../Shocks/LossReasonMaster"));
const ProcessMaster = lazy(() => import("../../../Shocks/ProcessMaster"));
const SizeTemplateMaster = lazy(() => import("../../../Shocks/SizeTemplateMaster"));
const SocksMaterial = lazy(() => import("../../../Shocks/SocksMaterial"));
const SocksType = lazy(() => import("../../../Shocks/SocksType"));
const StyleMaster = lazy(() => import("../../../Shocks/StyleMaster"));
const YarnBlendMaster = lazy(() => import("../../../Shocks/YarnBlendMaster"));
const YarnMaster = lazy(() => import("../../../Shocks/YarnMaster"));
const YarnTypeMaster = lazy(() => import("../../../Shocks/YarnTypeMaster"));
const ContentMaster = lazy(() => import("../../../Shocks/ContentMaster"));
const FabricMaster = lazy(() => import("../../../Uniform/Components/FabricMaster"));
const Order = lazy(() => import("../../../Uniform/Components/Order"));
const Sample = lazy(() => import("../../../Uniform/Components/SampleEntry"));
const SampleFollow = lazy(() => import("../../../Uniform/Components/SampleFollow"));
const HsnMaster = lazy(() => import("../../components/HsnMaster"));

const ActiveTabList = ({ isSuperAdmin }) => {
  const openTabs = useSelector((state) => state.openTabs);
  const dispatch = useDispatch();
  const [showHidden, setShowHidden] = useState(false);
  const ref = useOutsideClick(() => { setShowHidden(false) });

  const tabs = {
    "PAGE MASTER": <PageMaster />,
    "COMPANY MASTER": <CompanyMaster />,
    "PAGE GROUP MASTER": <PageGroupMaster />,
    "COUNTRY MASTER": <CountryMaster />,
    "CERTIFICATE MASTER": <CertificateMaster />,
    "MACHINE MASTER": <MachineMaster />,
    "STATE MASTER": <StateMaster />,
    "TAX TERM MASTER": <TaxTermMaster />,
    "TAX TEMPLATE": <TaxTemplate />,
    "CITY MASTER": <CityMaster />,
    "DEPARTMENT MASTER": <DepartmentMaster />,
    "EMPLOYEE CATEGORY MASTER": <EmployeeCategoryMaster />,
    "FIN YEAR MASTER": <FinYearMaster />,
    "USERS & ROLES": <UserAndRolesMaster />,
    "ACCOUNT SETTINGS": <AccountSettings />,
    "CONTROL PANEL": <ControlPanel />,
    "EMPLOYEE MASTER": <EmployeeMaster />,
    "CUSTOMER/SUPPLIER MASTER": <PartyMaster />,
    "PARTY CATEGORY MASTER": <PartyCategorymaster />,
    "CURRENCY MASTER": <CurrencyMaster />,
    "COLOR MASTER": <ColorMaster />,
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
    "ORDER": <Order />,
    "DASHBOARD": <Dashboard />,
    "SHOCKS MATERIAL MASTER": <SocksMaterial />,
    "SOCKS TYPE MASTER": <SocksType />,
    "YARN PURCHASE ORDER": <PurchaseOrder />,
    "UOM MASTER": <UomMaster />,
    "GSM MASTER": <GsmMaster />,
    "PAY TERM MASTER": <PayTermMaster />,
    "MEASUREMENT MASTER": <MeasurementMaster />,
    "FABRIC MASTER": <FabricMaster />,
    "FIBER CONTENT MASTER": <FiberContent />,
    "YARN NEEDLE MASTER": <YarnNeedle />,
    "SAMPLE ENTRY": <Sample />,
    "MATERIAL MASTER": <MaterialMaster />,
    "SAMPLE FOLLOW": <SampleFollow />,
    "YARN PURCHASE INWARD": <PurchaseInward />,
    "YARN PURCHASE RETURN": <PurchaseReturn />,
    "YARN OPENING STOCK": <OpeningStock />,
    "YARN PURCHASE ORDER CANCEL": <PurchaseCancel />,
    "BRANCH TYPE MASTER": <BranchType />,
    "REQUIREMENT PLANNING FORM": <RequirementPlanningForm />,
    "MATERIAL REQUEST FORM": <MaterialRequestForm />,
    "MATERIAL ISSUE FORM": <MaterialIssue />,
    "STOCK TRANSFER": <StockTransfer />,
    "EXCESS TOLERANCE(%) ENTRY": <ExcessToleranceQty />,
    "ACCESSORY PURCHASE ORDER": <AccessoryPurchaseOrder />,
    "ACCESSORY PURCHASE CANCEL": <AccessoryPurchasecancel />,
    "ACCESSORY PURCHASE INWARD": <AccessoryPurchaseInward />,
    "TERMS & CONDTIONS MASTER" : <TermsandCondition/> ,
    "HSN MASTER" : <HsnMaster/> ,
    "PURCHASE BILL ENTRY" :  <PurchaseBillEntry />



  };


  const innerWidth = window.innerWidth;
  const itemsToShow = innerWidth / 130;
  let currentShowingTabs = openTabs.tabs.slice(0, parseInt(itemsToShow));
  const hiddenTabs = openTabs.tabs.slice(parseInt(itemsToShow));


  function initialTab() {
    if (currentShowingTabs?.length == 0 && !isSuperAdmin) {
      dispatch(push(
        {
          active: true,
          name: "DASHBOARD",
        }

      ));
    }
    else {
      return
    }
  }
  return (
    <div className="relative">
      <div className="flex justify-between">
        <div className="flex gap-2">
          {currentShowingTabs?.length == 0 ? initialTab() : currentShowingTabs?.map((tab, index) => (
            <div
              key={index}
              className={`px-2 rounded-lg text-[11px] d-flex content-center items-center gap-1 hover:bg-gray-500 hover:text-white transition my-1 ${tab.active
                ? "bg-gray-500 text-white border border-gray-500"
                : "text-gray-500 border border-gray-500"
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
                className="px-1 rounded-xs transition"
                onClick={() => {
                  dispatch(remove({ name: tab.name }));
                }}
              >
                {CLOSE_ICON}
              </button>
            </div>
          ))}
        </div>
        <div>
          {hiddenTabs.length !== 0 && (
            <button onClick={() => setShowHidden(true)}>
              {DOUBLE_NEXT_ICON}
            </button>
          )}
        </div>
        {showHidden && (
          <ul
            ref={ref}
            className="absolute right-0 top-5 bg-gray-200 z-50 text-xs p-1"
          >
            {hiddenTabs.map((tab) => (
              <li
                key={tab.name}
                className={`flex justify-between ${tab.active ? "bg-green-300" : "bg-gray-300"
                  } `}
              >
                <button
                  onClick={() => {
                    dispatch(push({ name: tab.name }));
                  }}
                >
                  {tab.name}
                </button>
                <button
                  className="hover:bg-red-400 px-1 rounded-xs transition"
                  onClick={() => {
                    dispatch(remove({ name: tab.name }));
                  }}
                >
                  {CLOSE_ICON}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {openTabs?.tabs?.map((tab, index) => (
        <div key={index} className={`${tab.active ? "block" : "hidden"}`}>
          <Suspense fallback={<div>Loading...</div>}>
            {tabs[tab.name]}
          </Suspense>
        </div>
      ))}
    </div>
  );
};

export default ActiveTabList;