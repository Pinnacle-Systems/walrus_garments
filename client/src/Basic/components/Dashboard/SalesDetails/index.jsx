import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography,
  useTheme,
} from "@mui/material";
import { useDispatch } from "react-redux";
import ReactApexChart from "react-apexcharts";
import { push } from "../../../../redux/features/opentabs";


// ---------- COMMON INR FORMATTER ----------
const formatINR = (value) =>
  `₹ ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const SalesData = ({ totalSales, isLoading, isError, error }) => {
  const theme = useTheme();
  const dispatch = useDispatch();



  console.log(totalSales, 'totalSales')


  // ---------- SAFE DATA ----------
  const rawData = Array.isArray(totalSales) ? totalSales : totalSales?.data;
  const salesData =
    rawData?.map((item) => ({
      year: item.year,
      company: item.company,
      totalSales: Number(item.totalSales || 0),
      finYearId: item.finYearId,
    })) || [];


  const salesYear = salesData.map((item) => item.year);
  const salesValue = salesData.map((item) => item.totalSales);

  const sumTotal = salesData.reduce(
    (sum, item) => sum + item.totalSales,
    0
  );
  console.log(salesData, 'salesData')

  console.log(sumTotal, 'sumTotal')
  const apexOptions = {
    chart: {
      type: "bar",
      height: 300,
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const index = config.dataPointIndex;

          const selectedYear = salesData[index]?.year;
          const selectedCompany = salesData[index]?.company;
          const selectedfinYearId = salesData[index]?.finYearId;

          dispatch(
            push({
              id: "SALES DETAIL DASHBOARD",
              name: "SALES DETAIL DASHBOARD",
              component: "SALES DETAIL DASHBOARD",
              data: {
                Year: selectedYear,
                finYearId: selectedfinYearId,
                companyName: selectedCompany,
              },
            })
          );
        },
      },

    },

    grid: {
      padding: {
        top: 0,
        bottom: 10,
      },
    },

    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: false,
        distributed: true,
        columnWidth: "35%",
      },
    },

    colors: [
      "#F44F5E",
      "#E55A89",
      "#D863B1",
      "#CA6CD8",
      "#B57BED",
      "#8D95EB",
      "#62ACEA",
      "#4BC3E6",
    ],

    dataLabels: {
      enabled: false,
    },

    tooltip: {
      y: {
        formatter: function (value) {
          return formatINR(value);
        },
      },
    },

    xaxis: {
      categories: salesYear,
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return formatINR(value);   // ✅ reuse same formatter
        },
        style: {
          fontSize: "11px",
        },
      },
    },


    legend: {
      show: false,
    },
  };

  const apexSeries = [
    {
      name: "Yearly Sales",
      data: salesValue,
    },
  ];

  // ---------- LOADING ----------
  if (isLoading) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: 4, textAlign: "center", ml: 1 }}>
        <CircularProgress />
      </Card>
    );
  }

  // ---------- ERROR ----------
  if (isError) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        Error: {error?.message || "Failed to load data"}
      </Typography>
    );
  }

  // ---------- UI ----------
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4, width: "45%", ml: 1 }}>
      <CardHeader
        title="Sales Distribution Year Wise"
        titleTypographyProps={{ sx: { fontSize: "1rem", fontWeight: 600 } }}
      />

      <CardContent>
        {salesData.length > 0 ? (
          <ReactApexChart
            options={apexOptions}
            series={apexSeries}
            type="bar"
            height={300}
          />
        ) : (
          <Box
            sx={{
              height: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
            }}
          >
            <Typography>No sales data available for this criteria.</Typography>
          </Box>
        )}

        <Box
          sx={{
            mt: 1,
            p: 1,
            bgcolor: "background.default",
            borderRadius: 3,
            textAlign: "center",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Overall Sales : {formatINR(sumTotal)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SalesData;
