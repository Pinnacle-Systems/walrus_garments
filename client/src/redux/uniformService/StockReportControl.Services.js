import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { STOCK_REPORT_CONTROL } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const StockReportControlApi = createApi({
    reducerPath: "StockReportControl",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
    }),
    tagTypes: ["StockReportControl"],
    endpoints: (builder) => ({
        getStockReportControl: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: STOCK_REPORT_CONTROL + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: STOCK_REPORT_CONTROL,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["StockReportControl"],
        }),
        getStockReportControlById: builder.query({
            query: (id) => {
                return {
                    url: `${STOCK_REPORT_CONTROL}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["StockReportControl"],
        }),
        addStockReportControl: builder.mutation({
            query: (payload) => ({
                url: STOCK_REPORT_CONTROL,
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["StockReportControl"],
        }),
        upload: builder.mutation({
            query: (payload) => {
                const { id, body } = payload;
                return {
                    url: `${STOCK_REPORT_CONTROL}/upload/${id}`,
                    method: "PATCH",
                    body,
                };
            },
            invalidatesTags: ["StockReportControl"],
        }),
        updateStockReportControl: builder.mutation({
            query: ({ id, ...body }) => {
                return {
                    url: `${STOCK_REPORT_CONTROL}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["StockReportControl"],
        }),
        deleteStockReportControl: builder.mutation({
            query: (id) => ({
                url: `${STOCK_REPORT_CONTROL}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["StockReportControl"],
        }),
    }),
});

export const {
    useGetStockReportControlQuery,
    useGetStockReportControlByIdQuery,
    useAddStockReportControlMutation,
    useUpdateStockReportControlMutation,
    useDeleteStockReportControlMutation,
    useUploadMutation,
} = StockReportControlApi;

export default StockReportControlApi;
