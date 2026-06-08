

import React, { useState, useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  Card,
  CardHeader,
  CardContent,
  useTheme,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Switch
} from "@mui/material";
import { useGetQuarterSalesQuery } from "../../../../redux/uniformService/SalesDashboardService";
import QuarterWiseTable from "./SalesDetailTables/QuarterWiseTbale";


const MONTH_MAP = {
  1: "Jan", 2: "Feb", 3: "Mar",
  4: "Apr", 5: "May", 6: "Jun",
  7: "Jul", 8: "Aug", 9: "Sep",
  10: "Oct", 11: "Nov", 12: "Dec",
};

const QUARTER_GRADIENTS = {
  Q1: {
    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
    stops: [[0, "#ff4b2b"], [1, "#ff416c"]],
  },
  Q2: {
    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
    stops: [[0, "#f7971e"], [1, "#ffd200"]],
  },
  Q3: {
    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
    stops: [[0, "#11998e"], [1, "#38ef7d"]],
  },
  Q4: {
    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
    stops: [[0, "#06beb6"], [1, "#48b1bf"]],
  },
};

const QUARTER_SOLID_COLORS = {
  Q1: "#ff4b2b",
  Q2: "#f7971e",
  Q3: "#11998e",
  Q4: "#06beb6",
};

const QuarterSales = ({ selectedYear, selectedCompany, chartToshow, setChartToShow, salesTypeOptions, type, SalesType, setType, setSalesType, finYrData
}) => {
  const theme = useTheme();
  const [tableParams, setTableParams] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [isYearComparison, setIsYearComparison] = useState(false);


  const formatINR = (value) =>
    `₹ ${Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  console.log(selectedYear, "selectedYear", selectedCompany, "selectedCompany")
  const { data: response, isLoading } = useGetQuarterSalesQuery({
    params: {
      selectedYear: isYearComparison ? "All" : selectedYear,
      selectedCompany,
      type,
      SalesType
    }
  });

  /* ---------- PROCESS DATA ---------- */
  const chartData = useMemo(() => {
    const rawData = Array.isArray(response?.data) ? response.data : [];
    const categories = ["Q1", "Q2", "Q3", "Q4"];

    if (!isYearComparison) {
      const quarterMap = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
      const quarterCompanies = {};
      const quarterFinYears = {};

      rawData.forEach(item => {
        if (item.quarter) {
          quarterMap[item.quarter] += Number(item.totalSales) || 0;
          quarterCompanies[item.quarter] = item.company;
          quarterFinYears[item.quarter] = item.finyr;
        }
      });

      const data = categories.map(q => ({
        name: q,
        y: quarterMap[q] || 0,
        quarter: q,
        finYear: quarterFinYears[q] || selectedYear,
        company: quarterCompanies[q] || selectedCompany,
        color: QUARTER_GRADIENTS[q] || "#ccc",
        solidColor: QUARTER_SOLID_COLORS[q] || "#ccc",
      }));

      return { categories, series: [{ data }], isComparison: false };
    } else {
      const yearMap = {};
      const yearCompanies = {};

      rawData.forEach(item => {
        if (!item.finyr || !item.quarter) return;
        if (!yearMap[item.finyr]) {
          yearMap[item.finyr] = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
          yearCompanies[item.finyr] = item.company;
        }
        yearMap[item.finyr][item.quarter] += Number(item.totalSales) || 0;
      });

      const YEAR_GRADIENTS = [
        QUARTER_GRADIENTS.Q1, QUARTER_GRADIENTS.Q2, QUARTER_GRADIENTS.Q3, QUARTER_GRADIENTS.Q4,
      ];
      const YEAR_SOLIDS = [
        QUARTER_SOLID_COLORS.Q1, QUARTER_SOLID_COLORS.Q2, QUARTER_SOLID_COLORS.Q3, QUARTER_SOLID_COLORS.Q4,
      ];

      const sortedYears = Object.keys(yearMap).sort();

      const series = sortedYears.map((yr, index) => {
        const colorGrad = YEAR_GRADIENTS[index % YEAR_GRADIENTS.length];
        const colorSolid = YEAR_SOLIDS[index % YEAR_SOLIDS.length];

        const data = categories.map(q => ({
          name: q,
          y: yearMap[yr][q] || 0,
          quarter: q,
          finYear: yr,
          company: yearCompanies[yr] || selectedCompany,
          color: colorGrad,
          solidColor: colorSolid,
        }));

        return {
          name: yr,
          data: data,
          color: colorGrad
        };
      });

      return { categories, series, isComparison: true };
    }
  }, [response?.data, isYearComparison, selectedYear, selectedCompany]);





  /* ---------- CHART OPTIONS ---------- */
  const options = {
    chart: {
      type: "column",
      height: 380,
    },

    title: { text: "" },

    xAxis: {
      categories: chartData.categories,
      labels: {
        useHTML: true,
        formatter() {
          const color = QUARTER_SOLID_COLORS[this.value] || "#ccc";
          return `
            <span style="
              background:${color};
              color:#fff;
              padding:6px 14px;
              border-radius:14px;
              font-size:13px;
              font-weight:700;
              display:inline-block;
              box-shadow:0 2px 6px rgba(0,0,0,0.2);
              margin-top: 5px;
            ">
              ${this.value}
            </span>
          `;
        },
      },
    },

    yAxis: {
      visible: false,
    },

    legend: { enabled: chartData.isComparison },

    tooltip: {
      useHTML: true,
      borderWidth: 0,
      backgroundColor: "transparent",
      shadow: false,
      formatter() {
        const color = this.point.solidColor || "#ccc";
        const yearStr = chartData.isComparison ? `<div><b>Year :</b> ${this.point.finYear}</div>` : "";

        return `
      <div style="
        border:2px solid ${color};
        border-radius:8px;
        padding:8px 10px;
        background:#fff;
        box-shadow:0 4px 10px rgba(0,0,0,0.15);
        min-width:160px;
      ">
        ${yearStr}
        <div><b>Quarter :</b> ${this.point.quarter}</div>
        <div><b>Sales :</b> ${formatINR(this.y)}</div>
      </div>
    `;
      },
    },


    plotOptions: {
      column: {
        pointPadding: 0,
        groupPadding: 0.15,
        borderWidth: 0,
        minPointLength: 120,
      },
      series: {
        cursor: "pointer",
        point: {
          events: {
            click() {
              setTableParams({
                year: this.finYear || selectedYear,
                company: selectedCompany,
                quarter: this.quarter
              });
              setShowTable(true);
            },

          },
        },
        dataLabels: {
          enabled: true,
          inside: true,
          rotation: 0,
          crop: false,
          overflow: "allow",
          formatter() {
            return formatINR(this.y);
          },
          style: {
            color: "#fff",
            fontSize: "11px",
            fontWeight: "600",
            textOutline: "1px contrast",

          },
        },
      },
    },

    credits: { enabled: false },

    series: chartData.series,
  };

  /* ---------- RENDER ---------- */
  return (
    <Card sx={{ backgroundColor: "#f5f5f5", mt: 1, ml: 1 }}>
      <CardHeader
        title="Quarter Wise Sales"
        titleTypographyProps={{ sx: { fontSize: ".9rem", fontWeight: 600 } }}
        sx={{ p: 1, borderBottom: `2px solid ${theme.palette.divider}` }}
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isYearComparison}
                  onChange={(e) => setIsYearComparison(e.target.checked)}
                  size="small"
                  color="primary"
                />
              }
              label={<span style={{ fontSize: "11px", fontWeight: 600 }}>Year Comparison</span>}
              sx={{ mr: 2, m: 0 }}
            />
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
          <div style={{ textAlign: "center", padding: "40px" }}>
            Loading...
          </div>
        ) : (
          <HighchartsReact highcharts={Highcharts} options={options} />
        )}
      </CardContent>
      {showTable && (
        <QuarterWiseTable
          company={tableParams.company}
          year={tableParams.year}
          quarter={tableParams.quarter}
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

export default QuarterSales;
