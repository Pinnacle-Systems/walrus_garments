import React, { useState, useMemo, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  useTheme,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useGetMonthlySalesQuery, useGetWeeklySalesQuery } from "../../../../redux/uniformService/SalesDashboardService";
import FinYear from "../../../../Utils/FinYear";
import WeekWiseTable from "./SalesDetailTables/WeekWiseTable";



// import MonthWiseTable from "../SalesData/TableData/MonthTable.jsx";

const WeeklySales = ({ selectedYear, selectedCompany, finYrData, type, setType, activeMonth, SalesType, setSalesType, chartToshow, setChartToShow, salesTypeOptions }) => {
  const theme = useTheme();
  const [tableParams, setTableParams] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedChildYear, setSelectedChildYear] = useState(null);
  const [selectMonths, setSelectMonths] = useState("");
  const [tempMonth, setTempMonth] = useState("")

  const [showTable, setShowTable] = useState(false);

  const formatINR = (value) =>
    `₹ ${Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const { data: response, isLoading } = useGetWeeklySalesQuery({
    params: { selectedYear, selectedCompany, type, month: selectMonths, SalesType },
  });

  const chartData = useMemo(() => {
    if (!Array.isArray(response?.data)) return [];

    return response.data.map((item) => ({
      month: item.payPeriod,
      finYear: item.finyr,
      value: Number(item.totalSales),
      company: item.company,
    }));
  }, [response?.data]);

  const monthOptions = useMemo(() => {
    if (!Array.isArray(chartData)) return [];
    return chartData.map(item => item.month);
  }, [chartData]);

  console.log(monthOptions, "monthOptions");

  useEffect(() => {
    if (activeMonth) {
      setSelectMonths(activeMonth);
    }
  }, [activeMonth]);

  useEffect(() => {
    setSelectedMonth(null);
    setShowTable(false);
  }, [selectedYear, selectedCompany]);

  const categories = useMemo(
    () => chartData.map((i) => i.month),
    [chartData]
  );

  const seriesData = useMemo(
    () => chartData.map((i) => i.value),
    [chartData]
  );

  /* ---------------- Selected Month ---------------- */
  const selectedMonthData = useMemo(() => {
    return chartData.find((i) => i.month === selectedMonth);
  }, [selectedMonth, chartData]);

  /* ---------------- Parent Chart Options ---------------- */
  const parentOptions = useMemo(
    () => ({
      chart: { type: "column", height: 430 },
      title: { text: "" },

      xAxis: { categories },

      yAxis: {
        title: { text: "Sales" },
        labels: {
          formatter() {
            return formatINR(this.value);
          },
        },
      },

      plotOptions: {
        column: {
          cursor: "pointer",
          borderRadius: 4,
          dataLabels: {
            enabled: true,
            formatter() {
              return formatINR(this.y);
            },
            style: {
              fontSize: "12px",
              fontWeight: "600",
              color: "#000",
            },
          },
          point: {
            events: {
              click() {
                setSelectedMonth(this.category);
              },
            },
          },
        },
      },

      tooltip: {
        formatter() {
          return `
            <b>${this.x}</b><br/>
            <b>${formatINR(this.y)}</b>
          `;
        },
      },

      series: [
        {
          name: "Sales",
          data: seriesData,
          color: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, "#05fdd0"],     // top
              [1, "#045f48"],     // bottom
            ],
          },
        },
      ],

      legend: { enabled: false },
      credits: { enabled: false },
    }),
    [categories, seriesData]
  );

  /* ---------------- Child Chart Options ---------------- */
  const childOptions = selectedMonthData && {
    chart: {
      type: "column",
      height: 320,
      spacingTop: 5,
      spacingBottom: 10,
      spacingLeft: 10,
      spacingRight: 10,
    },

    title: { text: "" },

    xAxis: {
      categories: [selectedMonth],
      lineWidth: 1,
    },

    yAxis: {
      title: { text: "Sales" },
      labels: {
        formatter() {
          return formatINR(this.value);
        },
      },
    },

    tooltip: {
      formatter() {
        return `
          <b>${this.x}</b><br/>
          Amount: <b>${formatINR(this.y)}</b>
        `;
      },
    },

    plotOptions: {
      column: {
        pointWidth: 40,
        dataLabels: {
          enabled: true,
          formatter() {
            return formatINR(this.y);
          },
          style: {
            fontSize: "11px",
            fontWeight: "600",
            color: "#000",
          },
        },
        point: {
          events: {
            click() {
              setTableParams({
                year: selectedYear,
                month: selectedMonth,
                company: selectedCompany,
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
        data: [
          {
            y: selectedMonthData?.value ?? 0,
            color: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, "#05fdd0"],     // top
                [1, "#045f48"],     // bottom
              ],
            },
          },
        ],
      },
    ],


    legend: { enabled: false },
    credits: { enabled: false },
  };

  /* ---------------- Render ---------------- */
  return (
    <Card sx={{ backgroundColor: "#f5f5f5", mt: 1, ml: 1, mr: 2 }}>
      <CardHeader
        title="Week Wise Sales"
        titleTypographyProps={{
          sx: { fontSize: ".9rem", fontWeight: 600 },
        }}
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: "12px", fontWeight: 500 } }}
                />
              ))}
            </RadioGroup>
            <Box sx={{ width: 170 }}>
              <FinYear
                selectedYear={selectedYear}
                selectmonths={selectMonths}
                setSelectmonths={(value) => {
                  setSelectMonths(value);
                  setTempMonth(value);
                }}
                autoBorder={true}
              />
            </Box>
          </Box>
        }
        sx={{
          p: 1,
          borderBottom: `2px solid ${theme.palette.divider}`,
        }}
      />

      <CardContent>
        {isLoading ? (
          <Box sx={{ textAlign: "center", py: 5 }}>Loading...</Box>
        ) : (
          <Box sx={{ display: "flex", width: "100%" }}>
            <Box sx={{ width: "70%" }}>
              <HighchartsReact
                highcharts={Highcharts}
                options={parentOptions}
                immutable
              />
            </Box>

            {/* Child Chart */}
            <Box sx={{ width: "30%", ml: 1 }}>
              <Card sx={{ height: "100%" }}>
                <Box
                  sx={{
                    px: 1,
                    py: 0.5,
                    fontWeight: 600,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {selectedMonth
                    ? `${selectedMonth} Sales Details`
                    : "Week Details"}
                </Box>

                <CardContent>
                  {selectedMonth ? (
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={childOptions}
                      immutable
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 260,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "text.secondary",
                        fontSize: "0.85rem",
                      }}
                    >
                      Click a week to view details
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </CardContent>

      {showTable && (
        <WeekWiseTable
          company={tableParams.company}
          year={tableParams.year}
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

export default WeeklySales;
