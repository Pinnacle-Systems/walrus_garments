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
import { useGetMonthlySalesQuery } from "../../../../redux/uniformService/SalesDashboardService";
import MonthWisetable from "./SalesDetailTables/MonthWisetable";



// import MonthWiseTable from "../SalesData/TableData/MonthTable.jsx";

const MonthlySales = ({ selectedYear, selectedCompany, finYrData, selectmonths, chartToshow, setChartToShow, salesTypeOptions, type, setType, SalesType, setSalesType, }) => {
  const theme = useTheme();
  const [tableParams, setTableParams] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedChildYear, setSelectedChildYear] = useState(null);

  const [showTable, setShowTable] = useState(false);

  const formatINR = (value) =>
    `₹ ${Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const { data: response, isLoading } = useGetMonthlySalesQuery({
    params: { selectedYear, selectedCompany, type, months: selectmonths, SalesType },
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

  const selectedMonthData = useMemo(() => {
    return chartData.find((i) => i.month === selectedMonth);
  }, [selectedMonth, chartData]);

  const parentOptions = useMemo(
    () => ({
      chart: { type: "line", height: 430 },
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
        series: {
          step: "left",
          cursor: "pointer",
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
          color: "#00fe6a",
        },
      ],

      legend: { enabled: false },
      credits: { enabled: false },
    }),
    [categories, seriesData]
  );

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
    <Card sx={{ backgroundColor: "#f5f5f5", mt: 1, ml: 1 }}>
      <CardHeader
        title="Month Wise Sales"
        titleTypographyProps={{
          sx: { fontSize: ".9rem", fontWeight: 600 },
        }}
        sx={{
          p: 1,
          borderBottom: `2px solid ${theme.palette.divider}`,
        }}
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
          <Box sx={{ display: "flex", width: "100%" }}>
            {/* Parent Chart */}
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
                    : "Month Details"}
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
                      Click a month to view details
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </CardContent>

      {/* Table */}
      {showTable && tableParams && (
        <MonthWisetable
          year={tableParams.year}
          onYearChange={setSelectedChildYear}

          month={tableParams.month}
          company={tableParams.company}
          monthOptions={monthOptions}
          closeTable={() => {
            setShowTable(false);
            setTableParams(null);
          }}
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

export default MonthlySales;
