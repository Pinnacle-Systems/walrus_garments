import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from '../../../redux/features/opentabs';
import POSSession from './POSSession';
import PosReportsNew from './PosReportsNew';
import { Plus, X, RefreshCw, FileText } from 'lucide-react';
import { useDeletePointOfSalesMutation, useLazyGetPointOfSalesQuery } from '../../../redux/uniformService/PointOfSalesService';
import { childRecordCount } from '../../../Inputs';
import Swal from 'sweetalert2';
import useInvalidateTags from '../../../CustomHooks/useInvalidateTags';
import { usePermissionForUsers } from '../../../Basic/components/HasPermission';

const POSMultiTabWrapper = () => {
    const dispatch = useDispatch();
    const openTabsState = useSelector((state) => state.openTabs);
    const currentTab = openTabsState?.tabs?.find(t => t.active && t.name === "POINT OF SALES");
    const pendingPosId = currentTab?.projectId;

    const [tabs, setTabs] = useState([{ id: 1, title: 'Bill 1', cart: [], editSaleId: null }]);
    const [activeTabId, setActiveTabId] = useState(1);
    const [nextTabId, setNextTabId] = useState(2);

    const [currentView, setCurrentView] = useState("REPORTS");
    const [reportsTransactionType, setReportsTransactionType] = useState("SALE");
    const [lastRefresh, setLastRefresh] = useState(Date.now());
    const [fetchRecentSales, { isFetching: isRecentSalesFetching }] = useLazyGetPointOfSalesQuery();
    const [invalidateTagsDispatch] = useInvalidateTags();
    const { hasPermission } = usePermissionForUsers()

    const [removeData] = useDeletePointOfSalesMutation();

    React.useEffect(() => {
        if (pendingPosId) {
            const existingTab = tabs.find(t => t.editSaleId === pendingPosId);
            if (existingTab) {
                setActiveTabId(existingTab.id);
            } else {
                const newId = nextTabId;
                setTabs(prevTabs => [
                    ...prevTabs,
                    { id: newId, title: `Edit: Pending`, cart: [], editSaleId: pendingPosId }
                ]);
                setActiveTabId(newId);
                setNextTabId(newId + 1);
            }
            setCurrentView("SESSION");
            dispatch(push({ name: "POINT OF SALES", projectId: null }));
        }
    }, [pendingPosId, tabs, nextTabId, dispatch]);

    const getAvailableBillNumber = () => {
        const usedNumbers = tabs
            .map(t => {
                const match = t.title.match(/^Bill (\d+)$/);
                return match ? parseInt(match[1], 10) : null;
            })
            .filter(n => n !== null);

        let num = 1;
        while (usedNumbers.includes(num)) {
            num++;
        }
        return num;
    };

    const handleAddTab = () => {
        const newId = nextTabId;
        const billNum = getAvailableBillNumber();
        setTabs([...tabs, { id: newId, title: `Bill ${billNum}`, cart: [], editSaleId: null }]);
        setActiveTabId(newId);
        setNextTabId(newId + 1);
        setCurrentView("SESSION");
    };

    const handleAddEditTab = (sale) => {
        const newId = nextTabId;
        setTabs([...tabs, { id: newId, title: `Edit: ${sale.docId || 'Bill'}`, cart: [], editSaleId: sale.id }]);
        setActiveTabId(newId);
        setNextTabId(newId + 1);
        setCurrentView("SESSION");
    };

    const handleCloseTab = (e, idToRemove) => {
        if (e) e.stopPropagation();
        if (tabs.length === 1) return; // Don't close the last tab

        const closeIndex = tabs.findIndex(t => t.id === idToRemove);
        const newTabs = tabs.filter(t => t.id !== idToRemove);

        // Rename remaining standard tabs sequentially to prevent gaps (e.g., Bill 1, Bill 2...)
        let billCounter = 1;
        const renamedTabs = newTabs.map(t => {
            if (t.editSaleId === null) {
                const newTitle = `Bill ${billCounter}`;
                billCounter++;
                return { ...t, title: newTitle };
            }
            return t;
        });

        setTabs(renamedTabs);

        if (activeTabId === idToRemove) {
            // Focus the tab immediately to the left, or the first tab if closing the first one
            const nextActiveIndex = closeIndex > 0 ? closeIndex - 1 : 0;
            setActiveTabId(renamedTabs[nextActiveIndex].id);
        }
    };

    const handleCartUpdate = React.useCallback((tabId, newCart) => {
        setTabs(prevTabs =>
            prevTabs.map(tab =>
                tab.id === tabId ? { ...tab, cart: newCart } : tab
            )
        );
    }, []);

    // Calculate global reserved stock across ALL tabs
    const globalReservedStock = useMemo(() => {
        const reserved = {};
        tabs.forEach(tab => {
            (tab.cart || []).forEach(item => {
                // Key format matches what is used in POS (e.g. itemId-sizeId-colorId)
                const key = `${item.itemId || item.id}-${item.sizeId || 0}-${item.colorId || 0}-${item.uomId || 0}`;
                if (!reserved[key]) reserved[key] = 0;
                reserved[key] += parseFloat(item.qty || 0);
            });
        });
        return reserved;
    }, [tabs]);


    const handleDelete = async (id, childRecord) => {


        if (childRecordCount(childRecord)) {
            Swal.fire({
                icon: 'error',
                text: 'Child Record Exists',
            });
            return
        }

        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                await removeData(id)
                // onNew();
                // toast.success("Deleted Successfully");
                Swal.fire({
                    title: "Deleted Successfully",
                    icon: "success",

                });
                invalidateTagsDispatch()

            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    text: error,
                });
            }
        }

    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-50">
            {/* REPORTS VIEW */}
            <div className={`flex-1 flex-col ${currentView === 'REPORTS' ? 'flex' : 'hidden'}`}>
                <div className="flex flex-col sm:flex-row justify-between bg-white py-0.5 px-4 items-start sm:items-center gap-x-4 shadow-sm border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold text-gray-800">Point Of Sales</h1>
                        <select
                            value={reportsTransactionType}
                            onChange={(e) => setReportsTransactionType(e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50"
                        >
                            <option value="ALL">All Transactions</option>
                            <option value="SALE">Sales Only</option>
                            <option value="RETURN">Returns Only</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="hover:bg-indigo-700 bg-white border border-indigo-700 hover:text-white text-indigo-800 px-3 py-0.5 rounded-md flex items-center gap-2 text-sm transition-colors shadow-sm"
                            onClick={() => setLastRefresh(Date.now())}
                            disabled={isRecentSalesFetching}
                        >
                            <RefreshCw size={14} className={isRecentSalesFetching ? 'animate-spin' : ''} /> Refresh
                        </button>
                        <button
                            className="hover:bg-green-700 bg-green-600 text-white px-3 py-0.5 rounded-md flex items-center gap-2 text-sm transition-colors shadow-sm"
                            onClick={handleAddTab}
                        >
                            <Plus size={14} /> Create New
                        </button>
                        <button
                            className="hover:bg-indigo-600 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-0.5 rounded-md flex items-center gap-2 text-sm transition-colors shadow-sm ml-2 font-medium"
                            onClick={() => setCurrentView("SESSION")}
                            title="Go back to open tabs"
                        >
                            View Open Tabs ({tabs.length})
                        </button>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[85vh] m-2 border border-slate-200 relative">
                    <PosReportsNew
                        onEdit={handleAddEditTab}
                        onDelete={handleDelete}
                        onView={true}
                        reportsTransactionType={reportsTransactionType}
                        lastRefresh={lastRefresh}
                        hasPermission={hasPermission}
                    />
                </div>
            </div>

            {/* SESSION VIEW */}
            <div className={`flex-col h-full w-[] ${currentView === 'SESSION' ? 'flex' : 'hidden'}`}>
                {/* Tab Bar */}
                <div className=" flex items-center justify-between bg-slate-200 px-2 pt-2 border-b border-slate-300 shrink-0">
                    <div className=" flex items-center gap-1  flex-1">
                        {tabs.map(tab => (
                            <div
                                key={tab.id}
                                onClick={() => setActiveTabId(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg cursor-pointer transition-colors ${activeTabId === tab.id
                                    ? 'bg-white text-indigo-700 border-t border-l border-r border-slate-300 shadow-sm relative top-[1px]'
                                    : 'bg-slate-300 text-slate-600 hover:bg-slate-300/80'
                                    }`}
                            >
                                <span>{tab.title}</span>
                                {tabs.length > 1 && (
                                    <button
                                        onClick={(e) => handleCloseTab(e, tab.id)}
                                        className="p-0.5 rounded-full hover:bg-slate-400/30 text-slate-500 hover:text-slate-800 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={handleAddTab}
                            className="flex items-center justify-center p-1.5 ml-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                            title="Open New Bill Tab"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* <button
                        onClick={() => setCurrentView("REPORTS")}
                        className="flex items-center gap-1.5 px-3 py-1 mb-1 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm ml-4"
                    >
                        <FileText size={14} />
                        Reports
                    </button> */}
                </div>

                {/* Render all tabs, hide inactive ones */}
                <div className="flex-1 relative  bg-[#f1f5f9]">
                    {tabs.map(tab => {
                        const isActive = activeTabId === tab.id;
                        return (
                            <div key={tab.id}
                                className={`absolute inset-0 ${isActive ? 'block z-10' : 'hidden z-0'}`}
                            >
                                <POSSession
                                    isActive={isActive}
                                    tabId={tab.id}
                                    onCartUpdate={handleCartUpdate}
                                    globalReservedStock={globalReservedStock}
                                    initialEditSaleId={tab.editSaleId}
                                    onGoToReports={() => {
                                        setCurrentView("REPORTS");
                                        if (tab.editSaleId) {
                                            handleCloseTab(null, tab.id);
                                        }
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default POSMultiTabWrapper;

