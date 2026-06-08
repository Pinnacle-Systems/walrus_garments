

import { Avatar, Box, Grid, Typography, useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";


import { FaUsers, FaUserTie } from "react-icons/fa";
import { DropdownInputNew, DropdownWithSearch } from "../../../../Inputs";
import { useGetFinYearQuery } from "../../../../redux/services/FinYearMasterService";
import { dropDownFinYear, dropDownFinYearNew } from "../../../../Utils/contructObject";
import QuarterSales from "./QuarterSales";
import YearlySales from "./YearlySales";
import MonthlySales from "./MonthlySales";
import WeeklySales from "./WeeklySales";
import SlowMovement from "./SlowMovement";

const SalesDetailDashboard = ({ companyName, Year, selectedmonth, finYearId }) => {
    // const { color } = useContext(ColorContext);
    const theme = useTheme();

    console.log(companyName, "companyName", Year)

    const [selectedState, setSelectedState] = useState("All");
    const [filterBuyer, setfilterBuyer] = useState(companyName);
    const [selectedYear, setSelectedYear] = useState(Year);
    const [selectmonths, setSelectmonths] = useState("");
    const [SalesType, setSalesType] = useState("All");
    const [chartToshow, setChartToShow] = useState("Year");


    const { data: finYr } = useGetFinYearQuery({});

    useEffect(() => {
        setSelectmonths(selectedmonth || "");
    }, [selectedmonth]);

    useEffect(() => {
        setSelectmonths(selectedmonth);
    }, [companyName]);

    useEffect(() => {
        setfilterBuyer(companyName);
    }, [companyName]);

    // const filterBuyerList = result?.data?.map((item) => item.customer) || [];
    // const chartData = filterBuyerList.map((company) => ({
    //     compname: company,
    //     id: company,
    // }));

    const handleFilterClick = (type) => {
        setSelectedState(type);
    };


    const handleFilterClickNew = (type) => {
        setSalesType(type);
    };


    const salesTypeOptions = [
        { label: "Year", value: "Year" },
        { label: "Quarter", value: "Quarter" },
        { label: "Month", value: "Month" },
        { label: "Week", value: "Week" },
    ];

    return (
        <div className="mt-2 overflow-y-auto px-2  bg-gray-50 h-[78vh] rounded-xl custom-scrollbar">
            {/* Header and Filters */}
            <div
                className="sticky top-0 z-20 bg-white shadow-sm mb-2"
                style={{
                    backgroundColor: "white",
                }}
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-2.5 border-b border-t border-gray-300">
                    {/* Left Side: Title */}
                    <div className="flex items-center">
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, textAlign: "start", fontSize: "1.05rem", ml: 1, color: "#1f2937" }}
                        >
                            Overview of Sales Distribution - {filterBuyer}
                        </Typography>
                    </div>

                    {/* Right Side: Controls */}
                    <div className="flex flex-wrap items-center gap-4 pr-1">

                        <div className="flex items-center gap-2 border border-gray-300  p-1">
                            <button
                                onClick={() => handleFilterClickNew("Sales")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-all ${SalesType === "Sales"
                                    ? "bg-blue-600 text-white scale-105"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                <FaUserTie size={12} /> Sales
                            </button>
                            <button
                                onClick={() => handleFilterClickNew("Returns")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-all ${SalesType === "Returns"
                                    ? "bg-blue-600 text-white scale-105"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                <FaUsers size={14} /> Returns
                            </button>
                            <button
                                onClick={() => handleFilterClickNew("All")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-all ${SalesType === "All"
                                    ? "bg-blue-600 text-white scale-105"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                <FaUsers size={14} /> All
                            </button>
                        </div>
                        <div className="flex items-center gap-2 border border-gray-300  p-1">
                            <button
                                onClick={() => handleFilterClick("B2B")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-all ${selectedState === "B2B"
                                    ? "bg-blue-600 text-white scale-105"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                <FaUserTie size={12} /> B2B
                            </button>
                            <button
                                onClick={() => handleFilterClick("B2C")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-all ${selectedState === "B2C"
                                    ? "bg-blue-600 text-white scale-105"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                <FaUsers size={14} /> B2C
                            </button>
                            <button
                                onClick={() => handleFilterClick("All")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full shadow-sm transition-all ${selectedState === "All"
                                    ? "bg-blue-600 text-white scale-105"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                <FaUsers size={14} /> All
                            </button>
                        </div>

                        {/* Dropdowns */}
                        <div className="flex items-center gap-2">
                            {/* Year Dropdown */}
                            <div className="w-28 flex items-center">
                                <DropdownInputNew
                                    options={dropDownFinYearNew(finYr?.data || [])}
                                    labelField={"finYr"}
                                    label={""}
                                    value={selectedYear}
                                    setValue={setSelectedYear}
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                    {chartToshow === "Year" ? (

                        <YearlySales finYrData={finYr?.data || []} year={selectedYear} selectedCompany={filterBuyer}
                            salesTypeOptions={salesTypeOptions} chartToshow={chartToshow} setChartToShow={setChartToShow}
                            type={selectedState}
                            setType={setSelectedState}
                            SalesType={SalesType}
                            setSalesType={setSalesType}
                        />
                    ) : chartToshow === "Quarter" ? (
                        <QuarterSales finYrData={finYr?.data || []} selectedYear={selectedYear} selectedCompany={filterBuyer}
                            salesTypeOptions={salesTypeOptions} chartToshow={chartToshow}
                            setChartToShow={setChartToShow}
                            type={selectedState}
                            setType={setSelectedState}
                            SalesType={SalesType}
                            setSalesType={setSalesType}
                        />

                    ) : chartToshow === "Month" ? (
                        <MonthlySales finYrData={finYr?.data || []} selectedYear={selectedYear} selectedCompany={filterBuyer}
                            salesTypeOptions={salesTypeOptions} chartToshow={chartToshow}
                            setChartToShow={setChartToShow}
                            type={selectedState}
                            setType={setSelectedState}
                            SalesType={SalesType}
                            setSalesType={setSalesType}
                        />
                    ) : chartToshow === "Week" ? (
                        <WeeklySales
                            finYrData={finYr?.data || []}
                            selectedYear={selectedYear}
                            selectedCompany={filterBuyer}
                            salesTypeOptions={salesTypeOptions}
                            chartToshow={chartToshow}
                            setChartToShow={setChartToShow}
                            activeMonth={selectmonths}
                            type={selectedState}
                            setType={setSelectedState}
                            SalesType={SalesType}
                            setSalesType={setSalesType}
                        />
                    ) : <h2>No data</h2>
                    }

                </Grid>

            </Grid>
            <Grid container>
                <Grid item xs={12} md={12}>
                    <SlowMovement
                        finYrData={finYr?.data || []}
                        yearFilter={selectedYear}
                        selectedCompany={filterBuyer}
                        salesTypeOptions={salesTypeOptions}
                        chartToshow={chartToshow}
                        setChartToShow={setChartToShow}
                        activeMonth={selectmonths}
                        type={selectedState}
                        setType={setSelectedState}
                        SalesType={SalesType}
                        setSalesType={setSalesType}
                        filterType={selectedState}
                    />
                </Grid>
            </Grid>

        </div>
    );
};

export default SalesDetailDashboard;
