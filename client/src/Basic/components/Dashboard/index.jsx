import { Bar, Doughnut, Line } from "react-chartjs-2";
import './Dashboard.css'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import { useEffect, useState } from "react";
import { IndianRupee, PieChart, TrendingUp, UserCheck, UsersRound, UserX, Wallet, Receipt, ShoppingBag, Clock } from "lucide-react";
import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { DASHBOARD_API } from "../../../Api";
import { useLazyGetSalesAnalyticsQuery } from "../../../redux/uniformService/DashboardService";
import Modal from "../../../UiComponents/Modal";
import TotalSalesBreakup from "./DashBoardBreakTables/SalesBreakup";
import TodaySalesBreakup from "./DashBoardBreakTables/SalesBreakup";
import TodaySalesReturnsBreakup from "./DashBoardBreakTables/SalesReturnsBreakup";
import CustomerAdvancesBreakup from "./DashBoardBreakTables/CustomerAdvancesBreakup";
import ExpensesBreakup from "./DashBoardBreakTables/ExpensesBreakup";
import PendingDeliveriesBreakup from "./DashBoardBreakTables/PendingDeliveriesBreakup";

import TodaySales from "./SalesReports/TodaySales";
import WeeklySales from "./SalesReports/WeeklySales";
import MonthlySales from "./SalesReports/MonthlySales";
import YearlySales from "./SalesReports/YearlySales";
import SlowMovementItem from "./SalesReports/SlowMovementItem";
import SalesPeriodBreakup from "./DashBoardBreakTables/SalesPeriodBreakup";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const Dashboard = () => {

    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        LineElement,
        PointElement,
        Title,
        Tooltip,
        Legend, ArcElement
    );

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('today');
    const [salesAnalytics, setSalesAnalytics] = useState(null);
    const [salesBreakupConfig, setSalesBreakupConfig] = useState({ isOpen: false, timeframe: '', filterValue: '', title: '' });
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', type: '' });

    // New Dynamic Filter States
    const [customerType, setCustomerType] = useState('All'); // 'All', 'B2B', 'B2C'
    const [finYear, setFinYear] = useState('26-27'); // '25-26', '24-25', '23-24', 'All'
    const [saleTypeFilter, setSaleTypeFilter] = useState('All'); // 'All', 'Sales', 'Returns'

    const [dashboardData, setDashboardData] = useState({
        kpis: {
            todaySales: 0,
            todayCollections: 0,
            customerAdvances: 0,
            pendingOrders: 0,
            todayExpenses: 0,
            pendingQuotations: 0,
            pendingDeliveries: 0
        },
        breakups: {
            todaySales: [],
            todayCollections: [],
            customerAdvances: [],
            todayExpenses: [],
            pendingQuotations: [],
            pendingDeliveries: []
        },
        charts: {
            salesTrend: [],
            expenseDistribution: []
        },
        topProducts: [],
        recentOrders: []
    });

    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    );

    const [triggerSalesAnalytics, { data: analyticsRes, isFetching: isFetchingAnalytics }] = useLazyGetSalesAnalyticsQuery();
    const loadingAnalytics = isFetchingAnalytics;

    useEffect(() => {
        fetchDashboardData();
    }, [branchId]);

    useEffect(() => {
        fetchSalesAnalytics();
    }, [branchId, customerType, finYear, saleTypeFilter]);

    useEffect(() => {
        if (analyticsRes?.statusCode === 0) {
            setSalesAnalytics(analyticsRes.data);
        }
    }, [analyticsRes]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}${DASHBOARD_API}/management-insights`, {
                params: { branchId }
            });
            if (response.data.statusCode === 0) {
                setDashboardData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSalesAnalytics = () => {
        triggerSalesAnalytics({
            branchId,
            customerType,
            finYear,
            saleTypeFilter
        });
    };

    const barData = {
        labels: dashboardData?.charts?.salesTrend?.map(d => d.label),
        datasets: [
            {
                label: "Monthly Sales (₹)",
                data: dashboardData?.charts?.salesTrend?.map(d => d.value),
                backgroundColor: "#5CB338",
            },
        ],
    };

    const chatData = {
        labels: dashboardData?.charts?.expenseDistribution?.map(d => d.name),
        datasets: [
            {
                data: dashboardData?.charts?.expenseDistribution?.map(d => d.value),
                backgroundColor: ['#6366F1', '#22C55E', '#F97316', '#EC4899', '#8B5CF6'],
                borderColor: ['#6366F1', '#22C55E', '#F97316', '#EC4899', '#8B5CF6'],
                borderWidth: 1,
            },
        ],
    };

    const handleShowSalesBreakup = (config) => {
        setSalesBreakupConfig({
            isOpen: true,
            timeframe: config.timeframe,
            filterValue: config.filterValue,
            title: config.title
        });
    };

    const handleCardClick = (label, type) => {
        setModalConfig({ isOpen: true, title: `${label} Breakup`, type });
    };


    const cardsData = [
        { label: "Today's Sales", type: 'todaySales', value: `₹${(dashboardData.kpis.todaySales || 0).toLocaleString()}`, logo: <ShoppingBag size={35} color={'#30b5fc'} />, color: 'border-blue-500' },
        { label: "Today's Returns", type: 'todaySalesReturns', value: `₹${(dashboardData.kpis.todaySalesReturns || 0).toLocaleString()}`, logo: <Clock size={35} color={'#8B5CF6'} />, color: 'border-purple-500' },

        { label: "Cash flow", type: 'cashFlow', value: `₹${(dashboardData.kpis.customerAdvances || 0).toLocaleString()}`, logo: <Wallet size={35} color={'#22C55E'} />, color: 'border-green-500' },
        { label: "Today's Expenses", type: 'todayExpenses', value: `₹${(dashboardData.kpis.todayExpenses || 0).toLocaleString()}`, logo: <Receipt size={35} color={'#EC4899'} />, color: 'border-pink-500' },
        { label: "Pending Deliveries", type: 'pendingDeliveries', value: `${(dashboardData.kpis.pendingDeliveries || 0)}`, logo: <ShoppingBag size={35} color={'#F43F5E'} />, color: 'border-rose-500' },
    ];

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                display: true,
                labels: {
                    boxWidth: 10,
                    boxHeight: 5,
                    padding: 12,
                    font: { size: 10 },
                }
            },
        },
        cutout: '65%',
    };

    if (loading) return <div className="p-10 text-center flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading Management Dashboard...</p>
    </div>;

    return (
        <>
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                widthClass="w-[20vw] h-[70vh]"
            >


                {modalConfig.type === 'todaySales' && <TodaySalesBreakup onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} data={dashboardData} />}
                {modalConfig.type === 'todaySalesReturns' && <TodaySalesReturnsBreakup onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} data={dashboardData} />}
                {modalConfig.type === 'cashFlow' && <CustomerAdvancesBreakup onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} data={dashboardData} />}
                {modalConfig.type === 'todayExpenses' && <ExpensesBreakup onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} data={dashboardData} />}
                {modalConfig.type === 'pendingDeliveries' && <PendingDeliveriesBreakup onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} data={dashboardData} />}

            </Modal>
            <div className="mt-2 overflow-y-auto p-4 bg-gray-50 h-[78vh] rounded-xl custom-scrollbar">
                <header className="mb-4 flex justify-between items-center">
                    <div>
                        <h4 className="text-2xl font-extrabold text-gray-900 tracking-tight">Management Dashboard</h4>
                        <p className="text-gray-500 text-[10px]">Real-time business performance overview</p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        className="flex items-center gap-1 bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-lg shadow-sm hover:bg-gray-50 transition-all text-xs font-medium"
                    >
                        <Clock size={14} /> Refresh
                    </button>
                </header>

                {/* Cards Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {cardsData.map((card, index) => (
                        <div
                            key={index}
                            onClick={() => handleCardClick(card.label, card.type)}
                            className={`p-4 bg-white rounded-xl shadow-sm border-l-4 ${card.color} transition-all hover:shadow-md cursor-pointer group`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 group-hover:text-indigo-600 transition-colors">{card.label}</p>
                                    <h4 className="text-xl font-black text-gray-800">{card.value}</h4>
                                    <span className="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity italic">Click for breakup</span>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-indigo-50 transition-colors">{card.logo}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 mt-4">
                    {/* Timeframe Navigation Tabs */}
                    <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 flex-1 max-w-xl">
                        {[
                            { id: 'today', label: 'Today\'s Sales' },
                            { id: 'weekly', label: 'Weekly Sales' },
                            { id: 'monthly', label: 'Monthly Sales' },
                            { id: 'yearly', label: 'Yearly Sales' },
                            { id: 'slow_moving', label: 'Slow Moving Items' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Filter Controls Row */}
                    <div className="flex flex-wrap items-center gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
                        {/* B2B / B2C / All Pills */}
                        <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
                            {['B2B', 'B2C', 'All'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setCustomerType(type)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${customerType === type
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-250'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Financial Year Dropdown */}
                        <select
                            value={finYear}
                            onChange={(e) => setFinYear(e.target.value)}
                            className="bg-white border border-blue-500 hover:border-blue-600 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer shadow-sm transition-all"
                        >
                            <option value="All">All Years</option>
                            <option value="26-27">26-27</option>

                            <option value="25-26">25-26</option>
                            <option value="24-25">24-25</option>
                            <option value="23-24">23-24</option>
                        </select>

                        {/* All / Sales / Returns Dropdown */}
                        <select
                            value={saleTypeFilter}
                            onChange={(e) => setSaleTypeFilter(e.target.value)}
                            className="bg-white border border-gray-200 hover:border-indigo-500 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer shadow-sm transition-all"
                        >
                            <option value="All">All Sales & Returns</option>
                            <option value="Sales">Sales Only</option>
                            <option value="Returns">Returns Only</option>
                        </select>
                    </div>
                </div>

                {/* Analytics Content Area */}
                {loadingAnalytics ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                        <p className="text-gray-500 text-xs font-medium">Fetching sales reports and charts...</p>
                    </div>
                ) : (
                    <div className="transition-all duration-300">
                        {activeTab === 'today' && salesAnalytics && (
                            <TodaySales data={salesAnalytics.today} paymentChart={salesAnalytics.charts.paymentMode} onShowBreakup={handleShowSalesBreakup} />
                        )}
                        {activeTab === 'weekly' && salesAnalytics && (
                            <WeeklySales data={salesAnalytics.weekly} paymentChart={salesAnalytics.charts.paymentMode} onShowBreakup={handleShowSalesBreakup} />
                        )}
                        {activeTab === 'monthly' && salesAnalytics && (
                            <MonthlySales data={salesAnalytics.monthly} categoryChart={salesAnalytics.charts.categoryDist} onShowBreakup={handleShowSalesBreakup} />
                        )}
                        {activeTab === 'yearly' && salesAnalytics && (
                            <YearlySales data={salesAnalytics.yearly} categoryChart={salesAnalytics.charts.categoryDist} onShowBreakup={handleShowSalesBreakup} />
                        )}
                        {activeTab === 'slow_moving' && salesAnalytics && (
                            <SlowMovementItem data={salesAnalytics.slowMoving} agingData={salesAnalytics.slowMovingAging} onShowBreakup={handleShowSalesBreakup} />
                        )}
                    </div>
                )}

                {salesBreakupConfig.isOpen && (
                    <SalesPeriodBreakup
                        timeframe={salesBreakupConfig.timeframe}
                        filterValue={salesBreakupConfig.filterValue}
                        title={salesBreakupConfig.title}
                        branchId={branchId}
                        customerType={customerType}
                        finYear={finYear}
                        saleTypeFilter={saleTypeFilter}
                        onClose={() => setSalesBreakupConfig({ ...salesBreakupConfig, isOpen: false })}
                    />
                )}
            </div>
        </>

    );
}

export default Dashboard;
