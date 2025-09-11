import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import {  STOCK_TRANSFER_API } from "../../Api";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const StockTransferApi = createApi({
    reducerPath: "StockTransfer",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL}),
    tagTypes: ["StockTransfer"],
    endpoints: (builder) => ({
        getStockTransfer: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url: STOCK_TRANSFER_API + "/search/" + searchParams,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: STOCK_TRANSFER_API,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["StockTransfer"],
        }),
        getStockTransferItems: builder.query({
            query: ({ params, searchParams }) => {
                if (searchParams) {
                    return {
                        url:`${STOCK_TRANSFER_API}/orderItems` ,
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                        },
                        params
                    };
                }
                return {
                    url: `${STOCK_TRANSFER_API}/orderItems`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                    params
                };
            },
            providesTags: ["StockTransfer"],
        }),
        getStockTransferById: builder.query({
            query: (id) => {
                return {
                    url: `${STOCK_TRANSFER_API}/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["StockTransfer"],
        }),
        getStockTransferItemsById: builder.query({
            query: ({ id, prevProcessId, packingCategory, packingType }) => {
                return {
                    url: `${STOCK_TRANSFER_API}/getOrderItems/${id}/${prevProcessId ? prevProcessId : null}/${packingCategory ? packingCategory : null}/${packingType ? packingType : null}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["StockTransfer"],
        }),
        getStockTransferItemsByIdNew: builder.query({
            query: (id) => {
                return {
                    url: `${STOCK_TRANSFER_API}/getOrderItemsNew/${id}`,
                    method: "GET",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                    },
                };
            },
            providesTags: ["StockTransfer"],
        }),
        addStockTransfer: builder.mutation({
            query: (payload) => ({
                url: STOCK_TRANSFER_API,
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["StockTransfer"],
        }),
        updateStockTransfer: builder.mutation({
            query: (payload) => {
                const { id, body } = payload;
                return {
                    url: `${STOCK_TRANSFER_API}/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["StockTransfer"],
        }),
        deleteStockTransfer: builder.mutation({
            query: (id) => ({
                url: `${STOCK_TRANSFER_API}/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["StockTransfer"],
        }),
    }),
});

export const {
    useLazyGetStockTransferQuery,
    useGetStockTransferQuery,
    useGetStockTransferByIdQuery,
    useGetStockTransferItemsQuery,
    useGetStockTransferItemsByIdQuery,
    useGetStockTransferItemsByIdNewQuery,
    useAddStockTransferMutation,
    useUpdateStockTransferMutation,
    useDeleteStockTransferMutation,
} = StockTransferApi;

export default StockTransferApi;

