import { useEffect, useState } from "react";
import { Box, Card, CardContent, CardHeader, FormControlLabel, Radio, RadioGroup, useTheme } from "@mui/material";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { useGetYearlySalesQuery } from "../../../../redux/uniformService/SalesDashboardService";
import YearlyWiseTable from "./SalesDetailTables/YearWisetable";



const YearlySales = ({ finYrData, selectedCompany, year, type, setType, setSalesType, SalesType, salesTypeOptions, chartToshow, setChartToShow }) => {
    const [xdata, setXdata] = useState([]);
    const [ydata, setYdata] = useState([]);
    const theme = useTheme();
    const [showTable, setShowTable] = useState(false);
    const [tableParams, setTableParams] = useState(null);

    const [showYearTable, setShowYearTable] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);

    const { data: response, isLoading } = useGetYearlySalesQuery({
        params: { selectedCompany, year, type, SalesType },
    });

    const formatINR = (value) =>
        `₹ ${Number(value).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    useEffect(() => {
        if (response?.data) {
            setXdata(response.data.map((item) => item.company));
            setYdata(response.data.map((item) => Number(item.totalSales)));
        }
    }, [response]);

    const colorArray = [
        "#8A37DE", "#005E72", "#E5181C", "#056028", "#1F2937",
        "#F44F5E", "#E55A89", "#D863B1", "#CA6CD8", "#B57BED",
        "#8D95EB", "#62ACEA", "#4BC3E6",
    ];

    const options = {
        chart: {
            type: "column",
            height: 380,
            options3d: { enabled: true, alpha: 7, beta: 7, depth: 50, viewDistance: 25 },
            backgroundColor: "#FFFFFF",
            borderRadius: "10px",
        },
        title: null,
        legend: { enabled: false },
        tooltip: {
            headerFormat: '<b>{point.key}</b><br/>',
            pointFormatter() {
                return `Sales: <b>${formatINR(this.y)}</b>`;
            },
            style: { fontSize: "12px", color: "black" },
        },
        xAxis: {
            categories: xdata,
            labels: { style: { fontSize: "11px", color: "#6B7280" } },
            title: { text: `${year}`, style: { fontSize: "12px", fontWeight: "bold", color: "#374151" }, margin: 30 },
        },
        yAxis: {
            title: { text: "Sales", style: { fontSize: "12px", fontWeight: "bold", color: "#374151" }, margin: 25 },
            labels: {
                formatter() { return formatINR(this.value); },
                style: { fontSize: "11px", color: "#6B7280" },
            },
        },
        plotOptions: {
            column: {
                depth: 25,
                colorByPoint: false,
                borderRadius: 5,
            },
            series: {
                point: {
                    events: {
                        click: function () {
                            setTableParams({
                                company: this.category,
                                year: year,
                            });
                            setShowTable(true);
                        },
                    },
                },
            },
        },
        series: [
            {
                name: "Sales",
                data: ydata,
                color: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [

                        [0, "#6f00ff"],   // bottom
                        [1, "#5e55af"],   // top
                    ],
                },
                dataLabels: {
                    enabled: true,
                    formatter() { return formatINR(this.y); },
                    style: { fontSize: "11px", color: "#333" },
                },
            },
        ],

    };

    return (
        <Card sx={{ backgroundColor: "#f5f5f5", mt: 1, ml: 1 }}>
            <CardHeader
                title={`Year ${year} Sales`} titleTypographyProps={{ sx: { fontSize: ".9rem", fontWeight: 600 } }}
                sx={{ p: 1, borderBottom: `2px solid ${theme.palette.divider}` }}
                action={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <RadioGroup
                            row
                            value={chartToshow}
                            onChange={(e) => setChartToShow(e.target.value)}
                            sx={{ gap: 1 }}
                        >
                            {salesTypeOptions.map((opt) => (
                                <FormControlLabel
                                    key={opt.value}
                                    value={opt.value}
                                    control={<Radio size="small" />}
                                    label={opt.label}
                                    sx={{ fontSize: "11px" }}
                                />
                            ))}
                        </RadioGroup>



                    </Box>
                }
            />
            <CardContent>
                {isLoading ? (
                    <Box sx={{ textAlign: "center", py: 5 }}>Loading...</Box>
                ) : (
                    <HighchartsReact highcharts={Highcharts} options={options} immutable />
                )}
            </CardContent>

            {showTable && (
                <YearlyWiseTable
                    company={tableParams.company}
                    year={tableParams.year}
                    // finYrData={finYrData}
                    closeTable={() => setShowTable(false)}
                    type={type}
                    SalesType={SalesType}
                    setType={setType}
                    setSalesType={setSalesType}
                    finYrData={finYrData}

                />
            )}
        </Card>
    );
};

export default YearlySales;
