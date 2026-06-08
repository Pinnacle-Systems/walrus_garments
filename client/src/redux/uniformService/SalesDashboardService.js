import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SALES_DASHBOARD_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;


const salesDashboardApi = createApi({
  reducerPath: "salesDashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  tagTypes: ["salesDashboardApi"],
  endpoints: (builder) => ({
    getSalesDashboard: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API,
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["salesDashboardApi"],
    }),

    getTotalSales: builder.query({
      query: (params) => {
        return {
          url: SALES_DASHBOARD_API + "/totalSales",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",

          },
          params,
        };
      },
      providesTags: ['salesDashboardApi'],
    }),

    getQuarterSales: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/quartersales",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['salesDashboardApi'],
    }),

    getYearlySales: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/yearlysales",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['salesDashboardApi'],
    }),

    getYearlySalesTable: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/yearlysalesTable",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),

    getMonthlySales: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/monthlysales",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['salesDashboardApi'],
    }),

    getWeeklySales: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/weeklySales",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['salesDashboardApi'],
    }),

    getTopTenCustomer: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenCustomer",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['salesDashboardApi'],
    }),
    getTopTenCustomerMonth: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenCustomerMonth",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['salesDashboardApi'],
    }),
    getTopTenCustomerWeek: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenCustomerWeek",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['salesDashboardApi'],
    }),
    getTopTenCustomerDaily: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenCustomerDaily",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),
    getTopTenItemYear: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenItemYear",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),
    getTopTenItemMonth: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenItemMonth",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),
    getTopTenItemWeek: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenItemWeek",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),
    getTopTenItemDaily: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenItemDaily",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),
    getMonthlySalesTable: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/monthlysalesTable",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),
    getQuarterSalesTable: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/quartersalesTable",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),

    getTopTenCustomerYearTable: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenCustomerYearTable",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),
    getTopTenCustomerMonthTable: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenCustomerMonthTable",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),
    getTopTenCustomerWeekTable: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenCustomerWeekTable",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),
    getTopTenCustomerDailyTable: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenCustomerDailyTable",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),
    getTopTenItemYearTable: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenItemYearTable",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),
    getTopTenItemMonthTable: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenItemMonthTable",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),
    getTopTenItemWeekTable: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenItemWeekTable",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),
    getTopTenItemDailyTable: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/topTenItemDailyTable",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),

    getWeeklySalesTable: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/weeklySalesTable",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ['JamunasDashboard'],
    }),

    getSlowMovingItems: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/slowMovingItems",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["salesDashboardApi"],
    }),
    getSlowMovingItemsByVelocity: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/slowMovingItemsByVelocity",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["salesDashboardApi"],
    }),
    getDeadStock: builder.query({
      query: ({ params }) => {
        return {
          url: SALES_DASHBOARD_API + "/deadStock",
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          params,
        };
      },
      providesTags: ["salesDashboardApi"],
    }),

  }),
});

export const {

  useGetTotalSalesQuery,



  useGetYearlySalesQuery,
  useGetYearlySalesTableQuery,

  useGetQuarterSalesQuery,
  useGetQuarterSalesTableQuery,

  useGetMonthlySalesQuery,
  useGetMonthlySalesTableQuery,

  useGetWeeklySalesQuery,
  useGetWeeklySalesTableQuery,

  useGetSlowMovingItemsQuery,
  useGetSlowMovingItemsByVelocityQuery,
  useGetDeadStockQuery,

  useGetTopTenCustomerQuery,
  useGetTopTenCustomerMonthQuery,
  useGetTopTenCustomerWeekQuery,
  useGetTopTenCustomerDailyQuery,
  useGetTopTenItemYearQuery,
  useGetTopTenItemMonthQuery,
  useGetTopTenItemWeekQuery,
  useGetTopTenItemDailyQuery,
  useGetTopTenCustomerYearTableQuery,
  useGetTopTenCustomerMonthTableQuery,
  useGetTopTenCustomerWeekTableQuery,
  useGetTopTenCustomerDailyTableQuery,
  useGetTopTenItemYearTableQuery,
  useGetTopTenItemMonthTableQuery,
  useGetTopTenItemWeekTableQuery,
  useGetTopTenItemDailyTableQuery,

} = salesDashboardApi;

export default salesDashboardApi;
