import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Line, Bar } from 'react-chartjs-2';
import { AlertCircle, ChevronLeft, ChevronRight, TrendingDown, Clock, ShieldAlert } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend
);

const SlowMovementItem = ({ data, agingData, onShowBreakup }) => {
    const [selectedBucketIndex, setSelectedBucketIndex] = useState(12); // Default to last bucket "781-810" as shown in the image

    if (!data || data.length === 0) {
        return <div className="p-4 text-center text-gray-500">No slow moving items detected. All products are selling great!</div>;
    }

    const defaultAgingData = [
        { label: "421-450", count: 2150, sum: 2200, items: [] },
        { label: "451-480", count: 900, sum: 910, items: [] },
        { label: "481-510", count: 750, sum: 760, items: [] },
        { label: "511-540", count: 580, sum: 590, items: [] },
        { label: "541-570", count: 480, sum: 500, items: [] },
        { label: "571-600", count: 580, sum: 600, items: [] },
        { label: "601-630", count: 390, sum: 400, items: [] },
        { label: "631-660", count: 360, sum: 370, items: [] },
        { label: "661-690", count: 350, sum: 360, items: [] },
        { label: "691-720", count: 340, sum: 350, items: [] },
        { label: "721-750", count: 410, sum: 420, items: [] },
        { label: "751-780", count: 300, sum: 310, items: [] },
        { label: "781-810", count: 45, sum: 50, items: [] }
    ];

    const finalAgingData = agingData && agingData.length > 0 ? agingData : defaultAgingData;
    const selectedBucket = finalAgingData[selectedBucketIndex] || finalAgingData[0];

    const chartData = {
        labels: finalAgingData.map(d => d.label),
        datasets: [
            {
                type: 'line',
                label: 'Aging Sum',
                borderColor: '#F59E0B', // Premium Amber
                borderWidth: 2,
                fill: false,
                data: finalAgingData.map(d => d.sum),
                tension: 0.4,
                pointBackgroundColor: '#FFF',
                pointBorderColor: '#F59E0B',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                yAxisID: 'y',
            },
            {
                type: 'bar',
                label: 'Item Count',
                backgroundColor: '#14B8A6', // Teal
                data: finalAgingData.map(d => d.count),
                borderRadius: 4,
                barThickness: 12,
                yAxisID: 'y',
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
            if (elements && elements.length > 0) {
                const idx = elements[0].index;
                setSelectedBucketIndex(idx);
                
                if (onShowBreakup) {
                    const bucket = finalAgingData[idx];
                    onShowBreakup({
                        timeframe: 'slow_moving',
                        filterValue: bucket.label,
                        title: `Dead Stock Items Breakup (${bucket.label} days)`
                    });
                }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        },
        scales: {
            y: {
                grid: { color: 'rgba(243, 244, 246, 0.6)' },
                ticks: { color: '#9CA3AF', font: { size: 9, weight: '500' } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#4B5563', font: { size: 9, weight: '600' } }
            }
        }
    };

    return (
        <div className="space-y-4 animate-fadeIn">
            {/* Header Alert banner */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                    <h6 className="text-sm font-bold text-amber-800">Inventory Stock Aging Report & Dead Stock Monitor</h6>
                    <p className="text-xs text-amber-600 mt-1">Below is the warehouse stock aging curve. Select any range or bar on the graph to view item details and take promotions recovery actions.</p>
                </div>
            </div>

            {/* Custom Premium Legend */}
            <div className="flex justify-center items-center gap-6 mt-2 bg-white py-2 rounded-lg border border-gray-55 shadow-sm max-w-xs mx-auto">
                <div className="flex items-center gap-2">
                    <span className="w-5 h-2.5 bg-teal-500 rounded-sm"></span>
                    <span className="text-[10px] text-gray-500 font-bold">Item Count</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 border border-amber-500 bg-white rounded-full flex items-center justify-center">
                        <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold">Aging Sum</span>
                </div>
            </div>

            {/* Dual Axis Aging Graph & Tooltip Container */}
            <div className="flex flex-col xl:flex-row gap-4 items-stretch">
                {/* Graph Card */}
                <div className="flex-1 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2 min-h-[360px]">
                    <button 
                        onClick={() => setSelectedBucketIndex(prev => prev > 0 ? prev - 1 : finalAgingData.length - 1)}
                        className="w-8 h-8 rounded-full border border-teal-200 text-teal-500 flex items-center justify-center hover:bg-teal-50 transition-all shadow-sm flex-shrink-0"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="flex-1 h-[300px] relative">
                        <Chart type="bar" data={chartData} options={chartOptions} />
                    </div>

                    <button 
                        onClick={() => setSelectedBucketIndex(prev => prev < finalAgingData.length - 1 ? prev + 1 : 0)}
                        className="w-8 h-8 rounded-full border border-teal-200 text-teal-500 flex items-center justify-center hover:bg-teal-50 transition-all shadow-sm flex-shrink-0"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Floating Tooltip Detail Box Replica */}
                <div className="w-full xl:w-[320px] bg-white p-5 rounded-xl border border-gray-100 shadow-md flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[11px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                {selectedBucket.label} days
                            </span>
                            <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                                <Clock size={12} /> Stock Age
                            </span>
                        </div>
                        
                        <h6 className="text-sm font-black text-gray-800">Items Count: <span className="text-teal-600">{selectedBucket.count}</span></h6>
                        
                        <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                            {selectedBucket.items && selectedBucket.items.length > 0 ? (
                                selectedBucket.items.slice(0, 5).map((it, i) => (
                                    <div key={i} className="text-xs p-2 rounded-lg bg-gray-50 border border-gray-100 flex flex-col gap-0.5 font-medium">
                                        <div className="flex justify-between items-center text-gray-700">
                                            <span className="font-bold line-clamp-1">{it.name}</span>
                                            <span className="text-rose-500 text-[10px] font-black">{it.age}d</span>
                                        </div>
                                        <span className="text-[9px] text-gray-400 uppercase">Code: {it.code || 'N/A'}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-gray-400 text-xs">No specific item registered in this bracket.</div>
                            )}

                            {selectedBucket.items && selectedBucket.items.length > 5 && (
                                <p className="text-[11px] text-indigo-600 font-black text-center pt-2 cursor-pointer hover:underline">
                                    +{selectedBucket.items.length - 5} more — click table below to view full details
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <span className="text-[10px] text-amber-500 font-bold uppercase flex items-center gap-1">
                            <ShieldAlert size={14} /> Recovery Priority
                        </span>
                        <p className="text-[11px] text-gray-500 mt-1">
                            {selectedBucketIndex >= 10 ? "CRITICAL: Stock is highly stagnant. Apply clearance pricing immediately." : "MEDIUM: Stagnant stock. Apply bundling promotions."}
                        </p>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default SlowMovementItem;
