import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DASHBOARD_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const dashboardApi = createApi({
    reducerPath: "dashboard",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["dashboard"],
    endpoints: (builder) => ({
        getManagementInsights: builder.query({
            query: (params) => ({
                url: `${DASHBOARD_API}/management-insights`,
                method: "GET",
                params
            }),
            providesTags: ["dashboard"],
        }),
        getSalesAnalytics: builder.query({
            query: (params) => ({
                url: `${DASHBOARD_API}/sales-analytics`,
                method: "GET",
                params
            }),
            providesTags: ["dashboard"],
        }),
        getSalesBreakup: builder.query({
            query: (params) => ({
                url: `${DASHBOARD_API}/sales-breakup`,
                method: "GET",
                params
            }),
            providesTags: ["dashboard"],
        }),
    }),
});

export const {
    useGetManagementInsightsQuery,
    useLazyGetManagementInsightsQuery,
    useGetSalesAnalyticsQuery,
    useLazyGetSalesAnalyticsQuery,
    useGetSalesBreakupQuery,
    useLazyGetSalesBreakupQuery,
} = dashboardApi;

export default dashboardApi;
