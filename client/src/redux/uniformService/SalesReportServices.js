import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SALES_REPORT_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const salesReportApi = createApi({
    reducerPath: "salesReport",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["salesReport"],
    endpoints: (builder) => ({
        getSalesReport: builder.query({
            query: (params) => {
                return {
                    url: SALES_REPORT_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["salesReport"],
        }),
        getSalesmanSummaryReport: builder.query({
            query: (params) => {
                return {
                    url: `${SALES_REPORT_API}/salesman-summary`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["salesReport"],
        }),
        getOnlineSalesDeliveryReport: builder.query({
            query: (params) => {
                return {
                    url: `${SALES_REPORT_API}/online-sales-delivery`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["salesReport"],
        }),
    }),
});

export const {
    useGetSalesReportQuery,
    useLazyGetSalesReportQuery,
    useGetSalesmanSummaryReportQuery,
    useLazyGetSalesmanSummaryReportQuery,
    useGetOnlineSalesDeliveryReportQuery,
    useLazyGetOnlineSalesDeliveryReportQuery,
} = salesReportApi;

export default salesReportApi;
