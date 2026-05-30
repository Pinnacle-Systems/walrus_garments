import React from 'react';
import { Line } from 'react-chartjs-2';
import { TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';

const TodaySales = ({ data, paymentChart, onShowBreakup }) => {
    if (!data) return <div className="p-4 text-center text-gray-500">Loading today's analytics...</div>;

    const lineData = {
        labels: data.hourlyLabels || [],
        datasets: [
            {
                label: 'Sales (₹)',
                data: data.hourlySales || [],
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderColor: '#6366F1',
                pointBackgroundColor: '#6366F1',
                tension: 0.4,
                borderWidth: 3,
            }
        ]
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
            if (elements && elements.length > 0 && onShowBreakup) {
                const index = elements[0].index;
                const clickedHour = data.hourlyLabels[index];
                onShowBreakup({
                    timeframe: 'today',
                    filterValue: clickedHour,
                    title: `Sales Breakup - Today at ${clickedHour}`
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
                <h5 className="text-sm font-bold text-gray-800 mb-4">Today's Hourly Sales Flow (12 AM - 10 PM)</h5>
                <div className="flex-1 relative">
                    <Line data={lineData} options={lineOptions} />
                </div>
            </div>
        </div>
    );
};

export default TodaySales;
