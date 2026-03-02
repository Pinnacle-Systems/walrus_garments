import { useState } from "react";
import { getCommonParams } from "../../../Utils/helper";
import secureLocalStorage from "react-secure-storage";
import NotificationPopup from "../StockAlert";
import { useGetMinStockAlertReportQuery } from "../../../redux/services/StockService";


const NotificationBell = ({ onShowPopup }) => {
    const { branchId, companyId, finYearId, userId, employeeId, userRole } = getCommonParams();
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeTab, setActiveTab] = useState('pending');
    const [popupType, setPopupType] = useState('testing');


    const params = {
        branchId,
        userId,
        finYearId,
        employeeId,
        userRole,
        testing: popupType === 'developer' ? false : true,
    };
    const params1 = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };


    const {
        data: allData,
        isLoading,
        isFetching,
    } = useGetMinStockAlertReportQuery({});
    const handleBellClick = () => {
        if (1 > 0) {
            setShowNotificationPopup(true);
        }
        setShowDropdown(false);
    };

    return (
        <div className="relative">
            <button
                onClick={handleBellClick}
            // onMouseEnter={() => !isLoading && totalTasksCount > 0 && setShowDropdown(true)}
            // disabled={isLoading}
            // className={`
            //     relative p-2 rounded-lg transition-all duration-200 ease-in-out
            //     ${isLoading
            //         ? 'text-gray-400 cursor-not-allowed'
            //         : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
            //     }
            // `}
            >
                {false ? (
                    <div className="h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                ) : (
                    <>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {allData?.data?.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium shadow-sm animate-pulse">
                                {allData?.data?.length > 99 ? '99+' : allData?.data?.length}
                            </span>
                        )}
                    </>
                )}
            </button>

            {showNotificationPopup && (
                <NotificationPopup
                    onClose={() => setShowNotificationPopup(false)}
                    allData={allData}

                />
            )}
        </div>
    );
};

export default NotificationBell;