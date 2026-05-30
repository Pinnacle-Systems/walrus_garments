import React from 'react';
import { Bar } from 'react-chartjs-2';

const MonthlySales = ({ data, categoryChart, onShowBreakup }) => {
    if (!data) return <div className="p-4 text-center text-gray-500">Loading monthly's analytics...</div>;

    const barData = {
        labels: data.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Sales (₹)',
                data: data.salesValues || [0, 0, 0, 0],
                backgroundColor: '#3B82F6',
                borderRadius: 4,
            }
        ]
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
            if (elements && elements.length > 0 && onShowBreakup) {
                const index = elements[0].index;
                const clickedWeek = data.labels[index] || `Week ${index + 1}`;
                onShowBreakup({
                    timeframe: 'monthly',
                    filterValue: clickedWeek,
                    title: `Sales Breakup - ${clickedWeek}`
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
                <h5 className="text-sm font-bold text-gray-800 mb-4">Monthly Sales by Week</h5>
                <div className="flex-1 relative">
                    <Bar data={barData} options={barOptions} />
                </div>
            </div>
        </div>
    );
};

export default MonthlySales;
