import React from 'react';
import { Line } from 'react-chartjs-2';
import { Calendar, TrendingUp, RefreshCw } from 'lucide-react';

const WeeklySales = ({ data, paymentChart, onShowBreakup }) => {
    if (!data) return <div className="p-4 text-center text-gray-500">Loading weekly analytics...</div>;

    const areaData = {
        labels: data.labels || [],
        datasets: [
            {
                label: 'Sales (₹)',
                data: data.salesValues || [],
                fill: true,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: '#10B981',
                pointBackgroundColor: '#10B981',
                tension: 0.3,
                borderWidth: 3,
            }
        ]
    };

    const areaOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
            if (elements && elements.length > 0 && onShowBreakup) {
                const index = elements[0].index;
                const clickedDay = data.labels[index];
                onShowBreakup({
                    timeframe: 'weekly',
                    filterValue: clickedDay,
                    title: `Sales Breakup - ${clickedDay}`
                });
            }
        },
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { grid: { display: false } },
            x: { grid: { display: false } }
        }
    };

    return (
        <div className="space-y-4 animate-fadeIn">
            {/* Graphs Grid */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col h-[320px]">
                <h5 className="text-sm font-bold text-gray-800 mb-4">7-Day Weekly Sales Trend</h5>
                <div className="flex-1 relative">
                    <Line data={areaData} options={areaOptions} />
                </div>
            </div>
        </div>
    );
};

export default WeeklySales;
