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
import Modal from "../../../UiComponents/Modal";
import TotalSalesBreakup from "./DashBoardBreakTables/TotalSales";

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
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', type: '' });
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

    useEffect(() => {
        fetchDashboardData();
    }, [branchId]);

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

    const handleCardClick = (label, type) => {
        setModalConfig({ isOpen: true, title: `${label} Breakup`, type });
    };

    // const renderBreakupContent = () => {
    //     const { type } = modalConfig;
    //     const data = dashboardData.breakups[type] || [];







    //     if (data.length === 0) return <div className="text-center py-10 text-gray-500">No data found for this breakup.</div>;

    //     return (
    //         <div className="overflow-x-auto max-h-[60vh]">
    //             <table className="w-full text-sm text-left border-collapse">
    //                 <thead className="bg-gray-50 sticky top-0">
    //                     {type === 'todaySales' && (
    //                         <tr>
    //                             <th className="p-3 border-b">Doc ID</th>
    //                             <th className="p-3 border-b">Party</th>
    //                             <th className="p-3 border-b text-right">Amount</th>
    //                             <th className="p-3 border-b text-center">Type</th>
    //                         </tr>
    //                     )}
    //                     {type === 'todayCollections' && (
    //                         <tr>
    //                             <th className="p-3 border-b">Doc ID</th>
    //                             <th className="p-3 border-b">Party</th>
    //                             <th className="p-3 border-b text-right">Amount</th>
    //                             <th className="p-3 border-b">Mode</th>
    //                         </tr>
    //                     )}
    //                     {type === 'totalOutstanding' && (
    //                         <tr>
    //                             <th className="p-3 border-b">Party Name</th>
    //                             <th className="p-3 border-b text-right">Balance</th>
    //                         </tr>
    //                     )}
    //                     {type === 'todayExpenses' && (
    //                         <tr>
    //                             <th className="p-3 border-b">Category</th>
    //                             <th className="p-3 border-b text-right">Amount</th>
    //                             <th className="p-3 border-b">Note</th>
    //                         </tr>
    //                     )}
    //                     {(type === 'pendingQuotations' || type === 'pendingDeliveries') && (
    //                         <tr>
    //                             <th className="p-3 border-b">ID</th>
    //                             <th className="p-3 border-b">Customer</th>
    //                             <th className="p-3 border-b text-right">Amount</th>
    //                             <th className="p-3 border-b text-right">Date</th>
    //                         </tr>
    //                     )}
    //                 </thead>
    //                 <tbody className="divide-y divide-gray-100">
    //                     {data.map((item, idx) => (
    //                         <tr key={idx} className="hover:bg-gray-50">
    //                             {type === 'todaySales' && (
    //                                 <>
    //                                     <td className="p-3 font-medium">{item.id}</td>
    //                                     <td className="p-3">{item.party}</td>
    //                                     <td className="p-3 text-right font-bold text-blue-600">₹{item.amount.toLocaleString()}</td>
    //                                     <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] ${item.type === 'POS' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{item.type}</span></td>
    //                                 </>
    //                             )}
    //                             {type === 'todayCollections' && (
    //                                 <>
    //                                     <td className="p-3 font-medium">{item.id}</td>
    //                                     <td className="p-3">{item.party}</td>
    //                                     <td className="p-3 text-right font-bold text-green-600">₹{item.amount.toLocaleString()}</td>
    //                                     <td className="p-3">{item.mode}</td>
    //                                 </>
    //                             )}
    //                             {type === 'customerAdvances' && (
    //                                 <>
    //                                     <td className="p-3 font-medium">{item.party}</td>
    //                                     <td className="p-3 text-right font-bold text-green-600">₹{item.amount.toLocaleString()}</td>
    //                                 </>
    //                             )}
    //                             {type === 'todayExpenses' && (
    //                                 <>
    //                                     <td className="p-3 font-medium">{item.category}</td>
    //                                     <td className="p-3 text-right font-bold text-pink-600">₹{item.amount.toLocaleString()}</td>
    //                                     <td className="p-3 text-gray-500">{item.note}</td>
    //                                 </>
    //                             )}
    //                             {(type === 'pendingQuotations' || type === 'pendingDeliveries') && (
    //                                 <>
    //                                     <td className="p-3 font-medium">{item.id}</td>
    //                                     <td className="p-3">{item.party}</td>
    //                                     <td className="p-3 text-right font-bold text-indigo-600">₹{item.amount.toLocaleString()}</td>
    //                                     <td className="p-3 text-right text-gray-400">{new Date(item.date).toLocaleDateString()}</td>
    //                                 </>
    //                             )}
    //                         </tr>
    //                     ))}
    //                 </tbody>
    //             </table>
    //         </div>
    //     );
    // };





    const cardsData = [
        { label: "Today's Sales", type: 'todaySales', value: `₹${(dashboardData.kpis.todaySales || 0).toLocaleString()}`, logo: <ShoppingBag size={35} color={'#30b5fc'} />, color: 'border-blue-500' },
        { label: "Customer Advances", type: 'customerAdvances', value: `₹${(dashboardData.kpis.customerAdvances || 0).toLocaleString()}`, logo: <Wallet size={35} color={'#22C55E'} />, color: 'border-green-500' },
        { label: "Today's Expenses", type: 'todayExpenses', value: `₹${(dashboardData.kpis.todayExpenses || 0).toLocaleString()}`, logo: <Receipt size={35} color={'#EC4899'} />, color: 'border-pink-500' },
        { label: "Pending Quotations", type: 'pendingQuotations', value: `${(dashboardData.kpis.pendingQuotations || 0)}`, logo: <Clock size={35} color={'#8B5CF6'} />, color: 'border-purple-500' },
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
                {/* <div className="mb-4 flex justify-between items-center border-b pb-3">
                    <h5 className="text-xl font-bold text-gray-800">{modalConfig.title}</h5>
                </div> */}

                <TotalSalesBreakup onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} data={dashboardData} />
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




                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 mb-6">
                    {/* Top Products Table */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h6 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <TrendingUp size={18} className="text-blue-500" /> Top Selling Products
                        </h6>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px] text-left">
                                <thead className="text-[10px] text-gray-400 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 rounded-l-lg">Product Name</th>
                                        <th className="px-3 py-2 rounded-r-lg text-right">Qty Sold</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {dashboardData.topProducts.length > 0 ? dashboardData.topProducts.map((p, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-2 font-medium text-gray-700">{p.name}</td>
                                            <td className="px-3 py-2 text-right font-bold text-indigo-600">{p.sales}</td>
                                        </tr>
                                    )) : <tr><td colSpan="2" className="text-center py-4 text-gray-400">No sales data found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Orders Table */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h6 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <ShoppingBag size={18} className="text-purple-500" /> Recent Sale Orders
                        </h6>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px] text-left">
                                <thead className="text-[10px] text-gray-400 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 rounded-l-lg">Order ID</th>
                                        <th className="px-3 py-2">Customer</th>
                                        <th className="px-3 py-2">Type</th>
                                        <th className="px-3 py-2 rounded-r-lg text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {dashboardData.recentOrders.length > 0 ? dashboardData.recentOrders.map((o, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-2 font-bold text-gray-600">{o.id}</td>
                                            <td className="px-3 py-2 text-gray-700">{o.party}</td>
                                            <td className="px-3 py-2">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${o.type === 'POS' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {o.type}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right text-gray-500">{new Date(o.date).toLocaleDateString()}</td>
                                        </tr>
                                    )) : <tr><td colSpan="4" className="text-center py-4 text-gray-400">No recent orders</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
}

export default Dashboard;
