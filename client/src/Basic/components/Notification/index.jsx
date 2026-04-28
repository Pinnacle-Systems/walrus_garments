import { useState } from "react";
import { getCommonParams } from "../../../Utils/helper";
import secureLocalStorage from "react-secure-storage";
import NotificationPopup from "../StockAlert";
import { useGetPointOfSalesQuery } from "../../../redux/uniformService/PointOfSalesService";
import { useGetMinStockAlertReportQuery } from "../../../redux/services/StockService";


const NotificationBell = ({ onShowPopup }) => {
    const { branchId, companyId, finYearId, userId, employeeId, userRole } = getCommonParams();
    const [showNotificationPopup, setShowNotificationPopup] = useState(false);

    // Fetch Pending Discount Requests
    const { data: posData } = useGetPointOfSalesQuery({
        params: { branchId, approvalStatus: true, userRole }
    });

    const pendingDiscountCount = posData?.data?.length || 0;

    const {
        data: allData,
        isLoading,
        isFetching,
    } = useGetMinStockAlertReportQuery({});

    const totalNotifications = (allData?.data?.length || 0) + pendingDiscountCount;
    const handleBellClick = () => {
        if (1 > 0) {
            setShowNotificationPopup(true);
        }
        setShowDropdown(false);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={handleBellClick}
                className="flex h-5 w-5 items-center justify-center rounded-full border-0 bg-transparent p-0 leading-none text-black appearance-none"
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
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin"></div>
                ) : (
                    <>
                        <svg className="block h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {totalNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium shadow-sm animate-pulse">
                                {totalNotifications > 99 ? '99+' : totalNotifications}
                            </span>
                        )}
                    </>
                )}
            </button>

            {showNotificationPopup && (
                <NotificationPopup
                    onClose={() => setShowNotificationPopup(false)}
                    allData={allData}
                    posData={posData}
                />
            )}
        </div>
    );
};

export default NotificationBell;
